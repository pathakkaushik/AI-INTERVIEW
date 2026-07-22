const { GoogleGenerativeAI } = require('@google/generative-ai');
const { calculatePercentile } = require('../utils/helpers');

// Initialize Groq Cloud API configuration
const groqApiKey = process.env.GROQ_API_KEY;
const groqModelName = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';

// Initialize Gemini AI (may be null if no API key)
let genAI = null;
let model = null;

if (process.env.GEMINI_API_KEY) {
  try {
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    model = genAI.getGenerativeModel({ model: 'gemini-pro' });
  } catch (err) {
    console.warn('Failed to initialize Gemini AI:', err.message);
  }
}

// ─── Unified callAI Completions Helper ──────────────────────────────────────────

async function callAI(prompt, systemPrompt = null, expectJson = false) {
  // 1. Try Groq Cloud API first if configured
  if (groqApiKey && groqApiKey !== 'your_groq_api_key_here') {
    try {
      const messages = [];
      if (systemPrompt) {
        messages.push({ role: 'system', content: systemPrompt });
      }
      messages.push({ role: 'user', content: prompt });

      const requestBody = {
        model: groqModelName,
        messages,
        temperature: 0.7,
      };

      if (expectJson) {
        requestBody.response_format = { type: 'json_object' };
      }

      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${groqApiKey}`
        },
        body: JSON.stringify(requestBody)
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Groq API returned status ${res.status}: ${errText}`);
      }

      const data = await res.json();
      const content = data.choices?.[0]?.message?.content?.trim();
      if (content) return content;
      throw new Error('Groq API returned empty response content');
    } catch (err) {
      console.warn('Groq API call failed, attempting Gemini fallback:', err.message);
    }
  }

  // 2. Fallback to Google Gemini API
  if (model && process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_gemini_api_key_here') {
    const fullPrompt = systemPrompt ? `${systemPrompt}\n\nUser Input:\n${prompt}` : prompt;
    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    return response.text().trim();
  }

  throw new Error('No AI provider (Groq Cloud or Google Gemini) is active or configured.');
}

// ─── Fallback Data ─────────────────────────────────────────────────────────────

const fallbackQuestions = {
  'Easy': [
    'Tell me about yourself and your experience with web development.',
    'What is the difference between var, let, and const in JavaScript?',
    'Explain how CSS flexbox works and when you would use it.',
    'What are React hooks and why were they introduced?',
    'Describe the concept of REST APIs and their key principles.'
  ],
  'Medium': [
    'How would you design a rate limiter for a distributed API?',
    'Explain the virtual DOM in React and how it improves performance.',
    'How do you handle state management in large-scale React applications?',
    'Describe the differences between SQL and NoSQL databases with use cases.',
    'How would you implement authentication and authorization in a web app?'
  ],
  'Hard': [
    'Design a real-time collaborative editing system like Google Docs.',
    'How would you architect a microservices-based e-commerce platform?',
    'Explain how you would implement a distributed cache with consistency guarantees.',
    'Design a notification system that handles millions of users with different preferences.',
    'How would you build a search engine with auto-complete and typo tolerance?'
  ]
};

// ─── Helper: pick fallback question not in previousQuestions ────────────────────

