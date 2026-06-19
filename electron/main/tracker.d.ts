import { BrowserWindow } from 'electron';
export interface TrackedActivity {
    id: string;
    appName: string;
    windowTitle: string;
    windowId?: number;
    processId?: number;
    processPath?: string;
    startTime: string;
    endTime: string | null;
    duration: number;
}
export declare function initTracker(window: BrowserWindow): void;
export declare function startTracking(): void;
export declare function stopTracking(): void;
export declare function setIdleThreshold(seconds: number): void;
export declare function getTrackingStatus(): {
    isTracking: boolean;
    currentActivity: TrackedActivity | null;
    lastActiveTime: number;
};
export declare function setupTrackerIPC(): void;
