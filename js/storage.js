/**
 * 数据存储模块
 */
const Storage = (function() {
    // 存储键名
    const BOOKMARKS_KEY = 'yunji_bookmarks';
    const CATEGORIES_KEY = 'yunji_categories';
    
    // 初始化默认分类和书签
    const initializeDefaults = () => {
        // 默认分类
        const defaultCategories = [
            { id: '1', name: '资讯社交' },
            { id: '2', name: '娱乐购物' },
            { id: '3', name: '学习开发' },
            { id: '4', name: '生活工具' }
        ];
        
        // 默认书签
        const defaultBookmarks = [
            // 资讯社交
            { id: '6', name: '微博', url: 'https://weibo.com', icon: 'https://weibo.com/favicon.ico', categoryId: '1' },
            { id: '7', name: '微信网页版', url: 'https://web.wechat.com', icon: 'https://web.wechat.com/favicon.ico', categoryId: '1' },
            { id: '8', name: '知乎', url: 'https://www.zhihu.com', icon: 'https://www.zhihu.com/favicon.ico', categoryId: '1' },
            { id: '21', name: '新浪新闻', url: 'https://news.sina.com.cn', icon: 'https://news.sina.com.cn/favicon.ico', categoryId: '1' },
            { id: '22', name: '腾讯新闻', url: 'https://news.qq.com', icon: 'https://news.qq.com/favicon.ico', categoryId: '1' },
            
            // 娱乐购物
            { id: '11', name: '哔哩哔哩', url: 'https://www.bilibili.com', icon: 'https://www.bilibili.com/favicon.ico', categoryId: '2' },
            { id: '16', name: '淘宝', url: 'https://www.taobao.com', icon: 'https://www.taobao.com/favicon.ico', categoryId: '2' },
            { id: '17', name: '京东', url: 'https://www.jd.com', icon: 'https://www.jd.com/favicon.ico', categoryId: '2' },
            { id: '18', name: '拼多多', url: 'https://www.pinduoduo.com', icon: 'https://www.pinduoduo.com/favicon.ico', categoryId: '2' },
            { id: '13', name: '腾讯视频', url: 'https://v.qq.com', icon: 'https://v.qq.com/favicon.ico', categoryId: '2' },
            
            // 学习开发
            { id: '26', name: '中国大学MOOC', url: 'https://www.icourse163.org', icon: 'https://www.icourse163.org/favicon.ico', categoryId: '3' },
            { id: '36', name: 'GitHub', url: 'https://github.com', icon: 'https://github.com/favicon.ico', categoryId: '3' },
            { id: '37', name: 'Gitee', url: 'https://gitee.com', icon: 'https://gitee.com/favicon.ico', categoryId: '3' },
            { id: '38', name: 'Stack Overflow', url: 'https://stackoverflow.com', icon: 'https://stackoverflow.com/favicon.ico', categoryId: '3' },
            { id: '30', name: '菜鸟教程', url: 'https://www.runoob.com', icon: 'https://www.runoob.com/favicon.ico', categoryId: '3' },
            
            // 生活工具
            { id: '1', name: '百度', url: 'https://www.baidu.com', icon: 'https://www.baidu.com/favicon.ico', categoryId: '4' },
            { id: '5', name: '高德地图', url: 'https://www.amap.com', icon: 'https://www.amap.com/favicon.ico', categoryId: '4' },
            { id: '31', name: '美团', url: 'https://www.meituan.com', icon: 'https://www.meituan.com/favicon.ico', categoryId: '4' },
            { id: '35', name: '12306', url: 'https://www.12306.cn', icon: 'https://www.12306.cn/favicon.ico', categoryId: '4' },
            { id: '33', name: '携程', url: 'https://www.ctrip.com', icon: 'https://www.ctrip.com/favicon.ico', categoryId: '4' }
        ];
        
        // 存入本地存储
        localStorage.setItem(CATEGORIES_KEY, JSON.stringify(defaultCategories));
        localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(defaultBookmarks));
        
        return {
            categories: defaultCategories,
            bookmarks: defaultBookmarks
        };
    };
    
    // 获取所有分类
    const getCategories = () => {
        const categoriesJSON = localStorage.getItem(CATEGORIES_KEY);
        if (!categoriesJSON) {
            const defaults = initializeDefaults();
            return defaults.categories;
        }
        return JSON.parse(categoriesJSON);
    };
    
    // 获取所有书签
    const getBookmarks = () => {
        const bookmarksJSON = localStorage.getItem(BOOKMARKS_KEY);
        if (!bookmarksJSON) {
            const defaults = initializeDefaults();
            return defaults.bookmarks;
        }
        return JSON.parse(bookmarksJSON);
    };
    
    // 添加新分类
    const addCategory = (name) => {
        const categories = getCategories();
        const newCategory = {
            id: Date.now().toString(),
            name: name
        };
        
        categories.push(newCategory);
        localStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories));
        return newCategory;
    };
    
    // 更新分类
    const updateCategory = (id, name) => {
        const categories = getCategories();
        const index = categories.findIndex(cat => cat.id === id);
        
        if (index !== -1) {
            categories[index].name = name;
            localStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories));
            return categories[index];
        }
        
        return null;
    };
    
    // 删除分类
    const deleteCategory = (id) => {
        const categories = getCategories();
        const filteredCategories = categories.filter(cat => cat.id !== id);
        
        // 同时删除该分类下的所有书签
        const bookmarks = getBookmarks();
        const filteredBookmarks = bookmarks.filter(bookmark => bookmark.categoryId !== id);
        
        localStorage.setItem(CATEGORIES_KEY, JSON.stringify(filteredCategories));
        localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(filteredBookmarks));
        
        return {
            removedCategoryId: id,
            remainingCategories: filteredCategories,
            remainingBookmarks: filteredBookmarks
        };
    };
    
    // 添加新书签
    const addBookmark = (name, url, icon, categoryId) => {
        const bookmarks = getBookmarks();
        const newBookmark = {
            id: Date.now().toString(),
            name: name,
            url: url,
            icon: icon || getFaviconUrl(url), // 使用新的图标获取函数
            categoryId: categoryId
        };
        
        bookmarks.push(newBookmark);
        localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(bookmarks));
        return newBookmark;
    };
    
    // 获取网站图标的函数
    const getFaviconUrl = (url) => {
        try {
            // 1. 首先尝试从Bing获取图标
            const bingFaviconUrl = `https://www.bing.com/favicon/search?url=${domain}`;
            
            // 2. 如果Bing失败，尝试从百度获取图标
            const baiduFaviconUrl = `https://statics.dnspod.cn/proxy_favicon/_/favicon?domain=${domain}`;
            
            // 3. 如果都失败，直接使用网站的favicon.ico
            const directFaviconUrl = `https://${domain}/favicon.ico`;
            
            // 返回备选图标URL数组
            return [bingFaviconUrl, baiduFaviconUrl, directFaviconUrl];
        } catch (error) {
            // 如果URL解析失败，返回默认图标
            console.error("图标获取失败:", error);
            return "images/default-icon.png";
        }
    };
    
    // 更新书签
    const updateBookmark = (id, data) => {
        const bookmarks = getBookmarks();
        const index = bookmarks.findIndex(bookmark => bookmark.id === id);
        
        if (index !== -1) {
            bookmarks[index] = {
                ...bookmarks[index],
                ...data
            };
            localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(bookmarks));
            return bookmarks[index];
        }
        
        return null;
    };
    
    // 删除书签
    const deleteBookmark = (id) => {
        const bookmarks = getBookmarks();
        const filteredBookmarks = bookmarks.filter(bookmark => bookmark.id !== id);
        
        localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(filteredBookmarks));
        
        return {
            removedBookmarkId: id,
            remainingBookmarks: filteredBookmarks
        };
    };
    
    // 导出所有数据
    const exportData = () => {
        const data = {
            categories: getCategories(),
            bookmarks: getBookmarks(),
            exportDate: new Date().toISOString()
        };
        
        return JSON.stringify(data);
    };
    
    // 导入数据
    const importData = (jsonData) => {
        try {
            const data = JSON.parse(jsonData);
            
            if (!data.categories || !data.bookmarks) {
                throw new Error('数据格式无效');
            }
            
            localStorage.setItem(CATEGORIES_KEY, JSON.stringify(data.categories));
            localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(data.bookmarks));
            
            return {
                success: true,
                categories: data.categories,
                bookmarks: data.bookmarks
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    };
    
    // 公开API
    return {
        getCategories,
        getBookmarks,
        addCategory,
        updateCategory,
        deleteCategory,
        addBookmark,
        updateBookmark,
        deleteBookmark,
        exportData,
        importData
    };
})();
 