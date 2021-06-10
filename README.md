# ENV variables
- STORAGE_TABLE: table on dynamodb for storage
- NOTIFICATION_TOPIC: topic for SNS notifications
- MAILGUN_KEY: mailgun signing key
- REGION: AWS region for SNS

# Commands
`npm install`

`npm run test` - run an integration test

`npm run build` - compile typescript on `dist` directory

# Disclaimer
This is the first time I wrote typescript code and used AWS. The code is far from perfect, and handler.ts in particular is difficult to test
