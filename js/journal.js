// Journal Entry Management

// DOM Elements
const journalTableBody = document.getElementById('journalTableBody');
const addJournalEntryBtn = document.getElementById('addJournalEntryBtn');
const journalEntryModal = document.getElementById('journalEntryModal');
const journalEntryModalTitle = document.getElementById('journalEntryModalTitle');
const closeJournalEntryModal = document.getElementById('closeJournalEntryModal');
const journalEntryForm = document.getElementById('journalEntryForm');
const journalEntryAlert = document.getElementById('journalEntryAlert');
const saveAsDraftBtn = document.getElementById('saveAsDraftBtn');
const saveAndPostBtn = document.getElementById('saveAndPostBtn');
const cancelJournalEntryBtn = document.getElementById('cancelJournalEntryBtn');

// Form Elements
const journalEntryId = document.getElementById('journalEntryId');
const journalDate = document.getElementById('journalDate');
const journalReference = document.getElementById('journalReference');
const journalDescription = document.getElementById('journalDescription');
const lineItemsTableBody = document.getElementById('lineItemsTableBody');
const addLineItemBtn = document.getElementById('addLineItemBtn');
const journalNotes = document.getElementById('journalNotes');

// View Modal Elements
const viewJournalEntryModal = document.getElementById('viewJournalEntryModal');
const closeViewJournalEntryModal = document.getElementById('closeViewJournalEntryModal');
const viewJournalDate = document.getElementById('viewJournalDate');
const viewJournalReference = document.getElementById('viewJournalReference');
const viewJournalDescription = document.getElementById('viewJournalDescription');
const viewJournalStatus = document.getElementById('viewJournalStatus');
const viewJournalNotes = document.getElementById('viewJournalNotes');
const viewLineItemsTableBody = document.getElementById('viewLineItemsTableBody');
const closeViewModalBtn = document.getElementById('closeViewModalBtn');

// Filter Elements
const filterStartDate = document.getElementById('filterStartDate');
const filterEndDate = document.getElementById('filterEndDate');
const filterReference = document.getElementById('filterReference');
const applyFilterBtn = document.getElementById('applyFilterBtn');

// Current edit mode
let isEditMode = false;
let currentJournalEntry = null;

// Chart of accounts
const chartOfAccounts = [
    { id: 'asset-cash', name: 'नगद', type: 'asset' },
    { id: 'asset-bank', name: 'बैंक', type: 'asset' },
    { id: 'asset-accounts-receivable', name: 'प्राप्य खाता', type: 'asset' },
    { id: 'asset-inventory', name: 'मालसामान', type: 'asset' },
    { id: 'asset-fixed-assets', name: 'स्थिर सम्पत्ति', type: 'asset' },
    { id: 'liability-accounts-payable', name: 'भुक्तानी गर्नुपर्ने खाता', type: 'liability' },
    { id: 'liability-loans', name: 'ऋण', type: 'liability' },
    { id: 'equity-capital', name: 'पूँजी', type: 'equity' },
    { id: 'equity-retained-earnings', name: 'संचित आय', type: 'equity' },
    { id: 'income-sales', name: 'बिक्री', type: 'income' },
    { id: 'income-service-revenue', name: 'सेवा आम्दानी', type: 'income' },
    { id: 'income-other', name: 'अन्य आम्दानी', type: 'income' },
    { id: 'expense-cost-of-goods', name: 'बिक्री लागत', type: 'expense' },
    { id: 'expense-salaries', name: 'तलब', type: 'expense' },
    { id: 'expense-rent', name: 'भाडा', type: 'expense' },
    { id: 'expense-utilities', name: 'उपयोगिता', type: 'expense' },
    { id: 'expense-other', name: 'अन्य खर्च', type: 'expense' }
];

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
        'posted': 'पोस्ट गरिएको'
    };
    return statusNames[status] || status;
}

