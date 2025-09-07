import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';

export class CreateConflictInterventionsTable1756726958015
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'conflict_interventions',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'conflict_id',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'date',
            type: 'date',
            isNullable: false,
          },
          {
            name: 'intervention_type',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true,
          },
        ],
      }),
    );

    await queryRunner.createForeignKey(
      'conflict_interventions',
      new TableForeignKey({
        columnNames: ['conflict_id'],
        referencedTableName: 'conflicts',
        referencedColumnNames: ['id'],
        // onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('conflict_interventions');
    const foreignKey = table?.foreignKeys.find(
      (fk) => fk.columnNames.indexOf('conflict_id') !== -1,
    );
    if (foreignKey) {
      await queryRunner.dropForeignKey('conflict_interventions', foreignKey);
    }
    await queryRunner.dropTable('conflict_interventions');
  }
}
