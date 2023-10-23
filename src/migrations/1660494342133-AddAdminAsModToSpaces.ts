import { __prod__ } from '@constants'
import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddAdminAsModToSpaces1660494342133 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<void> {
    if (!__prod__) {
      await queryRunner.query(`--sql
        CREATE OR REPLACE PROCEDURE main()
        AS $$
          DECLARE
            s integer;
          BEGIN
            FOR s IN
              SELECT id FROM space
            LOOP
              INSERT INTO space_mods_user ("spaceId", "userId") VALUES (s, (SELECT id FROM "user" WHERE username = 'admin'));
            END LOOP;
          END;
        $$ LANGUAGE plpgsql;
        CALL main();
      `)
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    if (!__prod__) {
      await queryRunner.query(`--sql
        DELETE FROM space_mods_user WHERE "userId" = (SELECT id FROM "user" WHERE username = 'admin');
      `)
    }
  }

}