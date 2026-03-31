// ==========================================
// CART STATE MANAGEMENT
// ==========================================
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// ==========================================
// USER AUTHENTICATION STATE
// ==========================================
let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
const users = JSON.parse(localStorage.getItem('users')) || [];

// ==========================================
// INITIALIZATION
// ==========================================
document.addEventListener('DOMContentLoaded', function () {
    initializeCart();
    initializeFilters();
    initializeSearch();
    initializeMobileMenu();
    updateCartUI();
    addScrollEffects();
    // initializeParticles(); // Disabled flying particles
});

// ==========================================
// CART FUNCTIONS
// ==========================================
function addToCart(id, name, price, image) {

    id = Number(id);

    const existingItem = cart.find(item => Number(item.id) === id);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: id,
            name: name,
            price: Number(price),
            image: image,
            quantity: 1
        });
    }

    saveCart();
    updateCartUI();
    showCartSidebar();
}

function removeFromCart(id) {
    id = Number(id);
    cart = cart.filter(item => Number(item.id) !== id);
    saveCart();
    updateCartUI();
}

function updateQuantity(id, change) {
    id = Number(id);
    const item = cart.find(item => Number(item.id) === id);
    if (item) {
        item.quantity += change;
        if (item.quantity <= 0) {
            removeFromCart(id);
        } else {
            saveCart();
            updateCartUI();
        }
    }
}

function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

function updateCartUI() {
    const cartItemsContainer = document.getElementById('cartItems');
    const cartCountElement = document.getElementById('cartCount');
    const cartTotalElement = document.getElementById('cartTotal');

    // Lưu emptyCart trước khi ghi đè innerHTML
    let emptyCart = document.getElementById('emptyCart');
    if (!emptyCart) {
        emptyCart = document.createElement('div');
        emptyCart.id = 'emptyCart';
        emptyCart.className = 'empty-cart';
        emptyCart.innerHTML = '<p>🛒 Giỏ hàng trống</p>';
    } else {
        // Tách emptyCart ra khỏi container để không bị mất khi ghi đè innerHTML
        if (emptyCart.parentNode === cartItemsContainer) {
            cartItemsContainer.removeChild(emptyCart);
        }
    }

    // Update cart count
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCountElement.textContent = totalItems;

    // Update cart total
    const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const finalTotal = Math.max(0, totalPrice - discountAmount);
    cartTotalElement.textContent = `${finalTotal.toLocaleString('vi-VN')}₫`;

    // Update cart items display
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '';
        emptyCart.style.display = 'block';
        cartItemsContainer.appendChild(emptyCart);
    } else {
        emptyCart.style.display = 'none';
        cartItemsContainer.innerHTML = cart.map(item => `
            <div class="cart-item">
                <div class="cart-item-image">
                    <img src="${item.image}" alt="${item.name}">
                </div>
                <div class="cart-item-details">
                    <div class="cart-item-name">${item.name}</div>
                    <div class="cart-item-price">${item.price.toLocaleString('vi-VN')}₫</div>
                    <div class="cart-item-controls">
                        <div class="quantity-controls">
                            <button class="qty-btn" onclick="updateQuantity(${item.id}, -1)">−</button>
                            <span class="quantity">${item.quantity}</span>
                            <button class="qty-btn" onclick="updateQuantity(${item.id}, 1)">+</button>
                        </div>
                        <button class="remove-item" onclick="removeFromCart(${item.id})">🗑️</button>
                    </div>
                </div>
            </div>
        `).join('');
    }
}

function initializeCart() {
    const cartBtn = document.getElementById('cartBtn');
    const closeCart = document.getElementById('closeCart');
    const overlay = document.getElementById('overlay');

    cartBtn.addEventListener('click', showCartSidebar);
    closeCart.addEventListener('click', hideCartSidebar);
    overlay.addEventListener('click', hideCartSidebar);
}

function showCartSidebar() {
    const cartSidebar = document.getElementById('cartSidebar');
    const overlay = document.getElementById('overlay');

    cartSidebar.classList.add('active');
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function hideCartSidebar() {
    const cartSidebar = document.getElementById('cartSidebar');
    const overlay = document.getElementById('overlay');

    cartSidebar.classList.remove('active');
    overlay.classList.remove('active');
    document.body.style.overflow = '';
}

// ==========================================
// PRODUCT FILTERING
// ==========================================
function initializeFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');

    filterButtons.forEach(button => {
        button.addEventListener('click', function () {
            // Update active state
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');

            // Filter products
            const category = this.getAttribute('data-category');
            filterProducts(category);
        });
    });
}

function filterProducts(category) {
    const productCards = document.querySelectorAll('.product-card');

    productCards.forEach(card => {
        const productCategory = card.getAttribute('data-category');

        if (category === 'all' || productCategory === category) {
            card.style.display = 'block';
            card.style.animation = 'slideIn 0.5s ease-out';
        } else {
            card.style.display = 'none';
        }
    });
}

