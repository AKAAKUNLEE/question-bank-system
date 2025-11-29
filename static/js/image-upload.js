// 图片上传功能模块

// 初始化图片上传功能
function initImageUpload() {
    // 获取DOM元素
    const uploadArea = document.getElementById('image-upload-area');
    const fileInput = document.getElementById('image-file-input');
    const uploadButton = document.getElementById('upload-button');
    const imagePreview = document.getElementById('image-preview');
    const insertButton = document.getElementById('insert-image-button');
    const cancelButton = document.getElementById('cancel-upload-button');

    // 检查DOM元素是否存在
    if (!uploadArea || !fileInput || !uploadButton || !imagePreview) {
        console.error('图片上传功能所需的DOM元素不存在');
        return;
    }

    // 拖拽上传功能
    uploadArea.addEventListener('dragover', handleDragOver);
    uploadArea.addEventListener('dragleave', handleDragLeave);
    uploadArea.addEventListener('drop', handleDrop);

    // 点击上传区域触发文件选择
    uploadArea.addEventListener('click', () => fileInput.click());

    // 文件选择变化事件
    fileInput.addEventListener('change', handleFileSelect);

    // 上传按钮点击事件
    uploadButton.addEventListener('click', uploadImage);

    // 插入图片按钮点击事件
    if (insertButton) {
        insertButton.addEventListener('click', insertImageToEditor);
    }

    // 取消上传按钮点击事件
    if (cancelButton) {
        cancelButton.addEventListener('click', cancelUpload);
    }

    // 处理粘贴上传
    document.addEventListener('paste', handlePaste);
}

// 处理拖拽进入事件
function handleDragOver(e) {
    e.preventDefault();
    e.stopPropagation();
    e.target.classList.add('dragover');
}

// 处理拖拽离开事件
function handleDragLeave(e) {
    e.preventDefault();
    e.stopPropagation();
    e.target.classList.remove('dragover');
}

// 处理拖拽放下事件
function handleDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    e.target.classList.remove('dragover');

    // 获取拖拽的文件
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        handleFiles(files);
    }
}

// 处理文件选择事件
function handleFileSelect(e) {
    const files = e.target.files;
    if (files.length > 0) {
        handleFiles(files);
    }
}

// 处理粘贴事件
function handlePaste(e) {
    // 检查是否有图片数据
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
            const file = items[i].getAsFile();
            if (file) {
                handleFiles([file]);
            }
            break;
        }
    }
}

// 处理文件
function handleFiles(files) {
    // 只处理第一张图片
    const file = files[0];
    
    // 检查文件类型
    if (!file.type.match('image.*')) {
        alert('请选择图片文件');
        return;
    }

    // 显示图片预览
    const reader = new FileReader();
    reader.onload = function(e) {
        const imagePreview = document.getElementById('image-preview');
        const previewImage = document.createElement('img');
        previewImage.src = e.target.result;
        previewImage.className = 'image-preview img-fluid';
        
        // 清空预览区域并添加新预览
        imagePreview.innerHTML = '';
        imagePreview.appendChild(previewImage);
        
        // 显示操作按钮
        showUploadButtons();
    };
    reader.readAsDataURL(file);

    // 保存当前文件到全局变量
    window.currentUploadFile = file;
}

// 上传图片到服务器
function uploadImage() {
    const file = window.currentUploadFile;
    if (!file) {
        alert('请先选择图片');
        return;
    }

    // 创建FormData对象
    const formData = new FormData();
    formData.append('image', file);

    // 显示加载状态
    const uploadButton = document.getElementById('upload-button');
    const originalText = uploadButton.innerHTML;
    uploadButton.innerHTML = '<span class="loading"></span> 上传中...';
    uploadButton.disabled = true;

    // 发送AJAX请求
    fetch('/upload/image', {
        method: 'POST',
        body: formData
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('图片上传失败');
        }
        return response.json();
    })
    .then(data => {
        if (data.success) {
            // 保存图片URL到全局变量
            window.uploadedImageUrl = data.url;
            
            // 更新预览区域，显示完整图片信息
            const imagePreview = document.getElementById('image-preview');
            const previewImage = imagePreview.querySelector('img');
            if (previewImage) {
                previewImage.dataset.imageUrl = data.url;
            }
            
            // 显示插入按钮
            showInsertButton();
            
            alert('图片上传成功！');
        } else {
            throw new Error(data.message || '图片上传失败');
        }
    })
    .catch(error => {
        console.error('图片上传失败:', error);
        alert('图片上传失败: ' + error.message);
    })
    .finally(() => {
        // 恢复上传按钮状态
        uploadButton.innerHTML = originalText;
        uploadButton.disabled = false;
    });
}

