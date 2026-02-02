# ConsultAfrique - Education & Medical Tourism Portal

## Overview
ConsultAfrique is a comprehensive web platform connecting African students and patients with educational institutions and healthcare facilities in Pakistan. The platform provides a public marketing frontend, secure client portal, and admin dashboard for managing applications.

## Recent Changes
- **February 2, 2026**: Added Admin Dashboard
  - View all user applications with status management
  - Update application status (pending, in review, approved, rejected)
  - View and verify uploaded documents for each user
  - View contact form inquiries
  - Access via /admin route or "Admin Panel" in user dashboard sidebar

- **February 2, 2026**: Added WAEC/NECO Eligibility Calculator
  - Calculator for Nigerian students to check admission eligibility
  - Grade-to-marks conversion based on IBCC 2026 standards
  - Course-specific subject validation (Medicine, Engineering, Computer Science)
  - Equivalence scaling with 10% IBCC deduction
  - Navigation links in navbar and services section

- **January 31, 2026**: Initial MVP implementation
  - Landing page with hero carousel, services, team section, and contact form
  - User authentication via Replit Auth
  - Client dashboard with profile management and document uploads
  - Admin API endpoints for managing applications
  - Brand colors: Deep Green (#2F855A) primary, Orange (#ED8936) accent

## Architecture

### Tech Stack
- **Frontend**: React + TypeScript + Vite + TailwindCSS + Shadcn/UI
- **Backend**: Express.js + TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Replit Auth (OpenID Connect)
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
- **users**: User accounts (managed by Replit Auth)
- **sessions**: Session storage for auth
- **user_profiles**: Extended user profiles (student/patient info)
- **documents**: Uploaded document records
- **contact_inquiries**: Contact form submissions

## API Endpoints

### Public
- `POST /api/contact` - Submit contact form inquiry

### Authenticated (User)
- `GET /api/auth/user` - Get current user
- `GET /api/profile` - Get user profile
- `POST /api/profile` - Create/update profile
- `GET /api/documents` - List user documents
- `POST /api/documents` - Upload document (multipart/form-data)
- `DELETE /api/documents/:id` - Delete document
- `GET /uploads/:filename` - Download document file

### Admin
- `GET /api/admin/profiles` - List all profiles
- `PATCH /api/admin/profiles/:id/status` - Update application status
- `GET /api/admin/documents?userId=` - List user documents
- `PATCH /api/admin/documents/:id/status` - Update document status
- `GET /api/admin/inquiries` - List contact inquiries

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
- `ISSUER_URL` - OIDC issuer URL (Replit)
