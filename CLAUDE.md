# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Taxis Administrator** is a full-stack taxi fleet management system built with NestJS (backend) and React + Vite (frontend). The application provides administrative capabilities for managing drivers, vehicles, users with permission-based access control (roles with permissions editable from the Roles module), tarifas (rates), and a dashboard with analytics.

## Tech Stack

**Backend:**
- NestJS 11.x with TypeScript
- PostgreSQL via TypeORM
- JWT authentication with Passport
- Swagger documentation at `/docs`
- Environment config via `@nestjs/config`

**Frontend:**
- React 19 + TypeScript
- Vite build tool (dev server on port 5173)
- React Router v7 for routing
- Tailwind CSS v4 for styling
- Axios for HTTP requests (configured with auth interceptors)
- Radix UI components for UI primitives

**Mobile (`mobile/`):**
- Expo SDK 58 + React Native + TypeScript
- Expo Router (file-based routing in `src/app/`)
- Auth via `POST /api/auth/login/mobile` (token in body), stored with `expo-secure-store`, sent as Bearer header
- Styling with `StyleSheet` and theme palette in `src/theme/`
- Use `npx expo install <pkg>` to add dependencies (SDK-compatible versions)

**ML Service (`ml-service/`):**
- Python 3.11+ with FastAPI + scikit-learn + pandas, SQLAlchemy (read-only queries to the same PostgreSQL)
- Internal only: NestJS `predictions` module proxies `/api/predictions/*` with the `X-Internal-Key` header (`ML_SERVICE_URL` / `ML_SERVICE_KEY` in both `.env` files, same key)
- Models are saved in `ml-service/artifacts/` (joblib) and retrained daily and when the input data changes
- See `ml-service/README.md` for how to add a new model

## Directory Structure

```
backend/
  src/
    auth/                    # JWT auth, login endpoint, auth guards
    users/                   # User CRUD, DTOs, entities
    drivers/                 # Driver management
    vehicles/                # Vehicle management
    tarifas/                 # Rate management
    roles/                   # Role entities and permissions
    permissions/             # Permission management
    settings/                # System settings
    dashboard/               # Dashboard data/aggregations
    common/                  # Shared decorators, enums, filters, interceptors
    config/                  # Database config, seeders

frontend/src/
  modules/                   # Feature modules: auth, dashboard, users, drivers, vehicles, tarifas, profile, settings
    {feature}/
      components/            # Feature-specific React components
      services/              # API calls
      types/                 # TypeScript types
  components/                # Shared UI components (Layout, Header, Sidebar, etc.)
  contexts/                  # AuthContext for global auth state
  routes/                    # Route guards (ProtectedRoute, PublicRoute)
  lib/                       # Utilities (axios config, helpers)
```

## Key Architectural Decisions

**Backend:**
- Modular architecture with feature-based modules (auth, users, drivers, etc.)
- Global exception filter (`HttpExceptionFilter`) and response interceptor (`ResponseInterceptor`)
- Seed data auto-runs on startup via `runSeeds()`
- CORS enabled for frontend (configurable via `FRONTEND_URL` env var)
- TypeORM entity auto-discovery via glob pattern `**/*.entity{.ts,.js}`

**Frontend:**
- AuthContext provides global authentication state and login/logout
- ProtectedRoute wraps authenticated routes; redirects to /login if not authenticated
- Layout component wraps protected routes to show sidebar, header, etc.
- Module-based structure mirrors backend organization
- Axios instance configured in `lib/axios.ts` with auth token injection

## Setup and Configuration

### Backend Environment Variables
Create `.env` in `backend/`:
```
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=<password>
DB_NAME=taxis_db
JWT_SECRET=<your-secret>
JWT_EXPIRATION=1h
COOKIE_SECRET=<your-cookie-secret>
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

### Frontend Environment Variables
Create `.env` in `frontend/`:
```
VITE_API_URL=http://localhost:3000
```

## Common Commands

### Backend
```bash
cd backend

# Development with watch mode
npm run start:dev

# Build for production
npm run build

# Production runtime
npm run start:prod

# Linting (with auto-fix)
npm run lint

# Linting (check only)
npm run lint:check

# Run all unit tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage report
npm run test:cov

# End-to-end tests
npm run test:e2e

# Format code (Prettier)
npm run format

# Check code format
npm run format:check
```

### Frontend
```bash
cd frontend

# Development server (HMR enabled)
npm run dev

# Build for production
npm run build

# Preview production build locally
npm run preview

# Linting
npm run lint
```

### Mobile
```bash
cd mobile

npm start
npm run android
npm run typecheck
npx expo-doctor
```
### ML Service
```bash
cd ml-service

