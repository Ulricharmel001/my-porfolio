// ===== AI CHATBOT - PORTFOLIO VERSION =====
console.log('chatbot-fix.js loaded');

// ===== YOUR DETAILS — update these =====
const ULRICH = {
    name: "Geyek Ulrich Armel Dahyebga",
    shortName: "Ulrich",
    email: "ulrich@example.com",
    linkedin: "https://linkedin.com/in/your-username",
    github: "https://github.com/your-username",
    title: "Python Backend Developer & AWS Solutions Architect",
    available: true,
    location: "Remote / Cameroon"
};

// ===== EMAILJS CONFIG — fill in after creating account at emailjs.com =====
const EMAILJS_CONFIG = {
    publicKey: "YOUR_PUBLIC_KEY",
    serviceId: "YOUR_SERVICE_ID",
    templateId: "YOUR_TEMPLATE_ID"
};

// ===== CONVERSATION STATE =====
let conversationState = {
    collectingContact: false,
    contactStep: null,   // 'name' | 'email' | 'message'
    visitorName: '',
    visitorEmail: '',
    visitorMessage: ''
};

// ===== KNOWLEDGE BASE =====
const knowledge = {

    greetings: {
        patterns: ['hello', 'hi', 'hey', 'greetings', 'good morning', 'good afternoon', 'good evening', 'howdy', 'sup'],
        response: () => `Hey! Good to have you here. I'm Ulrich's assistant — I can walk you through his background, technical skills, projects, or help you get in touch with him directly. What are you looking to find out?`,
        followups: ["What's his tech stack?", "Tell me about his experience", "I'd like to contact him", "Show me his projects"]
    },

    about: {
        patterns: ['about', 'who is', 'tell me about', 'introduce', 'ulrich', 'geyek', 'dahyebga', 'who are you', 'background'],
        response: () => `${ULRICH.name} is a ${ULRICH.title} based in ${ULRICH.location}.<br><br>
He builds backend systems that are reliable, scalable, and well-documented — the kind of code that other developers actually enjoy working with. His stack centers on Python and Django for the application layer, AWS for infrastructure, and PostgreSQL as the primary database.<br><br>
What sets him apart is that he covers both the application and infrastructure sides. Most backend developers hand off to DevOps for cloud work — Ulrich handles both, which means he can design, build, and deploy a complete system end-to-end.<br><br>
He's currently open to remote backend engineering roles and freelance contracts.`,
        followups: ["What's his full skill set?", "Tell me about his AWS experience", "I want to work with him", "What has he built?"]
    },

    contact: {
        patterns: ['contact', 'email', 'reach', 'hire', 'available', 'get in touch', 'linkedin', 'work with', 'opportunity', 'freelance', 'remote', 'connect', 'message him', 'talk to him'],
        response: () => `You can reach Ulrich directly through any of these:<br><br>
<strong>Email:</strong> <a href="mailto:${ULRICH.email}" style="color:inherit;">${ULRICH.email}</a><br>
<strong>LinkedIn:</strong> <a href="${ULRICH.linkedin}" target="_blank" style="color:inherit;">${ULRICH.linkedin}</a><br>
<strong>GitHub:</strong> <a href="${ULRICH.github}" target="_blank" style="color:inherit;">${ULRICH.github}</a><br><br>
Or if you'd prefer, I can take your name and message and send it to him right now. He typically replies within 24–48 hours. Want to do that?`,
        followups: ["Yes, send him a message", "What roles is he open to?", "Tell me about his skills first"]
    },

    backend: {
        patterns: ['backend', 'python', 'django', 'api', 'rest', 'flask', 'fastapi', 'drf', 'django rest', 'server', 'endpoint'],
        response: () => `Python backend engineering is where Ulrich spends most of his time. His primary framework is Django with Django REST Framework, which he uses to build production-grade REST APIs.<br><br>
<strong>What that looks like day-to-day:</strong><br>
He designs APIs with proper resource naming, versioning, and authentication from the start — not retrofitted later. He uses DRF's ViewSets and Serializers, custom permission classes, JWT authentication with refresh token rotation, and throttling to protect endpoints.<br><br>
<strong>Performance is always on his mind:</strong><br>
He catches N+1 query issues early using Django Debug Toolbar, eliminates them with <code>select_related()</code> and <code>prefetch_related()</code>, adds Redis caching for expensive reads, and uses Celery for async tasks like emails and report generation.<br><br>
<strong>Code quality standards he holds himself to:</strong><br>
PEP 8 compliance, pytest test coverage, type hints throughout, and API documentation via Swagger/OpenAPI before the endpoint ships.<br><br>
He's also comfortable with Flask and FastAPI for lighter services where Django's structure isn't needed.`,
        followups: ["How does he handle API security?", "Tell me about databases", "What about AWS deployment?", "Show me his full stack"]
    },

    aws: {
        patterns: ['aws', 'cloud', 'amazon', 'ec2', 's3', 'lambda', 'cloudformation', 'ecs', 'rds', 'dynamodb', 'vpc', 'iam', 'cloudfront', 'route53', 'serverless', 'infrastructure'],
        response: () => `AWS is the other half of Ulrich's expertise. He approaches cloud infrastructure as an architect — thinking about how services connect, where failures can happen, and how to keep costs reasonable.<br><br>
<strong>Compute:</strong> EC2 with Auto Scaling Groups for long-running workloads, Lambda for event-driven functions, ECS with Fargate for containerized services.<br><br>
<strong>Storage and databases:</strong> S3 for object storage with lifecycle rules and presigned URLs, RDS PostgreSQL in Multi-AZ for production reliability, DynamoDB for high-throughput access patterns, ElastiCache Redis for caching.<br><br>
<strong>Networking and security:</strong> VPC design with public/private subnet separation, IAM with least-privilege roles for every service, Security Groups as the first network defense, CloudFront for CDN distribution, Route53 for DNS and health-check-based routing.<br><br>
<strong>His approach to cost:</strong> He right-sizes instances, uses Spot for stateless workloads, and chooses S3 Intelligent-Tiering where access patterns are unpredictable. Cloud bills are part of architecture decisions, not someone else's problem.<br><br>
He's currently working toward formal AWS certification to complement his hands-on experience.`,
        followups: ["How does he secure AWS environments?", "Tell me about his DevOps workflow", "What certifications does he have?", "Python plus AWS?"]
    },

    database: {
        patterns: ['database', 'sql', 'postgresql', 'postgres', 'mysql', 'redis', 'schema', 'query', 'orm', 'migration', 'index', 'dynamodb', 'nosql'],
        response: () => `Database work is something Ulrich takes seriously — it's where performance is won or lost in most backend systems.<br><br>
<strong>PostgreSQL</strong> is his primary database. He designs schemas with normalization in mind, knows when denormalization is worth the trade-off, and writes indexes that actually match query patterns. He uses <code>EXPLAIN ANALYZE</code> to validate execution plans and rewrites queries that cause sequential scans on large tables.<br><br>
<strong>Django ORM:</strong> He uses it properly — <code>select_related()</code> and <code>prefetch_related()</code> to eliminate N+1 problems, bulk operations for batch processing, custom QuerySets for reusable logic, and database-level constraints for data integrity.<br><br>
<strong>Redis</strong> handles the speed layer: cache-aside pattern with sensible TTLs, session storage moved out of the database, pub/sub for real-time messaging, and atomic operations for rate limiting.<br><br>
He's also comfortable with MySQL and DynamoDB when the project calls for it.`,
        followups: ["How does he optimize slow queries?", "Tell me about Redis caching", "What's his full backend stack?"]
    },

    docker: {
        patterns: ['docker', 'container', 'containerization', 'dockerfile', 'docker-compose', 'compose', 'image'],
        response: () => `Docker is part of Ulrich's standard workflow, not an optional extra.<br><br>
He writes multi-stage Dockerfiles to separate build dependencies from the final image, keeping production images lean. Layer ordering is intentional to maximize cache reuse. Containers run as non-root users. Health checks are included so orchestrators know when a container is actually ready.<br><br>
<strong>Local development:</strong> Docker Compose brings up the full stack — Django, PostgreSQL, Redis, Nginx — with a single command. Volume mounts give hot-reloading during development. Services start in the right order via health-check conditions.<br><br>
<strong>Production:</strong> Images are tagged with git SHAs for traceability, pushed to ECR or Docker Hub, and deployed via ECS Fargate or EC2. He scans images for known vulnerabilities before they go to production.<br><br>
The goal is simple: if it runs locally in the container, it runs exactly the same way in staging and production.`,
        followups: ["Tell me about CI/CD pipelines", "How does this connect to AWS?", "What's the full deployment workflow?"]
    },

    cicd: {
        patterns: ['ci/cd', 'cicd', 'pipeline', 'github actions', 'continuous integration', 'continuous deployment', 'devops', 'automation', 'deploy', 'deployment', 'workflow'],
        response: () => `Ulrich sets up CI/CD pipelines so that deployments are boring — automated, predictable, and reversible if something goes wrong.<br><br>
His pipelines on GitHub Actions typically run in stages:<br><br>
<strong>Code quality:</strong> linting with flake8, formatting check with black, security scanning with bandit, dependency audit. Anything that fails here blocks the pipeline immediately.<br><br>
<strong>Testing:</strong> pytest runs against a real PostgreSQL instance spun up in the pipeline, not a mock. Coverage must meet a minimum threshold or the build fails.<br><br>
<strong>Build:</strong> Docker image built, tagged with the git SHA, scanned for vulnerabilities, pushed to the container registry.<br><br>
<strong>Deploy:</strong> Environment-specific config injected via GitHub Secrets. Database migrations run pre-deployment. Smoke tests run after. If health checks fail, the pipeline rolls back automatically.<br><br>
He uses separate environments — dev deploys on every push to main, staging on PR merge, production behind a manual approval gate.`,
        followups: ["Tell me about Docker", "What testing frameworks does he use?", "How does he handle production failures?"]
    },

    security: {
        patterns: ['security', 'secure', 'auth', 'authentication', 'authorization', 'jwt', 'token', 'oauth', 'permission', 'vulnerability', 'https', 'ssl'],
        response: () => `Security is built into how Ulrich works — not a checklist at the end.<br><br>
<strong>API authentication:</strong> JWT with access and refresh token rotation, Django's permission system for object-level access control, rate limiting to block brute-force attempts, OAuth2 for third-party auth flows.<br><br>
<strong>Data protection:</strong> Secrets managed via environment variables or AWS Secrets Manager — never hardcoded, never committed. Django's ORM as a natural guard against SQL injection. Input validation at the serializer layer before anything touches the database. HTTPS enforced with HSTS headers.<br><br>
<strong>AWS security posture:</strong> IAM roles with least-privilege — every service gets only what it needs. KMS encryption at rest for sensitive data. Databases never in public subnets. CloudTrail for API call auditing.`,
        followups: ["Tell me about AWS IAM specifically", "How does he handle Django permissions?", "What about database security?"]
    },

    performance: {
        patterns: ['performance', 'optimize', 'optimization', 'fast', 'speed', 'slow', 'scale', 'scalable', 'load', 'traffic', 'bottleneck'],
        response: () => `Performance work starts with measurement — Ulrich doesn't optimize based on guesses.<br><br>
<strong>Finding the problem:</strong> Django Debug Toolbar in development to catch N+1 queries as they're written. django-silk in staging for profiling under real request patterns. <code>EXPLAIN ANALYZE</code> on queries that look suspicious.<br><br>
<strong>Database fixes:</strong> Strategic indexing aligned to actual query patterns, query rewriting to avoid sequential scans, connection pooling with PgBouncer for high-concurrency scenarios, read replicas for read-heavy workloads.<br><br>
<strong>Caching:</strong> Redis cache-aside pattern for expensive reads with TTLs that match data volatility. Cache warming before predictable traffic spikes.<br><br>
<strong>Infrastructure scaling:</strong> Stateless Django apps horizontally scaled behind a load balancer. AWS Auto Scaling Groups responding to actual CPU and request metrics.`,
        followups: ["Tell me about his database skills", "How does Redis caching work in his stack?", "What AWS services does he use for scaling?"]
    },

    skills: {
        patterns: ['skill', 'expertise', 'technology', 'tool', 'stack', 'technical', 'tech stack', 'what can he do', 'what does he know', 'languages', 'frameworks'],
        response: () => `Here's the full picture of Ulrich's technical toolkit:<br><br>
<strong>Languages:</strong> Python (primary, advanced), SQL, JavaScript, Bash/Shell<br><br>
<strong>Frameworks and libraries:</strong> Django, Django REST Framework, Celery, pytest, Flask, FastAPI<br><br>
<strong>Databases:</strong> PostgreSQL (primary), MySQL, Redis, DynamoDB<br><br>
<strong>AWS services:</strong> EC2, S3, Lambda, RDS, ECS, VPC, IAM, CloudFront, Route53, SQS, SNS, ElastiCache<br><br>
<strong>DevOps and tooling:</strong> Docker, Docker Compose, GitHub Actions, Nginx, Gunicorn, Linux server administration, Git<br><br>
<strong>Development tools:</strong> Postman, Swagger/OpenAPI, VS Code, AWS CLI<br><br>
He's comfortable owning a project from initial schema design through to a deployed, monitored production environment on AWS.`,
        followups: ["Deep dive into Python and Django", "Tell me about AWS skills", "What projects use this stack?", "Is he available for work?"]
    },

    projects: {
        patterns: ['project', 'portfolio', 'github', 'application', 'app', 'built', 'what has he made', 'demo', 'work sample', 'example'],
        response: () => `Ulrich's project work spans the full backend and cloud stack:<br><br>
<strong>REST API systems:</strong> Full-featured Django REST Framework APIs with JWT authentication, role-based access control, pagination, filtering, and Swagger documentation. Designed for real-world consumption — not just functional, but pleasant to integrate with.<br><br>
<strong>Cloud-native deployments:</strong> Django applications on AWS EC2 with Auto Scaling, S3 for media storage with presigned upload URLs, RDS PostgreSQL in Multi-AZ, Lambda functions for background processing.<br><br>
<strong>Containerized infrastructure:</strong> Docker and Compose local development stacks, CI/CD pipelines on GitHub Actions with automated testing and deployment to ECS or EC2.<br><br>
<strong>Database-driven systems:</strong> Optimized PostgreSQL schemas with indexing strategies, Redis caching layers, Celery task queues for async operations.<br><br>
Head to the GitHub section of this portfolio to see the actual repositories and code.`,
        followups: ["What's his tech stack?", "Tell me about his AWS experience", "How do I contact him about a project?"]
    },

    experience: {
        patterns: ['experience', 'work history', 'career', 'professional', 'how long', 'years of experience'],
        response: () => `Ulrich is a ${ULRICH.title}.<br><br>
What he brings to a team: full ownership of the backend layer — from the database schema through to a deployed, monitored API. He thinks about cloud architecture at the same time as application architecture, which means infrastructure concerns don't come as a surprise at the end of a project.<br><br>
<strong>His working style:</strong> He writes code that future teammates can understand. Documentation and tests are part of the work, not things added later. He surfaces blockers early rather than quietly struggling.<br><br>
He's comfortable in async, remote-first environments and is open to full-time remote roles, contracts, and freelance backend projects.`,
        followups: ["What's his full skill set?", "See his projects", "How do I get in touch?", "Tell me about his AWS experience"]
    },

    certifications: {
        patterns: ['certification', 'certificate', 'credential', 'aws certified', 'qualification', 'alx', 'program', 'course', 'training', 'education', 'degree', 'study'],
        response: () => `Ulrich has completed two intensive programs:<br><br>
<strong>ALX ProDev Backend Program</strong> — A rigorous, project-driven program covering advanced Python, Django and DRF at production depth, database design, REST API architecture, testing practices, and peer code review. Real deliverables, real deadlines.<br><br>
<strong>ALX Cloud Program</strong> — Hands-on cloud architecture training focused on AWS core services, cloud-native design patterns, security and compliance, and cost optimization.<br><br>
He's actively working toward formal AWS certification — not for the badge, but to systematize and validate his hands-on experience.`,
        followups: ["Tell me about his AWS knowledge", "What's his educational approach?", "What projects did training produce?"]
    },

    linux: {
        patterns: ['linux', 'unix', 'server', 'bash', 'shell', 'terminal', 'ssh', 'nginx', 'gunicorn', 'systemd'],
        response: () => `Ulrich is comfortable running production servers — not just deploying to managed platforms, but actually administering Linux boxes.<br><br>
Ubuntu/Debian configuration, SSH key-based authentication with password auth disabled, UFW firewall rules, systemd service management for Django processes, Gunicorn as the WSGI server with Nginx as a reverse proxy handling SSL termination and static file serving.<br><br>
He also writes shell scripts for deployment automation, database backups with S3 upload and rotation, and environment setup.`,
        followups: ["Tell me about Docker", "How does he deploy to AWS?", "What's the CI/CD pipeline?"]
    },

    interests: {
        patterns: ['interest', 'passion', 'hobby', 'like', 'love', 'enjoy', 'outside work', 'human side', 'personal'],
        response: () => `Outside the code, Ulrich is genuinely fascinated by distributed systems — specifically how data stays consistent when any component can fail at any time. The kind of problem that doesn't have a clean answer.<br><br>
He reads AWS architectural whitepapers for enjoyment, and is particularly drawn to the tension between elegant architecture and realistic cost constraints. Most teams can't build the ideal system, so the interesting question is what trade-offs make sense.<br><br>
He also cares about clean code as a form of communication — readable code is something the next developer has to live with, and that matters to him.`,
        followups: ["What's his tech stack?", "Tell me about his projects", "How do I contact him?"]
    },

    blog: {
        patterns: ['blog', 'article', 'post', 'writing', 'content', 'tutorial', 'guide', 'read'],
        response: () => `Ulrich writes about the things he's actively working through — backend engineering patterns, AWS architecture decisions, database optimization, Docker and deployment workflows, Python specifics.<br><br>
His writing philosophy: write the article that he wished existed when he was learning something. That means real code examples, specific configurations, and honest discussion of trade-offs rather than surface-level overviews.<br><br>
Check the Blog section of this portfolio for his published work.`,
        followups: ["Tell me about his technical skills", "See his projects", "Contact him"]
    }
};

