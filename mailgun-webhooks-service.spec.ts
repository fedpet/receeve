import { MailgunWebhookService } from './mailgun-webhook-service'
import { DynamoMailgunEventRepository, MailgunEventRepository } from "./mailgun-event-repository";
import { DocumentClient } from "aws-sdk/clients/dynamodb";
import { NotificationsService, SNSNotificationsService } from "./notifications-service";
import { SNS } from "aws-sdk";




jest.mock('aws-sdk', () => {
    const mSNS = {
        publish: jest.fn().mockReturnThis(),
        promise: () => Promise.resolve(),
    }
    return {
        SNS: jest.fn(() => mSNS)
    }
})

jest.mock('aws-sdk/clients/dynamodb', () => {
    const mDocumentClient = {
        put: jest.fn().mockReturnThis(),
        promise: () => Promise.resolve(),
    }
    return {
        DocumentClient: jest.fn(() => mDocumentClient)
    }
})


describe('mailgun-webhook-service', () => {
    let db: DocumentClient
    let sns: SNS
    let service: MailgunWebhookService

    beforeEach(() => {
        sns = new SNS()
        db = new DocumentClient()
        const storage: MailgunEventRepository = new DynamoMailgunEventRepository(db, 'tableName')
        const notifications: NotificationsService = new SNSNotificationsService(sns, 'topic')
        service = new MailgunWebhookService('test', storage, notifications)
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    it('should work with correct input', async function () {
        const payload = {
            signature: {
                timestamp: "1529006854",
                token: "a8ce0edb2dd8301dee6c2405235584e45aa91d1e9f979f3de0",
                signature: "487f7ded95473375d54faf4b1b799784f667a5731371b9335baaf2987c081b33"
            },
            "event-data": {
                event: "opened",
                timestamp: 1529006854.329574,
                id: "DACSsAdVSeGpLid7TN03WA"
            }
        }
        await service.handle(JSON.stringify(payload))
        expect(sns.publish).toBeCalledWith({
            TopicArn: 'topic',
            Message: JSON.stringify({
                Provider: 'Mailgun',
                timestamp: 1529006854.329574,
                type: 'opened',
            })
        })
        expect(db.put).toBeCalledWith({
            TableName: 'tableName',
            Item: payload
        })
        expect(db.put).toHaveBeenCalledTimes(1)
        expect(sns.publish).toHaveBeenCalledTimes(1)
    })

    it('should not allow invalid signatures', async function () {
        const payload = {
            signature: {
                timestamp: "1529006854",
                token: "a8ce0edb2dd8301dee6c2405235584e45aa91d1e9f979f3de0",
                signature: "invalid"
            },
            "event-data": {
                event: "opened",
                timestamp: 1529006854.329574,
                id: "DACSsAdVSeGpLid7TN03WA"
            }
        }
        const promise = service.handle(JSON.stringify(payload))
        await expect(promise).rejects.toEqual({
            shouldRetry: false
        })
        expect(db.put).toHaveBeenCalledTimes(0)
        expect(sns.publish).toHaveBeenCalledTimes(0)
    })
})
