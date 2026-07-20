import express from 'express';
import cors from 'cors';

const app = express();
const port = process.env.PORT || 5000;

app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));


// api endspoints




// database connection


app.get("/", (req, res) => {
    res.send("server is running");
})

app.listen(port, () => {
    console.log(`server is running on port http://localhost:${port}`);
})