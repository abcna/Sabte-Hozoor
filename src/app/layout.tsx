import type { Metadata } from "next";
import { Vazirmatn } from "next/font/google";
import { Atmosphere } from "@/components/layout/Atmosphere";
import "./globals.css";

const vazirmatn = Vazirmatn({
  variable: "--font-vazirmatn",
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "حضور و غیاب صفا دارو",
  description: "سیستم ثبت ورود و خروج پرسنل داروخانه با موقعیت مکانی",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="fa"
      dir="rtl"
      className={`${vazirmatn.variable} h-full antialiased`}
    >
      <body className="min-h-full font-sans">
        <Atmosphere>{children}</Atmosphere>
      </body>
    </html>
  );
}
