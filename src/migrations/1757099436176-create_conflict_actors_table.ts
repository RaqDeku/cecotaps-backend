import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';

export class CreateConflictActorsTable1757099436176
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'conflict_actors',
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
            name: 'actor_id',
            type: 'int',
            isNullable: false,
          },
        ],
      }),
    );

    await queryRunner.createForeignKeys('conflict_actors', [
      new TableForeignKey({
        columnNames: ['conflict_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'conflicts',
      }),
      new TableForeignKey({
        columnNames: ['actor_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'actors',
      }),
    ]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('conflict_actors');
    if (table) {
      const foreignKeys = table.foreignKeys.filter(
        (fk) =>
          fk.columnNames.includes('actor_id') ||
          fk.columnNames.includes('conflict_id'),
      );
      await queryRunner.dropForeignKeys('conflict_actors', foreignKeys);
    }
    await queryRunner.dropTable('conflict_actors');
  }
}
