// BuildNext Unified Data Service
// Multi-disciplinary student learning ecosystem data store
// Provides robust CRUD operations with initial blueprint seed data and persistence

export interface TrackModule {
  id: string;
  title: string;
  duration: string;
  xp: number;
  lessons: string[];
}

export interface Track {
  id: string;
  name: string;
  description: string;
  category: 'Technology' | 'AI & Data' | 'Design' | 'Business' | 'Finance' | 'Core Engineering' | 'Career & Research';
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  icon: string;
  estimatedHours: number;
  modulesCount: number;
  featured?: boolean;
  syllabus: TrackModule[];
  prerequisites: string[];
}

export interface Opportunity {
  id: string;
  title: string;
  company: string;
  type: 'Internship' | 'Fellowship' | 'Competition' | 'Job';
  mode: 'Remote' | 'Hybrid' | 'On-site';
  location: string;
  stipend: string;
  description: string;
  responsibilities: string[];
  skills: string[];
  eligibility: string;
  deadline: string;
  status: 'published' | 'draft' | 'closed';
  featured?: boolean;
  applicantsCount: number;
  partnerBadge?: string;
}

export interface Application {
  id: string;
  opportunityId: string;
  roleTitle: string;
  company: string;
  studentName: string;
  studentEmail: string;
  stream: string;
  year: number;
  appliedDate: string;
  status: 'Under Review' | 'Shortlisted' | 'Selected' | 'Rejected';
  consentGranted: boolean;
  githubUrl?: string;
}

export interface Assessment {
  id: string;
  title: string;
  trackCategory: string;
  duration: string;
  totalQuestions: number;
  passingScore: number;
  xpReward: number;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  questions: {
    id: number;
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  }[];
}

export interface Project {
  id: string;
  title: string;
  category: 'Mini Project' | 'Minor Project' | 'Major Project';
  stream: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  duration: string;
  summary: string;
  problemStatement: string;
  deliverables: string[];
  stack: string[];
  xp: number;
  submissionsCount: number;
}

export interface EventItem {
  id: string;
  title: string;
  organizer: string;
  type: 'Hackathon' | 'Coding Contest' | 'Workshop' | 'Demo Day';
  date: string;
  time: string;
  mode: 'Online' | 'Hybrid' | 'In-Person';
  spotsTotal: number;
  spotsFilled: number;
  description: string;
  perks: string[];
  partnerLogo?: string;
  status: 'Open' | 'Filling Fast' | 'Closed';
}

export interface Certificate {
  id: string;
  certificateId: string; // e.g. BN-2026-WD8921
  studentName: string;
  studentEmail: string;
  trackName: string;
  category: string;
  issueDate: string;
  grade: 'Distinction' | 'Merit' | 'Pass';
  verified: boolean;
  credentialUrl: string;
}

export interface Mentor {
  id: string;
  name: string;
  role: string;
  company: string;
  domain: string;
  experience: string;
  avatar: string;
  bio: string;
  availableSlots: string[];
}

