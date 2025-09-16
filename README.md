# Buyer Lead Intake System

A comprehensive web application built with Next.js for capturing, managing, and tracking real estate buyer leads. This system provides a complete solution for real estate businesses to manage their lead pipeline efficiently.

## 📋 Table of Contents

- [Features](#features)
- [Technology Stack](#technology-stack)
- [Local Setup](#local-setup)
- [Design Choices](#design-choices)
- [API Endpoints](#api-endpoints)
- [Features Implemented](#features-implemented)
- [Testing](#testing)
- [Project Structure](#project-structure)

## ✨ Features

### Core Functionality
- **Lead Management**: Create, view, edit, and track buyer leads
- **Advanced Search & Filtering**: Search by name, phone, email with filters for city, property type, status, and timeline
- **Server-Side Pagination**: Efficient data loading with 10 leads per page
- **CSV Import/Export**: Bulk import leads and export filtered data
- **Change Tracking**: Complete audit trail of all lead modifications
- **Concurrency Control**: Prevents data loss from simultaneous edits

### User Experience
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Real-time Validation**: Client-side and server-side validation with immediate feedback
- **Error Handling**: Global error boundary and user-friendly error messages
- **Rate Limiting**: Prevents abuse with configurable limits
- **Demo Authentication**: Simple login system for demonstration

## 🛠 Technology Stack

- **Framework**: Next.js 15 with App Router and TypeScript
- **Database**: SQLite with Prisma ORM
- **Validation**: Zod for schema validation
- **Authentication**: NextAuth.js with demo login
- **Styling**: Tailwind CSS with responsive design
- **Forms**: React Hook Form with Zod resolver
- **Icons**: Lucide React
- **Notifications**: Sonner for toast messages
- **Testing**: Jest with Testing Library
- **Rate Limiting**: rate-limiter-flexible

## 🚀 Local Setup

### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager

### Installation Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd buyer-lead-intake
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```env
   DATABASE_URL="file:./dev.db"
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-development-secret-key-change-in-production"
   ```

4. **Initialize the database**
   ```bash
   npx prisma migrate dev --name init
   npx prisma generate
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Access the application**
   Open [http://localhost:3000](http://localhost:3000) in your browser (or the port shown in terminal if 3000 is occupied)

### First Time Setup
1. Click "Log in as Demo User" on the sign-in page
2. You'll be redirected to the dashboard
3. Start creating leads or import sample data

## 🏗 Design Choices

### Architecture Decisions

**1. Next.js App Router**
- Chosen for its file-based routing, server components, and excellent developer experience
- Server-side rendering ensures fast initial page loads and better SEO
- API routes provide a clean backend structure

**2. Prisma with SQLite**
- Prisma offers excellent TypeScript integration and migration management
- SQLite chosen for simplicity and portability in development
- Easy to migrate to PostgreSQL/MySQL for production

**3. Validation Strategy**
- Shared Zod schema between client and server ensures consistency
- Real-time client validation provides immediate feedback
- Server-side validation acts as the authoritative source of truth
- Conditional validation (BHK required for apartments/villas) implemented as custom refinements

**4. Authentication**
- NextAuth.js provides a robust, production-ready authentication system
- Demo login simplifies testing while maintaining security patterns
- Session-based authentication with JWT tokens

**5. State Management**
- Server-side rendering eliminates need for complex client state
- URL-based state for filters and pagination ensures shareable URLs
- React Hook Form for efficient form state management

### Database Design

**Buyer Model**: Core entity with comprehensive lead information
- UUID primary keys for better scalability
- Indexed fields for common queries (status, city, propertyType)
- Flexible budget fields (optional min/max)
- Tags stored as comma-separated strings for simplicity

**BuyerHistory Model**: Audit trail for all changes
- JSON diff storage for flexibility
- User tracking for accountability
- Cascading deletes maintain referential integrity

**User Model**: Simple user management
- Supports future expansion (roles, permissions)
- Linked to lead ownership and change tracking

### Performance Optimizations

**1. Database Queries**
- Strategic indexing on frequently queried fields
- Pagination to limit data transfer
- Efficient search using database-level text search

**2. Rate Limiting**
- Protects against abuse and ensures fair usage
- Different limits for regular operations vs. bulk imports
- Memory-based for simplicity (can be upgraded to Redis)

**3. Concurrent Access**
- Optimistic concurrency control prevents lost updates
- User-friendly error messages when conflicts occur
- Automatic refresh suggested for latest data

## 📡 API Endpoints

### Buyers
- `GET /api/buyers` - List buyers with pagination and filtering
- `POST /api/buyers` - Create new buyer
- `PUT /api/buyers/[id]` - Update existing buyer
- `GET /api/buyers/export` - Export filtered buyers as CSV
- `POST /api/buyers/import` - Import buyers from CSV

### Authentication
- `GET/POST /api/auth/[...nextauth]` - NextAuth.js authentication endpoints

## ✅ Features Implemented

### ✅ Core Requirements
- [x] **Project Setup**: Next.js with TypeScript, Prisma, and SQLite
- [x] **Data Models**: Buyer and BuyerHistory with proper relationships
- [x] **Validation**: Zod schemas with conditional validation
- [x] **Authentication**: Demo login system with NextAuth.js

### ✅ Pages and Functionality
- [x] **Create Lead Page** (`/buyers/new`)
  - [x] Comprehensive form with all required fields
  - [x] Conditional BHK field for apartments/villas
  - [x] Real-time client-side validation
  - [x] Server-side validation with error handling

- [x] **List & Search Page** (`/buyers`)
  - [x] Server-side rendering for performance
  - [x] Pagination (10 leads per page)
  - [x] Advanced filtering (city, property type, status, timeline)
  - [x] Debounced search across multiple fields
  - [x] URL-synced state for shareable filters

- [x] **View & Edit Page** (`/buyers/[id]`)
  - [x] Detailed view of all lead information
  - [x] In-place editing with same validation rules
  - [x] Concurrency control with conflict detection
  - [x] Change history display (last 5 changes)

### ✅ CSV Import/Export
- [x] **CSV Export**
  - [x] Respects current filters and search
  - [x] Comprehensive data export with timestamps
  - [x] Proper CSV formatting and headers

- [x] **CSV Import** (`/buyers/import`)
  - [x] File upload with validation
  - [x] Batch processing (max 200 rows)
  - [x] Detailed error reporting per row
  - [x] Transactional imports (all or nothing)
  - [x] Template download for proper formatting

### ✅ Quality Requirements
- [x] **Authorization**: Owner-based access control for editing
- [x] **Rate Limiting**: API protection against abuse
- [x] **Error Handling**: Global error boundary and user-friendly messages
- [x] **Unit Tests**: Validation logic testing with Jest
- [x] **Accessibility**: Proper labels and keyboard navigation
- [x] **Empty States**: Helpful messages when no data found

### ✅ Additional Features
- [x] **Dashboard**: Statistics and recent leads overview
- [x] **Responsive Design**: Mobile-friendly interface
- [x] **Real-time Feedback**: Toast notifications for user actions
- [x] **Status Indicators**: Color-coded status badges
- [x] **Navigation**: Clean, intuitive navigation structure

## 🧪 Testing

### Running Tests
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch
```

### Test Coverage
- **Validation Logic**: Comprehensive tests for Zod schemas
- **Business Rules**: Budget validation and conditional requirements
- **Edge Cases**: Phone number formats and enum validations

### Test Structure
- **Unit Tests**: Focus on validation and business logic
- **Integration Tests**: API endpoints (can be added)
- **E2E Tests**: User workflows (can be added with Playwright)

## 📁 Project Structure

```
buyer-lead-intake/
├── app/                          # Next.js App Router
│   ├── api/                      # API routes
│   │   ├── auth/                 # Authentication endpoints
│   │   └── buyers/               # Buyer CRUD and import/export
│   ├── buyers/                   # Buyer-related pages
│   │   ├── new/                  # Create new lead
│   │   ├── import/               # CSV import page
│   │   └── [id]/                 # View/edit specific lead
│   ├── auth/                     # Authentication pages
│   ├── globals.css               # Global styles
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Dashboard/home page
│   ├── error.tsx                 # Global error boundary
│   └── not-found.tsx             # 404 page
├── components/                   # Reusable components
│   ├── navigation.tsx            # Main navigation
│   ├── buyer-filters.tsx         # Search and filter controls
│   ├── pagination.tsx            # Pagination component
│   ├── export-button.tsx         # CSV export functionality
│   ├── buyer-edit-form.tsx       # Lead editing form
│   └── buyer-history.tsx         # Change history display
├── lib/                          # Utility libraries
│   ├── validations/              # Zod schemas
│   ├── db.ts                     # Prisma client
│   ├── rate-limiter.ts           # Rate limiting configuration
│   └── types.ts                  # TypeScript type definitions
├── prisma/                       # Database schema and migrations
│   ├── schema.prisma             # Database schema
│   └── migrations/               # Migration files
├── __tests__/                    # Test files
│   └── validation.test.ts        # Validation logic tests
├── types/                        # Global type definitions
└── Configuration files           # Next.js, Tailwind, Jest, etc.
```

## 🚀 Production Deployment

### Environment Variables
Update `.env` for production:
```env
DATABASE_URL="your-production-database-url"
NEXTAUTH_URL="https://your-domain.com"
NEXTAUTH_SECRET="strong-production-secret"
```

### Database Migration
For production databases (PostgreSQL/MySQL):
1. Update `prisma/schema.prisma` datasource
2. Run `npx prisma migrate deploy`
3. Run `npx prisma generate`

### Performance Considerations
- Enable Redis for rate limiting in production
- Configure proper database connection pooling
- Set up monitoring and logging
- Implement proper backup strategies

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License - see the package.json file for details.

---

**Built with ❤️ using Next.js, TypeScript, and modern web technologies.**