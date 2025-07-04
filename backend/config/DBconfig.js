import mongoose from "mongoose"
import dotenv from "dotenv"
dotenv.config();

const DBconfig = async() => {
 

    try{
    await mongoose.connect(process.env.MONGO_URI);
    console.log("the database is connected !")
    }
    catch(e){
        console.log("Database issues !")
    }

}



export default DBconfig
