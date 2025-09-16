import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';

export class CreateConflictInterventionActionsTable1757972796989
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'conflict_intervention_actions',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'intervention_action_id',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'conflict_id',
            type: 'int',
            isNullable: false,
          },
        ],
      }),
    );

    await queryRunner.createForeignKeys('conflict_intervention_actions', [
      new TableForeignKey({
        columnNames: ['intervention_action_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'intervention_actions',
      }),
      new TableForeignKey({
        columnNames: ['conflict_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'conflicts',
      }),
    ]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('conflict_intervention_actions');
    if (table) {
      const foreignKeys = table.foreignKeys.filter(
        (fk) =>
          fk.columnNames.includes('intervention_action_id') ||
          fk.columnNames.includes('conflict_id'),
      );
      await queryRunner.dropForeignKeys(
        'conflict_intervention_actions',
        foreignKeys,
      );
    }
    await queryRunner.dropTable('conflict_intervention_actions');
  }
}
