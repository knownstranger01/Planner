// Database utility functions for local storage operations

// Get current logged-in user
function getCurrentUser() {
    const currentUserData = localStorage.getItem('currentUser');
    if (!currentUserData) return null;
    
    try {
        return JSON.parse(currentUserData);
    } catch (error) {
        console.error('Error parsing current user data:', error);
        return null;
    }
}

// Get current selected company
function getCurrentCompany() {
    const currentCompanyData = localStorage.getItem('currentCompany');
    if (!currentCompanyData) return null;
    
    try {
        return JSON.parse(currentCompanyData);
    } catch (error) {
        console.error('Error parsing current company data:', error);
        return null;
    }
}

// Get all companies
function getCompanies() {
    const companiesData = localStorage.getItem('companies');
    if (!companiesData) return [];
    
    try {
        return JSON.parse(companiesData);
    } catch (error) {
        console.error('Error parsing companies data:', error);
        return [];
    }
}

// Get all companies for the current user
function getUserCompanies() {
    const currentUser = getCurrentUser();
    if (!currentUser) return [];
    
    const allCompanies = getCompanies();
    
    return allCompanies.filter(company => 
        company.userId === currentUser.id || 
        company.userIds?.includes(currentUser.id)
    );
}

// Add a new company
function addCompany(company) {
    if (!company || !company.name) return false;
    
    const companies = getCompanies();
    
    // Generate ID if not present
    if (!company.id) {
        company.id = 'company_' + Date.now();
    }
    
    // Add created date if not present
    if (!company.createdAt) {
        company.createdAt = new Date().toISOString();
    }
    
    companies.push(company);
    localStorage.setItem('companies', JSON.stringify(companies));
    
    return true;
}

// Save company data
function saveCompany(company) {
    if (!company || !company.id) return false;
    
    const companies = getCompanies();
    const index = companies.findIndex(c => c.id === company.id);
    
    if (index === -1) {
        companies.push(company);
    } else {
        companies[index] = company;
    }
    
    localStorage.setItem('companies', JSON.stringify(companies));
    localStorage.setItem('currentCompany', JSON.stringify(company));
    
    return true;
}

// Get all customers for the current company
function getCustomers() {
    const company = getCurrentCompany();
    return company ? company.customers || [] : [];
}

// Get all vendors for the current company
function getVendors() {
    const company = getCurrentCompany();
    return company ? company.vendors || [] : [];
}

// Add a new vendor to the current company
function addVendor(vendor) {
    const company = getCurrentCompany();
    if (!company) return false;
    
    // Generate a unique ID for the vendor
    vendor.id = Date.now().toString();
    vendor.createdAt = new Date().toISOString();
    
    company.vendors = company.vendors || [];
    company.vendors.push(vendor);
    
    return saveCompany(company);
}

