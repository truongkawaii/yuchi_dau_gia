// Biến toàn cục
let products = [];
let currentActiveImageIndex = [0, 0]; // Mảng cho 2 sản phẩm
let activeImageInterval = [null, null]; // Mảng cho 2 sản phẩm
let productImageIntervals = {};

// Thời gian bắt đầu: 2h chiều hôm nay
const startTime = new Date();
startTime.setHours(14, 0, 0, 0); // 2:00 PM

// Mỗi cặp sản phẩm đấu giá 10 phút (2 sản phẩm đấu giá song song)
const AUCTION_DURATION = 10 * 60 * 1000;

// Tải dữ liệu từ JSON file
async function loadProducts() {
    try {
        const response = await fetch('products.json');
        products = await response.json();
        init();
    } catch (error) {
        console.error('Lỗi khi tải dữ liệu sản phẩm:', error);
        alert('Không thể tải dữ liệu sản phẩm. Vui lòng kiểm tra file products.json');
    }
}

// Tạo hiệu ứng tuyết rơi
function createSnowflakes() {
    const snowflakeChars = ['❄', '❅', '❆', '✻', '✼'];
    for (let i = 0; i < 50; i++) {
        const snowflake = document.createElement('div');
        snowflake.className = 'snowflake';
        snowflake.textContent = snowflakeChars[Math.floor(Math.random() * snowflakeChars.length)];
        snowflake.style.left = Math.random() * 100 + '%';
        snowflake.style.animationDuration = (Math.random() * 3 + 7) + 's';
        snowflake.style.animationDelay = Math.random() * 5 + 's';
        snowflake.style.fontSize = (Math.random() * 10 + 10) + 'px';
        document.body.appendChild(snowflake);
    }
}

// Tính toán cặp sản phẩm hiện tại đang đấu giá (2 sản phẩm cùng lúc)
function getCurrentProductPairIndex() {
    const now = new Date();
    const diff = now - startTime;
    
    if (diff < 0) {
        return -1; // Chưa bắt đầu
    }
    
    const pairIndex = Math.floor(diff / AUCTION_DURATION);
    const totalPairs = Math.ceil(products.length / 2);
    
    return pairIndex < totalPairs ? pairIndex : totalPairs; // Đã kết thúc
}

// Lấy 2 sản phẩm đang đấu giá
function getCurrentProducts() {
    const pairIndex = getCurrentProductPairIndex();
    
    if (pairIndex === -1 || pairIndex >= Math.ceil(products.length / 2)) {
        return [null, null];
    }
    
    const index1 = pairIndex * 2;
    const index2 = pairIndex * 2 + 1;
    
    return [
        index1 < products.length ? products[index1] : null,
        index2 < products.length ? products[index2] : null
    ];
}

// Kiểm tra xem có nên hiển thị thông tin thật hay không
function shouldRevealProduct(productIndex) {
    const pairIndex = getCurrentProductPairIndex();
    const currentPairStart = pairIndex * 2;
    // Chỉ reveal khi sản phẩm đang active hoặc đã qua
    return productIndex < currentPairStart + 2 && pairIndex >= 0;
}

// Lấy thông tin hiển thị của sản phẩm (thật hoặc ẩn)
function getDisplayProduct(product, productIndex) {
    if (!product) return null;
    
    if (product.hidden && !shouldRevealProduct(productIndex)) {
        return {
            name: product.hiddenName || "🎭 Sản Phẩm Bí Mật",
            description: product.hiddenDescription || "Thông tin sẽ được công bố khi bắt đầu đấu giá",
            images: [product.hiddenImage || "images/mystery-box.jpg"],
            startPrice: product.startPrice,
            originalPrice: product.originalPrice,
            productCode: "***-***",
            isHidden: true
        };
    }
    return {
        name: product.name,
        description: product.description,
        images: product.images,
        startPrice: product.startPrice,
        originalPrice: product.originalPrice,
        productCode: product.id ? `SP-${String(product.id).padStart(3, '0')}` : "---",
        isHidden: false
    };
}

