const app = document.querySelector('#app');
const dialog = document.querySelector('#dialog');
const toast = document.querySelector('#toast');

const icons = {
  bolt:'<path d="m13 2-9 12h7l-1 8 10-12h-7l1-8Z"/>',
  bell:'<path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9m-9 12a2 2 0 0 0 4 0"/>',
  store:'<path d="M4 11v9h16v-9M3 8l2-4h14l2 4v2a2 2 0 0 1-4 0 2.5 2.5 0 0 1-5 0 2.5 2.5 0 0 1-5 0 2 2 0 0 1-4 0V8Zm6 12v-6h6v6"/>',
  pin:'<path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/>',
  calendar:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18m-13 5h2m4 0h2"/>',
  arrow:'<path d="M4 12h15m-6-6 6 6-6 6"/>',
  target:'<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2"/>',
  search:'<circle cx="10.7" cy="10.7" r="6.7"/><path d="m16 16 4 4"/>',
  sliders:'<path d="M4 6h5m5 0h6M4 12h11m4 0h1M4 18h2m5 0h9"/><circle cx="11.5" cy="6" r="2.5"/><circle cx="17" cy="12" r="2"/><circle cx="8.5" cy="18" r="2.5"/>',
  coffee:'<path d="M4 9h13v6a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4V9Zm13 1h2a2 2 0 1 1 0 4h-2M3 22h17M8 3v3m4-4v4"/>',
  ticket:'<path d="M4 7h16v3a2 2 0 0 0 0 4v3H4v-3a2 2 0 0 0 0-4V7Zm10 1v2m0 2v1m0 2v1"/>',
  food:'<path d="M3 12h18m-2 0a7 7 0 1 0-14 0m7-7V3M3 17h18m-15 0 2 3h8l2-3"/>',
  bag:'<path d="M5 8h14l1 12H4L5 8Zm4 1V6a3 3 0 1 1 6 0v3"/>',
  book:'<path d="M12 6c-3-2-6-2-9-1v14c3-1 6-1 9 1 3-2 6-2 9-1V5c-3-1-6-1-9 1Zm0 0v14"/>',
  heart:'<path d="M20.8 8.8c0 4-8.8 9.5-8.8 9.5S3.2 12.8 3.2 8.8a4.5 4.5 0 0 1 8.8-1.2 4.5 4.5 0 0 1 8.8 1.2Z"/>',
  shield:'<path d="m12 3 8 3v5c0 4-3.5 8-8 10-4.5-2-8-6-8-10V6l8-3Zm-3 9 2 2 4-4"/>',
  clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  close:'<path d="m6 6 12 12M18 6 6 18"/>',
  plus:'<path d="M12 5v14M5 12h14"/>',
  check:'<path d="m5 12 4 4L19 6"/>'
};

const icon = name => `<span class="icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${icons[name]}</svg></span>`;
for (const node of document.querySelectorAll('[data-icon]')) node.innerHTML = icon(node.dataset.icon);
const safe = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));

const categories = {
  coffee:['咖啡茶饮','coffee'], event:['活动展会','ticket'], food:['餐饮服务','food'],
  retail:['门店零售','bag'], study:['教育助教','book']
};
const campuses = {'xiasha':'下沙大学城','zijin':'浙大紫金港','xiaoheshan':'小和山高教园'};
const dayMs = 86400000;
const shanghaiOffset = 8 * 3600000;
const today = () => new Date(Math.floor((Date.now() + shanghaiOffset) / dayMs) * dayMs);
const dayString = date => date.toISOString().slice(0,10);
const timestamp = (day, time) => Date.parse(`${day}T${time}:00+08:00`);
const startOf = job => timestamp(job.date, job.start);
const endOf = job => timestamp(job.date, job.end);
const duration = job => (endOf(job) - startOf(job)) / 3600000;
const money = n => Number(n.toFixed(2)).toString();
const weekdays = '日一二三四五六';
const dateLabel = day => {
  const date = new Date(day + 'T00:00:00Z');
  return `${date.getUTCMonth() + 1}月${date.getUTCDate()}日 周${weekdays[date.getUTCDay()]}`;
};
const shortDate = day => day.slice(5).replace(/^0/,'').replace(/-0?/,'/');
const dateTimeLabel = value => {
  const stamp = new Date(value + shanghaiOffset).toISOString();
  return `${dateLabel(stamp.slice(0,10))} ${stamp.slice(11,16)}`;
};
function weekend(offset = 0) {
  const date = today();
  const day = date.getUTCDay();
  const sundayStillOpen = day === 0 && Date.now() < timestamp(dayString(date), '13:00');
  const saturday = sundayStillOpen ? -1 : (6 - day + 7) % 7;
  date.setUTCDate(date.getUTCDate() + saturday + offset * 7);
  return [dayString(date), dayString(new Date(date.getTime() + dayMs))];
}

