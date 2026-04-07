import { z } from 'zod';

const NIGERIAN_PHONE = /^(\+?234|0)[789][01]\d{8}$/;

export const loginSchema = z.object({
  method: z.enum(['phone', 'email']),
  phone: z.string().optional(),
  email: z.string().optional(),
}).refine(
  (data) => {
    if (data.method === 'phone') return NIGERIAN_PHONE.test(data.phone || '');
    return z.string().email().safeParse(data.email).success;
  },
  {
    message: 'Enter a valid phone number or email address',
    path: ['phone'],
  },
);

export const otpSchema = z.object({
  otp: z.string().length(6, 'OTP must be 6 digits').regex(/^\d+$/, 'OTP must be digits only'),
});

export const registerSchema = z.object({
  first_name: z.string().min(2, 'First name must be at least 2 characters').max(50),
  last_name: z.string().min(2, 'Last name must be at least 2 characters').max(50),
  phone: z.string().regex(NIGERIAN_PHONE, 'Enter a valid Nigerian phone number (e.g. 08012345678)'),
  email: z.string().email('Enter a valid email address').optional().or(z.literal('')),
  role: z.enum(['user', 'agent']),
  channel: z.enum(['sms', 'email']).optional(),
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type OtpFormData = z.infer<typeof otpSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
