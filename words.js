// words.js - 简化版本（直接包含更多单词）

// 基础词库 + 扩展词库
export const defaultWords = [
    // 你原有的4个单词
    {
        word: "abandon",
        phonetic: "[əˈbændən]",
        audio: "",
        enDef: "to leave somebody or something behind",
        zhDef: "抛弃，遗弃，放弃",
        example: "The baby had been abandoned by its mother.",
        collocations: ["abandon a plan", "abandon ship"],
        level: "CET4"
    },
    {
        word: "capacity",
        phonetic: "[kəˈpæsəti]",
        audio: "",
        enDef: "the ability to hold, receive, or absorb",
        zhDef: "容量，能力，生产力",
        example: "The stadium has a seating capacity of 50,000.",
        collocations: ["at full capacity", "limited capacity"],
        level: "CET6"
    },
    {
        word: "sophisticated",
        phonetic: "[səˈfɪstɪkeɪtɪd]",
        audio: "",
        enDef: "having much worldly knowledge and experience",
        zhDef: "老练的，见多识广的；精密的",
        example: "She was a sophisticated and well-traveled woman.",
        collocations: ["a sophisticated machine", "sophisticated tastes"],
        level: "高考"
    },
    {
        word: "emerge",
        phonetic: "[ɪˈmɜːrdʒ]",
        audio: "",
        enDef: "to appear or become known",
        zhDef: "出现；浮现；暴露",
        example: "The sun emerged from behind the clouds.",
        collocations: ["emerge from", "emerge as"],
        level: "CET4"
    },
    
    // 新增的50个常用单词
    { word: "ability", phonetic: "[əˈbɪləti]", enDef: "the quality of being able to do something", zhDef: "能力，才能", example: "She has the ability to solve problems.", level: "CET4" },
    { word: "about", phonetic: "[əˈbaʊt]", enDef: "on the subject of", zhDef: "关于，大约", example: "What are you talking about?", level: "CET4" },
    { word: "above", phonetic: "[əˈbʌv]", enDef: "in a higher position than", zhDef: "在...上面", example: "The picture is above the sofa.", level: "CET4" },
    { word: "abroad", phonetic: "[əˈbrɔːd]", enDef: "in or to a foreign country", zhDef: "在国外，到国外", example: "She studied abroad for two years.", level: "CET4" },
    { word: "absence", phonetic: "[ˈæbsəns]", enDef: "the state of being away", zhDef: "缺席，缺乏", example: "His absence was noticed.", level: "CET4" },
    { word: "academic", phonetic: "[ˌækəˈdemɪk]", enDef: "relating to education", zhDef: "学术的", example: "Academic achievement is important.", level: "CET4" },
    { word: "accept", phonetic: "[əkˈsept]", enDef: "to receive willingly", zhDef: "接受，同意", example: "I accept your apology.", level: "CET4" },
    { word: "access", phonetic: "[ˈækses]", enDef: "the means to approach", zhDef: "进入，使用权", example: "Students have access to the library.", level: "CET4" },
    { word: "accident", phonetic: "[ˈæksɪdənt]", enDef: "an unfortunate incident", zhDef: "事故，意外", example: "He was in a car accident.", level: "CET4" },
    { word: "accompany", phonetic: "[əˈkʌmpəni]", enDef: "to go with someone", zhDef: "陪伴，伴随", example: "Will you accompany me to the party?", level: "CET4" },
    { word: "accomplish", phonetic: "[əˈkʌmplɪʃ]", enDef: "to achieve or complete", zhDef: "完成，实现", example: "She accomplished her goals.", level: "CET4" },
    { word: "according", phonetic: "[əˈkɔːrdɪŋ]", enDef: "as stated by", zhDef: "根据，按照", example: "According to the report...", level: "CET4" },
    { word: "account", phonetic: "[əˈkaʊnt]", enDef: "a report or description", zhDef: "账户，叙述", example: "She gave her account of events.", level: "CET4" },
    { word: "accurate", phonetic: "[ˈækjərət]", enDef: "correct in all details", zhDef: "准确的，精确的", example: "The information is accurate.", level: "CET4" },
    { word: "achieve", phonetic: "[əˈtʃiːv]", enDef: "to successfully reach", zhDef: "获得，实现", example: "He achieved great success.", level: "CET4" },
    { word: "acknowledge", phonetic: "[əkˈnɑːlɪdʒ]", enDef: "to accept the truth", zhDef: "承认，认可", example: "He acknowledged his mistake.", level: "CET4" },
    { word: "acquire", phonetic: "[əˈkwaɪər]", enDef: "to buy or obtain", zhDef: "获得，习得", example: "She acquired new skills.", level: "CET4" },
    { word: "across", phonetic: "[əˈkrɔːs]", enDef: "from one side to the other", zhDef: "穿过，横过", example: "Walk across the street.", level: "CET4" },
    { word: "act", phonetic: "[ækt]", enDef: "to take action", zhDef: "行动，表演", example: "He acted quickly.", level: "CET4" },
    { word: "action", phonetic: "[ˈækʃn]", enDef: "the process of doing something", zhDef: "行动，活动", example: "We need to take action.", level: "CET4" },
    { word: "active", phonetic: "[ˈæktɪv]", enDef: "engaging in action", zhDef: "活跃的，积极的", example: "She leads an active lifestyle.", level: "CET4" },
    { word: "activity", phonetic: "[ækˈtɪvəti]", enDef: "something that is done", zhDef: "活动，行动", example: "Outdoor activities are fun.", level: "CET4" },
    { word: "actor", phonetic: "[ˈæktər]", enDef: "a person who acts", zhDef: "演员", example: "He is a famous actor.", level: "CET4" },
    { word: "actual", phonetic: "[ˈæktʃuəl]", enDef: "existing in fact", zhDef: "实际的，真实的", example: "The actual cost was higher.", level: "CET4" },
    { word: "actually", phonetic: "[ˈæktʃuəli]", enDef: "in fact", zhDef: "实际上，事实上", example: "Actually, I was wrong.", level: "CET4" },
    { word: "adapt", phonetic: "[əˈdæpt]", enDef: "to adjust to new conditions", zhDef: "适应，改编", example: "Animals adapt to their environment.", level: "CET4" },
    { word: "add", phonetic: "[æd]", enDef: "to join something to something else", zhDef: "添加，增加", example: "Add sugar to the tea.", level: "CET4" },
    { word: "addition", phonetic: "[əˈdɪʃn]", enDef: "the process of adding", zhDef: "增加，加法", example: "In addition to his salary...", level: "CET4" },
    { word: "additional", phonetic: "[əˈdɪʃənl]", enDef: "extra or more", zhDef: "额外的，附加的", example: "We need additional help.", level: "CET4" },
    { word: "address", phonetic: "[əˈdres]", enDef: "the particulars of where someone lives", zhDef: "地址，演说", example: "What's your address?", level: "CET4" },
    { word: "adequate", phonetic: "[ˈædɪkwət]", enDef: "satisfactory or acceptable", zhDef: "充足的，充分的", example: "The space is adequate.", level: "CET4" },
    { word: "adjust", phonetic: "[əˈdʒʌst]", enDef: "to alter or move slightly", zhDef: "调整，适应", example: "Adjust the seat position.", level: "CET4" },
    { word: "administration", phonetic: "[ədˌmɪnɪˈstreɪʃn]", enDef: "the process of managing", zhDef: "管理，行政", example: "Business administration is complex.", level: "CET4" },
    { word: "admire", phonetic: "[ədˈmaɪər]", enDef: "to regard with respect", zhDef: "钦佩，欣赏", example: "I admire your courage.", level: "CET4" },
    { word: "admit", phonetic: "[ədˈmɪt]", enDef: "to confess to be true", zhDef: "承认，准许进入", example: "He admitted his mistake.", level: "CET4" },
    { word: "adult", phonetic: "[ˈædʌlt]", enDef: "a person who is fully grown", zhDef: "成年人", example: "Adults pay full price.", level: "CET4" },
    { word: "advance", phonetic: "[ədˈvæns]", enDef: "to move forward", zhDef: "前进，提前", example: "Technology advances rapidly.", level: "CET4" },
    { word: "advanced", phonetic: "[ədˈvænst]", enDef: "far on in progress", zhDef: "先进的，高级的", example: "Advanced technology.", level: "CET4" },
    { word: "advantage", phonetic: "[ədˈvæntɪdʒ]", enDef: "a condition giving greater opportunity", zhDef: "优势，好处", example: "Education provides advantages.", level: "CET4" },
    { word: "adventure", phonetic: "[ədˈventʃər]", enDef: "an unusual and exciting experience", zhDef: "冒险，奇遇", example: "They went on an adventure.", level: "CET4" },
    { word: "advertise", phonetic: "[ˈædvərtaɪz]", enDef: "to promote publicly", zhDef: "做广告，宣传", example: "Companies advertise products.", level: "CET4" },
    { word: "advice", phonetic: "[ədˈvaɪs]", enDef: "guidance or recommendations", zhDef: "建议，劝告", example: "I need your advice.", level: "CET4" },
    { word: "advise", phonetic: "[ədˈvaɪz]", enDef: "to offer suggestions", zhDef: "建议，劝告", example: "I advise you to study.", level: "CET4" },
    { word: "affair", phonetic: "[əˈfer]", enDef: "an event or sequence of events", zhDef: "事件，事务", example: "It's a private affair.", level: "CET4" },
    { word: "affect", phonetic: "[əˈfekt]", enDef: "to have an effect on", zhDef: "影响，感动", example: "Weather affects mood.", level: "CET4" },
    { word: "afford", phonetic: "[əˈfɔːrd]", enDef: "to have enough money for", zhDef: "买得起，负担得起", example: "I can't afford a car.", level: "CET4" },
    { word: "afraid", phonetic: "[əˈfreɪd]", enDef: "feeling fear or anxiety", zhDef: "害怕的，担心的", example: "I'm afraid of spiders.", level: "CET4" },
    { word: "after", phonetic: "[ˈæftər]", enDef: "in the time following", zhDef: "在...之后", example: "We'll meet after class.", level: "CET4" },
    { word: "afternoon", phonetic: "[ˌæftərˈnuːn]", enDef: "the time from noon to evening", zhDef: "下午", example: "Good afternoon!", level: "CET4" },
    { word: "again", phonetic: "[əˈɡen]", enDef: "another time", zhDef: "再次，又", example: "Please say that again.", level: "CET4" },
    { word: "against", phonetic: "[əˈɡenst]", enDef: "in opposition to", zhDef: "反对，靠着", example: "I'm against that idea.", level: "CET4" }
    // 可以继续添加更多单词...
];

