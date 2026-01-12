import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import CreateCourse from './pages/CreateCourse';
import LandingPage from './pages/LandingPage';
import CourseDetails from './pages/CourseDetails';
import EditCourse from './pages/EditCourse';

// Protected Route Wrapper
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/create-course"
            element={
              <ProtectedRoute>
                <CreateCourse />
              </ProtectedRoute>
            }
          />
          <Route
            path="/course/:id"
            element={
              <ProtectedRoute>
                <CourseDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="/edit-course/:id"
            element={
              <ProtectedRoute>
                <EditCourse />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
