/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Star, ShieldAlert, Sparkles, Flame, Eye, Heart, MessageSquare } from 'lucide-react';
import { Story } from '../types';

interface StoryCardProps {
  key?: string;
  story: Story;
  onSelect: (story: Story) => void;
  isPurchased: boolean;
}

export default function StoryCard({ story, onSelect, isPurchased }: StoryCardProps) {
  // Check if story is premium and needs payment
  const requiresPayment = story.isPremium && !isPurchased;

  return (
    <div
      onClick={() => onSelect(story)}
      className="group relative flex flex-col glass-card glass-card-hover rounded-2xl overflow-hidden transition-all duration-300 cursor-pointer active:scale-[0.98]"
    >
      {/* Upper Cover Portion */}
      <div className="relative w-full aspect-[4/5] overflow-hidden bg-neutral-950">
        <img
          src={story.coverUrl}
          alt={story.title}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Ambient Top Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-transparent to-neutral-950/40"></div>

        {/* Category Badge overlay */}
        <div className="absolute top-2 left-2 z-10">
          <span className="text-[9px] font-bold font-display uppercase tracking-wider px-2 py-0.5 rounded-full bg-black/75 text-white border border-white/10 backdrop-blur-md">
            {story.category}
          </span>
        </div>

        {/* Free or Premium golden label */}
        <div className="absolute top-2 right-2 z-10">
          {story.isPremium ? (
            <span className="flex items-center gap-0.5 text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-lg bg-gradient-to-r from-gold-450 to-orange-500 text-black font-mono shadow-md">
              <Sparkles className="w-2.5 h-2.5 fill-current" />
              LIPANIA
            </span>
          ) : (
            <span className="text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-lg bg-emerald-500 text-neutral-950 font-mono shadow-md">
              BURE
            </span>
          )}
        </div>

        {/* Reads viewer, likes & comments stats indicator */}
        <div className="absolute bottom-2 left-2 flex items-center gap-2 text-[9px] font-mono text-neutral-200 bg-neutral-950/80 py-1 px-2 rounded-full backdrop-blur-md border border-white/5 shadow-md">
          <div className="flex items-center gap-0.5" title="Kusomwa (Views)">
            <Eye className="w-2.5 h-2.5 text-sky-400" />
            <span>{(story.reads || 0).toLocaleString()}</span>
          </div>
          <span className="opacity-35 text-[8px] font-sans">|</span>
          <div className="flex items-center gap-0.5" title="Kupendwa (Likes)">
            <Heart className="w-2.5 h-2.5 text-rose-500 fill-rose-500" />
            <span>{(story.likes || 0).toLocaleString()}</span>
          </div>
          <span className="opacity-35 text-[8px] font-sans">|</span>
          <div className="flex items-center gap-0.5" title="Maoni (Comments)">
            <MessageSquare className="w-2.5 h-2.5 text-amber-400" />
            <span>{(story.reviews?.length || 0).toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Content Details Portion */}
      <div className="p-3 flex flex-col flex-1 text-white">
        <div className="flex items-center justify-between mb-0.5">
          <span className="text-[10px] text-neutral-400 font-medium truncate max-w-[70%]">
            na {story.author}
          </span>
          <div className="flex items-center gap-0.5 font-mono text-[10px] text-gold-400 font-bold shrink-0">
            <Star className="w-2.5 h-2.5 fill-gold-400 stroke-gold-400" />
            <span>{story.rating.toFixed(1)}</span>
          </div>
        </div>

        <h3 className="text-xs font-display font-semibold text-neutral-100 line-clamp-1 group-hover:text-gold-400 transition-colors">
          {story.title}
        </h3>

        {/* Buy/Read Button block at bottom of card */}
        <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center justify-between gap-1">
          <div className="flex flex-col">
            <span className="text-[8px] text-neutral-500 uppercase font-mono tracking-wider">
              Gharama
            </span>
            <span className="text-[11px] font-semibold text-neutral-200 font-mono">
              {story.isPremium ? `TZS ${story.price.toLocaleString()}` : 'Bure'}
            </span>
          </div>

          <button
            id={`read-btn-${story.id}`}
            className={`cursor-pointer text-[10px] px-3 py-1.5 rounded-lg font-bold transition-all uppercase tracking-wider ${
              requiresPayment
                ? 'bg-white/10 hover:bg-gradient-to-r hover:from-gold-500 hover:to-orange-500 text-neutral-200 hover:text-black hover:font-black border border-white/10'
                : 'bg-gradient-to-r from-gold-500 to-orange-500 text-black font-extrabold shadow-lg hover:brightness-110 active:scale-95'
            }`}
          >
            {requiresPayment ? 'Soma (Lipia)' : 'Soma'}
          </button>
        </div>
      </div>
    </div>
  );
}
