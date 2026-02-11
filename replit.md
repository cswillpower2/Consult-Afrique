# ConsultAfrique - Education & Medical Tourism Portal

## Overview
ConsultAfrique is a comprehensive web platform connecting African students and patients with educational institutions and healthcare facilities in Pakistan. The platform provides a public marketing frontend, secure client portal, and admin dashboard for managing applications.

## Recent Changes
- **February 11, 2026**: Replaced Replit Auth with Custom Authentication
  - Custom email/password auth using bcrypt + express-session with PostgreSQL store
  - Login (/login), Register (/register), Forgot Password (/forgot-password), Reset Password (/reset-password) pages
  - Session-based auth with 7-day TTL, secure cookies in production
  - Password reset via email tokens (requires SMTP configuration)
  - All auth redirects updated from /api/login to /login across entire frontend

- **February 11, 2026**: Added News & Updates System
  - newsArticles database table with title, summary, content, published status
  - Public API: GET /api/news (published only), GET /api/news/:id
  - Admin CRUD: GET/POST/PATCH/DELETE /api/admin/news
  - Landing page news section (shows up to 6 published articles between Team and Contact)
  - Admin dashboard News tab with create/edit/delete functionality

- **February 2, 2026**: Added Admin Dashboard
  - View all user applications with status management
  - Update application status (pending, in review, approved, rejected)
  - View and verify uploaded documents for each user
  - View contact form inquiries
  - Access via /admin route or "Admin Panel" in user dashboard sidebar
  - Role-based access control: Only users with emails in ADMIN_EMAILS env var can access
  - Admin emails: admiiins@consultafrique.com, ibrahim@consultafrique.com, abiola@consultafrique.com, cosultafrique@gmail.com

- **February 2, 2026**: Added WAEC/NECO Eligibility Calculator
  - Calculator for Nigerian students to check admission eligibility
  - Grade-to-marks conversion based on IBCC 2026 standards
  - Course-specific subject validation (Medicine, Engineering, Computer Science)
  - Equivalence scaling with 10% IBCC deduction
  - Navigation links in navbar and services section

