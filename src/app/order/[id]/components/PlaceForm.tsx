'use client';

import {FormActions} from '@/app/components/FormActions';
import {FormPendingOverlay} from '@/app/components/FormPendingOverlay';
import {Input} from '@/app/components/Input';
import {useState} from 'react';
import {createPlace, deletePlace, updatePlace} from '../action';
import {
  getPlaceFormValues,
  PlaceErrors,
  PlaceField,
  placeSchema,
} from '../schema';
import {notify} from '@/app/lib/notifications';
import {Confirmation} from '@/app/components/Confirmation';

/**
 * Props needed to render and submit the place create/edit form.
 */
interface PlaceFormProps {
  close: () => void;
  modalType: 'create' | 'edit' | 'delete';
  orderId: string;
  placeId?: string;
  initialPlace?: string;
}

/**
 * Renders the place form and handles validation plus create/edit submission.
 */
export function PlaceForm({
  close,
  modalType,
  orderId,
  placeId,
  initialPlace = '',
}: PlaceFormProps) {
  const [values, setValues] = useState({
    place: initialPlace,
  });
  const [errors, setErrors] = useState<PlaceErrors>({});
  const [isDeleting, setIsDeleting] = useState(false);

  /**
   * Validates a single field and stores its error message when validation fails.
   */
  function validateField(field: PlaceField, value: string) {
    const result = placeSchema.shape[field].safeParse(value);
    setErrors((prev) => ({
      ...prev,
      [field]: result.success ? undefined : result.error.issues[0].message,
    }));
  }

  /**
   * Creates a blur handler that validates a single field after the user leaves it.
   */
  function handleBlur(field: PlaceField) {
    return (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      validateField(field, e.target.value);
    };
  }

  /**
   * Updates local form state for a single place field.
   */
  function handleChange(field: PlaceField) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setValues((prev) => ({
        ...prev,
        [field]: e.target.value,
      }));
    };
  }

  /**
   * Validates submitted data and dispatches either create or update place action.
   */
  async function handleAction(formData: FormData) {
    formData.set('id', orderId);
    const submittedValues = getPlaceFormValues(formData);

    const validateResult = placeSchema.safeParse(submittedValues);
    if (!validateResult.success) {
      const fieldErrors: PlaceErrors = {};
      for (const issue of validateResult.error.issues) {
        const field = issue.path[0] as PlaceField;
        fieldErrors[field] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }

    let result;
    if (modalType === 'edit') {
      if (!placeId) {
        notify({
          type: 'error',
          title: 'Place update failed',
          message: 'Place ID is required for edit.',
        });
        return;
      }
      formData.set('placeId', placeId);
      result = await updatePlace(formData);
    } else {
      result = await createPlace(formData);
    }

    if (!result.ok) {
      notify({
        type: 'error',
        title: `Place ${modalType === 'edit' ? 'update' : 'creation'} failed`,
        message: result.message,
      });
      return;
    }

    notify({
      type: 'success',
      title: `Place ${modalType === 'edit' ? 'updated' : 'created'} successfully`,
    });

    setValues(submittedValues);

    setErrors({});
    close();
  }

  /**
    * Describes behavior for handleDelete.
    * Usage: Call handleDelete(...) where this declaration is needed in the current module flow.
    */
  async function handleDelete() {
    if (!placeId) {
      notify({
        type: 'error',
        title: 'Place deletion failed',
        message: 'Place ID is required for delete.',
      });
      return;
    }

    setIsDeleting(true);
    try {
      const result = await deletePlace(orderId, placeId);
      if (!result.ok) {
        notify({
          type: 'error',
          title: 'Place deletion failed',
          message: result.message,
        });
        return;
      }

      notify({
        type: 'success',
        title: 'Place deleted successfully',
      });
      close();
    } finally {
      setIsDeleting(false);
    }
  }

  if (modalType === 'delete') {
    return (
      <Confirmation
        title='Delete Place'
        message={`Are you sure you want to delete "${initialPlace || 'this place'}"?`}
        onConfirmAction={handleDelete}
        onCancelAction={close}
        isLoading={isDeleting}
      />
    );
  }

  return (
    <form className='flex flex-col gap-1' action={handleAction}>
      <FormPendingOverlay />
      <input type='hidden' name='id' value={orderId} />
      {placeId ? <input type='hidden' name='placeId' value={placeId} /> : null}
      <Input
        placeholder='Enter the room & place name'
        label='Room & Place Name'
        name='place'
        value={values.place}
        onChange={handleChange('place')}
        onBlur={handleBlur('place')}
        error={errors.place}
      />
      <FormActions
        close={close}
        label={modalType === 'create' ? 'Create' : 'Edit'}
      />
    </form>
  );
}
