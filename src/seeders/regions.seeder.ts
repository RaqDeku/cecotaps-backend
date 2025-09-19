import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { DataSource } from 'typeorm';

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST,
  port: +process.env.DATABASE_PORT!,
  username: process.env.DATABASE_USERNAME,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  ssl: Boolean(process.env.DATABASE_SSL) && {
    rejectUnauthorized: Boolean(process.env.DATABASE_REJECT_UNAUTHORIZED),
    ca: fs
      .readFileSync(path.resolve(process.cwd(), process.env.DATABASE_SSL_CA!))
      .toString(),
  },
});

interface Region {
  id: number;
  name: string;
}

const regions: Region[] = [
  { id: 1, name: 'Ahafo' },
  { id: 2, name: 'Ashanti' },
  { id: 3, name: 'Bono' },
  { id: 4, name: 'Bono East' },
  { id: 5, name: 'Central' },
  { id: 6, name: 'Eastern' },
  { id: 7, name: 'Greater Accra' },
  { id: 8, name: 'North East' },
  { id: 9, name: 'Northern' },
  { id: 10, name: 'Oti' },
  { id: 11, name: 'Savannah' },
  { id: 12, name: 'Upper East' },
  { id: 13, name: 'Upper West' },
  { id: 14, name: 'Volta' },
  { id: 15, name: 'Western' },
  { id: 16, name: 'Western North' },
];

async function seedRegions(dataSource: DataSource) {
  for (const region of regions) {
    await dataSource.query(
      `
        INSERT INTO regions (id, name) VALUES
        ($1, $2)
        ON CONFLICT (id) DO NOTHING;
        `,
      [region.id, region.name],
    );
  }

  console.log(`Regions seeding finished`);
}

async function run() {
  const dataSource: DataSource = await AppDataSource.initialize();
  try {
    await seedRegions(dataSource);
  } finally {
    await dataSource.destroy();
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
