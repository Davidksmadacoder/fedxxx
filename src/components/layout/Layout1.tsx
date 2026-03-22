import React from "react";
import Header from "./Header.main";
import Footer from "./Footer.main";
import Heading from "../common/Heading";

type Props = {
  children: React.ReactNode;
};

const Layout1: React.FC<Props> = ({ children }) => {
  return (
    <div>
      <Heading
        title="Fedx Global Shipping | Digital & Trusted Transport Logistic Company"
        description="Streamline your logistics with Fedx Global Shipping. Reliable transportation, tracking, and supply chain management services."
        keywords="Cargo Pulse, logistics, transport, courier, tracking, freight, shipping"
      />
      <Header />
      <main className="w-full max-w-full overflow-x-hidden">{children}</main>
      <Footer />
    </div>
  );
};

export default Layout1;
