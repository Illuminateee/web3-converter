// This file contains helper functions for logging and error handling.

function logError(message) {
    console.error(`Error: ${message}`);
}

function logInfo(message) {
    console.log(`Info: ${message}`);
}

function logSuccess(message) {
    console.log(`Success: ${message}`);
}

export { logError, logInfo, logSuccess };