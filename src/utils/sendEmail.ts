import nodemailer from 'nodemailer'

export async function sendEmail(to: string, html: string) {
  // const transporter = nodemailer.createTransport({
  //   host: process.env.SMTP_HOST,
  //   port: process.env.SMTP_PORT,
  //   secure: (new Boolean(process.env.SMTP_SECURE).valueOf()),
  //   auth: {
  //     user: process.env.SMTP_USER,
  //     pass: process.env.SMTP_PASS
  //   }
  // } as any)

  // const info = await transporter.sendMail({
  //   from: 'comrootz@gmail.com',
  //   to: to,
  //   subject: 'Change password',
  //   html
  // })

  // console.log('Message sent: %s', info.messageId)
  // console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info))
  console.log('Message sent')
}