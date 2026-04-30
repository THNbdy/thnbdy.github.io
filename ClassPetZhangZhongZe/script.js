// 商品分类
const itemCategories = {
    FURNITURE: 'furniture',  // 家具类（猫窝、坐垫等）
    TOY: 'toy',             // 玩具类（毛线球、纸箱城堡等）
    ACCESSORY: 'accessory',  // 配饰类（墨镜等）
    FOOD: 'food'            // 食物类（牛奶碗等）
};

// 商品数据
const shopItems = [
    { 
        id: 'item_bed_01', 
        name: '舒适张忠泽窝', 
        price: 50, 
        imageSrc: 'assets/images/items/item_bed_01.png',
        interactionImage: 'assets/images/character/char_cat_with_bed.png',
        rarity: 'epic',
        description: '让张忠泽享受舒适睡眠',
        category: itemCategories.FURNITURE
    },
    { 
        id: 'item_bowl_milk_01', 
        name: '牛奶碗', 
        price: 35, 
        imageSrc: 'assets/images/items/item_bowl_milk_01.png',
        interactionImage: 'assets/images/character/char_cat_drinking_bowlMilk.png',
        rarity: 'rare',
        description: '张忠泽最爱的饮品',
        category: itemCategories.FOOD
    },
    { 
        id: 'item_yarnball_01', 
        name: '毛线球', 
        price: 20, 
        imageSrc: 'assets/images/items/item_yarnball_01.png',
        interactionImage: 'assets/images/character/char_cat_with_yarnball.png',
        rarity: 'common',
        description: '张忠泽最爱的玩具',
        category: itemCategories.TOY
    },
    { 
        id: 'item_sunglasses_01', 
        name: '时尚墨镜', 
        price: 45, 
        imageSrc: 'assets/images/items/item_sunglasses_01.png',
        interactionImage: 'assets/images/character/char_cat_wearing_sunglasses.png',
        rarity: 'rare',
        description: '让张忠泽变得更酷',
        category: itemCategories.ACCESSORY
    },
    { 
        id: 'item_castle_cardboard_01', 
        name: '纸箱城堡', 
        price: 60, 
        imageSrc: 'assets/images/items/item_castle_cardboard_01.png',
        interactionImage: 'assets/images/character/char_cat_playingIn_castleCardboard.png',
        rarity: 'epic',
        description: '张忠泽的秘密基地',
        category: itemCategories.TOY
    },
    { 
        id: 'item_cushion_strawberry_01', 
        name: '野兽先生', 
        price: 40, 
        imageSrc: 'assets/images/items/item_cushion_strawberry_01.png',
        interactionImage: 'assets/images/character/char_cat_sittingOn_cushionStrawberry.png',
        rarity: 'rare',
        description: '让张忠泽⬛️100个人',
        category: itemCategories.FURNITURE
    }
];

// 收藏配置
const collectionConfig = {
    maxSlots: 12,
    slotsPerRow: 4
};

// 保存游戏数据
function saveGame() {
    const saveData = {
        fish: gameState.fish,
        catName: gameState.catName,
        purchasedItemIds: purchasedItemIds
    };

    try {
        localStorage.setItem('catGameSaveData', JSON.stringify(saveData));
        console.log('游戏已保存！');
    } catch (e) {
        console.error('保存游戏失败', e);
    }
}

// 加载游戏数据
function loadGame() {
    try {
        const savedDataJSON = localStorage.getItem('catGameSaveData');
        if (savedDataJSON) {
            const savedData = JSON.parse(savedDataJSON);

            gameState.fish = savedData.fish || 0;
            gameState.catName = savedData.catName || '小猎奇';
            purchasedItemIds = savedData.purchasedItemIds || [];

            console.log('游戏已加载！', savedData);
            return true; // 表示已加载数据
        }
    } catch (e) {
        console.error('加载游戏失败', e);
    }
    return false; // 没有存档或加载失败
}


// 玩家已购买物品
let purchasedItemIds = [];

// 游戏状态变量
let gameState = {
    fish: 0,
    catName: '小猎奇',
    currentMode: null,
    isGameRunning: false,
    audioContext: null,
    analyser: null,
    microphone: null,
    animationId: null,
    currentInteractionItem: null,
    originalCatImage: 'assets/images/character/char_cat_normal.png',
    progress: 0,
    modeSettings: null,
    startTime: null,
    effectiveTime: 0,        // 有效时间（毫秒）
    lastEffectiveCheck: null, // 上次有效时间检查的时间戳
    isCurrentlyEffective: false // 当前是否处于有效状态
};

// DOM元素引用
let elements = {};

// 游戏配置
const config = {
    quietModeReward: { fish: 5 },
    loudModeReward: { fish: 5 },
    progressSpeed: {
        quiet: 0.5,
        loud: 1.0
    },
    warningThresholds: {
        level1: 1.2,
        level2: 2.0
    },
    // 梯度奖励配置
    gradedRewards: {
        thresholds: [0.3, 0.6, 0.8, 0.9], // 有效时间占比阈值
        bonuses: [0, 1, 2, 3, 5]          // 对应的额外奖励
    },
    // 有效时间检查间隔（毫秒）
    effectiveTimeCheckInterval: 100
};

// 初始化游戏
window.addEventListener('DOMContentLoaded', function() {
    initializeElements();
    initializeEventListeners();

    if (loadGame()) {
        // 如果加载了存档，则更新UI并直接开始
        updateHUD();
        displayPurchasedItems();
        if (elements.collectionTitle) {
            elements.collectionTitle.textContent = `🎁 用魔丸为名为“${gameState.catName}”的张忠泽购买的物品`;
        }
        if (elements.setupModal) {
            elements.setupModal.style.display = 'none';
        }
        requestMicrophonePermission();
        if (elements.ocWatermark) {
            elements.ocWatermark.style.display = 'block';
        }
        console.log("已加载存档，开始游戏。");
    } else {
        // 否则，显示初始设置弹窗
        showSetupModal();
    }
});

// 保存猫咪名字
function saveCatName() {
    const catNameEdit = document.getElementById('cat-name-edit');
    const catNameDisplay = document.getElementById('cat-name-display');
    const nameEditContainer = document.getElementById('name-edit-container');
    const collectionTitle = document.getElementById('collection-title');
    
    if (catNameEdit && catNameEdit.value.trim() !== '') {
        gameState.catName = catNameEdit.value.trim();
        
        // 更新显示的猫咪名字
        if (catNameDisplay) {
            catNameDisplay.textContent = gameState.catName;
        }
        
        // 更新收藏区域标题
        if (collectionTitle) {
            collectionTitle.textContent = `🎁 用魔丸为名为“${gameState.catName}”的张忠泽购买的物品`;
        }
    }
    
    // 隐藏编辑框，显示名字
    if (nameEditContainer && catNameDisplay) {
        nameEditContainer.style.display = 'none';
        catNameDisplay.style.display = 'block';
    }
    saveGame();
}

