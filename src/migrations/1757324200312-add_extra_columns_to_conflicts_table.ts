import {
  MigrationInterface,
  QueryRunner,
  TableColumn,
  TableForeignKey,
} from 'typeorm';

export class AddExtraColumnsToConflictsTable1757324200312
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumns('conflicts', [
      new TableColumn({
        name: 'approval_status',
        type: 'enum',
        enum: ['pending', 'approved', 'rejected'],
        isNullable: false,
        default: "'pending'",
      }),
      new TableColumn({
        name: 'approved_by',
        type: 'int',
        isNullable: true,
      }),
    ]);

    await queryRunner.createForeignKey(
      'conflicts',
      new TableForeignKey({
        columnNames: ['approved_by'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('conflicts');
    if (table) {
      const foreignKeys = table.foreignKeys.filter((fk) =>
        fk.columnNames.includes('approved_by'),
      );
      await queryRunner.dropForeignKeys('conflicts', foreignKeys);
    }

    await queryRunner.dropColumns('conflicts', [
      'approval_status',
      'approved_by',
    ]);
  }
}
