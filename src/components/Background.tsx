// src/components/Background.tsx
const Background = () => (
  <div
    aria-hidden="true"
    className="fixed inset-0 -z-10 w-full h-full"
    style={{
      backgroundImage: `url('/images/sayles_interior_bg.jpg')`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      filter: 'blur(8px) brightness(0.8)',
    }}
  >
    <div
      className="absolute inset-0"
      style={{
        background: 'rgba(181, 136, 99, 0.35)', // light brown, adjust opacity as needed
        width: '100%',
        height: '100%',
      }}
    />
  </div>
);

export default Background;