// 获取所有DOM元素引用
function initializeElements() {
    elements = {
        // 主要游戏元素
        gameContainer: document.getElementById('game-container'),
        catImage: document.getElementById('cat-image'),
        catNameDisplay: document.getElementById('cat-name-display'),
        fishTreatDisplay: document.getElementById('fish-treat-display'),
        
        // 猫咪名字编辑
        nameEditContainer: document.getElementById('name-edit-container'),
        catNameEdit: document.getElementById('cat-name-edit'),
        saveNameButton: document.getElementById('save-name-button'),
        
        // 控制按钮
        startQuietModeButton: document.getElementById('start-quiet-mode-button'),
        startLoudModeButton: document.getElementById('start-loud-mode-button'),
        
        // 警告覆盖层
        warningOverlay: document.getElementById('warning-overlay'),
        warningIcon: document.getElementById('warning-icon'),
        
        // 弹窗
        setupModal: document.getElementById('setup-modal'),
        catNameInput: document.getElementById('cat-name-input'),
        startGameButton: document.getElementById('start-game-button'),
        micPermissionModal: document.getElementById('mic-permission-modal'),
        requestMicButton: document.getElementById('request-mic-button'),
        
        // 设置模态框
        gameSettingsModal: document.getElementById('game-settings-modal'),
        
        // 浮动状态面板
        floatingStatusPanel: document.getElementById('floating-status-panel'),
        statusProgress: document.getElementById('status-progress'),
        statusValue: document.getElementById('status-value'),
        pauseButton: document.getElementById('pause-button'),
        stopButton: document.getElementById('stop-button'),
        
        // 激励横幅
        encouragementBanner: document.getElementById('encouragement-banner'),
        encouragementText: document.getElementById('encouragement-text'),
        
        // 商店相关
        openShopButton: document.getElementById('open-shop-button'),
        shopModal: document.getElementById('shop-modal'),
        closeShopButton: document.getElementById('close-shop-button'),
        shopItemsGrid: document.getElementById('shop-items-grid'),
        shopFishBalance: document.getElementById('shop-fish-balance'),
        purchasedItemsContainer: document.getElementById('purchased-items-container'),
        collectionCount: document.getElementById('collection-count'),
        collectionTitle: document.getElementById('collection-title'),
        
        // Copyright elements
        copyrightModal: document.getElementById('copyright-modal-overlay'),
        copyrightOkButton: document.getElementById('copyright-ok-button'),
        ocWatermark: document.getElementById('oc-watermark')
    };
    
    // 调试：检查关键元素是否存在
    console.log('元素初始化完成：');
    console.log('gameSettingsModal:', elements.gameSettingsModal);
    console.log('startQuietModeButton:', elements.startQuietModeButton);
    console.log('startLoudModeButton:', elements.startLoudModeButton);
}

// 初始化事件监听器
function initializeEventListeners() {
    // 调试：检查元素是否存在
    console.log('startQuietModeButton:', elements.startQuietModeButton);
    console.log('startLoudModeButton:', elements.startLoudModeButton);
    console.log('closeShopButton:', elements.closeShopButton); // 添加调试信息
    
    // 模式按钮 - 现在打开设置模态框
    if (elements.startQuietModeButton) {
        elements.startQuietModeButton.addEventListener('click', showNapSettings);
        console.log('午睡按钮事件监听器已绑定');
    } else {
        console.error('找不到午睡按钮元素');
    }
    
    if (elements.startLoudModeButton) {
        elements.startLoudModeButton.addEventListener('click', showStorySettings);
        console.log('故事按钮事件监听器已绑定');
    } else {
        console.error('找不到故事按钮元素');
    }
    
    // 设置弹窗
    elements.startGameButton.addEventListener('click', startGame);
    elements.catNameInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            startGame();
        }
    });
    
    // 麦克风权限
    elements.requestMicButton.addEventListener('click', requestMicrophonePermission);
    
    // 商店相关
    if (elements.openShopButton) {
        elements.openShopButton.addEventListener('click', toggleShop);
    }
    
    // 确保关闭按钮事件正确绑定
    if (elements.closeShopButton) {
        console.log('绑定关闭按钮事件');
        elements.closeShopButton.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            console.log('关闭按钮被点击');
            closeShop();
            return false;
        }, true); // 使用捕获阶段
    }
    
    // 商店物品点击事件
    if (elements.shopItemsGrid) {
        elements.shopItemsGrid.addEventListener('click', handlePurchase);
    }
    
    // 商店模态框点击背景关闭
    if (elements.shopModal) {
        elements.shopModal.addEventListener('click', function(e) {
            // 只有点击模态框背景时才关闭
            if (e.target === elements.shopModal) {
                e.preventDefault();
                e.stopPropagation();
                closeShop();
            }
        });
    }
    
    // 猫咪名字编辑功能
    const catNameDisplay = document.getElementById('cat-name-display');
    const nameEditContainer = document.getElementById('name-edit-container');
    const catNameEdit = document.getElementById('cat-name-edit');
    const saveNameButton = document.getElementById('save-name-button');
    
    if (catNameDisplay && nameEditContainer && catNameEdit && saveNameButton) {
        // 点击名字显示编辑框
        catNameDisplay.addEventListener('click', function() {
            catNameDisplay.style.display = 'none';
            nameEditContainer.style.display = 'flex';
            catNameEdit.value = gameState.catName;
            catNameEdit.focus();
        });
        
        // 保存按钮点击事件
        saveNameButton.addEventListener('click', function() {
            saveCatName();
        });
        
        // 输入框回车事件
        catNameEdit.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                saveCatName();
            }
        });
        
        // 点击其他区域关闭编辑框
        document.addEventListener('click', function(e) {
            if (!catNameDisplay.contains(e.target) && 
                !nameEditContainer.contains(e.target) && 
                nameEditContainer.style.display !== 'none') {
                saveCatName();
            }
        });
    }
    
    // 猫咪点击互动
    elements.catImage.addEventListener('click', function() {
        // 如果正在互动中，点击猫咪恢复正常状态
        if (gameState.currentInteractionItem) {
            restoreNormalState();
            return;
        }
        
        // 正常状态下的点击效果
        this.classList.add('bounce');
        setTimeout(() => this.classList.remove('bounce'), 600);
        
        // 小概率获得奖励
        if (Math.random() < 0.3) {
            giveReward(1);
            showFloatingText('嘿嘿~ +1🔴', elements.catImage);
        }
    });

    // 游戏控制按钮
    if (elements.pauseButton) {
        elements.pauseButton.addEventListener('click', togglePause);
    }
    if (elements.stopButton) {
        elements.stopButton.addEventListener('click', stopGame);
    }
    
    // 设置模态框事件监听器
    setupSettingsModalListeners();

    // 版权功能
    setupCopyright();
}

// 版权功能设置
function setupCopyright() {
    if (!elements.copyrightModal || !elements.copyrightOkButton || !elements.ocWatermark) {
        console.error('Copyright elements not found.');
        return;
    }

    elements.copyrightOkButton.addEventListener('click', () => {
        elements.copyrightModal.classList.remove('show');
        try { 
            localStorage.setItem('dumaCopyrightSeen_CatGame', 'true'); 
        } catch (e) { 
            console.error("无法写入 localStorage", e); 
        }
    });

    elements.ocWatermark.addEventListener('click', () => {
        elements.copyrightModal.classList.add('show');
    });

    try { 
        if (!localStorage.getItem('dumaCopyrightSeen_CatGame')) { 
            setTimeout(() => elements.copyrightModal.classList.add('show'), 500); 
        } 
    } catch (e) { 
        console.error("无法访问 localStorage", e); 
        setTimeout(() => elements.copyrightModal.classList.add('show'), 500); 
    }
}

