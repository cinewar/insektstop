interface LoadingProps {
  className?: string;
}
export function Loading({className}: LoadingProps) {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className='animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary'></div>
    </div>
  );
}