- **January 31, 2026**: Initial MVP implementation
  - Landing page with hero carousel, services, team section, and contact form
  - Custom email/password authentication
  - Client dashboard with profile management and document uploads
  - Admin API endpoints for managing applications
  - Brand colors: Deep Green (#2F855A) primary, Orange (#ED8936) accent

## Architecture

### Tech Stack
- **Frontend**: React + TypeScript + Vite + TailwindCSS + Shadcn/UI
- **Backend**: Express.js + TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Custom email/password (bcrypt + express-session)
- **File Uploads**: Multer with authenticated access

### Project Structure
```
├── client/src/
│   ├── components/
│   │   ├── landing/           # Landing page components
│   │   │   ├── navbar.tsx     # Navigation bar
│   │   │   ├── hero-carousel.tsx
│   │   │   ├── services.tsx
│   │   │   ├── about.tsx
│   │   │   ├── team.tsx       # Team section with modal
│   │   │   ├── contact.tsx    # Contact form
│   │   │   ├── footer.tsx
│   │   │   └── whatsapp-button.tsx
│   │   ├── ui/                # Shadcn UI components
│   │   ├── theme-provider.tsx
│   │   └── theme-toggle.tsx
│   ├── pages/
│   │   ├── landing.tsx        # Public landing page
│   │   ├── dashboard/         # Authenticated dashboard pages
│   │   │   ├── index.tsx      # Dashboard overview
│   │   │   ├── profile.tsx    # Profile management
│   │   │   ├── documents.tsx  # Document uploads
│   │   │   └── settings.tsx
│   │   └── not-found.tsx
│   ├── hooks/
│   │   ├── use-auth.ts        # Authentication hook
│   │   └── use-toast.ts
│   └── lib/
│       ├── queryClient.ts
│       └── auth-utils.ts
├── server/
│   ├── index.ts               # Express server entry
│   ├── routes.ts              # API routes
│   ├── storage.ts             # Database operations
│   ├── db.ts                  # Database connection
│   └── replit_integrations/auth/  # Auth module
├── shared/
│   ├── schema.ts              # Drizzle schemas
│   └── models/auth.ts         # Auth tables
└── attached_assets/           # Logo and team photos
```

### Database Schema
- **users**: User accounts (email/password with bcrypt hashing)
- **password_reset_tokens**: Token-based password reset flow
- **sessions**: Session storage for express-session
- **user_profiles**: Extended user profiles (student/patient info)
- **documents**: Uploaded document records
- **contact_inquiries**: Contact form submissions
- **news_articles**: News/updates articles for landing page

## API Endpoints

### Public
- `POST /api/contact` - Submit contact form inquiry
- `GET /api/news` - Get published news articles
- `GET /api/news/:id` - Get single published article

### Authentication
- `POST /api/auth/register` - Register new user (fullName, email, password)
- `POST /api/auth/login` - Login (email, password)
- `POST /api/auth/logout` - Logout
- `GET /api/auth/user` - Get current authenticated user
- `POST /api/auth/forgot-password` - Request password reset email
- `POST /api/auth/reset-password` - Reset password with token

### Authenticated (User)
- `GET /api/profile` - Get user profile
- `POST /api/profile` - Create/update profile
- `GET /api/documents` - List user documents
- `POST /api/documents` - Upload document (multipart/form-data)
- `DELETE /api/documents/:id` - Delete document
- `GET /uploads/:filename` - Download document file

### Admin
- `GET /api/admin/check` - Check if current user is admin
- `GET /api/admin/profiles` - List all profiles
- `PATCH /api/admin/profiles/:id/status` - Update application status
- `GET /api/admin/documents?userId=` - List user documents
- `PATCH /api/admin/documents/:id/status` - Update document status
- `GET /api/admin/inquiries` - List contact inquiries
- `GET /api/admin/news` - List all news articles (including drafts)
- `POST /api/admin/news` - Create news article
- `PATCH /api/admin/news/:id` - Update news article
- `DELETE /api/admin/news/:id` - Delete news article

## User Types

### Students
Required documents:
- International Passport Copy
- Primary/Secondary School Certificates
- WAEC/NECO Certificate
- Yellow Fever Vaccination

### Patients
Required documents:
- International Passport Copy
- Medical Reports & Diagnostics
- Emergency Contact Passport

Medical information fields:
- Diagnosis, Symptoms, Past Treatments, Reason for Pakistan

## Brand Identity
- **Primary Color**: Deep Green (#2F855A) - HSL: 145 63% 32%
- **Accent Color**: Orange (#ED8936) - HSL: 28 85% 57%
- **Font**: Plus Jakarta Sans (headings), Inter (body)

## Social Media
- LinkedIn: https://www.linkedin.com/company/consultafrique/
- Instagram: https://www.instagram.com/consult_afrique/
- Facebook: https://www.facebook.com/people/ConsultAfrique/61585775796347/

## Contact
- WhatsApp: +92 311 488 8878
- Phone: +234 707 911 9101
- Email: info@consultafrique.com

## Development

### Commands
- `npm run dev` - Start development server
- `npm run db:push` - Push schema changes to database
- `npm run build` - Build for production

### Environment Variables
- `DATABASE_URL` - PostgreSQL connection string
- `SESSION_SECRET` - Session encryption secret
- `ADMIN_EMAILS` - Comma-separated admin email addresses
- `SMTP_HOST` - SMTP server for password reset emails (optional)
- `SMTP_PORT` - SMTP port (optional)
- `SMTP_USER` - SMTP username (optional)
- `SMTP_PASS` - SMTP password (optional)
- `SMTP_FROM` - From email address for password reset emails (optional)
