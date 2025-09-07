import { DataSource } from 'typeorm';

const url = 'https://geodata.ucdavis.edu/gadm/gadm4.1/json/gadm41_GHA_2.json';

export async function seedDistricts(dataSource: DataSource) {
  console.log('Downloading Ghana ADM2 GeoJSON...');
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Download failed: ${res.statusText}`);
  const geojson = await res.json();

  console.log('Processing districts...');
  const features = geojson.features;
  console.log(features[5]);

  let inserted = 0;

  for (const f of features) {
    const regionName = splitCamelCase(f.properties.NAME_1?.trim());
    const district = splitCamelCase(f.properties.NAME_2?.trim());
    const geom = JSON.stringify(f.geometry);

    // Query to find the region_id based on the region name
    const region = await dataSource.query(
      `SELECT id FROM regions WHERE name = $1`,
      [regionName],
    );

    // Check if region was found
    if (!region || region.length === 0) {
      console.warn(
        `Region not found for name: ${regionName}, skipping district: ${district}`,
      );
      continue;
    }

    const regionId = region[0].id;

    // Insert into districts with region_id
    await dataSource.query(
      `
    INSERT INTO districts (name, region_id, geom)
    VALUES ($1, $2, ST_SetSRID(ST_GeomFromGeoJSON($3), 4326))
    ON CONFLICT (name) DO NOTHING
    `,
      [district, regionId, geom],
    );

    inserted++;
  }

  console.log(`✅ Inserted ${inserted} districts into Postgres`);
}

function splitCamelCase(input: string): string {
  const [first, ...rest] = input.replace(/([a-z])([A-Z])/g, '$1 $2').split(' ');
  return `${first} ${rest.join(' ')}`.trim();
}

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST || 'localhost',
  port: +(process.env.DATABASE_PORT || 5434),
  username: process.env.DATABASE_USERNAME || 'postgres',
  password: process.env.DATABASE_PASSWORD || 'root',
  database: process.env.DATABASE_NAME || 'cecotaps_backend',
});

async function run() {
  const dataSource: DataSource = await AppDataSource.initialize();
  try {
    await seedDistricts(dataSource);
  } finally {
    await dataSource.destroy();
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