// Generate journal reference number
function generateJournalReference() {
    const company = getCurrentCompany();
    if (!company) return '';
    
    const prefix = 'JE';
    const date = new Date();
    const year = date.getFullYear().toString().substr(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    
    // Get existing journal entries and find the last number
    const entries = getJournalEntries();
    let maxNum = 0;
    
    entries.forEach(entry => {
        if (entry.reference && entry.reference.startsWith(prefix)) {
            const parts = entry.reference.split('-');
            if (parts.length === 4) {
                const num = parseInt(parts[3]);
                if (!isNaN(num) && num > maxNum) {
                    maxNum = num;
                }
            }
        }
    });
    
    const nextNum = (maxNum + 1).toString().padStart(4, '0');
    return `${prefix}-${year}${month}-${company.id}-${nextNum}`;
}

// Get account name by ID
function getAccountName(accountId) {
    const account = chartOfAccounts.find(acc => acc.id === accountId);
    return account ? account.name : accountId;
}

// Add line item row to table
function addLineItemRow(item = {}) {
    const row = document.createElement('tr');
    row.innerHTML = `
        <td>
            <select class="form-control account-select" required>
                <option value="">खाता छान्नुहोस्...</option>
                ${chartOfAccounts.map(acc => `
                    <option value="${acc.id}" ${item.accountId === acc.id ? 'selected' : ''}>
                        ${acc.name}
                    </option>
                `).join('')}
            </select>
        </td>
        <td>
            <input type="text" class="form-control item-description" value="${item.description || ''}">
        </td>
        <td>
            <input type="number" class="form-control item-debit" value="${item.debit || ''}" min="0" step="0.01">
        </td>
        <td>
            <input type="number" class="form-control item-credit" value="${item.credit || ''}" min="0" step="0.01">
        </td>
        <td>
            <button type="button" class="btn btn-sm btn-danger delete-item">
                <i class="fas fa-trash"></i>
            </button>
        </td>
    `;
    
    lineItemsTableBody.appendChild(row);
    
    // Add event listeners for calculations
    const debitInput = row.querySelector('.item-debit');
    const creditInput = row.querySelector('.item-credit');
    
    debitInput.addEventListener('input', () => {
        if (debitInput.value && parseFloat(debitInput.value) > 0) {
            creditInput.value = '';
            creditInput.disabled = true;
        } else {
            creditInput.disabled = false;
        }
        calculateTotals();
    });
    
    creditInput.addEventListener('input', () => {
        if (creditInput.value && parseFloat(creditInput.value) > 0) {
            debitInput.value = '';
            debitInput.disabled = true;
        } else {
            debitInput.disabled = false;
        }
        calculateTotals();
    });
    
    // Delete button event listener
    row.querySelector('.delete-item').addEventListener('click', () => {
        row.remove();
        calculateTotals();
    });
    
    calculateTotals();
}

// Calculate totals
function calculateTotals() {
    let totalDebit = 0;
    let totalCredit = 0;
    
    const rows = lineItemsTableBody.querySelectorAll('tr');
    rows.forEach(row => {
        const debitValue = parseFloat(row.querySelector('.item-debit').value) || 0;
        const creditValue = parseFloat(row.querySelector('.item-credit').value) || 0;
        
        totalDebit += debitValue;
        totalCredit += creditValue;
    });
    
    document.getElementById('totalDebit').textContent = formatCurrency(totalDebit);
    document.getElementById('totalCredit').textContent = formatCurrency(totalCredit);
    
    const difference = Math.abs(totalDebit - totalCredit);
    const differenceElement = document.getElementById('difference');
    differenceElement.textContent = formatCurrency(difference);
    
    // Highlight difference if not zero
    if (difference > 0.01) {
        differenceElement.classList.add('text-danger');
    } else {
        differenceElement.classList.remove('text-danger');
    }
}

// Open journal entry modal in add mode
function openAddJournalEntryModal() {
    isEditMode = false;
    currentJournalEntry = null;
    
    journalEntryModalTitle.textContent = 'नयाँ जर्नल इन्ट्री';
    
    // Reset form
    journalEntryForm.reset();
    lineItemsTableBody.innerHTML = '';
    
    // Set default date to today
    journalDate.value = new Date().toISOString().split('T')[0];
    
    // Generate reference number
    journalReference.value = generateJournalReference();
    
    // Add two empty line items (debit and credit)
    addLineItemRow();
    addLineItemRow();
    
    journalEntryModal.style.display = 'block';
}

// Open journal entry modal in edit mode
function openEditJournalEntryModal(entry) {
    if (entry.status === 'posted') {
        showAlert(journalEntryAlert, 'पोस्ट गरिएको प्रविष्टि सम्पादन गर्न सकिँदैन।');
        return;
    }
    
    isEditMode = true;
    currentJournalEntry = entry;
    
    journalEntryModalTitle.textContent = 'जर्नल इन्ट्री सम्पादन';
    
    // Fill form with entry data
    journalEntryId.value = entry.id;
    journalDate.value = entry.date;
    journalReference.value = entry.reference;
    journalDescription.value = entry.description;
    journalNotes.value = entry.notes || '';
    
    // Clear and populate line items
    lineItemsTableBody.innerHTML = '';
    entry.lineItems.forEach(item => addLineItemRow(item));
    
    journalEntryModal.style.display = 'block';
}

// Open view journal entry modal
function openViewJournalEntryModal(entry) {
    // Fill the view modal with entry data
    viewJournalDate.textContent = formatDate(entry.date);
    viewJournalReference.textContent = entry.reference;
    viewJournalDescription.textContent = entry.description;
    viewJournalStatus.textContent = getStatusName(entry.status);
    viewJournalNotes.textContent = entry.notes || '-';
    
    // Calculate totals
    let totalDebit = 0;
    let totalCredit = 0;
    
    // Populate line items
    viewLineItemsTableBody.innerHTML = '';
    entry.lineItems.forEach(item => {
        const row = document.createElement('tr');
        
        totalDebit += parseFloat(item.debit || 0);
        totalCredit += parseFloat(item.credit || 0);
        
        row.innerHTML = `
            <td>${getAccountName(item.accountId)}</td>
            <td>${item.description || '-'}</td>
            <td>${formatCurrency(item.debit || 0)}</td>
            <td>${formatCurrency(item.credit || 0)}</td>
        `;
        
        viewLineItemsTableBody.appendChild(row);
    });
    
    // Set totals
    document.getElementById('viewTotalDebit').textContent = formatCurrency(totalDebit);
    document.getElementById('viewTotalCredit').textContent = formatCurrency(totalCredit);
    
    viewJournalEntryModal.style.display = 'block';
}

// Close journal entry modal
function closeJournalEntryModal() {
    journalEntryModal.style.display = 'none';
    journalEntryForm.reset();
    lineItemsTableBody.innerHTML = '';
    journalEntryAlert.classList.add('hidden');
}

// Close view journal entry modal
function closeViewJournalEntryModal() {
    viewJournalEntryModal.style.display = 'none';
}

// Save journal entry
function saveJournalEntry(status = 'draft') {
    // Validate required fields
    if (!journalDate.value) {
        showAlert(journalEntryAlert, 'मिति आवश्यक छ।');
        return false;
    }
    
    if (!journalDescription.value.trim()) {
        showAlert(journalEntryAlert, 'विवरण आवश्यक छ।');
        return false;
    }
    
    // Get line items
    const lineItems = [];
    const rows = lineItemsTableBody.querySelectorAll('tr');
    
    if (rows.length < 2) {
        showAlert(journalEntryAlert, 'कम्तिमा दुई लाइन आइटम आवश्यक छन्।');
        return false;
    }
    
    for (const row of rows) {
        const accountSelect = row.querySelector('.account-select');
        if (!accountSelect.value) {
            showAlert(journalEntryAlert, 'सबै लाइन आइटमको लागि खाता चयन गर्नुहोस्।');
            return false;
        }
        
        const debitInput = row.querySelector('.item-debit');
        const creditInput = row.querySelector('.item-credit');
        const debitValue = parseFloat(debitInput.value) || 0;
        const creditValue = parseFloat(creditInput.value) || 0;
        
        if (debitValue === 0 && creditValue === 0) {
            showAlert(journalEntryAlert, 'प्रत्येक लाइन आइटममा डेबिट वा क्रेडिट रकम हुनुपर्छ।');
            return false;
        }
        
        lineItems.push({
            accountId: accountSelect.value,
            description: row.querySelector('.item-description').value.trim(),
            debit: debitValue,
            credit: creditValue
        });
    }
    
    // Verify that debits equal credits
    let totalDebit = 0;
    let totalCredit = 0;
    
    lineItems.forEach(item => {
        totalDebit += item.debit;
        totalCredit += item.credit;
    });
    
    if (Math.abs(totalDebit - totalCredit) > 0.01) {
        showAlert(journalEntryAlert, 'डेबिट र क्रेडिट कुल बराबर हुनुपर्छ।');
        return false;
    }
    
    // Prepare journal entry data
    const journalEntry = {
        date: journalDate.value,
        reference: journalReference.value,
        description: journalDescription.value.trim(),
        lineItems,
        notes: journalNotes.value.trim(),
        status
    };
    
    let success = false;
    
    if (isEditMode) {
        journalEntry.id = journalEntryId.value;
        success = updateJournalEntry(journalEntry.id, journalEntry);
        if (success) {
            showAlert(journalEntryAlert, 'जर्नल इन्ट्री सफलतापूर्वक अद्यावधिक गरियो!', 'success');
        } else {
            showAlert(journalEntryAlert, 'जर्नल इन्ट्री अद्यावधिक गर्न समस्या भयो।');
            return false;
        }
    } else {
        success = addJournalEntry(journalEntry);
        if (success) {
            showAlert(journalEntryAlert, 'जर्नल इन्ट्री सफलतापूर्वक थपियो!', 'success');
        } else {
            showAlert(journalEntryAlert, 'जर्नल इन्ट्री थप्न समस्या भयो।');
            return false;
        }
    }
    
    // Close modal and reload table after delay
    setTimeout(() => {
        closeJournalEntryModal();
        loadJournalEntries();
    }, 1500);
    
    return true;
}

// Filter journal entries
function filterJournalEntries() {
    const startDate = filterStartDate.value;
    const endDate = filterEndDate.value;
    const reference = filterReference.value.trim().toLowerCase();
    
    let entries = getJournalEntries();
    
    // Apply filters
    if (startDate) {
        entries = entries.filter(entry => entry.date >= startDate);
    }
    
    if (endDate) {
        entries = entries.filter(entry => entry.date <= endDate);
    }
    
    if (reference) {
        entries = entries.filter(entry => 
            entry.reference.toLowerCase().includes(reference)
        );
    }
    
    updateJournalTable(entries);
}

// Update journal table
function updateJournalTable(entries) {
    const company = getCurrentCompany();
    const currency = company ? company.currency : 'NPR';
    
    journalTableBody.innerHTML = '';
    
    if (entries.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = '<td colspan="8" class="text-center">कुनै जर्नल इन्ट्रीहरू छैनन्।</td>';
        journalTableBody.appendChild(row);
        return;
    }
    
    // Sort entries by date (newest first)
    entries.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    entries.forEach(entry => {
        const row = document.createElement('tr');
        
        // Calculate totals
        let totalDebit = 0;
        let totalCredit = 0;
        
        entry.lineItems.forEach(item => {
            totalDebit += parseFloat(item.debit || 0);
            totalCredit += parseFloat(item.credit || 0);
        });
        
        row.innerHTML = `
            <td>${formatDate(entry.date)}</td>
            <td>${entry.reference}</td>
            <td>${entry.description}</td>
            <td>${entry.notes || '-'}</td>
            <td>${formatCurrency(totalDebit, currency)}</td>
            <td>${formatCurrency(totalCredit, currency)}</td>
            <td><span class="status-badge ${entry.status}">${getStatusName(entry.status)}</span></td>
            <td>
                <button class="btn btn-sm view-btn" data-id="${entry.id}" title="हेर्नुहोस्">
                    <i class="fas fa-eye"></i>
                </button>
                ${entry.status === 'draft' ? `
                    <button class="btn btn-sm edit-btn" data-id="${entry.id}" title="सम्पादन">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm delete-btn" data-id="${entry.id}" title="मेटाउनुहोस्">
                        <i class="fas fa-trash"></i>
                    </button>
                ` : ''}
            </td>
        `;
        
        journalTableBody.appendChild(row);
    });
    
    // Add event listeners to buttons
    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const entry = entries.find(e => e.id === btn.dataset.id);
            if (entry) openViewJournalEntryModal(entry);
        });
    });
    
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const entry = entries.find(e => e.id === btn.dataset.id);
            if (entry) openEditJournalEntryModal(entry);
        });
    });
    
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            if (confirm('के तपाईं यो जर्नल इन्ट्री मेटाउन निश्चित हुनुहुन्छ?')) {
                const success = deleteJournalEntry(btn.dataset.id);
                if (success) {
                    loadJournalEntries();
                } else {
                    alert('जर्नल इन्ट्री मेटाउन समस्या भयो।');
                }
            }
        });
    });
}

