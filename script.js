// ============================================
// إدارة نجد - نظام الإدارة الديناميكي
// ============================================

// ============ متغيرات عامة ============
let currentUser = null;
let allOrders = [];
let allServices = [];
let correspondenceList = [];

// ============ تهيئة التطبيق ============
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
    loadStoredData();
});

function initializeApp() {
    console.log('تم تهيئة التطبيق بنجاح');
    checkUserLogin();
}

// ============ إدارة التسجيل والدخول ============
function checkUserLogin() {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
        currentUser = JSON.parse(storedUser);
        console.log('مرحباً ' + currentUser.name);
    }
}

function loginUser(email, password) {
    // محاكاة تسجيل الدخول
    if (email && password) {
        currentUser = {
            id: Math.random().toString(36).substr(2, 9),
            name: email.split('@')[0],
            email: email,
            plan: 'احترافية',
            joinDate: new Date().toLocaleDateString('ar-SA')
        };
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        showNotification('تم تسجيل الدخول بنجاح!', 'success');
        return true;
    }
    return false;
}

function logoutUser() {
    localStorage.removeItem('currentUser');
    currentUser = null;
    showNotification('تم تسجيل الخروج', 'info');
}

// ============ إدارة الطلبات ============
class Order {
    constructor(serviceId, title, description, attachments = []) {
        this.id = Math.random().toString(36).substr(2, 9);
        this.serviceId = serviceId;
        this.title = title;
        this.description = description;
        this.status = 'جديد';
        this.attachments = attachments;
        this.createdAt = new Date();
        this.updatedAt = new Date();
        this.priority = 'عادي';
        this.dueDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        this.assignedTo = null;
        this.progress = 0;
        this.notes = [];
        this.files = [];
    }

    updateStatus(newStatus) {
        this.status = newStatus;
        this.updatedAt = new Date();
    }

    addNote(note, author = 'النظام') {
        this.notes.push({
            id: Math.random().toString(36).substr(2, 9),
            text: note,
            author: author,
            timestamp: new Date()
        });
    }

    addFile(fileName, fileData) {
        this.files.push({
            id: Math.random().toString(36).substr(2, 9),
            name: fileName,
            data: fileData,
            uploadedAt: new Date()
        });
    }

    updateProgress(percentage) {
        this.progress = Math.min(100, Math.max(0, percentage));
    }
}

function createOrder(serviceId, title, description, attachments = []) {
    const order = new Order(serviceId, title, description, attachments);
    allOrders.push(order);
    localStorage.setItem('allOrders', JSON.stringify(allOrders));
    showNotification('تم إنشاء الطلب بنجاح!', 'success');
    return order;
}

function getOrderById(orderId) {
    return allOrders.find(order => order.id === orderId);
}

function updateOrderStatus(orderId, newStatus) {
    const order = getOrderById(orderId);
    if (order) {
        order.updateStatus(newStatus);
        localStorage.setItem('allOrders', JSON.stringify(allOrders));
        showNotification(`تم تحديث حالة الطلب إلى: ${newStatus}`, 'success');
    }
}

function getAllOrders(filter = null) {
    if (filter) {
        return allOrders.filter(order => {
            if (filter.status && order.status !== filter.status) return false;
            if (filter.priority && order.priority !== filter.priority) return false;
            return true;
        });
    }
    return allOrders;
}

// ============ إدارة الخدمات ============
class Service {
    constructor(name, description, price, icon) {
        this.id = Math.random().toString(36).substr(2, 9);
        this.name = name;
        this.description = description;
        this.price = price;
        this.icon = icon;
        this.isActive = true;
    }
}

function initializeServices() {
    allServices = [
        new Service('السكرتارية الإلكترونية', 'إدارة البريد والاتصالات', 100, '📋'),
        new Service('إعداد المستندات', 'إنشاء وتحرير المستندات الرسمية', 50, '📄'),
        new Service('إدارة الاجتماعات', 'تنظيم الاجتماعات وتسجيل المحاضر', 100, '🎧'),
        new Service('خدمات مخصصة', 'خدمات حسب احتياجات العميل', 0, '⭐'),
        new Service('إدارة الصادر والوارد', 'تنظيم المراسلات', 100, '📨'),
        new Service('العروض والتقارير', 'إعداد العروض التقديمية والتقارير', 100, '📊'),
        new Service('إدارة الملفات', 'تنظيم وحفظ البيانات', 75, '💾')
    ];
}

