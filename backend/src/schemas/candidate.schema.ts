import { z } from 'zod';

export const createCandidateSchema = z.object({
  firstName: z
    .string({
      required_error: 'Le prénom est requis',
      invalid_type_error: 'Le prénom doit être une chaîne de caractères',
    })
    .min(2, 'Le prénom doit contenir au moins 2 caractères')
    .max(50, 'Le prénom ne doit pas dépasser 50 caractères')
    .trim(),
  lastName: z
    .string({
      required_error: 'Le nom est requis',
      invalid_type_error: 'Le nom doit être une chaîne de caractères',
    })
    .min(2, 'Le nom doit contenir au moins 2 caractères')
    .max(50, 'Le nom ne doit pas dépasser 50 caractères')
    .trim(),
  email: z
    .string({
      required_error: "L'email est requis",
      invalid_type_error: "L'email doit être une chaîne de caractères",
    })
    .trim()
    .toLowerCase()
    .email("Format d'email invalide"),
  phone: z
    .string({
      required_error: 'Le numéro de téléphone est requis',
      invalid_type_error: 'Le numéro de téléphone doit être une chaîne de caractères',
    })
    .regex(
      /^(\+?\d{1,3}[-.\s]?)?\(?\d{1,4}\)?[-.\s]?\d{1,4}[-.\s]?\d{1,9}$/,
      'Format de numéro de téléphone invalide'
    )
    .trim(),
  position: z
    .string({
      required_error: 'Le poste est requis',
      invalid_type_error: 'Le poste doit être une chaîne de caractères',
    })
    .min(2, 'Le poste doit contenir au moins 2 caractères')
    .max(100, 'Le poste ne doit pas dépasser 100 caractères')
    .trim(),
  experience: z
    .number({
      required_error: "Les années d'expérience sont requises",
      invalid_type_error: "Les années d'expérience doivent être un nombre",
    })
    .int("Les années d'expérience doivent être un nombre entier")
    .min(0, "Les années d'expérience ne peuvent pas être négatives")
    .max(50, "Les années d'expérience ne peuvent pas dépasser 50"),
  skills: z
    .array(
      z.string().min(1, 'Une compétence ne peut pas être vide'),
      {
        required_error: 'Les compétences sont requises',
        invalid_type_error: 'Les compétences doivent être un tableau',
      }
    )
    .min(1, 'Au moins une compétence est requise'),
});

export const updateCandidateSchema = createCandidateSchema.partial();

export const loginSchema = z.object({
  username: z
    .string({
      required_error: "Le nom d'utilisateur est requis",
    })
    .min(1, "Le nom d'utilisateur est requis"),
  password: z
    .string({
      required_error: 'Le mot de passe est requis',
    })
    .min(1, 'Le mot de passe est requis'),
});

export type CreateCandidateInput = z.infer<typeof createCandidateSchema>;
export type UpdateCandidateInput = z.infer<typeof updateCandidateSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
