# student-crud-api# 
# Student CRUD REST API

A RESTful API for managing student records built with Node.js, Express, and PostgreSQL.

## Tech Stack
- **Runtime:** Node.js
- **Framework:** Express.js  
- **Database:** PostgreSQL
- **Testing:** Jest + Supertest
- **Logging:** Winston

## Prerequisites
- Node.js >= 18
- PostgreSQL >= 14

## Local Setup

### 1. Clone the repository
git clone https://github.com/YOUR-USERNAME/student-crud-api.git
cd student-crud-api

### 2. Install dependencies
make install

### 3. Configure environment
cp .env.example .env
# Edit .env with your database credentials

### 4. Run database migration
make migrate

### 5. Start the server
make dev        # Development (auto-reload)
make run        # Production

## API Endpoints

| Method | Endpoint                   | Description         |
|--------|----------------------------|---------------------|
| GET    | /healthcheck               | Health check        |
| POST   | /api/v1/students           | Create student      |
| GET    | /api/v1/students           | Get all students    |
| GET    | /api/v1/students/:id       | Get student by ID   |
| PUT    | /api/v1/students/:id       | Update student      |
| DELETE | /api/v1/students/:id       | Delete student      |

## Running Tests
make test