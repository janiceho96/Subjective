import express from 'express';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { execFileSync } from 'node:child_process';

const app = express();
const PORT = process.env.PORT || 3000;

const LEGACY_DIR = 'C:\\Users\\User\\.gemini\\tmp\\user\\chats';
const SQLITE_DIR = 'C:\\Users\\User\\.gemini\\antigravity-cli\\conversations';

app.use(express.static('public'));

// Helper to read the first line and the last few lines of a file efficiently without loading all of it
function readFirstAndLastLines(filePath) {
    let fd;
    try {
        const stat = fs.statSync(filePath);
        const fileSize = stat.size;
        fd = fs.openSync(filePath, 'r');
        
        let firstLine = '';
        let lastChunk = '';
        
        // Read first 8KB to extract the first line
        const firstBufSize = Math.min(fileSize, 8192);
        if (firstBufSize > 0) {
            const firstBuf = Buffer.alloc(firstBufSize);
            fs.readSync(fd, firstBuf, 0, firstBufSize, 0);
            const firstStr = firstBuf.toString('utf8');
            const newlineIdx = firstStr.indexOf('\n');
            firstLine = newlineIdx !== -1 ? firstStr.substring(0, newlineIdx) : firstStr;
        }
        
        // Read last 64KB to extract the last few lines
        const lastBufSize = Math.min(fileSize, 65536);
        if (lastBufSize > 0) {
            const lastBuf = Buffer.alloc(lastBufSize);
            fs.readSync(fd, lastBuf, 0, lastBufSize, fileSize - lastBufSize);
            lastChunk = lastBuf.toString('utf8');
        }
        
        return { firstLine, lastChunk };
    } finally {
        if (fd !== undefined) {
            fs.closeSync(fd);
        }
    }
}