// 为每个单词添加缺失的字段
defaultWords.forEach(word => {
    if (!word.audio) word.audio = "";
    if (!word.collocations) word.collocations = [];
});

export function getAllWords(userWords = []) {
    const allWords = [...defaultWords, ...(userWords || [])];
    console.log('🔍 总单词数:', allWords.length);
    return allWords;
}

console.log('✅ words.js 加载完成，包含', defaultWords.length, '个单词');

// 默认词库列表（当API失败时使用，现在应该从API动态获取）
const AVAILABLE_VOCABS = [
    'dicts/CET4_T.json',
    'dicts/CET6_T.json',
    'dicts/GaoKao_3500.json',
    'dicts/GMAT_3_T.json',
    'dicts/GRE_1500.json',
    'dicts/GRE_3_T.json',
    'dicts/GRE-computer-based-test.json',
    'dicts/hongbaoshu-2026.json',
    'dicts/IELTS_3_T.json',
    'dicts/KaoYan_2024.json',
    'dicts/Oxford3000.json',
    'dicts/SAT_3_T.json',
    'dicts/TOEFL_3_T.json',
    'dicts/TOEIC.json'
];

// 加载外部词库的函数 - 修复版
export async function loadExternalVocabulary(filename) {
    const possiblePaths = [
        `./public/${filename}`,
        `public/${filename}`,
        `/public/${filename}`,
        `${filename}`,
        `./${filename}`,
    ];
    
    let lastError = '';
    
    for (const path of possiblePaths) {
        try {
            console.log(`尝试路径: ${path}`);
            const response = await fetch(path);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            
            const vocabData = await response.json();
            
            if (!Array.isArray(vocabData)) {
                throw new Error('词库格式错误：应该是一个数组');
            }
            
            const processedWords = vocabData.map(word => {
                // 处理不同的词库格式
                let zhDef = word.zhDef || word.translation || word.zh || word.cn || word.chinese || '';
                // 处理 trans 数组格式（如 CET4_T.json）
                if (!zhDef && word.trans && Array.isArray(word.trans)) {
                    zhDef = word.trans.join('；');
                } else if (!zhDef && word.trans && typeof word.trans === 'string') {
                    zhDef = word.trans;
                }
                
                // 处理音标：支持 usphone, ukphone 等格式
                let phonetic = '';
                // 优先使用标准字段
                if (word.phonetic || word.pronunciation) {
                    phonetic = word.phonetic || word.pronunciation;
                } 
                // 如果没有标准字段，使用 usphone 或 ukphone
                else if (word.usphone || word.ukphone) {
                    if (word.usphone && word.ukphone) {
                        // 如果同时有美式和英式音标，都显示
                        // 为每个音标添加方括号（如果还没有）
                        const us = word.usphone.startsWith('[') ? word.usphone : `[${word.usphone}]`;
                        const uk = word.ukphone.startsWith('[') ? word.ukphone : `[${word.ukphone}]`;
                        phonetic = `[美]${us} [英]${uk}`;
                    } else {
                        // 只有其中一个，添加方括号（如果还没有）
                        const phone = word.usphone || word.ukphone;
                        phonetic = phone.startsWith('[') ? phone : `[${phone}]`;
                    }
                }
                
                return {
                    word: word.word || word.name || '',
                    phonetic: phonetic,
                    audio: word.audio || '',
                    enDef: word.enDef || word.definition || word.en || word.meaning || '',
                    zhDef: zhDef,
                    example: word.example || word.sentence || '',
                    collocations: word.collocations || word.phrases || [],
                    level: word.level || word.grade || ''
                };
            }).filter(word => word.word && word.word.trim() !== '');
            
            console.log(`✅ 成功加载词库 ${filename}，使用路径: ${path}`);
            console.log(`包含 ${processedWords.length} 个单词`);
            return processedWords;
            
        } catch (error) {
            lastError = `路径 ${path}: ${error.message}`;
            console.warn(`❌ 路径 ${path} 失败:`, error);
            continue;
        }
    }
    
    throw new Error(`所有路径尝试失败。最后错误: ${lastError}`);
}

// 获取可用的词库列表（直接使用硬编码列表，不再依赖后端）
export async function getAvailableVocabularies() {
    console.log('使用本地词库列表，共', AVAILABLE_VOCABS.length, '个词库');
    return AVAILABLE_VOCABS;
}