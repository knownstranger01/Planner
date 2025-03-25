// Vendor management functionality

// DOM Elements
const vendorTableBody = document.getElementById('vendorTableBody');
const addVendorBtn = document.getElementById('addVendorBtn');
const searchVendorInput = document.getElementById('searchVendor');

// नयाँ मोडल DOM तत्वहरू
const addVendorModal = new bootstrap.Modal(document.getElementById('addVendorModal'), {
    keyboard: false
});
const editVendorModal = new bootstrap.Modal(document.getElementById('editVendorModal'), {
    keyboard: false
});

// नयाँ फारम तत्वहरू
const vendorName = document.getElementById('vendorName');
const vendorEmail = document.getElementById('vendorEmail');
const vendorPhone = document.getElementById('vendorPhone');
const vendorAddress = document.getElementById('vendorAddress');
const vendorPAN = document.getElementById('vendorPAN');
const vendorNotes = document.getElementById('vendorNotes');

// सम्पादन फारम तत्वहरू
const editVendorId = document.getElementById('editVendorId');
const editVendorName = document.getElementById('editVendorName');
const editVendorEmail = document.getElementById('editVendorEmail');
const editVendorPhone = document.getElementById('editVendorPhone');
const editVendorAddress = document.getElementById('editVendorAddress');
const editVendorPAN = document.getElementById('editVendorPAN');
const editVendorNotes = document.getElementById('editVendorNotes');

// बटनहरू
const saveVendorBtn = document.getElementById('saveVendorBtn');
const updateVendorBtn = document.getElementById('updateVendorBtn');

// Show alert message
function showAlert(message, type = 'danger') {
    // Bootstrap टोस्ट वा अलर्ट बनाउने
    const alertPlaceholder = document.getElementById('alertPlaceholder') || document.createElement('div');
    
    if (!document.getElementById('alertPlaceholder')) {
        alertPlaceholder.id = 'alertPlaceholder';
        alertPlaceholder.className = 'position-fixed top-0 end-0 p-3';
        document.body.appendChild(alertPlaceholder);
    }
    
    const wrapper = document.createElement('div');
    wrapper.innerHTML = `
        <div class="alert alert-${type} alert-dismissible fade show" role="alert">
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
    `;
    
    alertPlaceholder.append(wrapper);
    
    // Auto hide after 5 seconds
    setTimeout(() => {
        if (wrapper.firstChild) {
            const alert = bootstrap.Alert.getOrCreateInstance(wrapper.firstChild);
            alert.close();
        } else {
            wrapper.remove();
        }
    }, 5000);
}

