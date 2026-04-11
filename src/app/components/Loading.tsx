/**
  * Defines the LoadingProps interface.
  * Usage: Implement or consume LoadingProps when exchanging this structured contract.
  */
interface LoadingProps {
  className?: string;
}
/**
  * Describes behavior for Loading.
  * Usage: Call Loading(...) where this declaration is needed in the current module flow.
  */
export function Loading({className}: LoadingProps) {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className='animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary'></div>
    </div>
  );
}
