import { __prod__ } from '@constants'
import { faker } from '@faker-js/faker'
import _ from 'lodash'
import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddOffers1660494342138 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<void> {
    if (!__prod__) {
      let queryString = ''
      for (let i = 0; i < 1000; i++) {
        const title = faker.name.jobTitle().replaceAll('\'', '')
        const workplace = faker.company.name().replaceAll('\'', '')
        const address = faker.address.streetAddress(true).replaceAll('\'', '')
        const recruiting = faker.datatype.boolean()
        const employmentType = _.sample([
          'Full-time',
          'Part-time',
          'Freelance',
          'Online',
          'Internship',
          'Temporary',
          'Contract',
          'Volunteer',
          'Other'
        ])
        const currency = faker.finance.currencySymbol()
        const salaryRange = `${currency}${_.random(0, 10000)} - ${currency}${_.random(10000, 999999)}`
        const department = faker.name.jobArea()
        const requirements = `Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.`
        const benefits = `Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem. Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur? Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur, vel illum qui dolorem eum fugiat quo voluptas nulla pariatur?`
        const description = `At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident, similique sunt in culpa qui officia deserunt mollitia animi, id est laborum et dolorum fuga. Et harum quidem rerum facilis est et expedita distinctio. Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil impedit quo minus id quod maxime placeat facere possimus, omnis voluptas assumenda est, omnis dolor repellendus. Temporibus autem quibusdam et aut officiis debitis aut rerum necessitatibus saepe eveniet ut et voluptates repudiandae sint et molestiae non recusandae. Itaque earum rerum hic tenetur a sapiente delectus, ut aut reiciendis voluptatibus maiores alias consequatur aut perferendis doloribus asperiores repellat.`
        const spaceId = _.random(1, 16)
        const creatorId = faker.datatype.boolean() ? _.random(2, 101) : null
        const pageCreatorId = creatorId ? null : _.random(1, 100)
        const creatorType = creatorId ? 'user' : 'page'
        const createdAt = faker.date.between('2020-01-01T00:00:00.000Z', '2021-01-01T00:00:00.000Z').toISOString()
        queryString +=
          `\nINSERT INTO offer ("title", "workplace", "address", "recruiting", "employmentType", "salaryRange", "department", "requirements", "benefits", "description", "spaceId", "creatorId", "pageCreatorId", "creatorType", "createdAt") VALUES ('${title}', '${workplace}', '${address}', ${recruiting}, '${employmentType}', '${salaryRange}', '${department}', '${requirements}', '${benefits}', '${description}', ${spaceId}, ${creatorId}, ${pageCreatorId}, '${creatorType}', '${createdAt}') ;`
      }
      await queryRunner.query(queryString)

      queryString = ''
      for (let i = 1; i < 1001; i++) {
        const offerId = i
        const numberOfApplications = _.random(0, 3)
        const arr = _.sampleSize(_.range(2, 102), numberOfApplications)
        for (let y = 0; y < numberOfApplications; y++) {
          const status = _.sample(['applied', 'accepted', 'rejected'])
          queryString +=
            `\nINSERT INTO offer_application ("offerId", "userId", "status") VALUES (${offerId}, ${arr[y]}, '${status}') ;`
        }
      }
      await queryRunner.query(queryString)
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    if (!__prod__) {
      await queryRunner.query(`--sql
        DELETE FROM offer WHERE true;
        DELETE FROM offer_application WHERE true;
      `)
    }
  }

}