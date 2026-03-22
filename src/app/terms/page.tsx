"use client";

import Layout1 from "@/components/layout/Layout1";
import { Button } from "@mantine/core";
import {
  MdGavel,
  MdSecurity,
  MdPayment,
  MdDescription,
  MdWarning,
  MdContactMail,
  MdCheckCircle,
} from "react-icons/md";
import SlideFadeContainer from "@/components/features/SlideFadeContainer";
import Link from "next/link";

export default function TermsPage() {
  const sections = [
    {
      id: 1,
      icon: <MdCheckCircle size={24} />,
      title: "Acceptance of Terms",
      content:
        "By accessing and using Fedx Global Shipping services, you accept and agree to be bound by the terms and provision of this agreement.",
      color: "from-green-500 to-emerald-600",
    },
    {
      id: 2,
      icon: <MdDescription size={24} />,
      title: "Services",
      content:
        "Fedx Global Shipping provides logistics, transportation, and shipping services. We reserve the right to modify, suspend, or discontinue any service at any time without notice.",
      color: "from-blue-500 to-cyan-600",
    },
    {
      id: 3,
      icon: <MdSecurity size={24} />,
      title: "User Responsibilities",
      content:
        "You agree to provide accurate information, comply with all applicable laws, not ship prohibited items, properly package shipments, and pay all fees in a timely manner.",
      items: [
        "Provide accurate and complete information",
        "Comply with all applicable laws and regulations",
        "Not ship prohibited or illegal items",
        "Properly package and label shipments",
        "Pay all fees and charges in a timely manner",
      ],
      color: "from-purple-500 to-indigo-600",
    },
    {
      id: 4,
      icon: <MdWarning size={24} />,
      title: "Prohibited Items",
      content: "The following items are prohibited from shipping:",
      items: [
        "Hazardous materials without proper documentation",
        "Illegal substances or contraband",
        "Weapons and ammunition",
        "Perishable goods without proper packaging",
        "Cash and valuable documents without insurance",
      ],
      color: "from-red-500 to-orange-600",
    },
    {
      id: 5,
      icon: <MdSecurity size={24} />,
      title: "Liability and Insurance",
      content:
        "Our liability is limited to the declared value of your shipment. We recommend purchasing additional insurance for valuable items. We are not liable for delays caused by circumstances beyond our control.",
      color: "from-yellow-500 to-amber-600",
    },
    {
      id: 6,
      icon: <MdPayment size={24} />,
      title: "Payment Terms",
      content:
        "Payment is due upon shipment creation unless other arrangements have been made. We accept various payment methods as specified on our website. Late payments may result in service suspension.",
      color: "from-indigo-500 to-purple-600",
    },
    {
      id: 7,
      icon: <MdGavel size={24} />,
      title: "Claims and Disputes",
      content:
        "Claims for lost or damaged shipments must be filed within 30 days of delivery or expected delivery date. All disputes will be resolved through our claims process.",
      color: "from-pink-500 to-rose-600",
    },
    {
      id: 8,
      icon: <MdContactMail size={24} />,
      title: "Contact Information",
      content: "For questions about these Terms, contact us at:",
      contact: {
        email: "support@fedxglobalshipping.org",
        phone: "+1 075 5032 1425",
      },
      color: "from-teal-500 to-cyan-600",
    },
  ];

  return (
    <Layout1>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 dark:from-slate-900 dark:to-gray-900">
        {/* Hero Section */}
        <section className="relative py-24 lg:py-32 overflow-hidden min-h-[500px] flex items-center">
          {/* Background Image */}
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: "url('/images/tracking.jpg')",
              backgroundAttachment: "fixed",
              backgroundSize: "cover",
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/60 to-black/70"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
            <div className="absolute inset-0 bg-[url('/images/shape/grid-01.svg')] opacity-[0.05]"></div>
          </div>

          {/* Decorative elements */}
          <div className="absolute top-20 left-10 w-72 h-72 bg-[var(--bg-general)]/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
            <div className="text-center max-w-4xl mx-auto">
              <SlideFadeContainer direction="top" delay={0.1}>
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 mb-6">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-white/90 text-sm font-medium">
                    Legal Information
                  </span>
                </div>
              </SlideFadeContainer>

              <SlideFadeContainer direction="bottom" delay={0.2}>
                <div className="w-20 h-20 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <MdGavel size={40} className="text-white" />
                </div>
              </SlideFadeContainer>

              <SlideFadeContainer direction="bottom" delay={0.3}>
                <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-6 tracking-tight leading-tight">
                  Terms of{" "}
                  <span className="bg-gradient-to-r from-[var(--bg-general)] to-orange-400 bg-clip-text text-transparent">
                    Service
                  </span>
                </h1>
              </SlideFadeContainer>

              <SlideFadeContainer direction="bottom" delay={0.4}>
                <p className="text-sm sm:text-base text-gray-300 max-w-2xl mx-auto">
                  Last updated:{" "}
                  {new Date().toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </SlideFadeContainer>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <section className="relative py-20 lg:py-28">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="space-y-8">
              {sections.map((section, index) => (
                <SlideFadeContainer
                  key={section.id}
                  direction="bottom"
                  delay={0.1 + index * 0.1}
                >
                  <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 lg:p-10 border border-gray-200 dark:border-gray-700 shadow-xl hover:shadow-2xl transition-all duration-500">
                    <div className="flex items-start gap-6">
                      <div
                        className={`flex-shrink-0 w-16 h-16 bg-gradient-to-br ${section.color} text-white rounded-2xl flex items-center justify-center shadow-lg`}
                      >
                        {section.icon}
                      </div>
                      <div className="flex-grow">
                        <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-4">
                          {section.id}. {section.title}
                        </h2>
                        <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4 text-lg">
                          {section.content}
                        </p>
                        {section.items && (
                          <ul className="space-y-3 mt-4">
                            {section.items.map((item, itemIndex) => (
                              <li
                                key={itemIndex}
                                className="flex items-start gap-3"
                              >
                                <div className="flex-shrink-0 w-2 h-2 bg-[var(--bg-general)] rounded-full mt-2"></div>
                                <span className="text-gray-600 dark:text-gray-300 leading-relaxed">
                                  {item}
                                </span>
                              </li>
                            ))}
                          </ul>
                        )}
                        {section.contact && (
                          <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-600">
                            <p className="text-gray-700 dark:text-gray-300 mb-2">
                              <span className="font-semibold">Email:</span>{" "}
                              <a
                                href={`mailto:${section.contact.email}`}
                                className="text-[var(--bg-general)] hover:underline"
                              >
                                {section.contact.email}
                              </a>
                            </p>
                            <p className="text-gray-700 dark:text-gray-300">
                              <span className="font-semibold">Phone:</span>{" "}
                              <a
                                href={`tel:${section.contact.phone}`}
                                className="text-[var(--bg-general)] hover:underline"
                              >
                                {section.contact.phone}
                              </a>
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </SlideFadeContainer>
              ))}
            </div>

            {/* CTA Section */}
            <SlideFadeContainer direction="bottom" delay={0.8}>
              <div className="text-center mt-16">
                <div className="bg-gradient-to-r from-[var(--bg-general)] via-orange-600 to-[var(--bg-general)] rounded-3xl p-10 lg:p-12 text-white shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32 blur-3xl"></div>
                  <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-24 -translate-x-24 blur-3xl"></div>
                  <div className="relative z-10">
                    <h3 className="text-3xl lg:text-4xl font-bold mb-4">
                      Questions About Our Terms?
                    </h3>
                    <p className="text-lg text-orange-100 mb-8 max-w-2xl mx-auto leading-relaxed">
                      Our legal team is here to help clarify any questions you
                      may have about our terms of service.
                    </p>
                    <Link href="/contact">
                      <Button
                        size="lg"
                        variant="light"
                        color="#FFFFFF"
                        className="font-semibold hover:shadow-xl transition-all duration-300 active:scale-95 bg-white text-gray-900 hover:bg-gray-100"
                      >
                        Contact Us
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </SlideFadeContainer>
          </div>
        </section>
      </div>
    </Layout1>
  );
}
