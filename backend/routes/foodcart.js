import express from "express"
import FoodCart from "../model/FoodCart.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import middleware from "../middleware/middleware.js";
import Order from "../model/Order.js";
import { v2 as cloudinary } from 'cloudinary';
import Item from "../model/Item.js";

dotenv.config();


cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const foodcart = express.Router();
const saltrounds = 10;

// Registration of a foodcart 
foodcart.post("/register", async (req, res) => {
    const { foodCartName, username, password, email } = req.body;
    
    if (!username || !password || !email || !foodCartName) {
        return res.status(400).json({"message": "Required fields are missing for registration!"});
    }

    if (password.length < 6) {
        return res.status(400).json({"message": "Password needs to be at least 6 characters long!"});
    }

    const euser = await FoodCart.findOne({
        $or: [{Username: username}, {Email: email}]
    });

    if (euser) {
        return res.status(409).json({"message": "The Foodcart is already registered!"});
    }

    const hpass = await bcrypt.hash(password, saltrounds);

    await FoodCart.create({
        Fname: foodCartName,
        Password: hpass,
        Email: email,
        Username: username,
        Image: ''
    });

    return res.status(201).json({"message": "Foodcart registered successfully!"});
});

// Login endpoint
foodcart.post("/login", async (req, res) => {
    const { username, password } = req.body;
    
    const fc = await FoodCart.findOne({ Username: username });

    if (!fc) {
        return res.status(404).json({"message": "No such user exists! Kindly register first"});
    }

    const passwordCompare = await bcrypt.compare(password, fc.Password);
    if (!passwordCompare) {
        return res.status(401).json({"message": "Incorrect Password! Please try again"});
    }
    
    const token = jwt.sign(
        { id: fc._id },
        process.env.SECRET,
        { expiresIn: '1d' }
    );

    return res.status(200).json({ message: "Login successful!", token: token });
});

// Get current orders
foodcart.get("/getcurrentorders", middleware, async (req, res) => {
    const id = req.user.id;
    
    const orders = await Order.find({
        $and: [
            { foodcart: id },
            { order_status: { $in: ['PREPARING', 'READY_FOR_PICKUP', 'preparing'] } }
        ]
    })
    .populate('items')
    .populate('user', 'username email')
    .sort({ createdAt: -1 });

    return res.status(200).json(orders);
});

// Update order status
foodcart.put("/updateorderstatus/:orderId", middleware, async (req, res) => {
    const id = req.params.orderId;
    const { status } = req.body;

    const updatedOrder = await Order.findByIdAndUpdate(
        id,
        { $set: { order_status: status } },
        { new: true }
    );

    if (!updatedOrder) {
        return res.status(404).json({ message: "Order not found" });
    }

    return res.status(200).json({ message: "Order status changed!" });
});

// Get past orders
foodcart.get("/pastorders", middleware, async (req, res) => {
    try {
        const foodcartId = req.user.id;

        const pastOrders = await Order.find({
            foodcart: foodcartId,
            order_status: 'picked up'
        })
        .populate({
            path: 'items',
            select: 'name price quantity'
        })
        .populate('user', 'username')
        .sort({ updatedAt: -1 });

        res.status(200).json(pastOrders);
    } catch (error) {
        console.error('Error fetching past orders:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get profile
foodcart.get("/profile", middleware, async (req, res) => {
    const id = req.user.id;
    const user = await FoodCart.findOne({ _id: id });

    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
        name: user.Fname,
        username: user.Username,
        email: user.Email,
        image: user.Image
    });
});

// Update profile
foodcart.put('/update-profile', middleware, async (req, res) => {
    const { name, username, email } = req.body;
    const id = req.user.id;

    const updates = {
        Fname: name,
        Username: username,
        Email: email
    };

    const updatedUser = await FoodCart.findByIdAndUpdate(
        id,
        { $set: updates },
        { new: true }
    );

    res.status(200).json({
        name: updatedUser.Fname,
        username: updatedUser.Username,
        email: updatedUser.Email
    });
});

// Update image
foodcart.put('/update-image', middleware, async (req, res) => {
    const { image } = req.body;
    const id = req.user.id;

    const updatedUser = await FoodCart.findByIdAndUpdate(
        id,
        { $set: { Image: image } },
        { new: true }
    );

    res.status(200).json({ image: updatedUser.Image });
});

// Delete image
foodcart.post("/deleteimage", middleware, async (req, res) => {
    try {
        const { publicId } = req.body;
        
        if (!publicId) {
            return res.status(400).json({ 
                success: false,
                message: 'publicId is required' 
            });
        }

        const result = await cloudinary.uploader.destroy(publicId, {
            resource_type: 'image',
            type: 'upload',
            invalidate: true
        });

        if (result.result === 'ok' || result.result === 'not found') {
            return res.status(200).json({ 
                success: true,
                message: 'Image deleted successfully',
                result 
            });
        }

        return res.status(400).json({
            success: false,
            message: 'Failed to delete image',
            result
        });
    } catch (error) {
        console.error('Delete image error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Internal server error',
            error: error.message 
        });
    }
});

// Get items
foodcart.get("/additem", middleware, async (req, res) => {
    try {
        const id = req.user.id;
        const items = await Item.find({ Belongsto: id }).select("name price veg").lean();
        res.status(200).json(items);
    } catch (e) {
        res.status(500).json({ message: "Internal server error!" });
    }
});

// Edit item
foodcart.post("/item-edit", middleware, async (req, res) => {
    try {
        const { id, name, price, isVeg } = req.body;
        
        const updates = { 
            name: name,
            price: price,
            veg: isVeg
        };
        
        const updatedItem = await Item.findByIdAndUpdate(
            id,
            { $set: updates },
            { new: true }
        );

        if (!updatedItem) {
            return res.status(404).json({ message: "Item not found" });
        }
        
        res.status(200).json({ message: "Item updated successfully" });
    } catch (error) {
        console.error("Error updating item:", error);
        res.status(500).json({ message: "Failed to update item" });
    }
});



foodcart.post("/newitem",middleware,async(req,res)=>{

    const id = req.user.id;
    const {name,price,veg} = req.body;

    const item = await Item.create(
        {
            name:name,
            price:price,
            veg:veg,
            Belongsto:id
        }
    )

    // so here the item will be created 

    res.status(200).json({message:"Item created succesfully"})

})




foodcart.delete("/items/:itemId",middleware,async(req,res)=>{

     
    
    const id = req.params.itemId;


     if(id==""){
        return res.status(400).json({message:"The id does not exist"});
     }


     await Item.findOneAndDelete({_id:id});

     res.status(200).json({message:"Food Item deleted ! "})



}
)
export default foodcart;