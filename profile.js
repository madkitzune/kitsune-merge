/* =====================================================================
   PROFILE — профіль гравця: ім'я, аватар, статистика, перенесення прогресу.
   Також: збереження не губиться (persist storage) і навчання продовжується з місця.
   Підключається після game.js.
   ===================================================================== */
(() => {
  /* --- переклади для цього модуля --- */
  [
    ['Профіль', 'Профиль', 'Profile'],
    ['Лисеня', 'Лисёнок', 'Little Fox'],
    ['Ім’я', 'Имя', 'Name'],
    ['Аватар', 'Аватар', 'Avatar'],
    ['Рівень {n}', 'Уровень {n}', 'Level {n}'],
    ['Статистика', 'Статистика', 'Stats'],
    ['Будівлі храму', 'Здания храма', 'Temple buildings'],
    ['Замовлень', 'Заказов', 'Orders'],
    ['Злиттів', 'Слияний', 'Merges'],
    ['Днів у грі', 'Дней в игре', 'Days played'],
    ['Час гри', 'Время в игре', 'Play time'],
    ['{n} хв', '{n} мин', '{n} min'],
    ['Улюбленців', 'Питомцев', 'Pets'],
    ['Макс. комбо', 'Макс. комбо', 'Best combo'],
    ['Налаштування', 'Настройки', 'Settings'],
    ['Перенести прогрес', 'Перенести прогресс', 'Transfer progress'],
    ['Скопіюй код і встав його на іншому пристрої (або в застосунку на головному екрані).', 'Скопируй код и вставь его на другом устройстве (или в приложении на главном экране).', 'Copy the code and paste it on another device (or in the home-screen app).'],
    ['Скопіювати код', 'Скопировать код', 'Copy code'],
    ['Код скопійовано', 'Код скопирован', 'Code copied'],
    ['Вставити код', 'Вставить код', 'Paste code'],
    ['Завантажити', 'Загрузить', 'Load'],
    ['Поточний прогрес на цьому пристрої буде замінено.', 'Текущий прогресс на этом устройстве будет заменён.', 'Progress on this device will be replaced.'],
    ['Код не підходить', 'Код не подходит', 'This code does not work'],
    ['Прогрес збережено на пристрої', 'Прогресс сохранён на устройстве', 'Progress is saved on this device'],
  ].forEach(([uk, ru, en]) => { I18N.uk[uk] = uk; I18N.ru[uk] = ru; I18N.en[uk] = en; });

  /* --- дані профілю у збереженні (старі сейви без поля теж працюють) --- */
  const P = () => (S.profile ||= { name: '', ava: 'hoshi' });
  const avaSrc = id => id === 'hoshi' ? (HOSHI.base || '') : (PETART[id] || '');

  /* --- браузер не стиратиме сховище сам (особливо на телефонах) --- */
  try { navigator.storage && navigator.storage.persist && navigator.storage.persist(); } catch (e) { }

  /* --- навчання продовжується з того кроку, де гравець зупинився --- */
  const baseStart = startTutorial;
  startTutorial = function (from) {
    const step = Number.isInteger(from) ? from : (S.tut > 0 && S.tut < TUTORIAL.length ? S.tut : 0);
    if (step <= 0) return baseStart();
    S.tut = step;
    render();
    track('tutorial_resume', { step });
    story(TUTORIAL.slice(step), () => { S.tut = TUTORIAL.length; track('tutorial_done', {}); save(); afterStart(); });
  };
  /* --- аватар у верхній панелі --- */
  function paintAvatar() {
    const box = document.querySelector('.ava-img span');
    const src = avaSrc(P().ava) || HOSHI.base;
    if (!box || !src || box.dataset.src === src) return;
    box.dataset.src = src;
    box.innerHTML = `<img src="${src}" alt="" style="width:100%;height:100%;object-fit:cover;object-position:50% 14%;border-radius:50%">`;
  }
  const baseRender = render;
  render = function (...a) { baseRender(...a); paintAvatar(); };

  /* --- екран профілю --- */
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  function profile() {
    const p = P(), st = S.stats;
    const own = Object.keys(PETS).filter(id => PS().own[id]);
    const avas = ['hoshi', ...own].filter(avaSrc);
    const play = Math.round((st.playMs + (now() - sessionStart)) / 60000);
    const stat = (k, v) => `<div class="pf-st"><b>${v}</b><small>${T(k)}</small></div>`;
    modal(hdr('🦊', T('Профіль'), T('Рівень {n}', { n: S.lv })) + `
      <div class="pf-head">
        <div class="pf-ava"><img src="${avaSrc(p.ava) || HOSHI.base}" alt=""></div>
        <label class="pf-name"><small>${T('Ім’я')}</small>
          <input id="pfName" maxlength="16" value="${esc(p.name)}" placeholder="${T('Лисеня')}"></label>
      </div>
      <h3>${T('Аватар')}</h3>
      <div class="pf-avas">${avas.map(id => `<button class="pf-a${p.ava === id ? ' on' : ''}" onclick="setAva('${id}')"><img src="${avaSrc(id)}" alt=""></button>`).join('')}</div>
      <h3>${T('Статистика')}</h3>
      <div class="pf-grid">
        ${stat('Будівлі храму', `${S.temple}/${TEMPLE.length}`)}${stat('Замовлень', st.orders)}${stat('Злиттів', st.merges)}
        ${stat('Днів у грі', st.days.length)}${stat('Час гри', T('{n} хв', { n: play }))}${stat('Улюбленців', own.length)}
      </div>
      <small class="pf-note">✓ ${T('Прогрес збережено на пристрої')}</small>
      <div class="pf-btns">
        <button onclick="transfer()">${T('Перенести прогрес')}</button>
        <button onclick="settings()">⚙️ ${T('Налаштування')}</button>
      </div>`);
    const inp = $('pfName');
    inp.addEventListener('change', () => { P().name = inp.value.trim().slice(0, 16); save(); track('profile_name', {}); });
  }
  window.setAva = id => { P().ava = id; save(); track('profile_avatar', { id }); paintAvatar(); profile(); };

  /* --- перенесення прогресу кодом (без сервера) --- */
  const encode = () => btoa(unescape(encodeURIComponent(JSON.stringify(S))));
  const decode = c => JSON.parse(decodeURIComponent(escape(atob(c.trim()))));
  window.transfer = () => {
    modal(hdr('📜', T('Перенести прогрес')) + `
      <p class="pf-tip">${T('Скопіюй код і встав його на іншому пристрої (або в застосунку на головному екрані).')}</p>
      <textarea id="pfOut" readonly rows="3">${encode()}</textarea>
      <button class="main pf-wide" onclick="copySave()">${T('Скопіювати код')}</button>
      <h3>${T('Вставити код')}</h3>
      <textarea id="pfIn" rows="3"></textarea>
      <button class="pf-wide" onclick="loadSave()">${T('Завантажити')}</button>`);
  };
  window.copySave = async () => {
    const t = $('pfOut');
    try { await navigator.clipboard.writeText(t.value); } catch (e) { t.select(); document.execCommand('copy'); }
    toast(T('Код скопійовано'));
  };
  window.loadSave = () => {
    let s;
    try { s = decode($('pfIn').value); if (!s || !Array.isArray(s.board)) throw 0; } catch (e) { toast(T('Код не підходить')); return; }
    confirmM(T('Поточний прогрес на цьому пристрої буде замінено.'), () => {
      window.__reset = true; // не дати поточному стану перезаписати новий
      localStorage.setItem(KEY, JSON.stringify(s));
      location.reload();
    });
  };

  window.profile = profile;
  /* аватар відкриває профіль; налаштування — шестерня і кнопка в профілі */
  const ava = document.querySelector('.ava');
  if (ava) ava.onclick = () => profile();
  paintAvatar();
})();
