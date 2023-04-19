import functions from 'firebase-functions';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import { coffeeRouter } from './routes/coffee.js';
import dotenv from 'dotenv';
dotenv.config();

const corsOptions = {
  origin: '*',
  methods: 'GET',
  preflightContinue: false,
  optionsSuccessStatus: 204,
};
const app = express();
app.use(cors(corsOptions));

app.use(express.json());
mongoose.connect(process.env.DATABASE_URI);
app.use('/coffee', coffeeRouter);

export const api = functions.https.onRequest(app);
