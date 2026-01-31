import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { CircleProvider } from './context/CircleContext';
import { FriendsProvider } from './context/FriendsContext';
import { ChatProvider } from './context/ChatContext'; // Added ChatProvider import
import { Layout } from './components/layout/Layout';
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { Dashboard } from './pages/Dashboard';
import { Profile } from './pages/Profile';
import { MoodTrackerPage } from './pages/MoodTracker';
import { CirclesPage } from './pages/Circles';
import { CircleDetailPage } from './pages/CircleDetail';
import { JournalPage } from './pages/Journal';
import { MyCirclesPage } from './pages/MyCircles';
import { FriendsPage } from './pages/Friends';
import { ChatPage } from './pages/Chat'; // Added ChatPage import

// Protected Route wrapper
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();

  // Wait for auth check to complete
  if (isLoading) {
    return <div style={{ padding: 40, textAlign: 'center', color: '#a0a0b0' }}>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

// Auth Route wrapper (redirect if already logged in)
// Don't block on loading - show auth pages immediately, redirect when auth completes
const AuthRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();

  // If still loading, show the page (don't block login/signup)
  if (isLoading) {
    return <>{children}</>;
  }

  // If authenticated, redirect to dashboard
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  return <>{children}</>;
};

function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="login" element={<AuthRoute><Login /></AuthRoute>} />
        <Route path="signup" element={<AuthRoute><Signup /></AuthRoute>} />

        {/* Protected routes */}
        <Route path="dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="mood" element={<ProtectedRoute><MoodTrackerPage /></ProtectedRoute>} />
        <Route path="journal" element={<ProtectedRoute><JournalPage /></ProtectedRoute>} />
        <Route path="circles" element={<ProtectedRoute><CirclesPage /></ProtectedRoute>} />
        <Route path="circles/:circleId" element={<ProtectedRoute><CircleDetailPage /></ProtectedRoute>} />
        <Route path="my-circles" element={<ProtectedRoute><MyCirclesPage /></ProtectedRoute>} />
        <Route path="friends" element={<ProtectedRoute><FriendsPage /></ProtectedRoute>} />
        <Route path="chat/:friendId" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} /> {/* Added chat route */}
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <CircleProvider>
            <FriendsProvider>
              <ChatProvider> {/* Added ChatProvider */}
                <AppRoutes />
              </ChatProvider>
            </FriendsProvider>
          </CircleProvider>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}

export default App;