.venv/bin/uvicorn app.main:app --reload --port 8000
.venv/bin/python -m pytest
```

Set `EXPO_PUBLIC_API_URL` in `mobile/.env` (use the PC's LAN IP on physical devices, `10.0.2.2` on Android emulator).

## API Documentation

- **Swagger UI:** http://localhost:3000/docs (auto-generated when backend runs)
- **API Prefix:** `/api` (configured in main.ts)

Key endpoints:
- POST `/api/auth/login` - Login with email/password
- POST `/api/auth/login/mobile` - Login for mobile app (returns token in body)
- GET `/api/auth/profile` - Get authenticated user's profile
- GET/POST/PATCH/DELETE `/api/users` - User CRUD (admin-only)
- `/api/drivers`, `/api/vehicles`, `/api/tarifas` - Resource management

## Authentication Flow

1. Frontend: User logs in via `/api/auth/login` (email + password)
2. Backend: Returns JWT token
3. Frontend: AuthContext stores token; Axios interceptor adds `Authorization: Bearer <token>` to all requests
4. Backend: global `AuthGuard` validates the JWT (`{ sub, email, roleId }`) and sets `request.user`
5. Backend: global `PermissionsGuard` checks the route's `@Can(...)` against the role's permissions (cached 60 s); routes without `@Can`, `@Can.Authenticated()` or `@Public()` are denied
6. `GET /api/auth/profile` returns the user with `permissions: string[]`; frontend and mobile use `can(permission)` from `AuthContext`
7. Frontend: ProtectedRoute checks auth status; `PermissionRoute` and the sidebar filter by permission

## Authorization

- Permission catalog: `backend/src/permissions/permissions.catalog.ts` (`recurso.accion`). Adding a permission = add it there; the seed syncs the `permissions` table on startup
- `backend/src/authorization/`: `@Can()`, `@Can.Authenticated()`, `@Public()`, `PermissionsGuard`, `AuthorizationService.can/authorize` for checks inside services
- SUPERADMIN bypasses every check; only a SUPERADMIN can create, edit or delete SUPERADMIN users
- Roles API: `/api/roles/*` (create roles, `PUT /api/roles/:id/permissions`), catalog at `GET /api/permissions/get-all`
- Production schema changes: `backend/scripts/migrate-permissions.sql` (synchronize is off outside development)

## Database

- PostgreSQL database configured in `app.module.ts`
- TypeORM synchronization enabled in development mode
- Entities auto-discovered via glob pattern
- Seeders run automatically on app startup (`config/database/seeders`)

## Code Patterns

**Backend:**
- DTOs for request validation (in `dto/` folders)
- Entities define database schema (in `entities/` folders)
- Services contain business logic
- Controllers handle HTTP requests (decorated with `@Controller`, `@Get`, `@Post`, etc.)
- Global guards (`AuthGuard`, `PermissionsGuard`) protect every endpoint; declare access with `@Can('recurso.accion')`
- Decorators for extracting auth user: `@ActiveUser()` from `common/decorators/activeUser.decorator.ts`

**Frontend:**
- Components use React hooks (useState, useEffect, etc.)
- Services make API calls via Axios and return typed responses
- Types/interfaces stored in `types/` folders
- AuthContext provides auth state; components consume via `useAuth()` hook
- Routing: Pages are in `modules/*/` and mounted in `routes/AppRouter.tsx`

## Common Development Workflows

**Adding a new feature:**
1. Backend: Create new module (e.g., `src/invoices/`) with controller, service, entity, DTOs
2. Import module in `app.module.ts`
3. Frontend: Create corresponding module in `src/modules/invoices/` with components, services, types
4. Add route in `routes/AppRouter.tsx`
5. Wire up navigation in `components/AppSideBar.tsx`

**Adding authorization to a route:**
- Backend: add `@Can('recurso.accion')` (from `authorization/can.decorator.ts`); use `@Can.Authenticated()` for any signed-in user and `@Public()` for open routes
- New permission: add it to `permissions/permissions.catalog.ts` and assign it to roles from the Roles view
- Frontend/mobile: hide UI with `can('recurso.accion')` from `useAuth()`; web routes use `<PermissionRoute permission="...">`

**Database migrations:**
- TypeORM synchronization is automatic in development
- For production, consider explicit migrations (not yet configured)

## Testing

- Backend uses Jest with ts-jest
- Test files: `**/*.spec.ts` in `src/`
- Frontend uses standard test setup (Vite + ESLint)

## Notes

- Frontend uses dark theme by default (configurable via `ThemeProvider`)
- Soft deletes implemented for users (deletedAt timestamp)
- CORS configured to allow frontend origin; update `FRONTEND_URL` env var if deploying
- API validation via `ValidationPipe` in main.ts (whitelist + forbid non-whitelisted properties)

### Coding Rules
- No utilices comentarios
- Responde en español
