import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useMemo } from "react";
import { ChevronRight, Plus, Trash2, CalendarDays, Sprout, TrendingUp } from "lucide-react";
import { AppShell, Badge, Card, SectionTitle } from "@/components/AppShell";
import { usePlots } from "@/hooks/usePlots";
import { toast } from "sonner";

export const Route = createFileRoute("/crop-calendar")({
  head: () => ({
    meta: [
      { title: "ปฏิทินพืชอัตโนมัติ — สวนอัจฉริยะ" },
      { name: "description", content: "Timeline การเจริญเติบโตของพืชแต่ละชนิด ตั้งแต่เพาะปลูกถึงเก็บเกี่ยว พร้อมคำแนะนำรายช่วง" },
      { property: "og:title", content: "ปฏิทินพืชอัตโนมัติ — สวนอัจฉริยะ" },
    ],
  }),
  component: CropCalendarPage,
});

// ─────────────────────────────────────────────
//  ฐานข้อมูล Crop Stage Definitions
// ─────────────────────────────────────────────
export type CropStage = {
  key: string;
  label: string;
  emoji: string;
  durationDays: number; // ระยะเวลาของช่วงนี้ (วัน)
  description: string;
  fertilizer?: string;
  water?: string;
  pestWarning?: string;
  satelliteHint?: string; // บริบทภาพดาวเทียม
};

export type CropDef = {
  name: string;
  emoji: string;
  totalDays: number;
  stages: CropStage[];
};

