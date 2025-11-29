// Markdown渲染功能模块

// 初始化Markdown渲染器
function initMarkdownRenderer() {
    // 检查是否已加载Showdown库
    if (typeof Showdown === 'undefined') {
        console.error('Showdown库未加载，无法渲染Markdown');
        return;
    }

    // 创建Markdown转换器实例
    const converter = new showdown.Converter({
        tables: true,          // 支持表格
        tasklists: true,       // 支持任务列表
        strikethrough: true,   // 支持删除线
        emoji: true,           // 支持emoji
        ghCodeBlocks: true,    // 支持GitHub风格的代码块
        ghCompatibleHeaderId: true, // 生成与GitHub兼容的header ID
        parseImgDimensions: true,   // 解析图片尺寸
        simplifiedAutoLink: true,   // 简化自动链接
        smoothLivePreview: true     // 平滑实时预览
    });

    // 保存转换器实例到全局
    window.markdownConverter = converter;

    // 渲染页面上所有需要渲染的Markdown内容
    renderAllMarkdownContent();

    // 添加事件监听，当内容变化时重新渲染
    addMarkdownContentChangeListeners();
}

// 渲染所有Markdown内容
function renderAllMarkdownContent() {
    // 获取所有需要渲染的Markdown元素
    const markdownElements = document.querySelectorAll('.markdown-content:not([data-rendered])');
    
    markdownElements.forEach(element => {
        renderMarkdownContent(element);
    });
}

// 渲染单个Markdown内容
function renderMarkdownContent(element) {
    // 检查元素是否存在
    if (!element) {
        console.error('渲染Markdown时元素不存在');
        return;
    }

    // 检查是否已渲染
    if (element.dataset.rendered) {
        return;
    }

    // 获取Markdown文本
    const markdownText = element.textContent || element.innerText;
    
    // 检查是否有内容
    if (!markdownText.trim()) {
        element.innerHTML = '<p>无内容</p>';
        element.dataset.rendered = 'true';
        return;
    }

    // 获取Markdown转换器
    const converter = window.markdownConverter;
    if (!converter) {
        console.error('Markdown转换器未初始化');
        return;
    }

    try {
        // 转换为HTML
        const html = converter.makeHtml(markdownText);
        
        // 设置HTML内容
        element.innerHTML = html;
        
        // 添加自定义样式
        addCustomMarkdownStyles(element);
        
        // 标记为已渲染
        element.dataset.rendered = 'true';
    } catch (error) {
        console.error('Markdown渲染失败:', error);
        element.innerHTML = '<p class="text-danger">Markdown渲染失败: ' + error.message + '</p>';
    }
}

// 添加自定义Markdown样式
function addCustomMarkdownStyles(element) {
    // 确保元素存在
    if (!element) return;

    // 处理代码块，添加语法高亮标记
    const codeBlocks = element.querySelectorAll('pre code');
    codeBlocks.forEach(block => {
        // 为代码块添加复制按钮
        addCopyButtonToCodeBlock(block);
        
        // 移除行号（如果有）
        block.innerHTML = block.innerHTML.replace(/^\d+\s/gm, '');
    });

    // 处理表格，确保响应式
    const tables = element.querySelectorAll('table');
    tables.forEach(table => {
        // 为表格添加响应式容器
        const wrapper = document.createElement('div');
        wrapper.className = 'table-responsive';
        table.parentNode.insertBefore(wrapper, table);
        wrapper.appendChild(table);
        
        // 为表格添加样式类
        table.className = 'table table-striped table-bordered';
    });

    // 处理图片，确保响应式
    const images = element.querySelectorAll('img');
    images.forEach(image => {
        // 添加响应式类
        image.className = image.className + ' img-fluid';
        
        // 如果没有alt文本，添加默认alt文本
        if (!image.alt) {
            image.alt = '图片';
        }
        
        // 为图片添加点击放大功能
        addImageZoomFunctionality(image);
    });

    // 处理链接，确保在新窗口打开外部链接
    const links = element.querySelectorAll('a');
    links.forEach(link => {
        // 检查是否是外部链接
        if (link.hostname !== window.location.hostname) {
            link.target = '_blank';
            link.rel = 'noopener noreferrer';
        }
    });

    // 处理标题，添加锚点功能
    const headings = element.querySelectorAll('h1, h2, h3, h4, h5, h6');
    headings.forEach(heading => {
        addHeadingAnchor(heading);
    });
}

