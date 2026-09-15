// ============ نظام الذكاء الاصطناعي - AI Assistance ============

const aiAssistant = {
    // تقدير الأولوية بناءً على محتوى الطلب
    estimatePriority: function(description) {
        const urgentWords = ['عاجل', 'سريع', 'فوري', 'الآن', 'جداً', 'مهم جداً'];
        const highWords = ['مهم', 'حساس', 'أساسي'];
        const normalWords = ['عادي', 'روتيني'];

        const lowerDesc = description.toLowerCase();

        if (urgentWords.some(word => lowerDesc.includes(word))) {
            return 'عاجل';
        } else if (highWords.some(word => lowerDesc.includes(word))) {
            return 'مهم';
        } else {
            return 'عادي';
        }
    },

    // توقع وقت الإنجاز بالساعات
    estimateCompletionTime: function(description, service) {
        let baseTime = 24; // 24 ساعة افتراضياً

        // تحديد الوقت حسب نوع الخدمة
        const serviceTimes = {
            'السكرتارية الإلكترونية': 2,
            'إعداد المستندات': 8,
            'إدارة الاجتماعات': 4,
            'إدارة الصادر والوارد': 12,
            'العروض والتقارير': 48,
            'إدارة الملفات': 6,
            'خدمات مخصصة': 72
        };

        if (serviceTimes[service]) {
            baseTime = serviceTimes[service];
        }

        // تعديل بناءً على أولوية الطلب
        const priority = this.estimatePriority(description);
        if (priority === 'عاجل') {
            baseTime = Math.ceil(baseTime * 0.5);
        } else if (priority === 'مهم') {
            baseTime = Math.ceil(baseTime * 0.75);
        }

        return baseTime;
    },

    // تحليل معنويات النص
    analyzeSentiment: function(text) {
        const positiveWords = ['شكراً', 'ممتاز', 'رائع', 'حسن', 'جيد', 'مرضي'];
        const negativeWords = ['سيء', 'مشكلة', 'خطأ', 'مزعج', 'صعب'];

        const lowerText = text.toLowerCase();
        const positiveCount = positiveWords.filter(word => lowerText.includes(word)).length;
        const negativeCount = negativeWords.filter(word => lowerText.includes(word)).length;

        if (positiveCount > negativeCount) {
            return { sentiment: 'إيجابي', score: 1 };
        } else if (negativeCount > positiveCount) {
            return { sentiment: 'سلبي', score: -1 };
        } else {
            return { sentiment: 'محايد', score: 0 };
        }
    },

    // تصنيف الطلب تلقائياً
    classifyOrder: function(title, description) {
        const keywords = {
            'سكرتارية': ['سكرتارية', 'مكتب', 'مساعد'],
            'مستندات': ['مستند', 'عقد', 'صيغة', 'نموذج'],
            'اجتماع': ['اجتماع', 'ندوة', 'جلسة', 'اجتماع'],
            'صادر وارد': ['صادر', 'وارد', 'مراسلة', 'رسالة'],
            'تقارير': ['تقرير', 'إحصائية', 'بيانات', 'عرض'],
            'ملفات': ['ملف', 'توثيق', 'أرشيف', 'حفظ']
        };

        const searchText = (title + ' ' + description).toLowerCase();
        let bestMatch = 'خدمات مخصصة';
        let bestScore = 0;

        for (const [category, words] of Object.entries(keywords)) {
            const score = words.filter(word => searchText.includes(word)).length;
            if (score > bestScore) {
                bestScore = score;
                bestMatch = category;
            }
        }

        return bestMatch;
    },

    // توصيات تلقائية
    generateRecommendations: function(order) {
        const recommendations = [];

        // توصية 1: التقدم
        if (order.progress < 50) {
            recommendations.push('💡 ننصح بمراجعة الطلب للتأكد من سيره بالاتجاه الصحيح');
        }

        // توصية 2: الموعد
        if (order.dueDate) {
            const daysLeft = Math.ceil((new Date(order.dueDate) - new Date()) / (1000 * 60 * 60 * 24));
            if (daysLeft < 2 && order.progress < 100) {
                recommendations.push('⚠️ يقترب موعد التسليم! يرجى تسريع العمل');
            }
        }

        // توصية 3: الأداء
        if (order.status === 'جديد') {
            recommendations.push('📋 يمكن بدء العمل على الطلب فوراً لتحسين الأداء');
        }

        return recommendations;
    },

    // اقتراح خدمات إضافية
    suggestAdditionalServices: function(currentService) {
        const suggestedServices = {
            'السكرتارية الإلكترونية': ['إدارة الاجتماعات', 'إدارة الملفات'],
            'إعداد المستندات': ['العروض والتقارير', 'إدارة الملفات'],
            'إدارة الاجتماعات': ['السكرتارية الإلكترونية', 'تدوين الملاحظات'],
            'إدارة الصادر والوارد': ['السكرتارية الإلكترونية', 'تصنيف المراسلات'],
            'العروض والتقارير': ['إعداد المستندات', 'تحليل البيانات'],
            'إدارة الملفات': ['السكرتارية الإلكترونية', 'الأرشفة الرقمية']
        };

        return suggestedServices[currentService] || [];
    },

    // حساب رضا العميل
    calculateCustomerSatisfaction: function(orders) {
        if (orders.length === 0) return 5;

        let totalScore = 0;
        orders.forEach(order => {
            // العامل 1: إكمال الطلب
            if (order.status === 'مكتمل') totalScore += 2;

            // العامل 2: التسليم في الموعد
            if (order.dueDate) {
                const completedDate = new Date(order.completedAt);
                if (completedDate <= new Date(order.dueDate)) totalScore += 1.5;
            }

            // العامل 3: جودة التقدم
            if (order.progress >= 75) totalScore += 1;

            // العامل 4: الاستجابة السريعة
            const createdDate = new Date(order.createdAt);
            const now = new Date();
            const daysActive = (now - createdDate) / (1000 * 60 * 60 * 24);
            if (daysActive <= 3) totalScore += 0.5;
        });

        const avgScore = totalScore / orders.length;
        return Math.min(5, Math.round(avgScore * 10) / 10);
    },

    // توليد الإحصائيات الذكية
    generateSmartStatistics: function(orders) {
        return {
            totalOrders: orders.length,
            completedOrders: orders.filter(o => o.status === 'مكتمل').length,
            pendingOrders: orders.filter(o => o.status === 'جديد' || o.status === 'قيد المراجعة').length,
            inProgressOrders: orders.filter(o => o.status === 'قيد التنفيذ').length,
            averageProgress: Math.round(
                orders.reduce((sum, o) => sum + o.progress, 0) / (orders.length || 1)
            ),
            onTimeDelivery: Math.round(
                (orders.filter(o => o.status === 'مكتمل').length / (orders.length || 1)) * 100
            ),
            averageCompletionTime: Math.round(
                orders.reduce((sum, o) => sum + (o.completedAt ? 
                    (new Date(o.completedAt) - new Date(o.createdAt)) / (1000 * 60 * 60) : 0), 0) / 
                (orders.filter(o => o.completedAt).length || 1)
            )
        };
    },

    // التنبيهات الذكية
    generateSmartAlerts: function(orders) {
        const alerts = [];

        orders.forEach(order => {
            // تنبيه 1: طلبات متأخرة
            if (order.dueDate && !order.completedAt) {
                const daysLeft = Math.ceil((new Date(order.dueDate) - new Date()) / (1000 * 60 * 60 * 24));
                if (daysLeft < 0) {
                    alerts.push({
                        type: 'خطأ',
                        message: `⚠️ الطلب #${order.id.substr(0, 6)} متأخر عن الموعد`,
                        priority: 'عالي'
                    });
                } else if (daysLeft === 0) {
                    alerts.push({
                        type: 'تحذير',
                        message: `⏰ الطلب #${order.id.substr(0, 6)} يستحق اليوم`,
                        priority: 'متوسط'
                    });
                }
            }

            // تنبيه 2: طلبات جديدة تنتظر المراجعة
            if (order.status === 'جديد') {
                alerts.push({
                    type: 'معلومة',
                    message: `📬 الطلب #${order.id.substr(0, 6)} جديد وينتظر البدء`,
                    priority: 'منخفض'
                });
            }
        });

        return alerts;
    },

    // تحسين توزيع الطلبات
    suggestOptimalDistribution: function(orders, staffCount) {
        const ordersPerStaff = Math.ceil(orders.length / (staffCount || 1));
        const distribution = {
            recommendation: `توزيع متوازن: ${ordersPerStaff} طلب لكل موظف`,
            details: {
                totalOrders: orders.length,
                staffCount: staffCount,
                ordersPerStaff: ordersPerStaff,
                loadBalance: 'متوازن ✅'
            }
        };
        return distribution;
    },

    // تحليل الأداء
    analyzePerformance: function(orders) {
        const completed = orders.filter(o => o.status === 'مكتمل');
        const stats = this.generateSmartStatistics(orders);

        return {
            overallScore: Math.round(
                (stats.onTimeDelivery + stats.averageProgress) / 2
            ),
            performanceStatus: stats.onTimeDelivery >= 80 ? '📈 ممتاز' : stats.onTimeDelivery >= 60 ? '📊 جيد' : '📉 يحتاج تحسين',
            recommendations: [
                stats.onTimeDelivery < 80 ? '⏰ ركز على التسليم في الموعد' : '',
                stats.averageProgress < 75 ? '📝 حسّن متوسط التقدم' : '',
                stats.inProgressOrders > stats.completedOrders * 2 ? '⚙️ قد تحتاج لموارد إضافية' : ''
            ].filter(r => r)
        };
    }
};

// Export للاستخدام
if (typeof module !== 'undefined' && module.exports) {
    module.exports = aiAssistant;
}

console.log('✅ نظام الذكاء الاصطناعي جاهز!');