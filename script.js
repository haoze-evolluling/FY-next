// 时间显示功能
function updateTime() {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    document.getElementById('timeDisplay').textContent = `${hours}:${minutes}`;
}

// 初始化时更新一次时间
updateTime();

// 每分钟更新一次时间
setInterval(updateTime, 60000);

// 本地存储功能
const localStorageHandler = {
    saveSettings: function(settings) {
        localStorage.setItem('userSettings', JSON.stringify(settings));
    },
    
    loadSettings: function() {
        const savedSettings = localStorage.getItem('userSettings');
        return savedSettings ? JSON.parse(savedSettings) : {
            searchEngine: 'baidu', // 默认搜索引擎
            theme: 'default',      // 默认主题
            wallpaper: 'default',  // 默认壁纸
            showWeather: true,     // 显示天气
            customIcons: [],       // 自定义图标排序
            customWebsites: []     // 自定义网站
        };
    },
    
    updateSetting: function(key, value) {
        const settings = this.loadSettings();
        settings[key] = value;
        this.saveSettings(settings);
        return settings;
    },
    
    // 保存自定义网站
    saveCustomWebsite: function(website) {
        const settings = this.loadSettings();
        if (!settings.customWebsites) {
            settings.customWebsites = [];
        }
        settings.customWebsites.push(website);
        this.saveSettings(settings);
        return settings;
    },
    
    // 删除自定义网站
    deleteCustomWebsite: function(index) {
        const settings = this.loadSettings();
        if (settings.customWebsites && settings.customWebsites.length > index) {
            settings.customWebsites.splice(index, 1);
            this.saveSettings(settings);
        }
        return settings;
    },
    
    // 获取所有自定义网站
    getCustomWebsites: function() {
        const settings = this.loadSettings();
        return settings.customWebsites || [];
    }
};

// 应用图标网格显示状态
let appGridVisible = true;

// 创建设置模态框函数（全局）
function createSettingsModal(title) {
    const modal = document.createElement('div');
    modal.classList.add('settings-modal');
    
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>${title}</h3>
                <span class="close-modal">&times;</span>
            </div>
            <div class="modal-body"></div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // 添加淡入效果
    animationHandler.fadeIn(modal, 'flex');
    
    modal.querySelector('.close-modal').addEventListener('click', function() {
        closeModal(modal);
    });
    
    // 点击模态框外部关闭
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeModal(modal);
        }
    });
    
    return modal;
}

// 关闭模态框函数（全局）
function closeModal(modal) {
    animationHandler.fadeOut(modal, () => {
        if (modal.parentNode) {
            document.body.removeChild(modal);
        }
    });
}

