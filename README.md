# StudyGenie — AI-Powered Study Assistant

## Concept

StudyGenie is an AI-assisted learning platform that helps learners plan study schedules, interact with a study chatbot, upload and manage study materials, generate quizzes, and track learning progress. It combines a TypeScript/Node backend (API + business logic) with a Next.js frontend to deliver a responsive dashboard-style learning experience.

## Introduction

This repository contains the full-stack application for StudyGenie. The system is designed to support individualized learning workflows: users can register and authenticate, upload study materials, ask the AI-powered chat for explanations or study suggestions, build study plans, take generated quizzes, and monitor progress over time.

Key user-facing ideas:
- Personalized study planning based on user inputs and past progress.
- Conversational assistance (explain concepts, summarize materials, recommend exercises).
- Material intake (upload documents) and quiz generation from content.
- Progress analytics and a simple dashboard to monitor learning.

## Main Components

- **Backend (API)** — located under `backend/`
  - **Entry & config**: `backend/src/index.ts` and `backend/tsconfig.json`
  - **Controllers**: `backend/src/controllers/` defines core endpoints and business logic for `authController.ts`, `chatController.ts`, `materialController.ts`, `plannerController.ts`, and `quizController.ts`.
  - **Models**: `backend/src/models/` contains data models such as `User.ts`, `StudyMaterial.ts`, `Quiz.ts`, `QuizQuestion.ts`, `Planner.ts`, and `Chat.ts`.
  - **Routes**: `backend/src/routes/` wires controllers into REST routes (`authRoutes.ts`, `chatRoutes.ts`, `materialRoutes.ts`, `plannerRoutes.ts`, `quizRoutes.ts`).
  - **Middleware & Utils**: `backend/src/middleware/auth.ts` for auth checks and `backend/src/utils/` for DB, GROQ queries, mail utilities.
  - **Uploads**: `backend/uploads/` stores user-submitted files (or acts as a staging area for uploaded materials).

- **Frontend (Next.js)** — located under `frontend/`
  - **App structure**: `frontend/src/app/` holds route-driven pages including auth flows (`(auth)`), dashboard sections (`(dashboard)`), and global layout.
  - **UI components**: `frontend/src/components/` includes layout and UI primitives (`MainLayout.tsx`, `Sidebar.tsx`, `TopNavbar.tsx`, and a small UI library under `ui/`).
  - **Client services & store**: `frontend/src/services/api.ts` and `frontend/src/store/useStore.ts` for API integrations and local state.
  - **Config & utilities**: `frontend/src/lib/config.ts` and `frontend/src/lib/utils.ts` centralize app configuration and helpers.

## Main Features & Flow

- **Main Features**
  - Authentication
  - Chat Assistance
  - Study Planner
  - Material Upload & Management
  - Quiz Generation
  - Progress Tracking
  - Analytics Dashboard
  - File Storage

- **Project Flow**
  - User Registration & Authentication
  - Upload Study Materials
  - Chat / Ask AI for Explanations
  - Generate Quizzes from Materials
  - Create / Adjust Study Plan
  - Study, Take Quizzes, and Review
  - Track Progress and Analytics
  - Iterate Plan Based on Feedback

## Why this README exists

This README provides a single-page orientation for developers, maintainers, and reviewers who need a quick understanding of what StudyGenie is, how its parts are organized, and what to look at next. It is intentionally focused on concept and structure rather than setup or how-to steps.

Primary goals:
- Give new contributors a fast mental model of the system.
- Point maintainers to the most important folders and files.
- Provide a checklist of documentation that should be expanded (APIs, diagrams, guides).

## Suggested additions (things that can be added next)

- **API Reference**: Full endpoint list with request/response examples and error codes.
- **Architecture Diagram**: High-level diagrams (component, deployment, sequence flows) showing interactions between frontend, backend, DB, and external services (AI, mail, storage).
- **Data Model Docs**: Schemas for `User`, `StudyMaterial`, `Quiz`, `QuizQuestion`, `Planner`, etc.
- **Environment & Secrets Reference**: List of required env vars (key names and intended purpose), without including secrets themselves.
- **Development Guide**: Branching strategy, linting/formatting rules, test commands and how to run them locally.
- **Contribution Guidelines**: How to open issues, PR template, code review checklist.
- **Testing Matrix**: What is covered by unit/integration tests and where tests live.
- **Deployment / CI Notes**: High-level steps for production deployment and CI pipeline overview.
- **Security Notes**: Known sensitive areas, data retention policy, and recommendations for secret management.
- **Roadmap & Changelog**: Planned features and a simple changelog template.

## Where to look first (developer quick start)

- Backend controllers: `backend/src/controllers/` — to understand API behavior.
- Frontend pages: `frontend/src/app/` and `frontend/src/components/layout/` — to see user flows and UI structure.
- Shared ideas/config: `frontend/src/lib/config.ts` and backend `utils/` — to find integration points and service configuration.

---

_This README focuses on project concept, component layout, and documentation next steps. If you want, I can expand this into a full developer guide, add an API reference stub, or generate an architecture diagram._
