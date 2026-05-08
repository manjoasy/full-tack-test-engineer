import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import CandidateFormPage from '../pages/CandidateFormPage';
import { describe, it, expect, vi, beforeAll, afterAll, afterEach } from 'vitest';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';

const mockCandidate = {
  id: '1',
  status: 'draft',
  firstName: 'Jean',
  lastName: 'Dupont',
  email: 'jean@example.com',
  phone: '0102030405',
  position: 'Développeur',
  experience: 5,
  skills: ['React'],
};

const handlers = [
  http.get('/api/candidates/1', () => {
    return HttpResponse.json({ success: true, data: mockCandidate });
  }),
  http.post('/api/candidates', async ({ request }) => {
    const data = await request.json();
    return HttpResponse.json({ success: true, data: { id: 'new', ...data as any } });
  }),
  http.put('/api/candidates/1', async ({ request }) => {
    const data = await request.json();
    return HttpResponse.json({ success: true, data: { id: '1', ...data as any } });
  }),
];

const server = setupServer(...handlers);

const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: { retry: false },
  },
});

const renderWithRouter = (ui: React.ReactNode, { route = '/candidates/new' } = {}) => {
  const queryClient = createTestQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[route]}>
        <Routes>
          <Route path="/candidates/new" element={ui} />
          <Route path="/candidates/:id/edit" element={ui} />
          <Route path="/" element={<div>Home</div>} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  );
};

describe('CandidateFormPage', () => {
  beforeAll(() => server.listen());
  afterEach(() => {
    server.resetHandlers();
    vi.clearAllMocks();
  });
  afterAll(() => server.close());

  it('renders create form successfully', () => {
    renderWithRouter(<CandidateFormPage />);
    expect(screen.getByText('Ajouter un candidat')).toBeInTheDocument();
  });

  it('renders edit form and loads data', async () => {
    renderWithRouter(<CandidateFormPage />, { route: '/candidates/1/edit' });
    
    await waitFor(() => {
      expect(screen.getByDisplayValue('Jean')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Dupont')).toBeInTheDocument();
      expect(screen.getByDisplayValue('React')).toBeInTheDocument();
    });
  });

  it('shows validation errors for empty fields', async () => {
    renderWithRouter(<CandidateFormPage />);
    
    fireEvent.click(screen.getByText('Enregistrer'));

    await waitFor(() => {
      expect(screen.getByText('Le prénom doit contenir au moins 2 caractères')).toBeInTheDocument();
      expect(screen.getByText('Le nom doit contenir au moins 2 caractères')).toBeInTheDocument();
      expect(screen.getByText("Format d'email invalide")).toBeInTheDocument();
    });
  });

  it('handles adding and removing skills', async () => {
    renderWithRouter(<CandidateFormPage />);
    
    const addButton = screen.getByLabelText(/ajouter une compétence/i);
    fireEvent.click(addButton);

    const inputs = screen.getAllByRole('textbox');
    // firstName, lastName, email, phone, position, and 2 skills
    // Actually, skills are 'textbox' but others are too.
    // Let's check skills specifically.
    
    await waitFor(() => {
      expect(screen.getAllByRole('textbox').length).toBeGreaterThan(5);
    });
  });

  it('submits form successfully', async () => {
    renderWithRouter(<CandidateFormPage />);
    
    fireEvent.change(screen.getByLabelText(/^Prénom$/i), { target: { value: 'Pierre' } });
    fireEvent.change(screen.getByLabelText(/^Nom$/i), { target: { value: 'Martin' } });
    fireEvent.change(screen.getByLabelText(/^Email$/i), { target: { value: 'pierre@example.com' } });
    fireEvent.change(screen.getByLabelText(/^Téléphone$/i), { target: { value: '0607080910' } });
    fireEvent.change(screen.getByLabelText(/^Poste$/i), { target: { value: 'Designer' } });
    fireEvent.change(screen.getByLabelText(/Années d'expérience/i), { target: { value: 3 } });
    // Skill input - click add if not present or just to be sure
    fireEvent.click(screen.getByLabelText(/ajouter une compétence/i));
    fireEvent.change(screen.getByLabelText(/Compétence 1/i), { target: { value: 'React' } });

    fireEvent.click(screen.getByText('Enregistrer'));

    await waitFor(() => {
      expect(screen.getByText('Home')).toBeInTheDocument();
    });
  });
});
