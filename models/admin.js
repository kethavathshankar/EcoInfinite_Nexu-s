const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');


const adminSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'Username is required'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/\S+@\S+\.\S+/, 'Invalid email address']
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [6, 'Password must be at least 6 characters']
    },
    role: {
        type: String,
        enum: ['ADMIN', 'SUPERADMIN'],
        default: 'ADMIN'
    }
}, {
    timestamps: true
});

// Hash password before saving
adminSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (err) {
        next(err);
    }
});

// Check email and password
adminSchema.statics.matchPassword = async function(email, password) {
    const admin = await this.findOne({ email: email.trim().toLowerCase() });
    if (admin && await bcrypt.compare(password, admin.password)) {
        return admin;
    }
    return null;
};

const Admin = mongoose.model('Admin', adminSchema);
module.exports = Admin;
