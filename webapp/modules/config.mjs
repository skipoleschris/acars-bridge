
let validConfigCallback = null;
let invalidConfigCallback = null;

export function initConfig(onValidConfig, onInvalidConfig) {
    validConfigCallback = onValidConfig;
    invalidConfigCallback = onInvalidConfig;
    loadConfig();
    handleConfigChanged();

    u('[name="simBriefId"]').on('change keyup', handleConfigChanged);
    u('[name="hoppieLogonCode"]').on('change keyup', handleConfigChanged);
    u('[name="sayIntentionsAPIKey"]').on('change keyup', handleConfigChanged);
    u('[name="atsuId"]').on('change keyup', handleConfigChanged);
    u('[name="showPasswords').on('change', togglePasswordVisibility);

    u('[name="showPasswords').first().checked = false;
    u('#save').on('click', saveConfig);
    u('#reset').on('click', resetConfig);
}

export function disableConfigChanges() {
    allowConfigChanges(false);
}

export function enableConfigChanges() {
    allowConfigChanges(true);
}

function allowConfigChanges(state) {
    u('[name="simBriefId"]').first().disabled = !state;
    u('[name="hoppieLogonCode"]').first().disabled = !state;
    u('[name="sayIntentionsAPIKey"]').first().disabled = !state;
    u('[name="atsuId"]').first().disabled = !state;
    u('#reset').first().disabled = !state;
}

function handleConfigChanged() {
    const config = buildConfig();
    if (config.simBriefId !== '' && config.hoppieLoginCode !== '' &&
        config.sayIntentionsAPIKey !== '' && config.atsuId !== '') validConfigCallback(config);
    else invalidConfigCallback();
}

function resetConfig() {
    u('[name="simBriefId"]').first().value = '';
    u('[name="hoppieLogonCode"]').first().value = '';
    u('[name="sayIntentionsAPIKey"]').first().value = '';
    u('[name="atsuId"]').first().value = 'PKGM';
    invalidConfigCallback();
}

function buildConfig() {
    return {
        'simBriefId': u('[name="simBriefId"]').first().value,
        'hoppieLogonCode': u('[name="hoppieLogonCode"]').first().value,
        'sayIntentionsAPIKey': u('[name="sayIntentionsAPIKey"]').first().value,
        'atsuId': u('[name="atsuId"]').first().value,
    };
}

function saveConfig() {
    localStorage.setItem('config', JSON.stringify(buildConfig()));
}

function loadConfig() {
    const config = localStorage.getItem('config');
    if (config) {
        const parsed = JSON.parse(config);
        u('[name="simBriefId"]').first().value = parsed.simBriefId;
        u('[name="hoppieLogonCode"]').first().value = parsed.hoppieLogonCode;
        u('[name="sayIntentionsAPIKey"]').first().value = parsed.sayIntentionsAPIKey;
        u('[name="atsuId"]').first().value = parsed.atsuId;
    }
}

function togglePasswordVisibility() {
    if (u('[name="showPasswords"]').first().checked) {
        u('[type="password"]').each((element) => {
            element.type = 'text';
        });
    } else {
        u('[name="sayIntentionsAPIKey"]').each((element) => {
            element.type = 'password';
        });
        u('[name="hoppieLogonCode"]').each((element) => {
            element.type = 'password';
        });
    }
}
