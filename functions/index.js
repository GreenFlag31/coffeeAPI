import functions from 'firebase-functions';
import express from 'express';
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
const app = express(corsOptions);
// if behind a proxy, the IP address might be the one from the proxy, making the limit globally. This is not the desired behaviour.
//https://www.npmjs.com/package/express-rate-limit
app.set('trust proxy', 2);

app.use(express.json());

mongoose.connect(process.env.DATABASE_URI);
const db = mongoose.connection;
db.on('error', (error) => console.error(error));
db.on('open', () => console.log('connected to database'));

app.use('/coffee', coffeeRouter);

export const api = functions.https.onRequest(app);