// Slideshow cho sản phẩm đang đấu giá
function showActiveImage(slotIndex, imageIndex) {
    const [product1, product2] = getCurrentProducts();
    const product = slotIndex === 0 ? product1 : product2;
    
    if (!product) return;
    
    const pairIndex = getCurrentProductPairIndex();
    const productIndex = pairIndex * 2 + slotIndex;
    const displayProduct = getDisplayProduct(product, productIndex);
    
    if (!displayProduct) return;
    
    const images = displayProduct.images;
    currentActiveImageIndex[slotIndex] = imageIndex;
    
    const imgElement = document.getElementById(`activeImage${slotIndex + 1}`);
    imgElement.src = images[currentActiveImageIndex[slotIndex]];
    
    // Thêm hiệu ứng blur nếu đang ẩn
    if (displayProduct.isHidden) {
        imgElement.style.filter = 'blur(20px)';
    } else {
        imgElement.style.filter = 'none';
    }
    
    // Cập nhật dots
    updateActiveDots(slotIndex, images.length);
}

function updateActiveDots(slotIndex, totalImages) {
    const dotsContainer = document.getElementById(`activeDots${slotIndex + 1}`);
    dotsContainer.innerHTML = '';
    
    for (let i = 0; i < totalImages; i++) {
        const dot = document.createElement('span');
        dot.className = `dot ${i === currentActiveImageIndex[slotIndex] ? 'active' : ''}`;
        dot.onclick = () => showActiveImage(slotIndex, i);
        dotsContainer.appendChild(dot);
    }
}

function nextActiveImage(slotIndex) {
    const [product1, product2] = getCurrentProducts();
    const product = slotIndex === 0 ? product1 : product2;
    
    if (!product) return;
    
    const pairIndex = getCurrentProductPairIndex();
    const productIndex = pairIndex * 2 + slotIndex;
    const displayProduct = getDisplayProduct(product, productIndex);
    
    if (!displayProduct) return;
    
    const images = displayProduct.images;
    currentActiveImageIndex[slotIndex] = (currentActiveImageIndex[slotIndex] + 1) % images.length;
    showActiveImage(slotIndex, currentActiveImageIndex[slotIndex]);
}

function prevActiveImage(slotIndex) {
    const [product1, product2] = getCurrentProducts();
    const product = slotIndex === 0 ? product1 : product2;
    
    if (!product) return;
    
    const pairIndex = getCurrentProductPairIndex();
    const productIndex = pairIndex * 2 + slotIndex;
    const displayProduct = getDisplayProduct(product, productIndex);
    
    if (!displayProduct) return;
    
    const images = displayProduct.images;
    currentActiveImageIndex[slotIndex] = (currentActiveImageIndex[slotIndex] - 1 + images.length) % images.length;
    showActiveImage(slotIndex, currentActiveImageIndex[slotIndex]);
}

function startActiveImageSlideshow(slotIndex) {
    // Dừng slideshow cũ nếu có
    if (activeImageInterval[slotIndex]) {
        clearInterval(activeImageInterval[slotIndex]);
    }
    
    const [product1, product2] = getCurrentProducts();
    const product = slotIndex === 0 ? product1 : product2;
    
    if (!product) return;
    
    const pairIndex = getCurrentProductPairIndex();
    const productIndex = pairIndex * 2 + slotIndex;
    const displayProduct = getDisplayProduct(product, productIndex);
    
    if (!displayProduct) return;
    
    const images = displayProduct.images;
    
    if (images.length > 1) {
        // Tự động chuyển ảnh mỗi 3 giây
        activeImageInterval[slotIndex] = setInterval(() => nextActiveImage(slotIndex), 3000);
    }
}

