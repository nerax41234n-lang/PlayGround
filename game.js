(() => {
  const SAVE_KEY = 'room-creator-save-v1';
  const ideas = [
    { id: 'room', title: 'My cozy room tour', emoji: '🪴', genre: 'Lifestyle', desc: 'Show your favorite little corner', tags: ['CozyCore', 'RoomReset', 'SoftLife'], score: 8 },
    { id: 'snack', title: 'A tiny 3-ingredient snack', emoji: '🍓', genre: 'Food', desc: 'A snack worth pausing for', tags: ['SnackHack', 'CozyCore', 'FoodTok'], score: 9 },
    { id: 'fit', title: 'One outfit, three ways', emoji: '👗', genre: 'Fashion', desc: 'Quick change, big personality', tags: ['OutfitCheck', 'GlowUp', 'SoftLife'], score: 8 },
    { id: 'reset', title: 'Desk reset with me', emoji: '🧼', genre: 'Lifestyle', desc: 'A satisfying little refresh', tags: ['RoomReset', 'CozyCore', 'StudyTok'], score: 9 },
    { id: 'story', title: 'A story I still think about', emoji: '💬', genre: 'Storytime', desc: 'Tell a story with a twist', tags: ['Storytime', 'GlowUp', 'StudyTok'], score: 7 },
    { id: 'dance', title: 'My take on the new sound', emoji: '🎧', genre: 'Dance', desc: 'Put your own spin on it', tags: ['DanceLoop', 'OutfitCheck', 'GlowUp'], score: 8 }
  ];
  const trends = [
    { name: '#CozyCore', desc: 'Show us your favorite little corner.', idea: 'room', bonus: 1.4 },
    { name: '#SnackHack', desc: 'Tiny recipes, huge main-character energy.', idea: 'snack', bonus: 1.45 },
    { name: '#RoomReset', desc: 'A satisfying before-and-after moment.', idea: 'reset', bonus: 1.42 },
    { name: '#OutfitCheck', desc: 'Make your everyday look the whole moment.', idea: 'fit', bonus: 1.4 },
    { name: '#Storytime', desc: 'Hook us in the first two seconds.', idea: 'story', bonus: 1.4 },
    { name: '#DanceLoop', desc: 'A sound, a move, your own little twist.', idea: 'dance', bonus: 1.4 }
  ];
  const gear = [
    { id: 'light', name: 'Pocket ring light', icon: '💡', price: 85, desc: '+15% video quality', quality: 0.15, level: 1, room: '💡' },
    { id: 'mic', name: 'Clip-on mini mic', icon: '🎙️', price: 125, desc: '+20% video quality', quality: 0.2, level: 1, room: '🎙' },
    { id: 'camera', name: 'Creator camera', icon: '📷', price: 210, desc: '+35% video quality', quality: 0.35, level: 2, room: '📷' },
    { id: 'backdrop', name: 'Dreamy backdrop', icon: '🖼️', price: 150, desc: '+15% quality & cozy vibes', quality: 0.15, level: 2, room: '✿' },
    { id: 'phone', name: 'New-gen phone', icon: '📱', price: 290, desc: '+40% video quality', quality: 0.4, level: 3, room: '📱' }
  ];
  const tips = [
    'A clear idea beats fancy gear. Tell a tiny story.',
    'A strong first second gives people a reason to stay.',
    'Reply to comments like you are talking to a friend.',
    'Good light is free: face a window when you can.',
    'Post what you love. Your people will find you.',
    'A little consistency is more powerful than perfection.'
  ];
  const freshState = () => ({ money: 65, followers: 0, views: 0, videos: [], xp: 0, level: 1, day: 1, energy: 3, maxEnergy: 3, trendIndex: 0, trendLeft: 2, owned: [], lastResult: null, firstBonus: true });
  let state;
  try { state = { ...freshState(), ...(JSON.parse(localStorage.getItem(SAVE_KEY) || '{}')) }; } catch { state = freshState(); }
  state.videos = Array.isArray(state.videos) ? state.videos : [];
  state.owned = Array.isArray(state.owned) ? state.owned : [];
  let currentView = 'studio';
  let selectedIdea = ideas[0].id;
  let selectedQuality = 'standard';
  let resultTimer = null;
  let toastTimer = null;
  let tipIndex = Math.floor(Math.random() * tips.length);
  const $ = (s) => document.querySelector(s);
  const fmt = (n) => Math.floor(n).toLocaleString('en-US');
  const currentTrend = () => trends[state.trendIndex % trends.length];
  const save = () => { try { localStorage.setItem(SAVE_KEY, JSON.stringify(state)); } catch (_) {} };
  const showToast = (text) => { const el = $('#toast'); el.textContent = text; el.classList.add('show'); clearTimeout(toastTimer); toastTimer = setTimeout(() => el.classList.remove('show'), 2400); };
  const ideaById = (id) => ideas.find(x => x.id === id) || ideas[0];
  const gearBoost = () => gear.filter(x => state.owned.includes(x.id)).reduce((sum, item) => sum + item.quality, 0);
  const refreshStats = () => {
    $('#followersTop').textContent = fmt(state.followers);
    $('#moneyTop').textContent = fmt(state.money);
    $('#dayLabel').textContent = `DAY ${String(state.day).padStart(2, '0')}`;
    $('#followerCount').textContent = fmt(state.followers);
    $('#viewsCount').textContent = fmt(state.views);
    $('#videoCount').textContent = fmt(state.videos.length);
    $('#levelPill').textContent = `LVL ${state.level}`;
    const xpInto = state.xp % 100;
    $('#xpLabel').textContent = `${xpInto} / 100 XP`;
    $('#xpPercent').textContent = `${xpInto}%`;
    $('#xpBar').style.width = `${xpInto}%`;
    const goal = Math.ceil((state.followers + 1) / 100) * 100;
    $('#goalText').textContent = state.followers < 100 ? 'Reach 100 followers' : `Reach ${fmt(goal)} followers`;
    $('#trendName').textContent = currentTrend().name;
    $('#trendDescription').textContent = currentTrend().desc;
    $('#trendTimer').textContent = `${state.trendLeft} post${state.trendLeft === 1 ? '' : 's'} left`;
    $('#trendBar').style.width = `${Math.max(0, state.trendLeft / 2 * 100)}%`;
    $('#dailyTitle').textContent = `Day ${state.day} creator vibe`;
    $('#dailyText').textContent = `${state.energy} energy · make your next little hit.`;
    $('#tipText').textContent = tips[tipIndex];
    $('#roomEquipment').innerHTML = gear.filter(x => state.owned.includes(x.id)).map(x => `<span class="equipment-dot" title="${x.name}">${x.room}</span>`).join('');
    save();
  };
  const setView = (view) => {
    currentView = view;
    document.querySelectorAll('.nav-item').forEach(el => el.classList.toggle('active', el.dataset.view === view));
    renderPhone();
    $('.phone-content').scrollTop = 0;
  };
  const studio = () => {
    const latest = state.videos[0];
    return `<div class="welcome-card"><div class="hello">DAY ${String(state.day).padStart(2, '0')} · YOUR STUDIO</div><h3>Hey, creator!</h3><p>Ready to make something people will love?</p></div>
      <div class="feed-pills"><span class="feed-pill selected">For you</span><span class="feed-pill">Following</span><span class="feed-pill">Discover</span></div>
      ${latest ? `<div class="phone-section-title"><b>Your latest post</b><span>JUST NOW</span></div><div class="feed-post"><div class="feed-video">${latest.emoji}</div><h4>${latest.title}</h4><div class="feed-meta"><span>${fmt(latest.views)} views · ${fmt(latest.likes)} likes</span><b>${latest.tag}</b></div></div>` : `<div class="phone-section-title"><b>Start creating</b><span>YOUR FIRST POST</span></div><div class="empty-state" style="padding:16px 8px 8px"><div class="empty-emoji">📱</div><h3>Your feed starts here</h3><p>Pick an idea, make a video, and share it with the world.</p></div>`}
      <button class="primary-button button-wide" data-action="create">＋ Make your first video</button>
      <div class="phone-section-title"><b>Creator prompts</b><span>MADE FOR YOU</span></div>
      ${ideas.slice(0, 2).map(i => `<div class="prompt-card" data-idea="${i.id}"><div class="prompt-art">${i.emoji}</div><div class="prompt-info"><b>${i.title}</b><small>${i.desc}</small>${i.tags.includes(currentTrend().name.slice(1)) ? `<span class="trend-inline">✦ TRENDING</span>` : ''}</div><span class="prompt-arrow">›</span></div>`).join('')}`;
  };
  const createView = () => {
    if (resultTimer) return `<div class="upload-loading"><div class="upload-spinner"></div><h3>Sending your video out...</h3><p>Finding the right people for it ✨</p></div>`;
    if (state.lastResult) {
      const r = state.lastResult;
      return `<div class="create-intro"><div><div class="panel-kicker">POSTED TO YOUR FEED</div><h3>Look at you go!</h3></div><span class="energy-chip">✦ +${r.xp} XP</span></div><div class="studio-preview"><div><div class="preview-emoji">${r.emoji}</div><div class="preview-title">${r.title}</div><div class="preview-sub">${r.tag} · just now</div></div></div><div class="result-card" style="margin-top:10px"><div class="result-stars">${r.trending ? '🔥' : '✨'}</div><h3>${r.headline}</h3><p>${r.message}</p><div class="result-metrics"><div><strong>${fmt(r.views)}</strong><small>views</small></div><div><strong>${fmt(r.followers)}</strong><small>new fans</small></div><div><strong>＋${r.money}</strong><small>coins</small></div></div><div class="result-reward">${r.trending ? '✦ Perfect trend match! Bonus reach unlocked.' : '✦ Every post gets you closer to your next big moment.'}</div></div><button class="primary-button button-wide" data-action="newVideo">Make another video</button><button class="secondary-button button-wide" data-view="feed">See my feed</button>`;
    }
    if (state.energy <= 0) return `<div class="create-intro"><div><div class="panel-kicker">A CREATOR NEEDS A BREATHER</div><h3>Recharge time</h3><p>Your best ideas need a little rest.</p></div><span class="energy-chip">☾ 0 energy</span></div><div class="empty-state"><div class="empty-emoji">🛏️</div><h3>Rest up for tomorrow</h3><p>Sleep restores your energy and brings a fresh trend to the feed.</p></div><button class="primary-button button-wide" data-action="rest">Sleep · Start next day</button>`;
    const pick = ideaById(selectedIdea);
    return `<div class="create-intro"><div><div class="panel-kicker">YOUR NEXT LITTLE HIT</div><h3>Make a video</h3><p>Choose your idea & make it yours.</p></div><span class="energy-chip">☀ ${state.energy} energy</span></div>
      <div class="studio-preview"><div><div class="preview-emoji">${pick.emoji}</div><div class="preview-title">${pick.title}</div><div class="preview-sub">Your room · your point of view</div></div></div>
      <label class="form-label">1. PICK A VIDEO IDEA</label><div class="choice-grid">${ideas.map(i => `<button class="choice-btn ${i.id === selectedIdea ? 'selected' : ''}" data-idea="${i.id}"><span>${i.emoji}</span><b>${i.genre}</b></button>`).join('')}</div>
      <label class="form-label">2. SET YOUR PRODUCTION</label><div class="quality-row"><button class="quality-btn ${selectedQuality === 'quick' ? 'selected' : ''}" data-quality="quick">⚡ QUICK · 1 energy</button><button class="quality-btn ${selectedQuality === 'standard' ? 'selected' : ''}" data-quality="standard">✦ POLISHED · 1 energy</button><button class="quality-btn ${selectedQuality === 'premium' ? 'selected' : ''}" data-quality="premium" ${state.energy < 2 ? 'disabled' : ''}>💎 PREMIUM · 2 energy</button></div>
      <div class="energy-meter"><span>ENERGY</span><span class="energy-dots">${Array.from({ length: state.maxEnergy }, (_, i) => `<i class="${i < state.energy ? 'on' : ''}"></i>`).join('')}</span><span>${state.energy}/${state.maxEnergy}</span></div>
      <button class="primary-button button-wide" data-action="upload">Upload video · costs 1 energy</button>`;
  };
  const feedView = () => state.videos.length ? `<div class="create-intro"><div><div class="panel-kicker">YOUR CREATOR JOURNEY</div><h3>Your feed</h3><p>Every post is a little milestone.</p></div><span class="energy-chip">${state.videos.length} posts</span></div>${state.videos.slice(0, 7).map(v => `<div class="feed-post"><div class="feed-video">${v.emoji}</div><h4>${v.title}</h4><div class="feed-meta"><span>${fmt(v.views)} views · ${fmt(v.likes)} likes</span><b>${v.tag}</b></div></div>`).join('')}` : `<div class="empty-state"><div class="empty-emoji">♡</div><h3>A blank canvas</h3><p>Your videos will live here. Post something to start your creator story!</p><button class="primary-button" data-action="create">Create a video</button></div>`;
  const shopView = () => `<div class="shop-header"><div class="panel-kicker">INVEST IN YOUR CRAFT</div><h3>Creator shop</h3><p>Good gear helps your ideas shine.</p><div class="shop-balance">＄ ${fmt(state.money)} coins to spend</div></div>${gear.map(x => { const owned = state.owned.includes(x.id); const locked = state.level < x.level; return `<div class="shop-item"><div class="shop-icon">${x.icon}</div><div class="shop-info"><b>${x.name}</b><small>${x.desc}${locked ? ` · unlocks at LVL ${x.level}` : ''}</small></div><button class="shop-price ${owned ? 'owned' : ''}" data-buy="${x.id}" ${owned || locked || state.money < x.price ? 'disabled' : ''}>${owned ? 'OWNED' : locked ? `LVL ${x.level}` : `＄${x.price}`}</button></div>`; }).join('')}<div class="achievement"><span>🏠</span><div><b>Your room, your rules</b><small>Upgrades improve every future video.</small></div></div>`;
  const profileView = () => `<div class="profile-card"><div class="profile-avatar">☺</div><h3>yournamehere</h3><p>Making little moments feel like magic ✨</p><div class="profile-numbers"><div><b>${fmt(state.followers)}</b><small>followers</small></div><div><b>${fmt(state.views)}</b><small>likes & views</small></div><div><b>${state.videos.length}</b><small>posts</small></div></div></div><div class="phone-section-title"><b>Creator level</b><span>LVL ${state.level}</span></div><div class="xp-track"><i style="width:${state.xp % 100}%"></i></div><div class="phone-section-title"><b>About your journey</b></div><div class="prompt-card"><div class="prompt-art">✦</div><div class="prompt-info"><b>Started on Day ${String(state.day).padStart(2, '0')}</b><small>${state.videos.length ? `${state.videos.length} little stories shared so far.` : 'Your first post is waiting to happen.'}</small></div></div><button class="secondary-button button-wide" data-action="rest">☾ End day & recharge energy</button>`;
  function renderPhone() {
    const views = { studio, create: createView, feed: feedView, shop: shopView, profile: profileView };
    $('#phoneContent').innerHTML = (views[currentView] || studio)();
  }
  function openModal(content) { $('#modalRoot').innerHTML = `<div class="modal-backdrop"><div class="modal">${content}</div></div>`; }
  function closeModal() { $('#modalRoot').innerHTML = ''; }
  function addXP(amount) {
    const old = state.level;
    state.xp += amount;
    state.level = Math.floor(state.xp / 100) + 1;
    if (state.level > old) {
      const reward = 40 * (state.level - old);
      state.money += reward;
      showToast(`Level up! You're level ${state.level} · +＄${reward}`);
    }
  }
  function upload() {
    const idea = ideaById(selectedIdea);
    const premium = selectedQuality === 'premium';
    if (!state.energy || (premium && state.energy < 2)) { showToast('Not enough energy — rest up first!'); return; }
    const energyCost = premium ? 2 : 1;
    const match = idea.tags.includes(currentTrend().name.slice(1));
    const quality = selectedQuality === 'quick' ? 0.82 : selectedQuality === 'premium' ? 1.38 : 1.05;
    const gearMultiplier = 1 + gearBoost();
    const trendMultiplier = match ? currentTrend().bonus : 1;
    const variation = 0.82 + Math.random() * 0.42;
    const baseViews = (90 + idea.score * 29 + state.level * 15) * quality * gearMultiplier * trendMultiplier * variation;
    const views = Math.max(25, Math.round(baseViews));
    const newFans = Math.max(2, Math.round(views * (0.055 + (match ? 0.025 : 0) + (premium ? 0.012 : 0))));
    const likes = Math.round(views * (0.18 + (match ? .06 : 0)));
    const coins = Math.max(12, Math.round(12 + views * .11 + (match ? 12 : 0) + (premium ? 8 : 0)));
    const xp = 24 + (match ? 16 : 0) + (premium ? 12 : selectedQuality === 'standard' ? 5 : 0);
    state.energy -= energyCost;
    state.money += coins;
    state.followers += newFans;
    state.views += views;
    state.trendLeft--;
    state.firstBonus = false;
    const item = { id: Date.now(), title: idea.title, emoji: idea.emoji, tag: currentTrend().name, views, likes, followers: newFans, money: coins, xp, trending: match, headline: match ? 'You caught the trend!' : 'Your story is out there!', message: match ? 'The For You page noticed your timing.' : 'Your little corner of the internet is growing.' };
    state.videos.unshift(item);
    addXP(xp);
    if (state.trendLeft <= 0) { state.trendIndex = (state.trendIndex + 1) % trends.length; state.trendLeft = 2; }
    state.lastResult = item;
    resultTimer = true;
    setView('create');
    refreshStats();
    clearTimeout(window.__uploadTimer);
    window.__uploadTimer = setTimeout(() => { resultTimer = false; refreshStats(); renderPhone(); }, 1150);
  }
  function rest() {
    if (state.energy >= state.maxEnergy) { showToast('You are fully rested — go make something!'); return; }
    state.day++;
    state.energy = state.maxEnergy;
    state.lastResult = null;
    showToast(`Good morning! Day ${state.day} · energy restored ☀`);
    refreshStats();
    setView('studio');
  }
  function buy(id) {
    const item = gear.find(x => x.id === id);
    if (!item || state.owned.includes(id)) return;
    if (state.level < item.level) { showToast(`Reach level ${item.level} to unlock this gear.`); return; }
    if (state.money < item.price) { showToast('Not quite enough coins yet — make another video!'); return; }
    state.money -= item.price;
    state.owned.push(id);
    refreshStats();
    renderPhone();
    showToast(`${item.name} added to your room ✨`);
  }
  document.addEventListener('click', (event) => {
    const nav = event.target.closest('[data-view]');
    if (nav) { event.preventDefault(); setView(nav.dataset.view); return; }
    const ideaBtn = event.target.closest('[data-idea]');
    if (ideaBtn) { selectedIdea = ideaBtn.dataset.idea; if (currentView === 'studio') setView('create'); else renderPhone(); return; }
    const qualityBtn = event.target.closest('[data-quality]');
    if (qualityBtn) { if (!qualityBtn.disabled) { selectedQuality = qualityBtn.dataset.quality; renderPhone(); } return; }
    const buyBtn = event.target.closest('[data-buy]');
    if (buyBtn) { buy(buyBtn.dataset.buy); return; }
    const action = event.target.closest('[data-action]')?.dataset.action;
    if (action === 'create') { state.lastResult = null; setView('create'); }
    if (action === 'newVideo') { state.lastResult = null; setView(state.energy > 0 ? 'create' : 'create'); }
    if (action === 'upload') upload();
    if (action === 'rest') rest();
    const close = event.target.closest('.modal-close');
    if (close || event.target.classList.contains('modal-backdrop')) closeModal();
  });
  $('#tipNext').addEventListener('click', () => { tipIndex = (tipIndex + 1) % tips.length; $('#tipText').textContent = tips[tipIndex]; });
  $('#resetButton').addEventListener('click', () => openModal(`<button class="modal-close" aria-label="Close">×</button><div class="modal-icon">🧹</div><h2>Start fresh?</h2><p>This will reset your videos, coins, followers, and upgrades on this device.</p><div class="modal-actions"><button class="secondary-button modal-close">Keep playing</button><button class="primary-button" id="confirmReset">Reset everything</button></div>`));
  $('#modalRoot').addEventListener('click', (e) => { if (e.target.closest('#confirmReset')) { localStorage.removeItem(SAVE_KEY); state = freshState(); selectedIdea = ideas[0].id; selectedQuality = 'standard'; closeModal(); refreshStats(); setView('studio'); showToast('Fresh start! Your room is ready ✨'); } });
  $('#soundButton').addEventListener('click', (e) => { const btn = e.currentTarget; btn.classList.toggle('muted'); showToast(btn.classList.contains('muted') ? 'Sound effects are off.' : 'A little more music, please ♫'); });
  refreshStats();
  renderPhone();
})();
