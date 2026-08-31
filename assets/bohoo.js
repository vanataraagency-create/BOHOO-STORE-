/* ═══════════════════════════════════════════════════
   BOHOO — NOT FOR EVERYONE.
   Shopify Theme JavaScript
   ═══════════════════════════════════════════════════ */

gsap.registerPlugin(ScrollTrigger);

// ── STATE ────────────────────────────────────────
let wishlist = JSON.parse(localStorage.getItem('bhWish')||'[]');
let menuOpen = false;

// ── LOADER ───────────────────────────────────────
function initLoader(){
  const loader = document.getElementById('loader');
  if(!loader) return;
  const word = document.getElementById('lword');
  const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const TARGET = 'BOHOO';
  let done = false;

  setTimeout(()=>loader.classList.add('go'), 50);

  let iter = 0;
  const scramble = setInterval(()=>{
    word.textContent = TARGET.split('').map((c,i)=>{
      if(i < iter) return c;
      return CHARS[Math.floor(Math.random()*CHARS.length)];
    }).join('');
    if(iter >= TARGET.length){ clearInterval(scramble); word.textContent = TARGET; }
    iter += .4;
  }, 40);

  setTimeout(()=>{
    loader.classList.add('out');
    setTimeout(()=>{ loader.style.display='none'; startHero(); }, 500);
  }, 1400);
}

// ── HERO ─────────────────────────────────────────
function startHero(){
  const dress = document.getElementById('htDress');
  const diff = document.getElementById('htDiff');
  const cta = document.getElementById('heroCta');
  const line = document.getElementById('heroLine');

  if(dress) gsap.to(dress,{opacity:1,y:0,duration:.8,ease:'power4.out',delay:.1});
  if(diff) gsap.to(diff,{opacity:1,y:0,duration:.8,ease:'power4.out',delay:.25});
  if(cta) gsap.to(cta,{opacity:1,y:0,duration:.6,ease:'power3.out',delay:.5});
  if(line) gsap.to(line,{opacity:1,duration:.5,delay:.8});

  // Glitch loop
  if(diff){
    setInterval(()=>{
      diff.classList.add('glitch');
      setTimeout(()=>diff.classList.remove('glitch'), 350);
    }, 4000);
  }

  setTimeout(()=>{
    showCookie();
    startToasts();
  }, 2500);
}

// ── CURSOR ───────────────────────────────────────
(function(){
  if(window.matchMedia('(pointer:coarse)').matches) return;
  const dot = document.getElementById('cdot');
  const ring = document.getElementById('cring');
  if(!dot || !ring) return;
  let rx=0,ry=0,tx=0,ty=0;
  document.addEventListener('mousemove',e=>{
    tx=e.clientX;ty=e.clientY;
    dot.style.left=tx+'px';dot.style.top=ty+'px';
  });
  const lerp=(a,b,n)=>a+(b-a)*n;
  (function tick(){
    rx=lerp(rx,tx,.13);ry=lerp(ry,ty,.13);
    ring.style.left=rx+'px';ring.style.top=ry+'px';
    requestAnimationFrame(tick);
  })();

  document.body.addEventListener('mouseover',e=>{
    const target = e.target.closest('a,button,[data-cursor]');
    if(target){
      dot.style.width='0';dot.style.height='0';
      ring.style.width='60px';ring.style.height='60px';
      ring.style.borderColor='var(--acid)';
    }
  });
  document.body.addEventListener('mouseout',e=>{
    const target = e.target.closest('a,button,[data-cursor]');
    if(target){
      dot.style.width='8px';dot.style.height='8px';
      ring.style.width='36px';ring.style.height='36px';
      ring.style.borderColor='rgba(200,255,0,.5)';
    }
  });
})();

// ── HEADER SCROLL ────────────────────────────────
const headerEl = document.getElementById('header');
if(headerEl){
  window.addEventListener('scroll',()=>{
    headerEl.classList.toggle('scrolled',window.scrollY>60);
  });
}

