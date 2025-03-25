// Dashboard functionality

// DOM Elements
const sidebarCompanyName = document.getElementById('sidebarCompanyName');
const currentCompanyName = document.getElementById('currentCompanyName');
const currentUsername = document.getElementById('currentUsername');
const companyDropdown = document.getElementById('companyDropdown');
const companyDropdownMenu = document.getElementById('companyDropdownMenu');
const logoutBtn = document.getElementById('logoutBtn');

// Create Company Modal
const createCompanyModal = document.getElementById('createCompanyModal') ?
    new bootstrap.Modal(document.getElementById('createCompanyModal')) : null;
const saveCompanyBtn = document.getElementById('saveCompanyBtn');
const companyNameInput = document.getElementById('companyName');
const companyAddressInput = document.getElementById('companyAddress');
const companyPhoneInput = document.getElementById('companyPhone');
const companyEmailInput = document.getElementById('companyEmail');
const companyPANInput = document.getElementById('companyPAN');
const companyCurrencyInput = document.getElementById('companyCurrency');

// Stats elements
const totalCustomers = document.getElementById('totalCustomers');
const totalVendors = document.getElementById('totalVendors');
const dailyTransactions = document.getElementById('dailyTransactions');
const pendingInvoices = document.getElementById('pendingInvoices');

// Table elements
const recentTransactionsTable = document.getElementById('recentTransactionsTable');
const inventoryStatusTable = document.getElementById('inventoryStatusTable');

// Chart elements
const incomeExpensesChart = document.getElementById('incomeExpensesChart');

// Alert Show Function
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
    
    // 5 सेकेन्डपछि स्वतः हटाउने
    setTimeout(() => {
        if (wrapper.firstChild) {
            const alert = bootstrap.Alert.getOrCreateInstance(wrapper.firstChild);
            alert.close();
        } else {
            wrapper.remove();
        }
    }, 5000);
}

// Load current company
function loadCurrentCompany() {
    const currentUser = getCurrentUser();
    if (!currentUser) {
        window.location.href = '../index.html';
        return null;
    }
    
    // Load current username
    if (currentUsername) {
        currentUsername.textContent = currentUser.username || currentUser.displayName || 'प्रयोगकर्ता';
    }
    
    const currentCompany = getCurrentCompany();
    if (!currentCompany) {
        // Show modal to create company
        if (createCompanyModal) {
            createCompanyModal.show();
        } else {
            window.location.href = 'create-company.html';
        }
        return null;
    }
    
    // Update company name in UI
    if (sidebarCompanyName) sidebarCompanyName.textContent = currentCompany.name || currentCompany.companyName;
    if (currentCompanyName) currentCompanyName.textContent = currentCompany.name || currentCompany.companyName;
    
    return currentCompany;
}

// Load all companies for company switcher
function loadCompanySwitcher() {
    const currentUser = getCurrentUser();
    if (!currentUser) {
        window.location.href = '../index.html';
        return;
    }
    
    const companies = getCompanies();
    
    // Filter companies for this user if needed
    const userCompanies = companies.filter(company => 
        company.userId === currentUser.id || 
        company.userIds?.includes(currentUser.id)
    );
    
    // Clear the dropdown menu
    const dropdownItems = companyDropdownMenu.querySelectorAll('li:not(:last-child)');
    dropdownItems.forEach(item => {
        if (!item.querySelector('a[href="create-company.html"]')) {
            item.remove();
        }
    });
    
    // Add all user companies to dropdown
    userCompanies.forEach(company => {
        const companyName = company.name || company.companyName;
        const listItem = document.createElement('li');
        const item = document.createElement('a');
        item.className = 'dropdown-item';
        item.innerHTML = `<i class="fas fa-building me-2"></i> ${companyName}`;
        item.addEventListener('click', (e) => {
            e.preventDefault();
            switchCompany(company);
        });
        
        listItem.appendChild(item);
        
        // Insert before the divider
        const divider = companyDropdownMenu.querySelector('hr.dropdown-divider').parentNode;
        if (divider) {
            companyDropdownMenu.insertBefore(listItem, divider);
        } else {
            companyDropdownMenu.appendChild(listItem);
        }
    });
}

