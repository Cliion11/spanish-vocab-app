import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import BottomNav from "../components/BottomNav";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Spanish Vocab | 西班牙语词汇学习",
    template: "%s | Spanish Vocab",
  },
  description:
    "一个面向中文用户的西班牙语 DELE A1/A2/B1 词汇学习网站，支持发音、错题本和轻量复习。",
  applicationName: "Spanish Vocab",
  keywords: [
    "西班牙语",
    "西语",
    "DELE",
    "A1",
    "A2",
    "B1",
    "背单词",
    "西语词汇",
  ],
  authors: [{ name: "Cliion11" }],
  creator: "Cliion11",
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg",
  },
  appleWebApp: {
    capable: true,
    title: "Spanish Vocab",
    statusBarStyle: "default",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#f8f3ea",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="zh-CN"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <BottomNav />
      </body>
    </html>
  );
}