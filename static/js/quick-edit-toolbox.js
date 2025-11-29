// 快速修改工具箱功能模块

/**
 * 初始化快速修改工具箱
 * @param {string} questionId - 题目ID
 */
function initQuickEditToolbox(questionId) {
    // 绑定工具按钮事件
    bindToolButtons(questionId);
    
    // 绑定保存按钮事件
    bindSaveButton(questionId);
    
    // 绑定切换显示事件
    bindToolboxToggle(questionId);
    
    // 绑定高级工具折叠事件
    bindAdvancedToolsToggle(questionId);
    
    // 绑定高级工具按钮事件
    bindAdvancedTools(questionId);
    
    // 初始化模态框
    initModal(questionId);
}

/**
 * 绑定文本插入按钮事件
 * @param {string} questionId - 题目ID
 */
function bindTextInsertButton(questionId) {
    // 获取插入按钮容器
    const insertBtnContainer = document.getElementById(`insert-btn-${questionId}`);
    if (!insertBtnContainer) return;
    
    // 创建插入按钮
    const insertBtn = document.createElement('button');
    insertBtn.className = 'tool-btn insert-btn';
    insertBtn.innerHTML = '<i class="fas fa-paragraph"></i> 插入文本';
    insertBtn.title = '插入预定义文本';
    
    // 绑定点击事件
    insertBtn.addEventListener('click', () => {
        // 这里可以根据实际需求扩展，比如显示一个下拉菜单供用户选择要插入的文本
        const predefinedTexts = [
            '以下选项中，正确的是：',
            '请选择正确的答案：',
            '根据以上内容，回答下列问题：',
            '简述...的作用。',
            '解释...的概念。',
            '分析...的优缺点。'
        ];
        
        // 创建一个简单的下拉菜单
        const dropdown = document.createElement('div');
        dropdown.className = 'text-insert-dropdown';
        dropdown.style.cssText = `
            position: absolute;
            background-color: white;
            border: 1px solid #ddd;
            border-radius: 4px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
            padding: 8px 0;
            z-index: 1000;
            min-width: 200px;
        `;
        
        // 添加选项
        predefinedTexts.forEach(text => {
            const option = document.createElement('div');
            option.className = 'text-option';
            option.innerHTML = text;
            option.style.cssText = `
                padding: 8px 16px;
                cursor: pointer;
                font-size: 14px;
            `;
            
            // 鼠标悬停效果
            option.addEventListener('mouseenter', () => {
                option.style.backgroundColor = '#f5f5f5';
            });
            
            option.addEventListener('mouseleave', () => {
                option.style.backgroundColor = 'white';
            });
            
            // 点击插入文本
            option.addEventListener('click', () => {
                applyFormattingToActiveEditor(questionId, '', '', text);
                dropdown.remove();
            });
            
            dropdown.appendChild(option);
        });
        
        // 将下拉菜单添加到页面
        insertBtnContainer.appendChild(dropdown);
        
        // 定位下拉菜单
        const rect = insertBtn.getBoundingClientRect();
        dropdown.style.left = `${rect.left + window.scrollX}px`;
        dropdown.style.top = `${rect.bottom + window.scrollY}px`;
        
        // 点击外部关闭下拉菜单
        document.addEventListener('click', (e) => {
            if (!dropdown.contains(e.target) && e.target !== insertBtn) {
                dropdown.remove();
            }
        }, { once: true });
    });
    
    // 将按钮添加到容器
    insertBtnContainer.appendChild(insertBtn);
}

/**
 * 绑定工具按钮事件
 * @param {string} questionId - 题目ID
 */
