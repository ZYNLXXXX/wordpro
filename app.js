// app.js 主入口-初始化页面、导航切换、localStorage封装等
import { defaultWords, getAllWords, loadExternalVocabulary, getAvailableVocabularies } from './words.js';

const TABS = ['study', 'review', 'article', 'words'];
// 默认 Kimi 密钥（可在“文章生成”页修改并保存）
const DEFAULT_KIMI_KEY = 'sk-i7BO7nzscokdUgDq9TbUkBIZmgF3im88fC7g2wjj8oecZMk7';

// ===== localStorage 封装 =====
const STORAGE_KEY = 'wordpro-data-v1';
function loadData() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if(raw){
        try { return JSON.parse(raw); } catch(e){ console.warn(e); }
    }
    return { words: [], history: [], stats: {} };
}
function saveData(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}
let appData = loadData();

function getUserWords() {
    return appData.words || [];
}
function setUserWords(words) {
    appData.words = words;
    saveData(appData);
}

// ===== 应用初始化与页面切换 =====
function $(s, p=document){ return p.querySelector(s); }
function $all(s, p=document){ return [...p.querySelectorAll(s)]; }
const mainPanel = $('#main-panel');
const navTabs = $all('.tab');

let currentTab = 'study';
function switchTab(tab){
    if (!TABS.includes(tab)) return;
    currentTab = tab;
    navTabs.forEach(t => t.classList.toggle('active', t.dataset.tab===tab));
    renderTab(tab);
    setTimeout(()=>{
      window.dispatchEvent(new Event('tab-changed-'+tab));
    });
}
navTabs.forEach(tab => {
    tab.onclick = ()=>switchTab(tab.dataset.tab);
});

// 监听切换到单词管理页的事件
window.addEventListener('switch-to-words', () => {
    switchTab('words');
});

function getTodayKey() {
    const d = new Date();
    return d.getFullYear()+"-"+(d.getMonth()+1)+"-"+d.getDate();
}

function getLearningQueue() {
    const userSt = appData.stats || {};
    const learned = (userSt[getTodayKey()]||[]);
    const allWords = getAllWords(getUserWords());
    return allWords.filter(w => !learned.includes(w.word));
}

function markWordStatus(word, status) {
    const today = getTodayKey();
    if (!appData.stats) appData.stats = {};
    appData.stats[today] = appData.stats[today] || [];
    if (!appData.stats[today].includes(word.word)) {
        appData.stats[today].push(word.word);
    }
    if(!appData.wordStatus) appData.wordStatus = {};
    appData.wordStatus[word.word] = status;
    saveData(appData);
    refreshStatsFooter();
}

// ========== 英汉解释、发音、四关考察控制 ==========
function speakWord(wordObj) {
    if (window.speechSynthesis) {
        const uttr = new window.SpeechSynthesisUtterance(wordObj.word);
        uttr.lang = 'en-US';
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(uttr);
    }
}

const QUIZ_MODES_ORDER = [
    'sound-choice',   // 听声音选词
    'en2zh-choice',   // 看词选中文
    'zh2en-input',    // 看中文写英文（不读音）
    'zh-recall'       // 看中文回忆英文（不读音，可提示首字母）
];

