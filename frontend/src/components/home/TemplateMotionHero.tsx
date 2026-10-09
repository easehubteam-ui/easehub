import React, { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion, type Variants } from 'framer-motion';

/* ─── Clean word-level entry animation ──────────────────────────────── */
const wordVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: 0.08 * i,
      duration: 0.5,
      ease: [0.16, 1, 0.3, 1],
    },
  }),
};

/* ─── Word component ────────────────────────────────────────────────── */
interface WordProps {
  text: string;
  className?: string;
  wordIdx: number;
  reduceMotion: boolean;
  color?: string;
}

const AnimatedWord: React.FC<WordProps> = ({ text, className = '', wordIdx, reduceMotion, color }) => (
  <motion.span
    custom={wordIdx}
    variants={reduceMotion ? undefined : wordVariants}
    className={`inline-block ${className}`}
    style={{ color }}
  >
    {text}
  </motion.span>
);

/* ─── Main component ────────────────────────────────────────────────── */
export const TemplateMotionHero: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  const prefersReducedMotion = useReducedMotion();
  const reduceMotion = prefersReducedMotion ?? false;

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setInView(true); },
      { threshold: 0.25 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  /* Lines — EaseHub's own copy */
  const lines: Array<Array<{ text: string; color: string }>> = [
    [
      { text: 'Campus', color: '#171A18' },
      { text: '\u00A0life,', color: '#171A18' },
    ],
    [
      { text: 'sorted', color: '#225944' },
      { text: '\u00A0in', color: '#171A18' },
    ],
    [
      { text: 'one', color: '#171A18' },
      { text: '\u00A0hub.', color: '#EECA3A' },
    ],
  ];

  let wordCount = 0;

  return (
    <div
      ref={containerRef}
      className="relative mx-auto w-full max-w-[1120px] select-none py-6 sm:py-10"
      aria-label="Campus life, sorted in one hub."
      role="img"
    >
      {/* Hero Text Block */}
      <motion.div
        initial={reduceMotion ? false : 'hidden'}
        animate={inView ? 'visible' : 'hidden'}
        className="relative z-10 flex flex-col items-center justify-center text-center"
        style={{
          fontFamily: '"Syne", "Space Grotesk", ui-sans-serif, system-ui, sans-serif',
          lineHeight: 0.92,
        }}
      >
        {lines.map((words, lineIdx) => (
          <div key={lineIdx} className="flex flex-wrap items-end justify-center">
            {words.map(({ text, color }) => {
              const currentIdx = wordCount++;
              return (
                <AnimatedWord
                  key={`${lineIdx}-${text}`}
                  text={text}
                  wordIdx={currentIdx}
                  reduceMotion={reduceMotion}
                  color={color}
                  className="text-[clamp(2.8rem,11vw,9.5rem)] font-black tracking-[-0.04em]"
                />
              );
            })}
          </div>
        ))}
      </motion.div>
    </div>
  );
};

export default TemplateMotionHero;