// Switch to a different company
function switchCompany(company) {
    localStorage.setItem('currentCompany', JSON.stringify(company));
    window.location.reload();
}

// Save new company
function saveNewCompany() {
    if (!companyNameInput || !companyNameInput.value.trim()) {
        showAlert('कम्पनी नाम आवश्यक छ');
        return;
    }
    
    const currentUser = getCurrentUser();
    if (!currentUser) {
        window.location.href = '../index.html';
        return;
    }
    
    const company = {
        id: 'company_' + Date.now(),
        name: companyNameInput.value.trim(),
        address: companyAddressInput ? companyAddressInput.value.trim() : '',
        phone: companyPhoneInput ? companyPhoneInput.value.trim() : '',
        email: companyEmailInput ? companyEmailInput.value.trim() : '',
        pan: companyPANInput ? companyPANInput.value.trim() : '',
        currency: companyCurrencyInput ? companyCurrencyInput.value : 'NPR',
        userId: currentUser.id,
        createdAt: new Date().toISOString(),
        customers: [],
        vendors: [],
        transactions: [],
        invoices: [],
        inventory: []
    };
    
    const success = addCompany(company);
    
    if (success) {
        // Set as current company
        localStorage.setItem('currentCompany', JSON.stringify(company));
        
        // Hide modal and reload
        if (createCompanyModal) {
            createCompanyModal.hide();
        }
        
        showAlert('कम्पनी सफलतापूर्वक थपियो!', 'success');
        
        // Reload after a delay
        setTimeout(() => {
            window.location.reload();
        }, 1000);
    } else {
        showAlert('कम्पनी थप्न समस्या भयो');
    }
}

// Handle logout
function logout() {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('currentCompany');
    window.location.href = '../index.html';
}

// Load dashboard stats
function loadDashboardStats(company) {
    if (!company) return;
    
    // Get company data
    const customers = company.customers || [];
    const vendors = company.vendors || [];
    const transactions = company.transactions || [];
    const invoices = company.invoices || [];
    const inventory = company.inventory || [];
    
    // Update stats
    if (totalCustomers) totalCustomers.textContent = customers.length;
    if (totalVendors) totalVendors.textContent = vendors.length;
    
    // Calculate daily transactions (for today)
    const today = new Date().toISOString().split('T')[0];
    const todayTransactions = transactions.filter(t => 
        t.date && t.date.startsWith(today)
    );
    if (dailyTransactions) dailyTransactions.textContent = todayTransactions.length;
    
    // Calculate pending invoices
    const pendingInvoiceCount = invoices.filter(i => 
        i.status === 'pending' || i.status === 'partial'
    ).length;
    if (pendingInvoices) pendingInvoices.textContent = pendingInvoiceCount;
    
    // Load recent transactions table
    loadRecentTransactions(transactions);
    
    // Load inventory status
    loadInventoryStatus(inventory);
    
    // Initialize charts
    initializeCharts(transactions);
}

// Load recent transactions
function loadRecentTransactions(transactions) {
    if (!recentTransactionsTable) return;
    
    // Sort transactions by date (newest first)
    const recentTransactions = [...transactions]
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 5); // Get only the most recent 5
    
    // Clear table
    recentTransactionsTable.innerHTML = '';
    
    if (recentTransactions.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = '<td colspan="4" class="text-center">कुनै हालैका कारोबारहरू छैनन्</td>';
        recentTransactionsTable.appendChild(row);
    } else {
        // Add transaction rows
        recentTransactions.forEach(transaction => {
            const row = document.createElement('tr');
            
            // Format date
            const date = new Date(transaction.date);
            const formattedDate = date.toLocaleDateString();
            
            // Format currency based on company settings
            const currentCompany = getCurrentCompany();
            const formattedAmount = formatCurrency(transaction.amount, currentCompany.currency);
            
            row.innerHTML = `
                <td>${formattedDate}</td>
                <td>${transaction.description}</td>
                <td>${getTransactionTypeName(transaction.type)}</td>
                <td>${formattedAmount}</td>
            `;
            
            recentTransactionsTable.appendChild(row);
        });
    }
}

