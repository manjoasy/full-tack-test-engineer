import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { getCandidates, deleteCandidate } from '../api/candidates';
import { CandidateStatus } from '../types';
import { Plus, Search, Trash2, Eye, Filter } from 'lucide-react';

const CandidateListPage: React.FC = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['candidates', page, search, status],
    queryFn: () => getCandidates({ page, search, status }),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCandidate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['candidates'] });
    },
  });

  const handleDelete = (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce candidat ?')) {
      deleteMutation.mutate(id);
    }
  };

  if (error) return <div className="error-text">Une erreur est survenue lors du chargement des candidats</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1>Candidats</h1>
        <Link to="/candidates/new" className="btn btn-primary">
          <Plus size={18} />
          Nouveau candidat
        </Link>
      </div>

      <div className="card" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '200px', position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              className="input"
              placeholder="Rechercher par nom, email..."
              style={{ paddingLeft: '2.5rem' }}
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
          <div style={{ minWidth: '150px' }}>
            <select
              className="input"
              value={status}
              onChange={(e) => { setStatus(e.target.value); setPage(1); }}
            >
              <option value="">Tous les statuts</option>
              <option value={CandidateStatus.DRAFT}>Brouillon</option>
              <option value={CandidateStatus.VALIDATED}>Validé</option>
            </select>
          </div>
        </div>
      </div>

      <div className="card" style={{ overflowX: 'auto' }}>
        {isLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
            <div className="loading-spinner"></div>
          </div>
        ) : (
          <>
            <table className="table">
              <thead>
                <tr>
                  <th>Nom complet</th>
                  <th>Poste</th>
                  <th>Expérience</th>
                  <th>Statut</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {data?.data.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                      Aucun candidat trouvé
                    </td>
                  </tr>
                ) : (
                  data?.data.map((candidate) => (
                    <tr key={candidate.id}>
                      <td>
                        <div style={{ fontWeight: 600 }}>{candidate.firstName} {candidate.lastName}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{candidate.email}</div>
                      </td>
                      <td>{candidate.position}</td>
                      <td>{candidate.experience} ans</td>
                      <td>
                        <span className={`badge badge-${candidate.status}`}>
                          {candidate.status === CandidateStatus.DRAFT ? 'Brouillon' : 'Validé'}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <Link to={`/candidates/${candidate.id}`} className="btn btn-outline" style={{ padding: '0.4rem' }}>
                            <Eye size={16} />
                          </Link>
                          <button
                            onClick={() => handleDelete(candidate.id)}
                            className="btn btn-outline"
                            style={{ padding: '0.4rem', color: 'var(--danger)' }}
                            disabled={deleteMutation.isPending}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            {data?.pagination && data.pagination.totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '1.5rem' }}>
                <button
                  className="btn btn-outline"
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                >
                  Précédent
                </button>
                <div style={{ display: 'flex', alignItems: 'center', padding: '0 1rem' }}>
                  Page {page} sur {data.pagination.totalPages}
                </div>
                <button
                  className="btn btn-outline"
                  disabled={page === data.pagination.totalPages}
                  onClick={() => setPage(page + 1)}
                >
                  Suivant
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default CandidateListPage;
