import { __prod__ } from '@constants'
import { MigrationInterface, QueryRunner } from "typeorm"

export class AddTags1660494342136 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`--sql
        BEGIN;
          INSERT INTO tag (name) VALUES ('Question');
          INSERT INTO tag (name) VALUES ('Help');
          INSERT INTO tag (name) VALUES ('Fundraising');
          INSERT INTO tag (name) VALUES ('Introduction');
          INSERT INTO tag (name) VALUES ('Self');
          INSERT INTO tag (name) VALUES ('AMA');
          INSERT INTO tag (name) VALUES ('Resources');
          INSERT INTO tag (name) VALUES ('Educational');
          INSERT INTO tag (name) VALUES ('Poll');
          INSERT INTO tag (name) VALUES ('Recruitment');
          INSERT INTO tag (name) VALUES ('Contract');
          INSERT INTO tag (name) VALUES ('Networking');
          INSERT INTO tag (name) VALUES ('Opinion');
          INSERT INTO tag (name) VALUES ('Other');
        COMMIT;
      `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`--sql
      DELETE FROM tag WHERE true;
    `)
  }

}
