// ============================================
// لوحة التحكم - وظائف إضافية
// ============================================

let dashboardStats = null;

document.addEventListener('DOMContentLoaded', function() {
    initializeDashboard();
    setupDashboardEventListeners();
    refreshDashboard();
});

function initializeDashboard() {
    initializeServices();
    updateDashboardStats();
    renderRecentOrders();
    renderOrdersTable();
    updateUserProfile();
}

function setupDashboardEventListeners() {
    // أزرار الإنشاء
    document.getElementById('newOrderBtn').addEventListener('click', () => openModal('newOrderModal'));
    document.getElementById('quickNewOrder').addEventListener('click', () => openModal('newOrderModal'));
    
    // تصدير البيانات
    document.getElementById('exportBtn').addEventListener('click', exportDataAsJSON);
    
    // البحث والتصفية
    document.getElementById('searchOrders').addEventListener('input', filterOrders);
    document.getElementById('filterStatus').addEventListener('change', filterOrders);
    
    // نموذج الطلب الجديد
    document.getElementById('newOrderForm').addEventListener('submit', handleNewOrderSubmit);
    
    // الخروج
    document.getElementById('logoutBtn').addEventListener('click', handleLogout);
    
    // إجراءات سريعة
    document.getElementById('quickViewOrders').addEventListener('click', () => {
        document.querySelector('.orders-table').scrollIntoView({ behavior: 'smooth' });
    });
    
    document.getElementById('quickClientPanel').addEventListener('click', () => {
        window.location.href = 'client-panel.html';
    });
    
    document.getElementById('quickNewCorrespondence').addEventListener('click', () => {
        window.location.href = 'correspondence.html';
    });
    
    // إغلاق النافذة المنبثقة
    document.querySelectorAll('.modal-close').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.target.closest('.modal').classList.remove('show');
        });
    });
}

function updateDashboardStats() {
    const stats = dashboard.updateStats();
    dashboardStats = stats;
    
    document.getElementById('totalOrders').textContent = stats.totalOrders;
    document.getElementById('completedOrders').textContent = stats.completedOrders;
    document.getElementById('pendingOrders').textContent = stats.pendingOrders;
    document.getElementById('totalRevenue').textContent = stats.revenue + ' ريال';
    
    const metrics = dashboard.getPerformanceMetrics();
    document.getElementById('completionRate').textContent = metrics.completionRate + '%';
    document.getElementById('averageTime').textContent = metrics.averageTime + ' ساعة';
    document.getElementById('satisfaction').textContent = metrics.customerSatisfaction + '/5';
}

function renderRecentOrders() {
    const recentOrders = dashboard.getRecentOrders(5);
    const container = document.getElementById('recentOrdersList');
    
    if (recentOrders.length === 0) {
        container.innerHTML = '<div class="empty-state"><p>لا توجد طلبات حالياً</p></div>';
        return;
    }
    
    container.innerHTML = recentOrders.map(order => `
        <div class="order-item">
            <div class="order-header">
                <h4>${order.title}</h4>
                <span class="status-badge status-${order.status}">${order.status}</span>
            </div>
            <div class="order-details">
                <p><strong>الخدمة:</strong> ${order.description}</p>
                <p><strong>التاريخ:</strong> ${formatDate(order.createdAt)}</p>
            </div>
            <div class="order-progress">
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${order.progress}%;"></div>
                </div>
                <span class="progress-text">${order.progress}%</span>
            </div>
        </div>
    `).join('');
}

function renderOrdersTable() {
    const orders = getAllOrders();
    const tbody = document.getElementById('ordersTableBody');
    
    if (orders.length === 0) {
        tbody.innerHTML = '<tr class="empty-row"><td colspan="7">لا توجد طلبات</td></tr>';
        return;
    }
    
    tbody.innerHTML = orders.map(order => `
        <tr>
            <td>
                <a href="#" class="order-link" data-order-id="${order.id}">
                    #${order.id.substr(0, 8)}
                </a>
            </td>
            <td>${order.description}</td>
            <td><span class="status-badge status-${order.status}">${order.status}</span></td>
            <td>
                <span class="priority-badge priority-${order.priority}">
                    ${order.priority}
                </span>
            </td>
            <td>
                <div class="progress-small">
                    <div class="progress-fill" style="width: ${order.progress}%;"></div>
                </div>
                ${order.progress}%
            </td>
            <td>${formatDate(order.createdAt)}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn-icon" title="تعديل" onclick="editOrder('${order.id}')">✎</button>
                    <button class="btn-icon" title="حذف" onclick="deleteOrder('${order.id}')">🗑</button>
                    <button class="btn-icon" title="التفاصيل" onclick="viewOrderDetails('${order.id}')">👁</button>
                </div>
            </td>
        </tr>
    `).join('');
    
    // إضافة مستمعي الأحداث
    document.querySelectorAll('.order-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const orderId = link.getAttribute('data-order-id');
            viewOrderDetails(orderId);
        });
    });
}

