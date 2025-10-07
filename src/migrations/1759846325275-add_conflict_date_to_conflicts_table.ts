import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddConflictDateToConflictsTable1759846325275
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'conflicts',
      new TableColumn({
        name: 'conflict_date',
        type: 'date',
        isNullable: true,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('conflicts', 'conflict_date');
  }
}
