const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

const outputPath = 'e:\\kaushikpathak project\\ai-interview\\AI_MockPrep_Project_Report.pdf';

const doc = new PDFDocument({
  margins: { top: 40, bottom: 40, left: 45, right: 45 },
  bufferPages: true,
  autoFirstPage: false
});

const writeStream = fs.createWriteStream(outputPath);
doc.pipe(writeStream);

// Helper function for page headers & footers
function addPageDecoration(doc, title = "AI MockPrep – Full-Stack AI Interview Platform") {
  const pages = doc.bufferedPageRange();
  for (let i = 0; i < pages.count; i++) {
    doc.switchToPage(i);
    
    // Top border line
    doc.rect(45, 25, doc.page.width - 90, 1.5).fill('#2563eb');
    
    // Footer line & text
    doc.rect(45, doc.page.height - 35, doc.page.width - 90, 0.5).fill('#cbd5e1');
    doc.fillColor('#64748b').fontSize(8).font('Helvetica')
       .text(title, 45, doc.page.height - 28, { align: 'left' });
    doc.text(`Page ${i + 1} of ${pages.count}`, 45, doc.page.height - 28, { width: doc.page.width - 90, align: 'right' });
  }
}

// ----------------------------------------------------
// PAGE 1: Executive Project Report (Matching HelpHive Format)
// ----------------------------------------------------
doc.addPage();

// Main Title
doc.fillColor('#0f172a').fontSize(22).font('Helvetica-Bold')
   .text('AI MockPrep – Full-Stack AI Interview & Career Assessment Platform', 45, 45, { align: 'center' });
doc.moveDown(0.8);

// Section 1: Project Overview
doc.fillColor('#1e293b').fontSize(13).font('Helvetica-Bold').text('Project Overview');
doc.moveDown(0.2);
doc.fillColor('#334155').fontSize(9.5).font('Helvetica').lineGap(2)
   .text('AI MockPrep is an autonomous, full-stack AI interview and evaluation platform designed to help software engineering candidates practice real-time technical and behavioral interviews. The platform combines dynamic LLM question generation, Indian English neural voice interaction, client-side computer vision focus tracking, and automated score diagnostics to simulate real senior-level hiring panels.');
doc.moveDown(0.6);

// Section 2: Objectives
doc.fillColor('#1e293b').fontSize(13).font('Helvetica-Bold').text('Objectives');
doc.moveDown(0.2);
doc.fillColor('#334155').fontSize(9.5).font('Helvetica').lineGap(2)
   .text('• Provide an accessible, scalable platform for mock interview practice without human interviewer costs.')
   .text('• Enable non-intrusive focus and eye-contact analysis using client-side computer vision without sending video streams to cloud servers.')
   .text('• Deliver instant (<1.5s) adaptive AI evaluations, keyword detection, missing concepts, and personalized action plans.')
   .text('• Bridge candidate preparation with recruiter insights and localized market salary benchmarking.');
doc.moveDown(0.6);

// Section 3: Key Features for Candidates
doc.fillColor('#1e293b').fontSize(13).font('Helvetica-Bold').text('Key Features for Candidates');
doc.moveDown(0.2);
doc.fillColor('#334155').fontSize(9.5).font('Helvetica').lineGap(2)
   .text('Adaptive role-specific questions (8 technical domains, 4 interviewer personalities, 3 difficulty tiers), plain text/PDF/DOCX resume uploading for custom questions, Indian English neural voice TTS, Web Speech voice-to-text with typing fallback, cognitive load meter, performance timeline SVG chart, speech pace WPM gauge, skill radar breakdown, dynamic salary worth estimator, and downloadable PDF reports.');
doc.moveDown(0.6);

// Section 4: Key Features for Recruiters & Admins
doc.fillColor('#1e293b').fontSize(13).font('Helvetica-Bold').text('Key Features for Recruiters & Admins');
doc.moveDown(0.2);
doc.fillColor('#334155').fontSize(9.5).font('Helvetica').lineGap(2)
   .text('Candidate hiring recommendations ("HIRE SUGGESTED"), technical/communication skill breakdowns, AI insight bullet points, candidate readiness rankings leaderboard, system-wide admin control panel, paginated user management, and role toggling (user/admin).');
doc.moveDown(0.6);

// Section 5: Technology Stack
doc.fillColor('#1e293b').fontSize(13).font('Helvetica-Bold').text('Technology Stack');
doc.moveDown(0.2);
doc.fillColor('#334155').fontSize(9.5).font('Helvetica').lineGap(2)
   .text('Frontend: React 19, Vite 8, Vanilla CSS (Glassmorphism), Framer Motion, Recharts, Lucide React, face-api.js, html2canvas, jsPDF.')
   .text('Backend: Node.js, Express 5, MongoDB, Mongoose ORM, Multer, pdf-parse, Mammoth, express-rate-limit, express-validator, bcryptjs, JWT, Nodemailer.')
   .text('AI & Vision APIs: Groq Cloud API (Llama 3.3 70B), Google Gemini API (gemini-pro), Web Speech API (TTS & STT), face-api.js (Eye Aspect Ratio algorithm).');
doc.moveDown(0.6);

// Section 6: Advanced Features
doc.fillColor('#1e293b').fontSize(13).font('Helvetica-Bold').text('Advanced Features');
doc.moveDown(0.2);
doc.fillColor('#334155').fontSize(9.5).font('Helvetica').lineGap(2)
   .text('Dual LLM resilient fallback pipeline (Groq -> Gemini -> Rule-based local heuristics), real-time client-side EAR focus tracking, multi-format resume parsing, cross-browser speech recognition typing fallback, chart image embedding in PDF, rate limiting, and top-level React Error Boundary protection.');