// ===== PROCESS MESSAGE =====
function processMessage(message) {
    const lower = message.toLowerCase().trim();

    // Handle multi-step contact form
    if (conversationState.collectingContact) {
        return handleContactFlow(message);
    }

    // Trigger contact collection
    if (
        lower.includes('send him a message') ||
        lower.includes('yes send') ||
        lower.includes('leave a message') ||
        lower.includes('drop a message') ||
        lower.includes('send message') ||
        lower.includes('message him') ||
        lower === 'yes' ||
        lower === 'yes please' ||
        lower === 'sure'
    ) {
        return startContactCollection();
    }

    // Score-based matching
    let bestMatch = null;
    let bestScore = 0;

    for (const key of Object.keys(knowledge)) {
        const data = knowledge[key];
        let score = 0;
        for (const pattern of data.patterns) {
            if (lower.includes(pattern)) {
                score += pattern.length;
            }
        }
        if (score > bestScore) {
            bestScore = score;
            bestMatch = data;
        }
    }

    if (bestMatch && bestScore > 0) {
        return {
            response: typeof bestMatch.response === 'function' ? bestMatch.response() : bestMatch.response,
            followups: bestMatch.followups || []
        };
    }

    const defaults = [
        `I didn't quite catch that. You can ask me about Ulrich's technical skills, AWS experience, projects, certifications, or how to get in touch with him.`,
        `Not sure I followed that one. Try asking about his backend engineering work, cloud infrastructure, specific tools he uses, or his availability for projects.`,
        `I'm best at answering questions about Ulrich's background and work. Ask me about Python and Django, AWS architecture, databases, DevOps, or contact details.`
    ];
    return {
        response: defaults[Math.floor(Math.random() * defaults.length)],
        followups: ["Backend skills", "AWS experience", "Contact him", "View projects"]
    };
}

