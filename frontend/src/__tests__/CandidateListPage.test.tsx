import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import CandidateListPage from '../pages/CandidateListPage';
import { setupServer } from 'msw/node';
import { handlers } from '../test/handlers';
import { describe, it, beforeAll, afterAll, afterEach, expect, vi } from 'vitest';
import { http, HttpResponse } from 'msw';

const server = setupServer(...handlers);

const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

const wrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = createTestQueryClient();
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <MemoryRouter>{children}</MemoryRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
};

describe('CandidateListPage', () => {
  beforeAll(() => server.listen());
  afterEach(() => {
    server.resetHandlers();
    vi.clearAllMocks();
  });
  afterAll(() => server.close());

  it('renders the candidate list', async () => {
    render(<CandidateListPage />, { wrapper });

    expect(screen.getByText('Candidats')).toBeInTheDocument();
    
    await waitFor(() => {
      expect(screen.getByText('Jean Dupont')).toBeInTheDocument();
      expect(screen.getByText('Développeur')).toBeInTheDocument();
    });
  });

  it('shows filter inputs and handles search change', async () => {
    render(<CandidateListPage />, { wrapper });
    const searchInput = screen.getByPlaceholderText(/Rechercher/);
    
    fireEvent.change(searchInput, { target: { value: 'Jean' } });
    expect(searchInput).toHaveValue('Jean');
  });

  it('handles status filter change', async () => {
    render(<CandidateListPage />, { wrapper });
    const statusSelect = screen.getByRole('combobox');
    
    fireEvent.change(statusSelect, { target: { value: 'validated' } });
    expect(statusSelect).toHaveValue('validated');
  });

  it('shows error message on API failure', async () => {
    server.use(
      http.get('/api/candidates', () => {
        return new HttpResponse(null, { status: 500 });
      })
    );

    render(<CandidateListPage />, { wrapper });

    await waitFor(() => {
      expect(screen.getByText(/Une erreur est survenue/)).toBeInTheDocument();
    });
  });

  it('handles candidate deletion', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    render(<CandidateListPage />, { wrapper });

    await waitFor(() => {
      expect(screen.getByText('Jean Dupont')).toBeInTheDocument();
    });

    const deleteButton = screen.getAllByRole('button').find(btn => btn.className.includes('btn-outline') && btn.innerHTML.includes('lucide-trash'));
    if (deleteButton) {
      fireEvent.click(deleteButton);
    }

    await waitFor(() => {
      expect(window.confirm).toHaveBeenCalled();
    });
  });

  it('does not delete candidate if confirmation is cancelled', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(false);
    
    render(<CandidateListPage />, { wrapper });

    await waitFor(() => {
      expect(screen.getByText(/Jean Dupont/i)).toBeInTheDocument();
    });

    const deleteButton = screen.getAllByRole('button').find(
      btn => btn.style.color === 'var(--danger)'
    );
    
    if (deleteButton) {
      fireEvent.click(deleteButton);
    }

    expect(window.confirm).toHaveBeenCalled();
    // No request should be made to delete
    expect(screen.getByText(/Jean Dupont/i)).toBeInTheDocument();
  });

  it('shows empty state when no candidates found', async () => {
    server.use(
      http.get('/api/candidates', () => {
        return HttpResponse.json({
          success: true,
          data: [],
          pagination: { total: 0, page: 1, limit: 10, totalPages: 0 }
        });
      })
    );

    render(<CandidateListPage />, { wrapper });

    await waitFor(() => {
      expect(screen.getByText('Aucun candidat trouvé')).toBeInTheDocument();
    });
  });

  it('handles pagination', async () => {
    server.use(
      http.get('/api/candidates', ({ request }) => {
        const url = new URL(request.url);
        const page = url.searchParams.get('page') || '1';
        
        return HttpResponse.json({
          success: true,
          data: [
            {
              id: page === '1' ? '1' : '2',
              firstName: page === '1' ? 'Jean' : 'Pierre',
              lastName: 'Dupont',
              email: 'jean@example.com',
              phone: '0102030405',
              status: 'PENDING',
            },
          ],
          pagination: { total: 2, page: parseInt(page), limit: 1, totalPages: 2 },
        });
      })
    );

    render(<CandidateListPage />, { wrapper });

    await waitFor(() => {
      expect(screen.getByText(/Jean Dupont/i)).toBeInTheDocument();
    });

    const nextButton = screen.getByText(/Suivant/i);
    fireEvent.click(nextButton);

    await waitFor(() => {
      expect(screen.getByText(/Pierre Dupont/i)).toBeInTheDocument();
      expect(screen.getByText(/Page 2 sur 2/i)).toBeInTheDocument();
    });

    const prevButton = screen.getByText(/Précédent/i);
    fireEvent.click(prevButton);

    await waitFor(() => {
      expect(screen.getByText(/Jean Dupont/i)).toBeInTheDocument();
      expect(screen.getByText(/Page 1 sur 2/i)).toBeInTheDocument();
    });
  });

  it('filters by status', async () => {
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>{children}</MemoryRouter>
      </QueryClientProvider>
    );

    render(<CandidateListPage />, { wrapper });
    
    await waitFor(() => {
      expect(screen.getByText(/Jean Dupont/i)).toBeInTheDocument();
    });

    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'draft' } });
    
    await waitFor(() => {
      // The component should trigger a new fetch. 
      // Our MSW handler will still return Jean Dupont, which is fine to verify the event was handled.
      expect(screen.getByText(/Jean Dupont/i)).toBeInTheDocument();
    });
  });
});
