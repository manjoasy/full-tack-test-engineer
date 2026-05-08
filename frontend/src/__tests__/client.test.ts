import { describe, it, expect, beforeAll, afterAll, afterEach, vi } from 'vitest';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import apiClient from '../api/client';

const handlers = [
  http.get('/api/test-auth', ({ request }) => {
    const authHeader = request.headers.get('Authorization');
    return HttpResponse.json({ authHeader });
  }),
  http.get('/api/test-401', () => {
    return new HttpResponse(null, { status: 401 });
  }),
];

const server = setupServer(...handlers);

describe('apiClient interceptors', () => {
  beforeAll(() => {
    server.listen();
    // In JSDOM, relative URLs work if location is set
    vi.stubGlobal('location', { ...window.location, href: 'http://localhost/' });
  });
  
  afterEach(() => {
    server.resetHandlers();
    localStorage.clear();
    vi.clearAllMocks();
  });
  
  afterAll(() => server.close());

  it('adds Authorization header if token exists in localStorage', async () => {
    localStorage.setItem('token', 'valid-token');
    
    const response = await apiClient.get('/test-auth');
    
    expect(response.data.authHeader).toBe('Bearer valid-token');
  });

  it('does not add Authorization header if token is missing', async () => {
    const response = await apiClient.get('/test-auth');
    
    expect(response.data.authHeader).toBeNull();
  });

  it('handles 401 error by clearing storage and redirecting', async () => {
    localStorage.setItem('token', 'expired-token');
    localStorage.setItem('user', JSON.stringify({ name: 'Test' }));
    
    // We need to catch the error because the interceptor re-throws it
    try {
      await apiClient.get('/test-401');
    } catch (error) {
      // Expected
    }

    expect(localStorage.getItem('token')).toBeNull();
    expect(localStorage.getItem('user')).toBeNull();
    expect(window.location.href).toBe('/login');
  });

  it('handles request error', async () => {
    // Force a request error by ejecting and adding a failing one? 
    // Or just check that it re-throws.
    const failingInterceptor = apiClient.interceptors.request.use(
      () => { throw new Error('Request Failed'); }
    );

    await expect(apiClient.get('/test-auth')).rejects.toThrow('Request Failed');

    apiClient.interceptors.request.eject(failingInterceptor);
  });
});
