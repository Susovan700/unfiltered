import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js'; 


import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import postRoutes from './routes/postRoutes.js';
import commentRoutes from './routes/commentRoutes.js';

dotenv.config({ path: "./.env" });
const app = express();


app.use(express.json());
app.use(cors({
  origin: [
    "http://localhost:3000", 
    "https://unfiltered-beta.vercel.app"
  ],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));
app.options(/(.*)/, cors());

connectDB();

app.use('/api/auth', authRoutes);     
app.use('/api/users', userRoutes);    
app.use('/api/posts', postRoutes);   
app.use('/api/comments', commentRoutes); 

app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({ message: err.message || "Internal Server Error" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));