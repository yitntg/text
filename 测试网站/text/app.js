// 全局变量
let writer = null;
let currentChar = null;
let currentPage = 1;
let perPage = 100;
let allHanzi = [];
let filteredHanzi = [];
let supportedHanzi = new Set();

// DeepSeek API配置
const DEEPSEEK_API_KEY = 'sk-e6f6fec2e22a49079c464dfc4bf54826';
const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';

// 页面加载完成后执行
document.addEventListener('DOMContentLoaded', () => {
    console.log('初始化汉字大全...');
    
    // 初始化汉字数据
    initHanziData();
    
    // 绑定事件
    bindEvents();
    
    // 显示欢迎消息
    console.log('加载完成，欢迎使用汉字大全！');
});

// 初始化汉字数据
async function initHanziData() {
    try {
        // 生成完整的汉字集（CJK统一汉字基本区和扩展A区）
        generateAllHanzi();
        
        // 更新过滤后的汉字集
        updateFilteredHanzi();
        
        // 初始显示第一页
        displayHanziPage(1);
        
        // 预加载常用汉字的笔顺数据
        preloadCommonHanziData();
    } catch (error) {
        console.error('初始化汉字数据失败:', error);
    }
}

// 生成所有汉字
function generateAllHanzi() {
    // 清空数组
    allHanzi = [];
    
    // CJK统一汉字基本区 (U+4E00 - U+9FFF)
    for (let i = 0x4e00; i <= 0x9fff; i++) {
        allHanzi.push(String.fromCodePoint(i));
    }
    
    // CJK统一汉字扩展A区 (U+3400 - U+4DBF)
    for (let i = 0x3400; i <= 0x4dbf; i++) {
        allHanzi.push(String.fromCodePoint(i));
    }
    
    console.log(`已生成 ${allHanzi.length} 个汉字`);
}

// 更新过滤后的汉字集
function updateFilteredHanzi() {
    const filterType = document.getElementById('filter-type').value;
    
    if (filterType === 'all') {
        filteredHanzi = [...allHanzi];
    } else if (filterType === 'common') {
        // 常用汉字（此处为示例，实际应用中应该有更完整的常用汉字列表）
        const commonHanzi = '的一是不了在人有我他这个们中来上大为和国地到以说时要就出会可也你对生能而子那得于着下自之年过发后作里用道行所然家种事成方多经么去法学如都同现当没动面起看定天分还进好小部其些主样理心她本前开但因只从想实日军者意无力它与长把机十民第公此已工使情明性知全三又关点正业外将两高间由问很最重并物手应战向头文体政美相见被利什二等产或新己制身果加西革相开合物走把今入通好与关引如话界出德样战史尔集把通门先回更受听白做常海张力万带军工物书前位知高低部但体几何变其全热手自应物战向门期合海做知识山战总工复关全身件平力级按光产明制导即长走需起众取引目让向变决师流处直今取外管克结顶言真解精取史市史南器步业风济即入加界验强思想争色样只装路为入织政要口几题最边风格力量路结交设即象今接知海导调红光产全管济即入加响影即入总置度张知百般花根做领军看海示果导象知争议决器何元况装知海种音该据维美术声明识确通准题话三单元领能术清需生术';
        filteredHanzi = Array.from(commonHanzi);
    } else if (filterType.startsWith('hsk')) {
        // HSK词汇表（简化版）
        const hskLevels = {
            'hsk1': '我你他她它们的了在有是这不会个什么谁哪儿哪里吗呢怎么怎样为什么啊吧',
            'hsk2': '爱八百班半包北比笔病不才菜茶差长唱出穿次从错打大到得地弟点电店东懂都对多饿儿二饭方房放飞非份服高个跟工公共贵国果过还孩好喝河和黑很红后花话欢会回婚机鸡几家见叫教姐介绍今近进京九久酒觉开看可课气汽千钱前清晴情请秋去然人认日三上山商上午少谁什么生师十识是时世事手书水睡说思四送诉虽岁所他她它太天听同屋五午晚万王网忘望文我五午晚万王网忘望文我们问午西息系下先现相想小',
            'hsk3': '啊爱安把八吧白百班帮包饱北杯被本笔比边病不才菜茶差长常场唱车成城吃出初穿次从错打大',
            'hsk4': '啊爱安按把爸吧白百摆败班般搬板办帮包饱保抱报杯被北备背悲被鼻比笔必边变便遍表别病不部步不才材采彩菜参草层茶查差产长常场唱车成城程吃迟出初除厨楚穿'
        };
        
        const level = parseInt(filterType.replace('hsk', ''));
        let hskHanzi = '';
        for (let i = 1; i <= level; i++) {
            hskHanzi += hskLevels[`hsk${i}`] || '';
        }
        
        // 去重
        filteredHanzi = Array.from(new Set(hskHanzi));
    }
    
    // 更新分页信息
    updatePaginationInfo();
    
    console.log(`过滤后有 ${filteredHanzi.length} 个汉字`);
}

