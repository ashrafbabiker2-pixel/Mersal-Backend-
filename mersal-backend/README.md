# MERSAL Backend

Backend مركزي لمنظومة مرسال.

يربط بين:

- تطبيق العملاء (Customer Mobile App)
- تطبيق الموظفين والمناديب والفنيين (Employee / Technician App)
- منصة مرسال للإدارة والتحكم (Mersal Admin Platform)

## Technology Stack

- Node.js & Express.js
- MongoDB & Mongoose
- JSON Web Tokens (JWT)
- bcryptjs for Password Hashing
- CORS & Security Middlewares

## Installation & Setup

```bash
cd mersal-backend
npm install
```

### Environment Configuration

قم بنسخ `.env.example` إلى `.env`:

```bash
cp .env.example .env
```

ثم عدل القيم حسب بيئتك (مثل `MONGO_URI` و `JWT_SECRET`).

### Run in Development

```bash
npm run dev
```

### Run in Production

```bash
npm start
```

## API Endpoints

- **Root Info:** `GET http://localhost:5000/`
- **Health Check:** `GET http://localhost:5000/health`
- **API Directory:** `GET http://localhost:5000/api`

### Core API Modules (Upcoming Batches)

- `/api/v1/auth` - المصادقة وتسجيل الدخول
- `/api/v1/users` - إدارة المستخدمين والملفات الشخصية
- `/api/v1/services` - خدمات مرسال (إدارة أملاك، شراء وتوصيل، صيانة وتشطيب)
- `/api/v1/orders` - دورة حياة الطلبات والمهام الميدانية
- `/api/v1/employees` - مهام الموظفين والتتبع الميداني
- `/api/v1/admin` - لوحة التحكم والإحصائيات

## Project Structure

```text
mersal-backend/
├── src/
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   ├── middleware/
│   │   ├── error_middleware.js
│   │   └── not_found_middleware.js
│   ├── models/
│   ├── routes/
│   ├── utils/
│   └── server.js
├── .env.example
├── .gitignore
├── package.json
└── README.md
```