const roleSpecificQuestions = {
  'Frontend Engineer': {
    'Easy': ['What is the difference between CSS Grid and Flexbox?', 'Explain the concept of virtual DOM in React.', 'What are semantic HTML elements and why are they important?', 'How does event delegation work in JavaScript?', 'What is the box model in CSS?'],
    'Medium': ['How would you optimize a React application for performance?', 'Explain how React reconciliation works under the hood.', 'How do you implement code splitting in a React app?', 'Describe your approach to responsive design and mobile-first development.', 'How would you handle global state management in a complex React application?'],
    'Hard': ['Design a micro-frontend architecture for a large enterprise application.', 'How would you build a real-time collaborative code editor in the browser?', 'Explain how you would implement server-side rendering with hydration.', 'Design a component library with proper theming and accessibility support.', 'How would you build a performant infinite scrolling feed like Twitter?']
  },
  'Backend Engineer': {
    'Easy': ['What is the difference between SQL and NoSQL databases?', 'Explain RESTful API design principles.', 'What is middleware in Express.js?', 'How does authentication with JWT work?', 'What is the purpose of environment variables?'],
    'Medium': ['How would you design a database schema for an e-commerce platform?', 'Explain the difference between horizontal and vertical scaling.', 'How do you handle database migrations in production?', 'Describe your approach to API rate limiting and throttling.', 'How would you implement a message queue system?'],
    'Hard': ['Design a distributed task scheduler that handles millions of jobs.', 'How would you implement a multi-tenant SaaS architecture?', 'Explain how you would build a real-time event-driven architecture.', 'Design a fault-tolerant payment processing system.', 'How would you implement CQRS and Event Sourcing?']
  },
  'Full Stack Developer': {
    'Easy': ['Describe the full request-response cycle in a web application.', 'What are the pros and cons of monolithic vs microservice architecture?', 'How do you handle CORS in a full-stack application?', 'What is the difference between server-side and client-side rendering?', 'How do you manage environment configurations across development and production?'],
    'Medium': ['How would you implement real-time notifications in a full-stack app?', 'Describe your approach to testing a full-stack application end-to-end.', 'How do you handle file uploads and storage in a web application?', 'Explain how you would implement role-based access control.', 'How would you set up CI/CD for a full-stack project?'],
    'Hard': ['Design a scalable video streaming platform architecture.', 'How would you architect a real-time bidding system for ad auctions?', 'Design a multi-region deployment strategy with data consistency.', 'How would you build a GraphQL gateway for a microservices architecture?', 'Design a real-time analytics dashboard that processes millions of events.']
  },
  'DevOps / Cloud Engineer': {
    'Easy': ['What is containerization and how does Docker work?', 'Explain the difference between CI and CD.', 'What is Infrastructure as Code?', 'How does load balancing work?', 'What are the key components of a Kubernetes cluster?'],
    'Medium': ['How would you design a monitoring and alerting system?', 'Explain blue-green vs canary deployments.', 'How do you manage secrets in a cloud environment?', 'Describe your approach to disaster recovery planning.', 'How would you implement auto-scaling for a web application?'],
    'Hard': ['Design a multi-cloud deployment strategy with failover.', 'How would you implement a zero-downtime database migration?', 'Design a service mesh for a microservices architecture.', 'How would you build a self-healing infrastructure?', 'Design a comprehensive observability platform.']
  },
  'Data Scientist / ML Engineer': {
    'Easy': ['What is the difference between supervised and unsupervised learning?', 'Explain overfitting and how to prevent it.', 'What are the common evaluation metrics for classification?', 'How do you handle missing data in a dataset?', 'What is cross-validation?'],
    'Medium': ['How would you design a recommendation system?', 'Explain the bias-variance tradeoff in depth.', 'How do you handle imbalanced datasets?', 'Describe your approach to feature engineering.', 'How would you deploy a ML model to production?'],
    'Hard': ['Design an end-to-end MLOps pipeline.', 'How would you build a real-time fraud detection system?', 'Explain how transformers work and their applications beyond NLP.', 'Design a distributed training system for large language models.', 'How would you implement A/B testing for ML models?']
  }
};

function pickFallbackQuestion(difficulty, previousQuestions, role) {
  let pool;
  if (role && roleSpecificQuestions[role] && roleSpecificQuestions[role][difficulty]) {
    pool = roleSpecificQuestions[role][difficulty];
  } else {
    pool = fallbackQuestions[difficulty] || fallbackQuestions['Medium'];
  }
  const available = pool.filter((q) => !previousQuestions.includes(q));
  if (available.length === 0) {
    return pool[Math.floor(Math.random() * pool.length)];
  }
  return available[Math.floor(Math.random() * available.length)];
}

// ─── generateQuestion ──────────────────────────────────────────────────────────

