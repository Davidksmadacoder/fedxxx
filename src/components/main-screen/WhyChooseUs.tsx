"use client";

import React from "react";
import { MdOutlinePublic, MdSupportAgent, MdSecurity, MdLocalShipping } from "react-icons/md";
import SlideFadeContainer from '../features/SlideFadeContainer';

const WhyChooseUs: React.FC = () => {
    const features = [
        {
            icon: <MdOutlinePublic size={32} />,
            title: "Global Network",
            description: "With our global network, we can reach the most remote corners of the globe with reliable and efficient logistics solutions."
        },
        {
            icon: <MdSupportAgent size={32} />,
            title: "24/7 Hours Support",
            description: "We believe that exceptional customer support is the cornerstone of our service, available round the clock for your needs."
        },
        {
            icon: <MdSecurity size={32} />,
            title: "Secure & Reliable",
            description: "Your shipments are protected with state-of-the-art security measures and real-time tracking systems."
        },
        {
            icon: <MdLocalShipping size={32} />,
            title: "Fast Delivery",
            description: "Optimized routes and efficient processes ensure your goods reach their destination faster than ever."
        }
    ];

    return (
        <section className="relative py-20 lg:py-28 bg-white dark:bg-gray-900 overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-5">
                <div className="absolute inset-0 bg-[radial-gradient(var(--bg-general)_1px,transparent_1px)] [background-size:16px_16px]"></div>
            </div>

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <SlideFadeContainer direction="top" delay={0.1}>
                        <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                            Why Choose Us
                        </h2>
                    </SlideFadeContainer>

                    <SlideFadeContainer direction="top" delay={0.2}>
                        <h3 className="text-xl lg:text-2xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
                            Empowering Your Business Potential
                        </h3>
                    </SlideFadeContainer>

                    <SlideFadeContainer direction="top" delay={0.3}>
                        <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto mt-4 text-lg">
                            We understand that selecting the right logistics partner is crucial for the success of your business.
                        </p>
                    </SlideFadeContainer>
                </div>

                {/* Features Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
                    {features.map((feature, index) => (
                        <SlideFadeContainer
                            key={index}
                            direction="bottom"
                            delay={0.2 + index * 0.1}
                        >
                            <div className="group p-6 bg-gray-50 dark:bg-gray-800 rounded-2xl hover:bg-white dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-600 hover:border-[var(--bg-general-light)] hover:shadow-xl transition-all duration-500 hover:scale-105">
                                {/* Icon */}
                                <div className="flex items-center justify-center w-16 h-16 bg-[var(--bg-general-lighter)] text-[var(--bg-general)] rounded-xl mb-6 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                                    {feature.icon}
                                </div>

                                {/* Content */}
                                <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-[var(--bg-general)] transition-colors duration-300">
                                    {feature.title}
                                </h4>

                                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                                    {feature.description}
                                </p>

                                {/* Hover Indicator */}
                                <div className="w-0 group-hover:w-12 h-0.5 bg-[var(--bg-general)] mt-4 transition-all duration-300"></div>
                            </div>
                        </SlideFadeContainer>
                    ))}
                </div>

                {/* Bottom CTA */}
                <SlideFadeContainer direction="bottom" delay={0.6}>
                    <div className="text-center mt-16">
                        <div className="inline-flex items-center gap-4 bg-gray-100 dark:bg-gray-800 px-6 py-4 rounded-2xl">
                            <div className="flex items-center gap-3">
                                <div className="w-3 h-3 bg-[var(--bg-general)] rounded-full animate-pulse"></div>
                                <span className="text-gray-700 dark:text-gray-300 font-medium">
                                    Trusted by 5000+ companies worldwide
                                </span>
                            </div>
                        </div>
                    </div>
                </SlideFadeContainer>
            </div>
        </section>
    );
};

export default WhyChooseUs;