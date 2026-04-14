import { Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/layout/Layout';
import TeacherDashboard from './pages/teacher/TeacherDashboard';
import StudentDashboard from './pages/student/StudentDashboard';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ProtectedRoute from './components/routing/ProtectedRoute';
import RoleHomeRedirect from './components/routing/RoleHomeRedirect';
import PublicOnlyRoute from './components/routing/PublicOnlyRoute';
import AssessmentCreatePage from './pages/teacher/AssessmentCreatePage';
import TeacherTrackingPage from './pages/teacher/TeacherTrackingPage';
import ReviewSubmissionsPage from './pages/teacher/ReviewSubmissionsPage';
import TeacherFeedbackPage from './pages/teacher/TeacherFeedbackPage';
import ViewAssessmentsPage from './pages/student/ViewAssessmentsPage';
import SubmissionFormPage from './pages/student/SubmissionFormPage';
import TrackingPage from './pages/student/TrackingPage';
import FeedbackPage from './pages/student/FeedbackPage';
import StudentFeedbackListPage from './pages/student/StudentFeedbackListPage';

function App() {
  return (
    <Routes>
      <Route
        path="/login"
        element={(
          <PublicOnlyRoute>
            <LoginPage />
          </PublicOnlyRoute>
        )}
      />
      <Route
        path="/register"
        element={
          <PublicOnlyRoute>
            <RegisterPage />
          </PublicOnlyRoute>
        }
      />

      <Route
        path="/"
        element={(
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        )}
      >
        <Route index element={<RoleHomeRedirect />} />
        <Route
          path="teacher"
          element={
            <ProtectedRoute allowedRoles={['teacher']}>
              <TeacherDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="teacher/assessments/create"
          element={
            <ProtectedRoute allowedRoles={['teacher']}>
              <AssessmentCreatePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="teacher/tracking"
          element={
            <ProtectedRoute allowedRoles={['teacher']}>
              <TeacherTrackingPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="teacher/review-submissions"
          element={
            <ProtectedRoute allowedRoles={['teacher']}>
              <ReviewSubmissionsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="teacher/feedback"
          element={
            <ProtectedRoute allowedRoles={['teacher']}>
              <TeacherFeedbackPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="student"
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <StudentDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="student/assessments"
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <ViewAssessmentsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="student/submissions/new"
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <SubmissionFormPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="student/tracking"
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <TrackingPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="student/feedback"
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <StudentFeedbackListPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="student/feedback/:id"
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <FeedbackPage />
            </ProtectedRoute>
          }
        />
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;