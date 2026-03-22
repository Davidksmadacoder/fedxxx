import Image from "next/image";
import Link from "next/link";
import React from "react";

type LogoProps = {
  size?: "small" | "medium" | "large" | "xlarge" | "xxlarge";
  showText?: boolean;
};

const sizeClasses = {
  small: {
    width: 30,
    height: 30,
    textSize: "text-sm",
    gap: "space-x-2",
  },
  medium: {
    width: 40,
    height: 40,
    textSize: "text-base",
    gap: "space-x-2",
  },
  large: {
    width: 60,
    height: 60,
    textSize: "text-xl",
    gap: "space-x-3",
  },
  xlarge: {
    width: 160,
    height: 160,
    textSize: "text-2xl",
    gap: "space-x-3",
  },
  xxlarge: {
    width: 220,
    height: 220,
    textSize: "text-5xl",
    gap: "space-x-4",
  },
};

const Logo: React.FC<LogoProps> = ({ size = "medium", showText = true }) => {
  const currentSize = sizeClasses[size];

  return (
    <Link href="/" className={`flex items-center ${currentSize.gap}`}>
      <Image
        src="/images/logo2.png"
        alt="Fedx Global Shipping Logo"
        width={currentSize.width}
        height={currentSize.height}
        priority
        style={{ width: "auto", height: "auto" }}
        className="object-contain"
      />
    </Link>
  );
};

export default Logo;
