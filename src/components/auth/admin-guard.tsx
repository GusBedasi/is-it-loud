"use client"

import { useEffect, useState } from 'react';
import { authService } from '@/lib/auth';
import { LoginForm } from './login-form';
import { Clock, LogOut, Shield, User } from 'lucide-react';
import { formatRemainingTime } from '@/lib/rate-limiter';

interface AdminGuardProps {
  children: React.ReactNode;
}

export const AdminGuard = ({ children }: AdminGuardProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [sessionTimeRemaining, setSessionTimeRemaining] = useState(0);

  useEffect(() => {
    checkAuthentication();
    
    // Check authentication and update session time every minute
    const interval = setInterval(() => {
      checkAuthentication();
      updateSessionTime();
    }, 60000);

    // Update session time every second for display
    const timeInterval = setInterval(updateSessionTime, 1000);

    return () => {
      clearInterval(interval);
      clearInterval(timeInterval);
    };
  }, []);

  const checkAuthentication = () => {
    const authenticated = authService.isAuthenticated();
    setIsAuthenticated(authenticated);
    setIsLoading(false);
  };

  const updateSessionTime = () => {
    const remaining = authService.getSessionTimeRemaining();
    setSessionTimeRemaining(remaining);
  };

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    updateSessionTime();
  };

  const handleLogout = () => {
    authService.logout();
    setIsAuthenticated(false);
    setSessionTimeRemaining(0);
  };

  const extendSession = () => {
    if (authService.extendSession()) {
      updateSessionTime();
    }
  };

  const formatSessionTime = (ms: number): string => {
    if (ms <= 0) return '0m';
    
    const minutes = Math.floor(ms / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      const remainingMinutes = minutes % 60;
      return `${hours}h ${remainingMinutes}m`;
    }
    
    return `${minutes}m`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando autenticação...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginForm onLoginSuccess={handleLoginSuccess} />;
  }

  // Show session warning when less than 30 minutes remaining
  const showSessionWarning = sessionTimeRemaining > 0 && sessionTimeRemaining < 30 * 60 * 1000;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Shield className="text-indigo-600 mr-2" size={20} />
              <span className="font-semibold text-gray-900">Admin Panel</span>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Session Info */}
              <div className="hidden sm:flex items-center text-sm text-gray-600">
                <User size={14} className="mr-1" />
                <span className="mr-3">{authService.getCurrentSession()?.username}</span>
                
                <Clock size={14} className="mr-1" />
                <span className={showSessionWarning ? 'text-orange-600 font-medium' : ''}>
                  {formatSessionTime(sessionTimeRemaining)}
                </span>
                
                {showSessionWarning && (
                  <button
                    onClick={extendSession}
                    className="ml-2 text-xs bg-orange-100 hover:bg-orange-200 text-orange-800 px-2 py-1 rounded transition-colors"
                  >
                    Estender
                  </button>
                )}
              </div>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="flex items-center px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
                title="Sair"
              >
                <LogOut size={16} className="mr-1" />
                <span className="hidden sm:inline">Sair</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Session Warning Banner */}
      {showSessionWarning && (
        <div className="bg-orange-50 border-b border-orange-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Clock className="text-orange-600 mr-2" size={16} />
                <span className="text-sm text-orange-800">
                  Sua sessão expira em {formatSessionTime(sessionTimeRemaining)}
                </span>
              </div>
              <button
                onClick={extendSession}
                className="text-sm bg-orange-600 hover:bg-orange-700 text-white px-3 py-1 rounded transition-colors"
              >
                Estender Sessão
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Protected Content */}
      <main>
        {children}
      </main>
    </div>
  );
};