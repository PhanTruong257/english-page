'use client';

import React, { useState } from 'react';
import { LabId, PhototropismState, PhotosynthesisState, HydrotropismState } from './types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  activeLab: LabId;
  photoState: PhototropismState;
  photoCurrentAngle: number;
  synthState: PhotosynthesisState;
  hydroState: HydrotropismState;
  hydroCurrentAngle: number;
}

export default function LabReportModal({
  isOpen,
  onClose,
  activeLab,
  photoState,
  photoCurrentAngle,
  synthState,
  hydroState,
  hydroCurrentAngle,
}: Props) {
  const [studentName, setStudentName] = useState('Nguyễn Văn A');
  const [studentClass, setStudentClass] = useState('11 Sinh - THPT Chuyên');

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-700 rounded-3xl p-6 sm:p-8 text-slate-200 shadow-2xl space-y-6 my-8 max-h-[90vh] overflow-y-auto print:bg-white print:text-black print:p-0 print:border-none print:shadow-none">
        {/* Header Bar */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 print:hidden">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-lg">
            <span>📄</span> Báo cáo Thực hành Sinh học Trực quan
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl transition flex items-center gap-1.5 shadow-md"
            >
              <span>🖨️</span> In / Lưu PDF
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800 hover:bg-slate-700 transition"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div className="space-y-6 print:space-y-4">
          <div className="text-center space-y-1">
            <div className="text-xs uppercase tracking-wider font-semibold text-slate-400 print:text-gray-600">
              CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM — ĐỘC LẬP TỰ DO HẠNH PHÚC
            </div>
            <h2 className="text-2xl font-black text-white print:text-black tracking-tight mt-2">
              BÁO CÁO THỰC HÀNH THÍ NGHIỆM SINH HỌC 3D
            </h2>
            <div className="text-sm font-semibold text-emerald-400 print:text-emerald-700">
              Hệ thống Mô phỏng Phòng thí nghiệm Ảo BioLab 3D
            </div>
          </div>

          {/* Student Info Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-950/60 print:bg-gray-100 p-4 rounded-2xl border border-slate-800 print:border-gray-300">
            <div>
              <label className="text-[11px] text-slate-400 print:text-gray-600 font-medium">Họ và tên học sinh:</label>
              <input
                type="text"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                className="w-full bg-slate-900 print:bg-transparent border border-slate-700 print:border-b print:border-t-0 print:border-x-0 rounded-lg print:rounded-none px-3 py-1.5 text-xs text-slate-100 print:text-black focus:outline-none focus:border-emerald-500 font-bold"
              />
            </div>
            <div>
              <label className="text-[11px] text-slate-400 print:text-gray-600 font-medium">Lớp / Trường:</label>
              <input
                type="text"
                value={studentClass}
                onChange={(e) => setStudentClass(e.target.value)}
                className="w-full bg-slate-900 print:bg-transparent border border-slate-700 print:border-b print:border-t-0 print:border-x-0 rounded-lg print:rounded-none px-3 py-1.5 text-xs text-slate-100 print:text-black focus:outline-none focus:border-emerald-500 font-bold"
              />
            </div>
          </div>

          {/* Report Content Based on Active Lab */}
          {activeLab === 'phototropism' && (
            <div className="space-y-4">
              <div className="border-l-4 border-emerald-500 pl-3">
                <h3 className="font-bold text-white print:text-black text-base">
                  BÀI THÍ NGHIỆM: TÍNH HƯỚNG SÁNG CỦA CÂY MẦM (PHOTOTROPISM)
                </h3>
              </div>

              <div className="text-xs space-y-3 leading-relaxed text-slate-300 print:text-gray-800">
                <p>
                  <strong>1. Mục đích:</strong> Khảo sát phản ứng sinh trưởng định hướng của ngọn cây mầm dưới tác dụng của nguồn sáng đơn hướng; kiểm chứng giả thuyết về sự phân bố bất đối xứng của Auxin.
                </p>

                <p>
                  <strong>2. Thông số thí nghiệm đã ghi nhận:</strong>
                </p>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse border border-slate-800 print:border-gray-300 text-xs">
                    <thead>
                      <tr className="bg-slate-800/80 print:bg-gray-200">
                        <th className="p-2 border border-slate-700 print:border-gray-300">Yếu tố</th>
                        <th className="p-2 border border-slate-700 print:border-gray-300">Giá trị thiết lập</th>
                        <th className="p-2 border border-slate-700 print:border-gray-300">Kết quả quan sát</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="p-2 border border-slate-800 print:border-gray-300">Góc xoay nguồn sáng (Đèn)</td>
                        <td className="p-2 border border-slate-800 print:border-gray-300 font-mono font-bold text-amber-400 print:text-black">{photoState.lightAngle}°</td>
                        <td className="p-2 border border-slate-800 print:border-gray-300">
                          Thân cây uốn cong một góc <span className="font-bold text-emerald-400 print:text-black">{photoCurrentAngle}°</span>
                        </td>
                      </tr>
                      <tr>
                        <td className="p-2 border border-slate-800 print:border-gray-300">Cường độ ánh sáng</td>
                        <td className="p-2 border border-slate-800 print:border-gray-300 font-mono">{photoState.lightIntensity}%</td>
                        <td className="p-2 border border-slate-800 print:border-gray-300">Cường độ càng cao, tốc độ phản ứng càng nhanh</td>
                      </tr>
                      <tr>
                        <td className="p-2 border border-slate-800 print:border-gray-300">Xử lý chóp bao lá mầm</td>
                        <td className="p-2 border border-slate-800 print:border-gray-300 font-semibold">{photoState.plantTreatment}</td>
                        <td className="p-2 border border-slate-800 print:border-gray-300">
                          {photoState.plantTreatment === 'decapitated' || photoState.plantTreatment === 'opaque_cap'
                            ? 'Cây không uốn cong (mất phản ứng hướng sáng)'
                            : 'Cây uốn cong bình thường theo nguồn sáng'}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <p>
                  <strong>3. Kết luận & Giải thích cơ chế:</strong> Khi chiếu sáng từ một phía, quang thụ thể phototropin kích hoạt sự vận chuyển auxin tích tụ dồn sang phía tối. Nồng độ auxin cao ở phía tối kích thích các tế bào tại đây dãn dài nhanh hơn tế bào phía sáng, kết quả là thân cây uốn cong về phía nguồn sáng (Tính hướng sáng dương).
                </p>
              </div>
            </div>
          )}

          {activeLab === 'photosynthesis' && (
            <div className="space-y-4">
              <div className="border-l-4 border-cyan-500 pl-3">
                <h3 className="font-bold text-white print:text-black text-base">
                  BÀI THÍ NGHIỆM: KHẢO SÁT CÁC YẾU TỐ ẢNH HƯỞNG TỚI QUANG HỢP Ở CÀNH RONG ĐUÔI CHÓ
                </h3>
              </div>

              <div className="text-xs space-y-3 leading-relaxed text-slate-300 print:text-gray-800">
                <p>
                  <strong>1. Mục đích:</strong> Định lượng tốc độ quang hợp thông qua số lượng bọt khí Oxy ($O_2$) giải phóng từ cành rong đuôi chó (*Elodea*) khi thay đổi khoảng cách nguồn sáng, nồng độ $CO_2$ ($NaHCO_3$), nhiệt độ và kính lọc màu.
                </p>

                <p>
                  <strong>2. Bảng số liệu đo lường thực nghiệm:</strong>
                </p>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse border border-slate-800 print:border-gray-300 text-xs">
                    <thead>
                      <tr className="bg-slate-800/80 print:bg-gray-200">
                        <th className="p-2 border border-slate-700 print:border-gray-300">Thông số môi trường</th>
                        <th className="p-2 border border-slate-700 print:border-gray-300">Giá trị đo</th>
                        <th className="p-2 border border-slate-700 print:border-gray-300">Tốc độ thoát bọt khí O₂</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="p-2 border border-slate-800 print:border-gray-300">Khoảng cách đèn chiếu sáng</td>
                        <td className="p-2 border border-slate-800 print:border-gray-300 font-mono">{synthState.lampDistance} cm</td>
                        <td rowSpan={4} className="p-2 border border-slate-800 print:border-gray-300 text-center font-bold text-cyan-400 print:text-black text-sm bg-slate-950/40 print:bg-white">
                          {synthState.bubblesPerMinute} bọt/phút
                          <div className="text-[10px] text-slate-400 font-normal">
                            (Thể tích khí đã thu: {Math.round(synthState.collectedO2Volume)}%)
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td className="p-2 border border-slate-800 print:border-gray-300">Nồng độ CO₂ (dung dịch NaHCO₃)</td>
                        <td className="p-2 border border-slate-800 print:border-gray-300 font-mono">{synthState.co2Concentration}%</td>
                      </tr>
                      <tr>
                        <td className="p-2 border border-slate-800 print:border-gray-300">Nhiệt độ nước</td>
                        <td className="p-2 border border-slate-800 print:border-gray-300 font-mono">{synthState.waterTemperature}°C</td>
                      </tr>
                      <tr>
                        <td className="p-2 border border-slate-800 print:border-gray-300">Kính lọc màu quang phổ</td>
                        <td className="p-2 border border-slate-800 print:border-gray-300 font-semibold">{synthState.colorFilter}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <p>
                  <strong>3. Thử nghiệm que đóm:</strong> Đưa que tàn đóm đỏ vào ống nghiệm chứa khí thu được $\rightarrow$ que đóm bùng cháy mạnh mẽ, chứng minh khí giải phóng trong pha sáng của quang hợp là khí Oxy ($O_2$).
                </p>
              </div>
            </div>
          )}

          {activeLab === 'hydrotropism' && (
            <div className="space-y-4">
              <div className="border-l-4 border-emerald-500 pl-3">
                <h3 className="font-bold text-white print:text-black text-base">
                  BÀI THÍ NGHIỆM: TÍNH HƯỚNG NƯỚC & HƯỚNG TRỌNG LỰC CỦA RỄ CÂY
                </h3>
              </div>

              <div className="text-xs space-y-3 leading-relaxed text-slate-300 print:text-gray-800">
                <p>
                  <strong>1. Mục đích:</strong> Khảo sát tính hướng nước dương và phản ứng tương tác giữa hướng trọng lực (Gravitropism) và hướng nước (Hydrotropism) ở hệ rễ cây mầm.
                </p>

                <p>
                  <strong>2. Số liệu đo lường:</strong>
                  <br />• Vị trí nguồn nước: <strong className="text-sky-400 print:text-black uppercase">{hydroState.waterSourcePos}</strong>
                  <br />• Góc xoay hộp thí nghiệm: <strong className="text-amber-400 print:text-black">{hydroState.boxRotation}°</strong>
                  <br />• Góc uốn lệch của rễ chính: <strong className="text-emerald-400 print:text-black">{hydroCurrentAngle}°</strong>
                </p>

                <p>
                  <strong>3. Kết luận:</strong> Rễ cây có tính hướng nước dương mạnh mẽ. Khi nguồn nước đặt lệch sang một phía, gradien độ ẩm kích hoạt dòng auxin phân bố bất đối xứng, điều khiển chóp rễ sinh trưởng bẻ cong về phía nguồn ẩm để hút nước và khoáng chất.
                </p>
              </div>
            </div>
          )}

          {/* Teacher Signature Box */}
          <div className="grid grid-cols-2 pt-6 border-t border-slate-800 print:border-gray-400 text-xs text-center">
            <div>
              <div className="font-semibold text-slate-400 print:text-gray-600">Học sinh thực hiện</div>
              <div className="text-[10px] text-slate-500 italic mt-0.5">(Ký và ghi rõ họ tên)</div>
              <div className="mt-12 font-bold text-white print:text-black">{studentName}</div>
            </div>
            <div>
              <div className="font-semibold text-slate-400 print:text-gray-600">Giáo viên hướng dẫn</div>
              <div className="text-[10px] text-slate-500 italic mt-0.5">(Chấm điểm & Nhận xét)</div>
              <div className="mt-12 font-bold text-emerald-400 print:text-black">BioLab 3D Verified ✓</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
