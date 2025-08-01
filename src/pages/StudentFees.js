
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useLocalStorage from '../hooks/useLocalStorage';
import feesIcon from '../icon/fees.png';

function StudentFees() {
  const navigate = useNavigate();
  const [loggedInStudent, setLoggedInStudent] = useState(null);

  // Data from localStorage
  const [allFeeRecords] = useLocalStorage('schoolPortalFeeRecords', []);

  // State for calculated stats
  const [studentFeeRecords, setStudentFeeRecords] = useState([]);
  const [totalDue, setTotalDue] = useState(0);
  const [totalPaid, setTotalPaid] = useState(0);
  const [outstandingBalance, setOutstandingBalance] = useState(0);

  // Effect to check if user is a student
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('loggedInUser'));
    if (user && user.type === 'student') {
      setLoggedInStudent(user);
    } else {
      navigate('/login');
    }
  }, [navigate]);

  // Effect to filter and calculate fees when data changes
  useEffect(() => {
    if (loggedInStudent && allFeeRecords.length > 0) {
      // Filter records for this student, including general fees
      const studentRecords = allFeeRecords.filter(rec =>
        rec.isGeneralFee || rec.studentId === loggedInStudent.admissionNo
      );
      setStudentFeeRecords(studentRecords);

      // Calculate totals
      const totalDueAmount = studentRecords.reduce((sum, rec) => sum + rec.amount, 0);
      setTotalDue(totalDueAmount);

      const paidRecords = studentRecords.filter(rec => rec.status === 'Paid');
      const totalPaidAmount = paidRecords.reduce((sum, rec) => sum + rec.amount, 0);
      setTotalPaid(totalPaidAmount);

      // Calculate outstanding balance
      setOutstandingBalance(totalDueAmount - totalPaidAmount);
    } else {
      setStudentFeeRecords([]);
      setTotalDue(0);
      setTotalPaid(0);
      setOutstandingBalance(0);
    }
  }, [loggedInStudent, allFeeRecords]);

  const handleLogout = () => {
    localStorage.removeItem('loggedInUser');
    navigate('/home');
  };

  const handlePrintInvoice = () => {
    if (outstandingBalance <= 0) {
      alert('No outstanding balance. An invoice cannot be generated.');
      return;
    }
    // Simulate printing logic
    const invoiceContent = `
      --- INVOICE ---
      Student: ${loggedInStudent.firstName} ${loggedInStudent.lastName}
      Admission No: ${loggedInStudent.admissionNo}
      Total Due: ₦${totalDue.toLocaleString()}
      Total Paid: ₦${totalPaid.toLocaleString()}
      Outstanding Balance: ₦${outstandingBalance.toLocaleString()}
      
      Details:
      ${studentFeeRecords.map(rec => `
        - Fee Type: ${rec.feeType}
        - Amount: ₦${rec.amount.toLocaleString()}
        - Due Date: ${rec.dueDate}
        - Status: ${rec.status}
      `).join('')}

      ---
      Please contact the bursary for payment.
    `;
    console.log("Simulating invoice print:", invoiceContent);
    alert('Invoice generated and sent to a virtual printer.');
  };

  if (!loggedInStudent) {
    return <div className="content-section">Loading fee details...</div>;
  }

  const statusColor = outstandingBalance > 0 ? 'red' : 'green';
  const statusText = outstandingBalance > 0 ? 'Outstanding' : 'Paid in Full';
  const totalPaidColor = totalPaid > 0 ? 'green' : 'gray';

  return (
    <div className="content-section">
      <h1>My Fees & Payment History</h1>
      <p>Welcome, {loggedInStudent.firstName} {loggedInStudent.lastName}! Here is an overview of your school fees:</p>
      
      <div className="sub-section" style={{ display: 'flex', justifyContent: 'space-around', marginBottom: '20px' }}>
        <div>
            <h3>Total Due:</h3>
            <p style={{fontSize: '1.5em', fontWeight: 'bold'}}>₦{totalDue.toLocaleString()}</p>
        </div>
        <div>
            <h3>Total Paid:</h3>
            <p style={{fontSize: '1.5em', fontWeight: 'bold', color: totalPaidColor}}>₦{totalPaid.toLocaleString()}</p>
        </div>
        <div>
            <h3>Outstanding Balance:</h3>
            <p style={{fontSize: '1.5em', fontWeight: 'bold', color: statusColor}}>₦{outstandingBalance.toLocaleString()}</p>
        </div>
      </div>
      
      <div className="sub-section">
        <h2>Fee Records</h2>
        {studentFeeRecords.length > 0 ? (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Fee Type</th>
                  <th>Amount</th>
                  <th>Due Date</th>
                  <th>Status</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                {studentFeeRecords.map(rec => (
                  <tr key={rec.id}>
                    <td>{rec.feeType}</td>
                    <td>₦{rec.amount.toLocaleString()}</td>
                    <td>{rec.dueDate}</td>
                    <td style={{ color: rec.status === 'Paid' ? 'green' : 'red' }}>{rec.status}</td>
                    <td>{rec.notes || 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p>No fee records found for you.</p>
        )}
      </div>

      <button onClick={handlePrintInvoice} style={{ marginTop: '20px', display: 'block' }}>
        Print Outstanding Invoice
      </button>

      <button onClick={handleLogout} style={{ marginTop: '20px' }}>Logout</button>
    </div>
  );
}

export default StudentFees;