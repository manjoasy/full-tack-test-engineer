import { createCandidateSchema, updateCandidateSchema, loginSchema } from '../../schemas/candidate.schema';

describe('Candidate Schemas', () => {
  describe('createCandidateSchema', () => {
    const validCandidate = {
      firstName: 'Jean',
      lastName: 'Dupont',
      email: 'jean.dupont@example.com',
      phone: '+33612345678',
      position: 'Développeur Full Stack',
      experience: 5,
      skills: ['TypeScript', 'React'],
    };

    it('should validate a correct candidate', () => {
      const result = createCandidateSchema.safeParse(validCandidate);
      expect(result.success).toBe(true);
    });

    it('should trim and lowercase email', () => {
      const result = createCandidateSchema.parse({
        ...validCandidate,
        email: '  JEAN.DUPONT@EXAMPLE.COM  ',
      });
      expect(result.email).toBe('jean.dupont@example.com');
    });

    it('should reject missing firstName', () => {
      const { firstName, ...data } = validCandidate;
      const result = createCandidateSchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('Le prénom est requis');
      }
    });

    it('should reject firstName too short', () => {
      const result = createCandidateSchema.safeParse({
        ...validCandidate,
        firstName: 'A',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('au moins 2 caractères');
      }
    });

    it('should reject firstName too long', () => {
      const result = createCandidateSchema.safeParse({
        ...validCandidate,
        firstName: 'A'.repeat(51),
      });
      expect(result.success).toBe(false);
    });

    it('should reject missing lastName', () => {
      const { lastName, ...data } = validCandidate;
      const result = createCandidateSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should reject invalid email', () => {
      const result = createCandidateSchema.safeParse({
        ...validCandidate,
        email: 'not-an-email',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toContain("email invalide");
      }
    });

    it('should reject missing email', () => {
      const { email, ...data } = validCandidate;
      const result = createCandidateSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should reject invalid phone format', () => {
      const result = createCandidateSchema.safeParse({
        ...validCandidate,
        phone: 'abc',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('téléphone invalide');
      }
    });

    it('should reject negative experience', () => {
      const result = createCandidateSchema.safeParse({
        ...validCandidate,
        experience: -1,
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('négatives');
      }
    });

    it('should reject experience > 50', () => {
      const result = createCandidateSchema.safeParse({
        ...validCandidate,
        experience: 51,
      });
      expect(result.success).toBe(false);
    });

    it('should reject non-integer experience', () => {
      const result = createCandidateSchema.safeParse({
        ...validCandidate,
        experience: 5.5,
      });
      expect(result.success).toBe(false);
    });

    it('should reject empty skills array', () => {
      const result = createCandidateSchema.safeParse({
        ...validCandidate,
        skills: [],
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('Au moins une compétence');
      }
    });

    it('should reject missing skills', () => {
      const { skills, ...data } = validCandidate;
      const result = createCandidateSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should reject empty string in skills', () => {
      const result = createCandidateSchema.safeParse({
        ...validCandidate,
        skills: [''],
      });
      expect(result.success).toBe(false);
    });

    it('should reject non-string experience', () => {
      const result = createCandidateSchema.safeParse({
        ...validCandidate,
        experience: 'five',
      });
      expect(result.success).toBe(false);
    });

    it('should accept valid phone formats', () => {
      const phones = ['+33612345678', '0612345678', '+1-202-555-0123', '(555) 123-4567'];
      phones.forEach((phone) => {
        const result = createCandidateSchema.safeParse({ ...validCandidate, phone });
        expect(result.success).toBe(true);
      });
    });
  });

  describe('updateCandidateSchema', () => {
    it('should accept partial updates', () => {
      const result = updateCandidateSchema.safeParse({ firstName: 'Pierre' });
      expect(result.success).toBe(true);
    });

    it('should accept empty object (no update)', () => {
      const result = updateCandidateSchema.safeParse({});
      expect(result.success).toBe(true);
    });

    it('should still validate fields that are provided', () => {
      const result = updateCandidateSchema.safeParse({ email: 'not-an-email' });
      expect(result.success).toBe(false);
    });

    it('should accept single skill update', () => {
      const result = updateCandidateSchema.safeParse({
        skills: ['Python'],
      });
      expect(result.success).toBe(true);
    });
  });

  describe('loginSchema', () => {
    it('should validate valid login', () => {
      const result = loginSchema.safeParse({
        username: 'admin',
        password: 'admin123',
      });
      expect(result.success).toBe(true);
    });

    it('should reject missing username', () => {
      const result = loginSchema.safeParse({ password: 'admin123' });
      expect(result.success).toBe(false);
    });

    it('should reject missing password', () => {
      const result = loginSchema.safeParse({ username: 'admin' });
      expect(result.success).toBe(false);
    });

    it('should reject empty username', () => {
      const result = loginSchema.safeParse({ username: '', password: 'test' });
      expect(result.success).toBe(false);
    });

    it('should reject empty password', () => {
      const result = loginSchema.safeParse({ username: 'admin', password: '' });
      expect(result.success).toBe(false);
    });
  });
});