function bindToolButtons(questionId) {
    // 加粗按钮
    const boldBtn = document.getElementById(`bold-btn-${questionId}`);
    if (boldBtn) {
        boldBtn.addEventListener('click', () => {
            applyFormattingToActiveEditor(questionId, '**', '**', '加粗文本');
        });
    }
    
    // 斜体按钮
    const italicBtn = document.getElementById(`italic-btn-${questionId}`);
    if (italicBtn) {
        italicBtn.addEventListener('click', () => {
            applyFormattingToActiveEditor(questionId, '*', '*', '斜体文本');
        });
    }
    
    // 标题按钮
    const headingBtn = document.getElementById(`heading-btn-${questionId}`);
    if (headingBtn) {
        headingBtn.addEventListener('click', () => {
            applyFormattingToActiveEditor(questionId, '# ', '', '标题');
        });
    }
    
    // 列表按钮
    const listBtn = document.getElementById(`list-btn-${questionId}`);
    if (listBtn) {
        listBtn.addEventListener('click', () => {
            applyFormattingToActiveEditor(questionId, '- ', '', '列表项');
        });
    }
    
    // 引用按钮
    const quoteBtn = document.getElementById(`quote-btn-${questionId}`);
    if (quoteBtn) {
        quoteBtn.addEventListener('click', () => {
            applyFormattingToActiveEditor(questionId, '> ', '', '引用文本');
        });
    }
    
    // 代码按钮
    const codeBtn = document.getElementById(`code-btn-${questionId}`);
    if (codeBtn) {
        codeBtn.addEventListener('click', () => {
            applyFormattingToActiveEditor(questionId, '`', '`', '代码');
        });
    }
}

/**
 * 对当前活动的编辑器应用格式化
 * @param {string} questionId - 题目ID
 * @param {string} prefix - 前缀
 * @param {string} suffix - 后缀
 * @param {string} placeholder - 占位符
 */
function applyFormattingToActiveEditor(questionId, prefix, suffix, placeholder) {
    // 获取当前活动的编辑器
    const activeEditor = document.activeElement;
    
    // 检查是否是编辑器
    if (activeEditor && activeEditor.classList.contains('text-editor')) {
        // 获取选中的文本
        const startPos = activeEditor.selectionStart;
        const endPos = activeEditor.selectionEnd;
        const selectedText = activeEditor.value.substring(startPos, endPos);
        
        // 如果没有选中文本，使用占位符
        const textToInsert = selectedText || placeholder;
        
        // 插入格式化后的文本
        activeEditor.value = activeEditor.value.substring(0, startPos) + 
                            prefix + textToInsert + suffix + 
                            activeEditor.value.substring(endPos);
        
        // 设置光标位置
        const newCursorPos = startPos + prefix.length + textToInsert.length;
        activeEditor.focus();
        activeEditor.setSelectionRange(newCursorPos, newCursorPos);
        
        // 触发输入事件
        activeEditor.dispatchEvent(new Event('input', { bubbles: true }));
    }
}

/**
 * 绑定高级工具按钮事件
 * @param {string} questionId - 题目ID
 */
function bindAdvancedTools(questionId) {
    // 表格按钮
    const tableBtn = document.getElementById(`table-btn-${questionId}`);
    if (tableBtn) {
        tableBtn.addEventListener('click', () => {
            openTableModal(questionId);
        });
    }
    
    // 图片按钮
    const imageBtn = document.getElementById(`image-btn-${questionId}`);
    if (imageBtn) {
        imageBtn.addEventListener('click', () => {
            openImageUploadModal(questionId);
        });
    }
}

/**
 * 对编辑器应用格式化
 * @param {string} questionId - 题目ID
 * @param {string} prefix - 前缀
 * @param {string} suffix - 后缀
 * @param {string} placeholder - 占位符
 */
function applyFormatting(questionId, prefix, suffix, placeholder) {
    // 获取当前活动的编辑器
    const activeEditor = document.activeElement;
    
    // 检查是否是编辑器
    if (activeEditor && activeEditor.classList.contains('text-editor')) {
        // 获取选中的文本
        const startPos = activeEditor.selectionStart;
        const endPos = activeEditor.selectionEnd;
        const selectedText = activeEditor.value.substring(startPos, endPos);
        
        // 如果没有选中文本，使用占位符
        const textToInsert = selectedText || placeholder;
        
        // 插入格式化后的文本
        activeEditor.value = activeEditor.value.substring(0, startPos) + 
                            prefix + textToInsert + suffix + 
                            activeEditor.value.substring(endPos);
        
        // 设置光标位置
        const newCursorPos = startPos + prefix.length + textToInsert.length;
        activeEditor.focus();
        activeEditor.setSelectionRange(newCursorPos, newCursorPos);
        
        // 触发输入事件
        activeEditor.dispatchEvent(new Event('input', { bubbles: true }));
    }
}

// 触发输入事件
        activeEditor.dispatchEvent(new Event('input', { bubbles: true }));
    }
}

/**
 * 绑定保存按钮事件
 * @param {string} questionId - 题目ID
 */
