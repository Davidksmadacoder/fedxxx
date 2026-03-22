"use client";

import Layout1 from '@/components/layout/Layout1';
import { Button } from '@mantine/core';
import { api } from '@/api/axios';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { MdArrowForward, MdLocalShipping } from 'react-icons/md';
import SlideFadeContainer from '@/components/features/SlideFadeContainer';
import CustomLoader from '@/components/features/CustomLoader';

type Service = {
    _id: string;
    title: string;
    slug: string;
    description: string;
    category: string;
    image?: string;
    icon?: string;
};

export default function ServicesPage() {
    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchServices = async () => {
            try {
                const res = await api.get('/service?active=true');
                setServices(res.data.services || []);
            } catch (error) {
                console.error('Failed to load services');
            } finally {
                setLoading(false);
            }
        };
        fetchServices();
    }, []);

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
                                    <span className="text-white/90 text-sm font-poppins font-medium">Comprehensive Logistics Solutions</span>
                                </div>
                            </SlideFadeContainer>

                            <SlideFadeContainer direction="bottom" delay={0.2}>
                                <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-6 font-poppins tracking-tight leading-tight">
                                    Our <span className="bg-gradient-to-r from-[var(--bg-general)] to-orange-400 bg-clip-text text-transparent">Services</span>
                                </h1>
                            </SlideFadeContainer>

                            <SlideFadeContainer direction="bottom" delay={0.3}>
                                <p className="text-lg sm:text-xl lg:text-2xl text-gray-200 mb-8 max-w-3xl mx-auto font-poppins leading-relaxed">
                                    Comprehensive logistics solutions for all your shipping needs
                                </p>
                            </SlideFadeContainer>
                        </div>
                    </div>
                </section>

                {/* Services Grid */}
                <section className="relative py-20 lg:py-28">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        {loading ? (
                            <div className="py-20">
                                <CustomLoader loading={true} />
                            </div>
                        ) : services.length > 0 ? (
                            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                                {services.map((service, index) => (
                                    <SlideFadeContainer
                                        key={service._id}
                                        direction="bottom"
                                        delay={0.1 + index * 0.1}
                                    >
                                        <Link href={`/services/${service.slug}`}>
                                            <div className="group bg-white dark:bg-gray-800 rounded-3xl overflow-hidden border border-gray-200 dark:border-gray-700 hover:shadow-2xl transition-all duration-500 hover:scale-105 h-full flex flex-col cursor-pointer">
                                                {/* Image */}
                                                {service.image && (
                                                    <div className="relative h-48 bg-gray-200 dark:bg-gray-700 overflow-hidden">
                                                        <img 
                                                            src={service.image} 
                                                            alt={service.title} 
                                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                                        />
                                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                                                        <div className="absolute top-4 left-4">
                                                            <span className="px-3 py-1 bg-[var(--bg-general)] text-white text-xs font-semibold rounded-full font-poppins">
                                                                {service.category}
                                                            </span>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Content */}
                                                <div className="p-6 lg:p-8 flex-grow flex flex-col">
                                                    {/* Icon */}
                                                    {service.icon ? (
                                                        <div className="w-16 h-16 bg-[var(--bg-general-lighter)] text-[var(--bg-general)] rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                                                            <img src={service.icon} alt={service.title} className="w-8 h-8" />
                                                        </div>
                                                    ) : (
                                                        <div className="w-16 h-16 bg-[var(--bg-general-lighter)] text-[var(--bg-general)] rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                                                            <MdLocalShipping size={32} />
                                                        </div>
                                                    )}

                                                    {/* Title */}
                                                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-[var(--bg-general)] transition-colors duration-300 font-poppins">
                                                        {service.title}
                                                    </h3>

                                                    {/* Description */}
                                                    <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed flex-grow font-poppins line-clamp-3">
                                                        {service.description}
                                                    </p>

                                                    {/* CTA */}
                                                    <div className="flex items-center gap-2 text-[var(--bg-general)] font-semibold group-hover:gap-4 transition-all duration-300 font-poppins">
                                                        <span>Learn More</span>
                                                        <MdArrowForward className="group-hover:translate-x-2 transition-transform duration-300" size={20} />
                                                    </div>

                                                    {/* Hover Indicator */}
                                                    <div className="w-0 group-hover:w-full h-1 bg-[var(--bg-general)] mt-4 transition-all duration-300 rounded-full"></div>
                                                </div>
                                            </div>
                                        </Link>
                                    </SlideFadeContainer>
                                ))}
                            </div>
                        ) : (
                            <SlideFadeContainer direction="bottom" delay={0.2}>
                                <div className="text-center py-20">
                                    <div className="w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <MdLocalShipping size={48} className="text-gray-400" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 font-poppins">
                                        No Services Available
                                    </h3>
                                    <p className="text-gray-600 dark:text-gray-400 font-poppins">
                                        Please check back later or contact us for more information.
                                    </p>
                                </div>
                            </SlideFadeContainer>
                        )}

                        {/* CTA Section */}
                        <SlideFadeContainer direction="bottom" delay={0.6}>
                            <div className="text-center mt-16">
                                <div className="bg-gradient-to-r from-[var(--bg-general)] via-orange-600 to-[var(--bg-general)] rounded-3xl p-10 lg:p-12 text-white shadow-2xl relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32 blur-3xl"></div>
                                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-24 -translate-x-24 blur-3xl"></div>
                                    <div className="relative z-10">
                                        <h3 className="text-3xl lg:text-4xl font-bold mb-4 font-poppins">
                                            Need Custom Logistics Solutions?
                                        </h3>
                                        <p className="text-lg text-orange-100 mb-8 max-w-2xl mx-auto font-poppins leading-relaxed">
                                            Our experts are ready to create tailored logistics strategies for your unique business requirements.
                                        </p>
                                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                            <Button
                                                component={Link}
                                                href="/services/consultation"
                                                size="lg"
                                                variant="white"
                                                color="dark"
                                                rightSection={<MdArrowForward size={20} />}
                                                className="font-semibold font-poppins hover:shadow-xl transition-all duration-300 hover:scale-105"
                                            >
                                                Get Free Consultation
                                            </Button>
                                            <Button
                                                component={Link}
                                                href="/contact"
                                                size="lg"
                                                variant="outline"
                                                color="white"
                                                className="font-semibold border-2 font-poppins hover:bg-white hover:text-orange-600 transition-all duration-300"
                                            >
                                                Contact Us
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
