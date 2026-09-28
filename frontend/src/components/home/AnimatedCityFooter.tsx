import React from 'react';
import campusSkylineImg from '../../assets/images/campus-skyline.png';

export const AnimatedCityFooter: React.FC = () => {
  return (
    <section className="relative w-full bg-[#F7F5EF] border-t border-[#E5E1D6] pt-8 pb-0 overflow-hidden select-none block z-10">
      {/* 1. Subtle Section Tagline */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-5">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#225944]/10 text-[#225944] text-[11px] font-extrabold uppercase tracking-wider mb-2">
          <span className="w-2 h-2 rounded-full bg-[#225944] animate-pulse"></span>
          <span>Life around campus, made easier.</span>
        </div>
        <h3 className="text-xl sm:text-2xl font-extrabold text-[#171A18] tracking-tight">
          Connecting Colleges, Hostels &amp; Daily Services Across Chhattisgarh
        </h3>
        <p className="text-xs sm:text-sm text-[#6B6B63] mt-1 max-w-xl mx-auto font-medium">
          Trusted housing, tiffin plans, and doorstep care for students at BIT Durg, IIT Bhilai, Rungta &amp; CSVTU.
        </p>
      </div>

      {/* 2. Panoramic Animated Scene Container (Desktop 280-360px, Mobile 180-260px) */}
      <div className="relative w-full h-[200px] sm:h-[280px] md:h-[340px] overflow-hidden bg-[#FAF9F5] block">
        
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
          {/* Bird Group 1 (High, small, 22s loop) */}
          <div className="absolute top-6 right-0 animate-bird-group-1 flex gap-4 text-[#225944]/75">
            <svg className="w-5 h-4 animate-bird-flap" viewBox="0 0 24 16" fill="currentColor">
              <path d="M 0 12 Q 6 0 12 8 Q 18 0 24 12 Q 18 6 12 11 Q 6 6 0 12 Z" />
            </svg>
            <svg className="w-4 h-3 animate-bird-flap-delay mt-2" viewBox="0 0 24 16" fill="currentColor">
              <path d="M 0 12 Q 6 0 12 8 Q 18 0 24 12 Q 18 6 12 11 Q 6 6 0 12 Z" />
            </svg>
          </div>

          {/* Bird Group 2 (Mid-sky, 16s loop) */}
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

        {/* C. Continuous Skyline Panorama Track (Seamless Infinite Loop with shrink-0) */}
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

        {/* D. Animated Wind Sway on Foreground Foliage (Subtle Tree Sway Overlay) */}
        <div className="absolute bottom-8 left-0 w-full h-14 pointer-events-none z-25 overflow-hidden flex justify-around opacity-40">
          <div className="w-10 h-10 rounded-full bg-[#225944]/20 blur-[1px] animate-tree-sway-slow"></div>
          <div className="w-14 h-14 rounded-full bg-[#225944]/25 blur-[1px] animate-tree-sway-fast"></div>
          <div className="w-12 h-12 rounded-full bg-[#4F7A65]/20 blur-[1px] animate-tree-sway-slow"></div>
        </div>

        {/* E. Road Vehicles (Independent Animated Vehicles Traveling Across Road) */}
        <div className="absolute bottom-0 left-0 w-full h-[26px] sm:h-[34px] md:h-[42px] pointer-events-none z-30 overflow-hidden">
          
          {/* Vehicle 1: Yellow & Green College Bus (Slow: ~30s loop) */}
          <div className="absolute bottom-1.5 sm:bottom-2 animate-drive-bus">
            <div className="relative w-18 sm:w-24 md:w-28 h-7 sm:h-9 bg-[#EECA3A] border border-[#171A18] rounded-lg shadow-sm flex flex-col justify-between p-0.5">
              {/* Bus Roof Stripes & Brand */}
              <div className="bg-[#225944] text-[7px] sm:text-[8px] font-black text-white px-1 py-0.2 rounded-xs flex items-center justify-between">
                <span>EASEHUB SHUTTLE</span>
                <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
              </div>
              {/* Bus Windows */}
              <div className="flex gap-1 px-1 py-0.5 bg-[#171A18]/10 rounded-xs">
                <div className="flex-1 h-2.5 bg-white border border-[#171A18]/30 rounded-xs"></div>
                <div className="flex-1 h-2.5 bg-white border border-[#171A18]/30 rounded-xs"></div>
                <div className="flex-1 h-2.5 bg-white border border-[#171A18]/30 rounded-xs"></div>
                <div className="flex-1 h-2.5 bg-white border border-[#171A18]/30 rounded-xs"></div>
              </div>
              {/* Wheels */}
              <div className="absolute -bottom-1 left-2.5 w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full bg-[#171A18] border border-white"></div>
              <div className="absolute -bottom-1 right-3.5 w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full bg-[#171A18] border border-white"></div>
            </div>
          </div>

          {/* Vehicle 2: Iconic Indian Auto-Rickshaw (Medium: ~22s loop) */}
          <div className="absolute bottom-1.5 sm:bottom-2 animate-drive-auto">
            <div className="relative w-10 sm:w-12 md:w-14 h-5.5 sm:h-7 bg-[#225944] border border-[#171A18] rounded-t-lg rounded-b-xs p-0.5 shadow-sm">
              {/* Auto Canopy (Yellow Top) */}
              <div className="w-full h-2.5 bg-[#EECA3A] rounded-t-md border-b border-[#171A18]/40"></div>
              {/* Windshield */}
              <div className="w-3.5 h-2.5 bg-[#FAF9F5] border border-[#171A18]/30 rounded-xs ml-auto mt-0.5"></div>
              {/* Wheel */}
              <div className="absolute -bottom-1 left-1.5 w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-[#171A18] border border-white"></div>
              <div className="absolute -bottom-1 right-1.5 w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-[#171A18] border border-white"></div>
            </div>
          </div>

          {/* Vehicle 3: White Sedan Student Car (Medium: ~24s loop) */}
          <div className="absolute bottom-2 sm:bottom-2.5 animate-drive-car1">
            <div className="relative w-12 sm:w-16 md:w-18 h-4.5 sm:h-6 bg-white border border-[#171A18] rounded-lg shadow-xs flex items-center px-1">
              {/* Car Windows */}
              <div className="w-7 h-2.5 bg-[#225944]/20 border border-[#171A18]/30 rounded-t-sm mx-auto"></div>
              {/* Wheels */}
              <div className="absolute -bottom-1 left-2 w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-[#171A18] border border-white"></div>
              <div className="absolute -bottom-1 right-2 w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-[#171A18] border border-white"></div>
            </div>
          </div>

          {/* Vehicle 4: Student Scooter / Bike (Fast: ~15s loop) */}
          <div className="absolute bottom-1.5 sm:bottom-2 animate-drive-scooter">
            <div className="relative w-8 sm:w-10 h-5 sm:h-6 flex items-end">
              {/* Rider with Helmet */}
              <div className="absolute top-0 right-2.5 w-2.5 h-2.5 rounded-full bg-[#EECA3A] border border-[#171A18]"></div>
              {/* Scooter Body */}
              <div className="w-full h-3 bg-[#225944] rounded-full border border-[#171A18]"></div>
              {/* Wheels */}
              <div className="absolute -bottom-0.5 left-0.5 w-2 h-2 rounded-full bg-[#171A18]"></div>
              <div className="absolute -bottom-0.5 right-0.5 w-2 h-2 rounded-full bg-[#171A18]"></div>
            </div>
          </div>

          {/* Vehicle 5: Green Hatchback Car (Medium: ~19s loop) */}
          <div className="absolute bottom-2 sm:bottom-2.5 animate-drive-car2">
            <div className="relative w-11 sm:w-14 md:w-16 h-4.5 sm:h-6 bg-[#225944] border border-[#171A18] rounded-lg shadow-xs">
              <div className="w-6 h-2.5 bg-[#EECA3A]/40 border border-white/40 rounded-t-sm mx-auto mt-0.5"></div>
              {/* Wheels */}
              <div className="absolute -bottom-1 left-1.5 w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-[#171A18] border border-white"></div>
              <div className="absolute -bottom-1 right-1.5 w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-[#171A18] border border-white"></div>
            </div>
          </div>

        </div>
      </div>

      {/* 3. Inlined CSS Keyframe Styles for Seamless Continuous Motion */}
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

        /* Gentle Wind Sway on Trees */
        @keyframes treeSwaySlow {
          0%, 100% {
            transform: rotate(0deg) scale(1);
          }
          50% {
            transform: rotate(2.5deg) scale(1.02);
          }
        }
        @keyframes treeSwayFast {
          0%, 100% {
            transform: rotate(0deg) scale(1);
          }
          50% {
            transform: rotate(-3deg) scale(1.03);
          }
        }
        .animate-tree-sway-slow {
          animation: treeSwaySlow 6s ease-in-out infinite;
        }
        .animate-tree-sway-fast {
          animation: treeSwayFast 4.5s ease-in-out infinite 1s;
        }

        /* Vehicle Driving Loops (Right -> Left) */
        @keyframes vehicleDriveBus {
          0% {
            transform: translate3d(105vw, 0, 0);
          }
          100% {
            transform: translate3d(-140px, 0, 0);
          }
        }
        @keyframes vehicleDriveAuto {
          0% {
            transform: translate3d(115vw, 0, 0);
          }
          100% {
            transform: translate3d(-100px, 0, 0);
          }
        }
        @keyframes vehicleDriveCar1 {
          0% {
            transform: translate3d(125vw, 0, 0);
          }
          100% {
            transform: translate3d(-120px, 0, 0);
          }
        }
        @keyframes vehicleDriveCar2 {
          0% {
            transform: translate3d(135vw, 0, 0);
          }
          100% {
            transform: translate3d(-120px, 0, 0);
          }
        }
        @keyframes vehicleDriveScooter {
          0% {
            transform: translate3d(110vw, 0, 0);
          }
          100% {
            transform: translate3d(-80px, 0, 0);
          }
        }

        .animate-drive-bus {
          animation: vehicleDriveBus 32s linear infinite 0s;
          will-change: transform;
        }
        .animate-drive-auto {
          animation: vehicleDriveAuto 23s linear infinite 5s;
          will-change: transform;
        }
        .animate-drive-car1 {
          animation: vehicleDriveCar1 25s linear infinite 0s;
          will-change: transform;
        }
        .animate-drive-car2 {
          animation: vehicleDriveCar2 20s linear infinite 9s;
          will-change: transform;
        }
        .animate-drive-scooter {
          animation: vehicleDriveScooter 15s linear infinite 3s;
          will-change: transform;
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
          .animate-tree-sway-fast,
          .animate-drive-bus,
          .animate-drive-auto,
          .animate-drive-car1,
          .animate-drive-car2,
          .animate-drive-scooter {
            animation: none !important;
          }
        }
      `}</style>
    </section>
  );
};

export default AnimatedCityFooter;
