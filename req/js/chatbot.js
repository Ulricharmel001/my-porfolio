const ULRICH = {
    name: "Geyek Ulrich Armel Dahyebga",
    shortName: "Ulrich",
    email: "armelulrich16@gmail.com",
    linkedin: "https://linkedin.com/in/ulricharmel",
    github: "https://github.com/Ulricharmel001",
    title: "Python Backend Developer & AWS Solutions Architect",
    available: true,
    location: "Remote / Worldwide | Open for opportunities",
    responseTime: "24 hours",
    resume: "#", 
    personality: {
        tone: "thoughtful, direct, technically deep",
        philosophy: "API-first development & infrastructure as code",
        interests: "distributed systems, cloud architecture, backend optimization"
    }
};

// ===== EMAILJS CONFIG — Get from https://www.emailjs.com/ =====
const EMAILJS_CONFIG = {
    publicKey: "C2cKlQehgtsARLmSF", 
    serviceId: "service_ulrich", 
    templateId: "template_ad6wsdk"  
};

// ===== CONVERSATION STATE & MEMORY =====
let conversationState = {
    collectingContact: false,
    contactStep: null,
    visitorName: '',
    visitorEmail: '',
    visitorMessage: '',
    visitId: generateVisitId(),
    messageCount: 0,
    topicsExplored: [],
    userProfile: { seemsInterested: false, primaryInterest: null, isHiring: false },
    lastEngagementTime: Date.now(),
    conversationPhase: 'greeting'
};

