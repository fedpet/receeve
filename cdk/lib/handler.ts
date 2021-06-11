import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda'
import * as AWS from "aws-sdk";
import { DocumentClient } from "aws-sdk/clients/dynamodb";
import { MailgunEventRepository, DynamoMailgunEventRepository } from "./mailgun-event-repository";
import { NotificationsService, SNSNotificationsService } from "./notifications-service";
import { MailgunWebhookService } from "./mailgun-webhook-service";


const tableName = process.env.STORAGE_TABLE || 'mailgun-event-table'
const notificationTopic = process.env.NOTIFICATION_TOPIC || 'sns-topic'
const signingKey = process.env.MAILGUN_KEY || 'test'
if (process.env.REGION) {
    AWS.config.update({region: process.env.REGION})
}


// might use a DI framework/library if the projects gets big
const storage: MailgunEventRepository = new DynamoMailgunEventRepository(new DocumentClient(), tableName)
const notifications: NotificationsService = new SNSNotificationsService(new AWS.SNS(), notificationTopic)
const service = new MailgunWebhookService(signingKey, storage, notifications)

export async function handler(event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> {
    if (!event.body) {
        return {
            statusCode: 406
        }
    }
    return service.handle(event.body).then(
        () => new Object({
            statusCode: 200
        }),
        error => new Object({
            statusCode: error.shouldRetry ? 500 : 406
        })
    )
}