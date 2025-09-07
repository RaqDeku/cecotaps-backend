import {
  MigrationInterface,
  QueryRunner,
  TableColumn,
  TableForeignKey,
} from 'typeorm';

export class UpdateConflictLocationsColumnDataTypes1756891678089
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'conflict_locations',
      new TableColumn({
        name: 'conflict_id',
        type: 'int',
        isNullable: false,
      }),
    );

    await queryRunner.changeColumns('conflict_locations', [
      {
        oldColumn: new TableColumn({
          name: 'region',
          type: 'varchar',
          isNullable: false,
        }),
        newColumn: new TableColumn({
          name: 'region_id',
          type: 'int',
          isNullable: false,
        }),
      },
      {
        oldColumn: new TableColumn({
          name: 'district',
          type: 'varchar',
          isNullable: false,
        }),
        newColumn: new TableColumn({
          name: 'district_id',
          type: 'int',
          isNullable: false,
        }),
      },
    ]);

    await queryRunner.dropColumn('conflict_locations', 'town');

    await queryRunner.createForeignKeys('conflict_locations', [
      new TableForeignKey({
        columnNames: ['region_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'regions',
      }),
      new TableForeignKey({
        columnNames: ['district_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'districts',
      }),
      new TableForeignKey({
        columnNames: ['conflict_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'conflicts',
      }),
    ]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('conflict_locations');
    if (table) {
      const foreignKeys = table.foreignKeys.filter(
        (fk) =>
          fk.columnNames.includes('region_id') ||
          fk.columnNames.includes('district_id') ||
          fk.columnNames.includes('conflict_id'),
      );
      await queryRunner.dropForeignKeys('conflict_locations', foreignKeys);
    }

    await queryRunner.dropColumn('conflict_locations', 'conflict_id');

    await queryRunner.changeColumns('conflict_locations', [
      {
        oldColumn: new TableColumn({
          name: 'region_id',
          type: 'int',
          isNullable: false,
        }),
        newColumn: new TableColumn({
          name: 'region',
          type: 'varchar',
          isNullable: false,
        }),
      },
      {
        oldColumn: new TableColumn({
          name: 'district_id',
          type: 'int',
          isNullable: false,
        }),
        newColumn: new TableColumn({
          name: 'district',
          type: 'varchar',
          isNullable: false,
        }),
      },
    ]);

    await queryRunner.addColumn(
      'conflict_locations',
      new TableColumn({
        name: 'town',
        type: 'varchar',
        isNullable: false,
      }),
    );
  }
}
