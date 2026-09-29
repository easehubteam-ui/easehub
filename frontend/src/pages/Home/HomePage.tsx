import React, { useEffect, useRef } from 'react';

export const HomePage: React.FC = () => {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const handleResize = () => {
      if (iframeRef.current && iframeRef.current.contentWindow) {
        try {
          const body = iframeRef.current.contentWindow.document.body;
          const html = iframeRef.current.contentWindow.document.documentElement;
          const height = Math.max(
            body.scrollHeight,
            body.offsetHeight,
            html.clientHeight,
            html.scrollHeight,
            html.offsetHeight
          );
          if (height > 0) {
            iframeRef.current.style.height = `${height}px`;
          }
        } catch (e) {
          // Ignore
        }
      }
    };

    window.addEventListener('resize', handleResize);
    const interval = setInterval(handleResize, 1000);

    return () => {
      window.removeEventListener('resize', handleResize);
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="w-full min-h-screen bg-white">
      <iframe
        ref={iframeRef}
        src="/esehub/index.html"
        title="EaseHub Home"
        className="w-full min-h-screen border-none block"
        style={{ width: '100%', height: '100vh', border: 'none' }}
        onLoad={() => {
          if (iframeRef.current && iframeRef.current.contentWindow) {
            try {
              const body = iframeRef.current.contentWindow.document.body;
              const html = iframeRef.current.contentWindow.document.documentElement;
              const height = Math.max(
                body.scrollHeight,
                body.offsetHeight,
                html.clientHeight,
                html.scrollHeight,
                html.offsetHeight
              );
              if (height > 0) {
                iframeRef.current.style.height = `${height}px`;
              }
            } catch (e) {}
          }
        }}
      />
    </div>
  );
};

export default HomePage;
