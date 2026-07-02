import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { MovieProvider } from './context/MovieContext';
import { LangProvider } from './context/LangContext';
import Navbar from './components/layout/Navbar';
import ChatbotWidget from './components/chatbot/ChatbotWidget';
import PageLoader from './components/ui/PageLoader';

const HomePage             = lazy(() => import('./pages/HomePage'));
const LoginPage            = lazy(() => import('./pages/LoginPage'));
const RegisterPage         = lazy(() => import('./pages/RegisterPage'));
const EmailVerificationPage= lazy(() => import('./pages/EmailVerificationPage'));
const ForgotPasswordPage   = lazy(() => import('./pages/ForgotPasswordPage'));
const ResetPasswordPage    = lazy(() => import('./pages/ResetPasswordPage'));
const MovieDetailPage      = lazy(() => import('./pages/MovieDetailPage'));
const SearchPage           = lazy(() => import('./pages/SearchPage'));
const FavoritesPage        = lazy(() => import('./pages/FavoritesPage'));
const WatchHistoryPage     = lazy(() => import('./pages/WatchHistoryPage'));
const AIRecommendationsPage= lazy(() => import('./pages/AIRecommendationsPage'));
const NotFoundPage         = lazy(() => import('./pages/NotFoundPage'));

const Protected = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <PageLoader />;
  return user ? children : <Navigate to="/login" replace />;
};
const Guest = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <PageLoader />;
  return user ? <Navigate to="/" replace /> : children;
};

const Shell = () => {
  const { user } = useAuth();
  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--cd)' }}>
      <Navbar />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/"                        element={<HomePage />} />
          <Route path="/movie/:id"               element={<MovieDetailPage />} />
          <Route path="/search"                  element={<SearchPage />} />
          <Route path="/ai-picks"                element={<AIRecommendationsPage />} />
          <Route path="/forgot-password"         element={<ForgotPasswordPage />} />
          <Route path="/reset-password/:token"   element={<ResetPasswordPage />} />

          <Route path="/login"    element={<Guest><LoginPage /></Guest>} />
          <Route path="/register" element={<Guest><RegisterPage /></Guest>} />

          <Route path="/verify-email" element={<Protected><EmailVerificationPage /></Protected>} />
          <Route path="/favorites"    element={<Protected><FavoritesPage /></Protected>} />
          <Route path="/history"      element={<Protected><WatchHistoryPage /></Protected>} />

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>

      {user && <ChatbotWidget />}

      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: 'var(--cd2)',
            color: 'var(--ct)',
            border: '1px solid var(--cb)',
            fontFamily: 'DM Sans, sans-serif',
            fontSize: '.9rem',
          },
          duration: 3500,
          success: { iconTheme: { primary: '#22c55e', secondary: 'white' } },
          error:   { iconTheme: { primary: '#ef4444', secondary: 'white' } },
        }}
      />
    </div>
  );
};

const App = () => (
  <BrowserRouter>
    <LangProvider>
      <AuthProvider>
        <MovieProvider>
          <ThemeProvider>
            <Shell />
          </ThemeProvider>
        </MovieProvider>
      </AuthProvider>
    </LangProvider>
  </BrowserRouter>
);

export default App;