// 设置模态框事件监听器
function setupSettingsModalListeners() {
    const modal = elements.gameSettingsModal;
    if (!modal) return;
    
    // 音量阈值滑块
    const thresholdSlider = modal.querySelector('#volume-threshold-slider');
    const thresholdDisplay = modal.querySelector('#threshold-display');
    
    if (thresholdSlider && thresholdDisplay) {
        thresholdSlider.addEventListener('input', function() {
            thresholdDisplay.textContent = this.value;
        });
    }
    
    // 环境音量测试
    const currentVolumeDisplay = modal.querySelector('#current-volume');
    
    if (currentVolumeDisplay) {
        // 开始音量监测
        let volumeTestInterval = null;
        
        function startVolumeTest() {
            if (volumeTestInterval) return;
            
            volumeTestInterval = setInterval(() => {
                const volume = getCurrentVolume();
                currentVolumeDisplay.textContent = volume;
                
                // 根据音量值改变数字颜色
                if (volume > 40) {
                    currentVolumeDisplay.style.color = '#d63031';
                    currentVolumeDisplay.style.background = 'rgba(255, 118, 117, 0.15)';
                } else if (volume > 25) {
                    currentVolumeDisplay.style.color = '#e17055';
                    currentVolumeDisplay.style.background = 'rgba(253, 203, 110, 0.15)';
                } else {
                    currentVolumeDisplay.style.color = '#2ecc71';
                    currentVolumeDisplay.style.background = 'rgba(78, 205, 196, 0.15)';
                }
            }, 100);
        }
        
        function stopVolumeTest() {
            if (volumeTestInterval) {
                clearInterval(volumeTestInterval);
                volumeTestInterval = null;
            }
        }
        
        // 当设置模态框显示时开始测试
        modal.addEventListener('transitionend', function() {
            if (modal.style.display === 'flex') {
                startVolumeTest();
            }
        });
        
        // 当设置模态框显示时立即开始测试
        if (modal.style.display === 'flex') {
            startVolumeTest();
        }
        
        // 当设置模态框隐藏时停止测试
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.attributeName === 'style') {
                    if (modal.style.display === 'none') {
                        stopVolumeTest();
                    } else if (modal.style.display === 'flex') {
                        startVolumeTest();
                    }
                }
            });
        });
        
        observer.observe(modal, { attributes: true });
    }
    
    // 时间选择按钮
    const timeButtons = modal.querySelectorAll('.time-btn');
    const customTimeInput = modal.querySelector('#custom-time-input');
    
    timeButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            // 移除其他按钮的active类
            timeButtons.forEach(b => b.classList.remove('active'));
            // 添加当前按钮的active类
            this.classList.add('active');
            // 更新自定义输入框
            if (customTimeInput) {
                customTimeInput.value = this.getAttribute('data-time');
            }
        });
    });
    
    // 音量预设按钮
    modal.addEventListener('click', function(e) {
        if (e.target.classList.contains('volume-btn')) {
            // 移除其他按钮的active类
            modal.querySelectorAll('.volume-btn').forEach(btn => btn.classList.remove('active'));
            // 添加当前按钮的active类
            e.target.classList.add('active');
            // 更新滑块值
            if (thresholdSlider && thresholdDisplay) {
                const threshold = e.target.getAttribute('data-threshold');
                thresholdSlider.value = threshold;
                thresholdDisplay.textContent = threshold;
            }
        }
    });
    
    // 开始游戏按钮
    const startButton = modal.querySelector('#start-game-button');
    if (startButton) {
        startButton.addEventListener('click', function() {
            const mode = modal.getAttribute('data-mode');
            const threshold = thresholdSlider ? parseInt(thresholdSlider.value) : 25;
            const duration = customTimeInput ? parseInt(customTimeInput.value) * 60 : 600; // 转换为秒
            
            if (mode === 'nap') {
                startQuietMode(threshold, duration);
            } else if (mode === 'story') {
                startLoudMode(threshold, duration);
            }
            
            hideModal(modal);
        });
    }
    
    // 取消按钮
    const cancelButton = modal.querySelector('#cancel-settings-button');
    if (cancelButton) {
        cancelButton.addEventListener('click', function() {
            hideModal(modal);
        });
    }
    
    // 关闭按钮
    const closeButton = modal.querySelector('#close-settings-button');
    if (closeButton) {
        closeButton.addEventListener('click', function() {
            hideModal(modal);
        });
    }
    
    // 点击模态框背景关闭
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            hideModal(modal);
        }
    });
}

// 显示设置弹窗
function showSetupModal() {
    if (elements.setupModal) {
        elements.setupModal.style.display = 'flex';
        if (elements.catNameInput) {
            elements.catNameInput.focus();
        }
    }
}

// 显示午睡设置模态框
function showNapSettings() {
    if (!gameState.isGameRunning) {
        alert('请先允许麦克风权限！');
        return;
    }
    // 设置模态框标题和内容为午睡模式
    setupGameSettingsModal('nap');
    showModal(elements.gameSettingsModal);
}

// 显示故事时间设置模态框
function showStorySettings() {
    if (!gameState.isGameRunning) {
        alert('请先允许麦克风权限！');
        return;
    }
    // 设置模态框标题和内容为故事模式
    setupGameSettingsModal('story');
    showModal(elements.gameSettingsModal);
}

// 设置游戏设置模态框内容
function setupGameSettingsModal(mode) {
    const modal = elements.gameSettingsModal;
    console.log('setupGameSettingsModal 被调用，mode:', mode, 'modal:', modal);
    if (!modal) {
        console.error('gameSettingsModal 元素不存在');
        return;
    }
    
    const title = modal.querySelector('#settings-title');
    const volumeSectionTitle = modal.querySelector('#volume-section-title');
    const volumePresets = modal.querySelector('#volume-presets');
    
    if (mode === 'nap') {
        if (title) title.textContent = '🌙 守护午睡设置';
        if (volumeSectionTitle) volumeSectionTitle.textContent = '🔇 安静要求';
        if (volumePresets) {
            volumePresets.innerHTML = `
                <button class="volume-btn" data-threshold="15">超安静</button>
                <button class="volume-btn active" data-threshold="25">标准</button>
                <button class="volume-btn" data-threshold="35">宽松</button>
            `;
        }
    } else if (mode === 'story') {
        if (title) title.textContent = '📖 故事时间设置';
        if (volumeSectionTitle) volumeSectionTitle.textContent = '🔊 音量要求';
        if (volumePresets) {
            volumePresets.innerHTML = `
                <button class="volume-btn" data-threshold="20">轻声</button>
                <button class="volume-btn active" data-threshold="30">标准</button>
                <button class="volume-btn" data-threshold="40">响亮</button>
            `;
        }
    }
    
    // 存储当前模式
    modal.setAttribute('data-mode', mode);
}

// 显示模态框
function showModal(modal) {
    if (modal) {
        modal.style.display = 'flex'; // 直接设置display样式
        
        // 如果是设置模态框，立即开始音量测试
        if (modal === elements.gameSettingsModal) {
            const currentVolumeDisplay = modal.querySelector('#current-volume');
            
            if (currentVolumeDisplay) {
                // 立即更新一次音量显示
                const volume = getCurrentVolume();
                currentVolumeDisplay.textContent = volume;
                
                // 根据音量值改变数字颜色
                if (volume > 40) {
                    currentVolumeDisplay.style.color = '#d63031';
                    currentVolumeDisplay.style.background = 'rgba(255, 118, 117, 0.15)';
                } else if (volume > 25) {
                    currentVolumeDisplay.style.color = '#e17055';
                    currentVolumeDisplay.style.background = 'rgba(253, 203, 110, 0.15)';
                } else {
                    currentVolumeDisplay.style.color = '#2ecc71';
                    currentVolumeDisplay.style.background = 'rgba(78, 205, 196, 0.15)';
                }
            }
        }
        
        console.log('模态框已显示');
    } else {
        console.error('模态框元素不存在');
    }
}