// ============ إدارة الصادر والوارد ============
class Correspondence {
    constructor(type, title, content, from, to) {
        this.id = Math.random().toString(36).substr(2, 9);
        this.type = type; // 'صادر' أو 'وارد'
        this.title = title;
        this.content = content;
        this.from = from;
        this.to = to;
        this.date = new Date();
        this.status = 'جديد';
        this.relatedCorrespondence = null; // ربط مع صادر/وارد آخر
        this.attachments = [];
    }

    linkCorrespondence(correspondenceId) {
        this.relatedCorrespondence = correspondenceId;
    }

    updateStatus(newStatus) {
        this.status = newStatus;
    }

    addAttachment(fileName) {
        this.attachments.push({
            name: fileName,
            uploadedAt: new Date()
        });
    }
}

function addCorrespondence(type, title, content, from, to) {
    const correspondence = new Correspondence(type, title, content, from, to);
    correspondenceList.push(correspondence);
    localStorage.setItem('correspondenceList', JSON.stringify(correspondenceList));
    showNotification(`تم إضافة ${type} جديد!`, 'success');
    return correspondence;
}

function linkCorrespondences(incomingId, outgoingId) {
    const incoming = correspondenceList.find(c => c.id === incomingId);
    const outgoing = correspondenceList.find(c => c.id === outgoingId);
    
    if (incoming && outgoing) {
        incoming.linkCorrespondence(outgoingId);
        outgoing.linkCorrespondence(incomingId);
        localStorage.setItem('correspondenceList', JSON.stringify(correspondenceList));
        showNotification('تم ربط الصادر والوارد بنجاح!', 'success');
    }
}

// ============ نظام الملفات والتحميل ============
class FileManager {
    constructor() {
        this.files = [];
        this.maxFileSize = 10 * 1024 * 1024; // 10MB
    }

    uploadFile(fileName, fileContent, orderId) {
        if (fileContent.size > this.maxFileSize) {
            showNotification('حجم الملف كبير جداً (الحد الأقصى 10MB)', 'error');
            return false;
        }

        const file = {
            id: Math.random().toString(36).substr(2, 9),
            name: fileName,
            size: fileContent.size,
            type: fileContent.type,
            orderId: orderId,
            uploadedAt: new Date(),
            downloadUrl: URL.createObjectURL(fileContent)
        };

        this.files.push(file);
        localStorage.setItem('uploadedFiles', JSON.stringify(this.files));
        showNotification('تم تحميل الملف بنجاح!', 'success');
        return file;
    }

    getFilesByOrder(orderId) {
        return this.files.filter(file => file.orderId === orderId);
    }

    downloadFile(fileId) {
        const file = this.files.find(f => f.id === fileId);
        if (file) {
            const link = document.createElement('a');
            link.href = file.downloadUrl;
            link.download = file.name;
            link.click();
            showNotification('جاري تحميل الملف...', 'info');
        }
    }
}

const fileManager = new FileManager();

// ============ نظام الذكاء الاصطناعي ============
class AIAssistant {
    constructor() {
        this.suggestions = [];
        this.automatedTasks = [];
    }

    // اقتراح التصنيفات التلقائية
    categorizeOrder(description) {
        const keywords = {
            'بريد': 'السكرتارية الإلكترونية',
            'مستند': 'إعداد المستندات',
            'اجتماع': 'إدارة الاجتماعات',
            'تقرير': 'العروض والتقارير',
            'ملف': 'إدارة الملفات'
        };

        for (let keyword in keywords) {
            if (description.includes(keyword)) {
                return keywords[keyword];
            }
        }
        return 'خدمات مخصصة';
    }