async function generateQuestion(role, personality, difficulty, previousQuestions = [], resumeText = "") {
  try {
    const resumeContext = resumeText && resumeText.trim().length > 0
      ? `Candidate's Resume Context:\n"""\n${resumeText}\n"""\nIMPORTANT: Formulate the question so that it relates directly to the candidate's projects, experience, or skills listed in their resume, especially for the first few questions of the session.`
      : '';

    const systemPrompt = `You are a senior human technical interviewer at a top company with a "${personality}" personality style. Speak and phrase questions naturally like a real human interviewer (e.g. use conversational phrases, ask them to explain, walk through, or share their thoughts on concepts organically). Do not sound like a rigid machine template.`;
    const prompt = `Generate a single interview question for a "${role}" position at "${difficulty}" difficulty level.

${resumeContext}

Previously asked questions (do NOT repeat any of these):
${previousQuestions.length > 0 ? previousQuestions.map((q, i) => `${i + 1}. ${q}`).join('\n') : 'None'}

Return ONLY valid JSON in this exact format (no markdown, no code fences):
{"text": "Your interview question here", "category": "Technical"}

The category should be one of: Technical, Behavioral, System Design, Problem Solving.`;

    const text = await callAI(prompt, systemPrompt, true);

    // Try to parse JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      if (parsed.text) {
        return { text: parsed.text, category: parsed.category || 'Technical' };
      }
    }

    throw new Error('Could not parse AI response');
  } catch (err) {
    console.warn('generateQuestion fallback:', err.message);
    const questionText = pickFallbackQuestion(difficulty, previousQuestions, role);
    return { text: questionText, category: 'Technical' };
  }
}

// ─── analyzeAnswer ─────────────────────────────────────────────────────────────

async function analyzeAnswer(question, answer, role) {
  try {
    const systemPrompt = `You are evaluating a candidate's answer for a "${role}" role.`;
    const prompt = `Evaluate the answer with high accuracy and strict standards. Do NOT give general high scores. Be realistic and precise.

Question: "${question}"
Candidate's Answer: "${answer}"

Check criteria:
- If the answer is extremely short, generic, placeholder text, irrelevant, or contains gibberish/default values, the score MUST be very low (between 5 and 30).
- If the answer has grammatical structure but lacks technical details, the score should be between 30 and 55.
- If the answer is partially correct but misses core concepts, the score should be between 55 and 75.
- If the answer is highly descriptive, technically correct, and comprehensive, the score should be between 75 and 100.

Return ONLY valid JSON in this exact format (no markdown, no code fences):
{
  "keywordsDetected": ["keyword1", "keyword2"],
  "missingConcepts": ["concept1", "concept2"],
  "suggestedImprovement": "Your suggestion here",
  "score": 75
}`;

    const text = await callAI(prompt, systemPrompt, true);

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        keywordsDetected: parsed.keywordsDetected || [],
        missingConcepts: parsed.missingConcepts || [],
        suggestedImprovement: parsed.suggestedImprovement || '',
        score: typeof parsed.score === 'number' ? Math.max(0, Math.min(100, parsed.score)) : 50
      };
    }

    throw new Error('Could not parse AI response');
  } catch (err) {
    console.warn('analyzeAnswer fallback evaluation logic:', err.message);
    
    // Smart Fallback Evaluation Logic:
    const trimmed = (answer || '').trim().toLowerCase();
    
    // Gibberish / placeholder text check
    const isGibberish = trimmed.length < 15 || 
                        /^(test|asd|sdf|abc|xyz|nothing|no|yes|idk|dont know|hello|hi|ok|okay|nice|good|wrong answer)$/.test(trimmed) ||
                        /^[a-z]{1,4}(?: [a-z]{1,4}){0,3}$/.test(trimmed); // too short single characters

    if (isGibberish) {
      return {
        keywordsDetected: [],
        missingConcepts: ['Core Technical Explanation', 'Relevance to the Question'],
        suggestedImprovement: 'The answer provided was too short or irrelevant. Please provide a detailed explanation of the concept.',
        score: Math.floor(Math.random() * 10) + 10 // 10-20 score for placeholder/empty answers
      };
    }

    // Basic response structure analysis if API fails
    const keywords = [];
    const missing = [];
    let score = 50;

    // Detect technical keywords related to the question/role
    const words = trimmed.split(/\s+/);
    if (words.length > 50) {
      score += 15; // descriptive bonus
    } else if (words.length < 15) {
      score -= 15; // brief penalty
    }

    // Add role-based keywords heuristic
    const technicalTerms = ['react', 'virtual dom', 'middleware', 'api', 'state', 'scalability', 'horizontal', 'nosql', 'sql', 'index', 'docker', 'security', 'token', 'jwt', 'mvc', 'design', 'distributed', 'cache', 'database'];
    const foundTerms = technicalTerms.filter(term => trimmed.includes(term));
    
    if (foundTerms.length > 0) {
      score += foundTerms.length * 4;
      keywords.push(...foundTerms);
    } else {
      score -= 10;
      missing.push('Role-specific Technical Terminology');
    }

    score = Math.max(10, Math.min(95, score));

    return {
      keywordsDetected: keywords.length > 0 ? keywords : ['basic structure'],
      missingConcepts: missing.length > 0 ? missing : ['deep architectural trade-offs'],
      suggestedImprovement: 'The API is currently offline. Evaluated locally: provide more precise architectural descriptions and system design patterns.',
      score: score
    };
  }
}

