import {Router} from 'express'
import FoodCart from '../model/FoodCart.js'
import Order from '../model/Order.js'
import middleware from '../middleware/middleware.js'
import { compareSync } from 'bcryptjs'
import Item from '../model/Item.js'
const mall = Router()
import User from '../model/User.js'
import mongoose from 'mongoose'
import redisClient from '../config/RedisConfig.js'

// a get response to check the server health  - - - -> 
mall.get("/",async(req,res)=>{

    const items = await Order.find()

   res.send(items)
})





// fetch all the food carts and show it to the user 
mall.get("/foodcarts",middleware, async (req, res) => {
    try {
      const Rfoodcarts = await redisClient.get('foodcarts');
      if (Rfoodcarts){
        return res.status(200).json(JSON.parse(Rfoodcarts));
      }

      const foodcarts = await FoodCart.find();

      redisClient.set('foodcarts', JSON.stringify(foodcarts), {
        EX: 3600 });
      res.status(200).json(foodcarts); 
    } catch (e) {
      console.error("Error fetching food carts:", e);  
      res.status(500).json({ error: "Failed to fetch food carts" });  
    }
  });



  mall.get("/foodcarts/:id/items", middleware, async (req, res) => {
    try {
      const id = req.params.id;
      
      // Validate ID format if using ObjectId
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ error: "Invalid ID format" });
      }
    
      // for redis create a new unique key 


      const key = `foodcart:${id}:items`;

      const cached_data = redisClient.get(key);

      if(cached_data){
        return res.status(200).json(JSON.parse(cached_data));
      }

      // Fetch both items and food cart name in parallel
      const [items, foodcartName] = await Promise.all([
        Item.find({ Belongsto: id }),
        FoodCart.findById(id).select('Fname').then(foodcart => foodcart ? foodcart.Fname : null)
      ]);


      
      if (!items || items.length === 0) {
        return res.status(404).json({ message: "No items found" });
      }

      if (!foodcartName) {
        return res.status(404).json({ message: "Food cart not found" });
      }
  
      // Return data with food cart name included
      const response ={
        success: true,
        foodCartName: foodcartName, // Directly use the name
        items: items,
        count: items.length
      }

      redisClient.setEx(key,3600, JSON.stringify(response));
      return res.status(200).json(response);
  
    } catch (error) {
      console.error("Error fetching items:", error);
      return res.status(500).json({ 
        success: false,
        error: "Server error while fetching items"
      });
    }
});


mall.post("/placeOrder", middleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { orders } = req.body;

    // Verify user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const createdOrders = [];
    for (const orderData of orders) {
      // Verify foodcart exists
      const foodcart = await FoodCart.findById(orderData.foodCartId);
      if (!foodcart) {
        return res.status(404).json({ message: `FoodCart ${orderData.foodCartId} not found` });
      }

      // Process items with complete details
      const items = [];
      let orderTotal = 0;

      for (const item of orderData.items) {
        // Validate item ID
        if (!mongoose.Types.ObjectId.isValid(item.itemId)) {
          return res.status(400).json({ message: 'Invalid item ID' });
        }
        
        // Store all item details
        items.push({
          name: item.name,
          price: item.price,
          veg: item.veg,
          quantity: item.quantity,
          originalItemId: item.itemId
        });
        
        orderTotal += item.price * item.quantity;
      }

      // Create the order
      const newOrder = new Order({
        items: items,
        order_total: orderTotal,
        order_status: 'preparing',
        user: userId,
        foodcart: orderData.foodCartId,
        createdAt: new Date()
      });

      const savedOrder = await newOrder.save();
      createdOrders.push(savedOrder);
    }

    res.status(201).json({
      message: 'Orders created successfully',
      orders: createdOrders,
      totalOrders: createdOrders.length
    });

  } catch (error) {
    console.error('Error creating orders:', error);
    res.status(500).json({ 
      message: 'Server error while processing orders',
      error: error.message
    });
  }
});


export default mall