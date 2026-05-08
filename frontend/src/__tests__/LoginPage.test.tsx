import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import LoginPage from '../pages/LoginPage';
import { describe, it, expect, vi, beforeAll, afterAll, afterEach } from 'vitest';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';

const handlers = [
  http.post('/api/auth/login', async ({ request }) => {
    const { username, password } = await request.json() as any;
    
    if (username === 'admin' && password === 'admin123') {
      return HttpResponse.json({
        success: true,
        data: {
          token: 'fake-token',
          user: { id: '1', username: 'admin' },
        },
      });
    }
    
    return new HttpResponse(
      JSON.stringify({ success: false, error: 'Identifiants invalides' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }),
];

const server = setupServer(...handlers);

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <MemoryRouter>
    <AuthProvider>
      {children}
    </AuthProvider>
  </MemoryRouter>
);

describe('LoginPage', () => {
  beforeAll(() => server.listen());
  afterEach(() => {
    server.resetHandlers();
    localStorage.clear();
  });
  afterAll(() => server.close());

  it('renders login form', () => {
    render(<LoginPage />, { wrapper });
    expect(screen.getByText('Connexion')).toBeInTheDocument();
    expect(screen.getByLabelText(/Nom d'utilisateur/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Mot de passe/i)).toBeInTheDocument();
  });

  it('handles successful login', async () => {
    render(<LoginPage />, { wrapper });
    
    fireEvent.change(screen.getByLabelText(/Nom d'utilisateur/i), { target: { value: 'admin' } });
    fireEvent.change(screen.getByLabelText(/Mot de passe/i), { target: { value: 'admin123' } });
    fireEvent.click(screen.getByRole('button', { name: /Se connecter/i }));

    await waitFor(() => {
      expect(localStorage.getItem('token')).toBe('fake-token');
    });
  });

  it('shows error message on failed login', async () => {
    render(<LoginPage />, { wrapper });
    
    fireEvent.change(screen.getByLabelText(/Nom d'utilisateur/i), { target: { value: 'wrong' } });
    fireEvent.change(screen.getByLabelText(/Mot de passe/i), { target: { value: 'wrong' } });
    fireEvent.click(screen.getByRole('button', { name: /Se connecter/i }));

    await waitFor(() => {
      expect(screen.getByText('Identifiants invalides')).toBeInTheDocument();
    });
  });

  it('shows generic error message on API failure', async () => {
    server.use(
      http.post('/api/auth/login', () => {
        return new HttpResponse(null, { status: 500 });
      })
    );

    render(<LoginPage />, { wrapper });
    
    fireEvent.change(screen.getByLabelText(/Nom d'utilisateur/i), { target: { value: 'admin' } });
    fireEvent.change(screen.getByLabelText(/Mot de passe/i), { target: { value: 'admin123' } });
    fireEvent.click(screen.getByRole('button', { name: /Se connecter/i }));

    await waitFor(() => {
      expect(screen.getByText('Une erreur est survenue lors de la connexion')).toBeInTheDocument();
    });
  });
});