// Load journal entries
function loadJournalEntries() {
    const entries = getJournalEntries();
    updateJournalTable(entries);
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    // Load journal entries
    loadJournalEntries();
    
    // Add journal entry button
    if (addJournalEntryBtn) {
        addJournalEntryBtn.addEventListener('click', openAddJournalEntryModal);
    }
    
    // Add line item button
    if (addLineItemBtn) {
        addLineItemBtn.addEventListener('click', () => addLineItemRow());
    }
    
    // Save buttons
    if (saveAsDraftBtn) {
        saveAsDraftBtn.addEventListener('click', () => saveJournalEntry('draft'));
    }
    
    if (saveAndPostBtn) {
        saveAndPostBtn.addEventListener('click', () => saveJournalEntry('posted'));
    }
    
    // Cancel buttons
    if (cancelJournalEntryBtn) {
        cancelJournalEntryBtn.addEventListener('click', closeJournalEntryModal);
    }
    
    // Close modal buttons
    if (closeJournalEntryModal) {
        closeJournalEntryModal.addEventListener('click', closeJournalEntryModal);
    }
    
    if (closeViewJournalEntryModal) {
        closeViewJournalEntryModal.addEventListener('click', closeViewJournalEntryModal);
    }
    
    if (closeViewModalBtn) {
        closeViewModalBtn.addEventListener('click', closeViewJournalEntryModal);
    }
    
    // Filter button
    if (applyFilterBtn) {
        applyFilterBtn.addEventListener('click', filterJournalEntries);
    }
    
    // Window click to close modals
    window.addEventListener('click', (e) => {
        if (e.target === journalEntryModal) {
            closeJournalEntryModal();
        }
        if (e.target === viewJournalEntryModal) {
            closeViewJournalEntryModal();
        }
    });
});