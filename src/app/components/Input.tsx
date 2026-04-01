interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string;
}
export function Input({className, ...props}: InputProps) {
  return (
    <input
      className={`relative w-full p-1 placeholder:text-md placeholder:text-dark-text/50 rounded-sm 
                    border-2 focus:border-primary/50 focus:outline-0 border-gray-300 ${className}`}
      {...props}
    />
  );
}
