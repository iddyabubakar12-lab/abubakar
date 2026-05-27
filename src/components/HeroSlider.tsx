/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Sparkles, BookOpen } from 'lucide-react';
import { Story } from '../types';

interface HeroSliderProps {
  stories: Story[];
  slides?: any[];
  onSelectStory: (story: Story) => void;
}

export default function HeroSlider({ stories, slides = [], onSelectStory }: HeroSliderProps) {
  // Merge custom slides with featured stories
  const featuredStories = stories.filter(s => s.isFeatured === true);
  const displaySlides = [
    ...slides,
    ...(featuredStories.length > 0 ? featuredStories : stories.filter(s => s.rating >= 4.7).slice(0, 3))
  ];
  
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (displaySlides.length === 0) return;
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % displaySlides.length);
    }, 6000); // Rotate every 6 seconds for better reading pacing
    return () => clearInterval(interval);
  }, [displaySlides.length]);

  if (displaySlides.length === 0) return null;

  const current = displaySlides[currentIndex];

  const handleDotClick = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex(index);
  };

  return (
    <div className="relative w-full h-[240px] md:h-[280px] rounded-2xl overflow-hidden shadow-2xl glass-card grow-0 shrink-0">
      <AnimatePresence mode="wait">
        <motion.div
          key={current.id}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.8 }}
          className="absolute inset-0 w-full h-full cursor-pointer"
          onClick={() => {
            if (current.isAd) {
              alert(`📢 TANGAZO RASMI:\n\n★ ${current.title}\n\n${current.description}`);
            } else {
              onSelectStory(current);
            }
          }}
        >
          {/* Background Cinematic Cover Image */}
          <img
            src={current.coverUrl}
            alt={current.title}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-center"
          />

          {/* Premium Ambient Overlays: Dark gradient to ensure high readability of text */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-[#050505]/50 to-transparent"></div>
          <div className="absolute inset-y-0 left-0 w-2/3 bg-gradient-to-r from-black/80 to-transparent"></div>

          {/* Interactive Sparkle Tag indicating premium featured status */}
          <div className="absolute top-3 left-3 flex items-center gap-1 bg-gradient-to-r from-gold-500 to-orange-500 text-neutral-950 text-[10px] font-black tracking-widest px-2.5 py-1 rounded-lg uppercase shadow">
            <Sparkles className="w-3 h-3 fill-neutral-950" />
            <span>{current.isAd ? 'TANGAZO RASMI' : 'KILICHOPONYWA'}</span>
          </div>

          {/* Banner Meta Content overlay */}
          <div className="absolute inset-x-0 bottom-0 p-4 md:p-6 flex flex-col justify-end text-white z-10 pointer-events-none">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-white/10 border border-white/10 text-gold-400 font-mono">
                {current.category}
              </span>
              {current.rating && !current.isAd && (
                <span className="text-xs text-neutral-350 font-mono">
                  ★ {Number(current.rating).toFixed(1)}
                </span>
              )}
            </div>

            <h2 className="text-xl md:text-2xl font-display font-bold text-white tracking-tight line-clamp-1 drop-shadow-md">
              {current.title}
            </h2>

            <p className="text-xs text-neutral-350 line-clamp-2 mt-1 mb-3.5 max-w-[85%] md:max-w-[70%] drop-shadow leading-relaxed">
              {current.description}
            </p>

            {/* Simulated Action buttons */}
            <div className="flex items-center gap-3 pointer-events-auto">
              <button
                id={`featured-read-${current.id}`}
                onClick={(e) => {
                  e.stopPropagation();
                  if (current.isAd) {
                    alert(`📢 TANGAZO RASMI:\n\n★ ${current.title}\n\n${current.description}`);
                  } else {
                    onSelectStory(current);
                  }
                }}
                className="flex items-center gap-1.5 bg-gradient-to-r from-gold-500 to-orange-500 text-neutral-950 rounded-lg px-4 py-2 text-xs font-black transition-all scale-100 active:scale-95 cursor-pointer shadow-lg hover:brightness-110"
              >
                <BookOpen className="w-3.5 h-3.5 fill-neutral-950" />
                <span>{current.isAd ? 'Angalia Ofa' : 'Soma Sasa'}</span>
              </button>
              
              {!current.isAd && (
                <span className="text-xs font-mono font-bold text-gold-400">
                  {current.price > 0 ? `TZS ${current.price.toLocaleString()}` : 'BURE'}
                </span>
              )}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Manual Dots indicators */}
      <div className="absolute bottom-4 right-4 flex items-center gap-2 z-20">
        {displaySlides.map((slide, idx) => (
          <button
            key={slide.id}
            id={`indicator-dot-${idx}`}
            onClick={(e) => handleDotClick(idx, e)}
            className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
              currentIndex === idx ? 'w-5 bg-gold-500' : 'w-1.5 bg-neutral-600 hover:bg-neutral-400'
            }`}
            title={`Slide ${idx + 1}`}
          ></button>
        ))}
      </div>
    </div>
  );
}
