import mongoose from "mongoose";
import { userRoles, userstatus, gender } from "../../Utils/index.js";
import { PROVIDESR } from "../../Utils/constants.utils.js";
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
        lastName: { type: String, default: "" },
        trim: true, 
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
            required: function () {
                // الباسورد بيبقى إجباري فقط لو اليوزر مش مسجل بجوجل
                return this.provider === 'local';
            }
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
    },
    avatar: { type: String, default: "" },
        provider: {
        type: String,
        enum: Object.values(PROVIDESR),
        default: PROVIDESR.SYSTEM
    },
    googlesub: {
        type: String,
        default: null,
        index: {
            unique: true,
            name: 'google_sub_unique_index'
        }
     },
     isEmailVerified: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true, 
    toJSON: { virtuals: true },
});

userSchema.virtual('fullName').get(function () {
    return `${this.firstName} ${this.lastName}`;
});

const User = mongoose.model('User', userSchema);
export default User;