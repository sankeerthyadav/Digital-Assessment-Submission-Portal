# 📚 Digital Assessment Submission Portal

The Digital Assessment Submission Portal is a full-stack MERN web application developed to modernize and simplify the academic assessment process between teachers and students. The platform provides a secure and efficient environment where teachers can create and manage assessments, review student submissions, and provide feedback digitally, while students can submit assignments, track progress, and access evaluation results seamlessly.

Built using MongoDB, Express.js, React.js, and Node.js, the system follows a role-based architecture with secure authentication, protected routes, file upload functionality, and responsive user interfaces. The project aims to replace traditional manual workflows with a centralized digital solution that improves accessibility, organization, communication, and overall efficiency in educational assessment management.

---

## 🚀 Features

### 🔐 Authentication & Authorization
- JWT-based secure authentication  
- Role-based access control (Teacher / Student)  
- Protected routes for each role  
- Secure password hashing using bcrypt  

---

## 🧑‍🏫 Teacher Module

- 📊 Dashboard with analytics (total, reviewed, pending, issues)  
- 📝 Create assessments with file upload & deadlines  
- 📚 Subject management integrated with assessments  
- 📋 Track all assessments with filters  
- ✅ Review student submissions with status:
  - Pending  
  - Reviewed  
  - Issue (with rejection reason)  
- ✔️ Mark submissions as Checked  
- 💬 Provide feedback (marks, grade, comments)  
- 📥 Export submissions (CSV & ZIP)  

---

## 🎓 Student Module

- 📊 Dashboard overview  
- 📄 View and download assessments  
- 📤 Submit assignments with file upload  
- 🧾 Track submission status  
- ⚠️ View issue reasons (if rejected)  
- 💬 View feedback (marks, grade, comments)  

---

## 📁 File Handling

- Upload files using Multer  
- Unique file naming to avoid conflicts  
- Download support for assessments & submissions  
- Bulk download as ZIP  

---

## 🔎 Advanced Features

- 🔍 Advanced filtering (subject, status, student, date)  
- ⏳ Deadline enforcement (late submission restriction)  
- 📊 Export data in CSV format  
- 📦 Bulk download submissions in ZIP format  
- 🎯 Clean and consistent API responses  

---

## 🎨 UI/UX Highlights

- Fully responsive modern UI (Tailwind CSS)  
- Professional dashboard design  
- Collapsible sidebar with smooth transitions  
- Role-based sidebar rendering  
- Clean cards, tables, and forms  
- Toast notifications & loading states  

---

## 🏗️ Tech Stack

### Frontend
- React.js  
- React Router  
- Axios  
- Tailwind CSS  

### Backend
- Node.js  
- Express.js  
- MongoDB + Mongoose  

### Other Tools
- JWT (Authentication)  
- Multer (File Uploads)  
- bcrypt (Password hashing)  

---

## 📂 Project Structure

