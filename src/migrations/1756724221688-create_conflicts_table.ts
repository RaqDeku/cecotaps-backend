import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';

export class CreateConflictsTable1756724221688 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'conflicts',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'conflict_type',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'title',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'location_id',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'severity',
            type: 'enum',
            enum: ['Low', 'Medium', 'High'],
            isNullable: false,
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['Active', 'Ongoing', 'Resolved'],
            isNullable: false,
          },
          {
            name: 'dated_reported',
            type: 'date',
            isNullable: false,
          },
          {
            name: 'last_updated',
            type: 'timestamp',
            isNullable: false,
          },
          {
            name: 'description',
            type: 'text',
            isNullable: false,
          },
          {
            name: 'reported_by',
            type: 'varchar',
            isNullable: true,
          },
        ],
      }),
    );

    await queryRunner.createForeignKey(
      'conflicts',
      new TableForeignKey({
        columnNames: ['location_id'],
        referencedTableName: 'conflict_locations',
        referencedColumnNames: ['id'],
        // onDelete: 'CASCADE',
        // onUpdate: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('conflicts');
    const foreignKey = table?.foreignKeys.find(
      (fk) => fk.columnNames.indexOf('location_id') !== -1,
    );
    if (foreignKey) {
      await queryRunner.dropForeignKey('conflicts', foreignKey);
    }
    await queryRunner.dropTable('conflicts');
  }
}
