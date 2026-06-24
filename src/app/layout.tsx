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
  metadataBase: new URL("https://learnova.com"),

  title: {
    default: "Learnova | แนวข้อสอบครูผู้ช่วย สพฐ. สอศ. สกร. อปท.",
    template: "%s | Learnova",
  },

  description:
    "รวมแนวข้อสอบครูผู้ช่วย ข้อสอบย้อนหลัง สรุปเนื้อหา ภาค ก วิชาชีพครู กฎหมายการศึกษา และแบบทดสอบวัดระดับ สำหรับ สพฐ. สอศ. สกร. และ อปท. พร้อมเฉลยละเอียดและระบบวิเคราะห์ผลสอบ",

  keywords: [
    "ครูผู้ช่วย",
    "สอบครูผู้ช่วย",
    "แนวข้อสอบครูผู้ช่วย",
    "ข้อสอบครูผู้ช่วย",
    "ข้อสอบครูผู้ช่วย สพฐ",
    "ข้อสอบครูผู้ช่วย สอศ",
    "ข้อสอบครูผู้ช่วย สกร",
    "ข้อสอบครูผู้ช่วย อปท",
    "ภาค ก ครูผู้ช่วย",
    "วิชาชีพครู",
    "กฎหมายการศึกษา",
    "สรุปสอบครูผู้ช่วย",
    "เตรียมสอบครูผู้ช่วย",
    "แบบทดสอบครูผู้ช่วย",
  ],

  authors: [{ name: "Learnova" }],

  creator: "Learnova",

  publisher: "Learnova",

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },

  openGraph: {
    title: "Learnova | แนวข้อสอบครูผู้ช่วย สพฐ. สอศ. สกร. อปท.",
    description:
      "รวมแนวข้อสอบครูผู้ช่วย ข้อสอบย้อนหลัง สรุปเนื้อหา และแบบทดสอบวัดระดับ พร้อมเฉลยละเอียดและวิเคราะห์ผลสอบ",
    url: "https://learnova.com",
    siteName: "Learnova",
    locale: "th_TH",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "Learnova | แนวข้อสอบครูผู้ช่วย",
    description:
      "ฝึกทำข้อสอบครูผู้ช่วย พร้อมเฉลยละเอียด สรุปเนื้อหา และวิเคราะห์ผลสอบ",
  },

  category: "Education",
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
