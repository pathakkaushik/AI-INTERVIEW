const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

const mdPath = 'C:\\Users\\kaush\\.gemini\\antigravity\\brain\\263ccc48-aaa4-4efe-9ef3-b574a158bc98\\MASTER_PROJECT_INTERVIEW_GUIDE.md';
const outputPath = 'e:\\kaushikpathak project\\ai-interview\\AI_Interview_Master_Project_Guide.pdf';

const mdContent = fs.readFileSync(mdPath, 'utf8');

const doc = new PDFDocument({
  margins: { top: 50, bottom: 50, left: 50, right: 50 },
  bufferPages: true,
  autoFirstPage: false
});

const writeStream = fs.createWriteStream(outputPath);
doc.pipe(writeStream);

// Cover Page
doc.addPage();
doc.rect(0, 0, doc.page.width, doc.page.height).fill('#0f172a');

doc.fillColor('#38bdf8').fontSize(28).font('Helvetica-Bold')
   .text('AI MockPrep', 50, 220, { align: 'center' });

doc.fillColor('#f8fafc').fontSize(20).font('Helvetica-Bold')
   .text('Master Project Blueprint & Interview Guide', 50, 260, { align: 'center' });

doc.fillColor('#94a3b8').fontSize(12).font('Helvetica')
   .text('Complete 0 to 100 System Architecture, Codebase Walkthrough, & Q&A', 50, 300, { align: 'center' });

doc.rect(150, 340, doc.page.width - 300, 2).fill('#38bdf8');

doc.fillColor('#cbd5e1').fontSize(11).font('Helvetica')
   .text('Author: Full-Stack AI Interview Platform Developer', 50, 500, { align: 'center' });
doc.text('Tech Stack: React 19, Node.js, Express, MongoDB, Groq AI, face-api.js', 50, 520, { align: 'center' });
doc.text('Date: 2026 Edition', 50, 540, { align: 'center' });

// Process Markdown Lines
const lines = mdContent.split('\n');

doc.addPage();
let currentY = 50;

function checkNewPage(neededHeight = 30) {
  if (doc.y + neededHeight > doc.page.height - 60) {
    doc.addPage();
  }
}

let inCodeBlock = false;
let codeBuffer = [];

for (let i = 0; i < lines.length; i++) {
  let line = lines[i];

  if (line.startsWith('```')) {
    if (!inCodeBlock) {
      inCodeBlock = true;
      codeBuffer = [];
    } else {
      inCodeBlock = false;
      // Print code block
      checkNewPage(codeBuffer.length * 12 + 20);
      const codeY = doc.y;
      const blockHeight = Math.min(codeBuffer.length * 12 + 16, 400);
      doc.rect(50, codeY, doc.page.width - 100, blockHeight).fill('#1e293b');
      doc.fillColor('#f1f5f9').fontSize(8.5).font('Courier');
      let textY = codeY + 8;
      for (let cl of codeBuffer) {
        if (textY > doc.page.height - 60) {
          doc.addPage();
          doc.rect(50, 50, doc.page.width - 100, Math.min(codeBuffer.length * 12, 400)).fill('#1e293b');
          textY = 58;
          doc.fillColor('#f1f5f9').fontSize(8.5).font('Courier');
        }
        doc.text(cl, 60, textY, { width: doc.page.width - 120, lineBreak: false });
        textY += 12;
      }
      doc.y = textY + 10;
    }
    continue;
  }

  if (inCodeBlock) {
    codeBuffer.push(line);
    continue;
  }

  // Heading 1
  if (line.startsWith('# ')) {
    checkNewPage(40);
    doc.moveDown(0.5);
    doc.fillColor('#1e3a8a').fontSize(20).font('Helvetica-Bold')
       .text(line.replace('# ', '').trim());
    doc.moveDown(0.3);
    doc.rect(50, doc.y, doc.page.width - 100, 1.5).fill('#2563eb');
    doc.moveDown(0.5);
    continue;
  }

  // Heading 2
  if (line.startsWith('## ')) {
    checkNewPage(35);
    doc.moveDown(0.5);
    doc.fillColor('#0f766e').fontSize(15).font('Helvetica-Bold')
       .text(line.replace('## ', '').trim());
    doc.moveDown(0.4);
    continue;
  }

  // Heading 3
  if (line.startsWith('### ')) {
    checkNewPage(30);
    doc.moveDown(0.4);
    doc.fillColor('#4338ca').fontSize(12).font('Helvetica-Bold')
       .text(line.replace('### ', '').trim());
    doc.moveDown(0.3);
    continue;
  }

  // Heading 4
  if (line.startsWith('#### ')) {
    checkNewPage(25);
    doc.moveDown(0.3);
    doc.fillColor('#1e293b').fontSize(10.5).font('Helvetica-Bold')
       .text(line.replace('#### ', '').trim());
    doc.moveDown(0.2);
    continue;
  }

  // Bullet point
  if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
    checkNewPage(20);
    const text = line.trim().replace(/^[-*]\s+/, '');
    const cleanText = text.replace(/\*\*(.*?)\*\*/g, '$1');
    doc.fillColor('#334155').fontSize(9.5).font('Helvetica');
    doc.text('•  ' + cleanText, 60, doc.y, { width: doc.page.width - 110, align: 'left' });
    doc.moveDown(0.2);
    continue;
  }

  // Empty line
  if (!line.trim()) {
    doc.moveDown(0.3);
    continue;
  }

  // Regular paragraph
  checkNewPage(20);
  const cleanParagraph = line.replace(/\*\*(.*?)\*\*/g, '$1').replace(/\*(.*?)\*/g, '$1');
  doc.fillColor('#334155').fontSize(9.5).font('Helvetica')
     .text(cleanParagraph, 50, doc.y, { width: doc.page.width - 100, align: 'left' });
  doc.moveDown(0.2);
}

// Global Headers & Footers
const pages = doc.bufferedPageRange();
for (let i = 1; i < pages.count; i++) {
  doc.switchToPage(i);

  // Top Header
  doc.fillColor('#94a3b8').fontSize(8).font('Helvetica')
     .text('AI MockPrep — Complete 0 to 100 Master Handbook', 50, 25, { width: doc.page.width - 100, align: 'left' });
  doc.rect(50, 37, doc.page.width - 100, 0.5).fill('#e2e8f0');

  // Bottom Footer
  doc.rect(50, doc.page.height - 40, doc.page.width - 100, 0.5).fill('#e2e8f0');
  doc.fillColor('#94a3b8').fontSize(8).font('Helvetica')
     .text(`Page ${i + 1} of ${pages.count}`, 50, doc.page.height - 30, { width: doc.page.width - 100, align: 'right' });
  doc.text('Confidential — Interview Preparation Document', 50, doc.page.height - 30, { width: doc.page.width - 100, align: 'left' });
}

doc.end();

writeStream.on('finish', () => {
  console.log(`PDF successfully generated at: ${outputPath}`);
});