// Cập nhật thông tin sản phẩm đang đấu giá
function updateActiveProduct() {
    const pairIndex = getCurrentProductPairIndex();
    const [product1, product2] = getCurrentProducts();
    
    // Cập nhật cho cả 2 slot
    for (let slotIndex = 0; slotIndex < 2; slotIndex++) {
        const product = slotIndex === 0 ? product1 : product2;
        const productIndex = pairIndex * 2 + slotIndex;
        
        if (pairIndex === -1) {
            // Chưa bắt đầu
            const firstProduct = products[slotIndex];
            const displayProduct = firstProduct ? getDisplayProduct(firstProduct, slotIndex) : null;
            
            document.getElementById(`activeName${slotIndex + 1}`).textContent = 'Sắp bắt đầu...';
            document.getElementById(`activeDescription${slotIndex + 1}`).textContent = 'Đấu giá sẽ bắt đầu lúc 14:00 hôm nay';
            document.getElementById(`activeStartPrice${slotIndex + 1}`).textContent = '0 VNĐ';
            document.getElementById(`activeOriginalPrice${slotIndex + 1}`).textContent = '0 VNĐ';
            document.getElementById(`productCode${slotIndex + 1}`).querySelector('.code-value').textContent = '---';
            
            if (displayProduct) {
                document.getElementById(`activeImage${slotIndex + 1}`).src = displayProduct.images[0];
            }
            document.getElementById(`activeDots${slotIndex + 1}`).innerHTML = '';
            continue;
        }
        
        if (!product || pairIndex >= Math.ceil(products.length / 2)) {
            // Đã kết thúc hoặc không có sản phẩm
            document.getElementById(`activeName${slotIndex + 1}`).textContent = slotIndex === 0 && pairIndex >= Math.ceil(products.length / 2) ? 'Đã kết thúc' : 'Không có sản phẩm';
            document.getElementById(`activeDescription${slotIndex + 1}`).textContent = slotIndex === 0 && pairIndex >= Math.ceil(products.length / 2) ? 'Tất cả sản phẩm đã được đấu giá!' : '';
            document.getElementById(`activeStartPrice${slotIndex + 1}`).textContent = '0 VNĐ';
            document.getElementById(`activeOriginalPrice${slotIndex + 1}`).textContent = '0 VNĐ';
            document.getElementById(`productCode${slotIndex + 1}`).querySelector('.code-value').textContent = '---';
            document.getElementById(`activeDots${slotIndex + 1}`).innerHTML = '';
            
            if (activeImageInterval[slotIndex]) {
                clearInterval(activeImageInterval[slotIndex]);
            }
            continue;
        }
        
        const displayProduct = getDisplayProduct(product, productIndex);
        
        if (displayProduct) {
            document.getElementById(`activeName${slotIndex + 1}`).textContent = displayProduct.name;
            document.getElementById(`activeDescription${slotIndex + 1}`).textContent = displayProduct.description;
            document.getElementById(`activeStartPrice${slotIndex + 1}`).textContent = displayProduct.startPrice + ' VNĐ';
            document.getElementById(`activeOriginalPrice${slotIndex + 1}`).textContent = displayProduct.originalPrice + ' VNĐ';
            document.getElementById(`productCode${slotIndex + 1}`).querySelector('.code-value').textContent = displayProduct.productCode;
            
            // Reset slideshow
            currentActiveImageIndex[slotIndex] = 0;
            showActiveImage(slotIndex, 0);
            startActiveImageSlideshow(slotIndex);
        }
    }
}

