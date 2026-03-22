"use client";

import React from "react";
import Button1 from "@/components/ui/button/Button1";
import { MdInbox, MdLocalShipping, MdPayment, MdQuestionAnswer, MdBusiness, MdContactMail, MdSettings } from "react-icons/md";

interface EmptyStateProps {
    icon?: React.ReactNode;
    title: string;
    description?: string;
    action?: {
        label: string;
        onClick: () => void;
    };
}

const iconMap: Record<string, React.ReactNode> = {
    parcel: <MdLocalShipping size={64} />,
    payment: <MdPayment size={64} />,
    faq: <MdQuestionAnswer size={64} />,
    project: <MdBusiness size={64} />,
    contact: <MdContactMail size={64} />,
    service: <MdSettings size={64} />,
    default: <MdInbox size={64} />,
};

const EmptyState: React.FC<EmptyStateProps> = ({
    icon,
    title,
    description,
    action,
}) => {
    const displayIcon = icon || iconMap.default;

    return (
        <div className="flex items-center justify-center py-20">
            <div className="text-center max-w-md">
                <div className="flex justify-center mb-6">
                    <div className="text-gray-400 dark:text-gray-600">
                        {displayIcon}
                    </div>
                </div>
                <h3 className="text-xl font-semibold mb-2 custom-black-white-theme-switch-text">
                    {title}
                </h3>
                {description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                        {description}
                    </p>
                )}
                {action && (
                    <div className="max-w-xs mx-auto">
                        <Button1
                            text={action.label}
                            onClick={action.onClick}
                            isLoading={false}
                            loadingText="Loading..."
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default EmptyState;
