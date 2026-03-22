"use client";

import React, { useMemo, useState } from "react";
import Layout1 from "@/components/layout/Layout1";
import SlideFadeContainer from "@/components/features/SlideFadeContainer";
import toast from "react-hot-toast";
import { api } from "@/api/axios";

import { z } from "zod";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  MdOutlineEmail,
  MdOutlinePhone,
  MdLocationOn,
  MdSend,
  MdSchedule,
} from "react-icons/md";

import { Button } from "@/components/ui/button/Button";
import { TextInput } from "@/components/ui/input/TextInput";
import { Textarea } from "@/components/ui/textarea/Textarea";
import { Select } from "@/components/ui/select/Select";

/* -------------------------------------------------------------------------- */
/*                                   Schema                                   */
/* -------------------------------------------------------------------------- */

const ContactSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Please enter a valid email"),
  phone: z.string().optional(),
  type: z
    .enum(["GENERAL", "SUPPORT", "SALES", "TECHNICAL", "COMPLAINT", "FEEDBACK"])
    .default("GENERAL"),
  subject: z.string().min(1, "Subject is required"),
  message: z
    .string()
    .min(1, "Message is required")
    .min(10, "Message should be at least 10 characters"),
});

type ContactFormData = z.infer<typeof ContactSchema>;

