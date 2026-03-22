"use client";

import React, { useMemo, useState, useEffect } from "react";
import { Button } from "@mantine/core";
import {
    MdFlight,
    MdLocalShipping,
    MdDirectionsBoat,
    MdDirectionsRailway,
    MdWarehouse,
    MdOutlineSupportAgent,
    MdSecurity,
    MdRoute,
    MdLocalOffer,
    MdBusinessCenter,
} from "react-icons/md";
import SlideFadeContainer from "../features/SlideFadeContainer";
import { api } from "@/api/axios";
import Link from "next/link";
import CustomLoader from "../features/CustomLoader";

type Service = {
    _id: string;
    title: string;
    slug: string;
    description: string;
    fullDescription?: string;
    category: string;
    features?: string[];
    icon?: string;
    image?: string;
};

const iconMap: Record<string, React.ReactNode> = {
    "same-day": <MdLocalShipping size={32} />,
    "next-day": <MdLocalShipping size={32} />,
    "international": <MdFlight size={32} />,
    "express": <MdLocalShipping size={32} />,
    "door-to-door": <MdRoute size={32} />,
    "last-mile": <MdRoute size={32} />,
    "ecommerce": <MdLocalOffer size={32} />,
    "returns": <MdLocalShipping size={32} />,
    "cold-chain": <MdWarehouse size={32} />,
    "heavy-lift": <MdSecurity size={32} />,
    "freight-forwarding": <MdDirectionsBoat size={32} />,
    "customs": <MdOutlineSupportAgent size={32} />,
    "packaging": <MdWarehouse size={32} />,
    "insurance": <MdSecurity size={32} />,
    "consultation": <MdBusinessCenter size={32} />,
};