function bindSaveButton(questionId) {
    const saveBtn = document.getElementById(`save-btn-${questionId}`);
    if (!saveBtn) return;
    
    saveBtn.addEventListener('click', () => {
        // 显示加载状态
        const originalText = saveBtn.innerHTML;
        saveBtn.innerHTML = '<span class="loading"></span> 保存中...';
        saveBtn.disabled = true;
        
        // 收集表单数据
        const questionText = document.getElementById(`question-editor-${questionId}`)?.value;
        const answerText = document.getElementById(`answer-editor-${questionId}`)?.value;
        const explanationText = document.getElementById(`explanation-editor-${questionId}`)?.value;
// 这里应该发送AJAX请求到服务器保存数据
        // 为了演示，我们使用setTimeout模拟异步请求
        setTimeout(() => {
            // 恢复按钮状态
            saveBtn.innerHTML = originalText;
            saveBtn.disabled = false;
            
            // 显示成功消息
            if (window.showNotification) {
                window.showNotification(questionId, '保存成功！', 'success');
            }
            
            // 更新显示内容（实际应用中应该由服务器返回数据）
            updateDisplayContent(questionId, questionText, answerText, explanationText);
            
            // 隐藏编辑器
            toggleEditMode(questionId, false);
        }, 1000);
    });
}

/**
 * 更新显示内容
 * @param {string} questionId - 题目ID
 * @param {string} questionText - 题目文本
 * @param {string} answerText - 答案文本
 * @param {string} explanationText - 解析文本
 */
function updateDisplayContent(questionId, questionText, answerText, explanationText) {
    // 更新显示的题目内容
    const questionDisplay = document.getElementById(`question-${questionId}`);
    if (questionDisplay && questionText) {
        questionDisplay.textContent = questionText;
        // 重新渲染Markdown
        if (window.renderMarkdownContent) {
            renderMarkdownContent();
        }
}
    
    // 更新显示的答案内容
    const answerDisplay = document.getElementById(`answer-${questionId}`);
    if (answerDisplay && answerText) {
        answerDisplay.textContent = answerText;
        // 重新渲染Markdown
        if (window.renderMarkdownContent) {
            renderMarkdownContent();
        }
    }
    
    // 更新显示的解析内容
    const explanationDisplay = document.getElementById(`explanation-${questionId}`);
    if (explanationDisplay && explanationText) {
        explanationDisplay.textContent = explanationText;
        // 重新渲染Markdown
        if (window.renderMarkdownContent) {
            renderMarkdownContent();
        }
    }
}

/**
 * 绑定工具箱切换事件
 * @param {string} questionId - 题目ID
 */
function bindToolboxToggle(questionId) {
    const toggleBtn = document.getElementById(`toolbox-toggle-${questionId}`);
    const toolboxContent = document.getElementById(`toolbox-content-${questionId}`);
    
    if (toggleBtn && toolboxContent) {
        toggleBtn.addEventListener('click', () => {
            const isExpanded = toggleBtn.getAttribute('aria-expanded') === 'true';
            toggleBtn.setAttribute('aria-expanded', !isExpanded);
            toolboxContent.style.display = isExpanded ? 'none' : 'flex';
            toggleBtn.innerHTML = isExpanded ? '+' : '−';
        });
    }
}

/**
 * 切换编辑模式
 * @param {string} questionId - 题目ID
 * @param {boolean} isEditMode - 是否为编辑模式
 */
// 在toggleEditMode函数中添加更新文本编辑框的功能
function toggleEditMode(questionId, isEditMode) {
    // 隐藏/显示显示内容
    const displays = document.querySelectorAll(`[id^="question-"]:not([id$="editor-${questionId}"]), 
                                                [id^="answer-"]:not([id$="editor-${questionId}"]), 
                                                [id^="explanation-"]:not([id$="editor-${questionId}"])`) || [];
    displays.forEach(el => {
        if (el.id.includes(questionId)) {
            el.style.display = isEditMode ? 'none' : 'block';
        }
    });
    
    // 显示/隐藏编辑器
    const editors = document.querySelectorAll(`[id$="editor-${questionId}"]`) || [];
    editors.forEach(el => {
        el.style.display = isEditMode ? 'block' : 'none';
    });
    
    // 显示/隐藏工具箱
    const toolbox = document.getElementById(`quick-edit-${questionId}`);
    if (toolbox) {
        toolbox.style.display = isEditMode ? 'block' : 'none';
    }
    
    // 如果进入编辑模式，将答案内容加载到文本编辑框
    if (isEditMode) {
        loadAnswerToTextEditor(questionId);
    }
    
    // 切换编辑按钮文本
    const editBtn = document.getElementById(`edit-btn-${questionId}`);
    if (editBtn) {
        editBtn.textContent = isEditMode ? '取消编辑' : '编辑';
    }
    
    // 关闭所有模态框
    closeAllModals();
}

