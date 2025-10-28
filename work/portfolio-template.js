/**
 * Portfolio Page Template Generator
 * Dynamically generates portfolio case study pages
 */

const PORTFOLIO_DATA = {
  corteva: {
    company: 'Corteva',
    industry: 'Agricultural Technology',
    role: 'Senior UX Engineer',
    duration: '2021 - 2022',
    description: 'Worked on a team that built a blockchain-based tracking and traceability system from research through development. Including a mobile web app for production line management.',
    challenges: [
      'Complex data tracking across multiple production stages',
      'Mobile-first design for factory floor workers',
      'Real-time blockchain integration for traceability'
    ],
    solutions: [
      'Developed intuitive mobile web interface for production line scanning',
      'Implemented real-time data synchronization with blockchain backend',
      'Created accessible components for diverse user base'
    ],
    impact: [
      'Reduced manual data entry errors by 40%',
      'Improved product traceability across supply chain',
      'Enabled compliance with regulatory requirements'
    ],
    technologies: ['React', 'TypeScript', 'Blockchain', 'Progressive Web Apps', 'Mobile UX']
  },
  microsoft: {
    company: 'Microsoft',
    industry: 'Technology',
    role: 'UX Engineer',
    duration: '2020 - 2021',
    description: 'Worked on a team that delivered a royalties payment processing system using blockchain technology, achieving 99% reduction in processing time.',
    challenges: [
      'Legacy payment processing taking days to complete',
      'Complex royalty calculation workflows',
      'Integration with existing Microsoft infrastructure'
    ],
    solutions: [
      'Built modern web interface for royalty management',
      'Implemented blockchain-based automated payment processing',
      'Created real-time analytics dashboard for stakeholders'
    ],
    impact: [
      '99% reduction in payment processing time',
      'Automated complex royalty calculations',
      'Improved transparency for content creators'
    ],
    technologies: ['Angular', 'Azure', 'Blockchain', 'TypeScript', 'Data Visualization']
  },
  'bank-of-america': {
    company: 'Bank of America',
    industry: 'Financial Services',
    role: 'Frontend Developer',
    duration: '2019 - 2020',
    description: 'Worked on a team that implemented a blockchain solution to streamline loan payment processes, resulting in faster transaction times and reduced manual effort.',
    challenges: [
      'Manual loan payment processing causing delays',
      'Complex regulatory compliance requirements',
      'Integration with legacy banking systems'
    ],
    solutions: [
      'Developed secure payment processing interface',
      'Implemented blockchain-based transaction ledger',
      'Created compliance reporting dashboard'
    ],
    impact: [
      'Reduced payment processing time by 60%',
      'Minimized manual intervention and errors',
      'Improved audit trail and compliance reporting'
    ],
    technologies: ['React', 'Redux', 'Node.js', 'Blockchain', 'Security']
  },
  'royal-caribbean': {
    company: 'Royal Caribbean',
    industry: 'Media & Entertainment',
    role: 'DevOps Engineer',
    duration: '2019',
    description: 'I was part of a team that collaborated with the client to optimize CI/CD infrastructure across multiple teams resulting in improved efficiency and faster deployments.',
    challenges: [
      'Slow deployment cycles across multiple teams',
      'Inconsistent infrastructure configurations',
      'Limited visibility into deployment status'
    ],
    solutions: [
      'Standardized CI/CD pipelines across teams',
      'Implemented automated testing and deployment workflows',
      'Created centralized monitoring and alerting system'
    ],
    impact: [
      '50% reduction in deployment time',
      'Improved team collaboration and efficiency',
      'Reduced production incidents'
    ],
    technologies: ['Jenkins', 'Docker', 'Kubernetes', 'AWS', 'Monitoring']
  },
  'weber-shandwick': {
    company: 'Weber Shandwick (Large Retail Pharmacy)',
    industry: 'Healthcare / Retail',
    role: 'Frontend Developer',
    duration: '2018 - 2019',
    description: 'I was part of the team that launched a curbside pickup checkout flow for pharmacy prescriptions, reducing customer wait times and creating reusable accessible components.',
    challenges: [
      'Complex prescription pickup workflow',
      'Accessibility requirements for diverse user base',
      'Integration with existing pharmacy systems'
    ],
    solutions: [
      'Designed intuitive curbside pickup interface',
      'Built WCAG 2.1 AA compliant component library',
      'Implemented real-time order status tracking'
    ],
    impact: [
      'Reduced customer wait times by 45%',
      'Improved customer satisfaction scores',
      'Created reusable component library for future features'
    ],
    technologies: ['React', 'Accessibility', 'Component Libraries', 'UX Design', 'Mobile']
  },
  macmillan: {
    company: 'Macmillan Learning',
    industry: 'Publishing & Education',
    role: 'Full Stack Developer',
    duration: '2017 - 2018',
    description: 'Worked on a team that developed and launched Question Bank Editor, an internal tool for content editors to curate educational questions, plus platform bug fixes.',
    challenges: [
      'Inefficient manual question curation process',
      'Complex question formatting and metadata requirements',
      'Need for real-time collaboration features'
    ],
    solutions: [
      'Built rich text editor with specialized question formatting',
      'Implemented tagging and categorization system',
      'Created collaborative editing features'
    ],
    impact: [
      'Reduced question curation time by 70%',
      'Improved content quality and consistency',
      'Enabled scalable content production workflow'
    ],
    technologies: ['React', 'Node.js', 'PostgreSQL', 'Rich Text Editing', 'Collaboration']
  },
  guardian: {
    company: 'Guardian Life Insurance',
    industry: 'Insurance',
    role: 'Frontend Developer',
    duration: '2016 - 2017',
    description: 'Built out pages for Guardian\'s My Account Management Portal improving customer self-service capabilities.',
    challenges: [
      'Legacy account management system lacking self-service',
      'Complex insurance policy information display',
      'Mobile responsiveness requirements'
    ],
    solutions: [
      'Redesigned account dashboard with modern UI',
      'Implemented policy document management system',
      'Created responsive mobile-first layouts'
    ],
    impact: [
      'Increased self-service adoption by 55%',
      'Reduced customer support calls',
      'Improved mobile user experience'
    ],
    technologies: ['JavaScript', 'HTML/CSS', 'Responsive Design', 'UX', 'Forms']
  },
  sbe: {
    company: 'sbe Entertainment',
    industry: 'Hospitality & Entertainment',
    role: 'Email Developer',
    duration: '2015 - 2016',
    description: 'At sbe.com I contributed to marketing campaigns through HTML email development for their hospitality brand.',
    challenges: [
      'Cross-email client compatibility issues',
      'Maintaining brand consistency across campaigns',
      'Responsive email design for mobile devices'
    ],
    solutions: [
      'Developed modular email template system',
      'Created comprehensive testing workflow',
      'Implemented responsive email patterns'
    ],
    impact: [
      'Improved email open rates by 25%',
      'Reduced email production time',
      'Ensured consistent brand experience'
    ],
    technologies: ['HTML Email', 'CSS', 'Email Clients', 'Marketing', 'Responsive Design']
  }
};

