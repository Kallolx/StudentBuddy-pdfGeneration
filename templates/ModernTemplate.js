export const generateCoverHTML = (coverDetails, coverType = 'assignment', templateType = 'modern') => {
  // Fallback values for empty fields
  const details = {
    courseTitle: coverDetails.courseTitle || '',
    courseCode: coverDetails.courseCode || '',
    assignmentNo: coverDetails.assignmentNo || '',
    experimentNo: coverDetails.experimentNo || '',
    experimentName: coverDetails.experimentName || '',
    studentName: coverDetails.studentName || '',
    studentId: coverDetails.studentId || '',
    intake: coverDetails.intake || '',
    section: coverDetails.section || '',
    program: coverDetails.program || '',
    instructorName: coverDetails.instructorName || '',
    department: coverDetails.department || '',
    submissionDate: coverDetails.submissionDate || '',
  };

  // Define color schemes for different template types
  const colorSchemes = {
    modern: {
      primary: '#4D5DFA',
      secondary: '#6366F1',
      accent: '#8B5CF6',
      light: '#EEF2FF',
      dark: '#1E293B',
      gradient: 'linear-gradient(135deg, #4D5DFA, #8B5CF6)'
    },
    classic: {
      primary: '#1F2937',
      secondary: '#374151',
      accent: '#4B5563',
      light: '#F3F4F6',
      dark: '#111827',
      gradient: 'linear-gradient(135deg, #1F2937, #4B5563)'
    },
    minimalist: {
      primary: '#047857',
      secondary: '#059669',
      accent: '#10B981',
      light: '#ECFDF5',
      dark: '#064E3B',
      gradient: 'linear-gradient(135deg, #047857, #10B981)'
    },
    academic: {
      primary: '#9D174D',
      secondary: '#BE185D',
      accent: '#DB2777',
      light: '#FDF2F8',
      dark: '#831843',
      gradient: 'linear-gradient(135deg, #9D174D, #DB2777)'
    }
  };
  
  // Use the selected color scheme or fall back to modern
  const colors = colorSchemes[templateType] || colorSchemes.modern;

  // HTML template with modern CSS styling
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Cover Page</title>
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
          overflow: hidden;
        }
        
        .header-decoration {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 25mm;
          background: ${colors.gradient};
          clip-path: polygon(0 0, 100% 0, 100% 70%, 0 100%);
          z-index: -1;
        }
        
        .footer-decoration {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 20mm;
          background: ${colors.gradient};
          clip-path: polygon(0 30%, 100% 0, 100% 100%, 0 100%);
          z-index: -1;
        }
        
        .side-decoration {
          position: absolute;
          top: 0;
          bottom: 0;
          width: 12mm;
          background: ${colors.light};
          z-index: -2;
        }
        
        .left-decoration {
          left: 0;
          border-right: 0.5mm solid ${colors.primary};
        }
        
        .right-decoration {
          right: 0;
          border-left: 0.5mm solid ${colors.primary};
        }
        
        .content-wrapper {
          position: absolute;
          top: 20mm;
          left: 20mm;
          right: 20mm;
          bottom: 20mm;
          display: flex;
          flex-direction: column;
          z-index: 1;
        }
        
        .university-logo {
          width: 25mm;
          height: 25mm;
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
        
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
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
          position: relative;
          width: 80%;
          margin-left: auto;
          margin-right: auto;
        }
        
        .motto::before,
        .motto::after {
          content: '';
          position: absolute;
          height: 0.2mm;
          width: 15mm;
          background-color: ${colors.accent};
          top: 50%;
        }
        
        .motto::before {
          left: 0;
        }
        
        .motto::after {
          right: 0;
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
          background: ${colors.gradient};
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
        
        .course-details::before {
          content: '';
          position: absolute;
          top: 0;
          right: 0;
          width: 15mm;
          height: 15mm;
          background-color: ${colors.light};
          clip-path: polygon(100% 0, 0 0, 100% 100%);
          z-index: -1;
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
        
        .box-container {
          display: flex;
          justify-content: space-between;
          margin-bottom: 15mm;
          gap: 10mm;
        }
        
        .box {
          flex: 1;
          background-color: white;
          border-radius: 2mm;
          box-shadow: 0 1mm 3mm rgba(0,0,0,0.05);
          padding: 6mm;
          position: relative;
          overflow: hidden;
        }
        
        .box::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 1mm;
          background: ${colors.gradient};
        }
        
        .box-title {
          font-family: 'Playfair Display', serif;
          font-weight: 700;
          margin-bottom: 5mm;
          font-size: 14pt;
          color: ${colors.primary};
          position: relative;
          padding-bottom: 2mm;
        }
        
        .box-title::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          width: 15mm;
          height: 0.3mm;
          background-color: ${colors.accent};
        }
        
        .box-content table {
          width: 100%;
          border-collapse: collapse;
        }
        
        .box-content td {
          padding: 1.5mm 0;
          vertical-align: top;
        }
        
        .box-content .label {
          font-weight: 500;
          width: 40%;
          color: ${colors.secondary};
        }
        
        .box-content .value {
          font-weight: 400;
          color: ${colors.dark};
        }
        
        .submission-date {
          margin-top: auto;
          font-size: 11pt;
          padding: 4mm 0;
          text-align: right;
          font-weight: 500;
          color: ${colors.secondary};
        }
        
        .signature-section {
          display: flex;
          justify-content: space-between;
          margin-top: auto;
          padding-top: 10mm;
        }
        
        .signature-line {
          width: 60mm;
          border-top: 0.5mm solid ${colors.secondary};
        }
        
        .signature-label {
          font-size: 10pt;
          margin-top: 2mm;
          text-align: center;
          color: ${colors.secondary};
        }
        
        .spacer {
          flex: 1;
        }
        
        .decorative-circle {
          position: absolute;
          border-radius: 50%;
          background: ${colors.light};
          opacity: 0.5;
          z-index: -1;
        }
        
        .circle-1 {
          width: 40mm;
          height: 40mm;
          top: -10mm;
          right: -10mm;
        }
        
        .circle-2 {
          width: 25mm;
          height: 25mm;
          bottom: 20mm;
          left: -10mm;
        }
        
        .circle-3 {
          width: 35mm;
          height: 35mm;
          bottom: -15mm;
          right: 30mm;
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
          <div class="heading">${coverType === 'lab-report' ? 'Lab Report' : 'Assignment'}</div>

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
              ${coverType === 'assignment' ? 
                `<tr>
                  <td class="label">Assignment No:</td>
                  <td class="value">${details.assignmentNo}</td>
                </tr>` :
                `<tr>
                  <td class="label">Experiment No:</td>
                  <td class="value">${details.experimentNo}</td>
                </tr>
                <tr>
                  <td class="label">Experiment Name:</td>
                  <td class="value">${details.experimentName}</td>
                </tr>`
              }
            </table>
          </div>

          <!-- Submission boxes -->
          <div class="box-container">
            <!-- Submitted By -->
            <div class="box">
              <div class="box-title">Submitted By</div>
              <div class="box-content">
                <table>
                  <tr>
                    <td class="label">Name:</td>
                    <td class="value">${details.studentName}</td>
                  </tr>
                  <tr>
                    <td class="label">ID No:</td>
                    <td class="value">${details.studentId}</td>
                  </tr>
                  <tr>
                    <td class="label">Intake:</td>
                    <td class="value">${details.intake}</td>
                  </tr>
                  <tr>
                    <td class="label">Section:</td>
                    <td class="value">${details.section}</td>
                  </tr>
                  <tr>
                    <td class="label">Program:</td>
                    <td class="value">${details.program}</td>
                  </tr>
                </table>
              </div>
            </div>

            <!-- Submitted To -->
            <div class="box">
              <div class="box-title">Submitted To</div>
              <div class="box-content">
                <table>
                  <tr>
                    <td class="label">Name:</td>
                    <td class="value">${details.instructorName}</td>
                  </tr>
                  <tr>
                    <td class="label">Department:</td>
                    <td class="value">${details.department}</td>
                  </tr>
                  <tr>
                    <td colspan="2" style="padding-top: 5mm;">
                      <div style="font-weight: 500; color: ${colors.secondary};">Bangladesh University of<br>Business & Technology</div>
                    </td>
                  </tr>
                </table>
              </div>
            </div>
          </div>

          <!-- Flexible spacer -->
          <div class="spacer"></div>

          <!-- Submission date -->
          <div class="submission-date">
            Date of Submission: <span style="color: ${colors.dark}; font-weight: 600;">${details.submissionDate}</span>
          </div>

          <!-- Signature section -->
          <div class="signature-section">
            <div>
              <div class="signature-line"></div>
              <div class="signature-label">Student Signature</div>
            </div>
            <div>
              <div class="signature-line"></div>
              <div class="signature-label">Teacher Signature</div>
            </div>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
};

export default generateCoverHTML;