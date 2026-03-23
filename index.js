const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");

// โหลดค่าตัวแปรสภาพแวดล้อม (Environment Variables) จากไฟล์ .env
dotenv.config();

const app = express(); // สร้าง Express application

const PORT = process.env.PORT || 5000;
const BASE_URL = process.env.BASE_URL;
const MONGO_URI = process.env.MONGO_URI;

// ตั้งค่า CORS (Cross-Origin Resource Sharing) เพื่ออนุญาตให้เชื่อมต่อจากแหล่งอื่นได้
app.use(
    cors({
        origin: [BASE_URL],
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
        allowedHeaders: ["Content-Type", "Authorization", "x-access-token"],
        credentials: true, // อนุญาตให้ส่ง Cookie ผ่านข้ามโดเมน
    })
);

// Middleware สำหรับจัดการข้อมูล
app.use(express.json({ limit: '50mb' })); // จำกัดขนาดข้อมูล JSON ที่รับได้สูงสุด 50MB (มีผลกับรูปภาพ Base64)
app.use(express.urlencoded({ limit: '50mb', extended: true })); // จัดการข้อมูลที่มาจากแบบฟอร์ม URL-encoded
app.use(cookieParser()); // ใช้ cookie-parser สำหรับอ่านและจัดการ Cookie ได้ง่ายขึ้น

// เชื่อมต่อ Routes (เส้นทาง API) ต่างๆ
const userRoute = require("./routers/user.route");
app.use("/api/v1/user", userRoute);

const taskRouter = require("./routers/task.route");
app.use("/api/v1/tasks", taskRouter); // นำ Router ของ Tasks มาเชื่อมกับแอปพลิเคชัน

// Route ทดสอบสถานะการทำงานของเซิร์ฟเวอร์
app.get("/", (req, res) => {
    res.send("Client is running SE NPRU TaskFlow Mini API ");
});

// ตรวจสอบค่าการเชื่อมต่อฐานข้อมูล
if (!MONGO_URI) {
    console.error("ขาด URL สำหรับเชื่อมต่อฐานข้อมูล (MONGO_URI) กรุณาตั้งค่าในไฟล์ .env");
} else {
    // เชื่อมต่อฐานข้อมูล MongoDB
    mongoose
        .connect(MONGO_URI)
        .then(() => {
            console.log("เชื่อมต่อฐานข้อมูล MongoDB สำเร็จเรียบร้อย");
        })
        .catch((error) => {
            console.error("พบข้อผิดพลาดในการเชื่อมต่อ MongoDB:", error.message);
        });
}

// เริ่มต้นเปิดใช้งานเซิร์ฟเวอร์
app.listen(PORT, () => {
    console.log(`เซิร์ฟเวอร์ (Backend) กำลังทำงานที่: http://localhost:${PORT}`);
    console.log(`อนุญาต CORS สำหรับ Frontend ที่: ${BASE_URL}`);
});
