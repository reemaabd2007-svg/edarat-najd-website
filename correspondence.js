// ============ الصادر والوارد - Correspondence ============

document.addEventListener('DOMContentLoaded', function() {
    initializeCorrespondence();
    setupCorrespondenceEventListeners();
});

function initializeCorrespondence() {
    updateCorrespondenceName();
    setupCorrespondenceTabs();
    renderIncomingCorrespondence();
    renderOutgoingCorrespondence();
    renderLinkedCorrespondence();
}

function setupCorrespondenceEventListeners() {
    // Tabs
    document.querySelectorAll('.corr-tab-btn').forEach(btn => {
        btn.addEventListener('click', switchCorrespondenceTab);
    });

    // Buttons
    document.getElementById('newIncomingBtn').addEventListener('click', () => openModal('newIncomingModal'));
    document.getElementById('newOutgoingBtn').addEventListener('click', () => openModal('newOutgoingModal'));
    document.getElementById('linkCorrBtn').addEventListener('click', () => openModal('linkCorrModal'));

    // Forms
    document.getElementById('newIncomingForm').addEventListener('submit', handleNewIncoming);
    document.getElementById('newOutgoingForm').addEventListener('submit', handleNewOutgoing);
    document.getElementById('linkCorrForm').addEventListener('submit', handleLinkCorrespondence);

    // Search and Filter
    document.getElementById('searchIncoming').addEventListener('input', filterIncoming);
    document.getElementById('filterIncomingStatus').addEventListener('change', filterIncoming);
    document.getElementById('searchOutgoing').addEventListener('input', filterOutgoing);
    document.getElementById('filterOutgoingStatus').addEventListener('change', filterOutgoing);

    // Logout
    document.getElementById('corrLogout').addEventListener('click', handleCorrLogout);

    // Modal close buttons
    document.querySelectorAll('.modal-close').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.target.closest('.modal').classList.remove('show');
        });
    });
}

function updateCorrespondenceName() {
    if (currentUser) {
        document.getElementById('corrName').textContent = currentUser.name;
    }
}

function switchCorrespondenceTab(e) {
    const targetTab = e.target.getAttribute('data-tab');

    document.querySelectorAll('.corr-tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.corr-tab-content').forEach(content => content.classList.remove('active'));

    e.target.classList.add('active');
    document.getElementById(targetTab).classList.add('active');
}

function setupCorrespondenceTabs() {
    // إعداد التبويبات
    document.querySelectorAll('.corr-tab-btn').forEach(btn => {
        btn.addEventListener('click', switchCorrespondenceTab);
    });
}

function renderIncomingCorrespondence() {
    const incoming = correspondenceList.filter(c => c.type === 'وارد');
    const tbody = document.getElementById('incomingBody');

    if (incoming.length === 0) {
        tbody.innerHTML = '<tr class="empty-row"><td colspan="6">لا توجد مراسلات واردة</td></tr>';
        return;
    }

    tbody.innerHTML = incoming.map(corr => `
        <tr>
            <td>#${corr.id.substr(0, 6)}</td>
            <td>${corr.from}</td>
            <td>${corr.title}</td>
            <td>${formatDate(corr.date)}</td>
            <td><span class="status-badge status-${corr.status}">${corr.status}</span></td>
            <td>
                <button class="btn-icon" onclick="viewCorrDetails('${corr.id}')">👁</button>
                <button class="btn-icon" onclick="linkCorrToOutgoing('${corr.id}')">🔗</button>
            </td>
        </tr>
    `).join('');
}

function renderOutgoingCorrespondence() {
    const outgoing = correspondenceList.filter(c => c.type === 'صادر');
    const tbody = document.getElementById('outgoingBody');

    if (outgoing.length === 0) {
        tbody.innerHTML = '<tr class="empty-row"><td colspan="6">لا توجد مراسلات صادرة</td></tr>';
        return;
    }

    tbody.innerHTML = outgoing.map(corr => `
        <tr>
            <td>#${corr.id.substr(0, 6)}</td>
            <td>${corr.to}</td>
            <td>${corr.title}</td>
            <td>${formatDate(corr.date)}</td>
            <td><span class="status-badge status-${corr.status}">${corr.status}</span></td>
            <td>
                <button class="btn-icon" onclick="viewCorrDetails('${corr.id}')">👁</button>
                <button class="btn-icon" onclick="deleteCorre('${corr.id}')">🗑</button>
            </td>
        </tr>
    `).join('');
}

