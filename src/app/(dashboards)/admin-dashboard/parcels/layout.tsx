"use client";
import React from "react";

export default function ParcelsLayout({ children }: { children: React.ReactNode }) {
    return <div className="custom-side-padding">{children}</div>;
}
