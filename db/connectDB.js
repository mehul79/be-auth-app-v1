import mongoose from "mongoose";

export const connectDB = async ()=>{
    try{
        await mongoose.connect(process.env.MONOGO_URI);
        console.log("MONGO DB Connected");
    }catch(e){
        console.log("Error while connected to db", e);
        process.exit(1); 
    }
}