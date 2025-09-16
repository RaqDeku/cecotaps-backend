import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddOutcomeFieldToConflictInterventionsTable1757964446371
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('conflict_interventions', 'intervention_type');
    await queryRunner.addColumn(
      'conflict_interventions',
      new TableColumn({
        name: 'outcome',
        type: 'text',
        isNullable: true,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('conflict_interventions', 'outcome');
    await queryRunner.addColumn(
      'conflict_interventions',
      new TableColumn({
        name: 'intervention_type',
        type: 'varchar',
        isNullable: false,
      }),
    );
  }
}
