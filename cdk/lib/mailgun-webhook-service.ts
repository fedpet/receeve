import { MailgunEventRepository } from "./mailgun-event-repository";
import { NotificationsService } from "./notifications-service";
import * as Mailgun from "./mailgun";

interface MailgunWebhookError {
    shouldRetry: boolean
}

export class MailgunWebhookService {
    private signingKey: string
    private storage: MailgunEventRepository
    private notifications: NotificationsService

    constructor(signingKey: string, storage: MailgunEventRepository, notifications: NotificationsService) {
        this.signingKey = signingKey
        this.storage = storage
        this.notifications = notifications
    }

    handle(payload: string): Promise<void | MailgunWebhookError> {
        // TODO: according to Mailgun:
        //  for added security one could cache the event id and only accept new ones to avoid replay-attacks
        //  one could also check that the timestamp is not too different than the current one
        return new Promise<Mailgun.Event>(resolve => {
            const event = Mailgun.parseEvent(payload)
            if (Mailgun.validateSignature(event.signature, this.signingKey)) {
                resolve(event)
            } else {
                console.error('Invalid signature')
                throw { shouldRetry: false }
            }
        }).then(
            // we publish the notification and save the event simultaneously since the order was not defined
            event => Promise.all([
                this.storage.save(event),
                this.notifications.publish({
                    provider: "Mailgun",
                    timestamp: event["event-data"].timestamp,
                    type: event["event-data"].event
                })
            ]).catch(error => {
                // it is not specified what to do in case of errors while interacting with other AWS services
                // so we just return the error to Mailgun which will retry later
                // We may consider doing further logging, reverting the save on the db
                // and / or publishing the notification only after we succeeded saving
                console.error(error)
                return { shouldRetry: true }
            })
        ).then(() => {})
    }
}