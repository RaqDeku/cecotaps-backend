import { MigrationInterface, QueryRunner, TableForeignKey } from 'typeorm';

export class AddCascadeOnDeleteToConflictsTable1759789487299
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('conflict_uploads');
    if (!table) return;

    const oldForeignKey = table.foreignKeys.find(
      (fk) => fk.columnNames.indexOf('conflict_id') !== -1,
    );
    if (oldForeignKey) {
      await queryRunner.dropForeignKey('conflict_uploads', oldForeignKey);
    }

    await queryRunner.createForeignKey(
      'conflict_uploads',
      new TableForeignKey({
        columnNames: ['conflict_id'],
        referencedTableName: 'conflicts',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('conflict_uploads');
    if (!table) return;

    const cascadeForeignKey = table.foreignKeys.find(
      (fk) => fk.columnNames.indexOf('conflict_id') !== -1,
    );
    if (cascadeForeignKey) {
      await queryRunner.dropForeignKey('conflict_uploads', cascadeForeignKey);
    }

    await queryRunner.createForeignKey(
      'conflict_uploads',
      new TableForeignKey({
        columnNames: ['conflict_id'],
        referencedTableName: 'conflicts',
        referencedColumnNames: ['id'],
      }),
    );
  }
}
