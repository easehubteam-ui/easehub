import React from 'react';
import campusSkylineImg from '../../assets/images/campus-skyline.png';

export const AnimatedCityFooter: React.FC = () => {
  return (
    <section className="relative w-full bg-[#FAF9F5] overflow-hidden select-none block z-10">
      {/* Panoramic Animated Scene Container (Exact match to requested reference image) */}
      <div className="relative w-full h-[180px] sm:h-[260px] md:h-[320px] overflow-hidden bg-[#FAF9F5] block">
        
        {/* A. Background Clouds (Drifting RIGHT -> LEFT) */}
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
          <svg className="absolute top-3 left-0 w-full h-28 overflow-visible">
            {/* Cloud Group 1 */}
            <g className="animate-cloud-slow opacity-80">
              <path
                d="M 100 40 Q 115 20 135 25 Q 150 15 170 30 Q 185 32 195 45 Q 205 55 190 65 Q 170 68 100 65 Z"
                fill="#FFFFFF"
              />
              <path
                d="M 600 30 Q 615 10 635 15 Q 650 5 670 20 Q 685 22 695 35 Q 705 45 690 55 Q 670 58 600 55 Z"
                fill="#FFFFFF"
              />
              <path
                d="M 1100 50 Q 1115 30 1135 35 Q 1150 25 1170 40 Q 1185 42 1195 55 Q 1205 65 1190 75 Q 1170 78 1100 75 Z"
                fill="#FFFFFF"
              />
            </g>

            {/* Cloud Group 2 */}
            <g className="animate-cloud-medium opacity-60">
              <path
                d="M 350 20 Q 365 5 385 10 Q 400 0 420 15 Q 435 17 445 30 Q 455 40 440 50 Q 420 53 350 50 Z"
                fill="#FFFFFF"
              />
              <path
                d="M 850 45 Q 865 30 885 35 Q 900 25 920 40 Q 935 42 945 55 Q 955 65 940 75 Q 920 78 850 75 Z"
                fill="#FFFFFF"
              />
            </g>
          </svg>
        </div>

        {/* B. Birds Flying (Sky Layer, RIGHT -> LEFT) */}
        <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
          {/* Bird Group 1 */}
          <div className="absolute top-6 right-0 animate-bird-group-1 flex gap-4 text-[#225944]/75">
            <svg className="w-5 h-4 animate-bird-flap" viewBox="0 0 24 16" fill="currentColor">
              <path d="M 0 12 Q 6 0 12 8 Q 18 0 24 12 Q 18 6 12 11 Q 6 6 0 12 Z" />
            </svg>
            <svg className="w-4 h-3 animate-bird-flap-delay mt-2" viewBox="0 0 24 16" fill="currentColor">
              <path d="M 0 12 Q 6 0 12 8 Q 18 0 24 12 Q 18 6 12 11 Q 6 6 0 12 Z" />
            </svg>
          </div>

          {/* Bird Group 2 */}
          <div className="absolute top-12 right-0 animate-bird-group-2 flex gap-3 text-[#171A18]/65">
            <svg className="w-6 h-4 animate-bird-flap" viewBox="0 0 24 16" fill="currentColor">
              <path d="M 0 12 Q 6 0 12 8 Q 18 0 24 12 Q 18 6 12 11 Q 6 6 0 12 Z" />
            </svg>
            <svg className="w-4 h-3 animate-bird-flap-delay mt-1" viewBox="0 0 24 16" fill="currentColor">
              <path d="M 0 12 Q 6 0 12 8 Q 18 0 24 12 Q 18 6 12 11 Q 6 6 0 12 Z" />
            </svg>
            <svg className="w-5 h-3.5 animate-bird-flap mt-2" viewBox="0 0 24 16" fill="currentColor">
              <path d="M 0 12 Q 6 0 12 8 Q 18 0 24 12 Q 18 6 12 11 Q 6 6 0 12 Z" />
            </svg>
          </div>
        </div>

        {/* C. Continuous Skyline Panorama Track (Seamless Infinite Loop) */}
        <div className="absolute bottom-0 left-0 h-full w-[200%] flex shrink-0 animate-panorama-track pointer-events-none z-20">
          <div className="w-[50%] shrink-0 h-full relative flex items-end overflow-hidden">
            <img
              src={campusSkylineImg}
              alt="EaseHub Campus Skyline Scene"
              className="w-full h-full object-cover object-bottom select-none block"
            />
          </div>
          <div className="w-[50%] shrink-0 h-full relative flex items-end overflow-hidden">
            <img
              src={campusSkylineImg}
              alt="EaseHub Campus Skyline Scene Duplicate"
              className="w-full h-full object-cover object-bottom select-none block"
            />
          </div>
        </div>
      </div>

      {/* Inlined CSS Keyframe Styles for Seamless Continuous Motion */}
      <style>{`
        /* Panorama Skyline Infinite Loop (Right to Left) */
        @keyframes panoramaLoop {
          0% {
            transform: translate3d(0, 0, 0);
          }
          100% {
            transform: translate3d(-50%, 0, 0);
          }
        }
        .animate-panorama-track {
          animation: panoramaLoop 48s linear infinite;
          will-change: transform;
        }

        /* Clouds Slow Drift */
        @keyframes cloudDriftSlow {
          0% {
            transform: translate3d(100vw, 0, 0);
          }
          100% {
            transform: translate3d(-1000px, 0, 0);
          }
        }
        @keyframes cloudDriftMedium {
          0% {
            transform: translate3d(100vw, 0, 0);
          }
          100% {
            transform: translate3d(-800px, 0, 0);
          }
        }
        .animate-cloud-slow {
          animation: cloudDriftSlow 70s linear infinite;
          will-change: transform;
        }
        .animate-cloud-medium {
          animation: cloudDriftMedium 48s linear infinite;
          will-change: transform;
        }

        /* Birds Flying & Flapping */
        @keyframes birdFly1 {
          0% {
            transform: translate3d(100vw, 0, 0);
          }
          50% {
            transform: translate3d(50vw, -12px, 0);
          }
          100% {
            transform: translate3d(-200px, 4px, 0);
          }
        }
        @keyframes birdFly2 {
          0% {
            transform: translate3d(100vw, 4px, 0);
          }
          50% {
            transform: translate3d(40vw, 10px, 0);
          }
          100% {
            transform: translate3d(-200px, -8px, 0);
          }
        }
        @keyframes birdFlap {
          0%, 100% {
            transform: scaleY(1);
          }
          50% {
            transform: scaleY(0.4);
          }
        }
        .animate-bird-group-1 {
          animation: birdFly1 24s linear infinite;
          will-change: transform;
        }
        .animate-bird-group-2 {
          animation: birdFly2 17s linear infinite 3s;
          will-change: transform;
        }
        .animate-bird-flap {
          animation: birdFlap 0.6s ease-in-out infinite;
        }
        .animate-bird-flap-delay {
          animation: birdFlap 0.6s ease-in-out infinite 0.2s;
        }

        /* Reduced Motion Accessibility Override */
        @media (prefers-reduced-motion: reduce) {
          .animate-panorama-track,
          .animate-cloud-slow,
          .animate-cloud-medium,
          .animate-bird-group-1,
          .animate-bird-group-2,
          .animate-bird-flap,
          .animate-bird-flap-delay,
          .animate-tree-sway-slow,
          .animate-tree-sway-fast {
            animation: none !important;
          }
        }
      `}</style>
    </section>
  );
};

export default AnimatedCityFooter;
