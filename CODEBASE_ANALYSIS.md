# Comprehensive Codebase Analysis - InnovaTeam Platform

## Executive Summary
InnovaTeam is a full-stack educational platform built with React (frontend) and Node.js/Express (backend), integrated with Supabase for authentication and database management. The platform provides JAMB-related services, AI-powered exam generation, course recommendations, and wallet-based payment system.

---

## 1. Architecture Overview

### Technology Stack
**Frontend:**
- React 18.2.0 with React Router DOM 6.8.0
- Tailwind CSS with custom UI components (shadcn/ui)
- Framer Motion for animations
- React Hot Toast for notifications
- Axios for API communication

**Backend:**
- Node.js with Express 4.22.1
- Supabase (PostgreSQL) for database and authentication
- Google Gemini AI for question generation
- JWT for token management
- Helmet, CORS, Rate Limiting for security

**Key Services:**
- Supabase Auth (user authentication)
- Gemini AI (question generation & validation)
- Wallet System (transaction management)
- Email Service (Resend API)
- Sentry (error monitoring)

---

## 2. Project Structure

```
innovateam/
├── client/                    # Legacy client folder (minimal usage)
├── src/                       # Main React application
│   ├── components/           # Reusable UI components
│   ├── pages/                # Route-based page components
│   ├── services/             # API service layer
│   ├── contexts/             # React Context providers
│   ├── hooks/                # Custom React hooks
│   ├── config/               # Configuration files
│   └── utils/                # Utility functions
├── server/                    # Express backend
│   ├── controllers/          # Request handlers
│   ├── routes/               # API route definitions
│   ├── middleware/           # Express middleware
│   ├── services/             # Business logic services
│   ├── models/               # Data models
│   ├── database/             # SQL schemas
│   └── utils/                # Backend utilities
├── public/                    # Static assets
├── supabase/                  # Supabase SQL migrations
└── scripts/                   # Security & deployment scripts
```

---

## 3. Core Features & Modules

### 3.1 Authentication System
**Location:** `server/routes/auth.routes.js`, `server/controllers/auth.controller.js`

**Flow:**
1. User registers → Supabase Auth creates user
2. Auto-confirmation in development mode
3. JWT tokens issued for session management
4. Role-based access control (user/admin)

**Key Functions:**
- `register()` - Creates user with email/password
- `login()` - Authenticates and returns JWT tokens
- `validateToken()` - Verifies JWT validity
- `refreshToken()` - Renews expired tokens

**Security Features:**
- Password validation (min 8 chars, uppercase, lowercase, number, special char)
- CSRF protection on state-changing routes
- XSS protection middleware
- Rate limiting (500 requests/5min for auth endpoints)

---

### 3.2 AI Examiner System
**Location:** `server/controllers/aiExaminer.controller.js`, `src/pages/ai examiner/index.jsx`

**Database Tables:**
```sql
ai_documents (id, user_id, filename, content, file_size, mime_type, created_at)
ai_exams (id, user_id, document_id, questions, difficulty, subject, total_questions, 
          total_points, status, score, percentage, results, created_at, completed_at)
```

**Workflow:**
1. **Document Upload/Text Submission**
   - Supports PDF, DOCX, TXT files
   - Extracts text using pdf-parse/mammoth
   - Stores in `ai_documents` table

2. **Question Generation**
   - Uses Google Gemini AI API
   - Supports 4 question types:
     - Multiple Choice (4 options)
     - True/False
     - Fill-in-the-Blank
     - Flashcards
   - Configurable difficulty (easy/medium/hard)
   - Configurable question count (5-30)
   - Cost: ₦300 per exam

3. **Exam Taking**
   - Timed exam with countdown
   - Progress tracking
   - Answer storage in state

4. **Grading & Results**
   - AI-powered answer validation for fill-in-blank
   - Detailed explanations for each question
   - Performance metrics (score, percentage, grade)
   - Results stored in `ai_exams` table

**Key Service:** `server/services/gemini.service.js`
- `generateQuestions()` - Creates exam questions
- `validateAnswer()` - AI-based answer checking
- `getValidModel()` - Selects best available Gemini model

---

### 3.3 Wallet System
**Location:** `src/contexts/WalletContext.jsx`, `server/routes/wallet.routes.js`

**Database Schema:**
```sql
user_profiles (id, email, name, phone, role, wallet_balance, is_active, created_at)
user_transactions (id, user_id, type, amount, description, status, category, 
                   reference, metadata, created_at)
```

**Features:**
- Real-time balance tracking
- Transaction history
- Fund wallet (credit)
- Service payments (debit)
- Transaction categorization

