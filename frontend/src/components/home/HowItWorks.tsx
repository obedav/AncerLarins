'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useScrollReveal } from '@/hooks/useScrollReveal';

const STEPS = [
  {
    step: '01',
    title: 'Search',
    desc: 'Filter by area, property type, budget, and more to find listings that match what you need.',
    icon: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z',
    image: '/images/home/search-property.jpg',
  },
  {
    step: '02',
    title: 'Explore',
    desc: 'See detailed photos, neighborhood scores, AncerEstimate valuations, and real community reviews.',
    icon: 'M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z',
    image: '/images/home/explore-property.jpg',
  },
  {
    step: '03',
    title: 'Connect',
    desc: 'Found a place you like? Tap the WhatsApp button on any listing to message the agent directly and book a viewing.',
    icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z',
    image: '/images/home/connect-agent.jpg',
  },
  {
    step: '04',
    title: 'Decide with Confidence',
    desc: 'Compare asking prices against AncerEstimate valuations, check neighborhood scores, and read community reviews before committing.',
    icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
    image: '/images/home/cta-background.jpg',
  },
];

export default function HowItWorks() {
  const [activeStep, setActiveStep] = useState(0);
  const { ref, isVisible } = useScrollReveal({ threshold: 0.15 });
  const [stepRevealed, setStepRevealed] = useState<boolean[]>([false, false, false, false]);

  useEffect(() => {
    if (!isVisible) return;
    const timers = STEPS.map((_, i) =>
      setTimeout(() => {
        setStepRevealed(prev => {
          const next = [...prev];
          next[i] = true;
          return next;
        });
        setActiveStep(i);
      }, i * 400),
    );
    return () => timers.forEach(clearTimeout);
  }, [isVisible]);

  return (
    <section className="py-16 md:py-24 bg-surface" aria-label="How it works" ref={ref}>
      <div className="container-app">
        {/* Header */}
        <div className="reveal-up mb-12 md:mb-16" data-visible={isVisible}>
          <span className="text-xs font-bold text-accent-dark tracking-widest uppercase">How It Works</span>
          <h2 className="text-2xl md:text-3xl font-bold text-text-primary mt-2">
            From Search to Keys, Step by Step
          </h2>
          <p className="text-text-muted mt-2 max-w-lg">
            Four steps to finding and securing your next property in Lagos
          </p>
        </div>

        {/* Desktop: Split-screen timeline */}
        <div className="hidden lg:grid lg:grid-cols-5 gap-8 items-start">
          {/* Left: Photo */}
          <div className="col-span-2 sticky top-32">
            <div className="relative aspect-[4/5] rounded-2xl overflow-hidden bg-border/20">
              {STEPS.map((step, i) => (
                <Image
                  key={step.step}
                  src={step.image}
                  alt={step.title}
                  fill
                  className={`object-cover transition-opacity duration-700 ${
                    i === activeStep ? 'opacity-100' : 'opacity-0'
                  }`}
                  sizes="(min-width: 1024px) 40vw, 0vw"
                  loading="lazy"
                />
              ))}
              {/* Step counter overlay */}
              <div className="absolute bottom-4 left-4 bg-primary/80 backdrop-blur-sm text-white px-4 py-2 rounded-xl">
                <span className="text-accent-dark font-bold">Step {STEPS[activeStep].step}</span>
                <span className="text-white/60 mx-2">/</span>
                <span className="text-white/60">04</span>
              </div>
            </div>
          </div>

          {/* Right: Timeline */}
          <div className="col-span-3 relative pl-8">
            {/* Gold connecting line */}
            <div className="absolute left-0 top-0 bottom-0 w-px bg-border">
              <div
                className="timeline-line w-full bg-accent-dark"
                data-filled={stepRevealed[STEPS.length - 1]}
                style={{ height: '100%' }}
              />
            </div>

            <div className="space-y-12">
              {STEPS.map((step, i) => (
                <div
                  key={step.step}
                  className={`relative transition-all duration-600 ${
                    stepRevealed[i]
                      ? 'opacity-100 translate-x-0'
                      : 'opacity-0 translate-x-8'
                  }`}
                  onMouseEnter={() => setActiveStep(i)}
                >
                  {/* Timeline node */}
                  <div
                    className={`absolute -left-8 top-1 w-4 h-4 rounded-full border-2 transition-all duration-300 -translate-x-1/2 ${
                      i === activeStep
                        ? 'bg-accent-dark border-accent-dark scale-125'
                        : i <= activeStep
                          ? 'bg-accent-dark/60 border-accent-dark/60'
                          : 'bg-surface border-border'
                    }`}
                  />

                  <div
                    className={`p-6 rounded-2xl border transition-all duration-300 cursor-pointer ${
                      i === activeStep
                        ? 'border-accent/40 bg-accent-dark/5 shadow-lg'
                        : 'border-border hover:border-accent/20'
                    }`}
                    onClick={() => setActiveStep(i)}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                        i === activeStep ? 'bg-accent-dark/15' : 'bg-accent-dark/10'
                      }`}>
                        <svg className="w-5 h-5 text-accent-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={step.icon} />
                        </svg>
                      </div>
                      <span className="text-xs font-bold text-accent-dark tracking-widest uppercase">
                        Step {step.step}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-text-primary mb-2">{step.title}</h3>
                    <p className="text-text-muted text-sm leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Mobile: Photo at top + vertical list */}
        <div className="lg:hidden">
          <div className="relative aspect-video rounded-2xl overflow-hidden mb-8 bg-border/20">
            <Image
              src={STEPS[0].image}
              alt="How AncerLarins works"
              fill
              className="object-cover"
              sizes="100vw"
              loading="lazy"
            />
          </div>

          <div className="space-y-4">
            {STEPS.map((step, i) => (
              <div
                key={step.step}
                className={`reveal-up stagger-${i + 1}`}
                data-visible={isVisible}
              >
                <div className="flex gap-4 p-5 rounded-2xl border border-border bg-background hover:border-accent/30 hover:shadow-md transition-all">
                  <div className="w-10 h-10 rounded-xl bg-accent-dark/10 flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5 text-accent-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={step.icon} />
                    </svg>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-accent-dark tracking-widest uppercase">Step {step.step}</span>
                    <h3 className="text-base font-bold text-text-primary">{step.title}</h3>
                    <p className="text-text-muted text-sm leading-relaxed mt-1">{step.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