    // تقدير الأولوية
    estimatePriority(description) {
        const urgentKeywords = ['عاجل', 'طارئ', 'سريع', 'فوري'];
        for (let keyword of urgentKeywords) {
            if (description.includes(keyword)) {
                return 'عاجل';
            }
        }
        return 'عادي';
    }

    // توليد الاقتراحات
    generateSuggestions(order) {
        const suggestions = [];

        if (order.status === 'جديد') {
            suggestions.push('تأكد من جميع التفاصيل المطلوبة');
        }

        if (order.progress < 50) {
            suggestions.push('يمكن البدء في تنفيذ الطلب');
        }

        if (order.progress >= 80) {
            suggestions.push('الطلب قريب من الانتهاء، جهز التقرير النهائي');
        }

        return suggestions;
    }

    // أتمتة المهام
    automateTask(taskType, orderData) {
        const automatedTask = {
            id: Math.random().toString(36).substr(2, 9),
            type: taskType,
            data: orderData,
            createdAt: new Date(),
            completed: false
        };

        this.automatedTasks.push(automatedTask);
        return automatedTask;
    }
}

const aiAssistant = new AIAssistant();

// ============ لوحة التحكم ============
class Dashboard {
    constructor() {
        this.stats = {
            totalOrders: 0,
            completedOrders: 0,
            pendingOrders: 0,
            revenue: 0
        };
    }

    updateStats() {
        this.stats.totalOrders = allOrders.length;
        this.stats.completedOrders = allOrders.filter(o => o.status === 'مكتمل').length;
        this.stats.pendingOrders = allOrders.filter(o => o.status === 'جديد' || o.status === 'قيد المراجعة').length;
        this.stats.revenue = allOrders.reduce((sum, o) => sum + (o.price || 0), 0);
        return this.stats;
    }

    getRecentOrders(limit = 5) {
        return allOrders.sort((a, b) => b.createdAt - a.createdAt).slice(0, limit);
    }

    getOrdersByStatus(status) {
        return allOrders.filter(o => o.status === status);
    }

    getPerformanceMetrics() {
        return {
            completionRate: this.stats.totalOrders > 0 ? (this.stats.completedOrders / this.stats.totalOrders * 100).toFixed(2) : 0,
            averageTime: this.calculateAverageTime(),
            customerSatisfaction: 4.8 // من 5
        };
    }

    calculateAverageTime() {
        if (allOrders.length === 0) return 0;
        const total = allOrders.reduce((sum, order) => {
            return sum + (order.updatedAt - order.createdAt);
        }, 0);
        return Math.round((total / allOrders.length) / (1000 * 60 * 60)); // بالساعات
    }
}

const dashboard = new Dashboard();

// ============ إدارة الإخطارات ============
function showNotification(message, type = 'info') {
    const notificationDiv = document.createElement('div');
    notificationDiv.className = `notification notification-${type}`;
    notificationDiv.innerHTML = `
        <div class="notification-content">
            <span class="notification-icon">${type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ'}</span>
            <span class="notification-text">${message}</span>
        </div>
    `;

    document.body.appendChild(notificationDiv);

    setTimeout(() => {
        notificationDiv.classList.add('notification-show');
    }, 10);

    setTimeout(() => {
        notificationDiv.classList.remove('notification-show');
        setTimeout(() => notificationDiv.remove(), 300);
    }, 3000);
}

// ============ معالجات الأحداث ============
function setupEventListeners() {
    // معالج نموذج التواصل
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', handleContactForm);
    }

    // معالج الأسئلة الشائعة
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
        item.querySelector('.faq-question').addEventListener('click', toggleFAQ);
    });

    // معالج الأزرار
    const serviceButtons = document.querySelectorAll('.btn-add');
    serviceButtons.forEach((btn, index) => {
        btn.addEventListener('click', () => handleServiceClick(index));
    });

    // معالج زر الدخول
    const loginBtn = document.querySelector('.btn-login');
    if (loginBtn) {
        loginBtn.addEventListener('click', handleLoginClick);
    }
}