// ===== CONTACT COLLECTION FLOW =====
function startContactCollection() {
    conversationState.collectingContact = true;
    conversationState.contactStep = 'name';
    conversationState.visitorName = '';
    conversationState.visitorEmail = '';
    conversationState.visitorMessage = '';
    return { response: `Sure. What's your name?`, followups: [] };
}

function handleContactFlow(message) {
    const step = conversationState.contactStep;

    if (step === 'name') {
        conversationState.visitorName = message.trim();
        conversationState.contactStep = 'email';
        return { response: `Nice to meet you, ${conversationState.visitorName}. What's your email address so Ulrich can reply?`, followups: [] };
    }

    if (step === 'email') {
        const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(message.trim());
        if (!emailValid) {
            return { response: `That doesn't look like a valid email address. Could you double-check it?`, followups: [] };
        }
        conversationState.visitorEmail = message.trim();
        conversationState.contactStep = 'message';
        return { response: `Got it. And what would you like to say to Ulrich?`, followups: [] };
    }

    if (step === 'message') {
        conversationState.visitorMessage = message.trim();
        conversationState.collectingContact = false;
        conversationState.contactStep = null;
        sendViaEmailJS();
        return {
            response: `Thanks, ${conversationState.visitorName}. Your message has been sent to Ulrich. He usually responds within 24–48 hours. Is there anything else I can help you with?`,
            followups: ["Tell me about his skills", "See his projects", "His contact details"]
        };
    }

    // Fallback — reset if something went wrong
    conversationState.collectingContact = false;
    conversationState.contactStep = null;
    return { response: `Something went wrong on my end. Want to try again?`, followups: ["Yes, send him a message"] };
}

