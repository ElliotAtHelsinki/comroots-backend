import { __prod__ } from '@constants'
import _ from 'lodash'
import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddSpaceSubscribers1660494342135 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<void> {
    if (!__prod__) {
      for (let i = 1; i <= 16; i++) {                // for each space
        let queryString = ''
        const numberOfSubscribers = _.random(1, 100)
        const arr = _.sampleSize(_.range(2, 102), numberOfSubscribers)
        for (let y = 0; y < arr.length; y++) {
          queryString += `\nINSERT INTO space_subscription ("spaceId", "userId") VALUES (${i}, ${arr[y]});`
        }
        await queryRunner.query(queryString)
      }
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    if (!__prod__) {
      await queryRunner.query(`--sql
        DELETE FROM space_subscription WHERE true;
      `)
    }
  }

}