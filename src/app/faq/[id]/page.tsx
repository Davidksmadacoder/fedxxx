"use client";

import Layout1 from '@/components/layout/Layout1';
import { api } from '@/api/axios';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { MdArrowBack, MdThumbUp, MdThumbDown, MdHelp } from 'react-icons/md';
import { Skeleton } from '@/components/ui/skeleton/Skeleton';
import { Button } from '@/components/ui/button/Button';
import { Badge } from '@/components/ui/badge/Badge';
import Link from 'next/link';
import toast from 'react-hot-toast';

type FAQ = {
    _id: string;
    question: string;
    answer: string;
    category?: string;
    views?: number;
    helpful?: number;
    notHelpful?: number;
};

export default function FAQDetailPage() {
    const params = useParams();
    const id = params.id as string;
    const [faq, setFaq] = useState<FAQ | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFAQ = async () => {
            try {
                const res = await api.get(`/faq/${id}`);
                setFaq(res.data.faq);
            } catch (error) {
                console.error('Failed to load FAQ');
            } finally {
                setLoading(false);
            }
        };
        if (id) fetchFAQ();
    }, [id]);

    const handleHelpful = async (helpful: boolean) => {
        if (!faq) return;
        try {
            // In a real app, you'd have an API endpoint for this
            toast.success(`Thank you for your feedback!`);
        } catch (error) {
            console.error('Failed to submit feedback');
        }
    };

    if (loading) {
        return (
            <Layout1>
                <div className="min-h-screen custom-black-white-theme-switch-bg section-spacing">
                    <div className="page-container">
                        <Skeleton height={40} width={200} className="mb-8" />
                        <Skeleton height={300} className="mb-8 rounded-2xl" />
                        <Skeleton height={100} className="mb-8" />
                    </div>
                </div>
            </Layout1>
        );
    }

    if (!faq) {
        return (
            <Layout1>
                <div className="min-h-screen custom-black-white-theme-switch-bg section-spacing">
                    <div className="page-container text-center">
                        <div className="max-w-md mx-auto py-12">
                            <div className="w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
                                <MdHelp size={40} className="text-gray-400" />
                            </div>
                            <h1 className="text-3xl font-bold custom-black-white-theme-switch-text mb-4">
                                FAQ Not Found
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400 mb-8 text-lg">
                                The FAQ you're looking for doesn't exist or has been removed.
                            </p>
                            <Link href="/#faq" className="inline-block">
                                <Button
                                    leftSection={<MdArrowBack />}
                                    color="brandOrange"
                                    size="lg"
                                >
                                    Back to FAQs
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
                            <Link href="/#faq" className="inline-block mb-8">
                                <Button
                                    variant="subtle"
                                    leftSection={<MdArrowBack />}
                                >
                                    Back to FAQs
                                </Button>
                            </Link>

                        <div className="max-w-4xl">
                            {faq.category && (
                                <Badge color="orange" className="mb-6">
                                    {faq.category}
                                </Badge>
                            )}
                            <h1 className="text-4xl lg:text-5xl font-bold custom-black-white-theme-switch-text mb-6 leading-tight">
                                {faq.question}
                            </h1>
                        </div>
                    </div>
                </section>

                {/* Main Content */}
                <section className="section-spacing">
                    <div className="page-container">
                        <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">
                            {/* Main Content */}
                            <div className="lg:col-span-2">
                                <div className="card mb-8">
                                    <div className="prose prose-lg max-w-none custom-black-white-theme-switch-text leading-relaxed">
                                        <div className="whitespace-pre-line text-lg">{faq.answer}</div>
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-4 mb-8">
                                    <Button
                                        leftSection={<MdThumbUp />}
                                        variant="light"
                                        onClick={() => handleHelpful(true)}
                                        size="lg"
                                    >
                                        Helpful ({faq.helpful || 0})
                                    </Button>
                                    <Button
                                        leftSection={<MdThumbDown />}
                                        variant="light"
                                        color="#ef4444"
                                        onClick={() => handleHelpful(false)}
                                        size="lg"
                                    >
                                        Not Helpful ({faq.notHelpful || 0})
                                    </Button>
                                </div>
                            </div>

                            {/* Sidebar */}
                            <div className="space-y-6">
                                <div className="card bg-gradient-to-br from-[var(--bg-general)] to-orange-600 text-white">
                                    <div className="flex items-center gap-3 mb-4">
                                        <MdHelp size={24} />
                                        <h3 className="text-xl font-bold">Still have questions?</h3>
                                    </div>
                                    <p className="text-orange-50 mb-6 leading-relaxed">
                                        Can't find the answer you're looking for? Our support team is here to help.
                                    </p>
                                    <Link href="/contact" className="block w-full">
                                        <Button
                                            variant="light"
                                            color="brandOrange"
                                            size="md"
                                            fullWidth
                                            className="bg-white hover:bg-gray-100"
                                        >
                                            Contact Support
                                        </Button>
                                    </Link>
                                </div>

                                <div className="card">
                                    <h4 className="font-semibold custom-black-white-theme-switch-text mb-4">
                                        Popular FAQs
                                    </h4>
                                    <div className="space-y-3">
                                        <Link href="/#faq" className="block  custom-black-white-theme-switch-text hover:text-[var(--bg-general)] transition-colors">
                                            How do I track my shipment?
                                        </Link>
                                        <Link href="/#faq" className="block  custom-black-white-theme-switch-text hover:text-[var(--bg-general)] transition-colors">
                                            What are your shipping rates?
                                        </Link>
                                        <Link href="/#faq" className="block  custom-black-white-theme-switch-text hover:text-[var(--bg-general)] transition-colors">
                                            How long does delivery take?
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </Layout1>
    );
}



