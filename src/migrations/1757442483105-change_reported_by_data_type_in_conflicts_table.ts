import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class ChangeReportedByDataTypeInConflictsTable1757442483105
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.changeColumns('conflicts', [
      {
        oldColumn: new TableColumn({
          name: 'reported_by',
          type: 'varchar',
          isNullable: true,
        }),
        newColumn: new TableColumn({
          name: 'reported_by',
          type: 'int',
          isNullable: true,
        }),
      },
      {
        oldColumn: new TableColumn({
          name: 'severity',
          type: 'enum',
          enum: ['Low', 'Medium', 'High'],
          isNullable: false,
        }),
        newColumn: new TableColumn({
          name: 'severity',
          type: 'enum',
          enum: ['low', 'medium', 'high'],
          isNullable: true,
        }),
      },
      {
        oldColumn: new TableColumn({
          name: 'severity',
          type: 'enum',
          enum: ['low', 'medium', 'high'],
          isNullable: false,
        }),
        newColumn: new TableColumn({
          name: 'severity',
          type: 'varchar',
          isNullable: true,
        }),
      },
      {
        oldColumn: new TableColumn({
          name: 'status',
          type: 'enum',
          enum: ['active', 'ongoing', 'resolved'],
          isNullable: false,
        }),
        newColumn: new TableColumn({
          name: 'status',
          type: 'varchar',
          isNullable: true,
        }),
      },
    ]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.changeColumns('conflicts', [
      {
        oldColumn: new TableColumn({
          name: 'reported_by',
          type: 'int',
          isNullable: true,
        }),
        newColumn: new TableColumn({
          name: 'reported_by',
          type: 'varchar',
          isNullable: true,
        }),
      },
      {
        oldColumn: new TableColumn({
          name: 'severity',
          type: 'varchar',
          isNullable: false,
        }),
        newColumn: new TableColumn({
          name: 'severity',
          type: 'enum',
          enum: ['low', 'medium', 'high'],
          isNullable: true,
        }),
      },
      {
        oldColumn: new TableColumn({
          name: 'status',
          type: 'varchar',
          isNullable: false,
        }),
        newColumn: new TableColumn({
          name: 'status',
          type: 'enum',
          enum: ['active', 'ongoing', 'resolved'],
          isNullable: true,
        }),
      },
    ]);
  }
}
