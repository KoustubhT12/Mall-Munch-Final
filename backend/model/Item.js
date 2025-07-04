    import mongoose, { mongo, Mongoose } from "mongoose";




    const ItemSchema = mongoose.Schema({
        
    name:{ 
        type:String,
        required:[true,"name is required!"]
    },
    price:{     
        type:Number,
        required:[true,'price is required!']
    },
    Description:{
        type:String
    },
    IRating:{ 
    type:Number,
    max:[5,"max rating needs to be 5 !"]
    },
    Belongsto:{
        type:mongoose.Types.ObjectId,
        ref:'FoodCart',
        required:true 
    },
    veg:{
    type:Boolean,
    required:true
    }

    })


    const Item = mongoose.model('Item',ItemSchema);

    export default Item;