import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { OnboardingPage } from './pages/OnboardingPage';
import { DashboardPage } from './pages/DashboardPage';
import { SessionPage } from './pages/SessionPage';
import { ProgressPage } from './pages/ProgressPage';
import { GoalsPage } from './pages/GoalsPage';
import { LibraryPage } from './pages/LibraryPage';
import { EvaluationsPage } from './pages/EvaluationsPage';
import SettingsPage from './pages/SettingsPage';
import { useUserStore } from './store/userStore';
import MobileApp from './mobile/MobileApp';

function RequireAuth() {
  const { isOnboarded } = useUserStore();
  if (!isOnboarded) return <Navigate to="/onboarding" replace />;
  return <AppLayout />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/onboarding" element={<OnboardingPage />} />
        <Route path="/mobile" element={<MobileApp />} />
        <Route element={<RequireAuth />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/session" element={<SessionPage />} />
          <Route path="/coaching" element={<SessionPage />} />
          <Route path="/progress" element={<ProgressPage />} />
          <Route path="/goals" element={<GoalsPage />} />
          <Route path="/library" element={<LibraryPage />} />
          <Route path="/evaluations" element={<EvaluationsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/skills" element={<Navigate to="/library" replace />} />
          <Route path="/lessons" element={<Navigate to="/library" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
