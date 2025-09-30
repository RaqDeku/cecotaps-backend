import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class EditUsersTable1758533798125 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.changeColumns('users', [
      {
        oldColumn: new TableColumn({
          name: 'role',
          type: 'enum',
          enum: ['Field Monitor', 'Analyst', 'Admin'],
          isNullable: false,
        }),
        newColumn: new TableColumn({
          name: 'role',
          type: 'varchar',
          isNullable: false,
        }),
      },
      {
        oldColumn: new TableColumn({
          name: 'name',
          type: 'varchar',
          isNullable: false,
        }),
        newColumn: new TableColumn({
          name: 'name',
          type: 'varchar',
          isNullable: true,
        }),
      },
    ]);

    await queryRunner.dropColumn('users', 'organization');

    await queryRunner.addColumns('users', [
      new TableColumn({
        name: 'email',
        type: 'varchar',
        isNullable: false,
      }),
      new TableColumn({
        name: 'password',
        type: 'varchar',
        isNullable: false,
      }),
      new TableColumn({
        name: 'is_email_verified',
        type: 'boolean',
        default: false,
      }),
    ]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('users', 'email');
    await queryRunner.dropColumn('users', 'password');
    await queryRunner.dropColumn('users', 'is_email_verified');

    await queryRunner.addColumns('users', [
      new TableColumn({
        name: 'organization',
        type: 'varchar',
        isNullable: true,
      }),
    ]);

    await queryRunner.changeColumns('users', [
      {
        oldColumn: new TableColumn({
          name: 'role',
          type: 'varchar',
          isNullable: false,
        }),
        newColumn: new TableColumn({
          name: 'role',
          type: 'enum',
          enum: ['Field Monitor', 'Analyst', 'Admin'],
          isNullable: false,
        }),
      },
      {
        oldColumn: new TableColumn({
          name: 'name',
          type: 'varchar',
          isNullable: true,
        }),
        newColumn: new TableColumn({
          name: 'name',
          type: 'varchar',
          isNullable: false,
        }),
      },
    ]);
  }
}
