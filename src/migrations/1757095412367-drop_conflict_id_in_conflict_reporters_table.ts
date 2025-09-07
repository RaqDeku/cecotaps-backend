import {
  MigrationInterface,
  QueryRunner,
  TableColumn,
  TableForeignKey,
} from 'typeorm';

export class DropConflictIdInConflictReportersTable1757095412367
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('conflict_reporters');
    const foreignKey = table?.foreignKeys.find(
      (fk) => fk.columnNames.indexOf('conflict_id') !== -1,
    );

    if (foreignKey) {
      await queryRunner.dropForeignKey('conflict_reporters', foreignKey);
    }

    await queryRunner.dropColumn('conflict_reporters', 'conflict_id');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'conflict_reporters',
      new TableColumn({
        name: 'conflict_id',
        type: 'int',
        isNullable: false,
      }),
    );

    await queryRunner.createForeignKey(
      'conflict_reporters',
      new TableForeignKey({
        columnNames: ['conflict_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'conflicts',
      }),
    );
  }
}