function renderLinkedCorrespondence() {
    const linked = correspondenceList.filter(c => c.relatedCorrespondence);
    const container = document.getElementById('linkedCorrList');

    if (linked.length === 0) {
        container.innerHTML = '<div class="empty-state"><p>لا توجد مراسلات مرتبطة</p></div>';
        return;
    }

    container.innerHTML = linked.map(corr => {
        const related = correspondenceList.find(c => c.id === corr.relatedCorrespondence);
        return `
            <div class="linked-corr-item">
                <div class="corr-link">
                    <div class="corr-box">
                        <h4>${corr.title}</h4>
                        <p>من: ${corr.from || 'إلى: ' + corr.to}</p>
                        <p class="corr-type">${corr.type}</p>
                    </div>
                    <div class="link-connector">🔗</div>
                    <div class="corr-box">
                        <h4>${related ? related.title : 'محذوفة'}</h4>
                        <p>${related ? (related.from || 'إلى: ' + related.to) : '-'}</p>
                        <p class="corr-type">${related ? related.type : '-'}</p>
                    </div>
                </div>
                <button class="btn-icon" onclick="unlinkCorrespondence('${corr.id}')">🔌</button>
            </div>
        `;
    }).join('');
}

function handleNewIncoming(e) {
    e.preventDefault();
    const form = e.target;
    const from = form.querySelector('input[type="text"]').value;
    const title = form.querySelectorAll('input[type="text"]')[0].value;
    const content = form.querySelector('textarea').value;
    const date = form.querySelector('input[type="date"]').value;

    if (!from || !title || !content) {
        showNotification('الرجاء ملء جميع الحقول', 'error');
        return;
    }

    addCorrespondence('وارد', title, content, from, currentUser?.email || 'نظام');
    renderIncomingCorrespondence();
    closeModal('newIncomingModal');
    form.reset();
    showNotification('تم إضافة الوارد بنجاح!', 'success');
}

function handleNewOutgoing(e) {
    e.preventDefault();
    const form = e.target;
    const to = form.querySelector('input[type="text"]').value;
    const title = form.querySelectorAll('input[type="text"]')[0].value;
    const content = form.querySelector('textarea').value;
    const date = form.querySelector('input[type="date"]').value;

    if (!to || !title || !content) {
        showNotification('الرجاء ملء جميع الحقول', 'error');
        return;
    }

    addCorrespondence('صادر', title, content, currentUser?.email || 'نظام', to);
    renderOutgoingCorrespondence();
    closeModal('newOutgoingModal');
    form.reset();
    showNotification('تم إضافة الصادر بنجاح!', 'success');
}

function handleLinkCorrespondence(e) {
    e.preventDefault();
    const incomingId = document.getElementById('linkIncoming').value;
    const outgoingId = document.getElementById('linkOutgoing').value;

    if (!incomingId || !outgoingId) {
        showNotification('الرجاء اختيار مراسلتين', 'error');
        return;
    }

    linkCorrespondences(incomingId, outgoingId);
    renderLinkedCorrespondence();
    closeModal('linkCorrModal');
    document.getElementById('linkCorrForm').reset();
}

