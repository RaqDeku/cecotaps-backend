import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { DataSource } from 'typeorm';

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST || 'localhost',
  port: +(process.env.DATABASE_PORT || 5434),
  username: process.env.DATABASE_USERNAME || 'postgres',
  password: process.env.DATABASE_PASSWORD || 'root',
  database: process.env.DATABASE_NAME || 'cecotaps_backend',
  ssl: Boolean(process.env.DATABASE_SSL) && {
    rejectUnauthorized: Boolean(process.env.DATABASE_REJECT_UNAUTHORIZED),
    ca: fs
      .readFileSync(path.resolve(process.cwd(), process.env.DATABASE_SSL_CA!))
      .toString(),
  },
});

interface Actor {
  id: number;
  name: string;
}

const actors: Actor[] = [
  { id: 1, name: 'Traditional authorities' },
  { id: 2, name: 'Political parties' },
  { id: 3, name: 'Armed groups' },
  { id: 4, name: 'Youth groups' },
  { id: 5, name: 'Religious groups/organizations' },
  { id: 6, name: 'Government agencies' },
  { id: 7, name: 'Security forces' },
];

async function seedActors(dataSource: DataSource) {
  for (const actor of actors) {
    await dataSource.query(
      `
        INSERT INTO actors (id, name) VALUES
        ($1, $2)
        ON CONFLICT (id) DO NOTHING;
        `,
      [actor.id, actor.name],
    );
  }

  console.log(`Actors seeding finished ✅`);
}

async function run() {
  const dataSource: DataSource = await AppDataSource.initialize();
  try {
    await seedActors(dataSource);
  } finally {
    await dataSource.destroy();
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
