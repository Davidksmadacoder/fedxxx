"use client";

import React from "react";
import { Button } from "@mantine/core";
import {
  MdOutlinePhone,
  MdOutlineArrowForward,
  MdOutlineArrowForwardIos,
} from "react-icons/md";
import SlideFadeContainer from "../features/SlideFadeContainer";
import Link from "next/link";

const About: React.FC = () => {
  const stats = [
    { number: "25K", label: "Logistics Outlets" },
    { number: "150+", label: "Countries Service" },
    { number: "12M+", label: "Deliveries" },
  ];

  return (
    <section className="relative py-20 lg:py-28 bg-gradient-to-br from-slate-50 to-gray-100 dark:from-slate-900 dark:to-gray-900 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-[var(--bg-general-lighter)] rounded-full -translate-y-36 translate-x-36"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-[var(--bg-general-lighter)] rounded-full -translate-x-48 translate-y-48"></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Content */}
          <div className="relative">
            <SlideFadeContainer direction="left" delay={0.1}>
              {/* Experience Badge */}
              <div className="inline-flex items-center gap-2 bg-[var(--bg-general-lighter)] text-[var(--bg-general)] px-4 py-2 rounded-full mb-6">
                <div className="w-2 h-2 bg-[var(--bg-general)] rounded-full animate-pulse"></div>
                <span className="text-sm font-semibold">
                  25 Years Of Experience
                </span>
              </div>

              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-6">
                About Us
              </h2>

              <h3 className="text-2xl lg:text-3xl font-bold text-gray-800 dark:text-gray-100 mb-6 leading-tight">
                A Legacy of Excellence in Transportation
              </h3>

              <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
                At Fedx Global Shipping, we are more than just a transportation
                company - we're your trusted partner in navigating the
                complexities of logistics and supply chain management.
              </p>

              <p className="text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
                25 years of experience in the industry, we have built a
                reputation for excellence, reliability, customer service.
              </p>

              {/* Contact Info */}
              <div className="flex items-center gap-4 mb-8">
                <div className="flex items-center justify-center w-12 h-12 bg-[var(--bg-general)] text-white rounded-lg">
                  <MdOutlinePhone size={20} />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Contact Us
                  </p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    +075 5032 1425
                  </p>
                </div>
              </div>

              <Link href="/contact">
                <Button
                  rightSection={<MdOutlineArrowForward size={16} />}
                  size="lg"
                  color="brandOrange"
                  className="font-semibold hover:shadow-lg transition-all duration-300 hover:scale-105"
                >
                  Learn More About Us
                </Button>
              </Link>
            </SlideFadeContainer>
          </div>

          {/* Right Content - Stats */}
          <div className="relative">
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
              {stats.map((stat, index) => (
                <SlideFadeContainer
                  key={index}
                  direction="right"
                  delay={0.2 + index * 0.1}
                >
                  <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all duration-300 hover:scale-105 group">
                    <div className="text-3xl lg:text-4xl font-bold text-[var(--bg-general)] mb-2 group-hover:scale-110 transition-transform duration-300">
                      {stat.number}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-300 font-medium">
                      {stat.label}
                    </div>
                  </div>
                </SlideFadeContainer>
              ))}
            </div>

            {/* Additional Visual Element */}
            <SlideFadeContainer direction="bottom" delay={0.5}>
              <div className="mt-8 p-6 bg-gradient-to-r from-[var(--bg-general)] to-orange-600 rounded-2xl text-white">
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <h4 className="font-bold text-lg mb-2">
                      Ready to Get Started?
                    </h4>
                    <p className="text-orange-100 text-sm">
                      Join thousands of satisfied customers worldwide
                    </p>
                  </div>
                  <Button
                    variant="white"
                    color="dark"
                    size="sm"
                    className="font-semibold"
                  >
                    Get Quote
                  </Button>
                </div>
              </div>
            </SlideFadeContainer>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
