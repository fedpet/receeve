import * as apigateway from '@aws-cdk/aws-apigateway';
import * as dynamodb from '@aws-cdk/aws-dynamodb';
import * as lambda from '@aws-cdk/aws-lambda';
import * as SNS from '@aws-cdk/aws-sns';
import { Construct, Duration, Stack, StackProps } from '@aws-cdk/core';
import { NodejsFunction } from "@aws-cdk/aws-lambda-nodejs";
import * as path from "path";

export class CdkStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props)

    const env = {
      STORAGE_TABLE: 'storage-table-name',
      NOTIFICATION_TOPIC: 'sns-topic-name',
      MAILGUN_KEY: 'test',
      REGION: 'us-east-1'
    }

    const table = new dynamodb.Table(this, env.STORAGE_TABLE, {
      partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
    })
    const topic = new SNS.Topic(this, env.NOTIFICATION_TOPIC)

    const mailgunWebhookHandler = new NodejsFunction(this, 'handler', {
      entry: path.join(__dirname, '/handler.ts'),
      runtime: lambda.Runtime.NODEJS_14_X,
      timeout: Duration.seconds(60),
      environment: env
    })

    table.grantReadWriteData(mailgunWebhookHandler)
    topic.grantPublish(mailgunWebhookHandler)

    const api = new apigateway.RestApi(this, 'mailgun-webhook-api', { cloudWatchRole: false })
    api.root.addMethod('POST', new apigateway.LambdaIntegration(mailgunWebhookHandler), {
      apiKeyRequired: false
    })
  }
}