function buildGateUI(word, mode, idx, total, onFinish, {isLastGate=false}={}) {
    let revealed = false;
    const render = (feedback='') => {
        let html = `<div class='word-card'>`;
        html += `<div style='display:flex;justify-content:space-between;align-items:center;'><span>${idx+1} / ${total}</span><span class='word-level'>${word.level||''}</span></div>`;
        const showExample = (mode==='sound-choice' || mode==='en2zh-choice');
        const canPlayAudio = (mode==='sound-choice' || mode==='en2zh-choice') && (revealed || mode==='sound-choice');
        const hintBtnText = mode==='sound-choice' || mode==='en2zh-choice' ? '提示（显示例句）' : '提示（只显示例句，无读音）';

        if(showExample){
            html += `<div class='word-example'><b>例句：</b>${revealed ? (word.example||'') : '点击提示查看例句'}</div>`;
        }
        if(canPlayAudio){
            html += `<button type='button' class='word-audio-btn' style='margin:7px 0;display:inline-block;'>🔊 听发音</button>`;
        }

        // 题干 + 选项/输入
        if(mode==='sound-choice'){
            html += `<div style='margin:10px 0;'>请听发音，选择对应的英文单词：</div>`;
            let opts = [word.word];
            let pool = getAllWords(getUserWords()).map(w=>w.word).filter(w=>w && w!==word.word);
            for(let i=0;i<3&&pool.length;i++){
                let pickIdx = Math.floor(Math.random()*pool.length);
                opts.push(pool.splice(pickIdx,1)[0]);
            }
            opts = opts.sort(()=>0.5-Math.random());
            html += opts.map(o=>`<label style='display:block;margin:5px 0;'><input type="radio" name="sel" value="${o}"> ${o}</label>`).join('');
        }else if(mode==='en2zh-choice'){
            html += `<div class='word-main-word' style='margin:6px 0;'>${word.word}</div>`;
            let opts = [word.zhDef];
            let pool = getAllWords(getUserWords()).map(w=>w.zhDef).filter(z=>z && z!==word.zhDef);
            for(let i=0;i<3&&pool.length;i++){
                let pickIdx = Math.floor(Math.random()*pool.length);
                opts.push(pool.splice(pickIdx,1)[0]);
            }
            opts = opts.sort(()=>0.5-Math.random());
            html += `<div>请选择对应的中文释义：</div>`;
            html += opts.map(o=>`<label style='display:block;margin:5px 0;'><input type="radio" name="sel" value="${o}"> ${o}</label>`).join('');
        }else if(mode==='zh2en-input'){
            html += `<div>根据中文写出英文（不播音，不显英文）：</div>`;
            html += `<div class='word-def'><b>中释：</b>${word.zhDef||''}</div>`;
            html += `<input required name='zh2en' placeholder='英文单词' style='margin-top:10px;font-size:1.1em;'>`;
        }else if(mode==='zh-recall'){
            const hintPrefix = word.word ? word.word[0] : '';
            html += `<div>看中文回忆英文（不播音）。提示：首字母 ${hintPrefix || '-'} </div>`;
            html += `<div class='word-def'><b>中释：</b>${word.zhDef||''}</div>`;
            html += `<input required name='recall' placeholder='英文单词' style='margin-top:10px;font-size:1.1em;'>`;
        }

        html += `<div class='quiz-btns' style='margin:16px 0 4px 0;'>`;
        html += `<button type='button' class='quiz-hint-btn'>${hintBtnText}</button>`;
        html += `<button type='button' class='quiz-submit-btn'>提交并下一题</button>`;
        html += `</div>`;
        if(feedback){
            html += `<div style='color:${feedback.startsWith('✔')?'green':'#df1d4c'};margin-top:6px;'>${feedback}</div>`;
        }
        if(revealed || feedback){
            html += `<div class="word-def"><b>英释：</b>${word.enDef||''}</div>`;
            html += `<div class="word-def"><b>中释：</b>${word.zhDef||''}</div>`;
            if(word.collocations?.length){
                html += `<div style="color:#23859c;padding:5px 0 0 0;font-size:.97em"><b>搭配：</b>${word.collocations.map(c=>`<span style='margin-right:8px'>${c}</span>`).join('')}</div>`;
            }
        }
        html += `</div>`;
        mainPanel.innerHTML = html;

        mainPanel.querySelectorAll('.word-audio-btn').forEach(btn=>btn.onclick=()=>speakWord(word));
        mainPanel.querySelector('.quiz-hint-btn').onclick = ()=>{ revealed = true; render(feedback); };
        mainPanel.querySelector('.quiz-submit-btn').onclick = ()=>{
            let ok = false;
            if(mode==='sound-choice' || mode==='en2zh-choice'){
                const val = mainPanel.querySelector('[name="sel"]:checked')?.value;
                ok = mode==='sound-choice' ? (val===word.word) : (val===word.zhDef);
            }else if(mode==='zh2en-input'){
                const val = mainPanel.querySelector('[name="zh2en"]').value.trim().toLowerCase();
                ok = val === (word.word||'').toLowerCase();
            }else if(mode==='zh-recall'){
                const val = mainPanel.querySelector('[name="recall"]').value.trim().toLowerCase();
                ok = val === (word.word||'').toLowerCase();
            }
            const fb = ok ? '✔ 正确' : `✗ 正确答案：${word.word}`;
            if(isLastGate && ok){
                markWordStatus(word, 'learned');
            }
            onFinish(ok, fb);
        };
    };
    render();
}

