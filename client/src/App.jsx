import { Routes, Route, Navigate } from 'react-router-dom';
import { useQuery } from 'react-query';
import { api } from './lib/api';
import { AppShell } from './components/layout/AppShell';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Customers from './pages/Customers';
import CustomerForm from './pages/CustomerForm';
import CustomerDetail from './pages/CustomerDetail';
import Finance from './pages/Finance';
import Settings from './pages/Settings';

export default function App() {
  const { data, isLoading } = useQuery('me', () => api.get('/auth/me').then((r) => r.data), {
    retry: false,
  });
  const user = data?.user;

  if (isLoading) {
    return <div className="flex min-h-screen items-center justify-center bg-surface text-secondary">Loading…</div>;
  }

  if (!user?.email) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={<Navigate to="/" replace />} />
      <Route
        path="*"
        element={
          <AppShell title="Studio workspace" subtitle="Manage your photography operations" email={user.email}>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/customers" element={<Customers />} />
              <Route path="/customers/new" element={<CustomerForm />} />
              <Route path="/customers/:id" element={<CustomerDetail />} />
              <Route path="/finance" element={<Finance />} />
              <Route path="/settings" element={<Settings email={user.email} />} />
            </Routes>
          </AppShell>
        }
      />
    </Routes>
  );
}
