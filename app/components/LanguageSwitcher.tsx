"use client";

import { useState, useRef, useEffect, type ReactNode } from "react";
import { useI18n, locales, localeNames, localeCodes, type Locale } from "@/app/lib/i18n";

// SVG flag icons for a cleaner look than emoji flags
const FlagIcon = ({ locale, className = "w-5 h-4" }: { locale: Locale; className?: string }) => {
  const flags: Record<Locale, ReactNode> = {
    de: (
      <svg className={className} viewBox="0 0 640 480" aria-hidden="true">
        <path fill="#ffce00" d="M0 320h640v160H0z" />
        <path d="M0 0h640v160H0z" />
        <path fill="#d00" d="M0 160h640v160H0z" />
      </svg>
    ),
    en: (
      <svg className={className} viewBox="0 0 640 480" aria-hidden="true">
        <path fill="#012169" d="M0 0h640v480H0z" />
        <path fill="#FFF" d="m75 0 244 181L562 0h78v62L400 241l240 178v61h-80L320 301 81 480H0v-60l239-178L0 64V0h75z" />
        <path fill="#C8102E" d="m424 281 216 159v40L369 281h55zm-184 20 6 35L54 480H0l240-179zM640 0v3L391 191l2-44L590 0h50zM0 0l239 176h-60L0 42V0z" />
        <path fill="#FFF" d="M241 0v480h160V0H241zM0 160v160h640V160H0z" />
        <path fill="#C8102E" d="M0 193v96h640v-96H0zM273 0v480h96V0h-96z" />
      </svg>
    ),
    fr: (
      <svg className={className} viewBox="0 0 640 480" aria-hidden="true">
        <path fill="#fff" d="M0 0h640v480H0z" />
        <path fill="#002654" d="M0 0h213.3v480H0z" />
        <path fill="#ce1126" d="M426.7 0H640v480H426.7z" />
      </svg>
    ),
    it: (
      <svg className={className} viewBox="0 0 640 480" aria-hidden="true">
        <path fill="#fff" d="M0 0h640v480H0z" />
        <path fill="#009246" d="M0 0h213.3v480H0z" />
        <path fill="#ce2b37" d="M426.7 0H640v480H426.7z" />
      </svg>
    ),
    pt: (
      <svg className={className} viewBox="0 0 640 480" aria-hidden="true">
        <path fill="#006600" d="M0 0h256v480H0z" />
        <path fill="#ff0000" d="M256 0h384v480H256z" />
        <circle cx="256" cy="240" r="80" fill="#ffff00" />
        <circle cx="256" cy="240" r="64" fill="#006600" />
        <path fill="#fff" d="M256 192c-26.5 0-48 21.5-48 48s21.5 48 48 48 48-21.5 48-48-21.5-48-48-48zm0 80c-17.7 0-32-14.3-32-32s14.3-32 32-32 32 14.3 32 32-14.3 32-32 32z" />
      </svg>
    ),
    es: (
      <svg className={className} viewBox="0 0 640 480" aria-hidden="true">
        <path fill="#c60b1e" d="M0 0h640v480H0z" />
        <path fill="#ffc400" d="M0 120h640v240H0z" />
      </svg>
    ),
  };

  return flags[locale] || null;
};

export function LanguageSwitcher() {
  const { locale, setLocale, t } = useI18n();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close on Escape key
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }
  }, [isOpen]);

  const handleLocaleChange = (newLocale: Locale) => {
    setLocale(newLocale);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/10 hover:border-white/20 transition-all duration-200 text-sm font-medium text-slate-700"
        aria-label={t.language.switchLanguage}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <FlagIcon locale={locale} className="w-5 h-3.5 rounded-[2px] shadow-sm" />
        <span className="hidden sm:inline">{localeCodes[locale]}</span>
        <svg 
          className={`w-3.5 h-3.5 text-slate-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div 
          className="absolute right-0 top-full mt-2 w-48 py-2 bg-white rounded-xl shadow-xl border border-slate-200/80 z-50 animate-in fade-in slide-in-from-top-2 duration-200"
          role="listbox"
          aria-label={t.language.switchLanguage}
        >
          {locales.map((loc) => (
            <button
              key={loc}
              onClick={() => handleLocaleChange(loc)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors duration-150 ${
                locale === loc
                  ? "bg-slate-100 text-slate-900 font-medium"
                  : "text-slate-700 hover:bg-slate-50"
              }`}
              role="option"
              aria-selected={locale === loc}
            >
              <FlagIcon locale={loc} className="w-5 h-3.5 rounded-[2px] shadow-sm flex-shrink-0" />
              <span className="flex-1">{localeNames[loc]}</span>
              {locale === loc && (
                <svg className="w-4 h-4 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// Compact version for mobile or smaller spaces
export function LanguageSwitcherCompact() {
  const { locale, setLocale, t } = useI18n();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center w-9 h-9 rounded-lg bg-white/10 hover:bg-white/20 border border-white/10 hover:border-white/20 transition-all duration-200"
        aria-label={t.language.switchLanguage}
        aria-expanded={isOpen}
      >
        <FlagIcon locale={locale} className="w-5 h-3.5 rounded-[2px] shadow-sm" />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 py-1 bg-white rounded-lg shadow-xl border border-slate-200/80 z-50">
          {locales.map((loc) => (
            <button
              key={loc}
              onClick={() => {
                setLocale(loc);
                setIsOpen(false);
              }}
              className={`flex items-center gap-2 px-3 py-2 text-sm transition-colors ${
                locale === loc ? "bg-slate-100" : "hover:bg-slate-50"
              }`}
            >
              <FlagIcon locale={loc} className="w-5 h-3.5 rounded-[2px] shadow-sm" />
              <span className="text-slate-700">{localeCodes[loc]}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
