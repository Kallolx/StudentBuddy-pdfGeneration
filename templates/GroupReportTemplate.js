export const generateGroupReportHTML = (coverDetails) => {
  // Fallback values for empty fields
  const details = {
    courseTitle: coverDetails.courseTitle || "",
    courseCode: coverDetails.courseCode || "",
    experimentName: coverDetails.experimentName || "",
    students: coverDetails.students || [],
  };

  // Define color scheme - matching ModernTemplate
  const colors = {
    primary: "#1F2937",
    secondary: "#1F2937",
    accent: "#1F2937",
    light: "#F3F4F6",
    dark: "#1F2937",
    gradient: "linear-gradient(135deg, #1F2937, #1F2937)",
  };

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Group Lab Report</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&family=Playfair+Display:wght@400;700&display=swap');
        
        @page {
          size: A4;
          margin: 0;
        }
        
        body {
          font-family: 'Poppins', sans-serif;
          margin: 0;
          padding: 0;
          color: ${colors.dark};
          width: 210mm;
          height: 297mm;
          position: relative;
          background-color: white;
        }
        
        .page {
          width: 210mm;
          height: 297mm;
          padding: 0;
          box-sizing: border-box;
          position: relative;
        }
        
        .content-wrapper {
          position: absolute;
          top: 20mm;
          left: 20mm;
          right: 20mm;
          bottom: 20mm;
          display: flex;
          flex-direction: column;
        }
        
        .university-logo {
          width: 25mm;
          height: 15mm;
          margin: 0 auto;
          margin-bottom: 5mm;
          background-color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2mm 4mm rgba(0,0,0,0.1);
          position: relative;
        }
        
        .university-logo::before {
          content: 'BUBT';
          font-family: 'Playfair Display', serif;
          font-weight: 700;
          font-size: 12pt;
          color: ${colors.primary};
        }
        
        .university-logo::after {
          content: '';
          position: absolute;
          top: -1mm;
          left: -1mm;
          right: -1mm;
          bottom: -1mm;
          border: 0.3mm dashed ${colors.accent};
          border-radius: 50%;
          animation: spin 60s linear infinite;
        }
        
        .university-name {
          text-align: center;
          font-family: 'Playfair Display', serif;
          font-weight: 700;
          font-size: 18pt;
          line-height: 1.3;
          margin-bottom: 3mm;
          color: ${colors.primary};
        }
        
        .motto {
          text-align: center;
          font-style: italic;
          font-weight: 300;
          font-size: 10pt;
          margin-bottom: 10mm;
          color: ${colors.secondary};
        }
        
        .heading {
          text-align: center;
          font-family: 'Playfair Display', serif;
          font-weight: 700;
          font-size: 26pt;
          margin-bottom: 15mm;
          position: relative;
          color: ${colors.dark};
        }
        
        .heading::after {
          content: '';
          position: absolute;
          bottom: -5mm;
          left: 50%;
          transform: translateX(-50%);
          width: 30mm;
          height: 1mm;
          background: ${colors.primary};
          border-radius: 1mm;
        }
        
        .course-details {
          margin: 0 auto 15mm auto;
          padding: 8mm;
          background-color: white;
          border-radius: 2mm;
          width: 85%;
          box-shadow: 0 1mm 3mm rgba(0,0,0,0.05);
          position: relative;
          border-left: 1mm solid ${colors.primary};
        }
        
        .course-details table {
          width: 100%;
          border-collapse: collapse;
        }
        
        .course-details td {
          padding: 2mm 4mm;
          vertical-align: top;
        }
        
        .course-details .label {
          font-weight: 600;
          width: 40%;
          color: ${colors.secondary};
        }
        
        .course-details .value {
          font-weight: 400;
          color: ${colors.dark};
        }
        
        .students-table {
          width: 85%;
          margin: 0 auto 15mm auto;
          border-collapse: collapse;
          background-color: white;
          border-radius: 2mm;
          overflow: hidden;
          box-shadow: 0 1mm 3mm rgba(0,0,0,0.05);
        }
        
        .students-table th {
          background-color: ${colors.primary};
          color: white;
          padding: 3mm;
          text-align: left;
          font-weight: 500;
        }
        
        .students-table td {
          padding: 3mm;
          border-bottom: 0.2mm solid ${colors.light};
        }
        
        .students-table tr:last-child td {
          border-bottom: none;
        }
        
        .signature-section {
          margin-top: auto;
          width: 85%;
          margin-left: auto;
          margin-right: auto;
          display: flex;
          justify-content: space-between;
        }
        
        .signature-box {
          text-align: center;
          width: 45%;
        }
        
        .signature-line {
          width: 100%;
          height: 0.2mm;
          background-color: ${colors.dark};
          margin: 15mm 0 2mm 0;
        }
        
        .signature-title {
          color: ${colors.dark};
          font-weight: 500;
        }
      </style>
    </head>
    <body>
      <div class="page">
        <!-- Main Content Wrapper -->
        <div class="content-wrapper">
          <!-- University Logo -->
          <div class="university-logo"></div>

          <!-- University Name -->
          <div class="university-name">
            BANGLADESH UNIVERSITY OF<br>
            BUSINESS AND TECHNOLOGY
          </div>

          <!-- Motto -->
          <div class="motto">Committed to Academic Excellence</div>

          <!-- Heading -->
          <div class="heading">Group Report</div>

          <!-- Course details -->
          <div class="course-details">
            <table>
              <tr>
                <td class="label">Course Title:</td>
                <td class="value">${details.courseTitle}</td>
              </tr>
              <tr>
                <td class="label">Course Code:</td>
                <td class="value">${details.courseCode}</td>
              </tr>
              <tr>
                <td class="label">Project Name:</td>
                <td class="value">${details.experimentName}</td>
              </tr>
            </table>
          </div>

          <!-- Team Members Title -->
          <div style="text-align: center; margin-bottom: 8mm;">
            <h2 style="font-family: 'Playfair Display', serif; font-size: 18pt; color: ${colors.primary}; margin: 0;">Team Members</h2>
          </div>

          <!-- Students Table -->
          <table class="students-table">
            <thead>
              <tr>
                <th>Student Name</th>
                <th>Student ID</th>
              </tr>
            </thead>
            <tbody>
              ${details.students
                .map(
                  (student) => `
                <tr>
                  <td>${student.name}</td>
                  <td>${student.id}</td>
                </tr>
              `
                )
                .join("")}
            </tbody>
          </table>

          <!-- Signature Section -->
          <div class="signature-section">
            <div class="signature-box">
              <div class="signature-line"></div>
              <div class="signature-title">Course Instructor</div>
            </div>
            <div class="signature-box">
              <div class="signature-line"></div>
              <div class="signature-title">Head of Department</div>
            </div>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
};

export default generateGroupReportHTML;
