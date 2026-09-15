// ============ لوحة الإدارة - Admin Panel ============

document.addEventListener('DOMContentLoaded', function() {
    initializeAdminPanel();
    setupAdminEventListeners();
});

function initializeAdminPanel() {
    updateAdminName();
    setupTabNavigation();
    renderAdminOrders();
    renderServices();
    generateReports();
}

function setupAdminEventListeners() {
    // Tab Navigation
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', switchTab);
    });

    // Buttons
    document.getElementById('assignOrderBtn').addEventListener('click', () => openModal('assignOrderModal'));
    document.getElementById('addServiceBtn').addEventListener('click', addNewService);
    document.getElementById('addStaffBtn').addEventListener('click', addNewStaff);
    document.getElementById('saveAdminSettings').addEventListener('click', saveAdminSettings);
    document.getElementById('downloadMonthlyBtn').addEventListener('click', downloadMonthlyReport);
    document.getElementById('adminLogout').addEventListener('click', handleAdminLogout);

    // Search and Filter
    document.getElementById('adminSearchOrder').addEventListener('input', filterAdminOrders);
    document.getElementById('adminOrderFilter').addEventListener('change', filterAdminOrders);

    // Select All
    document.getElementById('selectAll').addEventListener('change', selectAllOrders);
}

function updateAdminName() {
    const nameElement = document.getElementById('adminName');
    if (currentUser) {
        nameElement.textContent = currentUser.name + ' (إداري)';
    }
}

function switchTab(e) {
    const targetTab = e.target.getAttribute('data-tab');
    
    // Remove active class from all buttons and contents
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    
    // Add active class to clicked button and corresponding content
    e.target.classList.add('active');
    document.getElementById(targetTab).classList.add('active');
}

function renderAdminOrders() {
    const orders = getAllOrders();
    const tbody = document.getElementById('adminOrdersBody');

    if (orders.length === 0) {
        tbody.innerHTML = '<tr class="empty-row"><td colspan="8">لا توجد طلبات</td></tr>';
        return;
    }

    tbody.innerHTML = orders.map((order, index) => `
        <tr>
            <td><input type="checkbox" class="order-checkbox" data-order-id="${order.id}"></td>
            <td>#${order.id.substr(0, 8)}</td>
            <td>${currentUser?.name || 'عميل'}</td>
            <td>${order.description}</td>
            <td><span class="status-badge status-${order.status}">${order.status}</span></td>
            <td>${order.assignedTo || '-'}</td>
            <td>${formatDate(order.dueDate)}</td>
            <td>
                <button class="btn-icon" onclick="editAdminOrder('${order.id}')">✎</button>
                <button class="btn-icon" onclick="deleteAdminOrder('${order.id}')">🗑</button>
            </td>
        </tr>
    `).join('');
}

function filterAdminOrders() {
    const searchTerm = document.getElementById('adminSearchOrder').value.toLowerCase();
    const statusFilter = document.getElementById('adminOrderFilter').value;

    let filtered = getAllOrders();

    if (statusFilter) {
        filtered = filtered.filter(o => o.status === statusFilter);
    }

    if (searchTerm) {
        filtered = filtered.filter(o =>
            o.title.toLowerCase().includes(searchTerm) ||
            o.description.toLowerCase().includes(searchTerm) ||
            o.id.includes(searchTerm)
        );
    }

    const tbody = document.getElementById('adminOrdersBody');
    if (filtered.length === 0) {
        tbody.innerHTML = '<tr class="empty-row"><td colspan="8">لا توجد نتائج</td></tr>';
        return;
    }

    tbody.innerHTML = filtered.map(order => `
        <tr>
            <td><input type="checkbox" class="order-checkbox" data-order-id="${order.id}"></td>
            <td>#${order.id.substr(0, 8)}</td>
            <td>${currentUser?.name || 'عميل'}</td>
            <td>${order.description}</td>
            <td><span class="status-badge status-${order.status}">${order.status}</span></td>
            <td>${order.assignedTo || '-'}</td>
            <td>${formatDate(order.dueDate)}</td>
            <td>
                <button class="btn-icon" onclick="editAdminOrder('${order.id}')">✎</button>
                <button class="btn-icon" onclick="deleteAdminOrder('${order.id}')">🗑</button>
            </td>
        </tr>
    `).join('');
}