function generateVisitId() {
    return 'visit_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// ===== KNOWLEDGE BASE WITH ENHANCED RESPONSES =====
const knowledge = {
    greetings: {
        patterns: ['hello', 'hi', 'hey', 'greetings', 'good morning', 'good afternoon', 'good evening', 'howdy', 'sup'],
        response: () => `👋 Hey there! I'm Ulrich's AI assistant. I can help you learn about his backend engineering work, AWS architecture expertise, or connect you directly with him.

**What would you like to know?**`,
        followups: ["Tell me about his skills", "Show me his projects", "How to contact him"]
    },

    about: {
        patterns: ['about', 'who is', 'tell me about', 'introduce', 'ulrich', 'geyek', 'dahyebga', 'background', 'profile', 'bio'],
        response: () => `${ULRICH.name} is a ${ULRICH.title} who builds production-grade backend systems and cloud-native applications.

**Key highlights:**
• Python/Django expert with deep API design experience
• AWS Solutions Architect focused on scalable infrastructure  
• Docker & containerization for consistent deployments
• CI/CD automation with GitHub Actions

Based in Cameroon, open to remote opportunities worldwide. ${ULRICH.available ? 'Currently available for contracts and full-time roles.' : ''}

What interests you most about his work?`,
        followups: ["Technical skills deep dive", "AWS architecture", "View projects", "Contact him"]
    },

    skills: {
        patterns: ['skill', 'expertise', 'technology', 'tech stack', 'what can he do', 'languages', 'frameworks', 'tools'],
        response: () => `<strong>💻 Core Technical Stack:</strong><br><br>
• <strong>Languages:</strong> Python (Advanced), SQL, JavaScript, Bash<br>
• <strong>Backend:</strong> Django, Django REST Framework, FastAPI, Flask<br>
• <strong>Cloud (AWS):</strong> EC2, S3, Lambda, RDS, ECS, VPC, IAM, CloudFormation<br>
• <strong>DevOps:</strong> Docker, Docker Compose, GitHub Actions, Nginx, Gunicorn<br>
• <strong>Databases:</strong> PostgreSQL, MySQL, Redis, SQLite<br>
• <strong>Tools:</strong> Git, pytest, Postman, Linux administration<br><br>

He goes deep in areas that matter for production systems. Want to know more about any specific area?`,
        followups: ["Python/Django depth", "AWS architecture", "DevOps & CI/CD", "Database design"]
    },

    aws: {
        patterns: ['aws', 'cloud', 'amazon', 'ec2', 's3', 'lambda', 'cloudformation', 'ecs', 'rds', 'vpc', 'iam', 'serverless'],
        response: () => `☁️ <strong>AWS Expertise:</strong><br><br>
Ulrich designs cloud-native systems with these AWS services:<br><br>
• <strong>Compute:</strong> EC2, Lambda (serverless), ECS (containers)<br>
• <strong>Storage:</strong> S3 with lifecycle policies, EBS<br>
• <strong>Databases:</strong> RDS (PostgreSQL), DynamoDB<br>
• <strong>Networking:</strong> VPC design with public/private subnets<br>
• <strong>Security:</strong> IAM least-privilege, KMS encryption, Secrets Manager<br>
• <strong>IaC:</strong> CloudFormation templates for repeatable infrastructure<br>
• <strong>Monitoring:</strong> CloudWatch, X-Ray tracing<br><br>

He believes infrastructure should be version-controlled and repeatable. No "click-ops" in production.

Interested in his approach to a specific AWS service?`,
        followups: ["Infrastructure as Code", "Security best practices", "Cost optimization", "Serverless architecture"]
    },

    django: {
        patterns: ['django', 'drf', 'django rest', 'rest framework', 'api design', 'serializer', 'viewset'],
        response: () => `🐍 <strong>Django & DRF Mastery:</strong><br><br>
Ulrich builds production-grade REST APIs with:<br><br>
• <strong>Custom Serializers:</strong> Complex validation, nested relationships<br>
• <strong>ViewSets & Routers:</strong> Clean, RESTful URL structures<br>
• <strong>Authentication:</strong> JWT, session auth, OAuth2 integration<br>
• <strong>Permissions:</strong> Granular access control per endpoint<br>
• <strong>Performance:</strong> select_related/prefetch_related, caching strategies<br>
• <strong>Testing:</strong> pytest with 85%+ coverage minimum<br>
• <strong>Documentation:</strong> OpenAPI/Swagger auto-generated docs<br><br>

His code emphasizes readability, maintainability, and follows Django best practices.

Want to see actual code examples or discuss a specific API challenge?`,
        followups: ["API authentication patterns", "Performance optimization", "Testing strategy", "Code examples"]
    },

    docker: {
        patterns: ['docker', 'container', 'containerization', 'dockerfile', 'docker-compose', 'image'],
        response: () => `🐳 <strong>Docker & Containerization:</strong><br><br>
Ulrich uses Docker to eliminate "works on my machine" problems:<br><br>
• <strong>Multi-stage builds:</strong> Lean production images<br>
• <strong>Docker Compose:</strong> Local dev with all services (app, db, redis, workers)<br>
• <strong>Security:</strong> Non-root users, minimal base images, vulnerability scanning<br>
• <strong>Production:</strong> Deployed via AWS ECS on Fargate<br><br>

"Containers should be ephemeral and immutable. If you're SSH-ing into containers to fix things, you're doing it wrong."

Want to know about his CI/CD pipeline or deployment strategy?`,
        followups: ["CI/CD pipeline", "AWS ECS deployment", "Security practices"]
    },

    cicd: {
        patterns: ['ci/cd', 'cicd', 'pipeline', 'github actions', 'deployment', 'automation', 'devops'],
        response: () => `⚙️ <strong>CI/CD Pipeline (GitHub Actions):</strong><br><br>
<strong>1. Lint & Audit:</strong> Black, Flake8, isort, Bandit security scan<br>
<strong>2. Test:</strong> Full pytest suite in clean container<br>
<strong>3. Build & Scan:</strong> Docker image with vulnerability scan<br>
<strong>4. Deploy:</strong> Push to ECR → Deploy to ECS with health checks<br><br>

"If it's not automated, it's broken." — Ulrich's philosophy on deployment.

The pipeline fails fast and rolls back automatically on failure.`,
        followups: ["Docker workflow", "AWS deployment", "Monitoring setup"]
    },

    database: {
        patterns: ['database', 'postgresql', 'postgres', 'mysql', 'redis', 'schema', 'query', 'orm', 'migration', 'index'],
        response: () => `🗄️ <strong>Database Expertise:</strong><br><br>
<strong>Relational (PostgreSQL/MySQL):</strong><br>
• Schema design with proper normalization<br>
• Query optimization using EXPLAIN ANALYZE<br>
• Strategic indexing based on read patterns<br>
• Django ORM mastery + raw SQL when needed<br><br>

<strong>Caching (Redis):</strong><br>
• Cache-aside pattern for frequent queries<br>
• Session storage, rate limiting<br>
• Proper invalidation strategies<br><br>

<strong>NoSQL (DynamoDB):</strong><br>
• High-throughput key-value access patterns<br>
• Access patterns first, then schema design<br><br>

He doesn't guess about performance—he measures then optimizes.`,
        followups: ["Query optimization examples", "Redis caching strategies", "Database design principles"]
    },

    projects: {
        patterns: ['project', 'portfolio', 'github', 'built', 'application', 'work sample', 'example', 'code'],
        response: () => `📁 <strong>Portfolio Projects:</strong><br><br>
Ulrich's GitHub showcases production-ready backend systems:<br><br>
• <strong>REST APIs:</strong> Full auth, pagination, OpenAPI docs, error handling<br>
• <strong>Cloud-Native Apps:</strong> Designed for AWS with serverless + containers<br>
• <strong>Automation:</strong> Deployment pipelines, backup scripts, infrastructure as code<br>
• <strong>Data Processing:</strong> Celery workers for async tasks, report generation<br><br>

<a href="${ULRICH.github}" target="_blank" style="color:var(--accent-blue);">→ Browse his GitHub repositories</a><br><br>

What type of project are you most interested in?`,
        followups: ["API design examples", "Infrastructure code", "View GitHub", "Contact him"]
    },

    contact: {
        patterns: ['contact', 'email', 'reach', 'hire', 'available', 'get in touch', 'linkedin', 'work with', 'opportunity', 'freelance', 'remote', 'connect', 'message'],
        response: () => `📬 <strong>Ways to connect with Ulrich:</strong><br><br>
• <strong>Email:</strong> <a href="mailto:${ULRICH.email}" style="color:var(--accent-blue);">${ULRICH.email}</a> (replies within ${ULRICH.responseTime})<br>
• <strong>LinkedIn:</strong> <a href="${ULRICH.linkedin}" target="_blank" style="color:var(--accent-blue);">Connect professionally</a><br>
• <strong>GitHub:</strong> <a href="${ULRICH.github}" target="_blank" style="color:var(--accent-blue);">View code</a><br><br>

<strong>Or send a message through me right now</strong> — I'll collect your details and forward them directly to his inbox.

What's your situation? (Hiring, freelance, collaboration, or just exploring?)`,
        followups: ["Send him a message", "I'm hiring", "Freelance project", "Just exploring"]
    },

    experience: {
        patterns: ['experience', 'work history', 'career', 'professional', 'years', 'senior', 'background'],
        response: () => `💼 <strong>Professional Approach:</strong><br><br>
Ulrich takes <strong>holistic ownership</strong> of systems:<br><br>
• Database schema → Query patterns → API design → Auth → Deployment → Monitoring<br>
• He thinks about trade-offs between ideal architecture and practical constraints<br>
• Reads AWS whitepapers to stay current with cloud best practices<br>
• Believes readable code is respect for the next developer<br><br>

<strong>Current Focus:</strong><br>
• ALX ProDev Backend Program (advanced Python/Django)<br>
• ALX Cloud Program (AWS architecture)<br>
• Building production-ready portfolio projects<br><br>

He's pragmatic, curious, and ready for challenging backend work.`,
        followups: ["Technical skills", "Recent projects", "Hire him", "View certifications"]
    },

    certifications: {
        patterns: ['certification', 'certificate', 'credential', 'aws certified', 'alx', 'education', 'degree', 'learning'],
        response: () => `📜 <strong>Education & Certifications:</strong><br><br>
<strong>In Progress:</strong><br>
• <strong>ALX ProDev Backend</strong> — Advanced Python backend engineering<br>
• <strong>ALX Cloud</strong> — AWS architecture & cloud-native patterns<br>
• <strong>Kubernetes (Linux Foundation)</strong> — Container orchestration<br>
• <strong>Computer Science degree</strong> — University of the People<br><br>

<strong>Completed:</strong><br>
• ALX Backend Development — Python, APIs, databases<br><br>

Ulrich believes certifications are evidence, not proof. The real credential is production code that doesn't catch fire.`,
        followups: ["Technical skills", "What he's built", "Contact him"]
    },

    security: {
        patterns: ['security', 'secure', 'auth', 'authentication', 'jwt', 'oauth', 'encryption', 'vulnerability'],
        response: () => `🔒 <strong>Security Approach:</strong><br><br>
<strong>Application Layer:</strong><br>
• JWT with refresh token rotation<br>
• RBAC implemented consistently<br>
• OWASP protection (SQL injection, XSS, CSRF)<br>
• Rate limiting for brute-force protection<br><br>

<strong>Cloud Layer (AWS):</strong><br>
• VPC isolation — private subnets<br>
• IAM least-privilege policies<br>
• KMS encryption at rest<br>
• Secrets Manager for sensitive data<br><br>

Security isn't an afterthought — it's woven into every design decision.`,
        followups: ["IAM best practices", "API auth design", "Incident response"]
    },

    performance: {
        patterns: ['performance', 'optimization', 'fast', 'speed', 'scale', 'scalable', 'load', 'latency', 'slow'],
        response: () => `⚡ <strong>Performance Philosophy:</strong><br><br>
"Measure, then Optimize" — no guessing about bottlenecks.<br><br>

<strong>Tools:</strong> Django Debug Toolbar, Silk, AWS X-Ray, CloudWatch<br><br>

<strong>Database:</strong> N+1 elimination, strategic indexes, query optimization<br>
<strong>Caching:</strong> Redis for frequent queries, CloudFront for static assets<br>
<strong>Scaling:</strong> Horizontal scaling, read replicas, connection pooling<br><br>

He can drop a 2-second query to 50ms with the right index.`,
        followups: ["Database optimization", "Caching strategies", "Load testing"]
    }
};

// ===== PROCESS MESSAGE WITH INTELLIGENT MATCHING =====
function processMessage(message) {
    const lower = message.toLowerCase().trim();
    conversationState.messageCount++;
    conversationState.lastEngagementTime = Date.now();

    // Update conversation phase
    if (conversationState.messageCount > 3) conversationState.conversationPhase = 'exploring';
    if (conversationState.messageCount > 6) conversationState.conversationPhase = 'engaged';

    // Handle contact form flow
    if (conversationState.collectingContact) return handleContactFlow(message);

    // Check for contact intent
    if (lower.includes('send him a message') || lower.includes('message him') || 
        lower === 'yes' && conversationState.userProfile.isHiring) {
        return startContactCollection();
    }

    // Detect hiring signals
    const hiringKeywords = ['hire', 'hiring', 'opportunity', 'role', 'position', 'contract', 'freelance', 'project'];
    if (hiringKeywords.some(kw => lower.includes(kw))) {
        conversationState.userProfile.isHiring = true;
    }

    // Find best matching knowledge topic
    let bestMatch = null;
    let bestScore = 0;
    
    for (const key of Object.keys(knowledge)) {
        const data = knowledge[key];
        let score = 0;
        for (const pattern of data.patterns) {
            if (lower.includes(pattern)) score += pattern.length;
        }
        if (score > bestScore) {
            bestScore = score;
            bestMatch = data;
            conversationState.userProfile.primaryInterest = key;
        }
    }

    if (bestMatch && bestScore > 0) {
        conversationState.topicsExplored.push(bestMatch);
        let response = typeof bestMatch.response === 'function' ? bestMatch.response() : bestMatch.response;
        
        // Add proactive engagement
        if (conversationState.conversationPhase === 'exploring' && conversationState.topicsExplored.length > 2) {
            response += `<br><br><em>💡 By the way — you can check out his GitHub for actual code, or send him a message directly. He responds within ${ULRICH.responseTime}.</em>`;
        }
        
        return { response, followups: bestMatch.followups || [] };
    }

    // Smart fallback responses
    const fallbacks = [
        `I focus on Ulrich's professional expertise. Ask me about his Python/Django work, AWS architecture, projects, or how to contact him.`,
        `That's outside my knowledge, but I can help with questions about his backend skills, cloud experience, or connecting you with him.`,
        `I'm best at answering questions about Ulrich's technical work. Want to know about his skills, projects, or how to reach him?`
    ];
    
    return { response: fallbacks[Math.floor(Math.random() * fallbacks.length)], followups: ["Technical skills", "AWS experience", "Contact him", "View projects"] };
}

// ===== CONTACT COLLECTION FLOW =====
function startContactCollection() {
    conversationState.collectingContact = true;
    conversationState.contactStep = 'name';
    return { response: `I'll help you get in touch with Ulrich. What's your name?`, followups: [] };
}

function handleContactFlow(message) {
    const step = conversationState.contactStep;

    if (step === 'name') {
        conversationState.visitorName = message.trim();
        conversationState.contactStep = 'email';
        return { response: `Thanks ${conversationState.visitorName}! What's your email address?`, followups: [] };
    }

    if (step === 'email') {
        const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(message.trim());
        if (!emailValid) return { response: `That doesn't look like a valid email. Could you try again?`, followups: [] };
        
        conversationState.visitorEmail = message.trim();
        conversationState.contactStep = 'message';
        return { response: `Great! What would you like to discuss with Ulrich? (Role, project, collaboration?)`, followups: [] };
    }

    if (step === 'message') {
        conversationState.visitorMessage = message.trim();
        sendContactEmail();
        conversationState.collectingContact = false;
        
        return { 
            response: `✅ Message sent! Ulrich will get back to you within ${ULRICH.responseTime}. 

In the meantime, want to explore more about his work?`,
            followups: ["Show his technical skills", "View projects", "Back to topics"]
        };
    }
    
    conversationState.collectingContact = false;
    return { response: `Want to try sending that message again?`, followups: ["Send message"] };
}

// ===== EMAILJS INTEGRATION =====
function sendContactEmail() {
    if (!EMAILJS_CONFIG.publicKey || !EMAILJS_CONFIG.serviceId || !EMAILJS_CONFIG.templateId) {
        console.warn('⚠️ EmailJS not configured. Set up at https://www.emailjs.com/');
        return;
    }
    
    if (typeof emailjs === 'undefined') {
        console.error('❌ EmailJS not loaded. Add: <script src="https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js"></script>');
        return;
    }
    
    emailjs.init(EMAILJS_CONFIG.publicKey);
    emailjs.send(EMAILJS_CONFIG.serviceId, EMAILJS_CONFIG.templateId, {
        from_name: conversationState.visitorName,
        reply_to: conversationState.visitorEmail,
        message: conversationState.visitorMessage,
        to_name: ULRICH.shortName,
        visit_id: conversationState.visitId
    }).then(() => console.log('✅ Message sent via EmailJS')).catch(err => console.error('EmailJS error:', err));
}

// ===== CHATBOT UI CONTROLLER =====
class ChatbotUI {
    constructor() {
        this.elements = {};
        this.isOpen = false;
        this.init();
    }
    
    init() {
        this.cacheElements();
        this.bindEvents();
        this.setupAutoResize();
    }
    
    cacheElements() {
        this.elements = {
            btn: document.getElementById('chatBtn'),
            popup: document.getElementById('chatPopup'),
            close: document.getElementById('closeChat'),
            send: document.getElementById('sendMessage'),
            input: document.getElementById('userMessage'),
            messages: document.getElementById('chatMessages'),
            launcher: document.getElementById('launchChatBtn')
        };
    }
    
    bindEvents() {
        if (this.elements.btn) this.elements.btn.addEventListener('click', () => this.toggle());
        if (this.elements.close) this.elements.close.addEventListener('click', () => this.close());
        if (this.elements.send) this.elements.send.addEventListener('click', (e) => { e.preventDefault(); this.sendMessage(); });
        if (this.elements.input) this.elements.input.addEventListener('keypress', (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); this.sendMessage(); } });
        if (this.elements.launcher) this.elements.launcher.addEventListener('click', (e) => { e.preventDefault(); this.open(); });
        
        // Suggestion chip delegation
        if (this.elements.messages) {
            this.elements.messages.addEventListener('click', (e) => {
                const chip = e.target.closest('.suggestion-chip');
                if (chip && this.elements.input) {
                    this.elements.input.value = chip.textContent;
                    this.sendMessage();
                }
            });
        }
    }
    
    setupAutoResize() {
        if (!this.elements.input) return;
        this.elements.input.addEventListener('input', function() {
            this.style.height = 'auto';
            this.style.height = Math.min(this.scrollHeight, 120) + 'px';
        });
    }
    
    toggle() { this.isOpen ? this.close() : this.open(); }
    
    open() {
        this.isOpen = true;
        this.elements.popup?.classList.add('active');
        this.elements.btn?.classList.add('active');
        document.body.style.overflow = 'hidden';
        if (!this.hasWelcomeMessage()) this.addWelcomeMessage();
        setTimeout(() => this.elements.input?.focus(), 100);
    }
    
    close() {
        this.isOpen = false;
        this.elements.popup?.classList.remove('active');
        this.elements.btn?.classList.remove('active');
        document.body.style.overflow = '';
    }
    
    hasWelcomeMessage() {
        return this.elements.messages?.querySelector('.welcome-message') !== null;
    }
    
    addWelcomeMessage() {
        this.addMessage(`👋 Hey! I'm Ulrich's AI assistant. I can help you learn about his backend engineering work, AWS architecture expertise, or connect you directly with him.

**What would you like to know?**`, 'bot', true);
        this.showSuggestions(["Tell me about his skills", "AWS expertise", "Contact him", "View projects"]);
    }
    
    addMessage(message, sender, isWelcome = false) {
        if (!this.elements.messages) return;
        
        const div = document.createElement('div');
        div.className = `chat-message ${sender}${isWelcome ? ' welcome-message' : ''}`;
        
        const avatarSVG = `<div class="bot-avatar"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.832-1.438A9.96 9.96 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2z"/><circle cx="9" cy="9" r="1"/><circle cx="15" cy="9" r="1"/><path d="M8 13a8 8 0 008 0"/></svg></div>`;
        
        div.innerHTML = sender === 'bot' ? `${avatarSVG}<div class="message-content">${message}</div>` : `<div class="message-content">${this.escapeHtml(message)}</div>`;
        
        this.elements.messages.appendChild(div);
        this.elements.messages.scrollTop = this.elements.messages.scrollHeight;
    }
    
    showSuggestions(chips) {
        this.hideSuggestions();
        if (!this.elements.messages) return;
        
        const dock = document.createElement('div');
        dock.id = 'suggestionsDock';
        dock.className = 'suggestions-dock';
        
        const bar = document.createElement('div');
        bar.className = 'persistent-suggestions';
        
        chips.forEach(label => {
            const chip = document.createElement('button');
            chip.className = 'suggestion-chip';
            chip.textContent = label;
            bar.appendChild(chip);
        });
        
        dock.appendChild(bar);
        this.elements.messages.appendChild(dock);
        this.elements.messages.scrollTop = this.elements.messages.scrollHeight;
    }
    
    hideSuggestions() {
        document.getElementById('suggestionsDock')?.remove();
    }
    
    showTyping() {
        this.hideTyping();
        if (!this.elements.messages) return;
        
        const div = document.createElement('div');
        div.className = 'chat-message bot typing';
        div.id = 'typing-indicator';
        div.innerHTML = `<div class="bot-avatar"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.832-1.438A9.96 9.96 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2z"/><circle cx="9" cy="9" r="1"/><circle cx="15" cy="9" r="1"/><path d="M8 13a8 8 0 008 0"/></svg></div><div class="typing-dots"><span></span><span></span><span></span></div>`;
        
        this.elements.messages.appendChild(div);
        this.elements.messages.scrollTop = this.elements.messages.scrollHeight;
    }
    
    hideTyping() {
        document.getElementById('typing-indicator')?.remove();
    }
    
    async sendMessage() {
        const message = this.elements.input?.value.trim();
        if (!message) return;
        
        this.addMessage(message, 'user');
        this.elements.input.value = '';
        this.elements.input.style.height = 'auto';
        this.hideSuggestions();
        this.showTyping();
        
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 600 + Math.random() * 400));
        
        const result = processMessage(message);
        this.hideTyping();
        this.addMessage(result.response, 'bot');
        
        if (!conversationState.collectingContact) {
            this.showSuggestions(result.followups);
        }
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
    window.chatbot = new ChatbotUI();
    console.log('✅ Chatbot initialized successfully');
});