// 插入图片到编辑器
function insertImageToEditor() {
    const imageUrl = window.uploadedImageUrl;
    if (!imageUrl) {
        alert('请先上传图片');
        return;
    }

    // 尝试获取编辑器元素
    const editor = document.querySelector('.editor-textarea');
    if (!editor) {
        // 如果没有找到编辑器，尝试查找所有textarea
        const textareas = document.querySelectorAll('textarea');
        if (textareas.length > 0) {
            // 默认使用第一个textarea
            editor = textareas[0];
        } else {
            alert('未找到编辑器');
            return;
        }
    }

    // 构建Markdown图片语法
    const imageMarkdown = `![图片](${imageUrl})`;

    // 插入到编辑器光标位置
    insertAtCursor(editor, imageMarkdown);

    // 触发编辑器内容变化事件
    editor.dispatchEvent(new Event('input', { bubbles: true }));

    // 重置上传状态
    resetUploadState();

    // 提示用户
    alert('图片已插入到编辑器！');
}

// 取消上传
function cancelUpload() {
    resetUploadState();
}

// 重置上传状态
function resetUploadState() {
    // 清空预览区域
    const imagePreview = document.getElementById('image-preview');
    if (imagePreview) {
        imagePreview.innerHTML = '<p>拖拽图片到此处或点击选择文件</p>';
    }

    // 清空文件输入
    const fileInput = document.getElementById('image-file-input');
    if (fileInput) {
        fileInput.value = '';
    }

    // 隐藏操作按钮
    hideUploadButtons();
    hideInsertButton();

    // 清除全局变量
    delete window.currentUploadFile;
    delete window.uploadedImageUrl;
}

// 显示上传按钮
function showUploadButtons() {
    const uploadButton = document.getElementById('upload-button');
    if (uploadButton) {
        uploadButton.style.display = 'inline-block';
    }

    const cancelButton = document.getElementById('cancel-upload-button');
    if (cancelButton) {
        cancelButton.style.display = 'inline-block';
    }
}

// 隐藏上传按钮
function hideUploadButtons() {
    const uploadButton = document.getElementById('upload-button');
    if (uploadButton) {
        uploadButton.style.display = 'none';
    }

    const cancelButton = document.getElementById('cancel-upload-button');
    if (cancelButton) {
        cancelButton.style.display = 'none';
    }
}

// 显示插入按钮
function showInsertButton() {
    const uploadButton = document.getElementById('upload-button');
    const insertButton = document.getElementById('insert-image-button');
    
    if (uploadButton) {
        uploadButton.style.display = 'none';
    }
    
    if (insertButton) {
        insertButton.style.display = 'inline-block';
    }
}

// 隐藏插入按钮
function hideInsertButton() {
    const insertButton = document.getElementById('insert-image-button');
    if (insertButton) {
        insertButton.style.display = 'none';
    }
}

// 在光标位置插入文本
function insertAtCursor(textarea, text) {
    const startPos = textarea.selectionStart;
    const endPos = textarea.selectionEnd;
    const scrollTop = textarea.scrollTop;
    
    // 插入文本
    textarea.value = textarea.value.substring(0, startPos) + text + textarea.value.substring(endPos);
    
    // 设置光标位置
    textarea.focus();
    textarea.selectionStart = textarea.selectionEnd = startPos + text.length;
    textarea.scrollTop = scrollTop;
}

// 页面加载完成后初始化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initImageUpload);
} else {
    // DOM已经加载完成
    initImageUpload();
}

// 导出函数供其他模块使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        initImageUpload,
        uploadImage,
        insertImageToEditor,
        cancelUpload
    };
}