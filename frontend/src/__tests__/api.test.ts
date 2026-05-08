import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as api from '../api/candidates';
import apiClient from '../api/client';
import { CandidateStatus } from '../types';

// Mock the apiClient instance
vi.mock('../api/client', () => {
  return {
    default: {
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
      interceptors: {
        request: { use: vi.fn(), eject: vi.fn() },
        response: { use: vi.fn(), eject: vi.fn() },
      },
      defaults: { headers: { common: {} } }
    }
  };
});

describe('API Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  describe('candidate API functions', () => {
    it('getCandidates fetches candidates with params', async () => {
      const mockResponse = { data: { success: true, data: [], total: 0 } };
      (apiClient.get as any).mockResolvedValue(mockResponse);

      const params = { page: 1, search: 'test' };
      const result = await api.getCandidates(params);

      expect(apiClient.get).toHaveBeenCalledWith('/candidates', { params });
      expect(result).toEqual(mockResponse.data);
    });

    it('getCandidate fetches a single candidate', async () => {
      const mockResponse = { data: { success: true, data: { id: '1' } } };
      (apiClient.get as any).mockResolvedValue(mockResponse);

      const result = await api.getCandidate('1');

      expect(apiClient.get).toHaveBeenCalledWith('/candidates/1');
      expect(result).toEqual(mockResponse.data);
    });

    it('createCandidate sends a POST request', async () => {
      const mockResponse = { data: { success: true, data: { id: 'new' } } };
      (apiClient.post as any).mockResolvedValue(mockResponse);

      const candidateData = { firstName: 'Pierre' };
      const result = await api.createCandidate(candidateData);

      expect(apiClient.post).toHaveBeenCalledWith('/candidates', candidateData);
      expect(result).toEqual(mockResponse.data);
    });

    it('updateCandidate sends a PUT request', async () => {
      const mockResponse = { data: { success: true, data: { id: '1' } } };
      (apiClient.put as any).mockResolvedValue(mockResponse);

      const updateData = { firstName: 'Updated' };
      const result = await api.updateCandidate('1', updateData);

      expect(apiClient.put).toHaveBeenCalledWith('/candidates/1', updateData);
      expect(result).toEqual(mockResponse.data);
    });

    it('deleteCandidate sends a DELETE request', async () => {
      const mockResponse = { data: { success: true, data: { id: '1' } } };
      (apiClient.delete as any).mockResolvedValue(mockResponse);

      const result = await api.deleteCandidate('1');

      expect(apiClient.delete).toHaveBeenCalledWith('/candidates/1');
      expect(result).toEqual(mockResponse.data);
    });

    it('validateCandidate sends a POST request', async () => {
      const mockResponse = { data: { success: true, data: { id: '1', status: CandidateStatus.VALIDATED } } };
      (apiClient.post as any).mockResolvedValue(mockResponse);

      const result = await api.validateCandidate('1');

      expect(apiClient.post).toHaveBeenCalledWith('/candidates/1/validate');
      expect(result).toEqual(mockResponse.data);
    });
  });
});
