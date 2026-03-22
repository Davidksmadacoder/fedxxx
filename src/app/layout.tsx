import { DM_Sans, Geist_Mono } from "next/font/google";
import './globals.css';
import { createTheme, MantineProvider } from "@mantine/core";
import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';
import { ThemeProvider } from "@/contexts/ThemeContext";
import { Toaster } from "react-hot-toast";
import UserProvider from "@/contexts/UserContext";
import LoaderProvider from "@/contexts/LoaderContext";
import { MotionProvider } from "@/contexts/MotionProvider";
import MotionWrapper from "@/contexts/MotionWrapper";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const brandPurple = [
  "#efe7f6",
  "#e0cfee",
  "#c1a0df",
  "#a06dcf",
  "#8646c2",
  "#732db8",
  "#681faf",
  "#57179c",
  "#4d148c",
  "#3f1172",
] as const;

const brandOrange = [
  "#fff0e5",
  "#ffd8bf",
  "#ffb185",
  "#ff8b4d",
  "#ff7526",
  "#ff6200",
  "#ed5b00",
  "#cf4f00",
  "#b84600",
  "#993a00",
] as const;

const theme = createTheme({
    primaryColor: "brandPurple",
    colors: {
        brandPurple,
        brandOrange,
    },
    fontFamily: `var(--font-dm-sans), sans-serif`,
    fontFamilyMonospace: `var(--font-geist-mono), monospace`,
    breakpoints: {
        xs: "30em",
        sm: "48em",
        md: "64em",
        lg: "74em",
        xl: "90em",
    },
});

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" className={`${dmSans.variable} ${geistMono.variable}`}>
            <head>
                <link rel="icon" type="image/png" sizes="32x32" href="/images/logo2.png" />

                <meta name='description' content="Experience seamless trading with Novaris Trust — your trusted partner in global financial markets. Access a wide range of assets, cutting-edge trading tools, and real-time analytics designed to empower both new and professional traders. Start trading smarter today." />
                <meta name='keywords' content="Novaris Trust, Novaris Trust, trading, broker, forex, crypto, stocks, financial markets, investment, analytics" />
            </head>
            <body className={`${dmSans.variable} ${geistMono.variable} font-sans antialiased`}>

                <MantineProvider theme={theme} defaultColorScheme="auto">
                    <LoaderProvider>
                        <UserProvider>
                            <ThemeProvider>
                                <MotionProvider>
                                    <MotionWrapper>
                                        {children}
                                    </MotionWrapper>
                                </MotionProvider>
                            </ThemeProvider>
                        </UserProvider>
                    </LoaderProvider>
                </MantineProvider>
                <Toaster position="top-center" reverseOrder={false} />
            </body>
        </html>
    );
}