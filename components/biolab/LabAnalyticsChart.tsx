'use client';

import React from 'react';
import { LabId } from './types';

interface Props {
  activeLab: LabId;
  photoAngle: number;
  bubblesRate: number;
  temperature: number;
  lightDistance: number;
  rootAngle: number;
}

export default function LabAnalyticsChart({
  activeLab,
  photoAngle,
  bubblesRate,
  temperature,
  lightDistance,
  rootAngle,
}: Props) {
  // Render lab specific analytics curve
  if (activeLab === 'phototropism') {
    const points: [number, number][] = [];
    for (let x = -60; x <= 60; x += 10) {
      const y = x * 0.75;
      points.push([x, y]);
    }

    const svgPoints = points
      .map(([x, y]) => {
        const px = 30 + ((x + 60) / 120) * 240;
        const py = 75 - (y / 50) * 55;
        return `${px},${py}`;
      })
      .join(' ');

    const currentX = 30 + ((photoAngle + 60) / 120) * 240;
    const currentY = 75 - (photoAngle / 50) * 55;

    return (
      <div className="bg-white/95 rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-col gap-3">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-slate-800">Đồ thị: Góc chiếu sáng vs Góc uốn của thân</span>
          <span className="text-emerald-700 font-mono font-bold text-xs bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
            θ = {photoAngle}°
          </span>
        </div>

        <svg viewBox="0 0 300 150" className="w-full h-36 bg-slate-50 rounded-xl border border-slate-200 p-1">
          {/* Grid lines */}
          <line x1="30" y1="75" x2="270" y2="75" stroke="#cbd5e1" strokeWidth="1" strokeDasharray="3,3" />
          <line x1="150" y1="15" x2="150" y2="135" stroke="#cbd5e1" strokeWidth="1" strokeDasharray="3,3" />

          {/* Theoretical curve */}
          <polyline fill="none" stroke="#059669" strokeWidth="2.5" points={svgPoints} />

          {/* Current measurement indicator */}
          <circle cx={Math.max(30, Math.min(270, currentX))} cy={Math.max(20, Math.min(130, currentY))} r="5.5" fill="#10b981" />
          <circle cx={Math.max(30, Math.min(270, currentX))} cy={Math.max(20, Math.min(130, currentY))} r="9" fill="#10b981" fillOpacity="0.25" />

          {/* Labels */}
          <text x="30" y="145" fill="#64748b" fontSize="9" fontWeight="600">-60° Trái</text>
          <text x="150" y="145" textAnchor="middle" fill="#64748b" fontSize="9" fontWeight="600">0° Đỉnh</text>
          <text x="270" y="145" textAnchor="end" fill="#64748b" fontSize="9" fontWeight="600">+60° Phải</text>
          <text x="35" y="25" fill="#0284c7" fontSize="9" fontWeight="bold">+45° Uốn phải</text>
          <text x="35" y="125" fill="#0284c7" fontSize="9" fontWeight="bold">-45° Uốn trái</text>
        </svg>

        <div className="text-[11px] text-slate-600 bg-emerald-50/60 p-2.5 rounded-xl border border-emerald-200 leading-relaxed">
          💡 <strong className="text-emerald-900">Nhận xét:</strong> Góc uốn của thân cây tỉ lệ thuận với góc lệch nguồn sáng. Khi chiếu thẳng đỉnh (0°), hai bên nhận lượng ánh sáng đều nhau, auxin phân bố cân bằng nên cây mọc thẳng đứng.
        </div>
      </div>
    );
  }

  if (activeLab === 'photosynthesis') {
    const tempPoints: [number, number][] = [];
    for (let t = 5; t <= 50; t += 2) {
      let r = 0;
      if (t < 30) {
        r = Math.max(0, ((t - 5) / 25) * 60);
      } else {
        r = Math.max(0, (1 - Math.pow((t - 30) / 16, 2)) * 60);
      }
      tempPoints.push([t, r]);
    }

    const svgPoints = tempPoints
      .map(([t, r]) => {
        const px = 30 + ((t - 5) / 45) * 240;
        const py = 130 - (r / 65) * 110;
        return `${px},${py}`;
      })
      .join(' ');

    const currentPx = 30 + ((temperature - 5) / 45) * 240;
    const currentPy = 130 - (Math.min(65, bubblesRate) / 65) * 110;

    return (
      <div className="bg-white/95 rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-col gap-3">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-slate-800">Đồ thị: Nhiệt độ nước vs Tốc độ tạo bọt $O_2$</span>
          <span className="text-cyan-700 font-mono font-bold text-xs bg-cyan-50 px-2 py-0.5 rounded-full border border-cyan-200">
            {bubblesRate} bọt/phút ({temperature}°C)
          </span>
        </div>

        <svg viewBox="0 0 300 150" className="w-full h-36 bg-slate-50 rounded-xl border border-slate-200 p-1">
          <line x1="30" y1="130" x2="275" y2="130" stroke="#94a3b8" strokeWidth="1" />
          <line x1="30" y1="20" x2="30" y2="130" stroke="#94a3b8" strokeWidth="1" />

          {/* Bell curve */}
          <polyline fill="none" stroke="#0284c7" strokeWidth="2.5" points={svgPoints} />

          {/* Current point */}
          <circle cx={Math.max(30, Math.min(270, currentPx))} cy={Math.max(20, Math.min(130, currentPy))} r="5.5" fill="#0284c7" />
          <circle cx={Math.max(30, Math.min(270, currentPx))} cy={Math.max(20, Math.min(130, currentPy))} r="9" fill="#0284c7" fillOpacity="0.25" />

          {/* Optimal line */}
          <line x1="163" y1="20" x2="163" y2="130" stroke="#d97706" strokeWidth="1" strokeDasharray="3,3" />
          <text x="165" y="32" fill="#d97706" fontSize="8" fontWeight="bold">Tối ưu ~30°C</text>

          {/* Labels */}
          <text x="30" y="144" fill="#64748b" fontSize="8" fontWeight="600">5°C</text>
          <text x="163" y="144" textAnchor="middle" fill="#64748b" fontSize="8" fontWeight="600">30°C</text>
          <text x="270" y="144" textAnchor="end" fill="#64748b" fontSize="8" fontWeight="600">50°C</text>
          <text x="35" y="25" fill="#475569" fontSize="8" fontWeight="bold">Tốc độ max</text>
        </svg>

        <div className="text-[11px] text-slate-600 bg-sky-50/60 p-2.5 rounded-xl border border-sky-200 leading-relaxed">
          💡 <strong className="text-sky-900">Nhận xét:</strong> Nhiệt độ tối ưu cho enzyme quang hợp của thực vật nhiệt đới là 25–35°C. Khi vượt quá 40–45°C, các enzym xúc tác chu trình Calvin bị biến tính khiến quang hợp giảm mạnh và ngừng hẳn.
        </div>
      </div>
    );
  }

  // Hydrotropism
  return (
    <div className="bg-white/95 rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-col gap-3">
      <div className="flex items-center justify-between text-xs">
        <span className="font-bold text-slate-800">Độ uốn cong của rễ theo Gradien độ ẩm</span>
        <span className="text-emerald-700 font-mono font-bold text-xs bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
          Độ lệch rễ: {rootAngle}°
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 text-center text-xs">
        <div className="bg-emerald-50/60 p-3 rounded-xl border border-emerald-200">
          <div className="text-slate-500 text-[10px] font-bold">Cảm ứng hướng nước</div>
          <div className="text-emerald-700 font-black text-sm mt-0.5">Dương (+)</div>
          <div className="text-[10px] text-slate-600 mt-1">Rễ tìm đến vùng có nước</div>
        </div>
        <div className="bg-sky-50/60 p-3 rounded-xl border border-sky-200">
          <div className="text-slate-500 text-[10px] font-bold">Cảm ứng hướng đất</div>
          <div className="text-sky-700 font-black text-sm mt-0.5">Dương (+)</div>
          <div className="text-[10px] text-slate-600 mt-1">Rễ cắm sâu theo trọng lực</div>
        </div>
      </div>

      <div className="text-[11px] text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-200 leading-relaxed">
        💡 <strong className="text-slate-900">Nhận xét:</strong> Khi có sự chênh lệch lớn về độ ẩm cục bộ trong đất, tính hướng nước có thể lấn át cả tính hướng đất (trọng lực), khiến rễ uốn ngang để tìm nguồn nước sinh tồn.
      </div>
    </div>
  );
}
