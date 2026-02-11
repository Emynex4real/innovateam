import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

// --- Design System ---
const theme = {
  colors: {
    primary: [37, 99, 235],    // Royal Blue
    secondary: [79, 70, 229],  // green
    accent: [245, 158, 11],    // Amber
    success: [16, 185, 129],   // Emerald
    danger: [239, 68, 68],     // Red
    text: {
      dark: [17, 24, 39],      // Gray-900
      secondary: [75, 85, 99], // Gray-600
      light: [255, 255, 255]   // White
    },
    bg: {
      light: [249, 250, 251],  // Gray-50
      white: [255, 255, 255]
    }
  },
  fonts: {
    header: 'helvetica',
    body: 'helvetica'
  }
};

export const generateStudentReportPDF = (reportData) => {
  console.log('📄 PDF Generator: Starting generation...');

  try {
    const doc = new jsPDF();
    const { student, period, generated_at, summary, attempts } = reportData;
    
    // Helper to track Y position
    let finalY = 0; 
    
    // --- 1. HEADER SECTION ---
    const drawHeader = () => {
      // Gradient-like background
      doc.setFillColor(...theme.colors.primary);
      doc.rect(0, 0, 210, 40, 'F');
      
      // Logo / Brand Icon (Geometric abstraction)
      doc.setFillColor(255, 255, 255);
      doc.circle(20, 20, 10, 'F');
      doc.setTextColor(...theme.colors.primary);
      doc.setFontSize(14);
      doc.setFont(theme.fonts.header, 'bold');
      doc.text('IQ', 16, 22);

      // Title
      doc.setTextColor(...theme.colors.text.light);
      doc.setFontSize(22);
      doc.text('PERFORMANCE REPORT', 40, 20);
      
      // Subtitle (Date)
      doc.setFontSize(10);
      doc.setFont(theme.fonts.body, 'normal');
      doc.setTextColor(220, 220, 255);
      doc.text(`Generated: ${new Date(generated_at).toLocaleDateString()}`, 40, 28);
    };

    drawHeader();

    // --- 2. STUDENT INFO CARD ---
    const drawStudentInfo = (startY) => {
      doc.setDrawColor(230, 230, 230);
      doc.setFillColor(...theme.colors.bg.white);
      doc.roundedRect(15, startY, 180, 35, 2, 2, 'FD'); // Border and Fill

      // Name
      doc.setFontSize(14);
      doc.setTextColor(...theme.colors.text.dark);
      doc.setFont(theme.fonts.header, 'bold');
      doc.text(student.name, 20, startY + 12);

      // Grid of Details
      doc.setFontSize(9);
      doc.setTextColor(...theme.colors.text.secondary);
      doc.setFont(theme.fonts.body, 'normal');

      // Email
      doc.text('EMAIL ADDRESS', 20, startY + 22);
      doc.setTextColor(...theme.colors.text.dark);
      doc.text(student.email, 20, startY + 28);

      // Period
      doc.setTextColor(...theme.colors.text.secondary);
      doc.text('REPORT PERIOD', 100, startY + 22);
      doc.setTextColor(...theme.colors.text.dark);
      doc.text(period.toUpperCase(), 100, startY + 28);
      
      // ID or Extra Field
      doc.setTextColor(...theme.colors.text.secondary);
      doc.text('STUDENT ID', 160, startY + 22);
      doc.setTextColor(...theme.colors.text.dark);
      doc.text(student.id ? String(student.id) : 'N/A', 160, startY + 28);

      return startY + 45; // Return new Y position
    };

    let currentY = drawStudentInfo(50);

    // --- 3. METRICS DASHBOARD (Cards) ---
    const drawMetrics = (startY) => {
      doc.setFontSize(12);
      doc.setTextColor(...theme.colors.text.dark);
      doc.setFont(theme.fonts.header, 'bold');
      doc.text('KEY METRICS', 15, startY);
      
      const metricsY = startY + 5;
      const cardWidth = 42;
      const gap = 4;
      
      const metricItems = [
        { label: 'Tests Taken', value: summary.tests_taken, color: theme.colors.primary },
        { label: 'Avg Score', value: `${summary.average_score}%`, color: theme.colors.secondary },
        { label: 'Highest', value: `${summary.highest_score}%`, color: theme.colors.success },
        { label: 'Lowest', value: `${summary.lowest_score}%`, color: theme.colors.danger }
      ];

      metricItems.forEach((m, i) => {
        const xPos = 15 + (i * (cardWidth + gap));
        
        // Card Bg
        doc.setFillColor(...theme.colors.bg.light);
        doc.setDrawColor(240, 240, 240);
        doc.roundedRect(xPos, metricsY, cardWidth, 25, 2, 2, 'FD');

        // Color Accent Bar
        doc.setFillColor(...m.color);
        doc.rect(xPos + 2, metricsY + 4, 1, 17, 'F');

        // Value
        doc.setFontSize(14);
        doc.setTextColor(...theme.colors.text.dark);
        doc.setFont(theme.fonts.header, 'bold');
        doc.text(String(m.value), xPos + 8, metricsY + 12);

        // Label
        doc.setFontSize(8);
        doc.setTextColor(...theme.colors.text.secondary);
        doc.setFont(theme.fonts.body, 'normal');
        doc.text(m.label, xPos + 8, metricsY + 19);
      });

      return metricsY + 35;
    };

    currentY = drawMetrics(currentY);

    // --- 4. GRADE BANNER & VISUAL BAR ---
    const drawGradeSection = (startY) => {
      const avg = summary.average_score;
      let grade = avg >= 80 ? 'A' : avg >= 70 ? 'B' : avg >= 60 ? 'C' : avg >= 50 ? 'D' : 'F';
      let color = avg >= 70 ? theme.colors.success : avg >= 50 ? theme.colors.accent : theme.colors.danger;
      let remark = avg >= 80 ? 'Excellent Performance' : avg >= 50 ? 'Average Performance' : 'Needs Improvement';

      // Background
      doc.setFillColor(255, 255, 255);
      doc.setDrawColor(...color);
      doc.setLineWidth(0.5);
      doc.roundedRect(15, startY, 180, 30, 3, 3, 'S'); // Stroke only

      // Grade Circle
      doc.setFillColor(...color);
      doc.circle(30, startY + 15, 10, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(16);
      doc.setFont(theme.fonts.header, 'bold');
      doc.text(grade, 30, startY + 17, { align: 'center' });

      // Text Details
      doc.setTextColor(...theme.colors.text.dark);
      doc.setFontSize(12);
      doc.text(remark, 45, startY + 12);
      
      // Progress Bar Background
      doc.setFillColor(229, 231, 235); // Light Gray
      doc.roundedRect(45, startY + 18, 130, 4, 2, 2, 'F');
      
      // Progress Bar Fill
      doc.setFillColor(...color);
      const fillWidth = (avg / 100) * 130;
      doc.roundedRect(45, startY + 18, fillWidth, 4, 2, 2, 'F');
      
      // Percentage Text at end of bar
      doc.setFontSize(8);
      doc.setTextColor(...theme.colors.text.secondary);
      doc.text(`${avg}%`, 180, startY + 16, { align: 'right' });

      return startY + 40;
    };

    currentY = drawGradeSection(currentY);

    // --- 5. DATA TABLE (Using autoTable) ---
    doc.setFontSize(12);
    doc.setTextColor(...theme.colors.text.dark);
    doc.setFont(theme.fonts.header, 'bold');
    doc.text('DETAILED TEST HISTORY', 15, currentY);
    
    // Prepare Table Data
    const tableBody = attempts.map((attempt, index) => {
      const correct = attempt.answers?.filter(a => a.is_correct).length || 0;
      const total = attempt.total_questions || attempt.answers?.length || 0;
      const percentage = total > 0 ? Math.round((correct / total) * 100) : 0;
      const isPassed = percentage >= 50;

      return [
        index + 1,
        new Date(attempt.completed_at).toLocaleDateString(),
        `${percentage}%`,
        `${correct} / ${total}`,
        `${attempt.time_taken || 0}s`,
        isPassed ? 'PASS' : 'FAIL'
      ];
    });

    autoTable(doc, {
      startY: currentY + 5,
      head: [['#', 'Date', 'Score', 'Questions', 'Time', 'Status']],
      body: tableBody,
      theme: 'grid',
      styles: {
        font: 'helvetica',
        fontSize: 9,
        cellPadding: 3,
      },
      headStyles: {
        fillColor: theme.colors.primary,
        textColor: 255,
        fontStyle: 'bold',
      },
      columnStyles: {
        0: { cellWidth: 15 },
        5: { fontStyle: 'bold' }
      },
      // Custom styling for Pass/Fail column
      didParseCell: (data) => {
        if (data.section === 'body' && data.column.index === 5) {
            const text = data.cell.raw;
            data.cell.styles.textColor = text === 'PASS' ? theme.colors.success : theme.colors.danger;
        }
      },
      // Ensure footer prints on all pages if table splits
      didDrawPage: (data) => {
          finalY = data.cursor.y;
      }
    });

    // --- 6. FOOTER ---
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(...theme.colors.text.secondary);
      doc.text(
        `Confidential Report | © ${new Date().getFullYear()} InnovaTeam | Page ${i} of ${pageCount}`,
        105,
        287,
        { align: 'center' }
      );
    }

    // --- SAVE ---
    const fileName = `${student.name.replace(/\s+/g, '_')}_Report_${period}.pdf`;
    doc.save(fileName);
    console.log('✅ PDF saved:', fileName);

  } catch (error) {
    console.error('❌ PDF Error:', error);
    throw new Error(`Failed to generate PDF: ${error.message}`);
  }
};


