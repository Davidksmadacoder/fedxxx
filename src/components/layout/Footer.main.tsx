"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@mantine/core";
import {
  MdOutlineEmail,
  MdOutlinePhone,
  MdLocationOn,
  MdOutlineArrowForward,
} from "react-icons/md";
import Logo from "../common/Logo";
import SlideFadeContainer from "../features/SlideFadeContainer";

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { name: "Home", href: "/" },
    { name: "About Us", href: "#about" },
    { name: "Services", href: "#services" },
    { name: "Portfolio", href: "#portfolio" },
    { name: "Team", href: "#team" },
    { name: "Testimonials", href: "#testimonials" },
    { name: "FAQ", href: "#faq" },
    { name: "Contact", href: "#contact" },
  ];

  const services = [
    { name: "Same-Day Delivery", href: "/services/same-day" },
    { name: "Next-Day Delivery", href: "/services/next-day" },
    { name: "International Shipping", href: "/services/international" },
    { name: "Express Delivery", href: "/services/express" },
    { name: "Door-to-Door Delivery", href: "/services/door-to-door" },
    { name: "Last-Mile Delivery", href: "/services/last-mile" },
    { name: "E-commerce Fulfillment", href: "/services/ecommerce" },
    { name: "Reverse Logistics", href: "/services/returns" },
    { name: "Cold Chain", href: "/services/cold-chain" },
    { name: "Heavy Lift Cargo", href: "/services/heavy-lift" },
    { name: "Freight Forwarding", href: "/services/freight-forwarding" },
    { name: "Customs Brokerage", href: "/services/customs" },
    { name: "Packaging & Crating", href: "/services/packaging" },
    { name: "Cargo Insurance", href: "/services/insurance" },
    { name: "Consultation", href: "/services/consultation" },
  ];

  return (
    <footer className="relative bg-gray-900 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[radial-gradient(var(--bg-general)_1px,transparent_1px)] [background-size:20px_20px]"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="py-16 lg:py-20">
          <div className="grid lg:grid-cols-4 gap-8 lg:gap-12">
            {/* Company Info */}
            <div className="lg:col-span-1">
              <SlideFadeContainer direction="left" delay={0.1}>
                <div className="mb-6">
                  <Logo size="large" />
                </div>
                <p className="text-gray-300 leading-relaxed mb-6 text-sm">
                  Fedx Global Shipping is a digital and trusted transport
                  logistic company. With our commitment to excellence and
                  dedication to customer satisfaction, we streamline supply
                  chain and drive your business forward.
                </p>
                <Button
                  rightSection={<MdOutlineArrowForward size={16} />}
                  color="brandOrange"
                  size="sm"
                  className="font-semibold hover:shadow-lg transition-all duration-300"
                >
                  Get Started
                </Button>
              </SlideFadeContainer>
            </div>

            {/* Quick Links */}
            <div className="lg:col-span-1">
              <SlideFadeContainer direction="bottom" delay={0.2}>
                <h3 className="text-white font-bold text-lg mb-6">
                  Quick Links
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {quickLinks.map((link, index) => (
                    <Link
                      key={index}
                      href={link.href}
                      className="text-gray-300 hover:text-[var(--bg-general)] text-sm transition-all duration-300 py-2 hover:translate-x-2 transform"
                    >
                      {link.name}
                    </Link>
                  ))}
                </div>
              </SlideFadeContainer>
            </div>

            {/* Services */}
            <div className="lg:col-span-1">
              <SlideFadeContainer direction="bottom" delay={0.3}>
                <h3 className="text-white font-bold text-lg mb-6">
                  Our Services
                </h3>
                <div className="space-y-2 max-h-96 overflow-y-auto custom-scrollbar">
                  {services.map((service, index) => (
                    <Link
                      key={index}
                      href={service.href}
                      className="text-gray-300 text-sm flex items-center gap-2 py-1 group hover:text-[var(--bg-general)] transition-colors duration-300"
                    >
                      <div className="w-1.5 h-1.5 bg-[var(--bg-general)] rounded-full group-hover:scale-125 transition-transform duration-300"></div>
                      {service.name}
                    </Link>
                  ))}
                </div>
              </SlideFadeContainer>
            </div>

            {/* Contact Info */}
            <div className="lg:col-span-1">
              <SlideFadeContainer direction="right" delay={0.4}>
                <h3 className="text-white font-bold text-lg mb-6">
                  Contact Info
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[var(--bg-general-lighter)] text-[var(--bg-general)] rounded-lg flex items-center justify-center">
                      <MdLocationOn size={18} />
                    </div>
                    <div>
                      <p className="text-white text-sm font-medium">Location</p>
                      <p className="text-gray-300 text-sm">
                        Global Headquarters
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[var(--bg-general-lighter)] text-[var(--bg-general)] rounded-lg flex items-center justify-center">
                      <MdOutlinePhone size={18} />
                    </div>
                    <div>
                      <p className="text-white text-sm font-medium">Phone</p>
                      <a
                        href="tel:+107550321425"
                        className="text-gray-300 text-sm hover:text-[var(--bg-general)] transition-colors duration-300"
                      >
                        +1 075 5032 1425
                      </a>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[var(--bg-general-lighter)] text-[var(--bg-general)] rounded-lg flex items-center justify-center">
                      <MdOutlineEmail size={18} />
                    </div>
                    <div>
                      <p className="text-white text-sm font-medium">Email</p>
                      <a
                        href="mailto:support@fedxglobalshipping.org"
                        className="text-gray-300 text-sm hover:text-[var(--bg-general)] transition-colors duration-300"
                      >
                        support@fedxglobalshipping.org
                      </a>
                    </div>
                  </div>
                </div>
              </SlideFadeContainer>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-700 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <SlideFadeContainer direction="left" delay={0.5}>
              <p className="text-gray-400 text-sm">
                © {currentYear} Fedx Global Shipping. All rights reserved.
              </p>
            </SlideFadeContainer>

            <SlideFadeContainer direction="right" delay={0.5}>
              <div className="flex gap-6 text-gray-400 text-sm">
                <Link
                  href="/privacy"
                  className="hover:text-[var(--bg-general)] transition-colors duration-300"
                >
                  Privacy Policy
                </Link>
                <Link
                  href="/terms"
                  className="hover:text-[var(--bg-general)] transition-colors duration-300"
                >
                  Terms of Service
                </Link>
                <Link
                  href="/cookies"
                  className="hover:text-[var(--bg-general)] transition-colors duration-300"
                >
                  Cookie Policy
                </Link>
              </div>
            </SlideFadeContainer>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