// Update an existing vendor
function updateVendor(vendorId, updatedData) {
    const company = getCurrentCompany();
    if (!company || !company.vendors) return false;
    
    const vendorIndex = company.vendors.findIndex(v => v.id === vendorId);
    
    if (vendorIndex === -1) return false;
    
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

// Delete a vendor
function deleteVendor(vendorId) {
    const company = getCurrentCompany();
    if (!company || !company.vendors) return false;
    
    const initialLength = company.vendors.length;
    company.vendors = company.vendors.filter(v => v.id !== vendorId);
    
    if (company.vendors.length < initialLength) {
        return saveCompany(company);
    }
    
    return false;
}

// Get all transactions for the current company
function getTransactions() {
    const company = getCurrentCompany();
    return company ? company.transactions || [] : [];
}

// Add a new transaction to the current company
function addTransaction(transaction) {
    const company = getCurrentCompany();
    if (!company) return false;
    
    // Generate a unique ID for the transaction
    transaction.id = Date.now().toString();
    transaction.createdAt = new Date().toISOString();
    
    company.transactions = company.transactions || [];
    company.transactions.push(transaction);
    
    return saveCompany(company);
}

// Update customer or vendor balance based on transaction
function updateBalance(transaction) {
    const company = getCurrentCompany();
    if (!company) return false;
    
    // Update customer balance
    if (transaction.customerId) {
        const customerIndex = company.customers.findIndex(c => c.id === transaction.customerId);
        if (customerIndex !== -1) {
            const customer = company.customers[customerIndex];
            customer.balance = customer.balance || 0;
            
            if (transaction.type === 'sale') {
                customer.balance += parseFloat(transaction.amount);
            } else if (transaction.type === 'payment') {
                customer.balance -= parseFloat(transaction.amount);
            }
            
            company.customers[customerIndex] = customer;
        }
    }
    
    // Update vendor balance
    if (transaction.vendorId) {
        const vendorIndex = company.vendors.findIndex(v => v.id === transaction.vendorId);
        if (vendorIndex !== -1) {
            const vendor = company.vendors[vendorIndex];
            vendor.balance = vendor.balance || 0;
            
            if (transaction.type === 'purchase') {
                vendor.balance += parseFloat(transaction.amount);
            } else if (transaction.type === 'payment') {
                vendor.balance -= parseFloat(transaction.amount);
            }
            
            company.vendors[vendorIndex] = vendor;
        }
    }
    
    return saveCompany(company);
}

// Get all inventory items for the current company
function getInventory() {
    const company = getCurrentCompany();
    return company ? company.inventory || [] : [];
}

// Add a new inventory item to the current company
function addInventoryItem(item) {
    const company = getCurrentCompany();
    if (!company) return false;
    
    // Generate a unique ID for the inventory item
    item.id = Date.now().toString();
    item.createdAt = new Date().toISOString();
    
    company.inventory = company.inventory || [];
    company.inventory.push(item);
    
    return saveCompany(company);
}

// Update inventory quantity based on sale or purchase
function updateInventoryQuantity(itemId, quantity, isAddition = true) {
    const company = getCurrentCompany();
    if (!company || !company.inventory) return false;
    
    const itemIndex = company.inventory.findIndex(item => item.id === itemId);
    if (itemIndex === -1) return false;
    
    const item = company.inventory[itemIndex];
    item.quantity = item.quantity || 0;
    
    if (isAddition) {
        item.quantity += parseFloat(quantity);
    } else {
        item.quantity -= parseFloat(quantity);
        if (item.quantity < 0) item.quantity = 0;
    }
    
    company.inventory[itemIndex] = item;
    
    return saveCompany(company);
}

// Get all invoices for the current company
function getInvoices() {
    const company = getCurrentCompany();
    return company ? company.invoices || [] : [];
}

// Add a new invoice to the current company
function addInvoice(invoice) {
    const company = getCurrentCompany();
    if (!company) return false;
    
    // Generate a unique ID and invoice number
    invoice.id = Date.now().toString();
    invoice.createdAt = new Date().toISOString();
    
    // Generate invoice number (format: INV-YYYY-XXXX)
    const year = new Date().getFullYear();
    const count = (company.invoices || []).length + 1;
    invoice.invoiceNumber = `INV-${year}-${count.toString().padStart(4, '0')}`;
    
    company.invoices = company.invoices || [];
    company.invoices.push(invoice);
    
    return saveCompany(company);
}

// Update invoice status (paid, partial, pending)
function updateInvoiceStatus(invoiceId, status, amountPaid = 0) {
    const company = getCurrentCompany();
    if (!company || !company.invoices) return false;
    
    const invoiceIndex = company.invoices.findIndex(inv => inv.id === invoiceId);
    if (invoiceIndex === -1) return false;
    
    const invoice = company.invoices[invoiceIndex];
    invoice.status = status;
    
    if (amountPaid > 0) {
        invoice.amountPaid = (invoice.amountPaid || 0) + parseFloat(amountPaid);
        
        // If fully paid, update status
        if (invoice.amountPaid >= invoice.totalAmount) {
            invoice.status = 'paid';
        } else if (invoice.amountPaid > 0) {
            invoice.status = 'partial';
        }
    }
    
    company.invoices[invoiceIndex] = invoice;
    
    return saveCompany(company);
}

// Export functionality to download company data as JSON
function exportCompanyData() {
    const company = getCurrentCompany();
    if (!company) return null;
    
    const dataStr = JSON.stringify(company, null, 2);
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
    
    // Create a link and trigger download
    const exportName = `${company.companyName.replace(/\s+/g, '_')}_data_${new Date().toISOString().split('T')[0]}.json`;
    
    return { dataUri, filename: exportName };
}

// Import company data from JSON
function importCompanyData(jsonData) {
    try {
        const data = JSON.parse(jsonData);
        
        // Validate data has minimum required fields
        if (!data.companyName || !data.id) {
            throw new Error('अमान्य कम्पनी डाटा ढाँचा');
        }
        
        // Check if company already exists
        const companies = getCompanies();
        const exists = companies.some(c => c.id === data.id);
        
        if (exists) {
            // Update existing company
            return saveCompany(data);
        } else {
            // Add as new company
            const currentUser = getCurrentUser();
            if (!currentUser) return false;
            
            // Set the current user as creator
            data.createdBy = currentUser.username;
            
            companies.push(data);
            localStorage.setItem('companies', JSON.stringify(companies));
            
            // Add to user's companies
            const userCompanies = getUserCompanies();
            userCompanies.push(data.id);
            localStorage.setItem(`companies_${currentUser.username}`, JSON.stringify(userCompanies));
            
            return true;
        }
    } catch (error) {
        console.error('Data import error:', error);
        return false;
    }
}

// Multi-currency management

// Convert amount from one currency to another
function convertCurrency(amount, fromCurrency, toCurrency) {
    // In a real application, this would use real-time exchange rates from an API
    // For now, we'll use hardcoded exchange rates
    const exchangeRates = {
        'NPR': { 'USD': 0.0075, 'EUR': 0.0070, 'INR': 0.62, 'GBP': 0.0060, 'JPY': 0.83, 'CNY': 0.053, 'AUD': 0.010 },
        'USD': { 'NPR': 133.33, 'EUR': 0.93, 'INR': 82.97, 'GBP': 0.80, 'JPY': 110.89, 'CNY': 7.08, 'AUD': 1.40 },
        'EUR': { 'NPR': 142.85, 'USD': 1.07, 'INR': 88.92, 'GBP': 0.86, 'JPY': 118.85, 'CNY': 7.59, 'AUD': 1.50 },
        'INR': { 'NPR': 1.61, 'USD': 0.012, 'EUR': 0.011, 'GBP': 0.0097, 'JPY': 1.34, 'CNY': 0.085, 'AUD': 0.017 },
        'GBP': { 'NPR': 166.67, 'USD': 1.25, 'EUR': 1.16, 'INR': 103.71, 'JPY': 138.61, 'CNY': 8.85, 'AUD': 1.75 },
        'JPY': { 'NPR': 1.20, 'USD': 0.0090, 'EUR': 0.0084, 'INR': 0.75, 'GBP': 0.0072, 'CNY': 0.064, 'AUD': 0.013 },
        'CNY': { 'NPR': 18.87, 'USD': 0.14, 'EUR': 0.13, 'INR': 11.72, 'GBP': 0.11, 'JPY': 15.66, 'AUD': 0.20 },
        'AUD': { 'NPR': 100.00, 'USD': 0.71, 'EUR': 0.67, 'INR': 59.27, 'GBP': 0.57, 'JPY': 78.31, 'CNY': 5.00 }
    };
    
    // If currencies are the same, return the original amount
    if (fromCurrency === toCurrency) {
        return amount;
    }
    
    // If exchange rate exists, convert the amount
    if (exchangeRates[fromCurrency] && exchangeRates[fromCurrency][toCurrency]) {
        return amount * exchangeRates[fromCurrency][toCurrency];
    }
    
    // If no direct exchange rate, convert via USD
    if (fromCurrency !== 'USD' && toCurrency !== 'USD') {
        const amountInUSD = amount * exchangeRates[fromCurrency]['USD'];
        return amountInUSD * exchangeRates['USD'][toCurrency];
    }
    
    // If all else fails, return the original amount
    console.error(`कन्भर्सन दर फेला परेन: ${fromCurrency} -> ${toCurrency}`);
    return amount;
}

// Get the exchange rate between two currencies
function getExchangeRate(fromCurrency, toCurrency) {
    return convertCurrency(1, fromCurrency, toCurrency);
}

// Tax management

// Calculate tax for a given amount and tax rules
function calculateTax(amount, taxRules = [], itemType = 'all') {
    const company = getCurrentCompany();
    if (!company) return { taxAmount: 0, taxDetails: [] };
    
    // Use default tax rate if no tax rules provided
    if (!taxRules || taxRules.length === 0) {
        const defaultTaxRate = company.taxRate || 0;
        return {
            taxAmount: (amount * defaultTaxRate) / 100,
            taxDetails: [
                { name: 'पूर्वनिर्धारित कर', rate: defaultTaxRate, amount: (amount * defaultTaxRate) / 100 }
            ]
        };
    }
    
    // Calculate tax based on provided tax rules
    let totalTaxAmount = 0;
    const taxDetails = [];
    
    taxRules.forEach(rule => {
        // Skip if rule doesn't apply to the item type
        if (rule.applicableFor !== 'all' && rule.applicableFor !== itemType) {
            return;
        }
        
        const ruleAmount = (amount * rule.rate) / 100;
        totalTaxAmount += ruleAmount;
        
        taxDetails.push({
            name: rule.name || 'कर',
            rate: rule.rate,
            amount: ruleAmount
        });
    });
    
    return {
        taxAmount: totalTaxAmount,
        taxDetails: taxDetails
    };
}

// Get tax data for a date range
function getTaxData(startDate, endDate) {
    const company = getCurrentCompany();
    if (!company) return { sales: [], purchases: [] };
    
    const salesInvoices = company.invoices || [];
    const purchaseInvoices = company.purchases || [];
    
    // Filter invoices by date range
    const filteredSalesInvoices = salesInvoices.filter(invoice => {
        const invoiceDate = new Date(invoice.date);
        return invoiceDate >= new Date(startDate) && invoiceDate <= new Date(endDate);
    });
    
    const filteredPurchaseInvoices = purchaseInvoices.filter(purchase => {
        const purchaseDate = new Date(purchase.date);
        return purchaseDate >= new Date(startDate) && purchaseDate <= new Date(endDate);
    });
    
    return {
        sales: filteredSalesInvoices,
        purchases: filteredPurchaseInvoices
    };
}

// Bank account management

// Get all bank accounts for the current company
function getBankAccounts() {
    const company = getCurrentCompany();
    return company ? company.bankAccounts || [] : [];
}

// Add a new bank account to the current company
function addBankAccount(account) {
    const company = getCurrentCompany();
    if (!company) return false;
    
    // Generate a unique ID for the account
    account.id = Date.now().toString();
    account.createdAt = new Date().toISOString();
    account.transactions = [];
    
    company.bankAccounts = company.bankAccounts || [];
    company.bankAccounts.push(account);
    
    return saveCompany(company);
}

// Update an existing bank account
function updateBankAccount(accountId, updatedData) {
    const company = getCurrentCompany();
    if (!company || !company.bankAccounts) return false;
    
    const index = company.bankAccounts.findIndex(a => a.id === accountId);
    if (index === -1) return false;
    
    // Merge account data
    company.bankAccounts[index] = { ...company.bankAccounts[index], ...updatedData };
    
    return saveCompany(company);
}

// Delete a bank account
function deleteBankAccount(accountId) {
    const company = getCurrentCompany();
    if (!company || !company.bankAccounts) return false;
    
    const initialLength = company.bankAccounts.length;
    company.bankAccounts = company.bankAccounts.filter(a => a.id !== accountId);
    
    if (company.bankAccounts.length < initialLength) {
        return saveCompany(company);
    }
    
    return false;
}

// Add a transaction to a bank account
function addBankTransaction(accountId, transaction) {
    const company = getCurrentCompany();
    if (!company || !company.bankAccounts) return false;
    
    const accountIndex = company.bankAccounts.findIndex(a => a.id === accountId);
    if (accountIndex === -1) return false;
    
    // Generate a unique ID for the transaction
    transaction.id = Date.now().toString();
    transaction.date = transaction.date || new Date().toISOString();
    
    // Initialize transactions array if it doesn't exist
    company.bankAccounts[accountIndex].transactions = company.bankAccounts[accountIndex].transactions || [];
    
    // Add the transaction
    company.bankAccounts[accountIndex].transactions.push(transaction);
    
    // Update account balance
    const account = company.bankAccounts[accountIndex];
    account.balance = account.balance || 0;
    
    if (transaction.type === 'deposit') {
        account.balance += parseFloat(transaction.amount);
    } else if (transaction.type === 'withdrawal') {
        account.balance -= parseFloat(transaction.amount);
    }
    
    return saveCompany(company);
}

// Get bank transactions for a date range
function getBankTransactions(accountId, startDate, endDate) {
    const company = getCurrentCompany();
    if (!company || !company.bankAccounts) return [];
    
    const account = company.bankAccounts.find(a => a.id === accountId);
    if (!account || !account.transactions) return [];
    
    // Filter transactions by date range
    return account.transactions.filter(transaction => {
        const transactionDate = new Date(transaction.date);
        return transactionDate >= new Date(startDate) && transactionDate <= new Date(endDate);
    });
}

// Reconcile bank account with transactions
function reconcileBankAccount(accountId, actualBalance, reconciliationDate) {
    const company = getCurrentCompany();
    if (!company || !company.bankAccounts) return { success: false, message: 'कम्पनी फेला परेन।' };
    
    const accountIndex = company.bankAccounts.findIndex(a => a.id === accountId);
    if (accountIndex === -1) return { success: false, message: 'खाता फेला परेन।' };
    
    const account = company.bankAccounts[accountIndex];
    const currentBalance = account.balance || 0;
    const difference = actualBalance - currentBalance;
    
    // Create a reconciliation transaction if there's a difference
    if (difference !== 0) {
        const transactionType = difference > 0 ? 'deposit' : 'withdrawal';
        const adjustmentTransaction = {
            id: Date.now().toString(),
            date: reconciliationDate || new Date().toISOString(),
            description: 'बैंक खाता रिकन्सिलेसन समायोजन',
            amount: Math.abs(difference),
            type: transactionType,
            category: 'adjustment',
            notes: 'स्वचालित रिकन्सिलेसन समायोजन'
        };
        
        account.transactions = account.transactions || [];
        account.transactions.push(adjustmentTransaction);
        account.balance = actualBalance;
        account.lastReconciled = reconciliationDate || new Date().toISOString();
        
        if (saveCompany(company)) {
            // Add to audit trail
            addAuditLog('bank_reconciliation', {
                accountId: accountId,
                accountName: account.name,
                previousBalance: currentBalance,
                newBalance: actualBalance,
                difference: difference,
                date: reconciliationDate
            });
            
            return {
                success: true,
                message: 'बैंक खाता सफलतापूर्वक रिकन्साइल गरियो।',
                transaction: adjustmentTransaction
            };
        }
    } else {
        // No difference, just update last reconciled date
        account.lastReconciled = reconciliationDate || new Date().toISOString();
        
        if (saveCompany(company)) {
            // Add to audit trail
            addAuditLog('bank_reconciliation', {
                accountId: accountId,
                accountName: account.name,
                previousBalance: currentBalance,
                newBalance: actualBalance,
                difference: 0,
                date: reconciliationDate
            });
            
            return {
                success: true,
                message: 'बैंक खाता सफलतापूर्वक रिकन्साइल गरियो। कुनै समायोजन आवश्यक छैन।'
            };
        }
    }
    
    return { success: false, message: 'रिकन्सिलेसन विफल भयो।' };
}

// Security and audit trail management

// Add an entry to the audit trail
function addAuditLog(action, details) {
    const company = getCurrentCompany();
    if (!company) return false;
    
    // If audit trail is disabled, don't log
    if (company.auditTrailEnabled === false) return true;
    
    company.auditTrail = company.auditTrail || [];
    
    const user = getCurrentUser();
    
    const logEntry = {
        timestamp: new Date().toISOString(),
        action: action,
        user: user ? user.username : 'system',
        details: details
    };
    
    company.auditTrail.push(logEntry);
    
    return saveCompany(company);
}

// Get audit log entries for a date range
function getAuditLogs(startDate, endDate, actionType = null) {
    const company = getCurrentCompany();
    if (!company || !company.auditTrail) return [];
    
    // Filter logs by date range and action type
    return company.auditTrail.filter(log => {
        const logDate = new Date(log.timestamp);
        const dateMatches = logDate >= new Date(startDate) && logDate <= new Date(endDate);
        
        // If no action type specified, return all logs in date range
        if (!actionType) return dateMatches;
        
        // Otherwise, filter by action type as well
        return dateMatches && log.action === actionType;
    });
}

// User roles and permissions

// Check if user has permission to perform an action
function hasPermission(username, action) {
    const company = getCurrentCompany();
    if (!company) return false;
    
    // Get the user's role
    const userRole = getUserRole(company.id, username);
    
    // Define permissions for each role
    const permissions = {
        'admin': ['read', 'write', 'delete', 'settings', 'users', 'reports'],
        'manager': ['read', 'write', 'reports', 'limited_settings'],
        'accountant': ['read', 'write', 'reports'],
        'viewer': ['read']
    };
    
    // If user is the company creator, they have all permissions
    if (company.createdBy === username) {
        return true;
    }
    
    // Check if user has the required permission based on their role
    return permissions[userRole] && permissions[userRole].includes(action);
}

// Get user role for a company
function getUserRole(companyId, username) {
    // In a real app, this would be stored in a database
    // For now, we'll mock it
    
    // Default to viewer role
    const roles = {
        'admin': 'admin',
        'manager': 'manager',
        'accountant': 'accountant'
    };
    
    return roles[username] || 'viewer';
}

// Recurring transactions

// Get all recurring transactions
function getRecurringTransactions() {
    const company = getCurrentCompany();
    return company ? company.recurringTransactions || [] : [];
}

// Add a recurring transaction
function addRecurringTransaction(transaction) {
    const company = getCurrentCompany();
    if (!company) return false;
    
    // Generate a unique ID
    transaction.id = Date.now().toString();
    transaction.createdAt = new Date().toISOString();
    
    // Initialize recurring transactions array if needed
    company.recurringTransactions = company.recurringTransactions || [];
    
    // Add the transaction
    company.recurringTransactions.push(transaction);
    
    return saveCompany(company);
}

// Process due recurring transactions
function processRecurringTransactions() {
    const company = getCurrentCompany();
    if (!company || !company.recurringTransactions) return { processed: 0, transactions: [] };
    
    const now = new Date();
    const processedTransactions = [];
    
    company.recurringTransactions.forEach(recurringTx => {
        // Skip if not active
        if (recurringTx.active === false) return;
        
        // Check if transaction is due
        const lastExecution = recurringTx.lastExecuted ? new Date(recurringTx.lastExecuted) : null;
        let isDue = false;
        
        if (!lastExecution) {
            // If never executed, check if start date has passed
            isDue = new Date(recurringTx.startDate) <= now;
        } else {
            // Calculate next execution date based on frequency
            const nextExecutionDate = new Date(lastExecution);
            
            switch (recurringTx.frequency) {
                case 'daily':
                    nextExecutionDate.setDate(nextExecutionDate.getDate() + 1);
                    break;
                case 'weekly':
                    nextExecutionDate.setDate(nextExecutionDate.getDate() + 7);
                    break;
                case 'monthly':
                    nextExecutionDate.setMonth(nextExecutionDate.getMonth() + 1);
                    break;
                case 'quarterly':
                    nextExecutionDate.setMonth(nextExecutionDate.getMonth() + 3);
                    break;
                case 'yearly':
                    nextExecutionDate.setFullYear(nextExecutionDate.getFullYear() + 1);
                    break;
                default:
                    // Invalid frequency
                    return;
            }
            
            isDue = nextExecutionDate <= now;
        }
        
        // Process transaction if due
        if (isDue) {
            // Create a new transaction based on the recurring one
            const newTransaction = {
                ...recurringTx.transactionData,
                id: Date.now().toString(),
                date: now.toISOString(),
                createdAt: now.toISOString(),
                recurringTransactionId: recurringTx.id
            };
            
            // Add the transaction
            if (newTransaction.type === 'invoice') {
                addInvoice(newTransaction);
            } else {
                addTransaction(newTransaction);
            }
            
            // Update last executed date
            recurringTx.lastExecuted = now.toISOString();
            recurringTx.executionCount = (recurringTx.executionCount || 0) + 1;
            
            // Check if maximum executions reached
            if (recurringTx.maxExecutions && recurringTx.executionCount >= recurringTx.maxExecutions) {
                recurringTx.active = false;
            }
            
            processedTransactions.push(newTransaction);
            
            // Add to audit trail
            addAuditLog('recurring_transaction_executed', {
                recurringTransactionId: recurringTx.id,
                transactionId: newTransaction.id,
                description: recurringTx.description,
                amount: newTransaction.amount
            });
        }
    });
    
    // Save changes
    saveCompany(company);
    
    return {
        processed: processedTransactions.length,
        transactions: processedTransactions
    };
}

/**
 * कम्पनी डाटा लोड गर्ने
 */
function loadCompanyData() {
    const companies = JSON.parse(localStorage.getItem('companies')) || [];
    
    if (companies.length > 0) {
        populateCompanyDropdown(companies);
        
        // चेक गर्ने कि के हालको कम्पनी सेट छ
        let currentCompany = localStorage.getItem('currentCompany');
        
        if (!currentCompany && companies.length > 0) {
            // यदि हालको कम्पनी सेट छैन भने, पहिलो कम्पनी प्रयोग गर्ने
            currentCompany = JSON.stringify(companies[0]);
            localStorage.setItem('currentCompany', currentCompany);
        }
        
        if (currentCompany) {
            const companyData = JSON.parse(currentCompany);
            // यहाँ UI मा कम्पनी नाम प्रदर्शन गर्ने लजिक थप्ने (अब app.js मा छ)
        }
    }
}

/**
 * कम्पनी ड्रपडाउन मेनु पोपुलेट गर्ने
 * @param {Array} companies कम्पनीहरूको सुची
 */
function populateCompanyDropdown(companies) {
    const dropdownMenu = document.getElementById('companyDropdownMenu');
    
    if (dropdownMenu) {
        // अन्तिम २ आईटमहरू बाहेक सबै हटाउने (नयाँ कम्पनी र डिभाइडर)
        while (dropdownMenu.children.length > 2) {
            dropdownMenu.removeChild(dropdownMenu.firstChild);
        }
        
        // नयाँ कम्पनीहरू थप्ने
        companies.forEach(company => {
            const listItem = document.createElement('li');
            const link = document.createElement('a');
            link.className = 'dropdown-item';
            link.href = '#';
            link.innerHTML = `<i class="fas fa-building me-2"></i> ${company.name}`;
            link.dataset.companyId = company.id;
            
            link.addEventListener('click', function(e) {
                e.preventDefault();
                switchCompany(company);
            });
            
            listItem.appendChild(link);
            // डिभाइडर र 'नयाँ कम्पनी थप्नुहोस्' भन्दा अघि थप्ने
            dropdownMenu.insertBefore(listItem, dropdownMenu.children[dropdownMenu.children.length - 2]);
        });
    }
}

/**
 * कम्पनी स्विच गर्ने
 * @param {Object} company स्विच गर्ने कम्पनी
 */
function switchCompany(company) {
    localStorage.setItem('currentCompany', JSON.stringify(company));
    // पृष्ठ रिलोड गर्ने
    location.reload();
}

// आवश्यक फंक्शनहरू ग्लोबल भेरिएबलमा एक्सपोर्ट गर्ने
window.loadCompanyData = loadCompanyData; 