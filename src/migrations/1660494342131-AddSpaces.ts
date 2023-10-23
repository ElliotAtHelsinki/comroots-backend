import { __prod__ } from '@constants'
import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddSpaces1660494342131 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<void> {
    if (!__prod__) {
      await queryRunner.query(`--sql
        BEGIN;
          INSERT INTO space ("spaceName") VALUES ('CS');
          INSERT INTO space ("spaceName") VALUES ('economics');
          INSERT INTO space ("spaceName") VALUES ('politics');
          INSERT INTO space ("spaceName") VALUES ('arts');
          INSERT INTO space ("spaceName") VALUES ('law');
          INSERT INTO space ("spaceName") VALUES ('agriculture');
          INSERT INTO space ("spaceName") VALUES ('tourism');
          INSERT INTO space ("spaceName") VALUES ('engineering');
          INSERT INTO space ("spaceName") VALUES ('science');
          INSERT INTO space ("spaceName") VALUES ('history');
          INSERT INTO space ("spaceName") VALUES ('philosophy');
          INSERT INTO space ("spaceName") VALUES ('maths');
          INSERT INTO space ("spaceName") VALUES ('physics');
          INSERT INTO space ("spaceName") VALUES ('chemistry');
          INSERT INTO space ("spaceName") VALUES ('biology');
          INSERT INTO space ("spaceName") VALUES ('sports');
        COMMIT;
      `)
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    if (!__prod__) {
      await queryRunner.query(`--sql
        DELETE FROM space WHERE true;
      `)
    }
  }

}