// Initial Blueprint Data
export const initialTracks: Track[] = [
  {
    id: 'full-stack-engineering',
    name: 'Full Stack Engineering & Cloud Systems',
    description: 'Master enterprise application development with Next.js, Node.js microservices, PostgreSQL, and scalable cloud deployments.',
    category: 'Technology',
    difficulty: 'Intermediate',
    icon: 'Layers',
    estimatedHours: 36,
    modulesCount: 8,
    featured: true,
    prerequisites: ['Basic JavaScript', 'HTML/CSS basics'],
    syllabus: [
      { id: 'm1', title: 'Modern React & Server Components Architecture', duration: '4 hrs', xp: 50, lessons: ['RSC Mental Model', 'Streaming SSR', 'Next.js App Router'] },
      { id: 'm2', title: 'REST & GraphQL Microservices in Node.js', duration: '5 hrs', xp: 60, lessons: ['Express/NestJS APIs', 'Authentication & JWT', 'Rate Limiting'] },
      { id: 'm3', title: 'Relational Database Modeling with PostgreSQL', duration: '4.5 hrs', xp: 60, lessons: ['Prisma ORM', 'Indexing & Query Optimization', 'Migrations'] },
      { id: 'm4', title: 'Distributed Systems & Cloud Deployment', duration: '5 hrs', xp: 70, lessons: ['Docker Containerization', 'CI/CD Pipelines', 'AWS/Vercel Architecture'] },
    ]
  },
  {
    id: 'applied-ai-llms',
    name: 'Applied AI & Large Language Models',
    description: 'Build production-ready GenAI systems, Retrieval-Augmented Generation (RAG) pipelines, and multimodal agent workflows.',
    category: 'AI & Data',
    difficulty: 'Intermediate',
    icon: 'Brain',
    estimatedHours: 32,
    modulesCount: 7,
    featured: true,
    prerequisites: ['Python intermediate', 'Basic Linear Algebra'],
    syllabus: [
      { id: 'a1', title: 'Foundations of Modern Deep Learning & Transformers', duration: '4 hrs', xp: 50, lessons: ['Attention Mechanisms', 'Tokenizer Internals', 'HuggingFace Hub'] },
      { id: 'a2', title: 'Retrieval Augmented Generation (RAG) Architectures', duration: '5 hrs', xp: 70, lessons: ['Vector Embeddings', 'Milvus & Pinecone', 'Hybrid Search'] },
      { id: 'a3', title: 'Autonomous AI Agents & Tool Calling', duration: '5 hrs', xp: 75, lessons: ['LangChain / LlamaIndex', 'Function Calling', 'Evaluation & Safety'] },
      { id: 'a4', title: 'Model Fine-Tuning & Quantization (LoRA)', duration: '4.5 hrs', xp: 80, lessons: ['Parameter-Efficient Tuning', 'QLoRA', 'vLLM Serving'] },
    ]
  },
  {
    id: 'data-science-analytics',
    name: 'Data Science & Quantitative Analytics',
    description: 'Transform raw data into strategic business intelligence using Python, Pandas, statistical modeling, and interactive visualization.',
    category: 'AI & Data',
    difficulty: 'Beginner',
    icon: 'BarChart2',
    estimatedHours: 28,
    modulesCount: 6,
    prerequisites: ['Basic math', 'Spreadsheet basics'],
    syllabus: [
      { id: 'd1', title: 'Exploratory Data Analysis with Python & Pandas', duration: '4 hrs', xp: 40, lessons: ['Data Wrangling', 'Cleaning Irregular Data', 'NumPy Vectors'] },
      { id: 'd2', title: 'Statistical Inference & Hypothesis Testing', duration: '4 hrs', xp: 50, lessons: ['Probability Distributions', 'A/B Test Design', 'Confidence Intervals'] },
      { id: 'd3', title: 'Predictive Modeling with Scikit-Learn', duration: '5 hrs', xp: 60, lessons: ['Regression & Classification', 'Cross Validation', 'Feature Importance'] },
    ]
  },
  {
    id: 'product-experience-design',
    name: 'Product Experience & UI/UX Systems',
    description: 'Design digital products with Apple-grade craftsmanship, cohesive design tokens, typography hierarchy, and accessibility.',
    category: 'Design',
    difficulty: 'Beginner',
    icon: 'Figma',
    estimatedHours: 24,
    modulesCount: 6,
    featured: true,
    prerequisites: ['Curiosity for visual design & human behavior'],
    syllabus: [
      { id: 'u1', title: 'Heuristic Evaluation & Human-Interface Guidelines', duration: '3.5 hrs', xp: 40, lessons: ['Apple HIG Principles', 'Affordance & Mental Models', 'Usability Audits'] },
      { id: 'u2', title: 'Design Systems & Variable Tokens in Figma', duration: '4 hrs', xp: 50, lessons: ['Auto-Layout Mastery', 'Component Properties', 'Dark/Light Tokenization'] },
      { id: 'u3', title: 'Micro-Interactions & Prototyping', duration: '4 hrs', xp: 50, lessons: ['Smart Animate', 'State Transitions', 'User Testing Loops'] },
    ]
  },
  {
    id: 'product-management-growth',
    name: 'Product Management & Venture Execution',
    description: 'From 0 to 1 product discovery: define PRDs, conduct customer discovery interviews, run growth loops, and prioritize roadmaps.',
    category: 'Business',
    difficulty: 'Intermediate',
    icon: 'Briefcase',
    estimatedHours: 22,
    modulesCount: 5,
    prerequisites: ['Problem-solving mindset'],
    syllabus: [
      { id: 'b1', title: 'Problem Discovery & Market Sizing (TAM/SAM/SOM)', duration: '3 hrs', xp: 40, lessons: ['Customer Archetypes', 'JTBD Framework', 'Competitive Moats'] },
      { id: 'b2', title: 'Writing Crisp Product Requirement Docs (PRDs)', duration: '4 hrs', xp: 50, lessons: ['User Stories & Scenarios', 'Acceptance Criteria', 'Trade-off Matrices'] },
      { id: 'b3', title: 'Metrics, North Star & Growth Loops', duration: '3.5 hrs', xp: 50, lessons: ['Retention Cohorts', 'Pirate Metrics (AARRR)', 'Feature Flag Experiments'] },
    ]
  },
  {
    id: 'fintech-financial-analysis',
    name: 'FinTech Systems & Quantitative Modeling',
    description: 'Learn financial modeling, ledger architecture, payment gateway mechanics, and quantitative risk assessment.',
    category: 'Finance',
    difficulty: 'Intermediate',
    icon: 'TrendingUp',
    estimatedHours: 20,
    modulesCount: 5,
    prerequisites: ['Basic accounting or algebra'],
    syllabus: [
      { id: 'f1', title: 'Financial Modeling in Excel & Python', duration: '3.5 hrs', xp: 40, lessons: ['DCF Valuation', 'Sensitivity Tables', 'Scenario Analysis'] },
      { id: 'f2', title: 'FinTech Rails: UPI, ISO20022 & Double-Entry Ledgers', duration: '4 hrs', xp: 50, lessons: ['Payment Gateway Lifecycles', 'Idempotency in Banking', 'Fraud Detection'] },
    ]
  },
  {
    id: 'iot-embedded-automation',
    name: 'IoT, Robotics & Embedded Automation',
    description: 'Bridge hardware and software with ESP32 microcontrollers, ROS robotics middleware, real-time sensor loops, and MQTT telemetry.',
    category: 'Core Engineering',
    difficulty: 'Intermediate',
    icon: 'Cpu',
    estimatedHours: 30,
    modulesCount: 6,
    prerequisites: ['Basic C/C++ or Python'],
    syllabus: [
      { id: 'e1', title: 'Embedded C/C++ & FreeRTOS on ESP32', duration: '5 hrs', xp: 60, lessons: ['GPIO, I2C, SPI Bus', 'Task Scheduling', 'Low Power Modes'] },
      { id: 'e2', title: 'Industrial Telemetry: MQTT & Edge Gateway', duration: '4.5 hrs', xp: 55, lessons: ['Broker Configuration', 'Sensor Calibration', 'Over-The-Air (OTA) Updates'] },
    ]
  },
  {
    id: 'technical-research-communication',
    name: 'Technical Research, Communication & Open Source',
    description: 'Learn how to read research papers, contribute to high-impact open source repositories, and deliver compelling technical presentations.',
    category: 'Career & Research',
    difficulty: 'Beginner',
    icon: 'FileText',
    estimatedHours: 18,
    modulesCount: 5,
    prerequisites: ['None'],
    syllabus: [
      { id: 'r1', title: 'Deconstructing Computer Science Research Papers', duration: '3 hrs', xp: 35, lessons: ['Methodology Analysis', 'Reproducing Benchmarks', 'Literature Review'] },
      { id: 'r2', title: 'Open Source Contribution Playbook', duration: '3.5 hrs', xp: 45, lessons: ['Fork & Upstream Git Flow', 'RFC Discussions', 'Writing Documentation'] },
    ]
  }
];

