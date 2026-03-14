export function Card({children}: {children: React.ReactNode}) {
  return (
    <div className='bg-tertiary min-w-45 p-1 shadow-lg rounded-xl'>
      {children}
    </div>
  );
}
