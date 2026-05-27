/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Smartphone, Monitor, Signal, Wifi, Battery, ToggleLeft, ToggleRight } from 'lucide-react';

interface MobileFrameProps {
  children: React.ReactNode;
}

export default function MobileFrame({ children }: MobileFrameProps) {
  const [deviceMode, setDeviceMode] = useState<'mobile' | 'full'>('mobile');
  const [currentTime, setCurrentTime] = useState('');
  const [batteryLevel, setBatteryLevel] = useState(88);
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    // Dynamic real-time clock updating
    const updateTime = () => {
      const now = new Date();
      let hours = now.getHours();
      const minutes = now.getMinutes().toString().padStart(2, '0');
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12; // the hour '0' should be '12'
      setCurrentTime(`${hours}:${minutes} ${ampm}`);
    };

    updateTime();
    const interval = setInterval(updateTime, 30000); // update every 30s
    return () => clearInterval(interval);
  }, []);

  // Simulate slow battery drain
  useEffect(() => {
    const batteryInterval = setInterval(() => {
      setBatteryLevel((prev) => (prev > 5 ? prev - 1 : 100));
    }, 120000);
    return () => clearInterval(batteryInterval);
  }, []);

  // Let local network state reflect in-app status
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <div className="min-h-screen bg-neutral-950 text-white font-sans flex flex-col items-center justify-start p-1 md:p-4 select-none">
      {/* Top Utility Controls Bar */}
      <div className="w-full max-w-4xl flex items-center justify-between bg-neutral-900 border border-neutral-800 rounded-2xl p-3 mb-4 shadow-xl">
        <div className="flex items-center gap-3">
          <span className="inline-flex h-3 w-3 rounded-full bg-gold-500 animate-pulse"></span>
          <h1 className="text-sm font-display font-semibold tracking-wide text-neutral-200">
            SIMULIZI APP <span className="text-xs text-gold-500 font-mono">STAGING CORE</span>
          </h1>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-xs text-neutral-400 hidden sm:inline">Mwonekano:</span>
          <button
            id="toggle-mobile-frame"
            onClick={() => setDeviceMode('mobile')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold scroll-smooth transition-all ${
              deviceMode === 'mobile'
                ? 'bg-gold-500 text-neutral-900'
                : 'bg-neutral-800 text-neutral-400 hover:text-white'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            Android Shell
          </button>
          <button
            id="toggle-full-frame"
            onClick={() => setDeviceMode('full')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold scroll-smooth transition-all ${
              deviceMode === 'full'
                ? 'bg-gold-500 text-neutral-900'
                : 'bg-neutral-800 text-neutral-400 hover:text-white'
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            Full Screen
          </button>
        </div>
      </div>

      {deviceMode === 'mobile' ? (
        /* Smatphone Container shell on Desktop, responsive to fall back on mobile screen */
        <div className="relative w-full max-w-[412px] h-[840px] md:h-[840px] rounded-[52px] border-[10px] border-neutral-800 bg-neutral-950 shadow-[0_0_50px_rgba(212,175,55,0.15)] flex flex-col overflow-hidden transition-all duration-300">
          
          {/* Top Hardware Elements: Speaker & Punchhole Camera */}
          <div className="absolute top-0 inset-x-0 h-8 bg-neutral-950 flex items-center justify-center z-50">
            {/* Camera Speaker Bezel Slot & Punchhole camera glass */}
            <div className="w-32 h-[18px] bg-neutral-900 rounded-b-xl flex items-center justify-between px-3">
              <div className="w-12 h-1 bg-neutral-800 rounded-full"></div>
              <div className="w-3 h-3 rounded-full bg-neutral-950 border border-neutral-800 flex items-center justify-center">
                <div className="w-1 h-1 rounded-full bg-blue-950"></div>
              </div>
            </div>
          </div>

          {/* Premium Android OS System bar */}
          <div className="h-8 pt-3 pb-1 px-6 bg-neutral-950 text-[11px] font-mono tracking-wide text-neutral-300 flex items-center justify-between z-40 shrink-0">
            <div className="flex items-center gap-1.5 font-bold">
              <span>Simulizi Net</span>
              {isOffline && (
                <span className="text-red-500 font-bold uppercase text-[9px] px-1 bg-red-950 border border-red-800 rounded">
                  OFFLINE
                </span>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <Wifi className="w-3 h-3 text-gold-500" />
              <Signal className="w-3 h-3 text-gold-500" />
              <div className="flex items-center gap-0.5">
                <span className="text-[10px] scale-90">{batteryLevel}%</span>
                <Battery className="w-4 h-3.5 text-gold-500" />
              </div>
              <span className="font-semibold text-neutral-200 ml-1">{currentTime}</span>
            </div>
          </div>

          {/* Main Content inside Mobile Frame render */}
          <div className="flex-1 w-full bg-neutral-950 overflow-hidden flex flex-col relative">
            {children}
          </div>

          {/* Bottom virtual bar indicating home guestures */}
          <div className="h-4 bg-neutral-950 flex items-center justify-center z-40 shrink-0">
            <div className="w-32 h-1 bg-neutral-700 rounded-full hover:bg-gold-500 transition-colors"></div>
          </div>
        </div>
      ) : (
        /* Full Screen rendering representation (no phone bezels) but kept to a beautiful clean desktop canvas container */
        <div className="w-full max-w-5xl rounded-3xl bg-neutral-900 border border-neutral-800 shadow-2xl h-[820px] flex flex-col overflow-hidden transition-all duration-300">
          <div className="h-10 px-6 bg-neutral-950 text-xs font-mono tracking-wide text-neutral-400 flex items-center justify-between z-40 shrink-0 border-b border-neutral-900">
            <div>SIMULIZI APP — FULL WEB ACCESS CLIENT</div>
            <div className="flex items-center gap-4">
              <span>Masaa: {currentTime}</span>
              <span>Kasi: Ultra-Fast</span>
              <span>Muunganisho: Simulizi Net (LTE)</span>
            </div>
          </div>
          <div className="flex-1 w-full bg-neutral-950 overflow-hidden flex flex-col relative">
            {children}
          </div>
        </div>
      )}
    </div>
  );
}
