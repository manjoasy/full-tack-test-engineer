import apiClient from './client';
import {
  Candidate,
  CandidateResponse,
  CandidatesResponse,
} from '../types';

export const getCandidates = async (params: {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}) => {
  const { data } = await apiClient.get<CandidatesResponse>('/candidates', {
    params,
  });
  return data;
};

export const getCandidate = async (id: string) => {
  const { data } = await apiClient.get<CandidateResponse>(`/candidates/${id}`);
  return data;
};

export const createCandidate = async (candidateData: Partial<Candidate>) => {
  const { data } = await apiClient.post<CandidateResponse>(
    '/candidates',
    candidateData
  );
  return data;
};

export const updateCandidate = async (
  id: string,
  candidateData: Partial<Candidate>
) => {
  const { data } = await apiClient.put<CandidateResponse>(
    `/candidates/${id}`,
    candidateData
  );
  return data;
};

export const deleteCandidate = async (id: string) => {
  const { data } = await apiClient.delete<CandidateResponse>(
    `/candidates/${id}`
  );
  return data;
};

export const validateCandidate = async (id: string) => {
  const { data } = await apiClient.post<CandidateResponse>(
    `/candidates/${id}/validate`
  );
  return data;
};