**Transaction Types:**
- `credit` - Wallet funding
- `debit` - Service purchases

**Integration Points:**
- AI Examiner (₦300 per exam)
- JAMB Services (various prices)
- Result Checkers
- Course Recommendations

---

### 3.4 Course Recommendation System
**Location:** `src/pages/course-advisor/index.jsx`, `server/routes/courseRecommendation.routes.js`

**Input Parameters:**
- WAEC grades (English, Math, etc.)
- JAMB score
- Interests and career goals

**Output:**
- Personalized course recommendations
- University suggestions
- Career path guidance

---

### 3.5 Admin Dashboard
**Location:** `src/pages/admin/`, `server/routes/admin.routes.js`

**Features:**
- User management
- Transaction monitoring
- System analytics
- AI question bank management
- Service configuration

**Access Control:**
- Role-based authentication
- Admin-only middleware (`requireAdmin`)
- Protected routes with `AdminProtectedRoute`

---

## 4. Database Architecture

### Supabase Tables

**Core Tables:**
1. `users` - User profiles and metadata
2. `user_profiles` - Extended user information
3. `user_transactions` - Financial transactions
4. `ai_documents` - Uploaded study materials
5. `ai_exams` - Generated exams and results

**Security:**
- Row Level Security (RLS) enabled
- User-specific data isolation
- Service role key for admin operations

**Indexes:**
- `idx_user_transactions_user_id`
- `idx_user_transactions_created_at`
- `idx_ai_documents_user_id`
- `idx_ai_exams_user_id`

---

## 5. API Architecture

### Base URL Structure
- Development: `http://localhost:5000`
- Production: Configured via environment variables

### Key Endpoints

**Authentication:**
```
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
GET  /api/auth/validate
POST /api/auth/refresh-token
```

**AI Examiner:**
```
POST /api/ai-examiner/upload
POST /api/ai-examiner/submit-text
POST /api/ai-examiner/generate
POST /api/ai-examiner/submit/:examId
GET  /api/ai-examiner/history
GET  /api/ai-examiner/results/:examId
```

**Wallet:**
```
GET  /api/wallet/balance
POST /api/wallet/fund
POST /api/wallet/deduct
GET  /api/wallet/transactions
```

**Admin:**
```
GET  /api/admin/users
GET  /api/admin/transactions
GET  /api/admin/analytics
POST /api/admin/ai-questions
```

---

## 6. Security Implementation

### Middleware Stack (in order)
1. **CORS** - Whitelist allowed origins
2. **Helmet** - Security headers with CSP
3. **Rate Limiting** - 2000 requests/5min (API), 500 requests/5min (auth)
4. **XSS Protection** - Input sanitization
5. **CSRF Protection** - Token validation for state-changing routes
6. **SSRF Protection** - Prevents server-side request forgery
7. **Authentication** - JWT token verification

### Environment Variables (Required)
```
PORT=5000
JWT_SECRET=***
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d
SUPABASE_URL=***
SUPABASE_KEY=***
SUPABASE_SERVICE_ROLE_KEY=***
SUPABASE_JWT_SECRET=***
GEMINI_API_KEY=***
RESEND_API_KEY=***
```

### Security Features
- Password hashing (bcryptjs)
- Token-based authentication
- Role-based access control
- Input validation (express-validator)
- SQL injection prevention (parameterized queries)
- XSS prevention (DOMPurify, xss library)
- CSRF tokens for forms
- Secure session management

---

## 7. Frontend Architecture

### State Management
**React Context API:**
- `AuthContext` - User authentication state
- `WalletContext` - Wallet balance & transactions
- `DarkModeContext` - Theme preferences
- `AdminContext` - Admin-specific state

### Routing Structure
```
/ (Home)
/login
/register
/forgot-password
/reset-password
/dashboard (Protected)
  ├── /dashboard/profile
  ├── /dashboard/wallet
  ├── /dashboard/transactions
  ├── /dashboard/ai-examiner
  ├── /dashboard/course-advisor
  └── /dashboard/support
/admin (Admin Protected)
  ├── /admin/dashboard
  ├── /admin/users
  └── /admin/analytics
```

### Component Architecture
**UI Components (shadcn/ui):**
- Button, Card, Input, Textarea
- Label, Select, Checkbox, Switch
- Avatar, Badge, Progress
- Dropdown Menu, Separator

**Custom Components:**
- `EducationalSidebar` - Dashboard navigation
- `ProtectedRoute` - Auth guard for user routes
- `AdminProtectedRoute` - Auth guard for admin routes
- `ErrorBoundary` - Error handling wrapper
- `Loading` - Loading states

