// Customer management functionality

// DOM Elements
const customerTableBody = document.getElementById('customerTableBody');
const addCustomerBtn = document.getElementById('addCustomerBtn');
const searchCustomerInput = document.getElementById('searchCustomer');

// नयाँ मोडल DOM तत्वहरू
const addCustomerModal = new bootstrap.Modal(document.getElementById('addCustomerModal'), {
    keyboard: false
});
const editCustomerModal = new bootstrap.Modal(document.getElementById('editCustomerModal'), {
    keyboard: false
});

// नयाँ फारम तत्वहरू
const customerName = document.getElementById('customerName');
const customerEmail = document.getElementById('customerEmail');
const customerPhone = document.getElementById('customerPhone');
const customerAddress = document.getElementById('customerAddress');
const customerPAN = document.getElementById('customerPAN');
const customerNotes = document.getElementById('customerNotes');

// सम्पादन फारम तत्वहरू
const editCustomerId = document.getElementById('editCustomerId');
const editCustomerName = document.getElementById('editCustomerName');
const editCustomerEmail = document.getElementById('editCustomerEmail');
const editCustomerPhone = document.getElementById('editCustomerPhone');
const editCustomerAddress = document.getElementById('editCustomerAddress');
const editCustomerPAN = document.getElementById('editCustomerPAN');
const editCustomerNotes = document.getElementById('editCustomerNotes');

// बटनहरू
const saveCustomerBtn = document.getElementById('saveCustomerBtn');
const updateCustomerBtn = document.getElementById('updateCustomerBtn');

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

// Format currency
function formatCurrency(amount, currencyCode) {
    if (amount === undefined || amount === null) return '-';
    
    const formatter = new Intl.NumberFormat('ne-NP', {
        style: 'currency',
        currency: currencyCode || 'NPR',
        minimumFractionDigits: 2
    });
    
    return formatter.format(amount);
}

