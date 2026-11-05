'use client';

import React from 'react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function LabGuideModal({ isOpen, onClose }: Props) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-3xl p-6 sm:p-8 text-slate-200 shadow-2xl space-y-5">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-lg">
            <span>📖</span> Hướng Dẫn Sử Dụng Phòng Thí Nghiệm 3D
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-xl bg-slate-800 hover:bg-slate-700 transition"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4 text-xs leading-relaxed text-slate-300 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
          <div className="space-y-2">
            <h4 className="font-bold text-emerald-400 text-sm">1. Thao tác không gian 3D</h4>
            <ul className="list-disc pl-5 space-y-1 text-slate-300">
              <li><strong>Xoay góc nhìn 360°:</strong> Nhấn giữ chuột trái (hoặc vuốt 1 ngón tay trên màn hình cảm ứng) và kéo xung quanh.</li>
              <li><strong>Phóng to / Thu nhỏ (Zoom):</strong> Lăn con cuộn chuột (hoặc chụm 2 ngón tay).</li>
              <li><strong>Di chuyển khung hình (Pan):</strong> Nhấn giữ chuột phải và kéo.</li>
            </ul>
          </div>

          <div className="space-y-2">
            <h4 className="font-bold text-sky-400 text-sm">2. Bảng điều khiển & Tương tác thí nghiệm</h4>
            <ul className="list-disc pl-5 space-y-1 text-slate-300">
              <li><strong>Thanh trượt thông số:</strong> Điều chỉnh góc chiếu đèn, nồng độ $CO_2$, nhiệt độ nước, vị trí nguồn ẩm. Mô hình 3D phản hồi ngay lập tức.</li>
              <li><strong>Nút X-Ray:</strong> Mở chế độ nhìn xuyên thấu phân tử Auxin hoặc hạt thạch lạp Statoliths để giải thích cơ chế sinh học.</li>
              <li><strong>Tua nhanh thời gian (Time-lapse):</strong> Chuyển sang tốc độ 5x hoặc 20x để xem quá trình uốn cong hoặc sinh trưởng diễn ra nhanh chóng.</li>
            </ul>
          </div>

          <div className="space-y-2">
            <h4 className="font-bold text-purple-400 text-sm">3. Nhiệm vụ & Báo cáo thực hành</h4>
            <ul className="list-disc pl-5 space-y-1 text-slate-300">
              <li><strong>Tab Thử thách:</strong> Thực hiện các mục tiêu đặt ra để đạt danh hiệu và kiểm tra trắc nghiệm củng cố kiến thức.</li>
              <li><strong>Xuất báo cáo:</strong> Bấm nút &quot;Xuất báo cáo&quot; trên thanh công cụ để tạo trang báo cáo hoàn chỉnh chuẩn khoa học và in trực tiếp thành file PDF.</li>
            </ul>
          </div>
        </div>

        <div className="pt-2 text-center">
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl transition cursor-pointer shadow-lg shadow-emerald-500/20"
          >
            Đã hiểu, Bắt đầu thí nghiệm ngay! 🚀
          </button>
        </div>
      </div>
    </div>
  );
}
