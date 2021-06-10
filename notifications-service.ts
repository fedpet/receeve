import { SNS } from 'aws-sdk'

interface Notification {
    provider: string
    timestamp: number
    type: string
}

interface NotificationsService {
    publish(notification: Notification): Promise<void>
}

class SNSNotificationsService implements NotificationsService {
    private sns: SNS
    private topic: string

    constructor(sns: SNS, topic: string) {
        this.sns = sns
        this.topic = topic
    }

    publish(notification: Notification): Promise<void> {
        return this.sns.publish({
            TopicArn: this.topic,
            Message: JSON.stringify({
                Provider: notification.provider,
                timestamp: notification.timestamp,
                type: notification.type,
            })
        }).promise().then(() => {})
    }
}

export {
    Notification,
    NotificationsService,
    SNSNotificationsService
}