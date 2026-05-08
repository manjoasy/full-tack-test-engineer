import React from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createCandidate, getCandidate, updateCandidate } from '../api/candidates';
import { Save, ArrowLeft, Plus, X } from 'lucide-react';

const candidateSchema = z.object({
  firstName: z.string().min(2, 'Le prénom doit contenir au moins 2 caractères'),
  lastName: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  email: z.string().email("Format d'email invalide"),
  phone: z.string().min(10, 'Numéro de téléphone invalide'),
  position: z.string().min(2, 'Le poste est requis'),
  experience: z.number().min(0, 'L\'expérience ne peut pas être négative').max(50),
  skills: z.array(z.string().min(1, 'Compétence vide')).min(1, 'Au moins une compétence est requise'),
});

type CandidateFormData = z.infer<typeof candidateSchema>;

const CandidateFormPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEdit = !!id;

  const { data: candidateData, isLoading: isLoadingCandidate } = useQuery({
    queryKey: ['candidate', id],
    queryFn: () => getCandidate(id!),
    enabled: isEdit,
  });

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<CandidateFormData>({
    resolver: zodResolver(candidateSchema),
    defaultValues: {
      skills: [''],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'skills' as any,
  });

  React.useEffect(() => {
    if (candidateData?.data) {
      reset({
        firstName: candidateData.data.firstName,
        lastName: candidateData.data.lastName,
        email: candidateData.data.email,
        phone: candidateData.data.phone,
        position: candidateData.data.position,
        experience: candidateData.data.experience,
        skills: candidateData.data.skills,
      });
    }
  }, [candidateData, reset]);

  const mutation = useMutation({
    mutationFn: (data: CandidateFormData) =>
      isEdit ? updateCandidate(id!, data) : createCandidate(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['candidates'] });
      navigate('/');
    },
  });

  const onSubmit = (data: CandidateFormData) => {
    mutation.mutate(data);
  };

  if (isEdit && isLoadingCandidate) return <div data-testid="loader" className="loading-spinner"></div>;

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <button onClick={() => navigate(-1)} className="btn btn-outline" style={{ padding: '0.5rem' }}>
          <ArrowLeft size={18} />
        </button>
        <h1>{isEdit ? 'Modifier le candidat' : 'Ajouter un candidat'}</h1>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
            <div className="form-group">
              <label className="label" htmlFor="firstName">Prénom</label>
              <input id="firstName" {...register('firstName')} className="input" />
              {errors.firstName && <p className="error-text">{errors.firstName.message}</p>}
            </div>

            <div className="form-group">
              <label className="label" htmlFor="lastName">Nom</label>
              <input id="lastName" {...register('lastName')} className="input" />
              {errors.lastName && <p className="error-text">{errors.lastName.message}</p>}
            </div>

            <div className="form-group">
              <label className="label" htmlFor="email">Email</label>
              <input id="email" {...register('email')} type="email" className="input" />
              {errors.email && <p className="error-text">{errors.email.message}</p>}
            </div>

            <div className="form-group">
              <label className="label" htmlFor="phone">Téléphone</label>
              <input id="phone" {...register('phone')} className="input" />
              {errors.phone && <p className="error-text">{errors.phone.message}</p>}
            </div>

            <div className="form-group">
              <label className="label" htmlFor="position">Poste</label>
              <input id="position" {...register('position')} className="input" />
              {errors.position && <p className="error-text">{errors.position.message}</p>}
            </div>

            <div className="form-group">
              <label className="label" htmlFor="experience">Années d'expérience</label>
              <input id="experience" {...register('experience', { valueAsNumber: true })} type="number" className="input" />
              {errors.experience && <p className="error-text">{errors.experience.message}</p>}
            </div>
          </div>

          <div className="form-group">
            <label className="label">Compétences</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {fields.map((field, index) => (
                <div key={field.id} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <input
                    {...register(`skills.${index}` as any)}
                    className="input"
                    style={{ width: '150px' }}
                    aria-label={`Compétence ${index + 1}`}
                  />
                  {fields.length > 1 && (
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      className="btn"
                      style={{ padding: '0.25rem', color: 'var(--danger)' }}
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={() => append('')}
                className="btn btn-outline"
                style={{ padding: '0.5rem' }}
                aria-label="Ajouter une compétence"
              >
                <Plus size={16} />
              </button>
            </div>
            {errors.skills && <p className="error-text">{errors.skills.message}</p>}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
            <button type="button" onClick={() => navigate(-1)} className="btn btn-outline">
              Annuler
            </button>
            <button type="submit" className="btn btn-primary" disabled={mutation.isPending}>
              <Save size={18} />
              {mutation.isPending ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CandidateFormPage;
