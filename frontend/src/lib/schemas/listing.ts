import { z } from 'zod';

const listingType = z.enum(['rent', 'sale', 'short_let']);
const furnishing = z.enum(['furnished', 'semi_furnished', 'unfurnished']);
const rentPeriod = z.enum(['yearly', 'monthly', 'quarterly', 'weekly', 'daily']);

export const listingSchema = z.object({
  listing_type: listingType,
  property_type_id: z.string().min(1, 'Property type is required'),
  title: z.string().min(5, 'Title must be at least 5 characters').max(200),
  description: z.string().min(20, 'Description must be at least 20 characters').max(5000),

  // Pricing — stored as naira strings in the form, converted to kobo on submit
  price_naira: z.string().min(1, 'Price is required').refine(
    (v) => !isNaN(Number(v)) && Number(v) > 0,
    'Enter a valid price',
  ),
  price_negotiable: z.boolean(),
  rent_period: rentPeriod,
  agency_fee_pct: z.string().optional().refine(
    (v) => !v || (!isNaN(Number(v)) && Number(v) >= 0 && Number(v) <= 100),
    'Must be 0-100',
  ),
  caution_fee_naira: z.string().optional(),
  service_charge_naira: z.string().optional(),
  legal_fee_naira: z.string().optional(),

  // Location
  state_id: z.string().min(1, 'State is required'),
  city_id: z.string().min(1, 'City is required'),
  area_id: z.string().optional(),
  address: z.string().min(3, 'Address is required').max(300),
  landmark_note: z.string().max(300).optional(),

  // Details
  bedrooms: z.string().optional(),
  bathrooms: z.string().optional(),
  toilets: z.string().optional(),
  sitting_rooms: z.string().optional(),
  floor_area_sqm: z.string().optional(),
  land_area_sqm: z.string().optional(),
  year_built: z.string().optional(),
  furnishing: furnishing,
  parking_spaces: z.string().optional(),

  // Amenities (booleans)
  has_bq: z.boolean(),
  has_swimming_pool: z.boolean(),
  has_gym: z.boolean(),
  has_cctv: z.boolean(),
  has_generator: z.boolean(),
  has_water_supply: z.boolean(),
  has_prepaid_meter: z.boolean(),
  is_serviced: z.boolean(),
  is_new_build: z.boolean(),
  inspection_available: z.boolean(),

  // Short let specific
  min_stay_days: z.string().optional(),
  max_stay_days: z.string().optional(),
  check_in_time: z.string().optional(),
  check_out_time: z.string().optional(),
}).superRefine((data, ctx) => {
  // Short let requires stay duration fields
  if (data.listing_type === 'short_let') {
    if (!data.min_stay_days) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Min stay is required for short lets', path: ['min_stay_days'] });
    }
  }
});

export type ListingFormData = z.infer<typeof listingSchema>;
