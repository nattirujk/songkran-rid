# 🌺 สืบสานสงกรานต์ — กรมชลประทาน
**Songkran Online Greeting Card — Royal Irrigation Department**

---

## คุณสมบัติ (Features)
- เลือกผู้บริหาร 4 ท่าน (เลือกได้หลายท่านพร้อมกัน)
- คำอวยพรสำเร็จรูป 6 แบบ + พิมพ์เพิ่มเติมได้
- ใส่ชื่อผู้ส่ง/หน่วยงาน
- **บันทึกเป็นไฟล์ PNG** ด้วย html2canvas (ขนาด 900px @2x = 1800px)
- ธีมสีเขียวกรมชลประทาน + กรอบทอง สไตล์ไทย

---

## วิธีใช้งาน

### Development
```bash
npm install
npm run dev
```
เปิด http://localhost:5173

### Production Build
```bash
npm run build
```
ไฟล์ output อยู่ใน `dist/`

### Preview Build
```bash
npm run preview
```

---

## โครงสร้างโปรเจกต์
```
songkran-rid/
├── index.html              # Entry HTML
├── src/
│   ├── main.js             # App logic + event handlers
│   ├── style.css           # Styles (form UI + greeting card)
│   ├── data.js             # ข้อมูลผู้บริหาร + คำอวยพร
│   └── cardRenderer.js     # สร้าง DOM สำหรับ export PNG
├── dist/                   # Production build
└── package.json
```

---

## การปรับแต่ง

### เปลี่ยนชื่อผู้บริหาร
แก้ไขที่ `src/data.js` → array `MANAGERS`

### เพิ่ม/แก้คำอวยพร
แก้ไขที่ `src/data.js` → array `BLESSINGS`

### เปลี่ยนโลโก้
แก้ไข SVG path ใน `src/data.js` → `LOGO_SVG`
และใน `src/main.js` → inline SVG ในส่วน header

---

## Dependencies
- [Vite](https://vitejs.dev/) — build tool
- [html2canvas](https://html2canvas.hertzen.com/) — PNG export
- Google Fonts: Sarabun, Charm
