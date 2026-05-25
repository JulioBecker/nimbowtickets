import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

import PublicLayout from 'src/layout/public';
import LandingPage from 'src/pages/public/LandingPage';
import SearchPage from 'src/pages/public/SearchPage';
import EventDetailsPage from 'src/pages/public/EventDetailsPage';
import CheckoutPage from 'src/pages/public/CheckoutPage';
import ProducerPage from 'src/pages/public/ProducerPage';
import PrivacyPolicyPage from 'src/pages/public/info/PrivacyPolicyPage';
import TermsOfUsePage from 'src/pages/public/info/TermsOfUsePage';
import HalfPriceRulesPage from 'src/pages/public/info/HalfPriceRulesPage';
import ServiceFeesPage from 'src/pages/public/info/ServiceFeesPage';
import ManagementABPage from 'src/pages/public/info/ManagementABPage';
import CashlessNfcPage from 'src/pages/public/info/CashlessNfcPage';
import HelpCenterPage from 'src/pages/public/info/HelpCenterPage';
import ContactUsPage from 'src/pages/public/info/ContactUsPage';
import Login from 'src/pages/auth/Login';
import Register from 'src/pages/auth/Register';
import ForgotPassword from 'src/pages/auth/ForgotPassword';
import RecoverPassword from 'src/pages/auth/RecoverPassword';
import CustomerDashboard from 'src/pages/dashboard/CustomerDashboard';
import ProducerDashboard from 'src/pages/dashboard/ProducerDashboard';
import { paths } from 'src/routes/paths';
import { useUserStore } from 'src/store/user';
import Notiflix from 'notiflix';

// Initialize global Notiflix settings for Nimbow theme
Notiflix.Notify.init({
  width: '320px',
  position: 'right-bottom',
  fontFamily: "'Roboto', system-ui, sans-serif",
  cssAnimationStyle: 'zoom',
  borderRadius: '12px',
  timeout: 4000,
  success: {
    background: '#9BEA00',
    textColor: '#111111',
    childClassName: 'notiflix-notify-success',
    notiflixIconColor: '#111111',
  },
  failure: {
    background: '#ff5630',
    textColor: '#ffffff',
  },
  warning: {
    background: '#ffab00',
    textColor: '#111111',
    notiflixIconColor: '#111111',
  },
  info: {
    background: '#8E33FF',
    textColor: '#ffffff',
  },
});

// Custom MUI theme with modern Inter typography and Nimbow's green (#8E33FF) highlights
const theme = createTheme({
  palette: {
    primary: {
      main: '#8E33FF',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#9BEA00',
      contrastText: '#111111',
    },
    background: {
      default: '#F4F5F7',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: "'Roboto', system-ui, sans-serif",
    h1: { fontWeight: 900, letterSpacing: '-1.5px' },
    h2: { fontWeight: 900, letterSpacing: '-1px' },
    h3: { fontWeight: 800, letterSpacing: '-0.5px' },
    h4: { fontWeight: 800 },
    subtitle1: { fontWeight: 600 },
    button: { fontWeight: 700, textTransform: 'none' },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 50,
          boxShadow: 'none',
          textTransform: 'none',
          padding: '8px 24px',
          '&:hover': {
            boxShadow: 'none',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 24,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.04)',
        },
      },
    },
  },
});

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user } = useUserStore();
  if (!user) {
    return <Navigate to={paths.auth.login} replace />;
  }
  return <>{children}</>;
}

function GuestGuard({ children }: { children: React.ReactNode }) {
  const { user } = useUserStore();
  if (user) {
    return <Navigate to={paths.dashboard.root} replace />;
  }
  return <>{children}</>;
}

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          <Route element={<PublicLayout />}>
            <Route path={paths.tickets.root} element={<LandingPage />} />
            <Route path={paths.tickets.search} element={<SearchPage />} />
            <Route path="/event/:id" element={<EventDetailsPage />} />
            <Route path="/checkout/:id" element={<CheckoutPage />} />
            <Route path="/p/:slug" element={<ProducerPage />} />

            {/* Institutional pages */}
            <Route path={paths.tickets.privacyPolicy} element={<PrivacyPolicyPage />} />
            <Route path={paths.tickets.termsOfUse} element={<TermsOfUsePage />} />
            <Route path={paths.tickets.halfPriceRules} element={<HalfPriceRulesPage />} />
            <Route path={paths.tickets.serviceFees} element={<ServiceFeesPage />} />
            <Route path={paths.tickets.managementAB} element={<ManagementABPage />} />
            <Route path={paths.tickets.cashlessNfc} element={<CashlessNfcPage />} />
            <Route path={paths.tickets.helpCenter} element={<HelpCenterPage />} />
            <Route path={paths.tickets.contactUs} element={<ContactUsPage />} />

            <Route
              path={paths.dashboard.root}
              element={
                <AuthGuard>
                  <CustomerDashboard />
                </AuthGuard>
              }
            />
            <Route
              path={paths.dashboard.root}
              element={
                <AuthGuard>
                  <CustomerDashboard />
                </AuthGuard>
              }
            />
          </Route>

          <Route
            path={paths.dashboard.producer}
            element={
              <AuthGuard>
                <ProducerDashboard />
              </AuthGuard>
            }
          />

          <Route
            path={paths.auth.login}
            element={
              <GuestGuard>
                <Login />
              </GuestGuard>
            }
          />
          <Route
            path={paths.auth.register}
            element={
              <GuestGuard>
                <Register />
              </GuestGuard>
            }
          />
          <Route
            path={paths.auth.forgotPassword}
            element={
              <GuestGuard>
                <ForgotPassword />
              </GuestGuard>
            }
          />
          <Route
            path={paths.auth.recoverPassword}
            element={
              <GuestGuard>
                <RecoverPassword />
              </GuestGuard>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