// Cập nhật countdown
function updateCountdown() {
    const pairIndex = getCurrentProductPairIndex();
    
    for (let slotIndex = 0; slotIndex < 2; slotIndex++) {
        const countdownEl = document.getElementById(`countdown${slotIndex + 1}`);
        
        if (pairIndex === -1) {
            const now = new Date();
            const diff = startTime - now;
            const hours = Math.floor(diff / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);
            countdownEl.textContent = `⏰ Bắt đầu sau: ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            continue;
        }
        
        if (pairIndex >= Math.ceil(products.length / 2)) {
            countdownEl.textContent = '🎉 Đã kết thúc!';
            continue;
        }
        
        const now = new Date();
        const pairStartTime = new Date(startTime.getTime() + pairIndex * AUCTION_DURATION);
        const pairEndTime = new Date(pairStartTime.getTime() + AUCTION_DURATION);
        const diff = pairEndTime - now;
        
        if (diff <= 0) {
            countdownEl.textContent = '⏰ Thời gian còn lại: 00:00';
            continue;
        }
        
        const minutes = Math.floor(diff / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        countdownEl.textContent = `⏰ Thời gian còn lại: ${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
}

// Slideshow cho product card
function createProductSlideshow(productId, images, isHidden) {
    let currentIndex = 0;
    
    const interval = setInterval(() => {
        currentIndex = (currentIndex + 1) % images.length;
        const imgElement = document.getElementById(`product-img-${productId}`);
        const dotsContainer = document.getElementById(`product-dots-${productId}`);
        
        if (imgElement && dotsContainer) {
            imgElement.src = images[currentIndex];
            
            // Cập nhật dots
            const dots = dotsContainer.querySelectorAll('.dot');
            dots.forEach((dot, idx) => {
                dot.classList.toggle('active', idx === currentIndex);
            });
        } else {
            // Dừng interval nếu element không còn tồn tại
            clearInterval(interval);
            delete productImageIntervals[productId];
        }
    }, 4000); // Chuyển ảnh mỗi 4 giây
    
    productImageIntervals[productId] = interval;
}

// Render danh sách sản phẩm
function renderProductList() {
    const grid = document.getElementById('productGrid');
    const pairIndex = getCurrentProductPairIndex();
    
    grid.innerHTML = '';
    
    // Dừng tất cả intervals cũ
    Object.values(productImageIntervals).forEach(interval => clearInterval(interval));
    productImageIntervals = {};
    
    products.forEach((product, index) => {
        const productPairIndex = Math.floor(index / 2);
        const pairStartTime = new Date(startTime.getTime() + productPairIndex * AUCTION_DURATION);
        const pairEndTime = new Date(pairStartTime.getTime() + AUCTION_DURATION);
        
        const hours = pairStartTime.getHours().toString().padStart(2, '0');
        const minutes = pairStartTime.getMinutes().toString().padStart(2, '0');
        const endHours = pairEndTime.getHours().toString().padStart(2, '0');
        const endMinutes = pairEndTime.getMinutes().toString().padStart(2, '0');
        
        let statusClass = '';
        let statusText = `${hours}:${minutes} - ${endHours}:${endMinutes}`;
        
        if (productPairIndex < pairIndex) {
            statusClass = 'completed';
        } else if (productPairIndex === pairIndex) {
            statusClass = 'active';
            statusText = '🔴 ĐANG ĐẤU GIÁ';
        }
        
        // Lấy thông tin hiển thị (thật hoặc ẩn)
        const displayProduct = getDisplayProduct(product, index);
        const images = displayProduct.images;
        const firstImage = images[0];
        
        const card = document.createElement('div');
        card.className = `product-card ${statusClass} ${displayProduct.isHidden ? 'mystery-product' : ''}`;
        
        // Tạo dots cho slideshow
        let dotsHTML = '';
        if (images.length > 1) {
            dotsHTML = `<div class="product-image-dots" id="product-dots-${product.id}">`;
            images.forEach((_, idx) => {
                dotsHTML += `<span class="dot ${idx === 0 ? 'active' : ''}"></span>`;
            });
            dotsHTML += '</div>';
        }
        
        // Thêm badge "BÍ MẬT" nếu đang ẩn
        const mysteryBadge = displayProduct.isHidden ? 
            '<div class="mystery-badge">🎭 BÍ MẬT</div>' : '';
        
        card.innerHTML = `
            <div class="product-number">${index + 1}</div>
            ${mysteryBadge}
            <div class="product-image-container">
                <img class="product-image ${displayProduct.isHidden ? 'blurred' : ''}" 
                     id="product-img-${product.id}" 
                     src="${firstImage}" 
                     alt="${displayProduct.name}">
                ${dotsHTML}
            </div>
            <h3>${displayProduct.name}</h3>
            <p><strong>Mã SP:</strong> ${displayProduct.productCode}</p>
            <p><strong>Giá khởi điểm:</strong> ${displayProduct.startPrice} VNĐ</p>
            <p><strong>Giá gốc:</strong> ${displayProduct.originalPrice} VNĐ</p>
            <p style="font-size: 0.9em; color: #ccc;">${displayProduct.description}</p>
            <div class="product-time">${statusText}</div>
        `;
        
        grid.appendChild(card);
        
        // Bắt đầu slideshow nếu có nhiều ảnh
        if (images.length > 1) {
            createProductSlideshow(product.id, images, displayProduct.isHidden);
        }
    });
    
    // Thêm zoom cho các product cards mới
    setTimeout(() => {
        addProductCardZoom();
    }, 100);
}

// Khởi tạo
function init() {
    createSnowflakes();
    updateActiveProduct();
    updateCountdown();
    renderProductList();
    
    // Khởi tạo zoom features
    initZoomFeatures();
    
    // Event listeners cho nút prev/next của cả 2 sản phẩm
    document.getElementById('activePrev1').addEventListener('click', () => prevActiveImage(0));
    document.getElementById('activeNext1').addEventListener('click', () => nextActiveImage(0));
    document.getElementById('activePrev2').addEventListener('click', () => prevActiveImage(1));
    document.getElementById('activeNext2').addEventListener('click', () => nextActiveImage(1));
    
    // Cập nhật mỗi giây
    let lastPairIndex = getCurrentProductPairIndex();
    
    setInterval(() => {
        updateCountdown();
        const currentPairIndex = getCurrentProductPairIndex();
        
        // Nếu chuyển sang cặp sản phẩm mới
        if (lastPairIndex !== currentPairIndex) {
            lastPairIndex = currentPairIndex;
            updateActiveProduct();
            renderProductList();
            // Re-add zoom indicators after render
            setTimeout(() => {
                addZoomIndicators();
            }, 100);
        }
    }, 1000);
}

// ============================================
// ZOOM IMAGE FUNCTIONALITY
// ============================================

let zoomOverlay = null;
let isZoomed = false;

// Tạo zoom overlay
function createZoomOverlay() {
    if (zoomOverlay) return;
    
    zoomOverlay = document.createElement('div');
    zoomOverlay.className = 'zoom-overlay';
    zoomOverlay.innerHTML = `
        <button class="zoom-close" aria-label="Đóng">×</button>
        <div class="zoom-hint">🖱️ Click để đóng | ESC để thoát</div>
        <img src="" alt="Zoomed image">
    `;
    
    document.body.appendChild(zoomOverlay);
    
    // Close handlers
    zoomOverlay.addEventListener('click', closeZoom);
    const closeBtn = zoomOverlay.querySelector('.zoom-close');
    closeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        closeZoom();
    });
    
    // Prevent image click from closing
    const img = zoomOverlay.querySelector('img');
    img.addEventListener('click', (e) => {
        e.stopPropagation();
    });
    
    // ESC key to close
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && isZoomed) {
            closeZoom();
        }
    });
}