```bash
📦 Mern-Stack-project
├── 📁 server
│   ├── 📁 config
│   │   └── 🗄️ db.js
│   │
│   ├── 📁 controllers
│   │   ├── 🔐 authController.js
│   │   ├── 👨‍🏫 teacherController.js
│   │   ├── 🎓 studentController.js
│   │   └── 📂 fileController.js
│   │
│   ├── 📁 models
│   │   ├── 👤 User.js
│   │   ├── 📘 Subject.js
│   │   ├── 📝 Assessment.js
│   │   ├── 📤 Submission.js
│   │   └── 💬 Feedback.js
│   │
│   ├── 📁 routes
│   │   ├── 🛣️ authRoutes.js
│   │   ├── 🛣️ teacherRoutes.js
│   │   ├── 🛣️ studentRoutes.js
│   │   ├── 🛣️ fileRoutes.js
│   │   └── 🗑️ deleteRoutes.js
│   │
│   ├── 📁 middleware
│   │   ├── 🛡️ authMiddleware.js
│   │   ├── 👥 roleMiddleware.js
│   │   └── ⬆️ uploadMiddleware.js
│   │
│   ├── 📁 uploads
│   ├── ⚙️ .env
│   ├── 🚀 server.js
│   └── 📦 package.json
│
├── 📁 Client
│   ├── 📁 public
│   │
│   ├── 📁 src
│   │   ├── 📁 assets
│   │   │
│   │   ├── 📁 components
│   │   │   ├── 📁 layout
│   │   │   │   ├── 📑 Sidebar.jsx
│   │   │   │   ├── 📑 Header.jsx
│   │   │   │   └── 📑 Layout.jsx
│   │   │   │
│   │   │   ├── 📁 ui
│   │   │   │   ├── 🔘 Button.jsx
│   │   │   │   ├── ⌨️ Input.jsx
│   │   │   │   └── ⏳ Loader.jsx
│   │   │   │
│   │   │   ├── 📁 Error
│   │   │   │   └── ❌ ErrorBoundary.jsx
│   │   │   │
│   │   │   └── 📁 Routing
│   │   │       ├── 🔒 protectedRoute.jsx
│   │   │       ├── 🌐 publiconlyroute.jsx
│   │   │       └── 🔁 Rolehomeredirect.jsx
│   │   │
│   │   ├── 📁 pages
│   │   │   ├── 📁 auth
│   │   │   │   ├── 🔑 Login.jsx
│   │   │   │   └── 📝 Register.jsx
│   │   │   │
│   │   │   ├── 📁 teacher
│   │   │   │   ├── 📊 teacherDashboard.jsx
│   │   │   │   ├── 📝 assessmentcreatepage.jsx
│   │   │   │   ├── 📈 teacherTrackingpage.jsx
│   │   │   │   ├── 📂 ReviewSubmissionspage.jsx
│   │   │   │   └── 💬 teacherFeedbackpage.jsx
│   │   │   │
│   │   │   └── 📁 student
│   │   │       ├── 🎓 studentDashboard.jsx
│   │   │       ├── 📚 ViewAssessmentsPage.jsx
│   │   │       ├── 📤 SubmissionFormPage.jsx
│   │   │       ├── 📍 TrackingPage.jsx
│   │   │       ├── 💬 FeedbackPage.jsx
│   │   │       └── 📋 studentfeedbacklistpage.js
│   │   │
│   │   ├── 📁 context
│   │   │   └── 🔐 AuthContext.jsx
│   │   │
│   │   ├── 📁 hooks
│   │   ├── 📁 utils
│   │   ├── 🎯 App.jsx
│   │   ├── ⚡ main.jsx
│   │   └── 🎨 Styles
│   │       └── index.css
│
├── 📘 README.md
└── 🚫 .gitignore
---

## ⚙️ Installation & Setup

### 1️⃣ Clone the Repository

```bash
git clone <your-repo-url>
cd project-folder
2️⃣ Backend Setup
cd server
npm install
Create .env file:
PORT=5000
MONGO_URI=your_mongodb_connection
JWT_SECRET=your_secret_key
Run backend:
npm run dev
3️⃣ Frontend Setup
cd Client
npm install
npm start
```
## 🔐 API Structure

### Auth
- POST `/api/auth/register`
- POST `/api/auth/login`

### Teacher
- POST `/api/assessments`
- GET `/api/assessments`
- PUT `/api/submissions/:id/status`
- POST `/api/feedback`

### Student
- GET `/api/assessments`
- POST `/api/submissions`
- GET `/api/submissions`
- GET `/api/feedback`

---

## 📊 Status System

Each submission includes:

- `pending`
- `reviewed`
- `issue`

### Additional Fields
- `rejectionReason` (if issue)
- `checked` flag for teacher tracking

---

## 🛡️ Security Features

- Password hashing (bcrypt)
- JWT authentication
- Protected API routes
- Role-based authorization
- Input validation

---

## 🌟 Key Highlights

- Clean architecture (MVC pattern)
- Modular and scalable codebase
- Separation of concerns (UI, logic, DB)
- Industry-level UI design
- Production-ready structure

---

## 📌 Future Enhancements

- Real-time notifications
- Email alerts for submissions/feedback
- Analytics dashboard with charts
- Cloud storage (AWS S3 / Firebase)
- Admin panel
