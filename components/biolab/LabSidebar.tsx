'use client';

import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  LabId,
  PhototropismState,
  PhotosynthesisState,
  HydrotropismState,
  LabMission,
  QuizQuestion,
} from './types';
import LabAnalyticsChart from './LabAnalyticsChart';
import PhotosynthesisRelationshipMap from './PhotosynthesisRelationshipMap';

type SidebarTab = 'controls' | 'inquiry' | 'analytics' | 'mechanism' | 'missions';

interface Props {
  activeLab: LabId;
  activeTab?: SidebarTab;
  onTabChange?: (tab: SidebarTab) => void;
  photoState: PhototropismState;
  onUpdatePhotoState: (updater: (prev: PhototropismState) => PhototropismState) => void;
  photoCurrentAngle: number;

  synthState: PhotosynthesisState;
  onUpdateSynthState: (updater: (prev: PhotosynthesisState) => PhotosynthesisState) => void;

  hydroState: HydrotropismState;
  onUpdateHydroState: (updater: (prev: HydrotropismState) => HydrotropismState) => void;
  hydroCurrentAngle: number;
}

export default function LabSidebar({
  activeLab,
  activeTab: propActiveTab,
  onTabChange,
  photoState,
  onUpdatePhotoState,
  photoCurrentAngle,
  synthState,
  onUpdateSynthState,
  hydroState,
  onUpdateHydroState,
  hydroCurrentAngle,
}: Props) {
  const [localActiveTab, setLocalActiveTab] = useState<SidebarTab>('controls');
  const activeTab = propActiveTab ?? localActiveTab;

  const setActiveTab = (tab: SidebarTab) => {
    setLocalActiveTab(tab);
    if (onTabChange) onTabChange(tab);
  };

  // Inquiry Guided State
  const [selectedTopicIdByLab, setSelectedTopicIdByLab] = useState<Record<LabId, string>>({
    phototropism: 'topic_p1',
    photosynthesis: 'topic_s1',
    hydrotropism: 'topic_h1',
  });
  const [selectedHypothesis, setSelectedHypothesis] = useState<Record<string, string>>({});
  const [selectedPrediction, setSelectedPrediction] = useState<Record<string, string>>({});
  const [inquiryChecked, setInquiryChecked] = useState<Record<string, boolean>>({});
  const [inquiryAnswerSelected, setInquiryAnswerSelected] = useState<Record<number, number>>({});
  const [showRealWorldInsight, setShowRealWorldInsight] = useState<Record<string, boolean>>({});
  const [studentUserNotes, setStudentUserNotes] = useState<Record<string, string>>({});
  const [inquirySaved, setInquirySaved] = useState(false);

  // Quiz state
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  // Missions state per lab
  const [completedMissions, setCompletedMissions] = useState<Record<string, boolean>>({});

  // Trigger confetti on mission complete
  const triggerConfetti = () => {
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.7 },
      colors: ['#10b981', '#38bdf8', '#f59e0b', '#ec4899', '#8b5cf6'],
    });
  };

  // Check mission progress dynamically
  useEffect(() => {
    if (activeLab === 'phototropism') {
      if (Math.abs(photoState.lightAngle) >= 30 && !completedMissions['p1']) {
        setCompletedMissions((prev) => ({ ...prev, p1: true }));
        triggerConfetti();
      }
      if (photoState.xrayMode && !completedMissions['p2']) {
        setCompletedMissions((prev) => ({ ...prev, p2: true }));
        triggerConfetti();
      }
      if (photoState.plantTreatment === 'decapitated' && !completedMissions['p3']) {
        setCompletedMissions((prev) => ({ ...prev, p3: true }));
        triggerConfetti();
      }
    } else if (activeLab === 'photosynthesis') {
      if (synthState.bubblesPerMinute >= 30 && !completedMissions['s1']) {
        setCompletedMissions((prev) => ({ ...prev, s1: true }));
        triggerConfetti();
      }
      if (synthState.colorFilter === 'green' && !completedMissions['s2']) {
        setCompletedMissions((prev) => ({ ...prev, s2: true }));
        triggerConfetti();
      }
      if (synthState.glowingSplintActive && synthState.splintBurstEffect && !completedMissions['s3']) {
        setCompletedMissions((prev) => ({ ...prev, s3: true }));
        triggerConfetti();
      }
    } else if (activeLab === 'hydrotropism') {
      if (hydroState.waterSourcePos === 'left' || hydroState.waterSourcePos === 'right') {
        if (!completedMissions['h1']) {
          setCompletedMissions((prev) => ({ ...prev, h1: true }));
          triggerConfetti();
        }
      }
      if (hydroState.boxRotation === 90 && !completedMissions['h2']) {
        setCompletedMissions((prev) => ({ ...prev, h2: true }));
        triggerConfetti();
      }
      if (hydroState.xrayStatoliths && !completedMissions['h3']) {
        setCompletedMissions((prev) => ({ ...prev, h3: true }));
        triggerConfetti();
      }
    }
  }, [photoState, synthState, hydroState, activeLab, completedMissions]);

  // Guided Inquiry Topics for Phototropism
  const phototropismInquiryTopics = [
    {
      id: 'topic_p1',
      title: '1. Hướng chiếu sáng và góc uốn thân',
      question: 'Khi chiếu sáng đơn hướng từ một bên, thân cây mầm sẽ phản ứng như thế nào và nguyên nhân là gì?',
      context: 'Đặt cây mầm trong buồng tối với bóng đèn chiếu lệch một góc sang trái hoặc phải.',
      hypotheses: [
        {
          id: 'h1_1',
          text: 'Thân cây mầm sẽ uốn cong về phía nguồn sáng (Tính hướng sáng dương) do sự dãn dài không đều giữa hai phía.',
          isSupported: true,
        },
        {
          id: 'h1_2',
          text: 'Thân cây sẽ uốn cong quay lưng lại với nguồn sáng để tránh nhiệt độ cao (Tính hướng sáng âm).',
          isSupported: false,
        },
        {
          id: 'h1_3',
          text: 'Thân cây luôn luôn mọc thẳng đứng vuông góc với mặt đất, không chịu tác động của ánh sáng đơn hướng.',
          isSupported: false,
        },
      ],
      predictions: [
        { id: 'pred1_1', text: 'Góc lệch của thân cây sẽ tỷ lệ thuận với góc xoay của nguồn sáng và độ sáng của đèn.' },
        { id: 'pred1_2', text: 'Cây sẽ uốn cong ngay lập tức trong 1 giây mà không cần thời gian thích ứng.' },
        { id: 'pred1_3', text: 'Cây chỉ cong khi đèn được đặt ở đỉnh đầu (góc 0°).' },
      ],
      inquiryQuestions: [
        {
          id: 101,
          question: 'Tại sao thân cây lại uốn cong về phía có ánh sáng? Phía chiếu sáng hay phía khuất sáng có tế bào dãn dài nhanh hơn?',
          options: [
            'Phía chiếu sáng dãn dài nhanh hơn kéo thân cây uốn sang',
            'Phía khuất sáng (tối) có nồng độ auxin cao hơn, kích thích tế bào dãn dài nhanh hơn phía sáng, làm thân uốn cong về phía sáng',
            'Cả hai phía dài bằng nhau nhưng phía sáng bị teo lại do khô nước',
          ],
          correctIndex: 1,
          explanation: 'Dưới ánh sáng đơn hướng, auxin vận chuyển chủ động sang phía tối nhờ protein PIN. Auxin kích hoạt bơm proton H⁺ làm dãn thành cellulose (Thuyết sinh trưởng axit), tế bào phía tối dài nhanh hơn đẩy cây uốn về phía sáng.',
        },
        {
          id: 102,
          question: 'Dưới chế độ X-Ray Auxin, khi chỉnh góc đèn sang phải (+35°), bạn quan sát thấy hiện tượng gì ở các hạt Auxin?',
          options: [
            'Hạt auxin biến mất hoàn toàn',
            'Hạt auxin dồn mạnh sang nửa thân bên trái (phía khuất sáng), chứng minh sự phân bố bất đối xứng',
            'Hạt auxin dồn hết về phía bên phải (phía có đèn chiếu)',
          ],
          correctIndex: 1,
          explanation: 'Quang thụ thể Phototropin kích hoạt sự vận chuyển dòng auxin dồn sang phía tối, tạo gradien nồng độ hormone kích thích dãn dài bất đối xứng.',
        },
      ],
      realWorld: {
        question: 'Vì sao chậu cây cảnh đặt trong phòng bên bậu cửa sổ sau vài ngày luôn mọc nghiêng hẳn ra ngoài? Người trồng cây cần làm gì?',
        insight: 'Do ánh sáng từ ngoài cửa sổ chiếu đơn hướng làm ngọn cây hướng sáng dương. Để cây mọc thẳng đẹp cân đối, người chăm sóc cần định kỳ xoay chậu 180° sau mỗi vài ngày để các phía của cây đều nhận sáng luân phiên.',
      },
    },
    {
      id: 'topic_p2',
      title: '2. Thí nghiệm Darwin: Vị trí cảm nhận ánh sáng',
      question: 'Bộ phận nào của cây mầm giữ vai trò tiếp nhận kích thích ánh sáng để ra lệnh uốn cong?',
      context: 'Năm 1880, Charles Darwin thực hiện các phép xử lý: để nguyên, cắt bỏ chóp, bọc mũ đen và bọc mũ trong suốt.',
      hypotheses: [
        {
          id: 'h2_1',
          text: 'Chóp bao lá mầm là nơi duy nhất cảm nhận kích thích ánh sáng rồi truyền tín hiệu xuống vùng dãn dài bên dưới.',
          isSupported: true,
        },
        {
          id: 'h2_2',
          text: 'Vùng thân dãn dài bên dưới mới là nơi cảm nhận ánh sáng vì đó là nơi trực tiếp uốn cong.',
          isSupported: false,
        },
        {
          id: 'h2_3',
          text: 'Toàn bộ thân và rễ đều tiếp nhận ánh sáng ngang nhau.',
          isSupported: false,
        },
      ],
      predictions: [
        { id: 'pred2_1', text: 'Nếu cắt bỏ chóp ngọn hoặc bọc mũ đen che tối chóp ngọn, cây sẽ mất hoàn toàn tính hướng sáng (mọc thẳng).' },
        { id: 'pred2_2', text: 'Cắt bỏ chóp ngọn sẽ làm cây uốn cong mạnh hơn bình thường.' },
      ],
      inquiryQuestions: [
        {
          id: 201,
          question: 'Khi chụp mũ trong suốt (Transparent Cap) che ngọn, tại sao cây vẫn uốn cong bình thường theo nguồn sáng?',
          options: [
            'Vì mũ trong suốt cho phép photon ánh sáng xuyên qua tác động lên thụ thể phototropin ở chóp ngọn',
            'Vì mũ trong suốt tạo ra auxin thay thế cho cây',
            'Vì chóp ngọn không có tác dụng gì',
          ],
          correctIndex: 0,
          explanation: 'Thí nghiệm đối chứng với mũ trong suốt chứng minh rằng tác nhân che tối (mũ đen) làm mất phản ứng hướng sáng là do ngăn cản ánh sáng tới chóp ngọn, chứ không phải do sức nặng cơ học của mũ.',
        },
      ],
      realWorld: {
        question: 'Tại sao khi nông dân bấm ngọn (cắt chóp sinh trưởng) của cây trồng (như ớt, chè, cúc) thì cây lại đâm nhiều cành ngang?',
        insight: 'Chóp ngọn là nơi sản sinh auxin ức chế chồi bên (ưu thế ngọn). Cắt chóp ngọn làm giảm auxin, giải phóng các chồi bên phát triển thành nhiều cành nhánh xum xuê tăng năng suất.',
      },
    },
    {
      id: 'topic_p3',
      title: '3. Bản chất tín hiệu hóa học (Thí nghiệm Boysen-Jensen)',
      question: 'Tín hiệu từ chóp truyền xuống thân là tín hiệu điện học hay chất hóa học hòa tan khuếch tán?',
      context: 'Peter Boysen-Jensen chèn miếng thạch agar (cho nước thấm qua) hoặc phiến mica (chống thấm) vào dưới chóp ngọn.',
      hypotheses: [
        {
          id: 'h3_1',
          text: 'Tín hiệu là một chất hóa học (Auxin) hòa tan, có thể khuếch tán tự do qua khối thạch Agar nhưng bị chặn bởi phiến Mica.',
          isSupported: true,
        },
        {
          id: 'h3_2',
          text: 'Tín hiệu là xung điện thần kinh truyền dọc theo sợi cơ sinh học.',
          isSupported: false,
        },
      ],
      predictions: [
        { id: 'pred3_1', text: 'Chèn miếng thạch Agar thì cây vẫn giữ được tính hướng sáng; chèn phiến Mica ở phía tối thì cây mất phản ứng uốn cong.' },
      ],
      inquiryQuestions: [
        {
          id: 301,
          question: 'Tại sao khi chèn phiến mica vào phía khuất sáng (shaded side), cây lại không thể uốn cong được?',
          options: [
            'Vì mica chặn dòng vận chuyển của Auxin từ chóp ngọn đi xuống vùng dãn dài ở phía tối',
            'Vì mica làm gãy thân cây',
            'Vì mica hút hết chất dinh dưỡng của đất',
          ],
          correctIndex: 0,
          explanation: 'Phiến mica không cho nước và chất tan thấm qua. Khi chặn dòng auxin ở phía tối, tế bào phía tối không nhận được auxin kích thích dãn dài nên cây không thể uốn cong.',
        },
      ],
      realWorld: {
        question: 'Trong nông nghiệp công nghệ cao, người ta phun thuốc điều hòa sinh trưởng chứa auxin tổng hợp nhằm mục đích gì?',
        insight: 'Auxin tổng hợp (như NAA, 2,4-D ở nồng độ thích hợp) được dùng để kích thích ra rễ cành giâm, kích thích đậu quả không hạt và ngăn rụng hoa/quả non.',
      },
    },
    {
      id: 'topic_p4',
      title: '4. Tác động của dải màu quang phổ ánh sáng',
      question: 'Màu sắc ánh sáng nào kích hoạt phản ứng hướng sáng mạnh nhất?',
      context: 'Chiếu sáng cây mầm bằng ánh sáng Trắng, Xanh lam (Blue), Đỏ (Red) hoặc Tắt đèn.',
      hypotheses: [
        {
          id: 'h4_1',
          text: 'Ánh sáng xanh lam (Blue light 400-500 nm) kích hoạt tính hướng sáng mạnh nhất do sắc tố quang thụ thể Phototropin hấp thụ đỉnh ở dải sóng này.',
          isSupported: true,
        },
        {
          id: 'h4_2',
          text: 'Ánh sáng đỏ (Red light) kích thích mạnh nhất vì có bước sóng dài nhất.',
          isSupported: false,
        },
        {
          id: 'h4_3',
          text: 'Mọi màu sắc ánh sáng đều kích thích hướng sáng như nhau.',
          isSupported: false,
        },
      ],
      predictions: [
        { id: 'pred4_1', text: 'Khi chuyển sang đèn màu Xanh lam, cây sẽ uốn cong với góc lớn nhất; khi chuyển sang đèn Đỏ cây uốn cong rất yếu.' },
      ],
      inquiryQuestions: [
        {
          id: 401,
          question: 'Sắc tố quang thụ thể nào ở thực vật chịu trách nhiệm tiếp nhận ánh sáng xanh lam để định hướng uốn cong?',
          options: [
            'Phototropin 1 và Phototropin 2 (thụ thể flavoprotein hấp thụ ánh sáng xanh)',
            'Diệp lục a (Chlorophyll a)',
            'Carotenoid tạo màu vàng cam',
          ],
          correctIndex: 0,
          explanation: 'Phototropin là thụ thể ánh sáng xanh chuyên biệt gắn trên màng sinh chất. Khi hấp thụ photon xanh lam, phototropin tự phosphoryl hóa và kích hoạt bơm PIN tái phân bố auxin.',
        },
      ],
      realWorld: {
        question: 'Trong các nhà kính trồng rau thông minh, tại sao người ta thường dùng đèn LED kết hợp ánh sáng Xanh lam và Đỏ?',
        insight: 'Ánh sáng đỏ giúp kích thích quang hợp tạo sinh khối tối đa, còn ánh sáng xanh lam điều khiển hình thái thân lá thẳng khỏe, mở khí khổng và hướng sáng tối ưu.',
      },
    },
  ];

  // Guided Inquiry Topics for Photosynthesis (Rong đuôi chó)
  const photosynthesisInquiryTopics = [
    {
      id: 'topic_s1',
      title: '1. Khoảng cách nguồn sáng & Cường độ photon',
      question: 'Khoảng cách từ đèn đến cành rong ảnh hưởng như thế nào đến tốc độ quang hợp và tần suất giải phóng bọt khí O₂ từ phiến lá và cuống?',
      context: 'Di chuyển đèn dọc ray quang học từ 10 cm đến 100 cm; quan sát bọt khí li ti bám trên phiến lá, bọt tách ra và dòng bọt khí thoát ra từ cuống rong.',
      hypotheses: [
        {
          id: 'h_s1_1',
          text: 'Đưa đèn lại gần làm tăng mật độ photon tới lá, kích hoạt pha sáng mạnh mẽ tạo nhiều bọt khí O₂ (Tỉ lệ nghịch với bình phương khoảng cách 1/d²).',
          isSupported: true,
        },
        {
          id: 'h_s1_2',
          text: 'Khoảng cách đèn không ảnh hưởng vì cành rong chìm ngập hoàn toàn trong nước.',
          isSupported: false,
        },
        {
          id: 'h_s1_3',
          text: 'Đưa đèn ra xa thì quang hợp mạnh hơn vì cành rong là loài ưa bóng tối dưới nước.',
          isSupported: false,
        },
      ],
      predictions: [
        { id: 'pred_s1_1', text: 'Ở cự ly 10–25 cm tốc độ thoát bọt khí O₂ đạt >40–50 bọt/phút; kéo đèn ra 80–100 cm tốc độ giảm dốc xuống <10 bọt/phút.' },
        { id: 'pred_s1_2', text: 'Tốc độ bọt khí không đổi ở mọi khoảng cách đèn.' },
      ],
      inquiryQuestions: [
        {
          id: 1101,
          question: 'Theo định luật nghịch đảo bình phương trong quang học (I ∝ 1/d²), nếu tăng khoảng cách từ đèn tới cành rong lên gấp 2 lần (ví dụ từ 20 cm lên 40 cm), cường độ photon chiếu vào phiến lá sẽ thay đổi như thế nào?',
          options: [
            'Giảm đi 4 lần so với ban đầu (1/2² = 1/4)',
            'Giảm đi 2 lần',
            'Không thay đổi',
            'Tăng lên 2 lần',
          ],
          correctIndex: 0,
          explanation: 'Quang năng phân kỳ trong không gian ba chiều theo hình nón. Khoảng cách tăng gấp đôi làm diện tích chùm sáng mở rộng gấp 4 lần, do đó mật độ photon tới mỗi đơn vị diện tích phiến lá giảm 4 lần.',
        },
      ],
      realWorld: {
        question: 'Trong các trang trại thẳng đứng (Vertical Farming) và nhà kính công nghệ cao, tại sao người ta treo đèn LED chuyên dụng cách tán lá cây ở cự ly rất gần (15–30 cm) thay vì treo tít trên cao trần nhà?',
        insight: 'Treo đèn LED ở cự ly gần giúp cây hấp thụ mật độ photon quang hợp (PPFD) tối đa mà không lãng phí quang năng ra xung quanh. Đèn LED tỏa ít nhiệt nên không gây cháy lá dù đặt rất gần cành cây.',
      },
    },
    {
      id: 'topic_s2',
      title: '2. Nồng độ CO₂ hòa tan & Pha tối Calvin',
      question: 'Nồng độ muối NaHCO₃ (nguồn cung cấp CO₂ hòa tan) trong nước ảnh hưởng như thế nào đến tốc độ quang hợp của cành rong?',
      context: 'Bổ sung muối NaHCO₃ vào cốc nước từ 0% đến 4.0%; theo dõi bọt khí O₂ bám trên lá và thoát ra ở cuống.',
      hypotheses: [
        {
          id: 'h_s2_1',
          text: 'Khí CO₂ là cơ chất thiết yếu cho chu trình Calvin; tăng nồng độ NaHCO₃ làm tăng tốc độ quang hợp cho tới khi đạt điểm bão hòa CO₂.',
          isSupported: true,
        },
        {
          id: 'h_s2_2',
          text: 'Muối NaHCO₃ chỉ có tác dụng tạo vị mặn, không liên quan đến phản ứng quang hợp.',
          isSupported: false,
        },
        {
          id: 'h_s2_3',
          text: 'Rong thủy sinh chỉ cần nước và ánh sáng, không cần CO₂ để quang hợp.',
          isSupported: false,
        },
      ],
      predictions: [
        { id: 'pred_s2_1', text: 'Khi không có CO₂ (0%), cành rong ngừng tạo bọt khí; thêm NaHCO₃ lên 1.5–2.0% tốc độ tạo bọt tăng vọt rồi đi ngang ở ngưỡng bão hòa.' },
        { id: 'pred_s2_2', text: 'Tốc độ tạo bọt khí giảm dần khi thêm NaHCO₃.' },
      ],
      inquiryQuestions: [
        {
          id: 1201,
          question: 'Tại sao khi không có CO₂ hòa tan (nồng độ = 0%), dù vẫn có ánh sáng và nước nhưng cành rong lại ngừng giải phóng bọt khí O₂?',
          options: [
            'Vì khi thiếu CO₂, pha tối đình trệ làm thiếu ADP và NADP⁺ tái sinh cho pha sáng, kéo theo pha sáng cũng bị ức chế ngược',
            'Vì ánh sáng bị nước hấp thụ mất',
            'Vì thiếu CO₂ làm vỡ lục lạp ngay lập tức',
          ],
          correctIndex: 0,
          explanation: 'Pha sáng và pha tối liên kết chặt chẽ qua hai phân tử truyền năng lượng là ATP và NADPH. Khi thiếu CO₂, chu trình Calvin ngừng chạy, không tiêu thụ ATP/NADPH để tái sinh ADP và NADP⁺. Thiếu hụt chất nhận electron khiến pha sáng cũng bị nghẽn và ngừng quang phân ly nước.',
        },
      ],
      realWorld: {
        question: 'Trong nghệ thuật chơi bể thủy sinh cảnh (Aquascaping), tại sao người chơi luôn đầu tư bình sục khí CO₂ chuyên dụng dạng bọt mịn?',
        insight: 'Trong nước tĩnh, tốc độ khuếch tán CO₂ chậm hơn ngoài không khí 10.000 lần. Sục CO₂ nhân tạo giúp nồng độ CO₂ hòa tan đạt mức tối ưu (20–30 ppm), kích thích cây thủy sinh quang hợp sủi bọt khí O₂ li ti bám ngọc khắp mặt lá ("hiện tượng thở ra ngọc" - pearling) và phát triển rực rỡ.',
      },
    },
    {
      id: 'topic_s3',
      title: '3. Nhiệt độ nước & Biến tính Enzyme RuBisCO',
      question: 'Tại sao tốc độ quang hợp đạt cực đại ở khoảng 25–35°C nhưng lại sụt giảm dốc đứng khi nhiệt độ nước vượt quá 42°C?',
      context: 'Tăng dần nhiệt độ nước trong cốc từ 5°C lên 50°C; quan sát sự biến thiên của tốc độ tạo bọt khí O₂.',
      hypotheses: [
        {
          id: 'h_s3_1',
          text: 'Nhiệt độ ấm (25–35°C) tối ưu hóa động năng va chạm phân tử của enzyme; nhưng nhiệt độ quá cao (>42°C) làm biến tính cấu trúc protein bậc ba của enzyme RuBisCO khiến quang hợp tê liệt.',
          isSupported: true,
        },
        {
          id: 'h_s3_2',
          text: 'Nhiệt độ càng cao thì quang hợp càng tăng liên tục không có giới hạn.',
          isSupported: false,
        },
        {
          id: 'h_s3_3',
          text: 'Nhiệt độ nước không ảnh hưởng đến bất kỳ phản ứng sinh hóa nào của thực vật thủy sinh.',
          isSupported: false,
        },
      ],
      predictions: [
        { id: 'pred_s3_1', text: 'Đồ thị tốc độ quang hợp theo nhiệt độ có dạng hình chuông tối ưu đỉnh ở 30°C; trên 42°C tốc độ tụt dốc dường như về 0.' },
        { id: 'pred_s3_2', text: 'Ở 50°C cây tạo nhiều bọt khí nhất.' },
      ],
      inquiryQuestions: [
        {
          id: 1301,
          question: 'Enzyme nào giữ vai trò trung tâm xúc tác phản ứng cố định CO₂ đầu tiên vào phân tử RuBP trong chu trình Calvin?',
          options: [
            'RuBisCO (Ribulose-1,5-bisphosphate carboxylase-oxygenase)',
            'Amylase phân giải tinh bột',
            'Pepsin phân giải protein',
            'Catalase phân hủy H₂O₂',
          ],
          correctIndex: 0,
          explanation: 'RuBisCO là enzyme phong phú nhất trên Trái Đất, xúc tác phản ứng cố định CO₂ trong chu trình Calvin. Enzyme này có cấu trúc protein phức tạp và rất nhạy cảm với nhiệt độ cao (>42°C).',
        },
      ],
      realWorld: {
        question: 'Khi nhiệt độ mùa hè tăng quá cao, tại sao năng suất của các cây trồng nông nghiệp lại bị suy giảm đáng kể?',
        insight: 'Nhiệt độ cao không chỉ làm giảm hoạt tính của enzyme RuBisCO mà còn thúc đẩy hoạt tính oxygenase của RuBisCO (gắn O₂ thay vì CO₂), gây ra hiện tượng hô hấp sáng (Photorespiration) lãng phí đến 25–50% sản phẩm quang hợp của cây.',
      },
    },
    {
      id: 'topic_s4',
      title: '4. Quang phổ ánh sáng & Sắc tố Diệp lục',
      question: 'Tại sao khi đặt kính lọc màu Xanh lục (Green), cành rong gần như không quang hợp và ngừng giải phóng bọt khí O₂?',
      context: 'Lần lượt đổi các tấm kính lọc màu Trắng, Xanh lam (Blue), Đỏ (Red) và Xanh lục (Green) đặt trước chao đèn.',
      hypotheses: [
        {
          id: 'h_s4_1',
          text: 'Diệp lục (Chlorophyll a & b) có đỉnh hấp thụ quang năng ở vùng ánh sáng Đỏ và Xanh lam, hầu như phản xạ hoàn toàn ánh sáng Xanh lục nên không hấp thụ được năng lượng để quang hợp.',
          isSupported: true,
        },
        {
          id: 'h_s4_2',
          text: 'Kính lọc màu xanh lục làm nước bị biến đổi thành chất độc.',
          isSupported: false,
        },
        {
          id: 'h_s4_3',
          text: 'Mọi màu sắc ánh sáng đều kích thích quang hợp với hiệu suất giống nhau.',
          isSupported: false,
        },
      ],
      predictions: [
        { id: 'pred_s4_1', text: 'Dưới ánh sáng Trắng, Lam và Đỏ tốc độ bọt khí đạt cao; dưới ánh sáng Lục tốc độ bọt khí giảm xuống mức tối thiểu (1–3 bọt/phút).' },
        { id: 'pred_s4_2', text: 'Ánh sáng xanh lục cho tốc độ quang hợp mạnh nhất vì lá cây có màu xanh lục.' },
      ],
      inquiryQuestions: [
        {
          id: 1401,
          question: 'Tại sao mắt người lại nhìn thấy phiến lá rong và hầu hết lá cây có màu xanh lục?',
          options: [
            'Vì sắc tố diệp lục không hấp thụ dải sóng xanh lục (500–550 nm) mà phản xạ và truyền qua tới mắt ta',
            'Vì lá cây tự phát ra ánh sáng xanh lục',
            'Vì cây ngậm nước nên có màu xanh lục',
          ],
          correctIndex: 0,
          explanation: 'Vật thể có màu sắc của bước sóng mà nó không hấp thụ. Diệp lục hấp thụ các photon dải Đỏ và Lam để chuyển hóa thành năng lượng hóa học, còn dải ánh sáng Xanh lục bị phản xạ ngược lại hoặc truyền qua, đi vào mắt người quan sát.',
        },
      ],
      realWorld: {
        question: 'Tại sao các đèn LED trồng trọt trong nhà (Grow lights) hiện đại thường phát ra ánh sáng màu tím hồng đặc trưng?',
        insight: 'Đèn LED trồng trọt kết hợp chính xác các chip LED Đỏ (bước sóng ~660 nm kích hoạt phản ứng tổng hợp sinh khối) và LED Xanh lam (~450 nm định hình hình thái thân lá), loại bỏ phổ xanh lục để tiết kiệm điện năng tối đa mà hiệu quả quang hợp vẫn đạt 100%.',
      },
    },
  ];

  // Guided Inquiry Topics for Hydrotropism (Tính hướng nước & rễ)
  const hydrotropismInquiryTopics = [
    {
      id: 'topic_h1',
      title: '1. Gradien độ ẩm & Tính hướng nước dương',
      question: 'Khi đất trong hộp có độ ẩm chênh lệch giữa hai bên, rễ cây mầm sẽ uốn cong theo cơ chế nào để tìm kiếm nguồn nước?',
      context: 'Đặt miếng xốp ẩm lệch sang bên trái hoặc bên phải hộp kính Rhizotron; theo dõi góc uốn cong của rễ chính.',
      hypotheses: [
        {
          id: 'h_h1_1',
          text: 'Rễ cây có tính hướng nước dương (+), các tế bào chóp rễ cảm nhận chênh lệch độ ẩm và điều hướng uốn cong chính xác về phía có nguồn nước sinh tồn.',
          isSupported: true,
        },
        {
          id: 'h_h1_2',
          text: 'Rễ cây luôn mọc thẳng đứng vuông góc với mặt đất, không quan tâm tới nguồn ẩm xung quanh.',
          isSupported: false,
        },
        {
          id: 'h_h1_3',
          text: 'Rễ cây sợ nước nên sẽ uốn cong quay lưng lại với miếng bọt biển ẩm.',
          isSupported: false,
        },
      ],
      predictions: [
        { id: 'pred_h1_1', text: 'Khi đặt miếng xốp bên trái, rễ uốn lệch sang trái một góc khoảng 35–40°; khi đặt bên phải, rễ uốn lệch sang phải tương ứng.' },
        { id: 'pred_h1_2', text: 'Rễ cây không đổi hướng mọc.' },
      ],
      inquiryQuestions: [
        {
          id: 2101,
          question: 'Cơ quan nào của rễ giữ vai trò tiếp nhận kích thích chênh lệch độ ẩm (moisture gradient)?',
          options: [
            'Chóp rễ (Root cap) chứa các thụ thể cảm nhận độ ẩm và điều hòa dòng auxin',
            'Vùng lông hút rễ',
            'Vùng rễ trưởng thành',
            'Cổ rễ',
          ],
          correctIndex: 0,
          explanation: 'Chóp rễ là trung tâm cảm biến sinh học của rễ. Gen MIZ1 (MIZU-KUSSEI 1) biểu hiện tại tế bào chóp rễ điều phối dòng ion Ca²⁺ và tín hiệu auxin để tạo phản ứng uốn cong hướng nước.',
        },
      ],
      realWorld: {
        question: 'Trong nông nghiệp tưới tiêu thông minh, tại sao người ta ứng dụng công nghệ tưới ngầm nhỏ giọt đặt sâu dưới đất thay vì tưới tràn bề mặt?',
        insight: 'Tưới ngầm nhỏ giọt tạo gradien độ ẩm sâu dưới lòng đất, kích thích rễ cây ăn sâu và bám chắc vào tầng đất dưới (tính hướng nước dương), giúp cây chống đổ ngã, chịu hạn bền bỉ và tiết kiệm 50–70% lượng nước tưới.',
      },
    },
    {
      id: 'topic_h2',
      title: '2. Hướng đất (Gravitropism) vs Hướng nước',
      question: 'Khi xoay ngang hộp thí nghiệm 90°, rễ sẽ phản ứng ra sao trước sự cạnh tranh giữa hướng trọng lực kéo xuống và nguồn nước nằm lệch bên?',
      context: 'Bấm nút xoay ngang hộp Rhizotron 90° trong khi miếng xốp ẩm đặt ở vị trí lệch bên; quan sát đường cong sinh trưởng của rễ.',
      hypotheses: [
        {
          id: 'h_h2_1',
          text: 'Rễ cây tích hợp cả hai tín hiệu vật lý và sinh hóa; góc uốn của rễ là kết quả của sự tổng hợp vector giữa Hướng đất dương và Hướng nước dương.',
          isSupported: true,
        },
        {
          id: 'h_h2_2',
          text: 'Rễ chỉ tuân theo trọng lực 100%, bỏ qua hoàn toàn nguồn nước khi hộp bị nghiêng.',
          isSupported: false,
        },
        {
          id: 'h_h2_3',
          text: 'Khi bị xoay ngang, rễ cây ngừng sinh trưởng hoàn toàn và chết khô.',
          isSupported: false,
        },
      ],
      predictions: [
        { id: 'pred_h2_1', text: 'Rễ vừa uốn cắm xuống dưới theo trọng lực, vừa nghiêng mạnh về phía miếng xốp cấp nước, tạo góc uốn trung gian tối ưu cho sinh tồn.' },
        { id: 'pred_h2_2', text: 'Rễ chỉ mọc ngang theo chiều dài hộp.' },
      ],
      inquiryQuestions: [
        {
          id: 2201,
          question: 'Tại sao trong điều kiện khô hạn gay gắt, phản ứng Hướng nước (Hydrotropism) thường lấn át phản ứng Hướng trọng lực (Gravitropism)?',
          options: [
            'Vì tìm kiếm nước là yêu cầu sinh tồn sống còn để duy trì sức trương tế bào và trao đổi chất',
            'Vì đất khô không còn trọng lực',
            'Vì rễ bị mất hết tế bào chóp rễ',
          ],
          correctIndex: 0,
          explanation: 'Trong điều kiện khan hiếm nước, tín hiệu kinase SnRK2 và phytohormone ABA kích hoạt mạnh mẽ cơ chế hướng nước, ghi đè (override) một phần tín hiệu thạch lạp trọng trường để ưu tiên cứu sống cây.',
        },
      ],
      realWorld: {
        question: 'Trên các triền đồi dốc hay khe nứt vách đá, tại sao rễ cây cổ thụ không chỉ cắm thẳng đứng theo trọng trường mà lại mọc len lỏi uốn lượn chéo góc?',
        insight: 'Rễ cây linh hoạt điều chỉnh hướng sinh trưởng theo các mạch nước ngầm và kẽ nứt giàu dinh dưỡng, minh chứng cho sự linh hoạt sinh học giữa hướng nước và hướng cơ học (Thigmotropism).',
      },
    },
    {
      id: 'topic_h3',
      title: '3. Chóp rễ & Hạt Thạch lạp (Statoliths)',
      question: 'Bằng cơ chế tế bào nào rễ cây nhận biết được đâu là phương thẳng đứng của trọng trường Trái Đất?',
      context: 'Bật chế độ X-Ray chóp rễ để quan sát các hạt tinh bột thạch lạp Amyloplasts (Statoliths) bên trong tế bào cảm nhận trọng lực (Statocytes).',
      hypotheses: [
        {
          id: 'h_h3_1',
          text: 'Các hạt tinh bột thạch lạp có khối lượng riêng nặng hơn dịch bào, lắng chìm xuống đáy màng tế bào theo trọng lực, kích hoạt các kênh PIN phân bố lại auxin dồn xuống mặt dưới.',
          isSupported: true,
        },
        {
          id: 'h_h3_2',
          text: 'Rễ cây cảm nhận trọng lực bằng các sợi cơ thần kinh co bóp.',
          isSupported: false,
        },
        {
          id: 'h_h3_3',
          text: 'Cây chỉ dựa vào ánh sáng mặt trời xuyên qua đất để biết phương hướng.',
          isSupported: false,
        },
      ],
      predictions: [
        { id: 'pred_h3_1', text: 'Khi đặt đứng, thạch lạp nằm ở đáy chóp rễ (rễ mọc thẳng); khi xoay ngang 90°, các hạt thạch lạp từ từ chìm xuống thành bên, kích hoạt phản ứng bẻ cong rễ xuống dưới.' },
        { id: 'pred_h3_2', text: 'Các hạt thạch lạp nổi lơ lửng ngẫu nhiên không tuân theo trọng lực.' },
      ],
      inquiryQuestions: [
        {
          id: 2301,
          question: 'Hạt thạch lạp (Statoliths) trong tế bào chóp rễ có bản chất hóa học chính là gì?',
          options: [
            'Các lạp thể (Amyloplasts) tích lũy tinh bột dày đặc có khối lượng riêng cao',
            'Các túi chứa khí Oxy',
            'Các tinh thể muối canxi oxalate gây ngứa',
            'Các giọt dầu lipid nhẹ nổi trên nước',
          ],
          correctIndex: 0,
          explanation: 'Hạt thạch lạp là các amyloplast chứa đầy tinh bột đậm đặc. Khối lượng riêng lớn giúp chúng dễ dàng chìm xuống màng sinh chất phía dưới dưới tác dụng của gia tốc trọng trường g = 9.8 m/s².',
        },
      ],
      realWorld: {
        question: 'Trên trạm vũ trụ quốc tế (ISS) trong điều kiện không trọng lực (Microgravity), các nhà khoa học NASA và thực vật học cho hạt nảy mầm và phát triển rễ theo cách nào?',
        insight: 'Trong môi trường vi trọng lực, hạt thạch lạp không thể chìm xuống đáy. Các phi hành gia điều khiển rễ cây phát triển bằng cách tạo gradien độ ẩm nhân tạo (Tính hướng nước) và chiếu đèn định hướng (Tính hướng sáng), giúp trồng thành công rau xà lách và ớt trên vũ trụ.',
      },
    },
    {
      id: 'topic_h4',
      title: '4. Nghịch lý Auxin (Ức chế ở rễ vs Kích thích ở thân)',
      question: 'Tại sao cùng là hormone Auxin (AIA) dồn xuống mặt dưới, nhưng thân cây lại uốn cong lên trên còn rễ cây lại uốn cong cắm xuống đất?',
      context: 'So sánh sự phân bố auxin và tốc độ dãn dài tế bào giữa thân cây mầm (Lab 1) và rễ cây (Lab 3).',
      hypotheses: [
        {
          id: 'h_h4_1',
          text: 'Tế bào rễ cực kỳ nhạy cảm với auxin (ngưỡng tối ưu thấp hơn thân ~1.000 lần); nồng độ auxin cao ở mặt dưới rễ gây ức chế dãn dài, làm mặt trên dãn dài nhanh hơn đẩy rễ uốn cong xuống dưới.',
          isSupported: true,
        },
        {
          id: 'h_h4_2',
          text: 'Auxin ở rễ và auxin ở thân là hai chất hóa học hoàn toàn khác nhau.',
          isSupported: false,
        },
        {
          id: 'h_h4_3',
          text: 'Rễ cây không có thụ thể tiếp nhận auxin.',
          isSupported: false,
        },
      ],
      predictions: [
        { id: 'pred_h4_1', text: 'Mặt trên của rễ có nồng độ auxin sinh lý tối ưu dãn dài nhanh hơn mặt dưới bị ức chế, dẫn đến góc uốn hướng đất dương (+). Chế độ X-Ray Statoliths trực quan hóa sự tích tụ auxin này.' },
        { id: 'pred_h4_2', text: 'Cả rễ và thân đều uốn cong về cùng một phía.' },
      ],
      inquiryQuestions: [
        {
          id: 2401,
          question: 'Đường cong phản ứng sinh trưởng theo nồng độ auxin của rễ khác biệt như thế nào so với thân cây?',
          options: [
            'Đỉnh nồng độ kích thích tối ưu của rễ nằm ở mức rất thấp (~10⁻¹⁰ M), nồng độ kích thích của thân (~10⁻⁵ M) sẽ ức chế mạnh sự dài ra của rễ',
            'Rễ chỉ dài ra khi nồng độ auxin cực kỳ cao',
            'Thân cây bị ức chế ở mọi nồng độ auxin',
          ],
          correctIndex: 0,
          explanation: 'Tế bào rễ mỏng manh và cực kỳ nhạy cảm. Nồng độ auxin tối ưu cho rễ chỉ khoảng 10⁻¹⁰ M. Ở mặt dưới rễ, nồng độ auxin tích tụ vượt ngưỡng kích thích, dẫn đến sản sinh ethylene và ức chế bơm proton, làm tế bào mặt dưới chậm phát triển hơn mặt trên.',
        },
      ],
      realWorld: {
        question: 'Trong nghề làm vườn, khi dùng thuốc kích thích ra rễ (như IBA, NAA), tại sao nếu pha thuốc quá đậm đặc thì cành giâm lại bị thui chột và không thể ra rễ?',
        insight: 'Nồng độ auxin quá cao sẽ rơi vào vùng ức chế sinh trưởng tế bào rễ, gây thối cuống và chết cành giâm. Do đó việc tuân thủ chính xác tỉ lệ pha loãng theo khuyến nghị khoa học là yếu tố quyết định thành bại.',
      },
    },
  ];

  const inquiryTopicsByLab: Record<LabId, typeof phototropismInquiryTopics> = {
    phototropism: phototropismInquiryTopics,
    photosynthesis: photosynthesisInquiryTopics,
    hydrotropism: hydrotropismInquiryTopics,
  };

  const currentTopics = inquiryTopicsByLab[activeLab] || phototropismInquiryTopics;
  const currentTopicId = selectedTopicIdByLab[activeLab] || currentTopics[0].id;
  const currentTopic = currentTopics.find((t) => t.id === currentTopicId) || currentTopics[0];

  // Quizzes list per lab
  const quizzes: Record<LabId, QuizQuestion[]> = {
    phototropism: [
      {
        id: 1,
        question: 'Tại sao thân cây mầm lại uốn cong về phía có ánh sáng chiếu đơn hướng?',
        options: [
          'Tế bào phía sáng nhận nhiều photon nên dãn dài nhanh hơn',
          'Auxin (AIA) bị phân giải ở phía sáng và vận chuyển dồn sang phía tối, kích thích dãn dài tế bào phía tối',
          'Nhiệt độ từ bóng đèn làm khô nước tế bào phía sáng',
          'Lục lạp chỉ quang hợp ở phía sáng kéo thân cây nghiêng theo',
        ],
        correctIndex: 1,
        explanation: 'Dưới tác động của ánh sáng đơn hướng, auxin vận chuyển chủ động sang phía khuất sáng. Nồng độ auxin cao kích hoạt bơm H⁺ dãn thành tế bào, làm tế bào phía tối dãn dài nhanh hơn phía sáng.',
      },
      {
        id: 2,
        question: 'Thí nghiệm cắt bỏ chóp ngọn của Charles Darwin chứng minh điều gì?',
        options: [
          'Chóp ngọn là nơi duy nhất quang hợp tạo chất hữu cơ',
          'Chóp bao lá mầm là nơi tiếp nhận kích thích ánh sáng để truyền tín hiệu xuống vùng dãn dài',
          'Cây không có rễ thì không uốn cong được',
          'Auxin chỉ được tổng hợp ở rễ và chuyển lên ngọn',
        ],
        correctIndex: 1,
        explanation: 'Khi cắt bỏ hoặc che tối chóp ngọn bằng mũ không trong suốt, cây mất hoàn toàn tính hướng sáng. Điều này chứng minh vị trí cảm nhận kích thích ánh sáng chính là chóp bao lá mầm.',
      },
      {
        id: 3,
        question: 'Sắc tố quang thụ thể nào tiếp nhận ánh sáng định hướng cho tính hướng sáng?',
        options: ['Diệp lục a (Chlorophyll a)', 'Phototropin (hấp thụ ánh sáng xanh lam)', 'Carotenoid', 'Phytochrome (hấp thụ ánh sáng đỏ xa)'],
        correctIndex: 1,
        explanation: 'Phototropin 1 và 2 là các flavoprotein cảm nhận ánh sáng xanh lam (blue light 400-500 nm), kích hoạt sự tái phân bố auxin sang phía tối.',
      },
    ],
    photosynthesis: [
      {
        id: 1,
        question: 'Bọt khí thoát ra liên tục từ cành rong đuôi chó trong thí nghiệm là khí gì?',
        options: ['Khí Carbon dioxide (CO₂)', 'Khí Oxy (O₂)', 'Khí Nitơ (N₂)', 'Hơi nước ngưng tụ'],
        correctIndex: 1,
        explanation: 'Khí thoát ra là Oxy (O₂) sinh ra từ quá trình quang phân ly nước tại màng thylakoid trong pha sáng: 2H₂O → 4H⁺ + 4e⁻ + O₂.',
      },
      {
        id: 2,
        question: 'Tại sao khi lắp kính lọc màu Xanh lục (Green), tốc độ thoát bọt khí lại giảm xuống mức tối thiểu?',
        options: [
          'Kính lọc xanh lục làm nóng nước làm rong chết',
          'Hệ sắc tố diệp lục phản xạ hầu hết ánh sáng xanh lục, không hấp thụ để quang hợp',
          'Ánh sáng xanh lục phá hủy phân tử CO₂',
          'Cành rong chỉ thở mà không quang hợp vào ban ngày',
        ],
        correctIndex: 1,
        explanation: 'Diệp lục hấp thụ mạnh nhất ở dải ánh sáng Xanh lam (430-450 nm) và Đỏ (650-680 nm), phản xạ màu xanh lục nên mắt ta thấy lá có màu xanh.',
      },
      {
        id: 3,
        question: 'Nếu tăng nhiệt độ nước lên quá 45°C - 50°C, điều gì sẽ xảy ra với quá trình quang hợp?',
        options: [
          'Quang hợp đạt tốc độ cực đại kỷ lục',
          'Quang hợp giảm mạnh hoặc ngừng hẳn do các enzyme bị biến tính',
          'Quang hợp không đổi vì nhiệt độ không ảnh hưởng',
          'Cây chuyển sang quang hợp không cần ánh sáng',
        ],
        correctIndex: 1,
        explanation: 'Pha tối (chu trình Calvin) phụ thuộc vào enzyme (như RuBisCO). Ở nhiệt độ cao (>45°C), cấu trúc protein enzyme bị biến tính làm ngừng phản ứng xúc tác.',
      },
    ],
    hydrotropism: [
      {
        id: 1,
        question: 'Tính hướng nước của rễ thuộc loại cảm ứng nào?',
        options: ['Hướng động âm (-)', 'Hướng động dương (+)', 'Ứng động sinh trưởng', 'Cảm ứng hóa học âm'],
        correctIndex: 1,
        explanation: 'Rễ cây sinh trưởng hướng về phía có nguồn nước (hướng kích thích thuận lợi) nên là hướng động dương (+).',
      },
      {
        id: 2,
        question: 'Bộ phận nào của rễ giữ vai trò nhận biết trọng lực và định hướng sinh trưởng?',
        options: ['Vùng lông hút', 'Vùng dãn dài tế bào', 'Chóp rễ (Root cap) chứa tế bào thạch lạp (statocytes)', 'Vùng vỏ rễ'],
        correctIndex: 2,
        explanation: 'Chóp rễ chứa các tế bào có hạt thạch lạp (statoliths) giàu tinh bột. Các hạt này lắng xuống đáy tế bào theo trọng lực giúp rễ cảm nhận hướng đất.',
      },
      {
        id: 3,
        question: 'Tại sao nồng độ auxin cao ở mặt dưới rễ lại ức chế tế bào mặt dưới dãn dài (ngược với thân cây)?',
        options: [
          'Vì rễ không có enzyme phân giải auxin',
          'Tế bào rễ có độ nhạy cảm cao với auxin, nồng độ tối ưu cho rễ thấp hơn nhiều so với thân',
          'Auxin ở rễ biến thành độc tố khi gặp đất',
          'Do rễ không có thành cellulose',
        ],
        correctIndex: 1,
        explanation: 'Thang nồng độ tối ưu của rễ rất thấp (~10^-10 M). Nồng độ auxin vượt ngưỡng ở mặt dưới gây ức chế dãn dài, làm mặt trên dài nhanh hơn nên rễ uốn cong xuống dưới.',
      },
    ],
  };

  // Missions list per lab
  const missionsList: Record<LabId, LabMission[]> = {
    phototropism: [
      {
        id: 'p1',
        title: 'Tạo góc lệch ánh sáng',
        description: 'Chỉnh góc đèn lệch ít nhất 30° sang bên trái hoặc bên phải để kích thích cây bắt đầu uốn cong.',
        isCompleted: !!completedMissions['p1'],
        hint: 'Kéo thanh trượt "Góc xoay đèn" lên >30° hoặc <-30°',
      },
      {
        id: 'p2',
        title: 'Kích hoạt Chế độ X-Ray',
        description: 'Bật chế độ X-Ray để quan sát sự di chuyển và tích tụ của các phân tử Auxin ở phía tối.',
        isCompleted: !!completedMissions['p2'],
        hint: 'Bấm nút gạt "Chế độ X-Ray Phân tử Auxin"',
      },
      {
        id: 'p3',
        title: 'Tái hiện Thí nghiệm Darwin',
        description: 'Chọn phương pháp xử lý "Cắt bỏ chóp ngọn" để kiểm tra xem cây có còn phản ứng với ánh sáng không.',
        isCompleted: !!completedMissions['p3'],
        hint: 'Chọn "Cắt bỏ chóp ngọn (Decapitated)" trong mục Xử lý thí nghiệm',
      },
    ],
    photosynthesis: [
      {
        id: 's1',
        title: 'Tăng tốc độ quang hợp',
        description: 'Điều chỉnh các yếu tố (đưa đèn lại gần, tăng CO2, nhiệt độ ~30°C) để đạt tốc độ > 30 bọt khí/phút.',
        isCompleted: !!completedMissions['s1'],
        hint: 'Giảm khoảng cách đèn xuống < 30cm và bổ sung NaHCO3',
      },
      {
        id: 's2',
        title: 'Thử nghiệm Kính lọc xanh lục',
        description: 'Chuyển sang kính lọc màu Xanh lục để quan sát sự suy giảm nghiêm trọng của quá trình quang hợp.',
        isCompleted: !!completedMissions['s2'],
        hint: 'Chọn kính lọc "Xanh lục (Green)"',
      },
      {
        id: 's3',
        title: 'Kiểm tra Oxy bằng Que đóm',
        description: 'Thu thập đủ lượng khí O2 trong ống nghiệm và ấn nút thử que đóm để tạo ngọn lửa bùng cháy.',
        isCompleted: !!completedMissions['s3'],
        hint: 'Chờ khí O2 đạt > 25% rồi bấm "Đưa que đóm vào thử"',
      },
    ],
    hydrotropism: [
      {
        id: 'h1',
        title: 'Tạo chênh lệch độ ẩm',
        description: 'Đặt nguồn nước sang bên trái hoặc bên phải để quan sát rễ bắt đầu uốn cong.',
        isCompleted: !!completedMissions['h1'],
        hint: 'Chọn vị trí nguồn nước là "Bên trái" hoặc "Bên phải"',
      },
      {
        id: 'h2',
        title: 'Thí nghiệm đối chứng trọng lực',
        description: 'Xoay hộp thí nghiệm ngang 90° để khảo sát cuộc cạnh tranh giữa hướng trọng lực và hướng nước.',
        isCompleted: !!completedMissions['h2'],
        hint: 'Bấm nút "Xoay ngang hộp 90°"',
      },
      {
        id: 'h3',
        title: 'Quan sát Thạch lạp (Statoliths)',
        description: 'Bật chế độ X-Ray chóp rễ để thấy các hạt tinh bột thạch lạp cảm nhận trọng trường.',
        isCompleted: !!completedMissions['h3'],
        hint: 'Bật toggle "X-Ray Thạch Lạp chóp rễ"',
      },
    ],
  };

  return (
    <div className="flex flex-col h-full bg-white/95 border border-slate-200/90 rounded-2xl overflow-hidden shadow-xl shadow-slate-200/50 backdrop-blur-xl text-slate-800">
      {/* Tab Navigation */}
      <div className="flex border-b border-slate-200/90 bg-slate-50/90 p-1.5 gap-1 overflow-x-auto custom-scrollbar">
        <button
          onClick={() => setActiveTab('controls')}
          className={`flex-1 py-2 px-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1 cursor-pointer whitespace-nowrap ${
            activeTab === 'controls'
              ? 'bg-white text-emerald-700 border border-slate-200/90 shadow-xs font-bold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 font-medium'
          }`}
        >
          <span>🎛️</span> Điều khiển
        </button>

        <button
          onClick={() => setActiveTab('inquiry')}
          className={`flex-1 py-2 px-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1 cursor-pointer whitespace-nowrap ${
            activeTab === 'inquiry'
              ? 'bg-white text-indigo-700 border border-slate-200/90 shadow-xs font-bold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 font-medium'
          }`}
        >
          <span>🔬</span> Nghiên cứu
        </button>

        <button
          onClick={() => setActiveTab('analytics')}
          className={`flex-1 py-2 px-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1 cursor-pointer whitespace-nowrap ${
            activeTab === 'analytics'
              ? 'bg-white text-sky-700 border border-slate-200/90 shadow-xs font-bold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 font-medium'
          }`}
        >
          <span>📈</span> Số liệu
        </button>

        <button
          onClick={() => setActiveTab('mechanism')}
          className={`flex-1 py-2 px-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1 cursor-pointer whitespace-nowrap ${
            activeTab === 'mechanism'
              ? 'bg-white text-amber-700 border border-slate-200/90 shadow-xs font-bold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 font-medium'
          }`}
        >
          <span>🧬</span> Cơ chế
        </button>

        <button
          onClick={() => setActiveTab('missions')}
          className={`flex-1 py-2 px-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1 cursor-pointer whitespace-nowrap ${
            activeTab === 'missions'
              ? 'bg-white text-purple-700 border border-slate-200/90 shadow-xs font-bold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 font-medium'
          }`}
        >
          <span>🎯</span> Thử thách
        </button>
      </div>

      {/* Tab Contents */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {/* TAB 1: CONTROLS */}
        {activeTab === 'controls' && (
          <div className="space-y-4">
            {/* LAB 1: PHOTOTROPISM CONTROLS */}
            {activeLab === 'phototropism' && (
              <>
                {/* Light Angle Slider */}
                <div className="space-y-2 bg-slate-50/80 p-3.5 rounded-xl border border-slate-200/90 shadow-xs">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-700">Góc xoay nguồn sáng (Đèn)</span>
                    <span className="font-mono text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200/80 font-bold">{photoState.lightAngle}°</span>
                  </div>
                  <input
                    type="range"
                    min="-60"
                    max="60"
                    step="5"
                    value={photoState.lightAngle}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      onUpdatePhotoState((prev) => ({ ...prev, lightAngle: val }));
                    }}
                    className="w-full accent-amber-600 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 font-medium">
                    <span>-60° (Trái)</span>
                    <span>0° (Đỉnh đầu)</span>
                    <span>+60° (Phải)</span>
                  </div>
                </div>

                {/* Light Intensity */}
                <div className="space-y-2 bg-slate-50/80 p-3.5 rounded-xl border border-slate-200/90 shadow-xs">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-700">Cường độ ánh sáng</span>
                    <span className="font-mono text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-200/80 font-bold">{photoState.lightIntensity}%</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    step="5"
                    value={photoState.lightIntensity}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      onUpdatePhotoState((prev) => ({ ...prev, lightIntensity: val }));
                    }}
                    className="w-full accent-sky-600 cursor-pointer"
                  />
                </div>

                {/* Light Spectrum / Color */}
                <div className="space-y-2 bg-slate-50/80 p-3.5 rounded-xl border border-slate-200/90 shadow-xs">
                  <label className="text-xs font-bold text-slate-700">Quang phổ ánh sáng (Màu đèn)</label>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { id: 'white', label: 'Trắng', activeClass: 'bg-white text-slate-900 border-slate-400 font-bold shadow-xs' },
                      { id: 'blue', label: 'Xanh lam', activeClass: 'bg-sky-100 text-sky-800 border-sky-400 font-bold shadow-xs' },
                      { id: 'red', label: 'Đỏ', activeClass: 'bg-rose-100 text-rose-800 border-rose-400 font-bold shadow-xs' },
                      { id: 'off', label: 'Tắt đèn', activeClass: 'bg-slate-200 text-slate-700 border-slate-400 font-bold shadow-xs' },
                    ].map((c) => (
                      <button
                        key={c.id}
                        onClick={() =>
                          onUpdatePhotoState((prev) => ({
                            ...prev,
                            lightColor: c.id as PhototropismState['lightColor'],
                          }))
                        }
                        className={`py-1.5 px-2 rounded-lg text-xs border transition cursor-pointer ${
                          photoState.lightColor === c.id
                            ? `${c.activeClass} ring-2 ring-emerald-500/30`
                            : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        {c.label}
                      </button>
                    ))}
                  </div>
                  <p className="text-[10px] text-slate-500 font-medium">
                    💡 Sắc tố Phototropin hấp thụ mạnh nhất ánh sáng xanh lam (400-500 nm).
                  </p>
                </div>

                {/* Plant Treatment (Darwin Experiments) */}
                <div className="space-y-2 bg-slate-50/80 p-3.5 rounded-xl border border-slate-200/90 shadow-xs">
                  <label className="text-xs font-bold text-slate-700">
                    Thí nghiệm kinh điển (Darwin & Boysen-Jensen)
                  </label>
                  <select
                    value={photoState.plantTreatment}
                    onChange={(e) =>
                      onUpdatePhotoState((prev) => ({
                        ...prev,
                        plantTreatment: e.target.value as PhototropismState['plantTreatment'],
                      }))
                    }
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 font-medium focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 shadow-xs cursor-pointer"
                  >
                    <option value="normal">1. Cây nguyên vẹn (Đối chứng)</option>
                    <option value="decapitated">2. Cắt bỏ chóp ngọn (Decapitated)</option>
                    <option value="opaque_cap">3. Chùm mũ đen che chóp ngọn (Opaque Cap)</option>
                    <option value="transparent_cap">4. Chùm mũ trong suốt che ngọn (Transparent Cap)</option>
                    <option value="agar_block">5. Chèn miếng thạch Agar dưới chóp</option>
                    <option value="mica_insert">6. Chèn phiến Mica cản auxin</option>
                  </select>
                </div>

                {/* X-Ray Auxin Toggle */}
                <div className="flex items-center justify-between bg-amber-50/80 p-3.5 rounded-xl border border-amber-200 shadow-xs">
                  <div>
                    <div className="text-xs font-bold text-amber-900">Chế độ X-Ray Phân tử Auxin</div>
                    <div className="text-[10px] text-amber-700 font-medium">Hiển thị các hạt hormone dồn về phía tối</div>
                  </div>
                  <button
                    onClick={() => onUpdatePhotoState((prev) => ({ ...prev, xrayMode: !prev.xrayMode }))}
                    className={`w-12 h-6 flex items-center rounded-full p-1 transition cursor-pointer ${
                      photoState.xrayMode ? 'bg-amber-500 justify-end' : 'bg-slate-300 justify-start'
                    }`}
                  >
                    <span className="w-4 h-4 rounded-full bg-white shadow-md transform transition" />
                  </button>
                </div>
              </>
            )}

            {/* LAB 2: PHOTOSYNTHESIS CONTROLS */}
            {activeLab === 'photosynthesis' && (
              <>
                {/* Lamp Distance */}
                <div className="space-y-2 bg-slate-50/80 p-3.5 rounded-xl border border-slate-200/90 shadow-xs">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-700">Khoảng cách đèn chiếu sáng</span>
                    <span className="font-mono text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200/80 font-bold">{synthState.lampDistance} cm</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    step="5"
                    value={synthState.lampDistance}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      onUpdateSynthState((prev) => ({ ...prev, lampDistance: val }));
                    }}
                    className="w-full accent-amber-600 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 font-medium">
                    <span>10 cm (Gần - Quang hợp mạnh)</span>
                    <span>100 cm (Xa)</span>
                  </div>
                </div>

                {/* CO2 Concentration (NaHCO3) */}
                <div className="space-y-2 bg-slate-50/80 p-3.5 rounded-xl border border-slate-200/90 shadow-xs">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-700">Nồng độ CO₂ bổ sung (Dung dịch NaHCO₃)</span>
                    <span className="font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/80 font-bold">{synthState.co2Concentration}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="4.0"
                    step="0.5"
                    value={synthState.co2Concentration}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      onUpdateSynthState((prev) => ({ ...prev, co2Concentration: val }));
                    }}
                    className="w-full accent-emerald-600 cursor-pointer"
                  />
                  <p className="text-[10px] text-slate-500 font-medium">
                    NaHCO₃ cung cấp ion HCO₃⁻ phân li giải phóng CO₂ hòa tan trong nước cho cành rong.
                  </p>
                </div>

                {/* Water Temperature */}
                <div className="space-y-2 bg-slate-50/80 p-3.5 rounded-xl border border-slate-200/90 shadow-xs">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-700">Nhiệt độ nước trong bể</span>
                    <span className={`font-mono font-bold px-2 py-0.5 rounded border ${
                      synthState.waterTemperature > 40
                        ? 'text-rose-700 bg-rose-50 border-rose-200'
                        : 'text-cyan-700 bg-cyan-50 border-cyan-200'
                    }`}>
                      {synthState.waterTemperature}°C {synthState.waterTemperature > 40 && '(Quá nóng!)'}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="50"
                    step="1"
                    value={synthState.waterTemperature}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      onUpdateSynthState((prev) => ({ ...prev, waterTemperature: val }));
                    }}
                    className="w-full accent-cyan-600 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 font-medium">
                    <span>5°C (Lạnh)</span>
                    <span>30°C (Tối ưu)</span>
                    <span>50°C (Biến tính)</span>
                  </div>
                </div>

                {/* Color Filter */}
                <div className="space-y-2 bg-slate-50/80 p-3.5 rounded-xl border border-slate-200/90 shadow-xs">
                  <label className="text-xs font-bold text-slate-700">Kính lọc màu quang phổ</label>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { id: 'white', label: 'Trắng', activeClass: 'bg-white text-slate-900 border-slate-400 font-bold' },
                      { id: 'blue', label: 'Xanh lam', activeClass: 'bg-sky-100 text-sky-800 border-sky-400 font-bold' },
                      { id: 'red', label: 'Đỏ', activeClass: 'bg-rose-100 text-rose-800 border-rose-400 font-bold' },
                      { id: 'green', label: 'Xanh lục', activeClass: 'bg-emerald-100 text-emerald-800 border-emerald-400 font-bold' },
                    ].map((f) => (
                      <button
                        key={f.id}
                        onClick={() =>
                          onUpdateSynthState((prev) => ({
                            ...prev,
                            colorFilter: f.id as PhotosynthesisState['colorFilter'],
                          }))
                        }
                        className={`py-1.5 px-2 rounded-lg text-xs border transition cursor-pointer ${
                          synthState.colorFilter === f.id
                            ? `${f.activeClass} ring-2 ring-emerald-500/30 shadow-xs`
                            : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Glowing Splint Combustion Test Button */}
                <div className="p-3.5 rounded-xl bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 border border-amber-200/90 shadow-sm space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-amber-900">Thí nghiệm Thử que đóm cháy bùng</div>
                      <div className="text-[10px] text-amber-800 font-semibold">Khí O₂ thu được: {Math.round(synthState.collectedO2Volume)}%</div>
                    </div>
                    <button
                      onClick={() => {
                        onUpdateSynthState((prev) => ({
                          ...prev,
                          glowingSplintActive: true,
                          splintBurstEffect: prev.collectedO2Volume >= 25,
                        }));
                        setTimeout(() => {
                          onUpdateSynthState((prev) => ({ ...prev, glowingSplintActive: false }));
                        }, 4000);
                      }}
                      disabled={synthState.glowingSplintActive}
                      className="px-3.5 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold text-xs rounded-xl hover:from-amber-600 hover:to-orange-600 shadow-md shadow-orange-500/20 disabled:opacity-50 transition cursor-pointer"
                    >
                      🔥 Thử que đóm
                    </button>
                  </div>
                  {synthState.collectedO2Volume < 25 && (
                    <p className="text-[10px] text-amber-800 font-medium">
                      ⚠️ Cần thu thập ít nhất 25% thể tích khí Oxy để tàn đóm bùng cháy.
                    </p>
                  )}
                </div>

                {/* Reset Gas Tube Button */}
                <button
                  onClick={() => onUpdateSynthState((prev) => ({ ...prev, collectedO2Volume: 0 }))}
                  className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs border border-slate-200 transition shadow-xs cursor-pointer"
                >
                  🔄 Đổ đầy nước / Đặt lại ống nghiệm
                </button>

                {/* Quick Presets for Photosynthesis */}
                <div className="space-y-1.5 bg-slate-50/80 p-3 rounded-xl border border-slate-200/90 shadow-xs">
                  <div className="text-[11px] font-bold text-slate-700">⚡ Kịch bản thí nghiệm nhanh (Presets)</div>
                  <div className="grid grid-cols-2 gap-1.5 text-[10px]">
                    <button
                      onClick={() => onUpdateSynthState((prev) => ({
                        ...prev,
                        lampDistance: 15,
                        co2Concentration: 2.5,
                        waterTemperature: 28,
                        colorFilter: 'white',
                      }))}
                      className="p-1.5 rounded-lg border border-emerald-300 bg-emerald-50 text-emerald-800 font-bold hover:bg-emerald-100 transition cursor-pointer text-left"
                    >
                      🌟 Tối ưu quang hợp (Mạnh)
                    </button>
                    <button
                      onClick={() => onUpdateSynthState((prev) => ({
                        ...prev,
                        colorFilter: 'green',
                      }))}
                      className="p-1.5 rounded-lg border border-lime-300 bg-lime-50 text-lime-800 font-bold hover:bg-lime-100 transition cursor-pointer text-left"
                    >
                      🍃 Kính lọc màu lục (Tê liệt)
                    </button>
                    <button
                      onClick={() => onUpdateSynthState((prev) => ({
                        ...prev,
                        waterTemperature: 46,
                      }))}
                      className="p-1.5 rounded-lg border border-rose-300 bg-rose-50 text-rose-800 font-bold hover:bg-rose-100 transition cursor-pointer text-left"
                    >
                      🔥 Quá nhiệt biến tính (46°C)
                    </button>
                    <button
                      onClick={() => onUpdateSynthState((prev) => ({
                        ...prev,
                        co2Concentration: 0,
                      }))}
                      className="p-1.5 rounded-lg border border-amber-300 bg-amber-50 text-amber-800 font-bold hover:bg-amber-100 transition cursor-pointer text-left"
                    >
                      🌑 Thiếu hụt CO₂ (0%)
                    </button>
                  </div>
                </div>

                {/* Dynamic Multi-Factor Relationship Map & Causality Diagram */}
                <PhotosynthesisRelationshipMap
                  state={synthState}
                  onUpdateState={onUpdateSynthState}
                />
              </>
            )}

            {/* LAB 3: HYDROTROPISM CONTROLS */}
            {activeLab === 'hydrotropism' && (
              <>
                {/* Water Source Position */}
                <div className="space-y-2 bg-slate-50/80 p-3.5 rounded-xl border border-slate-200/90 shadow-xs">
                  <label className="text-xs font-bold text-slate-700">Vị trí đặt nguồn cấp ẩm (Nước)</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'left', label: 'Bên trái 💧' },
                      { id: 'bottom', label: 'Ở đáy chậu' },
                      { id: 'right', label: 'Bên phải 💧' },
                    ].map((pos) => (
                      <button
                        key={pos.id}
                        onClick={() =>
                          onUpdateHydroState((prev) => ({
                            ...prev,
                            waterSourcePos: pos.id as HydrotropismState['waterSourcePos'],
                            soilMoistureLeft: pos.id === 'left' ? 85 : pos.id === 'bottom' ? 70 : 20,
                            soilMoistureRight: pos.id === 'right' ? 85 : pos.id === 'bottom' ? 70 : 20,
                          }))
                        }
                        className={`py-2 px-2 rounded-xl text-xs border transition cursor-pointer ${
                          hydroState.waterSourcePos === pos.id
                            ? 'bg-emerald-100 border-emerald-500 text-emerald-800 font-bold ring-2 ring-emerald-500/20 shadow-xs'
                            : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-100 font-medium'
                        }`}
                      >
                        {pos.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Soil Moisture Sliders (Left & Right) */}
                <div className="space-y-2.5 bg-slate-50/80 p-3.5 rounded-xl border border-slate-200/90 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700">Độ ẩm đất 2 bên hộp Rhizotron</span>
                    <span className="text-[10px] text-slate-500 font-semibold">Tạo chênh lệch ẩm</span>
                  </div>

                  {/* Left Moisture */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="font-semibold text-slate-600">Độ ẩm phía Trái:</span>
                      <span className="font-mono font-bold text-sky-700 bg-sky-50 px-1.5 py-0.5 rounded border border-sky-200">{hydroState.soilMoistureLeft}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="5"
                      value={hydroState.soilMoistureLeft}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        onUpdateHydroState((prev) => ({ ...prev, soilMoistureLeft: val }));
                      }}
                      className="w-full accent-sky-600 cursor-pointer h-1.5"
                    />
                  </div>

                  {/* Right Moisture */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="font-semibold text-slate-600">Độ ẩm phía Phải:</span>
                      <span className="font-mono font-bold text-sky-700 bg-sky-50 px-1.5 py-0.5 rounded border border-sky-200">{hydroState.soilMoistureRight}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="5"
                      value={hydroState.soilMoistureRight}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        onUpdateHydroState((prev) => ({ ...prev, soilMoistureRight: val }));
                      }}
                      className="w-full accent-sky-600 cursor-pointer h-1.5"
                    />
                  </div>
                </div>

                {/* Turn Chamber 90 Degrees (Gravitropism competition) */}
                <div className="space-y-2 bg-slate-50/80 p-3.5 rounded-xl border border-slate-200/90 shadow-xs">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-700">Xoay hộp thí nghiệm (Thử nghiệm trọng lực)</span>
                    <span className="font-mono text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200/80 font-bold">{hydroState.boxRotation}°</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => onUpdateHydroState((prev) => ({ ...prev, boxRotation: 0 }))}
                      className={`py-2 px-3 rounded-xl text-xs border transition cursor-pointer ${
                        hydroState.boxRotation === 0
                          ? 'bg-sky-100 border-sky-400 text-sky-800 font-bold ring-2 ring-sky-500/20 shadow-xs'
                          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-100 font-medium'
                      }`}
                    >
                      Đặt thẳng đứng (0°)
                    </button>
                    <button
                      onClick={() => onUpdateHydroState((prev) => ({ ...prev, boxRotation: 90 }))}
                      className={`py-2 px-3 rounded-xl text-xs border transition cursor-pointer ${
                        hydroState.boxRotation === 90
                          ? 'bg-amber-100 border-amber-400 text-amber-800 font-bold ring-2 ring-amber-500/20 shadow-xs'
                          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-100 font-medium'
                      }`}
                    >
                      Xoay ngang (90°)
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-500 font-medium">
                    Khi xoay ngang 90°, hướng trọng lực kích hoạt kéo rễ cắm xuống, đối kháng hoặc hợp lực với hướng nước!
                  </p>
                </div>

                {/* X-Ray Statoliths Toggle */}
                <div className="flex items-center justify-between bg-sky-50/80 p-3.5 rounded-xl border border-sky-200 shadow-xs">
                  <div>
                    <div className="text-xs font-bold text-sky-900">X-Ray Thạch Lạp (Statoliths) chóp rễ</div>
                    <div className="text-[10px] text-sky-700 font-medium">Các hạt tinh bột lắng đọng cảm nhận gia tốc</div>
                  </div>
                  <button
                    onClick={() =>
                      onUpdateHydroState((prev) => ({ ...prev, xrayStatoliths: !prev.xrayStatoliths }))
                    }
                    className={`w-12 h-6 flex items-center rounded-full p-1 transition cursor-pointer ${
                      hydroState.xrayStatoliths ? 'bg-sky-500 justify-end' : 'bg-slate-300 justify-start'
                    }`}
                  >
                    <span className="w-4 h-4 rounded-full bg-white shadow-md transform transition" />
                  </button>
                </div>

                {/* Quick Presets for Hydrotropism */}
                <div className="space-y-1.5 bg-slate-50/80 p-3 rounded-xl border border-slate-200/90 shadow-xs">
                  <div className="text-[11px] font-bold text-slate-700">⚡ Kịch bản thí nghiệm nhanh (Presets)</div>
                  <div className="grid grid-cols-2 gap-1.5 text-[10px]">
                    <button
                      onClick={() => onUpdateHydroState((prev) => ({
                        ...prev,
                        waterSourcePos: 'left',
                        soilMoistureLeft: 90,
                        soilMoistureRight: 15,
                        boxRotation: 0,
                      }))}
                      className="p-1.5 rounded-lg border border-sky-300 bg-sky-50 text-sky-800 font-bold hover:bg-sky-100 transition cursor-pointer text-left"
                    >
                      💧 Lệch ẩm bên trái (90%)
                    </button>
                    <button
                      onClick={() => onUpdateHydroState((prev) => ({
                        ...prev,
                        waterSourcePos: 'right',
                        soilMoistureLeft: 15,
                        soilMoistureRight: 90,
                        boxRotation: 0,
                      }))}
                      className="p-1.5 rounded-lg border border-sky-300 bg-sky-50 text-sky-800 font-bold hover:bg-sky-100 transition cursor-pointer text-left"
                    >
                      💧 Lệch ẩm bên phải (90%)
                    </button>
                    <button
                      onClick={() => onUpdateHydroState((prev) => ({
                        ...prev,
                        boxRotation: 90,
                      }))}
                      className="p-1.5 rounded-lg border border-amber-300 bg-amber-50 text-amber-800 font-bold hover:bg-amber-100 transition cursor-pointer text-left"
                    >
                      🔄 Xoay ngang 90° (Cạnh tranh)
                    </button>
                    <button
                      onClick={() => onUpdateHydroState((prev) => ({
                        ...prev,
                        waterSourcePos: 'bottom',
                        soilMoistureLeft: 80,
                        soilMoistureRight: 80,
                        boxRotation: 0,
                      }))}
                      className="p-1.5 rounded-lg border border-emerald-300 bg-emerald-50 text-emerald-800 font-bold hover:bg-emerald-100 transition cursor-pointer text-left"
                    >
                      🌱 Cấp ẩm đáy chậu (Thẳng đứng)
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* TAB: GUIDED SCIENTIFIC INQUIRY (Nghiên cứu & Giả thuyết) */}
        {activeTab === 'inquiry' && (
          <div className="space-y-4">
            {/* Header intro */}
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 border border-indigo-200/80 space-y-1.5 shadow-xs">
              <div className="flex items-center gap-2 text-indigo-900 font-bold text-xs uppercase tracking-wider">
                <span className="text-base">🔬</span> Phương Pháp Nghiên Cứu Khoa Học
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Học sinh tự chọn <strong>giả thuyết</strong>, <strong>dự đoán</strong> kết quả trước khi chạy mô phỏng, sau đó <strong>đối chiếu với thực tế</strong> và <strong>phân tích nguyên nhân</strong> cơ chế tế bào.
              </p>
            </div>

            {/* Topic Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <span>📌</span> Chọn Câu Hỏi Nghiên Cứu:
              </label>
              <div className="grid grid-cols-1 gap-1.5">
                {currentTopics.map((topic) => {
                  const isTopicActive = (selectedTopicIdByLab[activeLab] || currentTopics[0].id) === topic.id;
                  return (
                    <button
                      key={topic.id}
                      onClick={() => {
                        setSelectedTopicIdByLab((prev) => ({ ...prev, [activeLab]: topic.id }));
                        setInquirySaved(false);
                      }}
                      className={`p-2.5 rounded-xl text-left border transition cursor-pointer flex items-center justify-between text-xs ${
                        isTopicActive
                          ? 'bg-indigo-50 border-indigo-400 text-indigo-950 font-bold ring-2 ring-indigo-500/20 shadow-xs'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <span>{topic.title}</span>
                      {isTopicActive && <span className="text-indigo-600 font-bold text-xs">● Đang xét</span>}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Problem Statement Card */}
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <div className="text-[10px] uppercase font-bold text-indigo-600 tracking-wider">Câu hỏi nghiên cứu:</div>
              <div className="text-xs font-extrabold text-slate-900 leading-snug">{currentTopic.question}</div>
              <p className="text-[11px] text-slate-500 italic">Bối cảnh: {currentTopic.context}</p>
            </div>

            {/* Step 1: Formulate Hypothesis */}
            <div className="space-y-2 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-[10px] flex items-center justify-center font-bold">1</span>
                  Đặt Giả Thuyết Khoa Học (Hypothesis):
                </span>
              </div>
              <p className="text-[10px] text-slate-500">Em hãy chọn giả thuyết mà mình cho là hợp lý nhất để kiểm chứng:</p>

              <div className="space-y-1.5 pt-1">
                {currentTopic.hypotheses.map((h) => {
                  const isSelected = selectedHypothesis[currentTopic.id] === h.id;
                  return (
                    <button
                      key={h.id}
                      onClick={() => setSelectedHypothesis((prev) => ({ ...prev, [currentTopic.id]: h.id }))}
                      className={`w-full text-left p-2.5 rounded-xl text-xs border transition cursor-pointer flex items-start gap-2 ${
                        isSelected
                          ? 'bg-indigo-100 border-indigo-500 text-indigo-950 font-bold ring-1 ring-indigo-400'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <span className={`w-4 h-4 rounded-full mt-0.5 border flex items-center justify-center text-[10px] ${isSelected ? 'bg-indigo-600 text-white border-indigo-600' : 'border-slate-300'}`}>
                        {isSelected ? '✓' : ''}
                      </span>
                      <span className="flex-1 leading-relaxed">{h.text}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 2: Prediction */}
            <div className="space-y-2 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-[10px] flex items-center justify-center font-bold">2</span>
                  Dự Đoán Kết Quả Thực Nghiệm (Prediction):
                </span>
              </div>

              <div className="space-y-1.5 pt-1">
                {currentTopic.predictions.map((p) => {
                  const isSelected = selectedPrediction[currentTopic.id] === p.id;
                  return (
                    <button
                      key={p.id}
                      onClick={() => setSelectedPrediction((prev) => ({ ...prev, [currentTopic.id]: p.id }))}
                      className={`w-full text-left p-2.5 rounded-xl text-xs border transition cursor-pointer flex items-start gap-2 ${
                        isSelected
                          ? 'bg-purple-100 border-purple-500 text-purple-950 font-bold ring-1 ring-purple-400'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <span className={`w-4 h-4 rounded-full mt-0.5 border flex items-center justify-center text-[10px] ${isSelected ? 'bg-purple-600 text-white border-purple-600' : 'border-slate-300'}`}>
                        {isSelected ? '✓' : ''}
                      </span>
                      <span className="flex-1 leading-relaxed">{p.text}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 3: Live Evidence & Comparison */}
            <div className="space-y-2 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-[10px] flex items-center justify-center font-bold">3</span>
                  Đối Chiếu Dữ Liệu Thực Nghiệm 3D:
                </span>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Thời Gian Thực
                </span>
              </div>

              {activeLab === 'phototropism' && (
                <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                  <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                    <div className="text-[10px] text-slate-500 font-semibold">Góc nguồn sáng (Đèn):</div>
                    <div className="font-mono text-base font-bold text-amber-600">{photoState.lightAngle}°</div>
                  </div>
                  <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                    <div className="text-[10px] text-slate-500 font-semibold">Góc uốn thân thực tế:</div>
                    <div className="font-mono text-base font-bold text-emerald-600">{photoCurrentAngle}°</div>
                  </div>
                  <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                    <div className="text-[10px] text-slate-500 font-semibold">Phương pháp xử lý:</div>
                    <div className="text-[11px] font-bold text-slate-800 truncate">{photoState.plantTreatment}</div>
                  </div>
                  <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                    <div className="text-[10px] text-slate-500 font-semibold">Màu quang phổ:</div>
                    <div className="text-[11px] font-bold text-sky-600 uppercase">{photoState.lightColor}</div>
                  </div>
                </div>
              )}

              {activeLab === 'photosynthesis' && (
                <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                  <div className="p-2 bg-white rounded-xl border border-slate-200">
                    <div className="text-[10px] text-slate-500 font-semibold">Khoảng cách đèn:</div>
                    <div className="font-mono text-sm font-bold text-amber-600">{synthState.lampDistance} cm</div>
                  </div>
                  <div className="p-2 bg-white rounded-xl border border-slate-200">
                    <div className="text-[10px] text-slate-500 font-semibold">Nồng độ CO₂ (NaHCO₃):</div>
                    <div className="font-mono text-sm font-bold text-cyan-600">{synthState.co2Concentration}%</div>
                  </div>
                  <div className="p-2 bg-white rounded-xl border border-slate-200">
                    <div className="text-[10px] text-slate-500 font-semibold">Nhiệt độ nước:</div>
                    <div className="font-mono text-sm font-bold text-teal-600">{synthState.waterTemperature}°C</div>
                  </div>
                  <div className="p-2 bg-white rounded-xl border border-slate-200">
                    <div className="text-[10px] text-slate-500 font-semibold">Kính lọc quang phổ:</div>
                    <div className="font-bold text-purple-600 uppercase text-xs">{synthState.colorFilter}</div>
                  </div>
                  <div className="col-span-2 p-2.5 bg-cyan-50/80 rounded-xl border border-cyan-200">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-cyan-900">Tốc độ bọt khí O₂ (lá & cuống):</span>
                      <span className="text-base font-black text-cyan-700 font-mono">{synthState.bubblesPerMinute} bọt/phút</span>
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-cyan-800 mt-1">
                      <span>Thể tích O₂ tích lũy trong ống:</span>
                      <strong className="font-mono">{Math.round(synthState.collectedO2Volume)}%</strong>
                    </div>
                  </div>
                </div>
              )}

              {activeLab === 'hydrotropism' && (
                <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                  <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                    <div className="text-[10px] text-slate-500 font-semibold">Vị trí nguồn ẩm:</div>
                    <div className="font-bold text-sky-700">
                      {hydroState.waterSourcePos === 'left' ? 'Bên trái 💧' : hydroState.waterSourcePos === 'right' ? 'Bên phải 💧' : 'Ở đáy chậu'}
                    </div>
                  </div>
                  <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                    <div className="text-[10px] text-slate-500 font-semibold">Góc uốn rễ thực tế:</div>
                    <div className="font-mono text-base font-bold text-emerald-600">{hydroCurrentAngle}°</div>
                  </div>
                  <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                    <div className="text-[10px] text-slate-500 font-semibold">Góc xoay hộp (Trọng lực):</div>
                    <div className="font-mono text-sm font-bold text-amber-600">{hydroState.boxRotation}° ({hydroState.boxRotation === 90 ? 'Xoay ngang' : 'Đứng thẳng'})</div>
                  </div>
                  <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                    <div className="text-[10px] text-slate-500 font-semibold">X-Ray Thạch lạp:</div>
                    <div className={`font-mono text-xs font-bold ${hydroState.xrayStatoliths ? 'text-emerald-600' : 'text-slate-500'}`}>
                      {hydroState.xrayStatoliths ? 'Đang bật ✓' : 'Tắt'}
                    </div>
                  </div>
                </div>
              )}

              <button
                onClick={() => {
                  setInquiryChecked((prev) => ({ ...prev, [currentTopic.id]: true }));
                  triggerConfetti();
                }}
                disabled={!selectedHypothesis[currentTopic.id]}
                className="w-full py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold text-xs rounded-xl shadow-md transition disabled:opacity-50 cursor-pointer mt-1"
              >
                🔍 Kiểm Chứng Giả Thuyết & Luận Giải
              </button>

              {inquiryChecked[currentTopic.id] && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1.5 animate-in fade-in duration-200">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-900">
                    <span>✅</span> Kết Luận Kiểm Chứng Thực Nghiệm:
                  </div>
                  <p className="text-[11px] text-emerald-800 leading-relaxed font-medium">
                    {selectedHypothesis[currentTopic.id] === currentTopic.hypotheses.find((h) => h.isSupported)?.id
                      ? activeLab === 'photosynthesis'
                        ? 'Tuyệt vời! Dữ liệu thực nghiệm 3D đã chứng minh giả thuyết của bạn hoàn toàn chính xác. Tốc độ quang hợp giải phóng bọt khí O₂ từ phiến lá và cuống phản ánh chính xác hoạt động của pha sáng và chu trình Calvin dưới các yếu tố môi trường.'
                        : activeLab === 'hydrotropism'
                        ? 'Tuyệt vời! Dữ liệu thực nghiệm 3D đã chứng minh giả thuyết của bạn hoàn toàn chính xác. Rễ cây biểu hiện tính hướng nước dương rõ nét dưới sự điều hòa bất đối xứng của Auxin và thụ thể MIZ1.'
                        : 'Tuyệt vời! Dữ liệu thực nghiệm 3D đã chứng minh giả thuyết của bạn hoàn toàn chính xác. Thân cây uốn cong sinh học do sự tái phân bố hoocmôn Auxin dồn về phía tối.'
                      : activeLab === 'photosynthesis'
                      ? 'Kết quả quan sát 3D cho thấy giả thuyết này bị bác bỏ. Quá trình quang hợp giải phóng khí O₂ bị chi phối chặt chẽ bởi quang phổ, cường độ photon, nồng độ CO₂ và ngưỡng nhiệt độ của enzyme.'
                      : activeLab === 'hydrotropism'
                      ? 'Kết quả quan sát 3D cho thấy giả thuyết này bị bác bỏ. Rễ cây thực tế đã uốn cong theo cơ chế hướng nước dương và tương tác vector với trọng lực.'
                      : 'Kết quả quan sát 3D cho thấy giả thuyết này bị bác bỏ. Thân cây thực tế đã uốn cong theo cơ chế hướng sáng dương dưới sự điều hòa của Auxin.'}
                  </p>
                </div>
              )}
            </div>

            {/* Step 4: Causal Analysis Questions */}
            <div className="space-y-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-[10px] flex items-center justify-center font-bold">4</span>
                  Câu Hỏi Gợi Mở & Phân Tích Nguyên Nhân:
                </span>
              </div>

              <div className="space-y-3">
                {currentTopic.inquiryQuestions.map((q, idx) => (
                  <div key={q.id} className="p-3 bg-white rounded-xl border border-slate-200 space-y-2">
                    <div className="text-xs font-bold text-slate-900 leading-snug">
                      <span className="text-indigo-600">Câu {idx + 1}:</span> {q.question}
                    </div>

                    <div className="space-y-1.5">
                      {q.options.map((opt, optIdx) => {
                        const isAnsSelected = inquiryAnswerSelected[q.id] === optIdx;
                        let btnStyle = 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50';

                        if (isAnsSelected) {
                          btnStyle = optIdx === q.correctIndex
                            ? 'bg-emerald-50 border-emerald-500 text-emerald-900 font-bold ring-1 ring-emerald-300'
                            : 'bg-rose-50 border-rose-300 text-rose-800';
                        }

                        return (
                          <button
                            key={optIdx}
                            onClick={() => setInquiryAnswerSelected((prev) => ({ ...prev, [q.id]: optIdx }))}
                            className={`w-full text-left p-2 rounded-lg text-xs border transition flex items-center justify-between cursor-pointer ${btnStyle}`}
                          >
                            <span>{opt}</span>
                            {isAnsSelected && optIdx === q.correctIndex && <span>✓</span>}
                          </button>
                        );
                      })}
                    </div>

                    {inquiryAnswerSelected[q.id] !== undefined && (
                      <div className="text-[11px] text-slate-700 bg-amber-50/80 p-2.5 rounded-lg border border-amber-200 leading-relaxed font-medium">
                        💡 <strong>Cơ chế sinh học:</strong> {q.explanation}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Real World Application */}
              <div className="p-3.5 rounded-2xl bg-purple-50/80 border border-purple-200/90 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="text-[11px] font-bold text-purple-900 flex items-center gap-1.5">
                    <span>🌍</span> Vận Dụng Đời Sống Thực Tiễn:
                  </div>
                  {/* Click to reveal button: "Giải đáp" */}
                  <button
                    onClick={() =>
                      setShowRealWorldInsight((prev) => ({
                        ...prev,
                        [currentTopic.id]: !prev[currentTopic.id],
                      }))
                    }
                    className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border transition flex items-center gap-1.5 cursor-pointer shadow-xs ${
                      showRealWorldInsight[currentTopic.id]
                        ? 'bg-purple-200/80 text-purple-950 border-purple-300 hover:bg-purple-200'
                        : 'bg-white text-purple-700 border-purple-300 hover:bg-purple-100 hover:text-purple-900'
                    }`}
                  >
                    <span>{showRealWorldInsight[currentTopic.id] ? '🔒' : '💡'}</span>
                    <span>{showRealWorldInsight[currentTopic.id] ? 'Ẩn giải đáp' : 'Giải đáp'}</span>
                  </button>
                </div>

                <div className="text-xs font-semibold text-slate-800 leading-snug">
                  {currentTopic.realWorld.question}
                </div>

                {/* Thought input for students before seeing answer */}
                {!showRealWorldInsight[currentTopic.id] && (
                  <div className="space-y-1 pt-0.5">
                    <input
                      type="text"
                      placeholder="Ghi chú suy nghĩ hoặc câu trả lời của bạn..."
                      value={studentUserNotes[currentTopic.id] || ''}
                      onChange={(e) =>
                        setStudentUserNotes((prev) => ({
                          ...prev,
                          [currentTopic.id]: e.target.value,
                        }))
                      }
                      className="w-full text-xs px-2.5 py-1.5 bg-white border border-purple-200 rounded-lg text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400"
                    />
                    <p className="text-[10px] text-purple-700/80 italic">
                      💡 Tự suy nghĩ câu trả lời trước, sau đó bấm nút <strong>"Giải đáp"</strong> ở trên để đối chiếu.
                    </p>
                  </div>
                )}

                {/* Answer / Insight: ONLY SHOWN WHEN USER CLICKS "Giải đáp" */}
                {showRealWorldInsight[currentTopic.id] && (
                  <div className="p-2.5 bg-white/90 rounded-xl border border-purple-200 text-[11px] leading-relaxed text-purple-950 space-y-1 animate-in fade-in slide-in-from-top-1 duration-200">
                    <div className="font-bold text-purple-800 flex items-center gap-1 text-[11px]">
                      <span>💡</span> Giải đáp khoa học:
                    </div>
                    <p className="text-slate-700">{currentTopic.realWorld.insight}</p>
                    {studentUserNotes[currentTopic.id] && (
                      <div className="mt-1.5 pt-1.5 border-t border-purple-100 text-[10px] text-slate-500">
                        <strong className="text-purple-700">Câu trả lời của bạn:</strong> {studentUserNotes[currentTopic.id]}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Save to Lab Report Button */}
              <button
                onClick={() => {
                  setInquirySaved(true);
                  triggerConfetti();
                }}
                className="w-full py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-xs rounded-xl shadow-sm hover:from-emerald-700 hover:to-teal-700 transition cursor-pointer"
              >
                {inquirySaved ? '✅ Đã lưu kết quả nghiên cứu vào Sổ tay!' : '💾 Lưu kết quả nghiên cứu vào Sổ tay phòng Lab'}
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: ANALYTICS */}
        {activeTab === 'analytics' && (
          <div className="space-y-4">
            {/* Live Chart with Correlation Prediction & Scientific Insights */}
            <LabAnalyticsChart
              activeLab={activeLab}
              photoAngle={photoCurrentAngle}
              photoIntensity={photoState.lightIntensity}
              bubblesRate={synthState.bubblesPerMinute}
              temperature={synthState.waterTemperature}
              lightDistance={synthState.lampDistance}
              co2Concentration={synthState.co2Concentration}
              rootAngle={hydroCurrentAngle}
              boxRotation={hydroState.boxRotation}
              waterSourcePos={hydroState.waterSourcePos}
            />

            {/* Metrics Dashboard */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              {activeLab === 'phototropism' && (
                <>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 shadow-xs">
                    <div className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">Góc lệch thân thực tế</div>
                    <div className="text-lg font-mono font-black text-emerald-600 mt-1">{photoCurrentAngle}°</div>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 shadow-xs">
                    <div className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">Tốc độ phân bố Auxin</div>
                    <div className="text-lg font-mono font-black text-amber-600 mt-1">
                      {photoState.plantTreatment === 'normal' || photoState.plantTreatment === 'transparent_cap'
                        ? '100% Hoạt động'
                        : '0% (Bị chặn)'}
                    </div>
                  </div>
                </>
              )}

              {activeLab === 'photosynthesis' && (
                <>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 shadow-xs">
                    <div className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">Tốc độ tạo bọt khí</div>
                    <div className="text-lg font-mono font-black text-sky-600 mt-1">
                      {synthState.bubblesPerMinute} <span className="text-[10px] text-slate-500 font-normal">bpm</span>
                    </div>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 shadow-xs">
                    <div className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">Khí O₂ thu được</div>
                    <div className="text-lg font-mono font-black text-amber-600 mt-1">
                      {Math.round(synthState.collectedO2Volume)}%
                    </div>
                  </div>

                  <div className="col-span-2">
                    <PhotosynthesisRelationshipMap
                      state={synthState}
                      onUpdateState={onUpdateSynthState}
                    />
                  </div>
                </>
              )}

              {activeLab === 'hydrotropism' && (
                <>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 shadow-xs">
                    <div className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">Góc uốn của rễ</div>
                    <div className="text-lg font-mono font-black text-emerald-600 mt-1">{hydroCurrentAngle}°</div>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 shadow-xs">
                    <div className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">Tác nhân chiếm ưu thế</div>
                    <div className="text-sm font-bold text-sky-700 mt-1">
                      {hydroState.boxRotation === 90 ? 'Cạnh tranh Trọng lực / Nước' : 'Hướng nước (+) Dương'}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: MECHANISM (Lý thuyết cơ chế) */}
        {activeTab === 'mechanism' && (
          <div className="space-y-4 text-xs text-slate-700">
            {activeLab === 'phototropism' && (
              <div className="space-y-3">
                <div className="p-3.5 rounded-xl bg-slate-50/90 border border-slate-200 shadow-xs space-y-2">
                  <h4 className="font-bold text-emerald-800 text-sm">🌿 Cơ chế phân tử Tính Hướng Sáng</h4>
                  <p className="text-[11px] leading-relaxed text-slate-600">
                    1. <strong>Cảm nhận ánh sáng:</strong> Thụ thể <em>Phototropin</em> ở chóp ngọn cây hấp thụ photon ánh sáng xanh lam (Blue light).
                  </p>
                  <p className="text-[11px] leading-relaxed text-slate-600">
                    2. <strong>Vận chuyển Auxin:</strong> Dưới kích thích ánh sáng đơn hướng, protein vận chuyển <em>PIN</em> điều hướng dòng phân tử Auxin (AIA) di chuyển chủ động sang tế bào phía khuất sáng (shaded side).
                  </p>
                  <p className="text-[11px] leading-relaxed text-slate-600">
                    3. <strong>Kéo dài tế bào (Thuyết sinh trưởng axit):</strong> Auxin kích hoạt bơm proton H⁺ ra ngoài màng tế bào, làm giảm pH thành tế bào, hoạt hóa enzyme <em>Expansin</em> làm giãn liên kết cellulose. Tế bào phía tối phình dài nhanh hơn, đẩy thân uốn cong về phía nguồn sáng.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200 text-[11px] text-amber-900 leading-relaxed font-medium">
                  📌 <strong>Kết luận từ thí nghiệm Darwin:</strong> Chóp bao lá mầm là nơi tiếp nhận kích thích ánh sáng. Thân dưới chóp là nơi thực hiện phản ứng uốn cong.
                </div>
              </div>
            )}

            {activeLab === 'photosynthesis' && (
              <div className="space-y-3">
                <div className="p-3.5 rounded-xl bg-slate-50/90 border border-slate-200 shadow-xs space-y-2.5">
                  <h4 className="font-bold text-sky-800 text-sm flex items-center gap-1.5">
                    <span>🧪</span> Cơ chế Sinh hóa & Giải phẫu Quá trình Quang hợp
                  </h4>
                  <div className="bg-sky-50/80 p-2.5 rounded-lg border border-sky-200 font-mono text-[11px] text-center text-teal-800 font-bold shadow-xs">
                    6CO₂ + 12H₂O + Ánh sáng (Quang năng) → C₆H₁₂O₆ + 6O₂↑ + 6H₂O
                  </div>
                  <p className="text-[11px] leading-relaxed text-slate-600">
                    1. <strong>Cơ chế tạo và thoát bọt khí O₂ từ phiến lá & cuống rong:</strong>
                    <br />• <em>Trên phiến lá:</em> Phiến lá rong đuôi chó (<em>Elodea canadensis</em>) rất mỏng (chỉ gồm 2 tầng tế bào) và không có tầng cutin dày chống thấm nước. Khi quang hợp, khí O₂ sinh ra khuếch tán trực tiếp qua thành tế bào biểu bì, bão hòa tại bề mặt lá và hình thành hàng loạt <strong>vi bọt khí li ti bám dày đặc</strong> trên phiến lá, phập phồng lớn dần rồi tách nổi lên.
                    <br />• <em>Tại vết cắt cuống rong:</em> Khí O₂ bên trong các mô nội tại được gom vào hệ thống <strong>ống khí mô xốp (Aerenchyma)</strong> chạy dọc thân cành. Do chênh lệch áp suất khí, O₂ liên tục thoát dồn dập từ vết cắt cuống tạo thành dòng bọt khí dâng lên phễu thu vào ống nghiệm.
                  </p>
                  <p className="text-[11px] leading-relaxed text-slate-600">
                    2. <strong>Pha sáng (Thylakoid Grana):</strong> Diệp lục hấp thụ photon kích hoạt trung tâm phản ứng P680 (Quang hệ II - PSII), xúc tác phản ứng <em>quang phân ly nước</em>: <span className="font-mono text-cyan-800 font-semibold">2H₂O → 4H⁺ + 4e⁻ + O₂↑</span>. Điện tử e⁻ đi vào chuỗi chuyền electron tổng hợp ATP và khử NADP⁺ thành NADPH. Khí O₂ sinh ra hoàn toàn có nguồn gốc từ phân tử H₂O.
                  </p>
                  <p className="text-[11px] leading-relaxed text-slate-600">
                    3. <strong>Pha tối - Chu trình Calvin (Chất nền Stroma):</strong> Khí CO₂ hòa tan (từ NaHCO₃) được enzyme <em>RuBisCO</em> cố định vào hợp chất 5C (RuBP) tạo ra 3-PGA, sau đó dùng năng lượng ATP và NADPH từ pha sáng để khử thành đường Triose-P rồi tổng hợp nên Glucose (C₆H₁₂O₆).
                  </p>
                  <p className="text-[11px] leading-relaxed text-slate-600">
                    4. <strong>Định luật Blackman về nhân tố hạn chế:</strong> Tốc độ quang hợp bị giới hạn bởi yếu tố ở mức bất lợi nhất (cường độ sáng, nồng độ CO₂ hoặc nhiệt độ). Nếu nhiệt độ vượt quá 45°C, protein enzyme RuBisCO bị biến tính nhiệt làm quang hợp sụt giảm nghiêm trọng.
                  </p>
                  <p className="text-[11px] leading-relaxed text-slate-600">
                    5. <strong>Quang phổ hấp thụ & Thử nghiệm que đóm:</strong> Hệ sắc tố diệp lục a & b hấp thụ mạnh dải ánh sáng Xanh lam (430–450 nm) và Đỏ (650–680 nm), hầu như phản xạ ánh sáng Xanh lục (~550 nm). Khí thu được trong ống nghiệm làm que tàn đóm đỏ bùng cháy mãnh liệt, chứng minh là khí Oxy duy trì sự cháy.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-cyan-50/80 border border-cyan-200 text-[11px] text-cyan-950 leading-relaxed font-medium">
                  📌 <strong>Ghi nhớ cốt lõi:</strong> Khí O₂ thoát ra từ lá rong và cuống là sản phẩm của quá trình <em>quang phân ly nước trong pha sáng</em>, không phải khí CO₂ bị tách ra.
                </div>
              </div>
            )}

            {activeLab === 'hydrotropism' && (
              <div className="space-y-3">
                <div className="p-3.5 rounded-xl bg-slate-50/90 border border-slate-200 shadow-xs space-y-2.5">
                  <h4 className="font-bold text-emerald-800 text-sm flex items-center gap-1.5">
                    <span>🌱</span> Cơ chế Sinh học Phân tử Tính Hướng Nước & Hướng Đất của Rễ
                  </h4>
                  <p className="text-[11px] leading-relaxed text-slate-600">
                    1. <strong>Bản chất Tính Hướng Nước Dương (Positive Hydrotropism):</strong> Rễ cây chủ động sinh trưởng uốn cong về phía có thế nước cao (gradien ẩm cao hơn) để tìm kiếm nguồn nước và ion khoáng thiết yếu cho sự sống của cây mầm.
                  </p>
                  <p className="text-[11px] leading-relaxed text-slate-600">
                    2. <strong>Cảm nhận Gradien Ẩm & Thụ thể MIZ1:</strong> Tế bào chóp rễ (Root cap) tiếp nhận chênh lệch độ ẩm giữa hai phía nhờ protein màng tế bào <em>MIZ1 (MIZU-KUSSEI 1)</em> và sự phát sinh dòng sóng ion canxi (Ca²⁺) nội bào, kích hoạt sự phân bố bất đối xứng của phytohormone Auxin.
                  </p>
                  <p className="text-[11px] leading-relaxed text-slate-600">
                    3. <strong>Hạt Thạch lạp (Statoliths) & Cảm nhận trọng lực (Gravitropism):</strong> Vùng trụ giữa chóp rễ (Columella) chứa các tế bào chuyên hóa có các hạt lạp tinh bột nặng gọi là <em>Statoliths</em>. Dưới tác dụng của trọng lực, các hạt thạch lạp này chìm lắng xuống đáy tế bào, đè lên lưới nội chất và định hướng các kênh vận chuyển Auxin (PIN3, PIN7).
                  </p>
                  <p className="text-[11px] leading-relaxed text-slate-600">
                    4. <strong>Nghịch lý Auxin ở rễ (Thuyết Cholodny-Went):</strong> Khác hoàn toàn với tế bào thân cây (cần nồng độ auxin cao để dãn dài), <em>tế bào rễ cực kỳ nhạy cảm với Auxin</em> (ngưỡng tối ưu chỉ ~10⁻¹⁰ M). Khi Auxin bị dồn nhiều về phía có độ ẩm thấp hơn hoặc phía dưới đáy chóp rễ do trọng lực:
                    <br />• Phía có nồng độ Auxin cao sẽ bị <strong>ức chế sinh trưởng dãn dài</strong>.
                    <br />• Phía có ít Auxin hơn (phía ẩm hoặc phía trên) lại có nồng độ tối ưu nên <strong>tế bào dãn dài nhanh hơn</strong>.
                    <br />• Sự chênh lệch tốc độ dãn dài giữa hai phía uốn bẻ cong chóp rễ hướng thẳng về nguồn nước (Hướng nước dương) hoặc cắm sâu vào lòng đất (Hướng đất dương).
                  </p>
                  <p className="text-[11px] leading-relaxed text-slate-600">
                    5. <strong>Cuộc cạnh tranh Vector giữa Hướng nước và Hướng đất:</strong> Khi xoay hộp Rhizotron nằm ngang 90°, rễ chịu 2 tín hiệu đối kháng: trọng lực kéo rễ uốn xuống dưới và nguồn ẩm hút rễ uốn ngang. Gradien độ ẩm mạnh sẽ thắng thế hướng trọng lực, giúp rễ ưu tiên thích nghi sinh tồn tìm nước.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-emerald-50/80 border border-emerald-200 text-[11px] text-emerald-950 leading-relaxed font-medium">
                  📌 <strong>Ghi nhớ cốt lõi:</strong> Ở thân cây, auxin kích thích dãn dài tế bào; còn ở rễ cây, <strong>nồng độ auxin cao gây ức chế dãn dài tế bào</strong>. Đây là chìa khóa lý giải hiện tượng rễ uốn cong.
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: MISSIONS & QUIZ */}
        {activeTab === 'missions' && (
          <div className="space-y-6">
            {/* Missions Checklist */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-purple-700">
                  Nhiệm vụ phòng Lab ({missionsList[activeLab].filter((m) => m.isCompleted).length}/
                  {missionsList[activeLab].length})
                </h4>
              </div>

              <div className="space-y-2.5">
                {missionsList[activeLab].map((m) => (
                  <div
                    key={m.id}
                    className={`p-3 rounded-xl border transition ${
                      m.isCompleted
                        ? 'bg-purple-50/90 border-purple-200 shadow-xs'
                        : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      <div
                        className={`w-5 h-5 rounded-lg flex items-center justify-center text-xs mt-0.5 ${
                          m.isCompleted
                            ? 'bg-purple-600 text-white font-bold'
                            : 'border-2 border-slate-300 text-transparent'
                        }`}
                      >
                        {m.isCompleted ? '✓' : ''}
                      </div>
                      <div className="flex-1">
                        <div className={`text-xs font-bold ${m.isCompleted ? 'text-purple-900' : 'text-slate-800'}`}>
                          {m.title}
                        </div>
                        <div className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">{m.description}</div>
                        {!m.isCompleted && (
                          <div className="text-[10px] text-purple-700 font-medium mt-1 italic">Gợi ý: {m.hint}</div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Interactive Quiz Section */}
            <div className="pt-3 border-t border-slate-200 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-700">Trắc nghiệm nhanh</h4>
                {quizSubmitted && (
                  <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-300 shadow-xs">
                    Điểm: {quizzes[activeLab].filter((q) => selectedAnswers[q.id] === q.correctIndex).length}/
                    {quizzes[activeLab].length}
                  </span>
                )}
              </div>

              <div className="space-y-4">
                {quizzes[activeLab].map((q, idx) => (
                  <div key={q.id} className="p-3 bg-slate-50/90 rounded-xl border border-slate-200 space-y-2.5 shadow-xs">
                    <div className="text-xs font-bold text-slate-800 leading-snug">
                      <span className="text-amber-700">Câu {idx + 1}:</span> {q.question}
                    </div>

                    <div className="space-y-1.5">
                      {q.options.map((opt, optIdx) => {
                        const isSelected = selectedAnswers[q.id] === optIdx;
                        let optionStyle = 'border-slate-200 bg-white text-slate-700 hover:bg-slate-100 font-medium';

                        if (quizSubmitted) {
                          if (optIdx === q.correctIndex) {
                            optionStyle = 'bg-emerald-50 border-emerald-500 text-emerald-800 font-bold ring-1 ring-emerald-300';
                          } else if (isSelected) {
                            optionStyle = 'bg-rose-50 border-rose-300 text-rose-800 font-medium';
                          }
                        } else if (isSelected) {
                          optionStyle = 'bg-sky-50 border-sky-400 text-sky-800 font-bold ring-1 ring-sky-300';
                        }

                        return (
                          <button
                            key={optIdx}
                            disabled={quizSubmitted}
                            onClick={() => setSelectedAnswers((prev) => ({ ...prev, [q.id]: optIdx }))}
                            className={`w-full text-left p-2 rounded-lg text-xs border transition flex items-center justify-between cursor-pointer ${optionStyle}`}
                          >
                            <span>{opt}</span>
                            {quizSubmitted && optIdx === q.correctIndex && <span className="font-bold">✓</span>}
                          </button>
                        );
                      })}
                    </div>

                    {quizSubmitted && (
                      <div className="text-[11px] text-slate-700 bg-amber-50/80 p-2.5 rounded-lg border border-amber-200 leading-relaxed font-medium">
                        💡 <strong>Giải thích:</strong> {q.explanation}
                      </div>
                    )}
                  </div>
                ))}

                <button
                  onClick={() => {
                    if (quizSubmitted) {
                      setQuizSubmitted(false);
                      setSelectedAnswers({});
                    } else {
                      setQuizSubmitted(true);
                      triggerConfetti();
                    }
                  }}
                  className="w-full py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs rounded-xl shadow-md transition cursor-pointer"
                >
                  {quizSubmitted ? '🔄 Làm lại bài trắc nghiệm' : 'Kiểm tra kết quả trắc nghiệm'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