/**
 * 初始化模态框
 * @param {string} questionId - 题目ID
 */
function initModal(questionId) {
    // 创建模态框容器
    let modalContainer = document.getElementById(`modal-container-${questionId}`);
    if (!modalContainer) {
        modalContainer = document.createElement('div');
        modalContainer.id = `modal-container-${questionId}`;
        modalContainer.className = 'modal-container';
        document.body.appendChild(modalContainer);
    }
}

/**
 * 打开表格编辑模态框
 * @param {string} questionId - 题目ID
 */
function openTableModal(questionId) {
    // 创建模态框内容
    const modalHTML = `
        <div class="modal-overlay">
            <div class="modal-content">
                <div class="modal-header">
                    <h3>编辑表格</h3>
                    <button class="modal-close-btn" id="close-table-modal-${questionId}">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="table-config">
                        <div class="form-group">
                            <label for="rows-${questionId}">行数:</label>
                            <input type="number" id="rows-${questionId}" min="1" value="3">
                        </div>
                        <div class="form-group">
                            <label for="cols-${questionId}">列数:</label>
                            <input type="number" id="cols-${questionId}" min="1" value="3">
                        </div>
                        <button class="generate-table-btn" id="generate-table-${questionId}">生成表格</button>
                    </div>
                    <div class="table-editor" id="table-editor-${questionId}">
                        <table id="editable-table-${questionId}" border="1">
                            <!-- 表格内容将在这里生成 -->
                        </table>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="cancel-btn" id="cancel-table-${questionId}">取消</button>
                    <button class="insert-table-btn" id="insert-table-${questionId}">插入表格</button>
                </div>
            </div>
        </div>
    `;
    
    const modalContainer = document.getElementById(`modal-container-${questionId}`);
    modalContainer.innerHTML = modalHTML;
    
    // 确保正确设置display为flex以实现居中
    modalContainer.style.display = 'flex';
    // 强制重排以确保居中生效
    setTimeout(() => {
        modalContainer.offsetHeight; // 触发重排
    }, 0);
    
    // 添加事件监听器确保在窗口大小改变时仍保持居中
    const handleResize = function() {
        const modalContent = modalContainer.querySelector('.modal-content');
        if (modalContent) {
            // 重置位置确保居中
            modalContent.style.position = 'relative';
            // 强制重排
            modalContainer.offsetHeight;
        }
    };
    
    // 绑定窗口调整大小事件并存储在元素上以便后续移除
    modalContainer._resizeHandler = handleResize;
    window.addEventListener('resize', handleResize);
    
    // 生成初始表格
    generateTable(questionId, 3, 3);
    
    // 绑定事件（保持原有代码不变）
    document.getElementById(`generate-table-${questionId}`).addEventListener('click', () => {
        const rows = parseInt(document.getElementById(`rows-${questionId}`).value) || 3;
        const cols = parseInt(document.getElementById(`cols-${questionId}`).value) || 3;
        generateTable(questionId, rows, cols);
    });
    
    document.getElementById(`insert-table-${questionId}`).addEventListener('click', () => {
        insertTableToEditor(questionId);
    });
    
    document.getElementById(`cancel-table-${questionId}`).addEventListener('click', () => {
        closeTableModal(questionId);
    });
    
    document.getElementById(`close-table-modal-${questionId}`).addEventListener('click', () => {
        closeTableModal(questionId);
    });
    
    // 点击模态框外部关闭
    modalContainer.querySelector('.modal-overlay').addEventListener('click', (e) => {
if (e.target === modalContainer.querySelector('.modal-overlay')) {
            closeTableModal(questionId);
        }
    });
}

/**
 * 关闭表格编辑模态框
 * @param {string} questionId - 题目ID
 */
function closeTableModal(questionId) {
    const modalContainer = document.getElementById(`modal-container-${questionId}`);
    if (modalContainer) {
        // 移除窗口调整大小事件监听器，避免内存泄漏
        if (modalContainer._resizeHandler) {
            window.removeEventListener('resize', modalContainer._resizeHandler);
            delete modalContainer._resizeHandler;
        }
        modalContainer.style.display = 'none';
    }
}

