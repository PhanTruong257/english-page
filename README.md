# 🧬 BioLab 3D — Phòng Thí Nghiệm Sinh Học Ảo Tương Tác

BioLab 3D là nền tảng phòng thí nghiệm ảo Sinh học trực quan 3D chạy trên trình duyệt web, được phát triển trên nền tảng **Next.js 15**, **React 19**, **Three.js** và **Tailwind CSS**. Nền tảng cho phép người học thao tác trực tiếp, điều chỉnh các biến số môi trường thời gian thực và quan sát phản ứng sinh lý học của thực vật trong không gian 3 chiều.

---

## 🌟 Các Phòng Thí Nghiệm Trọng Tâm

### 1. 🌿 Tính hướng sáng của cây mầm (Phototropism Lab 3D)
- **Thao tác tương tác:**
  - Kéo xoay góc chiếu đèn từ $-60^\circ$ đến $+60^\circ$, điều chỉnh độ sáng từ $10\% - 100\%$.
  - Thay đổi màu quang phổ: Ánh sáng trắng, Ánh sáng xanh lam (Blue light kích hoạt thụ thể Phototropin), Ánh sáng đỏ, Tắt đèn.
- **Thí nghiệm kinh điển (Darwin & Boysen-Jensen):**
  - Cắt bỏ chóp bao lá mầm (Decapitated) $\rightarrow$ Cây mất tính hướng sáng.
  - Chùm mũ đen che chóp ngọn (Opaque Cap) $\rightarrow$ Cây mọc thẳng.
  - Chùm mũ trong suốt (Transparent Cap) $\rightarrow$ Cây vẫn uốn cong.
  - Chèn khối thạch Agar / Chèn phiến Mica cản auxin.
- **Chế độ X-Ray Phân tử Auxin:**
  - Hiển thị các hạt hormone Auxin dồn về phía bị che sáng, làm giãn tế bào phía tối nhanh hơn khiến cây uốn cong.
  - Thước đo góc uốn $\theta$ của thân cây cập nhật liên tục.

### 2. 🧪 Thí nghiệm Quang hợp ở Rong đuôi chó (Photosynthesis Lab 3D)
- **Thao tác tương tác:**
  - Điều chỉnh khoảng cách đèn ($10\text{ cm} - 100\text{ cm}$) và công suất ($20\text{W} - 200\text{W}$).
  - Thay đổi nồng độ $CO_2$ hòa tan ($NaHCO_3$ từ $0\% - 4\%$).
  - Thay đổi nhiệt độ nước ($5^\circ\text{C} - 50^\circ\text{C}$): Quan sát hiện tượng enzym bị biến tính ở $>45^\circ\text{C}$.
  - Kính lọc quang phổ (Trắng, Lam, Đỏ, Lục - Rong phản xạ màu lục làm tốc độ quang hợp tụt dốc).
- **Tính năng độc quyền:**
  - Hệ thống hạt 3D sủi bọt khí $O_2$ từ cuống rong bay lên ống nghiệm với tốc độ tính theo công thức sinh học chuẩn.
  - Cảm biến đếm số bọt khí/phút và đo lượng khí tích tụ trong ống nghiệm.
  - **Thử que đóm cháy bùng:** Đưa tàn đóm đỏ vào ống nghiệm chứa khí Oxy $\rightarrow$ ngọn lửa bùng cháy rực rỡ!

### 3. 🌱 Tính hướng nước & Hướng trọng lực của rễ (Hydro & Gravitropism 3D)
- **Thao tác tương tác:**
  - Hộp kính Rhizotron quan sát rễ cây mầm nảy mầm.
  - Di chuyển nguồn ẩm (miếng xốp cấp nước) sang trái, phải hoặc đáy.
  - **Xoay ngang hộp thí nghiệm $90^\circ$:** Quan sát sự cạnh tranh sinh lý giữa Hướng trọng lực (Gravitropism) và Hướng nước (Hydrotropism).
- **Chế độ X-Ray Thạch lạp (Statoliths):**
  - Quan sát các hạt tinh bột thạch lạp ở tế bào chóp rễ lắng xuống dưới theo trọng trường.

---

## 🎯 Tính năng hỗ trợ học tập chuyên sâu
- **Tua nhanh thời gian (Time-lapse):** $1\times, 5\times, 20\times$ để hiện tượng diễn ra ngay trước mắt.
- **Biểu đồ số liệu thời gian thực (Live Analytics Chart):** Đồ thị SVG trực quan hóa đường cong quang hợp Blackman, đồ thị nhiệt độ enzym và góc uốn.
- **Hệ thống Nhiệm vụ (Missions):** Tự động phát hiện khi đạt điều kiện và bắn pháo hoa chúc mừng.
- **Trắc nghiệm kiến thức nhanh (Quiz):** 3-4 câu hỏi củng cố kiến thức khoa học sau mỗi bài.
- **Xuất phiếu báo cáo thực hành (Export Report):** Tự động điền số liệu thí nghiệm và hỗ trợ in ấn / xuất file PDF chuẩn giáo trình.

---

## 🛠️ Cài đặt & Chạy ứng dụng

```bash
# Cài đặt thư viện
npm install

# Chạy server phát triển
npm run dev

# Mở trình duyệt tại http://localhost:3000
```
