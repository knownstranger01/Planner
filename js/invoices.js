// Invoice management functionality

// DOM Elements
const invoiceTableBody = document.getElementById('invoiceTableBody');
const addSaleInvoiceBtn = document.getElementById('addSaleInvoiceBtn');
const addPurchaseInvoiceBtn = document.getElementById('addPurchaseInvoiceBtn');
const invoiceModal = document.getElementById('invoiceModal');
const invoiceModalTitle = document.getElementById('invoiceModalTitle');
const closeInvoiceModal = document.getElementById('closeInvoiceModal');
const invoiceForm = document.getElementById('invoiceForm');
const invoiceAlert = document.getElementById('invoiceAlert');
const saveAsDraftBtn = document.getElementById('saveAsDraftBtn');
const saveAndCompleteBtn = document.getElementById('saveAndCompleteBtn');
const cancelInvoiceBtn = document.getElementById('cancelInvoiceBtn');

// Payment Modal Elements
const paymentModal = document.getElementById('paymentModal');
const closePaymentModal = document.getElementById('closePaymentModal');
const paymentForm = document.getElementById('paymentForm');
const paymentAlert = document.getElementById('paymentAlert');
const savePaymentBtn = document.getElementById('savePaymentBtn');
const cancelPaymentBtn = document.getElementById('cancelPaymentBtn');

// Form Elements
const invoiceId = document.getElementById('invoiceId');
const invoiceType = document.getElementById('invoiceType');
const invoiceDate = document.getElementById('invoiceDate');
const invoiceNumber = document.getElementById('invoiceNumber');
const entitySelect = document.getElementById('entitySelect');
const entityLabel = document.getElementById('entityLabel');
const itemsTableBody = document.getElementById('itemsTableBody');
const addItemBtn = document.getElementById('addItemBtn');
const notes = document.getElementById('notes');

// Filter Elements
const filterStartDate = document.getElementById('filterStartDate');
const filterEndDate = document.getElementById('filterEndDate');
const filterType = document.getElementById('filterType');
const filterStatus = document.getElementById('filterStatus');
const applyFilterBtn = document.getElementById('applyFilterBtn');

// Current edit mode
let isEditMode = false;
let currentInvoice = null;

