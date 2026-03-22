"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { CiMenuFries } from "react-icons/ci";
import { FiX } from "react-icons/fi";
import { Button } from "@mantine/core";
import ThemeSwitcher from "../features/ThemeSwitcher";
import Logo from "../common/Logo";

const Header: React.FC = () => {
  const [menuOpen, setMenuOpen] = useState<boolean>(false);
  const [scrolled, setScrolled] = useState<boolean>(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setActive(window.location.pathname);
    }

    const handleScroll = () => {
      setScrolled(window.scrollY > 30);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const handleOutsideClick = (event: MouseEvent) => {
    if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
      setMenuOpen(false);
    }
  };

  useEffect(() => {
    if (menuOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
    } else {
      document.removeEventListener("mousedown", handleOutsideClick);
    }
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [menuOpen]);

  const navItems = [
    { label: "Home", href: "/" },
    { label: "About", href: "#about" },
    { label: "Services", href: "/services" },
    { label: "Portfolio", href: "#portfolio" },
    { label: "Contact", href: "/contact" },
  ];

  return (
    <>
      <div
        className={`sticky top-0 custom-black-white-theme-switch-bg z-[100] transition-all duration-300 ${scrolled ? "shadow-md backdrop-blur-sm bg-opacity-95" : ""}`}
      >
        {/* Support Email Banner */}
        <div
          className="w-full py-2 px-4 text-center text-xs sm:text-sm font-medium"
          style={{
            background:
              "linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(139, 92, 246, 0.08) 100%)",
            borderBottom: "1px solid rgba(59, 130, 246, 0.2)",
          }}
        >
          <p className="custom-black-white-theme-switch-text">
            Need help? Contact Support:{" "}
            <a
              href="mailto:support@clearrocktrust.com"
              className="font-bold text-[var(--bg-general)] hover:underline"
            >
              support@fedxglobalshipping.org
            </a>
          </p>
        </div>

        <nav className="auto-container min-h-16 md:min-h-18 custom-side-padding center-margin flex justify-between items-center">
          <div className="flex items-center space-x-10">
            <Logo size="xlarge" />

            <div className="hidden lg:flex items-center space-x-0">
              {navItems.map((item, index) => (
                <Link
                  key={index}
                  href={item.href}
                  onClick={() => setActive(item.href)}
                  className={`relative text-sm font-medium transition-all duration-300 ease-in-out py-4 px-5 group ${
                    active === item.href
                      ? "text-[var(--bg-general)]"
                      : "custom-black-white-theme-switch-text hover:text-[var(--bg-general)]"
                  }`}
                >
                  {item.label}
                  <span
                    className={`absolute bottom-3 left-5 right-5 h-0.5 bg-[var(--bg-general)] transform origin-center transition-transform duration-300 ${
                      active === item.href
                        ? "scale-x-100"
                        : "scale-x-0 group-hover:scale-x-100"
                    }`}
                  ></span>
                </Link>
              ))}
            </div>
          </div>

          <div className="hidden md:flex gap-3 items-center">
            <ThemeSwitcher />
            <Link href="/tracking">
              <Button
                color="brandOrange"
                size="sm"
                className="font-semibold text-white hover:shadow-md transition-all duration-300 hover:scale-105"
              >
                TRACKING
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="p-2 rounded-lg custom-black-white-theme-switch-text hover:bg-[var(--bg-general-lighter)] transition-colors duration-300"
            >
              {menuOpen ? <FiX size={20} /> : <CiMenuFries size={20} />}
            </button>
          </div>
        </nav>
      </div>

      {/* Mobile Menu */}
      <div
        ref={menuRef}
        className={`fixed top-0 z-[100] left-0 w-[85vw] max-w-80 h-full custom-black-white-theme-switch-bg p-4 sm:p-6 transition-transform duration-300 ease-in-out transform shadow-xl backdrop-blur-lg ${menuOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex justify-between items-center mb-8 pb-4 border-b border-[var(--bg-general-light)]">
          <Logo size="medium" />
          <button
            onClick={toggleMenu}
            className="p-2 rounded-lg custom-black-white-theme-switch-text hover:bg-[var(--bg-general-lighter)]"
          >
            <FiX size={20} />
          </button>
        </div>

        <div className="space-y-1">
          {navItems.map((item, index) => (
            <a
              key={index}
              href={item.href}
              onClick={() => {
                setActive(item.href);
                toggleMenu();
              }}
              className={`block py-3 px-4 text-sm font-medium transition-all duration-300 rounded-lg ${
                active === item.href
                  ? "text-[var(--bg-general)] bg-[var(--bg-general-lighter)]"
                  : "custom-black-white-theme-switch-text hover:text-[var(--bg-general)] hover:bg-[var(--bg-general-lighter)]"
              }`}
            >
              {item.label}
            </a>
          ))}
        </div>

        <div className="absolute bottom-6 left-6 right-6 space-y-3">
          <Link href="/tracking" className="block w-full" onClick={toggleMenu}>
            <Button
              color="brandOrange"
              fullWidth
              size="sm"
              className="font-semibold text-white"
            >
              TRACKING
            </Button>
          </Link>
          <div className="flex justify-center">
            <ThemeSwitcher />
          </div>
        </div>
      </div>
    </>
  );
};

export default Header;
