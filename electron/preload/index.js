import { contextBridge, ipcRenderer } from 'electron';
// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
    getUserDataPath: function () { return ipcRenderer.invoke('get-user-data-path'); },
    getDataDir: function () { return ipcRenderer.invoke('get-data-dir'); },
    // File operations
    readFile: function (filename) { return ipcRenderer.invoke('read-file', filename); },
    writeFile: function (filename, data) { return ipcRenderer.invoke('write-file', filename, data); },
    // Export
    exportData: function (format) { return ipcRenderer.invoke('export-data', format); },
    // Window controls
    minimizeToTray: function () { return ipcRenderer.invoke('minimize-to-tray'); },
    // Activity tracker
    startTracking: function () { return ipcRenderer.invoke('tracker:start'); },
    stopTracking: function () { return ipcRenderer.invoke('tracker:stop'); },
    getTrackerStatus: function () { return ipcRenderer.invoke('tracker:status'); },
    setIdleThreshold: function (seconds) { return ipcRenderer.invoke('tracker:setIdleThreshold', seconds); },
    // Event listeners
    onQuickAdd: function (callback) {
        ipcRenderer.on('quick-add', callback);
        return function () { return ipcRenderer.removeListener('quick-add', callback); };
    },
    // Tracker event listeners
    onTrackerStatus: function (callback) {
        ipcRenderer.on('tracker-status', callback);
        return function () { return ipcRenderer.removeListener('tracker-status', callback); };
    },
    onAutoTrackedActivity: function (callback) {
        ipcRenderer.on('auto-tracked-activity', callback);
        return function () { return ipcRenderer.removeListener('auto-tracked-activity', callback); };
    }
});