/**
 * 生成表格
 * @param {string} questionId - 题目ID
 * @param {number} rows - 行数
 * @param {number} cols - 列数
 */
function generateTable(questionId, rows, cols) {
    const table = document.getElementById(`editable-table-${questionId}`);
    table.innerHTML = '';
    
    // 生成表头
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    for (let i = 0; i < cols; i++) {
        const th = document.createElement('th');
        th.contentEditable = true;
        th.textContent = `表头 ${i + 1}`;
        headerRow.appendChild(th);
    }
    thead.appendChild(headerRow);
    table.appendChild(thead);
    
    // 生成表体
    const tbody = document.createElement('tbody');
    for (let i = 0; i < rows - 1; i++) {
        const row = document.createElement('tr');
        for (let j = 0; j < cols; j++) {
            const td = document.createElement('td');
            td.contentEditable = true;
            td.textContent = `单元格 ${i + 1}-${j + 1}`;
            row.appendChild(td);
        }
        tbody.appendChild(row);
    }
    table.appendChild(tbody);
}

/**
 * 将表格插入到编辑器中
 * @param {string} questionId - 题目ID
 */
function insertTableToEditor(questionId) {
    const table = document.getElementById(`editable-table-${questionId}`);
    if (!table) {
        if (window.showNotification) {
            window.showNotification(questionId, '无法找到表格元素', 'error');
        }
        return;
    }
    
    const rows = table.rows;
    let markdownTable = '';
    
    // 生成Markdown表格
    for (let i = 0; i < rows.length; i++) {
        const cells = rows[i].cells;
        const cellValues = [];
        
        for (let j = 0; j < cells.length; j++) {
            cellValues.push(cells[j].textContent || '');
        }
        
        markdownTable += '| ' + cellValues.join(' | ') + ' |\n';
        
        // 添加表头分隔线
        if (i === 0) {
            const separators = [];
            for (let j = 0; j < cells.length; j++) {
                separators.push('---');
            }
            markdownTable += '| ' + separators.join(' | ') + ' |\n';
        }
    }
    
    // 首先检查活动元素是否为编辑器
    const activeEditor = document.activeElement;
    if (activeEditor && activeEditor.classList.contains('text-editor')) {
        // 插入到活动编辑器
        const startPos = activeEditor.selectionStart;
        const endPos = activeEditor.selectionEnd;
        
        activeEditor.value = activeEditor.value.substring(0, startPos) + 
                             '\n' + markdownTable + '\n' + 
                             activeEditor.value.substring(endPos);
        
        // 设置光标位置
        const newCursorPos = startPos + markdownTable.length + 2; // +2 for newlines
        activeEditor.focus();
        activeEditor.setSelectionRange(newCursorPos, newCursorPos);
        
        // 触发输入事件
        activeEditor.dispatchEvent(new Event('input', { bubbles: true }));
    } else {
        // 如果没有活动的编辑器，尝试找到第一个可见的编辑器
        const editors = document.querySelectorAll('.text-editor[style*="display: block"]');
        if (editors.length > 0) {
            const targetEditor = editors[0];
            targetEditor.value += '\n' + markdownTable + '\n';
            targetEditor.focus();
            targetEditor.setSelectionRange(targetEditor.value.length, targetEditor.value.length);
            targetEditor.dispatchEvent(new Event('input', { bubbles: true }));
            
            if (window.showNotification) {
                window.showNotification(questionId, '表格已插入到第一个可见编辑器', 'success');
            }
        } else {
            // 如果找不到任何可见的编辑器，显示错误消息
            if (window.showNotification) {
                window.showNotification(questionId, '请先激活一个编辑器', 'warning');
            }
            return;
        }
    }
    
    // 关闭模态框
    closeTableModal(questionId);
    
    // 显示成功消息
    if (window.showNotification) {
        window.showNotification(questionId, '表格已插入', 'success');
    }
}

/**
 * 打开图片上传模态框
 * @param {string} questionId - 题目ID
 */