export const initialOpportunities: Opportunity[] = [
  {
    id: 'elite-globex-fullstack',
    title: 'Full Stack Engineering Intern',
    company: 'Elite Globex',
    type: 'Internship',
    mode: 'Hybrid',
    location: 'Gurgaon / Remote',
    stipend: '₹25,000 / month',
    description: 'Work alongside Elite Globex senior engineers building high-throughput student assessment pipelines, Next.js interactive web apps, and distributed microservices.',
    responsibilities: [
      'Implement responsive React/Next.js interfaces with Tailwind CSS',
      'Design REST & gRPC API endpoints with Node.js and PostgreSQL',
      'Optimize query speeds and caching layers for sub-100ms response times',
      'Participate in sprint code reviews and daily engineering standups'
    ],
    skills: ['Next.js', 'TypeScript', 'Node.js', 'PostgreSQL', 'Docker'],
    eligibility: 'Open to pre-final and final year students across all disciplines',
    deadline: '2026-10-15',
    status: 'published',
    featured: true,
    applicantsCount: 48,
    partnerBadge: 'Verified Partner'
  },
  {
    id: 'elite-globex-ai-research',
    title: 'Applied AI & ML Research Intern',
    company: 'Elite Globex',
    type: 'Internship',
    mode: 'Remote',
    location: 'Remote',
    stipend: '₹30,000 / month',
    description: 'Join the Elite Globex AI lab developing specialized domain-adapted LLMs, automated code-grading agents, and multi-document RAG systems.',
    responsibilities: [
      'Train and evaluate fine-tuned open-source models using LoRA/QLoRA',
      'Develop evaluation benchmarks measuring hallucination rates and accuracy',
      'Integrate vector search indices with hybrid BM25 algorithms'
    ],
    skills: ['Python', 'PyTorch', 'LangChain', 'HuggingFace', 'FastAPI'],
    eligibility: 'Demonstrated experience in Python and machine learning fundamentals',
    deadline: '2026-10-20',
    status: 'published',
    featured: true,
    applicantsCount: 62,
    partnerBadge: 'Verified Partner'
  },
  {
    id: 'gfg-problem-setter',
    title: 'Technical Content & Problem Setter Fellow',
    company: 'GeeksforGeeks',
    type: 'Fellowship',
    mode: 'Remote',
    location: 'Noida / Remote',
    stipend: '₹20,000 / month',
    description: 'Official GeeksforGeeks partnership role. Design algorithmic challenges, write rigorous test cases, and create editorial solutions for national contests.',
    responsibilities: [
      'Create original algorithmic problem statements across arrays, trees, and graphs',
      'Construct edge-case tests with strict time and memory bounds',
      'Author clean C++, Java, and Python standard solutions'
    ],
    skills: ['Data Structures', 'Algorithms', 'C++', 'Python', 'Problem Formulation'],
    eligibility: 'Strong competitive programming or DSA foundation',
    deadline: '2026-10-10',
    status: 'published',
    featured: true,
    applicantsCount: 89,
    partnerBadge: 'Official Partner'
  },
  {
    id: 'nova-fintech-systems',
    title: 'Backend Platform Systems Intern',
    company: 'Nova FinTech',
    type: 'Internship',
    mode: 'Hybrid',
    location: 'Bengaluru',
    stipend: '₹28,000 / month',
    description: 'Build real-time ledger accounting services, double-entry transactional APIs, and webhook processing systems handling high concurrency.',
    responsibilities: [
      'Develop idempotent payment processing routes in Go/Node.js',
      'Implement database transactions with strict isolation levels',
      'Monitor telemetry and latency using Prometheus and OpenTelemetry'
    ],
    skills: ['Go', 'Node.js', 'PostgreSQL', 'Redis', 'Kafka'],
    eligibility: 'Engineering/Tech students with solid systems fundamentals',
    deadline: '2026-10-18',
    status: 'published',
    featured: false,
    applicantsCount: 34
  },
  {
    id: 'pulse-product-design',
    title: 'Product & Visual Design Apprentice',
    company: 'Pulse Studio',
    type: 'Internship',
    mode: 'Remote',
    location: 'Remote',
    stipend: '₹22,000 / month',
    description: 'Craft elegant design tokens, accessible components, and micro-animations for enterprise and consumer SaaS platforms.',
    responsibilities: [
      'Construct high-fidelity interactive prototypes in Figma',
      'Conduct usability interviews and translate insights into wireframes',
      'Collaborate directly with frontend engineers for pixel-perfect delivery'
    ],
    skills: ['Figma', 'Design Systems', 'Prototyping', 'Accessibility (WCAG)'],
    eligibility: 'Strong portfolio link showcasing recent interface design projects',
    deadline: '2026-10-25',
    status: 'published',
    featured: false,
    applicantsCount: 29
  }
];

