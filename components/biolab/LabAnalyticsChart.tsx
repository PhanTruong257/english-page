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
    // Light angle vs plant bending curve
    const points: [number, number][] = [];
    for (let x = -60; x <= 60; x += 10) {
      // Plant bends proportionally
      const y = x * 0.75;
      points.push([x, y]);
    }

    const svgPoints = points
      .map(([x, y]) => {
        // Map x [-60, 60] -> [30, 270]
        const px = 30 + ((x + 60) / 120) * 240;
        // Map y [-50, 50] -> [130, 20]
        const py = 75 - (y / 50) * 55;
        return `${px},${py}`;
      })
      .join(' ');

    const currentX = 30 + ((photoAngle + 60) / 120) * 240;
    const currentY = 75 - (photoAngle / 50) * 55;

    return (
      <div className="bg-slate-900/90 rounded-2xl p-4 border border-slate-800 flex flex-col gap-3">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-slate-300">Đồ thị: Góc chiếu sáng vs Góc uốn của thân</span>
          <span className="text-emerald-400 font-mono text-[11px]">θ = {photoAngle}°</span>
        </div>

        <svg viewBox="0 0 300 150" className="w-full h-36 bg-slate-950/60 rounded-xl border border-slate-800/80 p-1">
          {/* Grid lines */}
          <line x1="30" y1="75" x2="270" y2="75" stroke="#334155" strokeWidth="1" strokeDasharray="3,3" />
          <line x1="150" y1="15" x2="150" y2="135" stroke="#334155" strokeWidth="1" strokeDasharray="3,3" />

          {/* Theoretical curve */}
          <polyline fill="none" stroke="#059669" strokeWidth="2" points={svgPoints} />

          {/* Current measurement indicator */}
          <circle cx={Math.max(30, Math.min(270, currentX))} cy={Math.max(20, Math.min(130, currentY))} r="5" fill="#10b981" />
          <circle cx={Math.max(30, Math.min(270, currentX))} cy={Math.max(20, Math.min(130, currentY))} r="8" fill="#10b981" fillOpacity="0.3" />

          {/* Labels */}
          <text x="30" y="145" fill="#64748b" fontSize="9">-60° Trái</text>
          <text x="150" y="145" textAnchor="middle" fill="#64748b" fontSize="9">0° Đỉnh</text>
          <text x="270" y="145" textAnchor="end" fill="#64748b" fontSize="9">+60° Phải</text>
          <text x="35" y="25" fill="#38bdf8" fontSize="9">+45° Uốn phải</text>
          <text x="35" y="125" fill="#38bdf8" fontSize="9">-45° Uốn trái</text>
        </svg>

        <div className="text-[11px] text-slate-400 bg-slate-950/50 p-2.5 rounded-lg border border-slate-800/60">
          💡 <strong className="text-slate-300">Nhận xét:</strong> Góc uốn của thân cây tỉ lệ thuận với góc lệch nguồn sáng. Khi chiếu thẳng đỉnh (0°), hai bên nhận lượng ánh sáng đều nhau, auxin phân bố cân bằng nên cây mọc thẳng đứng.
        </div>
      </div>
    );
  }

  if (activeLab === 'photosynthesis') {
    // Generate Temperature vs Photosynthesis curve (Bell-shaped enzyme denaturation curve)
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
        // Map t [5, 50] -> [30, 270]
        const px = 30 + ((t - 5) / 45) * 240;
        // Map r [0, 65] -> [130, 20]
        const py = 130 - (r / 65) * 110;
        return `${px},${py}`;
      })
      .join(' ');

    const currentPx = 30 + ((temperature - 5) / 45) * 240;
    const currentPy = 130 - (Math.min(65, bubblesRate) / 65) * 110;

    return (
      <div className="bg-slate-900/90 rounded-2xl p-4 border border-slate-800 flex flex-col gap-3">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-slate-300">Đồ thị: Nhiệt độ nước vs Tốc độ tạo bọt $O_2$</span>
          <span className="text-cyan-400 font-mono text-[11px]">{bubblesRate} bọt/phút ({temperature}°C)</span>
        </div>

        <svg viewBox="0 0 300 150" className="w-full h-36 bg-slate-950/60 rounded-xl border border-slate-800/80 p-1">
          {/* Axis */}
          <line x1="30" y1="130" x2="275" y2="130" stroke="#475569" strokeWidth="1" />
          <line x1="30" y1="20" x2="30" y2="130" stroke="#475569" strokeWidth="1" />

          {/* Bell curve */}
          <polyline fill="none" stroke="#0ea5e9" strokeWidth="2.5" points={svgPoints} />

          {/* Current point */}
          <circle cx={Math.max(30, Math.min(270, currentPx))} cy={Math.max(20, Math.min(130, currentPy))} r="5" fill="#38bdf8" />
          <circle cx={Math.max(30, Math.min(270, currentPx))} cy={Math.max(20, Math.min(130, currentPy))} r="9" fill="#38bdf8" fillOpacity="0.3" />

          {/* Optimal line */}
          <line x1="163" y1="20" x2="163" y2="130" stroke="#f59e0b" strokeWidth="1" strokeDasharray="3,3" />
          <text x="165" y="32" fill="#f59e0b" fontSize="8">Tối ưu ~30°C</text>

          {/* Labels */}
          <text x="30" y="144" fill="#64748b" fontSize="8">5°C</text>
          <text x="163" y="144" textAnchor="middle" fill="#64748b" fontSize="8">30°C</text>
          <text x="270" y="144" textAnchor="end" fill="#64748b" fontSize="8">50°C</text>
          <text x="35" y="25" fill="#94a3b8" fontSize="8">Tốc độ max</text>
        </svg>

        <div className="text-[11px] text-slate-400 bg-slate-950/50 p-2.5 rounded-lg border border-slate-800/60">
          💡 <strong className="text-slate-300">Nhận xét:</strong> Nhiệt độ tối ưu cho enzyme quang hợp của thực vật nhiệt đới là 25–35°C. Khi vượt quá 40–45°C, các enzym xúc tác chu trình Calvin bị biến tính khiến quang hợp giảm mạnh và ngừng hẳn.
        </div>
      </div>
    );
  }

  // Hydrotropism
  return (
    <div className="bg-slate-900/90 rounded-2xl p-4 border border-slate-800 flex flex-col gap-3">
      <div className="flex items-center justify-between text-xs">
        <span className="font-semibold text-slate-300">Độ uốn cong của rễ theo Gradien độ ẩm</span>
        <span className="text-emerald-400 font-mono text-[11px]">Độ lệch rễ: {rootAngle}°</span>
      </div>

      <div className="grid grid-cols-2 gap-3 text-center text-xs">
        <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800">
          <div className="text-slate-400 text-[10px]">Cảm ứng hướng nước</div>
          <div className="text-emerald-400 font-bold text-sm mt-0.5">Dương (+)</div>
          <div className="text-[10px] text-slate-500 mt-1">Rễ tìm đến vùng có nước</div>
        </div>
        <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800">
          <div className="text-slate-400 text-[10px]">Cảm ứng hướng đất</div>
          <div className="text-sky-400 font-bold text-sm mt-0.5">Dương (+)</div>
          <div className="text-[10px] text-slate-500 mt-1">Rễ cắm sâu theo trọng lực</div>
        </div>
      </div>

      <div className="text-[11px] text-slate-400 bg-slate-950/50 p-2.5 rounded-lg border border-slate-800/60">
        💡 <strong className="text-slate-300">Nhận xét:</strong> Khi có sự chênh lệch lớn về độ ẩm cục bộ trong đất, tính hướng nước có thể lấn át cả tính hướng đất (trọng lực), khiến rễ uốn ngang để tìm nguồn nước sinh tồn.
      </div>
    </div>
  );
}
