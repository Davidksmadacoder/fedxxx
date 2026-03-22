import GridShape from "@/components/common/GridShape";
import Logo from "@/components/common/Logo";
import React from "react";
import { MdLocalShipping, MdSchedule, MdSecurity, MdTrackChanges } from "react-icons/md";

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="relative p-6 sm:p-0 z-1 custom-black-white-theme-switch-bg custom-black-white-theme-switch-text">
            <div className="relative flex lg:flex-row w-full h-screen justify-center flex-col sm:p-0">
                {children}
                <div className="lg:w-1/2 w-full h-full lg:grid items-center hidden border-l border-[var(--bg-general-light)] px-1">
                    <div className="relative items-center justify-center flex z-1">
                        {/* <!-- ===== Common Grid Shape Start ===== --> */}
                        <GridShape />
                        <div className="flex flex-col max-w-xl w-full">
                            <Logo size="xlarge" />
                            <br />
                            <br />
                            <p className="custom-black-white-theme-switch-text text-lg font-medium text-right leading-relaxed">
                                Your Trusted Partner in Global Logistics. <br />
                                Experience seamless shipping with real-time tracking, <br />
                                secure handling, and 24/7 customer support—all in one platform.
                            </p>

                            {/* Features Grid */}
                            <div className="mt-8 grid grid-cols-2 gap-4">
                                <div className="flex items-center gap-3 p-3 border border-[var(--bg-general-light)] rounded-lg">
                                    <div className="w-10 h-10 bg-[var(--bg-general-lighter)] rounded-lg flex items-center justify-center">
                                        <MdTrackChanges className="text-[var(--bg-general)]" size={20} />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-sm">Real-time Tracking</h4>
                                        <p className="text-xs text-gray-600 dark:text-gray-400">Live updates</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 p-3 border border-[var(--bg-general-light)] rounded-lg">
                                    <div className="w-10 h-10 bg-[var(--bg-general-lighter)] rounded-lg flex items-center justify-center">
                                        <MdLocalShipping className="text-[var(--bg-general)]" size={20} />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-sm">Global Network</h4>
                                        <p className="text-xs text-gray-600 dark:text-gray-400">150+ Countries</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 p-3 border border-[var(--bg-general-light)] rounded-lg">
                                    <div className="w-10 h-10 bg-[var(--bg-general-lighter)] rounded-lg flex items-center justify-center">
                                        <MdSchedule className="text-[var(--bg-general)]" size={20} />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-sm">24/7 Support</h4>
                                        <p className="text-xs text-gray-600 dark:text-gray-400">Always available</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 p-3 border border-[var(--bg-general-light)] rounded-lg">
                                    <div className="w-10 h-10 bg-[var(--bg-general-lighter)] rounded-lg flex items-center justify-center">
                                        <MdSecurity className="text-[var(--bg-general)]" size={20} />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-sm">Secure Handling</h4>
                                        <p className="text-xs text-gray-600 dark:text-gray-400">Protected delivery</p>
                                    </div>
                                </div>
                            </div>

                            {/* Trust Badge */}
                            <div className="mt-6 p-4 border border-[var(--bg-general-light)] rounded-lg bg-[var(--bg-general-lighter)]">
                                <h3 className="text-[var(--bg-general)] font-semibold mb-2 flex items-center gap-2">
                                    <MdSecurity size={16} />
                                    Trusted & Secure
                                </h3>
                                <p className="text-sm custom-black-white-theme-switch-text">
                                    All shipments are fully insured and tracked. Your packages are protected from pickup to delivery with our comprehensive security measures.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}