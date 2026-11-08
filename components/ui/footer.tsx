import Link from "next/link";
import Logo from "./logo";

export default function Footer({ border = false }: { border?: boolean }) {
  return (
    <footer className="bg-slate-950 border-t border-slate-800/80 text-slate-400">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className={`grid gap-10 py-10 sm:grid-cols-12 md:py-12 ${border ? "border-t border-slate-800" : ""}`}>
          <div className="space-y-3 sm:col-span-12 lg:col-span-5">
            <div>
              <Logo />
            </div>
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              Moon. Bio Lab 3D là nền tảng phòng thí nghiệm ảo Sinh học trực quan, cho phép học sinh và giáo viên thao tác, điều chỉnh biến số và quan sát các hiện tượng sinh lý thực vật thời gian thực trong không gian 3D.
            </p>
            <div className="text-[11px] text-slate-500">
              &copy; {new Date().getFullYear()} Moon. Bio Lab 3D — Phòng thí nghiệm Sinh học tương tác.
            </div>
          </div>

          <div className="space-y-2 sm:col-span-6 md:col-span-4 lg:col-span-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">Các bài thí nghiệm</h3>
            <ul className="space-y-2 text-xs text-slate-400">
              <li><Link className="transition hover:text-emerald-400" href="/#phototropism">1. Tính hướng sáng ở cây mầm</Link></li>
              <li><Link className="transition hover:text-cyan-400" href="/#photosynthesis">2. Khảo sát quang hợp ở rong đuôi chó</Link></li>
              <li><Link className="transition hover:text-emerald-400" href="/#hydrotropism">3. Tính hướng nước & hướng đất của rễ</Link></li>
              <li><Link className="transition hover:text-amber-400" href="/#darwin">4. Chuỗi thí nghiệm Darwin & Auxin</Link></li>
            </ul>
          </div>

          <div className="space-y-2 sm:col-span-6 md:col-span-4 lg:col-span-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">Tiêu chuẩn giáo dục</h3>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>✓ Bám sát chương trình GDPT Sinh học (KNTT, Cánh Diều, Chân Trời Sáng Tạo)</li>
              <li>✓ Mô phỏng chính xác thuật toán quang hợp Blackman & định luật cảm ứng thực vật</li>
              <li>✓ Hỗ trợ xuất phiếu báo cáo thực hành chuẩn khoa học</li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}
