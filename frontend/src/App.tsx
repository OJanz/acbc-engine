import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from '@/contexts/AuthContext'
import BaseLayout from '@/layouts/BaseLayout'
import ProtectedRoute from '@/components/ProtectedRoute'
import HomePage from '@/pages/HomePage'
import LoginPage from '@/pages/LoginPage'
import ForgotPasswordPage from '@/pages/ForgotPasswordPage'
import ResetPasswordPage from '@/pages/ResetPasswordPage'
import VerifyEmailPage from '@/pages/VerifyEmailPage'
import StudiesPage from '@/pages/StudiesPage'
import StudyPage from '@/pages/StudyPage'
import SurveyPage from '@/pages/SurveyPage'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route element={<BaseLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/auth/verify" element={<VerifyEmailPage />} />

            <Route element={<ProtectedRoute />}>
              <Route path="/studies" element={<StudiesPage />} />
              <Route path="/studies/:id" element={<StudyPage />} />
            </Route>
          </Route>

          <Route path="/survey/:id" element={<SurveyPage />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
