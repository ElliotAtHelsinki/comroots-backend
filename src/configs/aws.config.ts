import AWS from 'aws-sdk'

AWS.config.update({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
})

export const s3 = new AWS.S3({ apiVersion: '2006-03-01' })
export const quicksight = new AWS.QuickSight()