'use client';

import {useState} from 'react';
import {Button} from './Button';
import {Modal} from './Modal';
import {Input} from './Input';
import {Textarea} from './Textarea';
import {createOrder, deleteOrder, updateOrder} from '../order/action';
import {
  getOrderFormValues,
  orderSchema,
  type OrderErrors,
  type OrderField,
} from '../order/schema';
import {Search} from './Search';
import {SearchDropdown} from './SearchDropdown';
import {Order} from '../../../generated/prisma/client';
import {FormPendingOverlay} from '../order/components/FormPendingOverlay';
import {FormActions} from '../order/components/FormActions';

/**
 * Props for rendering the order create/edit controls with an optional selected order.
 */
interface OrderContentProps {
  order?: Order;
}

/**
 * Renders the order search controls and the modal used to create or edit an order.
 */
export function OrderContent({order}: OrderContentProps) {
  const [modalType, setModalType] = useState<'create' | 'edit' | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [errors, setErrors] = useState<OrderErrors>({});
  const [values, setValues] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
  });

  /**
   * Validates a single field and stores its error message when validation fails.
   */
  function validateField(field: OrderField, value: string) {
    const result = orderSchema.shape[field].safeParse(value);
    setErrors((prev) => ({
      ...prev,
      [field]: result.success ? undefined : result.error.issues[0].message,
    }));
  }

  /**
   * Creates a change handler for a specific field and normalizes phone input to digits only.
   */
  function handleChange(field: OrderField) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const value =
        field === 'phone' ? e.target.value.replace(/\D/g, '') : e.target.value;
      setValues((prev) => ({...prev, [field]: value}));
      if (field === 'phone' && e.target.value !== value) {
        e.target.value = value;
      }
      if (errors[field]) {
        validateField(field, value);
      }
    };
  }

  /**
   * Creates a blur handler that validates a single field after the user leaves it.
   */
  function handleBlur(field: OrderField) {
    return (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      validateField(field, e.target.value);
    };
  }

  /**
   * Validates submitted form data and dispatches either the create or update server action.
   */
  async function handleAction(formData: FormData) {
    if (modalType === 'edit' && order?.orderName) {
      formData.append('orderName', order.orderName);
      formData.append('id', order.id.toString());
    }
    const submittedValues = getOrderFormValues(formData);

    const result = orderSchema.safeParse(submittedValues);
    if (!result.success) {
      const fieldErrors: OrderErrors = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0] as OrderField;
        fieldErrors[field] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }

    if (modalType === 'edit') {
      await updateOrder(formData);
    } else {
      await createOrder(formData);
    }

    setErrors({});
    setValues(submittedValues);
    setShowModal(false);
  }

  /**
   * Opens the modal with the selected order values prefilled for editing.
   */
  function handleEdit() {
    setValues({
      name: order?.createrName ?? '',
      email: order?.createrEmail ?? '',
      phone: order?.createrPhone ?? '',
      address: order?.createrAddress ?? '',
    });
    setShowModal(true);
    setModalType('edit');
  }

  /**
   * Deletes the currently selected order when one is available.
   */
  async function handleDelete() {
    if (order?.id) {
      await deleteOrder(order.id);
    }
  }

  return (
    <>
      <div className='fixed h-28 px-3 pb-2 flex shadow-md items-end w-full max-w-120 bg-secondary z-20'>
        <div className='flex items-center w-full gap-2 relative'>
          <h1 className='text-2xl min-w-fit font-bold text-dark-text'>
            Create or
          </h1>
          <Search />
          {order && (
            <SearchDropdown
              onEdit={handleEdit}
              onDelete={handleDelete}
              orderId={order.id}
            />
          )}
        </div>
      </div>
      <div className='flex mx-auto gap-4 mt-32 mb-4 px-4'>
        <Button
          className='shining self-start'
          onClick={() => {
            setModalType('create');
            setShowModal(true);
          }}
        >
          Create Order
        </Button>
        {showModal && (
          <Modal onClose={() => setShowModal(false)}>
            {({close}) => (
              <div className='relative'>
                <h2 className='text-lg font-bold mb-2'>Create an Order</h2>
                <form className='flex flex-col gap-1' action={handleAction}>
                  <FormPendingOverlay />
                  <Input
                    placeholder='Enter your name and Surname'
                    label='Name & Surname'
                    name='name'
                    value={values.name}
                    onChange={handleChange('name')}
                    onBlur={handleBlur('name')}
                    error={errors.name}
                  />
                  <Input
                    placeholder='Enter your email'
                    label='Email'
                    name='email'
                    value={values.email}
                    onChange={handleChange('email')}
                    onBlur={handleBlur('email')}
                    error={errors.email}
                  />
                  <Input
                    placeholder='Enter your phone number'
                    label='Phone Number'
                    name='phone'
                    inputMode='numeric'
                    pattern='[0-9]*'
                    autoComplete='tel'
                    value={values.phone}
                    onChange={handleChange('phone')}
                    onBlur={handleBlur('phone')}
                    error={errors.phone}
                  />
                  <Textarea
                    label='Address'
                    name='address'
                    placeholder='Enter your address'
                    value={values.address}
                    onChange={handleChange('address')}
                    onBlur={handleBlur('address')}
                    error={errors.address}
                  />
                  <FormActions
                    close={close}
                    label={modalType === 'create' ? 'Create' : 'Edit'}
                  />
                </form>
              </div>
            )}
          </Modal>
        )}
      </div>
    </>
  );
}
