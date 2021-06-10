import * as Mailgun from './mailgun'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'

interface MailgunEventRepository {
    save(event: Mailgun.Event): Promise<void>
}

class DynamoMailgunEventRepository implements MailgunEventRepository {
    private db: DocumentClient
    private tableName: string

    constructor(db: DocumentClient, tableName: string) {
        this.db = db
        this.tableName = tableName
    }

    save(event: Mailgun.Event): Promise<void> {
        return this.db.put({
            TableName: this.tableName,
            Item: event
        }).promise().then(() => {})
    }
}

export {
    MailgunEventRepository,
    DynamoMailgunEventRepository
}