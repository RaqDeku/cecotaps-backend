import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';

export class CreateSourcesTable1756726709956 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'sources',
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
            name: 'source_name',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'source_type',
            type: 'enum',
            enum: ['Media', 'Community', 'NGO', 'Gov'],
            isNullable: false,
          },
          {
            name: 'reference_link',
            type: 'text',
            isNullable: true,
          },
        ],
      }),
    );

    await queryRunner.createForeignKey(
      'sources',
      new TableForeignKey({
        columnNames: ['conflict_id'],
        referencedTableName: 'conflicts',
        referencedColumnNames: ['id'],
        // onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('sources');
    const foreignKey = table?.foreignKeys.find(
      (fk) => fk.columnNames.indexOf('conflict_id') !== -1,
    );
    if (foreignKey) {
      await queryRunner.dropForeignKey('sources', foreignKey);
    }
    await queryRunner.dropTable('sources');
  }
}
