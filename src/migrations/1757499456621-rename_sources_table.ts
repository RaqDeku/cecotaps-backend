import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class RenameSourcesTable1757499456621 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumns('sources', ['source_type']);

    await queryRunner.renameTable('sources', 'information_sources');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.renameTable('information_sources', 'sources');

    await queryRunner.addColumns('sources', [
      new TableColumn({
        name: 'source_type',
        type: 'enum',
        enum: ['Media', 'Community', 'NGO', 'Gov'],
        isNullable: false,
      }),
    ]);
  }
}