function openImageUploadModal(questionId) {
    // 创建模态框内容
    const modalHTML = `
        <div class="modal-overlay">
            <div class="modal-content">
                <div class="modal-header">
                    <h3>上传图片</h3>
                    <button class="modal-close-btn" id="close-image-modal-${questionId}">&times;</button>
                </div>
                <div class="modal-body">
                    <div id="upload-area-modal-${questionId}" class="upload-area-modal">
                        <input type="file" id="image-input-modal-${questionId}" accept="image/*" style="display: none;">
                        <div class="upload-hint">
                            <p>点击或拖拽图片到此处上传</p>
                            <p class="small-text">支持粘贴图片 (Ctrl+V)</p>
                        </div>
                    </div>
                    <div id="preview-modal-${questionId}" class="preview-modal" style="display: none;">
                        <div class="preview-images"></div>
                    </div>
</div>
                <div class="modal-footer">
                    <button class="cancel-btn" id="cancel-image-upload-${questionId}">取消</button>
                </div>
            </div>
        </div>
    `;
    
    const modalContainer = document.getElementById(`modal-container-${questionId}`);
    modalContainer.innerHTML = modalHTML;
    
    // 确保正确设置display为flex以实现居中
    modalContainer.style.display = 'flex';
    
    // 强制重排以确保居中生效
    setTimeout(() => {
        modalContainer.offsetHeight; // 触发重排
    }, 0);
    
    // 添加事件监听器确保在窗口大小改变时仍保持居中
    const handleResize = function() {
        const modalContent = modalContainer.querySelector('.modal-content');
        if (modalContent) {
            // 重置位置确保居中
            modalContent.style.position = 'relative';
            // 强制重排
            modalContainer.offsetHeight;
        }
    };
    
    // 绑定窗口调整大小事件并存储在元素上以便后续移除
    modalContainer._resizeHandler = handleResize;
    window.addEventListener('resize', handleResize);
    
    // 初始化图片上传功能
    initImageUploadInModal(questionId);
    
    // 绑定关闭事件
    document.getElementById(`cancel-image-upload-${questionId}`)?.addEventListener('click', () => {
        closeImageUploadModal(questionId);
    });
    
    document.getElementById(`close-image-modal-${questionId}`)?.addEventListener('click', () => {
        closeImageUploadModal(questionId);
    });
    
    // 点击模态框外部关闭
    modalContainer.querySelector('.modal-overlay')?.addEventListener('click', (e) => {
        if (e.target === modalContainer.querySelector('.modal-overlay')) {
            closeImageUploadModal(questionId);
        }
    });
}

/**
 * 关闭图片上传模态框
 * @param {string} questionId - 题目ID
 */
function closeImageUploadModal(questionId) {
    const modalContainer = document.getElementById(`modal-container-${questionId}`);
    if (modalContainer) {
        // 移除窗口调整大小事件监听器，避免内存泄漏
        if (modalContainer._resizeHandler) {
            window.removeEventListener('resize', modalContainer._resizeHandler);
            delete modalContainer._resizeHandler;
        }
        modalContainer.style.display = 'none';
    }
}

/**
 * 在模态框中初始化图片上传功能
 * @param {string} questionId - 题目ID
 */
function initImageUploadInModal(questionId) {
    const uploadArea = document.getElementById(`upload-area-modal-${questionId}`);
    const fileInput = document.getElementById(`image-input-modal-${questionId}`);
    const previewArea = document.getElementById(`preview-modal-${questionId}`);
    
    if (!uploadArea || !fileInput || !previewArea) return;
    
    // 点击上传区域触发文件选择
    uploadArea.addEventListener('click', () => {
        fileInput.click();
    });
    
    // 监听文件选择
    fileInput.addEventListener('change', (e) => {
        handleFilesInModal(e.target.files, questionId);
        // 重置input以允许选择相同文件
        fileInput.value = '';
    });
    
    // 监听拖拽事件
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('drag-over');
    });
    
    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('drag-over');
    });
    
    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('drag-over');
        if (e.dataTransfer.files.length > 0) {
            handleFilesInModal(e.dataTransfer.files, questionId);
        }
    });
    
    // 监听粘贴事件
    document.addEventListener('paste', handlePasteInModal);
    
    // 保存事件处理器引用，以便后续移除
    uploadArea._pasteHandler = handlePasteInModal;
    
    function handlePasteInModal(e) {
        // 检查剪贴板中是否有图片
        if (e.clipboardData.items) {
            for (let i = 0; i < e.clipboardData.items.length; i++) {
                if (e.clipboardData.items[i].type.indexOf('image') !== -1) {
                    const file = e.clipboardData.items[i].getAsFile();
                    handleFilesInModal([file], questionId);
                    break;
                }
            }
        }
    }
}

