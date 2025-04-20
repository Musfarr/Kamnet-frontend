import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

// Layout components
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';

// Page components
import Home from './pages/Home';
import AllTasks from './pages/AllTasks';
import TaskDetail from './pages/TaskDetail';
import CompleteProfile from './pages/CompleteProfile';
import UserDashboard from './pages/UserDashboard';
import TalentDashboard from './pages/TalentDashboard';
import MapView from './pages/MapView';
import NotFound from './pages/NotFound';

// Create theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#212121',
    },
    secondary: {
      main: '#2b1010',
    },
  },
  typography: {
    fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
  },
});

function App() {
  const { user, isAuthenticated } = useSelector((state) => state.user);

  const TalentRoute = ({ children }) => {
    if (!isAuthenticated) {
      return <Navigate to="/" />;
    }

    if (user && user.role === 'talent') {
      // If talent needs to complete profile
      if (!user.profileCompleted && 
          window.location.pathname !== '/complete-profile') {
        return <Navigate to="/complete-profile" />;
      }
      return children;
    }

    return <Navigate to="/" />;
  };

  const UserRoute = ({ children }) => {
    if (!isAuthenticated) {
      return <Navigate to="/" />;
    }

    if (user && user.role === 'user') {
      return children;
    }

    return <Navigate to="/" />;
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div className="app">
        <Header />
        <main className="main-content">
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Home />} />
            <Route path="/tasks" element={<AllTasks />} />
            <Route path="/tasks/:id" element={<TaskDetail />} />
            <Route path="/map" element={<MapView />} />
            
            {/* Protected routes for talents */}
            <Route
              path="/talent/dashboard"
              element={
                <TalentRoute>
                  <TalentDashboard />
                </TalentRoute>
              }
            />
            <Route
              path="/complete-profile"
              element={
                <TalentRoute>
                  <CompleteProfile />
                </TalentRoute>
              }
            />
            
            {/* Protected routes for users */}
            <Route
              path="/user/dashboard"
              element={
                <UserRoute>
                  <UserDashboard />
                </UserRoute>
              }
            />
            
            {/* 404 route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </ThemeProvider>
  );
}

export default App;