// Open zoom view
function openZoom(imageSrc, isBlurred = false) {
    if (isBlurred) return; // Don't zoom blurred images
    
    createZoomOverlay();
    
    const img = zoomOverlay.querySelector('img');
    img.src = imageSrc;
    
    zoomOverlay.classList.add('active');
    document.body.classList.add('zoom-active');
    isZoomed = true;
}

// Close zoom view
function closeZoom() {
    if (!zoomOverlay) return;
    
    zoomOverlay.classList.remove('active');
    document.body.classList.remove('active');
    isZoomed = false;
}

// Add zoom indicators to images
function addZoomIndicators() {
    // Add to active product slideshow (cả 2 sản phẩm)
    for (let i = 1; i <= 2; i++) {
        const activeContainer = document.querySelector(`#activeImage${i}`).closest('.slideshow-container');
        if (activeContainer && !activeContainer.querySelector('.zoom-indicator')) {
            const indicator = document.createElement('div');
            indicator.className = 'zoom-indicator';
            indicator.innerHTML = '🔍 Click để phóng to';
            activeContainer.appendChild(indicator);
            
            // Add click handler for active image
            const activeImg = activeContainer.querySelector('img');
            activeContainer.addEventListener('click', (e) => {
                // Don't zoom if clicking on prev/next buttons
                if (e.target.closest('.slideshow-prev') || e.target.closest('.slideshow-next') || e.target.closest('.slideshow-dots')) {
                    return;
                }
                
                const isBlurred = activeImg.style.filter && activeImg.style.filter.includes('blur');
                if (!isBlurred) {
                    openZoom(activeImg.src);
                }
            });
        }
    }
}

