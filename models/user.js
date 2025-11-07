const { createHmac, randomBytes } = require("crypto");
const { Schema, model } = require("mongoose");

const userSchema = new Schema({
    username: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    salt: {
        type: String,
    },
    password: {
        type: String,
        required: true,
    },
    profileImageURL: {
        type: String,
        default: "/images/default.png",
    },
    role: {
        type: String,
        enum: ["USER", "ADMIN"],
        default: "USER",
    },
}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', function (next) {
    const user = this;

    if (!user.isModified("password")) return next();

    const salt = randomBytes(16).toString("hex");
    const hashedPassword = createHmac('sha256', salt)
        .update(user.password)
        .digest("hex");

    user.salt = salt;
    user.password = hashedPassword;

    next();
});

// Match password statically
userSchema.statics.matchPassword = async function (email, password) {
    const user = await this.findOne({ email });
    if (!user) return null; // Instead of throwing

    const userProvideHash = createHmac('sha256', user.salt)
        .update(password)
        .digest("hex");

    if (user.password !== userProvideHash) return null;

    return user;
};


// Remove sensitive info on return
userSchema.methods.toJSON = function () {
    const obj = this.toObject();
    delete obj.password;
    delete obj.salt;
    return obj;
};

const User = model("user", userSchema);
module.exports = User;
