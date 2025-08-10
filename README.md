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

- Node.js 18+ 
- npm or yarn
- API keys for AI providers (see configuration below)

### Installation

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
│   ├── api/               # API routes
│   ├── marketplace/       # Marketplace page
│   ├── workspace/         # Development workspace
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── chat/             # Chat interface
│   ├── preview/          # Code preview
│   ├── workspace/        # Workspace components
│   └── ui/               # UI components
├── hooks/                # Custom React hooks
├── lib/                  # Utility functions
├── types/                # TypeScript definitions
├── config/               # Application configuration
└── public/               # Static assets
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

### Community Features

- **User Profiles** - Detailed creator profiles and portfolios
- **Project Comments** - Community feedback and discussions
- **Forking System** - Clone and modify community projects
- **Achievement System** - Gamification and recognition
- **Mentorship Program** - Connect with experienced AI developers

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

**Built with ❤️ by the Coralle for MIT Sloan Hack-Nation**

*Empowering the future of AI development*

</div>