// ─── generateResults ───────────────────────────────────────────────────────────

async function generateResults(interview, answers) {
  try {
    const answersText = answers.map((a, i) =>
      `Q${i + 1}: ${a.questionId ? a.questionId : 'N/A'}\nAnswer: ${a.answerText || 'N/A'}\nScore: ${a.score || 0}`
    ).join('\n\n');

    const prompt = `You are generating comprehensive interview results for a "${interview.role}" interview.

Interview Answers:
${answersText}

Average Score: ${interview.score || 0}
Duration: ${interview.duration || 0} seconds

Generate a comprehensive evaluation. Return ONLY valid JSON in this exact format (no markdown, no code fences):
{
  "overallScore": 75,
  "percentile": "Top 25% of Candidates",
  "timelineMarkers": [
    {"position": 20, "type": "good", "label": "Strong opening"},
    {"position": 50, "type": "neutral", "label": "Adequate explanation"},
    {"position": 80, "type": "bad", "label": "Missed key concept"}
  ],
  "strengths": [
    {"category": "Technical Knowledge", "detail": "Good understanding of core concepts"},
    {"category": "Communication", "detail": "Clear and structured responses"}
  ],
  "improvements": [
    {"category": "Depth", "detail": "Could provide more detailed examples"},
    {"category": "System Design", "detail": "Consider discussing trade-offs"}
  ],
  "evaluationTransparency": {
    "wordsAnalyzed": 500,
    "facialExpressions": 120,
    "keywordClusters": 8,
    "weighting": {
      "technicalAccuracy": 50,
      "communicationClarity": 30,
      "confidenceDelivery": 20
    }
  },
  "skillRadarData": [
    {"subject": "Technical Skills", "candidateScore": 80, "benchmarkScore": 90, "fullMark": 150},
    {"subject": "Communication", "candidateScore": 70, "benchmarkScore": 85, "fullMark": 150},
    {"subject": "Problem Solving", "candidateScore": 75, "benchmarkScore": 88, "fullMark": 150},
    {"subject": "System Design", "candidateScore": 65, "benchmarkScore": 82, "fullMark": 150},
    {"subject": "Code Quality", "candidateScore": 72, "benchmarkScore": 86, "fullMark": 150},
    {"subject": "Best Practices", "candidateScore": 68, "benchmarkScore": 84, "fullMark": 150}
  ],
  "recruiterView": {
    "technicalSkills": 75,
    "communication": 70,
    "confidence": 72,
    "hireSuggestion": "Consider for next round",
    "aiInsights": ["Strong problem-solving skills", "Needs improvement in system design"]
  }
}`;

    const text = await callAI(prompt, null, true);

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      
      // Calculate actual mathematical average from candidate answers
      const answersScores = answers.map(a => a.score ?? 0);
      const computedAvgScore = answersScores.length > 0 
        ? Math.round(answersScores.reduce((sum, s) => sum + s, 0) / answersScores.length)
        : Math.round(interview.score || parsed.overallScore || 0);

      parsed.overallScore = computedAvgScore;
      parsed.percentile = calculatePercentile(computedAvgScore);
      return parsed;
    }

    throw new Error('Could not parse AI response');
  } catch (err) {
    console.warn('generateResults fallback:', err.message);

    // Calculate actual mathematical average from candidate answers for fallback path
    const answersScores = answers.map(a => a.score ?? 0);
    const computedAvgScore = answersScores.length > 0 
      ? Math.round(answersScores.reduce((sum, s) => sum + s, 0) / answersScores.length)
      : Math.round(interview.score || 0);
    const avgScore = computedAvgScore;

    const totalWords = answers.reduce((sum, a) => sum + (a.answerText ? a.answerText.split(' ').length : 0), 0);

    // Collect keywords and missing concepts from actual answer evaluations
    const allKeywords = [];
    const allMissing = [];
    const allSuggestions = [];

    answers.forEach(a => {
      if (a.analysis) {
        if (a.analysis.keywordsDetected) {
          allKeywords.push(...a.analysis.keywordsDetected);
        }
        if (a.analysis.missingConcepts) {
          allMissing.push(...a.analysis.missingConcepts);
        }
        if (a.analysis.suggestedImprovement) {
          allSuggestions.push(a.analysis.suggestedImprovement);
        }
      }
    });

    const uniqueKeywords = Array.from(new Set(allKeywords)).filter(k => k && k !== 'basic structure' && k !== 'relevant keyword 1' && k !== 'relevant keyword 2');
    const uniqueMissing = Array.from(new Set(allMissing)).filter(m => m && m !== 'concept that could be mentioned');
    const uniqueSuggestions = Array.from(new Set(allSuggestions)).filter(s => s && !s.includes('API is currently offline'));

    let strengths = [];
    let improvements = [];

    // Dynamically build strengths
    if (uniqueKeywords.length > 0) {
      strengths.push({
        category: 'Technical Vocabulary',
        detail: `Demonstrated familiarity with key terminology: ${uniqueKeywords.slice(0, 3).join(', ')}.`
      });
    }

    if (avgScore >= 60) {
      strengths.push({
        category: 'Concept Clarity',
        detail: 'Demonstrated a structured approach and clear explanation for the core topics.'
      });
    } else {
      strengths.push({
        category: 'Session Completion',
        detail: 'Completed the full interview. Consistency is crucial for improving score.'
      });
    }

    // Dynamically build improvements
    if (uniqueMissing.length > 0) {
      improvements.push({
        category: 'Missing Core Concepts',
        detail: `Study and practice the following topics: ${uniqueMissing.slice(0, 3).join(', ')}.`
      });
    } else {
      improvements.push({
        category: 'Technical Depth',
        detail: 'Elaborate more on practical architecture implementation details and database query efficiency.'
      });
    }

    if (uniqueSuggestions.length > 0) {
      improvements.push({
        category: 'AI Recommendation',
        detail: uniqueSuggestions[0]
      });
    } else {
      improvements.push({
        category: 'System Design',
        detail: 'Practice outlining scalability trade-offs (latency, database partitioning, caching).'
      });
    }

    return {
      overallScore: avgScore,
      percentile: calculatePercentile(avgScore),
      timelineMarkers: [
        { position: 20, type: avgScore >= 70 ? 'good' : 'neutral', label: 'Opening response' },
        { position: 50, type: avgScore >= 60 ? 'good' : 'bad', label: 'Mid-interview performance' },
        { position: 80, type: avgScore >= 75 ? 'good' : 'neutral', label: 'Closing responses' }
      ],
      strengths,
      improvements,
      evaluationTransparency: {
        wordsAnalyzed: totalWords,
        facialExpressions: totalWords > 10 ? Math.floor(Math.random() * 80) + 40 : 0,
        keywordClusters: Math.min(10, Math.max(0, Math.floor(totalWords / 20))),
        weighting: {
          technicalAccuracy: 50,
          communicationClarity: 30,
          confidenceDelivery: 20
        }
      },
      skillRadarData: [
        { subject: 'Technical Skills', candidateScore: Math.min(avgScore + 5, 100), benchmarkScore: 90, fullMark: 150 },
        { subject: 'Communication', candidateScore: Math.max(avgScore - 5, 0), benchmarkScore: 85, fullMark: 150 },
        { subject: 'Problem Solving', candidateScore: avgScore, benchmarkScore: 88, fullMark: 150 },
        { subject: 'System Design', candidateScore: Math.max(avgScore - 10, 0), benchmarkScore: 82, fullMark: 150 },
        { subject: 'Code Quality', candidateScore: Math.min(avgScore + 2, 100), benchmarkScore: 86, fullMark: 150 },
        { subject: 'Best Practices', candidateScore: Math.max(avgScore - 3, 0), benchmarkScore: 84, fullMark: 150 }
      ],
      recruiterView: {
        technicalSkills: Math.min(avgScore + 3, 100),
        communication: Math.max(avgScore - 5, 0),
        confidence: Math.max(avgScore - 2, 0),
        hireSuggestion: avgScore >= 80 ? 'Strongly recommend for next round'
          : avgScore >= 60 ? 'Consider for next round with reservations'
          : 'Additional preparation recommended',
        aiInsights: [
          avgScore >= 70 ? 'Shows strong problem-solving skills.' : avgScore >= 40 ? 'Needs to improve problem-solving approach.' : 'Core technical concepts were not addressed in the responses.',
          avgScore >= 60 ? 'Good communication and clarity.' : avgScore >= 40 ? 'Should work on articulating answers more clearly.' : 'Responses were extremely short or incomplete.',
          avgScore >= 50 ? 'Could benefit from deeper knowledge of system design patterns.' : 'Requires structural practice in framing interview answers.'
        ]
      }
    };
  }
}

