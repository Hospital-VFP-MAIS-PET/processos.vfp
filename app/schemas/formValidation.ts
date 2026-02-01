import { z } from 'zod';

export const formValidationSchema = z.object({
  patientInfo: z.string()
    .min(1, 'Informações do paciente são obrigatórias'),
  selectedCount: z.number()
    .min(1, 'Selecione pelo menos um procedimento'),
});

export type FormValidation = z.infer<typeof formValidationSchema>;

export function validateForm(
  patientInfo: string,
  selectedCount: number
) {
  try {
    formValidationSchema.parse({
      patientInfo: patientInfo.trim(),
      selectedCount,
    });
    return { valid: true, errors: {} };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.flatten().fieldErrors;
      return { valid: false, errors };
    }
    return { valid: false, errors: {} };
  }
}
