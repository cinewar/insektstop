export default async function ProductPage({
  params,
}: {
  params: {productId: string};
}) {
  const {productId} = await params;
  return (
    <div className='min-h-screen flex items-center justify-center bg-secondary'>
      <h1 className='text-4xl font-bold text-dark-text'>
        Product ID: {productId}
      </h1>
    </div>
  );
}