// 自定义网站处理
const customWebsiteHandler = {
    // 创建自定义网站图标
    createWebsiteIcon: function(website, index) {
        const appIcon = document.createElement('div');
        appIcon.className = 'app-icon custom-website';
        appIcon.setAttribute('role', 'button');
        appIcon.setAttribute('aria-label', website.name);
        appIcon.setAttribute('data-index', index);
        
        const iconBg = document.createElement('div');
        iconBg.className = 'icon-bg';
        
        // 如果有图标URL，则使用图片，否则使用网站名称首字母
        if (website.iconUrl && website.iconUrl.trim() !== '') {
            const img = document.createElement('img');
            img.src = website.iconUrl;
            img.alt = website.name;
            img.onerror = function() {
                // 图片加载失败时，使用文字替代
                this.style.display = 'none';
                iconBg.innerHTML = `<span>${website.name.charAt(0)}</span>`;
            };
            iconBg.appendChild(img);
        } else {
            iconBg.innerHTML = `<span>${website.name.charAt(0)}</span>`;
        }
        
        const iconText = document.createElement('div');
        iconText.className = 'icon-text';
        iconText.textContent = website.name;
        
        appIcon.appendChild(iconBg);
        appIcon.appendChild(iconText);
        
        // 添加点击事件
        appIcon.addEventListener('click', function(e) {
            // 如果点击的是编辑按钮，则不打开网站
            if (e.target.classList.contains('edit-icon') || e.target.closest('.edit-icon')) {
                return;
            }
            
            window.open(website.url, '_blank');
            animationHandler.addClickEffect(iconBg);
        });
        
        // 添加长按/右键菜单功能
        appIcon.addEventListener('contextmenu', function(e) {
            e.preventDefault();
            customWebsiteHandler.showWebsiteOptions(website, index);
        });
        
        return appIcon;
    },
    
    // 显示添加网站表单
    showAddWebsiteForm: function() {
        const modal = createSettingsModal('添加网站');
        const form = document.createElement('form');
        form.className = 'website-form';
        form.innerHTML = `
            <div class="form-group">
                <label for="websiteName">网站名称</label>
                <input type="text" id="websiteName" required placeholder="请输入网站名称">
            </div>
            <div class="form-group">
                <label for="websiteUrl">网站地址</label>
                <input type="url" id="websiteUrl" required placeholder="https://example.com">
            </div>
            <div class="form-group">
                <label for="iconUrl">图标URL (可选)</label>
                <input type="url" id="iconUrl" placeholder="https://example.com/favicon.ico">
            </div>
            <div class="form-actions">
                <button type="submit" class="btn-save">保存</button>
                <button type="button" class="btn-cancel">取消</button>
            </div>
        `;
        
        modal.querySelector('.modal-body').appendChild(form);
        modal.querySelector('.modal-body').style.gridTemplateColumns = '1fr';
        
        // 保存按钮事件
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const websiteName = document.getElementById('websiteName').value.trim();
            const websiteUrl = document.getElementById('websiteUrl').value.trim();
            const iconUrl = document.getElementById('iconUrl').value.trim();
            
            if (!websiteName || !websiteUrl) {
                alert('请填写网站名称和地址');
                return;
            }
            
            // 确保URL格式正确
            let url = websiteUrl;
            if (!/^https?:\/\//i.test(url)) {
                url = 'https://' + url;
            }
            
            const website = {
                name: websiteName,
                url: url,
                iconUrl: iconUrl
            };
            
            // 保存到本地存储
            localStorageHandler.saveCustomWebsite(website);
            
            // 重新加载自定义网站图标
            customWebsiteHandler.loadCustomWebsites();
            
            // 关闭模态框
            closeModal(modal);
        });
        
        // 取消按钮事件
        form.querySelector('.btn-cancel').addEventListener('click', function() {
            closeModal(modal);
        });
    },
    
    // 显示网站选项（编辑/删除）
    showWebsiteOptions: function(website, index) {
        const modal = createSettingsModal('网站选项');
        const optionsDiv = document.createElement('div');
        optionsDiv.className = 'website-options';
        optionsDiv.innerHTML = `
            <div class="website-info">
                <h4>${website.name}</h4>
                <p>${website.url}</p>
            </div>
            <div class="website-actions">
                <button class="btn-delete">删除网站</button>
            </div>
        `;
        
        modal.querySelector('.modal-body').appendChild(optionsDiv);
        modal.querySelector('.modal-body').style.gridTemplateColumns = '1fr';
        
        // 删除按钮事件
        optionsDiv.querySelector('.btn-delete').addEventListener('click', function() {
            if (confirm(`确定要删除 ${website.name} 吗？`)) {
                localStorageHandler.deleteCustomWebsite(index);
                customWebsiteHandler.loadCustomWebsites();
                closeModal(modal);
            }
        });
    },
    
    // 加载所有自定义网站
    loadCustomWebsites: function() {
        const appGrid = document.getElementById('appGrid');
        const addIcon = document.querySelector('.app-icon.add-icon');
        
        // 移除现有的自定义网站图标
        document.querySelectorAll('.app-icon.custom-website').forEach(icon => {
            appGrid.removeChild(icon);
        });
        
        // 获取自定义网站列表
        const websites = localStorageHandler.getCustomWebsites();
        
        // 添加自定义网站图标
        websites.forEach((website, index) => {
            const websiteIcon = this.createWebsiteIcon(website, index);
            // 将自定义网站图标插入到添加图标之前
            appGrid.insertBefore(websiteIcon, addIcon);
        });
    }
};

