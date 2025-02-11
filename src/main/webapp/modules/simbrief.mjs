export async function populateCallSign(simBriefPilotId) {
    return fetchFlightPlan(simBriefPilotId)
        .then(processResponse);
}

async function fetchFlightPlan(simBriefPilotId) {
    const url = `https://www.simbrief.com/api/xml.fetcher.php?` +
        new URLSearchParams({
            "userid": simBriefPilotId
        }).toString();
    console.debug('Fetching current flight plan from SimBrief: ' + url);
    return fetch(url);
}

async function processResponse(response) {
    let callSign = '';
    if (!response.ok) {
        console.error('Failed to fetch current flight plan from SimBrief:' + response.statusText)
        throw Error('Failed to fetch call sign from SimBrief');
    }
    else {
        console.debug('Successfully fetched current flight plan from SimBrief')
        const data = await response.text();
        const regex = /<callsign>[A-Z0-9]+<\/callsign>/g;
        data.match(regex).forEach((value) => {
            callSign = value.replace('<callsign>', '').replace('</callsign>', '');
            console.debug('Retrieved current flight plan call sign: ' + callSign);
        });

        if (callSign === '') {
            console.error('No call sign was found in the response from SimBrief')
            throw Error('Call sign not found in current SimBrief plan');
        }
    }
    return callSign;
}
