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

/**
 * Validation rules for place-product form input.
 */
export const placeProductSchema = z.object({
  orderId: z.string().optional(),
  placeId: z.string().optional(),
  product: z.string().min(1, 'Product is required'),
  width: z.string().min(1, 'Width is required'),
  length: z.string().min(1, 'Length is required'),
  images: z
    .array(z.instanceof(File))
    .max(3, 'You can upload up to 3 images')
    .refine((files) => files.every((file) => file.size > 0), {
      message: 'Please select valid image files',
    }),
});

/**
 * Normalized place-product form payload type inferred from the schema.
 */
export type PlaceProductFormValues = z.infer<typeof placeProductSchema>;

/**
 * Supported place-product form field keys.
 */
export type PlaceProductField = keyof PlaceProductFormValues;

/**
 * Optional field-level error messages for the place-product form.
 */
export type PlaceProductErrors = Partial<Record<PlaceProductField, string>>;

/**
 * Reads and normalizes place-product form values from FormData.
 */
export function getPlaceProductFormValues(
  formData: FormData,
): PlaceProductFormValues {
  return {
    orderId: (formData.get('orderId') as string) ?? '',
    placeId: (formData.get('placeId') as string) ?? '',
    product: (formData.get('product') as string) ?? '',
    width: (formData.get('width') as string) ?? '',
    length: (formData.get('length') as string) ?? '',
    images: formData
      .getAll('images')
      .filter(
        (entry): entry is File => entry instanceof File && entry.size > 0,
      ),
  };
}
