import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Layout } from './components/layout/Layout';
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { Dashboard } from './pages/Dashboard';
import { Profile } from './pages/Profile';
import { MoodTrackerPage } from './pages/MoodTracker';
import { CirclesPage } from './pages/Circles';
import { JournalPage } from './pages/Journal';
import { ExplorePage } from './pages/Explore';

// Protected Route wrapper
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

// Auth Route wrapper (redirect if already logged in)
const AuthRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
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
        <Route path="explore" element={<ProtectedRoute><ExplorePage /></ProtectedRoute>} />
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
