import type { Metadata, Viewport } from "next";
import { Mali } from "next/font/google";
import "./globals.css";

const mali = Mali({
  subsets: ["thai", "latin"],
  weight: ["400", "600", "700"],
  variable: "--font-display",
  display: "swap",
});

const SITE_URL = "https://peerapongsm.github.io/typing-ghosts/";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "พิมพ์ไล่ผี — เกมฝึกพิมพ์ไทย",
  description:
    "ผีไทยลอยเข้ามาหาศาล พิมพ์คำไทยให้จบก่อนผีถึงตัว ฝึกพิมพ์สัมผัสแบบไม่น่าเบื่อ",
  openGraph: {
    title: "พิมพ์ไล่ผี — เกมฝึกพิมพ์ไทย",
    description:
      "เว็บฝึกพิมพ์ไทยทุกอันน่าเบื่อจนหลับ ลองเกมนี้ดู: ผีลอยเข้ามา พิมพ์คำให้ทันก่อนผีถึงตัว",
    url: SITE_URL,
    locale: "th_TH",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th" className={mali.variable}>
      <head>
        <script
          defer
          src="https://umami-host-peerapongsms-projects.vercel.app/script.js"
          data-website-id="3f09453d-0b39-443e-8845-5e65611cc58a"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