export const initialApplications: Application[] = [
  {
    id: 'app-101',
    opportunityId: 'elite-globex-fullstack',
    roleTitle: 'Full Stack Engineering Intern',
    company: 'Elite Globex',
    studentName: 'Harsh Dixit',
    studentEmail: 'harsh@buildnext.local',
    stream: 'Computer Science & Engineering',
    year: 3,
    appliedDate: '2026-09-18',
    status: 'Shortlisted',
    consentGranted: true,
    githubUrl: 'https://github.com/oldhsd'
  },
  {
    id: 'app-102',
    opportunityId: 'gfg-problem-setter',
    roleTitle: 'Technical Content & Problem Setter Fellow',
    company: 'GeeksforGeeks',
    studentName: 'Aarav Sharma',
    studentEmail: 'aarav.sharma@example.edu',
    stream: 'Information Technology',
    year: 4,
    appliedDate: '2026-09-19',
    status: 'Under Review',
    consentGranted: true
  },
  {
    id: 'app-103',
    opportunityId: 'elite-globex-ai-research',
    roleTitle: 'Applied AI & ML Research Intern',
    company: 'Elite Globex',
    studentName: 'Priya Nair',
    studentEmail: 'priya.nair@example.edu',
    stream: 'Artificial Intelligence & Data',
    year: 3,
    appliedDate: '2026-09-20',
    status: 'Selected',
    consentGranted: true
  }
];