// ===== EMAILJS SEND =====
function sendViaEmailJS() {
    if (
        EMAILJS_CONFIG.publicKey === 'YOUR_PUBLIC_KEY' ||
        EMAILJS_CONFIG.serviceId === 'YOUR_SERVICE_ID' ||
        EMAILJS_CONFIG.templateId === 'YOUR_TEMPLATE_ID'
    ) {
        console.warn('EmailJS not configured. Fill in EMAILJS_CONFIG at the top of chatbot-fix.js');
        return;
    }

    if (typeof emailjs === 'undefined') {
        console.error('EmailJS SDK not loaded. Add this to your HTML <head>:\n<script src="https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js"><\/script>');
        return;
    }

    emailjs.init(EMAILJS_CONFIG.publicKey);

    emailjs.send(EMAILJS_CONFIG.serviceId, EMAILJS_CONFIG.templateId, {
        from_name: conversationState.visitorName,
        reply_to: conversationState.visitorEmail,
        message: conversationState.visitorMessage,
        to_name: ULRICH.shortName
    }).then(
        () => console.log('Message sent via EmailJS'),
        (err) => console.error('EmailJS error:', JSON.stringify(err))
    );
}

// ===== CHATBOT INIT =====
function initializeChatbot() {
    const chatBtn      = document.getElementById('chatBtn');
    const chatPopup    = document.getElementById('chatPopup');
    const closeChat    = document.getElementById('closeChat');
    const sendMessage  = document.getElementById('sendMessage');
    const userMessage  = document.getElementById('userMessage');
    const chatMessages = document.getElementById('chatMessages');

    if (!chatBtn || !chatPopup) { console.warn('Chat elements not found'); return; }

    let isOpen = false;

    function openChat() {
        isOpen = true;
        chatPopup.classList.add('active');
        chatBtn.classList.add('active');
        toggleIcon(true);
        document.body.classList.add('chat-open');
        if (chatMessages && !chatMessages.querySelector('.chat-message')) {
            addWelcomeMessage();
        }
    }

    function closeChat2() {
        isOpen = false;
        chatPopup.classList.remove('active');
        chatBtn.classList.remove('active');
        toggleIcon(false);
        document.body.classList.remove('chat-open');
    }

    function toggleIcon(open) {
        const openIcon   = chatBtn.querySelector('.close-icon');
        const closedIcon = chatBtn.querySelector('.chat-icon');
        if (openIcon && closedIcon) {
            closedIcon.style.display = open ? 'none' : 'block';
            openIcon.style.display   = open ? 'block' : 'none';
        }
    }

    chatBtn.addEventListener('click', () => isOpen ? closeChat2() : openChat());
    if (closeChat) closeChat.addEventListener('click', closeChat2);

    if (chatMessages) {
        chatMessages.addEventListener('click', (e) => {
            if (e.target.classList.contains('suggestion-chip')) {
                const msg = e.target.textContent;
                if (userMessage) userMessage.value = msg;
                hideSuggestions();
                handleSend();
            }
        });
    }

    function handleSend() {
        const message = userMessage?.value?.trim();
        if (!message) return;

        addMessage(message, 'user');
        userMessage.value = '';
        hideSuggestions();
        showTyping();

        const delay = 600 + Math.random() * 700;
        setTimeout(() => {
            const result = processMessage(message);
            hideTyping();
            addMessage(result.response, 'bot');
            if (chatMessages) chatMessages.scrollTop = chatMessages.scrollHeight;
            // Don't show suggestion chips mid-form
            if (!conversationState.collectingContact) {
                showSuggestions(result.followups);
            }
        }, delay);
    }

    if (sendMessage) sendMessage.addEventListener('click', (e) => { e.preventDefault(); handleSend(); });
    if (userMessage) {
        userMessage.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
        });
    }
}

