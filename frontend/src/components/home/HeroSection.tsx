'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function HeroSection() {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section className="relative w-full overflow-hidden bg-primary -mt-20" aria-label="Hero">
      <div className="mx-auto w-full max-w-[1440px]">
        <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[100dvh]">
          {/* Left: Text Content */}
          <div className="relative flex flex-col justify-center px-6 sm:px-10 lg:px-16 xl:px-20 pt-28 pb-16 lg:pt-32 lg:pb-24">
            {/* Subtle background texture */}
            <div
              className="absolute inset-0 pointer-events-none opacity-[0.03]"
              style={{
                backgroundImage:
                  'radial-gradient(circle, rgba(255,255,255,0.12) 1px, transparent 1px)',
                backgroundSize: '3px 3px',
              }}
            />

            {/* Ambient glow */}
            <div
              className="absolute -top-20 -left-20 w-[400px] h-[400px] rounded-full pointer-events-none opacity-20 blur-[120px]"
              style={{ background: 'radial-gradient(circle, rgba(201,168,76,0.25), transparent 70%)' }}
            />

            <div className="relative z-10">
              {/* Headline */}
              <h1
                className="font-playfair text-4xl sm:text-5xl lg:text-[56px] xl:text-[64px] font-bold leading-[1.1] text-white mb-6"
                style={{
                  opacity: loaded ? 1 : 0,
                  transform: loaded ? 'translateY(0)' : 'translateY(24px)',
                  transition: 'opacity 0.7s ease-out 0.2s, transform 0.7s ease-out 0.2s',
                }}
              >
                Your next home<br />
                shouldn&apos;t be found.<br />
                It should be <span className="text-accent">curated.</span>
              </h1>

              {/* Subtitle */}
              <p
                className="text-white/50 text-base lg:text-lg leading-relaxed max-w-md mb-8"
                style={{
                  opacity: loaded ? 1 : 0,
                  transform: loaded ? 'translateY(0)' : 'translateY(24px)',
                  transition: 'opacity 0.7s ease-out 0.4s, transform 0.7s ease-out 0.4s',
                }}
              >
                Private viewings of Lagos&apos;s most extraordinary residences,
                arranged exclusively for you by our concierge team.
              </p>

              {/* CTA Buttons */}
              <div
                className="flex items-center gap-5"
                style={{
                  opacity: loaded ? 1 : 0,
                  transform: loaded ? 'translateY(0)' : 'translateY(24px)',
                  transition: 'opacity 0.7s ease-out 0.6s, transform 0.7s ease-out 0.6s',
                }}
              >
                <Link
                  href="/properties"
                  className="bg-accent hover:bg-accent-dark text-primary px-7 py-3.5 rounded-full font-semibold text-sm uppercase tracking-wider transition-colors"
                >
                  Get in Touch
                </Link>

                <Link
                  href="#how-it-works"
                  className="flex items-center gap-3 group"
                >
                  <span className="w-12 h-12 rounded-full border-2 border-accent/40 flex items-center justify-center group-hover:border-accent transition-colors">
                    <svg className="w-4 h-4 text-accent ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </span>
                  <span className="text-white/70 text-sm font-medium group-hover:text-white transition-colors uppercase tracking-wider">
                    How It Works
                  </span>
                </Link>
              </div>
            </div>
          </div>

          {/* Right: Hero Image */}
          <div className="relative hidden lg:block">
            <div
              className="absolute inset-0"
              style={{
                opacity: loaded ? 1 : 0,
                transition: 'opacity 1s ease-out 0.3s',
              }}
            >
              <Image
                src="/images/neighborhoods/lekki.jpg"
                alt="Luxury property in Lekki, Lagos"
                fill
                className="object-cover"
                priority
                quality={85}
                sizes="50vw"
              />
              {/* Left edge fade into dark bg */}
              <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-primary to-transparent" />
              {/* Bottom fade */}
              <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-primary to-transparent" />
            </div>

            {/* Gold corner accent frame */}
            <div className="absolute top-28 right-8 w-32 h-32 border-t-2 border-r-2 border-accent/30 rounded-tr-3xl pointer-events-none" />
            <div className="absolute bottom-8 left-8 w-32 h-32 border-b-2 border-l-2 border-accent/30 rounded-bl-3xl pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Mobile hero image */}
      <div className="lg:hidden relative h-64 sm:h-80">
        <Image
          src="/images/neighborhoods/lekki.jpg"
          alt="Luxury property in Lekki, Lagos"
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/40 to-transparent" />
      </div>
    </section>
  );
}