export const initialAssessments: Assessment[] = [
  {
    id: 'assessment-web-arch',
    title: 'Full-Stack Architecture & Systems Assessment',
    trackCategory: 'Technology',
    duration: '20 mins',
    totalQuestions: 5,
    passingScore: 70,
    xpReward: 120,
    difficulty: 'Intermediate',
    questions: [
      {
        id: 1,
        question: 'Which HTTP caching header directive ensures a client always validates the cached response with the origin server before serving it?',
        options: ['cache-control: no-store', 'cache-control: no-cache', 'cache-control: public, max-age=0', 'pragma: cache'],
        correctIndex: 1,
        explanation: '"no-cache" means the browser may store the response, but MUST validate it with the origin server (using ETag or If-Modified-Since) before using the cached copy.'
      },
      {
        id: 2,
        question: 'In Next.js React Server Components (RSC), what is the key difference between Server and Client Components?',
        options: [
          'Server Components only execute during initial build and never on server requests',
          'Server Components run strictly on the server and send zero JavaScript to the client bundle',
          'Client Components cannot fetch data from internal database connections',
          'Server Components require an explicit "use server" directive at the top of the file'
        ],
        correctIndex: 1,
        explanation: 'Server Components execute only on the server, reducing the client JavaScript bundle size to 0 KB for that component.'
      },
      {
        id: 3,
        question: 'Why should database B-Tree indexes be created on high-cardinality columns rather than low-cardinality ones?',
        options: [
          'Low-cardinality columns consume excessive disk RAM when indexed',
          'High cardinality ensures that traversing the index tree narrows down the candidate rows efficiently',
          'PostgreSQL and MySQL automatically disallow indexes on boolean columns',
          'B-Trees are strictly designed for sequential integer primary keys'
        ],
        correctIndex: 1,
        explanation: 'High cardinality means many unique values, allowing the B-tree search to eliminate large fractions of table rows per branch jump.'
      },
      {
        id: 4,
        question: 'What is the primary benefit of Idempotency Keys in financial API transactions?',
        options: [
          'Encrypting sensitive credit card numbers during transmission',
          'Safely retrying network requests without accidentally creating duplicate charges',
          'Speeding up TLS handshakes for webhook consumers',
          'Bypassing relational database locks in multi-threaded environments'
        ],
        correctIndex: 1,
        explanation: 'An idempotency key ensures that if a network drops or a timeout triggers a retry, the transaction is processed exactly once.'
      },
      {
        id: 5,
        question: 'What is the recommended approach to prevent SQL injection in modern Node.js applications?',
        options: [
          'Regex-stripping semicolons and quotation marks from raw query strings',
          'Using parameterized queries / prepared statements or a typed ORM like Prisma/Mongoose',
          'Converting all incoming request parameters to base64 strings',
          'Executing queries exclusively through client-side stored procedures'
        ],
        correctIndex: 1,
        explanation: 'Parameterized queries separate SQL code from user-supplied parameters, ensuring inputs are treated strictly as data literals.'
      }
    ]
  },
  {
    id: 'assessment-ai-prompting',
    title: 'Applied AI & RAG Architecture Fundamentals',
    trackCategory: 'AI & Data',
    duration: '15 mins',
    totalQuestions: 4,
    passingScore: 75,
    xpReward: 100,
    difficulty: 'Intermediate',
    questions: [
      {
        id: 1,
        question: 'In a Retrieval-Augmented Generation (RAG) system, what role does the Vector Database perform?',
        options: [
          'Generating natural language tokens through autoregressive attention',
          'Indexing semantic dense embeddings to retrieve contextually relevant document chunks',
          'Encrypting user chat transcripts before storing them on S3',
          'Replacing relational databases for user authentication and session management'
        ],
        correctIndex: 1,
        explanation: 'Vector databases perform Approximate Nearest Neighbor (ANN) search over embeddings to supply relevant context to the prompt.'
      },
      {
        id: 2,
        question: 'What is the key advantage of Low-Rank Adaptation (LoRA) over full model parameter fine-tuning?',
        options: [
          'It completely eliminates hallucination in LLM responses',
          'It freezes the base model weights and trains small adapter rank decomposition matrices, drastically reducing GPU VRAM requirements',
          'It increases the context window length from 8K to 1M tokens natively',
          'It works without requiring any labeled instruction dataset'
        ],
        correctIndex: 1,
        explanation: 'LoRA injects trainable rank decomposition matrices while freezing original parameters, achieving 90%+ VRAM savings during training.'
      },
      {
        id: 3,
        question: 'What is "Chunk Overlap" in document parsing for RAG pipelines?',
        options: [
          'A compression algorithm to reduce token costs',
          'Retaining a small sliding window of tokens between consecutive chunks to preserve semantic context across boundaries',
          'Allowing duplicate document uploads by multiple students',
          'Translating text into multiple languages simultaneously'
        ],
        correctIndex: 1,
        explanation: 'Chunk overlap prevents critical context or sentences from being cut in half across chunk divisions.'
      },
      {
        id: 4,
        question: 'Which metric is commonly used to measure the cosine angle between two embedding vectors?',
        options: ['Euclidean Distance (L2)', 'Cosine Similarity', 'Manhattan Distance (L1)', 'Hamming Distance'],
        correctIndex: 1,
        explanation: 'Cosine similarity measures the orientation of two vectors in multi-dimensional space, normalized between -1 and 1.'
      }
    ]
  }
];

