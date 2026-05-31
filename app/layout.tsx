import type { Metadata } from "next";
import { IBM_Plex_Serif, Mona_Sans } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";

import "./globals.css";
import Navbar from "@/components/Navbar";
import { Toaster } from "`@/components/ui/sonner`";

const ibmPlexSerif = IBM_Plex_Serif({
    variable: "--font-ibm-plex-serif",
    subsets: ["latin"],
    weight: ["400", "500", "600", "700"],
    display: 'swap'
});

const monaSans = Mona_Sans({
    variable: "--font-mona-sans",
    subsets: ["latin"],
    display: 'swap'
});

export const metadata: Metadata = {
    title: "Bookify",
    description: "Transform your books into interactive AI conversations. Upload PDFs and chat with your books using voice.",
};

export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body
                className={`${ibmPlexSerif.variable} ${monaSans.variable} relative font-sans antialiased`}
            >
                <ClerkProvider
                    appearance={{
                        variables: {
                            fontFamily: "var(--font-mona-sans)",
                            fontFamilyButtons: "var(--font-ibm-plex-serif)",
                            colorPrimary: "#663820",
                            colorText: "#212a3b",
                            colorInputBackground: "#ffffff",
                            colorInputText: "#212a3b",
                        },
                        elements: {
                            modalContent: {
                                background: "#f8f4e9",
                                boxShadow: "var(--shadow-soft-lg)",
                                borderRadius: "1rem",
                                border: "1px solid var(--border-subtle)",
                            },
                            card: {
                                background: "transparent",
                                boxShadow: "none",
                                border: "none",
                            },
                            formButtonPrimary: {
                                fontSize: "1.125rem",
                                textTransform: "none",
                                backgroundColor: "#663820",
                                "&:hover, &:focus, &:active": {
                                    backgroundColor: "#7a4528",
                                },
                                boxShadow: "var(--shadow-soft)",
                            },
                            socialButtonsBlockButton: {
                                boxShadow: "var(--shadow-soft-sm)",
                                border: "1px solid var(--border-subtle)",
                                "&:hover": {
                                    backgroundColor: "#f3e4c7",
                                    boxShadow: "var(--shadow-soft)",
                                }
                            },
                            formFieldInput: {
                                border: "1px solid var(--border-subtle)",
                                backgroundColor: "white",
                                boxShadow: "var(--shadow-soft-sm)",
                                borderRadius: "0.5rem",
                                "&:focus": {
                                    borderColor: "#663820",
                                    boxShadow: "var(--shadow-soft), 0 0 0 2px rgba(102, 56, 32, 0.1)",
                                }
                            }
                        },
                    }}
                >
                    <Navbar />
                    {children}
                    <Toaster />
                </ClerkProvider>
            </body>
        </html>
    );
}
