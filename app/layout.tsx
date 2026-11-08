import "./css/style.css";
import { Inter } from "next/font/google";

const inter = Inter({
  subsets: ["latin", "vietnamese"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata = {
  title: "Moon. Bio Lab 3D — Phòng Thí Nghiệm Sinh Học Ảo Tương Tác",
  description: "Phòng thí nghiệm Sinh học 3D tương tác: Mô phỏng quang hợp, tính hướng sáng, tính hướng nước và cơ chế sinh lý thực vật thời gian thực.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" className="scroll-smooth">
      <body
        className={`${inter.variable} bg-slate-100 font-inter tracking-tight text-slate-800 antialiased`}
      >
        <div className="flex min-h-screen flex-col overflow-hidden supports-[overflow:clip]:overflow-clip">
          {children}
        </div>
      </body>
    </html>
  );
}