const Services: React.FC = () => {
    const [showAll, setShowAll] = useState(false);
    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchServices = async () => {
            try {
                const res = await api.get("/service?active=true");
                setServices(res.data.services || []);
            } catch (error) {
                console.error("Failed to load services");
            } finally {
                setLoading(false);
            }
        };
        fetchServices();
    }, []);

    const defaultServices: any[] = [
        {
            _id: "default-1",
            slug: "air-freight",
            title: "Air Freight Services",
            description: "Express global air cargo with priority handling, customs support, and end-to-end visibility.",
            category: "air-freight",
            features: ["Fast Delivery", "Global Coverage", "Priority Handling", "Tracking"],
        },
        {
            _id: "default-2",
            slug: "road-freight",
            title: "Road Freight Services",
            description: "Nationwide road transport with flexible routing, reliable timelines, and real-time updates.",
            category: "road-freight",
            features: ["Reliable", "Cost-effective", "Flexible Routes", "Timely Delivery"],
        },
        {
            _id: "default-3",
            slug: "ocean-freight",
            title: "Ocean Freight Services",
            description: "FCL/LCL ocean options with competitive rates, strong carrier partnerships, and port-to-port coverage.",
            category: "ocean-freight",
            features: ["Cost-effective", "High Capacity", "Global Ports", "Bulk Shipping"],
        },
        {
            _id: "default-4",
            slug: "rail-freight",
            title: "Rail Freight",
            description: "Efficient rail corridors for heavy cargo, offering greener transit and predictable ETAs.",
            category: "rail-freight",
            features: ["Eco-friendly", "Heavy Loads", "Predictable ETAs", "Networked Hubs"],
        },
        {
            _id: "default-5",
            slug: "warehousing",
            title: "Warehousing & Fulfillment",
            description: "Secure storage, pick-pack, and last-mile fulfillment with inventory accuracy you can trust.",
            category: "warehousing",
            features: ["Secure Storage", "Pick & Pack", "Cross-Dock", "Inventory Control"],
        },
        {
            _id: "default-6",
            slug: "customs-brokerage",
            title: "Customs Brokerage",
            description: "Clearances handled end-to-end with documentation, tariffs, and compliance taken care of.",
            category: "customs",
            features: ["Duty & Tariffs", "Documentation", "HS Codes", "Regulatory Compliance"],
        },
        {
            _id: "default-7",
            slug: "insurance",
            title: "Insurance & Risk Cover",
            description: "Cargo insurance plans tailored to protect shipments against loss, damage, and delays.",
            category: "insurance",
            features: ["All-Risk Cover", "Claims Support", "Global Policies", "Peace of Mind"],
        },
        {
            _id: "default-8",
            slug: "project-cargo",
            title: "Project & Oversized Cargo",
            description: "End-to-end planning and escorts for heavy-lift, out-of-gauge, and complex route projects.",
            category: "heavy-lift",
            features: ["Route Survey", "Permits", "Escort Vehicles", "Heavy-Lift"],
        },
        {
            _id: "default-9",
            slug: "ecommerce",
            title: "E-commerce Logistics",
            description: "Seamless B2C/B2B shipping with returns management and integrations to your storefronts.",
            category: "ecommerce",
            features: ["API Integrations", "Returns", "SLA Delivery", "COD/Prepaid"],
        },
    ];

    const displayServices = services.length > 0 ? services : defaultServices;
    const visibleServices = useMemo(
        () => (showAll ? displayServices : displayServices.slice(0, 6)),
        [showAll, displayServices]
    );

    const getIcon = (category: string) => {
        const key = category.toLowerCase().replace(/\s+/g, "-");
        return iconMap[key] || <MdLocalShipping size={32} />;
    };

    return (
        <section className="relative py-20 lg:py-28 bg-gradient-to-br from-slate-50 to-gray-100 dark:from-slate-900 dark:to-gray-900 overflow-hidden">
            {/* Background Elements */}
            <div className="absolute top-10 left-10 w-64 h-64 bg-[var(--bg-general-lighter)] rounded-full opacity-50 blur-xl" />
            <div className="absolute bottom-10 right-10 w-80 h-80 bg-[var(--bg-general-lighter)] rounded-full opacity-30 blur-xl" />

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header Section */}
                <div className="text-center mb-16">
                    <SlideFadeContainer direction="top" delay={0.1}>
                        <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                            Our Services
                        </h2>
                    </SlideFadeContainer>

                    <SlideFadeContainer direction="top" delay={0.2}>
                        <h3 className="text-xl lg:text-2xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
                            Your Gateway to Seamless Transportation
                        </h3>
                    </SlideFadeContainer>

                    <SlideFadeContainer direction="top" delay={0.3}>
                        <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto mt-4 text-lg">
                            Whether you're a small business or a multinational corporation, logistic is your trusted
                            partner for all your transportation and logistics needs.
                        </p>
                    </SlideFadeContainer>
                </div>

                {/* Services Grid */}
                {loading ? (
                    <div className="py-20">
                        <CustomLoader loading={true} />
                    </div>
                ) : (
                    <div className="grid lg:grid-cols-3 gap-8 lg:gap-6">
                        {visibleServices.map((service, idx) => (
                            <SlideFadeContainer
                                key={service._id || service.title}
                                direction="bottom"
                                delay={0.2 + idx * 0.12}
                            >
                                <Link href={service.slug ? `/services/${service.slug}` : "#services"}>
                                    <div className="group bg-white dark:bg-gray-800 rounded-2xl p-6 lg:p-8 hover:shadow-2xl border border-gray-100 dark:border-gray-700 transition-all duration-500 hover:scale-105 h-full flex flex-col cursor-pointer">
                                        {/* Icon */}
                                        <div className="flex items-center justify-center w-16 h-16 bg-[var(--bg-general-lighter)] text-[var(--bg-general)] rounded-xl mb-6 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                                            {service.icon ? (
                                                <img src={service.icon} alt={service.title} className="w-8 h-8" />
                                            ) : (
                                                getIcon(service.category)
                                            )}
                                        </div>

                                        {/* Title */}
                                        <h4 className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white mb-4 group-hover:text-[var(--bg-general)] transition-colors duration-300">
                                            {service.title}
                                        </h4>

                                        {/* Description */}
                                        <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed flex-grow">
                                            {service.description}
                                        </p>

                                        {/* Features */}
                                        {service.features && service.features.length > 0 && (
                                            <div className="mb-6">
                                                <div className="grid grid-cols-2 gap-2">
                                                    {service.features.slice(0, 4).map((feature, i) => (
                                                        <div key={i} className="flex items-center gap-2">
                                                            <div className="w-1.5 h-1.5 bg-[var(--bg-general)] rounded-full" />
                                                            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                                                                {feature}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </Link>
                            </SlideFadeContainer>
                        ))}
                    </div>
                )}

                {/* Show more / less */}
                <div className="flex justify-center mt-10">
                                <Button
                                    size="md"
                                    variant={showAll ? "outline" : "filled"}
                                    color={showAll ? "dark" : "orange"}
                                    className="font-semibold"
                                    onClick={() => setShowAll((s) => !s)}
                                    aria-expanded={showAll}
                                    aria-controls="services-grid"
                                >
                                    {showAll ? "Show less" : "Show more"}
                                </Button>
                                <Button
                                    size="md"
                                    variant="outline"
                                    color="orange"
                                    className="font-semibold ml-4"
                                    component={Link}
                                    href="/services"
                                >
                                    View All Services
                                </Button>
                </div>

                {/* Bottom CTA */}
                <SlideFadeContainer direction="bottom" delay={0.6}>
                    <div className="text-center mt-16">
                        <div className="bg-gradient-to-r from-[var(--bg-general)] to-orange-600 rounded-2xl p-8 text-white max-w-4xl mx-auto">
                            <h4 className="text-2xl font-bold mb-4">Need Custom Logistics Solutions?</h4>
                            <p className="text-orange-100 mb-6 max-w-2xl mx-auto">
                                Our experts are ready to create tailored logistics strategies for your unique business requirements.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Button 
                                    size="lg" 
                                    variant="white" 
                                    color="dark" 
                                    className="font-semibold"
                                    component={Link}
                                    href="/services/consultation"
                                >
                                    Get Free Consultation
                                </Button>
                                <Button
                                    size="lg"
                                    variant="outline"
                                    color="white"
                                    className="font-semibold border-2"
                                    component={Link}
                                    href="/services"
                                >
                                    View All Services
                                </Button>
                            </div>
                        </div>
                    </div>
                </SlideFadeContainer>
            </div>
        </section>
    );
};

export default Services;