// 拼写测试功能（可选，结束回调）
function spellingTestBatch(words, onFinish=()=>{}) {
    mainPanel.innerHTML = `<div class='word-card'><div style='font-weight:bold;'>拼写测试（可选）：</div>
      <div id='spelling-tasks'></div>
      <div style='margin-top:14px;display:flex;gap:10px;'>
        <button id='spell-finish-btn'>完成/跳过</button>
      </div>
    </div>`;
    const box = mainPanel.querySelector('#spelling-tasks');
    words.forEach((word, i) => {
      let row = document.createElement('div');
      row.className = 'spell-row';
      row.innerHTML = `<span class='sp-idx'>${i+1}.</span> <span class='sp-zh'>${word.zhDef}</span>
        <input class='sp-input' type='text' spellcheck='false' data-idx='${i}' style='font-size:1.09em;margin:0 8px;' placeholder='英文拼写...' />
        <button class='sp-hint-btn' data-idx='${i}' type='button'>提示</button>
        <span class='sp-feedback'></span>`;
      box.appendChild(row);
      row.querySelector('.sp-hint-btn').onclick = ()=>{speakWord(word);};
      row.querySelector('.sp-input').onblur = function(){ checkAns(word, this, row.querySelector('.sp-feedback')); };
      row.querySelector('.sp-input').onkeydown = function(e){if(e.key==='Enter'){checkAns(word, this, row.querySelector('.sp-feedback'));}};
    });
    function checkAns(word, inp, feedback) {
        let val = inp.value.trim().toLowerCase();
        if(!val) {feedback.textContent=''; inp.style.color=''; return;}
        if(val === word.word.toLowerCase()) {
          feedback.textContent = '✔ 正确';
          feedback.style.color = 'green';
          inp.style.color = 'green';
        }else {
          feedback.textContent = `✗ 正确：${word.word}`;
          feedback.style.color = 'red';
          inp.style.color = 'red';
        }
    }
    mainPanel.querySelector('#spell-finish-btn').onclick = ()=>onFinish();
}

// 唯一的新学习流程控制器（四关 + 可选拼写）
function newLearnProcessController(words, tab='study') {
    let groupSize = getGroupSize();
    if(groupSize < 5) groupSize = 5;
    let startIdx = 0;
    let curGate = 0;
    let curQ = [];
    let idx = 0;
    const visited = new Set(); // 当天在学习流程中出现过的单词（用于文章生成）

    const loadGroup = () => {
        curQ = words.slice(startIdx, startIdx + groupSize);
        curGate = 0;
        idx = 0;
    };

    const goNextGroup = () => {
        startIdx += groupSize;
        if(startIdx >= words.length){
            mainPanel.innerHTML = `<div class='word-card'>本组完成，全部单词已学习/复习完毕！</div>`;
            refreshStatsFooter();
            return;
        }
        loadGroup();
        nextWord();
    };

    const afterAllGates = () => {
        // 4 关完成，可选拼写
        mainPanel.innerHTML = `<div class='word-card'>
            <div>已完成本组四关，是否要做拼写测试？</div>
            <div style='margin-top:12px;display:flex;gap:10px;'>
              <button id='do-spell'>是，做拼写</button>
              <button id='skip-spell'>跳过，下一组</button>
            </div>
        </div>`;
        mainPanel.querySelector('#do-spell').onclick = ()=>spellingTestBatch(curQ, goNextGroup);
        mainPanel.querySelector('#skip-spell').onclick = goNextGroup;
    };

    const nextWord = () => {
        if(!curQ.length){
            mainPanel.innerHTML = `<div class='word-card'>暂无更多单词，请先添加或导入词库。</div>`;
            return;
        }
        if(idx >= curQ.length){
            curGate++;
            idx = 0;
            if(curGate >= QUIZ_MODES_ORDER.length){
                afterAllGates();
                return;
            }
        }
        const currentWord = curQ[idx];
        // 只要本轮学习中第一次遇到这个单词，就记入今日学习记录（方便文章生成）
        if (!visited.has(currentWord.word)) {
            visited.add(currentWord.word);
            markWordStatus(currentWord, tab==='review' ? 'reviewed' : 'learned');
        }
        buildGateUI(currentWord, QUIZ_MODES_ORDER[curGate], idx, curQ.length, (ok)=>{
            idx++;
            nextWord();
        }, {isLastGate: curGate === QUIZ_MODES_ORDER.length -1});
    };

    loadGroup();
    nextWord();
}