doc.moveDown(0.6);

// Section 7: Modules
doc.fillColor('#1e293b').fontSize(13).font('Helvetica-Bold').text('Modules');
doc.moveDown(0.2);
doc.fillColor('#334155').fontSize(9.5).font('Helvetica').lineGap(2)
   .text('1. Authentication & Security Module  2. Resume Parsing & Interview Setup Module  3. AI Adaptive Question Engine  4. Voice Synthesis & Speech Recognition Module  5. Computer Vision & Focus Tracking Module  6. Diagnostic Scoring & PDF Export Module  7. Candidate Leaderboard & Admin Control Module');
doc.moveDown(0.6);

// Section 8: Expected Outcome
doc.fillColor('#1e293b').fontSize(13).font('Helvetica-Bold').text('Expected Outcome');
doc.moveDown(0.2);
doc.fillColor('#334155').fontSize(9.5).font('Helvetica').lineGap(2)
   .text('The platform delivers an end-to-end scalable solution for candidates to improve their interview performance by 40%+, offering structured objective analytics, salary market insights, and real-time interview practice without human dependency.');


// ----------------------------------------------------
// PAGE 2: Detailed 0-to-100 Execution & Package Breakdown (Extra Requirement)
// ----------------------------------------------------
doc.addPage();

doc.fillColor('#0f172a').fontSize(18).font('Helvetica-Bold')
   .text('Detailed 0 to 100 Rebuild & Dependency Guide (Step-by-Step)', 45, 45, { align: 'center' });
doc.moveDown(0.8);

doc.fillColor('#1e293b').fontSize(12).font('Helvetica-Bold').text('1. Initial Setup Commands (NPM & Folder Structure)');
doc.moveDown(0.2);
doc.fillColor('#334155').fontSize(9).font('Helvetica').lineGap(2)
   .text('mkdir ai-interview && cd ai-interview (Root Project Folder)')
   .text('mkdir server && cd server && npm init -y (Backend initialization)')
   .text('npm install express mongoose dotenv cors jsonwebtoken bcryptjs express-validator nodemailer multer pdf-parse mammoth express-rate-limit @google/generative-ai (Backend dependencies)')
   .text('cd .. && npm create vite@latest frontend -- --template react (Frontend initialization)')
   .text('cd frontend && npm install react-router-dom framer-motion lucide-react recharts jspdf html2canvas face-api.js (Frontend dependencies)');
doc.moveDown(0.5);

doc.fillColor('#1e293b').fontSize(12).font('Helvetica-Bold').text('2. Backend Dependencies Breakdown (Kyu aur kab install kiya)');
doc.moveDown(0.2);

const backendDeps = [
  ['express', 'Core web framework for REST API routing and middleware pipeline.'],
  ['mongoose', 'MongoDB Object Data Modeling (ODM) for schemas, pre-save hooks, and populate.'],
  ['dotenv', 'Loads environment variables (JWT_SECRET, GROQ_API_KEY, MONGODB_URI) safely.'],
  ['cors', 'Allows frontend (localhost:5173) to communicate with backend API (localhost:5000).'],
  ['jsonwebtoken', 'Stateless authentication using signed Bearer JWT tokens with 30-day expiry.'],
  ['bcryptjs', 'One-way salted password hashing for secure authentication storage.'],
  ['express-validator', 'Sanitizes and validates incoming request body fields before reaching controllers.'],
  ['express-rate-limit', 'Protects API routes from DoS attacks and AI API quota exhaustion.'],
  ['multer', 'Handles multipart form-data uploads (resumes & avatar photos) using memory buffers.'],
  ['pdf-parse', 'Extracts plain text strings from uploaded PDF resume buffers.'],
  ['mammoth', 'Converts uploaded Microsoft Word .docx files into plain text strings.'],
  ['nodemailer', 'Sends account confirmation and password reset emails to candidate emails.'],
  ['@google/generative-ai', 'SDK for fallback calls to Google Gemini API (gemini-pro).']
];

backendDeps.forEach(([name, desc]) => {
  doc.fillColor('#2563eb').fontSize(9).font('Helvetica-Bold').text(`• ${name}: `, { continued: true });
  doc.fillColor('#334155').font('Helvetica').text(desc);
});
doc.moveDown(0.5);

doc.fillColor('#1e293b').fontSize(12).font('Helvetica-Bold').text('3. Frontend Dependencies Breakdown (Kyu aur kab install kiya)');
doc.moveDown(0.2);

const frontendDeps = [
  ['react & react-dom', 'Core UI library for building component-driven single page app (React 19).'],
  ['vite', 'Next-gen dev server with fast HMR and optimized Rollup production bundler.'],
  ['react-router-dom', 'Client-side routing (v7), ProtectedRoutes, URL params, and navigation.'],
  ['framer-motion', 'Declarative animations for modals, card entry, hero sections, and podium rankings.'],
  ['lucide-react', 'Lightweight icon library used throughout all UI screens and status badges.'],
  ['recharts', 'SVG-based Skill Radar Chart component for visual technical breakdowns.'],
  ['face-api.js', 'TensorFlow.js face detector and 68-point landmark analyzer for EAR calculation.'],
  ['jspdf & html2canvas', 'Captures DOM charts as PNGs and compiles diagnostic PDF reports.']
];

frontendDeps.forEach(([name, desc]) => {
  doc.fillColor('#059669').fontSize(9).font('Helvetica-Bold').text(`• ${name}: `, { continued: true });
  doc.fillColor('#334155').font('Helvetica').text(desc);
});

addPageDecoration(doc);

doc.end();

writeStream.on('finish', () => {
  console.log(`Report PDF generated at: ${outputPath}`);
});