// ==========================================
// SEARCH FUNCTIONALITY
// ==========================================
function initializeSearch() {
    const searchInput = document.getElementById('searchInput');

    searchInput.addEventListener('input', function () {
        const searchTerm = this.value.toLowerCase().trim();
        const productCards = document.querySelectorAll('.product-card');

        productCards.forEach(card => {
            const productName = card.querySelector('.product-name').textContent.toLowerCase();
            const productCategory = card.querySelector('.product-category').textContent.toLowerCase();

            if (productName.includes(searchTerm) || productCategory.includes(searchTerm)) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });

        // If search is empty, show all products
        if (searchTerm === '') {
            productCards.forEach(card => {
                card.style.display = 'block';
            });
        }
    });
}

// ==========================================
// MOBILE MENU
// ==========================================
function initializeMobileMenu() {
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const navLinks = document.getElementById('navLinks');

    mobileMenuBtn.addEventListener('click', function () {
        if (navLinks.style.display === 'flex') {
            navLinks.style.display = 'none';
        } else {
            navLinks.style.display = 'flex';
            navLinks.style.flexDirection = 'column';
            navLinks.style.position = 'absolute';
            navLinks.style.top = '70px';
            navLinks.style.left = '0';
            navLinks.style.right = '0';
            navLinks.style.background = 'var(--color-bg-secondary)';
            navLinks.style.padding = 'var(--spacing-md)';
            navLinks.style.boxShadow = 'var(--shadow-lg)';
        }
    });
}

// ==========================================
// SCROLL EFFECTS
// ==========================================
// function addScrollEffects() {
//     const header = document.getElementById('header');

//     window.addEventListener('scroll', function () {
//         if (window.scrollY > 100) {
//             header.style.background = 'rgba(38, 77, 194, 0.98)';
//             header.style.boxShadow = '0 10px 30px rgba(38, 77, 194, 0.98)';

//         } else {
//             header.style.background =' rgba(38, 77, 194, 0.98)';

//             header.style.boxShadow = 'var(--shadow-md)';
//         }
//     });

// Intersection Observer for product cards animation
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver(function (entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.animation = 'slideIn 0.6s ease-out';
            entry.target.style.opacity = '1';
        }
    });
}, observerOptions);

// Observe all product cards
const productCards = document.querySelectorAll('.product-card');
productCards.forEach(card => {
    card.style.opacity = '0';
    observer.observe(card);
});


// ==========================================
// SMOOTH SCROLL FOR NAVIGATION LINKS
// ==========================================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });

            // Close mobile menu if open
            const navLinks = document.getElementById('navLinks');
            if (window.innerWidth <= 768) {
                navLinks.style.display = 'none';
            }
        }
    });
});

// ==========================================
// CHECKOUT FUNCTIONALITY
// ==========================================
let appliedVoucher = null;
let discountAmount = 0;

// Voucher data
const vouchers = {
    'COFFEE20': { type: 'percent', value: 20, minOrder: 200000, description: 'Giảm 20%' },
    'NEWBIE15': { type: 'percent', value: 15, minOrder: 150000, description: 'Giảm 15%' },
    'HOT30K': { type: 'fixed', value: 30000, minOrder: 100000, description: 'Giảm 30K' },
    'BEANS25': { type: 'percent', value: 25, minOrder: 0, description: 'Giảm 25%' }
};

function copyVoucherCode(elementId, code) {
    // Copy to clipboard
    navigator.clipboard.writeText(code).then(() => {
        showNotification(`Đã sao chép mã "${code}" vào clipboard! 📋`);
    }).catch(err => {
        console.error('Could not copy text: ', err);
    });
}

function revealVoucherCode(elementId) {
    const codeElement = document.getElementById(elementId);
    // Get the parent voucher-code container
    const voucherCodeContainer = codeElement.closest('.voucher-code');

    if (voucherCodeContainer && !voucherCodeContainer.classList.contains('revealed')) {
        voucherCodeContainer.classList.add('revealed');
        voucherCodeContainer.style.display = 'flex'; // Override inline style
        showNotification('Mã voucher đã được hiển thị! 🎁');
    }
}

function applyVoucher() {
    const voucherInput = document.getElementById('voucherInput');
    const code = voucherInput.value.trim().toUpperCase();

    if (!code) {
        alert('Vui lòng nhập mã giảm giá');
        return;
    }

    const voucher = vouchers[code];

    if (!voucher) {
        alert('Mã giảm giá không hợp lệ');
        return;
    }

    const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    if (totalPrice < voucher.minOrder) {
        alert(`Đơn hàng tối thiểu ${voucher.minOrder.toLocaleString('vi-VN')}₫ để sử dụng mã này`);
        return;
    }

    appliedVoucher = code;

    if (voucher.type === 'percent') {
        discountAmount = (totalPrice * voucher.value) / 100;
    } else {
        discountAmount = voucher.value;
    }

    updateCartUI();
    showNotification(`Đã áp dụng mã ${code} thành công! 🎉`);
    voucherInput.value = '';

    // Show discount info
    document.getElementById('discountInfo').style.display = 'flex';
    document.getElementById('discountAmount').textContent = `-${discountAmount.toLocaleString('vi-VN')}₫`;
}

