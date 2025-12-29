# Taxis Administrator

Sistema de administración de taxis desarrollado con NestJS (Backend) y React + Vite (Frontend).

## 📋 Tabla de Contenidos

- [Características](#características)
- [Tecnologías](#tecnologías)
- [Requisitos Previos](#requisitos-previos)
- [Instalación](#instalación)
- [Configuración](#configuración)
- [Uso](#uso)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [API Endpoints](#api-endpoints)
- [Contribuir](#contribuir)

## ✨ Características

- 🔐 Autenticación y autorización con JWT
- 👥 Gestión de usuarios y roles
- 🚕 Administración de taxis
- 📊 Dashboard administrativo
- 🔒 Protección de rutas por roles (USER, ADMIN)
- 📝 Documentación API con Swagger
- 🎨 Interfaz moderna con React

## 🛠 Tecnologías

### Backend
- **NestJS** - Framework de Node.js
- **TypeScript** - Lenguaje de programación
- **TypeORM** - ORM para base de datos
- **PostgreSQL/MySQL** - Base de datos
- **JWT** - Autenticación
- **Bcrypt** - Encriptación de contraseñas
- **Swagger** - Documentación API
- **Class Validator** - Validación de DTOs

### Frontend
- **React 18** - Librería de UI
- **Vite** - Build tool
- **TypeScript** - Lenguaje de programación
- **React Router v7** - Enrutamiento
- **Axios** - Cliente HTTP
- **TailwindCSS** - Framework CSS (opcional)

## 📦 Requisitos Previos

- Node.js >= 18.x
- npm >= 9.x
- PostgreSQL/MySQL
- Git

## 🚀 Instalación

### 1. Clonar el repositorio

```bash
git clone <repository-url>
cd taxis_administrator
```

### 2. Instalar Backend

```bash
cd backend
npm install
```

### 3. Instalar Frontend

```bash
cd frontend
npm install
```

## ⚙️ Configuración

### Backend

1. Crear archivo `.env` en la carpeta `backend`:

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_DATABASE=taxis_db

# JWT
JWT_SECRET=your_secret_key_here
JWT_EXPIRES_IN=1d

# Server
PORT=3000
NODE_ENV=development
```

2. Crear la base de datos:

```bash
# PostgreSQL
createdb taxis_db

# O desde psql
psql -U postgres
CREATE DATABASE taxis_db;
```

3. Ejecutar migraciones (si existen):

```bash
npm run migration:run
```

### Frontend

1. Crear archivo `.env` en la carpeta `frontend`:

```env
VITE_API_URL=http://localhost:3000
```

## 🎯 Uso

### Desarrollo

#### Backend

```bash
cd backend

# Modo desarrollo
npm run start:dev

# La API estará disponible en http://localhost:3000
# Swagger UI en http://localhost:3000/api
```

#### Frontend

```bash
cd frontend

# Modo desarrollo
npm run dev

# La aplicación estará disponible en http://localhost:5173
```

### Producción

#### Backend

```bash
cd backend

# Build
npm run build

# Start
npm run start:prod
```

#### Frontend

```bash
cd frontend

# Build
npm run build

# Preview
npm run preview
```

## 📁 Estructura del Proyecto

```
taxis_administrator/
├── backend/
│   ├── src/
│   │   ├── auth/
│   │   │   ├── decorators/
│   │   │   │   └── auth.decorator.ts
│   │   │   ├── dto/
│   │   │   │   └── login.dto.ts
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   └── auth.module.ts
│   │   ├── users/
│   │   │   ├── dto/
│   │   │   │   ├── create-user.dto.ts
│   │   │   │   └── update-user.dto.ts
│   │   │   ├── entities/
│   │   │   │   ├── user.entity.ts
│   │   │   │   └── userRole.entity.ts
│   │   │   ├── users.controller.ts
│   │   │   ├── users.service.ts
│   │   │   └── users.module.ts
│   │   ├── roles/
│   │   │   └── entities/
│   │   │       └── role.entity.ts
│   │   ├── common/
│   │   │   ├── decorators/
│   │   │   │   └── activeUser.decorator.ts
│   │   │   ├── enums/
│   │   │   │   └── rol.enum.ts
│   │   │   └── interfaces/
│   │   │       └── requestWithUser.interface.ts
│   │   ├── app.module.ts
│   │   └── main.ts
│   ├── .env
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── hooks/
│   │   ├── utils/
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── .env
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
└── README.md
```

## 🔌 API Endpoints

### Auth

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| POST | `/auth/login` | Iniciar sesión | No |
| GET | `/auth/profile` | Obtener perfil del usuario | Sí |

### Users

| Método | Endpoint | Descripción | Auth | Rol |
|--------|----------|-------------|------|-----|
| GET | `/users` | Listar todos los usuarios | Sí | ADMIN |
| GET | `/users/:id` | Obtener usuario por ID | Sí | ADMIN/USER |
| POST | `/users` | Crear nuevo usuario | Sí | ADMIN |
| PATCH | `/users/:id` | Actualizar usuario | Sí | ADMIN |
| DELETE | `/users/:id` | Eliminar usuario (soft delete) | Sí | ADMIN |

### Ejemplo de Request

```bash
# Login
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "password123"
  }'

# Get Profile
curl -X GET http://localhost:3000/auth/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 🧪 Testing

### Backend

```bash
cd backend

# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

### Frontend

```bash
cd frontend

# Run tests
npm run test
```

## 📝 Scripts Disponibles

### Backend

```json
{
  "start": "nest start",
  "start:dev": "nest start --watch",
  "start:prod": "node dist/main",
  "build": "nest build",
  "test": "jest",
  "lint": "eslint \"{src,apps,libs,test}/**/*.ts\""
}
```

### Frontend

```json
{
  "dev": "vite",
  "build": "tsc && vite build",
  "preview": "vite preview",
  "lint": "eslint . --ext ts,tsx"
}
```

## 🔒 Roles y Permisos

- **USER**: Acceso básico, puede ver su propio perfil
- **ADMIN**: Acceso completo, puede gestionar usuarios y todo el sistema

## 👨‍💻 Autor

**Tu Nombre**
- GitHub: [@mizamarzes](https://github.com/mizamarzes)