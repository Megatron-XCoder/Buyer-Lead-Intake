import { z } from 'zod';
import { City, PropertyType, BHK, Purpose, Timeline, Source, Status } from '@prisma/client';

const baseBuyerFormSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters').max(80, 'Name must be less than 80 characters'),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  phone: z.string().regex(/^\d{10,15}$/, 'Phone must be 10-15 digits'),
  city: z.nativeEnum(City),
  propertyType: z.nativeEnum(PropertyType),
  bhk: z.nativeEnum(BHK).optional(),
  purpose: z.nativeEnum(Purpose),
  budgetMin: z.number().int().positive().optional().or(z.nan()),
  budgetMax: z.number().int().positive().optional().or(z.nan()),
  timeline: z.nativeEnum(Timeline),
  source: z.nativeEnum(Source),
  status: z.nativeEnum(Status).optional(),
  notes: z.string().max(1000, 'Notes must be less than 1000 characters').optional(),
  tags: z.array(z.string()).optional()
});

const baseBuyerSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters').max(80, 'Name must be less than 80 characters'),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  phone: z.string().regex(/^\d{10,15}$/, 'Phone must be 10-15 digits'),
  city: z.nativeEnum(City),
  propertyType: z.nativeEnum(PropertyType),
  bhk: z.nativeEnum(BHK).optional(),
  purpose: z.nativeEnum(Purpose),
  budgetMin: z.number().int().positive().optional().or(z.nan()),
  budgetMax: z.number().int().positive().optional().or(z.nan()),
  timeline: z.nativeEnum(Timeline),
  source: z.nativeEnum(Source),
  status: z.nativeEnum(Status).default('NEW'),
  notes: z.string().max(1000, 'Notes must be less than 1000 characters').optional(),
  tags: z.array(z.string()).optional().default([])
});

// Form validation schema (without transform to avoid type conflicts)
export const buyerFormSchema = baseBuyerFormSchema.refine((data) => {
  // BHK is required if propertyType is Apartment or Villa
  if ((data.propertyType === 'APARTMENT' || data.propertyType === 'VILLA') && !data.bhk) {
    return false;
  }
  return true;
}, {
  message: 'BHK is required for Apartment and Villa property types',
  path: ['bhk']
}).refine((data) => {
  // If both budgetMin and budgetMax are provided, max must be >= min
  if (data.budgetMin && data.budgetMax && !isNaN(data.budgetMin) && !isNaN(data.budgetMax)) {
    return data.budgetMax >= data.budgetMin;
  }
  return true;
}, {
  message: 'Maximum budget must be greater than or equal to minimum budget',
  path: ['budgetMax']
});

// API processing schema (with transform for data processing)
export const buyerApiSchema = baseBuyerFormSchema.refine((data) => {
  // BHK is required if propertyType is Apartment or Villa
  if ((data.propertyType === 'APARTMENT' || data.propertyType === 'VILLA') && !data.bhk) {
    return false;
  }
  return true;
}, {
  message: 'BHK is required for Apartment and Villa property types',
  path: ['bhk']
}).refine((data) => {
  // If both budgetMin and budgetMax are provided, max must be >= min
  if (data.budgetMin && data.budgetMax && !isNaN(data.budgetMin) && !isNaN(data.budgetMax)) {
    return data.budgetMax >= data.budgetMin;
  }
  return true;
}, {
  message: 'Maximum budget must be greater than or equal to minimum budget',
  path: ['budgetMax']
}).transform((data) => ({
  ...data,
  email: data.email === '' ? undefined : data.email,
  budgetMin: isNaN(data.budgetMin as number) ? undefined : data.budgetMin,
  budgetMax: isNaN(data.budgetMax as number) ? undefined : data.budgetMax,
  status: data.status || 'NEW',
  tags: data.tags || [],
}));

export const buyerSchema = baseBuyerSchema.refine((data) => {
  // BHK is required if propertyType is Apartment or Villa
  if ((data.propertyType === 'APARTMENT' || data.propertyType === 'VILLA') && !data.bhk) {
    return false;
  }
  return true;
}, {
  message: 'BHK is required for Apartment and Villa property types',
  path: ['bhk']
}).refine((data) => {
  // If both budgetMin and budgetMax are provided, max must be >= min
  if (data.budgetMin && data.budgetMax && !isNaN(data.budgetMin) && !isNaN(data.budgetMax)) {
    return data.budgetMax >= data.budgetMin;
  }
  return true;
}, {
  message: 'Maximum budget must be greater than or equal to minimum budget',
  path: ['budgetMax']
}).transform((data) => ({
  ...data,
  email: data.email === '' ? undefined : data.email,
  budgetMin: isNaN(data.budgetMin as number) ? undefined : data.budgetMin,
  budgetMax: isNaN(data.budgetMax as number) ? undefined : data.budgetMax,
}));

export type BuyerFormData = z.infer<typeof buyerFormSchema>;

export const buyerUpdateSchema = baseBuyerSchema.extend({
  updatedAt: z.string().datetime()
}).refine((data) => {
  // BHK is required if propertyType is Apartment or Villa
  if ((data.propertyType === 'APARTMENT' || data.propertyType === 'VILLA') && !data.bhk) {
    return false;
  }
  return true;
}, {
  message: 'BHK is required for Apartment and Villa property types',
  path: ['bhk']
}).refine((data) => {
  // If both budgetMin and budgetMax are provided, max must be >= min
  if (data.budgetMin && data.budgetMax && !isNaN(data.budgetMin) && !isNaN(data.budgetMax)) {
    return data.budgetMax >= data.budgetMin;
  }
  return true;
}, {
  message: 'Maximum budget must be greater than or equal to minimum budget',
  path: ['budgetMax']
}).transform((data) => ({
  ...data,
  email: data.email === '' ? undefined : data.email,
  budgetMin: isNaN(data.budgetMin as number) ? undefined : data.budgetMin,
  budgetMax: isNaN(data.budgetMax as number) ? undefined : data.budgetMax,
}));

export type BuyerUpdateData = z.infer<typeof buyerUpdateSchema>;