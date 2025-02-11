export class ACARSMessage {
    constructor(from, messageType, packet) {
        this.from = from;
        this.messageType = messageType;
        this.packet = packet;
    }
}

export class ACARSClient {
    constructor(purpose, hostname, logonKey, warningCallback) {
        this.purpose = purpose;
        this.hostname = hostname;
        this.logonKey = logonKey;
        this.warningCallback = warningCallback;
    }

    async ping(fromCallSign) {
        return pingService(this.purpose, this.hostname, this.logonKey, fromCallSign)
            .then((response) => confirmConnection(this.purpose, response));
    }

    async poll(forCallSign, fromCallSign) {
        return pollService(this.purpose, this.hostname, this.logonKey, forCallSign, fromCallSign)
            .then((response) => extractMessages(this.purpose, response, this.warningCallback));
    }

    async sendMessage(to, message) {
        return sendToService(this.purpose, this.hostname, this.logonKey, to, message)
            .then((response) => verifySend(this.purpose, response, this.warningCallback));
    }
}

async function pingService(purpose, hostname, logonKey, fromCallSign) {
    console.debug(`Pinging ${purpose} ACARS server for ${fromCallSign}`);
    const url = `https://${hostname}/acars/system/connect.html?` +
        new URLSearchParams({
            'logon': logonKey,
            'from': fromCallSign,
            'to': fromCallSign,
            'type': (purpose === 'ATSU') ? 'poll' : 'ping' // SayIntentions.ai server ping doesn't fail if loginKey is wrong!
        }).toString();
    return fetch(url);
}

async function confirmConnection(purpose, response, warningCallback) {
    let result = false;
    if (!response.ok) {
        console.error(`Unable to ping the ${purpose} ACARS server: ` + response.statusText)
        throw Error(`Failed to ping the ${purpose} ACARS server`);
    }
    else {
        const data = await response.text();
        if (data.startsWith('ok')) {
            console.debug(`Successfully pinged the ${purpose} ACARS server`);
            result = true;
        }
        else if (data === 'error {invalid logon code}') {
            console.error(`Invalid logon code for ${purpose} ACARS server`)
            throw Error(`The logon code for ${purpose} ACARS server is invalid`);
        }
        else {
            console.error(`Unexpected response from the ${purpose} ACARS server: ` + data);
            throw Error(`Failed to ping the ${purpose} ACARS server`);
        }
    }
    return result;
}

async function pollService(purpose, hostname, logonKey, forCallSign, fromCallSign) {
    console.debug(`Polling ${purpose} ACARS for new messages for ${forCallSign} from ${fromCallSign}`);
    const url = `https://${hostname}/acars/system/connect.html?` +
        new URLSearchParams({
            'logon': logonKey,
            'from': forCallSign,
            'to': fromCallSign,
            'type': 'poll'
        }).toString();
    return fetch(url);
}

async function extractMessages(purpose, response, warningCallback) {
    const result = []
    if (!response.ok) {
        console.info(`Temporary error polling ${purpose} ACARS server: ` + response.statusText)
        warningCallback(`Failed to poll ${purpose} ACARS server. Will retry shortly.`);
    }
    else {
        const data = await response.text();
        if (!data.startsWith('ok')) {
            console.info(`Temporary error polling ${purpose} ACARS server: ` + response.statusText)
            warningCallback(`Failed to poll ${purpose} ACARS server. Will retry shortly.`);
        }
        else {
            const messages = convertMessages(data);
            console.debug(`Received ${messages.length} messages from ${purpose} ACARS server`);
            messages.forEach((message) => {
                console.debug(`Message from ${message.from} of type ${message.messageType}: ${message.packet}`);
                result.push(message);
            });
        }
    }
    return result;
}

function convertMessages(data) {
    const messages = [];
    const regex = /\{([A-Z0-9]+)\s([a-z\-]+) \{([^\}]+)}\}+/g;
    data.matchAll(regex).forEach((value) => {
        messages.push(new ACARSMessage(value[1], value[2], value[3]));
    });
    return messages;
}

async function sendToService(purpose, hostname, logonKey, to, message) {
    console.debug(`Sending to ${to} on ${purpose} ACARS: ${JSON.stringify(message)}`);
    const url = `https://${hostname}/acars/system/connect.html?` +
        new URLSearchParams({
            'logon': logonKey,
            'from': message.from,
            'to': to,
            'type': message.messageType,
            'packet': message.packet
        }).toString();
    return fetch(url);
}

async function verifySend(purpose, response, warningCallback) {
    let result = false;
    if (!response.ok) {
        console.info(`Temporary error sending to ${purpose} ACARS server: ` + response.statusText)
        warningCallback(`Failed to send message to ${purpose} ACARS server. Will retry later.`);
    }
    else {
        const data = await response.text();
        if (data === 'ok') {
            console.debug(`Message sent successfully`);
            result = true;
        }
        else {
            console.warn(`Failed to send to ${purpose} ACARS server: ` + data);
            warningCallback(`Failed to send to ${purpose} ACARS server. The message was invalid and will be discarded'`);
            result = true;
        }
    }
    return result;
}
