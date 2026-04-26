(function() {
  // Extract agent ID from the script tag
  const scriptTag = document.currentScript;
  const agentId = scriptTag.getAttribute('data-agent-id');
  
  if (!agentId) {
    console.error("Multi AI Agent: 'data-agent-id' is missing from the script tag.");
    return;
  }

  // Configuration
  const API_URL = "http://127.0.0.1:8000/api/chat";

  // Create Container Shell
  const container = document.createElement('div');
  container.id = "multi-ai-widget-container";
  container.style.position = "fixed";
  container.style.bottom = "20px";
  container.style.right = "20px";
  container.style.zIndex = "999999";
  container.style.fontFamily = "'Inter', system-ui, sans-serif";

  // State
  let isOpen = false;
  let messages = [
    { role: 'agent', content: 'Hi! How can I help you today?' }
  ];

  // UI Construction using Shadow DOM to isolate styles
  const shadow = container.attachShadow({ mode: 'open' });

  const style = document.createElement('style');
  style.textContent = `
    * { box-sizing: border-box; }
    .widget-btn {
      width: 60px; height: 60px;
      border-radius: 50%;
      background: linear-gradient(135deg, #6366f1, #ec4899);
      box-shadow: 0 4px 14px rgba(99, 102, 241, 0.4);
      cursor: pointer; border: none;
      display: flex; align-items: center; justify-content: center;
      transition: transform 0.2s;
    }
    .widget-btn:hover { transform: scale(1.05); }
    .widget-btn svg { fill: white; width: 30px; height: 30px; }
    
    .chat-window {
      display: none;
      position: absolute; bottom: 80px; right: 0;
      width: 350px; height: 500px;
      background: #ffffff;
      border-radius: 16px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.15);
      flex-direction: column; overflow: hidden;
      border: 1px solid #e2e8f0;
    }
    .chat-header {
      background: linear-gradient(135deg, #6366f1, #ec4899);
      color: white; padding: 16px; font-weight: 600;
      display: flex; justify-content: space-between; align-items: center;
    }
    .close-btn { background: none; border: none; color: white; cursor: pointer; font-size: 20px; }
    
    .chat-body {
      flex: 1; padding: 16px; overflow-y: auto;
      display: flex; flex-direction: column; gap: 12px;
      background: #f8fafc;
    }
    
    .message { max-width: 80%; padding: 12px 14px; border-radius: 12px; font-size: 14px; line-height: 1.4; }
    .message.user { align-self: flex-end; background: #6366f1; color: white; border-bottom-right-radius: 4px; }
    .message.agent { align-self: flex-start; background: #e2e8f0; color: #1e293b; border-bottom-left-radius: 4px; }
    
    .chat-footer {
      padding: 12px; border-top: 1px solid #e2e8f0;
      display: flex; background: white; gap: 8px;
    }
    .chat-input {
      flex: 1; padding: 10px 14px;
      border: 1px solid #cbd5e1; border-radius: 20px;
      outline: none; font-family: inherit;
    }
    .chat-input:focus { border-color: #6366f1; }
    
    .send-btn {
      background: #6366f1; color: white;
      border: none; border-radius: 50%;
      width: 40px; height: 40px; cursor: pointer;
      display: flex; align-items: center; justify-content: center;
    }
  `;

  const btn = document.createElement('button');
  btn.className = "widget-btn";
  btn.innerHTML = `<svg viewBox="0 0 24 24"><path d="M20 2H4C2.9 2 2 2.9 2 4v18l4-4h14c1.1 0 2-.9 2-2V4C22 2.9 21.1 2 20 2z"></path></svg>`;

  const chatWindow = document.createElement('div');
  chatWindow.className = "chat-window";
  
  chatWindow.innerHTML = `
    <div class="chat-header">
      <span>Virtual Assistant</span>
      <button class="close-btn">&times;</button>
    </div>
    <div class="chat-body" id="chatBody"></div>
    <div class="chat-footer">
      <input type="text" class="chat-input" id="chatInput" placeholder="Type a message..." />
      <button class="send-btn" id="sendBtn">
        <svg fill="white" width="16" height="16" viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"></path></svg>
      </button>
    </div>
  `;

  shadow.appendChild(style);
  shadow.appendChild(chatWindow);
  shadow.appendChild(btn);
  document.body.appendChild(container);

  // Behavior
  const toggleChat = () => {
    isOpen = !isOpen;
    chatWindow.style.display = isOpen ? 'flex' : 'none';
  };

  btn.addEventListener('click', toggleChat);
  shadow.querySelector('.close-btn').addEventListener('click', toggleChat);

  const chatBody = shadow.getElementById('chatBody');
  const chatInput = shadow.getElementById('chatInput');
  const sendBtn = shadow.getElementById('sendBtn');

  const renderMessages = () => {
    chatBody.innerHTML = '';
    messages.forEach(m => {
      const div = document.createElement('div');
      div.className = `message ${m.role}`;
      div.innerText = m.content;
      chatBody.appendChild(div);
    });
    chatBody.scrollTop = chatBody.scrollHeight;
  };

  const handleSend = async () => {
    const text = chatInput.value.trim();
    if(!text) return;
    
    messages.push({ role: 'user', content: text });
    chatInput.value = '';
    renderMessages();

    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agent_id: agentId, message: text })
      });
      const data = await res.json();
      messages.push({ role: 'agent', content: data.reply || 'Sorry, I encountered an error.' });
      renderMessages();
    } catch(e) {
      messages.push({ role: 'agent', content: 'Connection error while reaching the AI server.' });
      renderMessages();
    }
  };

  sendBtn.addEventListener('click', handleSend);
  chatInput.addEventListener('keypress', (e) => {
    if(e.key === 'Enter') handleSend();
  });

  renderMessages();
})();
