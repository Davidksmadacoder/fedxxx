"use client";

import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
  useCallback,
} from "react";
import { MdOutlineFormatQuote, MdStar } from "react-icons/md";
import SlideFadeContainer from "../features/SlideFadeContainer";
import { api } from "@/api/axios";
import CustomLoader from "../features/CustomLoader";

type Testimonial = {
  _id: string;
  name: string;
  role: string;
  company?: string;
  image?: string;
  rating: number;
  comment: string;
};

const AUTOPLAY_MS = 5000;
const PROGRESS_STEP_MS = 100;

const defaultTestimonials: Testimonial[] = [
  {
    _id: "1",
    name: "David Malan",
    role: "Marketing Manager",
    company: "TechCorp Inc.",
    rating: 5,
    comment:
      "At Fedx Global Shipping, we are more than just a transportation company — we're your trusted partner in navigating the complexities of logistics and supply chain management.",
  },
  {
    _id: "2",
    name: "Sarah Johnson",
    role: "Operations Director",
    company: "Global Trade Ltd.",
    rating: 5,
    comment:
      "Working with Fedx Global Shipping has been a game-changer. Reliable ETAs, proactive updates, and a team that truly owns outcomes.",
  },
  {
    _id: "3",
    name: "Michael Chen",
    role: "Supply Chain Manager",
    company: "Retail Solutions Co.",
    rating: 5,
    comment:
      "They transformed our supply chain. Faster customs, fewer exceptions, and real-time visibility that our team depends on daily.",
  },
  {
    _id: "4",
    name: "Amina Yusuf",
    role: "Logistics Lead",
    company: "PetroCore Energy",
    rating: 5,
    comment:
      "From tender to delivery, Fedx Global Shipping's coordination is world-class. Their project cargo handling saved us weeks.",
  },
  {
    _id: "5",
    name: "Lucas Andrade",
    role: "Head of Commerce",
    company: "Nova Retail",
    rating: 5,
    comment:
      "We plugged their e-commerce logistics into our storefront and returns dropped by 30%. Customers love the speed.",
  },
  {
    _id: "6",
    name: "Elena Petrova",
    role: "Import/Export Manager",
    company: "Baltic Goods",
    rating: 5,
    comment:
      "Customs paperwork used to be the bottleneck. Not anymore. Their brokerage team is meticulous and fast.",
  },
  {
    _id: "7",
    name: "James Wilson",
    role: "CEO",
    company: "Global Shipping Co.",
    rating: 5,
    comment:
      "Outstanding service and reliability. Fedx Global Shipping has become an integral part of our operations.",
  },
  {
    _id: "8",
    name: "Maria Garcia",
    role: "Logistics Coordinator",
    company: "International Trade",
    rating: 5,
    comment:
      "Professional, efficient, and always on time. Highly recommend their services.",
  },
  {
    _id: "9",
    name: "Robert Kim",
    role: "Operations Manager",
    company: "Tech Solutions",
    rating: 5,
    comment:
      "Their tracking system is excellent. We always know where our shipments are.",
  },
  {
    _id: "10",
    name: "Lisa Anderson",
    role: "Supply Chain Director",
    company: "Retail Giant",
    rating: 5,
    comment:
      "Fedx Global Shipping has revolutionized how we handle logistics. Exceptional service quality.",
  },
  {
    _id: "11",
    name: "Ahmed Hassan",
    role: "Import Manager",
    company: "Middle East Trading",
    rating: 5,
    comment:
      "Best logistics partner we've worked with. Fast, reliable, and cost-effective.",
  },
  {
    _id: "12",
    name: "Sophie Martin",
    role: "E-commerce Manager",
    company: "Online Retailer",
    rating: 5,
    comment:
      "Their e-commerce fulfillment services are top-notch. Our customers love the fast delivery.",
  },
  {
    _id: "13",
    name: "Carlos Rodriguez",
    role: "Fleet Manager",
    company: "Transport Solutions",
    rating: 5,
    comment:
      "Professional team and excellent customer support. They handle everything seamlessly.",
  },
  {
    _id: "14",
    name: "Yuki Tanaka",
    role: "International Trade Specialist",
    company: "Asia Pacific Trading",
    rating: 5,
    comment:
      "Outstanding international shipping services. They make cross-border trade easy.",
  },
  {
    _id: "15",
    name: "Emma Thompson",
    role: "Warehouse Manager",
    company: "Distribution Center",
    rating: 5,
    comment:
      "Their warehousing solutions are excellent. Secure, organized, and efficient.",
  },
  {
    _id: "16",
    name: "Mohammed Ali",
    role: "Business Owner",
    company: "Small Business Inc.",
    rating: 5,
    comment:
      "Perfect for small businesses. Affordable rates and great service.",
  },
  {
    _id: "17",
    name: "Jennifer Lee",
    role: "Procurement Manager",
    company: "Manufacturing Corp",
    rating: 5,
    comment:
      "Reliable delivery times and excellent communication throughout the process.",
  },
  {
    _id: "18",
    name: "Thomas Brown",
    role: "Logistics Analyst",
    company: "Supply Chain Solutions",
    rating: 5,
    comment: "Data-driven approach and real-time tracking make them stand out.",
  },
  {
    _id: "19",
    name: "Priya Sharma",
    role: "Operations Lead",
    company: "Global Imports",
    rating: 5,
    comment:
      "Their customs clearance services saved us time and money. Highly professional.",
  },
  {
    _id: "20",
    name: "Alexandre Dubois",
    role: "Distribution Manager",
    company: "European Logistics",
    rating: 5,
    comment:
      "Excellent service across all European routes. Fast and reliable delivery.",
  },
  {
    _id: "21",
    name: "Rachel Green",
    role: "Customer Success Manager",
    company: "Tech Startup",
    rating: 5,
    comment:
      "Their express delivery options are perfect for urgent shipments. Always delivers on time.",
  },
  {
    _id: "22",
    name: "Daniel White",
    role: "Supply Chain Consultant",
    company: "Consulting Firm",
    rating: 5,
    comment:
      "Fedx Global Shipping sets the standard for logistics excellence. Impressive operations.",
  },
];

