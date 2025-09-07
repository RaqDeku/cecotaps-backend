import {
  MigrationInterface,
  QueryRunner,
  TableColumn,
  TableForeignKey,
} from 'typeorm';

export class DropConflictIdInConflictLocationsTable1757094695795
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('conflict_locations');
    const foreignKey = table?.foreignKeys.find(
      (fk) => fk.columnNames.indexOf('conflict_id') !== -1,
    );

    if (foreignKey) {
      await queryRunner.dropForeignKey('conflict_locations', foreignKey);
    }

    await queryRunner.dropColumn('conflict_locations', 'conflict_id');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'conflict_locations',
      new TableColumn({
        name: 'conflict_id',
        type: 'int',
        isNullable: false,
      }),
    );

    await queryRunner.createForeignKey(
      'conflict_locations',
      new TableForeignKey({
        columnNames: ['conflict_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'conflicts',
      }),
    );
  }
}
