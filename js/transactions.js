// Transaction management functionality

// DOM Elements
const transactionTableBody = document.getElementById('transactionTableBody');
const addTransactionBtn = document.getElementById('addTransactionBtn');

// नयाँ मोडल DOM तत्वहरू
const addTransactionModal = document.getElementById('addTransactionModal') ? 
    new bootstrap.Modal(document.getElementById('addTransactionModal')) : null;

// New form fields
const addTransactionForm = document.getElementById('addTransactionForm');
const transactionDate = document.getElementById('transactionDate');
const transactionType = document.getElementById('transactionType');
const transactionAmount = document.getElementById('transactionAmount');
const transactionAccount = document.getElementById('transactionAccount');
const transactionCategory = document.getElementById('transactionCategory');
const transactionNote = document.getElementById('transactionNote');
const saveTransactionBtn = document.getElementById('saveTransactionBtn');

// Filter elements
const filterStartDate = document.getElementById('filterStartDate');
const filterEndDate = document.getElementById('filterEndDate');
const filterType = document.getElementById('filterType');
const applyFilterBtn = document.getElementById('applyFilterBtn');

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

// Format date from ISO to local date
function formatDate(dateString) {
    if (!dateString) return '-';
    
    const date = new Date(dateString);
    return date.toLocaleDateString();
}

// Get transaction type name in Nepali
function getTransactionTypeName(type) {
    const types = {
        'income': 'आम्दानी',
        'expense': 'खर्च',
        'transfer': 'स्थानान्तरण',
        'sale': 'बिक्री',
        'purchase': 'खरीद',
        'payment': 'भुक्तानी',
        'receipt': 'रसिद'
    };
    
    return types[type] || type;
}

// Get account name in Nepali
function getAccountName(account) {
    const accounts = {
        'cash': 'नगद',
        'bank': 'बैंक',
        'credit_card': 'क्रेडिट कार्ड',
        'other': 'अन्य'
    };
    
    return accounts[account] || account;
}

// Save transaction
function saveTransaction() {
    // Validate required fields
    if (!transactionDate.value) {
        showAlert('मिति आवश्यक छ।');
        return;
    }
    
    if (!transactionType.value) {
        showAlert('प्रकार आवश्यक छ।');
        return;
    }
    
    if (!transactionAmount.value || parseFloat(transactionAmount.value) <= 0) {
        showAlert('वैध रकम आवश्यक छ।');
        return;
    }
    
    // Prepare transaction data
    const transaction = {
        date: transactionDate.value,
        type: transactionType.value,
        amount: parseFloat(transactionAmount.value),
        account: transactionAccount.value,
        description: transactionCategory.value || 'अन्य',
        notes: transactionNote.value.trim()
    };
    
    // Add new transaction
    const success = addTransaction(transaction);
    
    if (success) {
        // Update balance for customer or vendor if applicable
        updateBalance(transaction);
        
        showAlert('कारोबार सफलतापूर्वक थपियो!', 'success');
        
        // Reset form
        addTransactionForm.reset();
        
        // Set default date to today
        const today = new Date().toISOString().split('T')[0];
        transactionDate.value = today;
        
        // Hide modal
        if (addTransactionModal) {
            addTransactionModal.hide();
        }
        
        // Reload transactions table
        loadTransactions();
    } else {
        showAlert('कारोबार थप्न समस्या भयो।');
    }
}

// Filter transactions
function filterTransactions() {
    const startDate = filterStartDate.value ? new Date(filterStartDate.value) : null;
    const endDate = filterEndDate.value ? new Date(filterEndDate.value) : null;
    const type = filterType.value;
    
    let transactions = getTransactions();
    
    // Apply date filter
    if (startDate) {
        transactions = transactions.filter(t => {
            const transactionDate = new Date(t.date);
            return transactionDate >= startDate;
        });
    }
    
    if (endDate) {
        transactions = transactions.filter(t => {
            const transactionDate = new Date(t.date);
            return transactionDate <= endDate;
        });
    }
    
    // Apply type filter
    if (type) {
        transactions = transactions.filter(t => t.type === type);
    }
    
    // Update the table with filtered transactions
    updateTransactionTable(transactions);
}

