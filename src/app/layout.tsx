import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
    default: "Learnova | เตรียมสอบผู้ช่วยครู",
    template: "%s | Learnova",
  },
  description:
    "Learnova แพลตฟอร์มเตรียมสอบผู้ช่วยครูแบบ SEO-first พร้อมข้อสอบจับเวลา เฉลยละเอียด และประวัติการฝึกทำข้อสอบ",
  openGraph: {
    title: "Learnova | เตรียมสอบผู้ช่วยครู",
    description:
      "ค้นหา ฝึกทำ และวิเคราะห์ข้อสอบผู้ช่วยครู พร้อม mock data สำหรับ MVP frontend",
    type: "website",
    locale: "th_TH",
    siteName: "Learnova",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="th"
      className={`${geistSans.variable} ${geistMono.variable} h-full scroll-smooth antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