document.querySelector('.checkout-btn')?.addEventListener('click', function () {
    if (cart.length === 0) {
        alert('Giỏ hàng của bạn đang trống!');
        return;
    }

    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const finalTotal = total - discountAmount;

    let message = `Cảm ơn bạn đã mua hàng!\n\n`;
    message += `Tổng tiền hàng: ${total.toLocaleString('vi-VN')}₫\n`;

    if (discountAmount > 0) {
        message += `Giảm giá (${appliedVoucher}): -${discountAmount.toLocaleString('vi-VN')}₫\n`;
    }

    message += `\n🎉 Thành tiền: ${finalTotal.toLocaleString('vi-VN')}₫\n\n`;
    message += `Đơn hàng sẽ được xử lý sớm.`;

    alert(message);

    // Clear cart and voucher after checkout
    cart = [];
    appliedVoucher = null;
    discountAmount = 0;
    document.getElementById('discountInfo').style.display = 'none';
    saveCart();
    updateCartUI();
    hideCartSidebar();
});

// ==========================================
// AUTHENTICATION FUNCTIONS
// ==========================================
function initializeAuth() {
    const loginBtn = document.getElementById('loginBtn');
    const loginModal = document.getElementById('loginModal');
    const closeLogin = document.getElementById('closeLogin');
    const overlay = document.getElementById('overlay');
    const toggleFormBtn = document.getElementById('toggleFormBtn');
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');

    // Open login modal
    loginBtn?.addEventListener('click', showLoginModal);

    // Close modal
    closeLogin?.addEventListener('click', hideLoginModal);
    overlay?.addEventListener('click', function (e) {
        if (e.target === overlay) {
            hideLoginModal();
        }
    });

    // Toggle between login and register
    toggleFormBtn?.addEventListener('click', function (e) {
        e.preventDefault();
        toggleAuthForm();
    });

    // Handle login form submission
    loginForm?.addEventListener('submit', function (e) {
        e.preventDefault();
        handleLogin();
    });

    // Handle register form submission
    registerForm?.addEventListener('submit', function (e) {
        e.preventDefault();
        handleRegister();
    });
}

function showLoginModal() {
    const loginModal = document.getElementById('loginModal');
    const overlay = document.getElementById('overlay');
    const cartSidebar = document.getElementById('cartSidebar');

    // Close cart if open
    cartSidebar?.classList.remove('active');

    loginModal.classList.add('active');
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function hideLoginModal() {
    const loginModal = document.getElementById('loginModal');
    const overlay = document.getElementById('overlay');

    loginModal.classList.remove('active');
    overlay.classList.remove('active');
    document.body.style.overflow = '';
}

function toggleAuthForm() {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const modalTitle = document.getElementById('modalTitle');
    const modalSubtitle = document.getElementById('modalSubtitle');
    const toggleText = document.getElementById('toggleText');
    const toggleFormBtn = document.getElementById('toggleFormBtn');

    if (loginForm.style.display === 'none') {
        // Switch to login
        loginForm.style.display = 'block';
        registerForm.style.display = 'none';
        modalTitle.textContent = 'Đăng Nhập';
        modalSubtitle.textContent = 'Chào mừng trở lại!';
        toggleText.innerHTML = 'Chưa có tài khoản? <a href="#" id="toggleFormBtn">Đăng ký ngay</a>';
    } else {
        // Switch to register
        loginForm.style.display = 'none';
        registerForm.style.display = 'block';
        modalTitle.textContent = 'Đăng Ký';
        modalSubtitle.textContent = 'Tạo tài khoản mới';
        toggleText.innerHTML = 'Đã có tài khoản? <a href="#" id="toggleFormBtn">Đăng nhập</a>';
    }

    // Re-attach event listener to new button
    const newToggleBtn = document.getElementById('toggleFormBtn');
    newToggleBtn.addEventListener('click', function (e) {
        e.preventDefault();
        toggleAuthForm();
    });
}

function handleLogin() {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    // Find user in stored users
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users.find(u => u.email === email && u.password === password);

    if (user) {
        currentUser = { name: user.name, email: user.email };
        localStorage.setItem('currentUser', JSON.stringify(currentUser));

        updateAuthUI();
        hideLoginModal();

        // Show success message
        showNotification(`Chào mừng trở lại, ${user.name}! 👋`);
    } else {
        alert('Email hoặc mật khẩu không đúng');
    }

    // Clear form
    document.getElementById('loginForm').reset();
}

function handleRegister() {
    const name = document.getElementById('registerName').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('registerConfirmPassword').value;

    // Validation
    if (password.length < 6) {
        alert('Mật khẩu phải có tối thiểu 6 ký tự');
        return;
    }

    if (password !== confirmPassword) {
        alert('Mật khẩu xác nhận không khớp');
        return;
    }

    // Check if email already exists
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const existingUser = users.find(u => u.email === email);

    if (existingUser) {
        alert('Email đã được sử dụng');
        return;
    }

    // Create new user
    const newUser = { name, email, password };
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));

    // Auto login
    currentUser = { name, email };
    localStorage.setItem('currentUser', JSON.stringify(currentUser));

    updateAuthUI();
    hideLoginModal();

    // Show success message
    showNotification(`Chào mừng ${name}! Tài khoản đã được tạo thành công! 🎉`);

    // Clear form
    document.getElementById('registerForm').reset();
}

