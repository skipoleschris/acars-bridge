
let callSign = null;

export function initLinks() {
   callSign = null
   updateLinksForCallSign();
   u('#hoppieNetwork').on('change', () => updateLinksForCallSign());
}

export function setLinksCallSign(newCallSign) {
    callSign = newCallSign;
    updateLinksForCallSign();
}

function updateLinksForCallSign() {
    if (callSign) {
        u('#hoppieNetworkSelect').first().hidden = false;
        const network = u('#hoppieNetwork').first().value;
        u('#hoppieLink').first().href = `https://www.hoppie.nl/acars/system/callsign.html?network=${network}&callsign=${callSign}`;
        u('#sayIntentionsLink').first().href = `https://acars.sayintentions.ai/dump?callsign=${callSign}`;
    }
    else {
        u('#hoppieNetworkSelect').first().hidden = true;
        u('#hoppieLink').first().href = 'https://www.hoppie.nl/acars/system/log.html';
        u('#sayIntentionsLink').first().href = 'https://acars.sayintentions.ai/dump';
    }
}

