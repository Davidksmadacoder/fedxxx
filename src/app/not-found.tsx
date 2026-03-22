import Image from "next/image";
import Link from "next/link";
import React from "react";

export default function NotFound() {
    return (
        <div className="relative flex flex-col items-center justify-center min-h-screen p-6 overflow-hidden z-1 custom-black-white-theme-switch-bg">
            <div className="mx-auto w-full max-w-[242px] text-center sm:max-w-[472px]">
                <h1 className="mb-8 font-bold custom-black-white-theme-switch-text text-title-md xl:text-title-2xl">
                    ERROR
                </h1>

                <Image
                    src="/images/404-dark.svg"
                    alt="404"
                    width={472}
                    height={152}
                />

                <p className="mt-10 mb-6 text-base custom-black-white-theme-switch-text sm:text-lg">
                    We can’t seem to find the page you are looking for!
                </p>

                <Link
                    href="/"
                    className="inline-flex items-center justify-center rounded-lg border border-gray-300 custom-black-white-theme-switch-bg px-5 py-3.5 text-sm font-medium custom-black-white-theme-switch-text shadow-theme-xs hover:bg-gray-50 hover:text-gray-800"
                >
                    Back to Home Page
                </Link>
            </div>
        </div>
    );
}