const CROP_DB: Record<string, CropDef> = {
  ข้าว: {
    name: "ข้าว",
    emoji: "🌾",
    totalDays: 120,
    stages: [
      {
        key: "germination",
        label: "เพาะกล้า / งอก",
        emoji: "🌱",
        durationDays: 14,
        description: "เมล็ดงอกและแตกใบแรก ต้องการความชื้นสม่ำเสมอ",
        fertilizer: "ไม่จำเป็น — ใช้ธาตุอาหารในเมล็ด",
        water: "รักษาหน้าน้ำ 3-5 ซม.",
        satelliteHint: "ภาพดาวเทียมจะเห็นแปลงยังคงเป็นสีน้ำตาล/เทา ยังไม่มีพืชปกคลุม",
      },
      {
        key: "tillering",
        label: "แตกกอ",
        emoji: "🌿",
        durationDays: 30,
        description: "ต้นข้าวแตกกอเพิ่มจำนวนลำ — ช่วงสำคัญที่สุดของการสร้างจำนวนรวง",
        fertilizer: "ใส่ปุ๋ยยูเรีย (46-0-0) อัตรา 25-30 กก./ไร่ เพื่อกระตุ้นการแตกกอ",
        water: "ระดับน้ำ 5-10 ซม. — อย่าให้แห้งเด็ดขาด",
        pestWarning: "ระวังเพลี้ยกระโดดสีน้ำตาล และหนอนห่อใบ",
        satelliteHint: "ภาพดาวเทียมจะเริ่มเห็นสีเขียวเข้มขึ้น — NDVI เริ่มสูงขึ้นชัดเจน",
      },
      {
        key: "panicle_initiation",
        label: "ตั้งท้อง",
        emoji: "🌾",
        durationDays: 25,
        description: "สร้างรวงข้าวภายในลำต้น — ช่วงวิกฤตที่สุด อย่าให้ขาดน้ำ",
        fertilizer: "ปุ๋ย KCl (0-0-60) 10-15 กก./ไร่ + ปุ๋ยสูตร 16-20-0 เพื่อเสริมรวงใหญ่",
        water: "น้ำต้องเต็มแปลงตลอด ห้ามปล่อยให้แห้ง",
        pestWarning: "ระวังเพลี้ยกระโดด และโรคไหม้คอรวง",
        satelliteHint: "NDVI สูงสุด — ต้นข้าวสีเขียวเข้มและแน่นแปลง",
      },
      {
        key: "heading",
        label: "ออกรวง",
        emoji: "🌾",
        durationDays: 15,
        description: "รวงโผล่พ้นใบธง เริ่มผสมเกสร",
        fertilizer: "ไม่แนะนำให้ใส่ปุ๋ยเพิ่มในช่วงนี้",
        water: "รักษาระดับน้ำ 3-5 ซม.",
        pestWarning: "ระวังแมลงบั่ว และนกกินรวง — ใช้ตาข่ายกันนก",
        satelliteHint: "ภาพดาวเทียมเริ่มเห็นสีเหลืองทอง — รวงเริ่มโค้งลงเพราะน้ำหนักเมล็ด",
      },
      {
        key: "ripening",
        label: "สุกแก่",
        emoji: "🌻",
        durationDays: 20,
        description: "เมล็ดเติมแป้งและสะสมน้ำตาล ใบเริ่มเหลือง",
        fertilizer: "ไม่ใส่ปุ๋ย — ลดน้ำเพื่อเร่งการสุก",
        water: "ลดน้ำออกจากแปลง 10-15 วันก่อนเก็บเกี่ยว",
        satelliteHint: "NDVI ลดลงชัดเจน — ใบเหลืองและรวงสีน้ำตาลทอง สวยงามมากในภาพดาวเทียม",
      },
      {
        key: "harvest",
        label: "เก็บเกี่ยว",
        emoji: "🚜",
        durationDays: 7,
        description: "เก็บเกี่ยวเมื่อเมล็ดแก่ 80-85% — ความชื้นในเมล็ด 20-25%",
        fertilizer: "เตรียมจัดเก็บและตากข้าวให้ความชื้น < 14%",
        satelliteHint: "ภาพดาวเทียมจะเห็นแปลงว่างเปล่าอีกครั้งหลังรถเกี่ยวผ่าน",
      },
    ],
  },
  ทุเรียน: {
    name: "ทุเรียน",
    emoji: "🥇",
    totalDays: 365,
    stages: [
      {
        key: "vegetative",
        label: "แตกใบอ่อน",
        emoji: "🌱",
        durationDays: 60,
        description: "ต้นแตกยอดและใบอ่อนใหม่หลังพักตัว เร่งสะสมอาหาร",
        fertilizer: "ปุ๋ยสูตร N สูง 46-0-0 หรือ 21-0-0 อัตรา 1-2 กก./ต้น",
        water: "รดน้ำสม่ำเสมอ 50-80 ลิตร/ต้น ทุก 2-3 วัน",
        satelliteHint: "NDVI เพิ่มขึ้น — ทรงพุ่มเริ่มหนาแน่นและสีเขียวสดขึ้น",
      },
      {
        key: "stress",
        label: "กระตุ้นออกดอก",
        emoji: "🏜️",
        durationDays: 30,
        description: "งดน้ำหรือลดน้ำสร้างความเครียดต้น เพื่อกระตุ้นการออกดอก",
        fertilizer: "ปุ๋ย P สูง 0-46-0 อัตรา 0.5-1 กก./ต้น เพื่อเร่งดอก",
        water: "ลดน้ำอย่างรุนแรง 14-21 วัน จนใบเริ่มม้วน แต่ไม่ถึงขั้นเหี่ยว",
        satelliteHint: "NDVI ลดลงชั่วคราว — ใบเริ่มสีเขียวซีดจากการงดน้ำ",
      },
      {
        key: "flowering",
        label: "ออกดอก",
        emoji: "🌸",
        durationDays: 30,
        description: "ช่อดอกบานและรอการผสมเกสร — ค้างคาวช่วยผสมในเวลากลางคืน",
        fertilizer: "ปุ๋ย 8-24-24 หรือ 12-24-12 อัตรา 1-1.5 กก./ต้น",
        water: "รดน้ำกลับเพิ่มขึ้นอย่างช้าๆ อย่าให้ดินชื้นมากเกินไปเพราะดอกร่วง",
        pestWarning: "ระวังหนอนเจาะช่อดอก ฉีดพ่น Chlorpyrifos ก่อนดอกบาน",
        satelliteHint: "ทรงพุ่มมีจุดขาวๆ — ช่อดอกสีขาวครีมสามารถมองเห็นได้จากภาพดาวเทียมความละเอียดสูง",
      },
      {
        key: "fruit_set",
        label: "ติดผลอ่อน",
        emoji: "🔮",
        durationDays: 30,
        description: "ผลเริ่มพัฒนา คัดผลเหลือต้นละ 5-15 ผล ตามขนาดต้น",
        fertilizer: "ปุ๋ย K สูง 13-13-21 อัตรา 1-2 กก./ต้น เสริมขนาดผล",
        water: "รดน้ำสม่ำเสมอ อย่าให้ดินแห้งเพราะผลร่วง",
        pestWarning: "ระวังเพลี้ยแป้ง หนอนเจาะผล ฉีดพ่น Abamectin",
        satelliteHint: "NDVI เพิ่มสูงมาก — ทรงพุ่มแน่นและใบสีเขียวเข้มจากปุ๋ย K",
      },
      {
        key: "fruit_development",
        label: "พัฒนาผล",
        emoji: "🥭",
        durationDays: 90,
        description: "ผลขยายใหญ่ขึ้น เปลือกและหนามพัฒนาเต็มที่",
        fertilizer: "ปุ๋ยอินทรีย์ + 0-0-60 อัตรา 0.5 กก./ต้น ทุก 30 วัน",
        water: "น้ำสม่ำเสมอมาก 80-120 ลิตร/ต้น — การขาดน้ำทำให้ผลปริ",
        pestWarning: "ห่อผลทุเรียนเพื่อป้องกันแมลงและหนู",
        satelliteHint: "ทรงพุ่มสูงและใหญ่ที่สุด — NDVI อยู่ในระดับสูงสุดของวงจร",
      },
      {
        key: "harvest",
        label: "เก็บเกี่ยว",
        emoji: "🚜",
        durationDays: 14,
        description: "เก็บเมื่อก้านผลเริ่มบิด ตัดส่งตลาดภายใน 24-48 ชั่วโมง",
        fertilizer: "หลังเก็บ ใส่ปุ๋ยอินทรีย์บำรุงดินทันที เตรียมรอบหน้า",
        satelliteHint: "ภาพดาวเทียมจะเห็นกิจกรรมในสวนเพิ่มขึ้น — รถขนส่งและคนงานในแปลง",
      },
    ],
  },
  มังคุด: {
    name: "มังคุด",
    emoji: "🍇",
    totalDays: 270,
    stages: [
      {
        key: "vegetative",
        label: "แตกใบอ่อน",
        emoji: "🌱",
        durationDays: 45,
        description: "แตกใบอ่อน 2-3 ชุด สะสมคาร์โบไฮเดรตในลำต้น",
        fertilizer: "ปุ๋ย 16-16-16 อัตรา 0.5-1 กก./ต้น ทุก 2 เดือน",
        water: "รดน้ำสม่ำเสมอ — มังคุดเติบโตช้า อย่าให้ขาดน้ำ",
        satelliteHint: "NDVI เพิ่มเล็กน้อย — ใบอ่อนสีน้ำตาลแดงก่อนเปลี่ยนเป็นเขียว",
      },
      {
        key: "stress",
        label: "กระตุ้นออกดอก",
        emoji: "🏜️",
        durationDays: 20,
        description: "งดน้ำ 14-21 วัน หรือรอจังหวะอากาศเย็น",
        fertilizer: "ปุ๋ย 0-46-0 พ่นทางใบเพื่อกระตุ้นการออกดอก",
        water: "งดน้ำอย่างเข้มงวด จนดินแตกระแหง แต่ไม่เกิน 21 วัน",
        satelliteHint: "NDVI ลดลง — ใบมีสีเขียวอ่อนลงจากความเครียด",
      },
      {
        key: "flowering",
        label: "ออกดอก",
        emoji: "🌸",
        durationDays: 25,
        description: "ดอกสีขาวชมพู เพศเมียเท่านั้น — ไม่ต้องการการผสมเกสร",
        fertilizer: "ปุ๋ย 8-24-24 อัตรา 0.5 กก./ต้น",
        water: "รดน้ำกลับอย่างช้าๆ — การเปลี่ยนแปลงน้ำกะทันหันทำให้ดอกร่วง",
        satelliteHint: "จุดขาวปรากฏที่ทรงพุ่ม — ดอกมังคุดมองเห็นได้ในภาพความละเอียดสูง",
      },
      {
        key: "fruit_set",
        label: "ติดผลและเติบโต",
        emoji: "🍇",
        durationDays: 120,
        description: "ผลมังคุดเจริญเติบโตช้ามาก — ใช้เวลา 90-120 วัน",
        fertilizer: "ปุ๋ย K สูง 0-0-60 อัตรา 0.3 กก./ต้น ทุกเดือน ป้องกันผลแตก",
        water: "น้ำสม่ำเสมอมาก — การขาดน้ำทำให้ยางในผลและผลแตก",
        pestWarning: "ระวังแมลงวันทอง ใช้กับดักฟีโรโมน",
        satelliteHint: "ทรงพุ่มสีเขียวเข้มสม่ำเสมอ — NDVI คงที่สูง",
      },
      {
        key: "harvest",
        label: "เก็บเกี่ยว",
        emoji: "🚜",
        durationDays: 14,
        description: "เก็บเมื่อเปลือกเปลี่ยนจากเขียวเป็นม่วงแดง",
        fertilizer: "หลังเก็บ บำรุงต้นด้วยปุ๋ยอินทรีย์ทันที",
        satelliteHint: "ทรงพุ่มเริ่มสีจางลงหลังเก็บ — คนงานและกิจกรรมในสวนมองเห็นได้",
      },
    ],
  },
  ลำไย: {
    name: "ลำไย",
    emoji: "🌰",
    totalDays: 330,
    stages: [
      {
        key: "vegetative",
        label: "แตกใบอ่อน",
        emoji: "🌱",
        durationDays: 60,
        description: "ใบชุดใหม่แตกออก สะสมแป้งและน้ำตาลสำหรับออกดอก",
        fertilizer: "ปุ๋ย 46-0-0 อัตรา 0.5-1 กก./ต้น กระตุ้นใบ",
        water: "รดน้ำ 30-50 ลิตร/ต้น ทุก 3-4 วัน",
        satelliteHint: "NDVI เพิ่มขึ้นสม่ำเสมอ — ทรงพุ่มใบอ่อนสีเขียวสด",
      },
      {
        key: "stress",
        label: "กระตุ้นออกดอก",
        emoji: "❄️",
        durationDays: 30,
        description: "ใช้ความเย็น + งดน้ำ หรือพ่นสารโพแทสเซียมคลอเรต",
        fertilizer: "พ่น KClO₃ (โพแทสเซียมคลอเรต) 500-1000 กรัม/ต้น ลงดิน",
        water: "งดน้ำ 7-14 วัน ก่อนพ่นสาร แล้วรดน้ำมากทันทีหลังพ่น 3 วัน",
        satelliteHint: "NDVI ลดลงชั่วคราว — ใบเริ่มสีซีดจากการงดน้ำ",
      },
      {
        key: "flowering",
        label: "ออกดอก",
        emoji: "🌸",
        durationDays: 30,
        description: "ช่อดอกสีเหลืองอมขาวออก ผึ้งช่วยผสมเกสร",
        fertilizer: "ปุ๋ย 0-46-0 พ่นทางใบ + Boron 0.1% เสริมการผสมเกสร",
        water: "รดน้ำเบาๆ ห้ามรดมากเพราะดอกร่วง",
        pestWarning: "ระวังหนอนเจาะช่อ — ฉีดพ่นก่อนดอกบาน",
        satelliteHint: "จุดเหลืองสว่างในทรงพุ่ม — ช่อดอกลำไยมองเห็นได้จากภาพดาวเทียม",
      },
      {
        key: "fruit_set",
        label: "ติดผลอ่อน",
        emoji: "🟢",
        durationDays: 30,
        description: "ผลเล็กสีเขียวอ่อนเริ่มพัฒนา คัดผลเหลือช่อละ 30-50 ผล",
        fertilizer: "ปุ๋ย 13-13-21 อัตรา 0.5 กก./ต้น",
        water: "น้ำสม่ำเสมอมาก — ผลร่วงง่ายถ้าดินแห้ง",
        pestWarning: "ระวังมวนลำไย ฉีดพ่น Cypermethrin",
        satelliteHint: "NDVI สูงสุด — ใบและผลสีเขียวเข้มปกคลุมทรงพุ่ม",
      },
      {
        key: "fruit_development",
        label: "ผลพัฒนา-สุก",
        emoji: "🌰",
        durationDays: 90,
        description: "เนื้อในสีขาวขุ่นพัฒนา รสหวาน — หลีกเลี่ยงฝนช่วงสุก",
        fertilizer: "ปุ๋ย K สูง 0-0-60 เร่งความหวาน 0.3 กก./ต้น",
        water: "ลดน้ำก่อนสุก 2 สัปดาห์เพื่อเพิ่มความหวาน",
        pestWarning: "ระวังแมลงวันทอง กาและนกกินผล",
        satelliteHint: "ทรงพุ่มสีเหลืองอมน้ำตาล — ผลสุกเปลี่ยนสีมองเห็นได้ในภาพความละเอียดสูง",
      },
      {
        key: "harvest",
        label: "เก็บเกี่ยว",
        emoji: "🚜",
        durationDays: 14,
        description: "เก็บเมื่อผลแก่ 80% — ผิวสีน้ำตาลทองและเนื้อใสขาว",
        fertilizer: "หลังเก็บ บำรุงต้นด้วยปุ๋ยอินทรีย์ + ตัดแต่งกิ่ง",
        satelliteHint: "แปลงว่างหลังเก็บ — กิจกรรมการเก็บเกี่ยวมองเห็นได้ชัดเจน",
      },
    ],
  },
  มะม่วง: {
    name: "มะม่วง",
    emoji: "🥭",
    totalDays: 210,
    stages: [
      {
        key: "vegetative",
        label: "แตกใบอ่อน",
        emoji: "🌱",
        durationDays: 45,
        description: "ใบอ่อนสีแดงอมชมพูแตกออก เปลี่ยนเป็นสีเขียว",
        fertilizer: "ปุ๋ย 21-0-0 หรือ 46-0-0 อัตรา 0.5 กก./ต้น",
        water: "รดน้ำทุก 3-5 วัน ตามสภาพอากาศ",
        satelliteHint: "NDVI เพิ่มขึ้น — ใบอ่อนสีแดงก่อนเปลี่ยนเป็นเขียว",
      },
      {
        key: "flowering",
        label: "ออกดอก",
        emoji: "🌸",
        durationDays: 25,
        description: "ช่อดอกสีขาวเหลือง — ต้องการอากาศเย็นและแห้ง",
        fertilizer: "ปุ๋ย 8-24-24 อัตรา 0.5-1 กก./ต้น",
        water: "งดน้ำหรือลดน้ำน้อยมากในช่วงดอกบาน",
        pestWarning: "ระวังโรคราดำ (Sooty mold) จากเพลี้ยแป้ง ฉีดพ่น Cypermethrin",
        satelliteHint: "ช่อดอกขาวเหลืองปรากฏที่ยอดทรงพุ่ม — มองเห็นได้ในภาพดาวเทียม",
      },
      {
        key: "fruit_set",
        label: "ติดผลอ่อน",
        emoji: "🟢",
        durationDays: 30,
        description: "ผลเล็กสีเขียวพัฒนา คัดผลเหลือช่อละ 1-3 ผล",
        fertilizer: "ปุ๋ย K สูง 13-13-21 อัตรา 0.5 กก./ต้น",
        water: "เพิ่มน้ำอย่างช้าๆ หลังผลติด",
        pestWarning: "ระวังแมลงวันทอง — วางกับดักฟีโรโมน",
        satelliteHint: "NDVI สูงขึ้น — ผลอ่อนสีเขียวสดปกคลุมทรงพุ่ม",
      },
      {
        key: "fruit_development",
        label: "ผลโต-สุก",
        emoji: "🥭",
        durationDays: 60,
        description: "ผลขยายใหญ่ขึ้น เปลือกเปลี่ยนสีตามสายพันธุ์",
        fertilizer: "ปุ๋ย 0-0-60 เร่งความหวาน 0.3 กก./ต้น",
        water: "น้ำสม่ำเสมอ งดน้ำ 2 สัปดาห์ก่อนเก็บ",
        pestWarning: "ห่อผลป้องกันแมลงวันทองเจาะ",
        satelliteHint: "ทรงพุ่มสีเหลืองส้ม — ผลมะม่วงสุกมองเห็นได้ในภาพดาวเทียมความละเอียดสูง",
      },
      {
        key: "harvest",
        label: "เก็บเกี่ยว",
        emoji: "🚜",
        durationDays: 14,
        description: "เก็บเมื่อผลแก่ตามสายพันธุ์ — ต้องขนส่งภายใน 3-5 วัน",
        fertilizer: "หลังเก็บ ตัดแต่งกิ่ง + ใส่ปุ๋ยอินทรีย์",
        satelliteHint: "กิจกรรมการเก็บเกี่ยวมองเห็นได้ในภาพดาวเทียม",
      },
    ],
  },
};