/**
 * 处理模态框中的文件
 * @param {FileList} files - 文件列表
 * @param {string} questionId - 题目ID
 */
function handleFilesInModal(files, questionId) {
    const previewArea = document.getElementById(`preview-modal-${questionId}`);
    const previewImages = previewArea.querySelector('.preview-images');
    
    if (!previewImages) return;
    
    // 显示预览区域
    previewArea.style.display = 'block';
    
    Array.from(files).forEach(file => {
        // 检查是否为图片文件
        if (!file.type.match('image.*')) {
            showNotification(questionId, '请上传图片文件', 'error');
            return;
        }
        
        // 创建预览
        const reader = new FileReader();
        reader.onload = function(e) {
            const previewItem = document.createElement('div');
            previewItem.className = 'preview-item';
            
            const img = document.createElement('img');
            img.src = e.target.result;
            img.alt = '预览图片';
            
            const removeBtn = document.createElement('button');
            removeBtn.className = 'remove-preview';
            removeBtn.innerHTML = '×';
            removeBtn.onclick = function() {
                previewItem.remove();
                if (previewImages.children.length === 0) {
                    previewArea.style.display = 'none';
                }
            };
            
            previewItem.appendChild(img);
            previewItem.appendChild(removeBtn);
            previewImages.appendChild(previewItem);
            
            // 将图片插入到当前活动的编辑器中
            insertImageToEditorInModal(questionId, e.target.result);
        };
        
        reader.readAsDataURL(file);
    });
}

/**
 * 在模态框中插入图片到编辑器
 * @param {string} questionId - 题目ID
 * @param {string} imageData - 图片数据URL
 */
function insertImageToEditorInModal(questionId, imageData) {
    // 获取当前活动的编辑器
    const activeEditor = document.querySelector('.text-editor:focus');
    
    if (activeEditor) {
        // 在编辑器光标位置插入Markdown图片语法
        const startPos = activeEditor.selectionStart;
        const endPos = activeEditor.selectionEnd;
        const text = activeEditor.value;
        const imageMarkdown = `![图片](data:image/png;base64,${imageData.split(',')[1]})`;
        
        activeEditor.value = text.substring(0, startPos) + imageMarkdown + text.substring(endPos);
        
        // 设置光标位置到插入内容之后
        const newPos = startPos + imageMarkdown.length;
        activeEditor.focus();
        activeEditor.setSelectionRange(newPos, newPos);
        
        // 触发输入事件以更新编辑器状态
        activeEditor.dispatchEvent(new Event('input', { bubbles: true }));
        
        // 显示成功消息
        showNotification(questionId, '图片上传成功！', 'success');
    }
}

/**
 * 关闭所有模态框
 */
function closeAllModals() {
    const modals = document.querySelectorAll('.modal-container');
    modals.forEach(modal => {
        modal.style.display = 'none';
        // 移除事件监听器
        if (modal._resizeHandler) {
            window.removeEventListener('resize', modal._resizeHandler);
            delete modal._resizeHandler;
        }
        // 移除粘贴事件监听器
        const uploadArea = modal.querySelector('.upload-area-modal');
        if (uploadArea && uploadArea._pasteHandler) {
            document.removeEventListener('paste', uploadArea._pasteHandler);
            delete uploadArea._pasteHandler;
        }
    });
}

/**
 * 初始化所有题目项的编辑功能
 */
// 添加新函数：将答案内容加载到文本编辑框
function loadAnswerToTextEditor(questionId) {
    const answerDisplay = document.getElementById(`answer-${questionId}`);
    const textEditor = document.getElementById(`quick-text-editor-${questionId}`);
    
    if (answerDisplay && textEditor) {
        // 获取答案内容并设置到文本编辑框
        textEditor.value = answerDisplay.textContent.trim();
    }
}

