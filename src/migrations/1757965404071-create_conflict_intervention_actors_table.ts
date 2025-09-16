import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';

export class CreateConflictInterventionActorsTable1757965404071
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'conflict_intervention_actors',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'conflict_intervention_id',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'actor_id',
            type: 'int',
            isNullable: false,
          },
        ],
      }),
    );

    await queryRunner.createForeignKeys('conflict_intervention_actors', [
      new TableForeignKey({
        columnNames: ['conflict_intervention_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'conflict_interventions',
      }),
      new TableForeignKey({
        columnNames: ['actor_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'actors',
      }),
    ]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('conflict_intervention_actors');
    if (table) {
      const foreignKeys = table.foreignKeys.filter(
        (fk) =>
          fk.columnNames.includes('actor_id') ||
          fk.columnNames.includes('conflict_intervention_id'),
      );
      await queryRunner.dropForeignKeys(
        'conflict_intervention_actors',
        foreignKeys,
      );
    }
    await queryRunner.dropTable('conflict_intervention_actors');
  }
}
