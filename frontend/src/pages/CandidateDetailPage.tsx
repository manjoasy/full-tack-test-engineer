import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getCandidate, validateCandidate, deleteCandidate } from '../api/candidates';
import { CandidateStatus } from '../types';
import { ArrowLeft, CheckCircle, Trash2, Edit, Calendar, Mail, Phone, Briefcase } from 'lucide-react';

const CandidateDetailPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['candidate', id],
    queryFn: () => getCandidate(id!),
  });

  const validateMutation = useMutation({
    mutationFn: validateCandidate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['candidate', id] });
      queryClient.invalidateQueries({ queryKey: ['candidates'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCandidate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['candidates'] });
      navigate('/');
    },
  });

  const handleValidate = () => {
    validateMutation.mutate(id!);
  };

  const handleDelete = () => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce candidat ?')) {
      deleteMutation.mutate(id!);
    }
  };

  if (isLoading) return (
    <div data-testid="loader" style={{ display: 'flex', justifyContent: 'center', padding: '5rem' }}>
      <div className="loading-spinner"></div>
    </div>
  );
  if (error || !data) return <div className="error-text">Candidat non trouvé</div>;

  const candidate = data.data;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button onClick={() => navigate(-1)} className="btn btn-outline" style={{ padding: '0.5rem' }}>
            <ArrowLeft size={18} />
          </button>
          <h1>Détails du candidat</h1>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Link to={`/candidates/${id}/edit`} className="btn btn-outline">
            <Edit size={18} />
            Modifier
          </Link>
          <button onClick={handleDelete} className="btn btn-outline" style={{ color: 'var(--danger)' }}>
            <Trash2 size={18} />
            Supprimer
          </button>
          {candidate.status === CandidateStatus.DRAFT && (
            <button
              onClick={handleValidate}
              className="btn btn-primary"
              disabled={validateMutation.isPending}
            >
              <CheckCircle size={18} />
              {validateMutation.isPending ? 'Validation en cours...' : 'Valider le profil'}
            </button>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '2rem' }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: 700 }}>
              {candidate.firstName[0]}{candidate.lastName[0]}
            </div>
            <div>
              <h2 style={{ fontSize: '1.75rem' }}>{candidate.firstName} {candidate.lastName}</h2>
              <span className={`badge badge-${candidate.status}`}>
                {candidate.status === CandidateStatus.DRAFT ? 'Brouillon' : 'Validé'}
              </span>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
            <div>
              <h3 style={{ fontSize: '1.125rem', marginBottom: '1rem', color: 'var(--text-muted)' }}>Coordonnées</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <Mail size={18} color="var(--text-muted)" />
                  <span>{candidate.email}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <Phone size={18} color="var(--text-muted)" />
                  <span>{candidate.phone}</span>
                </div>
              </div>
            </div>
            <div>
              <h3 style={{ fontSize: '1.125rem', marginBottom: '1rem', color: 'var(--text-muted)' }}>Expérience professionnelle</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <Briefcase size={18} color="var(--text-muted)" />
                  <span>{candidate.position}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <Calendar size={18} color="var(--text-muted)" />
                  <span>{candidate.experience} ans d'expérience</span>
                </div>
              </div>
            </div>
          </div>

          <div style={{ marginTop: '2.5rem' }}>
            <h3 style={{ fontSize: '1.125rem', marginBottom: '1rem', color: 'var(--text-muted)' }}>Compétences</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {candidate.skills.map((skill, index) => (
                <span key={index} className="badge" style={{ background: 'var(--bg-main)', color: 'var(--primary)', border: '1px solid var(--border)', padding: '0.5rem 1rem' }}>
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="card">
          <h3 style={{ fontSize: '1.125rem', marginBottom: '1.5rem' }}>Historique</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ borderLeft: '2px solid var(--border)', paddingLeft: '1.5rem', position: 'relative' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: 'var(--border)', position: 'absolute', left: '-7px', top: '5px' }}></div>
              <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>Candidat créé</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{new Date(candidate.createdAt).toLocaleString()}</div>
            </div>
            {candidate.status === CandidateStatus.VALIDATED && (
              <div style={{ borderLeft: '2px solid var(--success)', paddingLeft: '1.5rem', position: 'relative' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: 'var(--success)', position: 'absolute', left: '-7px', top: '5px' }}></div>
                <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--success)' }}>Profil validé</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{new Date(candidate.updatedAt).toLocaleString()}</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {validateMutation.isError && (
        <div className="card" style={{ marginTop: '2rem', borderColor: 'var(--danger)', background: '#fff1f2' }}>
          <p className="error-text">
            Erreur lors de la validation: {((validateMutation.error as any)?.response?.data?.error) || 'Une erreur est survenue'}
          </p>
        </div>
      )}
    </div>
  );
};

export default CandidateDetailPage;
