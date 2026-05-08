import { http, HttpResponse } from 'msw';
import { CandidateStatus } from '../types';

export const handlers = [
  // Mock login
  http.post('/api/auth/login', async ({ request }) => {
    const body = await request.json() as any;
    if (body.username === 'error') {
      return new HttpResponse(null, { status: 500 });
    }
    return HttpResponse.json({
      success: true,
      data: {
        token: 'mock-token',
        user: { id: '1', username: 'admin' },
      },
    });
  }),

  // Mock get candidates
  http.get('/api/candidates', () => {
    return HttpResponse.json({
      success: true,
      data: [
        {
          id: '1',
          firstName: 'Jean',
          lastName: 'Dupont',
          email: 'jean.dupont@example.com',
          phone: '0612345678',
          position: 'Développeur',
          experience: 5,
          skills: ['React'],
          status: CandidateStatus.DRAFT,
          isDeleted: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
      pagination: {
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      },
    });
  }),

  // Mock get candidate detail
  http.get('/api/candidates/:id', ({ params }) => {
    if (params.id === '401') {
      return new HttpResponse(null, { status: 401 });
    }
    return HttpResponse.json({
      success: true,
      data: {
        id: params.id,
        firstName: 'Jean',
        lastName: 'Dupont',
        email: 'jean.dupont@example.com',
        phone: '0612345678',
        position: 'Développeur',
        experience: 5,
        skills: ['React'],
        status: CandidateStatus.DRAFT,
        isDeleted: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    });
  }),

  // Mock create candidate
  http.post('/api/candidates', async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({
      success: true,
      data: { id: 'new-id', ...body },
    });
  }),

  // Mock update candidate
  http.put('/api/candidates/:id', async ({ params, request }) => {
    const body = await request.json();
    return HttpResponse.json({
      success: true,
      data: { id: params.id, ...body },
    });
  }),

  // Mock delete candidate
  http.delete('/api/candidates/:id', ({ params }) => {
    return HttpResponse.json({
      success: true,
      data: { id: params.id, isDeleted: true },
    });
  }),

  // Mock validate candidate
  http.post('/api/candidates/:id/validate', ({ params }) => {
    return HttpResponse.json({
      success: true,
      data: {
        id: params.id,
        status: CandidateStatus.VALIDATED,
      },
      message: 'Candidat validé avec succès',
    });
  }),
];
