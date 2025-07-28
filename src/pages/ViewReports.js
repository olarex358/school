// src/pages/ViewReports.js
import React, { useState, useEffect } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';
import { useNavigate } from 'react-router-dom';

function ViewReports() {
  const [loggedInUser, setLoggedInUser] = useState(null);
  const navigate = useNavigate();

  // States to hold loaded data from localStorage
  const [students] = useLocalStorage('schoolPortalStudents', []);
  const [results] = useLocalStorage('schoolPortalResults', []);
  const [subjects] = useLocalStorage('schoolPortalSubjects', []);

  // States for report selection
  const [reportClassSelect, setReportClassSelect] = useState('');
  const [reportStudentSelect, setReportStudentSelect] = useState(''); // Will store admissionNo
  const [generatedReport, setGeneratedReport] = useState(null); // Stores the report content to display
  const [reportMessage, setReportMessage] = useState(null); // NEW: For sending simulation messages

  // Ensure user is logged in as Admin or Staff to view reports
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('loggedInUser'));
    if (user && (user.type === 'admin' || user.type === 'staff')) {
      setLoggedInUser(user);
    } else {
      navigate('/login'); // Redirect if not admin or staff
    }
  }, [navigate]);

  // Get unique classes from students for the dropdown
  const uniqueClasses = [''].concat([...new Set(students.map(s => s.studentClass))].sort()); // Add empty option

  // Get students filtered by selected class
  const studentsInSelectedClass = students.filter(
    s => reportClassSelect === '' || s.studentClass === reportClassSelect
  );

  // Helper function to get student name from ID
  const getStudentName = (admissionNo) => {
      const student = students.find(s => s.admissionNo === admissionNo);
      return student ? `${student.firstName} ${student.lastName}` : 'Unknown Student';
  };

  // Helper function to get student contact info (simulated/placeholder)
  const getStudentContact = (admissionNo) => {
      const student = students.find(s => s.admissionNo === admissionNo);
      // Assuming you added contactEmail and contactPhone to student details in StudentManagement.js
      // For now, let's use parentPhone if contactEmail/Phone are not explicitly stored for student
      return {
          email: student?.contactEmail || 'student@example.com', // Placeholder email
          whatsapp: student?.contactPhone || '1234567890' // Placeholder phone
      };
  };

  // Helper function to get subject name from code
  const getSubjectName = (subjectCode) => {
      const subject = subjects.find(s => s.subjectCode === subjectCode);
      return subject ? subject.subjectName : 'Unknown Subject';
  };

  const generateIndividualReport = () => {
    setReportMessage(null); // Clear previous messages
    if (!reportStudentSelect) {
      setReportMessage({ type: 'error', text: 'Please select a student to generate an individual report.' });
      setGeneratedReport(null);
      return;
    }

    const student = students.find(s => s.admissionNo === reportStudentSelect);
    if (!student) {
      setReportMessage({ type: 'error', text: 'Student not found.' });
      setGeneratedReport(null);
      return;
    }

    const studentResults = results.filter(r => r.studentNameSelect === reportStudentSelect);

    let reportHtml = `
      <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
      <h3 style="color: #333;">Individual Report for ${student.firstName} ${student.lastName} (${student.admissionNo})</h3>
      <p><strong>Class:</strong> ${student.studentClass}</p>
      <h4 style="margin-top: 20px; color: #555;">Results:</h4>
    `;

    if (studentResults.length > 0) {
      reportHtml += `
        <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
          <thead>
            <tr>
              <th style="border: 1px solid #ddd; padding: 8px; text-align: left; background-color: #f2f2f2;">Subject</th>
              <th style="border: 1px solid #ddd; padding: 8px; text-align: left; background-color: #f2f2f2;">Term</th>
              <th style="border: 1px solid #ddd; padding: 8px; text-align: left; background-color: #f2f2f2;">Type</th>
              <th style="border: 1px solid #ddd; padding: 8px; text-align: left; background-color: #f2f2f2;">Score</th>
            </tr>
          </thead>
          <tbody>
      `;
      studentResults.forEach(r => {
        reportHtml += `
          <tr>
            <td style="border: 1px solid #ddd; padding: 8px;">${getSubjectName(r.subjectSelect)}</td>
            <td style="border: 1px solid #ddd; padding: 8px;">${r.termSelect}</td>
            <td style="border: 1px solid #ddd; padding: 8px;">${r.caType}</td>
            <td style="border: 1px solid #ddd; padding: 8px;">${r.score}</td>
          </tr>
        `;
      });
      reportHtml += `
          </tbody>
        </table>
      `;
    } else {
      reportHtml += `<p style="color: #888;">No results found for this student.</p>`;
    }
    reportHtml += `</div>`; // Close report container

    setGeneratedReport(<div dangerouslySetInnerHTML={{ __html: reportHtml }} />);
  };

  const generateClassReport = () => {
    setReportMessage(null); // Clear previous messages
    if (!reportClassSelect) {
      setReportMessage({ type: 'error', text: 'Please select a class to generate a class report.' });
      setGeneratedReport(null);
      return;
    }

    const studentsInClass = students.filter(s => s.studentClass === reportClassSelect);
    if (studentsInClass.length === 0) {
      setReportMessage({ type: 'error', text: 'No students found in this class.' });
      setGeneratedReport(null);
      return;
    }

    let reportHtml = `
      <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
      <h3 style="color: #333;">Class Report for ${reportClassSelect}</h3>
    `;

    studentsInClass.forEach(student => {
      const studentResults = results.filter(r => r.studentNameSelect === student.admissionNo);
      reportHtml += `
        <h4 style="margin-top: 25px; color: #555;">${student.firstName} ${student.lastName} (${student.admissionNo})</h4>
      `;
      if (studentResults.length > 0) {
        reportHtml += `
          <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
            <thead>
              <tr>
                <th style="border: 1px solid #ddd; padding: 8px; text-align: left; background-color: #f2f2f2;">Subject</th>
                <th style="border: 1px solid #ddd; padding: 8px; text-align: left; background-color: #f2f2f2;">Term</th>
                <th style="border: 1px solid #ddd; padding: 8px; text-align: left; background-color: #f2f2f2;">Type</th>
                <th style="border: 1px solid #ddd; padding: 8px; text-align: left; background-color: #f2f2f2;">Score</th>
              </tr>
            </thead>
            <tbody>
        `;
        studentResults.forEach(r => {
          reportHtml += `
            <tr>
              <td style="border: 1px solid #ddd; padding: 8px;">${getSubjectName(r.subjectSelect)}</td>
              <td style="border: 1px solid #ddd; padding: 8px;">${r.termSelect}</td>
              <td style="border: 1px solid #ddd; padding: 8px;">${r.caType}</td>
              <td style="border: 1px solid #ddd; padding: 8px;">${r.score}</td>
            </tr>
          `;
        });
        reportHtml += `
            </tbody>
          </table>
        `;
      } else {
        reportHtml += `<p style="color: #888;">No results found for this student.</p>`;
      }
    });
    reportHtml += `</div>`; // Close report container

    setGeneratedReport(<div dangerouslySetInnerHTML={{ __html: reportHtml }} />);
  };

  // NEW: Simulate sending report via Email
  const sendReportByEmail = () => {
      setReportMessage(null); // Clear previous messages
      if (!generatedReport || !reportStudentSelect) {
          setReportMessage({type: 'error', text: 'Please generate an individual report first to send via Email.'});
          return;
      }
      const studentContact = getStudentContact(reportStudentSelect);
      const studentName = getStudentName(reportStudentSelect);

      // ⚠️ Simulation only: In a real app, send reportHtml and recipient details to backend API
      console.log(`Simulating email send to ${studentContact.email} (${studentName})`);
      console.log("Email Subject: Your Academic Report");
      console.log("Email Body/Content:", generatedReport.props.dangerouslySetInnerHTML.__html);

      setReportMessage({type: 'success', text: `Report sent to ${studentName}'s email (${studentContact.email}) (simulated).`});
  };

  // NEW: Simulate sending report via WhatsApp
  const sendReportByWhatsApp = () => {
      setReportMessage(null); // Clear previous messages
      if (!generatedReport || !reportStudentSelect) {
          setReportMessage({type: 'error', text: 'Please generate an individual report first to send via WhatsApp.'});
          return;
      }
      const studentContact = getStudentContact(reportStudentSelect);
      const studentName = getStudentName(reportStudentSelect);

      // ⚠️ Simulation only: In a real app, send reportHtml and recipient details to backend API
      console.log(`Simulating WhatsApp send to ${studentContact.whatsapp} (${studentName})`);
      console.log("WhatsApp Message: Your Academic Report is available. Check your email or portal.");

      setReportMessage({type: 'success', text: `Report sent to ${studentName}'s WhatsApp (${studentContact.whatsapp}) (simulated).`});
  };

  // Reset selection and report
  const clearReportSelection = () => {
    setReportClassSelect('');
    setReportStudentSelect('');
    setGeneratedReport(null);
    setReportMessage(null);
  };

  const handleLogout = () => {
    localStorage.removeItem('loggedInUser');
    navigate('/login');
  };

  if (!loggedInUser) {
      return <div className="content-section">Access Denied. Please log in as Admin or Staff.</div>;
  }

  return (
    <div className="content-section">
      <h1>View Student Reports</h1>
      <div className="sub-section">
        <h2>Generate Reports</h2>
        {reportMessage && ( // NEW: Report message banner
            <div style={{ padding: '10px', marginBottom: '15px', borderRadius: '5px', color: 'white', backgroundColor: reportMessage.type === 'success' ? '#28a745' : '#dc3545' }}>
                {reportMessage.text}
            </div>
        )}
        <select
          id="reportClassSelect"
          value={reportClassSelect}
          onChange={(e) => { setReportClassSelect(e.target.value); setReportStudentSelect(''); setGeneratedReport(null); setReportMessage(null); }}
          style={{ width: '100%', marginBottom: '10px', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
        >
          <option value="">Select Class</option>
          {uniqueClasses.map(className => (
            <option key={className} value={className}>{className}</option>
          ))}
        </select>
        <select
          id="reportStudentSelect"
          value={reportStudentSelect}
          onChange={(e) => { setReportStudentSelect(e.target.value); setGeneratedReport(null); setReportMessage(null); }}
          disabled={!reportClassSelect} // Disable until a class is selected
          style={{ width: '100%', marginBottom: '10px', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
        >
          <option value="">Select Student</option>
          {studentsInSelectedClass.map(student => (
            <option key={student.admissionNo} value={student.admissionNo}>
              {student.firstName} {student.lastName} ({student.admissionNo})
            </option>
          ))}
        </select>
        <button
          onClick={generateIndividualReport}
          style={{ marginRight: '10px', backgroundColor: 'var(--primary-blue-dark)', borderColor: 'var(--primary-blue-dark)' }}
        >
          Generate Individual Report
        </button>
        <button
          onClick={generateClassReport}
          style={{ backgroundColor: 'var(--primary-blue-dark)', borderColor: 'var(--primary-blue-dark)' }}
        >
          Generate Class Report
        </button>
        <button onClick={clearReportSelection} style={{ marginLeft: '10px', backgroundColor: '#6c757d', borderColor: '#6c757d' }}>
            Clear Selection
        </button>

        {generatedReport && ( /* Only show send/print buttons if a report is generated */
            <div style={{ marginTop: '20px', borderTop: '1px solid #eee', paddingTop: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <button onClick={sendReportByEmail}>Send by Email</button> {/* NEW Email button */}
                <button onClick={sendReportByWhatsApp} style={{ backgroundColor: '#28a745', borderColor: '#28a745' }}>Send by WhatsApp</button> {/* NEW WhatsApp button */}
                <button onClick={() => window.print()}>Print Report</button> {/* Existing print button */}
            </div>
        )}

        <div id="reportDisplayArea" style={{ marginTop: '20px', padding: '15px', border: generatedReport ? '1px solid #ccc' : 'none', borderRadius: '8px', background: generatedReport ? 'white' : 'transparent' }}>
          {generatedReport || <p style={{color: '#888'}}>Select a class or student and click a button to generate a report.</p>}
        </div>
      </div>
    </div>
  );
}

export default ViewReports;