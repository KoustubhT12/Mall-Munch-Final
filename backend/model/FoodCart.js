import mongoose from "mongoose";



const FoodcartSchema = mongoose.Schema({

 Fname:{ 
    type:String,
    required:true
 },
 Image:{
    type:String,
 },
Rating:{
    type:Number,
    max:[5,"cant be more  ...! "]
},
Email:{
   type:String,
},
 
 Username:{
   type:String,
 },
 Password:{
    type:String
 }
 

})


const FoodCart = mongoose.model('FoodCart',FoodcartSchema);

export default FoodCart;