// 隐藏模态框
function hideModal(modal) {
    if (modal) {
        modal.style.display = 'none'; // 直接设置display样式
        console.log('模态框已隐藏');
    }
}

// 开始游戏
function startGame() {
    const catName = elements.catNameInput ? elements.catNameInput.value.trim() : '';
    if (catName) {
        gameState.catName = catName;
        if (elements.catNameDisplay) {
            elements.catNameDisplay.textContent = catName;
        }
        
        // 更新收藏区域标题
        if (elements.collectionTitle) {
            elements.collectionTitle.textContent = `🎁 用魔丸为名为“${gameState.catName}”的张忠泽购买的物品`;
        }
    }
    
    if (elements.setupModal) {
        elements.setupModal.style.display = 'none';
    }
    requestMicrophonePermission();
    updateHUD();
    displayPurchasedItems();
    if (elements.ocWatermark) {
        elements.ocWatermark.style.display = 'block';
    }
}

// 请求麦克风权限
async function requestMicrophonePermission() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
            audio: {
                echoCancellation: false,
                noiseSuppression: false,
                autoGainControl: false
            }
        });
        
        setupAudioContext(stream);
        gameState.isGameRunning = true;
        if (elements.micPermissionModal) {
            elements.micPermissionModal.style.display = 'none';
        }
        
        console.log('麦克风权限获取成功');
    } catch (error) {
        console.error('麦克风权限获取失败:', error);
        if (elements.micPermissionModal) {
            elements.micPermissionModal.style.display = 'flex';
        }
    }
}

// 设置音频上下文
function setupAudioContext(stream) {
    gameState.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    gameState.analyser = gameState.audioContext.createAnalyser();
    gameState.microphone = gameState.audioContext.createMediaStreamSource(stream);
    
    gameState.analyser.fftSize = 256;
    gameState.analyser.smoothingTimeConstant = 0.8;
    
    gameState.microphone.connect(gameState.analyser);
    
    console.log('音频上下文设置完成');
}

// 获取当前音量
function getCurrentVolume() {
    if (!gameState.analyser) return 0;
    
    const bufferLength = gameState.analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    gameState.analyser.getByteFrequencyData(dataArray);
    
    let sum = 0;
    for (let i = 0; i < bufferLength; i++) {
        sum += dataArray[i];
    }
    
    const average = sum / bufferLength;
    return Math.round(average * 100 / 255);
}

// 开始安静模式
function startQuietMode(threshold = 30, duration = 300) {
    if (!gameState.isGameRunning) {
        alert('请先允许麦克风权限！');
        return;
    }
    
    gameState.currentMode = 'quiet';
    gameState.progress = 0;
    gameState.modeSettings = { threshold, duration };
    gameState.startTime = Date.now();
    
    // 重置有效时间相关状态
    gameState.effectiveTime = 0;
    gameState.lastEffectiveCheck = Date.now();
    gameState.isCurrentlyEffective = false;
    
    // 更新UI
    elements.startQuietModeButton.disabled = true;
    elements.startLoudModeButton.disabled = true;
    updateCatImage('assets/images/character/char_cat_sleep.png');
    
    // 显示浮动状态面板
    showFloatingStatusPanel('quiet');
    
    // 开始音量监测循环
    startVolumeMonitoring();
    
    console.log('安静模式开始', { threshold, duration });
}

// 开始朗读模式
function startLoudMode(threshold = 30, duration = 300) {
    if (!gameState.isGameRunning) {
        alert('请先允许麦克风权限！');
        return;
    }
    
    gameState.currentMode = 'loud';
    gameState.progress = 0;
    gameState.modeSettings = { threshold, duration };
    gameState.startTime = Date.now();
    
    // 重置有效时间相关状态
    gameState.effectiveTime = 0;
    gameState.lastEffectiveCheck = Date.now();
    gameState.isCurrentlyEffective = false;
    
    // 更新UI
    elements.startQuietModeButton.disabled = true;
    elements.startLoudModeButton.disabled = true;
    updateCatImage('assets/images/character/char_cat_normal.png');
    
    // 显示浮动状态面板
    showFloatingStatusPanel('loud');
    
    // 开始音量监测循环
    startVolumeMonitoring();
    
    console.log('朗读模式开始', { threshold, duration });
}

// 显示浮动状态面板
function showFloatingStatusPanel(mode) {
    if (elements.floatingStatusPanel) {
        elements.floatingStatusPanel.style.display = 'block';
        
        const modeIcon = document.getElementById('mode-icon');
        const modeTitle = document.getElementById('mode-title');
        
        if (mode === 'quiet') {
            if (modeIcon) modeIcon.textContent = '🌙';
            if (modeTitle) modeTitle.textContent = '守护午睡进行中';
        } else if (mode === 'loud') {
            if (modeIcon) modeIcon.textContent = '📖';
            if (modeTitle) modeTitle.textContent = '故事时间进行中';
        }
        
        updateFloatingStatusPanel();
    }
}

// 隐藏浮动状态面板
function hideFloatingStatusPanel() {
    if (elements.floatingStatusPanel) {
        elements.floatingStatusPanel.style.display = 'none';
    }
}

// 更新有效时间
function updateEffectiveTime(isEffective) {
    const now = Date.now();
    
    // 如果是第一次检查，初始化lastEffectiveCheck
    if (!gameState.lastEffectiveCheck) {
        gameState.lastEffectiveCheck = now;
        return;
    }
    
    // 计算自上次检查以来经过的时间
    const timeSinceLastCheck = now - gameState.lastEffectiveCheck;
    
    // 如果当前状态有效，增加有效时间
    if (isEffective && !gameState.isPaused) {
        gameState.effectiveTime += timeSinceLastCheck;
    }
    
    // 更新上次检查时间
    gameState.lastEffectiveCheck = now;
}