const Testimonials: React.FC = () => {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [testimonials, setTestimonials] =
    useState<Testimonial[]>(defaultTestimonials);
  const [loading, setLoading] = useState(true);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const progressRef = useRef<number>(0);
  const [progress, setProgress] = useState(0);

  const prefersReducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const res = await api.get("/testimonial?active=true");
        const fetched = res.data.testimonials || [];
        // Combine API testimonials with defaults to ensure we have at least 20
        const combined = [...fetched, ...defaultTestimonials].slice(0, 25);
        setTestimonials(combined);
      } catch (error) {
        console.error("Failed to load testimonials, using defaults");
        setTestimonials(defaultTestimonials);
      } finally {
        setLoading(false);
      }
    };
    fetchTestimonials();
  }, []);

  const length = testimonials.length;

  const goTo = useCallback(
    (index: number) => {
      setActive(index % length);
      progressRef.current = 0;
      setProgress(0);
    },
    [length],
  );

  const next = useCallback(() => {
    setActive((prev) => (prev + 1) % length);
    progressRef.current = 0;
    setProgress(0);
  }, [length]);

  useEffect(() => {
    if (prefersReducedMotion || length === 0) return;

    const tick = () => {
      if (paused) return;
      progressRef.current += (PROGRESS_STEP_MS / AUTOPLAY_MS) * 100;
      const clamped = Math.min(progressRef.current, 100);
      setProgress(clamped);
      if (clamped >= 100) next();
    };

    timerRef.current = setInterval(tick, PROGRESS_STEP_MS);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [paused, next, prefersReducedMotion, length]);

  useEffect(() => {
    const onVisibility = () => setPaused(document.hidden || paused);
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, [paused]);

  if (loading) {
    return (
      <section className="relative py-20 lg:py-28 bg-gradient-to-br from-slate-50 to-gray-100 dark:from-slate-900 dark:to-gray-900">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <CustomLoader loading={true} />
        </div>
      </section>
    );
  }

  const current = testimonials[active];

  return (
    <section
      className="relative py-20 lg:py-28 bg-gradient-to-br from-slate-50 to-gray-100 dark:from-slate-900 dark:to-gray-900 overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="absolute top-0 left-0 w-48 sm:w-72 h-48 sm:h-72 bg-[var(--bg-general-lighter)] rounded-full -translate-x-24 sm:-translate-x-36 -translate-y-24 sm:-translate-y-36 opacity-50" />
      <div className="absolute bottom-0 right-0 w-64 sm:w-96 h-64 sm:h-96 bg-[var(--bg-general-lighter)] rounded-full translate-x-32 sm:translate-x-48 translate-y-32 sm:translate-y-48 opacity-30" />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <SlideFadeContainer direction="top" delay={0.1}>
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Testimonials
            </h2>
          </SlideFadeContainer>
          <SlideFadeContainer direction="top" delay={0.2}>
            <div className="flex items-center justify-center gap-4 mb-6">
              <div className="w-8 h-0.5 bg-[var(--bg-general)]" />
              <h3 className="text-xl lg:text-2xl text-gray-600 dark:text-gray-300 font-semibold">
                Over 30,000 People Trusted Us
              </h3>
              <div className="w-8 h-0.5 bg-[var(--bg-general)]" />
            </div>
          </SlideFadeContainer>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <SlideFadeContainer key={current._id} direction="left" delay={0.1}>
            <div
              className="relative bg-white dark:bg-gray-800 rounded-3xl p-8 lg:p-10 border border-gray-100 dark:border-gray-700"
              aria-live="polite"
            >
              <div className="absolute -top-4 -left-4 w-12 h-12 bg-[var(--bg-general)] text-white rounded-2xl flex items-center justify-center">
                <MdOutlineFormatQuote size={24} />
              </div>
              <div className="flex gap-1 mb-6">
                {[...Array(current.rating)].map((_, i) => (
                  <MdStar
                    key={i}
                    className="text-yellow-400 fill-current"
                    size={20}
                  />
                ))}
              </div>
              <blockquote className="text-lg lg:text-xl text-gray-700 dark:text-gray-300 leading-relaxed mb-8 italic">
                "{current.comment}"
              </blockquote>
              <div className="border-t border-gray-200 dark:border-gray-600 pt-6">
                <div className="flex items-center gap-4">
                  {current.image && (
                    <img
                      src={current.image}
                      alt={current.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  )}
                  <div>
                    <div className="font-bold text-gray-900 dark:text-white text-lg">
                      {current.name}
                    </div>
                    <div className="text-gray-600 dark:text-gray-400 text-sm">
                      {current.role}
                    </div>
                    {current.company && (
                      <div className="text-[var(--bg-general)] text-sm font-medium">
                        {current.company}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              {!prefersReducedMotion && (
                <div className="mt-8 h-1.5 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[var(--bg-general)] transition-[width] duration-100 ease-linear"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              )}
            </div>
          </SlideFadeContainer>

          <div className="space-y-8">
            <SlideFadeContainer direction="right" delay={0.3}>
              <div className="grid grid-cols-2 gap-6">
                {[
                  { number: "30K+", label: "Happy Clients" },
                  { number: "98%", label: "Satisfaction Rate" },
                  { number: "24/7", label: "Support" },
                  { number: "150+", label: "Countries" },
                ].map((stat, index) => (
                  <div
                    key={index}
                    className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 text-center hover:shadow-xl transition-all duration-300 hover:scale-105"
                  >
                    <div className="text-2xl lg:text-3xl font-bold text-[var(--bg-general)] mb-2">
                      {stat.number}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-300 font-medium">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </SlideFadeContainer>
            <SlideFadeContainer direction="right" delay={0.45}>
              <div className="flex items-center justify-between bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700">
                <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                  {active + 1} / {length}
                </span>
                <span className="text-xs text-gray-400">
                  {paused ? "Paused" : "Auto-sliding"}
                </span>
              </div>
            </SlideFadeContainer>
          </div>
        </div>

        <SlideFadeContainer direction="bottom" delay={0.6}>
          <div
            className="flex justify-center gap-3 mt-12"
            role="tablist"
            aria-label="Testimonials"
          >
            {testimonials.slice(0, 10).map((t, index) => {
              const isActive = index === active;
              return (
                <button
                  key={t._id}
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => goTo(index)}
                  onFocus={() => setPaused(true)}
                  onBlur={() => setPaused(false)}
                  className={`h-3 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[var(--bg-general)] ${
                    isActive
                      ? "bg-[var(--bg-general)] w-8"
                      : "bg-gray-300 dark:bg-gray-600 w-3 hover:bg-[var(--bg-general)]"
                  }`}
                  title={`Show testimonial ${index + 1}`}
                />
              );
            })}
          </div>
        </SlideFadeContainer>
      </div>
    </section>
  );
};

export default Testimonials;