// 动画处理工具
const animationHandler = {
    // 统一过渡动画时间
    transitionTimes: {
        fast: 200,    // 对应CSS变量 --transition-fast
        normal: 300,  // 对应CSS变量 --transition-normal
        slow: 500     // 对应CSS变量 --transition-slow
    },
    
    // 添加点击动画效果
    addClickEffect: function(element, scale = 0.9) {
        element.classList.add('clicked');
        setTimeout(() => {
            element.classList.remove('clicked');
        }, this.transitionTimes.fast);
    },
    
    // 添加淡入淡出效果
    fadeIn: function(element, displayType = 'block') {
        element.style.opacity = '0';
        element.style.display = displayType;
        
        setTimeout(() => {
            element.style.transition = `opacity ${this.transitionTimes.normal}ms`;
            element.style.opacity = '1';
        }, 10);
    },
    
    fadeOut: function(element, callback = null) {
        element.style.transition = `opacity ${this.transitionTimes.normal}ms`;
        element.style.opacity = '0';
        
        setTimeout(() => {
            element.style.display = 'none';
            if (callback && typeof callback === 'function') {
                callback();
            }
        }, this.transitionTimes.normal);
    },
    
    // 切换应用图标网格显示/隐藏
    toggleAppGrid: function() {
        const appGrid = document.getElementById('appGrid');
        const phoneIcon = document.querySelector('.dock-icon[aria-label="手机"]');
        const container = document.querySelector('.container');
        
        if (appGridVisible) {
            // 隐藏应用图标网格
            this.fadeOut(appGrid);
            phoneIcon.classList.add('active');
            container.classList.add('grid-hidden');
        } else {
            // 显示应用图标网格
            this.fadeIn(appGrid, 'grid');
            phoneIcon.classList.remove('active');
            container.classList.remove('grid-hidden');
        }
        
        // 切换显示状态
        appGridVisible = !appGridVisible;
    }
};

