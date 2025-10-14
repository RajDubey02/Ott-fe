import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import AdminLayout from './components/AdminLayout';
import Footer from './components/Footer'

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Watch from './pages/Watch';
import WatchDetail from './pages/WatchDetail';
import Search from './pages/Search';
import Profile from './pages/Profile';

// Admin Pages
import Dashboard from './pages/admin/Dashboard';
import ManageMovies from './pages/admin/ManageMovies';
import ManageUsers from './pages/admin/ManageUsers';
import ManageSubscriptions from './pages/admin/ManageSubscriptions';

// Protected Route Component
const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  // Show loading while auth state is being determined
  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && !isAdmin()) {
    return <Navigate to="/" replace />;
  }

  return children;
};

// Layout Component
const Layout = ({ children }) => {
  return (
    <div className="min-h-screen bg-black flex flex-col">
      <Navbar />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
};

// App Router Component
const AppRouter = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      {/* Protected User Routes */}
      <Route path="/" element={<Layout><Home /></Layout>} />
      <Route path="/watch/:id" element={<Layout><Watch /></Layout>} />
      <Route path="/movie/:id" element={<Layout><WatchDetail /></Layout>} />
      <Route path="/search" element={<Layout><Search /></Layout>} />
      <Route path="/profile" element={
        <Layout>
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        </Layout>
      } />

      {/* Admin Routes */}
      <Route path="/admin" element={
        <AdminLayout>
          <ProtectedRoute requireAdmin>
            <Dashboard />
          </ProtectedRoute>
        </AdminLayout>
      } />
      <Route path="/admin/movies" element={
        <AdminLayout>
          <ProtectedRoute requireAdmin>
            <ManageMovies />
          </ProtectedRoute>
        </AdminLayout>
      } />
      <Route path="/admin/users" element={
        <AdminLayout>
          <ProtectedRoute requireAdmin>
            <ManageUsers />
          </ProtectedRoute>
        </AdminLayout>
      } />
      <Route path="/admin/subscriptions" element={
        <AdminLayout>
          <ProtectedRoute requireAdmin>
            <ManageSubscriptions />
          </ProtectedRoute>
        </AdminLayout>
      } />

      {/* Catch all route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

// Main App Component
function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="App">
          <AppRouter />
          <Toaster
            position="bottom-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#1f2937',
                color: '#fff',
              },
              success: {
                style: {
                  background: '#065f46',
                },
              },
              error: {
                style: {
                  background: '#dc2626',
                },
              },
            }}
          />
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
