// Run: npm install docx && node create-resume.js
const { Document, Packer, Paragraph, TextRun, AlignmentType, BorderStyle, LevelFormat, TabStopType } = require('docx')
const fs = require('fs')

// Page: US Letter, 0.75" margins
const L = 1080, R = 1080
const contentWidth = 12240 - L - R // 10080 DXA

// ── Helpers ──────────────────────────────────────────────────────────────────

function sectionHeader(text) {
  return new Paragraph({
    children: [new TextRun({ text, font: 'Calibri', size: 21, bold: false })],
    spacing: { before: 180, after: 60 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: '000000', space: 1 } },
  })
}

// Left text + right-aligned text on same line
function twoCol(left, right) {
  return new Paragraph({
    children: [
      new TextRun({ text: left, font: 'Calibri', size: 20 }),
      new TextRun({ text: '\t' }),
      new TextRun({ text: right, font: 'Calibri', size: 20 }),
    ],
    tabStops: [{ type: TabStopType.RIGHT, position: contentWidth }],
    spacing: { before: 60, after: 0 },
  })
}

function bullet(text) {
  return new Paragraph({
    numbering: { reference: 'bullets', level: 0 },
    children: [new TextRun({ text, font: 'Calibri', size: 20 })],
    spacing: { before: 0, after: 40 },
  })
}

function projectTitle(text) {
  return new Paragraph({
    children: [new TextRun({ text, font: 'Calibri', size: 20 })],
    spacing: { before: 80, after: 40 },
  })
}

// ── Document ──────────────────────────────────────────────────────────────────

