const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        default: "",
        maxLength: [50, "Name can not be more than 50 characters"],
        // required: [true, "Please add a name"],
    },
    email: {
        type: String,
        unique: true,
        match: [
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
            "Please add a valid email",
        ],
        // required: [true, "Please add a email"],
    },
    birthday: {
        type: Date,
        default: Date.now,
        // required: [true, "Please add a birthday"],
    },
    city: {
        type: String,
        default: "",
        // required: [true, "Please add a city"],
    },
    province: {
        type: String,
        default: "",
        // required: [true, "Please add a province"],
    },
    address: {
        type: String,
        default: "",
        // required: [true, "Please add a address"],
    },
    phone: {
        type: Number,
        default: "",
        // required: [true, "Please add a phone"],
    },
    avatar: {
        type: String,
        default: "no-photo.jpg",
    },
    role: {
        type: String,
        enum: ["user", "admin"],
        default: "user",
        required: [true, "Please add a role"],
    },
    token: String,
    password: {
        type: String,
        // required: [true, "Please add a password"],
        minlength: 6,
        select: false,
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

//Encrypt password using bcrypt
UserSchema.pre("save", async function(next) {
    if (!this.isModified("password")) {
        next();
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);

    next();
});

//Sign JWT and return
UserSchema.methods.getSignJwtToken = function(next) {
    return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE,
    });
};

//Compare entered password to password in database
UserSchema.methods.comparePassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

//Generate and hash password token
UserSchema.methods.getResetPasswordToken = function() {
    //Generate token
    const resetToken = crypto.randomBytes(20).toString("hex");

    //Hash token and set to resetPasswordToken field
    this.resetPasswordToken = crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");

    //Set expire
    this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

    return resetToken;
};

module.exports = mongoose.model("User", UserSchema);