import {populateCallSign} from "./simbrief.mjs";
import {ACARSClient} from "./acars.mjs";
import {disableConfigChanges, enableConfigChanges} from "./config.mjs";
import {startRouter, stopRouter} from "./router.mjs";

let bridge = null;

export function initBridge() {
    bridge = new Bridge()
}

export function configureBridge(config) {
    bridge.configure(config);
}

export function configurationInvalidated() {
    bridge.configurationInvalidated();
}

class Bridge {
    constructor() {
        this.running = false;
        this.configuration = null;
        this.airplaneClient = null;
        this.atsuClient = null;
        this.callSign = null;
        this.lastError = null;
        this.lastWarning = null;
        this.#init();
    }

    #init() {
        u('#start').on('click', startBridge);
        u('#stop').on('click', stopBridge);

        this.configuration = null;
        this.#resetBridge();
    }

    configure(config) {
        if (this.running) {
            console.error('Attempt to configure the bridge rejected because it is running');
            return;
        }
        this.configuration = config;
        this.#resetBridge();
    }

    configurationInvalidated() {
        if (this.running) {
            console.error('Attempt to invalidate the bridge configuration rejected because it is running');
            return;
        }
        this.configuration = null;
        this.#resetBridge();
    }

    #resetBridge() {
        this.running = false;
        this.airplaneClient = null;
        this.atsuClient = null;
        this.callSign = null;
        this.lastError = null;
        this.lastWarning = null;

        this.#displayBridgeState();
    }

    #displayBridgeState() {
        u('#start').first().disabled = (this.configuration === null) || this.running;
        u('#stop').first().disabled = !this.running;

        if (this.running) {
            u('#status').text('Running').removeClass('stopped').addClass('running');
        } else {
            u('#status').text('Stopped').removeClass('running').addClass('stopped');
        }

        u('#callSign').text(this.callSign === null ? 'unknown' : this.callSign);

        if (this.lastError) {
            u('#error').text(this.lastError).addClass('errorMessage').removeClass('noMessage');
        }
        else {
            u('#error').text('Errors will be displayed here.').removeClass('errorMessage').addClass('noMessage');
        }

        if (this.lastWarning) {
            u('#warning').text(this.lastWarning).addClass('warningMessage').removeClass('noMessage');
        }
        else {
            u('#warning').text('Warnings will be displayed here.').removeClass('warningMessage').addClass('noMessage');
        }
    }

    start(onStarted) {
        if (this.running) {
            console.error('Attempt to start the bridge when it is already running');
            return;
        }
        if (this.configuration === null) {
            console.error('Attempting to start the bridge when it is not correctly configured');
            return;
        }

        this.airplaneClient = new ACARSClient("Airplane", "www.hoppie.nl", this.configuration.hoppieLogonCode, displayWarning);
        this.atsuClient = new ACARSClient("ATSU", "acars.sayintentions.ai", this.configuration.sayIntentionsAPIKey, displayWarning);
        this.lastError = '';
        this.lastWarning = '';
        const finishedStart = () => {
            this.#displayBridgeState();
            startRouter(this.airplaneClient, this.atsuClient, this.callSign, this.configuration.atsuId, displayWarning, displayError);
        }

        populateCallSign(this.configuration.simBriefId)
            .then((value) => {
                this.callSign = value;
            })
            .then(() => this.airplaneClient.ping(this.callSign))
            .then(() => this.atsuClient.ping(this.callSign))
            .then(() => {
                this.running = true;
                onStarted();
            })
            .catch((error) => {
                this.lastError = error.message;
                this.callSign = null;
            })
            .then(finishedStart);
    }

    stop() {
        if (!this.running) {
            console.error('Attempt to stop the bridge when it is not in a running state');
            return false;
        }

        stopRouter();
        this.#resetBridge()
        return true;
    }

    setWarning(warning) {
        this.lastWarning = warning;
        this.#displayBridgeState();
    }

    setError(error) {
        this.lastError = error;
        this.#displayBridgeState();
    }
}

function startBridge() {
    bridge.start(() => {
        disableConfigChanges();
    })
}

function stopBridge() {
    if (bridge.stop()) {
        enableConfigChanges();
    }
}

function displayWarning(warning) {
    bridge.setWarning(warning);
}

function displayError(error) {
    bridge.setError(error);
}
