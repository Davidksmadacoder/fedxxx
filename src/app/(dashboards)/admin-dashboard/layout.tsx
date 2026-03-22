"use client";

import React, { useState } from "react";
import Sidebar1 from "@/components/ui/sidebar/Sidebar1";
import type { NavItem } from "@/components/ui/sidebar/Sidebar1";
import Header from "@/components/user-dashboard/Header";
import { MdOutlineDashboard } from "react-icons/md";
import { FaBox, FaTruck, FaCreditCard, FaDollarSign, FaExclamationTriangle, FaCog } from "react-icons/fa";
import { IoMdClose, IoMdMenu } from "react-icons/io";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const navItems = [
        { label: "Overview", href: "/admin-dashboard", icon: <MdOutlineDashboard /> },
        { 
            label: "Shipments", 
            href: "/admin-dashboard/parcels", 
            icon: <FaBox />,
            children: [
                { label: "All Parcels", href: "/admin-dashboard/parcels", icon: <FaBox /> },
                { label: "Transport Means", href: "/admin-dashboard/transportMeans", icon: <FaTruck /> },
            ]
        },
        { 
            label: "Payments", 
            href: "/admin-dashboard/payments", 
            icon: <FaDollarSign />,
            children: [
                // { label: "All Payments", href: "/admin-dashboard/payments", icon: <FaDollarSign /> },
                { label: "Payment Methods", href: "/admin-dashboard/paymentMethods", icon: <FaCreditCard /> },
                // { label: "Pricing", href: "/admin-dashboard/pricing", icon: <FaCog /> },
            ]
        },
        { label: "Issues", href: "/admin-dashboard/issues", icon: <FaExclamationTriangle /> },
        { 
            label: "Content", 
            href: "/admin-dashboard/services", 
            icon: <FaCog />,
            children: [
                { label: "Services", href: "/admin-dashboard/services", icon: <FaCog /> },
                { label: "Testimonials", href: "/admin-dashboard/testimonials", icon: <FaCog /> },
                { label: "Projects", href: "/admin-dashboard/projects", icon: <FaCog /> },
                { label: "FAQs", href: "/admin-dashboard/faqs", icon: <FaCog /> },
                { label: "Contacts", href: "/admin-dashboard/contacts", icon: <FaCog /> },
            ]
        },
    ];

    return (
        <main className="flex min-h-screen w-full flex-col">
            <Header />
            <div className="flex flex-1 pt-16">
                <Sidebar1 isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} navItems={navItems} />
                <div className="flex-1 p-4 ml-0 md:ml-56 custom-black-white-theme-switch-bg custom-black-white-theme-switch-text">
                    {children}
                </div>
                <button
                    className="fixed bottom-4 right-4 z-[100] p-3 bg-[var(--bg-general)] rounded-full md:hidden"
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                >
                    {isSidebarOpen ? <IoMdClose size={24} /> : <IoMdMenu size={24} />}
                </button>
            </div>
        </main>
    );
}