// 为代码块添加复制按钮
function addCopyButtonToCodeBlock(codeBlock) {
    // 确保代码块存在且有父元素
    if (!codeBlock || !codeBlock.parentElement) return;

    // 创建复制按钮
    const copyButton = document.createElement('button');
    copyButton.className = 'copy-code-btn btn btn-sm btn-primary';
    copyButton.innerHTML = '复制';
    copyButton.title = '复制代码';
    
    // 添加点击事件
    copyButton.addEventListener('click', () => {
        // 获取代码内容
        const code = codeBlock.textContent;
        
        // 复制到剪贴板
        navigator.clipboard.writeText(code)
            .then(() => {
                // 显示复制成功提示
                copyButton.innerHTML = '已复制';
                copyButton.className = 'copy-code-btn btn btn-sm btn-success';
                
                // 2秒后恢复原始状态
                setTimeout(() => {
                    copyButton.innerHTML = '复制';
                    copyButton.className = 'copy-code-btn btn btn-sm btn-primary';
                }, 2000);
            })
            .catch(error => {
                console.error('复制代码失败:', error);
                copyButton.innerHTML = '复制失败';
                copyButton.className = 'copy-code-btn btn btn-sm btn-danger';
                
                // 2秒后恢复原始状态
                setTimeout(() => {
                    copyButton.innerHTML = '复制';
                    copyButton.className = 'copy-code-btn btn btn-sm btn-primary';
                }, 2000);
            });
    });

    // 将按钮添加到代码块的父元素（pre标签）
    const preElement = codeBlock.parentElement;
    preElement.style.position = 'relative';
    preElement.appendChild(copyButton);
}

// 为图片添加点击放大功能
function addImageZoomFunctionality(image) {
    // 确保图片存在
    if (!image) return;

    // 添加点击事件
    image.addEventListener('click', () => {
        // 创建放大容器
        const zoomContainer = document.createElement('div');
        zoomContainer.className = 'image-zoom-container';
        zoomContainer.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.9);
            z-index: 10000;
            display: flex;
            justify-content: center;
            align-items: center;
            cursor: pointer;
        `;

        // 创建放大的图片
        const zoomedImage = document.createElement('img');
        zoomedImage.src = image.src;
        zoomedImage.alt = image.alt;
        zoomedImage.style.cssText = `
            max-width: 90%;
            max-height: 90%;
            object-fit: contain;
        `;

        // 将放大的图片添加到容器
        zoomContainer.appendChild(zoomedImage);

        // 添加到页面
        document.body.appendChild(zoomContainer);

        // 点击容器关闭放大
        zoomContainer.addEventListener('click', () => {
            document.body.removeChild(zoomContainer);
        });
    });
}

// 为标题添加锚点功能
function addHeadingAnchor(heading) {
    // 确保标题存在
    if (!heading) return;

    // 获取标题文本
    const text = heading.textContent.trim();
    if (!text) return;

    // 生成锚点ID（使用GitHub风格）
    const anchorId = text.toLowerCase()
        .replace(/[^\w\s-]/g, '')  // 移除特殊字符
        .replace(/\s+/g, '-')       // 空格替换为连字符
        .replace(/-+/g, '-');       // 多个连字符替换为一个

    // 设置标题ID
    heading.id = anchorId;

    // 创建锚点链接
    const anchorLink = document.createElement('a');
    anchorLink.href = `#${anchorId}`;
    anchorLink.className = 'heading-anchor';
    anchorLink.title = '复制标题链接';
    anchorLink.innerHTML = '🔗';
    anchorLink.style.cssText = `
        margin-left: 0.5rem;
        opacity: 0;
        transition: opacity 0.2s ease;
        text-decoration: none;
        color: #666;
    `;

    // 鼠标悬停时显示锚点
    heading.addEventListener('mouseenter', () => {
        anchorLink.style.opacity = '1';
    });

    heading.addEventListener('mouseleave', () => {
        anchorLink.style.opacity = '0';
    });

    // 添加复制链接功能
    anchorLink.addEventListener('click', (e) => {
        e.preventDefault();
        
        // 构建完整URL
        const fullUrl = window.location.origin + window.location.pathname + '#' + anchorId;
        
        // 复制到剪贴板
        navigator.clipboard.writeText(fullUrl)
            .then(() => {
                // 显示复制成功提示
                const originalIcon = anchorLink.innerHTML;
                anchorLink.innerHTML = '✅';
                
                // 2秒后恢复原始图标
                setTimeout(() => {
                    anchorLink.innerHTML = originalIcon;
                }, 2000);
            })
            .catch(error => {
                console.error('复制链接失败:', error);
            });
    });

    // 将锚点链接添加到标题
    heading.appendChild(anchorLink);
}

// 添加Markdown内容变化监听器
function addMarkdownContentChangeListeners() {
    // 监听所有文本编辑器的变化
    const textareas = document.querySelectorAll('textarea.editor-textarea');
    textareas.forEach(textarea => {
        textarea.addEventListener('input', () => {
            // 找到对应的预览元素
            const previewElement = document.getElementById(textarea.id + '-preview');
            if (previewElement) {
                // 更新预览内容
                previewElement.textContent = textarea.value;
                // 重新渲染Markdown
                renderMarkdownContent(previewElement);
            }
        });
    });

    // 监听动态加载的内容
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            // 检查是否有新的Markdown内容需要渲染
            const addedNodes = Array.from(mutation.addedNodes);
            addedNodes.forEach(node => {
                if (node.nodeType === Node.ELEMENT_NODE) {
                    // 检查节点本身是否是Markdown内容
                    if (node.classList.contains('markdown-content')) {
                        renderMarkdownContent(node);
                    }
                    
                    // 检查节点的子元素是否有Markdown内容
                    const markdownElements = node.querySelectorAll('.markdown-content');
                    markdownElements.forEach(element => {
                        renderMarkdownContent(element);
                    });
                }
            });
        });
    });

    // 配置观察器
    const config = {
        childList: true,
        subtree: true
    };

    // 开始观察文档
    observer.observe(document.body, config);

    // 保存观察器到全局
    window.markdownObserver = observer;
}

