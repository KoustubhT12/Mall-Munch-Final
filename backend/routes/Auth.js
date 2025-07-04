import { Router } from "express";
import mongoose from "mongoose";
import User from "../model/User.js";
import bcrypt from "bcryptjs"
const route = Router()
import jwt from "jsonwebtoken"
import dotenv from 'dotenv'
import middleware from "../middleware/middleware.js"
import Order from "../model/Order.js"
import { v2 as cloudinary } from 'cloudinary';
import { config } from 'cloudinary';
dotenv.config();




cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});




// first we will make an endpoint where we will register the user - - - - - -> 

route.post("/register",async(req,res)=>{ 
 

    const user = req.body;
 

     // now we will do all the validations  - - - - - - - > 

    if(user.username == null || user.password == null || user.email==null || user.phone == null ){
         res.status(404).json({"message":" Required fields are missing for registration !"})

    }
    if(user.password.length < 6 ){
        res.status(404).json({"message":" Password needs to be atleast 6 characters long !"})

    }


     // now we need to check if the user is already there or not  - - -- - - > 

    const euser = await User.findOne({
        username:user.username
    })

    const e2user = await User.findOne({ 
        email:user.email
    })

    if(euser || e2user){
        res.status(404).json({"message":" Credentials already in use by another account !"})
    }

    await User.create({
      username:user.username,
      password:user.password,
      email:user.email,
      phoneNumber:user.phone
    })

    res.status(200).json({"Message":"User created !"});
})





route.post("/login", async (req, res) => {
    const { username, password } = req.body;

    // Validate input
    if (!username || !password) {
        return res.status(400).json({ message: "Missing credentials!" });
    }

    const euser = await User.findOne({ username });

    if (!euser) {
        return res.status(401).json({ message: "Wrong credentials!" });
    }

    const isMatch = await bcrypt.compare(password, euser.password);

    if (!isMatch) {
        return res.status(401).json({ message: "Incorrect password!" });
    }

    const token = jwt.sign(
        { id: euser._id},
        process.env.SECRET,
        { expiresIn: '1d' }
    );

    return res.status(200).json({ message: 'Login successful' ,token});
  
});



route.get("/profile",middleware,async(req,res)=>{
   // now in this particular endpoint what I want is to render the profile in the frontend  
   // for that  we need to get the current user 

   const user = await User.findById(req.user.id);
 // we need to await this as db operations take time --- 

   const data = {
    username:user.username,
    email:user.email,
    phone:user.phoneNumber,
    joined:user.createdAt,
    profilePic:user.profilePic
   }
  
    res.status(200).json({data});
})


route.post("/changer", middleware, async (req, res) => {
  try {
      const { username, email, phone } = req.body;

      // Better validation
      if (!username || !email || !phone) {
          return res.status(400).json({ message: "All fields are required!" });
      }

      if (username.length < 3 || email.length < 3 || phone.length < 10) {
          return res.status(400).json({ 
              message: "Validation failed: Username and email need at least 3 characters, phone needs at least 10 digits" 
          });
      }

      // Make sure your middleware attaches the user to req
      const updates = {
          username: username,
          email: email,
          phoneNumber: phone // Changed from phone to phoneNumber to match your schema
      };

      const updatedUser = await User.findByIdAndUpdate(
          req.user.id, // Assuming your middleware attaches user to req
          { $set: updates },
          { new: true }
      );

      if (!updatedUser) {
          return res.status(404).json({ message: "User not found" });
      }

      res.json({
          message: "User details updated successfully!",
          user: {
              username: updatedUser.username,
              email: updatedUser.email,
              phone: updatedUser.phoneNumber 
          }
      });

  } catch (e) {
      console.error("Update error:", e);
      res.status(500).json({ message: "Error updating user details", error: e.message });
  }
});


