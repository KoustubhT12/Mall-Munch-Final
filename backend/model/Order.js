import mongoose, { Mongoose } from "mongoose";





const OrderSchema = new mongoose.Schema({
    items: [{
      name: { type: String, required: true },
      price: { type: Number, required: true },
      veg: { type: Boolean, required: true },
      quantity: { type: Number, required: true },
      originalItemId: { type: mongoose.Types.ObjectId }
    }],
    order_total: { type: Number, required: true },
    order_status: {
      type: String,
      enum: ['preparing', 'ready', 'picked up'],
      default: 'preparing'
    },
    user: {
      type: mongoose.Types.ObjectId,
      ref: 'User',
      required: true
    },
    foodcart: {
      type: mongoose.Types.ObjectId,
      ref: 'FoodCart',
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    order_rating: {
        type: Number,
        min: 1,
        max: 5,
        default: null
  }
});
const Order = mongoose.model("order",OrderSchema);

export default Order;