// ─────────────────────────────────────────────
//  Types & Helpers
// ─────────────────────────────────────────────
type PlotCrop = {
  id: string;
  plotId: string;
  cropKey: string;
  plantedDate: string; // ISO date
};

function calcStageInfo(
  def: CropDef,
  plantedDate: string,
  today: Date
): {
  daysSincePlanted: number;
  currentStageIdx: number;
  stageStartDay: number;
  daysIntoStage: number;
  daysLeftInStage: number;
  totalDaysLeft: number;
  stageProgress: number;
  overallProgress: number;
  stageStartDates: Date[];
} {
  const planted = new Date(plantedDate + "T00:00:00");
  const daysSincePlanted = Math.max(0, Math.floor((today.getTime() - planted.getTime()) / 86_400_000));

  let acc = 0;
  let currentStageIdx = def.stages.length - 1;
  let stageStartDay = 0;

  const stageStartDates: Date[] = [];
  for (let i = 0; i < def.stages.length; i++) {
    const d = new Date(planted);
    d.setDate(planted.getDate() + acc);
    stageStartDates.push(d);
    if (daysSincePlanted < acc + def.stages[i]!.durationDays) {
      currentStageIdx = i;
      stageStartDay = acc;
      break;
    }
    acc += def.stages[i]!.durationDays;
  }

  const stage = def.stages[currentStageIdx]!;
  const daysIntoStage = Math.max(0, daysSincePlanted - stageStartDay);
  const daysLeftInStage = Math.max(0, stage.durationDays - daysIntoStage);
  const totalDaysLeft = Math.max(0, def.totalDays - daysSincePlanted);
  const stageProgress = Math.min(100, Math.round((daysIntoStage / stage.durationDays) * 100));
  const overallProgress = Math.min(100, Math.round((daysSincePlanted / def.totalDays) * 100));

  return { daysSincePlanted, currentStageIdx, stageStartDay, daysIntoStage, daysLeftInStage, totalDaysLeft, stageProgress, overallProgress, stageStartDates };
}

