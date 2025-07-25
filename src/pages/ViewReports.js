// src/pages/ViewReports.js
import React, { useState, useEffect } from 'react';

function ViewReports() {
  // States to hold loaded data from localStorage
  const [students, setStudents] = useState([]);
  const [results, setResults] = useState([]);
  const [subjects, setSubjects] = useState([]);

  // States for report selection
  const [reportClassSelect, setReportClassSelect] = useState('');
  const [reportStudentSelect, setReportStudentSelect] = useState(''); // Will store admissionNo
  const [generatedReport, setGeneratedReport] = useState(null); // Stores the report content to display

  // useEffect to load necessary data from localStorage on initial mount
  useEffect(() => {
    const storedStudents = localStorage.getItem('schoolPortalStudents');
    if (storedStudents) {
      setStudents(JSON.parse(storedStudents));
    }
    const storedResults = localStorage.getItem('schoolPortalResults');
    if (storedResults) {
      setResults(JSON.parse(storedResults));
    }
    const storedSubjects = localStorage.getItem('schoolPortalSubjects');
    if (storedSubjects) {
      setSubjects(JSON.parse(storedSubjects));
    }
  }, []); // Runs only once on mount

  // Get unique classes from students for the dropdown
  const uniqueClasses = [...new Set(students.map(s => s.studentClass))].sort();

  // Get students filtered by selected class
  const studentsInSelectedClass = students.filter(
    s => reportClassSelect === '' || s.studentClass === reportClassSelect
  );

  // Helper function to get student name from ID
  const getStudentName = (admissionNo) => {
      const student = students.find(s => s.admissionNo === admissionNo);
      return student ? `${student.firstName} ${student.lastName}` : 'Unknown Student';
  };

  // Helper function to get subject name from code
  const getSubjectName = (subjectCode) => {
      const subject = subjects.find(s => s.subjectCode === subjectCode);
      return subject ? subject.subjectName : 'Unknown Subject';
  };

  const generateIndividualReport = () => {
    if (!reportStudentSelect) {
      alert('Please select a student to generate an individual report.');
      setGeneratedReport(null);
      return;
    }

    const student = students.find(s => s.admissionNo === reportStudentSelect);
    if (!student) {
      setGeneratedReport(<p style={{ color: 'red' }}>Student not found.</p>);
      return;
    }

    const studentResults = results.filter(r => r.studentNameSelect === reportStudentSelect);

    // Basic HTML structure for the report
    let reportHtml = `
      <h3>Individual Report for ${student.firstName} ${student.lastName} (${student.admissionNo})</h3>
      <p>Class: ${student.studentClass}</p>
      <h4>Results:</h4>
    `;

    if (studentResults.length > 0) {
      reportHtml += `
        <table>
          <thead>
            <tr>
              <th>Subject</th>
              <th>Term</th>
              <th>Type</th>
              <th>Score</th>
            </tr>
          </thead>
          <tbody>
      `;
      studentResults.forEach(r => {
        reportHtml += `
          <tr>
            <td>${getSubjectName(r.subjectSelect)}</td>
            <td>${r.termSelect}</td>
            <td>${r.caType}</td>
            <td>${r.score}</td>
          </tr>
        `;
      });
      reportHtml += `
          </tbody>
        </table>
      `;
    } else {
      reportHtml += `<p>No results found for this student.</p>`;
    }

    setGeneratedReport(<div dangerouslySetInnerHTML={{ __html: reportHtml }} />);
  };

  const generateClassReport = () => {
    if (!reportClassSelect) {
      alert('Please select a class to generate a class report.');
      setGeneratedReport(null);
      return;
    }

    const studentsInClass = students.filter(s => s.studentClass === reportClassSelect);
    if (studentsInClass.length === 0) {
      setGeneratedReport(<p style={{ color: 'red' }}>No students found in this class.</p>);
      return;
    }

    let reportHtml = `<h3>Class Report for ${reportClassSelect}</h3>`;

    studentsInClass.forEach(student => {
      const studentResults = results.filter(r => r.studentNameSelect === student.admissionNo);
      reportHtml += `
        <h4>${student.firstName} ${student.lastName} (${student.admissionNo})</h4>
      `;
      if (studentResults.length > 0) {
        reportHtml += `
          <table>
            <thead>
              <tr>
                <th>Subject</th>
                <th>Term</th>
                <th>Type</th>
                <th>Score</th>
              </tr>
            </thead>
            <tbody>
        `;
        studentResults.forEach(r => {
          reportHtml += `
            <tr>
              <td>${getSubjectName(r.subjectSelect)}</td>
              <td>${r.termSelect}</td>
              <td>${r.caType}</td>
              <td>${r.score}</td>
            </tr>
          `;
        });
        reportHtml += `
            </tbody>
          </table>
        `;
      } else {
        reportHtml += `<p>No results found for this student.</p>`;
      }
    });

    setGeneratedReport(<div dangerouslySetInnerHTML={{ __html: reportHtml }} />);
  };

  // Reset student selection when class selection changes
  const handleClassChange = (e) => {
    setReportClassSelect(e.target.value);
    setReportStudentSelect(''); // Clear student selection
    setGeneratedReport(null); // Clear report
  };

  // Basic Print functionality
  const handlePrint = () => {
    // This is a very basic print. For proper print, you might need
    // a print-specific CSS or library to format the report nicely.
    window.print();
  };


  return (
    <div className="content-section">
      <h1>View Student Reports</h1>
      <div className="sub-section">
        <h2>Generate Reports</h2>
        <select
          id="reportClassSelect"
          value={reportClassSelect}
          onChange={handleClassChange}
        >
          <option value="">Select Class</option>
          {uniqueClasses.map(className => (
            <option key={className} value={className}>{className}</option>
          ))}
        </select>
        <select
          id="reportStudentSelect"
          value={reportStudentSelect}
          onChange={(e) => { setReportStudentSelect(e.target.value); setGeneratedReport(null); }}
          disabled={!reportClassSelect} // Disable until a class is selected
        >
          <option value="">Select Student</option>
          {studentsInSelectedClass.map(student => (
            <option key={student.admissionNo} value={student.admissionNo}>
              {student.firstName} {student.lastName} ({student.admissionNo})
            </option>
          ))}
        </select>
        <button id="generateIndividualReportBtn" onClick={generateIndividualReport}>
          Generate Individual Report
        </button>
        <button id="generateClassReportBtn" onClick={generateClassReport}>
          Generate Class Report
        </button>
        {generatedReport && ( // Only show print button if a report is generated
            <button id="printReportBtn" onClick={handlePrint}>Print Report</button>
        )}
        <div id="reportDisplayArea">
          {generatedReport || <p>Select a class or student and click a button to generate a report.</p>}
        </div>
      </div>
    </div>
  );
}

export default ViewReports;
