# SubmittalAI Pro

AI-powered construction submittal review platform that automatically analyzes submittals against project specifications, reducing review time from days to minutes while maintaining accuracy and compliance standards.

## 🚀 Features

- **AI-Powered Analysis**: Automated submittal vs specification comparison using advanced AI models
- **Instant Reviews**: Complete analysis within 2-5 minutes for typical submittals
- **Compliance Scoring**: Detailed compliance reports with specific discrepancy identification
- **Subscription Management**: Flexible pricing tiers with usage tracking
- **PDF Export**: Professional reports with findings and recommendations
- **Secure Storage**: Enterprise-grade security with user-specific access control

## 🛠️ Technology Stack

- **Frontend**: Next.js 14+ with TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Next.js API Routes (serverless functions)
- **Database**: Supabase (PostgreSQL) with Row Level Security
- **AI Processing**: OpenRouter for AI model access
- **Authentication**: Supabase Auth
- **Payments**: Stripe subscriptions
- **Deployment**: Vercel
- **File Storage**: Supabase Storage

## 📋 Prerequisites

- Node.js 18+
- npm or yarn
- Git

## 🔧 Installation & Setup

1. **Clone the repository**

   ```bash
       git clone https://github.com/jamestuckerdunn/submittal-ai-pro.git
   cd submittal-ai-pro
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Environment Variables**
   Create a `.env.local` file in the root directory:

   ```env
   # Supabase
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

   # OpenRouter AI
   OPENROUTER_API_KEY=your_openrouter_api_key

   # Stripe
   STRIPE_SECRET_KEY=your_stripe_secret_key
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
   STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

   # App
   NEXTAUTH_SECRET=your_nextauth_secret
   NEXTAUTH_URL=http://localhost:3000
   ```

4. **Run the development server**

   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📝 Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build the application for production
- `npm run start` - Start the production server
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Run ESLint with auto-fix
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting
- `npm run type-check` - Run TypeScript type checking

## 🏗️ Project Structure

```
submittal-ai-pro/
├── src/
│   ├── app/                 # Next.js app directory
│   ├── components/          # Reusable UI components
│   ├── lib/                 # Utility functions and configurations
│   ├── types/               # TypeScript type definitions
│   └── styles/              # Global styles and Tailwind config
├── public/                  # Static assets
├── .husky/                  # Git hooks
├── docs/                    # Project documentation
└── tests/                   # Test files
```

## 🔒 Code Quality

This project maintains strict code quality standards:

- **TypeScript Strict Mode**: All code must pass TypeScript strict checking
- **ESLint**: Enforced linting rules with no warnings allowed in builds
- **Prettier**: Consistent code formatting
- **Pre-commit Hooks**: Automated linting and type checking before commits
- **No `any` Types**: Explicit typing required throughout the codebase

## 🧪 Testing

```bash
npm run test          # Run all tests
npm run test:watch    # Run tests in watch mode
npm run test:coverage # Generate coverage report
```

## 🚀 Deployment

The application is automatically deployed to Vercel on every push to the main branch.

### Manual Deployment

```bash
npm run build
npm run start
```

## 📊 Performance Requirements

- Page load time: < 2 seconds
- AI processing: < 5 minutes for typical documents
- API response time: < 500ms for standard operations
- Uptime: 99.9% availability SLA

## 🔐 Security

- Row Level Security (RLS) on all database tables
- Input validation and sanitization
- XSS and CSRF protection
- Secure file upload with type validation
- Environment variable security

## 📚 API Documentation

API documentation is available at `/api-docs` when running in development mode.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript strict mode requirements
- Ensure all tests pass
- Maintain code coverage above 80%
- Follow the existing code style
- Update documentation for new features

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support, email support@submittalai.pro or create an issue in this repository.

## 📈 Roadmap

- [ ] Phase 1: MVP with core AI review functionality
- [ ] Phase 2: Advanced analysis features and reporting
- [ ] Phase 3: API integrations and advanced workflows
- [ ] Phase 4: Mobile applications and offline capabilities

---

Built with ❤️ for the construction industry
