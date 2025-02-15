import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { TaskDetails } from './components/TaskDetails';
import { ThemeProvider } from './components/ui/theme-provider';
import { DashboardPage } from './pages/dashboard';
import { LearningPage } from './pages/learning';
import { PathsPage } from './pages/paths';
import { FavoritesPage } from './pages/favorites';
import { RecentPage } from './pages/recent';
import { SettingsPage } from './pages/settings';
import { ProfilePage } from './pages/profile';
import { TaskDetailsPage } from './pages/task-details';
import { taskService, authService } from './services/api';
import { LoginPage } from './pages/login';
import { RegisterPage } from './pages/register';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Layout } from './components/Layout';
import { PathDetailsPage } from './pages/path-details';
import { SubscriptionPage } from './pages/subscription';
import { SubscriptionSuccessPage } from './pages/subscription-success';
import LandingPage from './components/LandingPage';

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (authService.isAuthenticated()) {
      loadTasks();
    } else {
      setLoading(false);
    }
  }, []);

  const loadTasks = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await taskService.getTasks();
      setTasks(data);
    } catch (err) {
      console.error('Failed to load tasks:', err);
      if (err.response?.status === 401) {
        authService.logout();
      } else {
        setError(err.message || 'Failed to load tasks');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCheckStep = async (taskId, stepId, isCompleted) => {
    try {
      const updatedTask = await taskService.updateStepCompletion(
        taskId,
        stepId,
        isCompleted
      );
      setTasks(tasks.map(task => 
        task._id === updatedTask._id ? updatedTask : task
      ));
    } catch (err) {
      console.error('Failed to update step:', err);
      if (err.response?.status === 401) {
        authService.logout();
      }
    }
  };

  return (
    <Router>
      <ThemeProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={
            <PublicRoute>
              <LandingPage />
            </PublicRoute>
          } />
          <Route path="/login" element={
            <PublicRoute>
              <LoginPage onLoginSuccess={loadTasks} />
            </PublicRoute>
          } />
          <Route path="/register" element={
            <PublicRoute>
              <RegisterPage />
            </PublicRoute>
          } />
          
          {/* Protected Routes */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Layout>
                  <DashboardPage 
                    tasks={tasks} 
                    onCheckStep={handleCheckStep}
                    loading={loading}
                    error={error}
                    onRetry={loadTasks}
                  />
                </Layout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/tasks/:taskId" 
            element={
              <ProtectedRoute>
                <Layout>
                  <TaskDetailsPage 
                    tasks={tasks} 
                    onCheckStep={handleCheckStep} 
                  />
                </Layout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/learning" 
            element={
              <ProtectedRoute>
                <Layout>
                  <LearningPage />
                </Layout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/paths" 
            element={
              <ProtectedRoute>
                <Layout>
                  <PathsPage />
                </Layout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/favorites" 
            element={
              <ProtectedRoute>
                <Layout>
                  <FavoritesPage />
                </Layout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/recent" 
            element={
              <ProtectedRoute>
                <Layout>
                  <RecentPage />
                </Layout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/settings" 
            element={
              <ProtectedRoute>
                <Layout>
                  <SettingsPage />
                </Layout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <Layout>
                  <ProfilePage />
                </Layout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/path/:id" 
            element={
              <ProtectedRoute>
                <Layout>
                  <PathDetailsPage />
                </Layout>
              </ProtectedRoute>
            } 
          />
          <Route path="/subscription" element={<ProtectedRoute><SubscriptionPage /></ProtectedRoute>} />
          <Route path="/subscription/success" element={<ProtectedRoute><SubscriptionSuccessPage /></ProtectedRoute>} />
        </Routes>
      </ThemeProvider>
    </Router>
  );
}

function PublicRoute({ children }) {
  return !authService.isAuthenticated() ? children : <Navigate to="/dashboard" replace />;
}
