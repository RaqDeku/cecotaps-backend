import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';

export class CreateConflictMediaTable1756727903193
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'conflict_uploads',
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
            name: 'url',
            type: 'text',
            isNullable: true,
          },
        ],
      }),
    );

    await queryRunner.createForeignKey(
      'conflict_uploads',
      new TableForeignKey({
        columnNames: ['conflict_id'],
        referencedTableName: 'conflicts',
        referencedColumnNames: ['id'],
        // onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('conflict_uploads');
    const foreignKey = table?.foreignKeys.find(
      (fk) => fk.columnNames.indexOf('conflict_id') !== -1,
    );
    if (foreignKey) {
      await queryRunner.dropForeignKey('conflict_uploads', foreignKey);
    }
    await queryRunner.dropTable('conflict_uploads');
  }
}
