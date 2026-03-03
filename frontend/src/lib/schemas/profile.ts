import { z } from 'zod';

const NIGERIAN_PHONE = /^(\+?234|0)[789][01]\d{8}$/;

export const profileSchema = z.object({
  company_name: z.string().max(200).optional().or(z.literal('')),
  bio: z.string().max(2000).optional().or(z.literal('')),
  whatsapp_number: z
    .string()
    .regex(NIGERIAN_PHONE, 'Enter a valid Nigerian phone number')
    .optional()
    .or(z.literal('')),
  office_address: z.string().max(500).optional().or(z.literal('')),
  website: z.string().url('Enter a valid URL').optional().or(z.literal('')),
  years_experience: z.string().optional().or(z.literal('')),
  specializations: z.array(z.string()).optional(),
});

export type ProfileFormData = z.infer<typeof profileSchema>;
