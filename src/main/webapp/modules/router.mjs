
let router = null;

export function startRouter(airplaneClient, atsuClient, callSign, atsuId, warningCallback, errorCallback) {
    console.log('Starting ACARS message routing');
    u('#toAirplane').empty();
    u('#toATSU').empty();
    router = new Router(airplaneClient, atsuClient, callSign, atsuId, warningCallback, errorCallback);
    router.start();
}

export function stopRouter() {
    console.log('Stopping ACARS message routing');
    if (router) router.stop();
}

class Router {
    constructor(airplaneClient, atsuClient, callSign, atsuId, warningCallback, errorCallback) {
        this.airplaneClient = airplaneClient;
        this.atsuClient = atsuClient;
        this.callSign = callSign;
        this.atsuId = atsuId;
        this.warningCallback = warningCallback;
        this.errorCallback = errorCallback;

        const now = new Date();
        this.nextAirplaneACARSPoll = now;
        this.nextATSUACARSPoll = now;

        this.toAirplaneQueue = [];
        this.toATSUQueue = [];

        this.timer = null;
    }

    start() {
        this.timer = setInterval(routeMessages, 5000);
    }

    stop() {
        clearInterval(this.timer);
    }

    retrieveMessagesFromAirplane() {
        this.nextAirplaneACARSPoll = retrieveFromAcarsAndStore(
            this.nextAirplaneACARSPoll, this.airplaneClient, this.callSign, this.atsuId, this.toATSUQueue, this.errorCallback
        );
    }

    retrieveMessagesFromATSU() {
        this.nextATSUACARSPoll = retrieveFromAcarsAndStore(
            this.nextATSUACARSPoll, this.atsuClient, this.atsuId, this.callSign, this.toAirplaneQueue, this.errorCallback
        );
    }

    sendMessagesToAirplane() {
        const updatePoll = ((poll) => { this.nextAirplaneACARSPoll = poll; });
        sendMessages(this.toAirplaneQueue, this.airplaneClient, this.callSign, this.nextAirplaneACARSPoll, 'toAirplane')
            .then(updatePoll);
    }

    sendMessagesToATSU() {
        const updatePoll = ((poll) => { this.nextATSUACARSPoll = poll; });
        sendMessages(this.toATSUQueue, this.atsuClient, this.atsuId, this.nextATSUACARSPoll, 'toATSU')
            .then(updatePoll);
    }
}

function routeMessages() {
    router.retrieveMessagesFromAirplane();
    router.retrieveMessagesFromATSU();
    router.sendMessagesToAirplane();
    router.sendMessagesToATSU();
}

function retrieveFromAcarsAndStore(nextPollDate, acarsClient, sender, recipient, queue, errorCallback) {
    if (new Date() > nextPollDate) {
        acarsClient.poll(recipient, sender)
            .then((messages) => {
                messages.forEach((message) => {
                    queue.push(message);
                });
            })
            .catch((error) => { errorCallback(error.message); });
        return new Date(new Date().getTime() + 60000);
    }
    else return nextPollDate;
}

async function sendMessages(queue, acarsClient, recipient, nextPollDate, targetId) {
    let messagesSent = false;
    let nextPoll = nextPollDate;
    while (queue.length > 0) {
        const success = await acarsClient.sendMessage(recipient, queue[0]);
        if (success) {
            displayMessage(queue[0], targetId);
            queue.shift();
            messagesSent = true;
        }
        else break;
    }

    if (messagesSent) {
        const shortenedPoll = new Date(new Date().getTime() + 20000);
        if (shortenedPoll < nextPollDate) nextPoll = shortenedPoll;
    }
    return nextPoll;
}

function displayMessage(message, targetId) {
    u(`#${targetId}`).append(`<li><span>${new Date().toLocaleString('en-GB')}</span><span>${message.from}</span><span>${message.messageType}</span><span class="messagePacket">${message.packet}</span></li>`);
}