const templates = [
  ['coffee','咖啡店周末帮手','松间咖啡',0,0,'10:00','14:00',28,.8,3,false,'协助点单、打包、收台，提供 15 分钟岗前带教。','能连续站立，穿包脚鞋。门店当天仅安排前台协助。','福雷德广场一层','短班带教'],
  ['event','市集签到协助','邻里创意市集',0,1,'13:00','17:00',30,1.6,5,false,'协助核对报名名单、发放摊位证，指引参与者入场。','沟通清晰，提前 10 分钟到岗，穿舒适便鞋。','金沙湖公园东广场','可无经验'],
  ['food','午市餐厅帮工','禾町简餐',0,1,'11:00','15:00',29,1.2,2,true,'协助备餐、分装餐品和午市收台。','上岗时出示有效食品从业人员健康证明，穿防滑包脚鞋。','文泽路商业街','提供工作餐'],
  ['retail','书店陈列整理','折页书店',0,0,'14:00','18:00',26,2.4,3,false,'按书单核对到货，整理书架和活动展台。','能搬动小箱书籍，按店员指引完成陈列。','龙湖金沙天街三层','可无经验'],
  ['study','周末自习室助教','拾光自习室',1,0,'09:00','12:00',33,.6,2,false,'协助签到、维持自习秩序，回答初中阶段数学问题。','具备基础数学答疑能力，现场会先说明答疑范围。','高沙路创意园二层','上午班'],
  ['coffee','周日饮品台协助','松间咖啡',1,1,'14:00','18:00',31,.8,2,true,'按单协助制作简单饮品，保持吧台整洁。','上岗时出示有效食品从业人员健康证明。','福雷德广场一层','短班带教'],
  ['event','展览检票与引导','南岸艺术空间',1,0,'18:00','21:00',35,3.6,4,false,'协助入口验票，引导观众前往不同展厅。','能连续站立，需完成岗前安全说明。','下沙文创园 A 座','晚班'],
  ['retail','生活馆周末理货','青禾生活馆',0,1,'09:00','12:00',25,2.8,2,false,'补货、整理价签并保持货架整洁。','可无经验，能完成轻量搬运。','高沙商业街北区','上午班']
];

function demoJobs() {
  return Object.keys(campuses).flatMap((campus, campusIndex) => {
    const rows = campusIndex === 0 ? templates : templates.slice(0, 6);
    return rows.map((row, index) => {
      const [category,title,shop,week,day,start,end,rate,distance,capacity,health,description,requirements,place,tag] = row;
      const date = weekend(week)[day];
      const startTime = timestamp(date, start);
      const deadline = startTime - (index === 1 ? 5 : 2) * 3600000;
      const address = campusIndex === 0 ? place : `${campuses[campus]}周边商业街 ${index + 1} 号铺`;
      return {
        id:`sample-${campus}-${date}-${index}`, campus, date, category, title, shop, address, start, end, rate, distance,
        capacity, health, description, requirements, tag, deadline, created:startTime - (5 + index % 3) * dayMs,
        payMode:index === 0 || index === 4 ? '完工当日结算' : '完工后 24 小时内结算'
      };
    });
  });
}

const storageKey = 'weekend-campus-shifts-v1';
const initial = {
  campus:'xiasha', saved:[], savedJobs:{}, follows:[], postings:[], applications:{}, seen:[],
  prefs:{configured:false,categories:[],period:'any',distance:3,minRate:0,health:'any',notify:true}
};
let stored = {};
try { stored = JSON.parse(localStorage.getItem(storageKey) || '{}') || {}; } catch {}
let state = {...initial, ...stored, prefs:{...initial.prefs, ...stored.prefs}};
let storageAvailable = true;
function persist() {
  try { localStorage.setItem(storageKey, JSON.stringify(state)); }
  catch { storageAvailable = false; }
}
let view = 'jobs';
let mineTab = 'applications';
let filters = {radius:'3', weekend:'0', q:'', category:'all', sort:'recommended', personalized:state.prefs.configured};
const jobs = () => [...state.postings, ...demoJobs()];
const findJob = id => jobs().find(job => job.id === id) || state.applications[id]?.job || state.savedJobs[id];
const shopKey = job => JSON.stringify([job.campus, job.shop]);
const isFollowing = job => state.follows.some(store => store.key === shopKey(job));
const reserved = job => state.applications[job.id]?.status === 'accepted' ? 1 : 0;
const availability = job => {
  if (job.closed) return '已停止招募';
  if (Date.now() >= startOf(job)) return '班次已开始';
  if (Date.now() >= job.deadline) return '报名已截止';
  if (reserved(job) >= job.capacity) return '名额已满';
  return '';
};
const active = job => !availability(job);
function eligible(job) {
  const p = state.prefs;
  const time = Number(job.start.slice(0,2));
  const period = time < 12 ? 'morning' : time < 17 ? 'afternoon' : 'evening';
  return (!p.categories.length || p.categories.includes(job.category))
    && (p.period === 'any' || p.period === period)
    && job.distance <= p.distance && job.rate >= p.minRate
    && (p.health !== 'none' || !job.health);
}
const periodLabel = {any:'不限时段', morning:'上午开始', afternoon:'下午开始', evening:'傍晚开始'};
const listPref = () => [
  ...state.prefs.categories.map(cat => categories[cat][0]),
  state.prefs.period === 'any' ? '' : periodLabel[state.prefs.period],
  `${state.prefs.distance} 公里内`,
  state.prefs.minRate ? `≥ ¥${state.prefs.minRate}/小时` : '',
  state.prefs.health === 'none' ? '无需健康证' : ''
].filter(Boolean);

