import { MigrationInterface, QueryRunner } from 'typeorm';

export class ChangeConflictSeverityValuesInConflictsTable1760010705839
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    const conflictSeverityMap: Record<string, string> = {
      high: 'extreme',
      'medium-high': 'high intensity',
      medium: 'medium intensity',
      'medium-low': 'low intensity',
      low: 'latent',
    };

    const conflicts = await queryRunner.query(
      `SELECT id, severity FROM conflicts`,
    );

    for (const conflict of conflicts) {
      const newSeverity = conflictSeverityMap[conflict?.severity.toLowerCase()];
      if (!newSeverity) continue;

      await queryRunner.query(
        `UPDATE conflicts SET severity = $1 WHERE id = $2`,
        [newSeverity, conflict.id],
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // reverse the mapping
    const reverseMap: Record<string, string> = {
      extreme: 'high',
      'high intensity': 'medium-high',
      'medium intensity': 'medium',
      'low intensity': 'medium-low',
      latent: 'low',
    };

    const conflicts = await queryRunner.query(
      `SELECT id, severity FROM conflicts`,
    );

    for (const conflict of conflicts) {
      const oldSeverity = reverseMap[conflict.severity?.toLowerCase()];
      if (!oldSeverity) continue;

      await queryRunner.query(
        `UPDATE conflicts SET severity = $1 WHERE id = $2`,
        [oldSeverity, conflict.id],
      );
    }
  }
}
