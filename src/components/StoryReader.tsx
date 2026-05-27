/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, BookOpen, Download, Trash, Check, Type, Sun, Moon, Sparkles, Heart, MessageSquare, Eye, Send, Star } from 'lucide-react';
import { Story } from '../types';

interface StoryReaderProps {
  key?: string;
  story: Story;
  onBack: () => void;
  isDownloaded: boolean;
  onToggleDownload: (storyId: string) => void;
  onUpdateStory?: (updatedStory: Story) => void;
}

type ReaderTheme = 'dark' | 'sepia' | 'light';

export default function StoryReader({ story, onBack, isDownloaded, onToggleDownload, onUpdateStory }: StoryReaderProps) {
  const [activeChapterIndex, setActiveChapterIndex] = useState(0);
  const [fontSize, setFontSize] = useState<number>(15); // in px
  const [theme, setTheme] = useState<ReaderTheme>('dark');
  const [hasScrolledCompleted, setHasScrolledCompleted] = useState(false);

  // Comments and feedback states
  const [commentText, setCommentText] = useState('');
  const [commentAuthor, setCommentAuthor] = useState('');
  const [liked, setLiked] = useState(false);

  const handleLikeToggle = () => {
    const nextLiked = !liked;
    setLiked(nextLiked);
    if (onUpdateStory) {
      onUpdateStory({
        ...story,
        likes: Math.min(20000000, Math.max(0, (story.likes || 0) + (nextLiked ? 1 : -1)))
      });
    }
  };

  const submitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    const newReview = {
      id: `r-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      userName: commentAuthor.trim() || 'Msomaji Mzalendo',
      rating: 5,
      comment: commentText.trim(),
      date: new Date().toISOString().split('T')[0]
    };

    const updatedReviews = [newReview, ...(story.reviews || [])];

    if (onUpdateStory) {
      onUpdateStory({
        ...story,
        reviews: updatedReviews
      });
    }
    setCommentText('');
  };

  const currentChapter = story.chapters[activeChapterIndex] || story.chapters[0];

  const getThemeClasses = () => {
    switch (theme) {
      case 'dark':
        return {
          bg: 'bg-[#050505]',
          text: 'text-neutral-200',
          accent: 'text-gold-400 font-bold',
          panel: 'glass-premium border-white/5',
          buttonActive: 'bg-gradient-to-r from-gold-500 to-orange-500 text-black font-black',
          buttonInactive: 'bg-white/5 border border-white/5 text-neutral-300 hover:bg-white/10 hover:text-white',
        };
      case 'sepia':
        return {
          bg: 'bg-[#f4ece1]',
          text: 'text-stone-800',
          accent: 'text-amber-800',
          panel: 'bg-[#e9ded0] border-stone-300',
          buttonActive: 'bg-amber-800 text-amber-50',
          buttonInactive: 'bg-[#e9ded0] text-stone-600 hover:text-stone-900',
        };
      case 'light':
        return {
          bg: 'bg-white',
          text: 'text-neutral-900',
          accent: 'text-neutral-800 border-neutral-200',
          panel: 'bg-neutral-100 border-neutral-200',
          buttonActive: 'bg-neutral-900 text-white',
          buttonInactive: 'bg-neutral-100 text-neutral-600 hover:text-neutral-900',
        };
    }
  };

  const style = getThemeClasses();

  const handleNextChapter = () => {
    if (activeChapterIndex < story.chapters.length - 1) {
      setActiveChapterIndex((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setHasScrolledCompleted(true);
    }
  };

  const handlePrevChapter = () => {
    if (activeChapterIndex > 0) {
      setActiveChapterIndex((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className={`absolute inset-0 flex flex-col z-30 transition-all ${style.bg} ${style.text}`}>
      {/* Reader Top Navigation Bar Header */}
      <div className={`h-14 px-4 flex items-center justify-between border-b shrink-0 z-40 ${
        theme === 'dark' ? 'glass-header border-white/5 text-white' : 
        theme === 'sepia' ? 'bg-[#e9ded0] border-stone-300 text-stone-800' :
        'bg-neutral-50 border-neutral-200 text-neutral-800'
      }`}>
        <button
          id="reader-back-btn"
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-semibold hover:opacity-80 transition-opacity p-1.5 rounded-lg mr-2 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>KUTOKA</span>
        </button>

        <div className="flex-1 min-w-0 px-2 text-center">
          <h2 className="text-xs font-display font-bold truncate tracking-tight">{story.title}</h2>
          <p className="text-[9px] opacity-75 truncate">na {story.author}</p>
        </div>

        {/* Action Toggle - offline storage */}
        <button
          id="reader-download-toggle-btn"
          onClick={() => onToggleDownload(story.id)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            isDownloaded
              ? 'bg-gradient-to-r from-emerald-500 to-green-600 text-neutral-950 font-black'
              : theme === 'dark' ? 'bg-white/5 border border-white/5 text-gold-400 hover:bg-white/10' : 'bg-stone-300/60 text-stone-800 hover:bg-stone-300'
          }`}
          title={isDownloaded ? 'Futa kwenye simu' : 'Pakua kwa kusoma offline'}
        >
          {isDownloaded ? (
            <>
              <Check className="w-3.5 h-3.5 fill-current" />
              <span className="hidden sm:inline">Pakuliwa</span>
            </>
          ) : (
            <>
              <Download className="w-3.5 h-3.5 animate-bounce" />
              <span className="hidden sm:inline">Pakua</span>
            </>
          )}
        </button>
      </div>

      {/* Reader Toolbox Panel Controls (Floating sticky) */}
      <div className={`px-4 py-2 border-b flex items-center justify-between gap-2 shrink-0 text-xs ${style.panel}`}>
        {/* Font changer icons */}
        <div className="flex items-center gap-1">
          <Type className="w-3.5 h-3.5 opacity-60 mr-1" />
          <button
            id="reader-font-minus"
            onClick={() => setFontSize((p) => Math.max(12, p - 1.5))}
            className="px-2.5 py-1 bg-black/15 font-bold font-mono hover:bg-black/25 rounded cursor-pointer"
            title="Punguza herufi"
          >
            A-
          </button>
          <span className="text-[10px] font-mono mx-1">{fontSize.toFixed(0)}px</span>
          <button
            id="reader-font-plus"
            onClick={() => setFontSize((p) => Math.min(26, p + 1.5))}
            className="px-2.5 py-1 bg-black/15 font-bold font-mono hover:bg-black/25 rounded cursor-pointer"
            title="Ongeza herufi"
          >
            A+
          </button>
        </div>

        {/* Simple Swahili Theme selector buttons */}
        <div className="flex items-center gap-1">
          {(['dark', 'sepia', 'light'] as const).map((t) => (
            <button
              key={t}
              id={`bt-theme-${t}`}
              onClick={() => setTheme(t)}
              className={`px-3 py-1 rounded-full text-[10px] font-semibold transition-all uppercase tracking-wider cursor-pointer ${
                theme === t
                  ? style.buttonActive
                  : style.buttonInactive
              }`}
            >
              {t === 'dark' ? 'Usiku' : t === 'sepia' ? 'Sepia' : 'Mwanga'}
            </button>
          ))}
        </div>
      </div>

      {/* Main Prose Content Reader body */}
      <div className="flex-1 overflow-y-auto px-6 py-6 font-serif leading-loose flex flex-col items-center">
        <article className="w-full max-w-xl flex-1 flex flex-col">
          {/* Chapter header */}
          <div className="text-center mb-8 border-b pb-4 border-current/10">
            <span className="text-xs font-mono uppercase tracking-widest opacity-60">
              Sura ya {activeChapterIndex + 1} kati ya {story.chapters.length}
            </span>
            <h3 className={`text-lg font-bold font-display mt-1 ${theme === 'dark' ? 'text-gradient' : style.accent}`}>
              {currentChapter.title}
            </h3>
          </div>

          {/* Actual Prose paragraphs with customized typography rendering */}
          <div
            id="reader-prose-body"
            style={{ fontSize: `${fontSize}px` }}
            className={`whitespace-pre-line text-justify transition-all leading-relaxed tracking-normal font-sans`}
          >
            {currentChapter.content}
          </div>

          {/* Interactive Liking and Views Section */}
          <div className="mt-8 pt-6 border-t border-dashed border-current/15 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4 text-xs font-mono">
              <span className="flex items-center gap-1.5 opacity-80">
                <Eye className="w-4 h-4 text-sky-400" />
                <strong>{(story.reads || 0).toLocaleString()}</strong> Views
              </span>
              <span className="opacity-20">|</span>
              <span className="flex items-center gap-1.5 opacity-80">
                <MessageSquare className="w-4 h-4 text-amber-400" />
                <strong>{(story.reviews?.length || 0).toLocaleString()}</strong> Maoni
              </span>
            </div>

            <button
              id={`reader-like-btn-${story.id}`}
              onClick={handleLikeToggle}
              className={`flex items-center gap-2 px-5 py-2 rounded-2xl text-xs font-bold font-sans transition-all active:scale-95 cursor-pointer ${
                liked
                  ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20 shadow shadow-rose-500/10'
                  : 'bg-black/20 hover:bg-black/35 text-neutral-450 border border-current/10'
              }`}
            >
              <Heart className={`w-4 h-4 transition-transform duration-300 ${liked ? 'fill-rose-500 stroke-rose-400 scale-110' : 'stroke-neutral-400'}`} />
              <span>{liked ? 'Umeipenda!' : 'Penda Simulizi (Like)'}</span>
              <span className="font-mono bg-black/15 px-1.5 py-0.5 rounded-md text-[10px]">
                {(story.likes || 0).toLocaleString()}
              </span>
            </button>
          </div>

          {/* Comments Section (Maoni ya Wasomaji) */}
          <div className="mt-10 py-6 border-t border-current/10 space-y-5">
            <h4 className="text-sm font-bold font-display uppercase tracking-widest flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-gold-500" />
              <span>Maoni ya Wasomaji ({story.reviews?.length || 0})</span>
            </h4>

            {/* Comment Form */}
            <form onSubmit={submitComment} className="space-y-3 p-4 bg-black/10 rounded-2xl border border-current/5">
              <div className="space-y-1">
                <label className="text-[9px] font-mono tracking-wider font-bold uppercase block opacity-60">Jina Lako (Pseudonym)</label>
                <input
                  type="text"
                  placeholder="Mfano: Msomaji Mkuu"
                  value={commentAuthor}
                  onChange={(e) => setCommentAuthor(e.target.value)}
                  className="w-full bg-black/50 border border-current/10 rounded-xl px-3 py-1.5 text-xs text-current outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-mono tracking-wider font-bold uppercase block opacity-60">Andika Maoni Yako *</label>
                <div className="relative">
                  <textarea
                    rows={2}
                    placeholder="Weka maoni yako hapa kuhusu sura hii..."
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    className="w-full bg-black/50 border border-current/10 rounded-xl p-2.5 text-xs text-current outline-none resize-none pr-10"
                    required
                  />
                  <button
                    type="submit"
                    className="absolute right-2.5 bottom-2.5 bg-gold-400 text-neutral-950 hover:brightness-110 hover:scale-105 active:scale-95 transition-all w-7 h-7 rounded-lg flex items-center justify-center cursor-pointer shadow z-10"
                    title="Tuma Maoni"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </form>

            {/* Comments List */}
            <div className="space-y-3.5 max-h-[300px] overflow-y-auto pr-1">
              {story.reviews && story.reviews.length > 0 ? (
                story.reviews.map((rev) => (
                  <div key={rev.id} className="p-3 bg-black/5 rounded-xl border border-current/5 space-y-1 text-xs">
                    <div className="flex items-center justify-between opacity-80">
                      <span className="font-bold tracking-tight text-gold-500 font-sans">{rev.userName}</span>
                      <span className="text-[10px] opacity-60 font-mono">{rev.date}</span>
                    </div>
                    <p className="leading-relaxed opacity-90 font-sans">{rev.comment}</p>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 border border-dashed border-current/10 rounded-xl">
                  <span className="text-[10px] opacity-50 block font-mono">Hakuna maoni bado. Kuwa wa kwanza kutoa maoni!</span>
                </div>
              )}
            </div>
          </div>

          {/* End of Chapter or finish milestone feedback */}
          {activeChapterIndex === story.chapters.length - 1 ? (
            <div className="mt-12 p-6 rounded-2xl border border-current/15 bg-black/5 text-center flex flex-col items-center">
              <Sparkles className="w-6 h-6 text-gold-500 animate-spin mb-2" />
              <h4 className="text-xs font-bold font-display uppercase tracking-widest text-gold-500 font-bold">Mwisho wa Hadithi</h4>
              <p className="text-[11px] leading-relaxed opacity-75 max-w-sm mt-1">
                Umemaliza kusoma simulizi ya <span className="font-semibold">{story.title}</span>. Asante sana kwa kuwa sehemu ya Simulizi App!
              </p>
            </div>
          ) : null}
        </article>
      </div>

      {/* Footer Navigation bars */}
      <div className={`p-4 border-t flex items-center justify-between shrink-0 ${style.panel}`}>
        <button
          id="reader-prev-chapter-btn"
          onClick={handlePrevChapter}
          disabled={activeChapterIndex === 0}
          className={`flex items-center gap-1 px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer disabled:opacity-30 disabled:pointer-events-none transition-all`}
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Kazi Iliyopita
        </button>

        <span className="text-[10px] font-mono text-center">
          Sura {activeChapterIndex + 1}/{story.chapters.length}
        </span>

        {activeChapterIndex < story.chapters.length - 1 ? (
          <button
            id="reader-next-chapter-btn"
            onClick={handleNextChapter}
            className="flex items-center gap-1 bg-gradient-to-r from-gold-500 to-orange-500 text-black font-extrabold px-4 py-2 rounded-lg text-xs shadow-md cursor-pointer hover:brightness-110 active:scale-95 transition-all"
          >
            Sura Inayofuata
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        ) : (
          <button
            id="reader-exit-completed-btn"
            onClick={onBack}
            className="bg-gradient-to-r from-emerald-500 to-green-600 text-neutral-950 font-bold px-5 py-2 rounded-lg text-xs cursor-pointer hover:opacity-90 active:scale-95 transition-all"
          >
            Mwisho (Rudi Nyumbani)
          </button>
        )}
      </div>
    </div>
  );
}