function filterOrders() {
    const searchTerm = document.getElementById('searchOrders').value.toLowerCase();
    const statusFilter = document.getElementById('filterStatus').value;
    
    let filtered = getAllOrders();
    
    if (statusFilter) {
        filtered = filtered.filter(order => order.status === statusFilter);
    }
    
    if (searchTerm) {
        filtered = filtered.filter(order => 
            order.title.toLowerCase().includes(searchTerm) ||
            order.description.toLowerCase().includes(searchTerm) ||
            order.id.includes(searchTerm)
        );
    }
    
    const tbody = document.getElementById('ordersTableBody');
    
    if (filtered.length === 0) {
        tbody.innerHTML = '<tr class="empty-row"><td colspan="7">لا توجد نتائج</td></tr>';
        return;
    }
    
    tbody.innerHTML = filtered.map(order => `
        <tr>
            <td>#${order.id.substr(0, 8)}</td>
            <td>${order.description}</td>
            <td><span class="status-badge status-${order.status}">${order.status}</span></td>
            <td><span class="priority-badge priority-${order.priority}">${order.priority}</span></td>
            <td>
                <div class="progress-small">
                    <div class="progress-fill" style="width: ${order.progress}%;"></div>
                </div>
                ${order.progress}%
            </td>
            <td>${formatDate(order.createdAt)}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn-icon" onclick="editOrder('${order.id}')">✎</button>
                    <button class="btn-icon" onclick="deleteOrder('${order.id}')">🗑</button>
                    <button class="btn-icon" onclick="viewOrderDetails('${order.id}')">👁</button>
                </div>
            </td>
        </tr>
    `).join('');
}

function handleNewOrderSubmit(e) {
    e.preventDefault();
    
    const service = document.getElementById('serviceSelect').value;
    const title = document.getElementById('orderTitle').value;
    const description = document.getElementById('orderDescription').value;
    const priority = document.getElementById('orderPriority').value;
    const dueDate = document.getElementById('orderDueDate').value;
    
    if (!service || !title || !description) {
        showNotification('الرجاء ملء جميع الحقول المطلوبة', 'error');
        return;
    }
    
    const order = createOrder(service, title, description);
    order.priority = priority;
    if (dueDate) order.dueDate = new Date(dueDate);
    
    // استخدام الذكاء الاصطناعي للتصنيف التلقائي
    order.priority = aiAssistant.estimatePriority(description);
    
    saveAllData();
    
    // إعادة تحديث الجداول
    updateDashboardStats();
    renderRecentOrders();
    renderOrdersTable();
    
    // إغلاق النافذة المنبثقة
    closeModal('newOrderModal');
    e.target.reset();
    
    showNotification('تم إنشاء الطلب بنجاح! 🎉', 'success');
}

function viewOrderDetails(orderId) {
    const order = getOrderById(orderId);
    if (!order) {
        showNotification('الطلب غير موجود', 'error');
        return;
    }
    
    // يمكن فتح صفحة تفاصيل أو نافذة منبثقة
    console.log('تفاصيل الطلب:', order);
    alert(`
    🎫 تفاصيل الطلب
    
ID: ${order.id}
العنوان: ${order.title}
الوصف: ${order.description}
الحالة: ${order.status}
الأولوية: ${order.priority}
التقدم: ${order.progress}%
التاريخ: ${formatDate(order.createdAt)}
    `);
}

function editOrder(orderId) {
    const order = getOrderById(orderId);
    if (!order) {
        showNotification('الطلب غير موجود', 'error');
        return;
    }
    
    showNotification('تم فتح نافذة التعديل (قيد التطوير)', 'info');
    console.log('تعديل الطلب:', order);
}

function deleteOrder(orderId) {
    if (confirm('هل تريد حذف هذا الطلب؟')) {
        const index = allOrders.findIndex(o => o.id === orderId);
        if (index > -1) {
            allOrders.splice(index, 1);
            saveAllData();
            updateDashboardStats();
            renderRecentOrders();
            renderOrdersTable();
            showNotification('تم حذف الطلب بنجاح', 'success');
        }
    }
}

function updateUserProfile() {
    const userNameElement = document.getElementById('userName');
    if (currentUser) {
        userNameElement.textContent = currentUser.name;
    } else {
        userNameElement.textContent = 'زائر';
    }
}

function handleLogout() {
    logoutUser();
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 1000);
}

function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('show');
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('show');
    }
}

function refreshDashboard() {
    updateDashboardStats();
    renderRecentOrders();
    renderOrdersTable();
    
    // تحديث تلقائي كل 30 ثانية
    setInterval(() => {
        updateDashboardStats();
    }, 30000);
}

console.log('✅ لوحة التحكم جاهزة للعمل!');