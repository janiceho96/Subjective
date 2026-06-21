let allSessions = [];
let currentFilter = 'all';

// Load initial sessions
async function loadSessions() {
    try {
        const res = await fetch('/api/sessions');
        allSessions = await res.json();
        
        // Update dashboard welcome stats
        updateWelcomeStats();
        
        // Render the session cards
        renderSessionsList();
    } catch (e) {
        console.error("Failed to load sessions:", e);
    }
}

function updateWelcomeStats() {
    const sqliteCount = allSessions.filter(s => s.source === 'sqlite').length;
    const legacyCount = allSessions.filter(s => s.source === 'legacy-jsonl').length;
    
    document.getElementById('stat-sqlite').textContent = sqliteCount;
    document.getElementById('stat-legacy').textContent = legacyCount;
}

function renderSessionsList() {
    const container = document.getElementById('sessions-container');
    container.innerHTML = '';
    
    const searchVal = document.getElementById('search-input').value.toLowerCase();
    
    const filtered = allSessions.filter(s => {
        const matchesSearch = s.title.toLowerCase().includes(searchVal) || s.id.toLowerCase().includes(searchVal);
        const matchesType = currentFilter === 'all' || s.source === currentFilter;
        return matchesSearch && matchesType;
    });
    
    document.getElementById('session-count-badge').textContent = `${filtered.length} sessions`;
    
    if (filtered.length === 0) {
        container.innerHTML = '<div style="color: var(--text-dark); text-align: center; padding: 40px 10px; font-size: 0.85rem;">No conversations found</div>';
        return;
    }
    
    filtered.forEach(session => {
        const card = document.createElement('div');
        card.className = 'session-card';
        card.onclick = () => selectSession(session, card);
        
        const dateStr = new Date(session.date).toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        card.innerHTML = `
            <div class="card-title">${session.title || 'Empty Session'}</div>
            <div class="card-meta">
                <span class="badge badge-${session.source}">${session.source === 'sqlite' ? 'Active' : 'Legacy'}</span>
                <span>${dateStr}</span>
            </div>
        `;
        container.appendChild(card);
    });
}

async function selectSession(session, cardElement) {
    document.querySelectorAll('.session-card').forEach(c => c.classList.remove('selected'));
    cardElement.classList.add('selected');
    
    document.getElementById('welcome-view').classList.add('hidden');
    const chatView = document.getElementById('chat-view');
    chatView.classList.remove('hidden');
    
    document.getElementById('session-title').textContent = session.title;
    document.getElementById('session-path-display').textContent = session.file;
    document.getElementById('size-display').textContent = session.size;
    
    const badge = document.getElementById('session-badge');
    badge.textContent = session.source === 'sqlite' ? 'Active Workspace' : 'Legacy Log';
    badge.className = `source-badge badge-${session.source}`;
    
    const messagesContainer = document.getElementById('messages-container');
    messagesContainer.innerHTML = '<div style="color: var(--text-muted); text-align: center; padding: 40px;">Parsing dialogue steps and loading messages...</div>';
    
    try {
        const res = await fetch(`/api/session/${session.id}?source=${session.source}&file=${encodeURIComponent(session.file)}`);
        const chatData = await res.json();
        
        if (chatData.error) {
            messagesContainer.innerHTML = `<div style="color: var(--fail-color); text-align: center; padding: 40px;">Error: ${chatData.error}</div>`;
            document.getElementById('msg-count-display').textContent = '0';
        } else {
            document.getElementById('msg-count-display').textContent = chatData.messages ? chatData.messages.length : '0';
            renderMessages(chatData.messages);
        }
    } catch (e) {
        messagesContainer.innerHTML = `<div style="color: var(--fail-color); text-align: center; padding: 40px;">Error: ${e.message}</div>`;
        document.getElementById('msg-count-display').textContent = '0';
    }
}

function escapeHtml(text) {
    if (!text) return '';
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// Quick inline formatting for basic markdown elements (bold, code blocks, etc.)
function formatMarkdown(text) {
    if (!text) return '';
    let html = escapeHtml(text);
    
    // Bold: **text**
    html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    
    // Inline code: `code`
    html = html.replace(/`([^`]+)`/g, '<code style="background: rgba(255,255,255,0.06); padding: 2px 6px; border-radius: 4px; font-family: var(--font-mono); font-size: 0.85em; color: #a7f3d0;">$1</code>');
    
    return html;
}

function renderMessages(messages) {
    const container = document.getElementById('messages-container');
    container.innerHTML = '';
    
    if (!messages || messages.length === 0) {
        container.innerHTML = '<div style="color: var(--text-dark); text-align: center; padding: 40px;">No dialogue turns found in this session.</div>';
        return;
    }
    
    messages.forEach(msg => {
        const wrapper = document.createElement('div');
        wrapper.className = 'message-wrapper';
        
        const isUser = msg.role.toLowerCase() === 'user';
        
        const dateStr = msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString(undefined, {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        }) : '';
        
        // Build tool execution layout
        let toolsHTML = '';
        if (msg.tools && msg.tools.length > 0) {
            toolsHTML += '<div class="tools-grid">';
            msg.tools.forEach(tool => {
                const toolId = tool.id || Math.random().toString(36).substring(7);
                const argsStr = typeof tool.args === 'string' ? tool.args : JSON.stringify(tool.args, null, 2);
                const outputStr = tool.output || 'No output captured (void function or silent tool).';
                
                toolsHTML += `
                    <div class="tool-block">
                        <div class="tool-header" onclick="document.getElementById('body-${toolId}').classList.toggle('hidden')">
                            <div class="tool-header-left">
                                <span class="tool-badge">Tool</span>
                                <strong>${tool.name}</strong>
                            </div>
                            <span class="tool-status ${tool.status}">${tool.status.toUpperCase()}</span>
                        </div>
                        <div class="tool-body hidden" id="body-${toolId}">
                            <div class="tool-section">
                                <div class="tool-section-title">Arguments</div>
                                <pre class="tool-args">${escapeHtml(argsStr)}</pre>
                            </div>
                            <div class="tool-section">
                                <div class="tool-section-title">Execution Result</div>
                                <pre class="tool-output">${escapeHtml(outputStr)}</pre>
                            </div>
                        </div>
                    </div>
                `;
            });
            toolsHTML += '</div>';
        }
        
        wrapper.innerHTML = `
            <div class="message ${isUser ? 'user' : 'agent'}">
                <div class="message-meta">
                    <span class="sender-name ${isUser ? 'sender-name-user' : 'sender-name-agent'}">${isUser ? 'User' : 'Assistant'}</span>
                    ${dateStr ? `<span>${dateStr}</span>` : ''}
                </div>
                <div class="message-bubble">${formatMarkdown(msg.text)}</div>
                ${toolsHTML}
            </div>
        `;
        container.appendChild(wrapper);
    });
    
    // Auto-scroll to the bottom of conversation log
    container.scrollTop = container.scrollHeight;
}

// Bind search and filter events
document.getElementById('search-input').addEventListener('input', renderSessionsList);

document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.onclick = () => {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentFilter = btn.dataset.filter;
        renderSessionsList();
    };
});

// Load the app on load
window.onload = loadSessions;
