"use client";

import React, { useState, useEffect } from "react";
import { MdAdd, MdRemove } from "react-icons/md";
import SlideFadeContainer from '../features/SlideFadeContainer';
import { api } from "@/api/axios";
import Link from "next/link";
import CustomLoader from "../features/CustomLoader";

type FAQ = {
    _id: string;
    question: string;
    answer: string;
    category?: string;
};

const defaultFAQs = [
    { _id: "1", question: "How do I request a quote?", answer: "Simply fill out our online quote request with details about your shipment, including origin, destination, dimensions, and weight. Once we receive your request, one of our logistics experts will contact you with a customized solution tailored to your specific needs." },
    { _id: "2", question: "What are your delivery times?", answer: "Delivery times vary based on the service selected, origin, and destination. For express services, we offer next-day delivery for major routes. Standard services typically take 2-5 business days. We provide real-time tracking so you can monitor your shipment's progress." },
    { _id: "3", question: "How do I track my shipment?", answer: "You can track your shipment 24/7 through our online tracking system. Simply enter your tracking number on our website or mobile app. We also provide email and SMS notifications for important status updates throughout the delivery process." },
    { _id: "4", question: "What measures do you take to ensure the safety of my cargo?", answer: "We implement comprehensive security measures including GPS tracking, secure packaging, trained personnel, and insurance options. All our facilities are monitored 24/7, and we conduct regular security audits to maintain the highest safety standards for your cargo." },
    { _id: "5", question: "Do you offer international shipping?", answer: "Yes, we provide comprehensive international shipping services to over 150 countries worldwide. Our global network and local expertise ensure smooth customs clearance and efficient delivery to your international destinations." },
    { _id: "6", question: "What types of items can I ship?", answer: "We handle a wide range of items including documents, packages, pallets, and specialized cargo. However, we do have restrictions on hazardous materials, perishable goods, and items requiring special handling. Contact our team for specific item inquiries." },
];

const Faq: React.FC = () => {
    const [activeIndex, setActiveIndex] = useState<number | null>(0);
    const [faqs, setFaqs] = useState<FAQ[]>(defaultFAQs);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFAQs = async () => {
            try {
                const res = await api.get("/faq?active=true");
                const fetched = res.data.faqs || [];
                setFaqs(fetched.length > 0 ? fetched : defaultFAQs);
            } catch (error) {
                console.error("Failed to load FAQs");
                setFaqs(defaultFAQs);
            } finally {
                setLoading(false);
            }
        };
        fetchFAQs();
    }, []);

    const toggleFAQ = (index: number) => {
        setActiveIndex(activeIndex === index ? null : index);
    };

    return (
        <section className="relative py-20 lg:py-28 bg-white dark:bg-gray-900 overflow-hidden">
            <div className="absolute inset-0 opacity-[0.03]">
                <div className="absolute inset-0 bg-[radial-gradient(var(--bg-general)_1px,transparent_1px)] [background-size:25px_25px]"></div>
            </div>

            <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <SlideFadeContainer direction="top" delay={0.1}>
                        <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">FAQ</h2>
                    </SlideFadeContainer>
                    <SlideFadeContainer direction="top" delay={0.2}>
                        <h3 className="text-xl lg:text-2xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
                            Frequently Asked Questions
                        </h3>
                    </SlideFadeContainer>
                </div>

                {loading ? (
                    <div className="py-20">
                        <CustomLoader loading={true} />
                    </div>
                ) : (
                    <div className="space-y-4">
                        {faqs.map((faq, index) => (
                            <SlideFadeContainer key={faq._id} direction="bottom" delay={0.1 + index * 0.1}>
                                <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 hover:border-[var(--bg-general-light)] transition-all duration-300 overflow-hidden">
                                    <Link href={`/faq/${faq._id}`}>
                                        <button
                                            onClick={(e) => {
                                                e.preventDefault();
                                                toggleFAQ(index);
                                            }}
                                            className="w-full px-6 py-6 lg:px-8 lg:py-6 text-left flex items-center justify-between gap-4 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-300"
                                        >
                                            <span className="text-lg lg:text-xl font-semibold text-gray-900 dark:text-white pr-4">
                                                {faq.question}
                                            </span>
                                            <div className="flex-shrink-0 w-8 h-8 bg-[var(--bg-general-lighter)] text-[var(--bg-general)] rounded-lg flex items-center justify-center transition-all duration-300 hover:bg-[var(--bg-general)] hover:text-white">
                                                {activeIndex === index ? <MdRemove size={20} /> : <MdAdd size={20} />}
                                            </div>
                                        </button>
                                    </Link>
                                    <div className={`transition-all duration-500 ease-in-out overflow-hidden ${
                                        activeIndex === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                                    }`}>
                                        <div className="px-6 lg:px-8 pb-6 lg:pb-8">
                                            <div className="w-12 h-1 bg-[var(--bg-general)] rounded-full mb-4"></div>
                                            <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-lg">
                                                {faq.answer}
                                            </p>
                                            <Link href={`/faq/${faq._id}`} className="mt-4 inline-block text-[var(--bg-general)] font-semibold text-sm hover:underline">
                                                Read more →
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </SlideFadeContainer>
                        ))}
                    </div>
                )}

                <SlideFadeContainer direction="bottom" delay={0.7}>
                    <div className="text-center mt-16">
                        <div className="bg-gradient-to-r from-[var(--bg-general)] to-orange-600 rounded-2xl p-8 lg:p-10 text-white">
                            <h4 className="text-2xl lg:text-3xl font-bold mb-4">Still Have Questions?</h4>
                            <p className="text-orange-100 mb-6 text-lg max-w-2xl mx-auto">
                                Our support team is here to help you with any questions about our services.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Link href="/contact" className="bg-white text-gray-900 px-8 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-colors duration-300 text-center">
                                    Contact Support
                                </Link>
                                <Link href="/contact" className="border-2 border-white text-white px-8 py-3 rounded-xl font-semibold hover:bg-white hover:text-gray-900 transition-colors duration-300 text-center">
                                    Live Chat
                                </Link>
                            </div>
                        </div>
                    </div>
                </SlideFadeContainer>
            </div>
        </section>
    );
};

export default Faq;
