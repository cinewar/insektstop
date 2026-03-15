export function VideoPlayer() {
  return (
    <div className='w-full my-3 relative overflow-hidden'>
      <iframe
        src='https://www.youtube.com/embed/PhmbWApGN2E'
        width='100%'
        height='300'
        allowFullScreen
      />
    </div>
  );
}
