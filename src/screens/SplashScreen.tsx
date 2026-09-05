import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../context/AppContext';
import { haptics } from '../utils/haptics';

import splashTurfFootball from '../assets/images/regenerated_image_1787992933746.jpg';
import splashTurfCricket from '../assets/images/turf_cricket_futsal_1787981390589.jpg';
import splashTurfNight from '../assets/images/turf_football_night_1787981364247.jpg';

interface SplashSlide {
  id: number;
  title: string;
  description: string;
  image: string;
  fallbackImage: string;
}

export const SplashScreen: React.FC = () => {
  const { navigateTo } = useApp();
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides: SplashSlide[] = [
    {
      id: 1,
      title: 'Instant Turf Booking',
      description:
        'Reserve floodlit football, cricket & badminton courts in real-time. Zero double-booking, instant slot confirmation.',
      image: splashTurfFootball,
      fallbackImage:
        'https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=1000&auto=format&fit=crop',
    },
    {
      id: 2,
      title: 'Fast QR & UPI Payments',
      description:
        'Scan & pay instantly at the arena, split booking balances with teammates, or record cash on the spot.',
      image: splashTurfCricket,
      fallbackImage:
        'https://images.unsplash.com/photo-1529900245534-47fbfb57d56a?q=80&w=1000&auto=format&fit=crop',
    },
    {
      id: 3,
      title: 'Complete Venue Control',
      description:
        'Manage multiple courts, live slot locks, offline walk-ins, team bookings, and live daily revenue stats.',
      image: splashTurfNight,
      fallbackImage:
        'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=1000&auto=format&fit=crop',
    },
  ];

  const slide = slides[currentSlide];

  const handleNextSlide = () => {
    haptics.tap();
    if (currentSlide < slides.length - 1) {
      setCurrentSlide((prev) => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handleSkip = () => {
    haptics.tap();
    navigateTo('home');
  };

  const handleComplete = () => {
    haptics.success();
    navigateTo('login');
  };

  return (
    <div className="relative w-full h-full min-h-screen bg-[#0A0A0C] text-white flex flex-col justify-between overflow-hidden select-none font-sans">
      {/* Background Image Carousel: Crisp and completely unblurred in the middle/upper canvas */}
      <div className="absolute inset-0 z-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={slide.id}
            initial={{ opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0"
          >
            <img
              src={slide.image}
              onError={(e) => {
                (e.target as HTMLImageElement).src = slide.fallbackImage;
              }}
              alt="Sports Turf Arena"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-center"
            />
          </motion.div>
        </AnimatePresence>

        {/* Subtle Top Vignette for status bar / branding readability */}
        <div className="absolute top-0 left-0 right-0 h-28 bg-gradient-to-b from-black/70 via-black/30 to-transparent pointer-events-none" />

        {/* 
          BOTTOM PROGRESSIVE BLUR EFFECT:
          - The middle and top are crisp with NO BLUR.
          - The bottom gradually transitions into heavy full blur with smooth gradient mask.
        */}
        <div
          className="absolute inset-x-0 bottom-0 h-[52%] backdrop-blur-2xl pointer-events-none"
          style={{
            maskImage: 'linear-gradient(to top, rgba(0,0,0,1) 50%, rgba(0,0,0,0.4) 75%, rgba(0,0,0,0) 100%)',
            WebkitMaskImage: 'linear-gradient(to top, rgba(0,0,0,1) 50%, rgba(0,0,0,0.4) 75%, rgba(0,0,0,0) 100%)',
          }}
        />

        {/* Smooth Dark Gradient Over the blurred region */}
        <div className="absolute inset-x-0 bottom-0 h-[58%] bg-gradient-to-t from-[#0B0B0D] via-[#0B0B0D]/85 to-transparent pointer-events-none" />
      </div>

      {/* Top Header Row with Logo */}
      <div className="relative z-20 pt-8 px-6 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-lg">
            <span className="text-white font-black text-[13px] tracking-tighter">TT</span>
          </div>
          <span className="text-[13px] font-bold text-white/90 tracking-wide uppercase">
            TurfTown
          </span>
        </div>
      </div>

      {/* Spacer for middle unblurred visual viewing zone */}
      <div
        className="relative z-10 flex-1 cursor-pointer"
        onClick={handleNextSlide}
        title="Tap to advance slide"
      />

      {/* Bottom Content Area: Centered Typography & Bottom Navigation Bar */}
      <div className="relative z-20 px-7 pb-10 w-full max-w-md mx-auto">
        <motion.div
          key={`content-${slide.id}`}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="text-center space-y-3 mb-8"
        >
          {/* Centered Heading */}
          <h1 className="text-[26px] sm:text-[28px] font-extrabold text-white tracking-tight leading-tight">
            {slide.title}
          </h1>

          {/* Centered Subtitle Description */}
          <p className="text-[14px] text-neutral-300 font-normal leading-relaxed mx-auto max-w-[320px]">
            {slide.description}
          </p>
        </motion.div>

        {/* Bottom Navigation Row: [Skip]   [  •  •  •  ]   [Next] */}
        <div className="flex items-center justify-between pt-2">
          {/* Left Action: Skip */}
          <button
            id="btn-splash-skip"
            onClick={handleSkip}
            className="text-[14.5px] font-semibold text-neutral-400 hover:text-white transition-colors cursor-pointer px-2 py-1 active:scale-95"
          >
            Skip
          </button>

          {/* Center: Pagination Dots */}
          <div className="flex items-center gap-2.5">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => {
                  haptics.tap();
                  setCurrentSlide(idx);
                }}
                className={`transition-all duration-300 rounded-full cursor-pointer ${
                  currentSlide === idx
                    ? 'w-2.5 h-2.5 bg-[#D4FF00] shadow-[0_0_8px_rgba(212,255,0,0.8)] scale-110'
                    : 'w-2 h-2 bg-white/30 hover:bg-white/50'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>

          {/* Right Action: Next / Get Started */}
          <button
            id="btn-splash-next"
            onClick={handleNextSlide}
            className="text-[14.5px] font-bold text-white hover:text-[#D4FF00] transition-colors cursor-pointer px-2 py-1 active:scale-95 flex items-center gap-1"
          >
            {currentSlide === slides.length - 1 ? 'Start' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
};