// 预加载常用汉字数据
function preloadCommonHanziData() {
    // 常用汉字列表
    const commonHanziList = '的一是不了在人有我他这个们中来上大为和国地到以说时要就出会可也你对生能而子';
    
    console.log(`开始预加载 ${commonHanziList.length} 个常用汉字的笔顺数据...`);
    
    Array.from(commonHanziList).forEach(hanzi => {
        HanziWriter.loadCharacterData(hanzi).then(data => {
            supportedHanzi.add(hanzi);
            updateHanziElement(hanzi);
        }).catch(err => {
            console.error(`无法加载汉字 "${hanzi}" 的笔顺数据`);
        });
    });
}

// 更新汉字元素样式
function updateHanziElement(hanzi) {
    document.querySelectorAll('.hanzi-item').forEach(item => {
        if (item.textContent === hanzi) {
            item.classList.add('supported');
        }
    });
}

// 显示指定页的汉字
function displayHanziPage(page) {
    const hanziGrid = document.getElementById('hanzi-grid');
    if (!hanziGrid) return;
    
    // 清空网格
    hanziGrid.innerHTML = '';
    
    // 计算起始和结束索引
    const startIndex = (page - 1) * perPage;
    const endIndex = Math.min(startIndex + perPage, filteredHanzi.length);
    
    // 创建汉字元素
    for (let i = startIndex; i < endIndex; i++) {
        const hanzi = filteredHanzi[i];
        
        const item = document.createElement('div');
        item.className = 'hanzi-item';
        if (supportedHanzi.has(hanzi)) {
            item.classList.add('supported');
        }
        if (hanzi === currentChar) {
            item.classList.add('active');
        }
        
        item.textContent = hanzi;
        item.addEventListener('click', () => selectHanzi(hanzi));
        
        hanziGrid.appendChild(item);
    }
    
    // 更新当前页和分页信息
    currentPage = page;
    updatePaginationInfo();
    
    // 更新分页按钮状态
    const prevButton = document.getElementById('prev-page');
    const nextButton = document.getElementById('next-page');
    
    if (prevButton) {
        prevButton.disabled = page <= 1;
    }
    
    if (nextButton) {
        const totalPages = Math.ceil(filteredHanzi.length / perPage);
        nextButton.disabled = page >= totalPages;
    }
}

// 更新分页信息
function updatePaginationInfo() {
    const pageInfo = document.getElementById('page-info');
    if (pageInfo) {
        const totalPages = Math.ceil(filteredHanzi.length / perPage);
        pageInfo.textContent = `第 ${currentPage}/${totalPages} 页`;
    }
}

// 绑定事件
function bindEvents() {
    // 分页按钮
    const prevButton = document.getElementById('prev-page');
    const nextButton = document.getElementById('next-page');
    
    if (prevButton) {
        prevButton.addEventListener('click', () => {
            if (currentPage > 1) {
                displayHanziPage(currentPage - 1);
            }
        });
    }
    
    if (nextButton) {
        nextButton.addEventListener('click', () => {
            const totalPages = Math.ceil(filteredHanzi.length / perPage);
            if (currentPage < totalPages) {
                displayHanziPage(currentPage + 1);
            }
        });
    }
    
    // 过滤器改变事件
    const filterType = document.getElementById('filter-type');
    if (filterType) {
        filterType.addEventListener('change', () => {
            updateFilteredHanzi();
            displayHanziPage(1); // 重置到第一页
        });
    }
    
    // 搜索功能
    const searchBtn = document.getElementById('search-btn');
    const searchInput = document.getElementById('search-input');
    
    if (searchBtn && searchInput) {
        searchBtn.addEventListener('click', () => {
            searchHanzi(searchInput.value);
        });
        
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                searchHanzi(searchInput.value);
            }
        });
    }
    
    // 发送消息按钮和输入框
    const sendBtn = document.getElementById('send-btn');
    const userInput = document.getElementById('user-input');
    
    if (sendBtn && userInput) {
        sendBtn.addEventListener('click', () => {
            sendMessage();
        });
        
        userInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });
    }
    
    // 清空聊天按钮
    const clearChatBtn = document.getElementById('clear-chat');
    if (clearChatBtn) {
        clearChatBtn.addEventListener('click', () => {
            clearChat();
        });
    }
}

