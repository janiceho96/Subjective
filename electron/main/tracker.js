var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
import { ipcMain, powerMonitor } from 'electron';
import activeWindow from 'active-win';
import log from 'electron-log';
import { v4 as uuidv4 } from 'uuid';
var trackerInterval = null;
var currentActivity = null;
var isTracking = false;
var lastActiveTime = 0;
var idleThreshold = 300; // 5 minutes in seconds
var mainWindow = null;
var isPollingActiveWindow = false;
// Initialize tracker with main window reference
export function initTracker(window) {
    mainWindow = window;
    log.info('Activity tracker initialized');
}
// Start tracking active windows
export function startTracking() {
    if (isTracking) {
        log.info('Tracker already running');
        return;
    }
    isTracking = true;
    lastActiveTime = Date.now();
    // Poll every 3 seconds
    trackerInterval = setInterval(function () {
        void trackActiveWindow();
    }, 3000);
    // Capture the current foreground window immediately instead of waiting for the first interval.
    void trackActiveWindow();
    log.info('Activity tracking started');
}
// Stop tracking
export function stopTracking() {
    if (trackerInterval) {
        clearInterval(trackerInterval);
        trackerInterval = null;
    }
    // End current activity if any
    if (currentActivity) {
        endCurrentActivity();
    }
    isTracking = false;
    log.info('Activity tracking stopped');
}
// Set idle threshold (seconds)
export function setIdleThreshold(seconds) {
    idleThreshold = seconds;
    log.info("Idle threshold set to ".concat(seconds, " seconds"));
}
// Get current tracking status
export function getTrackingStatus() {
    return {
        isTracking: isTracking,
        currentActivity: currentActivity,
        lastActiveTime: lastActiveTime
    };
}
// Track the currently active window
function trackActiveWindow() {
    return __awaiter(this, void 0, void 0, function () {
        var activeWindowInfo, idleTime, now, startTime, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!mainWindow || mainWindow.isDestroyed())
                        return [2 /*return*/];
                    if (isPollingActiveWindow)
                        return [2 /*return*/];
                    isPollingActiveWindow = true;
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, 4, 5]);
                    return [4 /*yield*/, getActiveWindowInfo()];
                case 2:
                    activeWindowInfo = _a.sent();
                    if (!activeWindowInfo)
                        return [2 /*return*/];
                    idleTime = powerMonitor.getSystemIdleTime();
                    if (idleTime > idleThreshold) {
                        // User is idle - end current activity
                        if (currentActivity) {
                            log.info("User idle for ".concat(idleTime, "s, ending activity: ").concat(currentActivity.appName));
                            endCurrentActivity();
                        }
                        return [2 /*return*/];
                    }
                    now = Date.now();
                    lastActiveTime = now;
                    // If the same window stays focused, only refresh the live duration.
                    if (currentActivity &&
                        currentActivity.windowId === activeWindowInfo.windowId &&
                        currentActivity.processId === activeWindowInfo.processId) {
                        startTime = new Date(currentActivity.startTime).getTime();
                        currentActivity.duration = Math.floor((now - startTime) / 1000);
                        currentActivity.windowTitle = activeWindowInfo.windowTitle;
                        // Send update to renderer
                        sendTrackerUpdate();
                        return [2 /*return*/];
                    }
                    // Different app - end current and start new
                    if (currentActivity) {
                        endCurrentActivity();
                    }
                    // Start new activity
                    startNewActivity(activeWindowInfo);
                    return [3 /*break*/, 5];
                case 3:
                    error_1 = _a.sent();
                    log.error('Error tracking window:', error_1);
                    return [3 /*break*/, 5];
                case 4:
                    isPollingActiveWindow = false;
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    });
}
function getActiveWindowInfo() {
    return __awaiter(this, void 0, void 0, function () {
        var active, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, activeWindow()];
                case 1:
                    active = _a.sent();
                    if (!active || active.platform !== 'windows') {
                        return [2 /*return*/, null];
                    }
                    return [2 /*return*/, {
                            appName: active.owner.name || 'Unknown Application',
                            windowTitle: active.title || active.owner.name || 'Untitled Window',
                            windowId: active.id,
                            processId: active.owner.processId,
                            processPath: active.owner.path || ''
                        }];
                case 2:
                    error_2 = _a.sent();
                    log.error('Error getting window info:', error_2);
                    return [2 /*return*/, null];
                case 3: return [2 /*return*/];
            }
        });
    });
}
function startNewActivity(windowInfo) {
    var now = new Date().toISOString();
    currentActivity = {
        id: uuidv4(),
        appName: windowInfo.appName,
        windowTitle: windowInfo.windowTitle,
        windowId: windowInfo.windowId,
        processId: windowInfo.processId,
        processPath: windowInfo.processPath,
        startTime: now,
        endTime: null,
        duration: 0
    };
    log.info("Started tracking: ".concat(windowInfo.appName, " - ").concat(windowInfo.windowTitle));
    sendTrackerUpdate();
}
function endCurrentActivity() {
    if (!currentActivity)
        return;
    var now = new Date();
    currentActivity.endTime = now.toISOString();
    var startTime = new Date(currentActivity.startTime).getTime();
    currentActivity.duration = Math.floor((now.getTime() - startTime) / 1000);
    // Only save if duration > 10 seconds (filter out quick switches)
    if (currentActivity.duration > 10) {
        log.info("Ended activity: ".concat(currentActivity.appName, " (").concat(currentActivity.duration, "s)"));
        // Send to renderer to save
        if (mainWindow && !mainWindow.isDestroyed()) {
            mainWindow.webContents.send('auto-tracked-activity', currentActivity);
        }
    }
    currentActivity = null;
    sendTrackerUpdate();
}
function sendTrackerUpdate() {
    if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send('tracker-status', {
            isTracking: isTracking,
            currentActivity: currentActivity
        });
    }
}
// IPC Handlers
export function setupTrackerIPC() {
    // Start/Stop tracking
    ipcMain.handle('tracker:start', function () {
        startTracking();
        return { success: true };
    });
    ipcMain.handle('tracker:stop', function () {
        stopTracking();
        return { success: true };
    });
    ipcMain.handle('tracker:status', function () {
        return getTrackingStatus();
    });
    ipcMain.handle('tracker:setIdleThreshold', function (_event, seconds) {
        setIdleThreshold(seconds);
        return { success: true };
    });
}
log.info('Tracker module loaded');