const doc = new Document({
  numbering: {
    config: [{
      reference: 'bullets',
      levels: [{
        level: 0,
        format: LevelFormat.BULLET,
        text: '•',
        alignment: AlignmentType.LEFT,
        style: { paragraph: { indent: { left: 360, hanging: 360 } } },
      }],
    }],
  },
  sections: [{
    properties: {
      page: {
        size: { width: 12240, height: 15840 },
        margin: { top: 720, bottom: 720, left: L, right: R },
      },
    },
    children: [

      // ── HEADER ──
      new Paragraph({
        children: [new TextRun({ text: 'Saul Guzman', font: 'Calibri', size: 36 })],
        alignment: AlignmentType.CENTER,
        spacing: { before: 0, after: 60 },
      }),
      new Paragraph({
        children: [new TextRun({
          text: 'New York  |  917-562-9073  |  Saulguzmanxd1.sg@gmail.com  |  LinkedIn  |  GitHub',
          font: 'Calibri', size: 18,
        })],
        alignment: AlignmentType.CENTER,
        spacing: { before: 0, after: 120 },
      }),

      // ── EDUCATION ──
      sectionHeader('EDUCATION'),
      twoCol('Queens College, City University of New York', 'Queens, NY'),
      twoCol('B.A. in Computer Science', 'Expected: May 2027'),
      new Paragraph({
        children: [new TextRun({
          text: 'Related Coursework: Software Engineering, Internet and Web Technologies, Data Structures & Algorithms, Discrete Mathematics, Discrete Structures, Computer Organization and Assembly Language, Mobile App Development',
          font: 'Calibri', size: 18, italics: true,
        })],
        spacing: { before: 40, after: 0 },
      }),

      // ── SKILLS ──
      sectionHeader('SKILLS'),
      new Paragraph({
        children: [
          new TextRun({ text: 'Programming:  ', font: 'Calibri', size: 20 }),
          new TextRun({ text: 'Java, C++, HTML, CSS, JavaScript, TypeScript, Kotlin', font: 'Calibri', size: 20 }),
        ],
        spacing: { before: 60, after: 40 },
      }),
      new Paragraph({
        children: [
          new TextRun({ text: 'Frameworks & Libraries:  ', font: 'Calibri', size: 20 }),
          new TextRun({ text: 'React, Vue.js, Vuetify, Spring Boot, Android SDK, Tailwind CSS, Supabase', font: 'Calibri', size: 20 }),
        ],
        spacing: { before: 0, after: 0 },
      }),

      // ── EXPERIENCE ──
      sectionHeader('EXPERIENCE'),
      twoCol('CUNY Tech Prep', 'New York, NY'),
      twoCol('Software Engineer Fellow', 'August 2025 – Present'),
      bullet('Selected for a competitive technical and career development program with 100+ fellows across 11 CUNY colleges, focused on building industry-ready applications.'),
      bullet('Applied React, TypeScript, JavaScript, HTML, and CSS across workshops, collaborative projects, and hands-on application development.'),

      // ── PROJECTS ──
      sectionHeader('PROJECTS'),

      // Candogram
      twoCol('Candogram', 'New York, NY'),
      twoCol('Team Lead  |  Vue.js, Vuetify, TypeScript', 'January 2026 – Present'),
      bullet('Building Vue.js/Vuetify frontend features for an AI-powered resume generation platform that transforms structured work history into polished, downloadable PDF resumes across multiple configurable templates.'),
      bullet('Optimized PDF generation performance by parallelizing sequential backend API calls, cutting load time during the download flow.'),
      bullet('Hardened the PDF download flow to surface save failures to the user rather than silently failing, while keeping the download experience intact.'),
      bullet('Diagnosed and resolved a race condition causing core resume generation buttons to intermittently disappear mid-flow.'),

      // MAPS
      projectTitle('MAPS (My Academic Planning System)  |  React, Firebase, D3.js, Drizzle ORM, TypeScript, Node.js, PostgreSQL  |  GitHub'),
      bullet('Collaborated in a 4-person development team to architect a full-stack academic planning platform, implementing React/TypeScript frontend, Node.js/Express backend, PostgreSQL (Neon) with Drizzle ORM, and Firebase Authentication for Queens College CS students.'),
      bullet('Built real-time web scraping system pulling live CUNY course data, developed intelligent schedule validation engine preventing conflicts across 40+ CS courses, and engineered D3.js interactive prerequisite graphs visualizing complex course dependencies.'),

      // World Cup 2026
      projectTitle('World Cup 2026 Tracker  |  React, Vite, Node.js, Vercel Serverless, Supabase  |  GitHub'),
      bullet('Built a live World Cup 2026 tracker with React and Vite featuring real-time scores, match timelines, and goal scorer data with 30-second live polling across all 48 teams.'),
      bullet('Migrated data pipeline from a paid API to a free JWT-authenticated REST API, building custom team name normalization and scorer string parsing to handle inconsistent international data formats.'),
      bullet('Deployed on Vercel serverless functions with server-side in-memory caching, reducing third-party API load while serving fresh data within a 60-second TTL window.'),
      bullet('Implemented Google OAuth via Supabase with Row Level Security, enabling users to follow teams and sync favorites across devices.'),

      // La Liga
      projectTitle('La Liga Football Tracker  |  Spring Boot, Java, React, TypeScript, Tailwind CSS, REST API, JPA/Hibernate'),
      bullet('Built full-stack sports app using Spring Boot, React, and TypeScript to display real-time La Liga standings, live scores, and match schedules for 20 teams.'),
      bullet('Integrated API-Football REST API to fetch live data, parsing JSON responses and storing in H2 database using Spring Data JPA with custom query methods.'),

      // ── LEADERSHIP ──
      sectionHeader('LEADERSHIP EXPERIENCE'),

      twoCol('Code For All  |  Member', 'New York, NY'),
      bullet('Collaborated with 700+ computer science students to build community-led projects and share knowledge on web development and data science, fostering a culture of continuous learning.'),
      bullet('Engaged in system design sessions that covered scalability, caching, and database architecture, deepening understanding of real-world software engineering practices.'),

      twoCol('ISACA Cyber Security  |  Member', 'New York, NY'),
      bullet('Earned 3rd place in the ISACA case study competition by conducting risk assessments and developing a cybersecurity mitigation plan for a mock business scenario, demonstrating strong analytical and teamwork skills.'),

    ],
  }],
})

Packer.toBuffer(doc).then(buf => {
  fs.writeFileSync('Saul_Guzman_Resume.docx', buf)
  console.log('✓ Saved: Saul_Guzman_Resume.docx')
})