function messages() {
  const all = jobs();
  const now = Date.now();
  const result = all.filter(active).flatMap(job => {
    const items = [];
    const followed = isFollowing(job);
    const matched = state.prefs.configured && state.prefs.notify && job.campus === state.campus && eligible(job);
    if (followed || matched) items.push({
      id:`new:${job.id}`, job, time:job.created,
      title:followed && matched ? '关注店铺发布了符合偏好的班次' : followed ? '关注店铺有可报名班次' : '发现符合偏好的班次',
      label:`${job.shop} · ${job.title} · ${dateLabel(job.date)}`
    });
    if (state.saved.includes(job.id) && !state.applications[job.id] && job.deadline - now <= 24 * 3600000) items.push({
      id:`deadline:${job.id}`, job, time:job.deadline - 24 * 3600000, title:'收藏班次即将截止',
      label:`${job.title} · ${dateTimeLabel(job.deadline)} 截止`
    });
    return items;
  });
  for (const entry of Object.values(state.applications)) {
    if (entry.status === 'pending') continue;
    result.push({
      id:`application:${entry.job.id}:${entry.status}`, job:entry.job, time:entry.updated,
      title:entry.status === 'accepted' ? '商家已确认你的班次' : '商家更新了报名结果',
      label:`${entry.job.title} · ${entry.status === 'accepted' ? '已确认' : '未录取'}`
    });
  }
  return result.sort((a,b) => b.time - a.time);
}

function flash(message) {
  clearTimeout(flash.timer);
  toast.textContent = storageAvailable ? message : `${message}（此浏览器无法长期保存）`;
  toast.hidden = false;
  flash.timer = setTimeout(() => { toast.hidden = true; }, 2800);
}

const opts = (items, selected) => Object.entries(items).map(([key,label]) => `<option value="${safe(key)}"${String(selected) === key ? ' selected' : ''}>${safe(label)}</option>`).join('');
const button = (label, action, style = '', glyph = '', id = '') => `<button type="button" class="button ${style}" data-action="${action}"${id ? ` data-id="${safe(id)}"` : ''}>${glyph ? icon(glyph) : ''}${label}</button>`;
const tag = (label, style = '') => `<span class="tag ${style}">${safe(label)}</span>`;
const heading = (title, paragraph) => `<div class="page-banner"><h1>${title}</h1><p>${paragraph}</p></div>`;
const empty = (title, paragraph, action = '') => `<div class="empty"><h3>${title}</h3><p>${paragraph}</p>${action}</div>`;
const tagList = job => `${tag('单次班')}${tag(job.health ? '需健康证' : '无需健康证', job.health ? 'warn' : '')}${job.tag ? tag(job.tag) : ''}`;
const shiftsLabel = job => `${dateLabel(job.date)} ${job.start}–${job.end}`;
const appStatus = {pending:'待商家确认', accepted:'已确认', declined:'未录取'};

function card(job) {
  const saved = state.saved.includes(job.id);
  const closed = availability(job);
  const urgent = !closed && job.deadline - Date.now() < 24 * 3600000;
  const published = !closed && Date.now() - job.created < 24 * 3600000;
  return `<article class="card">
    <div class="card-head"><span class="category-icon ${job.category}">${icon(categories[job.category][1])}</span>
    <span class="status ${closed ? 'closed' : urgent ? 'warn' : ''}">${closed || (urgent ? '即将截止' : published ? '新发布' : job.date >= weekend(1)[0] ? '提前报名' : '可报名')}</span></div>
    <h3><button class="job-title" type="button" data-action="detail" data-id="${job.id}">${safe(job.title)}</button></h3>
    <p class="shop">${safe(job.shop)} · ${categories[job.category][0]}</p>
    <div class="meta"><span>${icon('calendar')}${shiftsLabel(job)} · ${money(duration(job))}小时</span><span>${icon('pin')}${safe(job.address)} · ${job.distance} km</span></div>
    <div class="tags">${tagList(job)}</div>
    <div class="card-foot"><span class="pay"><strong>¥${money(job.rate)}</strong> / 小时</span><div class="card-actions">
      <button type="button" class="icon-btn ${saved ? 'saved' : ''}" data-action="save" data-id="${job.id}" aria-pressed="${saved}" aria-label="${saved ? '取消收藏' : '收藏'}${safe(job.title)}">${icon('heart')}</button>
      ${button('查看班次', 'detail', 'tinted small', 'arrow', job.id)}
    </div></div>
  </article>`;
}

