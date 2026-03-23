const jwt = require("jsonwebtoken");
const User = require("../models/User");
require("dotenv").config();

// jwt อยู่ใน cookies

exports.protectedRoute = async (req, res, next) => {
    try {
        let token = req.cookies.jwt; // ตรวจสอบจาก Cookie ก่อน

        // ถ้าไม่มีใน Cookie ให้ลองเช็คจาก Authorization Header (แบบ Bearer Token)
        if (!token && req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
            token = req.headers.authorization.split(" ")[1];
        }

        if (!token) {
            return res.status(401).json({ message: "Unauthorized - No Token provided" });
        }
        const decoded = jwt.verify(token, process.env.SECRET); // ตรวจสอบว่า token ถูกต้องหรือไม่ โดยหาจาก token , process.env.SECRET
        if (!decoded) {
            return res.status(401).json({ message: "Unauthorized - Invalid Token" }); // token ไม่ถูกต้อง
        }

        // ตรวจสอบไฟล์ user.Controller.js มา decoded เราตั้งชื่อว่าอะไร
        // const token = jwt.sign({ userId: user._id }, secret, { expiresIn: "1d" }); บรรทัด 41
        const user = await User.findById(decoded.userId).select("-password"); // .select เอาทุกอย่างยกเว้น -password 
        if (!user) {
            return res.status(404).json({ message: "User Not Found" });
        }
        req.user = user; // มาจาก const user = await User.findById(decoded.userId).select("-password");
        next(); // สเตปถัดไป 

    } catch (error) {
        console.error("Error in protectedRoute middleware:", error.message);
        res.status(500).json({ message: "Internal Server Error while Checking Token" })
    }
};
