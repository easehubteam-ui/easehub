import React from 'react';

export const HomePage: React.FC = () => {
  return (
    <div className="w-full min-h-screen bg-white overflow-hidden">
      <iframe
        src="/esehub/index.html"
        title="EaseHub Home"
        className="w-full border-none block"
        style={{
          width: '100%',
          height: 'calc(100vh - 70px)',
          minHeight: '850px',
          border: 'none',
        }}
      />
    </div>
  );
};

export default HomePage;
