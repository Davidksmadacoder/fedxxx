import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Track Your Parcel - Fedx Global Shipping",
  description:
    "Track your shipment in real-time with detailed updates and live location tracking",
};

export default function TrackingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">{children}</div>
  );
}