// Show alert message
function showAlert(element, message, type = 'danger') {
    element.textContent = message;
    element.classList.remove('hidden', 'alert-success', 'alert-danger');
    element.classList.add(`alert-${type}`);
    
    // Auto hide after 5 seconds
    setTimeout(() => {
        element.classList.add('hidden');
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

// Format date
function formatDate(dateString) {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('ne-NP');
}

// Get status name
function getStatusName(status) {
    const statusNames = {
        'draft': 'ड्राफ्ट',
        'pending': 'बाँकी',
        'partial': 'आंशिक भुक्तानी',
        'paid': 'भुक्तानी भएको',
        'cancelled': 'रद्द गरिएको'
    };
    return statusNames[status] || status;
}

// Get type name
function getTypeName(type) {
    const typeNames = {
        'sale': 'बिक्री बिल',
        'purchase': 'खरिद बिल'
    };
    return typeNames[type] || type;
}

// Generate invoice number
function generateInvoiceNumber(type) {
    const company = getCurrentCompany();
    if (!company) return '';
    
    const prefix = type === 'sale' ? 'SIN' : 'PIN';
    const date = new Date();
    const year = date.getFullYear().toString().substr(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    
    // Get existing invoices and find the last number
    const invoices = getInvoices().filter(inv => inv.type === type);
    let maxNum = 0;
    
    invoices.forEach(invoice => {
        const num = parseInt(invoice.number.split('-')[3]);
        if (num > maxNum) maxNum = num;
    });
    
    const nextNum = (maxNum + 1).toString().padStart(4, '0');
    return `${prefix}-${year}${month}-${company.id}-${nextNum}`;
}

// Populate entity dropdown based on invoice type
function populateEntityDropdown(type) {
    entitySelect.innerHTML = '<option value="">छान्नुहोस्...</option>';
    
    if (type === 'sale') {
        entityLabel.textContent = 'ग्राहक';
        const customers = getCustomers();
        customers.forEach(customer => {
            const option = document.createElement('option');
            option.value = customer.id;
            option.textContent = customer.name;
            entitySelect.appendChild(option);
        });
    } else {
        entityLabel.textContent = 'विक्रेता';
        const vendors = getVendors();
        vendors.forEach(vendor => {
            const option = document.createElement('option');
            option.value = vendor.id;
            option.textContent = vendor.name;
            entitySelect.appendChild(option);
        });
    }
}

// Get entity name by ID
function getEntityName(id, type) {
    if (!id) return '-';
    
    if (type === 'sale') {
        const customer = getCustomers().find(c => c.id === id);
        return customer ? customer.name : '-';
    } else {
        const vendor = getVendors().find(v => v.id === id);
        return vendor ? vendor.name : '-';
    }
}

// Add item row to invoice
function addItemRow(itemData = null) {
    const row = document.createElement('tr');
    
    // इन्भेन्ट्रीबाट आइटमहरू प्राप्त गर्ने
    const inventoryItems = getInventoryItems();
    const currentType = invoiceType.value; // 'sale' वा 'purchase'
    
    // आइटम सेलेक्ट बक्स बनाउने
    let itemOptions = '<option value="">-- सामान छान्नुहोस् --</option>';
    
    inventoryItems.forEach(item => {
        const selected = itemData && itemData.itemId === item.id ? 'selected' : '';
        itemOptions += `<option value="${item.id}" data-price="${currentType === 'sale' ? item.salePrice : item.purchasePrice}" data-name="${item.name}" ${selected}>${item.name} - ${item.code}</option>`;
    });
    
    row.innerHTML = `
        <td>
            <select class="form-control item-select">
                ${itemOptions}
            </select>
            <input type="hidden" class="item-id" value="${itemData ? itemData.itemId || '' : ''}">
            <input type="hidden" class="item-name" value="${itemData ? itemData.name || '' : ''}">
        </td>
        <td>
            <input type="text" class="form-control item-description" value="${itemData ? itemData.description || '' : ''}">
        </td>
        <td>
            <input type="number" class="form-control item-quantity" value="${itemData ? itemData.quantity : '1'}" min="1" step="1">
        </td>
        <td>
            <input type="number" class="form-control item-rate" value="${itemData ? itemData.rate : ''}" min="0" step="0.01">
        </td>
        <td>
            <input type="number" class="form-control item-tax" value="${itemData ? itemData.tax : '13'}" min="0" max="100" step="0.1">
        </td>
        <td class="item-amount">${itemData ? formatCurrency(itemData.quantity * itemData.rate) : ''}</td>
        <td>
            <button type="button" class="btn btn-sm btn-danger remove-item">
                <i class="fas fa-times"></i>
            </button>
        </td>
    `;
    
    // Add event listeners to calculate amount and remove row
    const quantityInput = row.querySelector('.item-quantity');
    const rateInput = row.querySelector('.item-rate');
    const amountCell = row.querySelector('.item-amount');
    const removeBtn = row.querySelector('.remove-item');
    const itemSelect = row.querySelector('.item-select');
    const itemIdInput = row.querySelector('.item-id');
    const itemNameInput = row.querySelector('.item-name');
    
    // आइटम चयन गर्दा मूल्य र नाम अटो-फिल गर्ने
    if (itemSelect) {
        itemSelect.addEventListener('change', function() {
            const selectedOption = this.options[this.selectedIndex];
            if (selectedOption && selectedOption.value) {
                const itemId = selectedOption.value;
                const itemName = selectedOption.dataset.name;
                const price = parseFloat(selectedOption.dataset.price) || 0;
                
                itemIdInput.value = itemId;
                itemNameInput.value = itemName;
                rateInput.value = price.toFixed(2);
                
                // मात्रा र मूल्य अपडेट भएपछि रकम पनि अपडेट गर्ने
                updateAmount();
            } else {
                itemIdInput.value = '';
                itemNameInput.value = '';
                rateInput.value = '';
                amountCell.textContent = '';
            }
        });
    }
    
    function updateAmount() {
        const quantity = parseFloat(quantityInput.value) || 0;
        const rate = parseFloat(rateInput.value) || 0;
        const amount = quantity * rate;
        
        amountCell.textContent = formatCurrency(amount);
        
        // Update invoice totals
        updateTotals();
    }
    
    quantityInput.addEventListener('input', updateAmount);
    rateInput.addEventListener('input', updateAmount);
    
    removeBtn.addEventListener('click', () => {
        row.remove();
        updateTotals();
    });
    
    itemsTableBody.appendChild(row);
}

// Calculate totals
function calculateTotals() {
    let subtotal = 0;
    let taxAmount = 0;
    
    const rows = itemsTableBody.querySelectorAll('tr');
    rows.forEach(row => {
        const quantity = parseFloat(row.querySelector('.item-quantity').value) || 0;
        const rate = parseFloat(row.querySelector('.item-rate').value) || 0;
        const tax = parseFloat(row.querySelector('.item-tax').value) || 0;
        
        const amount = quantity * rate;
        const itemTax = amount * (tax / 100);
        
        subtotal += amount;
        taxAmount += itemTax;
        
        row.querySelector('.item-amount').textContent = formatCurrency(amount);
    });
    
    const totalAmount = subtotal + taxAmount;
    
    document.getElementById('subtotal').textContent = formatCurrency(subtotal);
    document.getElementById('taxAmount').textContent = formatCurrency(taxAmount);
    document.getElementById('totalAmount').textContent = formatCurrency(totalAmount);
}

// Open invoice modal in add mode
function openAddInvoiceModal(type) {
    isEditMode = false;
    currentInvoice = null;
    invoiceType.value = type;
    
    invoiceModalTitle.textContent = type === 'sale' ? 'नयाँ बिक्री बिल' : 'नयाँ खरिद बिल';
    
    // Reset form
    invoiceForm.reset();
    itemsTableBody.innerHTML = '';
    
    // Set default date to today
    invoiceDate.value = new Date().toISOString().split('T')[0];
    
    // Generate invoice number
    invoiceNumber.value = generateInvoiceNumber(type);
    
    // Populate entity dropdown
    populateEntityDropdown(type);
    
    // Add one empty item row
    addItemRow();
    
    invoiceModal.style.display = 'block';
}

// Open invoice modal in edit mode
function openEditInvoiceModal(invoice) {
    isEditMode = true;
    currentInvoice = invoice;
    
    invoiceModalTitle.textContent = invoice.type === 'sale' ? 'बिक्री बिल सम्पादन' : 'खरिद बिल सम्पादन';
    
    // Fill form with invoice data
    invoiceId.value = invoice.id;
    invoiceType.value = invoice.type;
    invoiceDate.value = invoice.date;
    invoiceNumber.value = invoice.number;
    notes.value = invoice.notes || '';
    
    // Populate entity dropdown and select value
    populateEntityDropdown(invoice.type);
    entitySelect.value = invoice.entityId;
    
    // Clear and populate items
    itemsTableBody.innerHTML = '';
    invoice.items.forEach(item => addItemRow(item));
    
    invoiceModal.style.display = 'block';
}

// Close invoice modal
function closeInvoiceModal() {
    invoiceModal.style.display = 'none';
    invoiceForm.reset();
    itemsTableBody.innerHTML = '';
    invoiceAlert.classList.add('hidden');
}

// Save invoice
function saveInvoice(status = 'draft') {
    // Validate required fields
    if (!invoiceDate.value) {
        showAlert(invoiceAlert, 'मिति आवश्यक छ।');
        return false;
    }
    
    if (!entitySelect.value) {
        showAlert(invoiceAlert, entityLabel.textContent + ' आवश्यक छ।');
        return false;
    }
    
    // Get items
    const items = [];
    const rows = itemsTableBody.querySelectorAll('tr');
    
    for (const row of rows) {
        const itemId = row.querySelector('.item-id').value;
        const name = row.querySelector('.item-name').value.trim();
        
        if (!name) {
            showAlert(invoiceAlert, 'सबै सामानको नाम आवश्यक छ।');
            return false;
        }
        
        const quantity = parseFloat(row.querySelector('.item-quantity').value);
        const rate = parseFloat(row.querySelector('.item-rate').value);
        
        if (isNaN(quantity) || quantity <= 0 || isNaN(rate) || rate < 0) {
            showAlert(invoiceAlert, 'मात्रा र दर मान्य हुनुपर्छ।');
            return false;
        }
        
        items.push({
            itemId: itemId,
            name,
            description: row.querySelector('.item-description').value.trim(),
            quantity,
            rate,
            tax: parseFloat(row.querySelector('.item-tax').value) || 0
        });
    }
    
    // Calculate totals
    let subtotal = 0;
    let taxAmount = 0;
    
    items.forEach(item => {
        const amount = item.quantity * item.rate;
        subtotal += amount;
        taxAmount += amount * (item.tax / 100);
    });
    
    const totalAmount = subtotal + taxAmount;
    
    // Prepare invoice data
    const invoiceData = {
        type: invoiceType.value,
        number: invoiceNumber.value,
        date: invoiceDate.value,
        entityId: entitySelect.value,
        items,
        subtotal,
        taxAmount,
        totalAmount,
        status,
        notes: notes.value.trim(),
        createdAt: new Date().toISOString()
    };
    
    // बिल सेभ गर्दा इन्भेन्ट्री अपडेट गर्न कोड थप्ने
    const isComplete = status === 'completed' || status === 'pending';
    if (isComplete) {
        // खरिद बिलबाट भण्डारमा सामान थप्ने, बिक्री बिलबाट घटाउने
        const isAddition = invoiceType.value === 'purchase';
        
        items.forEach(item => {
            if (item.itemId) {
                // इन्भेन्ट्री अपडेट
                updateInventoryQuantity(item.itemId, item.quantity, isAddition);
            }
        });
    }
    
    let success = false;
    
    if (isEditMode) {
        invoiceData.id = invoiceId.value;
        invoiceData.amountPaid = currentInvoice.amountPaid || 0;
        success = updateInvoice(invoiceData.id, invoiceData);
        if (success) {
            showAlert(invoiceAlert, 'बिल सफलतापूर्वक अद्यावधिक गरियो!', 'success');
        } else {
            showAlert(invoiceAlert, 'बिल अद्यावधिक गर्न समस्या भयो।');
            return false;
        }
    } else {
        success = addInvoice(invoiceData);
        if (success) {
            showAlert(invoiceAlert, 'बिल सफलतापूर्वक थपियो!', 'success');
        } else {
            showAlert(invoiceAlert, 'बिल थप्न समस्या भयो।');
            return false;
        }
    }
    
    // Close modal and reload table after delay
    setTimeout(() => {
        closeInvoiceModal();
        loadInvoices();
    }, 1500);
    
    return true;
}

// Open payment modal
function openPaymentModal(invoice) {
    currentInvoice = invoice;
    
    // Set default date to today
    document.getElementById('paymentDate').value = new Date().toISOString().split('T')[0];
    
    // Set max amount to remaining balance
    const remainingAmount = invoice.totalAmount - (invoice.amountPaid || 0);
    document.getElementById('paymentAmount').max = remainingAmount;
    document.getElementById('paymentAmount').value = remainingAmount;
    
    paymentModal.style.display = 'block';
}

// Close payment modal
function closePaymentModal() {
    paymentModal.style.display = 'none';
    paymentForm.reset();
    paymentAlert.classList.add('hidden');
}

// Save payment
function savePayment() {
    const paymentDate = document.getElementById('paymentDate').value;
    const paymentAmount = parseFloat(document.getElementById('paymentAmount').value);
    const paymentMethod = document.getElementById('paymentMethod').value;
    const paymentReference = document.getElementById('paymentReference').value.trim();
    const paymentNotes = document.getElementById('paymentNotes').value.trim();
    
    // Validate required fields
    if (!paymentDate) {
        showAlert(paymentAlert, 'भुक्तानी मिति आवश्यक छ।');
        return;
    }
    
    if (isNaN(paymentAmount) || paymentAmount <= 0) {
        showAlert(paymentAlert, 'मान्य भुक्तानी रकम प्रविष्ट गर्नुहोस्।');
        return;
    }
    
    const remainingAmount = currentInvoice.totalAmount - (currentInvoice.amountPaid || 0);
    if (paymentAmount > remainingAmount) {
        showAlert(paymentAlert, 'भुक्तानी रकम बाँकी रकम भन्दा बढी हुन सक्दैन।');
        return;
    }
    
    if (!paymentMethod) {
        showAlert(paymentAlert, 'भुक्तानी विधि आवश्यक छ।');
        return;
    }
    
    // Create payment record
    const payment = {
        invoiceId: currentInvoice.id,
        date: paymentDate,
        amount: paymentAmount,
        method: paymentMethod,
        reference: paymentReference,
        notes: paymentNotes
    };
    
    // Update invoice with payment
    const newAmountPaid = (currentInvoice.amountPaid || 0) + paymentAmount;
    const status = newAmountPaid >= currentInvoice.totalAmount ? 'paid' : 'partial';
    
    const success = updateInvoicePayment(currentInvoice.id, payment, newAmountPaid, status);
    
    if (success) {
        showAlert(paymentAlert, 'भुक्तानी सफलतापूर्वक रेकर्ड गरियो!', 'success');
        setTimeout(() => {
            closePaymentModal();
            loadInvoices();
        }, 1500);
    } else {
        showAlert(paymentAlert, 'भुक्तानी रेकर्ड गर्न समस्या भयो।');
    }
}

// Filter invoices
function filterInvoices() {
    const startDate = filterStartDate.value;
    const endDate = filterEndDate.value;
    const type = filterType.value;
    const status = filterStatus.value;
    
    let invoices = getInvoices();
    
    // Apply filters
    if (startDate) {
        invoices = invoices.filter(inv => inv.date >= startDate);
    }
    
    if (endDate) {
        invoices = invoices.filter(inv => inv.date <= endDate);
    }
    
    if (type) {
        invoices = invoices.filter(inv => inv.type === type);
    }
    
    if (status) {
        invoices = invoices.filter(inv => inv.status === status);
    }
    
    updateInvoiceTable(invoices);
}

// Update invoice table
function updateInvoiceTable(invoices) {
    const company = getCurrentCompany();
    const currency = company ? company.currency : 'NPR';
    
    invoiceTableBody.innerHTML = '';
    
    if (invoices.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = '<td colspan="9" class="text-center">कुनै बिलहरू छैनन्।</td>';
        invoiceTableBody.appendChild(row);
        return;
    }
    
    invoices.forEach(invoice => {
        const row = document.createElement('tr');
        
        const amountPaid = invoice.amountPaid || 0;
        const remainingAmount = invoice.totalAmount - amountPaid;
        
        row.innerHTML = `
            <td>${formatDate(invoice.date)}</td>
            <td>${invoice.number}</td>
            <td>${getTypeName(invoice.type)}</td>
            <td>${getEntityName(invoice.entityId, invoice.type)}</td>
            <td>${formatCurrency(invoice.totalAmount, currency)}</td>
            <td>${formatCurrency(amountPaid, currency)}</td>
            <td>${formatCurrency(remainingAmount, currency)}</td>
            <td><span class="status-badge ${invoice.status}">${getStatusName(invoice.status)}</span></td>
            <td>
                <button class="btn btn-sm edit-btn" data-id="${invoice.id}" title="सम्पादन">
                    <i class="fas fa-edit"></i>
                </button>
                ${invoice.status !== 'paid' && invoice.status !== 'cancelled' ? `
                    <button class="btn btn-sm payment-btn" data-id="${invoice.id}" title="भुक्तानी">
                        <i class="fas fa-money-bill"></i>
                    </button>
                ` : ''}
                ${invoice.status === 'draft' ? `
                    <button class="btn btn-sm delete-btn" data-id="${invoice.id}" title="मेटाउनुहोस्">
                        <i class="fas fa-trash"></i>
                    </button>
                ` : ''}
            </td>
        `;
        
        invoiceTableBody.appendChild(row);
    });
    
    // Add event listeners to buttons
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const invoice = invoices.find(inv => inv.id === btn.dataset.id);
            if (invoice) openEditInvoiceModal(invoice);
        });
    });
    
    document.querySelectorAll('.payment-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const invoice = invoices.find(inv => inv.id === btn.dataset.id);
            if (invoice) openPaymentModal(invoice);
        });
    });
    
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            if (confirm('के तपाईं यो बिल मेटाउन निश्चित हुनुहुन्छ?')) {
                const success = deleteInvoice(btn.dataset.id);
                if (success) {
                    loadInvoices();
                } else {
                    alert('बिल मेटाउन समस्या भयो।');
                }
            }
        });
    });
}

