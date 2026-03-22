"use client";

import Layout1 from '@/components/layout/Layout1';
import { Button } from '@mantine/core';
import Link from 'next/link';
import { MdBusinessCenter, MdCheckCircle, MdSchedule, MdPeople, MdTrendingUp, MdArrowForward } from 'react-icons/md';
import SlideFadeContainer from '@/components/features/SlideFadeContainer';

export default function ConsultationPage() {
    const benefits = [
        "Custom logistics strategy tailored to your business",
        "Cost optimization analysis",
        "Supply chain efficiency review",
        "Technology integration recommendations",
        "Risk assessment and mitigation strategies",
        "Compliance and regulatory guidance",
    ];

    const process = [
        { step: 1, title: "Initial Consultation", description: "We discuss your logistics challenges and requirements", icon: <MdPeople size={24} /> },
        { step: 2, title: "Analysis & Assessment", description: "Our experts analyze your current operations", icon: <MdTrendingUp size={24} /> },
        { step: 3, title: "Custom Solution Design", description: "We create a tailored logistics strategy", icon: <MdBusinessCenter size={24} /> },
        { step: 4, title: "Implementation Support", description: "We help you implement and optimize the solution", icon: <MdCheckCircle size={24} /> },
    ];

    const features = [
        {
            icon: <MdTrendingUp size={32} />,
            title: "Performance Optimization",
            description: "Improve efficiency and reduce costs with data-driven insights"
        },
        {
            icon: <MdPeople size={32} />,
            title: "Expert Team",
            description: "Experienced logistics consultants with proven track records"
        },
        {
            icon: <MdSchedule size={32} />,
            title: "Quick Turnaround",
            description: "Fast analysis and actionable recommendations"
        }
    ];

    return (
        <Layout1>
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 dark:from-slate-900 dark:to-gray-900">
                {/* Hero Section */}
                <section className="relative py-24 lg:py-32 overflow-hidden min-h-[600px] flex items-center">
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
                                    <span className="text-white/90 text-sm font-poppins font-medium">Expert Consultation Services</span>
                                </div>
                            </SlideFadeContainer>

                            <SlideFadeContainer direction="bottom" delay={0.2}>
                                <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-6 font-poppins tracking-tight leading-tight">
                                    Logistics <span className="bg-gradient-to-r from-[var(--bg-general)] to-orange-400 bg-clip-text text-transparent">Consultation</span>
                                </h1>
                            </SlideFadeContainer>

                            <SlideFadeContainer direction="bottom" delay={0.3}>
                                <p className="text-lg sm:text-xl lg:text-2xl text-gray-200 mb-8 max-w-3xl mx-auto font-poppins leading-relaxed">
                                    Expert guidance to optimize your supply chain and logistics operations
                                </p>
                            </SlideFadeContainer>

                            <SlideFadeContainer direction="bottom" delay={0.4}>
                                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                    <Button
                                        component={Link}
                                        href="/contact"
                                        size="lg"
                                        rightSection={<MdArrowForward size={20} />}
                                        color="brandOrange"
                                        className="font-semibold font-poppins hover:shadow-2xl transition-all duration-300 hover:scale-105"
                                    >
                                        Schedule Consultation
                                    </Button>
                                    <Button
                                        component={Link}
                                        href="/services"
                                        size="lg"
                                        variant="outline"
                                        className="font-semibold border-2 border-white/40 text-white hover:bg-white/10 backdrop-blur-sm transition-all duration-300 hover:scale-105 font-poppins"
                                    >
                                        View All Services
                                    </Button>
                                </div>
                            </SlideFadeContainer>
                        </div>
                    </div>
                </section>

                {/* Main Content */}
                <section className="relative py-20 lg:py-28">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        {/* Why Choose Our Consultation */}
                        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 mb-16">
                            <SlideFadeContainer direction="left" delay={0.1}>
                                <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 lg:p-10 border border-gray-200 dark:border-gray-700 shadow-xl hover:shadow-2xl transition-all duration-500">
                                    <div className="flex items-center gap-4 mb-6">
                                        <div className="w-16 h-16 bg-[var(--bg-general-lighter)] text-[var(--bg-general)] rounded-2xl flex items-center justify-center">
                                            <MdBusinessCenter size={32} />
                                        </div>
                                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white font-poppins">
                                            Why Choose Our Consultation?
                                        </h2>
                                    </div>
                                    <ul className="space-y-4">
                                        {benefits.map((benefit, index) => (
                                            <li key={index} className="flex items-start gap-3">
                                                <div className="flex-shrink-0 w-6 h-6 bg-[var(--bg-general-lighter)] text-[var(--bg-general)] rounded-lg flex items-center justify-center mt-0.5">
                                                    <MdCheckCircle size={18} />
                                                </div>
                                                <span className="text-gray-600 dark:text-gray-300 leading-relaxed font-poppins">
                                                    {benefit}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </SlideFadeContainer>

                            <SlideFadeContainer direction="right" delay={0.2}>
                                <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 lg:p-10 border border-gray-200 dark:border-gray-700 shadow-xl hover:shadow-2xl transition-all duration-500">
                                    <div className="flex items-center gap-4 mb-6">
                                        <div className="w-16 h-16 bg-[var(--bg-general-lighter)] text-[var(--bg-general)] rounded-2xl flex items-center justify-center">
                                            <MdTrendingUp size={32} />
                                        </div>
                                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white font-poppins">
                                            What We Offer
                                        </h2>
                                    </div>
                                    <div className="space-y-6">
                                        {features.map((feature, index) => (
                                            <div key={index} className="group p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl hover:bg-white dark:hover:bg-gray-700 transition-all duration-300">
                                                <div className="flex items-start gap-4">
                                                    <div className="flex-shrink-0 w-12 h-12 bg-[var(--bg-general-lighter)] text-[var(--bg-general)] rounded-xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                                                        {feature.icon}
                                                    </div>
                                                    <div>
                                                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 group-hover:text-[var(--bg-general)] transition-colors duration-300 font-poppins">
                                                            {feature.title}
                                                        </h3>
                                                        <p className="text-gray-600 dark:text-gray-300 text-sm font-poppins">
                                                            {feature.description}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </SlideFadeContainer>
                        </div>

                        {/* Consultation Process */}
                        <SlideFadeContainer direction="bottom" delay={0.3}>
                            <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 lg:p-10 border border-gray-200 dark:border-gray-700 shadow-xl mb-16">
                                <div className="text-center mb-10">
                                    <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4 font-poppins">
                                        Our Consultation Process
                                    </h2>
                                    <p className="text-gray-600 dark:text-gray-300 text-lg font-poppins">
                                        A structured approach to optimizing your logistics
                                    </p>
                                </div>
                                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
                                    {process.map((item, index) => (
                                        <SlideFadeContainer key={item.step} direction="bottom" delay={0.3 + index * 0.1}>
                                            <div className="group text-center p-6 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-2xl border border-gray-200 dark:border-gray-600 hover:border-[var(--bg-general)] hover:shadow-xl transition-all duration-500 hover:scale-105">
                                                <div className="relative mb-6">
                                                    <div className="w-20 h-20 bg-gradient-to-br from-[var(--bg-general)] to-orange-600 text-white rounded-2xl flex items-center justify-center mx-auto text-3xl font-bold shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                                                        {item.step}
                                                    </div>
                                                    <div className="absolute -top-2 -right-2 w-10 h-10 bg-[var(--bg-general-lighter)] text-[var(--bg-general)] rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                                        {item.icon}
                                                    </div>
                                                </div>
                                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-[var(--bg-general)] transition-colors duration-300 font-poppins">
                                                    {item.title}
                                                </h3>
                                                <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed font-poppins">
                                                    {item.description}
                                                </p>
                                                <div className="w-0 group-hover:w-12 h-0.5 bg-[var(--bg-general)] mx-auto mt-4 transition-all duration-300"></div>
                                            </div>
                                        </SlideFadeContainer>
                                    ))}
                                </div>
                            </div>
                        </SlideFadeContainer>

                        {/* CTA Section */}
                        <SlideFadeContainer direction="bottom" delay={0.6}>
                            <div className="text-center">
                                <div className="bg-gradient-to-r from-[var(--bg-general)] via-orange-600 to-[var(--bg-general)] rounded-3xl p-10 lg:p-12 text-white shadow-2xl relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32 blur-3xl"></div>
                                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-24 -translate-x-24 blur-3xl"></div>
                                    <div className="relative z-10">
                                        <h2 className="text-3xl lg:text-4xl font-bold mb-4 font-poppins">
                                            Ready to Optimize Your Logistics?
                                        </h2>
                                        <p className="text-lg text-orange-100 mb-8 max-w-2xl mx-auto font-poppins leading-relaxed">
                                            Schedule a free consultation with our logistics experts today and discover how we can transform your supply chain operations.
                                        </p>
                                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                            <Button
                                                component={Link}
                                                href="/contact"
                                                size="lg"
                                                variant="white"
                                                color="dark"
                                                rightSection={<MdArrowForward size={20} />}
                                                className="font-semibold font-poppins hover:shadow-xl transition-all duration-300 hover:scale-105"
                                            >
                                                Schedule Consultation
                                            </Button>
                                            <Button
                                                component={Link}
                                                href="/services"
                                                size="lg"
                                                variant="outline"
                                                color="white"
                                                className="font-semibold border-2 font-poppins hover:bg-white hover:text-orange-600 transition-all duration-300"
                                            >
                                                View All Services
                                            </Button>
                                        </div>
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
