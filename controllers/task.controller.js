const TaskModel = require('../models/Task');

//========== ฟังก์ชัน: ดึงรายการงาน (Tasks) ทั้งหมดของผู้ใช้ปัจจุบัน ==========
// ฟังก์ชันนี้ดึงงานเฉพาะที่เป็นของคนที่ล็อกอินอยู่
// จัดเรียงจากล่าสุดก่อน
exports.getTasks = async (req, res) => {
    const userId = req.user._id; // ดึง ID ของผู้ใช้ปัจจุบันจาก Middleware

    try {
        // ค้นหางานโดยหาจากรณีที่เป็นเจ้าของ (user: userId)
        const tasks = await TaskModel.find({ user: userId })
            .sort({ createdAt: -1 }); // จัดเรียงจากใหม่ที่สุดก่อน

        // ถ้าไม่พบงานเลย ให้ล๊อคไว้หรือส่ง array เปล่า
        if (!tasks || tasks.length === 0) {
            return res.status(200).send({
                message: "No tasks found for this user",
                data: []
            });
        }

        // ส่ง response รับรายการงาน
        res.status(200).send({
            message: "Fetch tasks successfully",
            count: tasks.length,
            data: tasks
        });
    } catch (error) {
        // จัดการ error ที่เกิดขึ้น
        res.status(500).send({
            message: error.message || "Some errors occurred while fetching tasks",
        });
    }
};

//========== ฟังก์ชัน: สร้างงาน (Task) ใหม่ ==========
// ฟังก์ชันนี้รับข้อมูล title, description, status, priority, dueDate
// แล้วบันทึกลงฐานข้อมูล MongoDB โดยผูกกับ userId
exports.createTask = async (req, res) => {
    const { title, description, status, priority, dueDate } = req.body;
    const userId = req.user._id;

    // ตรวจสอบว่ามีข้อมูลบังคับหรือไม่ (บังคับแค่ title ตาม Schema)
    if (!title) {
        return res.status(400).send({
            message: "Please provide a task title",
        });
    }

    try {
        // สร้าง document ใหม่ในฐานข้อมูล MongoDB
        const taskDoc = await TaskModel.create({
            user: userId, // บันทึก ID ของผู้สร้างงาน
            title,
            description,
            status,
            priority,
            dueDate
        });

        if (!taskDoc) {
            return res.status(500).send({
                message: "Cannot create a new task",
            });
        }

        // ส่ง response สำเร็จพร้อมข้อมูลงานที่สร้างขึ้น
        res.status(201).send({ 
            message: "Create a new task successfully", 
            data: taskDoc 
        });
    } catch (error) {
        res.status(500).send({
            message: error.message || "Some errors occurred while creating a new task",
        });
    }
};

//========== ฟังก์ชัน: อัปเดตงาน (Task) ==========
// ฟังก์ชันนี้แก้ไขข้อมูลงาน และรับประกันว่าต้องเป็นเจ้าของงานถึงแก้ได้
exports.updateTask = async (req, res) => {
    const { id } = req.params;
    const userId = req.user._id;

    if (!id) {
        return res.status(400).send({ message: "Task Id is missing" });
    }

    try {
        // อัปเดตข้อมูลโดยตรง และบังคับผ่าน Filter ว่า { _id: id, user: userId }
        const updatedTask = await TaskModel.findOneAndUpdate(
            { _id: id, user: userId }, // ต้องตรงทั้ง ID งาน และต้องเป็นเจ้าของ
            req.body, // เอาข้อมูลที่ส่งมาอัปเดตใส่ลงไปเลย
            { new: true, runValidators: true } // new: true เพื่อคืนค่าข้อมูลใหม่กลับไป
        );

        // ถ้าหาไม่เจอ หรือไม่ใช่เจ้าของ
        if (!updatedTask) {
            return res.status(403).send({
                message: "Unauthorized: You are not the owner of this task or task not found",
            });
        }

        res.status(200).send({ 
            message: "Task updated successfully", 
            data: updatedTask 
        });
    } catch (error) {
        res.status(500).send({
            message: error.message || "Some errors occurred while updating the task",
        });
    }
};

//========== ฟังก์ชัน: ลบงาน (Task) ==========
// ฟังก์ชันนี้ลบงาน และรับประกันว่าต้องเป็นเจ้าของงานถึงลบได้
exports.deleteTask = async (req, res) => {
    const { id } = req.params;
    const userId = req.user._id;

    if (!id) {
        return res.status(400).send({ message: "Task Id is missing" });
    }

    try {
        // ลบโดยเช็ค 2 เงื่อนไขพร้อมกัน (ต้องตรงทั้ง ID งาน และต้องเป็นเจ้าของ)
        const deletedTask = await TaskModel.findOneAndDelete({
            _id: id,
            user: userId,
        });

        // ถ้าหาไม่เจอ หรือไม่ใช่เจ้าของ
        if (!deletedTask) {
            return res.status(403).send({
                message: "Unauthorized: You are not the owner of this task or task not found",
            });
        }

        res.status(200).send({ 
            message: "Task deleted successfully", 
            data: deletedTask 
        });
    } catch (error) {
        res.status(500).send({
            message: error.message || "Some errors occurred while deleting the task",
        });
    }
};
