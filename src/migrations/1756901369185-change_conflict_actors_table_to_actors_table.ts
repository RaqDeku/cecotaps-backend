import { MigrationInterface, QueryRunner } from 'typeorm';

export class ChangeConflictActorsTableToActorsTable1756901369185
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.renameTable('conflict_actors', 'actors');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.renameTable('actors', 'conflict_actors');
  }
}
