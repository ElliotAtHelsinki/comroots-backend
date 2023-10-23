import { __prod__ } from '@constants'
import { faker } from '@faker-js/faker'
import _ from 'lodash'
import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddPosts1660494342137 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<void> {
    if (!__prod__) {
      let queryString = ''
      for (let i = 0; i < 1000; i++) {
        const title = faker.company.catchPhrase()
        const text = faker.lorem.paragraph()
        const spaceId = _.random(1, 16)
        const creatorId = faker.datatype.boolean() ? _.random(2, 101) : null
        const pageCreatorId = creatorId ? null : _.random(1, 100)
        const creatorType = creatorId ? 'user' : 'page'
        const createdAt = faker.date.between('2020-01-01T00:00:00.000Z', '2021-01-01T00:00:00.000Z').toISOString()
        queryString += `\nINSERT INTO post ("title", "text", "spaceId", "creatorId", "pageCreatorId", "createdAt", "creatorType") VALUES ('${title}', '${text}', ${spaceId}, ${creatorId}, ${pageCreatorId}, '${createdAt}', '${creatorType}');`
      }
      await queryRunner.query(queryString)
      queryString = ''
      for (let i = 1; i < 1001; i++) {
        const numberOfTags = _.random(1, 4)
        const arr = _.sampleSize(_.range(1, 15), numberOfTags)
        for (let y = 0; y < numberOfTags; y++) {
          queryString += `\nINSERT INTO post_tags_tag ("postId", "tagId") VALUES (${i}, ${arr[y]});`
        }
      }
      await queryRunner.query(queryString)
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    if (!__prod__) {
      await queryRunner.query(`--sql
        DELETE FROM post WHERE true;
        DELETE FROM post_tags_tag WHERE true;
      `)
    }
  }

}