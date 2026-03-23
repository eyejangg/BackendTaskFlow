const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    // เรียก user ใช้งาน 
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    // กำหนด object ต่างๆ ที่ควรมี
    title: {
        type: String,
        required: [true, 'Please add a title'],
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    status: {
        type: String,
        enum: ['todo', 'in-progress', 'completed'],
        default: 'todo'
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium'
    },
    category: {
        type: String,
        enum: ['work', 'personal', 'study', 'other'],
        default: 'other'
    },
    dueDate: {
        type: Date
    },
    subTasks: [
        {
            title: { type: String, trim: true },
            isCompleted: { type: Boolean, default: false }
        }
    ]
}, {
    timestamps: true
});

module.exports = mongoose.model('Task', taskSchema);
