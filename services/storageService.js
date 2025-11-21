import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import crypto from 'crypto'

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_KEY,
    secretAccessKey: process.env.AWS_SECRET,
  },
})

export async function uploadFileToS3(fileBuffer, mimetype) {
  const fileName = crypto.randomUUID()

  const command = new PutObjectCommand({
    Bucket: process.env.AWS_BUCKET,
    Key: fileName,
    Body: fileBuffer,
    ContentType: mimetype,
  })

  await s3.send(command)

  return `https://${process.env.AWS_BUCKET}.s3.amazonaws.com/${fileName}`
}