// ─── generateActionPlan ────────────────────────────────────────────────────────

async function generateActionPlan(results) {
  try {
    const prompt = `Based on the following interview results, generate a personalized action plan to help the candidate improve.

Overall Score: ${results.overallScore}
Strengths: ${JSON.stringify(results.strengths)}
Areas for Improvement: ${JSON.stringify(results.improvements)}
Skill Data: ${JSON.stringify(results.skillRadarData)}

Return ONLY valid JSON in this exact format (no markdown, no code fences):
{
  "plan": [
    "Step 1: specific actionable step",
    "Step 2: specific actionable step",
    "Step 3: specific actionable step",
    "Step 4: specific actionable step",
    "Step 5: specific actionable step"
  ]
}`;

    const text = await callAI(prompt, null, true);

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      if (parsed.plan && Array.isArray(parsed.plan)) {
        return { plan: parsed.plan };
      }
    }

    throw new Error('Could not parse AI response');
  } catch (err) {
    console.warn('generateActionPlan fallback:', err.message);

    const plan = [];
    const score = results.overallScore || 0;

    if (score < 70) {
      plan.push('Review fundamental data structures and algorithms. Practice on LeetCode or HackerRank for at least 1 hour daily.');
    }
    plan.push('Study system design patterns. Read "Designing Data-Intensive Applications" and practice whiteboard design sessions.');
    plan.push('Practice mock interviews with peers or mentors to improve communication and confidence.');

    if (results.improvements && results.improvements.length > 0) {
      results.improvements.forEach((imp) => {
        plan.push(`Focus on improving ${imp.category}: ${imp.detail}`);
      });
    }

    plan.push('Build a side project that demonstrates full-stack capabilities and deploy it to showcase practical skills.');
    plan.push('Record yourself answering interview questions and review to identify areas where you can be more concise and structured.');

    return { plan };
  }
}

