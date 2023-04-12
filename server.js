import express from 'express';
import mongoose from 'mongoose';
import { Coffee } from './models/schema.js';

import dotenv from 'dotenv';
dotenv.config();

const app = express();
app.listen(3000);
app.use(express.json());

mongoose.connect(process.env.DATABASE_URI);
const db = mongoose.connection;
db.on('error', (error) => console.error(error));
db.on('open', () => console.log('connected to database'));

const coffeeTypes = ['arabica', 'robusta', 'liberica', 'excelsa'];

app.get('/coffee', async (req, res) => {
  try {
    req.query.type = req.query.type?.trim().toLowerCase();
    if (req.query.type !== undefined && coffeeTypes.indexOf(req.query.type) === -1) {
      throw Error('Invalid type');
    }

    const coffeeData = (await sortDataRemoveIDs()).filter(
      (coffee) => coffee.type.toLowerCase() === (req.query.type || coffee.type.toLowerCase())
    );
    res.status(200).json(coffeeData);
  } catch (error) {
    if (error.message.includes('Invalid')) {
      incorrectEntry(res, error.message, 'Valid types are of type', coffeeTypes);
    } else {
      res.status(500).json({ message: 'An error occured' });
    }
  }
});

const regions = ['africa', 'america', 'arabia', 'asia', 'brazil'];

app.get('/coffee/origin', async (req, res) => {
  try {
    req.query.region = req.query.region?.trim().toLowerCase();
    if (req.query.region !== undefined && !regions.includes(req.query.region)) {
      throw Error('Invalid region');
    } else if (!req.query.region) {
      throw Error('Invalid endpoint');
    }

    const coffees = await sortDataRemoveIDs();
    const selectedCoffees = [];

    for (const coffee of coffees) {
      for (const origin of coffee.origin) {
        if (origin.region.toLowerCase().includes(req.query.region)) {
          selectedCoffees.push(coffee);
          break;
        }
      }
    }

    res.status(200).json(selectedCoffees);
  } catch (error) {
    if (error.message.includes('region')) {
      incorrectEntry(res, error.message, 'Valid regions are', regions);
    } else if (error.message.includes('Invalid')) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ message: 'An error occured' });
    }
  }
});

function incorrectEntry(res, errorMessage, messageContent, conditions) {
  res
    .status(404)
    .json({ error: errorMessage, message: messageContent + ': ' + conditions.join(', ') });
}

async function sortDataRemoveIDs() {
  const data = await Coffee.aggregate([
    {
      $project: {
        _id: 0,
        type: 1,
        origin: 1,
        characteristics: 1,
        other_names: 1,
        history: 1,
        cultivation: 1,
        processing_methods: 1,
        popular_varieties: 1,
        notable_regions: 1,
      },
    },
    {
      $addFields: {
        origin: {
          $map: {
            input: '$origin',
            in: {
              region: '$$this.region',
              countries: '$$this.countries',
            },
          },
        },
      },
    },
  ]);
  return data;
}
