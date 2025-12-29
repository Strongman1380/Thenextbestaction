import { z } from 'zod';
import { sanitizeTextInput, sanitizeForAI, sanitizeZipCode, sanitizeUrgency, sanitizeResourceType, sanitizeInitials } from '@/lib/security/input-sanitizer';

/**
 * Sanitize text to prevent prompt injection
 * Removes potentially dangerous characters while preserving readability
 */
const sanitizedText = z.string().transform(text => sanitizeTextInput(text, 5000));

/**
 * Optional sanitized text that can be empty
 */
const optionalSanitizedText = z.string()
  .optional()
  .transform(text => {
    if (!text) return text;
    return sanitizeTextInput(text, 3000);
  });

/**
 * ZIP code validation
 */
const zipCode = z.string()
  .transform((val) => sanitizeZipCode(val))
  .refine((val) => val !== null, {
    message: 'ZIP code must be exactly 5 digits',
  })
  .optional()
  .or(z.literal(''));

/**
 * Urgency level enum
 */
const urgencyLevel = z.enum(['low', 'medium', 'high']);

/**
 * Resource type enum
 */
const resourceType = z.enum(['worksheet', 'reading', 'exercise', 'any']);

/**
 * Case plan generation request schema
 */
export const casePlanSchema = z.object({
  primary_need: sanitizedText
    .refine(val => val.trim().length >= 10, {
      message: 'Primary need must be at least 10 characters',
    }),
  urgency: z.string()
    .transform((val) => sanitizeUrgency(val))
    .refine((val) => val !== null, {
      message: 'Urgency must be low, medium, or high',
    }),
  client_initials: z.string()
    .transform((val) => sanitizeInitials(val))
    .refine((val) => val !== null, {
      message: 'Initials must be 2-5 alphanumeric characters',
    })
    .optional()
    .or(z.literal('')),
  caseworker_name: z.string().max(50).optional(),
  zip_code: zipCode,
  additional_context: optionalSanitizedText,
  enable_research: z.boolean().optional().default(true),
});

/**
 * Skill resource generation request schema
 */
export const skillResourceSchema = z.object({
  skill_topic: sanitizedText
    .refine(val => val.trim().length >= 5, {
      message: 'Skill topic must be at least 5 characters',
    }),
  worker_name: z.string().max(50).optional(),
  context: sanitizedText
    .refine(val => val.trim().length >= 20, {
      message: 'Context must be at least 20 characters',
    }),
  resource_type: z.string()
    .transform((val) => sanitizeResourceType(val))
    .refine((val) => val !== null, {
      message: 'Resource type must be worksheet, reading, exercise, or any',
    }),
  enable_research: z.boolean().optional().default(true),
});

/**
 * Client resource generation request schema
 */
export const clientResourceSchema = z.object({
  skill_topic: sanitizedText
    .refine(val => val.trim().length >= 5, {
      message: 'Topic must be at least 5 characters',
    }),
  context: sanitizedText
    .refine(val => val.trim().length >= 20, {
      message: 'Context must be at least 20 characters',
    }),
  resource_type: z.string()
    .transform((val) => sanitizeResourceType(val))
    .refine((val) => val !== null, {
      message: 'Resource type must be worksheet, reading, exercise, or any',
    }),
  enable_research: z.boolean().optional().default(true),
});

/**
 * Feedback log request schema
 */
export const feedbackSchema = z.object({
  contentId: z.string().optional(),
  contentType: z.string().min(1, 'Content type is required'),
  feedback: z.enum(['positive', 'negative']),
  generatedContent: z.string().min(1, 'Generated content is required'),
});

/**
 * Document upload metadata schema
 */
export const documentMetadataSchema = z.object({
  category: z.string().optional(),
  description: z.string().max(500).optional(),
});

// Type exports
export type CasePlanInput = z.infer<typeof casePlanSchema>;
export type SkillResourceInput = z.infer<typeof skillResourceSchema>;
export type ClientResourceInput = z.infer<typeof clientResourceSchema>;
export type FeedbackInput = z.infer<typeof feedbackSchema>;
export type DocumentMetadataInput = z.infer<typeof documentMetadataSchema>;