route.get("/orders",middleware,async(req,res)=>{
    try {
        const orders = await Order.find({ user: req.user.id })
          .populate({
            path: 'items',
            select: 'name price image' // Include name, price, and image
          })
          .populate({
            path: 'foodcart',
            select: 'Fname' // Only select the Fname field from FoodCart
          })
          .sort({ createdAt: -1 }); // Sort by newest first
    
        // Transform the orders to include item details
        const transformedOrders = orders.map(order => ({
          _id: order._id,
          items: order.items.map(item => ({
            _id: item._id,
            name: item.name,
            price: item.price,
            image: item.image,
            quantity: 1 // Default quantity
          })),
          order_total: order.order_total,
          order_status: order.order_status,
          foodcart: order.foodcart?.Fname || 'Unknown', // Now properly accessed
          order_rating: order.order_rating,
          createdAt: order.createdAt
        }));
    
        res.status(200).json(transformedOrders);
      } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ 
          message: 'Error fetching orders',
          error: error.message 
        });
      }
    });



route.post("/:id/rate",middleware,async(req,res)=>{

    try {
        const { rating } = req.body;
        
        if (!rating || rating < 1 || rating > 5) {
          return res.status(400).json({ message: 'Rating must be between 1 and 5' });
        }
    
        // First find the order to check its status
        const order = await Order.findOne({ 
          _id: req.params.id, 
          user: req.user.id 
        });
    
        if (!order) {
          return res.status(404).json({ message: 'Order not found' });
        }
    
        // Check if order is in pending state
        if (order.order_status.toLowerCase() === 'pending') {
          return res.status(400).json({ 
            message: 'Order cannot be rated before you have tried it' 
          });
        }
    
        // here we are updating the rating -----> 
        const updatedOrder = await Order.findOneAndUpdate(
          { _id: req.params.id, user: req.user.id },
          { order_rating: rating },
          { new: true }
        );
    
        res.status(200).json(updatedOrder);
      } catch (error) {
        console.error('Error rating order:', error);
        res.status(500).json({ 
          message: 'Error rating order',
          error: error.message 
        });
      }route.post("/:id/rate", middleware, async (req, res) => {
        try {
          const { rating } = req.body;
          
          if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({ message: 'Rating must be between 1 and 5' });
          }
      
          const order = await Order.findOne({ 
            _id: req.params.id, 
            user: req.user.id 
          });
      
          if (!order) {
            return res.status(404).json({ message: 'Order not found' });
          }
      
          // Only allow rating for 'picked up' orders (matching your frontend logic)
          if (order.order_status !== 'picked up') {
            return res.status(400).json({ 
              message: 'You can only rate orders that have been picked up' 
            });
          }
      
          // Prevent re-rating
          if (order.order_rating) {
            return res.status(400).json({ 
              message: 'You have already rated this order' 
            });
          }
      
          const updatedOrder = await Order.findByIdAndUpdate(
            req.params.id,
            { order_rating: rating },
            { new: true }
          ).populate('user').populate('foodcart');
      
          res.status(200).json(updatedOrder);
        } catch (error) {
          console.error('Error rating order:', error);
          res.status(500).json({ 
            message: 'Error rating order',
            error: error.message 
          });
        }
      });



})


route.post("/updatepic",middleware,async(req,res)=>{
 
  try {
    const { profilePic, oldProfilePic } = req.body;
    
    // 1. First update the user with the new profile picture
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { $set: { profilePic } },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ 
        success: false,
        message: "User not found" 
      });
    }

    // 2. Then delete the old image if it exists and is from Cloudinary
    if (oldProfilePic && oldProfilePic.includes('cloudinary.com')) {
      try {
        // Extract public ID from URL
        const publicId = oldProfilePic.split('/').pop().split('.')[0];
        
        await cloudinary.uploader.destroy(publicId, {
          invalidate: true // Optional: invalidates CDN cache
        });
        
        
      } catch (deleteError) {
        console.error('Error deleting old profile picture:', deleteError);
        // Don't fail the request - just log the error
      }
    }

    return res.json({ 
      success: true,
      profilePic: updatedUser.profilePic
    });

  } catch (error) {
    console.error("Error updating profile picture:", error);
    return res.status(500).json({ 
      success: false,
      message: "Internal server error" 
    });
  }
});




export default route