// 搜索汉字
function searchHanzi(query) {
    if (!query) return;
    
    // 提取第一个汉字
    const hanzi = Array.from(query)[0];
    
    // 验证是否为汉字
    if (/[\u4e00-\u9fff\u3400-\u4dbf]/.test(hanzi)) {
        // 查找汉字在集合中的索引
        const index = filteredHanzi.indexOf(hanzi);
        
        if (index !== -1) {
            // 计算页码
            const page = Math.floor(index / perPage) + 1;
            
            // 切换到该页面
            displayHanziPage(page);
            
            // 选中该汉字
            selectHanzi(hanzi);
            
            // 查找并滚动到元素
            setTimeout(() => {
                const element = Array.from(document.querySelectorAll('.hanzi-item')).find(el => el.textContent === hanzi);
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }, 100);
        } else {
            // 汉字不在当前过滤集中，尝试在全部汉字中查找
            const allIndex = allHanzi.indexOf(hanzi);
            
            if (allIndex !== -1) {
                // 切换到全部汉字模式
                document.getElementById('filter-type').value = 'all';
                updateFilteredHanzi();
                
                // 重新搜索
                searchHanzi(query);
            } else {
                alert(`未找到汉字: ${hanzi}`);
            }
        }
    } else {
        alert('请输入有效的汉字');
    }
}

// 选择汉字
function selectHanzi(hanzi) {
    // 更新当前汉字
    currentChar = hanzi;
    
    console.log(`选中汉字: ${hanzi}`);
    
    // 更新UI
    document.querySelectorAll('.hanzi-item').forEach(item => {
        item.classList.remove('active');
        if (item.textContent === hanzi) {
            item.classList.add('active');
        }
    });
    
    // 更新显示区域
    const currentHanziElement = document.getElementById('current-hanzi');
    if (currentHanziElement) {
        currentHanziElement.innerHTML = `<span>${hanzi}</span>`;
    }
    
    // 加载汉字笔顺动画
    loadHanziWriter(hanzi);
    
    // 获取汉字信息
    fetchHanziInfo(hanzi);
    
    // 添加AI助手消息
    addMessage('assistant', `已选择汉字"${hanzi}"，请问你想了解什么？`);
}

// 加载汉字笔顺动画
function loadHanziWriter(hanzi) {
    // 清除旧的writer
    if (writer) {
        writer = null;
    }
    
    const container = document.getElementById('writer-container');
    if (!container) return;
    
    container.innerHTML = '';
    
    // 加载汉字数据
    HanziWriter.loadCharacterData(hanzi).then(data => {
        // 记录支持的汉字
        supportedHanzi.add(hanzi);
        updateHanziElement(hanzi);
        
        // 创建writer实例
        writer = HanziWriter.create('writer-container', hanzi, {
            width: 220,
            height: 220,
            padding: 5,
            showOutline: true,
            strokeColor: '#3a6ea5',
            outlineColor: '#eeeeee',
            strokeAnimationSpeed: 1,
            delayBetweenStrokes: 500
        });
        
        // 更新笔画数
        const strokeCountElement = document.querySelector('#stroke-count span');
        if (strokeCountElement) {
            strokeCountElement.textContent = data.strokes.length;
        }
        
        // 启用按钮
        enableButtons();
        
        // 设置按钮事件
        setupButtons();
    }).catch(error => {
        console.error(`加载汉字 "${hanzi}" 数据失败:`, error);
        
        // 显示简单的汉字
        container.innerHTML = `
            <div style="display: flex; justify-content: center; align-items: center; width: 100%; height: 100%;">
                <span style="font-size: 100px;">${hanzi}</span>
            </div>
        `;
        
        // 更新笔画数
        const strokeCountElement = document.querySelector('#stroke-count span');
        if (strokeCountElement) {
            strokeCountElement.textContent = '未知';
        }
        
        // 禁用按钮
        disableButtons();
    });
}

// 启用按钮
function enableButtons() {
    document.getElementById('animate-btn').disabled = false;
    document.getElementById('practice-btn').disabled = false;
    document.getElementById('reset-btn').disabled = false;
}

// 禁用按钮
function disableButtons() {
    document.getElementById('animate-btn').disabled = true;
    document.getElementById('practice-btn').disabled = true;
    document.getElementById('reset-btn').disabled = true;
}

// 设置按钮事件
function setupButtons() {
    // 动画演示按钮
    document.getElementById('animate-btn').onclick = () => {
        if (writer) {
            writer.animateCharacter();
        }
    };
    
    // 练习按钮
    document.getElementById('practice-btn').onclick = () => {
        if (writer) {
            writer.quiz();
        }
    };
    
    // 重置按钮
    document.getElementById('reset-btn').onclick = () => {
        if (writer) {
            writer.reset();
        }
    };
}