export const initialProjects: Project[] = [
  {
    id: 'project-portfolio',
    title: 'Personal Engineer Portfolio with Proof-of-Work',
    category: 'Mini Project',
    stream: 'All Streams',
    difficulty: 'Beginner',
    duration: '3–5 days',
    summary: 'Design and deploy an Apple-styled personal portfolio highlighting verified skill badges, live GitHub repositories, and interactive project demos.',
    problemStatement: 'Recruiters spend under 30 seconds scanning resumes. Build an ultra-clean portfolio that proves your capabilities through real code artifacts and live deployments.',
    deliverables: ['Responsive web layout', 'Interactive project showcase drawer', 'Verifiable certificate badge embed', 'Lighthouse score > 95'],
    stack: ['Next.js', 'Tailwind CSS', 'Vercel'],
    xp: 150,
    submissionsCount: 84
  },
  {
    id: 'project-rag-assistant',
    title: 'Multi-Document AI Research Query Engine',
    category: 'Minor Project',
    stream: 'AI & Technology',
    difficulty: 'Intermediate',
    duration: '1–2 weeks',
    summary: 'Construct a serverless RAG pipeline capable of ingesting PDF technical blueprints, generating chunk embeddings, and answering student queries with verifiable citations.',
    problemStatement: 'Students struggle to quickly extract key facts from 50+ page technical specs. Create an intelligent assistant that synthesizes answers with source page numbers.',
    deliverables: ['PDF parsing and token chunking pipeline', 'Vector embedding storage in Pinecone/Chroma', 'Streaming answer generation with citations', 'Citation verification UI'],
    stack: ['Python', 'FastAPI', 'LangChain', 'OpenAI/Gemini API', 'React'],
    xp: 300,
    submissionsCount: 42
  },
  {
    id: 'project-saas-platform',
    title: 'Multi-Tenant Community Platform with RBAC',
    category: 'Major Project',
    stream: 'Technology & Business',
    difficulty: 'Advanced',
    duration: '3–4 weeks',
    summary: 'Architect a production-ready community and assessment platform featuring granular role-based access control (Student, Mentor, Admin), audit logging, and payment billing.',
    problemStatement: 'Institutions need modern student ecosystem software without vendor lock-in. Deliver an enterprise-ready architecture supporting thousands of concurrent learners.',
    deliverables: ['Secure JWT/OAuth authentication with RBAC', 'Administrative content studio & analytics dashboard', 'Automated test suite with CI/CD GitHub Actions', 'Containerized Docker deployment'],
    stack: ['Next.js', 'TypeScript', 'PostgreSQL', 'Prisma', 'Docker'],
    xp: 600,
    submissionsCount: 19
  }
];

export const initialEvents: EventItem[] = [
  {
    id: 'gfg-coding-clash-2026',
    title: 'GeeksforGeeks National Coding Clash 2026',
    organizer: 'GeeksforGeeks x BuildNext',
    type: 'Coding Contest',
    date: '2026-10-08',
    time: '07:00 PM – 09:30 PM IST',
    mode: 'Online',
    spotsTotal: 500,
    spotsFilled: 412,
    description: 'Official GeeksforGeeks partnered competitive programming contest. 4 algorithmic challenges of increasing difficulty. Minimum 400 registrations confirmed.',
    perks: [
      'Official Co-branded GFG Participation Certificates',
      'GeeksforGeeks Course Discount Coupons for all participants',
      'Direct interview shortlisting for GFG Content Setter Fellowships',
      'Leaderboard XP boosts on BuildNext'
    ],
    status: 'Filling Fast'
  },
  {
    id: 'unstop-national-hackathon',
    title: 'Unstop National Innovation Hackathon',
    organizer: 'Unstop x BuildNext',
    type: 'Hackathon',
    date: '2026-10-18',
    time: '48 Hours Non-Stop',
    mode: 'Hybrid',
    spotsTotal: 1000,
    spotsFilled: 780,
    description: '48-hour challenge across 4 tracks: Smart Automation, FinTech Rails, GenAI Applications, and Sustainable Systems. Open to multi-disciplinary student teams.',
    perks: [
      '₹1,50,000 Cash Prize Pool for top 3 teams',
      'Unstop National Recognition & Official Verified Badges',
      'Direct mentorship from Staff Engineers & Founders',
      'Fast-track interview opportunities with hiring partners'
    ],
    status: 'Open'
  },
  {
    id: 'elite-globex-demo-day',
    title: 'BuildNext x Elite Globex Industry Demo Day',
    organizer: 'Elite Globex',
    type: 'Demo Day',
    date: '2026-10-24',
    time: '04:00 PM – 07:00 PM IST',
    mode: 'Online',
    spotsTotal: 150,
    spotsFilled: 110,
    description: 'Top student project builders pitch their Minor & Major projects directly to Elite Globex engineering leadership for immediate paid internship offers.',
    perks: [
      'Pre-Placement Internship Offers (PPOs) announced live',
      '1-on-1 architecture feedback from VP of Engineering',
      'Featured project spotlight on BuildNext Showcase'
    ],
    status: 'Filling Fast'
  },
  {
    id: 'system-design-masterclass',
    title: 'Scalable Systems & API Design Masterclass',
    organizer: 'BuildNext Community',
    type: 'Workshop',
    date: '2026-10-02',
    time: '06:00 PM – 08:00 PM IST',
    mode: 'Online',
    spotsTotal: 300,
    spotsFilled: 260,
    description: 'Deep dive into database sharding, distributed cache invalidation, and microservices resilience by industry senior engineers.',
    perks: ['Interactive Architecture Canvas', 'Recording & Slide Deck Access', '+80 BuildNext XP'],
    status: 'Filling Fast'
  }
];

