<div align="center">

# Replicate Hub

**The AI-Powered Platform for Building, Sharing, and Discovering AI Tools & Technologies**

[![Next.js](https://img.shields.io/badge/Next.js-15.4.3-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.1.0-blue)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.3.0-38B2AC)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

*Code, Create, Collaborate. Your AI Playground.*

</div>

## 🚀 Overview

Replicate Hub is a comprehensive AI-powered platform that enables developers, creators, and AI enthusiasts to build, share, and discover cutting-edge AI tools and technologies. Built with modern web technologies, it provides an interactive sandbox environment where users can instantly create React applications, clone websites, and collaborate on AI projects.

### ✨ Key Features

- **🤖 AI-Powered Code Generation** - Generate complete React applications using advanced AI models (GPT-5, Claude Sonnet 4, Kimi K2)
- **🌐 Website Cloning** - Instantly recreate any website as a modern React application with AI
- **💻 Live Sandbox Environment** - Real-time code execution in isolated E2B sandboxes with Vite dev servers
- **🎨 Interactive Marketplace** - Discover and showcase AI projects with filtering by models, tech stack, and tasks
- **📰 AI News Feed** - Stay updated with the latest AI industry news and developments
- **🏆 Community Leaderboard** - Track trending AI projects and creators
- **🔧 Intelligent Code Editing** - Surgical code modifications with context-aware AI assistance
- **📦 Package Management** - Automatic dependency detection and installation
- **🎯 Real-time Collaboration** - Chat with AI assistants for iterative development

## 🏗️ Architecture

### Frontend
- **Next.js 15.4.3** - React framework with App Router
- **React 19.1.0** - Latest React with concurrent features
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Smooth animations and transitions

### Backend & AI
- **AI SDK** - Multi-provider AI integration (OpenAI, Anthropic, Groq)
- **E2B Sandboxes** - Isolated development environments
- **Firecrawl** - Advanced web scraping for website cloning
- **Vite** - Fast development server in sandboxes

### Key Components
- **Workspace Controller** - Manages sandbox lifecycle and AI interactions
- **Code Generation Engine** - Streaming AI code generation with real-time feedback
- **Marketplace System** - Project discovery and community features
- **File Management** - Intelligent file handling and context preservation

## 🔧 Backend Architecture

### Core Backend Services

#### File Management API
- **Secure CRUD Operations** - Path-sanitized file operations preventing sandbox escape
- **Project Isolation** - Each project gets its own workspace directory
- **File Operations** - Read, write, create, delete, rename, and upload files
- **Folder Management** - Navigate and manage project structure

#### Sandbox Workspace System
- **Project Isolation** - Each project gets its own directory with isolated environment
- **Auto-Scaffolding** - Minimal React/Vite app setup on first initialization
- **Environment Management** - Isolated development environments with controlled access
- **Health Monitoring** - Continuous sandbox health checks and auto-restart

#### Terminal API
- **Interactive Command Execution** - Real-time command execution via POST `/api/run-command`
- **Workspace Integration** - Commands run inside project workspace with full environment access
- **Live Output** - Real-time command output and error handling with proper formatting
- **Security** - Sandboxed execution with controlled permissions and path validation

#### Development Server Management
- **One-Click Launch** - Automated `npm install && npm run dev` on port 5173
- **Server Control** - Start, stop, and monitor Vite development servers
- **Port Management** - Automatic port allocation and conflict resolution
- **Error Monitoring** - Real-time Vite error detection and reporting

#### AI Chat Integration
- **Streaming AI Responses** - Real-time AI generation with progress updates
- **File Operations** - AI can read, write, and modify project files
- **Dev-Server Control** - AI can start/stop development servers
- **Context Awareness** - AI maintains conversation context and project state

### Backend API Endpoints

| Category | Endpoints | Description |
|----------|-----------|-------------|
| **Sandbox** | `POST /api/create-ai-sandbox`, `GET /api/sandbox-status` | Sandbox lifecycle management |
| **Files** | `GET /api/get-sandbox-files`, `POST /api/apply-ai-code` | File operations and code application |
| **AI Generation** | `POST /api/generate-ai-code-stream` | Streaming AI code generation |
| **Web Scraping** | `POST /api/scrape-url-enhanced`, `POST /api/scrape-screenshot` | Website cloning and analysis |
| **Package Management** | `POST /api/install-packages`, `POST /api/detect-and-install-packages` | Dependency management |
| **Development** | `POST /api/restart-vite`, `GET /api/monitor-vite-logs` | Dev server management |
| **Terminal** | `POST /api/run-command` | Interactive command execution |
| **Utilities** | `POST /api/create-zip` | Project utilities |

### Backend Technologies

- **Next.js API Routes** - Serverless API endpoints with Edge Runtime
- **E2B Sandboxes** - Isolated development environments
- **Firecrawl** - Advanced web scraping for website cloning
- **AI SDK** - Multi-provider AI integration (OpenAI, Anthropic, Groq)
- **File System Management** - Secure file operations with path sanitization
- **Process Management** - Sandboxed command execution and server management

### Backend Architecture Notes

The current implementation uses Next.js API routes for all backend functionality. The platform is designed to support both:
- **Current**: Next.js API routes with E2B sandboxes
- **Planned**: Separate FastAPI backend for enhanced features and scalability

The terminal API (`/api/run-command`) provides interactive command execution capabilities within the E2B sandbox environment, allowing users to run shell commands, install packages, and manage their development environment directly through the platform.

## 🎯 Use Cases

### For Developers
- **Rapid Prototyping** - Quickly build and test AI-powered applications
- **Website Recreation** - Clone and modify existing websites with AI assistance
- **Learning & Experimentation** - Explore AI capabilities in a safe sandbox environment
- **Code Generation** - Generate production-ready React components and applications

### For AI Enthusiasts
- **Project Discovery** - Browse trending AI projects and technologies
- **Community Engagement** - Share projects and get feedback from the community
- **News & Updates** - Stay informed about the latest AI developments
- **Skill Development** - Learn from real-world AI implementations

### For Teams
- **Collaborative Development** - Work together on AI projects in real-time
- **Code Review** - AI-assisted code analysis and improvements
- **Knowledge Sharing** - Document and share AI project patterns and best practices

## 🚀 Getting Started

### Prerequisites

- **Frontend**: Node.js 18+, npm or yarn
- **Backend**: Python 3.8+, pip
- API keys for AI providers (see configuration below)

### Frontend Installation (Next.js)

1. **Clone the repository**
```bash
git clone https://github.com/mendableai/open-lovable.git
cd open-lovable
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables**
```bash
cp .env.example .env.local
```

Add your API keys to `.env.local`:

```env
# Required
E2B_API_KEY=your_e2b_api_key          # Get from https://e2b.dev (Sandboxes)
FIRECRAWL_API_KEY=your_firecrawl_api_key  # Get from https://firecrawl.dev (Web scraping)

# Optional (need at least one AI provider)
ANTHROPIC_API_KEY=your_anthropic_api_key  # Get from https://console.anthropic.com
OPENAI_API_KEY=your_openai_api_key        # Get from https://platform.openai.com (GPT-5)
GROQ_API_KEY=your_groq_api_key            # Get from https://console.groq.com (Fast inference)
```

4. **Start the development server**
```bash
npm run dev
```

5. **Open your browser**
Navigate to [http://localhost:3000](http://localhost:3000)

### Quick Start (All-in-One)

For a complete local development setup:

```bash
# 1. Clone and setup
git clone https://github.com/mendableai/open-lovable.git
cd open-lovable
npm install

# 2. Configure environment
cp .env.example .env.local  # Edit with your API keys

# 3. Start the development server
npm run dev

# 4. Open your browser
# Navigate to http://localhost:3000
```

## 🎮 How to Use

### Creating Your First AI Project

1. **Start a New Project**
   - Click "New Project" on the home screen
   - Choose your preferred AI model (GPT-5, Claude Sonnet 4, or Kimi K2)

2. **Generate Code**
   - Describe your application in natural language
   - Watch as AI generates complete React components in real-time
   - Preview your application instantly in the sandbox

3. **Iterate and Improve**
   - Chat with the AI to make modifications
   - Add new features or fix issues
   - Download your project as a ZIP file

### Cloning Websites

1. **Provide a URL**
   - Enter any website URL on the home screen
   - Add optional context or styling preferences

2. **AI Recreation**
   - The platform scrapes the website content
   - AI recreates it as a modern React application
   - Preview the cloned site in real-time

3. **Customize**
   - Modify colors, layout, or functionality
   - Add new features or sections
   - Export your customized version

### Exploring the Marketplace

1. **Browse Projects**
   - Visit the marketplace to see trending AI projects
   - Filter by AI models, tech stack, or task types
   - Read project descriptions and creator information

2. **Get Inspired**
   - Study successful AI implementations
   - Learn from community best practices
   - Discover new AI capabilities and use cases

## 🔧 Configuration

### AI Models

The platform supports multiple AI providers:

- **OpenAI GPT-5** - Advanced reasoning and code generation
- **Anthropic Claude Sonnet 4** - Balanced performance and safety
- **Moonshot Kimi K2** - Fast inference and cost-effective

### Sandbox Settings

- **Timeout**: 15 minutes per sandbox session
- **Vite Port**: 5173 (configurable)
- **Auto-restart**: Enabled for package installations
- **Health checks**: Continuous monitoring

### Performance Optimization

- **Caching**: Firecrawl responses cached for 500% faster scraping
- **Streaming**: Real-time code generation with progress updates
- **Lazy loading**: Components loaded on demand
- **Code splitting**: Optimized bundle sizes

## 📁 Project Structure

```
mit/
├── app/                    # Next.js App Router
│   ├── api/               # API routes (backend functionality)
│   │   ├── analyze-edit-intent/     # AI edit analysis
│   │   ├── apply-ai-code/           # Code application
│   │   ├── create-ai-sandbox/       # Sandbox creation
│   │   ├── generate-ai-code-stream/ # AI code generation
│   │   ├── scrape-url-enhanced/     # Web scraping
│   │   └── ...                      # Other API endpoints
│   ├── marketplace/       # Marketplace page
│   ├── workspace/         # Development workspace
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── chat/             # Chat interface
│   ├── preview/          # Code preview
│   ├── workspace/        # Workspace components
│   ├── marketplace/      # Marketplace components
│   └── ui/               # UI components
├── hooks/                # Custom React hooks
├── lib/                  # Utility functions
├── types/                # TypeScript definitions
├── config/               # Application configuration
├── public/               # Static assets
│   ├── leaders.json      # Demo project data
│   ├── news.json         # AI news feed data
│   └── ...               # Other static files
└── docs/                 # Documentation
```

## 🛠️ Development

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint issues
npm run format       # Format code with Prettier
npm run test:all     # Run all tests
```

### Code Style

- **ESLint** - Code linting and quality checks
- **Prettier** - Code formatting
- **TypeScript** - Type safety and IntelliSense
- **Tailwind CSS** - Utility-first styling

### Testing

```bash
npm run test:integration  # Integration tests
npm run test:api         # API endpoint tests
npm run test:code        # Code execution tests
```

### Backend Development

#### API Documentation
- **Next.js API Routes**: All backend functionality is implemented as Next.js API routes
- **Edge Runtime**: API routes run on Vercel's Edge Runtime for optimal performance
- **TypeScript**: Full type safety for all API endpoints
- **Error Handling**: Comprehensive error handling and logging

#### Development Scripts
```bash
# Run all tests
npm run test:all

# Run specific test suites
npm run test:integration  # Integration tests
npm run test:api         # API endpoint tests
npm run test:code        # Code execution tests

# Code quality
npm run lint             # ESLint
npm run lint:fix         # Auto-fix ESLint issues
npm run format           # Prettier formatting
```

#### Backend Configuration
- **Environment Variables**: Configure in `.env.local` file
- **Sandbox Management**: E2B sandboxes for isolated development environments
- **AI Integration**: Multi-provider AI support with streaming responses
- **Logging**: Comprehensive logging for debugging and monitoring

## 🤝 Contributing

We welcome contributions from the community! Here's how you can help:

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Commit your changes** (`git commit -m 'Add amazing feature'`)
4. **Push to the branch** (`git push origin feature/amazing-feature`)
5. **Open a Pull Request**

### Development Guidelines

- Follow TypeScript best practices
- Write comprehensive tests for new features
- Update documentation for API changes
- Ensure responsive design for all components
- Follow the existing code style and patterns

## 📊 Performance

### Optimization Features

- **Streaming Responses** - Real-time AI generation feedback
- **Intelligent Caching** - Reduced API calls and faster responses
- **Code Splitting** - Optimized bundle loading
- **Lazy Loading** - Components loaded on demand
- **Service Worker** - Offline capabilities (optional)

### Monitoring

- **Performance Metrics** - Real-time monitoring of AI generation
- **Error Tracking** - Comprehensive error handling and reporting
- **Health Checks** - Continuous sandbox and API monitoring
- **Analytics** - Usage patterns and optimization insights

## 🔒 Security

### Sandbox Security

- **Isolated Environments** - Each sandbox runs in complete isolation
- **Timeout Protection** - Automatic cleanup of long-running processes
- **Resource Limits** - Memory and CPU constraints
- **Network Isolation** - Controlled network access

### API Security

- **Rate Limiting** - Protection against abuse
- **Input Validation** - Comprehensive input sanitization
- **Error Handling** - Secure error messages
- **Authentication** - API key validation

## 📈 Roadmap

### Upcoming Features

- **Multi-language Support** - Support for Python, Go, and other languages
- **Advanced Collaboration** - Real-time multiplayer editing
- **Project Templates** - Pre-built templates for common use cases
- **Deployment Integration** - Direct deployment to Vercel, Netlify, etc.
- **Advanced Analytics** - Detailed project metrics and insights
- **Mobile App** - Native mobile application

### Backend Enhancements

- **SSE Streaming** - Server-Sent Events for real-time AI chat responses
- **Additional Tools** - `run_tests`, `git_commit`, and more AI tool-calling capabilities
- **Remote Sandboxes** - E2B integration for cloud-based development environments
- **Docker Support** - Containerized deployment for easy hosting
- **Enhanced Security** - Advanced sandbox isolation and access controls
- **Performance Optimization** - Caching, connection pooling, and load balancing

### Planned Integrations

- **Supabase Authentication** - User authentication and database integration
- **Lovable AI** - Enhanced AI capabilities for code generation and analysis
- **Eleven Labs** - AI-powered voice synthesis and audio generation
- **Cursor CLI** - Advanced code editing and IDE integration
- **Additional AI Tools** - Expanding AI provider support and specialized tools

### Community Features

- **User Profiles** - Detailed creator profiles and portfolios
- **Project Comments** - Community feedback and discussions
- **Forking System** - Clone and modify community projects
- **Achievement System** - Gamification and recognition
- **Mentorship Program** - Connect with experienced AI developers

## 🎨 Marketplace & Community

### Current Features

The marketplace currently includes:

- **AI News Feed** - Latest AI industry news and developments
- **Community Leaderboard** - Trending AI projects and creators
- **Project Exhibition** - Showcase of AI projects (currently demo/toy projects)
- **Filtering System** - Filter by AI models, tech stack, and task types

### Exhibition Projects

The `the_exhibition` section currently displays demo projects to showcase the platform's capabilities. These are example projects that demonstrate:

- **ChefAI** - AI-powered cooking assistant
- **VisionCraft** - Computer vision toolkit
- **PromptPilot** - AI prompt optimization platform
- **CodeGenie** - AI coding partner
- **HealthSage** - Personalized health analytics
- **SynthSpeech** - AI voice synthesis system

*Note: These are demonstration projects. Real community projects will be integrated with Supabase authentication and user management.*

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **E2B** - For providing the sandbox infrastructure
- **Firecrawl** - For advanced web scraping capabilities
- **OpenAI, Anthropic, Groq** - For AI model APIs
- **Vercel** - For hosting and deployment
- **The AI Community** - For inspiration and feedback


---

<div align="center">

**Built with ❤️ by Coralle for MIT Hack-Nation**

*Empowering the future of AI development*

</div>
