import { Server } from 'http';
import mongoose from 'mongoose';
import config from './app/config';
import app from './app';
import seedAdmin from './app/db/seedAdmin';
import Service from './app/modules/service/service.model';
let server: Server;

async function main() {
  try {
    console.log('Attempting to connect to the database...');
    await mongoose.connect(config.database_url as string);
    console.log('Database connection established successfully.');

    server = app.listen(config.port, () => {
      console.log(`App listening on port ${config.port}`);
    });

    seedAdmin();
    // const seedServices = async () => {
    //   try {
    //     await Service.insertMany([
    //       { type: 'snow-plowing' },
    //       { type: 'snow-shoveling' },
    //       { type: 'salting-deicing' },
    //       { type: 'lawn-mowing' },
    //       { type: 'landscaping' },
    //       { type: 'seasonal-contracts' },
    //     ]);
    //     console.log('All service types inserted successfully!');
    //   } catch (error) {
    //     console.error('Error inserting service types:', error);
    //   }
    // };

    // // call the seed function
    // seedServices();
  } catch (error) {
    console.error('Error connecting to the database:', error);
  }
}

main();
process.on('unhandledRejection', (err) => {
  console.log(` unhandledRejection is Detected , process exit`);
  console.log(err);
  if (server) {
    server.close(() => {
      process.exit(1);
    });
  }
  process.exit(1);
});
process.on('uncaughtException', () => {
  console.log(` uncaughtException is Detected , process exit`);
  process.exit(1);
});
