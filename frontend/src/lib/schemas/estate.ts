import { z } from 'zod';

const estateType = z.enum(['gated_estate', 'open_estate', 'highrise', 'mixed_use']);

export const estateSchema = z.object({
  name: z.string().min(2, 'Estate name is required').max(200),
  area_id: z.string().min(1, 'Area is required'),
  estate_type: estateType,
  description: z.string().max(2000).optional().or(z.literal('')),
  developer: z.string().max(200).optional().or(z.literal('')),
  year_built: z.string().optional().or(z.literal('')),
  total_units: z.string().optional().or(z.literal('')),
  amenities: z.string().optional().or(z.literal('')),
  security_type: z.string().max(100).optional().or(z.literal('')),
  service_charge_kobo: z.string().optional().or(z.literal('')),
  service_charge_period: z.string().optional().or(z.literal('')),
  electricity_source: z.string().max(100).optional().or(z.literal('')),
  water_source: z.string().max(100).optional().or(z.literal('')),
  cover_image_url: z.string().url('Enter a valid URL').optional().or(z.literal('')),
});

export type EstateFormData = z.infer<typeof estateSchema>;

export function parseEstateAmenities(amenities?: string): string[] {
  return amenities ? amenities.split(',').map((a) => a.trim()).filter(Boolean) : [];
}
