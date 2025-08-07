"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = (nodecg) => {
    // Your extension logic goes here
    nodecg.log.info('Vite bundle extension loaded!');
    // Example: Send a message
    nodecg.sendMessage('extension-loaded', { timestamp: Date.now() });
};
