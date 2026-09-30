import React, { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

type LottieAnimation = {
  addEventListener: (name: 'DOMLoaded', listener: () => void) => void;
  destroy: () => void;
  goToAndStop: (frame: number, isFrame?: boolean) => void;
};

type LottieRendererModule = {
  t: () => {
    loadAnimation: (options: {
      container: HTMLElement;
      renderer: 'svg';
      loop: boolean;
      autoplay: boolean;
      animationData: Record<string, unknown>;
      rendererSettings: { preserveAspectRatio: string; progressiveLoad: boolean };
    }) => LottieAnimation;
  };
};

type LottieDataModule = { default: Record<string, unknown> };

export const TemplateMotionHero: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const prefersReducedMotion = useReducedMotion();
  const reduceMotion = prefersReducedMotion ?? false;

  useEffect(() => {
    let disposed = false;
    let animation: LottieAnimation | undefined;

    const loadAnimation = async () => {
      try {
        const [rendererModule, dataModule] = await Promise.all([
          import('../../assets/template-motion/lottie-CCFb-LWK.js') as Promise<LottieRendererModule>,
          import('../../assets/template-motion/hero-animation-2026-desktop@1x-BzopWxEo.js') as Promise<LottieDataModule>,
        ]);

        if (disposed || !containerRef.current) return;

        animation = rendererModule.t().loadAnimation({
          container: containerRef.current,
          renderer: 'svg',
          loop: !reduceMotion,
          autoplay: !reduceMotion,
          animationData: dataModule.default,
          rendererSettings: {
            preserveAspectRatio: 'xMidYMid meet',
            progressiveLoad: true,
          },
        });
        animation.addEventListener('DOMLoaded', () => {
          if (!disposed) setReady(true);
        });

        if (reduceMotion) {
          animation.goToAndStop(40, true);
          setReady(true);
        }
      } catch (error) {
        if (!disposed) setFailed(true);
        console.error('Unable to load the local EaseHub hero animation.', error);
      }
    };

    void loadAnimation();

    return () => {
      disposed = true;
      animation?.destroy();
    };
  }, [reduceMotion]);

  return (
    <div className="relative mx-auto w-full max-w-[1120px]">
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 h-1/2 w-3/4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#EECA3A]/20 blur-3xl"
        animate={reduceMotion ? undefined : { scale: [0.94, 1.06, 0.94], opacity: [0.45, 0.75, 0.45] }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
      />
      <div
        ref={containerRef}
        aria-label="EaseHub campus life in motion"
        role="img"
        className={`relative z-10 aspect-[1728/684] w-full overflow-hidden transition-opacity duration-500 ${ready ? 'opacity-100' : 'opacity-0'}`}
      />
      {!ready && !failed && (
        <div className="absolute inset-0 grid place-items-center" aria-hidden="true">
          <div className="relative h-28 w-28 rounded-full border border-[#E5E1D6] bg-white/80 shadow-[0_24px_80px_rgba(34,89,68,0.12)] sm:h-36 sm:w-36">
            <motion.div
              className="absolute inset-4 rounded-full border-[9px] border-[#225944]/15 border-t-[#225944]"
              animate={reduceMotion ? undefined : { rotate: 360 }}
              transition={{ duration: 2.4, ease: 'linear', repeat: Infinity }}
            />
            <motion.div
              className="absolute -right-2 top-5 h-5 w-5 rounded-full bg-[#EECA3A] shadow-md"
              animate={reduceMotion ? undefined : { y: [0, 10, 0] }}
              transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
            />
          </div>
        </div>
      )}
      {failed && (
        <div className="absolute inset-0 grid place-items-center text-sm font-semibold text-[#6B6B63]" role="status">
          Campus animation is unavailable right now.
        </div>
      )}
    </div>
  );
};

export default TemplateMotionHero;
