/**
  * Defines the InputProps interface.
  * Usage: Implement or consume InputProps when exchanging this structured contract.
  */
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string;
  label?: string;
  error?: string;
}
/**
  * Describes behavior for Input.
  * Usage: Call Input(...) where this declaration is needed in the current module flow.
  */
export function Input({className, label, error, ...props}: InputProps) {
  return (
    <>
      {label && (
        <label htmlFor={props.id || props.name} className='block -mb-2'>
          {label}
        </label>
      )}
      <input
        className={`relative w-full p-1 placeholder:text-md placeholder:text-dark-text/50 rounded-sm 
          border-2 focus:border-primary/50 focus:outline-0 border-gray-300 ${className}`}
        {...props}
      />
      {error && <p className='text-red-500 text-sm mt-1'>{error}</p>}
    </>
  );
}
