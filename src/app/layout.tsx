import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
    title: "Naman Sharma | Vimana Portfolio",
    description: "A Cyber-Vedic 3D experience - Full-Stack Intelligent Systems Engineer",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <head>
                <link
                    href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500;700&family=JetBrains+Mono:wght@400;500;700&display=swap"
                    rel="stylesheet"
                />
            </head>
            <body className="antialiased">
                {children}
            </body>
        </html>
    );
}
