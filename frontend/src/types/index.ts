export enum CandidateStatus {
  DRAFT = 'draft',
  VALIDATED = 'validated',
  DELETED = 'deleted',
}

export interface Candidate {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  position: string;
  experience: number;
  skills: string[];
  status: CandidateStatus;
  isDeleted: boolean;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CandidatesResponse {
  success: boolean;
  data: Candidate[];
  pagination: Pagination;
}

export interface CandidateResponse {
  success: boolean;
  data: Candidate;
  message?: string;
}

export interface LoginResponse {
  success: boolean;
  data: {
    token: string;
    user: {
      id: string;
      username: string;
    };
  };
}
