import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableColumn,
  TableForeignKey,
} from 'typeorm';

export class CreatePropertyDamageTable1757967322636
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('impact_assessments', 'property_damage');

    await queryRunner.createTable(
      new Table({
        name: 'property_damages',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'impact_assessment_id',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'description',
            type: 'text',
            isNullable: false,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'deleted_at',
            type: 'timestamp',
            isNullable: true,
          },
        ],
      }),
    );

    await queryRunner.createForeignKey(
      'property_damages',
      new TableForeignKey({
        columnNames: ['impact_assessment_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'impact_assessments',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('property_damages');
    const foreignKey = table?.foreignKeys.find(
      (fk) => fk.columnNames.indexOf('impact_assessment_id') !== -1,
    );

    if (foreignKey) {
      await queryRunner.dropForeignKey('property_damages', foreignKey);
    }

    await queryRunner.dropTable('property_damages');

    await queryRunner.addColumn(
      'impact_assessments',
      new TableColumn({
        name: 'property_damage',
        type: 'text',
        isNullable: true,
      }),
    );
  }
}
