# CDK & Infrastructure
The cdk folder contains the same lambda integrated with the cdk.
Running `npm install` and `cdk synth && cdk bootstrap && cdk deploy -y` should do everything automatically
and provide you with the working endpoint in the console logs. (NB it is a POST endpoint).

# Without CDK

## ENV variables
- STORAGE_TABLE: table on dynamodb for storage
- NOTIFICATION_TOPIC: topic for SNS notifications
- MAILGUN_KEY: mailgun signing key
- REGION: AWS region for SNS

## Commands
`npm install`

`npm run test` - run an integration test

`npm run build` - compile typescript on `dist` directory

# Disclaimer
This is the first time I wrote typescript code and used AWS. The code is far from perfect, and handler.ts in particular is difficult to test.

Moreover, in doing all this I unfortunately ran out of my budgeted time so
please forgive me if the repo looks a bit messy (especially after adding the cdk integration)