export const initialCertificates: Certificate[] = [
  {
    id: 'cert-1',
    certificateId: 'BN-2026-WD8921',
    studentName: 'Harsh Dixit',
    studentEmail: 'harsh@buildnext.local',
    trackName: 'Modern Web Development & Cloud Systems',
    category: 'Technology',
    issueDate: '2026-09-15',
    grade: 'Distinction',
    verified: true,
    credentialUrl: '/verify/BN-2026-WD8921'
  },
  {
    id: 'cert-2',
    certificateId: 'BN-2026-AI4410',
    studentName: 'Aarav Sharma',
    studentEmail: 'aarav.sharma@example.edu',
    trackName: 'Applied Artificial Intelligence & LLMs',
    category: 'AI & Data',
    issueDate: '2026-09-12',
    grade: 'Merit',
    verified: true,
    credentialUrl: '/verify/BN-2026-AI4410'
  },
  {
    id: 'cert-3',
    certificateId: 'BN-2026-UX7729',
    studentName: 'Priya Nair',
    studentEmail: 'priya.nair@example.edu',
    trackName: 'Product Experience & UI/UX Systems',
    category: 'Design',
    issueDate: '2026-09-18',
    grade: 'Distinction',
    verified: true,
    credentialUrl: '/verify/BN-2026-UX7729'
  }
];

export const initialMentors: Mentor[] = [
  {
    id: 'm-1',
    name: 'Ananya Deshmukh',
    role: 'Senior Staff Engineer',
    company: 'Google',
    domain: 'Distributed Systems & Cloud',
    experience: '9+ years',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=160&h=160&fit=crop&crop=face',
    bio: 'Leads cloud infrastructure efficiency at Google. Passionate about helping students understand real-world low-latency architecture and concurrency.',
    availableSlots: ['Tomorrow, 6:00 PM', 'Thursday, 7:30 PM', 'Saturday, 11:00 AM']
  },
  {
    id: 'm-2',
    name: 'Rohan Varma',
    role: 'Principal AI Researcher',
    company: 'Microsoft',
    domain: 'Generative AI & LLM Systems',
    experience: '8+ years',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=160&h=160&fit=crop&crop=face',
    bio: 'Specializes in small language model quantization, agent orchestration, and prompt engineering pipelines. Mentored 200+ students.',
    availableSlots: ['Wednesday, 5:00 PM', 'Friday, 6:30 PM']
  },
  {
    id: 'm-3',
    name: 'Siddharth Roy',
    role: 'Lead Product Manager',
    company: 'Zomato',
    domain: 'Product Strategy & Growth',
    experience: '7+ years',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=160&h=160&fit=crop&crop=face',
    bio: 'Guides students in turning technical builds into polished venture PRDs, customer journey funnels, and compelling startup pitches.',
    availableSlots: ['Tuesday, 7:00 PM', 'Saturday, 4:00 PM']
  }
];

// In-Memory Global Singleton with persistence across hot-reloads
declare global {
  var __buildnext_store: {
    tracks: Track[];
    opportunities: Opportunity[];
    applications: Application[];
    assessments: Assessment[];
    projects: Project[];
    events: EventItem[];
    certificates: Certificate[];
    mentors: Mentor[];
  } | undefined;
}