function visibleJobs() {
  const query = filters.q.trim().toLowerCase();
  const [saturday,sunday] = weekend(Number(filters.weekend) || 0);
  return jobs().filter(job => active(job) && job.campus === state.campus && job.distance <= Number(filters.radius)
    && (filters.weekend === 'any' || job.date === saturday || job.date === sunday)
    && (filters.category === 'all' || job.category === filters.category)
    && (!query || `${job.title} ${job.shop} ${job.address} ${categories[job.category][0]}`.toLowerCase().includes(query))
    && (!filters.personalized || eligible(job))
  ).sort((a,b) => {
    if (filters.sort === 'distance') return a.distance - b.distance;
    if (filters.sort === 'rate') return b.rate - a.rate;
    if (filters.sort === 'new') return b.created - a.created;
    return startOf(a) - startOf(b) || a.distance - b.distance;
  });
}

function renderJobs() {
  const display = visibleJobs();
  const recent = weekend();
  const next = weekend(1);
  const tabs = Object.entries({all:['全部'], ...categories}).map(([cat,[label]]) => `<button type="button" class="tab ${filters.category === cat ? 'active' : ''}" aria-pressed="${filters.category === cat}" data-action="category" data-id="${cat}">${label}</button>`).join('');
  const prefs = state.prefs.configured;
  app.innerHTML = `
    <section class="hero" aria-labelledby="hero-title">
      <div class="hero-copy">
        <div class="hero-label">${icon('bolt')} 大学生周末兼职撮合</div>
        <h1 id="hero-title">周末有空？<em>就在附近搭个班。</em></h1>
        <p>找学校周边的单次短班，工时、报酬和上岗要求提前看清。</p>
        <div class="hero-actions">${button('找附近短班','browse','primary','arrow')}${button(prefs ? '编辑兼职偏好' : '设置兼职偏好','prefs','','sliders')}</div>
      </div>
      <div class="hero-image"><img src="hero.webp" alt="在校园附近咖啡店工作的兼职学生" width="1100" height="733"><span class="photo-label">${icon('pin')} 校园周边 · 单次周末班</span></div>
    </section>
    <form id="search-form" class="filter" aria-label="筛选班次">
      <label class="field">所在校区<span class="control">${icon('pin')}<select name="campus">${opts(campuses, state.campus)}</select></span></label>
      <label class="field">通勤距离<span class="control">${icon('target')}<select name="radius">${opts({'1':'1 公里内','3':'3 公里内','5':'5 公里内'}, filters.radius)}</select></span></label>
      <label class="field">班次日期<span class="control">${icon('calendar')}<select name="weekend">${opts({'0':`最近周末 ${shortDate(recent[0])}–${shortDate(recent[1])}`,'1':`下个周末 ${shortDate(next[0])}–${shortDate(next[1])}`,any:'全部周末'}, filters.weekend)}</select></span></label>
      <label class="field query">搜索岗位或店铺<span class="control">${icon('search')}<input name="q" type="search" placeholder="例如 咖啡店、展会" value="${safe(filters.q)}"></span></label>
      <button class="button primary" type="submit">${icon('search')} 搜索班次</button>
    </form>
    <div class="board" id="board">
      <section aria-labelledby="jobs-title">
        <div class="section-head"><div class="title-line"><h2 id="jobs-title" tabindex="-1">周末班次</h2><span class="count" role="status">${display.length} 个班次</span></div>
        <select class="sort" id="sort" aria-label="班次排序">${opts({recommended:'按上岗时间',distance:'距离最近',rate:'时薪最高',new:'最新发布'}, filters.sort)}</select></div>
        <div class="tabs" aria-label="岗位类型">${tabs}
          <button type="button" class="tab personal ${filters.personalized ? 'active' : ''}" aria-pressed="${filters.personalized}" data-action="personalized">${filters.personalized ? '✓ ' : ''}按我的偏好</button>
        </div>
        <div class="cards">${display.length ? display.map(card).join('') : empty('暂无符合条件的班次','试试扩大距离、切换周末，或调整筛选条件。',button('重置筛选','reset','tinted'))}</div>
      </section>
      <aside class="sidebar" aria-label="偏好与提醒">
        <div class="side pref"><h3>${icon('sliders')} 我的兼职偏好</h3>
          ${prefs ? `<div class="tags">${listPref().map(label => tag(label)).join('')}</div>` : '<p>先选好岗位类型、可兼职时段和最低时薪，帮你快速初筛。</p>'}
          ${button(prefs ? '编辑偏好' : '设置我的偏好','prefs','primary','arrow')}
        </div>
        <div class="side"><h3>${icon('bell')} 订阅与提醒</h3><p>关注喜欢的店铺，或订阅符合偏好的班次。收藏的班次即将截止时也会提醒你。</p>
          <button class="text-btn side-link" type="button" data-action="messages">查看站内消息 ${icon('arrow')}</button>
        </div>
      </aside>
    </div>`;
}