// --- CLASS TEST REPORT (All Students) ---
export const generateClassTestReportPDF = (testData) => {
  // console.log('📄 Generating Class Test Report...');
  // console.log('Test data received:', testData);

  try {
    const doc = new jsPDF();
    const { test_name, test_date, students, summary, passing_score = 50 } = testData;
    
    // --- HEADER ---
    doc.setFillColor(...theme.colors.primary);
    doc.rect(0, 0, 210, 45, 'F');
    
    doc.setFillColor(255, 255, 255);
    doc.circle(20, 22, 10, 'F');
    doc.setTextColor(...theme.colors.primary);
    doc.setFontSize(14);
    doc.setFont(theme.fonts.header, 'bold');
    doc.text('IQ', 16, 24);

    doc.setTextColor(...theme.colors.text.light);
    doc.setFontSize(20);
    doc.text('CLASS TEST REPORT', 40, 20);
    
    doc.setFontSize(12);
    doc.text(test_name, 40, 28);
    
    doc.setFontSize(9);
    doc.setTextColor(220, 220, 255);
    doc.text(`Test Date: ${new Date(test_date).toLocaleDateString()} | Generated: ${new Date().toLocaleDateString()}`, 40, 35);

    // --- SUMMARY STATS ---
    let yPos = 55;
    doc.setFontSize(12);
    doc.setTextColor(...theme.colors.text.dark);
    doc.setFont(theme.fonts.header, 'bold');
    doc.text('CLASS STATISTICS', 15, yPos);
    
    yPos += 5;
    const statsY = yPos;
    const cardWidth = 35;
    const gap = 3;
    
    const stats = [
      { label: 'Total Students', value: summary.total_students, color: theme.colors.primary },
      { label: 'Passed', value: summary.passed, color: theme.colors.success },
      { label: 'Failed', value: summary.failed, color: theme.colors.danger },
      { label: 'Class Avg', value: `${summary.class_average}%`, color: theme.colors.secondary },
      { label: 'Highest', value: `${summary.highest_score}%`, color: theme.colors.success },
      { label: 'Lowest', value: `${summary.lowest_score}%`, color: theme.colors.danger }
    ];

    stats.forEach((stat, i) => {
      const xPos = 15 + (i * (cardWidth + gap));
      
      doc.setFillColor(...theme.colors.bg.light);
      doc.setDrawColor(240, 240, 240);
      doc.roundedRect(xPos, statsY, cardWidth, 20, 2, 2, 'FD');
      
      doc.setFillColor(...stat.color);
      doc.rect(xPos + 2, statsY + 3, 1, 14, 'F');
      
      doc.setFontSize(12);
      doc.setTextColor(...theme.colors.text.dark);
      doc.setFont(theme.fonts.header, 'bold');
      doc.text(String(stat.value), xPos + 6, statsY + 10);
      
      doc.setFontSize(7);
      doc.setTextColor(...theme.colors.text.secondary);
      doc.setFont(theme.fonts.body, 'normal');
      doc.text(stat.label, xPos + 6, statsY + 16);
    });

    yPos = statsY + 30;

    // --- STUDENTS TABLE ---
    doc.setFontSize(12);
    doc.setTextColor(...theme.colors.text.dark);
    doc.setFont(theme.fonts.header, 'bold');
    doc.text('STUDENT RESULTS', 15, yPos);
    
    const tableBody = students.map((student, index) => {
      const percentage = student.score;
      const isPassed = percentage >= passing_score;
      const rank = index + 1;
      
      // console.log(`Student ${student.name}: score=${percentage}, passing=${passing_score}, isPassed=${isPassed}`);
      
      return [
        rank,
        student.name,
        student.email,
        `${student.correct}/${student.total}`,
        `${percentage}%`,
        `${student.time_taken}s`,
        isPassed ? 'PASS' : 'FAIL'
      ];
    });

    autoTable(doc, {
      startY: yPos + 5,
      head: [['Rank', 'Student Name', 'Email', 'Correct', 'Score', 'Time', 'Status']],
      body: tableBody,
      theme: 'grid',
      styles: {
        font: 'helvetica',
        fontSize: 8,
        cellPadding: 2,
      },
      headStyles: {
        fillColor: theme.colors.primary,
        textColor: 255,
        fontStyle: 'bold',
        halign: 'center'
      },
      columnStyles: {
        0: { cellWidth: 10, halign: 'center' },
        1: { cellWidth: 38 },
        2: { cellWidth: 48 },
        3: { cellWidth: 16, halign: 'center' },
        4: { cellWidth: 16, halign: 'center', fontStyle: 'bold' },
        5: { cellWidth: 16, halign: 'center' },
        6: { cellWidth: 16, halign: 'center', fontStyle: 'bold' }
      },
      didParseCell: (data) => {
        if (data.section === 'body') {
          // Rank column - highlight top 3
          if (data.column.index === 0) {
            const rank = data.cell.raw;
            if (rank === 1) data.cell.styles.fillColor = [255, 215, 0]; // Gold
            else if (rank === 2) data.cell.styles.fillColor = [192, 192, 192]; // Silver
            else if (rank === 3) data.cell.styles.fillColor = [205, 127, 50]; // Bronze
          }
          
          // Status column
          if (data.column.index === 6) {
            const text = data.cell.raw;
            data.cell.styles.textColor = text === 'PASS' ? theme.colors.success : theme.colors.danger;
          }
        }
      }
    });

    // --- FOOTER ---
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(...theme.colors.text.secondary);
      doc.text(
        `Class Report | © ${new Date().getFullYear()} InnovaTeam | Page ${i} of ${pageCount}`,
        105,
        287,
        { align: 'center' }
      );
    }

    const fileName = `${test_name.replace(/\s+/g, '_')}_Class_Report_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
    // console.log('✅ Class report saved:', fileName);

  } catch (error) {
    console.error('❌ Class Report Error:', error);
    throw new Error(`Failed to generate class report: ${error.message}`);
  }
};