function updateAuthUI() {
    const loginBtn = document.getElementById('loginBtn');
    const navActions = document.querySelector('.nav-actions');

    if (currentUser) {
        // User is logged in - show user menu
        const userInitial = currentUser.name.charAt(0).toUpperCase();
        loginBtn.innerHTML = `
            <div class="user-avatar">${userInitial}</div>
            <span>${currentUser.name.split(' ')[0]}</span>
        `;
        loginBtn.onclick = handleLogout;
    } else {
        // User is logged out - show login button
        loginBtn.innerHTML = '👤 Đăng nhập';
        loginBtn.onclick = showLoginModal;
    }
}

function handleLogout() {
    if (confirm('Bạn có chắc muốn đăng xuất?')) {
        currentUser = null;
        localStorage.removeItem('currentUser');
        updateAuthUI();
        showNotification('Đã đăng xuất thành công! 👋');
    }
}

function showNotification(message) {
    // Create notification element
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: linear-gradient(135deg, #667eea 0%, #f81ce5 100%);
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 0.75rem;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5);
        z-index: 10000;
        animation: slideIn 0.3s ease-out;
        font-weight: 600;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);

    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// ==========================================
// WINDOW RESIZE HANDLER
// ==========================================
window.addEventListener('resize', function () {
    const navLinks = document.getElementById('navLinks');

    if (window.innerWidth > 768) {
        navLinks.style.display = 'flex';
        navLinks.style.flexDirection = 'row';
        navLinks.style.position = 'static';
        navLinks.style.background = 'transparent';
        navLinks.style.padding = '0';
        navLinks.style.boxShadow = 'none';
    } else {
        navLinks.style.display = 'none';
    }
});

// ==========================================
// PARTICLE EFFECTS ANIMATION
// ==========================================
function initializeParticles() {
    const particleContainer = document.createElement('div');
    particleContainer.id = 'particles-container';
    particleContainer.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 1;
        overflow: hidden;
    `;
    document.body.insertBefore(particleContainer, document.body.firstChild);

    // Coffee-themed particles
    const particles = ['☕', '🌿', '✨', '💫', '🍃'];
    const particleCount = 20;

    for (let i = 0; i < particleCount; i++) {
        createParticle(particleContainer, particles);
    }
}

function createParticle(container, icons) {
    const particle = document.createElement('div');
    const icon = icons[Math.floor(Math.random() * icons.length)];
    const size = Math.random() * 20 + 20;
    const startX = Math.random() * window.innerWidth;
    const duration = Math.random() * 20 + 15;
    const delay = Math.random() * 5;
    const drift = (Math.random() - 0.5) * 200;

    particle.textContent = icon;
    particle.style.cssText = `
        position: absolute;
        left: ${startX}px;
        bottom: -50px;
        font-size: ${size}px;
        opacity: ${Math.random() * 0.3 + 0.2};
        animation: floatUp ${duration}s ${delay}s linear infinite;
        transform: translateX(0);
    `;

    particle.style.setProperty('--drift', `${drift}px`);

    container.appendChild(particle);

    // Re-create particle when animation ends
    setTimeout(() => {
        particle.remove();
        createParticle(container, icons);
    }, (duration + delay) * 1000);
}

// Add CSS animation for particles
const styleSheet = document.createElement('style');
styleSheet.textContent = `
    @keyframes floatUp {
        0% {
            transform: translateY(0) translateX(0) rotate(0deg);
            opacity: 0;
        }
        10% {
            opacity: 0.5;
        }
        90% {
            opacity: 0.5;
        }
        100% {
            transform: translateY(-100vh) translateX(var(--drift)) rotate(360deg);
            opacity: 0;
        }
    }
`;
document.head.appendChild(styleSheet);