// Get all sessions
app.get('/api/sessions', (req, res) => {
    const sessions = [];
    
    // 1. Scan Legacy JSONL files
    if (fs.existsSync(LEGACY_DIR)) {
        try {
            const files = fs.readdirSync(LEGACY_DIR).filter(f => f.endsWith('.jsonl'));
            for (const f of files) {
                const fullPath = path.join(LEGACY_DIR, f);
                const stat = fs.statSync(fullPath);
                
                let summary = 'Legacy Session';
                let id = f.replace('.jsonl', '').split('-').pop();
                let date = stat.mtime;
                
                try {
                    const { firstLine, lastChunk } = readFirstAndLastLines(fullPath);
                    
                    if (firstLine.trim()) {
                        const firstData = JSON.parse(firstLine);
                        id = firstData.sessionId || id;
                        if (firstData.startTime) {
                            date = new Date(firstData.startTime);
                        }
                    }
                    
                    if (lastChunk.trim()) {
                        // Find all instances of $set with summary in the last chunk
                        const matches = [...lastChunk.matchAll(/\{\"\$set\"[^}]*\"summary\"[^}]*\}/g)];
                        if (matches.length > 0) {
                            const lastMatch = matches[matches.length - 1][0];
                            try {
                                const lastData = JSON.parse(lastMatch);
                                if (lastData.$set && lastData.$set.summary) {
                                    const sumVal = lastData.$set.summary;
                                    // Sometimes summary is stringified JSON, check if we need to parse it
                                    if (sumVal.trim().startsWith('{')) {
                                        try {
                                            const inner = JSON.parse(sumVal);
                                            summary = inner.response || inner.summary || sumVal;
                                        } catch (e) {
                                            summary = sumVal;
                                        }
                                    } else {
                                        summary = sumVal;
                                    }
                                }
                            } catch (e) {}
                        } else {
                            // Fallback: try to parse the first User content in the file as a title
                            const userMatches = [...lastChunk.matchAll(/\"type\":\"user\",\"content\":\[\{\"text\":\"([^\"]+)\"/g)];
                            if (userMatches.length > 0) {
                                summary = userMatches[0][1].replace(/\\n/g, ' ');
                            }
                        }
                    }
                } catch (e) {
                    console.error(`Error reading headers for legacy session ${f}:`, e);
                }
                
                if (summary.length > 80) {
                    summary = summary.substring(0, 77) + '...';
                }
                
                sessions.push({
                    id,
                    title: summary,
                    date,
                    source: 'legacy-jsonl',
                    size: (stat.size / (1024 * 1024)).toFixed(2) + ' MB',
                    file: fullPath
                });
            }
        } catch (e) {
            console.error("Error scanning legacy sessions:", e);
        }
    }
    
    // 2. Scan SQLite databases
    if (fs.existsSync(SQLITE_DIR)) {
        try {
            // Call Python script to extract metadata of all databases in one process spawn
            const stdout = execFileSync('python', ['dump_sqlite.py', '--scan', SQLITE_DIR], { encoding: 'utf-8' });
            const dbs = JSON.parse(stdout);
            
            if (Array.isArray(dbs)) {
                for (const db of dbs) {
                    if (db.error) continue;
                    sessions.push({
                        id: db.id,
                        title: db.summary,
                        date: new Date(db.date),
                        source: 'sqlite',
                        size: (db.size / (1024 * 1024)).toFixed(2) + ' MB',
                        file: db.file
                    });
                }
            }
        } catch (e) {
            console.error("Error scanning SQLite database sessions:", e);
        }
    }
    
    // Sort by date descending
    sessions.sort((a, b) => new Date(b.date) - new Date(a.date));
    res.json(sessions);
});

// Get specific session messages
app.get('/api/session/:id', (req, res) => {
    const { id } = req.params;
    const { source } = req.query;
    
    // Strict alphanumeric/UUID style check on session ID to block Path Traversal and Command Injection
    if (!/^[a-zA-Z0-9-]+$/.test(id)) {
        return res.status(400).json({ error: 'Invalid session ID format' });
    }
    
    let resolvedPath = '';
    
    if (source === 'sqlite') {
        resolvedPath = path.join(SQLITE_DIR, `${id}.db`);
        if (!resolvedPath.startsWith(SQLITE_DIR) || !fs.existsSync(resolvedPath)) {
            return res.status(404).json({ error: 'SQLite database session not found' });
        }
        
        // Call Python script using safe process execution API
        try {
            const stdout = execFileSync('python', ['dump_sqlite.py', resolvedPath], { encoding: 'utf-8' });
            return res.json(JSON.parse(stdout));
        } catch (e) {
            return res.status(500).json({ error: 'Failed to parse SQLite session: ' + e.message });
        }
    } else {
        // Resolve legacy JSONL path safely by looking for corresponding file in LEGACY_DIR
        try {
            const files = fs.readdirSync(LEGACY_DIR);
            const matchedFile = files.find(f => f.endsWith(`${id}.jsonl`) || f.endsWith(`${id}.json`));
            if (!matchedFile) {
                return res.status(404).json({ error: 'Legacy session file not found' });
            }
            
            resolvedPath = path.join(LEGACY_DIR, matchedFile);
            if (!resolvedPath.startsWith(LEGACY_DIR) || !fs.existsSync(resolvedPath)) {
                return res.status(404).json({ error: 'Legacy session file path traversal blocked' });
            }
        } catch (e) {
            return res.status(500).json({ error: 'Failed to access legacy chat directory: ' + e.message });
        }
        
        // Parse legacy JSONL file line by line
        try {
            const content = fs.readFileSync(resolvedPath, 'utf-8');
            const lines = content.trim().split('\n');
            const messages = [];
            let summary = 'Legacy Session';
            
            for (const line of lines) {
                if (!line.trim()) continue;
                const data = JSON.parse(line);
                
                // Generic turn extraction: handle any model name dynamically without hardcoding whitelists
                if (data.type && data.type !== 'checkpoint' && data.type !== 'system' && data.type !== '$set') {
                    let text = '';
                    const contentVal = data.content;
                    if (Array.isArray(contentVal)) {
                        text = contentVal.map(p => p.text || '').join('');
                    } else if (typeof contentVal === 'string') {
                        text = contentVal;
                    }
                    
                    const tool_info = [];
                    const tool_calls = data.toolCalls || [];
                    for (const tc of tool_calls) {
                        let outputStr = '';
                        if (tc.result) {
                            if (Array.isArray(tc.result) && tc.result.length > 0) {
                                const resObj = tc.result[0];
                                if (resObj.functionResponse && resObj.functionResponse.response) {
                                    outputStr = resObj.functionResponse.response.output || JSON.stringify(resObj.functionResponse.response);
                                } else {
                                    outputStr = JSON.stringify(resObj);
                                }
                            } else {
                                outputStr = typeof tc.result === 'string' ? tc.result : JSON.stringify(tc.result);
                            }
                        }
                        
                        tool_info.push({
                            id: tc.id || '',
                            name: tc.name,
                            args: tc.args || {},
                            status: tc.result ? 'success' : 'pending',
                            output: outputStr
                        });
                    }
                    
                    messages.push({
                        role: data.type === 'user' ? 'User' : 'Agent',
                        text: text.trim(),
                        tools: tool_info,
                        timestamp: data.timestamp
                    });
                } else if (data.$set && data.$set.summary) {
                    const sumVal = data.$set.summary;
                    if (sumVal.trim().startsWith('{')) {
                        try {
                            const inner = JSON.parse(sumVal);
                            summary = inner.response || inner.summary || sumVal;
                        } catch (e) {
                            summary = sumVal;
                        }
                    } else {
                        summary = sumVal;
                    }
                }
            }
            return res.json({ id, summary, messages });
        } catch (e) {
            return res.status(500).json({ error: 'Failed to read JSONL file: ' + e.message });
        }
    }
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
