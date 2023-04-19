import express from 'express';
import apicache from 'apicache';
import { Coffee } from '../models/schema.js';
const cache = apicache.middleware;

const coffeeRouter = express.Router();
coffeeRouter.use(cache('24 hours'));

const coffeeTypes = ['arabica', 'robusta', 'liberica', 'excelsa'];
const regions = ['africa', 'america', 'arabia', 'asia'];
const methods = ['drip', 'pour-over', 'french-press', 'expresso', 'cold-brew', 'moka-pot'];
let countries = [
  'Guatemala',
  'Honduras',
  'El-Salvador',
  'Costa-Rica',
  'Panama',
  'Mexico',
  'Brazil',
  'Colombia',
  'Peru',
  'Ecuador',
  'Bolivia',
  'Ethiopia',
  'Kenya',
  'Tanzania',
  'Uganda',
  'Rwanda',
  'Burundi',
  'Yemen',
  'India',
  'Indonesia',
  'Papua-New-Guinea',
  'Ivory-Coast',
  'Cameroon',
  'Nigeria',
  'Vietnam',
  'Indonesia',
  'India',
  'Thailand',
  'Liberia',
  'Sierra-Leone',
  'Vietnam',
  'Cambodia',
  'Thailand',
];

coffeeRouter.get('/', async (req, res) => {
  try {
    const coffeeData = await sortDataRemoveIDs();
    res.status(200).json(coffeeData);
  } catch (error) {
    res.status(500).json({ error: 'An error occured' });
  }
});

coffeeRouter.get('/type/:type', async (req, res) => {
  try {
    req.params.type = req.params.type?.trim().toLowerCase();
    if (req.params.type !== undefined && coffeeTypes.indexOf(req.params.type) === -1) {
      throw Error('Invalid type');
    }

    const coffeeData = (await sortDataRemoveIDs()).filter(
      (coffee) => coffee.type.toLowerCase() === req.params.type
    );
    res.status(200).json(coffeeData);
  } catch (error) {
    if (error.message.includes('Invalid')) {
      incorrectEntry(res, error.message, 'Valid types are of type', coffeeTypes);
    } else {
      res.status(500).json({ error: 'An error occured' });
    }
  }
});

coffeeRouter.get('/region/:region', async (req, res) => {
  try {
    req.params.region = req.params.region?.trim().toLowerCase();
    if (req.params.region !== undefined && !regions.includes(req.params.region)) {
      throw Error('Invalid region');
    }

    const coffees = await sortDataRemoveIDs();
    const selectedCoffees = [];

    for (const coffee of coffees) {
      for (const origin of coffee.origin) {
        if (origin.region.toLowerCase().includes(req.params.region)) {
          selectedCoffees.push(coffee);
          break;
        }
      }
    }

    res.status(200).json(selectedCoffees);
  } catch (error) {
    if (error.message.includes('region')) {
      incorrectEntry(res, error.message, 'Valid regions are', regions);
    } else {
      res.status(500).json({ error: 'An error occured' });
    }
  }
});

coffeeRouter.get('/country/:country', async (req, res) => {
  try {
    req.params.country = req.params.country?.trim().toLowerCase();
    countries = countries.map((country) => country.toLowerCase());
    if (req.params.country !== undefined && countries.indexOf(req.params.country) === -1) {
      throw Error('Invalid country name');
    }

    const coffees = await sortDataRemoveIDs();
    const selectedCountry = [];

    for (const coffee of coffees) {
      for (const origin of coffee.origin) {
        const countryIsPresent = origin.countries
          .map((country) => country.toLowerCase())
          .includes(req.params.country);

        if (countryIsPresent) {
          selectedCountry.push(coffee);
          break;
        }
      }
    }
    res.status(200).json(selectedCountry);
  } catch (error) {
    if (error.message.includes('Invalid')) {
      incorrectEntry(
        res,
        error.message,
        'Valid country names for coffee production are',
        countries
      );
    } else {
      res.status(500).json({ error: 'An error occured' });
    }
  }
});

coffeeRouter.get('/brewing_methods/:method', async (req, res) => {
  try {
    req.params.method = req.params.method?.trim().toLowerCase();
    if (req.params.method !== undefined && methods.indexOf(req.params.method) === -1) {
      throw Error('Invalid brewing method');
    }

    const coffeeData = (await sortDataRemoveIDs()).filter((coffee) =>
      coffee.characteristics.brewing_methods
        .map((method) => method.toLowerCase())
        .includes(req.params.method)
    );
    res.status(200).json(coffeeData);
  } catch (error) {
    if (error.message.includes('Invalid')) {
      incorrectEntry(res, error.message, 'Valid brewing methods are', methods);
    } else {
      res.status(500).json({ error: 'An error occured' });
    }
  }
});

coffeeRouter.use((req, res, next) => {
  res.status(404).json({ error: 'Invalid endpoint' });
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

export { coffeeRouter };