function handleContactForm(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const data = {
        fullName: formData.get('fullName') || document.querySelectorAll('.form-input')[1].value,
        email: document.querySelectorAll('.form-input')[0].value,
        message: document.querySelector('.form-textarea').value
    };

    if (data.email && data.message) {
        // إنشاء طلب جديد
        const order = createOrder(
            'contact-inquiry',
            'استفسار من: ' + (data.fullName || data.email),
            data.message,
            []
        );

        // إرسال بريد إلكتروني محاكاة
        console.log('إرسال بريد إلى: hello@edaratnajd.sa', data);

        e.target.reset();
        showNotification('تم استقبال رسالتك! سنتواصل معك قريباً', 'success');
    }
}

function toggleFAQ(e) {
    const faqItem = e.target.closest('.faq-item');
    faqItem.classList.toggle('active');
}

function handleServiceClick(serviceIndex) {
    showNotification(`تم إضافة الخدمة: ${allServices[serviceIndex]?.name || 'خدمة'}`, 'success');
}

function handleLoginClick() {
    const email = prompt('أدخل بريدك الإلكتروني:');
    const password = prompt('أدخل كلمة المرور:');
    
    if (loginUser(email, password)) {
        console.log('تم تسجيل الدخول بنجاح');
    }
}

// ============ تحميل البيانات المخزنة ============
function loadStoredData() {
    const storedOrders = localStorage.getItem('allOrders');
    if (storedOrders) {
        allOrders = JSON.parse(storedOrders);
    }

    const storedCorrespondence = localStorage.getItem('correspondenceList');
    if (storedCorrespondence) {
        correspondenceList = JSON.parse(storedCorrespondence);
    }

    initializeServices();
}

// ============ حفظ البيانات ============
function saveAllData() {
    localStorage.setItem('allOrders', JSON.stringify(allOrders));
    localStorage.setItem('correspondenceList', JSON.stringify(correspondenceList));
}

// حفظ البيانات قبل مغادرة الصفحة
window.addEventListener('beforeunload', saveAllData);

// ============ التصدير والاستيراد ============
function exportDataAsJSON() {
    const data = {
        orders: allOrders,
        correspondence: correspondenceList,
        exportDate: new Date()
    };

    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `edarat-najd-export-${new Date().getTime()}.json`;
    link.click();
    showNotification('تم تصدير البيانات بنجاح!', 'success');
}

function importDataFromJSON(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const data = JSON.parse(e.target.result);
            allOrders = data.orders || [];
            correspondenceList = data.correspondence || [];
            saveAllData();
            showNotification('تم استيراد البيانات بنجاح!', 'success');
        } catch (error) {
            showNotification('خطأ في الملف المرفوع!', 'error');
        }
    };
    reader.readAsText(file);
}

// ============ الدوال المساعدة ============
function formatDate(date) {
    return new Date(date).toLocaleDateString('ar-SA', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function calculateTimeRemaining(dueDate) {
    const now = new Date();
    const due = new Date(dueDate);
    const diff = due - now;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    return `${days} أيام و ${hours} ساعات`;
}

// ============ وظائف التقارير ============
function generatePerformanceReport() {
    const metrics = dashboard.getPerformanceMetrics();
    const stats = dashboard.updateStats();

    return {
        title: 'تقرير الأداء',
        generatedAt: new Date(),
        stats: stats,
        metrics: metrics,
        recentOrders: dashboard.getRecentOrders(10)
    };
}

function generateMonthlyReport() {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    const monthlyOrders = allOrders.filter(order => {
        const orderDate = new Date(order.createdAt);
        return orderDate.getMonth() === currentMonth && orderDate.getFullYear() === currentYear;
    });

    return {
        month: currentDate.toLocaleDateString('ar-SA', { month: 'long', year: 'numeric' }),
        totalOrders: monthlyOrders.length,
        completedOrders: monthlyOrders.filter(o => o.status === 'مكتمل').length,
        revenue: monthlyOrders.reduce((sum, o) => sum + (o.price || 0), 0),
        details: monthlyOrders
    };
}

console.log('✅ نظام إدارة نجد جاهز للعمل!');