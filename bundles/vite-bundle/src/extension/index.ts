import NodeCG from 'nodecg/types';

export default (nodecg: NodeCG.ServerAPI) => {
    // Your extension logic goes here
    nodecg.log.info('Vite bundle extension loaded!');
    
    // Example: Send a message
    nodecg.sendMessage('extension-loaded', { timestamp: Date.now() });
};
