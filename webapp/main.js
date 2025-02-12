import {initConfig} from "./modules/config.mjs";
import {initBridge, configurationInvalidated, configureBridge} from "./modules/bridge.mjs";
import {initLinks} from "./modules/links.mjs";

function init() {
    console.log('Initialising Bridge');
    initLinks();
    initBridge();
    initConfig(configureBridge, configurationInvalidated);
}
window.onload = init;