// ── CARD EVENT ATTACHMENT ────────────────────────
function attachCardEvents(grid){
  if(!grid) return;
  // 3D tilt
  grid.querySelectorAll('.p-card').forEach(card=>{
    card.addEventListener('mousemove',e=>{
      const r=card.getBoundingClientRect();
      const x=(e.clientX-r.left)/r.width-.5;
      const y=(e.clientY-r.top)/r.height-.5;
      card.style.transform=`translateY(-4px) rotateX(${-y*7}deg) rotateY(${x*7}deg)`;
      card.style.transition='transform .08s ease';
    });
    card.addEventListener('mouseleave',()=>{card.style.transform='';card.style.transition='transform .4s var(--ease)'});
  });

  // Wish
  grid.querySelectorAll('.p-wish').forEach(btn=>{
    btn.addEventListener('click',e=>{
      e.stopPropagation();
      const id=btn.dataset.wish;
      if(wishlist.includes(id)) wishlist=wishlist.filter(x=>x!==id);
      else wishlist.push(id);
      localStorage.setItem('bhWish',JSON.stringify(wishlist));
      btn.classList.toggle('on',wishlist.includes(id));
      btn.textContent=wishlist.includes(id)?'♥':'♡';
      btn.style.transform='scale(1.4)';
      setTimeout(()=>btn.style.transform='',200);
    });
  });

  // Add to cart (Shopify AJAX API)
  grid.querySelectorAll('.qa-btn:not([disabled])').forEach(btn=>{
    btn.addEventListener('click',e=>{
      e.stopPropagation();
      const variantId = btn.dataset.variant;
      if(!variantId) return;

      btn.textContent='ADDING...';

      fetch('/cart/add.js', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({items:[{id: parseInt(variantId), quantity: 1}]})
      })
      .then(res => res.json())
      .then(data => {
        btn.textContent='✓ ADDED';
        btn.classList.add('added');
        updateCartDrawer();
        setTimeout(()=>{btn.textContent='QUICK BUY →';btn.classList.remove('added')},1500);
      })
      .catch(err => {
        btn.textContent='ERROR';
        setTimeout(()=>btn.textContent='QUICK BUY →',1500);
      });
    });
  });
}

// ── SHOPIFY CART DRAWER ──────────────────────────
function updateCartDrawer(){
  fetch('/cart.js')
    .then(res => res.json())
    .then(cart => {
      const badge = document.getElementById('bagCt');
      if(badge){
        badge.textContent = cart.item_count;
        badge.classList.toggle('show', cart.item_count > 0);
        badge.style.transform='scale(1.5)';
        setTimeout(()=>badge.style.transform='',250);
      }

      const list = document.getElementById('cartList');
      const empty = document.getElementById('cartEmpty');
      const foot = document.getElementById('cartFoot');
      if(!list) return;

      // Clear existing items
      list.querySelectorAll('.cart-item').forEach(e=>e.remove());

      if(cart.item_count === 0){
        if(empty) empty.style.display='flex';
        if(foot) foot.style.display='none';
        return;
      }
      if(empty) empty.style.display='none';
      if(foot) foot.style.display='block';

      cart.items.forEach(item => {
        const el = document.createElement('div');
        el.className='cart-item';
        const price = (item.price / 100).toLocaleString('en-IN');
        el.innerHTML=`<img class="ci-img" src="${item.image}" alt="${item.title}"><div class="ci-info"><div class="ci-name">${item.title}</div><div class="ci-sz">SIZE: ${item.variant_title || 'OS'}${item.quantity>1?' · QTY: '+item.quantity:''}</div><div class="ci-pr">₹${price}</div></div><button class="ci-rm" data-line="${item.key}">×</button>`;
        el.querySelector('.ci-rm').addEventListener('click',e=>{
          const key = e.target.dataset.line;
          fetch('/cart/change.js', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({id: key, quantity: 0})
          }).then(()=>updateCartDrawer());
        });
        list.appendChild(el);
      });

      const totalEl = document.getElementById('cartTotal');
      if(totalEl) totalEl.textContent = '₹' + (cart.total_price / 100).toLocaleString('en-IN');

      // Open cart drawer after adding
      openCart();
    });
}