// 获取汉字信息
function fetchHanziInfo(hanzi) {
    // 简单的汉字数据映射（示例）
    const hanziInfo = {
        '我': { pinyin: 'wǒ', definition: '第一人称代词，自称，自己' },
        '你': { pinyin: 'nǐ', definition: '第二人称代词，指称对方' },
        '他': { pinyin: 'tā', definition: '第三人称代词，指称别人（男性）' },
        '好': { pinyin: 'hǎo/hào', definition: '美好、善良；表示同意、许可' },
        '爱': { pinyin: 'ài', definition: '喜爱、热爱；恋爱、爱情' },
        '国': { pinyin: 'guó', definition: '国家、国土；朝代' },
        '中': { pinyin: 'zhōng', definition: '中间、正中；中国；命中' },
        '大': { pinyin: 'dà', definition: '大小、规模广；年长的' }
    };
    
    // 更新拼音
    const pinyinElement = document.getElementById('pinyin');
    if (pinyinElement) {
        pinyinElement.textContent = hanziInfo[hanzi]?.pinyin || '暂无数据';
    }
    
    // 更新释义
    const definitionElement = document.getElementById('definition');
    if (definitionElement) {
        definitionElement.textContent = hanziInfo[hanzi]?.definition || '暂无数据';
        
        // 如果没有本地数据，通过AI助手获取更多信息
        if (!hanziInfo[hanzi]) {
            queryDeepSeekAPI(`请提供汉字"${hanzi}"的拼音和基本释义，简短回答。`, (response) => {
                definitionElement.textContent = response;
            });
        }
    }
}

// 添加消息到聊天区域
function addMessage(type, text) {
    const chatMessages = document.getElementById('chat-messages');
    if (!chatMessages) return;
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    
    const paragraph = document.createElement('p');
    paragraph.textContent = text;
    
    messageDiv.appendChild(paragraph);
    chatMessages.appendChild(messageDiv);
    
    // 滚动到底部
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// 发送消息
function sendMessage() {
    const userInput = document.getElementById('user-input');
    const text = userInput.value.trim();
    
    if (!text) return;
    
    // 添加用户消息
    addMessage('user', text);
    
    // 清空输入框
    userInput.value = '';
    
    // 构建完整提示
    let prompt = text;
    if (currentChar) {
        prompt = `关于汉字"${currentChar}"：${text}`;
    }
    
    // 调用AI API
    queryDeepSeekAPI(prompt, (response) => {
        addMessage('assistant', response);
    });
}

// 调用DeepSeek API
function queryDeepSeekAPI(prompt, callback) {
    // 添加思考中消息
    const thinkingId = 'thinking-message-' + Date.now();
    const chatMessages = document.getElementById('chat-messages');
    
    const thinkingDiv = document.createElement('div');
    thinkingDiv.className = 'message assistant';
    thinkingDiv.id = thinkingId;
    
    const thinkingText = document.createElement('p');
    thinkingText.textContent = '思考中...';
    
    thinkingDiv.appendChild(thinkingText);
    chatMessages.appendChild(thinkingDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    // 准备API请求
    fetch(DEEPSEEK_API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
        },
        body: JSON.stringify({
            model: 'deepseek-chat',
            messages: [
                {
                    role: 'system',
                    content: '你是一个汉字学习助手，专门提供关于汉字的知识。你知道汉字的发音、意思、用法、笔顺、部首、文化背景等。请提供简洁、准确、有教育意义的回答。'
                },
                {
                    role: 'user',
                    content: prompt
                }
            ],
            max_tokens: 500,
            temperature: 0.7
        })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`API请求失败: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        // 删除思考中消息
        const thinkingElement = document.getElementById(thinkingId);
        if (thinkingElement) {
            thinkingElement.remove();
        }
        
        // 提取回复内容
        const reply = data.choices[0].message.content;
        
        // 执行回调
        callback(reply);
    })
    .catch(error => {
        console.error('调用DeepSeek API失败:', error);
        
        // 删除思考中消息
        const thinkingElement = document.getElementById(thinkingId);
        if (thinkingElement) {
            thinkingElement.remove();
        }
        
        // 显示错误消息
        callback('抱歉，我无法处理你的请求。请稍后再试。');
    });
}

// 清空聊天
function clearChat() {
    const chatMessages = document.getElementById('chat-messages');
    if (chatMessages) {
        chatMessages.innerHTML = `
            <div class="message assistant">
                <p>你好！我是汉字AI助手。请选择一个汉字，我可以告诉你关于这个汉字的更多信息，或者回答你的问题。</p>
            </div>
        `;
    }
}