function renderMine() {
  const entries = Object.values(state.applications).sort((a,b) => b.updated - a.updated);
  const favorites = state.saved.map(findJob).filter(Boolean);
  const tabs = {applications:`报名记录 · ${entries.length}`, saved:`收藏班次 · ${favorites.length}`};
  app.innerHTML = `<div class="page">${heading('我的班次','查看报名结果、收藏班次和关注的店铺。')}
    <div class="page-layout"><section class="panel">
      <div class="tabs">${Object.entries(tabs).map(([key,label]) => `<button class="tab ${mineTab === key ? 'active' : ''}" data-action="mine-tab" data-id="${key}" aria-pressed="${mineTab === key}">${label}</button>`).join('')}</div>
      ${mineTab === 'applications'
        ? entries.map(entry => `<div class="row"><div><h3>${safe(entry.job.title)} <span class="status ${entry.status === 'declined' ? 'closed' : ''}">${appStatus[entry.status]}</span></h3><p>${safe(entry.job.shop)} · ${shiftsLabel(entry.job)}</p></div><div class="row-actions">${button('查看','detail','small','',entry.job.id)}${entry.status === 'pending' && startOf(entry.job) > Date.now() ? button('撤回报名','withdraw','small','',entry.job.id) : ''}</div></div>`).join('')
          || empty('还没有报名记录','打开班次详情，确认上岗要求后即可报名。',button('去找班次','go-jobs','tinted'))
        : favorites.length ? `<div class="cards">${favorites.map(card).join('')}</div>` : empty('还没有收藏班次','收藏感兴趣的班次，报名截止前 24 小时会有站内提醒。',button('去找班次','go-jobs','tinted'))}
    </section><aside class="panel"><h2>关注店铺</h2>
      ${state.follows.map(store => `<div class="row"><div><h3>${safe(store.shop)}</h3><p>${campuses[store.campus]}</p></div>${button('取消关注','unfollow','small','',store.key)}</div>`).join('') || '<p class="form-note">在班次详情关注店铺，站内消息会显示店铺的新班次。</p>'}
    </aside></div></div>`;
}

function renderMerchant() {
  const listings = state.postings;
  const applicants = Object.values(state.applications).filter(entry => listings.some(job => job.id === entry.job.id));
  app.innerHTML = `<div class="page">
    <div class="page-banner spread"><div><h1>商家工作台</h1><p>发布校园周边的单次周末短班，统一处理学生报名。</p></div>${button('发布周末班次','post','primary','plus')}</div>
    <div class="page-layout">
      <section class="panel"><h2>已发布班次</h2>
        ${listings.map(job => `<div class="row"><div><h3>${safe(job.title)} <span class="status ${availability(job) ? 'closed' : ''}">${availability(job) || '招募中'}</span></h3><p>${safe(job.shop)} · ${shiftsLabel(job)} · 已确认 ${reserved(job)}/${job.capacity} 人</p></div><div class="row-actions">${button('查看','detail','small','',job.id)}${active(job) ? button('停止招募','close-job','small','',job.id) : ''}</div></div>`).join('') ||
          empty('还没有发布班次','填好地点、班次和上岗要求后，就能在找兼职页面看到。',button('发布第一个班次','post','tinted','plus'))}
      </section>
      <aside class="panel"><h2>学生报名</h2>${applicants.map(entry => `<div class="row"><div><h3>${safe(entry.name)} · ${appStatus[entry.status]}</h3><p>${safe(entry.job.title)}</p></div>${entry.status === 'pending' && startOf(entry.job) > Date.now() ? `<div class="row-actions">${button('确认','decision','primary small','',entry.job.id)}${button('婉拒','decline','small','',entry.job.id)}</div>` : ''}</div>`).join('') || '<p class="form-note">学生报名后，会在这里显示待处理记录。</p>'}</aside>
    </div>
  </div>`;
}

function refresh() {
  if (view === 'jobs') renderJobs();
  else if (view === 'mine') renderMine();
  else renderMerchant();
  for (const button of document.querySelectorAll('.main-nav [data-view]')) {
    const selected = button.dataset.view === view;
    button.classList.toggle('current', selected);
    if (selected) button.setAttribute('aria-current', 'page');
    else button.removeAttribute('aria-current');
  }
  const unread = messages().filter(item => !state.seen.includes(item.id)).length;
  document.querySelector('#unread').hidden = !unread;
  document.querySelector('.inbox-btn').setAttribute('aria-label', unread ? `消息提醒，${unread} 条未读` : '消息提醒');
}

function changeView(next) {
  view = next;
  refresh();
  window.scrollTo({top:0, behavior:'instant'});
}

function showDialog(title, html) {
  dialog.innerHTML = `<div class="dialog-head"><h2 id="dialog-title">${safe(title)}</h2><button type="button" class="icon-btn" data-action="close" aria-label="关闭">${icon('close')}</button></div><div class="dialog-body">${html}</div>`;
  if (!dialog.open) dialog.showModal();
  dialog.scrollTop = 0;
}

