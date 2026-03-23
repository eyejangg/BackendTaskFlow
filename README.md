# คู่มือการทดสอบ SE NPRU TaskFlow Mini ด้วย Postman

ไฟล์นี้จะแนะนำวิธีการทดสอบระบบ Backend แบบละเอียดทุกขั้นตอน โดยใช้ [Postman](https://www.postman.com/) ครับ

**Base URL**: `http://localhost:5000/api/v1`

---

## 🟢 ระบบการจัดการ Token (อ่านก่อนเริ่มเทส)

โปรเจกต์นี้รองรับการยืนยันตัวตนได้ 2 รูปแบบ เพื่อความสะดวกในการทดสอบด้วย Postman ครับ:

### แบบที่ 1: ใช้ระบบ Cookie (แนะนำ - อัตโนมัติ)
1. เมื่อคุณยิง API `login` หรือ `register` สำเร็จระบบจะส่ง Cookie กลับมา
2. **Postman จะจำและเก็บ Cookie ชื่อ `jwt` ไว้อัตโนมัติ** (ดูได้ที่แท็บ Cookies)
3. เมื่อคุณยิง API เส้นอื่นๆ ต่อ (เช่น `/tasks`) คุณ **ไม่ต้องตั้งค่าอะไรเพิ่มเลย** Postman จะแนบ Cookie ให้อัตโนมัติครับ

### แบบที่ 2: ใช้ระบบ Bearer Token (สำหรับทดสอบเจาะจง)
กรณีที่คุณไม่อยากใช้ Cookie อัตโนมัติ:
1. กดยิง `/login` และก๊อปปี้ค่า `accessToken` จาก JSON ที่ได้มา
2. ที่ API ตัวอื่นๆ ไปที่แท็บ **Authorization** ใน Postman 
3. เลือก Type เป็น **Bearer Token** แล้ววางรหัสลงไปในช่อง Token 

---

## 👤 หมวด User / Authentication

### 1. Register (สมัครสมาชิก)
- **Method**: `POST`
- **URL**: `http://localhost:5000/api/v1/user/register`
- **Body** (เลือก raw -> JSON):
```json
{
  "fullname": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

### 2. Login (เข้าสู่ระบบ)
- **Method**: `POST`
- **URL**: `http://localhost:5000/api/v1/user/login`
- **Body** (เลือก raw -> JSON):
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

### 3. Check Auth (ตรวจสอบการล็อกอิน)
- **Method**: `GET`
- **URL**: `http://localhost:5000/api/v1/user/check`
- **ข้อมูลที่ต้องส่ง**: ไม่มี (ใช้ Cookie หรือ Bearer Token ดูในหัวข้อระบบการจัดการ Token)

### 4. Update Profile (อัปเดตโปรไฟล์และรูปภาพ)
- **Method**: `PUT`
- **URL**: `http://localhost:5000/api/v1/user/update-profile`
- **Body** (เลือก raw -> JSON):
```json
{
  "fullname": "John Updated",
  "profilePicture": "data:image/png;base64,iVBORw0KGgoAAAANS..." 
}
```
*(ถ้าต้องการเทสแค่การเปลี่ยนชื่อ ให้ลบบรรทัด profilePicture ออกแล้วส่งไปแค่ fullname ได้เลยครับ)*

### 5. Logout (ออกจากระบบ)
- **Method**: **`POST`** (ห้ามเผลอใช้ GET)
- **URL**: `http://localhost:5000/api/v1/user/logout`
- **ข้อมูลที่ต้องส่ง**: ไม่มี
- **หมายเหตุ**: ระบบของเราเป็นแบบ Stateless (JWT) การยิง API นี้คือการสั่งให้เบราว์เซอร์/Postman ลบทิ้ง Cookie ในเครื่องคุณเท่านั้นครับ (ไม่กระทบกับคนที่กำลังใช้ Token อื่นอยู่)

---

## 📝 หมวด Tasks (จัดการงาน)

> **⚠️ กฎสำคัญ (System Flow): จำเป็นต้อง Login ก่อนจัดการ Task เสมอ**
>
> เนื่องจากระบบนี้เป็น **"ระบบจัดการงานส่วนบุคคล (Personal TaskFlow)"** ทุกๆ Task จะต้องถูกผูกติดกับบัญชีผู้ใช้ (`userId`) ของคนที่สร้างมันขึ้นมาเท่านั้น
> - หากคุณพยายามยิง API สร้างงานหรือดึงงานโดยไม่ได้ Login ระบบจะไม่รู้ว่าคุณคือใคร และจะปฏิเสธการเข้าถึงด้วย Error `401 Unauthorized` ทันที
> - **ที่ถูกต้องคือ:** ให้ยิง API `POST /user/login` ให้สำเร็จก่อน 1 ครั้ง เพื่อให้ Postman จำ Cookie/Token มาระบุตัวตนของคุณ แล้วถึงจะสามารถมาใช้งาน API หมวด Tasks ด้านล่างนี้ได้อย่างสมบูรณ์

### 1. Get All Tasks (ดึงรายการงานทั้งหมดของตัวเอง)
- **Method**: `GET`
- **URL**: `http://localhost:5000/api/v1/tasks`

### 2. Create Task (สร้างงานใหม่ หรือ โพสต์งานใหม่)
> สำคัญ: สมมติว่า Task ของระบบนี้คือ "การสร้าง Post" ตาม Flow ที่คุณทำมานะครับ
- **Method**: `POST`
- **URL**: `http://localhost:5000/api/v1/tasks`
- **วิธีการเทสใน Postman แบบ Step-by-Step**:
  1. เปิด Postman เปิดแท็บใหม่ (เครื่องหมาย `+`)
  2. เปลี่ยน Method ด้านซ้ายมือกดเลือกเป็น **`POST`**
  3. ใส่ URL: `http://localhost:5000/api/v1/tasks`
  4. ไปที่แท็บคำว่า **Body** 
  5. เลือก **raw** และกด dropdown ด้านขวาเปลี่ยนจาก `Text` เป็น **`JSON`**
  6. วางโค้ด JSON ด้านล่างนี้ลงไปในกล่องข้อความ:
```json
{
  "title": "ทำโปรเจกต์ SE ให้เสร็จ",
  "description": "พรุ่งนี้ต้องส่ง Requirement Backend แล้ว สู้ๆ",
  "status": "todo",
  "priority": "high",
  "dueDate": "2026-03-30T23:59:00.000Z"
}
```
  7. กดปุ่ม **Send** สีฟ้า
  8. ถ้าสำเร็จ! ด้านล่างจะแสดงผลลัพธ์พร้อมสถานะ `201 Created` และรายละเอียดของ Post(Task) ที่คุณเพิ่งสร้างขึ้นมาครับ

### 3. Update Task (แก้ไขงาน)
- **Method**: `PUT`
- **URL**: `http://localhost:5000/api/v1/tasks/:id` 
 *(นำ `_id` ของ Task ที่ได้จากการดึงข้อมูล (GET) มาใส่แทน `:id` ใน URL)*
- **Body** (เลือก raw -> JSON):
```json
{
  "status": "in-progress",
  "priority": "medium"
}
```

### 4. Delete Task (ลบงาน)
- **Method**: `DELETE`
- **URL**: `http://localhost:5000/api/v1/tasks/:id`
 *(นำ `_id` ของ Task ที่ได้จากการดึงข้อมูล (GET) มาใส่แทน `:id` ใน URL)*

---

## 💡 ปัญหาที่พบบ่อย (Troubleshooting)
- **ข้อผิดพลาด 401 Unauthorized**: เกิดจากระบบหา Token ไม่เจอ ให้ลองกดยิง API `POST /user/login` ใหม่อีกครั้ง แล้วกลับมายิง API ที่พังอีกรอบ
- **ข้อผิดพลาด 404 / Cannot GET /...**: ตรวจสอบช่อง **Method** (GET, POST, PUT, DELETE) หน้า URL ใน Postman ให้ตรงกับคู่มือด้านบนครับ
