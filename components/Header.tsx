'use client';

import Link from 'next/link';
import UserNav from './UserNav';
import { useEffect, useRef } from 'react';
import gsap from 'gsap';

export default function Header() {
  const heroRef = useRef<HTMLDivElement>(null);
  const eyebrowRef = useRef<HTMLParagraphElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const descRef = useRef<HTMLParagraphElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const badgesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from([eyebrowRef.current, titleRef.current, descRef.current], {
        y: 28,
        opacity: 0,
        duration: 0.75,
        stagger: 0.12,
        ease: 'power3.out',
        delay: 0.1,
      });
      gsap.from(statsRef.current, {
        y: 20,
        opacity: 0,
        duration: 0.6,
        ease: 'power3.out',
        delay: 0.45,
      });
      if (badgesRef.current) {
        gsap.from(Array.from(badgesRef.current.children), {
          y: 14,
          opacity: 0,
          duration: 0.5,
          stagger: 0.09,
          ease: 'power2.out',
          delay: 0.55,
        });
      }
    }, heroRef);
    return () => ctx.revert();
  }, []);

  return (
    <header className="mb-8 md:mb-10">
      <div className="flex justify-end items-center gap-3 mb-5">
        <Link
          href="/knowledge"
          className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:text-primary hover:border-primary/40 shadow-sm transition-all duration-200"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          Knowledge Base
        </Link>
        <UserNav />
      </div>

      <div ref={heroRef} className="relative mx-auto mb-6 max-w-4xl overflow-hidden rounded-2xl md:rounded-3xl bg-gradient-to-br from-[#0c5f58] via-[#0F766E] to-[#0d7a8a] p-7 md:p-10 text-white shadow-[0_20px_60px_-10px_rgba(15,118,110,0.45)]">
        {/* Ambient glow accents */}
        <div className="pointer-events-none absolute -top-16 -right-16 w-56 h-56 rounded-full bg-teal-300/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-10 -left-10 w-48 h-48 rounded-full bg-primary-light/15 blur-3xl" />

        <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="space-y-3 text-left">
            <p ref={eyebrowRef} className="text-xs uppercase tracking-[0.6em] text-white/60 font-medium">
              Guided decision support
            </p>
            <h1 ref={titleRef} className="text-3xl md:text-4xl font-bold tracking-tight">
              Next Best Action
            </h1>
            <p ref={descRef} className="text-sm md:text-[15px] text-white/80 max-w-lg leading-relaxed">
              A trauma-informed companion for caseworkers that surfaces immediate actions, client context, and longer-term development goals.
            </p>
          </div>
          <div ref={statsRef} className="shrink-0 text-left md:text-right">
            <p className="text-xs uppercase tracking-[0.4em] text-white/60">Confidence</p>
            <p className="text-5xl font-bold tabular-nums mt-1 leading-none">97%</p>
            <p className="text-xs text-white/55 mt-2">based on inputs &amp; urgency</p>
          </div>
        </div>

        <div ref={badgesRef} className="relative mt-7 flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-[0.4em] text-white/65">
          <span className="rounded-full border border-white/20 bg-white/10 px-4 py-2 backdrop-blur-sm">Case overview</span>
          <span className="rounded-full border border-white/20 bg-white/10 px-4 py-2 backdrop-blur-sm">Risk insight</span>
          <span className="rounded-full border border-white/20 bg-white/10 px-4 py-2 backdrop-blur-sm">Skill building</span>
        </div>
      </div>

      <p className="text-sm text-slate-500 max-w-3xl mx-auto px-4 text-center leading-relaxed">
        Navigate between structured case plans and professional development resources to keep every client interaction purposeful.
      </p>
    </header>
  );
}