if (!global.__buildnext_store) {
  global.__buildnext_store = {
    tracks: [...initialTracks],
    opportunities: [...initialOpportunities],
    applications: [...initialApplications],
    assessments: [...initialAssessments],
    projects: [...initialProjects],
    events: [...initialEvents],
    certificates: [...initialCertificates],
    mentors: [...initialMentors],
  };
}

export const DataStore = {
  // Tracks
  getTracks: () => global.__buildnext_store!.tracks,
  getTrackById: (id: string) => global.__buildnext_store!.tracks.find(t => t.id === id),
  addTrack: (track: Track) => {
    global.__buildnext_store!.tracks.unshift(track);
    return track;
  },
  updateTrack: (id: string, updates: Partial<Track>) => {
    const idx = global.__buildnext_store!.tracks.findIndex(t => t.id === id);
    if (idx !== -1) {
      global.__buildnext_store!.tracks[idx] = { ...global.__buildnext_store!.tracks[idx], ...updates };
      return global.__buildnext_store!.tracks[idx];
    }
    return null;
  },
  deleteTrack: (id: string) => {
    global.__buildnext_store!.tracks = global.__buildnext_store!.tracks.filter(t => t.id !== id);
    return true;
  },

  // Opportunities
  getOpportunities: () => global.__buildnext_store!.opportunities,
  getOpportunityById: (id: string) => global.__buildnext_store!.opportunities.find(o => o.id === id),
  addOpportunity: (opp: Opportunity) => {
    global.__buildnext_store!.opportunities.unshift(opp);
    return opp;
  },
  updateOpportunity: (id: string, updates: Partial<Opportunity>) => {
    const idx = global.__buildnext_store!.opportunities.findIndex(o => o.id === id);
    if (idx !== -1) {
      global.__buildnext_store!.opportunities[idx] = { ...global.__buildnext_store!.opportunities[idx], ...updates };
      return global.__buildnext_store!.opportunities[idx];
    }
    return null;
  },
  deleteOpportunity: (id: string) => {
    global.__buildnext_store!.opportunities = global.__buildnext_store!.opportunities.filter(o => o.id !== id);
    return true;
  },

  // Applications
  getApplications: () => global.__buildnext_store!.applications,
  addApplication: (app: Application) => {
    global.__buildnext_store!.applications.unshift(app);
    // Increment opportunity applicant count
    const opp = global.__buildnext_store!.opportunities.find(o => o.id === app.opportunityId);
    if (opp) opp.applicantsCount += 1;
    return app;
  },
  updateApplicationStatus: (id: string, status: Application['status']) => {
    const item = global.__buildnext_store!.applications.find(a => a.id === id);
    if (item) {
      item.status = status;
      return item;
    }
    return null;
  },

  // Assessments
  getAssessments: () => global.__buildnext_store!.assessments,
  getAssessmentById: (id: string) => global.__buildnext_store!.assessments.find(a => a.id === id),
  addAssessment: (a: Assessment) => {
    global.__buildnext_store!.assessments.unshift(a);
    return a;
  },

  // Projects
  getProjects: () => global.__buildnext_store!.projects,
  addProject: (p: Project) => {
    global.__buildnext_store!.projects.unshift(p);
    return p;
  },

  // Events
  getEvents: () => global.__buildnext_store!.events,
  addEvent: (e: EventItem) => {
    global.__buildnext_store!.events.unshift(e);
    return e;
  },
  registerForEvent: (id: string) => {
    const event = global.__buildnext_store!.events.find(e => e.id === id);
    if (event && event.spotsFilled < event.spotsTotal) {
      event.spotsFilled += 1;
      return true;
    }
    return false;
  },

  // Certificates
  getCertificates: () => global.__buildnext_store!.certificates,
  getCertificateById: (certId: string) => {
    const norm = certId.trim().toUpperCase();
    return global.__buildnext_store!.certificates.find(
      c => c.certificateId.toUpperCase() === norm || c.id === certId
    );
  },
  issueCertificate: (cert: Certificate) => {
    global.__buildnext_store!.certificates.unshift(cert);
    return cert;
  },

  // Mentors
  getMentors: () => global.__buildnext_store!.mentors,

  // Platform Analytics
  getAnalytics: () => {
    return {
      totalStudents: 1420 + global.__buildnext_store!.applications.length * 3,
      activeLearners: 940,
      tracksCount: global.__buildnext_store!.tracks.length,
      opportunitiesCount: global.__buildnext_store!.opportunities.length,
      applicationsCount: global.__buildnext_store!.applications.length,
      certificatesIssued: global.__buildnext_store!.certificates.length,
      eventsScheduled: global.__buildnext_store!.events.length,
      gfgRegistrations: 412,
      elitePlacements: 18
    };
  }
};

