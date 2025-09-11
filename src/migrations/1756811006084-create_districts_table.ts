import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';

export class CreateDistrictsTable1756811006084 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'districts',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'name',
            type: 'varchar',
            isNullable: false,
            isUnique: true,
          },
          {
            name: 'region_id',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'geom',
            type: 'geometry(MULTIPOLYGON, 4326)',
            // srid: 4326,
            isNullable: false,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'deleted_at',
            type: 'timestamp',
            isNullable: true,
          },
        ],
      }),
    );

    await queryRunner.createForeignKey(
      'districts',
      new TableForeignKey({
        columnNames: ['region_id'],
        referencedTableName: 'regions',
        referencedColumnNames: ['id'],
        // onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('districts');
    const foreignKey = table?.foreignKeys.find(
      (fk) => fk.columnNames.indexOf('region_id') !== -1,
    );
    if (foreignKey) {
      await queryRunner.dropForeignKey('districts', foreignKey);
    }
    await queryRunner.dropTable('districts');
  }
}
