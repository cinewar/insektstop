import {z} from 'zod';

/**
 * Validation rules for place form input.
 */
export const placeSchema = z.object({
  place: z.string().min(4, 'Room & Place must be at least 4 characters'),
});

/**
 * Normalized place form payload type inferred from the schema.
 */
export type PlaceFormValues = z.infer<typeof placeSchema>;

/**
 * Supported place form field keys.
 */
export type PlaceField = keyof PlaceFormValues;

/**
 * Optional field-level error messages for the place form.
 */
export type PlaceErrors = Partial<Record<PlaceField, string>>;

/**
 * Reads and normalizes place form values from FormData.
 */
export function getPlaceFormValues(formData: FormData): PlaceFormValues {
  return {
    place: (formData.get('place') as string) ?? '',
  };
}