function showPrefs() {
  const p = state.prefs;
  const checkboxes = Object.entries(categories).map(([key,[label]]) => `<label class="check"><input type="checkbox" name="category" value="${key}" ${p.categories.includes(key) ? 'checked' : ''}>${label}</label>`).join('');
  showDialog('设置兼职偏好', `<form id="prefs-form" class="dialog-form">
    <div class="field">感兴趣的岗位类型<div class="check-options">${checkboxes}</div><span class="form-note">可多选，留空则匹配全部类型。</span></div>
    <div class="form-grid">
      <label class="field">可上岗时段<select name="period">${opts(periodLabel, p.period)}</select></label>
      <label class="field">通勤距离上限<select name="distance">${opts({'1':'1 公里内','3':'3 公里内','5':'5 公里内'}, p.distance)}</select></label>
      <label class="field">最低时薪（元）<input type="number" name="minRate" min="0" max="999" step="1" value="${p.minRate}" required></label>
      <label class="field">健康证要求<select name="health">${opts({any:'不限',none:'只看无需健康证'}, p.health)}</select></label>
    </div>
    <label class="check"><input type="checkbox" name="notify" ${p.notify ? 'checked' : ''}>接收符合偏好的班次提醒</label>
    <p class="form-note">保存后会对所选校区的班次应用初筛。匹配消息可在右上角铃铛中查看。</p>
    <div class="dialog-actions"><button type="submit" class="button primary">${icon('check')} 保存并应用</button>${button('取消','close')}</div>
  </form>`);
}

function showDetail(job) {
  if (!job) return;
  const entry = state.applications[job.id];
  const blocked = availability(job);
  const saved = state.saved.includes(job.id);
  const followed = isFollowing(job);
  showDialog('班次详情', `<div class="stack">
    <div class="detail-summary"><h3>${safe(job.title)}</h3><p class="shop">${safe(job.shop)} · ${campuses[job.campus]} · ${categories[job.category][0]}</p>
      <div class="meta"><span>${icon('calendar')}${shiftsLabel(job)} · ${money(duration(job))}小时</span><span>${icon('pin')}${safe(job.address)} · 距校区 ${job.distance} km</span><span>${icon('clock')}${dateTimeLabel(job.deadline)} 截止报名</span></div>
      <div class="tags">${tagList(job)}</div>
    </div>
    <section class="detail-section"><h3>工作内容</h3><p>${safe(job.description)}</p></section>
    <section class="detail-section"><h3>上岗要求</h3><p>${safe(job.requirements)}</p></section>
    <div class="requirement ${job.health ? 'warn' : ''}">${job.health ? '需要健康证 · 上岗时请携带有效健康证明' : '无需健康证 · 可按上方要求准备'}</div>
    <section class="detail-section"><h3>报酬与名额</h3><p>¥${money(job.rate)}/小时 · 预计 ¥${money(job.rate * duration(job))}/班 · ${safe(job.payMode)}<br>剩余 ${Math.max(0, job.capacity - reserved(job))} 个名额</p></section>
    <div class="dialog-actions">
      ${entry ? `<span class="status">${appStatus[entry.status]}</span>` : blocked ? `<span class="status closed">${blocked}</span>` : button('报名此班次','apply','primary','arrow',job.id)}
      ${button(saved ? '已收藏' : '收藏班次','save',saved ? 'tinted' : '', 'heart',job.id)}
      ${button(followed ? '已关注店铺' : '关注店铺','follow',followed ? 'tinted' : '', 'bell',job.id)}
    </div>
  </div>`);
}

function showApply(job) {
  if (!job || !active(job) || state.applications[job.id]) return;
  showDialog('确认报名', `<form class="dialog-form" id="apply-form" data-id="${job.id}">
    <div class="detail-summary"><h3>${safe(job.title)}</h3><p class="shop">${safe(job.shop)} · ${shiftsLabel(job)}</p></div>
    <label class="field">报名昵称<input name="name" maxlength="24" placeholder="例如 小林" required></label>
    <label class="check"><input type="checkbox" required>${job.health ? '我能在上岗时出示有效健康证，并能按时到岗' : '我已了解上岗要求，并能按时到岗'}</label>
    <p class="form-note">报名后可在「我的班次」查看确认状态。演示可使用昵称。</p>
    <div class="form-error" role="alert" hidden></div>
    <div class="dialog-actions"><button type="submit" class="button primary">提交报名</button>${button('返回详情','detail','','',job.id)}</div>
  </form>`);
}

