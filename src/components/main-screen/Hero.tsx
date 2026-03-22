"use client";

import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { MdOutlineArrowForwardIos } from "react-icons/md";
import { Button } from "@mantine/core";
import Link from "next/link";
import SlideFadeContainer from "../features/SlideFadeContainer";

const SLIDE_MS = 500;
const MAX_STAGGER_MS = 600;
const HOLD_MS = 2600;
const BUFFER_MS = 150;
const TOTAL_CYCLE_MS = SLIDE_MS + MAX_STAGGER_MS + HOLD_MS + BUFFER_MS;
const PAUSE_ON_HOVER = true;

interface HeroProps { }

const heroContent = [
  {
    id: 1,
    subtitle: "CARGO. TRANSPORT. LOGISTICS",
    title: "World Wide Shipping & Fast Solutions",
    description:
      "Your trusted partner in global logistics. We deliver excellence through innovative shipping solutions worldwide.",
    services: [
      "Road Freight",
      "Air Freight",
      "Ocean Freight",
      "Train Freight",
      "Drone Freight",
      "Send Gift",
    ],
    image: "/images/bgc.png",
    stats: [
      { number: "50K+", label: "Shipments" },
      { number: "150+", label: "Countries" },
      { number: "99.8%", label: "On-time" },
      { number: "24/7", label: "Support" },
    ],
  },
  {
    id: 2,
    subtitle: "DIGITAL LOGISTICS PLATFORM",
    title: "Smart Shipping Solutions",
    description:
      "Leveraging cutting-edge technology to optimize your supply chain with real-time tracking and insights.",
    services: [
      "Smart Tracking",
      "Instant Quotes",
      "Secure Payments",
      "24/7 Support",
      "Custom Solutions",
    ],
    image: "/images/bgc2.png",
    stats: [
      { number: "100%", label: "Digital" },
      { number: "Real-time", label: "Tracking" },
      { number: "Secure", label: "Payments" },
      { number: "API", label: "Integration" },
    ],
  },
  {
    id: 3,
    subtitle: "GLOBAL NETWORK",
    title: "Your Bridge to Worldwide Markets",
    description:
      "Expanding your business reach with our extensive international network and local expertise.",
    services: [
      "200+ Countries",
      "Local Experts",
      "Fast Customs",
      "Multi-modal",
      "Warehousing",
    ],
    image: "/images/bg3.jpg",
    stats: [
      { number: "Global", label: "Network" },
      { number: "Local", label: "Experts" },
      { number: "Fast", label: "Customs" },
      { number: "Multi", label: "Modal" },
    ],
  },
];

const preloadImage = (src: string) => {
  const img = new Image();
  img.src = src;
};

