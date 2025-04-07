import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './app/store';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';
import RequestPasswordReset from './pages/RequestPasswordReset';
import PasswordReset from './pages/ResetPassword';
import { Toaster } from 'react-hot-toast';

const App = () => {
  
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 5000,
          style: {
            background: '#fff',
            color: '#000',
          },
          success: {
            style: {
              border: '1px solid #10B981',
              color: '#10B981',
            },
          },
          error: {
            style: {
              border: '1px solid #EF4444',
              color: '#EF4444',
            },
          },
        }}
      />
        <Router>
          <div className="min-h-screen bg-gray-50">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/request-password-reset" element={<RequestPasswordReset />} />
              <Route path="/reset-password/:token" element={<PasswordReset />} />
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />
              <Route path="/" element={<Navigate to="/login" replace />} />
            </Routes>
          </div>
        </Router>
      </PersistGate>
    </Provider>
  );
};

export default App;