// 修改applyFormatting函数，使其能作用于文本编辑框
function applyFormatting(questionId, prefix, suffix, placeholder) {
    const activeElement = document.activeElement;
    
    // 检查活动元素是主编辑器还是文本编辑框
    if (activeElement && (activeElement.classList.contains('text-editor') || activeElement.classList.contains('quick-text-editor'))) {
        const startPos = activeElement.selectionStart;
        const endPos = activeElement.selectionEnd;
        const selectedText = activeElement.value.substring(startPos, endPos);
        const textToInsert = selectedText || placeholder;
        
        activeElement.value = activeElement.value.substring(0, startPos) + 
                             prefix + textToInsert + suffix + 
                             activeElement.value.substring(endPos);
        
        // 设置光标位置
        const newCursorPos = startPos + prefix.length + textToInsert.length;
        activeElement.focus();
        activeElement.setSelectionRange(newCursorPos, newCursorPos);
        
        // 触发输入事件
        activeElement.dispatchEvent(new Event('input', { bubbles: true }));
    }
}
function initAllQuestionEditors() {
    document.querySelectorAll('.question-item').forEach(item => {
        const questionId = item.getAttribute('data-question-id');
        if (questionId) {
            // 绑定编辑按钮
            const editBtn = document.getElementById(`edit-btn-${questionId}`);
            if (editBtn) {
                editBtn.addEventListener('click', () => {
                    const isEditMode = editBtn.textContent === '取消编辑';
                    toggleEditMode(questionId, !isEditMode);
                    
                    // 如果进入编辑模式，初始化工具箱
                    if (!isEditMode) {
                        initQuickEditToolbox(questionId);
                    }
                });
            }
            
            // 绑定删除按钮
            const deleteBtn = document.getElementById(`delete-btn-${questionId}`);
            if (deleteBtn) {
                deleteBtn.addEventListener('click', () => {
                    if (confirm('确定要删除这道题目吗？')) {
                        // 这里应该发送删除请求到服务器
                        item.style.opacity = '0.5';
                        setTimeout(() => {
                            item.remove();
                            if (window.showNotification) {
                                window.showNotification(questionId, '题目已删除', 'success');
                            }
                        }, 500);
                    }
                });
            }
        }
    });
}

// 导出函数
window.initQuickEditToolbox = initQuickEditToolbox;
window.toggleEditMode = toggleEditMode;
window.initAllQuestionEditors = initAllQuestionEditors;

// DOM加载完成后初始化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAllQuestionEditors);
} else {
    initAllQuestionEditors();
}


// 在bindToolboxToggle函数后面添加一个新函数，用于绑定高级工具的折叠功能
/**
 * 绑定高级工具折叠事件
 * @param {string} questionId - 题目ID
 */
function bindAdvancedToolsToggle(questionId) {
    const advancedTools = document.getElementById(`advanced-tools-${questionId}`);
    if (!advancedTools) return;
    
    // 检查是否已经存在折叠按钮，如果存在则不再创建
    if (advancedTools.querySelector('.advanced-tools-toggle')) {
        return;
    }
    
    // 创建折叠按钮
    const h4Element = advancedTools.querySelector('h4');
    if (h4Element) {
        const toggleBtn = document.createElement('button');
        toggleBtn.className = 'advanced-tools-toggle';
        toggleBtn.setAttribute('aria-expanded', 'true');
        toggleBtn.innerHTML = '−';
        toggleBtn.style.float = 'right';
        toggleBtn.style.marginLeft = '10px';
        toggleBtn.style.background = 'none';
        toggleBtn.style.border = 'none';
        toggleBtn.style.cursor = 'pointer';
        toggleBtn.style.fontSize = '16px';
        
        h4Element.appendChild(toggleBtn);
        
        // 获取高级按钮容器
        const advancedButtons = advancedTools.querySelector('.advanced-buttons');
        
        // 绑定点击事件
        toggleBtn.addEventListener('click', () => {
            const isExpanded = toggleBtn.getAttribute('aria-expanded') === 'true';
            toggleBtn.setAttribute('aria-expanded', !isExpanded);
            if (advancedButtons) {
                advancedButtons.style.display = isExpanded ? 'none' : 'block';
            }
            toggleBtn.innerHTML = isExpanded ? '+' : '−';
        });
    }
}

// 修改initQuickEditToolbox函数，添加对bindAdvancedToolsToggle的调用
function initQuickEditToolbox(questionId) {
    // 绑定工具按钮事件
    bindToolButtons(questionId);
    
    // 绑定保存按钮事件
    bindSaveButton(questionId);
    
    // 绑定切换显示事件
    bindToolboxToggle(questionId);
    
    // 绑定高级工具折叠事件
    bindAdvancedToolsToggle(questionId);
    
    // 绑定高级工具按钮事件
    bindAdvancedTools(questionId);
    
    // 初始化模态框
    initModal(questionId);
}