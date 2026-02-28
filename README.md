# 🦷 ToothToday

<div align="center">

![ToothToday Logo](https://img.shields.io/badge/ToothToday-Dental%20Appointment%20System-blue?style=for-the-badge&logo=medical)

**Online Dental Appointment System**

A modern, full-stack dental appointment booking system designed to streamline clinic operations and enhance patient experience.

[![Go](https://img.shields.io/badge/Go-00ADD8?style=for-the-badge&logo=go&logoColor=white)](https://golang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)

</div>

## 📋 Table of Contents

- [About](#-about)
- [Features](#-features)
- [Project Architecture](#-project-architecture)
- [Technology Stack](#-technology-stack)
- [Usage](#-usage)

## 📖 About

ToothToday is a comprehensive online dental appointment system designed and developed from scratch to simulate real dental clinic workflows. The system focuses on providing a seamless experience for both patients and clinic administrators, with features like real-time slot management, automated notifications, and intuitive booking interfaces.

### Key Objectives

- **Patient-Centric Design**: Easy-to-use interface for booking appointments 24/7
- **Clinic Efficiency**: Automated scheduling and management reduce administrative workload
- **Real-Time Management**: Live slot availability and status updates
- **Smart Notifications**: LINE integration for timely reminders and updates

## ✨ Features

### 👤 Patient Features

- **Authentication & Profile**
  - User registration and login with JWT authentication
  - Personal profile management
  - Appointment history tracking
  - LINE account integration

- **Appointment Booking**
  - Service selection with duration-based slot calculation
  - Real-time doctor availability checking
  - Flexible date and time selection
  - Image upload and note addition
  - Color-coded slot status (Available, Almost Full, Full, Closed)

- **Appointment Management**
  - View current and past appointments
  - Cancel appointments (before scheduled time)
  - Receive booking confirmations and reminders

### 🔧 Smart Slot Management

- **Intelligent Time Allocation**
  - 1-hour slots per doctor for focused patient care
  - Automatic duration rounding (e.g., 1h 20m → 2h)
  - Multi-doctor availability checking

- **Real-Time Status Updates**
  - Dynamic slot availability based on bookings
  - Visual indicators for slot status
  - Automatic slot release for no-shows (10-minute window)

### 📱 LINE Integration

- **Connect/Disconnect LINE accounts**
- **Booking confirmations and cancellations**
- **No-show alerts (10 minutes after appointment time)**
- **Service completion notifications**
- **Advance reminders (1 hour and 24 hours before appointment)**

### ⚙️ Automated Jobs

- **Slot Release System**: Automatically release slots for no-shows
- **Status Updates**: Mark appointments as completed after treatment time
- **Reminder System**: Automated appointment reminders

### 🛠️ Admin Panel

- **Service Management**: CRUD operations for dental services with pricing, duration, and descriptions
- **Doctor Management**: Profile management, scheduling, and availability configuration
- **Appointment Management**: View, filter, update status, and manage appointments
- **Dashboard**: Overview of clinic operations and statistics

## 🏗️ Project Architecture

```
ToothToday/
├── frontend/                          # Next.js Frontend Application
│   ├── src/
│   │   ├── app/                      # App Router Pages
│   │   │   ├── booking/              # Appointment booking page
│   │   │   ├── dashboard/            # Admin dashboard
│   │   │   ├── profile/              # User profile
│   │   │   ├── services/             # Services listing
│   │   │   └── queue/                # Queue status view
│   │   ├── components/
│   │   │   ├── features/             # Feature-specific components
│   │   │   │   ├── auth/             # Authentication components
│   │   │   │   ├── booking/          # Booking components
│   │   │   │   ├── dashboard/        # Admin components
│   │   │   │   └── profile/          # Profile components
│   │   │   └── common/               # Shared components
│   │   ├── lib/                      # Utilities and API client
│   │   └── types/                    # TypeScript type definitions
│   ├── public/                       # Static assets
│   └── package.json
│
├── backend/                          # Go Backend API
│   ├── cmd/
│   │   └── api/                      # Application entry point
│   │       └── main.go
│   ├── internal/
│   │   ├── handlers/                 # HTTP request handlers
│   │   │   ├── auth_handler.go
│   │   │   ├── appointment_handler.go
│   │   │   ├── doctor_handler.go
│   │   │   ├── service_handler.go
│   │   │   └── user_handler.go
│   │   ├── services/                 # Business logic layer
│   │   │   ├── auth_service.go
│   │   │   ├── appointment_service.go
│   │   │   ├── doctor_service.go
│   │   │   ├── service_service.go
│   │   │   ├── user_service.go
│   │   │   ├── line_service.go
│   │   │   └── appointment/           # Appointment-specific services
│   │   │       ├── appointment_crud.go
│   │   │       └── appointment_slot.go
│   │   ├── repository/               # Data access layer
│   │   │   ├── auth_repository.go
│   │   │   ├── appointment_repository.go
│   │   │   ├── doctor_repository.go
│   │   │   ├── service_repository.go
│   │   │   └── user_repository.go
│   │   ├── models/                   # Data models
│   │   │   ├── auth.go
│   │   │   ├── appointment.go
│   │   │   ├── doctor.go
│   │   │   ├── service.go
│   │   │   └── user.go
│   │   ├── middleware/               # HTTP middleware
│   │   │   └── auth.go
│   │   ├── jobs/                     # Scheduled jobs
│   │   │   └── scheduler.go
│   │   ├── clients/                  # External service clients
│   │   │   ├── line_service.go
│   │   │   └── gcs_client.go
│   │   └── db/                       # Database connection
│   │       └── postgres.go
│   ├── Dockerfile
│   ├── go.mod
│   └── go.sum
│
├── db/                               # Database schemas and migrations
├── compose.debug.yaml                # Docker Compose configuration
├── .dockerignore
├── .gitignore
└── README.md
```

## 🛠️ Technology Stack

### Frontend

| Technology | Description |
|------------|-------------|
| **Next.js** | Full-stack React framework with App Router |
| **TypeScript** | Type-safe JavaScript development |
| **Tailwind CSS** | Utility-first CSS framework |
| **Axios** | HTTP client for API calls |
| **SweetAlert** | Beautiful alert dialogs |
| **Lucide React** | Modern icon library |
| **Font Awesome** | Comprehensive icon set |

### Backend

| Technology | Description |
|------------|-------------|
| **Go 1.24** | High-performance programming language |
| **Gin Framework** | Lightweight HTTP web framework |
| **JWT** | JSON Web Token authentication |
| **bcrypt** | Password hashing |
| **LINE Bot SDK** | LINE messaging integration |
| **Google Cloud Storage** | File storage service |

### Database & Storage

| Technology | Description |
|------------|-------------|
| **PostgreSQL** | Primary database (hosted on Supabase) |
| **pgx/v5** | PostgreSQL driver for Go |

### DevOps & Deployment

| Technology | Description |
|------------|-------------|
| **Vercel** | Frontend deployment platform |
| **Docker** | Containerization platform |
| **Google Artifact Registry** | Container registry |
| **Google Cloud Run** | Serverless container platform |



## 📖 Usage

### For Patients

1. **Register/Login**: Create an account or log in with existing credentials
2. **Browse Services**: View available dental services and doctor profiles
3. **Book Appointment**: Select service, date, time, and preferred doctor
4. **Manage Appointments**: View history, cancel upcoming appointments
5. **Connect LINE**: Link your LINE account for notifications

### For Administrators

1. **Access Dashboard**: Log in as admin to access the management panel
2. **Manage Services**: Add, view, edit, or remove dental services
3. **Manage Doctors**: Add, view, edit, or remove doctor profiles and schedules
4. **Manage Appointments**: View, filter by date, update appointment statuses and delete appointment



---

<div align="center">

[⬆ Back to top](#-toothtoday)

</div>
