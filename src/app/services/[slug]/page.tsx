"use client";

import Layout1 from '@/components/layout/Layout1';
import { api } from '@/api/axios';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { MdArrowBack, MdCheckCircle } from 'react-icons/md';
import CustomLoader from '@/components/features/CustomLoader';
import { Button } from '@/components/ui/button/Button';
import { Skeleton } from '@/components/ui/skeleton/Skeleton';
import Image from 'next/image';

type Service = {
    _id: string;
    title: string;
    slug: string;
    description: string;
    fullDescription?: string;
    category: string;
    image?: string;
    features?: string[];
    pricing?: {
        basePrice?: number;
        pricePerKg?: number;
        pricePerKm?: number;
    };
};

export default function ServiceDetailPage() {
    const params = useParams();
    const slug = params.slug as string;
    const [service, setService] = useState<Service | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchService = async () => {
            try {
                const res = await api.get(`/service/slug/${slug}`);
                setService(res.data.service);
            } catch (error) {
                console.error('Failed to load service');
            } finally {
                setLoading(false);
            }
        };
        if (slug) fetchService();
    }, [slug]);

    if (loading) {
        return (
            <Layout1>
                <div className="min-h-screen custom-black-white-theme-switch-bg section-spacing">
                    <div className="page-container">
                        <Skeleton height={40} width={200} className="mb-8" />
                        <Skeleton height={400} className="mb-8 rounded-2xl" />
                        <Skeleton height={60} className="mb-6" />
                        <Skeleton height={100} className="mb-8" />
                        <Skeleton height={200} className="mb-8" />
                    </div>
                </div>
            </Layout1>
        );
    }

    if (!service) {
        return (
            <Layout1>
                <div className="min-h-screen custom-black-white-theme-switch-bg section-spacing">
                    <div className="page-container text-center">
                        <div className="max-w-md mx-auto py-12">
                            <div className="w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
                                <MdArrowBack size={40} className="text-gray-400" />
                            </div>
                            <h1 className="text-3xl font-bold custom-black-white-theme-switch-text mb-4">
                                Service Not Found
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400 mb-8 text-lg">
                                The service you're looking for doesn't exist or has been removed.
                            </p>
                            <Link href="/services" className="inline-block">
                                <Button
                                    leftSection={<MdArrowBack />}
                                    color="brandOrange"
                                    size="lg"
                                >
                                    Back to Services
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </Layout1>
        );
    }

    return (
        <Layout1>
            <div className="min-h-screen custom-black-white-theme-switch-bg">
                {/* Hero Section */}
                <section className="relative py-16 lg:py-24 overflow-hidden bg-gradient-to-br from-[var(--bg-general-lighter)] to-orange-50 dark:from-gray-800 dark:to-gray-900">
                    <div className="page-container">
                            <Link href="/services" className="inline-block mb-8">
                                <Button
                                    variant="subtle"
                                    leftSection={<MdArrowBack />}
                                >
                                    Back to Services
                                </Button>
                            </Link>

                        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
                            <div>
                                <div className="inline-block px-4 py-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-full border border-[var(--bg-general)]/20 mb-6">
                                    <span className="text-sm font-semibold text-[var(--bg-general)]">{service.category}</span>
                                </div>
                                <h1 className="text-4xl lg:text-5xl font-bold custom-black-white-theme-switch-text mb-6 leading-tight">
                                    {service.title}
                                </h1>
                                <p className="text-xl custom-black-white-theme-switch-text leading-relaxed mb-8">
                                    {service.description}
                                </p>
                                <div className="flex flex-wrap gap-4">
                                    <Link href="/contact">
                                        <Button
                                            color="brandOrange"
                                            size="lg"
                                        >
                                            Get a Quote
                                        </Button>
                                    </Link>
                                    <Link href="/tracking">
                                        <Button
                                            variant="outline"
                                            size="lg"
                                        >
                                            Track Shipment
                                        </Button>
                                    </Link>
                                </div>
                            </div>

                            {service.image && (
                                <div className="relative h-96 lg:h-[500px] rounded-2xl overflow-hidden shadow-2xl">
                                    <Image
                                        src={service.image}
                                        alt={service.title}
                                        fill
                                        className="object-cover"
                                        priority
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </section>

                {/* Main Content */}
                <section className="section-spacing">
                    <div className="page-container">
                        <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">
                            {/* Main Content */}
                            <div className="lg:col-span-2 space-y-8">
                                {service.fullDescription && (
                                    <div className="card">
                                        <h2 className="text-2xl font-bold custom-black-white-theme-switch-text mb-4">
                                            Overview
                                        </h2>
                                        <div className="prose prose-lg max-w-none custom-black-white-theme-switch-text leading-relaxed">
                                            <p className="whitespace-pre-line">{service.fullDescription}</p>
                                        </div>
                                    </div>
                                )}

                                {service.features && service.features.length > 0 && (
                                    <div className="card">
                                        <h2 className="text-2xl font-bold custom-black-white-theme-switch-text mb-6">
                                            Key Features
                                        </h2>
                                        <ul className="space-y-4">
                                            {service.features.map((feature, index) => (
                                                <li key={index} className="flex items-start gap-3">
                                                    <div className="flex-shrink-0 w-6 h-6 bg-[var(--bg-general)] rounded-full flex items-center justify-center mt-0.5">
                                                        <MdCheckCircle className="text-white" size={16} />
                                                    </div>
                                                    <span className="custom-black-white-theme-switch-text leading-relaxed text-lg">
                                                        {feature}
                                                    </span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>

                            {/* Sidebar */}
                            <div className="space-y-6">
                                {service.pricing && (
                                    <div className="card bg-gradient-to-br from-[var(--bg-general-lighter)] to-orange-50 dark:from-gray-800 dark:to-gray-700 border-[var(--bg-general)]/20">
                                        <h3 className="text-xl font-bold custom-black-white-theme-switch-text mb-6">
                                            Pricing Information
                                        </h3>
                                        <div className="space-y-4">
                                            {service.pricing.basePrice && (
                                                <div className="pb-4 border-b border-gray-200 dark:border-gray-600">
                                                    <p className="text-sm custom-black-white-theme-switch-text mb-1">Base Price</p>
                                                    <p className="text-2xl font-bold text-[var(--bg-general)]">
                                                        ${service.pricing.basePrice.toFixed(2)}
                                                    </p>
                                                </div>
                                            )}
                                            {service.pricing.pricePerKg && (
                                                <div className="pb-4 border-b border-gray-200 dark:border-gray-600">
                                                    <p className="text-sm custom-black-white-theme-switch-text mb-1">Per Kilogram</p>
                                                    <p className="text-2xl font-bold text-[var(--bg-general)]">
                                                        ${service.pricing.pricePerKg.toFixed(2)}
                                                    </p>
                                                </div>
                                            )}
                                            {service.pricing.pricePerKm && (
                                                <div>
                                                    <p className="text-sm custom-black-white-theme-switch-text mb-1">Per Kilometer</p>
                                                    <p className="text-2xl font-bold text-[var(--bg-general)]">
                                                        ${service.pricing.pricePerKm.toFixed(2)}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                <div className="card bg-gradient-to-br from-[var(--bg-general)] to-orange-600 text-white">
                                    <h3 className="text-xl font-bold mb-4">Need Help?</h3>
                                    <p className="text-orange-50 mb-6 leading-relaxed">
                                        Our team is ready to assist you with any questions about this service.
                                    </p>
                                    <Link href="/contact" className="block w-full">
                                        <Button
                                            variant="light"
                                            color="brandOrange"
                                            size="md"
                                            fullWidth
                                            className="text-white bg-white hover:bg-gray-100"
                                        >
                                            Contact Us
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </Layout1>
    );
}