function formatDate(d: Date) {
  return d.toLocaleDateString("th-TH", { day: "numeric", month: "short" });
}

// ─────────────────────────────────────────────
//  Main Component
// ─────────────────────────────────────────────
function CropCalendarPage() {
  const { plots } = usePlots();
  const [plotCrops, setPlotCrops] = useState<PlotCrop[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [selectedPlotCropId, setSelectedPlotCropId] = useState<string>("");

  // form
  const [formPlotId, setFormPlotId] = useState(plots[0]?.id ?? "");
  const [formCropKey, setFormCropKey] = useState("ทุเรียน");
  const [formDate, setFormDate] = useState(new Date().toISOString().slice(0, 10));

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("garden_guru_plot_crops");
      if (stored) {
        try {
          const data = JSON.parse(stored) as PlotCrop[];
          setPlotCrops(data);
          if (data.length > 0) setSelectedPlotCropId(data[0]!.id);
        } catch (e) {}
      }
    }
    if (plots[0]) setFormPlotId(plots[0].id);
  }, [plots]);

  const save = (updated: PlotCrop[]) => {
    setPlotCrops(updated);
    localStorage.setItem("garden_guru_plot_crops", JSON.stringify(updated));
  };

  const addCrop = () => {
    if (!formPlotId || !formCropKey || !formDate) {
      toast.error("กรุณาเลือกแปลง พืช และวันที่ปลูก");
      return;
    }
    const newEntry: PlotCrop = {
      id: `pc-${Date.now()}`,
      plotId: formPlotId,
      cropKey: formCropKey,
      plantedDate: formDate,
    };
    const updated = [newEntry, ...plotCrops];
    save(updated);
    setSelectedPlotCropId(newEntry.id);
    setShowAdd(false);
    toast.success(`เพิ่มปฏิทิน ${CROP_DB[formCropKey]?.name ?? formCropKey} สำเร็จ!`);
  };

  const removeCrop = (id: string) => {
    const updated = plotCrops.filter((c) => c.id !== id);
    save(updated);
    setSelectedPlotCropId(updated[0]?.id ?? "");
    toast.success("ลบปฏิทินพืชแล้ว");
  };

  const today = useMemo(() => new Date(), []);
  const selected = plotCrops.find((c) => c.id === selectedPlotCropId);
  const selectedDef = selected ? CROP_DB[selected.cropKey] : null;
  const selectedPlot = selected ? plots.find((p) => p.id === selected.plotId) : null;

  const stageInfo = useMemo(() => {
    if (!selected || !selectedDef) return null;
    return calcStageInfo(selectedDef, selected.plantedDate, today);
  }, [selected, selectedDef, today]);

  const currentStage = selectedDef && stageInfo ? selectedDef.stages[stageInfo.currentStageIdx] : null;
  const nextStage = selectedDef && stageInfo ? selectedDef.stages[stageInfo.currentStageIdx + 1] : null;

  return (
    <AppShell title="ปฏิทินพืช Auto" subtitle="Timeline การเจริญเติบโตตามจริง">
      {/* ── Header actions ── */}
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-muted-foreground">
          {plotCrops.length > 0 ? `${plotCrops.length} รอบปลูก` : "ยังไม่มีรอบปลูก"}
        </p>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground cursor-pointer active:scale-95"
        >
          <Plus className="size-3.5" /> เพิ่มรอบปลูก
        </button>
      </div>

      {/* ── Add form modal ── */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40" onClick={() => setShowAdd(false)}>
          <div className="w-full max-w-md rounded-t-3xl bg-card p-5 pb-8 shadow-2xl space-y-4" onClick={(e) => e.stopPropagation()}>
            <p className="font-semibold">เพิ่มรอบปลูกใหม่</p>

            {plots.length > 0 && (
              <div>
                <p className="mb-1.5 text-xs font-medium text-muted-foreground">แปลง</p>
                <select
                  value={formPlotId}
                  onChange={(e) => setFormPlotId(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
                >
                  {plots.map((p) => (
                    <option key={p.id} value={p.id}>{p.emoji} {p.name}</option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <p className="mb-1.5 text-xs font-medium text-muted-foreground">ชนิดพืช</p>
              <div className="grid grid-cols-3 gap-2">
                {Object.entries(CROP_DB).map(([key, def]) => (
                  <button
                    key={key}
                    onClick={() => setFormCropKey(key)}
                    className={`rounded-xl border py-2.5 text-sm cursor-pointer transition-all ${
                      formCropKey === key ? "border-primary bg-primary-soft text-primary font-semibold" : "border-border"
                    }`}
                  >
                    {def.emoji} {def.name}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-1.5 text-xs font-medium text-muted-foreground">วันที่เพาะปลูก / ลงดิน</p>
              <input
                type="date"
                value={formDate}
                onChange={(e) => setFormDate(e.target.value)}
                className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
              />
            </div>

            <button
              onClick={addCrop}
              className="w-full rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground cursor-pointer active:scale-[0.99]"
            >
              สร้าง Timeline
            </button>
          </div>
        </div>
      )}

      {/* ── Plot crop tabs ── */}
      {plotCrops.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {plotCrops.map((pc) => {
            const def = CROP_DB[pc.cropKey];
            const plot = plots.find((p) => p.id === pc.plotId);
            return (
              <button
                key={pc.id}
                onClick={() => setSelectedPlotCropId(pc.id)}
                className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium cursor-pointer transition-all ${
                  pc.id === selectedPlotCropId ? "border-primary bg-primary-soft text-primary" : "border-border"
                }`}
              >
                {def?.emoji} {plot?.name ?? pc.plotId} ({def?.name})
              </button>
            );
          })}
        </div>
      )}

      {/* ── Empty state ── */}
      {plotCrops.length === 0 && (
        <Card className="flex flex-col items-center gap-3 py-10 text-center border-dashed">
          <span className="text-5xl">🌱</span>
          <div>
            <p className="font-semibold">ยังไม่มีรอบปลูก</p>
            <p className="mt-1 text-xs text-muted-foreground">กดปุ่ม "เพิ่มรอบปลูก" แล้วเลือกพืชและวันที่ปลูก<br />ระบบจะสร้าง Timeline อัตโนมัติทันที</p>
          </div>
          <button
            onClick={() => setShowAdd(true)}
            className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground cursor-pointer"
          >
            + เพิ่มรอบปลูกแรก
          </button>
        </Card>
      )}

      {/* ── Main Timeline view ── */}
      {selected && selectedDef && stageInfo && currentStage && (
        <>
          {/* Overview card */}
          <Card className="bg-primary border-0 text-primary-foreground">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-primary-foreground/75">แปลง</p>
                <p className="font-semibold">{selectedPlot?.emoji} {selectedPlot?.name ?? "—"}</p>
              </div>
              <button onClick={() => removeCrop(selected.id)} className="rounded-full bg-white/15 p-1.5 cursor-pointer hover:bg-white/25">
                <Trash2 className="size-3.5" />
              </button>
            </div>
            <div className="mt-3 flex items-center gap-3">
              <span className="text-4xl">{currentStage.emoji}</span>
              <div>
                <p className="text-lg font-bold">{currentStage.label}</p>
                <p className="text-xs text-primary-foreground/80">
                  วันที่ {stageInfo.daysSincePlanted + 1} — {selectedDef.name} {selectedDef.emoji}
                </p>
              </div>
            </div>
            {/* Overall progress */}
            <div className="mt-4">
              <div className="flex justify-between text-xs text-primary-foreground/80 mb-1">
                <span>ความคืบหน้าโดยรวม</span>
                <span>{stageInfo.overallProgress}%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-white/20">
                <div
                  className="h-2 rounded-full bg-white transition-all duration-700"
                  style={{ width: `${stageInfo.overallProgress}%` }}
                />
              </div>
            </div>
            {/* Key stats */}
            <div className="mt-3 grid grid-cols-3 gap-2 text-center">
              <div className="rounded-xl bg-white/15 py-2">
                <p className="text-base font-bold">{stageInfo.daysSincePlanted}</p>
                <p className="text-[10px] text-primary-foreground/75">วันที่ผ่านมา</p>
              </div>
              <div className="rounded-xl bg-white/15 py-2">
                <p className="text-base font-bold">{stageInfo.daysLeftInStage}</p>
                <p className="text-[10px] text-primary-foreground/75">วันในช่วงนี้</p>
              </div>
              <div className="rounded-xl bg-white/15 py-2">
                <p className="text-base font-bold">{stageInfo.totalDaysLeft}</p>
                <p className="text-[10px] text-primary-foreground/75">วันถึงเก็บ</p>
              </div>
            </div>
          </Card>

          {/* Contextual alerts */}
          {stageInfo.daysLeftInStage <= 7 && nextStage && (
            <Card className="flex items-start gap-3 border-warning/40 bg-warning/10">
              <span className="text-xl">⚠️</span>
              <div>
                <p className="text-sm font-semibold">กำลังจะเข้าสู่ช่วงถัดไปใน {stageInfo.daysLeftInStage} วัน</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {nextStage.emoji} <strong>{nextStage.label}</strong> — เตรียม{nextStage.fertilizer ? "ปุ๋ย" : "แผนการดูแล"}ล่วงหน้าได้เลย
                </p>
              </div>
            </Card>
          )}

          {/* Current stage detail */}
          <SectionTitle>ช่วงปัจจุบัน: {currentStage.label}</SectionTitle>
          <Card className="space-y-3">
            <p className="text-sm text-foreground/85 leading-relaxed">{currentStage.description}</p>
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span>ความคืบหน้าในช่วงนี้</span>
              <span>{stageInfo.stageProgress}%</span>
            </div>
            <div className="h-2 w-full rounded-full bg-muted">
              <div className="h-2 rounded-full bg-primary transition-all duration-700" style={{ width: `${stageInfo.stageProgress}%` }} />
            </div>
            {currentStage.fertilizer && (
              <div className="flex items-start gap-2 rounded-xl bg-primary-soft p-3">
                <span className="text-base">🌿</span>
                <div>
                  <p className="text-xs font-semibold text-primary">คำแนะนำปุ๋ย</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{currentStage.fertilizer}</p>
                </div>
              </div>
            )}
            {currentStage.water && (
              <div className="flex items-start gap-2 rounded-xl bg-sky-50/70 p-3">
                <span className="text-base">💧</span>
                <div>
                  <p className="text-xs font-semibold text-sky-600">การให้น้ำ</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{currentStage.water}</p>
                </div>
              </div>
            )}
            {currentStage.pestWarning && (
              <div className="flex items-start gap-2 rounded-xl bg-orange-50/70 p-3">
                <span className="text-base">🐛</span>
                <div>
                  <p className="text-xs font-semibold text-orange-600">ระวังศัตรูพืช</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{currentStage.pestWarning}</p>
                </div>
              </div>
            )}
            {currentStage.satelliteHint && (
              <div className="flex items-start gap-2 rounded-xl bg-violet-50/70 p-3">
                <span className="text-base">🛰️</span>
                <div>
                  <p className="text-xs font-semibold text-violet-600">บริบทภาพดาวเทียม</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{currentStage.satelliteHint}</p>
                </div>
              </div>
            )}
          </Card>

          {/* Full stage timeline */}
          <SectionTitle>Timeline ทั้งหมด</SectionTitle>
          <div className="relative space-y-0">
            {selectedDef.stages.map((stage, idx) => {
              const stageDate = stageInfo.stageStartDates[idx];
              const endDate = stageDate ? new Date(stageDate.getTime() + stage.durationDays * 86_400_000) : null;
              const isCurrent = idx === stageInfo.currentStageIdx;
              const isPast = idx < stageInfo.currentStageIdx;
              const isFuture = idx > stageInfo.currentStageIdx;

              return (
                <div key={stage.key} className="flex gap-3">
                  {/* timeline spine */}
                  <div className="flex flex-col items-center">
                    <div
                      className={`flex size-10 shrink-0 items-center justify-center rounded-full text-lg border-2 transition-all ${
                        isCurrent
                          ? "border-primary bg-primary-soft shadow-[0_0_0_4px_var(--color-primary)/15]"
                          : isPast
                          ? "border-primary/40 bg-primary/10"
                          : "border-border bg-muted/50"
                      }`}
                    >
                      {isPast ? "✓" : stage.emoji}
                    </div>
                    {idx < selectedDef.stages.length - 1 && (
                      <div className={`mt-1 w-0.5 flex-1 min-h-8 ${isPast ? "bg-primary/40" : "bg-border"}`} />
                    )}
                  </div>

                  {/* stage content */}
                  <div className={`flex-1 pb-5 ${isFuture ? "opacity-60" : ""}`}>
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className={`text-sm font-semibold ${isCurrent ? "text-primary" : ""}`}>
                        {stage.label}
                      </p>
                      {isCurrent && <Badge tone="good">ช่วงนี้</Badge>}
                      {isPast && <Badge tone="muted">ผ่านแล้ว</Badge>}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {stageDate && endDate
                        ? `${formatDate(stageDate)} → ${formatDate(endDate)}`
                        : `${stage.durationDays} วัน`}
                    </p>
                    {isCurrent && (
                      <p className="mt-1 text-xs text-primary font-medium">
                        อีก {stageInfo.daysLeftInStage} วัน สิ้นสุดช่วงนี้
                      </p>
                    )}
                    {isFuture && stageDate && (
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        อีกประมาณ{" "}
                        {Math.max(0, Math.floor((stageDate.getTime() - today.getTime()) / 86_400_000))} วัน
                        จะถึงช่วงนี้
                      </p>
                    )}
                    {stage.fertilizer && isCurrent && (
                      <p className="mt-1.5 rounded-lg bg-primary-soft px-2 py-1 text-xs text-primary inline-block">
                        🌿 {stage.fertilizer.slice(0, 50)}{stage.fertilizer.length > 50 ? "…" : ""}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Satellite context banner */}
          <Card className="flex items-start gap-3 border-violet-200 bg-violet-50/60">
            <span className="text-2xl">🛰️</span>
            <div>
              <p className="text-sm font-semibold text-violet-700">บริบทภาพดาวเทียมปัจจุบัน</p>
              <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                {currentStage.satelliteHint ?? "ดูภาพดาวเทียมของแปลงในหน้าแปลงของฉันเพื่อเปรียบเทียบกับช่วงการเจริญเติบโต"}
              </p>
              <p className="mt-2 text-xs font-medium text-violet-600">
                NDVI คาดการณ์:{" "}
                {stageInfo.currentStageIdx <= 1
                  ? "ต่ำ–กำลังเพิ่มขึ้น"
                  : stageInfo.currentStageIdx <= 3
                  ? "สูง"
                  : "กำลังลดลง"}
              </p>
            </div>
          </Card>
        </>
      )}
    </AppShell>
  );
}
