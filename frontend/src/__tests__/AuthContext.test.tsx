import { render, screen, act } from '@testing-library/react';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { describe, it, expect, beforeEach, vi } from 'vitest';

const TestComponent = () => {
  const { user, login, logout, isAuthenticated } = useAuth();
  return (
    <div>
      <div data-testid="auth-status">{isAuthenticated ? 'Authenticated' : 'Not Authenticated'}</div>
      <div data-testid="username">{user?.username || 'No User'}</div>
      <button onClick={() => login('test-token', { id: '1', username: 'test-user' })}>Login</button>
      <button onClick={logout}>Logout</button>
    </div>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('provides authentication state', () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByTestId('auth-status')).toHaveTextContent('Not Authenticated');
  });

  it('handles login successfully', () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    const loginButton = screen.getByText('Login');
    act(() => {
      loginButton.click();
    });

    expect(screen.getByTestId('auth-status')).toHaveTextContent('Authenticated');
    expect(screen.getByTestId('username')).toHaveTextContent('test-user');
    expect(localStorage.getItem('token')).toBe('test-token');
  });

  it('handles logout successfully', () => {
    localStorage.setItem('token', 'test-token');
    localStorage.setItem('user', JSON.stringify({ id: '1', username: 'test-user' }));

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByTestId('auth-status')).toHaveTextContent('Authenticated');

    const logoutButton = screen.getByText('Logout');
    act(() => {
      logoutButton.click();
    });

    expect(screen.getByTestId('auth-status')).toHaveTextContent('Not Authenticated');
    expect(localStorage.getItem('token')).toBeNull();
  });

  it('throws error when used outside provider', () => {
    // Intercept JSDOM's virtual console error
    const errorHandler = (e: ErrorEvent) => {
      e.preventDefault();
    };
    window.addEventListener('error', errorHandler);
    
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    expect(() => render(<TestComponent />)).toThrow('useAuth must be used within an AuthProvider');
    
    consoleSpy.mockRestore();
    window.removeEventListener('error', errorHandler);
  });
});
