"use client";

import Layout1 from '@/components/layout/Layout1';
import { Button } from '@mantine/core';
import { MdCookie, MdSecurity, MdInfo, MdSettings, MdShare, MdContactMail } from 'react-icons/md';
import SlideFadeContainer from '@/components/features/SlideFadeContainer';
import Link from 'next/link';

export default function CookiesPage() {
    const sections = [
        {
            id: 1,
            icon: <MdInfo size={24} />,
            title: "What Are Cookies",
            content: "Cookies are small text files that are placed on your computer or mobile device when you visit a website. They are widely used to make websites work more efficiently and provide information to website owners.",
            color: "from-blue-500 to-cyan-600"
        },
        {
            id: 2,
            icon: <MdCookie size={24} />,
            title: "How We Use Cookies",
            content: "We use cookies for the following purposes:",
            items: [
                { label: "Essential Cookies", description: "Required for the website to function properly" },
                { label: "Analytics Cookies", description: "Help us understand how visitors interact with our website" },
                { label: "Functional Cookies", description: "Remember your preferences and settings" },
                { label: "Marketing Cookies", description: "Used to deliver relevant advertisements" }
            ],
            color: "from-purple-500 to-indigo-600"
        },
        {
            id: 3,
            icon: <MdSettings size={24} />,
            title: "Types of Cookies We Use",
            content: "We use different types of cookies on our website:",
            items: [
                { label: "Session Cookies", description: "Temporary cookies that are deleted when you close your browser" },
                { label: "Persistent Cookies", description: "Cookies that remain on your device for a set period or until you delete them" }
            ],
            color: "from-green-500 to-emerald-600"
        },
        {
            id: 4,
            icon: <MdShare size={24} />,
            title: "Third-Party Cookies",
            content: "We may use third-party services that set cookies on your device. These include analytics services, payment processors, and advertising networks. We do not control these cookies.",
            color: "from-orange-500 to-red-600"
        },
        {
            id: 5,
            icon: <MdSecurity size={24} />,
            title: "Managing Cookies",
            content: "You can control and manage cookies in several ways:",
            items: [
                { label: "Browser Settings", description: "Browser settings allow you to refuse or accept cookies" },
                { label: "Delete Cookies", description: "You can delete cookies that have already been set" },
                { label: "Block Third-Party", description: "Most browsers provide options to block third-party cookies" },
                { label: "Functionality Impact", description: "Note that blocking cookies may affect website functionality" }
            ],
            color: "from-yellow-500 to-amber-600"
        },
        {
            id: 6,
            icon: <MdContactMail size={24} />,
            title: "Contact Us",
            content: "If you have questions about our use of cookies, please contact us at:",
            contact: {
                email: "privacy@cargopulse.com",
                phone: "+1 075 5032 1425"
            },
            color: "from-teal-500 to-cyan-600"
        }
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
                                    <span className="text-white/90 text-sm font-medium">Cookie Policy</span>
                                </div>
                            </SlideFadeContainer>

                            <SlideFadeContainer direction="bottom" delay={0.2}>
                                <div className="w-20 h-20 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-6">
                                    <MdCookie size={40} className="text-white" />
                                </div>
                            </SlideFadeContainer>

                            <SlideFadeContainer direction="bottom" delay={0.3}>
                                <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-6 tracking-tight leading-tight">
                                    Cookie <span className="bg-gradient-to-r from-[var(--bg-general)] to-orange-400 bg-clip-text text-transparent">Policy</span>
                                </h1>
                            </SlideFadeContainer>

                            <SlideFadeContainer direction="bottom" delay={0.4}>
                                <p className="text-sm sm:text-base text-gray-300 max-w-2xl mx-auto">
                                    Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
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
                                            <div className={`flex-shrink-0 w-16 h-16 bg-gradient-to-br ${section.color} text-white rounded-2xl flex items-center justify-center shadow-lg`}>
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
                                                    <div className="grid md:grid-cols-2 gap-4 mt-6">
                                                        {section.items.map((item, itemIndex) => (
                                                            <div key={itemIndex} className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-600">
                                                                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                                                                    {item.label}
                                                                </h4>
                                                                <p className="text-sm text-gray-600 dark:text-gray-300">
                                                                    {item.description}
                                                                </p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                                {section.contact && (
                                                    <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-600">
                                                        <p className="text-gray-700 dark:text-gray-300 mb-2">
                                                            <span className="font-semibold">Email:</span>{' '}
                                                            <a href={`mailto:${section.contact.email}`} className="text-[var(--bg-general)] hover:underline">
                                                                {section.contact.email}
                                                            </a>
                                                        </p>
                                                        <p className="text-gray-700 dark:text-gray-300">
                                                            <span className="font-semibold">Phone:</span>{' '}
                                                            <a href={`tel:${section.contact.phone}`} className="text-[var(--bg-general)] hover:underline">
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
                        <SlideFadeContainer direction="bottom" delay={0.7}>
                            <div className="text-center mt-16">
                                <div className="bg-gradient-to-r from-[var(--bg-general)] via-orange-600 to-[var(--bg-general)] rounded-3xl p-10 lg:p-12 text-white shadow-2xl relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32 blur-3xl"></div>
                                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-24 -translate-x-24 blur-3xl"></div>
                                    <div className="relative z-10">
                                        <h3 className="text-3xl lg:text-4xl font-bold mb-4">
                                            Questions About Cookies?
                                        </h3>
                                        <p className="text-lg text-orange-100 mb-8 max-w-2xl mx-auto leading-relaxed">
                                            Our privacy team is here to help clarify any questions you may have about our cookie policy.
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
