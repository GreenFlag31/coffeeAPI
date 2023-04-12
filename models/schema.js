import mongoose from 'mongoose';

const coffeeSchema = new mongoose.Schema(
  {
    type: { type: String, required: true },
    origin: [
      { region: { type: String, required: true }, countries: [{ type: String, required: true }] },
    ],
    characteristics: {
      flavor: { type: String, required: true },
      body: { type: String, required: true },
      caffeine_content: { type: String, required: true },
      roast_profile: { type: String, required: true },
      brewing_methods: [{ type: String, required: true }],
      recommended_pairing: [{ type: String, required: true }],
    },
    other_names: [{ type: String, required: true }],
    history: { type: String, required: true },
    cultivation: {
      growing_altitude: { type: String, required: true },
      preferred_climate: { type: String, required: true },
      harvesting_method: { type: String, required: true },
    },
    processing_methods: [{ type: String, required: true }],
    popular_varieties: [{ type: String, required: true }],
    notable_regions: [{ type: String, required: true }],
  },
  { collection: 'coffee' }
);

const Coffee = mongoose.model('Coffee', coffeeSchema);
export { Coffee };
