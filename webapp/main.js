import {initConfig} from "./modules/config.mjs";
import {initBridge, configurationInvalidated, configureBridge} from "./modules/bridge.mjs";

function init() {
    console.log('Initialising Bridge')
    initBridge();
    initConfig(configureBridge, configurationInvalidated);
}
window.onload = init;
