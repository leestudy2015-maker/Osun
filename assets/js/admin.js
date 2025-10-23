(function(window, document){
  'use strict';

  const ADMIN_PASSWORD = 'oSun3968！';
  const SESSION_KEY = 'osun-admin-session';
  const ORDERS_KEY = 'osun-orders';
  const ORDER_CHANNEL = 'osun-orders-channel';
  const ORDER_TIMESTAMP_KEY = `${ORDERS_KEY}:updated`;
  const LANGUAGES = [
    { code: 'en', label: 'English' },
    { code: 'zh', label: '中文' }
  ];

  const CONTENT_KEY = (window.OSUN_CONTENT && window.OSUN_CONTENT.STORAGE_KEY) || 'osun-content-config';

  const state = {
    draft: null,
    initialized: false
  };

  let ordersState = [];
  let ordersChannel = null;
  let ordersBound = false;
  let ordersListenersBound = false;

  function ready(handler){
    if (document.readyState === 'loading'){
      document.addEventListener('DOMContentLoaded', handler);
    } else {
      handler();
    }
  }

  function readStoredContent(){
    try {
      const raw = localStorage.getItem(CONTENT_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (err){
      console.warn('Failed to parse stored content', err);
      return null;
    }
  }

  function loadContent(){
    const defaults = window.OSUN_CONTENT && typeof window.OSUN_CONTENT.clone === 'function'
      ? window.OSUN_CONTENT.clone()
      : {};
    const stored = readStoredContent();
    if (stored && window.OSUN_CONTENT && typeof window.OSUN_CONTENT.merge === 'function'){
      return window.OSUN_CONTENT.merge(stored);
    }
    return stored ? stored : defaults;
  }

  function getValue(path){
    if (!state.draft) return undefined;
    return path.reduce((acc, key) => {
      if (acc == null) return undefined;
      return acc[key];
    }, state.draft);
  }

  function setValue(path, value){
    if (!state.draft) return;
    let cursor = state.draft;
    for (let i = 0; i < path.length - 1; i++){
      const key = path[i];
      if (!cursor[key] || typeof cursor[key] !== 'object'){
        cursor[key] = {};
      }
      cursor = cursor[key];
    }
    cursor[path[path.length - 1]] = value;
  }

  function ensureArray(path){
    if (!state.draft) return [];
    let cursor = state.draft;
    for (let i = 0; i < path.length; i++){
      const key = path[i];
      const isLast = i === path.length - 1;
      if (isLast){
        if (!Array.isArray(cursor[key])){
          cursor[key] = [];
        }
        return cursor[key];
      }
      if (!cursor[key] || typeof cursor[key] !== 'object'){
        cursor[key] = {};
      }
      cursor = cursor[key];
    }
    return [];
  }

  let saveTimer = null;

  function scheduleSave(){
    if (!state.initialized) return;
    if (saveTimer){
      window.clearTimeout(saveTimer);
    }
    saveTimer = window.setTimeout(() => persistChanges(true), 400);
  }

  function persistChanges(silent){
    if (!state.draft) return;
    try {
      localStorage.setItem(CONTENT_KEY, JSON.stringify(state.draft));
      if (!silent){
        showToast('Changes saved');
      }
    } catch (err){
      console.error('Failed to persist content', err);
      showToast('Failed to save changes', 'error');
    }
  }

  function resetContent(){
    if (!window.confirm('Reset all admin content to defaults?')){
      return;
    }
    localStorage.removeItem(CONTENT_KEY);
    state.draft = loadContent();
    renderAllSections();
    persistChanges(false);
  }

  function exportContent(){
    if (!state.draft) return;
    const json = JSON.stringify(state.draft, null, 2);
    if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function'){
      navigator.clipboard.writeText(json)
        .then(() => showToast('JSON copied to clipboard'))
        .catch(() => triggerDownload(json));
    } else {
      triggerDownload(json);
    }
  }

  function triggerDownload(json){
    try {
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'osun-content.json';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      showToast('Downloaded osun-content.json');
    } catch (err){
      console.error('Export failed', err);
      showToast('Export failed', 'error');
    }
  }

  function showToast(message, tone){
    let toast = document.getElementById('admin-toast');
    if (!toast){
      toast = document.createElement('div');
      toast.id = 'admin-toast';
      toast.className = 'fixed bottom-5 right-5 z-[60] transform transition-all duration-300 text-sm font-medium';
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.remove('opacity-0');
    toast.className = 'fixed bottom-5 right-5 z-[60] rounded-full px-4 py-2 shadow-lg text-sm font-semibold transition-all duration-300 ' +
      (tone === 'error' ? 'bg-red-600 text-white' : 'bg-brand-red text-white');
    window.setTimeout(() => {
      toast.classList.add('opacity-0');
    }, 2200);
  }

  function translateKey(key, vars){
    if (window.OSUN && typeof window.OSUN.translate === 'function'){
      return window.OSUN.translate(key, vars);
    }
    if (!vars) return key;
    return Object.keys(vars).reduce((acc, current) => acc.replace(new RegExp(`{{\s*${current}\s*}}`, 'g'), vars[current]), key);
  }

  function getCurrentLang(){
    if (window.OSUN && typeof window.OSUN.getCurrentLang === 'function'){
      return window.OSUN.getCurrentLang();
    }
    const langAttr = document.documentElement.lang || 'en';
    return langAttr.startsWith('zh') ? 'zh' : 'en';
  }

  function formatOrderDate(timestamp){
    if (!timestamp) return '';
    const lang = getCurrentLang();
    const locale = lang === 'zh' ? 'zh-Hant' : 'en-MY';
    try {
      return new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(timestamp));
    } catch (err){
      return new Date(timestamp).toLocaleString();
    }
  }

  function formatMYR(amount){
    const value = Number(amount || 0);
    return `MYR ${value.toFixed(2)}`;
  }

  function escapeHtml(value){
    if (value == null) return '';
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function buildField(config){
    const wrapper = document.createElement('div');
    wrapper.className = config.wrapperClass || 'space-y-2';
    if (config.label){
      const label = document.createElement('span');
      label.className = 'block text-sm font-semibold text-gray-700';
      label.textContent = config.label;
      wrapper.appendChild(label);
    }
    let field;
    if (config.type === 'textarea' || config.multiline){
      field = document.createElement('textarea');
      field.rows = config.rows || 3;
    } else {
      field = document.createElement('input');
      field.type = config.inputType || 'text';
    }
    field.className = config.fieldClass || 'w-full rounded-lg border border-gray-200 px-3 py-2 focus:border-brand-red focus:outline-none focus:ring-1 focus:ring-brand-red/30 bg-white';
    field.value = config.value || '';
    if (config.placeholder){
      field.placeholder = config.placeholder;
    }
    field.addEventListener('input', event => {
      config.onInput(event.target.value);
      if (config.autoSave !== false){
        scheduleSave();
      }
    });
    wrapper.appendChild(field);
    return wrapper;
  }

  function createActionButton(text, handler, style){
    const button = document.createElement('button');
    button.type = 'button';
    button.className = style || 'shine-btn rounded-full bg-brand-red px-5 py-2 text-sm font-semibold text-white shadow hover:bg-rose-600 transition';
    button.textContent = text;
    button.addEventListener('click', handler);
    return button;
  }

  function createSecondaryButton(text, handler){
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'rounded-full border border-brand-red/60 bg-white px-4 py-2 text-xs font-semibold text-brand-red shadow-sm transition hover:bg-rose-50 hover:shadow';
    btn.textContent = text;
    btn.addEventListener('click', handler);
    return btn;
  }

  function loadOrdersFromStorage(){
    try {
      const raw = localStorage.getItem(ORDERS_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (err){
      console.warn('Failed to load orders', err);
      return [];
    }
  }

  function normalizeOrder(order){
    if (!order) return null;
    const tracking = order.trackingNumber || order.id || '';
    const items = Array.isArray(order.items) ? order.items.map(item => {
      const quantity = Number(item.quantity ?? item.qty ?? 0) || 0;
      const unitPrice = Number(item.unitPrice ?? 0);
      const total = typeof item.total === 'number' ? item.total : quantity * unitPrice;
      return {
        id: item.id || tracking,
        name: item.name || '',
        quantity,
        unitPrice,
        total
      };
    }) : [];
    return {
      ...order,
      id: tracking,
      trackingNumber: tracking,
      status: order.status || 'new',
      createdAt: order.createdAt || Date.now(),
      items,
      totals: {
        subtotal: Number(order.totals?.subtotal || 0),
        shipping: Number(order.totals?.shipping || 0),
        total: Number(order.totals?.total || 0)
      }
    };
  }

  function normalizeOrders(list){
    return (Array.isArray(list) ? list : [])
      .map(normalizeOrder)
      .filter(Boolean)
      .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  }

  function setOrdersState(list, options){
    const opts = Object.assign({ persist: true, silent: false }, options);
    ordersState = normalizeOrders(list);
    if (opts.persist){
      try {
        localStorage.setItem(ORDERS_KEY, JSON.stringify(ordersState));
        localStorage.setItem(ORDER_TIMESTAMP_KEY, String(Date.now()));
      } catch (err){
        console.warn('Failed to persist orders', err);
      }
    }
    if (!opts.silent){
      renderOrders();
    }
    updateOrdersBadge();
  }

  function refreshOrdersFromStorage(){
    setOrdersState(loadOrdersFromStorage(), { persist: false });
  }

  function mergeOrder(order, options){
    const normalized = normalizeOrder(order);
    if (!normalized) return;
    const opts = Object.assign({ persist: false, silent: false }, options);
    const existingIndex = ordersState.findIndex(item => item.trackingNumber === normalized.trackingNumber);
    const next = existingIndex >= 0
      ? ordersState.map(item => item.trackingNumber === normalized.trackingNumber ? { ...normalized, status: item.status || normalized.status } : item)
      : [normalized, ...ordersState];
    setOrdersState(next, opts);
    return existingIndex === -1;
  }

  function getStatusBadgeClass(status){
    if (status === 'fulfilled') return 'bg-emerald-50 text-emerald-600 border border-emerald-200';
    if (status === 'processing') return 'bg-amber-50 text-amber-600 border border-amber-200';
    return 'bg-rose-50 text-brand-red border border-rose-200';
  }

  function buildOrderCard(order){
    const status = order.status || 'new';
    const statusLabel = translateKey(`admin.orders.status.${status}`);
    const method = order.payment?.method || 'visa';
    const methodLabel = translateKey(`checkout.summary.method.${method}`);
    const providerLabel = order.payment?.providerLabel || order.payment?.providerName || '';
    const paymentLink = order.payment?.gatewayUrl || '';
    const shippingLabel = order.shipping?.deliveryLabel || translateKey(`checkout.shipping.speed.${order.delivery || order.shipping?.delivery || 'standard'}`);
    const shippingLines = [
      order.shipping?.address || '',
      [order.shipping?.postcode, order.shipping?.city].filter(Boolean).join(' ').trim(),
      order.shipping?.state || ''
    ].filter(Boolean).map(line => `<p>${escapeHtml(line)}</p>`).join('');
    const itemsList = order.items.length
      ? order.items.map(item => `<li class="flex items-center justify-between gap-4"><span>${escapeHtml(item.name)}</span><span class="font-semibold text-gray-900">${item.quantity} × ${formatMYR(item.unitPrice)}</span></li>`).join('')
      : `<li class="text-sm text-gray-500">${escapeHtml(translateKey('checkout.summary.empty'))}</li>`;
    const totals = order.totals || { subtotal: 0, shipping: 0, total: 0 };
    const card = document.createElement('article');
    card.className = 'rounded-3xl border border-rose-100 bg-white p-6 shadow-sm space-y-4';
    card.setAttribute('data-order-id', order.trackingNumber);
    card.innerHTML = `
      <div class="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
        <div>
          <h3 class="text-lg font-semibold text-gray-900">${escapeHtml(order.trackingNumber)}</h3>
          <p class="text-xs text-gray-500">${escapeHtml(formatOrderDate(order.createdAt))}</p>
        </div>
        <span class="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${getStatusBadgeClass(status)}">${escapeHtml(statusLabel)}</span>
      </div>
      <div class="grid gap-4 text-sm text-gray-700 md:grid-cols-2">
        <div>
          <p class="font-semibold text-gray-900">${escapeHtml(translateKey('admin.orders.customer'))}</p>
          <p>${escapeHtml(order.account?.fullName || '')}</p>
          <p>${escapeHtml(order.account?.email || '')}</p>
          <p>${escapeHtml(order.account?.phone || '')}</p>
          ${order.account?.notes ? `<p class="mt-1 text-xs text-gray-500">${escapeHtml(order.account.notes)}</p>` : ''}
        </div>
        <div>
          <p class="font-semibold text-gray-900">${escapeHtml(translateKey('admin.orders.shipping'))}</p>
          ${shippingLines || `<p>${escapeHtml(translateKey('checkout.summary.empty'))}</p>`}
          ${shippingLabel ? `<p class="mt-1 text-xs text-gray-500">${escapeHtml(shippingLabel)}</p>` : ''}
        </div>
        <div>
          <p class="font-semibold text-gray-900">${escapeHtml(translateKey('admin.orders.payment'))}</p>
          <p>${escapeHtml(methodLabel)}</p>
          ${providerLabel ? `<p class="text-xs text-gray-500">${escapeHtml(providerLabel)}</p>` : ''}
        </div>
        <div>
          <p class="font-semibold text-gray-900">${escapeHtml(translateKey('admin.orders.items'))}</p>
          <ul class="mt-2 space-y-1">${itemsList}</ul>
        </div>
        <div class="md:col-span-2">
          <p class="font-semibold text-gray-900">${escapeHtml(translateKey('admin.orders.total'))}</p>
          <div class="mt-2 space-y-1 text-sm">
            <div class="flex justify-between"><span>${escapeHtml(translateKey('checkout.summary.subtotal'))}</span><span>${formatMYR(totals.subtotal)}</span></div>
            <div class="flex justify-between"><span>${escapeHtml(translateKey('checkout.summary.shippingFee'))}</span><span>${formatMYR(totals.shipping)}</span></div>
            <div class="flex justify-between font-semibold text-gray-900"><span>${escapeHtml(translateKey('checkout.summary.total'))}</span><span>${formatMYR(totals.total)}</span></div>
          </div>
        </div>
      </div>
      <div class="flex flex-wrap gap-2 pt-2">
        <button type="button" class="shine-btn rounded-full border border-brand-red/40 bg-white px-4 py-2 text-xs font-semibold text-brand-red shadow-sm transition hover:bg-rose-50" data-order-action="copy" data-order-id="${escapeHtml(order.trackingNumber)}">${escapeHtml(translateKey('admin.orders.actions.copy'))}</button>
        ${status === 'new' ? `<button type="button" class="shine-btn rounded-full bg-amber-500/10 px-4 py-2 text-xs font-semibold text-amber-700 hover:bg-amber-100" data-order-action="processing" data-order-id="${escapeHtml(order.trackingNumber)}">${escapeHtml(translateKey('admin.orders.actions.processing'))}</button>` : ''}
        ${status !== 'fulfilled' ? `<button type="button" class="shine-btn rounded-full bg-brand-red px-4 py-2 text-xs font-semibold text-white shadow hover:bg-rose-600 transition" data-order-action="fulfill" data-order-id="${escapeHtml(order.trackingNumber)}">${escapeHtml(translateKey('admin.orders.actions.fulfill'))}</button>` : ''}
        ${paymentLink ? `<a href="${escapeHtml(paymentLink)}" target="_blank" rel="noopener" class="shine-btn rounded-full border border-brand-red/40 bg-white px-4 py-2 text-xs font-semibold text-brand-red shadow-sm transition hover:bg-rose-50">${escapeHtml(translateKey('admin.orders.actions.viewPayment'))}</a>` : ''}
      </div>
    `;
    return card;
  }

  function renderOrders(){
    const list = document.getElementById('orders-list');
    const empty = document.getElementById('orders-empty');
    if (!list || !empty) return;
    list.innerHTML = '';
    if (!ordersState.length){
      empty.classList.remove('hidden');
      return;
    }
    empty.classList.add('hidden');
    const fragment = document.createDocumentFragment();
    ordersState.forEach(order => {
      fragment.appendChild(buildOrderCard(order));
    });
    list.appendChild(fragment);
  }

  function updateOrdersBadge(){
    const badge = document.getElementById('adminOrdersBadge');
    if (!badge) return;
    const count = ordersState.filter(order => order.status === 'new').length;
    if (count > 0){
      badge.textContent = count > 9 ? '9+' : String(count);
      badge.classList.remove('hidden');
    } else {
      badge.classList.add('hidden');
      badge.textContent = '';
    }
  }

  function fallbackCopy(text, onSuccess){
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'absolute';
    textarea.style.left = '-9999px';
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand('copy');
      if (typeof onSuccess === 'function') onSuccess();
    } catch (err){
      console.warn('Copy fallback failed', err);
    }
    document.body.removeChild(textarea);
  }

  function handleCopyContact(trackingNumber){
    const order = ordersState.find(item => item.trackingNumber === trackingNumber);
    if (!order) return;
    const lines = [
      order.account?.fullName,
      order.account?.email,
      order.account?.phone,
      order.shipping?.address,
      [order.shipping?.postcode, order.shipping?.city].filter(Boolean).join(' ').trim(),
      order.shipping?.state
    ].filter(Boolean);
    const payload = lines.join('\n');
    const onSuccess = () => showToast(translateKey('admin.orders.toast.copied'));
    if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function'){
      navigator.clipboard.writeText(payload).then(onSuccess).catch(() => fallbackCopy(payload, onSuccess));
    } else {
      fallbackCopy(payload, onSuccess);
    }
  }

  function updateOrderStatus(trackingNumber, status){
    const current = ordersState.find(order => order.trackingNumber === trackingNumber);
    if (!current || current.status === status) return;
    const next = ordersState.map(order => order.trackingNumber === trackingNumber ? { ...order, status, updatedAt: Date.now() } : order);
    setOrdersState(next);
    const toastKey = status === 'fulfilled' ? 'admin.orders.toast.fulfilled' : 'admin.orders.toast.processing';
    showToast(translateKey(toastKey));
  }

  function markAllOrdersFulfilled(){
    if (!ordersState.length) return;
    const hasPending = ordersState.some(order => order.status !== 'fulfilled');
    if (!hasPending) return;
    const next = ordersState.map(order => ({ ...order, status: 'fulfilled', updatedAt: Date.now() }));
    setOrdersState(next);
    showToast(translateKey('admin.orders.toast.markAll'));
  }

  function bindOrdersActions(){
    if (ordersBound) return;
    const list = document.getElementById('orders-list');
    if (list){
      list.addEventListener('click', event => {
        const target = event.target.closest('[data-order-action]');
        if (!target) return;
        const id = target.getAttribute('data-order-id');
        const action = target.getAttribute('data-order-action');
        if (!id) return;
        if (action === 'copy'){
          handleCopyContact(id);
        } else if (action === 'processing'){
          updateOrderStatus(id, 'processing');
        } else if (action === 'fulfill'){
          updateOrderStatus(id, 'fulfilled');
        }
      });
    }
    const markAllBtn = document.getElementById('ordersMarkAll');
    if (markAllBtn){
      markAllBtn.addEventListener('click', markAllOrdersFulfilled);
    }
    ordersBound = true;
  }

  function setupOrdersListeners(){
    bindOrdersActions();
    if (!ordersListenersBound){
      window.addEventListener('storage', event => {
        if (event.key === ORDERS_KEY || event.key === ORDER_TIMESTAMP_KEY){
          refreshOrdersFromStorage();
        }
      });
      window.addEventListener('osun:new-order', event => {
        if (!event || !event.detail) return;
        const isNew = mergeOrder(event.detail);
        if (isNew) showToast(translateKey('admin.orders.toast.new'));
      });
      ordersListenersBound = true;
    }
    if (typeof BroadcastChannel !== 'undefined' && !ordersChannel){
      try {
        ordersChannel = new BroadcastChannel(ORDER_CHANNEL);
        ordersChannel.addEventListener('message', event => {
          if (event && event.data && event.data.type === 'new-order'){
            const isNew = mergeOrder(event.data.order);
            if (isNew) showToast(translateKey('admin.orders.toast.new'));
          }
        });
      } catch (err){
        console.warn('Broadcast channel unavailable', err);
      }
    }
  }

  function initOrdersModule(){
    refreshOrdersFromStorage();
    renderOrders();
    updateOrdersBadge();
    setupOrdersListeners();
  }

  function renderHeroForm(){
    const wrap = document.getElementById('hero-form-wrap');
    if (!wrap) return;
    wrap.innerHTML = '';

    const globalCard = document.createElement('div');
    globalCard.className = 'rounded-2xl border border-rose-100 bg-white p-5 shadow-sm space-y-4';
    globalCard.appendChild(buildField({
      label: 'Primary link',
      value: getValue(['hero', 'primaryLink']) || '#shop',
      onInput: value => setValue(['hero', 'primaryLink'], value)
    }));
    globalCard.appendChild(buildField({
      label: 'Secondary link',
      value: getValue(['hero', 'secondaryLink']) || 'about.html',
      onInput: value => setValue(['hero', 'secondaryLink'], value)
    }));
    wrap.appendChild(globalCard);

    LANGUAGES.forEach(({ code, label }) => {
      const card = document.createElement('div');
      card.className = 'rounded-2xl border border-rose-100 bg-rose-50/70 p-5 shadow-sm space-y-4';

      const heading = document.createElement('h3');
      heading.className = 'text-lg font-semibold text-brand-red';
      heading.textContent = `${label} content`;
      card.appendChild(heading);

      card.appendChild(buildField({
        label: 'Title',
        value: getValue(['hero', code, 'title']) || '',
        onInput: value => setValue(['hero', code, 'title'], value)
      }));

      card.appendChild(buildField({
        label: 'Subtitle',
        type: 'textarea',
        rows: 3,
        value: getValue(['hero', code, 'subtitle']) || '',
        onInput: value => setValue(['hero', code, 'subtitle'], value)
      }));

      card.appendChild(buildField({
        label: 'Primary CTA label',
        value: getValue(['hero', code, 'primaryCta']) || '',
        onInput: value => setValue(['hero', code, 'primaryCta'], value)
      }));

      card.appendChild(buildField({
        label: 'Secondary CTA label',
        value: getValue(['hero', code, 'secondaryCta']) || '',
        onInput: value => setValue(['hero', code, 'secondaryCta'], value)
      }));

      card.appendChild(buildField({
        label: 'Hero image path',
        value: getValue(['hero', code, 'image']) || '',
        onInput: value => setValue(['hero', code, 'image'], value)
      }));

      wrap.appendChild(card);
    });

    const actions = document.createElement('div');
    actions.className = 'mt-6 flex items-center gap-3';
    actions.appendChild(createActionButton('Save hero content', () => persistChanges(false)));
    wrap.appendChild(actions);
  }

  function renderCategories(){
    const root = document.getElementById('category-manager');
    if (!root) return;
    root.innerHTML = '';

    const hero = document.createElement('div');
    hero.className = 'rounded-2xl border border-rose-100 bg-white p-5 shadow-sm space-y-4';

    const heroHeading = document.createElement('h3');
    heroHeading.className = 'text-lg font-semibold text-gray-900';
    heroHeading.textContent = 'Categories hero';
    hero.appendChild(heroHeading);

    LANGUAGES.forEach(({ code, label }) => {
      hero.appendChild(buildField({
        label: `Tag (${label})`,
        value: getValue(['categories', 'hero', 'tag', code]) || '',
        onInput: value => setValue(['categories', 'hero', 'tag', code], value)
      }));
      hero.appendChild(buildField({
        label: `Title (${label})`,
        type: 'textarea',
        rows: 2,
        value: getValue(['categories', 'hero', 'title', code]) || '',
        onInput: value => setValue(['categories', 'hero', 'title', code], value)
      }));
      hero.appendChild(buildField({
        label: `Subtitle (${label})`,
        type: 'textarea',
        rows: 3,
        value: getValue(['categories', 'hero', 'subtitle', code]) || '',
        onInput: value => setValue(['categories', 'hero', 'subtitle', code], value)
      }));
    });

    hero.appendChild(buildField({
      label: 'Hero CTA link',
      value: getValue(['categories', 'hero', 'ctaLink']) || '',
      onInput: value => setValue(['categories', 'hero', 'ctaLink'], value)
    }));

    root.appendChild(hero);

    const slider = document.createElement('div');
    slider.className = 'rounded-2xl border border-rose-100 bg-white p-5 shadow-sm space-y-3';
    const sliderHeading = document.createElement('h3');
    sliderHeading.className = 'text-lg font-semibold text-gray-900';
    sliderHeading.textContent = 'Slider hint';
    slider.appendChild(sliderHeading);
    LANGUAGES.forEach(({ code, label }) => {
      slider.appendChild(buildField({
        label: `${label}`,
        value: getValue(['categories', 'sliderHint', code]) || '',
        onInput: value => setValue(['categories', 'sliderHint', code], value)
      }));
    });
    root.appendChild(slider);

    const groups = getValue(['categories', 'groups']) || {};
    Object.keys(groups).forEach(groupKey => {
      const group = groups[groupKey];
      const details = document.createElement('details');
      details.className = 'rounded-2xl border border-rose-100 bg-white shadow-sm';

      const summary = document.createElement('summary');
      summary.className = 'flex cursor-pointer items-center justify-between px-5 py-3 text-sm font-semibold text-brand-red';
      summary.innerHTML = `<span>${group?.title?.en || groupKey}</span><span class="text-xs uppercase tracking-[0.2em] text-gray-400">${groupKey}</span>`;
      details.appendChild(summary);

      const body = document.createElement('div');
      body.className = 'border-t border-rose-100 px-5 py-4 space-y-4';

      LANGUAGES.forEach(({ code, label }) => {
        body.appendChild(buildField({
          label: `Group tag (${label})`,
          value: getValue(['categories', 'groups', groupKey, 'tag', code]) || '',
          onInput: value => setValue(['categories', 'groups', groupKey, 'tag', code], value)
        }));
        body.appendChild(buildField({
          label: `Group title (${label})`,
          type: 'textarea',
          rows: 2,
          value: getValue(['categories', 'groups', groupKey, 'title', code]) || '',
          onInput: value => setValue(['categories', 'groups', groupKey, 'title', code], value)
        }));
        body.appendChild(buildField({
          label: `Group description (${label})`,
          type: 'textarea',
          rows: 3,
          value: getValue(['categories', 'groups', groupKey, 'description', code]) || '',
          onInput: value => setValue(['categories', 'groups', groupKey, 'description', code], value)
        }));
      });

      const itemsWrap = document.createElement('div');
      itemsWrap.className = 'space-y-4';

      (group.items || []).forEach((item, index) => {
        const itemCard = document.createElement('div');
        itemCard.className = 'rounded-xl border border-dashed border-rose-200 bg-rose-50/70 p-4 space-y-3';

        itemCard.appendChild(buildField({
          label: 'Item ID',
          value: item.id || '',
          onInput: value => {
            setValue(['categories', 'groups', groupKey, 'items', index, 'id'], value);
          }
        }));
        itemCard.appendChild(buildField({
          label: 'Price',
          value: item.price || '',
          onInput: value => {
            setValue(['categories', 'groups', groupKey, 'items', index, 'price'], value);
          }
        }));
        itemCard.appendChild(buildField({
          label: 'Image path',
          value: item.image || '',
          onInput: value => {
            setValue(['categories', 'groups', groupKey, 'items', index, 'image'], value);
          }
        }));
        itemCard.appendChild(buildField({
          label: 'Badge theme',
          value: item.badge?.theme || '',
          onInput: value => {
            if (!item.badge || typeof item.badge !== 'object'){
              setValue(['categories', 'groups', groupKey, 'items', index, 'badge'], {});
            }
            setValue(['categories', 'groups', groupKey, 'items', index, 'badge', 'theme'], value);
          }
        }));

        LANGUAGES.forEach(({ code, label }) => {
          itemCard.appendChild(buildField({
            label: `Badge label (${label})`,
            value: (item.badge && item.badge[code]) || '',
            onInput: value => {
              if (!item.badge || typeof item.badge !== 'object'){
                setValue(['categories', 'groups', groupKey, 'items', index, 'badge'], {});
              }
              setValue(['categories', 'groups', groupKey, 'items', index, 'badge', code], value);
            }
          }));
          itemCard.appendChild(buildField({
            label: `Name (${label})`,
            value: item.texts?.[code]?.name || '',
            onInput: value => {
              setValue(['categories', 'groups', groupKey, 'items', index, 'texts', code, 'name'], value);
            }
          }));
          itemCard.appendChild(buildField({
            label: `Description (${label})`,
            type: 'textarea',
            rows: 2,
            value: item.texts?.[code]?.description || '',
            onInput: value => {
              setValue(['categories', 'groups', groupKey, 'items', index, 'texts', code, 'description'], value);
            }
          }));
          itemCard.appendChild(buildField({
            label: `Inventory (${label})`,
            value: item.inventory?.[code] || '',
            onInput: value => {
              setValue(['categories', 'groups', groupKey, 'items', index, 'inventory', code], value);
            }
          }));
        });

        const actions = document.createElement('div');
        actions.className = 'flex items-center justify-between pt-2';
        const label = document.createElement('span');
        label.className = 'text-xs uppercase tracking-[0.2em] text-gray-500';
        label.textContent = `Item ${index + 1}`;
        actions.appendChild(label);
        actions.appendChild(createSecondaryButton('Remove', () => {
          state.draft.categories.groups[groupKey].items.splice(index, 1);
          scheduleSave();
          renderCategories();
        }));
        itemCard.appendChild(actions);

        itemsWrap.appendChild(itemCard);
      });

      const addBtnWrap = document.createElement('div');
      addBtnWrap.className = 'flex justify-end';
      addBtnWrap.appendChild(createSecondaryButton('Add item', () => {
        const newItem = {
          id: `new-${Date.now()}`,
          price: 'MYR 0',
          image: 'product1.svg',
          badge: { theme: 'rose', en: 'New', zh: '新品' },
          texts: {
            en: { name: 'New item', description: '' },
            zh: { name: '新商品', description: '' }
          },
          inventory: { en: '', zh: '' }
        };
        state.draft.categories.groups[groupKey].items.push(newItem);
        scheduleSave();
        renderCategories();
      }));
      itemsWrap.appendChild(addBtnWrap);

      body.appendChild(itemsWrap);
      details.appendChild(body);
      root.appendChild(details);
    });

    const actions = document.createElement('div');
    actions.className = 'mt-6 flex items-center gap-3';
    actions.appendChild(createActionButton('Save categories', () => persistChanges(false)));
    root.appendChild(actions);
  }

  function renderAbout(){
    const root = document.getElementById('about-form-wrap');
    if (!root) return;
    root.innerHTML = '';

    const heroCard = document.createElement('div');
    heroCard.className = 'rounded-2xl border border-rose-100 bg-white p-5 shadow-sm space-y-4';
    const heroHeading = document.createElement('h3');
    heroHeading.className = 'text-lg font-semibold text-gray-900';
    heroHeading.textContent = 'About hero';
    heroCard.appendChild(heroHeading);
    LANGUAGES.forEach(({ code, label }) => {
      heroCard.appendChild(buildField({
        label: `Tag (${label})`,
        value: getValue(['about', 'hero', 'tag', code]) || '',
        onInput: value => setValue(['about', 'hero', 'tag', code], value)
      }));
      heroCard.appendChild(buildField({
        label: `Title (${label})`,
        type: 'textarea',
        rows: 2,
        value: getValue(['about', 'hero', 'title', code]) || '',
        onInput: value => setValue(['about', 'hero', 'title', code], value)
      }));
      heroCard.appendChild(buildField({
        label: `Subtitle (${label})`,
        type: 'textarea',
        rows: 3,
        value: getValue(['about', 'hero', 'subtitle', code]) || '',
        onInput: value => setValue(['about', 'hero', 'subtitle', code], value)
      }));
      heroCard.appendChild(buildField({
        label: `Primary CTA (${label})`,
        value: getValue(['about', 'hero', 'primaryCta', code]) || '',
        onInput: value => setValue(['about', 'hero', 'primaryCta', code], value)
      }));
      heroCard.appendChild(buildField({
        label: `Secondary CTA (${label})`,
        value: getValue(['about', 'hero', 'secondaryCta', code]) || '',
        onInput: value => setValue(['about', 'hero', 'secondaryCta', code], value)
      }));
    });
    heroCard.appendChild(buildField({
      label: 'Primary CTA link',
      value: getValue(['about', 'hero', 'primaryLink']) || '',
      onInput: value => setValue(['about', 'hero', 'primaryLink'], value)
    }));
    heroCard.appendChild(buildField({
      label: 'Secondary CTA link',
      value: getValue(['about', 'hero', 'secondaryLink']) || '',
      onInput: value => setValue(['about', 'hero', 'secondaryLink'], value)
    }));
    root.appendChild(heroCard);

    const founderCard = document.createElement('div');
    founderCard.className = 'rounded-2xl border border-rose-100 bg-white p-5 shadow-sm space-y-4';
    const founderHeading = document.createElement('h3');
    founderHeading.className = 'text-lg font-semibold text-gray-900';
    founderHeading.textContent = 'Founder spotlight';
    founderCard.appendChild(founderHeading);
    LANGUAGES.forEach(({ code, label }) => {
      founderCard.appendChild(buildField({
        label: `Tag (${label})`,
        value: getValue(['about', 'founder', 'tag', code]) || '',
        onInput: value => setValue(['about', 'founder', 'tag', code], value)
      }));
      founderCard.appendChild(buildField({
        label: `Title (${label})`,
        type: 'textarea',
        rows: 2,
        value: getValue(['about', 'founder', 'title', code]) || '',
        onInput: value => setValue(['about', 'founder', 'title', code], value)
      }));
      founderCard.appendChild(buildField({
        label: `Story (${label})`,
        type: 'textarea',
        rows: 4,
        value: getValue(['about', 'founder', 'story', code]) || '',
        onInput: value => setValue(['about', 'founder', 'story', code], value)
      }));
      founderCard.appendChild(buildField({
        label: `Quote (${label})`,
        type: 'textarea',
        rows: 2,
        value: getValue(['about', 'founder', 'quote', code]) || '',
        onInput: value => setValue(['about', 'founder', 'quote', code], value)
      }));
      founderCard.appendChild(buildField({
        label: `Alt text (${label})`,
        value: getValue(['about', 'founder', 'alt', code]) || '',
        onInput: value => setValue(['about', 'founder', 'alt', code], value)
      }));
    });
    founderCard.appendChild(buildField({
      label: 'Image path',
      value: getValue(['about', 'founder', 'image']) || '',
      onInput: value => setValue(['about', 'founder', 'image'], value)
    }));

    const highlightsWrap = document.createElement('div');
    highlightsWrap.className = 'space-y-3';
    const highlights = getValue(['about', 'founder', 'highlights']) || [];
    highlights.forEach((highlight, index) => {
      const item = document.createElement('div');
      item.className = 'rounded-xl border border-dashed border-rose-200 bg-rose-50/70 p-4 space-y-3';
      LANGUAGES.forEach(({ code, label }) => {
        item.appendChild(buildField({
          label: `${label}`,
          type: 'textarea',
          rows: 2,
          value: highlight?.[code] || '',
          onInput: value => setValue(['about', 'founder', 'highlights', index, code], value)
        }));
      });
      const controls = document.createElement('div');
      controls.className = 'flex items-center justify-between';
      const tag = document.createElement('span');
      tag.className = 'text-xs uppercase tracking-[0.2em] text-gray-500';
      tag.textContent = `Highlight ${index + 1}`;
      controls.appendChild(tag);
      controls.appendChild(createSecondaryButton('Remove', () => {
        state.draft.about.founder.highlights.splice(index, 1);
        scheduleSave();
        renderAbout();
      }));
      item.appendChild(controls);
      highlightsWrap.appendChild(item);
    });
    const addHighlight = document.createElement('div');
    addHighlight.className = 'flex justify-end';
    addHighlight.appendChild(createSecondaryButton('Add highlight', () => {
      const list = ensureArray(['about', 'founder', 'highlights']);
      list.push({ en: '', zh: '' });
      scheduleSave();
      renderAbout();
    }));
    highlightsWrap.appendChild(addHighlight);
    founderCard.appendChild(highlightsWrap);
    root.appendChild(founderCard);

    const valuesCard = document.createElement('div');
    valuesCard.className = 'rounded-2xl border border-rose-100 bg-white p-5 shadow-sm space-y-4';
    const valuesHeading = document.createElement('h3');
    valuesHeading.className = 'text-lg font-semibold text-gray-900';
    valuesHeading.textContent = 'Brand values';
    valuesCard.appendChild(valuesHeading);
    LANGUAGES.forEach(({ code, label }) => {
      valuesCard.appendChild(buildField({
        label: `Tag (${label})`,
        value: getValue(['about', 'values', 'tag', code]) || '',
        onInput: value => setValue(['about', 'values', 'tag', code], value)
      }));
      valuesCard.appendChild(buildField({
        label: `Title (${label})`,
        type: 'textarea',
        rows: 2,
        value: getValue(['about', 'values', 'title', code]) || '',
        onInput: value => setValue(['about', 'values', 'title', code], value)
      }));
      valuesCard.appendChild(buildField({
        label: `Description (${label})`,
        type: 'textarea',
        rows: 3,
        value: getValue(['about', 'values', 'description', code]) || '',
        onInput: value => setValue(['about', 'values', 'description', code], value)
      }));
    });

    const valueItemsWrap = document.createElement('div');
    valueItemsWrap.className = 'space-y-3';
    const valueItems = getValue(['about', 'values', 'items']) || [];
    valueItems.forEach((item, index) => {
      const itemCard = document.createElement('div');
      itemCard.className = 'rounded-xl border border-dashed border-rose-200 bg-rose-50/70 p-4 space-y-3';
      LANGUAGES.forEach(({ code, label }) => {
        itemCard.appendChild(buildField({
          label: `Title (${label})`,
          value: item?.title?.[code] || '',
          onInput: value => setValue(['about', 'values', 'items', index, 'title', code], value)
        }));
        itemCard.appendChild(buildField({
          label: `Description (${label})`,
          type: 'textarea',
          rows: 2,
          value: item?.description?.[code] || '',
          onInput: value => setValue(['about', 'values', 'items', index, 'description', code], value)
        }));
      });
      const controls = document.createElement('div');
      controls.className = 'flex items-center justify-between';
      const tag = document.createElement('span');
      tag.className = 'text-xs uppercase tracking-[0.2em] text-gray-500';
      tag.textContent = `Value ${index + 1}`;
      controls.appendChild(tag);
      controls.appendChild(createSecondaryButton('Remove', () => {
        state.draft.about.values.items.splice(index, 1);
        scheduleSave();
        renderAbout();
      }));
      itemCard.appendChild(controls);
      valueItemsWrap.appendChild(itemCard);
    });
    const addValueWrap = document.createElement('div');
    addValueWrap.className = 'flex justify-end';
    addValueWrap.appendChild(createSecondaryButton('Add value', () => {
      const list = ensureArray(['about', 'values', 'items']);
      list.push({ title: { en: '', zh: '' }, description: { en: '', zh: '' } });
      scheduleSave();
      renderAbout();
    }));
    valueItemsWrap.appendChild(addValueWrap);
    valuesCard.appendChild(valueItemsWrap);
    root.appendChild(valuesCard);

    const timelineCard = document.createElement('div');
    timelineCard.className = 'rounded-2xl border border-rose-100 bg-white p-5 shadow-sm space-y-4';
    const timelineHeading = document.createElement('h3');
    timelineHeading.className = 'text-lg font-semibold text-gray-900';
    timelineHeading.textContent = 'Milestones';
    timelineCard.appendChild(timelineHeading);
    LANGUAGES.forEach(({ code, label }) => {
      timelineCard.appendChild(buildField({
        label: `Tag (${label})`,
        value: getValue(['about', 'timeline', 'tag', code]) || '',
        onInput: value => setValue(['about', 'timeline', 'tag', code], value)
      }));
      timelineCard.appendChild(buildField({
        label: `Title (${label})`,
        type: 'textarea',
        rows: 2,
        value: getValue(['about', 'timeline', 'title', code]) || '',
        onInput: value => setValue(['about', 'timeline', 'title', code], value)
      }));
      timelineCard.appendChild(buildField({
        label: `Description (${label})`,
        type: 'textarea',
        rows: 3,
        value: getValue(['about', 'timeline', 'description', code]) || '',
        onInput: value => setValue(['about', 'timeline', 'description', code], value)
      }));
    });
    const timelineItemsWrap = document.createElement('div');
    timelineItemsWrap.className = 'space-y-3';
    const timelineItems = getValue(['about', 'timeline', 'items']) || [];
    timelineItems.forEach((item, index) => {
      const itemCard = document.createElement('div');
      itemCard.className = 'rounded-xl border border-dashed border-rose-200 bg-rose-50/70 p-4 space-y-3';
      LANGUAGES.forEach(({ code, label }) => {
        itemCard.appendChild(buildField({
          label: `Title (${label})`,
          value: item?.title?.[code] || '',
          onInput: value => setValue(['about', 'timeline', 'items', index, 'title', code], value)
        }));
        itemCard.appendChild(buildField({
          label: `Description (${label})`,
          type: 'textarea',
          rows: 2,
          value: item?.description?.[code] || '',
          onInput: value => setValue(['about', 'timeline', 'items', index, 'description', code], value)
        }));
      });
      const controls = document.createElement('div');
      controls.className = 'flex items-center justify-between';
      const tag = document.createElement('span');
      tag.className = 'text-xs uppercase tracking-[0.2em] text-gray-500';
      tag.textContent = `Milestone ${index + 1}`;
      controls.appendChild(tag);
      controls.appendChild(createSecondaryButton('Remove', () => {
        state.draft.about.timeline.items.splice(index, 1);
        scheduleSave();
        renderAbout();
      }));
      itemCard.appendChild(controls);
      timelineItemsWrap.appendChild(itemCard);
    });
    const addTimeline = document.createElement('div');
    addTimeline.className = 'flex justify-end';
    addTimeline.appendChild(createSecondaryButton('Add milestone', () => {
      const list = ensureArray(['about', 'timeline', 'items']);
      list.push({ title: { en: '', zh: '' }, description: { en: '', zh: '' } });
      scheduleSave();
      renderAbout();
    }));
    timelineItemsWrap.appendChild(addTimeline);
    timelineCard.appendChild(timelineItemsWrap);
    root.appendChild(timelineCard);

    const communityCard = document.createElement('div');
    communityCard.className = 'rounded-2xl border border-rose-100 bg-white p-5 shadow-sm space-y-4';
    const communityHeading = document.createElement('h3');
    communityHeading.className = 'text-lg font-semibold text-gray-900';
    communityHeading.textContent = 'Community CTA';
    communityCard.appendChild(communityHeading);
    LANGUAGES.forEach(({ code, label }) => {
      communityCard.appendChild(buildField({
        label: `Title (${label})`,
        value: getValue(['about', 'community', 'title', code]) || '',
        onInput: value => setValue(['about', 'community', 'title', code], value)
      }));
      communityCard.appendChild(buildField({
        label: `Description (${label})`,
        type: 'textarea',
        rows: 3,
        value: getValue(['about', 'community', 'description', code]) || '',
        onInput: value => setValue(['about', 'community', 'description', code], value)
      }));
      communityCard.appendChild(buildField({
        label: `CTA text (${label})`,
        value: getValue(['about', 'community', 'ctaText', code]) || '',
        onInput: value => setValue(['about', 'community', 'ctaText', code], value)
      }));
    });
    communityCard.appendChild(buildField({
      label: 'CTA link',
      value: getValue(['about', 'community', 'ctaLink']) || '',
      onInput: value => setValue(['about', 'community', 'ctaLink'], value)
    }));
    root.appendChild(communityCard);

    const actions = document.createElement('div');
    actions.className = 'flex items-center gap-3';
    actions.appendChild(createActionButton('Save about page', () => persistChanges(false)));
    root.appendChild(actions);
  }

  function renderFooter(){
    const wrap = document.getElementById('footer-form-wrap');
    if (!wrap) return;
    wrap.innerHTML = '';

    const card = document.createElement('div');
    card.className = 'rounded-2xl border border-rose-100 bg-white p-5 shadow-sm space-y-4';
    card.appendChild(buildField({
      label: translateKey('admin.footer.instagram'),
      value: getValue(['footer', 'social', 'instagram']) || '',
      onInput: value => setValue(['footer', 'social', 'instagram'], value)
    }));
    card.appendChild(buildField({
      label: translateKey('admin.footer.facebook'),
      value: getValue(['footer', 'social', 'facebook']) || '',
      onInput: value => setValue(['footer', 'social', 'facebook'], value)
    }));
    card.appendChild(buildField({
      label: translateKey('admin.footer.whatsapp'),
      value: getValue(['footer', 'social', 'whatsapp']) || '',
      onInput: value => setValue(['footer', 'social', 'whatsapp'], value)
    }));
    card.appendChild(buildField({
      label: translateKey('admin.footer.tiktok'),
      value: getValue(['footer', 'social', 'tiktok']) || '',
      onInput: value => setValue(['footer', 'social', 'tiktok'], value)
    }));
    wrap.appendChild(card);

    const actions = document.createElement('div');
    actions.className = 'flex items-center gap-3';
    actions.appendChild(createActionButton(translateKey('admin.footer.save'), () => persistChanges(false)));
    wrap.appendChild(actions);
  }

  function renderAllSections(){
    renderHeroForm();
    renderCategories();
    renderAbout();
    renderFooter();
    renderOrders();
  }

  function unlockAdmin(){
    const loginSection = document.getElementById('admin-login');
    const appSection = document.getElementById('admin-app');
    if (loginSection){
      loginSection.classList.add('hidden');
    }
    if (appSection){
      appSection.classList.remove('hidden');
    }
    sessionStorage.setItem(SESSION_KEY, '1');
    state.draft = loadContent();
    state.initialized = true;
    initOrdersModule();
    renderAllSections();
    bindGlobalActions();
    showToast(translateKey('admin.login.success'));
  }

  function bindGlobalActions(){
    const resetButton = document.getElementById('adminReset');
    if (resetButton){
      resetButton.addEventListener('click', resetContent);
    }
    const exportButton = document.getElementById('adminExport');
    if (exportButton){
      exportButton.addEventListener('click', exportContent);
    }
  }

  document.addEventListener('osun:langchange', () => {
    if (!state.initialized) return;
    renderHeroForm();
    renderCategories();
    renderAbout();
    renderFooter();
    renderOrders();
  });

  ready(() => {
    const loginForm = document.getElementById('adminLoginForm');
    const loginError = document.getElementById('adminLoginError');
    if (!loginForm){
      return;
    }

    const unlocked = sessionStorage.getItem(SESSION_KEY) === '1';
    if (unlocked){
      unlockAdmin();
      return;
    }

    loginForm.addEventListener('submit', event => {
      event.preventDefault();
      const formData = new FormData(loginForm);
      const password = (formData.get('password') || '').toString().trim();
      if (!password){
        loginError.classList.remove('hidden');
        loginError.textContent = 'Please enter a password.';
        return;
      }
      if (password !== ADMIN_PASSWORD){
        loginError.classList.remove('hidden');
        loginError.textContent = 'Incorrect password. Please try again.';
        return;
      }
      loginError.classList.add('hidden');
      unlockAdmin();
    });
  });
})(window, document);