function openCart(){
  const cartEl = document.getElementById('cart');
  const bd = document.getElementById('cartBd');
  if(cartEl) cartEl.classList.add('open');
  if(bd) bd.classList.add('show');
  document.body.style.overflow='hidden';
}
function closeCart(){
  const cartEl = document.getElementById('cart');
  const bd = document.getElementById('cartBd');
  if(cartEl) cartEl.classList.remove('open');
  if(bd) bd.classList.remove('show');
  document.body.style.overflow='';
}

// Cart button listeners
const cartBtn = document.getElementById('cartBtn');
const cartX = document.getElementById('cartX');
const cartBd = document.getElementById('cartBd');
if(cartBtn) cartBtn.addEventListener('click',()=>{ updateCartDrawer(); openCart(); });
if(cartX) cartX.addEventListener('click',closeCart);
if(cartBd) cartBd.addEventListener('click',closeCart);

// Checkout button
const checkoutBtn = document.querySelector('.checkout-btn');
if(checkoutBtn){
  checkoutBtn.addEventListener('click',()=>{
    window.location.href = '/checkout';
  });
}

// ── MENU ─────────────────────────────────────────
function openMenu(){
  menuOpen=true;
  const overlay = document.getElementById('menu-overlay');
  if(overlay) overlay.classList.add('open');
  document.body.style.overflow='hidden';
}
function closeMenu(){
  menuOpen=false;
  const overlay = document.getElementById('menu-overlay');
  if(overlay) overlay.classList.remove('open');
  document.body.style.overflow='';
}
const menuBtn = document.getElementById('menuBtn');
const menuX = document.getElementById('menuX');
if(menuBtn) menuBtn.addEventListener('click',openMenu);
if(menuX) menuX.addEventListener('click',closeMenu);
document.querySelectorAll('.menu-link').forEach(a=>a.addEventListener('click',closeMenu));

// ── TOAST NOTIFICATIONS ──────────────────────────
const TOAST_NAMES=['Rahul from Vadodara','Arjun from Ahmedabad','Siya from Surat','Dev from Mehsana','Priya from Baroda','Karan from Rajkot','Anvi from Gandhinagar'];
const TOAST_PRODS=['Heavyweight Hoodie','Washed Oversized Tee','Cargo Jogger','Zip-Up Jacket'];

function showToast(name,prod,avat){
  const container=document.getElementById('toast-container');
  if(!container) return;
  const t=document.createElement('div');
  t.className='toast';
  t.innerHTML=`<div class="toast-av" style="background:var(--bg3);color:var(--acid);font-family:var(--font-d);font-size:14px">${avat}</div><div class="toast-info"><div class="toast-txt">${name} just bought ${prod}</div><div class="toast-time">just now</div></div><div class="toast-bar"></div>`;
  container.appendChild(t);
  requestAnimationFrame(()=>requestAnimationFrame(()=>t.classList.add('show')));
  setTimeout(()=>{t.classList.remove('show');setTimeout(()=>t.remove(),400)},4500);
}

function startToasts(){
  function next(){
    const n=TOAST_NAMES[Math.floor(Math.random()*TOAST_NAMES.length)];
    const p=TOAST_PRODS[Math.floor(Math.random()*TOAST_PRODS.length)];
    const a=n[0];
    showToast(n,p,a);
    setTimeout(next,Math.random()*20000+15000);
  }
  setTimeout(next,5000);
}

