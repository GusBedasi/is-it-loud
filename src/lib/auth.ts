// Authentication and authorization system
const ADMIN_CREDENTIALS_KEY = 'isitloud_admin_credentials';
const SESSION_KEY = 'isitloud_admin_session';
const SESSION_DURATION = 4 * 60 * 60 * 1000; // 4 hours in milliseconds

export interface AdminCredentials {
  username: string;
  passwordHash: string;
}

export interface AdminSession {
  username: string;
  loginTime: string;
  expiresAt: string;
  isValid: boolean;
}

// Simple hash function for demo purposes (in production, use bcrypt or similar)
const simpleHash = (text: string): string => {
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    const char = text.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash.toString(36);
};

// Initialize default admin credentials (in production, this would be in a secure database)
const initializeAdminCredentials = (): void => {
  if (typeof window === 'undefined') return;
  
  const existing = localStorage.getItem(ADMIN_CREDENTIALS_KEY);
  if (!existing) {
    // Default admin credentials: username: admin, password: admin123
    const defaultCredentials: AdminCredentials = {
      username: 'admin',
      passwordHash: simpleHash('admin123')
    };
    localStorage.setItem(ADMIN_CREDENTIALS_KEY, JSON.stringify(defaultCredentials));
  }
};

// Authentication service
export class AuthService {
  constructor() {
    initializeAdminCredentials();
  }

  async login(username: string, password: string): Promise<{ success: boolean; message: string }> {
    if (typeof window === 'undefined') {
      return { success: false, message: 'Authentication not available on server' };
    }

    try {
      const storedCredentials = localStorage.getItem(ADMIN_CREDENTIALS_KEY);
      if (!storedCredentials) {
        return { success: false, message: 'Admin credentials not found' };
      }

      const credentials: AdminCredentials = JSON.parse(storedCredentials);
      const passwordHash = simpleHash(password);

      if (credentials.username === username && credentials.passwordHash === passwordHash) {
        // Create session
        const session: AdminSession = {
          username,
          loginTime: new Date().toISOString(),
          expiresAt: new Date(Date.now() + SESSION_DURATION).toISOString(),
          isValid: true
        };

        localStorage.setItem(SESSION_KEY, JSON.stringify(session));
        return { success: true, message: 'Login successful' };
      } else {
        return { success: false, message: 'Invalid username or password' };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: 'Login failed due to an error' };
    }
  }

  logout(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(SESSION_KEY);
  }

  getCurrentSession(): AdminSession | null {
    if (typeof window === 'undefined') return null;

    try {
      const sessionData = localStorage.getItem(SESSION_KEY);
      if (!sessionData) return null;

      const session: AdminSession = JSON.parse(sessionData);
      
      // Check if session is expired
      if (new Date() > new Date(session.expiresAt)) {
        this.logout();
        return null;
      }

      return session;
    } catch (error) {
      console.error('Session error:', error);
      this.logout();
      return null;
    }
  }

  isAuthenticated(): boolean {
    const session = this.getCurrentSession();
    return session !== null && session.isValid;
  }

  // Change admin password (for security)
  async changePassword(currentPassword: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    if (typeof window === 'undefined') {
      return { success: false, message: 'Password change not available on server' };
    }

    try {
      const storedCredentials = localStorage.getItem(ADMIN_CREDENTIALS_KEY);
      if (!storedCredentials) {
        return { success: false, message: 'Admin credentials not found' };
      }

      const credentials: AdminCredentials = JSON.parse(storedCredentials);
      const currentPasswordHash = simpleHash(currentPassword);

      if (credentials.passwordHash !== currentPasswordHash) {
        return { success: false, message: 'Current password is incorrect' };
      }

      // Update password
      const newCredentials: AdminCredentials = {
        username: credentials.username,
        passwordHash: simpleHash(newPassword)
      };

      localStorage.setItem(ADMIN_CREDENTIALS_KEY, JSON.stringify(newCredentials));
      return { success: true, message: 'Password changed successfully' };
    } catch (error) {
      console.error('Password change error:', error);
      return { success: false, message: 'Password change failed' };
    }
  }

  // Get remaining session time
  getSessionTimeRemaining(): number {
    const session = this.getCurrentSession();
    if (!session) return 0;

    const now = new Date().getTime();
    const expiresAt = new Date(session.expiresAt).getTime();
    return Math.max(0, expiresAt - now);
  }

  // Extend session (refresh)
  extendSession(): boolean {
    const session = this.getCurrentSession();
    if (!session) return false;

    const extendedSession: AdminSession = {
      ...session,
      expiresAt: new Date(Date.now() + SESSION_DURATION).toISOString()
    };

    localStorage.setItem(SESSION_KEY, JSON.stringify(extendedSession));
    return true;
  }
}

// Singleton instance
export const authService = new AuthService();

// Hook for React components
export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);
  const [session, setSession] = React.useState<AdminSession | null>(null);

  React.useEffect(() => {
    const checkAuth = () => {
      const currentSession = authService.getCurrentSession();
      setSession(currentSession);
      setIsAuthenticated(authService.isAuthenticated());
    };

    checkAuth();
    
    // Check auth status periodically
    const interval = setInterval(checkAuth, 60000); // Check every minute
    
    return () => clearInterval(interval);
  }, []);

  return {
    isAuthenticated,
    session,
    login: authService.login.bind(authService),
    logout: authService.logout.bind(authService),
    changePassword: authService.changePassword.bind(authService),
    extendSession: authService.extendSession.bind(authService),
    getSessionTimeRemaining: authService.getSessionTimeRemaining.bind(authService)
  };
};

// Import React for the hook
import React from 'react';