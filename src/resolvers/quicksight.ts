import { quicksight } from '@configs'
import { Query, Resolver } from 'type-graphql'

@Resolver()
export class QuicksightResolver {
  @Query(() => String)
  async embedUrl(): Promise<string> {
    const resp = await quicksight.generateEmbedUrlForAnonymousUser({
      AwsAccountId: process.env.AWS_ACCOUNT_ID,
      Namespace: 'default',
      AuthorizedResourceArns: [`arn:aws:quicksight:${process.env.AWS_REGION}:${process.env.AWS_ACCOUNT_ID}:dashboard/${process.env.QUICKSIGHT_DASHBOARD_ID}`],
      ExperienceConfiguration: {
        Dashboard: {
          InitialDashboardId: process.env.QUICKSIGHT_DASHBOARD_ID
        }
      }
    }).promise()
    return resp.EmbedUrl!
  }
}