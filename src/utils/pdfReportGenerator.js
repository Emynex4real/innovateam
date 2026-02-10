import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

// --- Design System ---
const theme = {
  colors: {
    primary: [37, 99, 235],    // Royal Blue
    secondary: [79, 70, 229],  // Indigo
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