// लोड भएका ग्राहकहरू
function loadCustomers() {
    const customers = getCustomers();
    const currentCompany = getCurrentCompany();
    const currency = currentCompany ? currentCompany.currency : 'NPR';
    
    if (!customerTableBody) return;
    
    customerTableBody.innerHTML = '';
    
    if (customers.length === 0) {
        customerTableBody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center">कुनै ग्राहकहरू छैनन्। नयाँ ग्राहक थप्न "नयाँ ग्राहक थप्नुहोस्" बटन क्लिक गर्नुहोस्।</td>
            </tr>
        `;
        return;
    }
    
    customers.forEach(customer => {
        const row = document.createElement('tr');
        const formattedBalance = formatCurrency(customer.balance || 0, currency);
        
        row.innerHTML = `
            <td>${customer.name}</td>
            <td>${customer.phone || '-'}</td>
            <td>${customer.email || '-'}</td>
            <td>${customer.address || '-'}</td>
            <td>${formattedBalance}</td>
            <td>
                <button class="btn btn-sm btn-outline-primary edit-customer-btn" 
                    data-id="${customer.id}">
                    <i class="bi bi-pencil"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger delete-customer-btn" 
                    data-id="${customer.id}" data-name="${customer.name}">
                    <i class="bi bi-trash"></i>
                </button>
            </td>
        `;
        
        customerTableBody.appendChild(row);
    });
    
    // Edit buttons
    document.querySelectorAll('.edit-customer-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            openEditCustomerModal(btn.dataset.id);
        });
    });
    
    // Delete buttons
    document.querySelectorAll('.delete-customer-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            confirmDeleteCustomer(btn.dataset.id, btn.dataset.name);
        });
    });
}

// फिल्टर ग्राहकहरू
function filterCustomers() {
    const searchTerm = searchCustomerInput.value.toLowerCase();
    const rows = customerTableBody.querySelectorAll('tr');
    
    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(searchTerm) ? '' : 'none';
    });
}

// नयाँ ग्राहक सेभ गर्ने
function saveCustomer() {
    // वैधता जाँच
    if (!customerName.value.trim()) {
        showAlert('ग्राहक नाम आवश्यक छ।');
        return;
    }
    
    // ग्राहक डाटा तयार
    const customer = {
        name: customerName.value.trim(),
        email: customerEmail.value.trim(),
        phone: customerPhone.value.trim(),
        address: customerAddress.value.trim(),
        pan: customerPAN.value.trim(),
        notes: customerNotes.value.trim()
    };
    
    // नयाँ ग्राहक थप्ने
    const success = addCustomer(customer);
    
    if (success) {
        showAlert('ग्राहक सफलतापूर्वक थपियो!', 'success');
        loadCustomers();
        addCustomerModal.hide();
    } else {
        showAlert('ग्राहक थप्न समस्या भयो।');
    }
}

// सम्पादन मोडल खोल्ने
function openEditCustomerModal(customerId) {
    const customers = getCustomers();
    const customer = customers.find(c => c.id === customerId);
    
    if (customer) {
        editCustomerId.value = customer.id;
        editCustomerName.value = customer.name || '';
        editCustomerEmail.value = customer.email || '';
        editCustomerPhone.value = customer.phone || '';
        editCustomerAddress.value = customer.address || '';
        editCustomerPAN.value = customer.pan || '';
        editCustomerNotes.value = customer.notes || '';
        
        editCustomerModal.show();
    } else {
        showAlert('ग्राहक भेटिएन।');
    }
}

// ग्राहक अपडेट गर्ने
function updateCustomer() {
    // वैधता जाँच
    if (!editCustomerName.value.trim()) {
        showAlert('ग्राहक नाम आवश्यक छ।');
        return;
    }
    
    const updatedCustomer = {
        name: editCustomerName.value.trim(),
        email: editCustomerEmail.value.trim(),
        phone: editCustomerPhone.value.trim(),
        address: editCustomerAddress.value.trim(),
        pan: editCustomerPAN.value.trim(),
        notes: editCustomerNotes.value.trim()
    };
    
    // ग्राहक अपडेट
    const success = updateCustomerInDB(editCustomerId.value, updatedCustomer);
    
    if (success) {
        showAlert('ग्राहक सफलतापूर्वक अपडेट गरियो!', 'success');
        loadCustomers();
        editCustomerModal.hide();
    } else {
        showAlert('ग्राहक अपडेट गर्न समस्या भयो।');
    }
}

// ग्राहक मेटाउन पुष्टि गर्ने
function confirmDeleteCustomer(customerId, customerName) {
    if (confirm(`के तपाईं निश्चित हुनुहुन्छ कि तपाईं "${customerName}" मेटाउन चाहनुहुन्छ?`)) {
        const success = deleteCustomer(customerId);
        if (success) {
            showAlert('ग्राहक सफलतापूर्वक मेटाइयो!', 'success');
            loadCustomers();
        } else {
            showAlert('ग्राहक मेटाउन समस्या भयो।');
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
        if (currentCompanyName) currentCompanyName.textContent = currentCompany.name;
        if (sidebarCompanyName) sidebarCompanyName.textContent = currentCompany.name;
    }
    
    // ग्राहक लोड
    loadCustomers();
    
    // ग्राहक थप्ने बटन
    if (addCustomerBtn) {
        addCustomerBtn.addEventListener('click', () => {
            if (addCustomerModal) {
                addCustomerModal.show();
            } else {
                console.error('addCustomerModal not found');
            }
        });
    }
    
    // ग्राहक खोज्ने इनपुट
    if (searchCustomerInput) {
        searchCustomerInput.addEventListener('input', filterCustomers);
    }
    
    // सेभ ग्राहक बटन
    if (saveCustomerBtn) {
        saveCustomerBtn.addEventListener('click', saveCustomer);
    }
    
    // अपडेट ग्राहक बटन
    if (updateCustomerBtn) {
        updateCustomerBtn.addEventListener('click', updateCustomer);
    }
    
    // एडित र डिलिट बटनहरू ग्राहक लोड फंक्शनमा परिभाषित
});

// ग्राहक अपडेट गर्ने डेटाबेस फंक्शन
function updateCustomerInDB(customerId, updatedData) {
    const company = getCurrentCompany();
    if (!company || !company.customers) return false;
    
    const customerIndex = company.customers.findIndex(c => c.id === customerId);
    
    if (customerIndex === -1) return false;
    
    // अपडेट गर्दा आईडी र क्रिएटेड एट संरक्षित गर्ने
    const originalCustomer = company.customers[customerIndex];
    company.customers[customerIndex] = {
        ...originalCustomer,
        ...updatedData,
        id: originalCustomer.id,
        createdAt: originalCustomer.createdAt,
        updatedAt: new Date().toISOString()
    };
    
    return saveCompany(company);
} 