'use client';

import React from 'react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function LabGuideModal({ isOpen, onClose }: Props) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 text-slate-800 shadow-2xl space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2 text-emerald-700 font-bold text-lg">
            <span>📖</span> Hướng Dẫn Sử Dụng Phòng Thí Nghiệm 3D
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl bg-slate-100 hover:bg-slate-200 transition cursor-pointer"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4 text-xs leading-relaxed text-slate-600 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
          <div className="space-y-2 bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
            <h4 className="font-bold text-emerald-800 text-sm flex items-center gap-1.5">
              <span>🎯</span> 1. Thao tác không gian 3D
            </h4>
            <ul className="list-disc pl-5 space-y-1 text-slate-600">
              <li><strong>Xoay góc nhìn 360°:</strong> Nhấn giữ chuột trái (hoặc vuốt 1 ngón tay trên màn hình cảm ứng) và kéo xung quanh bàn thí nghiệm.</li>
              <li><strong>Phóng to / Thu nhỏ (Zoom):</strong> Lăn con cuộn chuột (hoặc chụm 2 ngón tay).</li>
              <li><strong>Di chuyển khung hình (Pan):</strong> Nhấn giữ chuột phải và kéo để tịnh tiến camera.</li>
            </ul>
          </div>

          <div className="space-y-2 bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
            <h4 className="font-bold text-sky-800 text-sm flex items-center gap-1.5">
              <span>🎛️</span> 2. Bảng điều khiển & Tương tác thí nghiệm
            </h4>
            <ul className="list-disc pl-5 space-y-1 text-slate-600">
              <li><strong>Thanh trượt thông số:</strong> Điều chỉnh góc chiếu đèn, nồng độ CO₂, nhiệt độ nước, vị trí nguồn ẩm. Vật mẫu phản hồi động lực học ngay lập tức.</li>
              <li><strong>Nút X-Ray:</strong> Mở chế độ nhìn xuyên thấu phân tử Auxin hoặc hạt thạch lạp Statoliths để quan sát cơ chế tế bào.</li>
              <li><strong>Tua nhanh thời gian (Time-lapse):</strong> Chuyển sang tốc độ 5x hoặc 20x để xem phản ứng sinh trưởng diễn ra rõ nét.</li>
            </ul>
          </div>

          <div className="space-y-2 bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
            <h4 className="font-bold text-purple-800 text-sm flex items-center gap-1.5">
              <span>📝</span> 3. Nhiệm vụ & Báo cáo thực hành
            </h4>
            <ul className="list-disc pl-5 space-y-1 text-slate-600">
              <li><strong>Tab Thử thách:</strong> Hoàn thành từng mục tiêu thực nghiệm để nhận thưởng và làm bài kiểm tra trắc nghiệm củng cố kiến thức.</li>
              <li><strong>Xuất báo cáo:</strong> Bấm nút &quot;Xuất báo cáo&quot; trên thanh công cụ để tạo trang báo cáo hoàn chỉnh chuẩn khoa học và in trực tiếp thành file PDF.</li>
            </ul>
          </div>
        </div>

        <div className="pt-2 text-center">
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs rounded-xl transition cursor-pointer shadow-md shadow-emerald-600/20"
          >
            Đã hiểu, Bắt đầu thí nghiệm ngay! 🚀
          </button>
        </div>
      </div>
    </div>
  );
}
