export const metadata = {
  title: "Moon. Bio Lab 3D — Phòng Thí Nghiệm Sinh Học Ảo Tương Tác",
  description: "Trải nghiệm mô phỏng thí nghiệm sinh học 3D tương tác: Thí nghiệm quang hợp ở rong đuôi chó, tính hướng sáng của cây, tính hướng nước của rễ.",
};

import BioLabMaster from "@/components/biolab/BioLabMaster";

export default function Home() {
  return (
    <>
      <BioLabMaster />
    </>
  );
}