// लोड भएका विक्रेताहरू
function loadVendors() {
    const vendors = getVendors();
    const currentCompany = getCurrentCompany();
    const currency = currentCompany ? currentCompany.currency : 'NPR';
    
    if (!vendorTableBody) return;
    
    vendorTableBody.innerHTML = '';
    
    if (vendors.length === 0) {
        vendorTableBody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center">कुनै विक्रेताहरू छैनन्। नयाँ विक्रेता थप्न "नयाँ विक्रेता थप्नुहोस्" बटन क्लिक गर्नुहोस्।</td>
            </tr>
        `;
        return;
    }
    
    vendors.forEach(vendor => {
        const row = document.createElement('tr');
        const formattedBalance = formatCurrency(vendor.balance || 0, currency);
        
        row.innerHTML = `
            <td>${vendor.name}</td>
            <td>${vendor.phone || '-'}</td>
            <td>${vendor.email || '-'}</td>
            <td>${vendor.address || '-'}</td>
            <td>${formattedBalance}</td>
            <td>
                <button class="btn btn-sm btn-outline-primary edit-vendor-btn" 
                    data-id="${vendor.id}">
                    <i class="bi bi-pencil"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger delete-vendor-btn" 
                    data-id="${vendor.id}" data-name="${vendor.name}">
                    <i class="bi bi-trash"></i>
                </button>
            </td>
        `;
        
        vendorTableBody.appendChild(row);
    });
    
    // Edit buttons
    document.querySelectorAll('.edit-vendor-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            openEditVendorModal(btn.dataset.id);
        });
    });
    
    // Delete buttons
    document.querySelectorAll('.delete-vendor-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            confirmDeleteVendor(btn.dataset.id, btn.dataset.name);
        });
    });
}

// फिल्टर विक्रेताहरू
function filterVendors() {
    const searchTerm = searchVendorInput.value.toLowerCase();
    const rows = vendorTableBody.querySelectorAll('tr');
    
    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(searchTerm) ? '' : 'none';
    });
}

// नयाँ विक्रेता सेभ गर्ने
function saveVendor() {
    // वैधता जाँच
    if (!vendorName.value.trim()) {
        showAlert('विक्रेता नाम आवश्यक छ।');
        return;
    }
    
    // विक्रेता डाटा तयार
    const vendor = {
        name: vendorName.value.trim(),
        email: vendorEmail.value.trim(),
        phone: vendorPhone.value.trim(),
        address: vendorAddress.value.trim(),
        pan: vendorPAN.value.trim(),
        notes: vendorNotes.value.trim()
    };
    
    // नयाँ विक्रेता थप्ने
    const success = addVendor(vendor);
    
    if (success) {
        showAlert('विक्रेता सफलतापूर्वक थपियो!', 'success');
        loadVendors();
        addVendorModal.hide();
    } else {
        showAlert('विक्रेता थप्न समस्या भयो।');
    }
}

// सम्पादन मोडल खोट्ने
function openEditVendorModal(vendorId) {
    const vendors = getVendors();
    const vendor = vendors.find(v => v.id === vendorId);
    
    if (vendor) {
        editVendorId.value = vendor.id;
        editVendorName.value = vendor.name || '';
        editVendorEmail.value = vendor.email || '';
        editVendorPhone.value = vendor.phone || '';
        editVendorAddress.value = vendor.address || '';
        editVendorPAN.value = vendor.pan || '';
        editVendorNotes.value = vendor.notes || '';
        
        editVendorModal.show();
    } else {
        showAlert('विक्रेता भेटिएन।');
    }
}

// विक्रेता अपडेट गर्ने
function updateVendor() {
    // वैधता जाँच
    if (!editVendorName.value.trim()) {
        showAlert('विक्रेता नाम आवश्यक छ।');
        return;
    }
    
    const updatedVendor = {
        name: editVendorName.value.trim(),
        email: editVendorEmail.value.trim(),
        phone: editVendorPhone.value.trim(),
        address: editVendorAddress.value.trim(),
        pan: editVendorPAN.value.trim(),
        notes: editVendorNotes.value.trim()
    };
    
    // विक्रेता अपडेट
    const success = updateVendorInDB(editVendorId.value, updatedVendor);
    
    if (success) {
        showAlert('विक्रेता सफलतापूर्वक अपडेट गरियो!', 'success');
        loadVendors();
        editVendorModal.hide();
    } else {
        showAlert('विक्रेता अपडेट गर्न समस्या भयो।');
    }
}

// विक्रेता मेटाउन पुष्टि गर्ने
function confirmDeleteVendor(vendorId, vendorName) {
    if (confirm(`के तपाईं निश्चित हुनुहुन्छ कि तपाईं "${vendorName}" मेटाउन चाहनुहुन्छ?`)) {
        const success = deleteVendor(vendorId);
        if (success) {
            showAlert('विक्रेता सफलतापूर्वक मेटाइयो!', 'success');
            loadVendors();
        } else {
            showAlert('विक्रेता मेटाउन समस्या भयो।');
        }
    }
}

// इभेन्ट श्रोताहरू
document.addEventListener('DOMContentLoaded', () => {
    // Load vendors
    loadVendors();
    
    // विक्रेता थप्ने बटन
    if (addVendorBtn) {
        addVendorBtn.addEventListener('click', () => {
            if (addVendorModal) {
                addVendorModal.show();
            } else {
                console.error('addVendorModal not found');
            }
        });
    }
    
    // विक्रेता खोज्ने इनपुट
    if (searchVendorInput) {
        searchVendorInput.addEventListener('input', filterVendors);
    }
    
    // सेभ विक्रेता बटन
    if (saveVendorBtn) {
        saveVendorBtn.addEventListener('click', saveVendor);
    }
    
    // अपडेट विक्रेता बटन
    if (updateVendorBtn) {
        updateVendorBtn.addEventListener('click', updateVendor);
    }
    
    // एडित र डिलिट बटनहरू विक्रेता लोड फंक्शनमा परिभाषित
});

// विक्रेता अपडेट गर्ने डेटाबेस फंक्शन
function updateVendorInDB(vendorId, updatedData) {
    const company = getCurrentCompany();
    if (!company || !company.vendors) return false;
    
    const vendorIndex = company.vendors.findIndex(v => v.id === vendorId);
    
    if (vendorIndex === -1) return false;
    
    // अपडेट गर्दा आईडी र क्रिएटेड एट संरक्षित गर्ने
    const originalVendor = company.vendors[vendorIndex];
    company.vendors[vendorIndex] = {
        ...originalVendor,
        ...updatedData,
        id: originalVendor.id,
        createdAt: originalVendor.createdAt,
        updatedAt: new Date().toISOString()
    };
    
    return saveCompany(company);
}

// विक्रेता व्यवस्थापन कार्यहरू

// रकम फरम्याट
function formatCurrency(amount, currencyCode) {
    if (amount === undefined || amount === null) return '-';
    
    const formatter = new Intl.NumberFormat('ne-NP', {
        style: 'currency',
        currency: currencyCode || 'NPR',
        minimumFractionDigits: 2
    });
    
    return formatter.format(amount);
}

// विक्रेताहरू लोड गर्ने
function loadVendors() {
    const vendors = getVendors();
    const currentCompany = getCurrentCompany();
    const currency = currentCompany ? currentCompany.currency : 'NPR';
    
    if (!vendorTableBody) return;
    
    vendorTableBody.innerHTML = '';
    
    if (vendors.length === 0) {
        vendorTableBody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center">कुनै विक्रेताहरू छैनन्। नयाँ विक्रेता थप्न "नयाँ विक्रेता थप्नुहोस्" बटन क्लिक गर्नुहोस्।</td>
            </tr>
        `;
        return;
    }
    
    vendors.forEach(vendor => {
        const row = document.createElement('tr');
        const formattedBalance = formatCurrency(vendor.balance || 0, currency);
        
        row.innerHTML = `
            <td>${vendor.name}</td>
            <td>${vendor.phone || '-'}</td>
            <td>${vendor.email || '-'}</td>
            <td>${vendor.address || '-'}</td>
            <td>${formattedBalance}</td>
            <td>
                <button class="btn btn-sm btn-outline-primary edit-vendor-btn" 
                    data-id="${vendor.id}">
                    <i class="bi bi-pencil"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger delete-vendor-btn" 
                    data-id="${vendor.id}" data-name="${vendor.name}">
                    <i class="bi bi-trash"></i>
                </button>
            </td>
        `;
        
        vendorTableBody.appendChild(row);
    });
    
    // सम्पादन बटनहरू
    document.querySelectorAll('.edit-vendor-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            openEditVendorModal(btn.dataset.id);
        });
    });
    
    // मेटाउने बटनहरू
    document.querySelectorAll('.delete-vendor-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            confirmDeleteVendor(btn.dataset.id, btn.dataset.name);
        });
    });
}

