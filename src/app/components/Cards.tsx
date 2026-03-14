export function Cards({children}: {children: React.ReactNode}) {
  return (
    <div className='flex gap-2 w-full h-20 p-2 overflow-auto no-scrollbar'>
      {children}
    </div>
  );
}