function renderServices() {
    const container = document.getElementById('adminServicesGrid');
    
    if (allServices.length === 0) {
        container.innerHTML = '<div class="empty-state"><p>لا توجد خدمات</p></div>';
        return;
    }

    container.innerHTML = allServices.map(service => `
        <div class="service-card">
            <div class="service-header">
                <span class="service-icon">${service.icon}</span>
                <h4>${service.name}</h4>
            </div>
            <p>${service.description}</p>
            <p class="service-price">${service.price || 'حسب الطلب'}</p>
            <div class="service-actions">
                <button class="btn-icon" onclick="editService('${service.id}')">✎</button>
                <button class="btn-icon" onclick="deleteService('${service.id}')">🗑</button>
            </div>
        </div>
    `).join('');
}

function generateReports() {
    const monthlyReport = generateMonthlyReport();
    const performanceReport = generatePerformanceReport();

    document.getElementById('monthlyReport').innerHTML = `
        <p><strong>الشهر:</strong> ${monthlyReport.month}</p>
        <p><strong>إجمالي الطلبات:</strong> ${monthlyReport.totalOrders}</p>
        <p><strong>المكتملة:</strong> ${monthlyReport.completedOrders}</p>
        <p><strong>الإيرادات:</strong> ${monthlyReport.revenue} ريال</p>
    `;

    document.getElementById('performanceReport').innerHTML = `
        <p><strong>معدل الإنجاز:</strong> ${performanceReport.metrics.completionRate}%</p>
        <p><strong>متوسط الوقت:</strong> ${performanceReport.metrics.averageTime} ساعة</p>
        <p><strong>رضا العملاء:</strong> ${performanceReport.metrics.customerSatisfaction}/5</p>
    `;
}

function saveAdminSettings() {
    const companyName = document.getElementById('companyName').value;
    const companyEmail = document.getElementById('companyEmail').value;
    const companyPhone = document.getElementById('companyPhone').value;
    const avgTime = document.getElementById('avgCompletionTime').value;
    const extraPrice = document.getElementById('extraServicePrice').value;

    const settings = {
        companyName,
        companyEmail,
        companyPhone,
        avgCompletionTime: avgTime,
        extraServicePrice: extraPrice
    };

    localStorage.setItem('adminSettings', JSON.stringify(settings));
    showNotification('تم حفظ الإعدادات بنجاح!', 'success');
}

function downloadMonthlyReport() {
    const report = generateMonthlyReport();
    const reportStr = JSON.stringify(report, null, 2);
    const blob = new Blob([reportStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `monthly-report-${new Date().getTime()}.json`;
    link.click();
    showNotification('جاري تحميل التقرير...', 'info');
}

function selectAllOrders(e) {
    const checkboxes = document.querySelectorAll('.order-checkbox');
    checkboxes.forEach(checkbox => checkbox.checked = e.target.checked);
}

function editAdminOrder(orderId) {
    showNotification('تعديل الطلب قيد التطوير', 'info');
}

function deleteAdminOrder(orderId) {
    if (confirm('هل تريد حذف هذا الطلب؟')) {
        deleteOrder(orderId);
        renderAdminOrders();
    }
}

function addNewService() {
    showNotification('إضافة خدمة جديدة قيد التطوير', 'info');
}

function editService(serviceId) {
    showNotification('تعديل الخدمة قيد التطوير', 'info');
}

function deleteService(serviceId) {
    if (confirm('هل تريد حذف هذه الخدمة؟')) {
        const index = allServices.findIndex(s => s.id === serviceId);
        if (index > -1) {
            allServices.splice(index, 1);
            renderServices();
            showNotification('تم حذف الخدمة', 'success');
        }
    }
}

function addNewStaff() {
    showNotification('إضافة موظف جديد قيد التطوير', 'info');
}

function handleAdminLogout() {
    logoutUser();
    setTimeout(() => window.location.href = 'index.html', 1000);
}

console.log('✅ لوحة الإدارة جاهزة!');