---

## 8. Service Layer

### Frontend Services (`src/services/`)
- `api.service.js` - Axios wrapper with interceptors
- `auth.service.js` - Authentication API calls
- `aiExaminer.service.js` - AI Examiner API calls
- `wallet.service.js` - Wallet API calls
- `admin.service.js` - Admin API calls
- `email/emailService.js` - Email notifications

### Backend Services (`server/services/`)
- `gemini.service.js` - Google Gemini AI integration
- `transaction.service.js` - Transaction processing
- `email.service.js` - Email sending (Resend)

---

## 9. Data Flow Examples

### AI Exam Generation Flow
```
1. User uploads document
   → Frontend: aiExaminer.service.uploadDocument()
   → Backend: POST /api/ai-examiner/upload
   → Controller: aiExaminerController.uploadDocument()
   → Extract text (pdf-parse/mammoth)
   → Store in ai_documents table
   → Return documentId

2. User configures exam
   → Frontend: Set questionCount, difficulty, questionTypes
   → Check wallet balance (₦300)

3. Generate questions
   → Frontend: aiExaminer.service.generateQuestions()
   → Backend: POST /api/ai-examiner/generate
   → Controller: aiExaminerController.generateQuestions()
   → Service: geminiService.generateQuestions()
   → Gemini API call with prompt
   → Parse JSON response
   → Store in ai_exams table
   → Deduct ₦300 from wallet
   → Return examId and questions

4. User takes exam
   → Frontend: Display questions, track time
   → Store answers in state

5. Submit exam
   → Frontend: aiExaminer.service.submitAnswers()
   → Backend: POST /api/ai-examiner/submit/:examId
   → Controller: aiExaminerController.submitAnswers()
   → Grade answers (AI validation for fill-in-blank)
   → Calculate score and percentage
   → Update ai_exams table with results
   → Return detailed results
```

### Wallet Transaction Flow
```
1. Fund Wallet
   → Frontend: WalletContext.fundWallet()
   → Service: cleanWalletService.fundWallet()
   → Backend: POST /api/wallet/fund
   → Update user_profiles.wallet_balance
   → Insert into user_transactions (type: credit)
   → Return new balance

2. Service Payment
   → Frontend: WalletContext.addTransaction()
   → Service: cleanWalletService.deductFromWallet()
   → Backend: POST /api/wallet/deduct
   → Check sufficient balance
   → Update user_profiles.wallet_balance
   → Insert into user_transactions (type: debit)
   → Return new balance
```

---

## 10. Key Files & Their Purposes