// 格式化时间（毫秒转为分钟和秒）
function formatTime(milliseconds) {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}分${seconds}秒`;
}

// 更新浮动状态面板
function updateFloatingStatusPanel() {
    const volumeStatus = document.getElementById('volume-status');
    const timeRemaining = document.getElementById('time-remaining');
    const effectiveTimeValue = document.getElementById('effective-time-value');
    
    if (!gameState.currentMode) return;
    
    const currentVolume = getCurrentVolume();
    const threshold = gameState.modeSettings?.threshold || 20;
    const duration = gameState.modeSettings?.duration || 300;
    let elapsed;
    if (gameState.isPaused) {
        elapsed = (gameState.pausedTime || 0) / 1000;
    } else {
        elapsed = (Date.now() - gameState.startTime) / 1000;
    }
    const remaining = Math.max(0, duration - elapsed);
    const remainingMinutes = Math.ceil(remaining / 60);
    
    // 计算有效时间占比（仅用于奖励计算，不再显示进度条）
    const totalElapsedMs = elapsed * 1000;
    const effectiveTimeRatio = totalElapsedMs > 0 ? gameState.effectiveTime / totalElapsedMs : 0;
    
    if (gameState.currentMode === 'quiet') {
        const isQuiet = currentVolume <= threshold;
        if (volumeStatus) {
            volumeStatus.textContent = `${isQuiet ? '安静中' : '太吵了'} (音量: ${Math.round(currentVolume)} ≤ ${threshold})`;
            volumeStatus.style.color = isQuiet ? '#4CAF50' : '#F44336';
        }
    } else if (gameState.currentMode === 'loud') {
        const isLoud = currentVolume >= threshold;
        if (volumeStatus) {
            volumeStatus.textContent = `${isLoud ? '朗读中' : '声音太小'} (音量: ${Math.round(currentVolume)} ≥ ${threshold})`;
            volumeStatus.style.color = isLoud ? '#4CAF50' : '#F44336';
        }
    }
    
    if (timeRemaining) {
        if (remainingMinutes > 0) {
            timeRemaining.textContent = `还需 ${remainingMinutes}分钟`;
        } else {
            timeRemaining.textContent = `即将完成`;
        }
    }
    
    // 更新有效时间显示
    if (effectiveTimeValue) {
        effectiveTimeValue.textContent = formatTime(gameState.effectiveTime);
        
        // 根据有效时间比例改变颜色
        if (effectiveTimeRatio >= 0.9) {
            effectiveTimeValue.style.color = '#2ecc71';
        } else if (effectiveTimeRatio >= 0.7) {
            effectiveTimeValue.style.color = '#3498db';
        } else if (effectiveTimeRatio >= 0.5) {
            effectiveTimeValue.style.color = '#f1c40f';
        } else if (effectiveTimeRatio >= 0.3) {
            effectiveTimeValue.style.color = '#e67e22';
        } else {
            effectiveTimeValue.style.color = '#e74c3c';
        }
    }
}

// 开始音量监测循环
function startVolumeMonitoring() {
    function monitorLoop() {
        if (!gameState.currentMode) return;
        
        // 如果游戏暂停，只更新UI但不处理游戏逻辑
        if (gameState.isPaused) {
            updateFloatingStatusPanel();
            gameState.animationId = requestAnimationFrame(monitorLoop);
            return;
        }
        
        const volume = getCurrentVolume();
        
        if (gameState.currentMode === 'quiet') {
            handleQuietModeLogic(volume);
        } else if (gameState.currentMode === 'loud') {
            handleLoudModeLogic(volume);
        }
        
        gameState.animationId = requestAnimationFrame(monitorLoop);
    }
    
    monitorLoop();
}

// 处理安静模式逻辑
function handleQuietModeLogic(volume) {
    const threshold = gameState.modeSettings.threshold;
    const duration = gameState.modeSettings.duration;
    const elapsed = (Date.now() - gameState.startTime) / 1000;
    
    // 检查是否到达设定时间
    if (elapsed >= duration) {
        completeMode();
        return;
    }
    
    // 根据时间计算进度百分比
    gameState.progress = (elapsed / duration) * 100;
    
    // 检查当前是否处于有效状态（音量低于阈值）
    const isEffective = volume <= threshold;
    
    // 更新有效时间
    updateEffectiveTime(isEffective);
    
    if (isEffective) {
        hideWarning();
        hideEncouragementBanner();
        gameState.isCurrentlyEffective = true;
        
        if (elements.catImage.src.indexOf('char_cat_sleep.png') === -1) {
            updateCatImage('assets/images/character/char_cat_sleep.png');
        }
        
    } else if (volume < threshold * config.warningThresholds.level1) {
        showWarning(1);
        updateCatImage('assets/images/character/char_cat_startled.png');
        gameState.isCurrentlyEffective = false;
        
    } else if (volume < threshold * config.warningThresholds.level2) {
        showWarning(2);
        updateCatImage('assets/images/character/char_cat_startled.png');
        const catName = gameState.catName || '小猎奇';
        showEncouragementBanner(getEncouragementMessage('quiet', catName));
        gameState.isCurrentlyEffective = false;
        
    } else {
        showWarning(2);
        updateCatImage('assets/images/character/char_cat_startled.png');
        const catName = gameState.catName || '小猎奇';
        showEncouragementBanner(getEncouragementMessage('quiet', catName));
        if (elements.catImage) {
            elements.catImage.classList.add('shake');
            setTimeout(() => elements.catImage.classList.remove('shake'), 500);
        }
        gameState.isCurrentlyEffective = false;
    }
    
    updateFloatingStatusPanel();
}

// 处理朗读模式逻辑
function handleLoudModeLogic(volume) {
    const threshold = gameState.modeSettings.threshold;
    const duration = gameState.modeSettings.duration;
    const elapsed = (Date.now() - gameState.startTime) / 1000;
    
    // 检查是否到达设定时间
    if (elapsed >= duration) {
        completeMode();
        return;
    }
    
    // 根据时间计算进度百分比
    gameState.progress = (elapsed / duration) * 100;
    
    // 检查当前是否处于有效状态（音量高于阈值）
    const isEffective = volume >= threshold;
    
    // 更新有效时间
    updateEffectiveTime(isEffective);
    
    if (isEffective) {
        hideEncouragementBanner();
        gameState.isCurrentlyEffective = true;
        if (volume > threshold * 1.5) {
            updateCatImage('assets/images/character/char_cat_happy.png');
        } else {
            updateCatImage('assets/images/character/char_cat_normal.png');
        }
    } else {
        updateCatImage('assets/images/character/char_cat_normal.png');
        const catName = gameState.catName || '张忠泽';
        showEncouragementBanner(getEncouragementMessage('loud', catName));
        gameState.isCurrentlyEffective = false;
    }
    
    updateFloatingStatusPanel();
}

// 显示警告
function showWarning(level) {
    if (elements.warningOverlay) {
        elements.warningOverlay.style.display = 'flex';
        elements.warningOverlay.className = `warning-level-${level}`;
    }
}

// 隐藏警告
function hideWarning() {
    if (elements.warningOverlay) {
        elements.warningOverlay.style.display = 'none';
    }
}

// 完成模式
function completeMode() {
    if (gameState.animationId) {
        cancelAnimationFrame(gameState.animationId);
        gameState.animationId = null;
    }
    
    // 计算基础奖励
    const baseReward = gameState.currentMode === 'quiet' ? 
        config.quietModeReward : config.loudModeReward;
    
    // 计算有效时间占比
    const totalElapsedMs = (Date.now() - gameState.startTime);
    const effectiveTimeRatio = totalElapsedMs > 0 ? gameState.effectiveTime / totalElapsedMs : 0;
    
    // 根据有效时间占比计算额外奖励
    let bonusIndex = 0;
    for (let i = 0; i < config.gradedRewards.thresholds.length; i++) {
        if (effectiveTimeRatio >= config.gradedRewards.thresholds[i]) {
            bonusIndex = i + 1;
        } else {
            break;
        }
    }
    
    const bonusFish = config.gradedRewards.bonuses[bonusIndex];
    const totalReward = baseReward.fish + bonusFish;
    
    // 给予奖励
    giveReward(totalReward);
    
    // 更新猫咪图像
    updateCatImage('assets/images/character/char_cat_happy.png');
    if (elements.catImage) {
        elements.catImage.classList.add('bounce');
        setTimeout(() => elements.catImage.classList.remove('bounce'), 600);
    }
    
    hideWarning();
    hideEncouragementBanner();
    
    // 显示完成信息
    const modeText = gameState.currentMode === 'quiet' ? '午睡' : '故事时间';
    const effectivePercent = Math.round(effectiveTimeRatio * 100);
    
    // 创建奖励信息弹窗
    const rewardInfo = document.createElement('div');
    rewardInfo.className = 'reward-info';
    rewardInfo.innerHTML = `
        <h3>${modeText}完成！</h3>
        <div class="reward-details">
            <p>基础奖励: ${baseReward.fish}🔴</p>
            <p>有效时间: ${formatTime(gameState.effectiveTime)} (${effectivePercent}%)</p>
            <p>额外奖励: ${bonusFish}🔴</p>
            <p class="total-reward">总计获得: ${totalReward}🔴</p>
        </div>
        <button class="close-reward-btn">确认</button>
    `;
    
    document.body.appendChild(rewardInfo);
    
    // 显示浮动文本
    showFloatingText(`${modeText}完成！+${totalReward}🔴`, elements.catImage);
    
    // 添加关闭按钮点击事件
    const closeButton = rewardInfo.querySelector('.close-reward-btn');
    closeButton.addEventListener('click', () => {
        if (rewardInfo.parentNode) {
            rewardInfo.parentNode.removeChild(rewardInfo);
        }
        hideFloatingStatusPanel();
    });
    
    // 重置游戏状态
    gameState.currentMode = null;
    gameState.progress = 0;
    gameState.modeSettings = null;
    gameState.effectiveTime = 0;
    gameState.lastEffectiveCheck = null;
    gameState.isCurrentlyEffective = false;
    
    setTimeout(() => {
        elements.startQuietModeButton.disabled = false;
        elements.startLoudModeButton.disabled = false;
        
        if (!gameState.currentInteractionItem) {
            gameState.originalCatImage = elements.catImage.src;
        }
    }, 2000);
    
    console.log(`${modeText}模式完成，有效时间比例: ${effectiveTimeRatio.toFixed(2)}, 额外奖励: ${bonusFish}`);
}

// 给予奖励
function giveReward(fishAmount) {
    gameState.fish += fishAmount;
    updateHUD();
    saveGame();
}

// 更新HUD显示
function updateHUD() {
    if (elements.catNameDisplay) {
        elements.catNameDisplay.textContent = gameState.catName;
    }
    if (elements.fishTreatDisplay) {
        elements.fishTreatDisplay.textContent = gameState.fish;
    }
    if (elements.shopFishBalance) {
        elements.shopFishBalance.textContent = gameState.fish;
    }
}

// 商店功能
function toggleShop() {
    console.log('toggleShop 被调用');
    
    if (!elements.shopModal) {
        console.error('shopModal 元素不存在');
        return;
    }
    
    const isVisible = elements.shopModal.classList.contains('visible');
    console.log('当前商店可见状态:', isVisible);
    
    if (isVisible) {
        // 关闭商店
        closeShop();
    } else {
        // 打开商店前重置商店状态
        resetShopState();
        
        // 打开商店
        elements.shopModal.style.display = 'block';
        elements.shopModal.classList.add('visible');
        document.body.classList.add('shop-open'); // 添加shop-open类
        
        // 确保商店内容区域可见
        const shopContent = elements.shopModal.querySelector('.shop-content');
        if (shopContent) {
            shopContent.style.display = 'flex';
        }
        
        // 确保商店网格可见
        if (elements.shopItemsGrid) {
            elements.shopItemsGrid.style.display = 'grid';
            elements.shopItemsGrid.style.pointerEvents = 'auto';
        }
        
        // 每次打开商店时更新商店内容和余额显示
        renderShopItems();
        
        // 更新魔丸余额显示
        if (elements.shopFishBalance) {
            elements.shopFishBalance.textContent = gameState.fish;
        }
        
        updateHUD();
        
        console.log('商店已打开');
    }
}

// 重置商店状态（仅在打开商店时调用）
function resetShopState() {
    // 确保商店内容区域是可见的
    const shopContent = elements.shopModal.querySelector('.shop-content');
    if (shopContent) {
        shopContent.style.display = 'flex';
    }
    
    // 确保商店网格是可见的
    if (elements.shopItemsGrid) {
        elements.shopItemsGrid.style.display = 'grid';
        elements.shopItemsGrid.style.gridTemplateColumns = 'repeat(1, 1fr)';
    }
}

// 关闭商店函数
function closeShop() {
    console.log('closeShop 函数被调用');
    
    if (!elements.shopModal) {
        console.error('shopModal 元素不存在');
        return;
    }
    
    // 强制关闭商店，确保不会重新打开
    elements.shopModal.classList.remove('visible');
    document.body.classList.remove('shop-open');
    
    // 立即隐藏商店模态框
    elements.shopModal.style.display = 'none';
    
    // 额外的安全措施：确保商店完全隐藏
    elements.shopModal.style.visibility = 'hidden';
    elements.shopModal.style.opacity = '0';
    
    console.log('商店已关闭');
    
    // 延迟重置可见性，为下次打开做准备
    setTimeout(() => {
        if (elements.shopModal && !elements.shopModal.classList.contains('visible')) {
            elements.shopModal.style.visibility = 'visible';
            elements.shopModal.style.opacity = '1';
        }
    }, 300);
}

// 窗口大小改变时重新检查布局
window.addEventListener('resize', function() {
    // 保持响应式布局，不需要特殊处理
});

function renderShopItems() {
    console.log('renderShopItems 被调用');
    
    if (!elements.shopItemsGrid) {
        console.error('shopItemsGrid 元素不存在');
        return;
    }
    
    elements.shopItemsGrid.innerHTML = '';
    
    // 确保商店网格是可见的
    elements.shopItemsGrid.style.display = 'grid';
    
    // 设置为2列布局
    elements.shopItemsGrid.style.gridTemplateColumns = 'repeat(2, 1fr)';
    
    // 如果没有商品，显示提示信息
    if (shopItems.length === 0) {
        const emptyMessage = document.createElement('div');
        emptyMessage.className = 'empty-shop-message';
        emptyMessage.innerHTML = `
            <div class="empty-shop-icon">🐱</div>
            <p>暂时没有可购买的物品</p>
            <p>请稍后再来看看吧！</p>
        `;
        elements.shopItemsGrid.appendChild(emptyMessage);
        return;
    }
    
    console.log('渲染商品数量:', shopItems.length);
    
    // 直接渲染所有商品，不按分类分组
    shopItems.forEach((item, index) => {
        // 确保商品有价格属性
        if (item.price === undefined || item.price === null) {
            console.log(`商品 ${item.name} 没有价格，设置默认价格 20`);
            item.price = 20;
        }
        
        const shopItemDiv = document.createElement('div');
        shopItemDiv.className = 'shop-item';
        
        const isOwned = purchasedItemIds.includes(item.id);
        const canAfford = gameState.fish >= item.price;
        const slotsAvailable = purchasedItemIds.length < collectionConfig.maxSlots;
        
        // 确定按钮状态和文本
        let buttonText = '购买';
        let buttonDisabled = false;
        let buttonClass = '';
        
        if (isOwned) {
            buttonText = '已拥有';
            buttonDisabled = true;
            buttonClass = 'owned';
        } else if (!slotsAvailable) {
            buttonText = '槽位已满';
            buttonDisabled = true;
            buttonClass = 'slot-full';
        } else if (!canAfford) {
            buttonText = '余额不足';
            buttonDisabled = true;
            buttonClass = 'insufficient';
        }
        
        shopItemDiv.innerHTML = `
            <img src="${item.imageSrc}" alt="${item.name}" class="shop-item-img">
            <div class="item-content">
                <div>
                    <h3>${item.name}</h3>
                    <p class="item-description">${item.description}</p>
                </div>
                <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
                    <div class="price" style="display: flex; align-items: center;">
                        <img src="assets/images/ui/ui_icon_fish.png" alt="魔丸" class="icon" style="width: 16px; height: 16px; margin-right: 3px;">
                        <span>${item.price}</span>
                    </div>
                    <button class="buy-button ${buttonClass}" 
                            data-item-id="${item.id}" 
                            ${buttonDisabled ? 'disabled' : ''}
                            style="pointer-events: ${buttonDisabled ? 'none' : 'auto'};">
                        ${buttonText}
                    </button>
                </div>
            </div>
        `;
        
        // 确保价格区域和购买按钮可见
        const priceElement = shopItemDiv.querySelector('.price');
        const buyButton = shopItemDiv.querySelector('.buy-button');
        
        if (priceElement) {
            priceElement.style.display = 'flex';
        }
        
        if (buyButton) {
            buyButton.style.display = 'block';
        }
        
        elements.shopItemsGrid.appendChild(shopItemDiv);
        
        console.log(`渲染商品 ${index + 1}: ${item.name}, 按钮状态: ${buttonText}`);
    });
    
    console.log('商品渲染完成');
}

function handlePurchase(event) {
    // 阻止事件冒泡
    event.preventDefault();
    event.stopPropagation();
    
    console.log('handlePurchase 被调用，点击目标:', event.target);
    
    // 检查是否点击了购买按钮
    if (!event.target.classList.contains('buy-button')) {
        console.log('不是购买按钮，忽略点击');
        return;
    }
    
    const itemId = event.target.getAttribute('data-item-id');
    console.log('尝试购买物品 ID:', itemId);
    
    const item = shopItems.find(item => item.id === itemId);
    
    if (!item) {
        console.error('找不到物品:', itemId);
        return;
    }
    
    // 检查是否已拥有
    if (purchasedItemIds.includes(itemId)) {
        console.log('物品已拥有:', itemId);
        showFloatingText('您已经拥有这个物品了！', event.target);
        return;
    }
    
    // 检查余额是否足够
    if (gameState.fish < item.price) {
        console.log('余额不足，当前:', gameState.fish, '需要:', item.price);
        showFloatingText('魔丸不够了！', event.target);
        return;
    }
    
    // 检查收藏槽位
    if (purchasedItemIds.length >= collectionConfig.maxSlots) {
        console.log('收藏槽位已满');
        showFloatingText('收藏槽位已满！', event.target);
        return;
    }
    
    // 执行购买
    gameState.fish -= item.price;
    purchasedItemIds.push(itemId);
    saveGame();
    
    console.log(`成功购买 ${item.name}，花费 ${item.price} 魔丸，剩余 ${gameState.fish}`);
    
    // 更新界面
    updateHUD();
    renderShopItems();
    displayPurchasedItems();
    
    const rarityText = getRarityText(item.rarity);
    showFloatingText(`获得${rarityText} ${item.name}！`, event.target);
    
    // 不自动关闭商店，让用户可以继续购买其他物品
    console.log('购买完成，商店保持打开状态');
}

// 获取稀有度文本
// 稀有度分类已移除

function displayPurchasedItems() {
    if (!elements.purchasedItemsContainer) return;
    
    elements.purchasedItemsContainer.innerHTML = '';
    
    if (purchasedItemIds.length === 0) {
        const collectionArea = document.getElementById('items-collection-area');
        if (collectionArea) {
            collectionArea.classList.remove('has-items');
        }
        return;
    }
    
    const collectionArea = document.getElementById('items-collection-area');
    if (collectionArea) {
        collectionArea.classList.add('has-items');
    }
    
    purchasedItemIds.forEach(itemId => {
        const item = shopItems.find(item => item.id === itemId);
        if (!item) return;
        
        if (gameState.currentInteractionItem === itemId) {
            // 创建游戏控制器按钮，点击可以恢复正常状态
            const interactingSlot = document.createElement('div');
            interactingSlot.className = 'item-slot interacting';
            interactingSlot.innerHTML = '🎮';
            interactingSlot.title = `正在与${item.name}互动中...\n点击恢复正常状态`;
            
            // 添加点击事件，恢复正常状态
            interactingSlot.addEventListener('click', () => {
                restoreNormalState();
            });
            
            elements.purchasedItemsContainer.appendChild(interactingSlot);
        } else {
            const itemImg = document.createElement('img');
            itemImg.src = item.imageSrc;
            itemImg.alt = item.name;
            itemImg.className = `purchased-item-img ${itemId} rarity-${item.rarity}`;
            itemImg.title = `${item.name}\n${item.description}\n点击互动`;
            
            itemImg.addEventListener('click', () => {
                interactWithItem(itemId);
            });
            
            elements.purchasedItemsContainer.appendChild(itemImg);
        }
    });
    
    updateCollectionCount();
}

// 更新收藏计数显示
function updateCollectionCount() {
    if (!elements.collectionCount) return;
    
    const currentCount = purchasedItemIds.length;
    elements.collectionCount.textContent = currentCount;
    
    if (currentCount >= 10) {
        elements.collectionCount.style.background = 'linear-gradient(135deg, #f39c12, #e67e22)';
        elements.collectionCount.style.color = 'white';
        elements.collectionCount.style.borderColor = 'rgba(243, 156, 18, 0.8)';
    } else if (currentCount >= 7) {
        elements.collectionCount.style.background = 'linear-gradient(135deg, #9b59b6, #8e44ad)';
        elements.collectionCount.style.color = 'white';
        elements.collectionCount.style.borderColor = 'rgba(155, 89, 182, 0.8)';
    } else if (currentCount >= 4) {
        elements.collectionCount.style.background = 'linear-gradient(135deg, #3498db, #2980b9)';
        elements.collectionCount.style.color = 'white';
        elements.collectionCount.style.borderColor = 'rgba(52, 152, 219, 0.8)';
    } else {
        elements.collectionCount.style.background = 'rgba(255, 255, 255, 0.5)';
        elements.collectionCount.style.color = '#2d3436';
        elements.collectionCount.style.borderColor = 'rgba(255, 255, 255, 0.6)';
    }
}

// 猫咪与物品互动
function interactWithItem(itemId) {
    const item = shopItems.find(item => item.id === itemId);
    if (!item || !item.interactionImage) return;
    
    const img = new Image();
    img.onload = () => {
        showInteractionEffect(item);
    };
    img.onerror = () => {
        showFloatingText(`${item.name}的互动图片还未添加`, elements.catImage);
        console.warn(`互动图片不存在: ${item.interactionImage}`);
    };
    img.src = item.interactionImage;
}

// 显示互动效果
function showInteractionEffect(item) {
    if (gameState.currentInteractionItem) {
        restoreNormalState();
    }
    
    if (!gameState.currentInteractionItem) {
        gameState.originalCatImage = elements.catImage.src;
    }
    
    elements.catImage.src = item.interactionImage;
    elements.catImage.classList.add('bounce');
    
    gameState.currentInteractionItem = item.id;
    
    elements.catImage.classList.add('interacting');
    
    displayPurchasedItems();
    
    showFloatingText(`${gameState.catName}正在享受${item.name}！`, elements.catImage);
    
    giveReward(2);
    showFloatingText('+2🔴', elements.fishTreatDisplay);
    
    setTimeout(() => {
        elements.catImage.classList.remove('bounce');
    }, 600);
    
    console.log(`${gameState.catName}与${item.name}互动了！`);
}

// 恢复正常状态
function restoreNormalState() {
    if (!gameState.currentInteractionItem) return;
    
    elements.catImage.src = gameState.originalCatImage;
    
    elements.catImage.classList.remove('interacting');
    
    gameState.currentInteractionItem = null;
    
    displayPurchasedItems();
    
    console.log('恢复到正常状态');
}

// 更新猫咪状态显示（考虑互动状态）
function updateCatImage(newSrc) {
    if (gameState.currentInteractionItem) {
        return;
    }
    
    gameState.originalCatImage = newSrc;
    elements.catImage.src = newSrc;
}

// 显示浮动文字
function showFloatingText(text, element) {
    if (!element) return;
    
    const floatingText = document.createElement('div');
    floatingText.textContent = text;
    floatingText.style.cssText = `
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        color: #00b894;
        font-weight: bold;
        font-size: 18px;
        pointer-events: none;
        z-index: 100;
        animation: floatUp 2s ease-out forwards;
    `;
    
    const style = document.createElement('style');
    style.textContent = `
        @keyframes floatUp {
            0% { opacity: 1; transform: translate(-50%, -50%); }
            100% { opacity: 0; transform: translate(-50%, -150%); }
        }
    `;
    document.head.appendChild(style);
    
    element.style.position = 'relative';
    element.appendChild(floatingText);
    
    setTimeout(() => {
        if (floatingText.parentNode) {
            floatingText.parentNode.removeChild(floatingText);
        }
        if (style.parentNode) {
            style.parentNode.removeChild(style);
        }
    }, 2000);
}

// 错误处理
window.addEventListener('error', function(e) {
    console.error('游戏错误:', e.error);
});

// 页面卸载时清理资源
window.addEventListener('beforeunload', function() {
    saveGame(); // 离开前保存游戏
    if (gameState.animationId) {
        cancelAnimationFrame(gameState.animationId);
    }
    if (gameState.audioContext) {
        gameState.audioContext.close();
    }
});

// 调试功能（开发时使用）
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    window.gameDebug = {
        getGameState: () => gameState,
        giveReward: giveReward,
        setFish: (value) => {
            gameState.fish = Math.max(0, value);
            updateHUD();
        },
        buyItem: (itemId) => {
            const item = shopItems.find(item => item.id === itemId);
            if (item && !purchasedItemIds.includes(itemId) && gameState.fish >= item.price) {
                gameState.fish -= item.price;
                purchasedItemIds.push(itemId);
                updateHUD();
                displayPurchasedItems();
                console.log(`调试购买: ${item.name}`);
            }
        },
        resetShop: () => {
            purchasedItemIds = [];
            displayPurchasedItems();
            console.log('商店已重置');
        }
    };
    console.log('调试功能已启用，使用 window.gameDebug 访问');
}

// 游戏控制函数
function togglePause() {
    if (!gameState.currentMode) return;
    
    if (gameState.isPaused) {
        // 恢复游戏
        gameState.isPaused = false;
        gameState.pausedTime = Date.now() - gameState.startTime - (gameState.pausedDuration || 0);
        gameState.startTime = Date.now() - (gameState.pausedTime || 0);
        elements.pauseButton.textContent = '▶️';
        elements.pauseButton.title = '继续';
        console.log('游戏恢复');
    } else {
        // 暂停游戏
        gameState.isPaused = true;
        gameState.pausedTime = Date.now() - gameState.startTime;
        elements.pauseButton.textContent = '⏸️';
        elements.pauseButton.title = '暂停';
        console.log('游戏暂停');
    }
}

function stopGame() {
    if (!gameState.currentMode) return;
    
    // 确认停止
    if (confirm('确定要停止当前游戏并返回设置吗？')) {
        // 重置游戏状态
        gameState.currentMode = null;
        gameState.progress = 0;
        gameState.isPaused = false;
        gameState.pausedTime = 0;
        gameState.pausedDuration = 0;
        
        // 隐藏状态面板
        hideFloatingStatusPanel();
        
        // 恢复按钮状态
        elements.startQuietModeButton.disabled = false;
        elements.startLoudModeButton.disabled = false;
        
        // 恢复猫咪图片
        updateCatImage('assets/images/character/char_cat_normal.png');
        
        console.log('游戏已停止');
    }
}

// 激励横幅控制函数
let currentEncouragementMessage = '';
let lastEncouragementTime = 0;
const ENCOURAGEMENT_COOLDOWN = 3000; // 3秒冷却时间

function showEncouragementBanner(message) {
    if (elements.encouragementBanner && elements.encouragementText) {
        const now = Date.now();
        
        // 如果横幅已经显示且消息相同，不重复显示
        if (elements.encouragementBanner.classList.contains('show') && currentEncouragementMessage === message) {
            return;
        }
        
        // 冷却时间内不显示新消息
        if (now - lastEncouragementTime < ENCOURAGEMENT_COOLDOWN) {
            return;
        }
        
        currentEncouragementMessage = message;
        lastEncouragementTime = now;
        
        elements.encouragementText.textContent = message;
        elements.encouragementBanner.style.display = 'block';
        elements.encouragementBanner.classList.add('show', 'pulse');
    }
}

function hideEncouragementBanner() {
    if (elements.encouragementBanner) {
        elements.encouragementBanner.classList.remove('show', 'pulse');
        setTimeout(() => {
            elements.encouragementBanner.style.display = 'none';
        }, 300);
        currentEncouragementMessage = ''; // 重置当前消息
        stableEncouragementMessage = ''; // 重置稳定消息
        lastEncouragementMode = '';
        lastEncouragementCatName = '';
    }
}

// 获取激励文案
let lastEncouragementMode = '';
let lastEncouragementCatName = '';
let stableEncouragementMessage = '';

function getEncouragementMessage(mode, catName) {
    // 如果模式和猫名没变，返回相同的消息
    if (mode === lastEncouragementMode && catName === lastEncouragementCatName && stableEncouragementMessage) {
        return stableEncouragementMessage;
    }
    
    const messages = {
        quiet: [
            `${catName}需要安静的环境才能好好休息哦！`,
            `嘘~ ${catName}正在睡觉，请大家保持安静`,
            `${catName}说：太吵了，我睡不着觉了！`,
            `请帮助${catName}营造一个安静的午睡环境`
        ],
        loud: [
            `${catName}听不到，请大家再大声一点！`,
            `${catName}想听到大家的朗读声，再大声些吧！`,
            `${catName}说：我想听清楚大家在读什么`,
            `声音太小了，${catName}都要睡着了！`
        ]
    };
    
    const modeMessages = messages[mode] || messages.loud;
    stableEncouragementMessage = modeMessages[Math.floor(Math.random() * modeMessages.length)];
    lastEncouragementMode = mode;
    lastEncouragementCatName = catName;
    
    return stableEncouragementMessage;
}