// Load invoices
function loadInvoices() {
    const invoices = getInvoices();
    updateInvoiceTable(invoices);
}

// Initialize bootstrap components
function initializeBootstrapComponents() {
    // कम्पनी नाम देखाउने
    const currentCompanyName = document.getElementById('currentCompanyName');
    const sidebarCompanyName = document.getElementById('sidebarCompanyName');
    const currentCompany = getCurrentCompany();
    
    if (currentCompany) {
        if (currentCompanyName) currentCompanyName.textContent = currentCompany.name || currentCompany.companyName;
        if (sidebarCompanyName) sidebarCompanyName.textContent = currentCompany.name || currentCompany.companyName;
    }
    
    // Bootstrap मोडल इनिसियलाइज
    const invoiceModalElement = document.getElementById('invoiceModal');
    const paymentModalElement = document.getElementById('paymentModal');
    
    // Initialize modals if they exist
    const invoiceModal = invoiceModalElement ? new bootstrap.Modal(invoiceModalElement) : null;
    const paymentModal = paymentModalElement ? new bootstrap.Modal(paymentModalElement) : null;
    
    // बटनहरू
    const addSaleInvoiceBtn = document.getElementById('addSaleInvoiceBtn');
    const addPurchaseInvoiceBtn = document.getElementById('addPurchaseInvoiceBtn');
    
    // बटन इभेन्ट लिसनरहरू
    if (addSaleInvoiceBtn) {
        addSaleInvoiceBtn.addEventListener('click', () => {
            openAddInvoiceModal('sale');
            if (invoiceModal) invoiceModal.show();
        });
    }
    
    if (addPurchaseInvoiceBtn) {
        addPurchaseInvoiceBtn.addEventListener('click', () => {
            openAddInvoiceModal('purchase');
            if (invoiceModal) invoiceModal.show();
        });
    }
    
    // ड्रपडाउन इनिसियलाइज
    const dropdownElementList = [].slice.call(document.querySelectorAll('.dropdown-toggle'));
    const dropdownList = dropdownElementList.map(function (dropdownToggleEl) {
        return new bootstrap.Dropdown(dropdownToggleEl);
    });
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    // Bootstrap इनिसियलाइज
    initializeBootstrapComponents();
    
    // Load invoices
    loadInvoices();
    
    // Add item button
    if (addItemBtn) {
        addItemBtn.addEventListener('click', () => addItemRow());
    }
    
    // Save buttons
    if (saveAsDraftBtn) {
        saveAsDraftBtn.addEventListener('click', () => saveInvoice('draft'));
    }
    
    if (saveAndCompleteBtn) {
        saveAndCompleteBtn.addEventListener('click', () => saveInvoice('pending'));
    }
    
    // Cancel buttons
    if (cancelInvoiceBtn) {
        cancelInvoiceBtn.addEventListener('click', closeInvoiceModal);
    }
    
    if (cancelPaymentBtn) {
        cancelPaymentBtn.addEventListener('click', closePaymentModal);
    }
    
    // Close modal buttons
    if (closeInvoiceModal) {
        closeInvoiceModal.addEventListener('click', closeInvoiceModal);
    }
    
    if (closePaymentModal) {
        closePaymentModal.addEventListener('click', closePaymentModal);
    }
    
    // Save payment button
    if (savePaymentBtn) {
        savePaymentBtn.addEventListener('click', savePayment);
    }
    
    // Filter button
    if (applyFilterBtn) {
        applyFilterBtn.addEventListener('click', filterInvoices);
    }
    
    // Window click to close modals
    window.addEventListener('click', (e) => {
        if (e.target === invoiceModal) {
            closeInvoiceModal();
        }
        if (e.target === paymentModal) {
            closePaymentModal();
        }
    });
}); 