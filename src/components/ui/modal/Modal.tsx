"use client";

import React, { useEffect, useId, useRef } from "react";
import { FaTimes } from "react-icons/fa";
import Image from "next/image";

/* -------------------------------------------------------------------------------------------------
 * Small utility: className joiner (no external deps)
 * ------------------------------------------------------------------------------------------------- */
function cn(...classes: Array<string | undefined | null | false>) {
  return classes.filter(Boolean).join(" ");
}

interface ModalProps {
  children: React.ReactNode;
  opened: boolean;
  onClose: () => void;

  /** Header content */
  title?: React.ReactNode;
  description?: string;

  /** Sizing */
  size?: "sm" | "md" | "lg" | "xl";

  /** Layout */
  centered?: boolean;
  className?: string;
  contentClassName?: string;

  /**
   * Logo behavior:
   * - showLogo: show the default logo (Image) in header
   * - If you pass a title that already contains a <Logo /> component, set showLogo={false}
   *   so you don't get "two logos".
   */
  showLogo?: boolean;

  /** Optional custom header slot (advanced) */
  headerRight?: React.ReactNode;

  /** Close behavior */
  closeOnBackdrop?: boolean;
  closeOnEsc?: boolean;

  /** Accessibility */
  "aria-label"?: string;
}

const sizeClasses: Record<NonNullable<ModalProps["size"]>, string> = {
  sm: "max-w-[95vw] sm:max-w-md",
  md: "max-w-[95vw] sm:max-w-lg",
  lg: "max-w-[95vw] sm:max-w-2xl",
  xl: "max-w-[95vw] sm:max-w-2xl lg:max-w-4xl",
};

/* -------------------------------------------------------------------------------------------------
 * Focus helpers
 * ------------------------------------------------------------------------------------------------- */
const FOCUSABLE =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

function getFocusable(root: HTMLElement | null) {
  if (!root) return [];
  return Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
    (el) => !el.hasAttribute("disabled") && el.tabIndex !== -1,
  );
}

export const Modal: React.FC<ModalProps> = ({
  children,
  opened,
  onClose,
  title,
  description,
  size = "md",
  centered = true,
  className = "",
  contentClassName = "",
  showLogo = true,
  headerRight,
  closeOnBackdrop = true,
  closeOnEsc = true,
  ...aria
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  const reactId = useId();
  const titleId = `modal-title-${reactId}`;
  const descId = `modal-desc-${reactId}`;

  // Lock scroll + restore focus
  useEffect(() => {
    if (!opened) return;

    previousActiveElement.current = document.activeElement as HTMLElement;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // Focus first focusable (or modal container)
    const t = window.setTimeout(() => {
      const focusables = getFocusable(modalRef.current);
      (focusables[0] ?? modalRef.current)?.focus();
    }, 0);

    return () => {
      window.clearTimeout(t);
      document.body.style.overflow = prevOverflow;
      previousActiveElement.current?.focus?.();
    };
  }, [opened]);

  // ESC close
  useEffect(() => {
    if (!opened || !closeOnEsc) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [opened, closeOnEsc, onClose]);

  // Basic focus trap (Tab / Shift+Tab)
  useEffect(() => {
    if (!opened) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;

      const focusables = getFocusable(modalRef.current);
      if (focusables.length === 0) {
        e.preventDefault();
        modalRef.current?.focus();
        return;
      }

      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = document.activeElement as HTMLElement | null;

      if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      } else if (e.shiftKey && active === first) {
        e.preventDefault();
        last.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [opened]);

  if (!opened) return null;

  return (
    <div
      className={cn(
        "fixed inset-0 z-50",
        "flex items-center justify-center",
        "p-2 sm:p-4",
        "bg-black/50 backdrop-blur-sm",
        "overflow-y-auto",
      )}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? titleId : undefined}
      aria-describedby={description ? descId : undefined}
      onMouseDown={(e) => {
        if (!closeOnBackdrop) return;
        // only close if user clicked the backdrop (not inside the panel)
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={modalRef}
        tabIndex={-1}
        className={cn(
          "w-full",
          sizeClasses[size],
          "max-h-[95vh] sm:max-h-[90vh]",
          "overflow-hidden",
          "flex flex-col",
          "rounded-2xl",
          "shadow-2xl",
          "custom-black-white-theme-switch-bg",
          "border border-[var(--brand-primary-lighter)]",
          centered ? "my-auto" : "my-2 sm:my-4",
          className,
        )}
      >
        {/* Header */}
        <div
          className={cn(
            "flex items-start justify-between gap-4",
            "p-5 sm:p-7",
            "border-b border-[var(--brand-primary-lighter)]",
            "bg-[var(--brand-primary-light)]/40",
          )}
        >
          <div className="flex-1 min-w-0">
            {/* IMPORTANT: showLogo controls whether we render the Image logo.
                           If your title already contains <Logo />, set showLogo={false}. */}
            {showLogo ? (
              <div className="mb-3">
                <Image
                  src="/images/logo2.png"
                  alt="Fedx Global Shipping Logo"
                  width={44}
                  height={44}
                  className="object-contain"
                  priority={false}
                />
              </div>
            ) : null}

            {title ? (
              <h2
                id={titleId}
                className={cn(
                  "text-xl sm:text-2xl font-bold",
                  "tracking-tight",
                  "custom-black-white-theme-switch-text",
                  "truncate",
                )}
              >
                {title}
              </h2>
            ) : null}

            {description ? (
              <p
                id={descId}
                className="mt-2 text-sm sm:text-base custom-black-white-theme-switch-text leading-relaxed max-w-2xl"
              >
                {description}
              </p>
            ) : null}
          </div>

          <div className="flex items-center gap-2">
            {headerRight}
            <button
              type="button"
              onClick={onClose}
              className={cn(
                "p-2 rounded-xl",
                "hover:bg-[var(--brand-primary-light)]/60",
                "transition-all duration-200",
                "custom-black-white-theme-switch-text",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--border-focus)]/40 dark:focus-visible:ring-[var(--accent-primary-on-dark)]/75",
                "active:scale-95",
              )}
              aria-label={aria["aria-label"] ?? "Close modal"}
            >
              <FaTimes size={18} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div
          className={cn(
            "flex-1 overflow-y-auto custom-scrollbar p-5 sm:p-7",
            contentClassName,
          )}
        >
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
