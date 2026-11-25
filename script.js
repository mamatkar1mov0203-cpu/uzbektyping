const WORDS = [
  'bugun', 'yaxshi', 'kun', 'yangi', 'fikr', 'bilim', 'kitob', 'dunyo', 'kelajak', 'orzu',
  'mehnat', 'do‘st', 'oila', 'tabiat', 'go‘zal', 'yurak', 'quvonch', 'yulduz', 'bahor', 'tong',
  'daraxt', 'hayot', 'vaqt', 'shahar', 'qishloq', 'ona', 'til', 'xalq', 'tarix', 'san’at',
  'sayohat', 'maqsad', 'umid', 'sabr', 'mehr', 'yordam', 'ijod', 'muvaffaqiyat', 'qadam', 'harakat',
  'tabassum', 'quyosh', 'osmon', 'yomg‘ir', 'daryo', 'tog‘', 'dengiz', 'gul', 'rang', 'shamol',
  'o‘rganish', 'yaratish', 'o‘qish', 'yozish', 'gap', 'so‘z', 'jumla', 'harf', 'ma’no', 'talaffuz',
  'tezlik', 'aniqlik', 'mashq', 'mahorat', 'diqqat', 'e’tibor', 'natija', 'tajriba', 'yo‘l', 'imkon',
  'dastur', 'texnologiya', 'kompyuter', 'internet', 'dizayn', 'ekran', 'klaviatura', 'tugma', 'sahifa', 'rang',
  'o‘zbekiston', 'toshkent', 'samarqand', 'buxoro', 'andijon', 'farg‘ona', 'xorazm', 'navoiy', 'qadriyat', 'madaniyat',
  'har', 'bir', 'inson', 'o‘z', 'yo‘lida', 'oldinga', 'intiladi', 'va', 'orzu', 'qiladi',
  'kichik', 'qadamlar', 'katta', 'o‘zgarishlarga', 'olib', 'keladi', 'shuning', 'uchun', 'davom', 'eting'
];
const PUNCTUATION = [',', '.', '!', '?', ';', ':'];
const $ = (id) => document.getElementById(id);
const wordsEl = $('words');
const input = $('typingInput');
const textWindow = $('textWindow');
const startHint = $('startHint');
const timeChoices = $('timeChoices');
const wordChoices = $('wordChoices');
const state = { mode: 'time', duration: 15, wordCount: 10, punctuation: false, words: [], typed: '', started: false, finished: false, remaining: 15, timerId: null, startedAt: 0 };

