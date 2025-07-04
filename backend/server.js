import express from "express";
import DBconfig from "./config/DBconfig.js";
import cors from 'cors'
import route from "./routes/Auth.js";
import mall from "./routes/Mall.js";
import cookieParser from "cookie-parser";
import foodcart from "./routes/foodcart.js";
const app = express();
import dotenv from 'dotenv'

dotenv.config()

app.use(express.json())
app.use(cors())
app.use(cookieParser())



// this is for the user to register and get verified ----- > 
app.use("/user",route)

// Now lets move on for users dashboards an all ----- > 
app.use("/mall",mall)

// for the food cart workers their perspective apis are here in this route ----> 
app.use("/foodcart",foodcart)
app.get("/",(req,res)=>{
    res.send("hii")
})
// Server start point and DB setup -----> `
app.listen(process.env.PORT,async(req,res)=>{
     await DBconfig()
     console.log("Server started .. ");
})

