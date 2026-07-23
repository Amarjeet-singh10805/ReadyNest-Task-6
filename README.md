# 🏥 MediCare HMS — Hospital Management System

A production-ready, full-stack Hospital Management System built with React, Node.js, Express, Prisma, and MySQL. Single-service deployment on Render.

---

## ✨ Features

- **Authentication** — JWT + Refresh tokens, bcrypt, role-based access
- **4 Roles** — Admin, Doctor, Receptionist, Patient
- **Patient Management** — Register, profiles, medical history, search/pagination
- **Doctor Management** — Profiles, departments, availability, consultation fees
- **Appointments** — Book, update, cancel, status workflows
- **Prescriptions** — Create, view, print/download
- **Billing** — Generate bills, record payments, invoice summary
- **Reports & Analytics** — Revenue, appointments, patient stats with charts
- **Dark Mode** — Full dark/light theme toggle
- **File Uploads** — Cloudinary integration for avatars and documents

---

## 🛠 Tech Stack

### Frontend
- React 19 + TypeScript + Vite
- Tailwind CSS + custom design tokens
- TanStack Query (data fetching & caching)
- React Router DOM v6
- Recharts (analytics charts)
- React Hot Toast

### Backend
- Node.js + Express + TypeScript
- Prisma ORM + MySQL
- JWT (access + refresh tokens)
- bcrypt, Helmet, rate-limiting
- Zod validation
- Multer + Cloudinary

---

## 📁 Project Structure

```
hospital-management-system/
├── client/                    # React frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/        # Sidebar, Topbar, DashboardLayout
│   │   │   └── ui/            # Reusable components
│   │   ├── pages/             # Route pages
│   │   ├── store/             # Auth context
│   │   └── lib/               # api.ts, utils.ts
│   └── package.json
├── server/
│   ├── src/
│   │   ├── modules/           # auth, patients, doctors, appointments...
│   │   │   └── [module]/
│   │   │       ├── *.controller.ts
│   │   │       ├── *.service.ts
│   │   │       ├── *.repository.ts
│   │   │       ├── *.routes.ts
│   │   │       └── *.validation.ts
│   │   ├── middleware/        # auth, errorHandler, upload
│   │   ├── config/            # prisma, cloudinary
│   │   └── utils/             # jwt, response helpers
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.ts
│   └── package.json
├── render.yaml
└── package.json
```

### Default Credentials
| Role | Email | Password |
|------|-------|----------|
| Admin | admin@hms.com | Admin@123 |
| Doctor | james.wilson@hms.com | Admin@123 |
| Patient | patient1@hms.com | Admin@123 |
| Receptionist | reception@hms.com | Admin@123 |

---
