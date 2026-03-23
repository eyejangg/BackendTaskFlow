const mongoose = require("mongoose")
const { Schema, model } = mongoose;
const UserSchema = new Schema({
    fullname: { type: String, required: true, min: 2 },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, min: 6 },
    profilePicture: { type: String, default: "" },
}, {
    timestamps: true
}
);


const UserModel = model("User", UserSchema);
module.exports = UserModel;
