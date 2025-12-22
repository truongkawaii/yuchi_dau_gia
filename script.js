// Biến toàn cục
let products = [];
let currentActiveImageIndex = 0;
let activeImageInterval = null;
let productImageIntervals = {};

// Thời gian bắt đầu: 2h chiều hôm nay
const startTime = new Date();
startTime.setHours(14, 0, 0, 0); // 2:00 PM

// Mỗi sản phẩm đấu giá 10 phút
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

// Tính toán sản phẩm hiện tại đang đấu giá
function getCurrentProductIndex() {
    const now = new Date();
    const diff = now - startTime;
    
    if (diff < 0) {
        return -1; // Chưa bắt đầu
    }
    
    const index = Math.floor(diff / AUCTION_DURATION);
    return index < products.length ? index : products.length; // Đã kết thúc
}

// Kiểm tra xem có nên hiển thị thông tin thật hay không
function shouldRevealProduct(productIndex) {
    const currentIndex = getCurrentProductIndex();
    // Chỉ reveal khi sản phẩm đang active hoặc đã qua
    return currentIndex >= productIndex;
}

// Lấy thông tin hiển thị của sản phẩm (thật hoặc ẩn)
function getDisplayProduct(product, productIndex) {
    if (product.hidden && !shouldRevealProduct(productIndex)) {
        return {
            name: product.hiddenName || "🎭 Sản Phẩm Bí Mật",
            description: product.hiddenDescription || "Thông tin sẽ được công bố khi bắt đầu đấu giá",
            images: [product.hiddenImage || "images/mystery-box.jpg"],
            startPrice: product.startPrice,
            originalPrice: product.originalPrice,
            isHidden: true
        };
    }
    return {
        name: product.name,
        description: product.description,
        images: product.images,
        startPrice: product.startPrice,
        originalPrice: product.originalPrice,
        isHidden: false
    };
}

// Slideshow cho sản phẩm đang đấu giá
function showActiveImage(index) {
    const currentIndex = getCurrentProductIndex();
    if (currentIndex < 0 || currentIndex >= products.length) return;
    
    const product = products[currentIndex];
    const displayProduct = getDisplayProduct(product, currentIndex);
    const images = displayProduct.images;
    
    currentActiveImageIndex = index;
    const imgElement = document.getElementById('activeImage');
    imgElement.src = images[currentActiveImageIndex];
    
    // Thêm hiệu ứng blur nếu đang ẩn
    if (displayProduct.isHidden) {
        imgElement.style.filter = 'blur(20px)';
    } else {
        imgElement.style.filter = 'none';
    }
    
    // Cập nhật dots
    updateActiveDots(images.length);
}

function updateActiveDots(totalImages) {
    const dotsContainer = document.getElementById('activeDots');
    dotsContainer.innerHTML = '';
    
    for (let i = 0; i < totalImages; i++) {
        const dot = document.createElement('span');
        dot.className = `dot ${i === currentActiveImageIndex ? 'active' : ''}`;
        dot.onclick = () => showActiveImage(i);
        dotsContainer.appendChild(dot);
    }
}

function nextActiveImage() {
    const currentIndex = getCurrentProductIndex();
    if (currentIndex < 0 || currentIndex >= products.length) return;
    
    const product = products[currentIndex];
    const displayProduct = getDisplayProduct(product, currentIndex);
    const images = displayProduct.images;
    
    currentActiveImageIndex = (currentActiveImageIndex + 1) % images.length;
    showActiveImage(currentActiveImageIndex);
}

function prevActiveImage() {
    const currentIndex = getCurrentProductIndex();
    if (currentIndex < 0 || currentIndex >= products.length) return;
    
    const product = products[currentIndex];
    const displayProduct = getDisplayProduct(product, currentIndex);
    const images = displayProduct.images;
    
    currentActiveImageIndex = (currentActiveImageIndex - 1 + images.length) % images.length;
    showActiveImage(currentActiveImageIndex);
}

function startActiveImageSlideshow() {
    // Dừng slideshow cũ nếu có
    if (activeImageInterval) {
        clearInterval(activeImageInterval);
    }
    
    const currentIndex = getCurrentProductIndex();
    if (currentIndex < 0 || currentIndex >= products.length) return;
    
    const product = products[currentIndex];
    const displayProduct = getDisplayProduct(product, currentIndex);
    const images = displayProduct.images;
    
    if (images.length > 1) {
        // Tự động chuyển ảnh mỗi 3 giây
        activeImageInterval = setInterval(nextActiveImage, 3000);
    }
}

