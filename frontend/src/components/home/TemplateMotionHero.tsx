import React, { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion, type Variants, type TargetAndTransition } from 'framer-motion';

/* ─── Character-level entry animation ──────────────────────────────── */
const charVariants: Variants = {
  hidden: { opacity: 0, y: 40, rotate: -8, scale: 0.6 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    rotate: 0,
    scale: 1,
    transition: {
      delay: 0.04 * i,
      type: 'spring',
      stiffness: 280,
      damping: 18,
    },
  }),
};

/* Continuous idle float per letter */
const floatAnim = (i: number): TargetAndTransition => ({
  y: [0, -6 + (i % 3) * 3, 0],
  rotate: [0, i % 2 === 0 ? 1.8 : -1.8, 0],
  transition: {
    duration: 2.4 + (i % 4) * 0.4,
    repeat: Infinity,
    ease: 'easeInOut',
    delay: i * 0.07,
  },
});

/* ─── Word component ────────────────────────────────────────────────── */
interface WordProps {
  text: string;
  className?: string;
  startIndex: number;
  reduceMotion: boolean;
  color?: string;
}

const AnimatedWord: React.FC<WordProps> = ({ text, className = '', startIndex, reduceMotion, color }) => (
  <span className={`inline-flex items-end ${className}`}>
    {text.split('').map((char, i) => {
      const globalIdx = startIndex + i;
      return (
        <motion.span
          key={i}
          custom={globalIdx}
          variants={charVariants}
          animate={reduceMotion ? undefined : floatAnim(globalIdx)}
          className="inline-block origin-bottom"
          style={{ color, willChange: 'transform' }}
        >
          {char === ' ' ? '\u00A0' : char}
        </motion.span>
      );
    })}
  </span>
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

  let charIdx = 0;

  return (
    <div
      ref={containerRef}
      className="relative mx-auto w-full max-w-[1120px] select-none"
      aria-label="Campus life, sorted in one hub."
      role="img"
    >
      {/* Glowing backdrop */}
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 h-2/3 w-3/4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#EECA3A]/20 blur-3xl"
        animate={
          reduceMotion
            ? undefined
            : ({ scale: [0.92, 1.08, 0.92], opacity: [0.4, 0.75, 0.4] } as TargetAndTransition)
        }
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Hero Text Block */}
      <motion.div
        initial={reduceMotion ? false : 'hidden'}
        animate={inView ? 'visible' : 'hidden'}
        className="relative z-10 flex flex-col items-center justify-center text-center"
        style={{
          fontFamily: '"Syne", "Space Grotesk", ui-sans-serif, system-ui, sans-serif',
          lineHeight: 0.88,
        }}
      >
        {lines.map((words, lineIdx) => (
          <div key={lineIdx} className="flex flex-wrap items-end justify-center">
            {words.map(({ text, color }) => {
              const start = charIdx;
              charIdx += text.length;
              return (
                <AnimatedWord
                  key={`${lineIdx}-${text}`}
                  text={text}
                  startIndex={start}
                  reduceMotion={reduceMotion}
                  color={color}
                  className="text-[clamp(2.8rem,11vw,10rem)] font-black tracking-[-0.04em]"
                />
              );
            })}
          </div>
        ))}

        {/* Floating emoji character */}
        <motion.span
          className="absolute -top-6 left-[38%] text-4xl sm:text-5xl"
          aria-hidden="true"
          animate={
            reduceMotion
              ? undefined
              : ({ y: [0, -14, 0], rotate: [-5, 5, -5] } as TargetAndTransition)
          }
          transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
        >
          🎒
        </motion.span>
      </motion.div>
    </div>
  );
};

export default TemplateMotionHero;