// Add zoom to product cards
function addProductCardZoom() {
    const productCards = document.querySelectorAll('.product-image-container');
    
    productCards.forEach(container => {
        // Remove old indicator if exists
        const oldIndicator = container.querySelector('.zoom-indicator');
        if (oldIndicator) oldIndicator.remove();
        
        // Add new indicator
        const indicator = document.createElement('div');
        indicator.className = 'zoom-indicator';
        indicator.innerHTML = '🔍';
        container.appendChild(indicator);
        
        // Remove old listeners by cloning
        const newContainer = container.cloneNode(true);
        container.parentNode.replaceChild(newContainer, container);
        
        // Add click handler
        const img = newContainer.querySelector('.product-image');
        newContainer.addEventListener('click', () => {
            const isBlurred = img.classList.contains('blurred');
            if (!isBlurred) {
                openZoom(img.src);
            }
        });
    });
}

// Mouse wheel zoom for zoomed image (bonus feature)
function addWheelZoom() {
    if (!zoomOverlay) return;
    
    const img = zoomOverlay.querySelector('img');
    let scale = 1;
    
    zoomOverlay.addEventListener('wheel', (e) => {
        if (!isZoomed) return;
        
        e.preventDefault();
        
        const delta = e.deltaY > 0 ? -0.1 : 0.1;
        scale += delta;
        scale = Math.min(Math.max(0.5, scale), 3); // Limit between 0.5x and 3x
        
        img.style.transform = `scale(${scale})`;
    });
}

// Drag to pan when zoomed (bonus feature)
function addDragToPan() {
    if (!zoomOverlay) return;
    
    const img = zoomOverlay.querySelector('img');
    let isDragging = false;
    let startX, startY, translateX = 0, translateY = 0;
    
    img.addEventListener('mousedown', (e) => {
        if (!isZoomed) return;
        isDragging = true;
        startX = e.clientX - translateX;
        startY = e.clientY - translateY;
        img.style.cursor = 'grabbing';
        e.preventDefault();
    });
    
    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        translateX = e.clientX - startX;
        translateY = e.clientY - startY;
        img.style.transform = `translate(${translateX}px, ${translateY}px) scale(${img.style.transform.match(/scale\((.*?)\)/)?.[1] || 1})`;
    });
    
    document.addEventListener('mouseup', () => {
        isDragging = false;
        if (img) img.style.cursor = 'grab';
    });
}

// Khởi tạo zoom functionality
function initZoomFeatures() {
    createZoomOverlay();
    addZoomIndicators();
    addWheelZoom();
    addDragToPan();
}

// Chạy khi trang load xong
window.addEventListener('load', loadProducts);
