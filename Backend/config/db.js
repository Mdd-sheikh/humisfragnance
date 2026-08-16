import mongoose from "mongoose";
import dotenv from 'dotenv'

// connect to database 

const connectDb = async (req, res) => {
    try {
        await mongoose.connect(process.env.MONGO_URL, {
            tls: true,
            tlsAllowInvalidCertificates: false,
        })
        console.log("connect to db")

    } catch (error) {
        console.log("not connected", error)
    }
}

export default connectDb;