const Hero: React.FC<HeroProps> = () => {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [backgroundAttachment, setBackgroundAttachment] = useState<"fixed" | "scroll">("scroll");
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Only set client-side values after mount to prevent hydration mismatch
  useEffect(() => {
    setIsClient(true);
    const updateBackgroundAttachment = () => {
      setBackgroundAttachment(window.innerWidth >= 1024 ? "fixed" : "scroll");
    };
    updateBackgroundAttachment();
    window.addEventListener("resize", updateBackgroundAttachment);
    return () => window.removeEventListener("resize", updateBackgroundAttachment);
  }, []);

  const content = heroContent[index];
  const { subtitle, title, description, services, image, stats } = content;

  const nextIndex = useMemo(
    () => (index + 1) % heroContent.length,
    [index]
  );

  // Generate deterministic particle styles (same on server and client)
  const particleStyles = useMemo(() => {
    // Use a seeded random function for consistency
    const seededRandom = (seed: number) => {
      const x = Math.sin(seed) * 10000;
      return x - Math.floor(x);
    };

    return Array.from({ length: 6 }, (_, i) => {
      const seed = i * 1234.567; // Deterministic seed based on index
      return {
        width: `${seededRandom(seed) * 4 + 2}px`,
        height: `${seededRandom(seed + 1) * 4 + 2}px`,
        top: `${seededRandom(seed + 2) * 100}%`,
        left: `${seededRandom(seed + 3) * 100}%`,
        animationDuration: `${seededRandom(seed + 4) * 25 + 20}s`,
        animationDelay: `${seededRandom(seed + 5) * 5}s`,
        background: `rgba(77, 20, 140, ${seededRandom(seed + 6) * 0.3 + 0.1})`,
      };
    });
  }, []);

  useEffect(() => {
    preloadImage(heroContent[nextIndex].image);
  }, [nextIndex]);

  const clear = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const start = useCallback(() => {
    clear();
    intervalRef.current = setInterval(() => {
      setIndex((prev) => (prev + 1) % heroContent.length);
    }, TOTAL_CYCLE_MS);
  }, []);

  useEffect(() => {
    if (!paused) start();
    return clear;
  }, [paused, start]);

  useEffect(() => {
    const onVisibility = () => {
      if (document.hidden) {
        clear();
      } else if (!paused) {
        start();
      }
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, [paused, start]);

  const goTo = useCallback(
    (i: number) => {
      if (i === index) return;
      clear();
      setIndex(i);
      requestAnimationFrame(() => {
        if (!paused) start();
      });
    },
    [index, paused, start]
  );

  const hoverHandlers = PAUSE_ON_HOVER
    ? {
      onMouseEnter: () => setPaused(true),
      onMouseLeave: () => setPaused(false),
      onTouchStart: () => setPaused(true),
      onTouchEnd: () => setPaused(false),
    }
    : {};

  return (
    <div
      className="relative min-h-screen overflow-hidden font-poppins"
      {...hoverHandlers}
    >
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('/images/tracking.jpg')",
          backgroundAttachment: isClient ? backgroundAttachment : "scroll",
          backgroundSize: "cover",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/70 via-[var(--bg-secondary)]/60 to-slate-800/70"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
        <div className="absolute inset-0 bg-[url('/images/shape/grid-01.svg')] opacity-[0.08]"></div>
      </div>

      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10 z-0">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent" />
      </div>

      {/* Decorative gradient orbs */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-[var(--accent-primary-on-dark)]/20 rounded-full blur-3xl animate-pulse z-0"></div>
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000 z-0"></div>

      {/* Animated Background Elements */}
      {isClient && (
        <div className="absolute inset-0 pointer-events-none z-0">
          <div className="particles">
            {particleStyles.map((style, i) => (
              <div
                key={i}
                className="particle"
                style={style}
              />
            ))}
          </div>
        </div>
      )}

      {/* Main Content Container */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-h-screen flex items-center">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center w-full py-12 lg:py-0">
          {/* Text Content - Left Side */}
          <div className="text-left space-y-5">
            {/* Subtitle */}
            <SlideFadeContainer
              key={`subtitle-${content.id}`}
              direction="top"
              delay={0.1}
              mode="controlled"
              active={true}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--accent-primary-on-dark)]/20 backdrop-blur-sm rounded-full border border-[var(--accent-primary-on-dark)]/35 mb-3">
                <div className="w-2 h-2 bg-[var(--accent-primary-on-dark)] rounded-full animate-pulse"></div>
                <p className="text-[var(--accent-primary-on-dark)] font-bold text-xs tracking-[0.25em] uppercase font-poppins">
                  {subtitle}
                </p>
              </div>
            </SlideFadeContainer>

            {/* Main Title */}
            <SlideFadeContainer
              key={`title-${content.id}`}
              direction="bottom"
              delay={0.2}
              mode="controlled"
              active={true}
            >
              <h1 className="text-white text-3xl sm:text-4xl md:text-5xl lg:text-5xl xl:text-6xl font-bold leading-tight mb-3 font-poppins tracking-tight">
                {title.split(' ').slice(0, -1).join(' ')}{' '}
                <span
                  style={{ color: "var(--accent-primary-on-dark)" }}
                  className="bg-gradient-to-r from-[var(--accent-primary-on-dark)] via-[var(--accent-secondary-on-dark)] to-[var(--accent-primary-on-dark-hover)] bg-clip-text text-transparent"
                >
                  {title.split(' ').slice(-1)[0]}
                </span>
              </h1>
            </SlideFadeContainer>

            {/* Description */}
            <SlideFadeContainer
              key={`description-${content.id}`}
              direction="bottom"
              delay={0.3}
              mode="controlled"
              active={true}
            >
              <p className="text-gray-200 text-base sm:text-lg leading-relaxed max-w-2xl font-poppins">
                {description}
              </p>
            </SlideFadeContainer>

            {/* Services Tags */}
            <SlideFadeContainer direction="bottom" delay={0.4} mode="controlled" active={true}>
              <div className="flex flex-wrap gap-2 mt-6">
                {services.map((service, idx) => (
                  <span
                    key={`${content.id}-svc-${idx}`}
                    className="px-3 py-1.5 bg-white/10 backdrop-blur-md text-gray-100 text-xs font-semibold rounded-full border border-white/20 hover:bg-[var(--brand-primary)] hover:text-white hover:border-[var(--brand-primary)] hover:scale-105 transition-all duration-300 cursor-default shadow-lg font-poppins"
                  >
                    {service}
                  </span>
                ))}
              </div>
            </SlideFadeContainer>

            {/* Stats Grid - Mobile & Tablet */}
            <SlideFadeContainer direction="bottom" delay={0.5} mode="controlled" active={true}>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 lg:hidden">
                {stats.map((stat, idx) => (
                  <div
                    key={`${content.id}-mstat-${idx}`}
                    className="p-3 bg-black/40 backdrop-blur-md rounded-xl border border-white/20 text-center hover:bg-black/60 hover:scale-105 transition-all duration-300 shadow-lg"
                  >
                    <div className="text-xl font-bold text-[var(--accent-primary-on-dark)] font-poppins">
                      {stat.number}
                    </div>
                    <div className="text-gray-200 text-[10px] mt-1 font-semibold uppercase tracking-wide font-poppins">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </SlideFadeContainer>

            {/* CTA Buttons */}
            <SlideFadeContainer direction="bottom" delay={0.6} mode="controlled" active={true}>
              <div className="flex flex-col sm:flex-row gap-3 mt-8">
                <Link href="/tracking">
                  <Button
                    rightSection={<MdOutlineArrowForwardIos size={16} />}
                    size="md"
                    color="brandOrange"
                    className="bg-[var(--brand-secondary)] hover:bg-[var(--brand-secondary)]/90 font-bold text-white hover:shadow-2xl transition-all duration-300 hover:scale-105 px-6 py-5 text-sm font-poppins"
                  >
                    Track Your Parcel
                  </Button>
                </Link>
                <Link href="/services">
                  <Button
                    rightSection={<MdOutlineArrowForwardIos size={16} />}
                    size="md"
                    variant="outline"
                    className="font-bold border-2 border-white/40 text-white hover:bg-white/10 hover:border-white/60 backdrop-blur-sm transition-all duration-300 hover:scale-105 px-6 py-5 text-sm font-poppins"
                  >
                    Explore Services
                  </Button>
                </Link>
              </div>
            </SlideFadeContainer>
          </div>

          {/* Image Content - Right Side - ENHANCED */}
          <div className="relative hidden lg:block">
            <SlideFadeContainer
              key={`image-${content.id}`}
              direction="right"
              delay={0.4}
              mode="controlled"
              active={true}
            >
              <div className="relative h-full flex items-center justify-center">
                {/* Main Image Container with enhanced styling */}
                <div className="relative z-10 w-full max-w-lg group">
                  {/* Outer glow effect */}
                  <div className="absolute -inset-4 bg-gradient-to-br from-[var(--accent-primary-on-dark)]/25 via-[var(--brand-secondary)]/12 to-blue-500/20 rounded-3xl blur-3xl opacity-70 group-hover:opacity-85 transition-opacity duration-700"></div>

                  {/* Border gradient with animation */}
                  <div className="absolute -inset-1 bg-gradient-to-br from-[var(--accent-primary-on-dark)] via-[var(--brand-secondary)] to-blue-500 rounded-3xl opacity-45 group-hover:opacity-60 transition-opacity duration-500 animate-gradient-shift"></div>

                  {/* Image wrapper with glass effect */}
                  <div className="relative bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl overflow-hidden group-hover:border-white/30 transition-all duration-500">
                    {/* Image with better aspect ratio and object fit */}
                    <div className="relative aspect-[4/3] overflow-hidden">
                      <img
                        src={image}
                        alt={content.title}
                        className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out"
                        loading="eager"
                      />

                      {/* Gradient overlay for better image blending */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-50"></div>

                      {/* Shine effect on hover */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out"></div>
                    </div>
                  </div>

                  {/* Corner accent decorations */}
                  <div className="absolute -top-3 -right-3 w-20 h-20 bg-gradient-to-br from-[var(--accent-primary-on-dark)] to-[var(--brand-secondary)] rounded-2xl opacity-45 blur-xl group-hover:opacity-55 transition-opacity duration-500"></div>
                  <div className="absolute -bottom-3 -left-3 w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl opacity-25 blur-xl group-hover:opacity-35 transition-opacity duration-500"></div>
                </div>

                {/* Floating decorative elements */}
                <div className="absolute -top-8 -right-8 w-32 h-32 bg-gradient-to-br from-[var(--accent-primary-on-dark)]/45 to-[var(--brand-secondary)]/30 rounded-full animate-pulse shadow-2xl shadow-[var(--accent-primary-on-dark)]/35 z-0 blur-md"></div>
                <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-gradient-to-br from-blue-500/30 to-purple-500/20 rounded-full animate-pulse delay-1000 shadow-2xl shadow-blue-500/20 z-0 blur-md"></div>

                {/* Small accent dots */}
                <div className="absolute top-1/4 -left-6 w-4 h-4 bg-[var(--bg-general)] rounded-full animate-pulse shadow-lg shadow-[var(--bg-general)]/50 blur-[1px]"></div>
                <div className="absolute top-1/3 -right-5 w-3 h-3 bg-[var(--brand-secondary)] rounded-full animate-pulse delay-300 shadow-lg shadow-[var(--brand-secondary)]/50 blur-[1px]"></div>
                <div className="absolute bottom-1/3 -right-6 w-2 h-2 bg-blue-400 rounded-full animate-pulse delay-700"></div>

                {/* Stats Grid - Desktop - REDESIGNED */}
                <div className="absolute -bottom-12 left-0 right-0 grid grid-cols-4 gap-3 z-20 px-4">
                  {stats.map((stat, idx) => (
                    <div
                      key={`${content.id}-dstat-${idx}`}
                      className="group/stat relative"
                    >
                      {/* Background with enhanced effects */}
                      <div className="relative p-4 bg-gradient-to-br from-black/80 via-black/70 to-black/60 backdrop-blur-2xl rounded-2xl border border-white/30 text-center hover:border-[var(--bg-general)]/60 transition-all duration-500 shadow-xl hover:shadow-2xl hover:shadow-[var(--bg-general)]/20 hover:-translate-y-1">
                        {/* Glow effect background */}
                        <div className="absolute inset-0 bg-gradient-to-br from-[var(--brand-primary)]/0 via-[var(--brand-primary)]/0 to-[var(--brand-primary)]/0 group-hover/stat:from-[var(--brand-primary)]/15 group-hover/stat:via-[var(--brand-secondary)]/10 group-hover/stat:to-transparent rounded-2xl transition-all duration-500"></div>

                        {/* Content */}
                        <div className="relative">
                          <div
                            style={{ color: "var(--accent-primary-on-dark)" }}
                            className="text-2xl font-extrabold bg-gradient-to-r from-[var(--accent-primary-on-dark)] via-[var(--accent-secondary-on-dark)] to-[var(--accent-primary-on-dark-hover)] bg-clip-text text-transparent font-poppins group-hover/stat:scale-110 transition-transform duration-300 bg-[length:200%_auto] animate-gradient-text"
                          >
                            {stat.number}
                          </div>
                          <div className="text-gray-300 text-[10px] mt-1.5 font-bold uppercase tracking-wider font-poppins group-hover/stat:text-white transition-colors duration-300">
                            {stat.label}
                          </div>
                        </div>

                        {/* Bottom accent line */}
                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-1 bg-gradient-to-r from-transparent via-[var(--bg-general)] to-transparent group-hover/stat:w-full transition-all duration-500 rounded-full"></div>

                        {/* Corner highlight */}
                        <div className="absolute top-0 right-0 w-0 h-0 border-t-0 border-r-0 border-[var(--bg-general)] group-hover/stat:border-t-8 group-hover/stat:border-r-8 transition-all duration-300 rounded-tr-2xl opacity-50"></div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Rotating decorative rings */}
                <div className="absolute top-1/2 -right-16 w-24 h-24 border-2 border-[var(--bg-general)]/20 rounded-full animate-spin-slow"></div>
                <div className="absolute top-1/2 -right-14 w-20 h-20 border-2 border-[var(--brand-secondary)]/20 rounded-full animate-spin-slow-reverse"></div>
                <div className="absolute bottom-1/4 -left-16 w-20 h-20 border-2 border-blue-400/20 rounded-full animate-spin-slow"></div>
              </div>
            </SlideFadeContainer>
          </div>
        </div>

        {/* Content Indicator Dots */}
        <div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-20"
          role="tablist"
          aria-label="Hero slides"
        >
          {heroContent.map((_, i) => {
            const active = i === index;
            return (
              <button
                key={`dot-${i}`}
                role="tab"
                aria-selected={active}
                aria-controls={`hero-panel-${i}`}
                onClick={() => goTo(i)}
                className={`h-2 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[var(--bg-general)] ${active
                  ? "bg-[var(--bg-general)] w-8"
                  : "bg-gray-400 w-2 hover:bg-[var(--bg-general)]/70"
                  }`}
                title={`Go to slide ${i + 1}`}
              />
            );
          })}
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 right-8 hidden lg:flex flex-col items-center gap-2">
          <span className="text-xs text-gray-400 rotate-90 origin-center whitespace-nowrap -mr-4 font-poppins">
            Scroll Down
          </span>
          <div className="w-px h-10 bg-gradient-to-b from-gray-400 to-transparent" />
        </div>
      </div>

      <style jsx>{`
        @keyframes gradient-shift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        
        @keyframes gradient-text {
          0%, 100% { background-position: 0% center; }
          50% { background-position: 200% center; }
        }
        
        .animate-gradient-shift {
          background-size: 200% 200%;
          animation: gradient-shift 3s ease infinite;
        }
        
        .animate-gradient-text {
          animation: gradient-text 3s ease infinite;
        }
        
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @keyframes spin-slow-reverse {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }
        
        .animate-spin-slow {
          animation: spin-slow 20s linear infinite;
        }
        
        .animate-spin-slow-reverse {
          animation: spin-slow-reverse 25s linear infinite;
        }
        
        .particle {
          position: absolute;
          border-radius: 50%;
          pointer-events: none;
          opacity: 0.6;
          animation: float 20s infinite ease-in-out;
        }
        
        @keyframes float {
          0%, 100% {
            transform: translateY(0) translateX(0);
            opacity: 0.6;
          }
          25% {
            transform: translateY(-20px) translateX(10px);
            opacity: 0.8;
          }
          50% {
            transform: translateY(-40px) translateX(-10px);
            opacity: 0.4;
          }
          75% {
            transform: translateY(-20px) translateX(15px);
            opacity: 0.7;
          }
        }
      `}</style>
    </div>
  );
};

export default Hero;