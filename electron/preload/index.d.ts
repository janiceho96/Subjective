declare global {
    interface Window {
        electronAPI: {
            getUserDataPath: () => Promise<string>;
            getDataDir: () => Promise<string>;
            readFile: (filename: string) => Promise<unknown>;
            writeFile: (filename: string, data: unknown) => Promise<boolean>;
            exportData: (format: 'json' | 'csv' | 'md') => Promise<boolean>;
            minimizeToTray: () => Promise<void>;
            onQuickAdd: (callback: () => void) => () => void;
            startTracking: () => Promise<{
                success: boolean;
            }>;
            stopTracking: () => Promise<{
                success: boolean;
            }>;
            getTrackerStatus: () => Promise<{
                isTracking: boolean;
                currentActivity: unknown | null;
                lastActiveTime: number;
            }>;
            setIdleThreshold: (seconds: number) => Promise<{
                success: boolean;
            }>;
            onTrackerStatus: (callback: (event: unknown, status: unknown) => void) => () => void;
            onAutoTrackedActivity: (callback: (event: unknown, activity: unknown) => void) => () => void;
        };
    }
}
export {};