// विक्रेताहरू फिल्टर गर्ने
function filterVendors() {
    const searchTerm = searchVendorInput.value.toLowerCase();
    const rows = vendorTableBody.querySelectorAll('tr');
    
    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(searchTerm) ? '' : 'none';
    });
}

// नयाँ विक्रेता सेभ गर्ने
function saveVendor() {
    // आवश्यक फिल्ड जाँच
    if (!vendorName.value.trim()) {
        showAlert('विक्रेताको नाम आवश्यक छ।');
        return;
    }
    
    // विक्रेता डाटा तयार
    const vendor = {
        name: vendorName.value.trim(),
        email: vendorEmail.value.trim(),
        phone: vendorPhone.value.trim(),
        address: vendorAddress.value.trim(),
        pan: vendorPAN.value.trim(),
        notes: vendorNotes.value.trim()
    };
    
    // नयाँ विक्रेता थप्ने
    const success = addVendor(vendor);
    
    if (success) {
        showAlert('विक्रेता सफलतापूर्वक थपियो!', 'success');
        loadVendors();
        addVendorModal.hide();
    } else {
        showAlert('विक्रेता थप्न समस्या भयो।');
    }
}

// सम्पादन मोडल खोल्ने
function openEditVendorModal(vendorId) {
    const vendors = getVendors();
    const vendor = vendors.find(v => v.id === vendorId);
    
    if (vendor) {
        editVendorId.value = vendor.id;
        editVendorName.value = vendor.name || '';
        editVendorEmail.value = vendor.email || '';
        editVendorPhone.value = vendor.phone || '';
        editVendorAddress.value = vendor.address || '';
        editVendorPAN.value = vendor.pan || '';
        editVendorNotes.value = vendor.notes || '';
        
        editVendorModal.show();
    } else {
        showAlert('विक्रेता भेटिएन।');
    }
}

