
/**
 * Osun multi-page checkout flow helper
 * Keys used in localStorage:
 *  - osun_cart_items: JSON.stringify([{name, unit_amount_cents, quantity}])
 *  - osun_customer: JSON.stringify({name, email, phone, city, district, address})
 *  - osun_total_cents: number
 */

const OSUN = {
  getCart() {
    try { return JSON.parse(localStorage.getItem('osun_cart_items') || '[]'); } catch(e){ return []; }
  },
  setCart(items) {
    localStorage.setItem('osun_cart_items', JSON.stringify(items||[]));
    OSUN.setTotal(OSUN.calcTotal(items));
  },
  calcTotal(items) {
    return (items||[]).reduce((sum, it) => sum + (Number(it.unit_amount_cents)||0) * (Number(it.quantity)||1), 0);
  },
  getTotal() { return Number(localStorage.getItem('osun_total_cents') || '0'); },
  setTotal(cents) { localStorage.setItem('osun_total_cents', String(cents||0)); },
  getCustomer() {
    try { return JSON.parse(localStorage.getItem('osun_customer') || 'null'); } catch(e){ return null; }
  },
  setCustomer(obj) { localStorage.setItem('osun_customer', JSON.stringify(obj||{})); },
  fmtCents(c){ return 'RM ' + (c/100).toFixed(2); },
  ensureDemoCart() {
    const has = OSUN.getCart();
    if (!has || has.length === 0) {
      OSUN.setCart([{ name: 'Osun Glow Serum', unit_amount_cents: 15000, quantity: 1 }]);
    } else {
      OSUN.setTotal(OSUN.calcTotal(has));
    }
  }
};

function renderOrderSummary(elId) {
  const el = document.getElementById(elId);
  if (!el) return;
  const items = OSUN.getCart();
  const total = OSUN.getTotal();
  el.innerHTML = `
    <div class="divide-y">
      ${items.map(it => `
        <div class="py-3 flex items-center justify-between">
          <div>
            <div class="font-medium">${it.name}</div>
            <div class="text-sm text-gray-500">x${it.quantity}</div>
          </div>
          <div class="font-semibold">${OSUN.fmtCents(it.unit_amount_cents * it.quantity)}</div>
        </div>
      `).join('')}
      <div class="pt-4 flex items-center justify-between text-lg">
        <div>小計</div>
        <div class="font-bold text-osun-pink">${OSUN.fmtCents(total)}</div>
      </div>
    </div>
  `;
}