// Update transaction table with given transactions
function updateTransactionTable(transactions) {
    const currentCompany = getCurrentCompany();
    const currency = currentCompany ? currentCompany.currency : 'NPR';
    
    transactionTableBody.innerHTML = '';
    
    if (transactions.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = '<td colspan="6" class="text-center">कुनै कारोबारहरू छैनन्। नयाँ कारोबार थप्न "नयाँ कारोबार थप्नुहोस्" बटन क्लिक गर्नुहोस्।</td>';
        transactionTableBody.appendChild(row);
        return;
    }
    
    // Sort transactions by date (newest first)
    transactions.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    transactions.forEach(transaction => {
        const row = document.createElement('tr');
        
        const formattedAmount = formatCurrency(transaction.amount, currency);
        const formattedDate = formatDate(transaction.date);
        const transactionTypeName = getTransactionTypeName(transaction.type);
        const accountName = getAccountName(transaction.account);
        
        row.innerHTML = `
            <td>${formattedDate}</td>
            <td>${transaction.description || '-'}</td>
            <td>${transactionTypeName}</td>
            <td>${formattedAmount}</td>
            <td>${accountName}</td>
            <td>
                <button class="btn btn-sm btn-outline-primary view-transaction-btn" 
                    data-id="${transaction.id}">
                    <i class="bi bi-eye"></i>
                </button>
            </td>
        `;
        
        transactionTableBody.appendChild(row);
    });
    
    // Add event listeners to view buttons
    document.querySelectorAll('.view-transaction-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const transactionId = btn.dataset.id;
            viewTransaction(transactionId);
        });
    });
}

// View transaction details
function viewTransaction(transactionId) {
    const transactions = getTransactions();
    const transaction = transactions.find(t => t.id === transactionId);
    
    if (transaction) {
        // ट्रान्जेक्शन हेर्ने मोडल देखाउने (अहिलेको लागि अलर्ट मात्र)
        const typeName = getTransactionTypeName(transaction.type);
        const formattedAmount = formatCurrency(transaction.amount);
        const formattedDate = formatDate(transaction.date);
        
        const message = `
            <h5>कारोबार विवरण</h5>
            <p><strong>मिति:</strong> ${formattedDate}</p>
            <p><strong>प्रकार:</strong> ${typeName}</p>
            <p><strong>रकम:</strong> ${formattedAmount}</p>
            <p><strong>खाता:</strong> ${getAccountName(transaction.account)}</p>
            <p><strong>विवरण:</strong> ${transaction.description || '-'}</p>
            <p><strong>नोट:</strong> ${transaction.notes || '-'}</p>
        `;
        
        showAlert(message, 'info');
    } else {
        showAlert('कारोबार भेटिएन।');
    }
}

// Load transactions
function loadTransactions() {
    const transactions = getTransactions();
    updateTransactionTable(transactions);
}

// Common DOM Elements
document.addEventListener('DOMContentLoaded', () => {
    // कम्पनी नाम देखाउने
    const currentCompanyName = document.getElementById('currentCompanyName');
    const sidebarCompanyName = document.getElementById('sidebarCompanyName');
    const currentCompany = getCurrentCompany();
    
    if (currentCompany) {
        if (currentCompanyName) currentCompanyName.textContent = currentCompany.name || currentCompany.companyName;
        if (sidebarCompanyName) sidebarCompanyName.textContent = currentCompany.name || currentCompany.companyName;
    }
    
    // Load transactions
    loadTransactions();
    
    // Set default dates for filters (if they exist)
    if (filterStartDate && filterEndDate) {
        // Start date: first day of current month
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
        filterStartDate.value = startOfMonth;
        
        // End date: today
        const today = now.toISOString().split('T')[0];
        filterEndDate.value = today;
    }
    
    // Transaction date default (if exists)
    if (transactionDate) {
        const today = new Date().toISOString().split('T')[0];
        transactionDate.value = today;
    }
    
    // नयाँ कारोबार थप्ने बटन
    if (addTransactionBtn) {
        addTransactionBtn.addEventListener('click', () => {
            if (addTransactionModal) {
                addTransactionModal.show();
            } else {
                console.error('addTransactionModal not initialized');
            }
        });
    }
    
    // Save transaction button
    if (saveTransactionBtn) {
        saveTransactionBtn.addEventListener('click', saveTransaction);
    }
    
    // Apply filter button
    if (applyFilterBtn) {
        applyFilterBtn.addEventListener('click', filterTransactions);
    }
    
    // अन्य बटनहरू र इभेन्ट लिसनरहरू यहाँ थप्न सकिन्छ
    
    // Drop down initialization
    const dropdownElementList = [].slice.call(document.querySelectorAll('.dropdown-toggle'));
    const dropdownList = dropdownElementList.map(function (dropdownToggleEl) {
        return new bootstrap.Dropdown(dropdownToggleEl);
    });
}); 