import mongoose from "mongoose";
import { userRoles, userstatus, gender } from "../../Utils/index.js";
const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        trim: true,
        minlength: [3, 'First name must be at least 3 characters long'],
        maxlength: [50, 'First name must be less than 50 characters long']
    },
    lastName: {
        type: String,
        required: true,
        trim: true, 
        minlength: [3, 'Last name must be at least 3 characters long'],
        maxlength: [50, 'Last name must be less than 50 characters long']
    },
    email: {
        type: String,
        required: true,
        lowercase: true, 
        index: {
            unique: true, 
            name: 'email_unique_index' 
        }
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: Object.values(userRoles),
        default: userRoles.USER
    },
    status: {
        type: String,
        enum: Object.values(userstatus),
        default: userstatus.ACTIVE
    },
    gender: {
        type: String,
        enum: Object.values(gender)
    },
    phone: {
        type: String,
        default: null
    }
}, {
    timestamps: true, 
    toJSON: { virtuals: true }, // دي مهمة عشان الـ fullName يظهر لما تبعتي JSON لـ Postman
    toObject: { virtuals: true }
});

userSchema.virtual('fullName').get(function () {
    return `${this.firstName} ${this.lastName}`;
});

const User = mongoose.model('User', userSchema);
export default User;