// ===== MESSAGE RENDERING =====
function addMessage(message, sender) {
    const chatMessages = document.getElementById('chatMessages');
    if (!chatMessages) return;

    const div = document.createElement('div');
    div.className = `chat-message ${sender}`;

    const avatarSVG = `<div class="bot-avatar"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.832-1.438A9.96 9.96 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2z"/><circle cx="9" cy="9" r="1"/><circle cx="15" cy="9" r="1"/><path d="M8 13a8 8 0 008 0"/></svg></div>`;

    div.innerHTML = sender === 'bot'
        ? `${avatarSVG}<div class="message-content">${message}</div>`
        : `<div class="message-content">${message}</div>`;

    chatMessages.appendChild(div);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function addWelcomeMessage() {
    addMessage(`Hey! I'm Ulrich's assistant. Ask me about his skills, experience, or projects — or I can help you get in touch with him directly.`, 'bot');
    showSuggestions(["What's his tech stack?", "AWS experience", "I'd like to contact him", "See his projects"]);
}

// ===== SUGGESTIONS =====
function showSuggestions(chips) {
    const defaults = ["Backend skills", "AWS experience", "Contact him", "View projects"];
    const list = (chips && chips.length) ? chips : defaults;

    hideSuggestions();
    const chatMessages = document.getElementById('chatMessages');
    if (!chatMessages) return;

    const dock = document.createElement('div');
    dock.id = 'suggestionsDock';
    dock.className = 'suggestions-dock';

    const bar = document.createElement('div');
    bar.className = 'persistent-suggestions';

    list.forEach(label => {
        const chip = document.createElement('button');
        chip.className = 'suggestion-chip';
        chip.type = 'button';
        chip.textContent = label;
        bar.appendChild(chip);
    });

    dock.appendChild(bar);
    chatMessages.appendChild(dock);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function hideSuggestions() {
    const dock = document.getElementById('suggestionsDock');
    if (dock) dock.remove();
}

// ===== TYPING INDICATOR =====
function showTyping() {
    const chatMessages = document.getElementById('chatMessages');
    if (!chatMessages) return;

    const div = document.createElement('div');
    div.className = 'chat-message bot typing';
    div.id = 'typing-indicator';
    div.innerHTML = `<div class="bot-avatar"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.832-1.438A9.96 9.96 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2z"/><circle cx="9" cy="9" r="1"/><circle cx="15" cy="9" r="1"/><path d="M8 13a8 8 0 008 0"/></svg></div><div class="typing-dots"><span></span><span></span><span></span></div>`;
    chatMessages.appendChild(div);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function hideTyping() {
    document.getElementById('typing-indicator')?.remove();
}

// ===== BOOT =====
document.addEventListener('DOMContentLoaded', () => {
    initializeChatbot();
});