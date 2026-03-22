"use client";

import React from "react";
import { IconType } from "react-icons";

export const BalanceCard: React.FC<{
    title: string;
    amount: number;
    live?: boolean;
    icon?: IconType;
    iconColor?: string;
}> = ({ title, amount, live = true, icon: Icon, iconColor = "text-white" }) => {
    const [isClient, setIsClient] = React.useState(false);
    
    React.useEffect(() => {
        setIsClient(true);
    }, []);
    
    const formattedAmount = isClient ? amount.toLocaleString() : amount.toString();
    const amountLength = formattedAmount.replace(/[^0-9]/g, "").length;

    let amountFontSize = "text-4xl";
    if (amountLength > 9) {
        amountFontSize = "text-xl";
    } else if (amountLength > 6) {
        amountFontSize = "text-2xl";
    } else if (amountLength > 4) {
        amountFontSize = "text-3xl";
    }

    return (
        <div className="rounded-md p-5 w-full max-w-sm bg-[var(--bg-general-lighter)] border-[0.5px] border-[var(--bg-general-lighter)]">
            <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-zinc-400">{title}</span>
                {live && (
                    <span className="flex items-center text-xs text-green-500">
                        <span className="relative flex h-2 w-2 mr-1">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                        </span>
                        Live
                    </span>
                )}
            </div>
            <div className="flex items-center justify-between gap-3">
                <div className={`font-semibold ${amountFontSize}`}>${formattedAmount}</div>
                {Icon && <Icon className={`text-3xl ${iconColor}`} />}
            </div>
        </div>
    );
};
