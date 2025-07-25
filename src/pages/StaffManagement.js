// src/pages/StaffManagement.js
import React, {useState} from 'react';
import useLocalStorage from '../hooks/useLocalStorage';

function StaffManagement() {
  // State for the list of staff members
  const [staffs, setStaffs] = useLocalStorage('schoolPortalStaff',[]);

  // State for new staff form inputs
  const [newStaff, setNewStaff] = useState({
    surname: '',
    firstname: '',
    staffId: '',
    role: ''
  });

  // State to control button text (Add/Update)
  const [submitButtonText, setSubmitButtonText] = useState('Add Staff');
  // State to keep track if we are in edit mode
  const [isEditing, setIsEditing] = useState(false);
  // State for search filter
  const [searchTerm, setSearchTerm] = useState('');

  // useEffect to load staff from localStorage on initial component mount
  useLocalStorage(() => {
    const storedStaff = localStorage.getItem('schoolPortalStaff');
    if (storedStaff) {
      setStaffs(JSON.parse(storedStaff));
    }
  }, []); // Empty dependency array means this runs only once on mount

  // useEffect to save staff to localStorage whenever the 'staffs' state changes
  useLocalStorage(() => {
    if (staffs.length > 0 || localStorage.getItem('schoolPortalStaff')) {
        localStorage.setItem('schoolPortalStaff', JSON.stringify(staffs));
    }
  }, [staffs]); // Dependency array: this effect runs whenever 'staffs' state changes

  // Handle input changes for the form
  const handleChange = (e) => {
    const { id, value } = e.target;
    setNewStaff(prevStaff => ({
      ...prevStaff,
      [id]: value
    }));
  };

  // Generate a new unique staff ID for *new* registrations
  const generateStaffId = () => {
    const currentYear = new Date().getFullYear();
    const maxCounter = staffs.length > 0
      ? Math.max(...staffs.map(s => parseInt(s.staffId.split('/').pop())))
      : 0;
    const nextCounter = maxCounter + 1;
    return `STAFF/${currentYear}/${String(nextCounter).padStart(4, '0')}`;
  };

  // Handle form submission (Add or Update)
  const handleSubmit = (e) => {
    e.preventDefault();

    // Basic validation
    if (
      !newStaff.surname ||
      !newStaff.firstname ||
      !newStaff.role
    ) {
      alert('Please fill in all required fields.');
      return;
    }

    if (isEditing) {
      // Update existing staff
      setStaffs(prevStaffs =>
        prevStaffs.map(staff =>
          staff.staffId === newStaff.staffId ? { ...newStaff } : staff
        )
      );
      alert('Staff data updated successfully!');
    } else {
      // Add new staff
      const uniqueStaffId = generateStaffId();
      const staffToAdd = { ...newStaff, staffId: uniqueStaffId }; // Use uniqueStaffId
      setStaffs(prevStaffs => [...prevStaffs, staffToAdd]);
      alert('New staff registered successfully!');
    }

    // Reset form and state after submission
    setNewStaff({
      surname: '',
      firstname: '',
      staffId: '', // Reset for next new entry
      role: ''
    });
    setSubmitButtonText('Add Staff');
    setIsEditing(false);
  };

  // Function to populate form for editing
  const editStaff = (staffIdToEdit) => {
    const staffToEdit = staffs.find(s => s.staffId === staffIdToEdit);
    if (staffToEdit) {
      setNewStaff(staffToEdit); // Populate the form state with staff data
      setSubmitButtonText('Update Staff');
      setIsEditing(true);
    }
  };

  // Function to delete staff
  const deleteStaff = (staffIdToDelete) => {
    if (window.confirm(`Are you sure you want to delete staff with ID: ${staffIdToDelete}?`)) {
      setStaffs(prevStaffs => prevStaffs.filter(staff => staff.staffId !== staffIdToDelete));
      alert('Staff deleted successfully!');
    }
  };

  // Handle search input changes
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Clear search filter and reset form if in edit mode
  const clearSearchAndForm = () => {
    setSearchTerm('');
    setNewStaff({
      surname: '',
      firstname: '',
      staffId: '',
      role: ''
    });
    setSubmitButtonText('Add Staff');
    setIsEditing(false);
  };

  // Filter staff based on search term (case-insensitive)
  const filteredStaffs = staffs.filter(staff =>
    staff.firstname.toLowerCase().includes(searchTerm.toLowerCase()) ||
    staff.surname.toLowerCase().includes(searchTerm.toLowerCase()) ||
    staff.staffId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    staff.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="content-section">
      <h2>Staff Management</h2>

      <div className="sub-section">
        <h3>{isEditing ? 'Edit Staff' : 'Register/Edit Staff'}</h3>
        <form id="teacherForm" onSubmit={handleSubmit}> {/* Renamed from staffForm to teacherForm based on provided HTML */}
          <input
            type="text"
            id="surname"
            placeholder="Surname"
            required
            value={newStaff.surname}
            onChange={handleChange}
          />
          <input
            type="text"
            id="firstname"
            placeholder="First name"
            required
            value={newStaff.firstname}
            onChange={handleChange}
          />
          <input
            type="text"
            id="staffId"
            placeholder="Staff ID (Auto-generated)"
            value={isEditing ? newStaff.staffId : generateStaffId()}
            readOnly
            disabled={!isEditing}
          />
          <input
            type="text"
            id="role"
            placeholder="Role (e.g., Teacher, Admin)"
            required
            value={newStaff.role}
            onChange={handleChange}
          />
          <button type="submit">{submitButtonText}</button>
        </form>
      </div>

      <div className="sub-section">
        <h3>All Staff</h3>
        <input
          type="text"
          id="staffSearchFilter"
          placeholder="Search by Name, ID or Role"
          value={searchTerm}
          onChange={handleSearchChange}
        />
        <button onClick={clearSearchAndForm}>Clear Filter / Reset Form</button>
        <div className="table-container">
            <table id="staffTable"> {/* Using table for staff list for consistency */}
                <thead>
                    <tr>
                        <th>Staff ID</th>
                        <th>Name</th>
                        <th>Role</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                {filteredStaffs.length > 0 ? (
                    filteredStaffs.map(staff => (
                    <tr key={staff.staffId}>
                        <td>{staff.staffId}</td>
                        <td>{staff.firstname} {staff.surname}</td>
                        <td>{staff.role}</td>
                        <td>
                        <button
                            className="action-btn edit-btn"
                            onClick={() => editStaff(staff.staffId)}>
                            Edit
                        </button>
                        <button
                            className="action-btn delete-btn"
                            onClick={() => deleteStaff(staff.staffId)}>
                            Delete
                        </button>
                        </td>
                    </tr>
                    ))
                ) : (
                    <tr>
                    <td colSpan="4">No staff found.</td>
                    </tr>
                )}
                </tbody>
            </table>
        </div>
      </div>
    </div>
  );
}

export default StaffManagement;
