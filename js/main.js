// 获取DOM元素
const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const previewContainer = document.getElementById('previewContainer');
const originalImage = document.getElementById('originalImage');
const compressedImage = document.getElementById('compressedImage');
const originalSize = document.getElementById('originalSize');
const compressedSize = document.getElementById('compressedSize');
const qualitySlider = document.getElementById('qualitySlider');
const qualityValue = document.getElementById('qualityValue');
const downloadBtn = document.getElementById('downloadBtn');

// 当前处理的图片数据
let currentFile = null;

// 文件大小格式化函数
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// 图片压缩函数
function compressImage(file, quality) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target.result;
            
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                
                // 保持原始尺寸
                canvas.width = img.width;
                canvas.height = img.height;
                
                // 绘制图片
                ctx.drawImage(img, 0, 0);
                
                // 压缩图片
                canvas.toBlob(
                    (blob) => {
                        resolve(blob);
                    },
                    file.type,
                    quality / 100
                );
            };
            
            img.onerror = reject;
        };
        
        reader.onerror = reject;
    });
}

// 处理文件上传
function handleFileUpload(file) {
    if (!file.type.match('image.*')) {
        alert('请上传图片文件！');
        return;
    }
    
    currentFile = file;
    originalSize.textContent = formatFileSize(file.size);
    
    // 显示原图预览
    const reader = new FileReader();
    reader.onload = (e) => {
        originalImage.src = e.target.result;
        previewContainer.style.display = 'block';
        compressAndPreview(file, qualitySlider.value);
    };
    reader.readAsDataURL(file);
}

// 压缩并预览
async function compressAndPreview(file, quality) {
    try {
        const compressedBlob = await compressImage(file, quality);
        compressedSize.textContent = formatFileSize(compressedBlob.size);
        
        const reader = new FileReader();
        reader.onload = (e) => {
            compressedImage.src = e.target.result;
            
            // 更新下载按钮
            downloadBtn.onclick = () => {
                const url = URL.createObjectURL(compressedBlob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `compressed_${file.name}`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            };
        };
        reader.readAsDataURL(compressedBlob);
    } catch (error) {
        console.error('压缩失败:', error);
        alert('图片压缩失败，请重试！');
    }
}

// 事件监听器
uploadArea.addEventListener('click', () => fileInput.click());

// 阻止浏览器默认的拖拽行为
['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    uploadArea.addEventListener(eventName, preventDefaults, false);
    document.body.addEventListener(eventName, preventDefaults, false);
});

// 阻止默认行为函数
function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

// 拖拽相关事件处理
['dragenter', 'dragover'].forEach(eventName => {
    uploadArea.addEventListener(eventName, highlight, false);
});

['dragleave', 'drop'].forEach(eventName => {
    uploadArea.addEventListener(eventName, unhighlight, false);
});

// 高亮显示拖拽区域
function highlight(e) {
    uploadArea.style.borderColor = '#0071e3';
}

// 取消高亮显示
function unhighlight(e) {
    uploadArea.style.borderColor = '#e5e5e5';
}

// 处理文件拖放
uploadArea.addEventListener('drop', handleDrop, false);

// 处理文件拖放函数
function handleDrop(e) {
    const dt = e.dataTransfer;
    const file = dt.files[0];
    if (file) handleFileUpload(file);
}

fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) handleFileUpload(file);
});

qualitySlider.addEventListener('input', (e) => {
    qualityValue.textContent = `${e.target.value}%`;
    if (currentFile) {
        compressAndPreview(currentFile, e.target.value);
    }
}); 