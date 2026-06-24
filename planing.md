# Project: Learnova

Build a scalable EdTech platform called "Learnova".

The platform starts with Teacher Assistant Exam preparation (Thailand) but must be designed to expand into:

- Government exams (all categories)
- Professional certifications
- Online courses
- Video learning
- Articles
- AI Tutor (future)
- Premium content (future)
- Mock exams
- Learning analytics
- Mobile app (React Native / Expo in future)

This is a content-first SEO platform, not a dashboard system.

---

# Tech Stack (MVP Phase)

Frontend + Backend:
- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS v4
- shadcn/ui

Database:
- PostgreSQL

ORM:
- Prisma

Storage:
- Cloudflare R2 (for images, PDFs, future videos)

Authentication:
- NextAuth (Auth.js)

Caching (future ready):
- Redis (not required in MVP)

Deployment:
- Docker (optional for local/dev)

---

# Architecture Principle

Use a "Monolithic Fullstack Next.js Architecture"

Next.js handles:
- UI Rendering (SEO pages)
- API Routes (Route Handlers)
- Server Actions
- Authentication integration

No separate backend service (NestJS is NOT used in MVP).

Architecture:

Browser / Mobile App
        ↓
     Next.js
        ↓
   Prisma ORM
        ↓
 PostgreSQL

React Native (future)
        ↓
     Next.js API Routes

---

# Core Design Philosophy

Learnova is a Content Platform.

NOT:
- ERP system
- Admin dashboard system

Public Pages must be SEO-first and content-driven.

---

# Layout Strategy

Public Layout:
- Header
- Search bar (important)
- Navigation (subjects/categories)
- Content
- Footer

Admin Layout:
- Sidebar (only inside /admin)
- Dashboard

Member Layout:
- Profile
- History
- Saved exams

IMPORTANT:
No sidebar in public pages.

---

# Phase 1 MVP (Must Build First)

Focus ONLY on Teacher Assistant Exam system.

Features:

1. Home Page (SEO landing)
2. Subject Listing Page
3. Subject Detail Page
4. Exam Set Listing Page
5. Exam Detail Page
6. Exam Practice System
7. Result Page
8. Search System
9. Authentication (Login/Register)
10. User Profile
11. Exam History

DO NOT build:
- Courses
- Videos
- AI Tutor
- Subscription system

Only prepare schema for future expansion.

---

# SEO Requirements (CRITICAL)

SEO is the highest priority.

Must support:

- Server Components
- Dynamic Metadata API
- Open Graph tags
- Twitter Cards
- JSON-LD structured data
- Sitemap generation
- Robots.txt
- Canonical URLs

URL structure:

/subjects
/subjects/[slug]

/exams
/exams/[slug]

/exams/[slug]/practice

/articles
/articles/[slug]

/courses
/courses/[slug]

---

# Database Design (Prisma)

Subject:
- id
- name
- slug
- description
- isActive

Category:
- id
- name
- slug

ExamSet:
- id
- subjectId
- categoryId
- title
- slug
- year
- description
- totalQuestions
- isPublished
- isPremium

Question:
- id
- examSetId
- content
- imageUrl
- explanation
- difficulty

Choice:
- id
- questionId
- label
- content
- isCorrect

User:
- id
- email
- username
- displayName
- avatarUrl
- role

UserExamAttempt:
- id
- userId
- examSetId
- score
- totalQuestions
- startedAt
- completedAt

UserAnswer:
- id
- attemptId
- questionId
- selectedChoiceId
- isCorrect

---

# Future-Ready Tables (DO NOT IMPLEMENT YET)

Prepare schema only:

- Article
- Course
- VideoLesson
- LessonSection
- Enrollment
- SubscriptionPlan
- UserSubscription
- Bookmark
- Comment
- Notification
- Analytics

---

# Exam System Requirements

Support:

- Start Exam
- Timer system
- Submit answers
- Auto scoring
- Explanation view
- Review mode
- History tracking
- Performance analytics

---

# Search System

Support searching:

- Subject name
- Exam set name
- Year
- Question content

Prepare for PostgreSQL Full Text Search.

---

# Cloudflare R2

Store only:

- Images (questions, articles)
- PDFs
- Future videos

Database must store only URLs.

---

# Admin System

Admin can manage:

- Subjects
- Categories
- Exams
- Questions
- Users
- Articles

Admin is separate route: /admin

---

# Mobile Strategy (IMPORTANT)

React Native (Expo) will be added later.

It will consume:

- Next.js API Routes (/api/v1/*)

So API design must be clean and stable.

---

# API Design (Next.js Route Handlers)

Create versioned API:

/api/v1/auth
/api/v1/users
/api/v1/subjects
/api/v1/exams
/api/v1/search

---

# Deliverables

Generate:

1. Next.js project structure (feature-based)
2. Prisma schema (production ready)
3. API routes structure (/api/v1)
4. Public layouts (SEO optimized)
5. Admin layout
6. Authentication flow
7. Database design
8. R2 integration service
9. Search architecture (Postgres FTS ready)
10. Coding standards
11. Naming conventions
12. Deployment-ready Docker setup
13. Sitemap + SEO utilities