function filterIncoming() {
    const searchTerm = document.getElementById('searchIncoming').value.toLowerCase();
    const statusFilter = document.getElementById('filterIncomingStatus').value;

    let filtered = correspondenceList.filter(c => c.type === 'وارد');

    if (statusFilter) {
        filtered = filtered.filter(c => c.status === statusFilter);
    }

    if (searchTerm) {
        filtered = filtered.filter(c =>
            c.title.toLowerCase().includes(searchTerm) ||
            c.from.toLowerCase().includes(searchTerm)
        );
    }

    const tbody = document.getElementById('incomingBody');
    if (filtered.length === 0) {
        tbody.innerHTML = '<tr class="empty-row"><td colspan="6">لا توجد نتائج</td></tr>';
        return;
    }

    tbody.innerHTML = filtered.map(corr => `
        <tr>
            <td>#${corr.id.substr(0, 6)}</td>
            <td>${corr.from}</td>
            <td>${corr.title}</td>
            <td>${formatDate(corr.date)}</td>
            <td><span class="status-badge status-${corr.status}">${corr.status}</span></td>
            <td>
                <button class="btn-icon" onclick="viewCorrDetails('${corr.id}')">👁</button>
                <button class="btn-icon" onclick="linkCorrToOutgoing('${corr.id}')">🔗</button>
            </td>
        </tr>
    `).join('');
}

function filterOutgoing() {
    const searchTerm = document.getElementById('searchOutgoing').value.toLowerCase();
    const statusFilter = document.getElementById('filterOutgoingStatus').value;

    let filtered = correspondenceList.filter(c => c.type === 'صادر');

    if (statusFilter) {
        filtered = filtered.filter(c => c.status === statusFilter);
    }

    if (searchTerm) {
        filtered = filtered.filter(c =>
            c.title.toLowerCase().includes(searchTerm) ||
            c.to.toLowerCase().includes(searchTerm)
        );
    }

    const tbody = document.getElementById('outgoingBody');
    if (filtered.length === 0) {
        tbody.innerHTML = '<tr class="empty-row"><td colspan="6">لا توجد نتائج</td></tr>';
        return;
    }

    tbody.innerHTML = filtered.map(corr => `
        <tr>
            <td>#${corr.id.substr(0, 6)}</td>
            <td>${corr.to}</td>
            <td>${corr.title}</td>
            <td>${formatDate(corr.date)}</td>
            <td><span class="status-badge status-${corr.status}">${corr.status}</span></td>
            <td>
                <button class="btn-icon" onclick="viewCorrDetails('${corr.id}')">👁</button>
                <button class="btn-icon" onclick="deleteCorr('${corr.id}')">🗑</button>
            </td>
        </tr>
    `).join('');
}

function viewCorrDetails(corrId) {
    const corr = correspondenceList.find(c => c.id === corrId);
    if (corr) {
        alert(`
📧 تفاصيل المراسلة

النوع: ${corr.type}
الموضوع: ${corr.title}
${corr.type === 'وارد' ? 'من' : 'إلى'}: ${corr.type === 'وارد' ? corr.from : corr.to}
التاريخ: ${formatDate(corr.date)}
الحالة: ${corr.status}

المحتوى:
${corr.content}
        `);
    }
}

function linkCorrToOutgoing(incomingId) {
    document.getElementById('linkIncoming').value = incomingId;
    openModal('linkCorrModal');
}

function unlinkCorrespondence(corrId) {
    const corr = correspondenceList.find(c => c.id === corrId);
    if (corr && corr.relatedCorrespondence) {
        const related = correspondenceList.find(c => c.id === corr.relatedCorrespondence);
        if (related) {
            corr.relatedCorrespondence = null;
            related.relatedCorrespondence = null;
        }
        saveAllData();
        renderLinkedCorrespondence();
        showNotification('تم فصل المراسلات', 'success');
    }
}

function deleteCorr(corrId) {
    if (confirm('هل تريد حذف هذه المراسلة؟')) {
        const index = correspondenceList.findIndex(c => c.id === corrId);
        if (index > -1) {
            correspondenceList.splice(index, 1);
            saveAllData();
            renderOutgoingCorrespondence();
            showNotification('تم حذف المراسلة', 'success');
        }
    }
}

function handleCorrLogout() {
    logoutUser();
    setTimeout(() => window.location.href = 'index.html', 1000);
}

console.log('✅ نظام الصادر والوارد جاهز!');