function studyController() {
    const q = getLearningQueue();
    const allWords = getAllWords(getUserWords());
    if(allWords.length === 0){
        mainPanel.innerHTML = `<div class="word-card">
            <div style="margin-bottom:12px;color:#d1144b;font-weight:bold;">暂无单词！</div>
            <div style="margin-bottom:8px;">请前往"单词管理"页面导入词库或添加单词。</div>
            <button onclick="window.dispatchEvent(new Event('switch-to-words'))" style="padding:8px 16px;background:#4f8df9;color:white;border:none;border-radius:4px;cursor:pointer;">前往单词管理</button>
        </div>`;
        return;
    }
    if(q.length===0){
        mainPanel.innerHTML = `<div class="word-card">
            <div style="margin-bottom:12px;">今日已全部学习完毕！</div>
            <div style="margin-bottom:8px;">总单词数：${allWords.length}，今日已学习：${(appData.stats?.[getTodayKey()]||[]).length}</div>
            <button onclick="appData.stats={};saveData(appData);location.reload();" style="padding:8px 16px;background:#4f8df9;color:white;border:none;border-radius:4px;cursor:pointer;">重置今日学习记录</button>
        </div>`;
        return;
    }
    newLearnProcessController(q, 'study');
}

function getReviewQueue(){
    const userSt = appData.wordStatus||{};
    return getAllWords(getUserWords()).filter(w=>userSt[w.word]!=='known');
}

function reviewController() {
    const q = getReviewQueue();
    if(q.length===0){
        mainPanel.innerHTML = '<div class="word-card">暂无需复习单词，请保持学习！</div>';
        return;
    }
    newLearnProcessController(q, 'review');
}

function getLearnedWordsToday() {
    const today = getTodayKey();
    const learned = ((appData.stats||{})[today]) || [];
    const all = getAllWords(getUserWords());
    return all.filter(w => learned.includes(w.word));
}

function getWordsByNameList(nameList) {
    const set = new Set(nameList||[]);
    return getAllWords(getUserWords()).filter(w=>set.has(w.word));
}

function difficultyOf(words) {
    let hard = words.filter(w => /CET6|考研|TOEFL|IELTS/i.test(w.level||''));
    if(hard.length > words.length/2) return 'hard';
    return 'easy';
}

function getKimiKey() {
    const saved = localStorage.getItem('kimiKey');
    if(saved) return saved;
    localStorage.setItem('kimiKey', DEFAULT_KIMI_KEY);
    return DEFAULT_KIMI_KEY;
}
function setKimiKey(v) {
    localStorage.setItem('kimiKey', v);
}

