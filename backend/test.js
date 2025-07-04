import bcrypt from "bcryptjs";



const salt = 10;



const hashed = await bcrypt.hash('8975430891',salt);

console.log(hashed)