// 天气功能
const weatherHandler = {
    apiKey: '5f3fa0cad9a1d1d5c3eea5be38abbc48', // 这是一个示例API key，实际使用时应替换为自己的
    
    async getWeather(city = '北京') {
        try {
            const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${this.apiKey}&units=metric&lang=zh_cn`);
            if (!response.ok) {
                throw new Error('天气数据获取失败');
            }
            const data = await response.json();
            return {
                temp: Math.round(data.main.temp),
                description: data.weather[0].description,
                icon: data.weather[0].icon,
                city: data.name
            };
        } catch (error) {
            console.error('获取天气失败:', error);
            return null;
        }
    },
    
    async updateWeatherUI() {
        const weatherElement = document.getElementById('weatherDisplay');
        if (!weatherElement) return;
        
        const settings = localStorageHandler.loadSettings();
        if (!settings.showWeather) {
            animationHandler.fadeOut(weatherElement);
            return;
        }
        
        const weatherData = await this.getWeather();
        if (weatherData) {
            weatherElement.innerHTML = `
                <div class="weather-icon">
                    <img src="https://openweathermap.org/img/wn/${weatherData.icon}.png" alt="${weatherData.description}">
                </div>
                <div class="weather-info">
                    <div class="weather-temp">${weatherData.temp}°C</div>
                    <div class="weather-desc">${weatherData.description}</div>
                    <div class="weather-city">${weatherData.city}</div>
                </div>
            `;
            animationHandler.fadeIn(weatherElement, 'flex');
        } else {
            weatherElement.innerHTML = '<div class="weather-error">天气数据暂时无法获取</div>';
            animationHandler.fadeIn(weatherElement, 'flex');
        }
    }
};

// 搜索功能
const searchHandler = {
    engines: {
        baidu: {
            name: '百度',
            url: 'https://www.baidu.com/s?wd='
        },
        google: {
            name: 'Google',
            url: 'https://www.google.com/search?q='
        },
        bing: {
            name: '必应',
            url: 'https://www.bing.com/search?q='
        },
        sogou: {
            name: '搜狗',
            url: 'https://www.sogou.com/web?query='
        }
    },
    
    search(query) {
        if (!query.trim()) return;
        
        const settings = localStorageHandler.loadSettings();
        const engine = this.engines[settings.searchEngine] || this.engines.baidu;
        
        window.open(engine.url + encodeURIComponent(query), '_blank');
    },
    
    updateSearchPlaceholder() {
        const settings = localStorageHandler.loadSettings();
        const engine = this.engines[settings.searchEngine] || this.engines.baidu;
        document.querySelector('.search-bar-default input').placeholder = `使用${engine.name}搜索...`;
    },
    
    animateSearchBar() {
        const container = document.querySelector('.container');
        container.classList.add('search-active');
        setTimeout(() => {
            container.classList.remove('search-active');
        }, animationHandler.transitionTimes.normal);
    }
};

// 主题与壁纸功能
const themeHandler = {
    themes: {
        default: {
            name: '默认主题',
            bg: 'rgba(0, 0, 0, 0.2)',
            textColor: 'white',
            searchBg: 'rgba(255, 255, 255, 0.8)',
            dockBg: 'rgba(255, 255, 255, 0.3)'
        },
        dark: {
            name: '深色模式',
            bg: 'rgba(0, 0, 0, 0.6)',
            textColor: 'white',
            searchBg: 'rgba(50, 50, 50, 0.8)',
            dockBg: 'rgba(50, 50, 50, 0.6)'
        },
        light: {
            name: '浅色模式',
            bg: 'rgba(255, 255, 255, 0.5)',
            textColor: 'black',
            searchBg: 'rgba(255, 255, 255, 0.9)',
            dockBg: 'rgba(255, 255, 255, 0.7)'
        }
    },
    
    wallpapers: {
        default: './background image/backgroud01.png',
        nature: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e',
        city: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390',
        abstract: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab'
    },
    
    applyTheme(themeName) {
        const theme = this.themes[themeName] || this.themes.default;
        const root = document.documentElement;
        
        root.style.setProperty('--bg-overlay', theme.bg);
        root.style.setProperty('--text-color', theme.textColor);
        root.style.setProperty('--search-bg', theme.searchBg);
        root.style.setProperty('--dock-bg', theme.dockBg);
        
        localStorageHandler.updateSetting('theme', themeName);
    },
    
    applyWallpaper(wallpaperName) {
        const wallpaper = this.wallpapers[wallpaperName] || this.wallpapers.default;
        
        // 预加载图片，确保平滑过渡
        const img = new Image();
        img.onload = () => {
            document.body.style.backgroundImage = `url('${wallpaper}')`;
            localStorageHandler.updateSetting('wallpaper', wallpaperName);
        };
        img.src = wallpaper;
    },
    
    init() {
        const settings = localStorageHandler.loadSettings();
        this.applyTheme(settings.theme);
        this.applyWallpaper(settings.wallpaper);
    }
};

// 设置菜单功能
document.addEventListener('DOMContentLoaded', function() {
    // 获取用户设置
    const settings = localStorageHandler.loadSettings();
    
    // 初始化 CSS 变量
    const root = document.documentElement;
    root.style.setProperty('--bg-overlay', themeHandler.themes[settings.theme].bg);
    root.style.setProperty('--text-color', themeHandler.themes[settings.theme].textColor);
    root.style.setProperty('--search-bg', themeHandler.themes[settings.theme].searchBg);
    root.style.setProperty('--dock-bg', themeHandler.themes[settings.theme].dockBg);
    
    // 应用壁纸
    document.body.style.backgroundImage = `url('${themeHandler.wallpapers[settings.wallpaper]}')`;
    
    // 初始化应用图标网格显示状态
    if (!appGridVisible) {
        const appGrid = document.getElementById('appGrid');
        const phoneIcon = document.querySelector('.dock-icon[aria-label="手机"]');
        const container = document.querySelector('.container');
        
        animationHandler.fadeOut(appGrid);
        phoneIcon.classList.add('active');
        container.classList.add('grid-hidden');
    }
    
    // 设置搜索框
    const searchInput = document.querySelector('.search-bar-default input');
    searchInput.disabled = false;
    searchHandler.updateSearchPlaceholder();
    
    // 设置菜单显示/隐藏功能
    const settingsIcon = document.querySelector('.settings-icons .settings-icon:nth-child(2)');
    const settingsMenu = document.getElementById('settingsMenu');
    
    // 初始化天气显示
    weatherHandler.updateWeatherUI();
    
    // 点击设置图标显示/隐藏设置菜单
    settingsIcon.addEventListener('click', function(e) {
        e.stopPropagation();
        if (settingsMenu.classList.contains('active')) {
            settingsMenu.classList.remove('active');
        } else {
            settingsMenu.classList.add('active');
        }
    });
    
    // 点击页面其他区域隐藏设置菜单
    document.addEventListener('click', function(event) {
        if (!settingsIcon.contains(event.target) && !settingsMenu.contains(event.target)) {
            settingsMenu.classList.remove('active');
        }
    });
    
    // 搜索栏功能
    const searchBar = document.querySelector('.search-bar-default');
    const searchForm = document.getElementById('searchForm');
    
    searchBar.addEventListener('click', function() {
        searchHandler.animateSearchBar();
    });
    
    searchForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const query = searchInput.value;
        searchHandler.search(query);
    });
    
    // 设置菜单功能实现
    document.querySelectorAll('#settingsMenu li').forEach(item => {
        item.addEventListener('click', function() {
            const action = this.getAttribute('data-action');
            
            if (action === 'theme') {
                showThemeOptions();
            } else if (action === 'wallpaper') {
                showWallpaperOptions();
            } else if (action === 'search-engine') {
                showSearchEngineOptions();
            } else if (action === 'weather') {
                toggleWeather();
            } else if (action === 'about') {
                showAboutInfo();
            }
            
            // 关闭菜单
            settingsMenu.classList.remove('active');
        });
    });
    
    function showThemeOptions() {
        const modal = createSettingsModal('选择主题');
        
        Object.keys(themeHandler.themes).forEach(themeName => {
            const theme = themeHandler.themes[themeName];
            const themeOption = document.createElement('div');
            themeOption.classList.add('theme-option');
            themeOption.textContent = theme.name;
            themeOption.style.backgroundColor = theme.bg;
            themeOption.style.color = theme.textColor;
            
            if (settings.theme === themeName) {
                themeOption.classList.add('selected');
            }
            
            themeOption.addEventListener('click', function() {
                themeHandler.applyTheme(themeName);
                animationHandler.addClickEffect(this);
                setTimeout(() => closeModal(modal), animationHandler.transitionTimes.fast);
            });
            
            modal.querySelector('.modal-body').appendChild(themeOption);
        });
    }
    
    function showWallpaperOptions() {
        const modal = createSettingsModal('选择壁纸');
        
        Object.keys(themeHandler.wallpapers).forEach(wallpaperName => {
            const wallpaperUrl = themeHandler.wallpapers[wallpaperName];
            const wallpaperOption = document.createElement('div');
            wallpaperOption.classList.add('wallpaper-option');
            wallpaperOption.style.backgroundImage = `url('${wallpaperUrl}')`;
            
            if (settings.wallpaper === wallpaperName) {
                wallpaperOption.classList.add('selected');
            }
            
            wallpaperOption.addEventListener('click', function() {
                themeHandler.applyWallpaper(wallpaperName);
                animationHandler.addClickEffect(this);
                setTimeout(() => closeModal(modal), animationHandler.transitionTimes.fast);
            });
            
            modal.querySelector('.modal-body').appendChild(wallpaperOption);
        });
    }
    
    function showSearchEngineOptions() {
        const modal = createSettingsModal('选择搜索引擎');
        
        Object.keys(searchHandler.engines).forEach(engineKey => {
            const engine = searchHandler.engines[engineKey];
            const engineOption = document.createElement('div');
            engineOption.classList.add('engine-option');
            engineOption.textContent = engine.name;
            
            if (settings.searchEngine === engineKey) {
                engineOption.classList.add('selected');
            }
            
            engineOption.addEventListener('click', function() {
                localStorageHandler.updateSetting('searchEngine', engineKey);
                searchHandler.updateSearchPlaceholder();
                animationHandler.addClickEffect(this);
                setTimeout(() => closeModal(modal), animationHandler.transitionTimes.fast);
            });
            
            modal.querySelector('.modal-body').appendChild(engineOption);
        });
    }
    
    function toggleWeather() {
        const showWeather = !settings.showWeather;
        localStorageHandler.updateSetting('showWeather', showWeather);
        weatherHandler.updateWeatherUI();
    }
    
    function showAboutInfo() {
        const modal = createSettingsModal('关于');
        const aboutContent = document.createElement('div');
        aboutContent.classList.add('about-content');
        aboutContent.innerHTML = `
            <p>起始页面 v1.0</p>
            <p>一个简洁、美观、实用的浏览器起始页</p>
            <p>包含搜索功能、天气显示、自定义主题等功能</p>
            <p>©2023 作者保留所有权利</p>
        `;
        
        modal.querySelector('.modal-body').appendChild(aboutContent);
        modal.querySelector('.modal-body').style.gridTemplateColumns = '1fr';
    }
    
    // 使用全局的createSettingsModal和closeModal函数
    
    // 应用图标链接功能
    const appIcons = document.querySelectorAll('.app-icon:not(.add-icon):not(.custom-website)');
    appIcons.forEach(icon => {
        const iconName = icon.querySelector('.icon-text').textContent;
        let url = '#';
        
        // 根据图标名称设置链接
        switch(iconName.trim()) {
            case '翻译':
                url = 'https://fanyi.baidu.com/';
                break;
            case 'AI 工具':
                url = 'https://chat.openai.com/';
                break;
            case '图片':
                url = 'https://image.baidu.com/';
                break;
            case '邮件':
                url = 'https://mail.qq.com/';
                break;
            case '云存储':
                url = 'https://pan.baidu.com/';
                break;
            case 'QQ 邮箱':
                url = 'https://mail.qq.com/';
                break;
            case '云音乐':
                url = 'https://music.163.com/';
                break;
            case 'bilibili':
                url = 'https://www.bilibili.com/';
                break;
            case '图库':
                url = 'https://huaban.com/';
                break;
            case '网页主题':
                url = '#';
                icon.addEventListener('click', function() {
                    showThemeOptions();
                });
                break;
        }
        
        if (url !== '#') {
            icon.addEventListener('click', function() {
                window.open(url, '_blank');
            });
        }
        
        // 添加点击效果
        icon.addEventListener('click', function() {
            animationHandler.addClickEffect(this.querySelector('.icon-bg'));
        });
    });
    
    // 添加网站按钮点击事件
    const addIcon = document.querySelector('.app-icon.add-icon');
    if (addIcon) {
        addIcon.addEventListener('click', function() {
            customWebsiteHandler.showAddWebsiteForm();
            animationHandler.addClickEffect(this.querySelector('.icon-bg'));
        });
    }
    
    // 加载自定义网站
    customWebsiteHandler.loadCustomWebsites();
    
    // 底部快捷栏图标点击效果和链接
    const dockIcons = document.querySelectorAll('.dock-icon');
    const dockUrls = [
        '#', // 📱 - 手机图标特殊处理，不跳转链接
        'https://www.google.com/', // 🌐
        'https://github.com/', // 🔄
        'https://unsplash.com/', // 📷
        'https://drive.google.com/', // 📁
        'https://www.icloud.com/', // ☁️
        'https://gmail.com/', // 📧
        'https://open.spotify.com/', // 🎵
        'https://www.youtube.com/', // 📺
        'https://photos.google.com/', // 🖼️
        'https://weather.com/' // 🌞
    ];
    
    dockIcons.forEach((icon, index) => {
        icon.addEventListener('click', function() {
            // 添加点击效果
            animationHandler.addClickEffect(this);
            
            // 手机图标特殊处理
            if (index === 0) {
                animationHandler.toggleAppGrid();
                return;
            }
            
            // 打开对应链接
            if (dockUrls[index] && dockUrls[index] !== '#') {
                window.open(dockUrls[index], '_blank');
            }
        });
    });
});

// 添加CSS动画效果
document.addEventListener('DOMContentLoaded', function() {
    // 为CSS添加点击动画样式
    const style = document.createElement('style');
    style.textContent = `
        .app-icon.clicked .icon-bg,
        .dock-icon.clicked {
            transform: scale(0.9);
            transition: transform 0.2s;
        }
        
        .container.search-active .search-bar-default {
            transform: scale(1.05);
            transition: transform 0.3s;
        }
    `;
    document.head.appendChild(style);
});