// ── WAITLIST ─────────────────────────────────────
const wlBtn = document.getElementById('wlBtn');
if(wlBtn){
  wlBtn.addEventListener('click',()=>{
    const email=document.getElementById('wlEmail').value;
    if(email&&email.includes('@')){
      // Submit to Shopify customer API
      fetch('/contact', {
        method: 'POST',
        headers: {'Content-Type': 'application/x-www-form-urlencoded'},
        body: `form_type=customer&email=${encodeURIComponent(email)}&tags=waitlist`
      }).catch(()=>{});

      document.getElementById('notifMsg').textContent="you're on the list ✓";
      document.getElementById('wlEmail').value='';
      document.getElementById('wlEmail').placeholder='see you at the drop 👊';
      wlBtn.textContent='✓';
      wlBtn.style.background='#fff';
    }else{
      document.getElementById('wlEmail').style.borderColor='var(--red)';
      setTimeout(()=>document.getElementById('wlEmail').style.borderColor='',1200);
    }
  });
}

// ── COOKIE ───────────────────────────────────────
function showCookie(){
  if(localStorage.getItem('bhCk')) return;
  const cookie = document.getElementById('cookie');
  if(cookie) setTimeout(()=>cookie.classList.add('show'),3000);
}
const ckYes = document.getElementById('ckYes');
const ckNo = document.getElementById('ckNo');
if(ckYes) ckYes.addEventListener('click',()=>{localStorage.setItem('bhCk','1');document.getElementById('cookie').classList.remove('show')});
if(ckNo) ckNo.addEventListener('click',()=>document.getElementById('cookie').classList.remove('show'));

// ── SCROLL REVEALS ───────────────────────────────
function initReveals(){
  const obs = new IntersectionObserver(entries=>{
    entries.forEach(e=>{
      if(e.isIntersecting){ e.target.classList.add('shown'); obs.unobserve(e.target); }
    });
  },{threshold:.12,rootMargin:'0px 0px -40px 0px'});
  document.querySelectorAll('.reveal,.reveal-left').forEach(el=>obs.observe(el));
}

