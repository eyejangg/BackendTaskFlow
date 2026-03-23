# การนำขึ้นระบบของ Backend (Render) 🚄 & ทางออกสำหรับฐานข้อมูล

เอกสารนี้จะอธิบายขั้นตอนการนำโปรเจกต์ส่วนหลังบ้าน (Node.js + Express) ขึ้นระบบ (Deploy) บนแพลตฟอร์ม Render และการแก้ปัญหาสำหรับรหัสนิสิตบน MongoDB

---

## 🛑 ทางออก: ทำยังไงเมื่อใช้อีเมลมหาวิทยาลัยสมัคร MongoDB Atlas ไม่ได้?

ปัญหานี้เจอบ่อยมากสำหรับอีเมลนักศึกษา! แต่วิธีแก้ที่ง่ายที่สุด **"โดยไม่ต้องแก้โค้ดเลยแม้แต่บรรทัดเดียว"** มี 2 วิธีครับ:

1. **วิธีที่ดีที่สุด (ฟรีถาวร ไม่เรื่องเยอะ):** 
   - **ใช้อีเมลส่วนตัว (Gmail ส่วนตัวของคุณ หรือสมัคร Gmail ใหม่)** ไปกดสมัครแบบ Free Tier บน `mongodb.com` เลยครับ 
   - สร้างโปรเจกต์ > เลือก Database แบบ Free Shared (M0) บน AWS (สิงคโปร์)
   - แค่นี้คุณก็จะได้ `MONGO_URI` มาแปะในโปรเจกต์ได้อย่างสมบูรณ์แบบ แบบ 100% และฐานข้อมูลฟรี 512MB!

2. **วิธีแผนสำรอง (ถ้าไม่อยากสมัคร Gmail เพิ่ม):**
   - ไปสมัครเว็บ **railway.app** (ด้วย Github)
   - กด Create New Project -> เลือก Provision MongoDB
   - กดดูรายละเอียดในกล่อง MongoDB มันจะให้ `Mongo Connection URI` (รูปแบบเป็น `mongodb://...`) มาเลยทันที นำค่านี้ไปใช้ใน `MONGO_URI` ของเราได้เลยครับ (ไม่มีการจำกัดเมล แต่มีข้อเสียคือใช้ฟรีได้ประมาณ 500 ชั่วโมง/เดือน ไม่ถาวรเท่า Atlas)

*(สรุป: แนะนำให้ตัดปัญหาด้วยข้อ 1 ชัวร์สุดครับ!)*

---

## 🛠️ ขั้นตอนการนำ Backend ขึ้น Render

1. สมัครบัญชี https://render.com/ ด้วย GitHub 
2. นำไฟล์ทั้งโฟลเดอร์นี้อัปโหลดขึ้น GitHub เป็น Repository แยกรักษา
3. กดปุ่ม `New` -> เครื่องหมายบวก (+) บน Render -> เลือก **Web Service**
4. เชื่อมโยง Repository GitHub ฝั่ง Backend
5. ตั้งค่าดังต่อไปนี้:
   - **Name:** ตั้งชื่อ API ของคุณ (เช่น `taskflow-api`)
   - **Environment:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `node index.js`

## 🔐 6. การตั้งค่า Environment Variables (Environment -> Add Secret File / Add Environment Variables)

นี่คือจุดสำคัญ **ห้ามลืมใส่เด็ดขาด**:
เพิ่มตัวแปร (Environment Variables) ตามนี้ลงไปใน Render:

1. `PORT` = `5000`
2. `BASE_URL` = `https://เว็บไซต์หน้าบ้านของคุณ.vercel.app` *(⚠️ ค่านี้สำคัญ ห้ามมีเครื่องหมาย `/` / สแลชปิดท้ายเด็ดขาด! เป็น URL ของ Frontend ฝั่ง Vercel เพื่อใช้เปิดประตู CORS ให้ Cookie คุยกันได้)*
3. `MONGO_URI` = `mongodb+srv://user:pass@cluster.mongodb.net/taskflow?retryWrites=true&w=majority` *(นำ URL ตรงนี้มาจาก Atlas ตามวิธีด้านบน อย่าลืมเปลี่ยนชื่อผู้ใช้และรหัสผ่านให้เรียบร้อย)*
4. `JWT_SECRET` = `(สุ่มข้อความอะไรก็ได้ที่คุณตั้งเป็นความลับ เช่น mysecretkey12345)`
5. `NODE_ENV` = `production`
6. `CLOUDINARY_CLOUD_NAME` = `(ของคุณ)`
7. `CLOUDINARY_API_KEY` = `(ของคุณ)`
8. `CLOUDINARY_API_SECRET` = `(ของคุณ)`

7. กดปุ่ม **Deploy Web Service**
8. (ข้อควรระวังบน Render): ครั้งแรกที่ Deploy สำเร็จ บน Render ระบบจะหยุดทำงานถ้านานไปแล้วไม่มีการใช้งาน ดังนั้นการเรียก API ตอนเปิดครั้งแรกอาจจะรอนานช้ากว่า Vercel ประมาณ 30 - 50 วินาที

🔥 **ขั้นตอนสุดท้าย**
เมื่อได้ URL ของ Backend (เช่น `https://taskflow-api.onrender.com`) อย่าลืมเอาไปใส่ในไฟล์ `vercel.json` ของฝั่ง Vercel (บรรทัด URL เป้าหมาย) แล้วพุช (Push) ขึ้น Github ของ Frontend อีกรอบ! เท่านี้ระบบหน้าบ้านหลังบ้านของคุณก็เชื่อมติดและคุยกันได้อย่างสมบูรณ์แบบครับ!