function generatePortfolioHTML(projectSlug) {
  const project = PORTFOLIO_DATA[projectSlug];

  if (!project) {
    return null;
  }

  return `<!doctype html>
<html lang="en">
    <head>
        <meta charset="UTF-8" />
        <meta name="color-scheme" content="dark light" />
        <meta name="theme-color" content="#212121" media="(prefers-color-scheme: dark)" />
        <meta name="theme-color" content="#dee1e3" media="(prefers-color-scheme: light)" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="robots" content="noindex, nofollow" />
        <title>${project.company} - Portfolio | Robert James</title>
        <link rel="preload" href="/fonts/recursive-variable.woff2" as="font" type="font/woff2" crossorigin />
        <link rel="preload" href="/styles/fonts.css" as="style" />
        <link rel="preload" href="/styles/main.css" as="style" />
        <link rel="stylesheet" href="/styles/fonts.css" media="print" onload="this.media='all'" />
        <noscript><link rel="stylesheet" href="/styles/fonts.css" /></noscript>
        <link rel="stylesheet" href="/styles/main.css" media="print" onload="this.media='all'" />
        <noscript><link rel="stylesheet" href="/styles/main.css" /></noscript>
        <link rel="icon" type="image/svg+xml" href="/images/icon.svg" />
        <style>
            .portfolio-container {
                max-width: 60rem;
                margin: 0 auto;
                padding: var(--xxl) var(--m);
            }

            .portfolio-header {
                margin-bottom: var(--xxxl);
                padding-bottom: var(--xl);
                border-bottom: 1px solid var(--gray-1);
            }

            .portfolio-title {
                font-size: clamp(2rem, 5vw, 3rem);
                margin-bottom: var(--m);
                --recursive-wght: 800;
            }

            .portfolio-meta {
                display: flex;
                flex-wrap: wrap;
                gap: var(--xl);
                margin-top: var(--l);
                color: var(--gray-1);
                font-size: 0.9rem;
            }

            .portfolio-meta-item {
                display: flex;
                flex-direction: column;
                gap: var(--xs);
            }

            .portfolio-meta-label {
                font-weight: 600;
                text-transform: uppercase;
                font-size: 0.75rem;
                letter-spacing: 0.05em;
                color: var(--gray-2);
            }

            .portfolio-section {
                margin-bottom: var(--xxxl);
            }

            .portfolio-section-title {
                font-size: clamp(1.5rem, 3vw, 2rem);
                margin-bottom: var(--l);
                --recursive-wght: 700;
            }

            .portfolio-description {
                font-size: 1.1rem;
                line-height: 1.7;
                margin-bottom: var(--xl);
            }

            .portfolio-list {
                list-style: none;
                padding: 0;
            }

            .portfolio-list li {
                padding: var(--m) 0;
                padding-left: var(--xl);
                position: relative;
                line-height: 1.6;
            }

            .portfolio-list li::before {
                content: "→";
                position: absolute;
                left: 0;
                color: var(--blue-2);
                font-weight: bold;
            }

            .portfolio-technologies {
                display: flex;
                flex-wrap: wrap;
                gap: var(--s);
                margin-top: var(--l);
            }

            .portfolio-tech-tag {
                background: var(--gray-1);
                color: var(--white-1);
                padding: var(--xs) var(--m);
                border-radius: var(--border-radius);
                font-size: 0.85rem;
                font-weight: 500;
            }

            .portfolio-placeholder-image {
                width: 100%;
                aspect-ratio: 16 / 9;
                background: linear-gradient(135deg, var(--gray-1) 0%, var(--gray-2) 100%);
                border-radius: var(--border-radius);
                display: flex;
                align-items: center;
                justify-content: center;
                color: var(--white-1);
                font-size: 1.2rem;
                margin: var(--xl) 0;
            }

            .back-link {
                display: inline-flex;
                align-items: center;
                gap: var(--s);
                margin-bottom: var(--xl);
                color: var(--blue-2);
                text-decoration: none;
                transition: opacity 0.2s;
            }

            .back-link:hover {
                opacity: 0.7;
            }
        </style>
    </head>
    <body>
        <div class="portfolio-container">
            <a href="/" class="back-link">← Back to Home</a>

            <header class="portfolio-header">
                <h1 class="portfolio-title">${project.company}</h1>
                <p class="portfolio-description">${project.description}</p>

                <div class="portfolio-meta">
                    <div class="portfolio-meta-item">
                        <span class="portfolio-meta-label">Industry</span>
                        <span>${project.industry}</span>
                    </div>
                    <div class="portfolio-meta-item">
                        <span class="portfolio-meta-label">Role</span>
                        <span>${project.role}</span>
                    </div>
                    <div class="portfolio-meta-item">
                        <span class="portfolio-meta-label">Duration</span>
                        <span>${project.duration}</span>
                    </div>
                </div>
            </header>

            <div class="portfolio-placeholder-image">
                [Project Screenshot Placeholder]
            </div>

            <section class="portfolio-section">
                <h2 class="portfolio-section-title">Challenges</h2>
                <ul class="portfolio-list">
                    ${project.challenges.map(challenge => `<li>${challenge}</li>`).join('')}
                </ul>
            </section>

            <div class="portfolio-placeholder-image">
                [Design Process Placeholder]
            </div>

            <section class="portfolio-section">
                <h2 class="portfolio-section-title">Solutions</h2>
                <ul class="portfolio-list">
                    ${project.solutions.map(solution => `<li>${solution}</li>`).join('')}
                </ul>
            </section>

            <div class="portfolio-placeholder-image">
                [Implementation Screenshot Placeholder]
            </div>

            <section class="portfolio-section">
                <h2 class="portfolio-section-title">Impact</h2>
                <ul class="portfolio-list">
                    ${project.impact.map(impact => `<li>${impact}</li>`).join('')}
                </ul>
            </section>

            <section class="portfolio-section">
                <h2 class="portfolio-section-title">Technologies</h2>
                <div class="portfolio-technologies">
                    ${project.technologies.map(tech => `<span class="portfolio-tech-tag">${tech}</span>`).join('')}
                </div>
            </section>
        </div>
    </body>
</html>`;
}

module.exports = { generatePortfolioHTML, PORTFOLIO_DATA };
