import type { Metadata, Viewport } from "next";
import BottomNav from "../components/BottomNav";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://cllion.xyz"),

  title: {
    default: "Spanish Vocab | 西班牙语词汇学习",
    template: "%s | Spanish Vocab",
  },

  description:
    "一个面向中文用户的西班牙语 DELE A1/A2/B1 词汇学习网站，支持发音、错题本、每日随机学习和轻量复习。",

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
    "西班牙语单词",
    "西班牙语学习",
  ],

  authors: [{ name: "Cliion11" }],
  creator: "Cliion11",

  alternates: {
    canonical: "/",
  },

  openGraph: {
    title: "Spanish Vocab | 西班牙语词汇学习",
    description:
      "面向中文用户的西班牙语 DELE A1/A2/B1 词汇学习网站，支持发音、错题本和每日随机学习。",
    url: "https://cllion.xyz",
    siteName: "Spanish Vocab",
    type: "website",
    locale: "zh_CN",
  },

  twitter: {
    card: "summary",
    title: "Spanish Vocab | 西班牙语词汇学习",
    description:
      "每天几分钟，用更轻的方式记住西班牙语单词。",
  },

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
      className="h-full antialiased"
    >
      <body className="min-h-full flex flex-col">
        {children}
        <BottomNav />
      </body>
    </html>
  );
}