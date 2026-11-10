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

// Data row interfaces
interface PhotoDataRecord {
  id: string;
  lightAngle: number | string;
  lightIntensity: number | string;
  lightColor: string;
  treatment: string;
  bentAngle: number | string;
  note: string;
}

interface SynthDataRecord {
  id: string;
  distance: number | string;
  co2: number | string;
  temp: number | string;
  filter: string;
  bubbleRate: number | string;
  o2Vol: number | string;
  note: string;
}

interface HydroDataRecord {
  id: string;
  waterPos: string;
  moistL: number | string;
  moistR: number | string;
  rotation: number | string;
  xray: string;
  rootAngle: number | string;
  note: string;
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
  // Student Metadata
  const [studentName, setStudentName] = useState('Nguyễn Văn A');
  const [studentClass, setStudentClass] = useState('11 Sinh - THPT Chuyên');
  const [reportDate, setReportDate] = useState(() => {
    const today = new Date();
    return `${today.getDate().toString().padStart(2, '0')}/${(today.getMonth() + 1).toString().padStart(2, '0')}/${today.getFullYear()}`;
  });

  // Action toast notification
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setActionFeedback(msg);
    setTimeout(() => setActionFeedback(null), 3000);
  };

  // =========================================================================
  // 1. PHOTOTROPISM REPORT STATE (Clean empty defaults for students to fill)
  // =========================================================================
  const [photoRecords, setPhotoRecords] = useState<PhotoDataRecord[]>([
    {
      id: 'p-init',
      lightAngle: photoState.lightAngle,
      lightIntensity: photoState.lightIntensity,
      lightColor: photoState.lightColor.toUpperCase(),
      treatment:
        photoState.plantTreatment === 'normal'
          ? 'Bình thường (Đối chứng)'
          : photoState.plantTreatment === 'decapitated'
          ? 'Cắt bỏ chóp ngọn'
          : photoState.plantTreatment === 'opaque_cap'
          ? 'Bọc mũ tối'
          : photoState.plantTreatment === 'transparent_cap'
          ? 'Bọc mũ trong suốt'
          : photoState.plantTreatment === 'agar_block'
          ? 'Khối thạch agar'
          : 'Chêm miếng mica',
      bentAngle: photoCurrentAngle,
      note: 'Lần đo ban đầu',
    },
  ]);
  const [photoObjective, setPhotoObjective] = useState('');
  const [photoHypothesis, setPhotoHypothesis] = useState('');
  const [photoObservation, setPhotoObservation] = useState('');
  const [photoMechanism, setPhotoMechanism] = useState('');
  const [photoConclusion, setPhotoConclusion] = useState('');
  const [photoApplication, setPhotoApplication] = useState('');
  const [photoSelectedDiagram, setPhotoSelectedDiagram] = useState<'auxin' | 'darwin' | 'chart' | 'none'>('auxin');

  // =========================================================================
  // 2. PHOTOSYNTHESIS REPORT STATE (Clean empty defaults for students to fill)
  // =========================================================================
  const [synthRecords, setSynthRecords] = useState<SynthDataRecord[]>([
    {
      id: 's-init',
      distance: synthState.lampDistance,
      co2: synthState.co2Concentration,
      temp: synthState.waterTemperature,
      filter: synthState.colorFilter.toUpperCase(),
      bubbleRate: synthState.bubblesPerMinute,
      o2Vol: Math.round(synthState.collectedO2Volume),
      note: 'Lần đo ban đầu',
    },
  ]);
  const [synthObjective, setSynthObjective] = useState('');
  const [synthHypothesis, setSynthHypothesis] = useState('');
  const [synthSplintResult, setSynthSplintResult] = useState('');
  const [synthObservation, setSynthObservation] = useState('');
  const [synthMechanism, setSynthMechanism] = useState('');
  const [synthConclusion, setSynthConclusion] = useState('');
  const [synthApplication, setSynthApplication] = useState('');
  const [synthSelectedDiagram, setSynthSelectedDiagram] = useState<'anatomy' | 'calvin' | 'spectrum' | 'none'>('anatomy');

  // =========================================================================
  // 3. HYDROTROPISM REPORT STATE (Clean empty defaults for students to fill)
  // =========================================================================
  const [hydroRecords, setHydroRecords] = useState<HydroDataRecord[]>([
    {
      id: 'h-init',
      waterPos:
        hydroState.waterSourcePos === 'left'
          ? 'Bên trái 💧'
          : hydroState.waterSourcePos === 'right'
          ? 'Bên phải 💧'
          : 'Đáy chậu',
      moistL: hydroState.soilMoistureLeft,
      moistR: hydroState.soilMoistureRight,
      rotation: hydroState.boxRotation,
      xray: hydroState.xrayStatoliths ? 'Bật (X-Ray)' : 'Tắt',
      rootAngle: hydroCurrentAngle,
      note: 'Lần đo ban đầu',
    },
  ]);
  const [hydroObjective, setHydroObjective] = useState('');
  const [hydroHypothesis, setHydroHypothesis] = useState('');
  const [hydroObservation, setHydroObservation] = useState('');
  const [hydroMechanism, setHydroMechanism] = useState('');
  const [hydroConclusion, setHydroConclusion] = useState('');
  const [hydroApplication, setHydroApplication] = useState('');
  const [hydroSelectedDiagram, setHydroSelectedDiagram] = useState<'vector' | 'statoliths' | 'paradox' | 'none'>('vector');

  if (!isOpen) return null;

  // Extract Live 3D Data to Report
  const handleExtractLiveData = () => {
    if (activeLab === 'phototropism') {
      const treatmentLabel =
        photoState.plantTreatment === 'normal'
          ? 'Bình thường'
          : photoState.plantTreatment === 'decapitated'
          ? 'Cắt bỏ chóp ngọn'
          : photoState.plantTreatment === 'opaque_cap'
          ? 'Bọc mũ tối'
          : photoState.plantTreatment === 'transparent_cap'
          ? 'Bọc mũ trong suốt'
          : photoState.plantTreatment === 'agar_block'
          ? 'Khối thạch agar'
          : 'Chêm miếng mica';

      const newRec: PhotoDataRecord = {
        id: `p-${Date.now()}`,
        lightAngle: photoState.lightAngle,
        lightIntensity: photoState.lightIntensity,
        lightColor: photoState.lightColor.toUpperCase(),
        treatment: treatmentLabel,
        bentAngle: photoCurrentAngle,
        note:
          photoCurrentAngle !== 0
            ? `Cây uốn ${Math.abs(photoCurrentAngle)}° về phía ${photoCurrentAngle > 0 ? 'phải' : 'trái'}`
            : 'Cây mọc thẳng',
      };
      setPhotoRecords((prev) => [...prev, newRec]);
      showToast('📥 Đã trích xuất số liệu Hướng sáng 3D hiện tại vào bảng!');
    } else if (activeLab === 'photosynthesis') {
      const newRec: SynthDataRecord = {
        id: `s-${Date.now()}`,
        distance: synthState.lampDistance,
        co2: synthState.co2Concentration,
        temp: synthState.waterTemperature,
        filter: synthState.colorFilter.toUpperCase(),
        bubbleRate: synthState.bubblesPerMinute,
        o2Vol: Math.round(synthState.collectedO2Volume),
        note: `Đo được ${synthState.bubblesPerMinute} bọt/phút`,
      };
      setSynthRecords((prev) => [...prev, newRec]);
      showToast('📥 Đã trích xuất số liệu Quang hợp 3D hiện tại vào bảng!');
    } else if (activeLab === 'hydrotropism') {
      const posLabel =
        hydroState.waterSourcePos === 'left'
          ? 'Bên trái 💧'
          : hydroState.waterSourcePos === 'right'
          ? 'Bên phải 💧'
          : 'Đáy chậu';

      const newRec: HydroDataRecord = {
        id: `h-${Date.now()}`,
        waterPos: posLabel,
        moistL: hydroState.soilMoistureLeft,
        moistR: hydroState.soilMoistureRight,
        rotation: hydroState.boxRotation,
        xray: hydroState.xrayStatoliths ? 'Bật (X-Ray)' : 'Tắt',
        rootAngle: hydroCurrentAngle,
        note:
          hydroCurrentAngle !== 0
            ? `Rễ uốn ${Math.abs(hydroCurrentAngle)}° về phía ${hydroCurrentAngle > 0 ? 'phải' : 'trái'}`
            : 'Rễ cắm thẳng đứng',
      };
      setHydroRecords((prev) => [...prev, newRec]);
      showToast('📥 Đã trích xuất số liệu Hướng nước 3D hiện tại vào bảng!');
    }
  };

  // Add Manual Blank Row
  const handleAddManualRow = () => {
    if (activeLab === 'phototropism') {
      setPhotoRecords((prev) => [
        ...prev,
        {
          id: `p-man-${Date.now()}`,
          lightAngle: 0,
          lightIntensity: 100,
          lightColor: 'TRẮNG',
          treatment: 'Tự nhập',
          bentAngle: 0,
          note: '',
        },
      ]);
    } else if (activeLab === 'photosynthesis') {
      setSynthRecords((prev) => [
        ...prev,
        {
          id: `s-man-${Date.now()}`,
          distance: 30,
          co2: 1.0,
          temp: 25,
          filter: 'TRẮNG',
          bubbleRate: 0,
          o2Vol: 0,
          note: '',
        },
      ]);
    } else if (activeLab === 'hydrotropism') {
      setHydroRecords((prev) => [
        ...prev,
        {
          id: `h-man-${Date.now()}`,
          waterPos: 'Bên trái 💧',
          moistL: 50,
          moistR: 50,
          rotation: 0,
          xray: 'Tắt',
          rootAngle: 0,
          note: '',
        },
      ]);
    }
  };

  // Clear Form to Practice from Scratch
  const handleClearForm = () => {
    if (activeLab === 'phototropism') {
      setPhotoObjective('');
      setPhotoHypothesis('');
      setPhotoObservation('');
      setPhotoMechanism('');
      setPhotoConclusion('');
      setPhotoApplication('');
      setPhotoRecords([]);
    } else if (activeLab === 'photosynthesis') {
      setSynthObjective('');
      setSynthHypothesis('');
      setSynthSplintResult('');
      setSynthObservation('');
      setSynthMechanism('');
      setSynthConclusion('');
      setSynthApplication('');
      setSynthRecords([]);
    } else if (activeLab === 'hydrotropism') {
      setHydroObjective('');
      setHydroHypothesis('');
      setHydroObservation('');
      setHydroMechanism('');
      setHydroConclusion('');
      setHydroApplication('');
      setHydroRecords([]);
    }
    showToast('🗑️ Đã xóa sạch nội dung bài báo cáo để làm lại!');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-white border border-slate-200 rounded-3xl p-5 sm:p-8 text-slate-800 shadow-2xl space-y-6 my-6 max-h-[92vh] overflow-y-auto custom-scrollbar print:bg-white print:text-black print:p-0 print:border-none print:shadow-none print:max-h-none print:overflow-visible">
        
        {/* Top Floating Toast Notification */}
        {actionFeedback && (
          <div className="fixed top-6 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-xs px-4 py-2 rounded-full shadow-xl z-50 flex items-center gap-2 border border-slate-700 animate-in fade-in slide-in-from-top-2 duration-200 print:hidden">
            <span>{actionFeedback}</span>
          </div>
        )}

        {/* Toolbar Header (Hidden in Print) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4 print:hidden">
          <div>
            <div className="flex items-center gap-2 text-emerald-800 font-bold text-base sm:text-lg">
              <span>📋</span> Báo Cáo Thực Hành Sinh Học 3D (Học Sinh Tự Hoàn Thiện)
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Học sinh tự điền câu trả lời, trích xuất số liệu và tự chọn sơ đồ từ mô phỏng 3D vào báo cáo trước khi in hoặc xuất file PDF.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {/* Extract Live 3D Data */}
            <button
              onClick={handleExtractLiveData}
              className="px-3 py-1.5 bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-300 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer shadow-xs"
              title="Ghi thông số hiện tại của phòng lab 3D vào bảng kết quả"
            >
              <span>📥</span> Trích xuất 3D
            </button>

            {/* Clear Form */}
            <button
              onClick={handleClearForm}
              className="px-2.5 py-1.5 bg-slate-100 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-300 text-slate-600 border border-slate-200 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer"
              title="Xóa form để học sinh tự điền từ đầu"
            >
              <span>🗑️</span> Xóa trắng
            </button>

            {/* Print / Save PDF */}
            <button
              onClick={handlePrint}
              className="px-4 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs rounded-xl transition flex items-center gap-1.5 shadow-md shadow-emerald-600/20 cursor-pointer"
            >
              <span>🖨️</span> In / Lưu PDF
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl bg-slate-100 hover:bg-slate-200 transition cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>

        {/* PRINTABLE REPORT DOCUMENT BODY */}
        <div className="space-y-6 print:space-y-4">
          
          {/* Main Title Only (Cleaned per user request: removed Republic motto and Moon. Bio Lab subtext) */}
          <div className="text-center pt-2">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 print:text-black tracking-tight">
              BÁO CÁO THỰC HÀNH THÍ NGHIỆM SINH HỌC 3D
            </h2>
          </div>

          {/* Student Info & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 print:bg-gray-50 p-3.5 rounded-2xl border border-slate-200 print:border-gray-300 text-xs">
            <div>
              <label className="text-[11px] text-slate-600 print:text-gray-600 font-semibold">Họ và tên học sinh:</label>
              <input
                type="text"
                placeholder="Nhập họ và tên..."
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                className="w-full bg-white print:bg-transparent border border-slate-300 print:border-b print:border-t-0 print:border-x-0 rounded-lg print:rounded-none px-3 py-1.5 text-xs text-slate-900 print:text-black focus:outline-none focus:border-emerald-500 font-bold mt-1"
              />
            </div>
            <div>
              <label className="text-[11px] text-slate-600 print:text-gray-600 font-semibold">Lớp / Trường:</label>
              <input
                type="text"
                placeholder="Nhập lớp, trường..."
                value={studentClass}
                onChange={(e) => setStudentClass(e.target.value)}
                className="w-full bg-white print:bg-transparent border border-slate-300 print:border-b print:border-t-0 print:border-x-0 rounded-lg print:rounded-none px-3 py-1.5 text-xs text-slate-900 print:text-black focus:outline-none focus:border-emerald-500 font-bold mt-1"
              />
            </div>
            <div>
              <label className="text-[11px] text-slate-600 print:text-gray-600 font-semibold">Ngày thực hiện:</label>
              <input
                type="text"
                value={reportDate}
                onChange={(e) => setReportDate(e.target.value)}
                className="w-full bg-white print:bg-transparent border border-slate-300 print:border-b print:border-t-0 print:border-x-0 rounded-lg print:rounded-none px-3 py-1.5 text-xs text-slate-900 print:text-black focus:outline-none focus:border-emerald-500 font-mono mt-1"
              />
            </div>
          </div>

          {/* ============================================================== */}
          {/* LAB 1: PHOTOTROPISM REPORT FORM */}
          {/* ============================================================== */}
          {activeLab === 'phototropism' && (
            <div className="space-y-5 text-xs text-slate-800">
              <div className="border-l-4 border-emerald-500 pl-3">
                <h3 className="font-bold text-slate-900 print:text-black text-base">
                  BÀI THÍ NGHIỆM: KHẢO SÁT TÍNH HƯỚNG SÁNG VÀ SỰ ĐIỀU HÒA CỦA AUXIN
                </h3>
              </div>

              {/* Section 1: Objective & Hypothesis */}
              <div className="space-y-3 bg-slate-50/70 p-3.5 rounded-2xl border border-slate-200">
                <div className="font-bold text-emerald-900 text-xs flex items-center gap-1.5">
                  <span>🎯</span> 1. Mục đích thí nghiệm & Giả thuyết khoa học:
                </div>
                <div className="space-y-2">
                  <div>
                    <label className="text-[11px] text-slate-600 font-semibold">a. Mục đích thí nghiệm (Học sinh tự xác định):</label>
                    <textarea
                      rows={2}
                      placeholder="Nêu mục đích em tiến hành thí nghiệm này (ví dụ: khảo sát phản ứng của thân cây khi có ánh sáng một phía)..."
                      value={photoObjective}
                      onChange={(e) => setPhotoObjective(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-xs text-slate-800 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-400 mt-1 print:border print:border-slate-300"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-600 font-semibold">b. Giả thuyết nghiên cứu (Hypothesis):</label>
                    <textarea
                      rows={2}
                      placeholder="Đặt giả thuyết trước khi đo đạc (ví dụ: thân cây sẽ uốn cong về phía nguồn sáng do sự dãn dài không đều)..."
                      value={photoHypothesis}
                      onChange={(e) => setPhotoHypothesis(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-xs text-slate-800 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-400 mt-1 print:border print:border-slate-300"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Data Table with Custom Extraction & Manual Row Addition */}
              <div className="space-y-2 bg-slate-50/70 p-3.5 rounded-2xl border border-slate-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="font-bold text-emerald-900 text-xs flex items-center gap-1.5">
                    <span>📊</span> 2. Bảng số liệu thực nghiệm đo đạc:
                  </div>
                  <div className="flex items-center gap-2 print:hidden">
                    <button
                      onClick={handleExtractLiveData}
                      className="text-[10px] bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-2.5 py-1 rounded-lg transition cursor-pointer flex items-center gap-1 shadow-xs"
                      title="Ghi thêm lần đo từ 3D hiện tại"
                    >
                      <span>📥</span> Trích xuất 3D
                    </button>
                    <button
                      onClick={handleAddManualRow}
                      className="text-[10px] bg-white hover:bg-slate-100 text-emerald-800 border border-emerald-300 font-bold px-2 py-1 rounded-lg transition cursor-pointer flex items-center gap-1"
                      title="Thêm dòng trống để tự nhập số liệu thực nghiệm"
                    >
                      <span>➕</span> Thêm dòng
                    </button>
                    {photoRecords.length > 0 && (
                      <button
                        onClick={() => setPhotoRecords([])}
                        className="text-[10px] text-slate-500 hover:text-rose-600 px-1 py-1"
                        title="Xóa toàn bộ các dòng đo"
                      >
                        Xóa bảng
                      </button>
                    )}
                  </div>
                </div>

                {photoRecords.length === 0 ? (
                  <div className="p-4 text-center text-slate-400 italic bg-white rounded-xl border border-dashed border-slate-300">
                    Chưa có số liệu thực nghiệm. Bấm nút <strong>"Trích xuất 3D"</strong> hoặc <strong>"Thêm dòng"</strong> để ghi số liệu.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse border border-slate-200 print:border-gray-300 text-xs">
                      <thead>
                        <tr className="bg-emerald-100/60 print:bg-gray-200 text-emerald-950 font-bold">
                          <th className="p-2 border border-slate-200 print:border-gray-300 text-center w-10">Lần</th>
                          <th className="p-2 border border-slate-200 print:border-gray-300">Góc đèn (°)</th>
                          <th className="p-2 border border-slate-200 print:border-gray-300">Cường độ (%)</th>
                          <th className="p-2 border border-slate-200 print:border-gray-300">Quang phổ</th>
                          <th className="p-2 border border-slate-200 print:border-gray-300">Phương pháp xử lý</th>
                          <th className="p-2 border border-slate-200 print:border-gray-300 font-bold text-emerald-800">Góc uốn thân (θ)</th>
                          <th className="p-2 border border-slate-200 print:border-gray-300">Ghi chú quan sát</th>
                          <th className="p-2 border border-slate-200 print:hidden text-center w-8">Xóa</th>
                        </tr>
                      </thead>
                      <tbody>
                        {photoRecords.map((r, idx) => (
                          <tr key={r.id} className="bg-white hover:bg-slate-50 transition">
                            <td className="p-2 border border-slate-200 print:border-gray-300 text-center font-bold text-slate-600">
                              {idx + 1}
                            </td>
                            <td className="p-2 border border-slate-200 print:border-gray-300">
                              <input
                                type="text"
                                value={r.lightAngle}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setPhotoRecords((prev) =>
                                    prev.map((item) => (item.id === r.id ? { ...item, lightAngle: val } : item))
                                  );
                                }}
                                className="w-16 bg-transparent border-0 text-xs font-mono font-bold text-slate-800 focus:outline-none focus:bg-slate-100 rounded px-1"
                              />
                            </td>
                            <td className="p-2 border border-slate-200 print:border-gray-300">
                              <input
                                type="text"
                                value={r.lightIntensity}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setPhotoRecords((prev) =>
                                    prev.map((item) => (item.id === r.id ? { ...item, lightIntensity: val } : item))
                                  );
                                }}
                                className="w-16 bg-transparent border-0 text-xs font-mono text-slate-800 focus:outline-none focus:bg-slate-100 rounded px-1"
                              />
                            </td>
                            <td className="p-2 border border-slate-200 print:border-gray-300">
                              <input
                                type="text"
                                value={r.lightColor}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setPhotoRecords((prev) =>
                                    prev.map((item) => (item.id === r.id ? { ...item, lightColor: val } : item))
                                  );
                                }}
                                className="w-20 bg-transparent border-0 text-xs font-semibold text-slate-800 focus:outline-none focus:bg-slate-100 rounded px-1"
                              />
                            </td>
                            <td className="p-2 border border-slate-200 print:border-gray-300">
                              <input
                                type="text"
                                value={r.treatment}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setPhotoRecords((prev) =>
                                    prev.map((item) => (item.id === r.id ? { ...item, treatment: val } : item))
                                  );
                                }}
                                className="w-full bg-transparent border-0 text-xs text-slate-800 focus:outline-none focus:bg-slate-100 rounded px-1"
                              />
                            </td>
                            <td className="p-2 border border-slate-200 print:border-gray-300">
                              <input
                                type="text"
                                value={r.bentAngle}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setPhotoRecords((prev) =>
                                    prev.map((item) => (item.id === r.id ? { ...item, bentAngle: val } : item))
                                  );
                                }}
                                className="w-16 bg-transparent border-0 text-xs font-mono font-bold text-emerald-700 focus:outline-none focus:bg-slate-100 rounded px-1"
                              />
                            </td>
                            <td className="p-2 border border-slate-200 print:border-gray-300">
                              <input
                                type="text"
                                value={r.note}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setPhotoRecords((prev) =>
                                    prev.map((item) => (item.id === r.id ? { ...item, note: val } : item))
                                  );
                                }}
                                className="w-full bg-transparent border-0 text-xs text-slate-700 focus:outline-none focus:bg-slate-100 rounded px-1"
                              />
                            </td>
                            <td className="p-2 border border-slate-200 print:hidden text-center">
                              <button
                                onClick={() => setPhotoRecords((prev) => prev.filter((item) => item.id !== r.id))}
                                className="text-slate-400 hover:text-rose-600 font-bold"
                              >
                                ✕
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Section 3: Selectable Scientific Diagram (Student Choice) */}
              <div className="space-y-2 bg-slate-50/70 p-3.5 rounded-2xl border border-slate-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="font-bold text-emerald-900 text-xs flex items-center gap-1.5">
                    <span>🔬</span> 3. Sơ đồ minh họa khoa học (Học sinh tự chọn sơ đồ đưa vào báo cáo):
                  </div>
                  {/* Diagram Selector Buttons */}
                  <div className="flex flex-wrap gap-1 print:hidden">
                    {[
                      { id: 'auxin', label: '1. Phân bố Auxin' },
                      { id: 'darwin', label: '2. Thí nghiệm Darwin' },
                      { id: 'chart', label: '3. Đồ thị Góc uốn' },
                      { id: 'none', label: 'Không chèn' },
                    ].map((d) => (
                      <button
                        key={d.id}
                        onClick={() => setPhotoSelectedDiagram(d.id as any)}
                        className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition cursor-pointer ${
                          photoSelectedDiagram === d.id
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {d.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Diagram 1: Auxin Distribution */}
                {photoSelectedDiagram === 'auxin' && (
                  <div className="bg-white p-3 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-center gap-4 text-[11px]">
                    <svg viewBox="0 0 280 120" className="w-full sm:w-1/2 h-28 bg-slate-50 rounded-lg border border-slate-200">
                      <path d="M 120 115 Q 120 60, 150 15 L 165 18 Q 135 60, 135 115 Z" fill="#bbf7d0" stroke="#16a34a" strokeWidth="1.5" />
                      <circle cx="125" cy="55" r="2.5" fill="#f59e0b" />
                      <circle cx="128" cy="70" r="2.5" fill="#f59e0b" />
                      <circle cx="127" cy="85" r="2.5" fill="#f59e0b" />
                      <circle cx="130" cy="100" r="2.5" fill="#f59e0b" />
                      <circle cx="138" cy="65" r="2" fill="#f59e0b" />
                      <line x1="220" y1="20" x2="175" y2="35" stroke="#eab308" strokeWidth="2" />
                      <text x="225" y="25" fill="#d97706" fontSize="9" fontWeight="bold">Photon ánh sáng ☀️</text>
                      <text x="50" y="75" fill="#d97706" fontSize="8" fontWeight="bold">Auxin tích tụ phía tối (Dãn dài nhanh)</text>
                      <text x="170" y="90" fill="#16a34a" fontSize="8">Phía sáng (Dãn dài chậm)</text>
                    </svg>
                    <div className="w-full sm:w-1/2 space-y-1 text-slate-600">
                      <div className="font-bold text-slate-800 text-xs">Sơ đồ phân bố bất đối xứng Auxin (AIA):</div>
                      <p>
                        • Ánh sáng đơn hướng kích hoạt protein PIN điều hướng dòng auxin di chuyển chủ động sang phía khuất sáng.
                      </p>
                      <p>
                        • Nồng độ auxin cao ở phía tối kích hoạt bơm proton H⁺ dãn lỏng thành cellulose, làm tế bào phía tối phình dài nhanh hơn đẩy cây uốn cong về phía nguồn sáng.
                      </p>
                    </div>
                  </div>
                )}

                {/* Diagram 2: Darwin Coleoptile Experiments */}
                {photoSelectedDiagram === 'darwin' && (
                  <div className="bg-white p-3 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-center gap-4 text-[11px]">
                    <svg viewBox="0 0 280 120" className="w-full sm:w-1/2 h-28 bg-slate-50 rounded-lg border border-slate-200">
                      {/* Coleoptile 1: Normal */}
                      <path d="M 30 110 Q 30 65, 45 40 L 52 42 Q 38 65, 38 110 Z" fill="#bbf7d0" stroke="#16a34a" strokeWidth="1" />
                      <text x="40" y="118" fontSize="7" textAnchor="middle" fill="#166534">1. Đối chứng</text>

                      {/* Coleoptile 2: Decapitated */}
                      <path d="M 85 110 L 85 65 L 93 65 L 93 110 Z" fill="#bbf7d0" stroke="#16a34a" strokeWidth="1" />
                      <line x1="82" y1="65" x2="96" y2="65" stroke="#ef4444" strokeWidth="1.5" />
                      <text x="89" y="118" fontSize="7" textAnchor="middle" fill="#dc2626">2. Cắt chóp</text>

                      {/* Coleoptile 3: Opaque Cap */}
                      <path d="M 140 110 L 140 50 L 148 50 L 148 110 Z" fill="#bbf7d0" stroke="#16a34a" strokeWidth="1" />
                      <rect x="138" y="45" width="12" height="15" rx="2" fill="#1e293b" />
                      <text x="144" y="118" fontSize="7" textAnchor="middle" fill="#334155">3. Mũ đen</text>

                      {/* Coleoptile 4: Transparent Cap */}
                      <path d="M 195 110 Q 195 65, 210 40 L 217 42 Q 203 65, 203 110 Z" fill="#bbf7d0" stroke="#16a34a" strokeWidth="1" />
                      <rect x="204" y="36" width="14" height="15" rx="2" fill="#bae6fd" fillOpacity="0.5" stroke="#0284c7" strokeWidth="0.8" />
                      <text x="210" y="118" fontSize="7" textAnchor="middle" fill="#0284c7">4. Mũ trong</text>

                      {/* Light arrow from right */}
                      <line x1="265" y1="30" x2="235" y2="45" stroke="#eab308" strokeWidth="2" />
                      <text x="240" y="24" fill="#d97706" fontSize="7" fontWeight="bold">Ánh sáng ☀️</text>
                    </svg>
                    <div className="w-full sm:w-1/2 space-y-1 text-slate-600">
                      <div className="font-bold text-slate-800 text-xs">Sơ đồ thí nghiệm kinh điển Charles Darwin (1880):</div>
                      <p>
                        • <strong>Cắt chóp hoặc che mũ tối:</strong> Cây mất hoàn toàn phản ứng hướng sáng, chứng minh <em>chóp bao lá mầm là nơi duy nhất tiếp nhận kích thích ánh sáng</em>.
                      </p>
                      <p>
                        • <strong>Mũ trong suốt:</strong> Cây vẫn uốn cong bình thường về phía nguồn sáng.
                      </p>
                    </div>
                  </div>
                )}

                {/* Diagram 3: Angle Correlation Chart */}
                {photoSelectedDiagram === 'chart' && (
                  <div className="bg-white p-3 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-center gap-4 text-[11px]">
                    <svg viewBox="0 0 280 120" className="w-full sm:w-1/2 h-28 bg-slate-50 rounded-lg border border-slate-200">
                      <line x1="30" y1="105" x2="260" y2="105" stroke="#94a3b8" strokeWidth="1" />
                      <line x1="145" y1="15" x2="145" y2="105" stroke="#94a3b8" strokeWidth="1" strokeDasharray="2,2" />
                      <path d="M 30 95 Q 145 105, 260 25" fill="none" stroke="#10b981" strokeWidth="2.5" />
                      <circle cx="210" cy="45" r="4" fill="#059669" />
                      <text x="145" y="115" textAnchor="middle" fill="#64748b" fontSize="7">Góc lệch nguồn sáng (α: 0° - 45°)</text>
                      <text x="35" y="25" fill="#059669" fontSize="8" fontWeight="bold">Góc uốn thân (θ)</text>
                      <text x="215" y="40" fill="#059669" fontSize="7" fontWeight="bold">Điểm đo thực tế</text>
                    </svg>
                    <div className="w-full sm:w-1/2 space-y-1 text-slate-600">
                      <div className="font-bold text-slate-800 text-xs">Tương quan góc nguồn sáng và góc uốn thân:</div>
                      <p>
                        Góc uốn thân cây tỷ lệ thuận với góc lệch nguồn sáng trong khoảng 0° đến 45°. Khi góc lệch ánh sáng càng lớn, gradien nồng độ auxin giữa hai phía thân càng chênh lệch rõ rệt.
                      </p>
                    </div>
                  </div>
                )}

                {photoSelectedDiagram === 'none' && (
                  <div className="p-3 text-center text-slate-400 italic bg-white rounded-xl border border-dashed border-slate-200">
                    Học sinh đã chọn không chèn sơ đồ vào bài báo cáo này.
                  </div>
                )}
              </div>

              {/* Section 4: Qualitative Observations & Biological Mechanism */}
              <div className="space-y-3 bg-slate-50/70 p-3.5 rounded-2xl border border-slate-200">
                <div className="font-bold text-emerald-900 text-xs flex items-center gap-1.5">
                  <span>💡</span> 4. Mô tả hiện tượng & Luận giải cơ chế sinh học phân tử:
                </div>
                <div>
                  <label className="text-[11px] text-slate-600 font-semibold">a. Mô tả chi tiết hiện tượng quan sát được:</label>
                  <textarea
                    rows={2}
                    placeholder="Mô tả hướng uốn, sự khác biệt giữa các phương pháp xử lý chóp (bình thường vs cắt chóp vs bọc mũ)..."
                    value={photoObservation}
                    onChange={(e) => setPhotoObservation(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-xs text-slate-800 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-400 mt-1"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-600 font-semibold">b. Luận giải cơ chế phân tử (Thụ thể Phototropin, dòng Auxin, thuyết sinh trưởng axit):</label>
                  <textarea
                    rows={3}
                    placeholder="Giải thích tại sao tế bào phía tối lại dãn dài nhanh hơn phía sáng? Vai trò của enzyme expansin và bơm H⁺..."
                    value={photoMechanism}
                    onChange={(e) => setPhotoMechanism(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-xs text-slate-800 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-400 mt-1"
                  />
                </div>
              </div>

              {/* Section 5: Conclusion & Real-World Applications */}
              <div className="space-y-3 bg-slate-50/70 p-3.5 rounded-2xl border border-slate-200">
                <div className="font-bold text-emerald-900 text-xs flex items-center gap-1.5">
                  <span>🌍</span> 5. Kết luận & Vận dụng thực tiễn:
                </div>
                <div>
                  <label className="text-[11px] text-slate-600 font-semibold">a. Kết luận khoa học rút ra từ thí nghiệm:</label>
                  <textarea
                    rows={2}
                    placeholder="Rút ra kết luận tổng quát về tính hướng sáng dương và bộ phận tiếp nhận kích thích..."
                    value={photoConclusion}
                    onChange={(e) => setPhotoConclusion(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-xs text-slate-800 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-400 mt-1"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-600 font-semibold">b. Vận dụng trong trồng trọt & đời sống thực tế:</label>
                  <textarea
                    rows={2}
                    placeholder="Giải thích hiện tượng cây đặt bên cửa sổ bị nghiêng, đề xuất giải pháp chăm sóc cây cảnh trong nhà..."
                    value={photoApplication}
                    onChange={(e) => setPhotoApplication(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-xs text-slate-800 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-400 mt-1"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* LAB 2: PHOTOSYNTHESIS REPORT FORM */}
          {/* ============================================================== */}
          {activeLab === 'photosynthesis' && (
            <div className="space-y-5 text-xs text-slate-800">
              <div className="border-l-4 border-cyan-500 pl-3">
                <h3 className="font-bold text-slate-900 print:text-black text-base">
                  BÀI THÍ NGHIỆM: KHẢO SÁT CÁC YẾU TỐ ẢNH HƯỞNG TỚI QUANG HỢP Ở CÀNH RONG ĐUÔI CHÓ
                </h3>
              </div>

              {/* Section 1: Objective & Hypothesis */}
              <div className="space-y-3 bg-slate-50/70 p-3.5 rounded-2xl border border-slate-200">
                <div className="font-bold text-cyan-900 text-xs flex items-center gap-1.5">
                  <span>🎯</span> 1. Mục đích thí nghiệm & Giả thuyết khoa học:
                </div>
                <div className="space-y-2">
                  <div>
                    <label className="text-[11px] text-slate-600 font-semibold">a. Mục đích thí nghiệm (Học sinh tự điền):</label>
                    <textarea
                      rows={2}
                      placeholder="Nêu mục đích em tiến hành thí nghiệm quang hợp ở rong đuôi chó (đo bọt khí O₂, khảo sát đèn, CO₂, nhiệt độ, kính lọc)..."
                      value={synthObjective}
                      onChange={(e) => setSynthObjective(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-xs text-slate-800 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-400 mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-600 font-semibold">b. Giả thuyết nghiên cứu (Hypothesis):</label>
                    <textarea
                      rows={2}
                      placeholder="Dự đoán mối quan hệ giữa khoảng cách đèn, nồng độ NaHCO₃, màu kính lọc với tốc độ thoát bọt khí O₂..."
                      value={synthHypothesis}
                      onChange={(e) => setSynthHypothesis(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-xs text-slate-800 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-400 mt-1"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Data Table with Custom Extraction & Manual Row Addition */}
              <div className="space-y-2 bg-slate-50/70 p-3.5 rounded-2xl border border-slate-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="font-bold text-cyan-900 text-xs flex items-center gap-1.5">
                    <span>📊</span> 2. Bảng số liệu thực nghiệm đo đạc:
                  </div>
                  <div className="flex items-center gap-2 print:hidden">
                    <button
                      onClick={handleExtractLiveData}
                      className="text-[10px] bg-cyan-600 hover:bg-cyan-700 text-white font-bold px-2.5 py-1 rounded-lg transition cursor-pointer flex items-center gap-1 shadow-xs"
                      title="Ghi thêm lần đo từ 3D hiện tại"
                    >
                      <span>📥</span> Trích xuất 3D
                    </button>
                    <button
                      onClick={handleAddManualRow}
                      className="text-[10px] bg-white hover:bg-slate-100 text-cyan-800 border border-cyan-300 font-bold px-2 py-1 rounded-lg transition cursor-pointer flex items-center gap-1"
                      title="Thêm dòng trống để tự nhập số liệu thực nghiệm"
                    >
                      <span>➕</span> Thêm dòng
                    </button>
                    {synthRecords.length > 0 && (
                      <button
                        onClick={() => setSynthRecords([])}
                        className="text-[10px] text-slate-500 hover:text-rose-600 px-1 py-1"
                        title="Xóa toàn bộ các dòng đo"
                      >
                        Xóa bảng
                      </button>
                    )}
                  </div>
                </div>

                {synthRecords.length === 0 ? (
                  <div className="p-4 text-center text-slate-400 italic bg-white rounded-xl border border-dashed border-slate-300">
                    Chưa có số liệu thực nghiệm. Bấm nút <strong>"Trích xuất 3D"</strong> hoặc <strong>"Thêm dòng"</strong> để ghi số liệu.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse border border-slate-200 print:border-gray-300 text-xs">
                      <thead>
                        <tr className="bg-cyan-100/60 print:bg-gray-200 text-cyan-950 font-bold">
                          <th className="p-2 border border-slate-200 print:border-gray-300 text-center w-10">Lần</th>
                          <th className="p-2 border border-slate-200 print:border-gray-300">Cự ly đèn (cm)</th>
                          <th className="p-2 border border-slate-200 print:border-gray-300">CO₂ (NaHCO₃ %)</th>
                          <th className="p-2 border border-slate-200 print:border-gray-300">Nhiệt độ (°C)</th>
                          <th className="p-2 border border-slate-200 print:border-gray-300">Kính lọc</th>
                          <th className="p-2 border border-slate-200 print:border-gray-300 font-bold text-cyan-800">Tốc độ bọt O₂</th>
                          <th className="p-2 border border-slate-200 print:border-gray-300">% O₂ tích lũy</th>
                          <th className="p-2 border border-slate-200 print:border-gray-300">Ghi chú bọt khí lá & cuống</th>
                          <th className="p-2 border border-slate-200 print:hidden text-center w-8">Xóa</th>
                        </tr>
                      </thead>
                      <tbody>
                        {synthRecords.map((r, idx) => (
                          <tr key={r.id} className="bg-white hover:bg-slate-50 transition">
                            <td className="p-2 border border-slate-200 print:border-gray-300 text-center font-bold text-slate-600">
                              {idx + 1}
                            </td>
                            <td className="p-2 border border-slate-200 print:border-gray-300">
                              <input
                                type="text"
                                value={r.distance}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setSynthRecords((prev) =>
                                    prev.map((item) => (item.id === r.id ? { ...item, distance: val } : item))
                                  );
                                }}
                                className="w-16 bg-transparent border-0 text-xs font-mono font-bold text-slate-800 focus:outline-none focus:bg-slate-100 rounded px-1"
                              />
                            </td>
                            <td className="p-2 border border-slate-200 print:border-gray-300">
                              <input
                                type="text"
                                value={r.co2}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setSynthRecords((prev) =>
                                    prev.map((item) => (item.id === r.id ? { ...item, co2: val } : item))
                                  );
                                }}
                                className="w-16 bg-transparent border-0 text-xs font-mono text-slate-800 focus:outline-none focus:bg-slate-100 rounded px-1"
                              />
                            </td>
                            <td className="p-2 border border-slate-200 print:border-gray-300">
                              <input
                                type="text"
                                value={r.temp}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setSynthRecords((prev) =>
                                    prev.map((item) => (item.id === r.id ? { ...item, temp: val } : item))
                                  );
                                }}
                                className="w-16 bg-transparent border-0 text-xs font-mono text-slate-800 focus:outline-none focus:bg-slate-100 rounded px-1"
                              />
                            </td>
                            <td className="p-2 border border-slate-200 print:border-gray-300">
                              <input
                                type="text"
                                value={r.filter}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setSynthRecords((prev) =>
                                    prev.map((item) => (item.id === r.id ? { ...item, filter: val } : item))
                                  );
                                }}
                                className="w-20 bg-transparent border-0 text-xs font-semibold text-slate-800 focus:outline-none focus:bg-slate-100 rounded px-1"
                              />
                            </td>
                            <td className="p-2 border border-slate-200 print:border-gray-300">
                              <input
                                type="text"
                                value={r.bubbleRate}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setSynthRecords((prev) =>
                                    prev.map((item) => (item.id === r.id ? { ...item, bubbleRate: val } : item))
                                  );
                                }}
                                className="w-20 bg-transparent border-0 text-xs font-mono font-bold text-cyan-700 focus:outline-none focus:bg-slate-100 rounded px-1"
                              />
                            </td>
                            <td className="p-2 border border-slate-200 print:border-gray-300">
                              <input
                                type="text"
                                value={r.o2Vol}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setSynthRecords((prev) =>
                                    prev.map((item) => (item.id === r.id ? { ...item, o2Vol: val } : item))
                                  );
                                }}
                                className="w-16 bg-transparent border-0 text-xs font-mono font-bold text-amber-600 focus:outline-none focus:bg-slate-100 rounded px-1"
                              />
                            </td>
                            <td className="p-2 border border-slate-200 print:border-gray-300">
                              <input
                                type="text"
                                value={r.note}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setSynthRecords((prev) =>
                                    prev.map((item) => (item.id === r.id ? { ...item, note: val } : item))
                                  );
                                }}
                                className="w-full bg-transparent border-0 text-xs text-slate-700 focus:outline-none focus:bg-slate-100 rounded px-1"
                              />
                            </td>
                            <td className="p-2 border border-slate-200 print:hidden text-center">
                              <button
                                onClick={() => setSynthRecords((prev) => prev.filter((item) => item.id !== r.id))}
                                className="text-slate-400 hover:text-rose-600 font-bold"
                              >
                                ✕
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Section 3: Selectable Scientific Diagram (Student Choice) */}
              <div className="space-y-2 bg-slate-50/70 p-3.5 rounded-2xl border border-slate-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="font-bold text-cyan-900 text-xs flex items-center gap-1.5">
                    <span>🔬</span> 3. Sơ đồ minh họa khoa học (Học sinh tự chọn sơ đồ đưa vào báo cáo):
                  </div>
                  {/* Diagram Selector Buttons */}
                  <div className="flex flex-wrap gap-1 print:hidden">
                    {[
                      { id: 'anatomy', label: '1. Thoát bọt lá & cuống' },
                      { id: 'calvin', label: '2. Pha sáng & Pha tối' },
                      { id: 'spectrum', label: '3. Phổ hấp thụ diệp lục' },
                      { id: 'none', label: 'Không chèn' },
                    ].map((d) => (
                      <button
                        key={d.id}
                        onClick={() => setSynthSelectedDiagram(d.id as any)}
                        className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition cursor-pointer ${
                          synthSelectedDiagram === d.id
                            ? 'bg-cyan-600 text-white border-cyan-600 shadow-xs'
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {d.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Diagram 1: Anatomy & Bubbles Escaping from Leaves & Stem */}
                {synthSelectedDiagram === 'anatomy' && (
                  <div className="bg-white p-3 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-center gap-4 text-[11px]">
                    <svg viewBox="0 0 280 120" className="w-full sm:w-1/2 h-28 bg-slate-50 rounded-lg border border-slate-200">
                      <rect x="50" y="20" width="180" height="90" rx="6" fill="#f0f9ff" stroke="#38bdf8" strokeWidth="1.5" />
                      <path d="M 110 90 L 140 50 L 140 10 L 150 10 L 150 50 L 180 90 Z" fill="#e0f2fe" stroke="#0284c7" strokeWidth="1" />
                      <path d="M 130 95 Q 145 75, 160 95" stroke="#15803d" strokeWidth="3" />
                      <path d="M 145 90 L 145 72" stroke="#166534" strokeWidth="3" />
                      <circle cx="135" cy="85" r="2" fill="#38bdf8" />
                      <circle cx="155" cy="85" r="2" fill="#38bdf8" />
                      <circle cx="145" cy="60" r="3" fill="#0284c7" />
                      <circle cx="145" cy="40" r="3.5" fill="#0284c7" />
                      <circle cx="145" cy="20" r="4" fill="#0284c7" />
                      <text x="10" y="55" fill="#0369a1" fontSize="8" fontWeight="bold">Phễu thủy tinh</text>
                      <text x="160" y="30" fill="#0284c7" fontSize="8" fontWeight="bold">Ống nghiệm thu O₂ ↑</text>
                      <text x="95" y="112" fill="#15803d" fontSize="8">Bọt khí li ti bám lá & thoát cuống</text>
                    </svg>
                    <div className="w-full sm:w-1/2 space-y-1 text-slate-600">
                      <div className="font-bold text-slate-800 text-xs">Cơ chế giải phẫu & Pha sáng ở thực vật thủy sinh:</div>
                      <p>
                        • <strong>Tại phiến lá:</strong> Biểu bì rất mỏng (2 lớp tế bào), không có lớp cutin dày $\to$ vi bọt khí O₂ khuếch tán tạo lớp bọt li ti bao phủ lá.
                      </p>
                      <p>
                        • <strong>Tại cuống cành:</strong> Hệ thống ống khí mô xốp (aerenchyma) gom O₂ dẫn thoát dồn dập vào phễu gom khí.
                      </p>
                    </div>
                  </div>
                )}

                {/* Diagram 2: Light Phase & Calvin Cycle Coupling */}
                {synthSelectedDiagram === 'calvin' && (
                  <div className="bg-white p-3 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-center gap-4 text-[11px]">
                    <svg viewBox="0 0 280 120" className="w-full sm:w-1/2 h-28 bg-slate-50 rounded-lg border border-slate-200">
                      {/* Thylakoid block */}
                      <rect x="25" y="25" width="95" height="70" rx="8" fill="#ecfdf5" stroke="#10b981" strokeWidth="1.5" />
                      <text x="72" y="42" textAnchor="middle" fill="#065f46" fontSize="8" fontWeight="bold">1. Pha Sáng (Thylakoid)</text>
                      <text x="72" y="58" textAnchor="middle" fill="#047857" fontSize="7">Quang phân ly nước</text>
                      <text x="72" y="72" textAnchor="middle" fill="#047857" fontSize="7 font-mono">2H₂O → 4H⁺ + 4e⁻ + O₂↑</text>
                      <text x="72" y="86" textAnchor="middle" fill="#059669" fontSize="7 font-bold">Giải phóng O₂ ↑</text>

                      {/* Coupling arrows */}
                      <line x1="120" y1="45" x2="155" y2="45" stroke="#059669" strokeWidth="1.5" />
                      <text x="138" y="40" textAnchor="middle" fill="#059669" fontSize="6 font-bold">ATP, NADPH</text>
                      <line x1="155" y1="75" x2="120" y2="75" stroke="#94a3b8" strokeWidth="1.5" />
                      <text x="138" y="85" textAnchor="middle" fill="#64748b" fontSize="6 font-bold">ADP, NADP⁺</text>

                      {/* Stroma / Calvin block */}
                      <rect x="160" y="25" width="95" height="70" rx="8" fill="#eff6ff" stroke="#3b82f6" strokeWidth="1.5" />
                      <text x="207" y="42" textAnchor="middle" fill="#1e40af" fontSize="8" fontWeight="bold">2. Pha Tối (Stroma)</text>
                      <text x="207" y="58" textAnchor="middle" fill="#1d4ed8" fontSize="7">Chu trình Calvin</text>
                      <text x="207" y="72" textAnchor="middle" fill="#1d4ed8" fontSize="7">RuBisCO cố định CO₂</text>
                      <text x="207" y="86" textAnchor="middle" fill="#2563eb" fontSize="7 font-bold">Tạo C₆H₁₂O₆</text>
                    </svg>
                    <div className="w-full sm:w-1/2 space-y-1 text-slate-600">
                      <div className="font-bold text-slate-800 text-xs">Mối quan hệ nhân - quả giữa 2 pha:</div>
                      <p>
                        • <strong>Pha sáng:</strong> Chuyển hóa quang năng thành hóa năng trong ATP và NADPH, đồng thời bẻ gãy H₂O giải phóng khí O₂ thoát ra ngoài.
                      </p>
                      <p>
                        • <strong>Pha tối:</strong> Sử dụng ATP và NADPH từ pha sáng để khử CO₂ thành đường Glucose.
                      </p>
                    </div>
                  </div>
                )}

                {/* Diagram 3: Chlorophyll Absorption Spectrum */}
                {synthSelectedDiagram === 'spectrum' && (
                  <div className="bg-white p-3 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-center gap-4 text-[11px]">
                    <svg viewBox="0 0 280 120" className="w-full sm:w-1/2 h-28 bg-slate-50 rounded-lg border border-slate-200">
                      <defs>
                        <linearGradient id="repSpecGrad" x1="0" y1="0" x2="1" y2="0">
                          <stop offset="0%" stopColor="#8b5cf6" />
                          <stop offset="25%" stopColor="#3b82f6" />
                          <stop offset="50%" stopColor="#22c55e" />
                          <stop offset="75%" stopColor="#eab308" />
                          <stop offset="100%" stopColor="#ef4444" />
                        </linearGradient>
                      </defs>
                      <rect x="25" y="95" width="230" height="4" fill="url(#repSpecGrad)" rx="2" />
                      <path d="M 25 90 Q 55 15, 80 25 T 140 85 T 200 65 T 235 25 T 255 90" fill="none" stroke="#059669" strokeWidth="2" />
                      <circle cx="80" cy="25" r="3.5" fill="#2563eb" />
                      <circle cx="140" cy="85" r="3.5" fill="#22c55e" />
                      <circle cx="235" cy="25" r="3.5" fill="#dc2626" />
                      <text x="25" y="112" fill="#6d28d9" fontSize="7">400nm (Lam)</text>
                      <text x="140" y="112" textAnchor="middle" fill="#059669" fontSize="7 font-bold">550nm (Lục - Phản xạ!)</text>
                      <text x="255" y="112" textAnchor="end" fill="#dc2626" fontSize="7">700nm (Đỏ)</text>
                      <text x="30" y="20" fill="#059669" fontSize="8 font-bold">Độ hấp thụ diệp lục</text>
                    </svg>
                    <div className="w-full sm:w-1/2 space-y-1 text-slate-600">
                      <div className="font-bold text-slate-800 text-xs">Quang phổ hấp thụ của hệ sắc tố diệp lục:</div>
                      <p>
                        Diệp lục hấp thụ mạnh nhất tại dải ánh sáng Xanh lam (~430nm) và Đỏ (~660nm). Ánh sáng xanh lục (~550nm) hầu như không được hấp thụ mà bị phản xạ, khiến lá rong có màu lục và tốc độ sủi bọt khí giảm cực tiểu khi dùng kính lọc lục.
                      </p>
                    </div>
                  </div>
                )}

                {synthSelectedDiagram === 'none' && (
                  <div className="p-3 text-center text-slate-400 italic bg-white rounded-xl border border-dashed border-slate-200">
                    Học sinh đã chọn không chèn sơ đồ vào bài báo cáo này.
                  </div>
                )}
              </div>

              {/* Section 4: Qualitative Observations, Splint Test & Mechanism */}
              <div className="space-y-3 bg-slate-50/70 p-3.5 rounded-2xl border border-slate-200">
                <div className="font-bold text-cyan-900 text-xs flex items-center gap-1.5">
                  <span>💡</span> 4. Hiện tượng thực nghiệm, Thử que đóm & Cơ chế quang hợp:
                </div>
                <div>
                  <label className="text-[11px] text-slate-600 font-semibold">a. Mô tả hiện tượng bọt khí bám trên lá và thoát ra ở vết cắt cuống cành:</label>
                  <textarea
                    rows={2}
                    placeholder="Mô tả số lượng vi bọt khí li ti trên phiến lá, bọt khí nổi lên phễu thu khi thay đổi khoảng cách đèn..."
                    value={synthObservation}
                    onChange={(e) => setSynthObservation(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-xs text-slate-800 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-400 mt-1"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-600 font-semibold">b. Kết quả thử nghiệm que tàn đóm đỏ & Kết luận chất khí:</label>
                  <textarea
                    rows={2}
                    placeholder="Nêu hiện tượng khi đưa que tàn đóm vào miệng ống nghiệm, chứng minh khí thu được là khí gì..."
                    value={synthSplintResult}
                    onChange={(e) => setSynthSplintResult(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-xs text-slate-800 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-400 mt-1"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-600 font-semibold">c. Luận giải cơ chế sinh hóa (Pha sáng tại Thylakoid, Pha tối Calvin tại Stroma, Định luật Blackman):</label>
                  <textarea
                    rows={3}
                    placeholder="Giải thích nguồn gốc O₂ từ quang phân ly nước (2H₂O → 4H⁺ + 4e⁻ + O₂↑); tại sao kính lọc xanh lục làm quang hợp giảm cực tiểu; tại sao nhiệt độ >45°C làm giảm tạo bọt..."
                    value={synthMechanism}
                    onChange={(e) => setSynthMechanism(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-xs text-slate-800 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-400 mt-1"
                  />
                </div>
              </div>

              {/* Section 5: Conclusion & Real-World Applications */}
              <div className="space-y-3 bg-slate-50/70 p-3.5 rounded-2xl border border-slate-200">
                <div className="font-bold text-cyan-900 text-xs flex items-center gap-1.5">
                  <span>🌍</span> 5. Kết luận & Vận dụng thực tiễn:
                </div>
                <div>
                  <label className="text-[11px] text-slate-600 font-semibold">a. Kết luận khoa học rút ra từ bài thí nghiệm:</label>
                  <textarea
                    rows={2}
                    placeholder="Rút ra kết luận tổng quát về các nhân tố ảnh hưởng tới hiệu suất quang hợp của thực vật thủy sinh..."
                    value={synthConclusion}
                    onChange={(e) => setSynthConclusion(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-xs text-slate-800 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-400 mt-1"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-600 font-semibold">b. Vận dụng thực tế trong nông nghiệp công nghệ cao & bể thủy sinh:</label>
                  <textarea
                    rows={2}
                    placeholder="Ứng dụng đèn LED quang phổ kép (Xanh lam - Đỏ) trong nhà màng, kiểm soát nồng độ CO₂ và nhiệt độ nước trong bể cá thủy sinh cảnh..."
                    value={synthApplication}
                    onChange={(e) => setSynthApplication(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-xs text-slate-800 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-400 mt-1"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* LAB 3: HYDROTROPISM REPORT FORM */}
          {/* ============================================================== */}
          {activeLab === 'hydrotropism' && (
            <div className="space-y-5 text-xs text-slate-800">
              <div className="border-l-4 border-emerald-500 pl-3">
                <h3 className="font-bold text-slate-900 print:text-black text-base">
                  BÀI THÍ NGHIỆM: TÍNH HƯỚNG NƯỚC & HƯỚNG TRỌNG LỰC CỦA RỄ CÂY
                </h3>
              </div>

              {/* Section 1: Objective & Hypothesis */}
              <div className="space-y-3 bg-slate-50/70 p-3.5 rounded-2xl border border-slate-200">
                <div className="font-bold text-emerald-900 text-xs flex items-center gap-1.5">
                  <span>🎯</span> 1. Mục đích thí nghiệm & Giả thuyết khoa học:
                </div>
                <div className="space-y-2">
                  <div>
                    <label className="text-[11px] text-slate-600 font-semibold">a. Mục đích thí nghiệm (Học sinh tự điền):</label>
                    <textarea
                      rows={2}
                      placeholder="Nêu mục đích em tiến hành thí nghiệm hướng nước ở hệ rễ cây mầm (tính hướng nước dương, cạnh tranh hướng đất khi xoay hộp 90°)..."
                      value={hydroObjective}
                      onChange={(e) => setHydroObjective(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-xs text-slate-800 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-400 mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-600 font-semibold">b. Giả thuyết nghiên cứu (Hypothesis):</label>
                    <textarea
                      rows={2}
                      placeholder="Dự đoán hướng sinh trưởng uốn cong của rễ khi có chênh lệch độ ẩm trái/phải hoặc khi xoay ngang hộp..."
                      value={hydroHypothesis}
                      onChange={(e) => setHydroHypothesis(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-xs text-slate-800 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-400 mt-1"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Data Table with Custom Extraction & Manual Row Addition */}
              <div className="space-y-2 bg-slate-50/70 p-3.5 rounded-2xl border border-slate-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="font-bold text-emerald-900 text-xs flex items-center gap-1.5">
                    <span>📊</span> 2. Bảng số liệu thực nghiệm đo đạc:
                  </div>
                  <div className="flex items-center gap-2 print:hidden">
                    <button
                      onClick={handleExtractLiveData}
                      className="text-[10px] bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-2.5 py-1 rounded-lg transition cursor-pointer flex items-center gap-1 shadow-xs"
                      title="Ghi thêm lần đo từ 3D hiện tại"
                    >
                      <span>📥</span> Trích xuất 3D
                    </button>
                    <button
                      onClick={handleAddManualRow}
                      className="text-[10px] bg-white hover:bg-slate-100 text-emerald-800 border border-emerald-300 font-bold px-2 py-1 rounded-lg transition cursor-pointer flex items-center gap-1"
                      title="Thêm dòng trống để tự nhập số liệu thực nghiệm"
                    >
                      <span>➕</span> Thêm dòng
                    </button>
                    {hydroRecords.length > 0 && (
                      <button
                        onClick={() => setHydroRecords([])}
                        className="text-[10px] text-slate-500 hover:text-rose-600 px-1 py-1"
                        title="Xóa toàn bộ các dòng đo"
                      >
                        Xóa bảng
                      </button>
                    )}
                  </div>
                </div>

                {hydroRecords.length === 0 ? (
                  <div className="p-4 text-center text-slate-400 italic bg-white rounded-xl border border-dashed border-slate-300">
                    Chưa có số liệu thực nghiệm. Bấm nút <strong>"Trích xuất 3D"</strong> hoặc <strong>"Thêm dòng"</strong> để ghi số liệu.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse border border-slate-200 print:border-gray-300 text-xs">
                      <thead>
                        <tr className="bg-emerald-100/60 print:bg-gray-200 text-emerald-950 font-bold">
                          <th className="p-2 border border-slate-200 print:border-gray-300 text-center w-10">Lần</th>
                          <th className="p-2 border border-slate-200 print:border-gray-300">Vị trí cấp ẩm</th>
                          <th className="p-2 border border-slate-200 print:border-gray-300">Độ ẩm Trái / Phải (%)</th>
                          <th className="p-2 border border-slate-200 print:border-gray-300">Góc xoay hộp (°)</th>
                          <th className="p-2 border border-slate-200 print:border-gray-300">Chế độ X-Ray</th>
                          <th className="p-2 border border-slate-200 print:border-gray-300 font-bold text-emerald-800">Góc uốn rễ (θ)</th>
                          <th className="p-2 border border-slate-200 print:border-gray-300">Ghi chú quan sát</th>
                          <th className="p-2 border border-slate-200 print:hidden text-center w-8">Xóa</th>
                        </tr>
                      </thead>
                      <tbody>
                        {hydroRecords.map((r, idx) => (
                          <tr key={r.id} className="bg-white hover:bg-slate-50 transition">
                            <td className="p-2 border border-slate-200 print:border-gray-300 text-center font-bold text-slate-600">
                              {idx + 1}
                            </td>
                            <td className="p-2 border border-slate-200 print:border-gray-300">
                              <input
                                type="text"
                                value={r.waterPos}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setHydroRecords((prev) =>
                                    prev.map((item) => (item.id === r.id ? { ...item, waterPos: val } : item))
                                  );
                                }}
                                className="w-24 bg-transparent border-0 text-xs font-semibold text-slate-800 focus:outline-none focus:bg-slate-100 rounded px-1"
                              />
                            </td>
                            <td className="p-2 border border-slate-200 print:border-gray-300">
                              <span className="font-mono">{r.moistL}% / {r.moistR}%</span>
                            </td>
                            <td className="p-2 border border-slate-200 print:border-gray-300">
                              <input
                                type="text"
                                value={r.rotation}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setHydroRecords((prev) =>
                                    prev.map((item) => (item.id === r.id ? { ...item, rotation: val } : item))
                                  );
                                }}
                                className="w-16 bg-transparent border-0 text-xs font-mono text-slate-800 focus:outline-none focus:bg-slate-100 rounded px-1"
                              />
                            </td>
                            <td className="p-2 border border-slate-200 print:border-gray-300">
                              <input
                                type="text"
                                value={r.xray}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setHydroRecords((prev) =>
                                    prev.map((item) => (item.id === r.id ? { ...item, xray: val } : item))
                                  );
                                }}
                                className="w-20 bg-transparent border-0 text-xs text-slate-800 focus:outline-none focus:bg-slate-100 rounded px-1"
                              />
                            </td>
                            <td className="p-2 border border-slate-200 print:border-gray-300">
                              <input
                                type="text"
                                value={r.rootAngle}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setHydroRecords((prev) =>
                                    prev.map((item) => (item.id === r.id ? { ...item, rootAngle: val } : item))
                                  );
                                }}
                                className="w-16 bg-transparent border-0 text-xs font-mono font-bold text-emerald-700 focus:outline-none focus:bg-slate-100 rounded px-1"
                              />
                            </td>
                            <td className="p-2 border border-slate-200 print:border-gray-300">
                              <input
                                type="text"
                                value={r.note}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setHydroRecords((prev) =>
                                    prev.map((item) => (item.id === r.id ? { ...item, note: val } : item))
                                  );
                                }}
                                className="w-full bg-transparent border-0 text-xs text-slate-700 focus:outline-none focus:bg-slate-100 rounded px-1"
                              />
                            </td>
                            <td className="p-2 border border-slate-200 print:hidden text-center">
                              <button
                                onClick={() => setHydroRecords((prev) => prev.filter((item) => item.id !== r.id))}
                                className="text-slate-400 hover:text-rose-600 font-bold"
                              >
                                ✕
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Section 3: Selectable Scientific Diagram (Student Choice) */}
              <div className="space-y-2 bg-slate-50/70 p-3.5 rounded-2xl border border-slate-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="font-bold text-emerald-900 text-xs flex items-center gap-1.5">
                    <span>🔬</span> 3. Sơ đồ minh họa khoa học (Học sinh tự chọn sơ đồ đưa vào báo cáo):
                  </div>
                  {/* Diagram Selector Buttons */}
                  <div className="flex flex-wrap gap-1 print:hidden">
                    {[
                      { id: 'vector', label: '1. Cạnh tranh Vector' },
                      { id: 'statoliths', label: '2. Hạt Thạch lạp' },
                      { id: 'paradox', label: '3. Nghịch lý Auxin rễ' },
                      { id: 'none', label: 'Không chèn' },
                    ].map((d) => (
                      <button
                        key={d.id}
                        onClick={() => setHydroSelectedDiagram(d.id as any)}
                        className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition cursor-pointer ${
                          hydroSelectedDiagram === d.id
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {d.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Diagram 1: Vector Competition in Rhizotron */}
                {hydroSelectedDiagram === 'vector' && (
                  <div className="bg-white p-3 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-center gap-4 text-[11px]">
                    <svg viewBox="0 0 280 120" className="w-full sm:w-1/2 h-28 bg-slate-50 rounded-lg border border-slate-200">
                      <rect x="50" y="15" width="180" height="95" rx="4" fill="#fafaf9" stroke="#78716c" strokeWidth="1.5" />
                      <path d="M 140 18 Q 140 60, 95 95" fill="none" stroke="#eab308" strokeWidth="3.5" />
                      <rect x="55" y="65" width="22" height="35" rx="3" fill="#38bdf8" />
                      <text x="66" y="86" fill="#0369a1" fontSize="7" fontWeight="bold" textAnchor="middle">Ẩm 💧</text>
                      <circle cx="95" cy="95" r="4" fill="#a16207" />
                      <circle cx="94" cy="94" r="1.5" fill="#fef08a" />
                      <line x1="130" y1="50" x2="100" y2="50" stroke="#0284c7" strokeWidth="1.5" />
                      <text x="100" y="42" fill="#0284c7" fontSize="8" fontWeight="bold">Vector Hướng nước 💧</text>
                      <line x1="145" y1="50" x2="145" y2="80" stroke="#78716c" strokeWidth="1.5" />
                      <text x="150" y="70" fill="#78716c" fontSize="8">Trọng lực g ↓</text>
                    </svg>
                    <div className="w-full sm:w-1/2 space-y-1 text-slate-600">
                      <div className="font-bold text-slate-800 text-xs">Cơ chế Cạnh tranh Vector (Hướng nước vs Hướng đất):</div>
                      <p>
                        Khi nguồn nước đặt lệch hoặc xoay ngang hộp 90°, rễ chịu 2 lực sinh học: trọng lực kéo cắm thẳng xuống đất và gradien độ ẩm hút ngang. Gradien ẩm mạnh sẽ định hướng rễ uốn ngang tìm nước sinh tồn.
                      </p>
                    </div>
                  </div>
                )}

                {/* Diagram 2: Statoliths Starch Grains in Columella Cells */}
                {hydroSelectedDiagram === 'statoliths' && (
                  <div className="bg-white p-3 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-center gap-4 text-[11px]">
                    <svg viewBox="0 0 280 120" className="w-full sm:w-1/2 h-28 bg-slate-50 rounded-lg border border-slate-200">
                      {/* Root cap outer shape */}
                      <path d="M 60 20 Q 140 10, 220 20 L 210 70 Q 140 115, 70 70 Z" fill="#fef3c7" stroke="#d97706" strokeWidth="1.5" />
                      {/* Columella cells with statoliths at bottom */}
                      <rect x="95" y="40" width="40" height="40" rx="3" fill="#ffffff" stroke="#b45309" strokeWidth="1" />
                      <rect x="145" y="40" width="40" height="40" rx="3" fill="#ffffff" stroke="#b45309" strokeWidth="1" />
                      {/* Heavy starch statoliths settled at bottom */}
                      <circle cx="107" cy="72" r="3.5" fill="#78350f" />
                      <circle cx="118" cy="73" r="4" fill="#78350f" />
                      <circle cx="127" cy="71" r="3" fill="#78350f" />
                      <circle cx="157" cy="72" r="3.5" fill="#78350f" />
                      <circle cx="168" cy="73" r="4" fill="#78350f" />
                      <circle cx="177" cy="71" r="3" fill="#78350f" />
                      <text x="140" y="28" textAnchor="middle" fill="#92400e" fontSize="8" fontWeight="bold">Tế bào Columella ở chóp rễ</text>
                      <text x="140" y="102" textAnchor="middle" fill="#78350f" fontSize="7 font-bold">Hạt Thạch lạp (Statoliths) lắng đáy theo trọng lực g ↓</text>
                    </svg>
                    <div className="w-full sm:w-1/2 space-y-1 text-slate-600">
                      <div className="font-bold text-slate-800 text-xs">Cơ chế tế bào cảm nhận trọng trường:</div>
                      <p>
                        Các tế bào ở vùng trung tâm chóp rễ chứa lạp thể giàu hạt tinh bột nặng (Statoliths). Trọng lực làm các hạt này chìm lắng xuống đáy tế bào, tác động lên lưới nội chất và điều hướng các bơm vận chuyển Auxin PIN.
                      </p>
                    </div>
                  </div>
                )}

                {/* Diagram 3: Auxin Paradox at Root */}
                {hydroSelectedDiagram === 'paradox' && (
                  <div className="bg-white p-3 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-center gap-4 text-[11px]">
                    <svg viewBox="0 0 280 120" className="w-full sm:w-1/2 h-28 bg-slate-50 rounded-lg border border-slate-200">
                      {/* Root zone curving towards water */}
                      <path d="M 60 40 Q 140 40, 200 80" stroke="#f59e0b" strokeWidth="6" strokeDasharray="3,3" fill="none" />
                      <path d="M 60 20 Q 140 20, 215 65" stroke="#10b981" strokeWidth="6" fill="none" />
                      {/* Labels */}
                      <text x="140" y="15" textAnchor="middle" fill="#047857" fontSize="8 font-bold">Mặt ẩm / Mặt trên: Ít Auxin → Dãn dài nhanh ➔</text>
                      <text x="140" y="60" textAnchor="middle" fill="#b45309" fontSize="8 font-bold">Mặt khô / Mặt dưới: Nhiều Auxin → ỨC CHẾ dãn dài ⛔</text>
                      <text x="215" y="100" fill="#0284c7" fontSize="8 font-bold">Rễ bẻ cong về nguồn nước 💧</text>
                    </svg>
                    <div className="w-full sm:w-1/2 space-y-1 text-slate-600">
                      <div className="font-bold text-slate-800 text-xs">Nghịch lý nồng độ Auxin ở rễ (Thuyết Cholodny-Went):</div>
                      <p>
                        Khác hoàn toàn với thân cây (auxin kích thích dãn dài), tế bào rễ cực kỳ nhạy cảm với auxin (~10⁻¹⁰ M). Nồng độ auxin cao ở phía dưới hoặc phía khô sẽ <strong>ức chế dãn dài</strong>, trong khi phía ẩm dài nhanh hơn đẩy chóp rễ uốn cong tìm nước.
                      </p>
                    </div>
                  </div>
                )}

                {hydroSelectedDiagram === 'none' && (
                  <div className="p-3 text-center text-slate-400 italic bg-white rounded-xl border border-dashed border-slate-200">
                    Học sinh đã chọn không chèn sơ đồ vào bài báo cáo này.
                  </div>
                )}
              </div>

              {/* Section 4: Qualitative Observations & Biological Mechanism */}
              <div className="space-y-3 bg-slate-50/70 p-3.5 rounded-2xl border border-slate-200">
                <div className="font-bold text-emerald-900 text-xs flex items-center gap-1.5">
                  <span>💡</span> 4. Mô tả hiện tượng & Luận giải cơ chế sinh học phân tử:
                </div>
                <div>
                  <label className="text-[11px] text-slate-600 font-semibold">a. Mô tả hướng uốn của rễ khi đổi vị trí nguồn ẩm và khi xoay hộp 90°:</label>
                  <textarea
                    rows={2}
                    placeholder="Mô tả rễ uốn cong sang phía có miếng xốp ẩm thế nào; phản ứng khi xoay hộp 90° nằm ngang..."
                    value={hydroObservation}
                    onChange={(e) => setHydroObservation(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-xs text-slate-800 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-400 mt-1"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-600 font-semibold">b. Luận giải cơ chế: Hạt thạch lạp (Statoliths), thụ thể MIZ1 và nghịch lý Auxin ở rễ:</label>
                  <textarea
                    rows={3}
                    placeholder="Tại sao nồng độ Auxin cao ở rễ lại ức chế tế bào dãn dài (khác với thân cây)? Vai trò của protein MIZ1 và hạt tinh bột thạch lạp..."
                    value={hydroMechanism}
                    onChange={(e) => setHydroMechanism(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-xs text-slate-800 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-400 mt-1"
                  />
                </div>
              </div>

              {/* Section 5: Conclusion & Real-World Applications */}
              <div className="space-y-3 bg-slate-50/70 p-3.5 rounded-2xl border border-slate-200">
                <div className="font-bold text-emerald-900 text-xs flex items-center gap-1.5">
                  <span>🌍</span> 5. Kết luận & Vận dụng thực tiễn:
                </div>
                <div>
                  <label className="text-[11px] text-slate-600 font-semibold">a. Kết luận khoa học rút ra từ thí nghiệm:</label>
                  <textarea
                    rows={2}
                    placeholder="Rút ra kết luận tổng quát về tính hướng nước dương và ưu thế sinh tồn của rễ khi tìm nước..."
                    value={hydroConclusion}
                    onChange={(e) => setHydroConclusion(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-xs text-slate-800 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-400 mt-1"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-600 font-semibold">b. Vận dụng trong công nghệ tưới ngầm nhỏ giọt & trồng trọt:</label>
                  <textarea
                    rows={2}
                    placeholder="Ứng dụng hệ thống tưới ngầm nhỏ giọt định hướng rễ ăn sâu bám chắc chống đổ ngã, tiết kiệm nước tưới..."
                    value={hydroApplication}
                    onChange={(e) => setHydroApplication(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-xs text-slate-800 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-400 mt-1"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Teacher Signature & Assessment Box */}
          <div className="grid grid-cols-2 pt-6 border-t border-slate-200 print:border-gray-400 text-xs text-center">
            <div className="space-y-1">
              <div className="font-semibold text-slate-500 print:text-gray-600">Học sinh hoàn thành báo cáo</div>
              <div className="text-[10px] text-slate-400 italic">(Ký và ghi rõ họ tên)</div>
              <div className="mt-12 font-bold text-slate-900 print:text-black">{studentName || 'Học sinh'}</div>
            </div>
            <div className="space-y-1">
              <div className="font-semibold text-slate-500 print:text-gray-600">Giáo viên hướng dẫn & Chấm điểm</div>
              <div className="text-[10px] text-slate-400 italic">(Đánh giá mức độ hoàn thành & Nhận xét)</div>
              <div className="mt-12 font-bold text-emerald-700 print:text-black">
                Phòng Lab 3D Đã Kiểm Định ✓
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
