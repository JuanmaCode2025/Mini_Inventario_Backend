import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    
document: {
        type: Number,  // Corregido de "numbre" a "Number"
        required: true,
        trim: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    }
}, {
    timestamps: true,
    versionKey: false
});

const User = mongoose.model('User', userSchema);
export default User;