function makeWords(count) {
  const result = [];
  for (let i = 0; i < count; i++) {
    let word = WORDS[Math.floor(Math.random() * WORDS.length)];
    if (state.punctuation && i > 0 && Math.random() < 0.18) word += PUNCTUATION[Math.floor(Math.random() * PUNCTUATION.length)];
    result.push(word);
  }
  return result;
}
function targetLength() { return state.mode === 'time' ? 100 : state.wordCount; }
function resetTest() {
  clearInterval(state.timerId);
  state.words = makeWords(targetLength());
  state.typed = '';
  state.started = false;
  state.finished = false;
  state.remaining = state.duration;
  state.startedAt = 0;
  $('timer').textContent = state.mode === 'time' ? state.duration : state.wordCount;
  $('timerLabel').textContent = state.mode === 'time' ? 'V A Q T' : 'S O‘ Z';
  $('liveWpm').textContent = '0';
  $('results').classList.add('hidden');
  $('testArea').classList.remove('hidden');
  startHint.classList.remove('hidden');
  renderWords();
}
function renderWords() {
  const typed = state.typed;
  wordsEl.innerHTML = '';
  state.words.forEach((word, wordIndex) => {
    const wordSpan = document.createElement('span');
    wordSpan.className = 'word';
    const offset = state.words.slice(0, wordIndex).reduce((sum, item) => sum + item.length + 1, 0);
    for (let i = 0; i < word.length; i++) {
      const letter = document.createElement('span');
      letter.className = 'letter';
      const typedIndex = offset + i;
      if (typedIndex < typed.length) letter.classList.add(typed[typedIndex] === word[i] ? 'correct' : 'incorrect');
      if (typedIndex === typed.length && !state.finished) letter.classList.add('current');
      letter.textContent = word[i];
      wordSpan.appendChild(letter);
    }
    if (typed.length > offset + word.length) wordSpan.classList.add('complete');
    wordsEl.appendChild(wordSpan);
  });
  const current = wordsEl.querySelector('.letter.current');
  if (current) {
    const top = current.offsetTop;
    if (top > 52) wordsEl.style.transform = `translateY(-${top - 52}px)`;
    else wordsEl.style.transform = 'translateY(0)';
  }
}
function beginTest() {
  if (state.started || state.finished) return;
  state.started = true;
  state.startedAt = Date.now();
  startHint.classList.add('hidden');
  if (state.mode === 'time') {
    state.timerId = setInterval(() => {
      state.remaining = Math.max(0, state.duration - Math.floor((Date.now() - state.startedAt) / 1000));
      $('timer').textContent = state.remaining;
      updateLiveWpm();
      if (state.remaining <= 0) finishTest();
    }, 100);
  }
}
function updateLiveWpm() {
  const elapsedMinutes = Math.max((Date.now() - state.startedAt) / 60000, 1 / 60);
  const correct = countCorrect();
  $('liveWpm').textContent = Math.round((correct / 5) / elapsedMinutes);
}
function countCorrect() {
  let correct = 0;
  for (let i = 0; i < Math.min(state.typed.length, state.words.join(' ').length); i++) {
    if (state.typed[i] === state.words.join(' ')[i]) correct++;
  }
  return correct;
}
function finishTest() {
  if (state.finished) return;
  state.finished = true;
  clearInterval(state.timerId);
  const target = state.words.join(' ');
  let correct = 0;
  let errors = 0;
  for (let i = 0; i < state.typed.length; i++) {
    if (i < target.length && state.typed[i] === target[i]) correct++;
    else errors++;
  }
  const elapsedMinutes = Math.max((Date.now() - state.startedAt) / 60000, 1 / 60);
  const wpm = Math.round((correct / 5) / elapsedMinutes);
  const accuracy = state.typed.length ? Math.round((correct / state.typed.length) * 100) : 100;
  $('resultWpm').textContent = wpm;
  $('resultAccuracy').textContent = accuracy;
  $('resultCorrect').textContent = correct;
  $('resultErrors').textContent = errors;
  $('testArea').classList.add('hidden');
  $('results').classList.remove('hidden');
}
function handleInput() {
  if (state.finished) return;
  const raw = input.value.replace(/\n/g, '');
  if (!state.started && raw.length) beginTest();
  const maxLength = state.words.join(' ').length;
  state.typed = raw.slice(0, maxLength);
  renderWords();
  updateLiveWpm();
  if (state.mode === 'words' && state.typed.trim().split(/\s+/).length >= state.wordCount && state.typed.trim().length) finishTest();
  if (state.mode === 'time' && state.typed.length >= maxLength) {
    state.words = state.words.concat(makeWords(50));
    renderWords();
  }
}
function focusInput() { if (!state.finished) input.focus({ preventScroll: true }); }

document.querySelectorAll('[data-mode]').forEach((button) => button.addEventListener('click', () => {
  state.mode = button.dataset.mode;
  document.querySelectorAll('[data-mode]').forEach((item) => item.classList.toggle('selected', item === button));
  timeChoices.classList.toggle('hidden', state.mode !== 'time');
  wordChoices.classList.toggle('hidden', state.mode !== 'words');
  resetTest();
}));
document.querySelectorAll('#timeChoices .choice').forEach((button) => button.addEventListener('click', () => {
  state.duration = Number(button.dataset.value);
  document.querySelectorAll('#timeChoices .choice').forEach((item) => item.classList.toggle('selected', item === button));
  resetTest();
}));
document.querySelectorAll('#wordChoices .choice').forEach((button) => button.addEventListener('click', () => {
  state.wordCount = Number(button.dataset.value);
  document.querySelectorAll('#wordChoices .choice').forEach((item) => item.classList.toggle('selected', item === button));
  resetTest();
}));
$('punctuationToggle').addEventListener('click', (event) => {
  state.punctuation = !state.punctuation;
  event.currentTarget.classList.toggle('selected', state.punctuation);
  event.currentTarget.setAttribute('aria-pressed', String(state.punctuation));
  resetTest();
});
$('restartButton').addEventListener('click', resetTest);
$('resultRestart').addEventListener('click', () => { resetTest(); focusInput(); });
textWindow.addEventListener('click', focusInput);
textWindow.addEventListener('keydown', focusInput);
input.addEventListener('input', handleInput);
document.addEventListener('keydown', (event) => {
  if (event.key === 'Tab' && !event.ctrlKey && !event.metaKey) {
    event.preventDefault();
    if (event.shiftKey) return;
    window.tabPressed = true;
    setTimeout(() => { window.tabPressed = false; }, 700);
  } else if (event.key === 'Enter' && window.tabPressed) {
    event.preventDefault();
    window.tabPressed = false;
    resetTest();
    focusInput();
  } else if (!event.ctrlKey && !event.metaKey && !event.altKey && event.key.length === 1 && !state.finished && document.activeElement !== input) {
    focusInput();
  }
});
$('themeButton').addEventListener('click', () => document.body.classList.toggle('light'));
resetTest();
