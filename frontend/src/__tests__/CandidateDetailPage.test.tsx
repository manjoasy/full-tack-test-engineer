import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import CandidateDetailPage from '../pages/CandidateDetailPage';
import { describe, it, expect, vi, beforeAll, afterAll, afterEach } from 'vitest';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';

const mockCandidate = {
  id: '1',
  firstName: 'Jean',
  lastName: 'Dupont',
  email: 'jean@example.com',
  phone: '0102030405',
  position: 'Développeur Fullstack',
  experience: 5,
  skills: ['React', 'Node.js'],
  status: 'draft',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

let currentStatus = 'draft';

const handlers = [
  http.get('/api/candidates/1', () => {
    return HttpResponse.json({ 
      success: true, 
      data: { ...mockCandidate, status: currentStatus } 
    });
  }),
  http.post('/api/candidates/1/validate', () => {
    currentStatus = 'validated';
    return HttpResponse.json({ success: true, data: { ...mockCandidate, status: 'validated' } });
  }),
  http.delete('/api/candidates/1', () => {
    return HttpResponse.json({ success: true, message: 'Candidat supprimé' });
  }),
];

const server = setupServer(...handlers);

const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: { retry: false },
  },
});

const renderWithRouter = (ui: React.ReactNode, { route = '/candidates/1' } = {}) => {
  const queryClient = createTestQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[route]}>
        <Routes>
          <Route path="/candidates/:id" element={ui} />
          <Route path="/" element={<div>Home</div>} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  );
};

describe('CandidateDetailPage', () => {
  beforeAll(() => {
    server.listen();
    vi.spyOn(window, 'confirm').mockImplementation(() => true);
  });
  afterEach(() => {
    server.resetHandlers();
    currentStatus = 'draft';
    vi.clearAllMocks();
  });
  afterAll(() => server.close());

  it('renders candidate details successfully', async () => {
    renderWithRouter(<CandidateDetailPage />);
    
    expect(screen.getByTestId('loader')).toBeDefined(); // Assuming there's a loader

    await waitFor(() => {
      expect(screen.getByText('Jean Dupont')).toBeInTheDocument();
      expect(screen.getByText('Développeur Fullstack')).toBeInTheDocument();
      expect(screen.getByText('jean@example.com')).toBeInTheDocument();
      expect(screen.getByText(/5 ans d'expérience/i)).toBeInTheDocument();
    });
  });

  it('handles validation successfully', async () => {
    renderWithRouter(<CandidateDetailPage />);

    await waitFor(() => {
      expect(screen.getByText('Valider le profil')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Valider le profil'));

    await waitFor(() => {
      expect(screen.queryByText('Valider le profil')).not.toBeInTheDocument();
    });

    // MSW will return success, and react-query will invalidate queries
  });

  it('renders validated candidate correctly', async () => {
    currentStatus = 'validated';
    renderWithRouter(<CandidateDetailPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Validé')).toBeInTheDocument();
      expect(screen.getByText('Profil validé')).toBeInTheDocument();
      expect(screen.queryByText('Valider le profil')).not.toBeInTheDocument();
    });
  });

  it('shows error message on validation failure', async () => {
    server.use(
      http.post('/api/candidates/1/validate', () => {
        return HttpResponse.json({ success: false, error: 'Validation failed' }, { status: 400 });
      })
    );

    renderWithRouter(<CandidateDetailPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Valider le profil')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Valider le profil'));

    await waitFor(() => {
      expect(screen.getByText(/Validation failed/i)).toBeInTheDocument();
    });
  });

  it('handles candidate deletion with confirmation', async () => {
    renderWithRouter(<CandidateDetailPage />);

    await waitFor(() => {
      expect(screen.getByText('Supprimer')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Supprimer'));

    expect(window.confirm).toHaveBeenCalledWith('Êtes-vous sûr de vouloir supprimer ce candidat ?');
    
    await waitFor(() => {
      expect(screen.getByText('Home')).toBeInTheDocument();
    });
  });

  it('cancels candidate deletion', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(false);
    renderWithRouter(<CandidateDetailPage />);

    await waitFor(() => {
      expect(screen.getByText('Supprimer')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Supprimer'));

    expect(window.confirm).toHaveBeenCalled();
    expect(screen.queryByText('Home')).not.toBeInTheDocument();
    expect(screen.getByText('Jean Dupont')).toBeInTheDocument();
  });

  it('shows error state when candidate not found', async () => {
    server.use(
      http.get('/api/candidates/1', () => {
        return new HttpResponse(null, { status: 404 });
      })
    );

    renderWithRouter(<CandidateDetailPage />);

    await waitFor(() => {
      expect(screen.getByText('Candidat non trouvé')).toBeInTheDocument();
    });
  });
});
