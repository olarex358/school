import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/AuthContext';

const useApi = (url) => {
    const { token } = useAuth();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Don't fetch if no token (user not logged in)
        if (!token) {
            setLoading(false);
            setError('User not authenticated');
            return;
        }

        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);
                
                const response = await fetch(url, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (response.status === 401) {
                    // Token is invalid/expired
                    throw new Error('Authentication failed. Please login again.');
                }

                if (!response.ok) {
                    throw new Error(`Failed to fetch data: ${response.status}`);
                }

                const result = await response.json();
                setData(result);
            } catch (err) {
                setError(err.message);
                setData(null);
                
                // Optional: Auto-logout on 401 errors
                if (err.message.includes('Authentication failed')) {
                    // You might want to trigger logout here
                    console.warn('Token expired, redirecting to login...');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [url, token]); // Re-fetch when URL or token changes

    return { data, loading, error };
};

export default useApi;