export default function ContactPage() {
  const [submitting, setSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormData>({
    resolver: zodResolver(ContactSchema),
    mode: "onTouched",
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      type: "GENERAL",
      subject: "",
      message: "",
    },
  });

  const inquiryOptions = useMemo(
    () => [
      { value: "GENERAL", label: "General Inquiry" },
      { value: "SUPPORT", label: "Support" },
      { value: "SALES", label: "Sales" },
      { value: "TECHNICAL", label: "Technical" },
      { value: "COMPLAINT", label: "Complaint" },
      { value: "FEEDBACK", label: "Feedback" },
    ],
    [],
  );

  const contactInfo = useMemo(
    () => [
      {
        icon: <MdLocationOn size={28} />,
        title: "Address",
        content: "Global Headquarters",
        subContent: "Worldwide Shipping Network",
        gradient: "from-blue-500 to-cyan-600",
      },
      {
        icon: <MdOutlinePhone size={28} />,
        title: "Phone",
        content: "+1 075 5032 1425",
        subContent: "Available 24/7",
        gradient: "from-green-500 to-emerald-600",
        href: "tel:+107550321425",
      },
      {
        icon: <MdOutlineEmail size={28} />,
        title: "Email",
        content: "support@fedxglobalshipping.org",
        subContent: "We respond within 24 hours",
        gradient: "from-purple-500 to-indigo-600",
        href: "mailto:support@fedxglobalshipping.org",
      },
    ],
    [],
  );

  const onSubmit = async (data: ContactFormData) => {
    setSubmitting(true);
    try {
      await api.post("/contact", data);
      toast.success("Your message has been sent successfully!");
      reset();
    } catch (error: any) {
      toast.error(error?.response?.data?.error || "Failed to send message");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout1>
      <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-950 dark:to-slate-950">
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: "url('/images/tracking.jpg')" }}
          />
          <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/65 to-black/80" />
          <div className="absolute inset-0 bg-[url('/images/shape/grid-01.svg')] opacity-[0.06]" />
          <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-[var(--bg-general)]/15 blur-3xl" />
          <div className="absolute -bottom-24 -right-24 h-[28rem] w-[28rem] rounded-full bg-blue-500/15 blur-3xl" />

          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="py-20 sm:py-24 lg:py-28">
              <div className="mx-auto max-w-3xl text-center">
                <SlideFadeContainer direction="top" delay={0.08}>
                  <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 backdrop-blur">
                    <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
                    <span className="text-sm font-medium text-white/90">
                      Get in Touch
                    </span>
                  </div>
                </SlideFadeContainer>

                <SlideFadeContainer direction="bottom" delay={0.16}>
                  <h1 className="mt-6 text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
                    Contact{" "}
                    <span
                      style={{ color: "var(--accent-primary-on-dark)" }}
                      className="bg-gradient-to-r from-[var(--accent-primary-on-dark)] to-[var(--accent-secondary-on-dark)] bg-clip-text text-transparent"
                    >
                      Us
                    </span>
                  </h1>
                </SlideFadeContainer>

                <SlideFadeContainer direction="bottom" delay={0.24}>
                  <p className="mt-5 text-base leading-relaxed text-white/80 sm:text-lg">
                    Questions, support, quotes, or feedback — send a message and
                    our team will respond as quickly as possible.
                  </p>
                </SlideFadeContainer>
              </div>
            </div>
          </div>
        </section>

        {/* Main */}
        <section className="relative py-14 sm:py-16 lg:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {/* Cards */}
            <div className="grid gap-6 md:grid-cols-3">
              {contactInfo.map((info, idx) => {
                const CardInner = (
                  <div className="group h-full rounded-2xl border border-slate-200 bg-white/85 p-6 shadow-sm backdrop-blur transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900/60">
                    <div
                      className={`mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${info.gradient} text-white shadow-md transition-transform duration-300 group-hover:rotate-2 group-hover:scale-105`}
                    >
                      {info.icon}
                    </div>
                    <h3 className="text-center text-lg font-semibold text-slate-900 dark:text-white">
                      {info.title}
                    </h3>
                    <p className="mt-2 text-center font-semibold text-slate-900 dark:text-white">
                      {info.content}
                    </p>
                    <p className="mt-1 text-center text-sm text-slate-600 dark:text-slate-300">
                      {info.subContent}
                    </p>
                  </div>
                );

                return (
                  <SlideFadeContainer
                    key={info.title}
                    direction="bottom"
                    delay={0.08 + idx * 0.08}
                  >
                    {info.href ? (
                      <a
                        href={info.href}
                        className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--border-focus)]/40 rounded-2xl"
                      >
                        {CardInner}
                      </a>
                    ) : (
                      CardInner
                    )}
                  </SlideFadeContainer>
                );
              })}
            </div>

            {/* Form + Side */}
            <div className="mt-10 grid gap-8 lg:mt-14 lg:grid-cols-2">
              {/* Form */}
              <SlideFadeContainer direction="left" delay={0.18}>
                <div className="rounded-3xl border custom-black-white-theme-switch-bg custom-black-white-theme-switch-text border-slate-200 p-7 shadow-xl backdrop-blur dark:border-slate-800 sm:p-9">
                  <div className="mb-7 flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--bg-general-lighter)] text-[var(--bg-general)]">
                      <MdSend size={22} />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold custom-black-white-theme-switch-text">
                        Send a Message
                      </h2>
                      <p className="mt-1 text-sm custom-black-white-theme-switch-text">
                        We’ll reply as soon as possible.
                      </p>
                    </div>
                  </div>

                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                    <Controller
                      name="name"
                      control={control}
                      render={({ field }) => (
                        <TextInput
                          label="Name"
                          placeholder="Your full name"
                          required
                          value={field.value}
                          onChange={field.onChange}
                          error={errors.name?.message}
                        />
                      )}
                    />

                    <Controller
                      name="email"
                      control={control}
                      render={({ field }) => (
                        <TextInput
                          label="Email"
                          type="email"
                          placeholder="you@example.com"
                          required
                          leftSection={<MdOutlineEmail size={18} />}
                          value={field.value}
                          onChange={field.onChange}
                          error={errors.email?.message}
                        />
                      )}
                    />

                    <Controller
                      name="phone"
                      control={control}
                      render={({ field }) => (
                        <TextInput
                          label="Phone (optional)"
                          type="tel"
                          placeholder="+1 234 567 8900"
                          leftSection={<MdOutlinePhone size={18} />}
                          value={field.value || ""}
                          onChange={field.onChange}
                          error={errors.phone?.message}
                        />
                      )}
                    />

                    <Controller
                      name="type"
                      control={control}
                      render={({ field }) => (
                        <Select
                          label="Inquiry Type"
                          placeholder="Select inquiry type"
                          data={inquiryOptions}
                          value={field.value}
                          onChange={(v) =>
                            field.onChange(
                              (v || "GENERAL") as ContactFormData["type"],
                            )
                          }
                          required
                          error={errors.type?.message}
                        />
                      )}
                    />

                    <Controller
                      name="subject"
                      control={control}
                      render={({ field }) => (
                        <TextInput
                          label="Subject"
                          placeholder="What is this regarding?"
                          required
                          value={field.value}
                          onChange={field.onChange}
                          error={errors.subject?.message}
                        />
                      )}
                    />

                    <Controller
                      name="message"
                      control={control}
                      render={({ field }) => (
                        <Textarea
                          label="Message"
                          placeholder="Tell us how we can help..."
                          minRows={6}
                          required
                          value={field.value}
                          onChange={field.onChange}
                          error={errors.message?.message}
                          helperText="Please include any relevant tracking number or reference."
                        />
                      )}
                    />

                    <Button
                      type="submit"
                      size="lg"
                      color="var(--brand-secondary)"
                      fullWidth
                      rightSection={<MdSend size={20} />}
                      loading={submitting}
                      className="shadow-sm hover:shadow-lg"
                    >
                      Send Message
                    </Button>

                    <p className="text-xs custom-black-white-theme-switch-text">
                      By sending this message, you agree we may contact you
                      about your request.
                    </p>
                  </form>
                </div>
              </SlideFadeContainer>

              {/* Side panel */}
              <SlideFadeContainer direction="right" delay={0.24}>
                <div className="space-y-6">
                  <div className="rounded-3xl bg-gradient-to-br from-[var(--brand-primary)] to-[var(--brand-secondary)] p-7 text-white shadow-xl sm:p-9">
                    <div className="mb-6 flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 backdrop-blur">
                        <MdSchedule size={22} />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold">Business Hours</h3>
                        <p className="mt-1 text-sm text-white/80">
                          We’re online globally.
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3 text-sm">
                      <div className="flex items-center justify-between border-b border-white/15 pb-3">
                        <span className="font-semibold">Mon – Fri</span>
                        <span>9:00 AM – 6:00 PM</span>
                      </div>
                      <div className="flex items-center justify-between border-b border-white/15 pb-3">
                        <span className="font-semibold">Saturday</span>
                        <span>10:00 AM – 4:00 PM</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-semibold">Sunday</span>
                        <span>Closed</span>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-3xl border border-slate-200 bg-white/90 p-7 shadow-xl backdrop-blur dark:border-slate-800 dark:bg-slate-900/60 sm:p-9">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                      Why Contact Us?
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                      Whether you’re shipping personal items or managing
                      business logistics, our team can help you move faster with
                      fewer issues.
                    </p>

                    <div className="mt-6 space-y-3">
                      {[
                        "Get quotes for shipments",
                        "Track packages in real-time",
                        "Resolve delivery issues quickly",
                        "Request logistics consultation",
                        "Learn about new services",
                      ].map((item) => (
                        <div key={item} className="flex items-start gap-3">
                          <div className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-lg bg-[var(--bg-general-lighter)] text-[var(--bg-general)]">
                            <MdSend size={14} />
                          </div>
                          <p className="text-sm text-slate-700 dark:text-slate-200">
                            {item}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </SlideFadeContainer>
            </div>
          </div>
        </section>
      </div>
    </Layout1>
  );
}
