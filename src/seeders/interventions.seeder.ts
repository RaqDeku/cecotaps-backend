import { DataSource } from 'typeorm';

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST || 'localhost',
  port: +(process.env.DATABASE_PORT || 5434),
  username: process.env.DATABASE_USERNAME || 'postgres',
  password: process.env.DATABASE_PASSWORD || 'root',
  database: process.env.DATABASE_NAME || 'cecotaps_backend',
});

interface InterventionAction {
  id: number;
  name: string;
}

const interventionActions: InterventionAction[] = [
  { id: 1, name: 'Ongoing mediation' },
  { id: 2, name: 'Security deployed' },
  { id: 3, name: 'Court process initiated' },
  { id: 4, name: 'NGO involvement' },
];

async function seedInterventionActions(dataSource: DataSource) {
  for (const action of interventionActions) {
    await dataSource.query(
      `
        INSERT INTO intervention_actions (id, name) VALUES
        ($1, $2)
        ON CONFLICT (id) DO NOTHING;
        `,
      [action.id, action.name],
    );
  }

  console.log(`Intervention Actions seeding finished ✅`);
}

async function run() {
  const dataSource: DataSource = await AppDataSource.initialize();
  try {
    await seedInterventionActions(dataSource);
  } finally {
    await dataSource.destroy();
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