// ── URGENCY COUNTERS ─────────────────────────────
function initUrgency(){
  const vc = document.getElementById('viewCount');
  if(vc){
    setInterval(()=>{
      const v = parseInt(vc.textContent);
      const delta = Math.floor(Math.random()*5)-2;
      vc.textContent = Math.max(12,Math.min(99,v+delta));
    }, 3500);
  }

  const lb = document.getElementById('lastBuy');
  if(lb){
    const times = ['2 MIN AGO','5 MIN AGO','8 MIN AGO','12 MIN AGO','18 MIN AGO','3 MIN AGO'];
    let ti = 0;
    setInterval(()=>{ ti=(ti+1)%times.length; lb.textContent=times[ti]; },25000);
  }

  const cd = document.getElementById('countdown');
  if(cd){
    const target = Date.now() + 48*60*60*1000;
    setInterval(()=>{
      const diff = Math.max(0,target-Date.now());
      const h = Math.floor(diff/3600000);
      const m = Math.floor((diff%3600000)/60000);
      const s = Math.floor((diff%60000)/1000);
      cd.textContent = `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
    },1000);
  }
}

// ── GSAP PARALLAX & STATEMENT ────────────────────
function initParallax(){
  gsap.utils.toArray('.lb-img img').forEach(img=>{
    gsap.to(img,{yPercent:-12,ease:'none',scrollTrigger:{trigger:img.closest('.lb-img'),scrub:true}});
  });

  ['sw1','sw2','sw3'].forEach((id,i)=>{
    const el=document.getElementById(id);
    if(!el) return;
    gsap.set(el,{x:'-110%'});
    ScrollTrigger.create({
      trigger:'#statement',start:'top 75%',once:true,
      onEnter:()=>gsap.to(el,{x:'0%',duration:.9,ease:'power4.out',delay:i*.13})
    });
  });
}

// ── SEARCH EXPERIENCE ─────────────────────────────
const searchOverlay = document.getElementById('search-overlay');
const searchInput = document.getElementById('searchInput');
const searchResultsGrid = document.getElementById('search-results-grid');
const featuredSearches = document.getElementById('featured-searches');
const searchEmptyState = document.getElementById('search-empty-state');
const filterPills = document.querySelectorAll('.filter-pill');

let activeSearchFilter = 'all';

function openSearch() {
  if(!searchOverlay) return;
  searchOverlay.classList.add('open');
  document.body.style.overflow = 'hidden';

  gsap.fromTo('#search-overlay', { opacity: 0 }, { opacity: 1, duration: 0.35, ease: 'power2.out' });
  gsap.fromTo('.search-header h2, .search-header p, .search-input-wrap',
    { y: 30, opacity: 0 },
    { y: 0, opacity: 1, duration: 0.5, stagger: 0.08, ease: 'power3.out', delay: 0.1 }
  );
  gsap.fromTo('.filter-pill',
    { scale: 0.8, opacity: 0 },
    { scale: 1, opacity: 1, duration: 0.4, stagger: 0.03, ease: 'back.out(1.5)', delay: 0.25 }
  );

  setTimeout(() => { if(searchInput) searchInput.focus(); }, 350);
}

function closeSearch() {
  if(!searchOverlay) return;
  gsap.to('#search-overlay', {
    opacity: 0,
    duration: 0.3,
    ease: 'power2.inOut',
    onComplete: () => {
      searchOverlay.classList.remove('open');
      document.body.style.overflow = '';
      if(searchInput) searchInput.value = '';
      activeSearchFilter = 'all';
      filterPills.forEach(p => p.classList.toggle('active', p.dataset.filter === 'all'));
      if(searchResultsGrid) searchResultsGrid.style.display = 'none';
      if(searchEmptyState) searchEmptyState.style.display = 'none';
      if(featuredSearches) featuredSearches.style.display = 'block';
    }
  });
}

// Search open/close listeners
const searchBtn = document.getElementById('searchBtn');
const searchCloseBtn = document.getElementById('searchCloseBtn');
if(searchBtn) searchBtn.addEventListener('click', openSearch);
if(searchCloseBtn) searchCloseBtn.addEventListener('click', closeSearch);

document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && searchOverlay && searchOverlay.classList.contains('open')) {
    closeSearch();
  }
});

// Shopify Predictive Search
function runSearch() {
  if(!searchInput) return;
  const query = searchInput.value.trim().toLowerCase();

  if (query.length === 0 && activeSearchFilter === 'all') {
    if(featuredSearches) featuredSearches.style.display = 'block';
    if(searchResultsGrid) searchResultsGrid.style.display = 'none';
    if(searchEmptyState) searchEmptyState.style.display = 'none';
    return;
  }

  if(featuredSearches) featuredSearches.style.display = 'none';

  // Use Shopify predictive search API
  const searchQuery = query || '*';
  fetch(`/search/suggest.json?q=${encodeURIComponent(searchQuery)}&resources[type]=product&resources[limit]=12`)
    .then(res => res.json())
    .then(data => {
      const products = data.resources && data.resources.results && data.resources.results.products || [];
      renderSearchResults(products);
    })
    .catch(() => {
      // Fallback: search page-based products on the page
      if(searchResultsGrid) searchResultsGrid.style.display = 'none';
      if(searchEmptyState) searchEmptyState.style.display = 'block';
    });
}

function renderSearchResults(products) {
  if(!searchResultsGrid || !searchEmptyState) return;

  if (products.length === 0) {
    searchResultsGrid.style.display = 'none';
    searchEmptyState.style.display = 'block';
    return;
  }

  searchEmptyState.style.display = 'none';
  searchResultsGrid.style.display = 'grid';

  searchResultsGrid.innerHTML = products.map(p => {
    const price = p.price ? '₹' + parseFloat(p.price).toLocaleString('en-IN') : '';
    const comparePrice = p.compare_at_price_max && parseFloat(p.compare_at_price_max) > parseFloat(p.price) ? '₹' + parseFloat(p.compare_at_price_max).toLocaleString('en-IN') : '';
    const img = p.image || p.featured_image && p.featured_image.url || '';
    const available = p.available !== false;

    return `
    <a href="${p.url}" class="p-card shown" style="text-decoration:none">
      <div class="p-card-img">
        <img src="${img}" alt="${p.title}" loading="lazy">
        ${!available ? '<span class="badge-s p-badge">SOLD OUT</span>' : '<span class="badge-n p-badge">NEW</span>'}
      </div>
      <div class="p-info">
        <div class="p-name">${p.title}</div>
        <div class="p-cat-tag">${p.product_type || ''}</div>
        <div class="p-price-row">
          <span class="p-price">${price}</span>
          ${comparePrice ? `<span class="p-mrp">${comparePrice}</span>` : ''}
        </div>
      </div>
    </a>`;
  }).join('');

  gsap.fromTo('#search-results-grid .p-card',
    { opacity: 0, y: 20 },
    { opacity: 1, y: 0, duration: 0.35, stagger: 0.04, ease: 'power2.out' }
  );
}

if(searchInput) searchInput.addEventListener('input', runSearch);

filterPills.forEach(pill => {
  pill.addEventListener('click', () => {
    filterPills.forEach(p => p.classList.remove('active'));
    pill.classList.add('active');
    activeSearchFilter = pill.dataset.filter;
    runSearch();
  });
});

document.querySelectorAll('.feat-item').forEach(item => {
  item.addEventListener('click', () => {
    const query = item.dataset.query;
    if(searchInput) searchInput.value = query.toUpperCase();
    runSearch();
  });
});

// ── CATEGORY STICKY BAR ──────────────────────────
document.querySelectorAll('.cat-item').forEach(item => {
  item.addEventListener('click', () => {
    document.querySelectorAll('.cat-item').forEach(el => el.classList.remove('active'));
    item.classList.add('active');
    const cat = item.dataset.cat;
    const dropSection = document.getElementById('drop');

    // Filter products using collection links
    if(cat === 'all'){
      window.location.href = '/';
    } else {
      window.location.href = '/collections/' + cat;
    }
  });
});

// ── PRODUCT PAGE SIZE SELECTOR ───────────────────
document.querySelectorAll('.size-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.size-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const variantId = btn.dataset.variant;
    const addBtn = document.querySelector('.add-to-cart-btn');
    if(addBtn) addBtn.dataset.variant = variantId;
  });
});

// Product page add to cart
const addToCartBtn = document.querySelector('.add-to-cart-btn');
if(addToCartBtn){
  addToCartBtn.addEventListener('click', () => {
    const variantId = addToCartBtn.dataset.variant;
    if(!variantId) return;
    addToCartBtn.textContent = 'ADDING...';
    fetch('/cart/add.js', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({items:[{id: parseInt(variantId), quantity: 1}]})
    })
    .then(res => res.json())
    .then(()=>{
      addToCartBtn.textContent = '✓ ADDED';
      updateCartDrawer();
      setTimeout(()=>addToCartBtn.textContent='ADD TO BAG',1500);
    })
    .catch(()=>{
      addToCartBtn.textContent = 'ERROR';
      setTimeout(()=>addToCartBtn.textContent='ADD TO BAG',1500);
    });
  });
}

// ── INIT ─────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  // Attach card events to any product grids on the page
  document.querySelectorAll('.products-grid').forEach(grid => attachCardEvents(grid));

  initReveals();
  initUrgency();
  initParallax();
  initLoader();

  // Initial cart count
  updateCartDrawer();
});

console.log('%cBOHOO%css25','background:#c8ff00;color:#080808;font-family:Anton,sans-serif;font-size:20px;padding:4px 10px','background:#080808;color:#c8ff00;font-size:20px;padding:4px 8px');
