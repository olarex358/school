import { offlineDB, entityStoreMap } from '../utils/offlineDB';

class OfflineApiService {
  constructor(baseUrl = 'http://localhost:5000/api') {
    this.baseUrl = baseUrl;
    this.isOnline = navigator.onLine;
    this.syncInProgress = false;
    this.setupNetworkListeners();
  }

  setupNetworkListeners() {
    window.addEventListener('online', () => {
      console.log('🌐 Network: Online');
      this.isOnline = true;
      this.triggerSync();
    });
    
    window.addEventListener('offline', () => {
      console.log('📴 Network: Offline');
      this.isOnline = false;
    });
  }

  getAuthHeaders() {
    const token = localStorage.getItem('token') || '';
    const adminToken = localStorage.getItem('adminToken') || '';
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : (adminToken ? `Bearer ${adminToken}` : '')
    };
  }

  async get(entityName, id = null, options = {}) {
    const storeName = entityStoreMap[entityName];
    const cacheKey = id ? `${entityName}_${id}` : entityName;
    
    // Always check cache first for better UX
    if (storeName) {
      if (id) {
        const cached = await offlineDB.getById(storeName, id);
        if (cached && !options.forceRefresh) {
          console.log(`📦 Serving ${entityName} from cache (id: ${id})`);
          return cached;
        }
      } else {
        const cached = await offlineDB.getAll(storeName);
        if (cached.length > 0 && !options.forceRefresh) {
          console.log(`📦 Serving ${entityName} from cache (${cached.length} items)`);
          return cached;
        }
      }
    }

    // If offline, return cached data
    if (!this.isOnline) {
      console.log(`📴 Offline: Returning cached ${entityName}`);
      if (id) {
        const cached = await offlineDB.getById(storeName, id);
        return cached || null;
      } else {
        const cached = await offlineDB.getAll(storeName);
        return Array.isArray(cached) ? cached : [];
      }
    }

    // Try online request
    try {
      const url = id ? `${this.baseUrl}/${entityName}/${id}` : `${this.baseUrl}/${entityName}`;
      const response = await fetch(url, {
        headers: this.getAuthHeaders(),
        signal: options.signal
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Cache the data for offline use
      if (storeName && data && !data.offline) {
        if (Array.isArray(data)) {
          // For arrays, cache each item
          for (const item of data) {
            if (item.id || item._id) {
              const itemId = item.id || item._id;
              await offlineDB.put(storeName, { ...item, id: itemId });
            }
          }
        } else if (data.id || data._id) {
          // For single items
          const itemId = data.id || data._id;
          await offlineDB.put(storeName, { ...data, id: itemId });
        }
      }
      
      return data;
    } catch (error) {
      console.log(`🌐 Network error for ${entityName}, falling back to cache:`, error.message);
      
      // Fallback to cached data
      if (storeName) {
        if (id) {
          const cached = await offlineDB.getById(storeName, id);
          return cached || null;
        } else {
          const cached = await offlineDB.getAll(storeName);
          return Array.isArray(cached) ? cached : [];
        }
      }
      
      return id ? null : [];
    }
  }

  async post(entityName, data) {
    const storeName = entityStoreMap[entityName];
    
    // Generate a temporary local ID
    const localId = 'local_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    const timestamp = new Date().toISOString();
    
    const itemWithLocalId = {
      ...data,
      id: localId,
      _id: localId, // For compatibility with MongoDB
      _localId: localId,
      _synced: false,
      _createdAt: timestamp,
      _updatedAt: timestamp,
      _version: 1
    };

    // Save locally first for immediate UI update
    if (storeName) {
      try {
        await offlineDB.put(storeName, itemWithLocalId);
        console.log(`💾 Saved ${entityName} locally:`, itemWithLocalId);
      } catch (error) {
        console.error('Error saving locally:', error);
      }
    }

    // If offline, queue for sync
    if (!this.isOnline) {
      console.log(`📴 Offline: Queueing POST to ${entityName}`);
      await offlineDB.addToSyncQueue({
        type: 'POST',
        entityName,
        data: itemWithLocalId,
        localId,
        timestamp
      });
      
      return {
        ...itemWithLocalId,
        _queued: true,
        _status: 'queued',
        message: 'Saved locally. Will sync when online.'
      };
    }

    // Try to send online
    try {
      const response = await fetch(`${this.baseUrl}/${entityName}`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const serverResponse = await response.json();
      
      // Update local storage with real server ID
      if (storeName && serverResponse.id) {
        // Remove local version
        await offlineDB.delete(storeName, localId);
        // Save server version
        await offlineDB.put(storeName, {
          ...serverResponse,
          _synced: true,
          _localId: undefined
        });
      }
      
      return serverResponse;
    } catch (error) {
      console.log(`🌐 Network error, queueing POST: ${error.message}`);
      
      // Queue for later sync
      await offlineDB.addToSyncQueue({
        type: 'POST',
        entityName,
        data: itemWithLocalId,
        localId,
        timestamp
      });
      
      return {
        ...itemWithLocalId,
        _queued: true,
        _status: 'queued',
        message: 'Network error. Will retry when online.'
      };
    }
  }

  async put(entityName, id, data) {
    const storeName = entityStoreMap[entityName];
    const timestamp = new Date().toISOString();
    
    // Get current item to preserve local changes
    const currentItem = await offlineDB.getById(storeName, id);
    
    const updateData = {
      ...data,
      id: id,
      _id: id, // For MongoDB compatibility
      _pendingUpdate: true,
      _updatedAt: timestamp,
      _version: (currentItem?._version || 0) + 1
    };

    // Update locally first
    if (storeName) {
      await offlineDB.put(storeName, updateData);
      console.log(`💾 Updated ${entityName} locally:`, updateData);
    }

    // If offline, queue for sync
    if (!this.isOnline) {
      console.log(`📴 Offline: Queueing PUT to ${entityName}/${id}`);
      await offlineDB.addToSyncQueue({
        type: 'PUT',
        entityName,
        id,
        data: updateData,
        timestamp
      });
      
      return {
        ...updateData,
        _queued: true,
        _status: 'queued',
        message: 'Update saved locally. Will sync when online.'
      };
    }

    // Try to send online
    try {
      const response = await fetch(`${this.baseUrl}/${entityName}/${id}`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const serverResponse = await response.json();
      
      // Update local storage
      if (storeName) {
        await offlineDB.put(storeName, {
          ...serverResponse,
          _pendingUpdate: false,
          _synced: true
        });
      }
      
      return serverResponse;
    } catch (error) {
      console.log(`🌐 Network error, queueing PUT: ${error.message}`);
      
      // Queue for later sync
      await offlineDB.addToSyncQueue({
        type: 'PUT',
        entityName,
        id,
        data: updateData,
        timestamp
      });
      
      return {
        ...updateData,
        _queued: true,
        _status: 'queued',
        message: 'Network error. Update will retry when online.'
      };
    }
  }

  async delete(entityName, id) {
    const storeName = entityStoreMap[entityName];
    
    // Get item before deletion for queue
    const item = await offlineDB.getById(storeName, id);
    
    if (!item) {
      throw new Error('Item not found in local storage');
    }

    // Mark as deleted locally
    const deletedItem = {
      ...item,
      _deleted: true,
      _deletedAt: new Date().toISOString()
    };
    
    if (storeName) {
      await offlineDB.put(storeName, deletedItem);
      console.log(`🗑️ Marked ${entityName}/${id} as deleted locally`);
    }

    // If offline, queue for sync
    if (!this.isOnline) {
      console.log(`📴 Offline: Queueing DELETE for ${entityName}/${id}`);
      await offlineDB.addToSyncQueue({
        type: 'DELETE',
        entityName,
        id,
        data: deletedItem,
        timestamp: new Date().toISOString()
      });
      
      return {
        success: true,
        _queued: true,
        _status: 'queued',
        message: 'Delete queued. Will sync when online.'
      };
    }

    // Try to delete online
    try {
      const response = await fetch(`${this.baseUrl}/${entityName}/${id}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      // Remove from local storage on successful server deletion
      if (storeName) {
        await offlineDB.delete(storeName, id);
      }
      
      return { success: true };
    } catch (error) {
      console.log(`🌐 Network error, queueing DELETE: ${error.message}`);
      
      // Queue for later sync
      await offlineDB.addToSyncQueue({
        type: 'DELETE',
        entityName,
        id,
        data: deletedItem,
        timestamp: new Date().toISOString()
      });
      
      return {
        success: true,
        _queued: true,
        _status: 'queued',
        message: 'Network error. Delete will retry when online.'
      };
    }
  }

  async syncPendingOperations() {
    if (this.syncInProgress || !this.isOnline) {
      console.log('Sync already in progress or offline, skipping...');
      return;
    }

    this.syncInProgress = true;
    console.log('🔄 Starting sync of pending operations...');
    
    try {
      const queue = await offlineDB.getSyncQueue();
      
      if (queue.length === 0) {
        console.log('✅ No pending operations to sync');
        return;
      }
      
      console.log(`📋 Found ${queue.length} pending operations`);
      
      for (const operation of queue) {
        try {
          console.log(`🔄 Processing: ${operation.type} ${operation.entityName} (${operation.id})`);
          
          // Skip if too many attempts
          if (operation.attempts >= 3) {
            console.warn(`⚠️ Skipping ${operation.id} - too many failed attempts`);
            await offlineDB.updateQueueItem(operation.id, { 
              status: 'failed',
              error: 'Max attempts exceeded'
            });
            continue;
          }
          
          let result;
          const storeName = entityStoreMap[operation.entityName];
          
          switch (operation.type) {
            case 'POST':
              // Remove localId from data before sending
              const { _localId, _queued, _status, _synced, ...postData } = operation.data;
              const postResponse = await fetch(`${this.baseUrl}/${operation.entityName}`, {
                method: 'POST',
                headers: this.getAuthHeaders(),
                body: JSON.stringify(postData)
              });
              
              if (!postResponse.ok) {
                throw new Error(`HTTP ${postResponse.status}`);
              }
              
              result = await postResponse.json();
              
              // Update local storage
              if (storeName) {
                // Remove local version
                await offlineDB.delete(storeName, operation.localId);
                // Save server version
                await offlineDB.put(storeName, {
                  ...result,
                  _synced: true,
                  _localId: undefined
                });
              }
              break;
              
            case 'PUT':
              const { _pendingUpdate, _queued: putQueued, _status: putStatus, ...putData } = operation.data;
              const putResponse = await fetch(`${this.baseUrl}/${operation.entityName}/${operation.id}`, {
                method: 'PUT',
                headers: this.getAuthHeaders(),
                body: JSON.stringify(putData)
              });
              
              if (!putResponse.ok) {
                throw new Error(`HTTP ${putResponse.status}`);
              }
              
              result = await putResponse.json();
              
              // Update local storage
              if (storeName) {
                await offlineDB.put(storeName, {
                  ...result,
                  _pendingUpdate: false,
                  _synced: true
                });
              }
              break;
              
            case 'DELETE':
              const deleteResponse = await fetch(`${this.baseUrl}/${operation.entityName}/${operation.id}`, {
                method: 'DELETE',
                headers: this.getAuthHeaders()
              });
              
              if (!deleteResponse.ok) {
                throw new Error(`HTTP ${deleteResponse.status}`);
              }
              
              // Remove from local storage
              if (storeName) {
                await offlineDB.delete(storeName, operation.id);
              }
              
              result = { success: true };
              break;
          }
          
          // Remove from queue on success
          await offlineDB.removeFromQueue(operation.id);
          console.log(`✅ Successfully synced: ${operation.id}`);
          
        } catch (error) {
          console.error(`❌ Failed to sync ${operation.id}:`, error);
          
          // Update attempt count
          await offlineDB.updateQueueItem(operation.id, {
            attempts: (operation.attempts || 0) + 1,
            lastError: error.message,
            lastAttempt: new Date().toISOString()
          });
        }
      }
      
      console.log('✅ Sync completed');
      
    } catch (error) {
      console.error('❌ Sync process error:', error);
    } finally {
      this.syncInProgress = false;
    }
  }

  async triggerSync() {
    if (this.isOnline && !this.syncInProgress) {
      // Small delay to ensure network is stable
      setTimeout(() => {
        this.syncPendingOperations();
      }, 2000);
    }
  }

  // Helper to get queued items count
  async getQueuedCount() {
    const queue = await offlineDB.getSyncQueue();
    return queue.length;
  }

  // Helper to get sync status
  async getSyncStatus() {
    const queue = await offlineDB.getSyncQueue();
    const pending = queue.filter(item => item.status === 'pending');
    const failed = queue.filter(item => item.status === 'failed');
    
    return {
      total: queue.length,
      pending: pending.length,
      failed: failed.length,
      items: queue
    };
  }

  // Clear all offline data
  async clearAllData() {
    try {
      for (const storeName of Object.values(entityStoreMap)) {
        await offlineDB.clear(storeName);
      }
      await offlineDB.clear('syncQueue');
      console.log('🧹 All offline data cleared');
    } catch (error) {
      console.error('Error clearing offline data:', error);
    }
  }
}

// Create singleton instance
export const offlineApi = new OfflineApiService();

// Export for direct use
export default offlineApi;