async function apiGenerateArticle(words, type='easy'){
    const key = getKimiKey();
    const wordList = words.map(w=>`${w.word} (${w.zhDef||w.enDef||''})`).join(', ');
    const targetLen = Math.min(240, Math.max(120, words.length * 22));
    const sysPrompt = `你是英语学习助手，请用简明且连贯的英语写一段${type==='easy'?'日常小故事':'偏考试风格的说明文'}，长度约 ${targetLen} 词。必须把以下全部单词都用上且语法通顺、故事连贯，每个目标单词至少出现一次，并用 <kw>word</kw> 包裹：${wordList}。若个别词不易自然融入，可用短句或括号补充，但保持整体阅读流畅。避免罗列，用叙事/说明的方式串联。`;

    // 本地兜底生成，确保语法完整且包含全部词
    function localStory(wordsArr){
        if(!wordsArr.length) return '';
        const names = wordsArr.map(w=>w.word);
        const marked = names.map(n=>`<kw>${n}</kw>`);
        const chunks = [];
        for(let i=0;i<marked.length;i+=3){
            const part = marked.slice(i,i+3);
            if(part.length===1){
                chunks.push(`I encountered ${part[0]} during a simple day, and it shaped my mood.`);
            }else if(part.length===2){
                chunks.push(`On my way, ${part[0]} appeared, and soon ${part[1]} made the scene more vivid.`);
            }else{
                chunks.push(`First ${part[0]} set the tone, then ${part[1]} connected the idea, and finally ${part[2]} completed the moment.`);
            }
        }
        const lead = type==='easy'
          ? 'Here is a short, grammatically correct story using all your chosen words:'
          : 'Here is a concise explanatory paragraph weaving all selected terms logically:';
        return `${lead} ${chunks.join(' ')}`;
    }

    try {
        // 直接调用 Kimi API（注意：可能遇到 CORS 问题，如果失败会使用本地模板）
        const resp = await fetch('https://api.moonshot.cn/v1/chat/completions', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${key}`
            },
            body: JSON.stringify({
                model: 'moonshot-v1-8k',
                messages: [
                    {role:'system', content:'你是英语学习与写作助手。'},
                    {role:'user', content: sysPrompt}
                ],
                temperature: 0.7
            })
        });
        if(!resp.ok) throw new Error('Kimi API 请求失败 ' + resp.status);
        const data = await resp.json();
        let txt = data.choices?.[0]?.message?.content || '';
        if(!txt) throw new Error('未获取到正文');
        // 简单补救：确保每个词至少出现一次
        const lowerTxt = txt.toLowerCase();
        words.forEach(w=>{
            if(w.word && !lowerTxt.includes(w.word.toLowerCase())){
                txt += ` <kw>${w.word}</kw>`;
            }
        });
        return txt;
    } catch(err){
        console.warn('Kimi API 失败（可能是 CORS 问题），使用本地模板：', err);
        // 如果遇到 CORS 错误，提示用户
        if(err.message.includes('CORS') || err.message.includes('Failed to fetch')){
            console.warn('提示：由于浏览器 CORS 限制，无法直接调用 Kimi API。如需使用 Kimi 功能，请配置代理服务器或使用浏览器扩展。');
        }
        return localStory(words);
    }
}

function renderArticleTab() {
    const learnedToday = getLearnedWordsToday();
    const key = getKimiKey();
    const renderList = (list)=>{
        if(!list.length) return '<div style="color:#777;">今日暂无学习/复习记录</div>';
        return `<div style="max-height:260px;overflow:auto;margin-top:8px;">
            ${list.map((w,i)=>`<label style="display:flex;align-items:center;gap:6px;margin:4px 0;">
                <input type="checkbox" class="article-word-chk" value="${w.word}" checked />
                <span style="min-width:48px;color:#176fc5;font-weight:600;">${i+1}.</span>
                <span class='word-main-word'>${w.word}</span>
                <span class='word-main-phonetic'>${w.phonetic||''}</span>
                <span class='word-def'>${w.zhDef||w.enDef||''}</span>
                <span class='word-level'>${w.level||''}</span>
            </label>`).join('')}
        </div>`;
    };
    mainPanel.innerHTML = `<div class="word-card">
        <div style='display:flex;gap:10px;align-items:center;flex-wrap:wrap;'>
          <span>文章生成</span>
          <input id='kimi-key-input' type='password' placeholder='Kimi API Key' value='${key}' style='min-width:240px;'>
          <button id='save-kimi-key'>保存密钥</button>
          <button id='refresh-article-list'>刷新今日记录</button>
        </div>
        <div style='margin-top:12px;color:#256195;font-weight:600;'>今日已学/复习的词（自动勾选用于生成）：</div>
        ${renderList(learnedToday)}
        <div style='margin-top:14px;display:flex;gap:10px;flex-wrap:wrap;'>
          <button id='btn-gen-article'>生成文章</button>
        </div>
        <div id='article-status' style='margin-top:10px;color:#555;'>请选择词后生成</div>
    </div>`;

    const saveKey = ()=>{
        const val = mainPanel.querySelector('#kimi-key-input').value.trim();
        if(!val){ alert('密钥不能为空'); return; }
        setKimiKey(val);
        alert('已保存新的 Kimi 密钥');
    };
    const regenerateList = ()=>{
        renderArticleTab();
    };
    mainPanel.querySelector('#save-kimi-key').onclick = saveKey;
    mainPanel.querySelector('#refresh-article-list').onclick = regenerateList;
    mainPanel.querySelector('#btn-gen-article').onclick = async ()=>{
        const chosen = [...mainPanel.querySelectorAll('.article-word-chk:checked')].map(c=>c.value);
        if(!chosen.length){
            alert('请至少勾选1个词用于生成');
            return;
        }
        const words = getWordsByNameList(chosen);
        const diff = difficultyOf(words);
        const box = mainPanel.querySelector('#article-status');
        box.textContent = '文章生成中...';
        try{
            const txt = await apiGenerateArticle(words, diff);
            let html = txt.replace(/<kw>(.*?)<\/kw>/g, '<span class="hl-word">$1</span>');
            box.innerHTML = `<div>【${diff==='easy'?'简单段落':'考试型阅读'}】</div><div class="main-article">${html}</div>`;
        }catch(err){
            box.textContent = '生成失败：'+err.message;
        }
    };
}

async function renderWordsTab() {
  const userWords = getUserWords();
  const all = getAllWords(userWords);
  
  console.log('📊 单词统计:', {
    defaultWords: defaultWords.length,
    userWords: userWords.length,
    total: all.length
  });
  
  // 先显示加载状态
  mainPanel.innerHTML = `
    <div class="word-card">
      <div style="display:flex;gap:16px;align-items:center;flex-wrap:wrap;">
        <div>正在加载词库列表...</div>
      </div>
    </div>
  `;
  
  const availableVocabs = await getAvailableVocabularies();
  console.log('最终使用的词库列表数量:', availableVocabs.length);
  
  let wordListHtml = all.map(w => `<tr>
    <td>${w.word}</td><td>${w.phonetic||''}</td><td>${w.zhDef || w.definition || ''}</td><td>${w.level||''}</td>
    <td>${appData.wordStatus?.[w.word]||'-'}</td></tr>`).join('');

  mainPanel.innerHTML = `
    <div class="word-card">
      <div style="display:flex;gap:16px;align-items:center;flex-wrap:wrap;">
        <button id="btn-export-words">导出单词库</button>
        <label style="margin:0 4px;">导入：<input type="file" id="import-words-file" accept=".json,.txt" style="display:inline" /></label>
        
        <!-- 新增：词库选择器 -->
        <select id="vocab-selector" style="padding:6px;border-radius:4px;border:1px solid #67e8f9;">
          <option value="">选择预设词库...</option>
          ${availableVocabs.map(vocab => {
            // 提取友好的词库名称：去掉 dicts/ 前缀和 .json 后缀
            const displayName = vocab.replace(/^dicts\//, '').replace(/\.json$/, '');
            return `<option value="${vocab}">${displayName}</option>`;
          }).join('')}
        </select>
        <button id="btn-load-vocab">合并词库</button>
        <button id="btn-replace-vocab">替换词库</button>
        
        <button id="btn-clear-userwords">清空自定义</button>
      </div>
      
      <div style="margin:13px 0 6px 0;color:#256195;font-weight:bold;">全部单词（共${all.length}，其中默认词库${defaultWords.length}个，自定义${userWords.length}个）</div>
      <div style="max-height:260px;overflow:auto;">
        ${all.length > 0 ? `<table class="words-table"><thead><tr><th>单词</th><th>音标</th><th>释义</th><th>等级</th><th>状态</th></tr></thead><tbody>${wordListHtml}</tbody></table>` : '<div style="padding:20px;text-align:center;color:#777;">暂无单词，请导入词库或添加单词</div>'}
      </div>
      <div class="import-status" style="margin-top:8px;color:#d1144b;font-size:.98em;"></div>
    </div>
  `;

  // 原有的导出和导入功能...
  mainPanel.querySelector('#btn-export-words').onclick = () => {
    const blob = new Blob([JSON.stringify(userWords,null,2)], {type:'application/json'});
    const alink = document.createElement('a');
    alink.href = URL.createObjectURL(blob);
    alink.download = 'wordpro-userwords.json';
    alink.click();
  };

  // 新增：加载预设词库功能（合并模式）
  mainPanel.querySelector('#btn-load-vocab').onclick = async () => {
    const selector = mainPanel.querySelector('#vocab-selector');
    const vocabFile = selector.value;
    const stDiv = mainPanel.querySelector('.import-status');
    
    if (!vocabFile) {
      stDiv.textContent = '请选择词库文件';
      return;
    }
    
    try {
      stDiv.textContent = '加载中...';
      const vocabData = await loadExternalVocabulary(vocabFile);
      const currentWords = getUserWords();
      const mergedWords = [...currentWords, ...vocabData];
      const uniqueWords = mergedWords.filter((word, index, self) => 
        index === self.findIndex(w => w.word === word.word)
      );
      setUserWords(uniqueWords);
      stDiv.textContent = `成功合并词库，新增${vocabData.length}个单词，共${uniqueWords.length}个单词`;
      setTimeout(() => renderWordsTab(), 1000);
      
    } catch (error) {
      stDiv.textContent = `加载失败: ${error.message}`;
    }
  };

  // 新增：替换词库功能（完全替换）
  mainPanel.querySelector('#btn-replace-vocab').onclick = async () => {
    const selector = mainPanel.querySelector('#vocab-selector');
    const vocabFile = selector.value;
    const stDiv = mainPanel.querySelector('.import-status');
    
    if (!vocabFile) {
      stDiv.textContent = '请选择词库文件';
      return;
    }
    
    if (!confirm('确定要替换当前词库吗？这将清空所有自定义单词，只保留新加载的词库。')) {
      return;
    }
    
    try {
      stDiv.textContent = '加载中...';
      const vocabData = await loadExternalVocabulary(vocabFile);
      // 完全替换，不清空学习记录和统计
      setUserWords(vocabData);
      stDiv.textContent = `成功替换词库，共${vocabData.length}个单词`;
      setTimeout(() => renderWordsTab(), 1000);
      
    } catch (error) {
      stDiv.textContent = `加载失败: ${error.message}`;
    }
  };

  // 文件导入功能
  mainPanel.querySelector('#import-words-file').onchange = async (evt) => {
    const file = evt.target.files[0];
    if (!file) return;
    
    const stDiv = mainPanel.querySelector('.import-status');
    stDiv.textContent = '正在读取文件...';
    
    try {
      const text = await file.text();
      let importedWords = [];
      
      if (file.name.endsWith('.json')) {
        importedWords = JSON.parse(text);
        if (!Array.isArray(importedWords)) {
          throw new Error('JSON文件格式错误：应该是一个数组');
        }
      } else if (file.name.endsWith('.txt')) {
        // 简单的文本格式：每行一个单词
        const lines = text.split('\n').filter(line => line.trim());
        importedWords = lines.map(line => {
          const parts = line.trim().split(/\s+/);
          return {
            word: parts[0] || '',
            phonetic: parts[1] || '',
            zhDef: parts.slice(2).join(' ') || '',
            enDef: '',
            example: '',
            collocations: [],
            level: ''
          };
        }).filter(w => w.word);
      }
      
      if (importedWords.length === 0) {
        throw new Error('文件中没有找到有效的单词');
      }
      
      // 合并到现有词库
      const currentWords = getUserWords();
      const mergedWords = [...currentWords, ...importedWords];
      const uniqueWords = mergedWords.filter((word, index, self) => 
        index === self.findIndex(w => w.word === word.word)
      );
      setUserWords(uniqueWords);
      stDiv.textContent = `成功导入${importedWords.length}个单词，共${uniqueWords.length}个单词`;
      evt.target.value = ''; // 清空文件选择
      setTimeout(() => renderWordsTab(), 1000);
      
    } catch (error) {
      stDiv.textContent = `导入失败: ${error.message}`;
      console.error('导入错误:', error);
    }
  };

  mainPanel.querySelector('#btn-clear-userwords').onclick = () => {
    setUserWords([]);
    renderWordsTab();
  };
}

async function renderTab(tab){
    mainPanel.innerHTML = '';
    if(tab === 'study'){
        studyController();
        return;
    }
    if(tab === 'review') { reviewController(); return; }
    if(tab === 'article') { renderArticleTab(); return; }
    if(tab === 'words') { await renderWordsTab(); return;}
}

function refreshStatsFooter() {
    const statsDiv = document.querySelector('.stats');
    const progressBar = document.querySelector('.progress-bar');
    const progressText = document.querySelector('.progress-text');
    const allWords = getAllWords(getUserWords());

    const todayList = ((appData.stats||{})[getTodayKey()]||[]);
    let learnedTotal = [];
    if(appData.stats){
        Object.values(appData.stats).forEach(arr=>arr.forEach(w=>!learnedTotal.includes(w)&&learnedTotal.push(w)));
    }
    let toReview = learnedTotal.filter(w => appData.wordStatus?.[w] !== 'known');
    statsDiv.innerHTML = `累计学习：<b>${learnedTotal.length}</b>｜今日学习：<b>${todayList.length}</b>｜待复习：<b>${toReview.length}</b>`;

    const percent = allWords.length>0 ? (learnedTotal.length/allWords.length) : 0;
    progressBar.style.width = Math.round(percent*100)+"%";
    progressText.textContent = "学习进度："+Math.round(percent*100)+"%";
}

['study','review','article','words'].forEach(tab=>{
    window.addEventListener('tab-changed-'+tab, refreshStatsFooter);
});
window.addEventListener('DOMContentLoaded', refreshStatsFooter);

// ========== 设置组件 ==========
const DEFAULT_GROUP_SIZE = 10;
function getGroupSize() {
    return parseInt(localStorage.getItem('groupSize')||DEFAULT_GROUP_SIZE,10);
}
function setGroupSize(val) {
    localStorage.setItem('groupSize', val);
}
function setupSettingsBtn() {
    if(document.getElementById('set-group-btn')) return;
    const navbar = document.getElementById('navbar');
    let btn = document.createElement('button');
    btn.id = 'set-group-btn';
    btn.textContent = '设置';
    btn.style.marginLeft = 'auto';
    btn.onclick = ()=>{
      let current = getGroupSize();
      let val = prompt('每组单词数(≥10，5的倍数)：', current);
      val = parseInt(val,10);
      if(isNaN(val)||val<10||val%5!==0){ alert('请输入10或以上，且为5的倍数'); return; }
      setGroupSize(val);
      alert('设置成功，刷新或重新开始学习/复习生效');
    };
    navbar.appendChild(btn);
}
window.addEventListener('DOMContentLoaded', setupSettingsBtn);

// 首次初始化
// 添加错误处理，确保模块加载失败时也能显示提示
window.addEventListener('error', (e) => {
    if (e.message && e.message.includes('Failed to fetch dynamically imported module')) {
        console.error('模块加载失败，可能是直接打开了 HTML 文件。请使用 HTTP 服务器访问。');
        mainPanel.innerHTML = `<div class="word-card" style="color:#d1144b;">
            <div style="font-weight:bold;margin-bottom:12px;">⚠️ 模块加载失败</div>
            <div style="margin-bottom:8px;">请使用 HTTP 服务器打开此页面，而不是直接双击 HTML 文件。</div>
            <div style="margin-bottom:8px;">可以使用以下方式：</div>
            <div style="margin-bottom:4px;">1. Python: <code>python -m http.server 5500</code></div>
            <div style="margin-bottom:4px;">2. Node.js: <code>npx http-server -p 5500</code></div>
            <div>然后访问: <code>http://localhost:5500/index.html</code></div>
        </div>`;
    }
});

// 延迟初始化，确保 DOM 已加载
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => switchTab(currentTab), 100);
    });
} else {
    setTimeout(() => switchTab(currentTab), 100);
}

window.WordProApp = {
    getUserWords, setUserWords, getAllWords,
    appData, saveData
};