function showMessages() {
  const alerts = messages();
  const unread = alerts.some(item => !state.seen.includes(item.id));
  showDialog('站内消息', `<div class="stack">
    <div class="spread"><p class="form-note">偏好匹配、店铺班次、截止时间和报名结果</p>${unread ? button('全部标为已读','mark-read','small') : ''}</div>
    <div>${alerts.map(item => `<div class="row"><div><h3>${!state.seen.includes(item.id) ? '<span class="message-new" aria-label="未读"></span>' : ''}${item.title}</h3><p>${safe(item.label)}</p></div><button type="button" class="button small" data-action="open-message" data-id="${safe(item.id)}">查看</button></div>`).join('')
      || empty('暂无消息','设置偏好或关注店铺，符合条件的班次会出现在这里。',button('设置兼职偏好','prefs','tinted','sliders'))}</div>
  </div>`);
}

function showPost() {
  showDialog('发布周末班次', `<form class="dialog-form" id="post-form">
    <div class="form-grid">
      <label class="field">店铺名称<input name="shop" maxlength="30" placeholder="例如 松间咖啡" required></label>
      <label class="field">岗位名称<input name="title" maxlength="30" placeholder="例如 周六咖啡店帮手" required></label>
      <label class="field">岗位类型<select name="category">${opts(Object.fromEntries(Object.entries(categories).map(([key,[label]]) => [key,label])), 'coffee')}</select></label>
      <label class="field">附近校区<select name="campus">${opts(campuses,state.campus)}</select></label>
      <label class="field">工作地点<input name="address" maxlength="50" placeholder="街道或商圈 + 门店地址" required></label>
      <label class="field">距校区（公里）<input type="number" name="distance" min="0" max="5" step="0.1" placeholder="0–5" required></label>
      <label class="field">上岗日期（仅周六或周日）<input type="date" name="date" min="${dayString(today())}" value="${weekend()[0]}" required></label>
      <label class="field">报名截止（北京时间）<input type="datetime-local" name="deadline" required></label>
      <label class="field">开始时间<input type="time" name="start" value="10:00" required></label>
      <label class="field">结束时间<input type="time" name="end" value="14:00" required></label>
      <label class="field">时薪（元）<input type="number" name="rate" min="1" max="999" step="0.5" placeholder="28" required></label>
      <label class="field">招募人数<input type="number" name="capacity" min="1" max="99" step="1" value="2" required></label>
      <label class="field">健康证要求<select name="health" required><option value="">请选择</option><option value="no">无需健康证</option><option value="yes">需要健康证</option></select></label>
      <label class="field">结算方式<select name="payMode">${opts({'完工当日结算':'完工当日结算','完工后 24 小时内结算':'完工后 24 小时内结算'},'')}</select></label>
      <label class="field wide">工作内容<textarea name="description" maxlength="400" placeholder="说明该班次需要做的工作" required></textarea></label>
      <label class="field wide">其他上岗要求<textarea name="requirements" maxlength="400" placeholder="例如经验、服装、到店时间。没有可填「无额外要求」" required></textarea></label>
    </div>
    <p class="form-note">单次班次限周末当天，地点距校区 5 公里内。建议尽早发布，方便学生提前安排。</p>
    <div class="form-error" role="alert" hidden></div>
    <div class="dialog-actions"><button type="submit" class="button primary">发布班次</button>${button('取消','close')}</div>
  </form>`);
}

function formError(form, message) {
  const node = form.querySelector('.form-error');
  node.hidden = false;
  node.textContent = message;
}

function savePost(form, values) {
  const job = Object.fromEntries([...values].map(([key,value]) => [key,value.trim()]));
  if (!['title','shop','address','description','requirements'].every(field => job[field])) {
    formError(form, '请填写店铺、岗位、地点、工作内容与上岗要求。');
    return;
  }
  const day = new Date(job.date + 'T00:00:00Z').getUTCDay();
  const deadline = Date.parse(job.deadline + ':00+08:00');
  const length = duration(job);
  if (day !== 0 && day !== 6) return formError(form,'请选择周六或周日的日期。');
  if (length <= 0 || length > 8) return formError(form,'请选择同一天内不超过 8 小时的班次，结束须晚于开始。');
  if (!Number.isFinite(deadline) || deadline <= Date.now() || deadline >= startOf(job)) return formError(form,'报名截止须晚于现在，并早于班次开始。');
  state.postings.unshift({
    ...job, id:'job-' + (crypto.randomUUID?.() || Date.now()), created:Date.now(), deadline,
    distance:Number(job.distance), rate:Number(job.rate), capacity:Number(job.capacity), health:job.health === 'yes'
  });
  persist();
  dialog.close();
  refresh();
  flash('班次已发布，可在对应校区的兼职列表查看');
}

