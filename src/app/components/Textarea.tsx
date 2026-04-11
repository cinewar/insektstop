/**
  * Defines the TextareaProps interface.
  * Usage: Implement or consume TextareaProps when exchanging this structured contract.
  */
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  className?: string;
  label?: string;
  error?: string;
}

/**
  * Describes behavior for Textarea.
  * Usage: Call Textarea(...) where this declaration is needed in the current module flow.
  */
export function Textarea({className, label, error, ...props}: TextareaProps) {
  return (
    <>
      {label && (
        <label htmlFor='message' className='block -mb-2'>
          {label}
        </label>
      )}
      <textarea
        rows={4}
        className={`relative w-full p-1 placeholder:text-md placeholder:text-dark-text/50 rounded-sm 
          border-2 focus:border-primary/50 focus:outline-0 border-gray-300 ${className}`}
        {...props}
      />
      {error && <p className='text-red-500 text-sm mt-1'>{error}</p>}
    </>
  );
}