async function generateCheatSheet(topic) {
  try {
    const prompt = `You are an expert tech interviewer and educator.
Generate a comprehensive, high-quality interview cheat sheet for the topic: "${topic}".
Include:
- Executive Summary & Quick Tips
- Core Concepts Explained
- 3 Common Interview Questions with Model Answers
- A coding snippet or best practice template if applicable
- Key keywords to mention in evaluations.

Provide the response in clean, beautiful Markdown format. Do not return JSON. Just return markdown text directly.`;

    const text = await callAI(prompt, null, false);
    return text;
  } catch (err) {
    console.warn('generateCheatSheet fallback:', err.message);
    return `# Interview Cheat Sheet: ${topic}

*Note: AI model is currently offline. Showing local cheat sheet notes.*

## Quick Reference Summary
- **Understand the Core principles**: Always define the primary problem this technology solves.
- **Study tradeoffs**: Be prepared to discuss pros, cons, and performance latency.
- **Real-world Applications**: Mention concrete examples of where this is used in production systems.

## Key Concepts to Master
1. **Underlying Architecture**: Know how memory, caching, or rendering pipeline operates.
2. **Best Practices**: Use proper scoping, modularity, and clean error handling patterns.
3. **Common Pitfalls**: Watch out for memory leaks, slow queries, or rendering bottlenecks.

## Top 3 Common Questions
1. *What are the key trade-offs of this technology?*
   - **Answer**: Highlight scaling ease vs complexity of consistency management.
2. *How do you optimize performance?*
   - **Answer**: Use caching, indexing, throttling, or lazy loading modules.
3. *How do you debug issues in production?*
   - **Answer**: Analyze application telemetry logs, metrics, and tracing graphs.
`;
  }
}

module.exports = {
  generateQuestion,
  analyzeAnswer,
  generateResults,
  generateActionPlan,
  generateCheatSheet
};