// विक्रेता अपडेट गर्ने
function updateVendor() {
    // आवश्यक फिल्ड जाँच
    if (!editVendorName.value.trim()) {
        showAlert('विक्रेताको नाम आवश्यक छ।');
        return;
    }
    
    const updatedVendor = {
        name: editVendorName.value.trim(),
        email: editVendorEmail.value.trim(),
        phone: editVendorPhone.value.trim(),
        address: editVendorAddress.value.trim(),
        pan: editVendorPAN.value.trim(),
        notes: editVendorNotes.value.trim()
    };
    
    // विक्रेता अपडेट
    const success = updateVendorInDB(editVendorId.value, updatedVendor);
    
    if (success) {
        showAlert('विक्रेता सफलतापूर्वक अपडेट गरियो!', 'success');
        loadVendors();
        editVendorModal.hide();
    } else {
        showAlert('विक्रेता अपडेट गर्न समस्या भयो।');
    }
}

// विक्रेता मेटाउन पुष्टि
function confirmDeleteVendor(vendorId, vendorName) {
    if (confirm(`के तपाईं निश्चित हुनुहुन्छ कि तपाईं "${vendorName}" मेटाउन चाहनुहुन्छ?`)) {
        const success = deleteVendor(vendorId);
        if (success) {
            showAlert('विक्रेता सफलतापूर्वक मेटाइयो!', 'success');
            loadVendors();
        } else {
            showAlert('विक्रेता मेटाउन समस्या भयो।');
        }
    }
}

// इभेन्ट श्रोताहरू
document.addEventListener('DOMContentLoaded', () => {
    // कम्पनी नाम देखाउने
    const currentCompanyName = document.getElementById('currentCompanyName');
    const sidebarCompanyName = document.getElementById('sidebarCompanyName');
    const currentCompany = getCurrentCompany();
    
    if (currentCompany) {
        if (currentCompanyName) currentCompanyName.textContent = currentCompany.name || currentCompany.companyName;
        if (sidebarCompanyName) sidebarCompanyName.textContent = currentCompany.name || currentCompany.companyName;
    }
    
    // विक्रेता लोड
    loadVendors();
    
    // विक्रेता थप्ने बटन
    if (addVendorBtn) {
        addVendorBtn.addEventListener('click', () => {
            if (addVendorModal) {
                addVendorModal.show();
            } else {
                console.error('addVendorModal not found');
            }
        });
    }
    
    // विक्रेता खोज्ने इनपुट
    if (searchVendorInput) {
        searchVendorInput.addEventListener('input', filterVendors);
    }
    
    // सेभ विक्रेता बटन
    if (saveVendorBtn) {
        saveVendorBtn.addEventListener('click', saveVendor);
    }
    
    // अपडेट विक्रेता बटन
    if (updateVendorBtn) {
        updateVendorBtn.addEventListener('click', updateVendor);
    }
    
    // ड्रपडाउन इनिसियलाइज
    const dropdownElementList = [].slice.call(document.querySelectorAll('.dropdown-toggle'));
    const dropdownList = dropdownElementList.map(function (dropdownToggleEl) {
        return new bootstrap.Dropdown(dropdownToggleEl);
    });
});

// विक्रेता अपडेट गर्ने डेटाबेस फंक्शन
function updateVendorInDB(vendorId, updatedData) {
    const company = getCurrentCompany();
    if (!company || !company.vendors) return false;
    
    const vendorIndex = company.vendors.findIndex(v => v.id === vendorId);
    
    if (vendorIndex === -1) return false;
    
    // अपडेट गर्दा आईडी र क्रिएटेड एट संरक्षित गर्ने
    const originalVendor = company.vendors[vendorIndex];
    company.vendors[vendorIndex] = {
        ...originalVendor,
        ...updatedData,
        id: originalVendor.id,
        createdAt: originalVendor.createdAt,
        updatedAt: new Date().toISOString()
    };
    
    return saveCompany(company);
} 