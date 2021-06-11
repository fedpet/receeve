import * as crypto from 'crypto'

interface Signature {
    signature: string
    token: string
    timestamp: string
}

interface Event {
    signature: Signature
    'event-data': { // depending on your conventions this may be left exactly as it is called by Mailgun
        // or it could be renamed to something like data or eventData so the coding style is coherent
        event: string
        timestamp: number
        id: string
    }
}

function parseEvent(json: string): Event {
    return JSON.parse(json) // TODO: must validate the returned object against the Event interface
}

function validateSignature(sig: Signature, signingKey: string): boolean {
    const encodedToken = crypto
        .createHmac('sha256', signingKey)
        .update(sig.timestamp.concat(sig.token))
        .digest('hex')
    return encodedToken === sig.signature
}

export {
    Signature,
    Event,
    parseEvent,
    validateSignature
}