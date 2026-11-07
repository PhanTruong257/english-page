'use client';

import React, { useState } from 'react';
import { PhotosynthesisState } from './types';

interface Props {
  state: PhotosynthesisState;
  onUpdateState: (updater: (prev: PhotosynthesisState) => PhotosynthesisState) => void;
}

export default function PhotosynthesisRelationshipMap({ state, onUpdateState }: Props) {
  const [selectedRelation, setSelectedRelation] = useState<'light' | 'co2' | 'temp' | 'spectrum' | 'system'>('system');

  // Calculate factor efficiencies (0 to 100%)
  const distMeters = Math.max(state.lampDistance, 10) / 100;
  const rawLightIntensity = (state.lampPower / (distMeters * distMeters * 80)) * 0.75;
  const lightEfficiency = Math.min(100, Math.round((Math.min(rawLightIntensity, 1.85) / 1.85) * 100));

  const co2Factor = (state.co2Concentration * 1.5) / (0.8 + state.co2Concentration);
  const co2Efficiency = Math.min(100, Math.round((co2Factor / 1.25) * 100));

  let tempEfficiency = 0;
  if (state.waterTemperature >= 5 && state.waterTemperature <= 50) {
    if (state.waterTemperature < 30) {
      tempEfficiency = Math.round(Math.max(0, ((state.waterTemperature - 5) / 25) * 100));
    } else {
      tempEfficiency = Math.round(Math.max(0, (1 - Math.pow((state.waterTemperature - 30) / 16, 2)) * 100));
    }
  }

  let filterEfficiency = 100;
  if (state.colorFilter === 'blue') filterEfficiency = 92;
  else if (state.colorFilter === 'red') filterEfficiency = 88;
  else if (state.colorFilter === 'green') filterEfficiency = 12;

  // Determine the primary limiting factor (Blackman Law of Limiting Factors)
  let limitingFactor = {
    title: 'Điều kiện tối ưu',
    desc: 'Tất cả các yếu tố môi trường đang hỗ trợ quang hợp rất tốt!',
    type: 'optimal',
  };

  if (filterEfficiency === 12) {
    limitingFactor = {
      title: 'Kính lọc Xanh lục (Green)',
      desc: 'Hệ sắc tố diệp lục phản xạ màu xanh lục nên hầu như không hấp thụ được năng lượng này, khiến quang hợp bị tê liệt dù các yếu tố khác rất tốt.',
      type: 'warning',
    };
  } else if (state.waterTemperature > 42) {
    limitingFactor = {
      title: 'Nhiệt độ nước quá cao (>42°C)',
      desc: 'Nhiệt độ cao làm biến tính nhiệt hệ enzyme RuBisCO trong chu trình Calvin, làm tốc độ quang hợp sụt giảm nghiêm trọng.',
      type: 'danger',
    };
  } else if (state.co2Concentration <= 0.2) {
    limitingFactor = {
      title: 'Thiếu hụt CO₂ hòa tan',
      desc: 'Nồng độ NaHCO₃ quá thấp làm thiếu hụt nguồn cacbon cung cấp cho pha tối, hạn chế phản ứng cố định CO₂.',
      type: 'warning',
    };
  } else if (lightEfficiency < 35) {
    limitingFactor = {
      title: 'Cường độ ánh sáng quá yếu',
      desc: 'Đèn chiếu sáng ở khoảng cách quá xa (>60 cm), năng lượng photon không đủ để kích hoạt pha sáng.',
      type: 'warning',
    };
  }

  return (
    <div className="space-y-4 bg-white/95 p-4 rounded-2xl border border-slate-200 shadow-sm text-slate-800">
      {/* Title & Navigation Tabs */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <div>
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
            <span>📊</span> Sơ đồ Mối Quan Hệ Nhân - Quả trong Quang Hợp
          </h3>
          <p className="text-[10px] text-slate-500">
            Xem tương quan thời gian thực khi bạn thay đổi các yếu tố môi trường
          </p>
        </div>

        {/* Sub-tabs for selecting which diagram to focus on */}
        <div className="flex flex-wrap gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
          <button
            onClick={() => setSelectedRelation('system')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition ${
              selectedRelation === 'system'
                ? 'bg-white text-cyan-700 border border-slate-200 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Hệ thống tổng quan
          </button>
          <button
            onClick={() => setSelectedRelation('light')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition ${
              selectedRelation === 'light'
                ? 'bg-white text-amber-700 border border-slate-200 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Ánh sáng
          </button>
          <button
            onClick={() => setSelectedRelation('co2')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition ${
              selectedRelation === 'co2'
                ? 'bg-white text-emerald-700 border border-slate-200 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            $CO_2$
          </button>
          <button
            onClick={() => setSelectedRelation('temp')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition ${
              selectedRelation === 'temp'
                ? 'bg-white text-sky-700 border border-slate-200 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Nhiệt độ
          </button>
          <button
            onClick={() => setSelectedRelation('spectrum')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition ${
              selectedRelation === 'spectrum'
                ? 'bg-white text-purple-700 border border-slate-200 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Quang phổ
          </button>
        </div>
      </div>

      {/* 1. SYSTEM OVERVIEW: VISUAL FLOWCHART */}
      {selectedRelation === 'system' && (
        <div className="space-y-4">
          {/* Dynamic Factor Bars */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {/* Factor 1: Light */}
            <div className="bg-amber-50/60 p-3 rounded-xl border border-amber-200 space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-amber-900 flex items-center gap-1">
                  ☀️ Năng lượng Ánh sáng
                </span>
                <span className="font-mono text-amber-700 font-bold">{lightEfficiency}%</span>
              </div>
              <div className="w-full h-2 bg-amber-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 rounded-full transition-all duration-300"
                  style={{ width: `${lightEfficiency}%` }}
                />
              </div>
              <div className="text-[10px] text-amber-800">
                Khoảng cách: {state.lampDistance} cm | Công suất: {state.lampPower} W
              </div>
            </div>

            {/* Factor 2: CO2 */}
            <div className="bg-emerald-50/60 p-3 rounded-xl border border-emerald-200 space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-emerald-900 flex items-center gap-1">
                  💨 Nồng độ $CO_2$ ($NaHCO_3$)
                </span>
                <span className="font-mono text-emerald-700 font-bold">{co2Efficiency}%</span>
              </div>
              <div className="w-full h-2 bg-emerald-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-full transition-all duration-300"
                  style={{ width: `${co2Efficiency}%` }}
                />
              </div>
              <div className="text-[10px] text-emerald-800">
                Nồng độ hòa tan: {state.co2Concentration}% NaHCO₃
              </div>
            </div>

            {/* Factor 3: Temperature */}
            <div className="bg-sky-50/60 p-3 rounded-xl border border-sky-200 space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-sky-900 flex items-center gap-1">
                  🌡️ Hoạt tính Enzym (Nhiệt độ)
                </span>
                <span className={`font-mono font-bold ${state.waterTemperature > 40 ? 'text-red-600' : 'text-sky-700'}`}>
                  {tempEfficiency}%
                </span>
              </div>
              <div className="w-full h-2 bg-sky-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    state.waterTemperature > 40
                      ? 'bg-gradient-to-r from-red-600 to-amber-500'
                      : 'bg-gradient-to-r from-sky-500 to-cyan-400'
                  }`}
                  style={{ width: `${tempEfficiency}%` }}
                />
              </div>
              <div className="text-[10px] text-sky-800">
                Nhiệt độ nước: {state.waterTemperature}°C (Tối ưu: 28–32°C)
              </div>
            </div>

            {/* Factor 4: Color Spectrum */}
            <div className="bg-purple-50/60 p-3 rounded-xl border border-purple-200 space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-purple-900 flex items-center gap-1">
                  🌈 Độ hấp thụ Diệp lục (Kính lọc)
                </span>
                <span className={`font-mono font-bold ${filterEfficiency < 30 ? 'text-red-600' : 'text-purple-700'}`}>
                  {filterEfficiency}%
                </span>
              </div>
              <div className="w-full h-2 bg-purple-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    filterEfficiency < 30
                      ? 'bg-red-500'
                      : 'bg-gradient-to-r from-purple-500 to-pink-400'
                  }`}
                  style={{ width: `${filterEfficiency}%` }}
                />
              </div>
              <div className="text-[10px] text-purple-800 uppercase font-bold">
                Kính lọc: {state.colorFilter === 'green' ? 'Xanh lục (Phản xạ!)' : state.colorFilter}
              </div>
            </div>
          </div>

          {/* Interactive Flow Diagram */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
              <span>Sơ đồ dòng chảy năng lượng & vật chất</span>
              <span className="text-cyan-700 font-mono font-bold text-xs">{state.bubblesPerMinute} bọt O₂/phút</span>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-2 text-center text-[11px]">
              <div className="w-full sm:w-1/3 bg-white p-2.5 rounded-lg border border-amber-200 shadow-sm">
                <div className="text-amber-800 font-bold">1. Pha Sáng</div>
                <div className="text-[10px] text-slate-500 mt-0.5">Photon đập vào Diệp lục</div>
                <div className="text-[10px] text-emerald-700 mt-1 font-mono font-bold">2H₂O → 4H⁺ + 4e⁻ + O₂↑</div>
              </div>

              <div className="text-slate-400 font-bold text-base">➔</div>

              <div className="w-full sm:w-1/3 bg-white p-2.5 rounded-lg border border-emerald-200 shadow-sm">
                <div className="text-emerald-800 font-bold">2. Pha Tối (Calvin)</div>
                <div className="text-[10px] text-slate-500 mt-0.5">Enzym RuBisCO xúc tác</div>
                <div className="text-[10px] text-cyan-700 mt-1 font-mono font-bold">CO₂ + ATP + NADPH → Đường</div>
              </div>

              <div className="text-slate-400 font-bold text-base">➔</div>

              <div className="w-full sm:w-1/3 bg-cyan-50 p-2.5 rounded-lg border border-cyan-300 shadow-sm">
                <div className="text-cyan-800 font-bold">3. Khí Oxy Giải Phóng</div>
                <div className="text-lg font-black text-cyan-700 font-mono mt-0.5">{state.bubblesPerMinute} <span className="text-xs font-normal text-slate-500">bpm</span></div>
                <div className="text-[10px] text-cyan-800 font-medium">Bọt khí sủi lên ống nghiệm</div>
              </div>
            </div>
          </div>

          {/* Diagnostic Banner: Limiting Factor */}
          <div
            className={`p-3 rounded-xl border flex items-start gap-2.5 shadow-sm ${
              limitingFactor.type === 'danger'
                ? 'bg-red-50 border-red-300 text-red-900'
                : limitingFactor.type === 'warning'
                ? 'bg-amber-50 border-amber-300 text-amber-900'
                : 'bg-emerald-50 border-emerald-300 text-emerald-900'
            }`}
          >
            <span className="text-lg">
              {limitingFactor.type === 'danger' ? '⛔' : limitingFactor.type === 'warning' ? '⚠️' : '✨'}
            </span>
            <div className="text-xs leading-relaxed">
              <div className="font-bold">
                {limitingFactor.type !== 'optimal' ? 'Yếu tố giới hạn (Định luật Blackman): ' : ''}
                {limitingFactor.title}
              </div>
              <p className="text-[11px] opacity-90 mt-0.5">{limitingFactor.desc}</p>
            </div>
          </div>
        </div>
      )}

      {/* 2. LIGHT VS PHOTOSYNTHESIS GRAPH */}
      {selectedRelation === 'light' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-amber-900">
              Đồ thị: Cường độ Ánh sáng (Khoảng cách đèn) vs Tốc độ tạo O₂
            </span>
            <span className="font-mono text-amber-700 font-bold">{state.lampDistance} cm ({lightEfficiency}% max)</span>
          </div>

          <svg viewBox="0 0 320 160" className="w-full h-44 bg-slate-50 rounded-xl border border-slate-200 p-2">
            <line x1="35" y1="135" x2="305" y2="135" stroke="#94a3b8" strokeWidth="1" />
            <line x1="35" y1="15" x2="35" y2="135" stroke="#94a3b8" strokeWidth="1" />

            <path
              d="M 35 135 C 70 80, 110 35, 170 35 L 305 35"
              fill="none"
              stroke="#d97706"
              strokeWidth="2.5"
            />

            {(() => {
              const curX = 35 + ((100 - state.lampDistance) / 90) * 260;
              const t = (100 - state.lampDistance) / 90;
              const curY = 135 - Math.min(1.0, t * 1.5) * 100;
              return (
                <g>
                  <circle cx={curX} cy={curY} r="5.5" fill="#d97706" />
                  <circle cx={curX} cy={curY} r="9" fill="#d97706" fillOpacity="0.25" />
                  <line x1={curX} y1={curY} x2={curX} y2="135" stroke="#d97706" strokeWidth="1" strokeDasharray="3,3" />
                </g>
              );
            })()}

            <line x1="170" y1="15" x2="170" y2="135" stroke="#94a3b8" strokeWidth="1" strokeDasharray="2,2" />
            <text x="175" y="25" fill="#64748b" fontSize="8" fontWeight="bold">Điểm bão hòa ánh sáng</text>

            <text x="35" y="150" fill="#64748b" fontSize="8" fontWeight="600">Xa (100cm)</text>
            <text x="170" y="150" textAnchor="middle" fill="#64748b" fontSize="8" fontWeight="600">Trung bình (40cm)</text>
            <text x="305" y="150" textAnchor="end" fill="#64748b" fontSize="8" fontWeight="600">Gần (10cm)</text>
            <text x="40" y="22" fill="#d97706" fontSize="8" fontWeight="bold">Tốc độ max</text>
          </svg>

          <div className="text-[11px] text-slate-600 bg-amber-50/60 p-2.5 rounded-xl border border-amber-200">
            💡 <strong className="text-amber-900">Quy luật:</strong> Ban đầu khi đưa đèn lại gần, cường độ ánh sáng tăng làm tốc độ quang hợp tăng tuyến tính. Khi đạt tới <em>Điểm bão hòa ánh sáng</em> (~20 cm), tốc độ không tăng thêm nữa vì bị giới hạn bởi nồng độ CO₂ hoặc enzym.
          </div>
        </div>
      )}

      {/* 3. CO2 VS PHOTOSYNTHESIS GRAPH */}
      {selectedRelation === 'co2' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-emerald-900">
              Đồ thị: Nồng độ CO₂ (NaHCO₃) vs Tốc độ tạo O₂
            </span>
            <span className="font-mono text-emerald-700 font-bold">{state.co2Concentration}% NaHCO₃ ({co2Efficiency}%)</span>
          </div>

          <svg viewBox="0 0 320 160" className="w-full h-44 bg-slate-50 rounded-xl border border-slate-200 p-2">
            <line x1="35" y1="135" x2="305" y2="135" stroke="#94a3b8" strokeWidth="1" />
            <line x1="35" y1="15" x2="35" y2="135" stroke="#94a3b8" strokeWidth="1" />

            <path
              d="M 35 135 C 75 85, 120 40, 200 35 L 305 35"
              fill="none"
              stroke="#059669"
              strokeWidth="2.5"
            />

            {(() => {
              const curX = 35 + (state.co2Concentration / 4.0) * 260;
              const factor = (state.co2Concentration * 1.5) / (0.8 + state.co2Concentration);
              const curY = 135 - (factor / 1.25) * 100;
              return (
                <g>
                  <circle cx={curX} cy={curY} r="5.5" fill="#059669" />
                  <circle cx={curX} cy={curY} r="9" fill="#059669" fillOpacity="0.25" />
                  <line x1={curX} y1={curY} x2={curX} y2="135" stroke="#059669" strokeWidth="1" strokeDasharray="3,3" />
                </g>
              );
            })()}

            <line x1="200" y1="15" x2="200" y2="135" stroke="#94a3b8" strokeWidth="1" strokeDasharray="2,2" />
            <text x="205" y="25" fill="#64748b" fontSize="8" fontWeight="bold">Điểm bão hòa CO₂ ~2.5%</text>

            <text x="35" y="150" fill="#64748b" fontSize="8" fontWeight="600">0%</text>
            <text x="200" y="150" textAnchor="middle" fill="#64748b" fontSize="8" fontWeight="600">2.5%</text>
            <text x="305" y="150" textAnchor="end" fill="#64748b" fontSize="8" fontWeight="600">4.0%</text>
            <text x="40" y="22" fill="#059669" fontSize="8" fontWeight="bold">Tốc độ max</text>
          </svg>

          <div className="text-[11px] text-slate-600 bg-emerald-50/60 p-2.5 rounded-xl border border-emerald-200">
            💡 <strong className="text-emerald-900">Quy luật:</strong> CO₂ là cơ chất trực tiếp của enzyme RuBisCO trong pha tối. Ở nồng độ thấp (0%), chu trình Calvin ngừng chạy. Khi nồng độ đạt ngưỡng bão hòa (~2.5% NaHCO₃), mọi trung tâm hoạt động của enzym đều đã gắn cơ chất nên tốc độ đạt bình nguyên.
          </div>
        </div>
      )}

      {/* 4. TEMPERATURE VS PHOTOSYNTHESIS GRAPH */}
      {selectedRelation === 'temp' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-sky-900">
              Đồ thị: Nhiệt độ nước (°C) vs Tốc độ tạo O₂ (Biến tính Enzym)
            </span>
            <span className={`font-mono font-bold ${state.waterTemperature > 40 ? 'text-red-600' : 'text-sky-700'}`}>
              {state.waterTemperature}°C ({tempEfficiency}%)
            </span>
          </div>

          <svg viewBox="0 0 320 160" className="w-full h-44 bg-slate-50 rounded-xl border border-slate-200 p-2">
            <line x1="35" y1="135" x2="305" y2="135" stroke="#94a3b8" strokeWidth="1" />
            <line x1="35" y1="15" x2="35" y2="135" stroke="#94a3b8" strokeWidth="1" />

            <path
              d="M 35 135 C 100 120, 160 50, 185 30 C 205 30, 245 100, 280 135 L 305 135"
              fill="none"
              stroke="#0284c7"
              strokeWidth="2.5"
            />

            {(() => {
              const curX = 35 + ((state.waterTemperature - 5) / 45) * 260;
              const curY = 135 - (tempEfficiency / 100) * 105;
              return (
                <g>
                  <circle cx={curX} cy={curY} r="5.5" fill={state.waterTemperature > 40 ? '#ef4444' : '#0284c7'} />
                  <circle cx={curX} cy={curY} r="9" fill={state.waterTemperature > 40 ? '#ef4444' : '#0284c7'} fillOpacity="0.25" />
                  <line x1={curX} y1={curY} x2={curX} y2="135" stroke="#0284c7" strokeWidth="1" strokeDasharray="3,3" />
                </g>
              );
            })()}

            <line x1="185" y1="15" x2="185" y2="135" stroke="#d97706" strokeWidth="1" strokeDasharray="2,2" />
            <text x="190" y="25" fill="#d97706" fontSize="8" fontWeight="bold">Tối ưu ~30°C</text>

            <line x1="255" y1="15" x2="255" y2="135" stroke="#ef4444" strokeWidth="1" strokeDasharray="2,2" />
            <text x="258" y="45" fill="#ef4444" fontSize="8" fontWeight="bold">Biến tính &gt;42°C</text>

            <text x="35" y="150" fill="#64748b" fontSize="8" fontWeight="600">5°C</text>
            <text x="185" y="150" textAnchor="middle" fill="#64748b" fontSize="8" fontWeight="600">30°C</text>
            <text x="305" y="150" textAnchor="end" fill="#64748b" fontSize="8" fontWeight="600">50°C</text>
            <text x="40" y="22" fill="#0284c7" fontSize="8" fontWeight="bold">Tốc độ max</text>
          </svg>

          <div className="text-[11px] text-slate-600 bg-sky-50/60 p-2.5 rounded-xl border border-sky-200">
            💡 <strong className="text-sky-900">Quy luật:</strong> Từ 5°C đến 30°C, nhiệt độ tăng làm tăng động năng phân tử và tần số va chạm hiệu quả giữa enzym và cơ chất (Hệ số Q10 ~ 2). Tuy nhiên khi vượt quá 40°C, liên kết hydro duy trì cấu trúc bậc 3, 4 của protein enzym bị phá vỡ (biến tính), khiến quang hợp tụt dốc về 0.
          </div>
        </div>
      )}

      {/* 5. SPECTRUM VS ABSORPTION GRAPH */}
      {selectedRelation === 'spectrum' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-purple-900">
              Đồ thị: Quang phổ Hấp thụ của Diệp lục a & b (400nm – 700nm)
            </span>
            <span className={`font-mono font-bold uppercase ${filterEfficiency < 30 ? 'text-red-600' : 'text-purple-700'}`}>
              Kính lọc: {state.colorFilter}
            </span>
          </div>

          <svg viewBox="0 0 320 160" className="w-full h-44 bg-slate-50 rounded-xl border border-slate-200 p-2">
            <line x1="35" y1="135" x2="305" y2="135" stroke="#94a3b8" strokeWidth="1" />
            <line x1="35" y1="15" x2="35" y2="135" stroke="#94a3b8" strokeWidth="1" />

            <defs>
              <linearGradient id="spectrumGradient" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#8b5cf6" />
                <stop offset="25%" stopColor="#3b82f6" />
                <stop offset="50%" stopColor="#22c55e" />
                <stop offset="75%" stopColor="#eab308" />
                <stop offset="100%" stopColor="#ef4444" />
              </linearGradient>
            </defs>
            <rect x="35" y="130" width="270" height="5" fill="url(#spectrumGradient)" rx="2" />

            <path
              d="M 35 125 Q 70 20, 100 35 T 165 120 T 235 90 T 280 40 T 305 125"
              fill="none"
              stroke="#059669"
              strokeWidth="2.5"
            />

            {(() => {
              let markX = 170;
              let markY = 120;
              if (state.colorFilter === 'blue') {
                markX = 85;
                markY = 30;
              } else if (state.colorFilter === 'red') {
                markX = 280;
                markY = 40;
              } else if (state.colorFilter === 'green') {
                markX = 165;
                markY = 120;
              } else {
                markX = 180;
                markY = 50;
              }

              return (
                <g>
                  <circle cx={markX} cy={markY} r="6" fill="#7c3aed" />
                  <circle cx={markX} cy={markY} r="10" fill="#7c3aed" fillOpacity="0.25" />
                  <text x={markX} y={markY - 12} textAnchor="middle" fill="#5b21b6" fontSize="9" fontWeight="bold">
                    {state.colorFilter === 'green' ? 'Xanh lục: Bị phản xạ!' : 'Hấp thụ mạnh'}
                  </text>
                </g>
              );
            })()}

            <text x="35" y="150" fill="#6d28d9" fontSize="8" fontWeight="600">400nm (Tím/Lam)</text>
            <text x="165" y="150" textAnchor="middle" fill="#059669" fontSize="8" fontWeight="600">550nm (Lục)</text>
            <text x="305" y="150" textAnchor="end" fill="#dc2626" fontSize="8" fontWeight="600">700nm (Đỏ)</text>
            <text x="40" y="22" fill="#059669" fontSize="8" fontWeight="bold">Độ hấp thụ</text>
          </svg>

          <div className="text-[11px] text-slate-600 bg-purple-50/60 p-2.5 rounded-xl border border-purple-200">
            💡 <strong className="text-purple-900">Giải thích hiện tượng cành rong màu xanh lục:</strong> Diệp lục hấp thụ mạnh nhất ở dải sóng Xanh lam (~430nm) và Đỏ (~660nm). Ánh sáng xanh lục (~550nm) không được hấp thụ mà bị phản xạ lại vào mắt người quan sát, làm cho lá cây có màu xanh lục.
          </div>
        </div>
      )}
    </div>
  );
}
