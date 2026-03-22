"use client";

import Layout1 from "@/components/layout/Layout1";
import About from "@/components/main-screen/About";
import Faq from "@/components/main-screen/Faq";
import Hero from "@/components/main-screen/Hero";
import Partners from "@/components/main-screen/Partners";
import Portfolio from "@/components/main-screen/Portfolio";
import Services from "@/components/main-screen/Services";
import Team from "@/components/main-screen/Team";
import Testimonials from "@/components/main-screen/Testimonials";
import WhyChooseUs from "@/components/main-screen/WhyChooseUs";
import React from "react";
import SmartsuppChat from "@/components/features/SmartsuppChat";

type Props = {};

const page: React.FC<Props> = ({}) => {
  return (
    <div>
      <Layout1>
        {/* Smartsupp live chat widget */}
        <SmartsuppChat />

        <div className="custom-black-white-theme-switch-bg custom-black-white-theme-switch-text w-full max-w-full">
          <Hero />
          <section id="about" className="section-spacing">
            <About />
          </section>
          <section id="services" className="section-spacing">
            <Services />
          </section>
          <section id="why" className="section-spacing">
            <WhyChooseUs />
          </section>
          <section id="partners" className="section-spacing">
            <Partners />
          </section>
          <section id="testimonials" className="section-spacing">
            <Testimonials />
          </section>
          <section id="team" className="section-spacing">
            <Team />
          </section>
          <section id="portfolio" className="section-spacing">
            <Portfolio />
          </section>
          <section id="faq" className="section-spacing">
            <Faq />
          </section>
        </div>
      </Layout1>
    </div>
  );
};

export default page;