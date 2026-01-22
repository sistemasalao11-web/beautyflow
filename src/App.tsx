import React from 'react';
import { Routes, Route, Navigate, useParams } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { SaaSProvider, useSaaS } from './contexts/SaaSContext';
import { LandingPage } from './pages/public/LandingPage';
import { ClientBooking } from './pages/public/ClientBooking';
import { TermsOfUse } from './pages/public/TermsOfUse';
import { PrivacyPolicy } from './pages/public/PrivacyPolicy';
import { AdminLayout } from './layout/AdminLayout';
import { Services } from './pages/admin/Services';
import { Barbers } from './pages/admin/Barbers';
import { Settings } from './pages/admin/Settings';
import { Inventory } from './pages/admin/Inventory';
import { Reports } from './pages/admin/Reports';
import { Customers } from './pages/admin/Customers';
import { CalendarView } from './pages/admin/Calendar';
import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
      <div className="h-10 w-10 border-4 border-yellow-500/20 border-t-yellow-500 rounded-full animate-spin"></div>
    </div>
  );

  return user ? <>{children}</> : <Navigate to="/login" replace />;
};

import { Toaster } from 'react-hot-toast';
import { useTheme } from './hooks/useTheme';
import { CookieConsent } from './components/CookieConsent';

// Global Error Boundary to prevent black screens
class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean, error: any }> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: any) { return { hasError: true, error }; }
  componentDidCatch(error: any, errorInfo: any) { console.error('[GLOBAL ERROR]', error, errorInfo); }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-8 text-center">
          <h2 className="text-2xl font-black text-white uppercase tracking-tighter mb-4">Ocorreu um Erro Crítico</h2>
          <p className="text-red-500 text-[10px] uppercase font-bold tracking-widest mb-6 max-w-md">
            {this.state.error?.message || 'Erro desconhecido'}
          </p>
          <button onClick={() => window.location.reload()} className="bg-yellow-500 text-black px-6 py-3 font-bold uppercase text-[10px] tracking-widest">Recarregar Sistema</button>
        </div>
      );
    }
    return this.props.children;
  }
}

const ThemeWatcher = () => {
  const saas = useSaaS();
  useTheme();

  if (!saas) return null;
  return null;
};

const PublicBookingWrapper = () => {
  const { slug } = useParams();
  return <SaaSProvider slug={slug}><ClientBooking /></SaaSProvider>;
};

export default function App() {
  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-zinc-950">
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#18181b',
              color: '#fff',
              border: '1px solid rgba(255,255,255,0.05)',
              fontSize: '11px',
              textTransform: 'uppercase',
              fontWeight: '900',
              letterSpacing: '0.1em',
              padding: '16px 24px',
              borderRadius: '0'
            }
          }}
        />
        <ThemeWatcher />
        <CookieConsent />

        <Routes>
          {/* Venda do SaaS */}
          <Route path="/" element={<LandingPage />} />

          {/* Autenticação */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Ferramenta de Agendamento */}
          <Route path="/agendar" element={<ClientBooking />} />
          <Route path="/reserva/:slug" element={<PublicBookingWrapper />} />


          {/* Páginas Públicas Adicionais */}
          <Route path="/termos" element={<TermsOfUse />} />
          <Route path="/privacidade" element={<PrivacyPolicy />} />

          {/* Painel Administrativo Protegido */}
          <Route path="/admin" element={<PrivateRoute><AdminLayout /></PrivateRoute>}>
            <Route index element={<Reports />} />
            <Route path="agenda" element={<CalendarView />} />
            <Route path="services" element={<Services />} />
            <Route path="barbers" element={<Barbers />} />
            <Route path="customers" element={<Customers />} />
            <Route path="inventory" element={<Inventory />} />
            <Route path="settings" element={<Settings />} />
            <Route path="*" element={<Navigate to="/admin" replace />} />
          </Route>

          {/* Rota de Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </ErrorBoundary>
  );
}
