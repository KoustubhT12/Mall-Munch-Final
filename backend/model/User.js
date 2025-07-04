import mongoose, { Mongoose } from "mongoose";
import bcrypt from 'bcryptjs'


const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, "Username is required"],
        trim: true,
        minlength: [3, "Username must be at least 3 characters long"],
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        trim: true,
        lowercase: true,
        match: [/^\S+@\S+\.\S+$/, "Email must be a valid email address"],
        unique: true,
    },
    phoneNumber: {
        type: String,
        required: [true, "Phone number is required"],
        trim: true,
     
    },
    password: {
        type: String,
        required: [true, "Password is required"],
        minlength: [6, "Password must be at least 6 characters long"],
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    profilePic:{
        type:String
    }
});


UserSchema.pre('save',async function(next){
   if(!this.isModified("password")){
    return next()
   }

   const salt = await bcrypt.genSalt(10);
   this.password = await bcrypt.hash(this.password,salt)
   next()
})


const User = mongoose.model('User',UserSchema);

export default User;