// 将Markdown文本转换为HTML
function markdownToHtml(markdownText) {
    // 检查转换器是否存在
    const converter = window.markdownConverter;
    if (!converter) {
        console.error('Markdown转换器未初始化');
        return markdownText;
    }

    try {
        return converter.makeHtml(markdownText);
    } catch (error) {
        console.error('Markdown转换失败:', error);
        return markdownText;
    }
}

// 将HTML转换为Markdown（简化版）
function htmlToMarkdown(htmlText) {
    // 这是一个简化版的转换，仅处理基本的HTML标签
    // 对于复杂转换，建议使用专门的库
    let markdown = htmlText;

    // 替换标题
    markdown = markdown.replace(/<h1[^>]*>(.*?)<\/h1>/g, '# $1\n\n');
    markdown = markdown.replace(/<h2[^>]*>(.*?)<\/h2>/g, '## $1\n\n');
    markdown = markdown.replace(/<h3[^>]*>(.*?)<\/h3>/g, '### $1\n\n');
    markdown = markdown.replace(/<h4[^>]*>(.*?)<\/h4>/g, '#### $1\n\n');
    markdown = markdown.replace(/<h5[^>]*>(.*?)<\/h5>/g, '##### $1\n\n');
    markdown = markdown.replace(/<h6[^>]*>(.*?)<\/h6>/g, '###### $1\n\n');

    // 替换段落
    markdown = markdown.replace(/<p[^>]*>(.*?)<\/p>/g, '$1\n\n');

    // 替换加粗
    markdown = markdown.replace(/<strong[^>]*>(.*?)<\/strong>/g, '**$1**');
    markdown = markdown.replace(/<b[^>]*>(.*?)<\/b>/g, '**$1**');

    // 替换斜体
    markdown = markdown.replace(/<em[^>]*>(.*?)<\/em>/g, '*$1*');
    markdown = markdown.replace(/<i[^>]*>(.*?)<\/i>/g, '*$1*');

    // 替换删除线
    markdown = markdown.replace(/<del[^>]*>(.*?)<\/del>/g, '~~$1~~');

    // 替换链接
    markdown = markdown.replace(/<a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/g, '[$2]($1)');

    // 替换图片
    markdown = markdown.replace(/<img[^>]*src="([^"]*)"[^>]*alt="([^"]*)"[^>]*>/g, '![$2]($1)');
    markdown = markdown.replace(/<img[^>]*src="([^"]*)"[^>]*>/g, '![图片]($1)');

    // 替换列表
    markdown = markdown.replace(/<ul[^>]*>([\s\S]*?)<\/ul>/g, (match, content) => {
        const items = content.match(/<li[^>]*>(.*?)<\/li>/g);
        if (!items) return match;
        return items.map(item => `- ${item.replace(/<li[^>]*>(.*?)<\/li>/g, '$1')}`).join('\n') + '\n\n';
    });

    markdown = markdown.replace(/<ol[^>]*>([\s\S]*?)<\/ol>/g, (match, content) => {
        const items = content.match(/<li[^>]*>(.*?)<\/li>/g);
        if (!items) return match;
        return items.map((item, index) => `${index + 1}. ${item.replace(/<li[^>]*>(.*?)<\/li>/g, '$1')}`).join('\n') + '\n\n';
    });

    // 替换代码块
    markdown = markdown.replace(/<pre[^>]*><code[^>]*>(.*?)<\/code><\/pre>/g, '```\n$1\n```\n\n');

    // 替换行内代码
    markdown = markdown.replace(/<code[^>]*>(.*?)<\/code>/g, '`$1`');

    // 替换换行符
    markdown = markdown.replace(/<br\s*\/?>/g, '\n');

    // 移除多余的换行符
    markdown = markdown.replace(/\n{3,}/g, '\n\n');

    return markdown.trim();
}

// 页面加载完成后初始化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMarkdownRenderer);
} else {
    // DOM已经加载完成
    initMarkdownRenderer();
}

// 导出函数供其他模块使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        initMarkdownRenderer,
        renderAllMarkdownContent,
        renderMarkdownContent,
        markdownToHtml,
        htmlToMarkdown
    };
}