### Critical Backend Files
1. **server/server.js** - Main Express app, middleware setup, route mounting
2. **server/supabaseClient.js** - Supabase client initialization with admin capabilities
3. **server/controllers/aiExaminer.controller.js** - AI Examiner business logic
4. **server/services/gemini.service.js** - Gemini AI integration
5. **server/middleware/authenticate.js** - JWT authentication middleware
6. **server/routes/*.routes.js** - API endpoint definitions

### Critical Frontend Files
1. **src/App.js** - Main app component, routing, auth provider
2. **src/index.js** - React app entry point
3. **src/pages/ai examiner/index.jsx** - AI Examiner UI (500+ lines)
4. **src/contexts/WalletContext.jsx** - Wallet state management
5. **src/services/aiExaminer.service.js** - AI Examiner API client
6. **src/config/supabase.js** - Supabase client configuration

### Configuration Files
1. **package.json** (root) - Frontend dependencies
2. **server/package.json** - Backend dependencies
3. **.env** (server) - Backend environment variables
4. **tailwind.config.js** - Tailwind CSS configuration
5. **vercel.json** - Vercel deployment config

---

## 11. Deployment Architecture

### Frontend (Vercel)
- Build command: `npm install && npm run build`
- Output directory: `build/`
- Environment variables configured in Vercel dashboard

### Backend (Render/Railway)
- Build command: `cd server && npm install`
- Start command: `cd server && npm start`
- Environment variables configured in hosting platform

### Database (Supabase)
- Hosted PostgreSQL database
- Automatic backups
- Row Level Security enabled
- API auto-generated

---

## 12. Testing & Quality Assurance

### Testing Files
- `src/App.test.js` - App component tests
- `src/setupTests.js` - Jest configuration
- `src/components/ErrorBoundary.test.jsx` - Error boundary tests
- `src/components/Loading.test.jsx` - Loading component tests

### Security Audit Scripts
- `scripts/final-security-audit.js`
- `scripts/api-security-check.js`
- `scripts/auth-security-check.js`
- `scripts/database-security-check.js`

---

## 13. Known Issues & Technical Debt

### Current Issues
1. **Sentry Integration** - Temporarily disabled due to fetch blocking
2. **Email Confirmation** - Auto-confirmed in development mode
3. **CSRF Protection** - Disabled for AI Examiner during development
4. **Cookie Size** - Header size increased to prevent 431 errors

### Technical Debt
1. Multiple wallet service implementations (needs consolidation)
2. Duplicate user data storage (localStorage + Supabase)
3. Mixed authentication approaches (JWT + Supabase Auth)
4. Legacy client folder (minimal usage)
5. Server backup folder (should be removed)

---

## 14. Performance Optimizations

### Backend
- Compression middleware enabled
- Database indexes on frequently queried columns
- Rate limiting to prevent abuse
- Connection pooling for database

### Frontend
- Code splitting with React.lazy (potential)
- Image optimization needed
- Bundle size optimization needed
- Caching strategies for API calls

---

## 15. Future Enhancements

### Planned Features
1. **Practice Questions System** - Student learning module
2. **Performance Analytics** - Detailed progress tracking
3. **Leaderboard** - Competitive learning
4. **Email Notifications** - Welcome emails, exam results
5. **Payment Integration** - Paystack for wallet funding

### Scalability Considerations
1. Implement Redis for session management
2. Add CDN for static assets
3. Implement database read replicas
4. Add message queue for async tasks (exam generation)
5. Implement caching layer (Redis/Memcached)

---

## 16. Development Workflow

### Local Development Setup
```bash
# Install dependencies
npm install
cd server && npm install

# Start backend
cd server
npm start  # Runs on port 5000

# Start frontend (new terminal)
npm start  # Runs on port 3000
```

### Environment Setup
1. Copy `.env.example` to `.env` in server folder
2. Configure Supabase credentials
3. Add Gemini API key
4. Configure email service (Resend)

### Database Setup
1. Run SQL scripts in Supabase SQL Editor:
   - `server/database/init.sql`
   - `server/database/ai_examiner_tables.sql`
2. Enable Row Level Security
3. Create admin user via script

---

## 17. Code Quality Metrics

### Backend
- **Total Files:** ~50 files
- **Lines of Code:** ~15,000 lines
- **Key Controllers:** 5 (auth, aiExaminer, admin, wallet, aiQuestions)
- **API Routes:** 8 route files
- **Middleware:** 7 middleware functions

### Frontend
- **Total Components:** ~80 components
- **Lines of Code:** ~20,000 lines
- **Pages:** 30+ pages
- **Services:** 15+ service files
- **Contexts:** 7 context providers

---

## 18. Dependencies Analysis

### Critical Dependencies
**Backend:**
- `@supabase/supabase-js` - Database & Auth
- `@google/generative-ai` - AI question generation
- `express` - Web framework
- `jsonwebtoken` - JWT authentication
- `multer` - File uploads
- `pdf-parse` - PDF text extraction
- `mammoth` - DOCX text extraction

**Frontend:**
- `react` & `react-dom` - UI framework
- `react-router-dom` - Routing
- `@supabase/supabase-js` - Supabase client
- `axios` - HTTP client
- `framer-motion` - Animations
- `react-hot-toast` - Notifications
- `tailwindcss` - Styling

---

## 19. Error Handling Strategy

### Backend Error Handling
- Centralized error handler middleware
- Detailed error logging with request IDs
- Sentry integration for production errors
- Graceful error responses with status codes

### Frontend Error Handling
- ErrorBoundary component for React errors
- Toast notifications for user-facing errors
- Console logging for debugging
- Fallback UI for error states

---

## 20. Monitoring & Logging

### Backend Logging
- Morgan for HTTP request logging
- Custom logger utility (`server/utils/logger.js`)
- Activity logging (`server/utils/activityLogger.js`)
- Sentry for error tracking

### Frontend Logging
- Console logging for development
- Sentry for production errors (disabled currently)
- User action tracking (potential)

---

## Conclusion

InnovaTeam is a well-structured educational platform with modern architecture and comprehensive features. The codebase demonstrates good separation of concerns, security best practices, and scalability considerations. Key strengths include the AI-powered exam system, robust authentication, and wallet integration. Areas for improvement include consolidating duplicate services, optimizing bundle size, and implementing comprehensive testing.

**Codebase Health:** 7.5/10
**Security Posture:** 8/10
**Scalability:** 7/10
**Maintainability:** 7.5/10

---

*Analysis completed on: 2025*
*Total files analyzed: 150+*
*Total lines of code: ~35,000*
