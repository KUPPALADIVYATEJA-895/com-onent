import React, { useState, useRef, useEffect } from 'react';
import { useTheme, THEME_CONFIGS } from '../context/ThemeContext';
import { AppTheme } from '../types';
import { Palette, Check, ChevronDown, Sparkles } from 'lucide-react';

export const ThemeSwitcher: React.FC = () => {
  const { theme, setTheme, isIndustrial, isHazard, themeConfig } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const themesList: AppTheme[] = ['industrial-studio', 'mission-control', 'tactical-hazard'];

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        id="btn-theme-switcher"
        onClick={() => setIsOpen(!isOpen)}
        title="Change telemetry UI theme"
        className={`flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs font-mono font-medium transition-all cursor-pointer border shadow-sm ${
          isHazard
            ? 'bg-[#121215] hover:bg-[#1b1b22] border-[#FACC15]/40 text-white'
            : isIndustrial
            ? 'bg-[#232731] hover:bg-[#2e3442] border-[#3E4654] text-[#EAD7C3]'
            : 'bg-[#141d2b] hover:bg-[#1d293d] border-[#24334a] text-slate-200'
        }`}
      >
        {/* Palette icon */}
        <Palette
          className={`w-3.5 h-3.5 ${
            isHazard ? 'text-[#FACC15]' : isIndustrial ? 'text-[#E28743]' : 'text-cyan-400'
          }`}
        />

        {/* Current Active Swatches */}
        <div className="flex items-center -space-x-1">
          <span
            className="w-2.5 h-2.5 rounded-full border border-black/40 shadow-xs"
            style={{ backgroundColor: themeConfig.bgHex }}
          />
          <span
            className="w-2.5 h-2.5 rounded-full border border-black/40 shadow-xs"
            style={{ backgroundColor: themeConfig.secondaryHex }}
          />
          <span
            className="w-2.5 h-2.5 rounded-full border border-black/40 shadow-xs ring-1 ring-white/20"
            style={{ backgroundColor: themeConfig.accentHex }}
          />
        </div>

        <span className="hidden sm:inline font-semibold">
          {isHazard
            ? 'Tactical Hazard'
            : isIndustrial
            ? 'Industrial Studio'
            : 'Mission Control'}
        </span>

        <span
          className={`text-[9px] px-1 py-0.2 rounded font-bold uppercase ${
            isHazard
              ? 'bg-[#FACC15]/20 text-[#FACC15] border border-[#FACC15]/40'
              : isIndustrial
              ? 'bg-[#E28743]/20 text-[#E28743] border border-[#E28743]/40'
              : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
          }`}
        >
          THEME
        </span>

        <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          id="theme-dropdown-menu"
          className={`absolute right-0 mt-2 w-80 sm:w-88 rounded-2xl p-2.5 shadow-2xl z-50 border backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150 ${
            isHazard
              ? 'bg-[#0E0E12]/95 border-[#2A2A35] text-white shadow-[0_15px_40px_rgba(0,0,0,0.85)]'
              : isIndustrial
              ? 'bg-[#222730]/95 border-[#3E4654] text-[#EAD7C3] shadow-[0_15px_40px_rgba(0,0,0,0.6)]'
              : 'bg-[#0e1422]/95 border-[#232f42] text-slate-200 shadow-[0_15px_40px_rgba(0,0,0,0.8)]'
          }`}
        >
          {/* Header Title */}
          <div className="px-3 py-2 mb-1.5 border-b border-inherit/40 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Sparkles
                className={`w-3.5 h-3.5 ${
                  isHazard ? 'text-[#FACC15]' : isIndustrial ? 'text-[#E28743]' : 'text-cyan-400'
                }`}
              />
              <span className="text-xs font-mono font-bold tracking-wider uppercase opacity-90">
                SELECT TELEMETRY THEME
              </span>
            </div>
            <span className="text-[10px] font-mono opacity-60">3 PALETTES</span>
          </div>

          {/* List of Themes */}
          <div className="space-y-2">
            {themesList.map((themeKey) => {
              const cfg = THEME_CONFIGS[themeKey];
              const isSelected = theme === themeKey;

              return (
                <button
                  key={themeKey}
                  id={`theme-option-${themeKey}`}
                  onClick={() => {
                    setTheme(themeKey);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left p-3 rounded-xl border transition-all cursor-pointer flex flex-col gap-1.5 relative ${
                    isSelected
                      ? isHazard
                        ? 'bg-[#18181D] border-[#FACC15] shadow-[0_0_15px_rgba(250,204,21,0.3)]'
                        : isIndustrial
                        ? 'bg-[#2B303A] border-[#E28743] shadow-[0_0_15px_rgba(226,135,67,0.25)]'
                        : 'bg-[#151f30] border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.25)]'
                      : isHazard
                      ? 'bg-[#101014]/80 border-[#222228] hover:bg-[#181820] hover:border-[#383844]'
                      : isIndustrial
                      ? 'bg-[#1C2028]/80 border-[#323846] hover:bg-[#2B303A]/70 hover:border-[#475060]'
                      : 'bg-[#0a0f1a]/80 border-[#1a2333] hover:bg-[#141d2d] hover:border-[#223147]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {/* 3 Swatch Dots */}
                      <div className="flex items-center -space-x-1">
                        <span
                          className="w-3.5 h-3.5 rounded-full border border-black/50 shadow-sm"
                          style={{ backgroundColor: cfg.bgHex }}
                        />
                        <span
                          className="w-3.5 h-3.5 rounded-full border border-black/50 shadow-sm"
                          style={{ backgroundColor: cfg.secondaryHex }}
                        />
                        <span
                          className="w-3.5 h-3.5 rounded-full border border-black/50 shadow-sm"
                          style={{ backgroundColor: cfg.accentHex }}
                        />
                      </div>

                      <span className="text-xs font-bold font-sans tracking-tight">
                        {cfg.name}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded opacity-75 border border-current/20">
                        {cfg.badge}
                      </span>
                      {isSelected && (
                        <div
                          className="w-4 h-4 rounded-full flex items-center justify-center text-black font-bold"
                          style={{ backgroundColor: cfg.accentHex }}
                        >
                          <Check className="w-2.5 h-2.5 stroke-[3] text-black" />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Subtitle / Description */}
                  <p className="text-[11px] font-mono opacity-75 pl-7">
                    {cfg.subtitle}
                  </p>

                  {/* Aesthetic description preview */}
                  <div className="text-[10px] pl-7 opacity-60 leading-relaxed font-sans">
                    {themeKey === 'tactical-hazard' ? (
                      <span>Pitch black (#0A0A0B), high-voltage safety yellow (#FACC15) & crisp white (#FFFFFF). High-contrast tactical caution and aerospace emergency warning spec.</span>
                    ) : themeKey === 'industrial-studio' ? (
                      <span>Matte slate (#2B303A), warm birch sand (#EAD7C3) & structural muted orange (#E28743). Tactile audio engineering gear & physical synthesizer console.</span>
                    ) : (
                      <span>Obsidian (#070B12), deep space navy & electric cyan (#06B6D4). High-contrast deep space mission ops.</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Footer note */}
          <div className="mt-2 pt-2 border-t border-inherit/30 text-[10px] font-mono text-center opacity-60">
            Preference automatically saved locally
          </div>
        </div>
      )}
    </div>
  );
};
