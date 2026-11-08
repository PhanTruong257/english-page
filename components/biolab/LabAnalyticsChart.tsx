'use client';

import React, { useState } from 'react';
import { LabId } from './types';

export type PredictionOption = 'direct' | 'inverse' | 'bell';

interface Props {
  activeLab: LabId;
  photoAngle: number;
  photoIntensity?: number;
  bubblesRate: number;
  temperature: number;
  lightDistance: number;
  co2Concentration?: number;
  rootAngle: number;
  boxRotation?: number;
  waterSourcePos?: string;
}

interface AnalyticsCase {
  id: string;
  tabLabel: string;
  title: string;
  varXName: string;
  varYName: string;
  currentValueBadge: string;
  question: string;
  correctPrediction: PredictionOption;
  explanationCorrect: string;
  explanationWrong: string;
  insight: string;
  svgConfig: {
    polylinePoints: string;
    currentPoint: { x: number; y: number };
    xLabels: { x: number; text: string; anchor?: 'start' | 'middle' | 'end' }[];
    yLabels: { x: number; y: number; text: string; color?: string }[];
    annotations?: { x1: number; y1: number; x2: number; y2: number; text?: string; textX?: number; textY?: number; color?: string }[];
  };
}

export default function LabAnalyticsChart({
  activeLab,
  photoAngle,
  photoIntensity = 50,
  bubblesRate,
  temperature,
  lightDistance,
  co2Concentration = 0.5,
  rootAngle,
  boxRotation = 0,
  waterSourcePos = 'left',
}: Props) {
  // Store prediction per case ID
  const [predictions, setPredictions] = useState<Record<string, PredictionOption>>({});
  // Selected case tab per lab
  const [selectedCaseTab, setSelectedCaseTab] = useState<Record<LabId, string>>({
    phototropism: 'p_angle',
    photosynthesis: 's_distance',
    hydrotropism: 'h_moisture',
  });

  const predictionLabels: Record<PredictionOption, string> = {
    direct: 'Tỉ lệ thuận 📈',
    inverse: 'Tỉ lệ nghịch 📉',
    bell: 'Tối ưu hình chuông 🔔',
  };

  // 1. PHOTOTROPISM CASES
  const phototropismCases: AnalyticsCase[] = [
    {
      id: 'p_angle',
      tabLabel: '1. Góc đèn vs Góc uốn',
      title: 'Đồ thị: Góc chiếu sáng (α) vs Góc uốn thân (θ)',
      varXName: 'Góc nghiêng nguồn sáng (đèn)',
      varYName: 'Góc uốn cong của thân cây',
      currentValueBadge: `θ = ${photoAngle}°`,
      question: 'Khi tăng góc nghiêng của đèn chiếu, góc uốn của thân cây sẽ thay đổi như thế nào?',
      correctPrediction: 'direct',
      explanationCorrect: 'Chính xác! Góc uốn của thân cây tỉ lệ thuận với góc nghiêng của đèn chiếu.',
      explanationWrong: 'Chưa chính xác: Khi đèn càng nghiêng, cây sẽ càng uốn cong mạnh hơn (Tỉ lệ thuận).',
      insight:
        'Góc uốn của thân cây tỉ lệ thuận với góc lệch nguồn sáng. Khi góc đèn càng lệch sang bên, chênh lệch photon giữa hai phía càng lớn, hormone Auxin dồn về phía tối càng nhiều làm tế bào phía tối dãn dài đẩy cây uốn mạnh về nguồn sáng.',
      svgConfig: (() => {
        const pts: [number, number][] = [];
        for (let x = -60; x <= 60; x += 10) {
          const y = x * 0.75;
          const px = 30 + ((x + 60) / 120) * 240;
          const py = 75 - (y / 50) * 55;
          pts.push([px, py]);
        }
        const currentPx = 30 + ((photoAngle + 60) / 120) * 240;
        const currentPy = 75 - (photoAngle / 50) * 55;
        return {
          polylinePoints: pts.map(([x, y]) => `${x},${y}`).join(' '),
          currentPoint: {
            x: Math.max(30, Math.min(270, currentPx)),
            y: Math.max(20, Math.min(130, currentPy)),
          },
          xLabels: [
            { x: 30, text: '-60° Trái', anchor: 'start' },
            { x: 150, text: '0° Đỉnh', anchor: 'middle' },
            { x: 270, text: '+60° Phải', anchor: 'end' },
          ],
          yLabels: [
            { x: 35, y: 25, text: '+45° Uốn phải', color: '#0284c7' },
            { x: 35, y: 125, text: '-45° Uốn trái', color: '#0284c7' },
          ],
        };
      })(),
    },
    {
      id: 'p_intensity',
      tabLabel: '2. Cường độ sáng vs Tốc độ uốn',
      title: 'Đồ thị: Cường độ ánh sáng (Lux) vs Tốc độ phản ứng',
      varXName: 'Cường độ ánh sáng (10% - 100%)',
      varYName: 'Mức độ kích hoạt cảm ứng',
      currentValueBadge: `Độ sáng: ${photoIntensity}%`,
      question: 'Khi tăng cường độ chiếu sáng của bóng đèn, mức độ cảm ứng hướng sáng sẽ ra sao?',
      correctPrediction: 'direct',
      explanationCorrect: 'Chính xác! Cường độ ánh sáng tăng giúp kích thích mạnh hơn quang thụ thể Phototropin (Tỉ lệ thuận).',
      explanationWrong: 'Chưa chính xác: Cường độ ánh sáng càng mạnh thì tín hiệu kích thích càng rõ rệt (Tỉ lệ thuận tới bão hòa).',
      insight:
        'Cường độ ánh sáng tỉ lệ thuận với mức độ kích thích thụ thể quang sinh học Phototropin. Cường độ cao tạo gradien quang hóa mạnh hơn, thúc đẩy quá trình bơm proton dãn dài tế bào phía tối diễn ra nhanh chóng.',
      svgConfig: (() => {
        const pts: [number, number][] = [];
        for (let i = 10; i <= 100; i += 5) {
          const factor = (1 - Math.exp(-i / 32)) * 0.95;
          const px = 30 + ((i - 10) / 90) * 240;
          const py = 125 - factor * 95;
          pts.push([px, py]);
        }
        const curFactor = (1 - Math.exp(-photoIntensity / 32)) * 0.95;
        const currentPx = 30 + ((photoIntensity - 10) / 90) * 240;
        const currentPy = 125 - curFactor * 95;
        return {
          polylinePoints: pts.map(([x, y]) => `${x},${y}`).join(' '),
          currentPoint: {
            x: Math.max(30, Math.min(270, currentPx)),
            y: Math.max(20, Math.min(130, currentPy)),
          },
          xLabels: [
            { x: 30, text: '10% Yếu', anchor: 'start' },
            { x: 150, text: '50% Vừa', anchor: 'middle' },
            { x: 270, text: '100% Cực đại', anchor: 'end' },
          ],
          yLabels: [
            { x: 35, y: 25, text: 'Bão hòa quang', color: '#059669' },
            { x: 35, y: 125, text: 'Ngưỡng kích thích', color: '#64748b' },
          ],
        };
      })(),
    },
  ];

  // 2. PHOTOSYNTHESIS CASES
  const photosynthesisCases: AnalyticsCase[] = [
    {
      id: 's_distance',
      tabLabel: '1. Khoảng cách đèn',
      title: 'Đồ thị: Khoảng cách đèn (d) vs Tốc độ tạo bọt O₂',
      varXName: 'Khoảng cách từ đèn đến cành rong (10 - 100 cm)',
      varYName: 'Tốc độ bọt khí O₂ (bọt/phút)',
      currentValueBadge: `${lightDistance} cm • ${bubblesRate} bpm`,
      question: 'Khi di chuyển đèn chiếu ra xa dần cành rong (từ 10 cm ra 100 cm), tốc độ tạo bọt khí O₂ sẽ thay đổi như thế nào?',
      correctPrediction: 'inverse',
      explanationCorrect: 'Chính xác! Đèn càng xa, cường độ ánh sáng chiếu tới càng giảm làm tốc độ quang hợp giảm (Tỉ lệ nghịch).',
      explanationWrong: 'Chưa chính xác: Đưa đèn ra xa làm giảm năng lượng photon, tốc độ quang hợp sẽ giảm (Tỉ lệ nghịch).',
      insight:
        'Cường độ quang năng tỉ lệ nghịch với bình phương khoảng cách (định luật nghịch đảo bình phương I ∝ 1/d²). Khi đưa đèn ra xa cành rong, mật độ photon tới bề mặt phiến lá giảm rất nhanh, làm tốc độ pha sáng quang hợp sụt giảm nghiêm trọng.',
      svgConfig: (() => {
        const pts: [number, number][] = [];
        for (let d = 10; d <= 100; d += 5) {
          const rate = Math.min(60, 60 * Math.pow(18 / d, 1.25));
          const px = 30 + ((d - 10) / 90) * 240;
          const py = 125 - (rate / 65) * 100;
          pts.push([px, py]);
        }
        const currentPx = 30 + ((lightDistance - 10) / 90) * 240;
        const currentPy = 125 - (Math.min(65, bubblesRate) / 65) * 100;
        return {
          polylinePoints: pts.map(([x, y]) => `${x},${y}`).join(' '),
          currentPoint: {
            x: Math.max(30, Math.min(270, currentPx)),
            y: Math.max(20, Math.min(130, currentPy)),
          },
          xLabels: [
            { x: 30, text: '10 cm (Gần)', anchor: 'start' },
            { x: 150, text: '55 cm', anchor: 'middle' },
            { x: 270, text: '100 cm (Xa)', anchor: 'end' },
          ],
          yLabels: [
            { x: 35, y: 25, text: 'Quang hợp cực đại', color: '#0284c7' },
            { x: 200, y: 115, text: 'Tối thiểu', color: '#64748b' },
          ],
        };
      })(),
    },
    {
      id: 's_temp',
      tabLabel: '2. Nhiệt độ nước',
      title: 'Đồ thị: Nhiệt độ nước (T) vs Tốc độ tạo bọt O₂',
      varXName: 'Nhiệt độ nước (5°C - 50°C)',
      varYName: 'Tốc độ bọt khí O₂ (bọt/phút)',
      currentValueBadge: `${temperature}°C • ${bubblesRate} bpm`,
      question: 'Khi nhiệt độ nước tăng dần từ 5°C đến 50°C, tốc độ quang hợp sẽ biến thiên theo quy luật nào?',
      correctPrediction: 'bell',
      explanationCorrect: 'Chính xác! Nhiệt độ tăng giúp enzyme hoạt động mạnh đến khoảng 30°C, sau đó enzyme bị biến tính làm tốc độ giảm (Tối ưu hình chuông).',
      explanationWrong: 'Chưa chính xác: Ở nhiệt độ cao (>40°C) enzyme bị biến tính protein nên đồ thị có dạng hình chuông tối ưu đỉnh ở 30°C.',
      insight:
        'Quang hợp phụ thuộc vào các enzyme xúc tác (đặc biệt là Rubisco trong chu trình Calvin). Trong khoảng 5–30°C, nhiệt độ tăng làm tăng động năng va chạm phân tử (tỉ lệ thuận); tuy nhiên trên 40°C, cấu trúc bậc ba của enzyme bị biến tính nhiệt, làm tốc độ quang hợp suy giảm đột ngột.',
      svgConfig: (() => {
        const pts: [number, number][] = [];
        for (let t = 5; t <= 50; t += 2) {
          let r = 0;
          if (t < 30) {
            r = Math.max(0, ((t - 5) / 25) * 60);
          } else {
            r = Math.max(0, (1 - Math.pow((t - 30) / 16, 2)) * 60);
          }
          const px = 30 + ((t - 5) / 45) * 240;
          const py = 125 - (r / 65) * 100;
          pts.push([px, py]);
        }
        const currentPx = 30 + ((temperature - 5) / 45) * 240;
        const currentPy = 125 - (Math.min(65, bubblesRate) / 65) * 100;
        return {
          polylinePoints: pts.map(([x, y]) => `${x},${y}`).join(' '),
          currentPoint: {
            x: Math.max(30, Math.min(270, currentPx)),
            y: Math.max(20, Math.min(130, currentPy)),
          },
          xLabels: [
            { x: 30, text: '5°C', anchor: 'start' },
            { x: 163, text: '30°C (Tối ưu)', anchor: 'middle' },
            { x: 270, text: '50°C', anchor: 'end' },
          ],
          yLabels: [
            { x: 165, y: 30, text: 'Đỉnh tối ưu ~30°C', color: '#d97706' },
            { x: 35, y: 120, text: '0 bọt/phút', color: '#64748b' },
          ],
          annotations: [
            { x1: 163, y1: 25, x2: 163, y2: 125, color: '#f59e0b' },
          ],
        };
      })(),
    },
    {
      id: 's_co2',
      tabLabel: '3. Nồng độ CO₂',
      title: 'Đồ thị: Nồng độ CO₂ (%) vs Tốc độ tạo bọt O₂',
      varXName: 'Nồng độ NaHCO₃ / CO₂ (0% - 4.0%)',
      varYName: 'Tốc độ bọt khí O₂',
      currentValueBadge: `CO₂: ${co2Concentration}%`,
      question: 'Khi bổ sung thêm muối NaHCO₃ (tăng nồng độ CO₂ từ 0% lên 4%), tốc độ tạo bọt khí O₂ sẽ thay đổi như thế nào?',
      correctPrediction: 'direct',
      explanationCorrect: 'Chính xác! Nồng độ CO₂ tăng cung cấp thêm nguyên liệu cho chu trình Calvin giúp quang hợp tăng (Tỉ lệ thuận tới bão hòa).',
      explanationWrong: 'Chưa chính xác: CO₂ là nguyên liệu thiết yếu, nồng độ tăng làm quang hợp tăng tỉ lệ thuận tới điểm bão hòa CO₂.',
      insight:
        'Khí CO₂ là cơ chất trực tiếp của enzyme cố định cacbon. Ban đầu khi tăng CO₂, tốc độ quang hợp tăng tỉ lệ thuận; khi đạt ngưỡng bão hòa CO₂ (~1.5–2%), tốc độ đi ngang vì bị giới hạn bởi tốc độ pha sáng (ATP và NADPH).',
      svgConfig: (() => {
        const pts: [number, number][] = [];
        for (let c = 0; c <= 4; c += 0.2) {
          const factor = (c / (c + 0.6)) * 60;
          const px = 30 + (c / 4) * 240;
          const py = 125 - (factor / 65) * 100;
          pts.push([px, py]);
        }
        const curFactor = (co2Concentration / (co2Concentration + 0.6)) * 60;
        const currentPx = 30 + (co2Concentration / 4) * 240;
        const currentPy = 125 - (curFactor / 65) * 100;
        return {
          polylinePoints: pts.map(([x, y]) => `${x},${y}`).join(' '),
          currentPoint: {
            x: Math.max(30, Math.min(270, currentPx)),
            y: Math.max(20, Math.min(130, currentPy)),
          },
          xLabels: [
            { x: 30, text: '0% Thiếu CO₂', anchor: 'start' },
            { x: 120, text: '1.5% Bão hòa', anchor: 'middle' },
            { x: 270, text: '4.0%', anchor: 'end' },
          ],
          yLabels: [
            { x: 140, y: 35, text: 'Ngưỡng bão hòa CO₂', color: '#059669' },
            { x: 35, y: 120, text: 'Quang hợp ngưng', color: '#64748b' },
          ],
        };
      })(),
    },
  ];

  // 3. HYDROTROPISM CASES
  const hydrotropismCases: AnalyticsCase[] = [
    {
      id: 'h_moisture',
      tabLabel: '1. Độ ẩm vs Góc uốn rễ',
      title: 'Đồ thị: Gradien Độ ẩm vs Góc uốn của rễ',
      varXName: 'Mức chênh lệch độ ẩm giữa 2 phía (0% - 100%)',
      varYName: 'Góc uốn hướng nguồn ẩm của rễ',
      currentValueBadge: `Độ lệch rễ: ${rootAngle}°`,
      question: 'Khi đặt miếng bọt biển ẩm lệch hẳn sang một bên chậu, góc uốn của rễ sẽ như thế nào?',
      correctPrediction: 'direct',
      explanationCorrect: 'Chính xác! Chênh lệch độ ẩm càng lớn thì rễ càng uốn cong mạnh về phía có nước (Tỉ lệ thuận).',
      explanationWrong: 'Chưa chính xác: Nguồn ẩm một phía kích thích rễ sinh trưởng hướng nước dương (Tỉ lệ thuận).',
      insight:
        'Rễ cây có tính hướng nước dương (+). Tế bào chóp rễ cảm nhận độ dốc ẩm (moisture gradient). Chênh lệch độ ẩm càng lớn thì tín hiệu ức chế sinh trưởng tế bào mặt tiếp xúc nước càng mạnh, làm tế bào phía khô dãn dài đẩy rễ uốn mạnh về nguồn nước.',
      svgConfig: (() => {
        const pts: [number, number][] = [];
        for (let m = 0; m <= 100; m += 10) {
          const angle = (m / 100) * 45;
          const px = 30 + (m / 100) * 240;
          const py = 125 - (angle / 50) * 95;
          pts.push([px, py]);
        }
        const moistureDiff = waterSourcePos === 'bottom' || waterSourcePos === 'center' ? 10 : 85;
        const currentPx = 30 + (moistureDiff / 100) * 240;
        const currentPy = 125 - (Math.abs(rootAngle) / 50) * 95;
        return {
          polylinePoints: pts.map(([x, y]) => `${x},${y}`).join(' '),
          currentPoint: {
            x: Math.max(30, Math.min(270, currentPx)),
            y: Math.max(20, Math.min(130, currentPy)),
          },
          xLabels: [
            { x: 30, text: '0% Đều nhau', anchor: 'start' },
            { x: 150, text: '50%', anchor: 'middle' },
            { x: 270, text: '100% Lệch mạnh', anchor: 'end' },
          ],
          yLabels: [
            { x: 35, y: 35, text: 'Uốn cong cực đại 45°', color: '#059669' },
            { x: 35, y: 120, text: 'Mọc thẳng xuống', color: '#64748b' },
          ],
        };
      })(),
    },
    {
      id: 'h_gravity',
      tabLabel: '2. Xoay hộp vs Trọng lực',
      title: 'Đồ thị: Góc xoay hộp (Trọng lực) vs Tốc độ uốn đất',
      varXName: 'Góc nghiêng hộp thí nghiệm (0° - 90°)',
      varYName: 'Mức độ kích hoạt hướng đất',
      currentValueBadge: `Góc xoay: ${boxRotation}°`,
      question: 'Khi xoay ngang hộp thí nghiệm 90°, phản ứng hướng trọng lực của rễ sẽ như thế nào?',
      correctPrediction: 'direct',
      explanationCorrect: 'Chính xác! Khi nằm ngang 90°, hạt tinh bột thạch lạp đè mạnh lên màng đáy kích hoạt hướng đất mạnh nhất (Tỉ lệ thuận).',
      explanationWrong: 'Chưa chính xác: Góc nghiêng càng lớn thì tác dụng của trọng lực lên chóp rễ càng mạnh (Tỉ lệ thuận).',
      insight:
        'Các tế bào trung tâm chóp rễ chứa hạt tinh bột thạch lạp (statoliths) có tỉ trọng nặng. Khi hộp bị xoay ngang 90°, thạch lạp lắng chìm xuống màng bên, kích thích bơm auxin dồn xuống mặt dưới ức chế tế bào mặt dưới, làm rễ nhanh chóng uốn cong 90° hướng đất dương (+).',
      svgConfig: (() => {
        const pts: [number, number][] = [];
        for (let r = 0; r <= 90; r += 10) {
          const factor = (r / 90) * 90;
          const px = 30 + (r / 90) * 240;
          const py = 125 - (factor / 100) * 95;
          pts.push([px, py]);
        }
        const currentPx = 30 + (boxRotation / 90) * 240;
        const currentPy = 125 - (boxRotation / 100) * 95;
        return {
          polylinePoints: pts.map(([x, y]) => `${x},${y}`).join(' '),
          currentPoint: {
            x: Math.max(30, Math.min(270, currentPx)),
            y: Math.max(20, Math.min(130, currentPy)),
          },
          xLabels: [
            { x: 30, text: '0° Đứng thẳng', anchor: 'start' },
            { x: 150, text: '45° Nghiêng', anchor: 'middle' },
            { x: 270, text: '90° Nằm ngang', anchor: 'end' },
          ],
          yLabels: [
            { x: 35, y: 35, text: 'Cạnh tranh cực đại', color: '#0284c7' },
            { x: 35, y: 120, text: 'Trọng lực chuẩn', color: '#64748b' },
          ],
        };
      })(),
    },
  ];

  // Pick current case list for active lab
  const currentCases =
    activeLab === 'phototropism'
      ? phototropismCases
      : activeLab === 'photosynthesis'
      ? photosynthesisCases
      : hydrotropismCases;

  const currentTabId = selectedCaseTab[activeLab] || currentCases[0].id;
  const currentCase = currentCases.find((c) => c.id === currentTabId) || currentCases[0];
  const userPrediction = predictions[currentCase.id];
  const isAnswered = userPrediction !== undefined;
  const isCorrect = userPrediction === currentCase.correctPrediction;

  const handleSelectPrediction = (opt: PredictionOption) => {
    setPredictions((prev) => ({ ...prev, [currentCase.id]: opt }));
  };

  return (
    <div className="bg-white/95 rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-col gap-3.5 text-slate-800">
      {/* 1. Case Switcher Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 custom-scrollbar">
        {currentCases.map((c) => {
          const isTabActive = c.id === currentCase.id;
          const tabPred = predictions[c.id];
          const hasPredicted = tabPred !== undefined;

          return (
            <button
              key={c.id}
              onClick={() => setSelectedCaseTab((prev) => ({ ...prev, [activeLab]: c.id }))}
              className={`py-1.5 px-2.5 rounded-xl text-[11px] font-bold border transition cursor-pointer flex items-center gap-1 whitespace-nowrap shadow-xs ${
                isTabActive
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <span>{c.tabLabel}</span>
              {hasPredicted && (
                <span className={`text-[10px] ml-0.5 ${tabPred === c.correctPrediction ? 'text-emerald-400' : 'text-amber-300'}`}>
                  ●
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* 2. Interactive Correlation Prediction Step (Học sinh dự đoán ngắn gọn trước) */}
      <div className="bg-slate-50/90 p-3 rounded-2xl border border-slate-200/90 space-y-2">
        <div className="flex items-center justify-between">
          <div className="text-[11px] font-bold text-indigo-900 flex items-center gap-1.5">
            <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-[10px] flex items-center justify-center font-bold">
              ?
            </span>
            <span>Dự đoán tỉ lệ tương quan:</span>
          </div>
          <span className="text-[10px] font-medium text-slate-500">
            {isAnswered ? 'Đã dự đoán' : 'Chưa dự đoán'}
          </span>
        </div>

        <p className="text-xs font-semibold text-slate-800 leading-snug">
          {currentCase.question}
        </p>

        {/* Prediction Buttons (Ngắn gọn: Tỉ lệ thuận, Tỉ lệ nghịch, Hình chuông) */}
        <div className="grid grid-cols-3 gap-1.5 pt-1">
          {(['direct', 'inverse', 'bell'] as PredictionOption[]).map((opt) => {
            const isSelected = userPrediction === opt;
            const isThisCorrect = opt === currentCase.correctPrediction;

            let btnClass = 'bg-white text-slate-700 border-slate-200 hover:bg-indigo-50 hover:border-indigo-200';
            if (isSelected) {
              btnClass = isThisCorrect
                ? 'bg-emerald-500 text-white border-emerald-600 font-bold ring-2 ring-emerald-400/30'
                : 'bg-amber-500 text-white border-amber-600 font-bold ring-2 ring-amber-400/30';
            }

            return (
              <button
                key={opt}
                onClick={() => handleSelectPrediction(opt)}
                className={`py-2 px-1 rounded-xl text-[11px] font-bold border transition text-center cursor-pointer shadow-xs flex flex-col items-center justify-center ${btnClass}`}
              >
                <span>{predictionLabels[opt]}</span>
              </button>
            );
          })}
        </div>

        {/* Real-time Feedback on Student Prediction */}
        {isAnswered && (
          <div
            className={`p-2 rounded-xl text-[11px] font-medium leading-relaxed animate-in fade-in duration-200 border ${
              isCorrect
                ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
                : 'bg-amber-50 text-amber-900 border-amber-200'
            }`}
          >
            {isCorrect ? (
              <div className="flex items-start gap-1.5">
                <span className="text-sm">🎉</span>
                <span>
                  <strong>Chính xác!</strong> {currentCase.explanationCorrect}
                </span>
              </div>
            ) : (
              <div className="flex items-start gap-1.5">
                <span className="text-sm">💡</span>
                <span>
                  <strong>Đối chiếu:</strong> Bạn dự đoán <em>"{predictionLabels[userPrediction]}"</em> • Thực tế là{' '}
                  <strong className="text-emerald-700">"{predictionLabels[currentCase.correctPrediction]}"</strong>.{' '}
                  {currentCase.explanationWrong}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 3. Visual SVG Diagram / Curve with Live Tracker */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-slate-900">{currentCase.title}</span>
          <span className="text-emerald-700 font-mono font-bold text-xs bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 shadow-xs">
            {currentCase.currentValueBadge}
          </span>
        </div>

        <div className="relative">
          <svg viewBox="0 0 300 150" className="w-full h-38 bg-slate-50/90 rounded-2xl border border-slate-200 p-1">
            {/* Grid & Axis Lines */}
            <line x1="30" y1="125" x2="275" y2="125" stroke="#cbd5e1" strokeWidth="1" />
            <line x1="30" y1="20" x2="30" y2="125" stroke="#cbd5e1" strokeWidth="1" />
            <line x1="30" y1="75" x2="275" y2="75" stroke="#e2e8f0" strokeWidth="1" strokeDasharray="3,3" />
            <line x1="150" y1="20" x2="150" y2="125" stroke="#e2e8f0" strokeWidth="1" strokeDasharray="3,3" />

            {/* Optional Custom Annotations */}
            {currentCase.svgConfig.annotations?.map((ann, idx) => (
              <line
                key={idx}
                x1={ann.x1}
                y1={ann.y1}
                x2={ann.x2}
                y2={ann.y2}
                stroke={ann.color || '#f59e0b'}
                strokeWidth="1"
                strokeDasharray="3,3"
              />
            ))}

            {/* Theoretical Curve */}
            <polyline
              fill="none"
              stroke="#059669"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={currentCase.svgConfig.polylinePoints}
            />

            {/* Live Indicator (Chấm điểm đo thực tế đang chạy từ mô hình 3D) */}
            <circle
              cx={currentCase.svgConfig.currentPoint.x}
              cy={currentCase.svgConfig.currentPoint.y}
              r="9"
              fill="#10b981"
              fillOpacity="0.25"
              className="animate-ping"
            />
            <circle
              cx={currentCase.svgConfig.currentPoint.x}
              cy={currentCase.svgConfig.currentPoint.y}
              r="5.5"
              fill="#059669"
              stroke="#ffffff"
              strokeWidth="1.5"
            />

            {/* X Axis Labels */}
            {currentCase.svgConfig.xLabels.map((lbl, idx) => (
              <text
                key={idx}
                x={lbl.x}
                y="142"
                textAnchor={lbl.anchor || 'middle'}
                fill="#64748b"
                fontSize="8.5"
                fontWeight="600"
              >
                {lbl.text}
              </text>
            ))}

            {/* Y Axis Labels */}
            {currentCase.svgConfig.yLabels.map((lbl, idx) => (
              <text
                key={idx}
                x={lbl.x}
                y={lbl.y}
                fill={lbl.color || '#475569'}
                fontSize="8.5"
                fontWeight="bold"
              >
                {lbl.text}
              </text>
            ))}
          </svg>

          {/* Tiny live pill on bottom right */}
          <div className="absolute top-2 right-2 flex items-center gap-1 bg-white/90 backdrop-blur-xs px-2 py-0.5 rounded-md border border-slate-200 text-[9px] font-bold text-emerald-700 shadow-xs pointer-events-none">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Điểm đo thực nghiệm
          </div>
        </div>
      </div>

      {/* 4. Scientific Conclusion & Mechanism Insight (Nhận xét khoa học) */}
      <div className="text-[11px] text-slate-700 bg-emerald-50/70 p-3 rounded-2xl border border-emerald-200 leading-relaxed space-y-1">
        <div className="font-bold text-emerald-900 flex items-center gap-1.5 text-xs">
          <span>💡</span> Nhận xét khoa học:
        </div>
        <p className="text-slate-800">{currentCase.insight}</p>
      </div>
    </div>
  );
}