// Load inventory status
function loadInventoryStatus(inventory) {
    if (!inventoryStatusTable) return;
    
    // Clear table
    inventoryStatusTable.innerHTML = '';
    
    if (inventory.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = '<td colspan="3" class="text-center">कुनै इन्भेन्टरी आइटमहरू छैनन्</td>';
        inventoryStatusTable.appendChild(row);
    } else {
        // Sort items by stock level (lowest first)
        const lowStockItems = [...inventory]
            .sort((a, b) => a.quantity - b.quantity)
            .slice(0, 5); // Get only the top 5 with lowest stock
        
        // Add inventory rows
        lowStockItems.forEach(item => {
            const row = document.createElement('tr');
            
            // Determine stock status
            let statusClass = 'text-success';
            let statusText = 'सुरक्षित स्टक';
            
            if (item.quantity <= item.reorderLevel) {
                statusClass = 'text-danger';
                statusText = 'कम स्टक';
            } else if (item.quantity <= item.reorderLevel * 1.5) {
                statusClass = 'text-warning';
                statusText = 'औसत स्टक';
            }
            
            row.innerHTML = `
                <td>${item.name}</td>
                <td>${item.quantity}</td>
                <td class="${statusClass}">${statusText}</td>
            `;
            
            inventoryStatusTable.appendChild(row);
        });
    }
}

// Initialize charts
function initializeCharts(transactions) {
    if (!incomeExpensesChart) return;
    
    // Prepare data for income vs expenses chart
    const months = ['जनवरी', 'फेब्रुअरी', 'मार्च', 'अप्रिल', 'मे', 'जुन', 'जुलाई', 'अगस्ट', 'सेप्टेम्बर', 'अक्टोबर', 'नोभेम्बर', 'डिसेम्बर'];
    const currentYear = new Date().getFullYear();
    
    // Initialize monthly data
    const incomeData = Array(12).fill(0);
    const expenseData = Array(12).fill(0);
    
    // Process transactions
    transactions.forEach(transaction => {
        // Check if transaction has a date
        if (!transaction.date) return;
        
        const date = new Date(transaction.date);
        
        // Only process current year's transactions
        if (date.getFullYear() !== currentYear) return;
        
        const month = date.getMonth();
        const amount = parseFloat(transaction.amount);
        
        if (transaction.type === 'income') {
            incomeData[month] += amount;
        } else if (transaction.type === 'expense') {
            expenseData[month] += amount;
        }
    });
    
    // Create chart
    new Chart(incomeExpensesChart, {
        type: 'bar',
        data: {
            labels: months,
            datasets: [
                {
                    label: 'आम्दानी',
                    data: incomeData,
                    backgroundColor: 'rgba(28, 200, 138, 0.6)',
                    borderColor: 'rgba(28, 200, 138, 1)',
                    borderWidth: 1
                },
                {
                    label: 'खर्च',
                    data: expenseData,
                    backgroundColor: 'rgba(231, 74, 59, 0.6)',
                    borderColor: 'rgba(231, 74, 59, 1)',
                    borderWidth: 1
                }
            ]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
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

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    // Load current company
    const currentCompany = loadCurrentCompany();
    
    // Load company switcher
    loadCompanySwitcher();
    
    // Load dashboard stats if company exists
    if (currentCompany) {
        loadDashboardStats(currentCompany);
    }
    
    // Logout button
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            logout();
        });
    }
    
    // Save new company button
    if (saveCompanyBtn) {
        saveCompanyBtn.addEventListener('click', saveNewCompany);
    }
}); 