document.addEventListener('submit', event => {
  const form = event.target;
  event.preventDefault();
  const data = new FormData(form);
  if (form.id === 'search-form') {
    state.campus = data.get('campus');
    Object.assign(filters, {radius:data.get('radius'), weekend:data.get('weekend'), q:data.get('q')});
    persist();
    refresh();
    browse();
  } else if (form.id === 'prefs-form') {
    state.prefs = {
      configured:true, categories:data.getAll('category'), period:data.get('period'), distance:Number(data.get('distance')),
      minRate:Number(data.get('minRate')), health:data.get('health'), notify:data.has('notify')
    };
    filters.personalized = true;
    filters.radius = String(state.prefs.distance);
    persist();
    dialog.close();
    if (view === 'jobs') refresh();
    else changeView('jobs');
    browse();
    flash('偏好已保存');
  } else if (form.id === 'apply-form') {
    const job = findJob(form.dataset.id);
    const name = data.get('name').trim();
    if (!name) return formError(form,'请填写报名昵称。');
    if (!job || !active(job) || state.applications[job.id]) return formError(form,'该班次当前无法报名，请刷新班次状态。');
    state.applications[job.id] = {job,name,status:'pending',updated:Date.now()};
    persist();
    dialog.close();
    changeView('mine');
    mineTab = 'applications';
    refresh();
    flash('报名已提交，等待商家确认');
  } else if (form.id === 'post-form') savePost(form, data);
});

function browse() {
  const title = document.querySelector('#jobs-title');
  title?.focus({preventScroll:true});
  document.querySelector('#board')?.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',block:'start'});
}

function toggleSaved(job) {
  if (!job) return;
  const wasSaved = state.saved.includes(job.id);
  if (wasSaved) {
    state.saved = state.saved.filter(id => id !== job.id);
    delete state.savedJobs[job.id];
  } else {
    state.saved.push(job.id);
    state.savedJobs[job.id] = job;
  }
  persist();
  refresh();
  if (dialog.open) showDetail(job);
  flash(wasSaved ? '已取消收藏' : '已收藏班次');
}

function toggleFollow(job) {
  if (!job) return;
  const key = shopKey(job);
  const followed = isFollowing(job);
  if (followed) state.follows = state.follows.filter(store => store.key !== key);
  else state.follows.push({key, shop:job.shop, campus:job.campus});
  persist();
  refresh();
  showDetail(job);
  flash(followed ? '已取消关注' : '已关注店铺，可在站内消息查看班次');
}

function decide(id, status) {
  const entry = state.applications[id];
  const listing = state.postings.find(job => job.id === id);
  if (!entry || !listing || entry.status !== 'pending' || startOf(listing) <= Date.now()) return;
  if (status === 'accepted' && reserved(listing) >= listing.capacity) return flash('当前班次已满');
  entry.status = status;
  entry.updated = Date.now();
  persist();
  refresh();
  flash(status === 'accepted' ? '已确认报名' : '已更新报名结果');
}

document.addEventListener('change', event => {
  const control = event.target;
  if (control.id === 'sort') {
    filters.sort = control.value;
    refresh();
    document.querySelector('#sort')?.focus();
  }
});

document.addEventListener('click', event => {
  const control = event.target.closest('button');
  if (!control || control.disabled) return;
  if (control.dataset.view) return changeView(control.dataset.view);
  const {action,id} = control.dataset;
  if (!action) return;
  if (action === 'browse') return browse();
  if (action === 'go-jobs') return changeView('jobs');
  if (action === 'close') return dialog.close();
  if (action === 'prefs') return showPrefs();
  if (action === 'post') return showPost();
  if (action === 'messages') return showMessages();
  if (action === 'mine-tab') {
    mineTab = id;
    return refresh();
  }
  if (action === 'category') {
    filters.category = id;
    refresh();
    return document.querySelector(`[data-action="category"][data-id="${id}"]`)?.focus();
  }
  if (action === 'reset') {
    filters = {radius:'3', weekend:'any', q:'', category:'all', sort:'recommended', personalized:false};
    refresh();
    return browse();
  }
  if (action === 'personalized') {
    if (!state.prefs.configured) return showPrefs();
    filters.personalized = !filters.personalized;
    refresh();
    return document.querySelector('[data-action="personalized"]')?.focus();
  }
  if (action === 'mark-read') {
    state.seen = [...new Set([...state.seen, ...messages().map(item => item.id)])];
    persist();
    refresh();
    return showMessages();
  }
  if (action === 'open-message') {
    const item = messages().find(entry => entry.id === id);
    if (!item) return showMessages();
    state.seen = [...new Set([...state.seen, id])];
    persist();
    refresh();
    return showDetail(findJob(item.job.id));
  }
  if (action === 'unfollow') {
    state.follows = state.follows.filter(store => store.key !== id);
    persist();
    refresh();
    return flash('已取消关注');
  }
  if (action === 'withdraw') {
    if (state.applications[id]?.status !== 'pending') return;
    delete state.applications[id];
    persist();
    refresh();
    return flash('已撤回报名');
  }
  if (action === 'decision' || action === 'decline') return decide(id, action === 'decision' ? 'accepted' : 'declined');
  const job = findJob(id);
  if (action === 'save') return toggleSaved(job);
  if (action === 'detail') return showDetail(job);
  if (action === 'apply') return showApply(job);
  if (action === 'follow') return toggleFollow(job);
  if (action === 'close-job' && job && state.postings.includes(job)) {
    job.closed = true;
    persist();
    refresh();
    flash('已停止招募');
  }
});

refresh();
