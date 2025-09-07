import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class ChangeDateReportedColumnNameInConflictsTable1756898973224
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.changeColumns('conflicts', [
      {
        oldColumn: new TableColumn({
          name: 'title',
          type: 'varchar',
          isNullable: false,
        }),
        newColumn: new TableColumn({
          name: 'title',
          type: 'varchar',
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
          name: 'status',
          type: 'enum',
          enum: ['Active', 'Ongoing', 'Resolved'],
          isNullable: false,
        }),
        newColumn: new TableColumn({
          name: 'status',
          type: 'enum',
          enum: ['active', 'ongoing', 'resolved'],
          isNullable: true,
        }),
      },
      {
        oldColumn: new TableColumn({
          name: 'description',
          type: 'text',
          isNullable: false,
        }),
        newColumn: new TableColumn({
          name: 'description',
          type: 'text',
          isNullable: true,
        }),
      },
      {
        oldColumn: new TableColumn({
          name: 'dated_reported',
          type: 'date',
          isNullable: false,
        }),
        newColumn: new TableColumn({
          name: 'date_reported',
          type: 'date',
          isNullable: false,
        }),
      },
    ]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.changeColumns('conflicts', [
      {
        oldColumn: new TableColumn({
          name: 'title',
          type: 'varchar',
          isNullable: true,
        }),
        newColumn: new TableColumn({
          name: 'title',
          type: 'varchar',
          isNullable: false,
        }),
      },
      {
        oldColumn: new TableColumn({
          name: 'severity',
          type: 'enum',
          enum: ['low', 'medium', 'high'],
          isNullable: true,
        }),
        newColumn: new TableColumn({
          name: 'severity',
          type: 'enum',
          enum: ['Low', 'Medium', 'High'],
          isNullable: false,
        }),
      },
      {
        oldColumn: new TableColumn({
          name: 'status',
          type: 'enum',
          enum: ['active', 'ongoing', 'resolved'],
          isNullable: true,
        }),
        newColumn: new TableColumn({
          name: 'status',
          type: 'enum',
          enum: ['Active', 'Ongoing', 'Resolved'],
          isNullable: false,
        }),
      },
      {
        oldColumn: new TableColumn({
          name: 'description',
          type: 'text',
          isNullable: true,
        }),
        newColumn: new TableColumn({
          name: 'description',
          type: 'text',
          isNullable: false,
        }),
      },
      {
        oldColumn: new TableColumn({
          name: 'date_reported',
          type: 'date',
          isNullable: false,
        }),
        newColumn: new TableColumn({
          name: 'dated_reported',
          type: 'date',
          isNullable: false,
        }),
      },
    ]);
  }
}
