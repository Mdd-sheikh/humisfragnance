import express from 'express';
import cors from 'cors';
import UserRouter from './routes/userRouter.js';
import connectDb from './config/db.js';
import dotenv from 'dotenv'
import Attarrouter from './routes/attarRouter.js';
import cartRouter from './routes/cartRouter.js';
import Profilerouter from './routes/profileRouter.js';
import AddressRouter from './routes/addressRoute.js';
import placeorderRouter from './routes/placeorderRouter.js';
import BlogRoute from './routes/BlogRoute.js';

dotenv.config()

const app = express();
const port = process.env.PORT || 5000;

app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));


// api endspoints
app.use("/api/auth", UserRouter);
app.use("/api/product", Attarrouter);
app.use("/api/cart", cartRouter);
app.use("/api/profile",Profilerouter);
app.use("/api/personal/address",AddressRouter);
app.use("/api/order", placeorderRouter); 
app.use("/api/blog",BlogRoute)



// database connection
connectDb()

app.get("/", (req, res) => {
    res.send("server is running");
})

app.listen(port, () => {
    console.log(`server is running on port http://localhost:${port}`);
}) 