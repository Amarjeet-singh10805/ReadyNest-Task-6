import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from '@/store/auth';
import { ThemeProvider } from '@/components/ThemeProvider';
import DashboardLayout from '@/components/layout/DashboardLayout';
import LoginPage from '@/pages/auth/LoginPage';
import RegisterPage from '@/pages/auth/RegisterPage';
import ForgotPasswordPage from '@/pages/auth/ForgotPasswordPage';
import AdminDashboard from '@/pages/dashboard/AdminDashboard';
import DoctorDashboard from '@/pages/dashboard/DoctorDashboard';
import PatientDashboard from '@/pages/dashboard/PatientDashboard';
import PatientsPage from '@/pages/patients/PatientsPage';
import PatientDetailPage from '@/pages/patients/PatientDetailPage';
import DoctorsPage from '@/pages/doctors/DoctorsPage';
import DoctorDetailPage from '@/pages/doctors/DoctorDetailPage';
import AppointmentsPage from '@/pages/appointments/AppointmentsPage';
import AppointmentDetailPage from '@/pages/appointments/AppointmentDetailPage';
import PrescriptionsPage from '@/pages/prescriptions/PrescriptionsPage';
import BillingPage from '@/pages/billing/BillingPage';
import ReportsPage from '@/pages/reports/ReportsPage';
import ProfilePage from '@/pages/ProfilePage';
import NotFoundPage from '@/pages/NotFoundPage';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30_000 } },
});

const ProtectedRoute = ({ children, roles }: { children: JSX.Element; roles?: string[] }) => {
  const { isAuthenticated, user } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (roles && user && !roles.includes(user.role)) return <Navigate to="/dashboard" replace />;
  return children;
};

const DashboardRedirect = () => {
  const { user } = useAuth();
  if (user?.role === 'DOCTOR') return <DoctorDashboard />;
  if (user?.role === 'PATIENT') return <PatientDashboard />;
  return <AdminDashboard />;
};

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <BrowserRouter>
            <Toaster position="top-right" toastOptions={{ className: 'dark:bg-gray-800 dark:text-white' }} />
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
                <Route path="/dashboard" element={<DashboardRedirect />} />
                <Route path="/patients" element={<ProtectedRoute roles={['ADMIN','DOCTOR','RECEPTIONIST']}><PatientsPage /></ProtectedRoute>} />
                <Route path="/patients/:id" element={<PatientDetailPage />} />
                <Route path="/doctors" element={<DoctorsPage />} />
                <Route path="/doctors/:id" element={<DoctorDetailPage />} />
                <Route path="/appointments" element={<AppointmentsPage />} />
                <Route path="/appointments/:id" element={<AppointmentDetailPage />} />
                <Route path="/prescriptions" element={<PrescriptionsPage />} />
                <Route path="/billing" element={<ProtectedRoute roles={['ADMIN','RECEPTIONIST']}><BillingPage /></ProtectedRoute>} />
                <Route path="/reports" element={<ProtectedRoute roles={['ADMIN']}><ReportsPage /></ProtectedRoute>} />
                <Route path="/profile" element={<ProfilePage />} />
              </Route>
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
