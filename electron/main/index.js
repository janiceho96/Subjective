var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
import { app, BrowserWindow, ipcMain, Tray, Menu, nativeImage, dialog } from 'electron';
import path from 'path';
import fs from 'fs';
import log from 'electron-log';
import { initTracker, setupTrackerIPC } from './tracker';
// Configure logging
log.transports.file.level = 'info';
log.transports.file.resolvePathFn = function () { return path.join(app.getPath('userData'), 'logs', 'main.log'); };
log.info('Application starting...');
// Global exception handlers
process.on('uncaughtException', function (error) {
    log.error('Uncaught Exception:', error);
    dialog.showErrorBox('Application Error', "An unexpected error occurred: ".concat(error.message));
    app.exit(1);
});
process.on('unhandledRejection', function (reason) {
    log.error('Unhandled Rejection:', reason);
});
var mainWindow = null;
var tray = null;
var isQuitting = false;
var VITE_DEV_SERVER_URL = process.env.VITE_DEV_SERVER_URL;
// Data storage path
var userDataPath = app.getPath('userData');
var dataDir = path.join(userDataPath, 'data');
// Ensure data directory exists
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}
function getAssetPath() {
    var paths = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        paths[_i] = arguments[_i];
    }
    var basePath = app.isPackaged
        ? path.join(process.resourcesPath, 'resources')
        : path.join(__dirname, '../../resources');
    return path.join.apply(path, __spreadArray([basePath], paths, false));
}
function createTray() {
    // Create a simple 16x16 icon for tray
    var iconPath = getAssetPath('icon.png');
    var trayIcon;
    if (fs.existsSync(iconPath)) {
        trayIcon = nativeImage.createFromPath(iconPath).resize({ width: 16, height: 16 });
    }
    else {
        // Create a simple colored square as fallback
        trayIcon = nativeImage.createEmpty();
    }
    tray = new Tray(trayIcon);
    var contextMenu = Menu.buildFromTemplate([
        {
            label: 'Open My Time Tracker',
            click: function () {
                mainWindow === null || mainWindow === void 0 ? void 0 : mainWindow.show();
                mainWindow === null || mainWindow === void 0 ? void 0 : mainWindow.focus();
            }
        },
        {
            label: 'Quick Add Activity',
            click: function () {
                mainWindow === null || mainWindow === void 0 ? void 0 : mainWindow.show();
                mainWindow === null || mainWindow === void 0 ? void 0 : mainWindow.focus();
                mainWindow === null || mainWindow === void 0 ? void 0 : mainWindow.webContents.send('quick-add');
            }
        },
        { type: 'separator' },
        {
            label: 'Quit',
            click: function () {
                isQuitting = true;
                app.quit();
            }
        }
    ]);
    tray.setToolTip('My Time Tracker');
    tray.setContextMenu(contextMenu);
    tray.on('click', function () {
        mainWindow === null || mainWindow === void 0 ? void 0 : mainWindow.show();
        mainWindow === null || mainWindow === void 0 ? void 0 : mainWindow.focus();
    });
}
function createWindow() {
    log.info('Creating main window...');
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        minWidth: 900,
        minHeight: 600,
        title: 'My Time Tracker',
        webPreferences: {
            preload: path.join(__dirname, '../preload/index.js'),
            nodeIntegration: false,
            contextIsolation: true
        },
        show: false,
        backgroundColor: '#F8FAFC'
    });
    // Show window when ready
    mainWindow.once('ready-to-show', function () {
        log.info('Window ready to show');
        mainWindow === null || mainWindow === void 0 ? void 0 : mainWindow.show();
    });
    // Handle close to tray
    mainWindow.on('close', function (event) {
        if (!isQuitting) {
            event.preventDefault();
            mainWindow === null || mainWindow === void 0 ? void 0 : mainWindow.hide();
        }
    });
    mainWindow.on('closed', function () {
        mainWindow = null;
    });
    // Load the app
    if (VITE_DEV_SERVER_URL) {
        log.info('Loading dev server:', VITE_DEV_SERVER_URL);
        mainWindow.loadURL(VITE_DEV_SERVER_URL);
        mainWindow.webContents.openDevTools();
    }
    else {
        var indexPath = path.join(__dirname, '../../dist/index.html');
        log.info('Loading production build:', indexPath);
        mainWindow.loadFile(indexPath);
    }
}
// IPC Handlers for data operations
ipcMain.handle('get-user-data-path', function () { return userDataPath; });
ipcMain.handle('get-data-dir', function () { return dataDir; });
ipcMain.handle('read-file', function (_event, filename) { return __awaiter(void 0, void 0, void 0, function () {
    var filePath, data;
    return __generator(this, function (_a) {
        filePath = path.join(dataDir, filename);
        try {
            if (fs.existsSync(filePath)) {
                data = fs.readFileSync(filePath, 'utf-8');
                return [2 /*return*/, JSON.parse(data)];
            }
            return [2 /*return*/, null];
        }
        catch (error) {
            log.error('Error reading file:', error);
            return [2 /*return*/, null];
        }
        return [2 /*return*/];
    });
}); });
ipcMain.handle('write-file', function (_event, filename, data) { return __awaiter(void 0, void 0, void 0, function () {
    var filePath;
    return __generator(this, function (_a) {
        filePath = path.join(dataDir, filename);
        try {
            fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
            return [2 /*return*/, true];
        }
        catch (error) {
            log.error('Error writing file:', error);
            return [2 /*return*/, false];
        }
        return [2 /*return*/];
    });
}); });
ipcMain.handle('export-data', function (_event, format) { return __awaiter(void 0, void 0, void 0, function () {
    var result, activitiesPath, topicsPath, exportData, topics, activities, headers, csvRows, _loop_1, _i, _a, act;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0: return [4 /*yield*/, dialog.showSaveDialog(mainWindow, {
                    title: 'Export Data',
                    defaultPath: "my-time-tracker-export.".concat(format),
                    filters: format === 'json'
                        ? [{ name: 'JSON', extensions: ['json'] }]
                        : [{ name: 'CSV', extensions: ['csv'] }]
                })];
            case 1:
                result = _b.sent();
                if (result.canceled || !result.filePath)
                    return [2 /*return*/, false];
                try {
                    activitiesPath = path.join(dataDir, 'activities.json');
                    topicsPath = path.join(dataDir, 'topics.json');
                    exportData = { activities: [], topics: [] };
                    if (fs.existsSync(activitiesPath)) {
                        exportData = __assign(__assign({}, exportData), JSON.parse(fs.readFileSync(activitiesPath, 'utf-8')));
                    }
                    if (fs.existsSync(topicsPath)) {
                        topics = JSON.parse(fs.readFileSync(topicsPath, 'utf-8'));
                        exportData = __assign(__assign({}, exportData), { topics: topics });
                    }
                    if (format === 'json') {
                        fs.writeFileSync(result.filePath, JSON.stringify(exportData, null, 2), 'utf-8');
                    }
                    else {
                        activities = exportData.activities || [];
                        headers = ['title', 'startTime', 'endTime', 'duration', 'device', 'location', 'topics', 'notes', 'productivityRating'];
                        csvRows = [headers.join(',')];
                        _loop_1 = function (act) {
                            var row = headers.map(function (h) {
                                var val = act[h];
                                if (Array.isArray(val))
                                    return "\"".concat(val.join(';'), "\"");
                                if (typeof val === 'string')
                                    return "\"".concat(val.replace(/"/g, '""'), "\"");
                                return val !== null && val !== void 0 ? val : '';
                            });
                            csvRows.push(row.join(','));
                        };
                        for (_i = 0, _a = activities; _i < _a.length; _i++) {
                            act = _a[_i];
                            _loop_1(act);
                        }
                        fs.writeFileSync(result.filePath, csvRows.join('\n'), 'utf-8');
                    }
                    return [2 /*return*/, true];
                }
                catch (error) {
                    log.error('Export error:', error);
                    return [2 /*return*/, false];
                }
                return [2 /*return*/];
        }
    });
}); });
ipcMain.handle('minimize-to-tray', function () {
    mainWindow === null || mainWindow === void 0 ? void 0 : mainWindow.hide();
});
// App lifecycle
app.whenReady().then(function () {
    log.info('App ready, creating window...');
    createWindow();
    createTray();
    // Initialize activity tracker after window is created
    if (mainWindow) {
        initTracker(mainWindow);
        setupTrackerIPC();
    }
    app.on('activate', function () {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});
app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});
app.on('before-quit', function () {
    isQuitting = true;
});
log.info('Main process initialized');