// Cập nhật thông tin sản phẩm đang đấu giá
function updateActiveProduct() {
    const currentIndex = getCurrentProductIndex();
    
    if (currentIndex === -1) {
        const firstProduct = products[0];
        const displayProduct = getDisplayProduct(firstProduct, 0);
        
        document.getElementById('activeName').textContent = 'Sắp bắt đầu...';
        document.getElementById('activeDescription').textContent = 'Đấu giá sẽ bắt đầu lúc 14:00 hôm nay';
        document.getElementById('activeStartPrice').textContent = '0 VNĐ';
        document.getElementById('activeOriginalPrice').textContent = '0 VNĐ';
        document.getElementById('activeImage').src = displayProduct.images[0];
        document.getElementById('activeDots').innerHTML = '';
        return;
    }
    
    if (currentIndex >= products.length) {
        document.getElementById('activeName').textContent = 'Đã kết thúc';
        document.getElementById('activeDescription').textContent = 'Tất cả sản phẩm đã được đấu giá!';
        document.getElementById('activeStartPrice').textContent = '0 VNĐ';
        document.getElementById('activeOriginalPrice').textContent = '0 VNĐ';
        document.getElementById('activeDots').innerHTML = '';
        if (activeImageInterval) clearInterval(activeImageInterval);
        return;
    }
    
    const product = products[currentIndex];
    const displayProduct = getDisplayProduct(product, currentIndex);
    
    document.getElementById('activeName').textContent = displayProduct.name;
    document.getElementById('activeDescription').textContent = displayProduct.description;
    document.getElementById('activeStartPrice').textContent = displayProduct.startPrice + ' VNĐ';
    document.getElementById('activeOriginalPrice').textContent = displayProduct.originalPrice + ' VNĐ';
    
    // Reset slideshow
    currentActiveImageIndex = 0;
    showActiveImage(0);
    startActiveImageSlideshow();
}

// Cập nhật countdown
function updateCountdown() {
    const currentIndex = getCurrentProductIndex();
    const countdownEl = document.getElementById('countdown');
    
    if (currentIndex === -1) {
        const now = new Date();
        const diff = startTime - now;
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        countdownEl.textContent = `⏰ Bắt đầu sau: ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        return;
    }
    
    if (currentIndex >= products.length) {
        countdownEl.textContent = '🎉 Đã kết thúc tất cả đấu giá!';
        return;
    }
    
    const now = new Date();
    const productStartTime = new Date(startTime.getTime() + currentIndex * AUCTION_DURATION);
    const productEndTime = new Date(productStartTime.getTime() + AUCTION_DURATION);
    const diff = productEndTime - now;
    
    if (diff <= 0) {
        countdownEl.textContent = '⏰ Thời gian còn lại: 00:00';
        return;
    }
    
    const minutes = Math.floor(diff / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    countdownEl.textContent = `⏰ Thời gian còn lại: ${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
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
    const currentIndex = getCurrentProductIndex();
    
    grid.innerHTML = '';
    
    // Dừng tất cả intervals cũ
    Object.values(productImageIntervals).forEach(interval => clearInterval(interval));
    productImageIntervals = {};
    
    products.forEach((product, index) => {
        const productStartTime = new Date(startTime.getTime() + index * AUCTION_DURATION);
        const productEndTime = new Date(productStartTime.getTime() + AUCTION_DURATION);
        
        const hours = productStartTime.getHours().toString().padStart(2, '0');
        const minutes = productStartTime.getMinutes().toString().padStart(2, '0');
        const endHours = productEndTime.getHours().toString().padStart(2, '0');
        const endMinutes = productEndTime.getMinutes().toString().padStart(2, '0');
        
        let statusClass = '';
        let statusText = `${hours}:${minutes} - ${endHours}:${endMinutes}`;
        
        if (index < currentIndex) {
            statusClass = 'completed';
        } else if (index === currentIndex) {
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
    
    // Event listeners cho nút prev/next
    document.getElementById('activePrev').addEventListener('click', prevActiveImage);
    document.getElementById('activeNext').addEventListener('click', nextActiveImage);
    
    // Cập nhật mỗi giây
    let lastProductIndex = getCurrentProductIndex();
    
    setInterval(() => {
        updateCountdown();
        const currentIndex = getCurrentProductIndex();
        
        // Nếu chuyển sang sản phẩm mới
        if (lastProductIndex !== currentIndex) {
            lastProductIndex = currentIndex;
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
    document.body.classList.remove('zoom-active');
    isZoomed = false;
}

// Add zoom indicators to images
function addZoomIndicators() {
    // Add to active product slideshow
    const activeContainer = document.querySelector('.slideshow-container');
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
