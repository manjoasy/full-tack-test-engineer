import mongoose, { Document, Schema } from 'mongoose';

export enum CandidateStatus {
  DRAFT = 'draft',
  VALIDATED = 'validated',
  DELETED = 'deleted',
}

export interface ICandidate extends Document {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  position: string;
  experience: number;
  skills: string[];
  status: CandidateStatus;
  isDeleted: boolean;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const candidateSchema = new Schema<ICandidate>(
  {
    firstName: {
      type: String,
      required: [true, 'Le prénom est requis'],
      trim: true,
      minlength: [2, 'Le prénom doit contenir au moins 2 caractères'],
      maxlength: [50, 'Le prénom ne doit pas dépasser 50 caractères'],
    },
    lastName: {
      type: String,
      required: [true, 'Le nom est requis'],
      trim: true,
      minlength: [2, 'Le nom doit contenir au moins 2 caractères'],
      maxlength: [50, 'Le nom ne doit pas dépasser 50 caractères'],
    },
    email: {
      type: String,
      required: [true, "L'email est requis"],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Format d'email invalide"],
    },
    phone: {
      type: String,
      required: [true, 'Le numéro de téléphone est requis'],
      trim: true,
      match: [
        /^(\+?\d{1,3}[-.\s]?)?\(?\d{1,4}\)?[-.\s]?\d{1,4}[-.\s]?\d{1,9}$/,
        'Format de numéro de téléphone invalide',
      ],
    },
    position: {
      type: String,
      required: [true, 'Le poste est requis'],
      trim: true,
      minlength: [2, 'Le poste doit contenir au moins 2 caractères'],
      maxlength: [100, 'Le poste ne doit pas dépasser 100 caractères'],
    },
    experience: {
      type: Number,
      required: [true, "Les années d'expérience sont requises"],
      min: [0, "Les années d'expérience ne peuvent pas être négatives"],
      max: [50, "Les années d'expérience ne peuvent pas dépasser 50"],
    },
    skills: {
      type: [String],
      required: [true, 'Au moins une compétence est requise'],
      validate: {
        validator: (v: string[]) => v.length > 0,
        message: 'Au moins une compétence est requise',
      },
    },
    status: {
      type: String,
      enum: Object.values(CandidateStatus),
      default: CandidateStatus.DRAFT,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret: any) => {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Index for common queries
candidateSchema.index({ isDeleted: 1, status: 1 });
candidateSchema.index({ firstName: 'text', lastName: 'text', email: 'text' });

export const Candidate = mongoose.model<ICandidate>('Candidate', candidateSchema);
