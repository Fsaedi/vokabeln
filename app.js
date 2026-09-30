let words = [];
let currentWords = [];
let editingId = null;

async function loadWords() {
  const saved = localStorage.getItem('vocabWords');
  if (saved) {
    words = JSON.parse(saved);
    return;
  }
  const res = await fetch('words.json');
  words = await res.json();
  saveWords();
}

function saveWords() {
  localStorage.setItem('vocabWords', JSON.stringify(words));
}

function getRandomWords(count) {
  const shuffled = [...words].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

function renderHome() {
  document.getElementById('app').innerHTML = `
    <div class="bar"><span>دیکشنری من</span></div>
    <div class="count-box">
      <div class="num">${words.length}</div>
      <div>لغت ذخیره شده</div>
    </div>
    <button class="btn-primary" id="randomBtn">۱۰ لغت تصادفی</button>
    <button class="btn-secondary" id="addBtn">افزودن لغت جدید</button>
  `;
  document.getElementById('randomBtn').onclick = () => {
    currentWords = getRandomWords(10);
    renderList();
  };
  document.getElementById('addBtn').onclick = () => renderForm();
}

function renderList() {
  const cards = currentWords.map(w => `
    <div class="card" data-id="${w.id}">
      <div class="w">${w.word}</div>
      <div class="sp">${w.spelling}</div>
      <div class="m">${w.meaning}</div>
      <div class="e">${w.example}</div>
    </div>
  `).join('');
  document.getElementById('app').innerHTML = `
    <div class="bar"><span id="backBtn">→</span><span>۱۰ لغت</span><span></span></div>
    ${cards}
    <button class="btn-primary" id="refreshBtn">۱۰ لغت جدید</button>
  `;
  document.getElementById('backBtn').onclick = renderHome;
  document.getElementById('refreshBtn').onclick = () => {
    currentWords = getRandomWords(10);
    renderList();
  };
  document.querySelectorAll('.card').forEach(card => {
    card.onclick = () => {
      const id = Number(card.dataset.id);
      const w = words.find(x => x.id === id);
      renderForm(w);
    };
  });
}

function renderForm(word) {
  editingId = word ? word.id : null;
  document.getElementById('app').innerHTML = `
    <div class="bar"><span id="backBtn">→</span><span>${word ? 'ویرایش لغت' : 'افزودن لغت'}</span><span></span></div>
    <label>لغت آلمانی</label>
    <input id="fWord" value="${word ? word.word : ''}">
    <label>هجی</label>
    <input id="fSpelling" value="${word ? word.spelling : ''}">
    <label>معنی انگلیسی</label>
    <input id="fMeaning" value="${word ? word.meaning : ''}">
    <label>جمله مثال</label>
    <textarea id="fExample" rows="3">${word ? word.example : ''}</textarea>
    <button class="btn-primary" id="saveBtn">ذخیره</button>
  `;
  document.getElementById('backBtn').onclick = renderHome;
  document.getElementById('saveBtn').onclick = saveForm;
}

function saveForm() {
  const wordVal = document.getElementById('fWord').value.trim();
  const spelling = document.getElementById('fSpelling').value.trim();
  const meaning = document.getElementById('fMeaning').value.trim();
  const example = document.getElementById('fExample').value.trim();

  if (!wordVal) return;

  if (editingId !== null) {
    const target = words.find(w => w.id === editingId);
    target.word = wordVal;
    target.spelling = spelling;
    target.meaning = meaning;
    target.example = example;
  } else {
    const nextId = words.length ? Math.max(...words.map(w => w.id)) + 1 : 1;
    words.push({ id: nextId, word: wordVal, spelling, meaning, example });
  }

  saveWords();
  renderHome();
}

loadWords().then(renderHome);