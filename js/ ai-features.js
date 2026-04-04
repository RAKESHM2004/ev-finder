/**
 * EV Finder - AI Features Module
 * Provides: AI Chatbot, Smart Station Recommender, AI Mechanic Finder, Battery Insights
 * Uses backend API endpoints
 * Include this script at the bottom of: user-request-dashboard.html, stations.html, mechanics.html
 */

const EV_AI = (() => {
  const API_BASE = 'http://localhost:5000/api/ai';
  const CHAT_URL = `${API_BASE}/chat`;
  const STATION_URL = `${API_BASE}/recommend-stations`;
  const MECHANIC_URL = `${API_BASE}/find-mechanics`;
  const BATTERY_URL = `${API_BASE}/battery-insights`;

  // ─── Helpers ────────────────────────────────────────────────────────────────

  function getUser() { 
    try { 
      return JSON.parse(localStorage.getItem('user') || '{}'); 
    } catch { 
      return {}; 
    } 
  }
  
  function getCurrency() {
    try { 
      return JSON.parse(localStorage.getItem('preferredCurrency') || '{"symbol":"₹","code":"INR","exchangeRate":83.5}'); 
    } catch { 
      return { symbol: '₹', code: 'INR', exchangeRate: 83.5 }; 
    }
  }

  function formatPrice(usd) {
    const c = getCurrency();
    return `${c.symbol}${(usd * c.exchangeRate).toFixed(2)} ${c.code}`;
  }

  // ─── Inject global styles ────────────────────────────────────────────────────

  function injectStyles() {
    if (document.getElementById('ev-ai-styles')) return;
    const style = document.createElement('style');
    style.id = 'ev-ai-styles';
    style.textContent = `
      /* ── AI Floating Button ── */
      #ev-ai-fab {
        position: fixed; bottom: 28px; right: 28px; z-index: 9999;
        width: 60px; height: 60px; border-radius: 50%;
        background: linear-gradient(135deg, #059669, #10b981);
        color: white; border: none; cursor: pointer;
        box-shadow: 0 8px 32px rgba(16,185,129,0.45);
        font-size: 1.6rem; display: flex; align-items: center; justify-content: center;
        transition: transform 0.3s, box-shadow 0.3s;
        animation: ev-ai-pulse 2.5s infinite;
      }
      #ev-ai-fab:hover { transform: scale(1.12); box-shadow: 0 12px 40px rgba(16,185,129,0.6); }
      @keyframes ev-ai-pulse {
        0%,100% { box-shadow: 0 8px 32px rgba(16,185,129,0.45); }
        50%      { box-shadow: 0 8px 48px rgba(16,185,129,0.75); }
      }
      #ev-ai-fab .ev-ai-badge {
        position: absolute; top: -4px; right: -4px;
        width: 18px; height: 18px; border-radius: 50%;
        background: #f59e0b; font-size: 0.6rem; font-weight: 800;
        display: flex; align-items: center; justify-content: center;
        border: 2px solid white;
      }

      /* ── AI Panel ── */
      #ev-ai-panel {
        position: fixed; bottom: 100px; right: 28px; z-index: 9998;
        width: 380px; max-height: 78vh;
        background: white; border-radius: 20px;
        box-shadow: 0 24px 64px rgba(0,0,0,0.18);
        display: none; flex-direction: column;
        overflow: hidden; font-family: 'Inter', sans-serif;
        border: 1px solid #e5e7eb;
        animation: ev-ai-slide-up 0.3s cubic-bezier(0.34,1.56,0.64,1);
      }
      #ev-ai-panel.open { display: flex; }
      @keyframes ev-ai-slide-up {
        from { opacity:0; transform: translateY(24px) scale(0.96); }
        to   { opacity:1; transform: translateY(0)   scale(1); }
      }

      /* ── Panel header ── */
      .ev-ai-header {
        background: linear-gradient(135deg, #059669, #10b981);
        padding: 16px 20px; color: white;
        display: flex; align-items: center; justify-content: space-between;
        flex-shrink: 0;
      }
      .ev-ai-header-title { font-weight: 700; font-size: 1rem; display: flex; align-items: center; gap: 8px; }
      .ev-ai-header-title span.ai-dot {
        width: 8px; height: 8px; border-radius: 50%; background: #a7f3d0;
        animation: blink 1.4s infinite;
      }
      @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.3} }
      .ev-ai-close-btn {
        background: rgba(255,255,255,0.2); border: none; color: white;
        width: 28px; height: 28px; border-radius: 50%; cursor: pointer;
        display: flex; align-items: center; justify-content: center;
        font-size: 0.85rem; transition: background 0.2s;
      }
      .ev-ai-close-btn:hover { background: rgba(255,255,255,0.35); }

      /* ── Tabs ── */
      .ev-ai-tabs {
        display: flex; border-bottom: 1px solid #f3f4f6;
        background: #fafafa; flex-shrink: 0;
      }
      .ev-ai-tab {
        flex: 1; padding: 10px 4px; font-size: 0.68rem; font-weight: 600;
        color: #6b7280; cursor: pointer; border: none; background: none;
        transition: all 0.2s; text-transform: uppercase; letter-spacing: 0.03em;
        display: flex; flex-direction: column; align-items: center; gap: 3px;
      }
      .ev-ai-tab i { font-size: 0.95rem; }
      .ev-ai-tab.active { color: #059669; border-bottom: 2px solid #059669; background: white; }
      .ev-ai-tab:hover:not(.active) { color: #374151; background: #f3f4f6; }

      /* ── Tab panels ── */
      .ev-ai-content { flex: 1; overflow-y: auto; min-height: 0; }
      .ev-ai-pane { display: none; padding: 16px; }
      .ev-ai-pane.active { display: block; }

      /* ── Chat ── */
      .ev-chat-messages {
        min-height: 200px; max-height: 260px; overflow-y: auto;
        display: flex; flex-direction: column; gap: 10px; margin-bottom: 12px;
      }
      .ev-chat-bubble {
        max-width: 88%; padding: 10px 14px; border-radius: 16px;
        font-size: 0.85rem; line-height: 1.5;
      }
      .ev-chat-bubble.user {
        background: linear-gradient(135deg,#059669,#10b981);
        color: white; align-self: flex-end; border-bottom-right-radius: 4px;
      }
      .ev-chat-bubble.ai {
        background: #f3f4f6; color: #1f2937;
        align-self: flex-start; border-bottom-left-radius: 4px;
      }
      .ev-chat-bubble.typing { opacity: 0.7; }
      .ev-chat-input-row { display: flex; gap: 8px; }
      .ev-chat-input {
        flex: 1; padding: 10px 14px; border: 1.5px solid #e5e7eb;
        border-radius: 12px; font-size: 0.85rem; outline: none;
        transition: border-color 0.2s;
      }
      .ev-chat-input:focus { border-color: #10b981; }
      .ev-chat-send {
        background: linear-gradient(135deg,#059669,#10b981);
        color: white; border: none; border-radius: 12px;
        padding: 0 16px; cursor: pointer; font-size: 0.9rem;
        transition: opacity 0.2s;
      }
      .ev-chat-send:hover { opacity: 0.85; }
      .ev-chat-suggestions { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 10px; }
      .ev-chat-suggestion {
        font-size: 0.72rem; padding: 5px 10px; border-radius: 20px;
        border: 1px solid #d1fae5; background: #ecfdf5; color: #065f46;
        cursor: pointer; transition: all 0.2s;
      }
      .ev-chat-suggestion:hover { background: #d1fae5; }

      /* ── Recommender / Finder cards ── */
      .ev-ai-card {
        border: 1px solid #e5e7eb; border-radius: 12px; padding: 12px;
        margin-bottom: 10px; transition: border-color 0.2s, box-shadow 0.2s;
      }
      .ev-ai-card:hover { border-color: #10b981; box-shadow: 0 4px 12px rgba(16,185,129,0.12); }
      .ev-ai-card-title { font-weight: 700; font-size: 0.9rem; color: #111827; }
      .ev-ai-card-sub { font-size: 0.78rem; color: #6b7280; margin-top: 2px; }
      .ev-ai-card-tags { display: flex; flex-wrap: wrap; gap: 4px; margin-top: 8px; }
      .ev-ai-tag {
        font-size: 0.68rem; padding: 2px 8px; border-radius: 20px;
        background: #ecfdf5; color: #065f46; border: 1px solid #d1fae5;
      }
      .ev-ai-tag.warn { background: #fff7ed; color: #9a3412; border-color: #fed7aa; }
      .ev-ai-tag.info { background: #eff6ff; color: #1e40af; border-color: #bfdbfe; }
      .ev-ai-score {
        display: flex; align-items: center; gap: 6px; margin-top: 8px;
      }
      .ev-ai-score-bar {
        flex: 1; height: 6px; border-radius: 3px; background: #e5e7eb; overflow: hidden;
      }
      .ev-ai-score-fill { height: 100%; border-radius: 3px; background: linear-gradient(90deg,#059669,#10b981); }
      .ev-ai-score-label { font-size: 0.72rem; font-weight: 700; color: #059669; }

      /* ── Battery gauge ── */
      .ev-battery-gauge {
        display: flex; flex-direction: column; align-items: center; gap: 8px;
        margin: 12px 0;
      }
      .ev-battery-svg { filter: drop-shadow(0 4px 12px rgba(16,185,129,0.3)); }
      .ev-battery-status { font-size: 0.85rem; font-weight: 600; text-align: center; }
      .ev-battery-insight {
        background: #f0fdf4; border-left: 3px solid #10b981;
        padding: 10px 12px; border-radius: 8px; font-size: 0.82rem; color: #166534;
        margin-bottom: 8px;
      }
      .ev-battery-insight.warn { background: #fff7ed; border-left-color: #f97316; color: #9a3412; }
      .ev-battery-insight.info { background: #eff6ff; border-left-color: #3b82f6; color: #1e40af; }

      /* ── Loading state ── */
      .ev-ai-loading {
        display: flex; align-items: center; gap: 10px;
        padding: 12px; color: #6b7280; font-size: 0.85rem;
      }
      .ev-ai-spinner {
        width: 20px; height: 20px; border: 2.5px solid #e5e7eb;
        border-top-color: #10b981; border-radius: 50%;
        animation: ev-spin 0.8s linear infinite; flex-shrink: 0;
      }
      @keyframes ev-spin { to { transform: rotate(360deg); } }

      /* ── Form elements ── */
      .ev-ai-label { font-size: 0.78rem; font-weight: 600; color: #374151; margin-bottom: 4px; display: block; }
      .ev-ai-input, .ev-ai-select {
        width: 100%; padding: 9px 12px; border: 1.5px solid #e5e7eb;
        border-radius: 10px; font-size: 0.83rem; outline: none;
        transition: border-color 0.2s; background: white; margin-bottom: 10px;
      }
      .ev-ai-input:focus, .ev-ai-select:focus { border-color: #10b981; }
      .ev-ai-btn {
        width: 100%; padding: 11px; border-radius: 10px; border: none;
        font-weight: 700; font-size: 0.85rem; cursor: pointer;
        background: linear-gradient(135deg,#059669,#10b981); color: white;
        transition: opacity 0.2s, transform 0.15s;
      }
      .ev-ai-btn:hover { opacity: 0.9; transform: translateY(-1px); }
      .ev-ai-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
      .ev-ai-results { margin-top: 12px; }
      .ev-ai-section-title {
        font-size: 0.72rem; font-weight: 700; text-transform: uppercase;
        letter-spacing: 0.06em; color: #9ca3af; margin: 12px 0 6px;
      }

      /* Mobile */
      @media (max-width: 440px) {
        #ev-ai-panel { width: calc(100vw - 32px); right: 16px; bottom: 90px; }
        #ev-ai-fab   { right: 16px; bottom: 16px; }
      }
    `;
    document.head.appendChild(style);
  }

  // ─── Build HTML skeleton ─────────────────────────────────────────────────────

  function buildPanel() {
    if (document.getElementById('ev-ai-panel')) return;

    // Detect which page we're on
    const page = location.pathname;
    const isStations  = page.includes('station');
    const isMechanics = page.includes('mechanic');
    const isDashboard = page.includes('dashboard') || page.includes('ev-owner') || page.includes('user-request');

    document.body.insertAdjacentHTML('beforeend', `
      <!-- EV AI Floating Button -->
      <button id="ev-ai-fab" title="AI Assistant" onclick="EV_AI.togglePanel()">
        🤖
        <div class="ev-ai-badge">AI</div>
      </button>

      <!-- EV AI Panel -->
      <div id="ev-ai-panel">
        <div class="ev-ai-header">
          <div class="ev-ai-header-title">
            <span class="ai-dot"></span>
            EV AI Assistant
          </div>
          <button class="ev-ai-close-btn" onclick="EV_AI.togglePanel()">✕</button>
        </div>

        <div class="ev-ai-tabs">
          <button class="ev-ai-tab active" data-tab="chat" onclick="EV_AI.switchTab('chat')">
            <i class="fas fa-comments"></i>Chat
          </button>
          ${(isDashboard || isStations) ? `
          <button class="ev-ai-tab" data-tab="station" onclick="EV_AI.switchTab('station')">
            <i class="fas fa-charging-station"></i>Stations
          </button>` : ''}
          ${(isDashboard || isMechanics) ? `
          <button class="ev-ai-tab" data-tab="mechanic" onclick="EV_AI.switchTab('mechanic')">
            <i class="fas fa-tools"></i>Mechanics
          </button>` : ''}
          ${isDashboard ? `
          <button class="ev-ai-tab" data-tab="battery" onclick="EV_AI.switchTab('battery')">
            <i class="fas fa-battery-three-quarters"></i>Battery
          </button>` : ''}
        </div>

        <div class="ev-ai-content">

          <!-- ── Chat pane ── -->
          <div id="ev-ai-pane-chat" class="ev-ai-pane active">
            <div class="ev-chat-suggestions" id="chat-suggestions">
              <span class="ev-chat-suggestion" onclick="EV_AI.Chat.sendSuggestion(this)">Find nearest station</span>
              <span class="ev-chat-suggestion" onclick="EV_AI.Chat.sendSuggestion(this)">Best charger for my EV?</span>
              <span class="ev-chat-suggestion" onclick="EV_AI.Chat.sendSuggestion(this)">How to extend battery life?</span>
              <span class="ev-chat-suggestion" onclick="EV_AI.Chat.sendSuggestion(this)">Emergency repair help</span>
            </div>
            <div class="ev-chat-messages" id="chat-messages">
              <div class="ev-chat-bubble ai">👋 Hi! I'm your EV AI assistant. Ask me anything about charging stations, mechanics, or your EV battery!</div>
            </div>
            <div class="ev-chat-input-row">
              <input class="ev-chat-input" id="chat-input" placeholder="Ask anything about EVs..." 
                onkeydown="if(event.key==='Enter') EV_AI.Chat.send()">
              <button class="ev-chat-send" onclick="EV_AI.Chat.send()">
                <i class="fas fa-paper-plane"></i>
              </button>
            </div>
          </div>

          <!-- ── Station Recommender pane ── -->
          ${(isDashboard || isStations) ? `
          <div id="ev-ai-pane-station" class="ev-ai-pane">
            <div class="ev-ai-section-title">Smart Station Finder</div>
            <label class="ev-ai-label">Your Location / City</label>
            <input class="ev-ai-input" id="ai-station-city" placeholder="e.g. Chennai, Anna Nagar">
            <label class="ev-ai-label">Charger Type Needed</label>
            <select class="ev-ai-select" id="ai-station-charger">
              <option value="">Any charger type</option>
              <option>CCS (DC Fast)</option>
              <option>CHAdeMO</option>
              <option>Type 2 (AC)</option>
              <option>Tesla Supercharger</option>
              <option>Level 1 (Home)</option>
            </select>
            <label class="ev-ai-label">Priority</label>
            <select class="ev-ai-select" id="ai-station-priority">
              <option value="nearest">Nearest to me</option>
              <option value="cheapest">Lowest price</option>
              <option value="fastest">Fastest charging</option>
              <option value="amenities">Best amenities</option>
              <option value="available">Available now</option>
            </select>
            <label class="ev-ai-label">Current Battery %</label>
            <input class="ev-ai-input" id="ai-station-battery" type="number" min="0" max="100" placeholder="e.g. 25">
            <button class="ev-ai-btn" id="ai-station-btn" onclick="EV_AI.StationRec.find()">
              <i class="fas fa-search mr-2"></i> Find Best Station
            </button>
            <div class="ev-ai-results" id="ai-station-results"></div>
          </div>` : ''}

          <!-- ── Mechanic Finder pane ── -->
          ${(isDashboard || isMechanics) ? `
          <div id="ev-ai-pane-mechanic" class="ev-ai-pane">
            <div class="ev-ai-section-title">AI Mechanic Matcher</div>
            <label class="ev-ai-label">Describe your EV issue</label>
            <input class="ev-ai-input" id="ai-mech-issue" placeholder="e.g. battery not charging, warning light">
            <label class="ev-ai-label">Your Location / City</label>
            <input class="ev-ai-input" id="ai-mech-city" placeholder="e.g. Chennai, Coimbatore">
            <label class="ev-ai-label">Urgency</label>
            <select class="ev-ai-select" id="ai-mech-urgency">
              <option value="normal">Normal (within a week)</option>
              <option value="soon">Soon (next 2 days)</option>
              <option value="urgent">Urgent (today)</option>
              <option value="emergency">Emergency (stranded)</option>
            </select>
            <label class="ev-ai-label">EV Make / Model (optional)</label>
            <input class="ev-ai-input" id="ai-mech-vehicle" placeholder="e.g. Tata Nexon EV, MG ZS">
            <button class="ev-ai-btn" id="ai-mech-btn" onclick="EV_AI.MechanicFinder.find()">
              <i class="fas fa-wrench mr-2"></i> Find Best Mechanic
            </button>
            <div class="ev-ai-results" id="ai-mech-results"></div>
          </div>` : ''}

          <!-- ── Battery Insights pane ── -->
          ${isDashboard ? `
          <div id="ev-ai-pane-battery" class="ev-ai-pane">
            <div class="ev-ai-section-title">Predictive Battery Insights</div>
            <label class="ev-ai-label">Current Battery %</label>
            <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px;">
              <input type="range" id="ai-batt-level" min="0" max="100" value="65"
                oninput="document.getElementById('ai-batt-display').textContent=this.value+'%'"
                style="flex:1;">
              <span id="ai-batt-display" style="font-weight:700;color:#059669;min-width:40px;">65%</span>
            </div>
            <label class="ev-ai-label">EV Make / Model</label>
            <input class="ev-ai-input" id="ai-batt-vehicle" placeholder="e.g. Tata Nexon EV Max">
            <label class="ev-ai-label">Typical daily km driven</label>
            <input class="ev-ai-input" id="ai-batt-km" type="number" placeholder="e.g. 40">
            <label class="ev-ai-label">Charging habits</label>
            <select class="ev-ai-select" id="ai-batt-habit">
              <option value="daily">Charge daily</option>
              <option value="weekly">Charge 2-3x per week</option>
              <option value="low">Only charge when low (&lt;20%)</option>
              <option value="always_full">Always charge to 100%</option>
              <option value="dc_fast">Mostly DC fast charging</option>
            </select>
            <button class="ev-ai-btn" id="ai-batt-btn" onclick="EV_AI.BatteryInsights.analyze()">
              <i class="fas fa-brain mr-2"></i> Analyze My Battery
            </button>
            <div id="ai-batt-gauge" class="ev-battery-gauge" style="display:none;"></div>
            <div class="ev-ai-results" id="ai-batt-results"></div>
          </div>` : ''}

        </div>
      </div>
    `);
  }

  // ─── Panel toggle ────────────────────────────────────────────────────────────

  function togglePanel() {
    const panel = document.getElementById('ev-ai-panel');
    panel.classList.toggle('open');
  }

  function switchTab(name) {
    document.querySelectorAll('.ev-ai-tab').forEach(t => t.classList.toggle('active', t.dataset.tab === name));
    document.querySelectorAll('.ev-ai-pane').forEach(p => p.classList.toggle('active', p.id === `ev-ai-pane-${name}`));
  }

  // ─── Loading helper ──────────────────────────────────────────────────────────

  function showLoading(container, msg = 'Loading...') {
    container.innerHTML = `<div class="ev-ai-loading"><div class="ev-ai-spinner"></div>${msg}</div>`;
  }

  function showError(container, msg) {
    container.innerHTML = `<div class="ev-battery-insight warn"><i class="fas fa-exclamation-circle mr-2"></i>${msg}</div>`;
  }

  // ─── Chat Module ─────────────────────────────────────────────────────────────

  const Chat = (() => {
    const history = [];

    function appendBubble(text, role) {
      const box = document.getElementById('chat-messages');
      const div = document.createElement('div');
      div.className = `ev-chat-bubble ${role}`;
      div.textContent = text;
      box.appendChild(div);
      box.scrollTop = box.scrollHeight;
      return div;
    }

    async function send() {
      const input = document.getElementById('chat-input');
      const msg = input.value.trim();
      if (!msg) return;
      input.value = '';
      document.getElementById('chat-suggestions').style.display = 'none';
      appendBubble(msg, 'user');

      const typing = appendBubble('…', 'ai typing');
      history.push({ role: 'user', content: msg });

      try {
        const res = await fetch(CHAT_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: 'claude-3-sonnet-20240229',
            max_tokens: 1000,
            system: 'You are EV Finder\'s helpful AI assistant.',
            messages: history.slice(-10)
          })
        });
        const data = await res.json();
        const reply = data.content?.[0]?.text || data.text || "I'm here to help with your EV needs!";
        history.push({ role: 'assistant', content: reply });
        typing.textContent = reply;
        typing.classList.remove('typing');
      } catch (err) {
        console.error('Chat error:', err);
        typing.textContent = '⚠️ Could not reach AI. Check your connection.';
      }
    }

    function sendSuggestion(el) {
      document.getElementById('chat-input').value = el.textContent;
      send();
    }

    return { send, sendSuggestion };
  })();

  // ─── Station Recommender ─────────────────────────────────────────────────────

  const StationRec = (() => {
    async function find() {
      const city = document.getElementById('ai-station-city').value.trim();
      const charger = document.getElementById('ai-station-charger').value;
      const priority = document.getElementById('ai-station-priority').value;
      const battery = document.getElementById('ai-station-battery').value;
      const results = document.getElementById('ai-station-results');
      const btn = document.getElementById('ai-station-btn');

      if (!city) { showError(results, 'Please enter your location or city.'); return; }

      btn.disabled = true;
      showLoading(results, 'Finding best stations for you…');

      try {
        const response = await fetch(STATION_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ city, chargerType: charger, priority, battery: battery ? parseInt(battery) : null })
        });

        if (!response.ok) throw new Error('Failed to get recommendations');

        const recs = await response.json();
        renderStations(recs, results);
      } catch (error) {
        console.error('Station finder error:', error);
        showError(results, 'Could not fetch recommendations. Try again.');
      } finally {
        btn.disabled = false;
      }
    }

    function renderStations(recs, container) {
      if (!recs || !recs.length) { showError(container, 'No stations found for your criteria.'); return; }
      const currency = getCurrency();
      container.innerHTML = `<div class="ev-ai-section-title">${recs.length} AI Recommendations</div>` +
        recs.map((r, i) => `
          <div class="ev-ai-card">
            <div style="display:flex;justify-content:space-between;align-items:flex-start;">
              <div>
                <div class="ev-ai-card-title">${i===0?'⭐ ':''}${r.name}</div>
                <div class="ev-ai-card-sub"><i class="fas fa-map-pin" style="color:#10b981"></i> ${r.address}</div>
              </div>
              <span style="font-size:0.72rem;font-weight:700;color:#059669;background:#ecfdf5;padding:3px 8px;border-radius:20px;">${r.distance||'?'}</span>
            </div>
            ${r.urgencyNote ? `<div class="ev-battery-insight warn" style="margin:6px 0;padding:6px 10px;font-size:0.78rem;">⚠️ ${r.urgencyNote}</div>` : ''}
            <div class="ev-ai-score">
              <span style="font-size:0.75rem;color:#6b7280;">Match</span>
              <div class="ev-ai-score-bar"><div class="ev-ai-score-fill" style="width:${r.matchScore||80}%"></div></div>
              <span class="ev-ai-score-label">${r.matchScore||80}%</span>
            </div>
            <div class="ev-ai-card-tags">
              ${(r.chargers||[]).map(c=>`<span class="ev-ai-tag info">${c}</span>`).join('')}
              ${(r.amenities||[]).map(a=>`<span class="ev-ai-tag">${a}</span>`).join('')}
            </div>
            <div style="display:flex;justify-content:space-between;align-items:center;margin-top:8px;">
              <span style="font-size:0.78rem;color:#6b7280;">${r.whyRecommended||''}</span>
              <span style="font-size:0.8rem;font-weight:700;color:#059669;">${r.pricePerKwh ? currency.symbol+(r.pricePerKwh*currency.exchangeRate).toFixed(2)+'/kWh' : ''}</span>
            </div>
            ${r.estimatedWaitMin !== undefined ? `<div style="font-size:0.72rem;color:#6b7280;margin-top:4px;">⏱ Est. wait: ${r.estimatedWaitMin} min</div>` : ''}
          </div>
        `).join('');
    }

    return { find };
  })();

  // ─── Mechanic Finder ─────────────────────────────────────────────────────────

  const MechanicFinder = (() => {
    async function find() {
      const issue = document.getElementById('ai-mech-issue').value.trim();
      const city = document.getElementById('ai-mech-city').value.trim();
      const urgency = document.getElementById('ai-mech-urgency').value;
      const vehicle = document.getElementById('ai-mech-vehicle').value.trim();
      const results = document.getElementById('ai-mech-results');
      const btn = document.getElementById('ai-mech-btn');

      if (!issue) { showError(results, 'Please describe your EV issue.'); return; }

      btn.disabled = true;
      showLoading(results, 'Matching mechanics to your issue…');

      try {
        const response = await fetch(MECHANIC_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ issue, city, urgency, vehicle })
        });

        if (!response.ok) throw new Error('Failed to get mechanic recommendations');

        const data = await response.json();
        renderMechanics(data, results);
      } catch (error) {
        console.error('Mechanic finder error:', error);
        showError(results, 'Could not fetch mechanic recommendations. Try again.');
      } finally {
        btn.disabled = false;
      }
    }

    function severityColor(s) {
      return { low:'#059669', medium:'#d97706', high:'#dc2626', critical:'#7c3aed' }[s] || '#6b7280';
    }

    function renderMechanics(data, container) {
      const d = data.diagnosis || {};
      const mechs = data.mechanics || [];

      container.innerHTML = `
        <div class="ev-ai-section-title">AI Diagnosis</div>
        <div class="ev-ai-card" style="border-color:${severityColor(d.severity)}22">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
            <span style="font-weight:700;font-size:0.88rem;">Likely Cause</span>
            <span style="font-size:0.72rem;font-weight:700;padding:2px 8px;border-radius:12px;background:${severityColor(d.severity)}22;color:${severityColor(d.severity)};">
              ${d.severity?.toUpperCase()||'UNKNOWN'} SEVERITY
            </span>
          </div>
          <div style="font-size:0.83rem;color:#374151;">${d.likelyCause||'Under investigation'}</div>
          <div class="ev-ai-card-tags" style="margin-top:8px;">
            <span class="ev-ai-tag ${d.canDriveToShop?'':'warn'}">${d.canDriveToShop?'✅ Safe to drive':'🚫 Do not drive'}</span>
            ${d.estimatedRepairTime ? `<span class="ev-ai-tag info">⏱ ${d.estimatedRepairTime}</span>` : ''}
            ${d.estimatedCost ? `<span class="ev-ai-tag">💰 ${d.estimatedCost}</span>` : ''}
          </div>
        </div>
        ${data.immediateAdvice ? `
        <div class="ev-battery-insight warn">
          <strong>⚡ Do now:</strong> ${data.immediateAdvice}
        </div>` : ''}
        ${mechs.length ? `
        <div class="ev-ai-section-title">${mechs.length} Matched Mechanics</div>
        ${mechs.map((m,i) => `
          <div class="ev-ai-card">
            <div style="display:flex;justify-content:space-between;align-items:flex-start;">
              <div>
                <div class="ev-ai-card-title">${i===0?'🏆 ':''}${m.name}</div>
                <div class="ev-ai-card-sub">${m.shop} · ${m.address||''}</div>
              </div>
              <div style="text-align:right;">
                <div style="font-size:0.72rem;font-weight:700;color:#059669;">${m.distance||''}</div>
                <div style="font-size:0.72rem;color:#f59e0b;">★ ${m.rating||'?'}</div>
              </div>
            </div>
            <div class="ev-ai-score">
              <span style="font-size:0.75rem;color:#6b7280;">Match</span>
              <div class="ev-ai-score-bar"><div class="ev-ai-score-fill" style="width:${m.matchScore||80}%"></div></div>
              <span class="ev-ai-score-label">${m.matchScore||80}%</span>
            </div>
            <div class="ev-ai-card-tags">
              <span class="ev-ai-tag info">${m.specialization||'General EV'}</span>
              <span class="ev-ai-tag">${m.availability||'Check availability'}</span>
              ${m.emergencyService ? '<span class="ev-ai-tag warn">🚨 24/7 Emergency</span>' : ''}
            </div>
            <div style="font-size:0.77rem;color:#6b7280;margin-top:6px;">${m.whyBestMatch||''}</div>
          </div>
        `).join('')}` : ''}
      `;
    }

    return { find };
  })();

  // ─── Battery Insights ────────────────────────────────────────────────────────

  const BatteryInsights = (() => {
    async function analyze() {
      const level = parseInt(document.getElementById('ai-batt-level').value);
      const vehicle = document.getElementById('ai-batt-vehicle').value.trim();
      const km = document.getElementById('ai-batt-km').value;
      const habit = document.getElementById('ai-batt-habit').value;
      const results = document.getElementById('ai-batt-results');
      const gauge = document.getElementById('ai-batt-gauge');
      const btn = document.getElementById('ai-batt-btn');

      btn.disabled = true;
      gauge.style.display = 'none';
      showLoading(results, 'Analyzing battery health…');

      try {
        const response = await fetch(BATTERY_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ level, vehicle, km: km ? parseInt(km) : null, habit })
        });

        if (!response.ok) throw new Error('Failed to analyze battery');

        const data = await response.json();
        renderBattery(data, level, gauge, results);
      } catch (error) {
        console.error('Battery analysis error:', error);
        showError(results, 'Could not analyze battery. Try again.');
      } finally {
        btn.disabled = false;
      }
    }

    function healthColor(score) {
      if (score >= 80) return '#059669';
      if (score >= 60) return '#d97706';
      if (score >= 40) return '#dc2626';
      return '#7c3aed';
    }

    function renderBattery(data, level, gauge, results) {
      const color = healthColor(data.healthScore || 80);
      const circumference = 2 * Math.PI * 54;
      const offset = circumference * (1 - (data.healthScore || 80) / 100);

      gauge.style.display = 'flex';
      gauge.innerHTML = `
        <svg class="ev-battery-svg" width="130" height="130" viewBox="0 0 130 130">
          <circle cx="65" cy="65" r="54" fill="none" stroke="#e5e7eb" stroke-width="10"/>
          <circle cx="65" cy="65" r="54" fill="none" stroke="${color}" stroke-width="10"
            stroke-dasharray="${circumference}" stroke-dashoffset="${offset}"
            stroke-linecap="round" transform="rotate(-90 65 65)"
            style="transition: stroke-dashoffset 1.2s ease-out;"/>
          <text x="65" y="58" text-anchor="middle" font-size="22" font-weight="800" fill="${color}">${data.healthScore||80}</text>
          <text x="65" y="74" text-anchor="middle" font-size="11" fill="#6b7280">Health Score</text>
          <text x="65" y="90" text-anchor="middle" font-size="10" font-weight="600" fill="#374151">${data.status||'Good'}</text>
        </svg>
        <div class="ev-battery-status">
          <div style="font-size:0.95rem;font-weight:700;color:${color};">${data.chargingRecommendation||''}</div>
          <div style="font-size:0.78rem;color:#6b7280;">Est. range: <strong>${data.estimatedRange||'?'}</strong></div>
          <div style="font-size:0.78rem;color:#6b7280;">At full charge: <strong>${data.predictedRangeAtFullCharge||'?'}</strong></div>
        </div>
      `;

      const typeMap = { tip:'', warning:'warn', info:'info', danger:'warn' };
      results.innerHTML = `
        ${(data.insights||[]).map(ins => `
          <div class="ev-battery-insight ${typeMap[ins.type]||''}">
            ${ins.type==='warning'||ins.type==='danger' ? '⚠️' : ins.type==='tip' ? '💡' : 'ℹ️'} ${ins.message}
          </div>
        `).join('')}
        <div class="ev-ai-section-title">Details</div>
        <div class="ev-ai-card">
          <div class="ev-ai-card-tags">
            <span class="ev-ai-tag info">🎯 Target: ${data.optimalChargeTarget||80}% charge</span>
            <span class="ev-ai-tag ${data.degradationRisk==='high'?'warn':''}">${data.degradationRisk||'low'} degradation risk</span>
          </div>
          ${data.nextServiceKm ? `<div style="font-size:0.78rem;color:#6b7280;margin-top:8px;">🔧 Next service at ${data.nextServiceKm.toLocaleString()} km</div>` : ''}
          ${data.savingsTip ? `<div class="ev-battery-insight info" style="margin-top:8px;font-size:0.78rem;">💸 ${data.savingsTip}</div>` : ''}
        </div>
      `;
    }

    return { analyze };
  })();

  // ─── Init ────────────────────────────────────────────────────────────────────

  function init() {
    injectStyles();
    buildPanel();
    console.log('✅ EV AI Features loaded');
  }

  // Auto-init when DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  return { togglePanel, switchTab, Chat, StationRec, MechanicFinder, BatteryInsights };
})();
