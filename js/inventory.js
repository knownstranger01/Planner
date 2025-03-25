// Inventory Management

// DOM Elements
const inventoryTableBody = document.getElementById('inventoryTableBody');
const addItemBtn = document.getElementById('addItemBtn');
const stockAdjustmentBtn = document.getElementById('stockAdjustmentBtn');
const itemModal = document.getElementById('itemModal');
const itemModalTitle = document.getElementById('itemModalTitle');
const closeItemModal = document.getElementById('closeItemModal');
const itemForm = document.getElementById('itemForm');
const itemAlert = document.getElementById('itemAlert');
const saveItemBtn = document.getElementById('saveItemBtn');
const cancelItemBtn = document.getElementById('cancelItemBtn');

// Stock Adjustment Modal Elements
const stockAdjustmentModal = document.getElementById('stockAdjustmentModal');
const closeStockAdjustmentModal = document.getElementById('closeStockAdjustmentModal');
const stockAdjustmentForm = document.getElementById('stockAdjustmentForm');
const stockAdjustmentAlert = document.getElementById('stockAdjustmentAlert');
const saveAdjustmentBtn = document.getElementById('saveAdjustmentBtn');
const cancelAdjustmentBtn = document.getElementById('cancelAdjustmentBtn');
const adjustmentItem = document.getElementById('adjustmentItem');

// Item Details Modal Elements
const itemDetailsModal = document.getElementById('itemDetailsModal');
const closeItemDetailsModal = document.getElementById('closeItemDetailsModal');
const closeItemDetailsBtn = document.getElementById('closeItemDetailsBtn');
const viewItemCode = document.getElementById('viewItemCode');
const viewItemName = document.getElementById('viewItemName');
const viewItemCategory = document.getElementById('viewItemCategory');
const viewItemDescription = document.getElementById('viewItemDescription');
const viewItemUnit = document.getElementById('viewItemUnit');
const viewItemPurchasePrice = document.getElementById('viewItemPurchasePrice');
const viewItemSalePrice = document.getElementById('viewItemSalePrice');
const viewItemQuantity = document.getElementById('viewItemQuantity');
const viewItemReorderLevel = document.getElementById('viewItemReorderLevel');
const viewItemStockValue = document.getElementById('viewItemStockValue');
const stockHistoryTableBody = document.getElementById('stockHistoryTableBody');

// Form Elements
const itemId = document.getElementById('itemId');
const itemCode = document.getElementById('itemCode');
const itemName = document.getElementById('itemName');
const itemCategory = document.getElementById('itemCategory');
const itemUnit = document.getElementById('itemUnit');
const itemPurchasePrice = document.getElementById('itemPurchasePrice');
const itemSalePrice = document.getElementById('itemSalePrice');
const itemQuantity = document.getElementById('itemQuantity');
const itemReorderLevel = document.getElementById('itemReorderLevel');
const itemDescription = document.getElementById('itemDescription');

// Filter Elements
const searchItem = document.getElementById('searchItem');
const filterCategory = document.getElementById('filterCategory');
const filterStock = document.getElementById('filterStock');
const applyFilterBtn = document.getElementById('applyFilterBtn');

// Current edit mode
let isEditMode = false;
let currentItem = null;

// Item categories
const itemCategories = [
    { id: 'raw-materials', name: 'कच्चा पदार्थ' },
    { id: 'finished-goods', name: 'तयारी सामान' },
    { id: 'packaging', name: 'प्याकेजिङ सामग्री' },
    { id: 'consumables', name: 'उपभोग्य वस्तु' },
    { id: 'office-supplies', name: 'कार्यालय सामग्री' },
    { id: 'electronics', name: 'इलेक्ट्रोनिक्स' },
    { id: 'furniture', name: 'फर्निचर' },
    { id: 'others', name: 'अन्य' }
];

// Unit names
const unitNames = {
    'piece': 'थान',
    'kg': 'केजी',
    'gram': 'ग्राम',
    'liter': 'लिटर',
    'meter': 'मिटर',
    'box': 'बाकस',
    'package': 'प्याकेज',
    'other': 'अन्य'
};

// Adjustment types
const adjustmentTypes = {
    'add': 'थप',
    'subtract': 'घटी',
    'set': 'सेट',
    'purchase': 'खरिद',
    'sale': 'बिक्री',
    'return': 'फिर्ता'
};

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

// Get category name by ID
function getCategoryName(categoryId) {
    const category = itemCategories.find(cat => cat.id === categoryId);
    return category ? category.name : '';
}

// Get unit name
function getUnitName(unitCode) {
    return unitNames[unitCode] || unitCode;
}

// Get adjustment type name
function getAdjustmentTypeName(type) {
    return adjustmentTypes[type] || type;
}

// Generate item code
function generateItemCode() {
    const company = getCurrentCompany();
    if (!company) return '';
    
    const prefix = 'ITM';
    
    // Get existing items and find the last number
    const items = getInventoryItems();
    let maxNum = 0;
    
    items.forEach(item => {
        if (item.code && item.code.startsWith(prefix)) {
            const num = parseInt(item.code.substring(prefix.length));
            if (!isNaN(num) && num > maxNum) {
                maxNum = num;
            }
        }
    });
    
    const nextNum = (maxNum + 1).toString().padStart(4, '0');
    return `${prefix}${nextNum}`;
}

// Populate category dropdowns
function populateCategories() {
    // Populate filter dropdown
    const filterSelect = document.getElementById('filterCategory');
    if (filterSelect) {
        itemCategories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.id;
            option.textContent = category.name;
            filterSelect.appendChild(option);
        });
    }
    
    // Populate item form dropdown
    const formSelect = document.getElementById('itemCategory');
    if (formSelect) {
        itemCategories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.id;
            option.textContent = category.name;
            formSelect.appendChild(option);
        });
    }
}

// Populate items dropdown for adjustment
function populateItemsDropdown() {
    const items = getInventoryItems();
    
    adjustmentItem.innerHTML = '<option value="">सामान छान्नुहोस्</option>';
    
    items.forEach(item => {
        const option = document.createElement('option');
        option.value = item.id;
        option.textContent = `${item.code} - ${item.name} (स्टक: ${item.quantity} ${getUnitName(item.unit)})`;
        adjustmentItem.appendChild(option);
    });
}

// Open item modal in add mode
function openAddItemModal() {
    isEditMode = false;
    currentItem = null;
    
    itemModalTitle.textContent = 'नयाँ सामान थप्नुहोस्';
    
    // Reset form
    itemForm.reset();
    itemId.value = '';
    
    // Generate item code
    itemCode.value = generateItemCode();
    
    // Default values
    itemQuantity.value = 0;
    itemReorderLevel.value = 5;
    
    itemModal.style.display = 'block';
}

// Open item modal in edit mode
function openEditItemModal(item) {
    isEditMode = true;
    currentItem = item;
    
    itemModalTitle.textContent = 'सामान सम्पादन';
    
    // Fill form with item data
    itemId.value = item.id;
    itemCode.value = item.code;
    itemName.value = item.name;
    itemCategory.value = item.category || '';
    itemUnit.value = item.unit;
    itemPurchasePrice.value = item.purchasePrice;
    itemSalePrice.value = item.salePrice;
    itemQuantity.value = item.quantity;
    itemReorderLevel.value = item.reorderLevel;
    itemDescription.value = item.description || '';
    
    itemModal.style.display = 'block';
}

// Open item details modal
function openItemDetailsModal(item) {
    const company = getCurrentCompany();
    const currency = company ? company.currency : 'NPR';
    
    // Fill the view modal with item data
    viewItemCode.textContent = item.code;
    viewItemName.textContent = item.name;
    viewItemCategory.textContent = getCategoryName(item.category);
    viewItemDescription.textContent = item.description || '-';
    viewItemUnit.textContent = getUnitName(item.unit);
    viewItemPurchasePrice.textContent = formatCurrency(item.purchasePrice, currency);
    viewItemSalePrice.textContent = formatCurrency(item.salePrice, currency);
    viewItemQuantity.textContent = `${item.quantity} ${getUnitName(item.unit)}`;
    viewItemReorderLevel.textContent = item.reorderLevel;
    viewItemStockValue.textContent = formatCurrency(item.quantity * item.purchasePrice, currency);
    
    // Populate stock history
    populateStockHistory(item.id);
    
    itemDetailsModal.style.display = 'block';
}

// Populate stock history
function populateStockHistory(itemId) {
    const adjustments = getStockAdjustments(itemId);
    const company = getCurrentCompany();
    
    stockHistoryTableBody.innerHTML = '';
    
    if (!adjustments || adjustments.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = '<td colspan="4" class="text-center">कुनै स्टक इतिहास छैन।</td>';
        stockHistoryTableBody.appendChild(row);
        return;
    }
    
    // Sort adjustments by date (newest first)
    adjustments.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    adjustments.forEach(adjustment => {
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td>${formatDate(adjustment.date)}</td>
            <td>${getAdjustmentTypeName(adjustment.type)}</td>
            <td>${adjustment.quantity}</td>
            <td>${adjustment.reason || '-'}</td>
        `;
        
        stockHistoryTableBody.appendChild(row);
    });
}

// Open stock adjustment modal
function openStockAdjustmentModal() {
    // Reset form
    stockAdjustmentForm.reset();
    
    // Populate items dropdown
    populateItemsDropdown();
    
    stockAdjustmentModal.style.display = 'block';
}

// Close item modal
function closeItemModal() {
    itemModal.style.display = 'none';
    itemForm.reset();
    itemAlert.classList.add('hidden');
}

// Close stock adjustment modal
function closeStockAdjustmentModal() {
    stockAdjustmentModal.style.display = 'none';
    stockAdjustmentForm.reset();
    stockAdjustmentAlert.classList.add('hidden');
}

// Close item details modal
function closeItemDetailsModal() {
    itemDetailsModal.style.display = 'none';
}

// Save item
function saveItem() {
    // Validate required fields
    if (!itemCode.value.trim()) {
        showAlert(itemAlert, 'सामान कोड आवश्यक छ।');
        return false;
    }
    
    if (!itemName.value.trim()) {
        showAlert(itemAlert, 'सामानको नाम आवश्यक छ।');
        return false;
    }
    
    if (!itemUnit.value) {
        showAlert(itemAlert, 'एकाइ आवश्यक छ।');
        return false;
    }
    
    if (!itemPurchasePrice.value || parseFloat(itemPurchasePrice.value) < 0) {
        showAlert(itemAlert, 'मान्य खरिद मूल्य प्रविष्ट गर्नुहोस्।');
        return false;
    }
    
    if (!itemSalePrice.value || parseFloat(itemSalePrice.value) < 0) {
        showAlert(itemAlert, 'मान्य बिक्री मूल्य प्रविष्ट गर्नुहोस्।');
        return false;
    }
    
    // Check for duplicate code if adding new item
    if (!isEditMode) {
        const existingItems = getInventoryItems();
        const isDuplicate = existingItems.some(item => item.code === itemCode.value);
        
        if (isDuplicate) {
            showAlert(itemAlert, 'यो सामान कोड पहिले नै प्रयोग भइसकेको छ।');
            return false;
        }
    }
    
    // Prepare item data
    const itemData = {
        code: itemCode.value.trim(),
        name: itemName.value.trim(),
        category: itemCategory.value,
        unit: itemUnit.value,
        purchasePrice: parseFloat(itemPurchasePrice.value),
        salePrice: parseFloat(itemSalePrice.value),
        quantity: parseInt(itemQuantity.value) || 0,
        reorderLevel: parseInt(itemReorderLevel.value) || 0,
        description: itemDescription.value.trim()
    };
    
    let success = false;
    
    if (isEditMode) {
        itemData.id = itemId.value;
        
        // Check if quantity changed
        if (currentItem && currentItem.quantity !== itemData.quantity) {
            // Add stock adjustment record
            const adjustmentType = itemData.quantity > currentItem.quantity ? 'add' : 'subtract';
            const adjustmentQuantity = Math.abs(itemData.quantity - currentItem.quantity);
            
            const adjustment = {
                itemId: itemData.id,
                date: new Date().toISOString().split('T')[0],
                type: adjustmentType,
                quantity: adjustmentQuantity,
                reason: 'प्रारम्भिक मात्रा परिवर्तन'
            };
            
            addStockAdjustment(adjustment);
        }
        
        success = updateInventoryItem(itemData.id, itemData);
        
        if (success) {
            showAlert(itemAlert, 'सामान सफलतापूर्वक अद्यावधिक गरियो!', 'success');
        } else {
            showAlert(itemAlert, 'सामान अद्यावधिक गर्न समस्या भयो।');
            return false;
        }
    } else {
        success = addInventoryItem(itemData);
        
        if (success) {
            // Add initial stock adjustment if quantity > 0
            if (itemData.quantity > 0) {
                const newItemId = getInventoryItemByCode(itemData.code).id;
                
                const adjustment = {
                    itemId: newItemId,
                    date: new Date().toISOString().split('T')[0],
                    type: 'add',
                    quantity: itemData.quantity,
                    reason: 'प्रारम्भिक स्टक'
                };
                
                addStockAdjustment(adjustment);
            }
            
            showAlert(itemAlert, 'सामान सफलतापूर्वक थपियो!', 'success');
        } else {
            showAlert(itemAlert, 'सामान थप्न समस्या भयो।');
            return false;
        }
    }
    
    // Close modal and reload table after delay
    setTimeout(() => {
        closeItemModal();
        loadInventoryItems();
    }, 1500);
    
    return true;
}

// Save stock adjustment
function saveStockAdjustment() {
    // Validate required fields
    if (!adjustmentItem.value) {
        showAlert(stockAdjustmentAlert, 'कृपया सामान छान्नुहोस्।');
        return false;
    }
    
    const adjustmentType = document.getElementById('adjustmentType').value;
    const adjustmentQuantity = parseInt(document.getElementById('adjustmentQuantity').value);
    const adjustmentReason = document.getElementById('adjustmentReason').value.trim();
    
    if (!adjustmentQuantity || adjustmentQuantity <= 0) {
        showAlert(stockAdjustmentAlert, 'मान्य मात्रा प्रविष्ट गर्नुहोस्।');
        return false;
    }
    
    if (!adjustmentReason) {
        showAlert(stockAdjustmentAlert, 'कृपया समायोजनको कारण प्रविष्ट गर्नुहोस्।');
        return false;
    }
    
    // Get current item
    const item = getInventoryItem(adjustmentItem.value);
    if (!item) {
        showAlert(stockAdjustmentAlert, 'सामान भेट्टिएन।');
        return false;
    }
    
    // Calculate new quantity
    let newQuantity = item.quantity;
    
    switch (adjustmentType) {
        case 'add':
            newQuantity += adjustmentQuantity;
            break;
        case 'subtract':
            newQuantity -= adjustmentQuantity;
            if (newQuantity < 0) {
                showAlert(stockAdjustmentAlert, 'स्टक मात्रा शून्य भन्दा कम हुन सक्दैन।');
                return false;
            }
            break;
        case 'set':
            newQuantity = adjustmentQuantity;
            break;
        default:
            showAlert(stockAdjustmentAlert, 'अमान्य समायोजन प्रकार।');
            return false;
    }
    
    // Create adjustment record
    const adjustment = {
        itemId: item.id,
        date: new Date().toISOString().split('T')[0],
        type: adjustmentType,
        quantity: adjustmentQuantity,
        reason: adjustmentReason
    };
    
    // Update item quantity
    item.quantity = newQuantity;
    
    const addSuccess = addStockAdjustment(adjustment);
    const updateSuccess = updateInventoryItem(item.id, item);
    
    if (addSuccess && updateSuccess) {
        showAlert(stockAdjustmentAlert, 'स्टक समायोजन सफलतापूर्वक रेकर्ड गरियो!', 'success');
        setTimeout(() => {
            closeStockAdjustmentModal();
            loadInventoryItems();
        }, 1500);
        return true;
    } else {
        showAlert(stockAdjustmentAlert, 'स्टक समायोजन गर्न समस्या भयो।');
        return false;
    }
}

// Filter inventory items
function filterInventoryItems() {
    const searchTerm = searchItem.value.trim().toLowerCase();
    const category = filterCategory.value;
    const stockStatus = filterStock.value;
    
    let items = getInventoryItems();
    
    // Apply search filter
    if (searchTerm) {
        items = items.filter(item => 
            item.code.toLowerCase().includes(searchTerm) || 
            item.name.toLowerCase().includes(searchTerm)
        );
    }
    
    // Apply category filter
    if (category) {
        items = items.filter(item => item.category === category);
    }
    
    // Apply stock status filter
    if (stockStatus) {
        switch (stockStatus) {
            case 'in-stock':
                items = items.filter(item => item.quantity > 0);
                break;
            case 'low-stock':
                items = items.filter(item => item.quantity > 0 && item.quantity <= item.reorderLevel);
                break;
            case 'out-of-stock':
                items = items.filter(item => item.quantity === 0);
                break;
        }
    }
    
    updateInventoryTable(items);
}

// Update inventory table
function updateInventoryTable(items) {
    const company = getCurrentCompany();
    const currency = company ? company.currency : 'NPR';
    
    inventoryTableBody.innerHTML = '';
    
    if (items.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = '<td colspan="10" class="text-center">कुनै सामानहरू छैनन्।</td>';
        inventoryTableBody.appendChild(row);
        return;
    }
    
    // Sort items by name
    items.sort((a, b) => a.name.localeCompare(b.name));
    
    items.forEach(item => {
        const row = document.createElement('tr');
        
        // Calculate stock value
        const stockValue = item.quantity * item.purchasePrice;
        
        // Set row class based on stock level
        if (item.quantity === 0) {
            row.classList.add('out-of-stock');
        } else if (item.quantity <= item.reorderLevel) {
            row.classList.add('low-stock');
        }
        
        row.innerHTML = `
            <td>${item.code}</td>
            <td>${item.name}</td>
            <td>${getCategoryName(item.category)}</td>
            <td>${item.description || '-'}</td>
            <td>${item.quantity} ${getUnitName(item.unit)}</td>
            <td>${getUnitName(item.unit)}</td>
            <td>${formatCurrency(item.purchasePrice, currency)}</td>
            <td>${formatCurrency(item.salePrice, currency)}</td>
            <td>${formatCurrency(stockValue, currency)}</td>
            <td>
                <button class="btn btn-sm view-btn" data-id="${item.id}" title="हेर्नुहोस्">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="btn btn-sm edit-btn" data-id="${item.id}" title="सम्पादन">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm delete-btn" data-id="${item.id}" title="मेटाउनुहोस्">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        
        inventoryTableBody.appendChild(row);
    });
    
    // Add event listeners to buttons
    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const item = items.find(i => i.id === btn.dataset.id);
            if (item) openItemDetailsModal(item);
        });
    });
    
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const item = items.find(i => i.id === btn.dataset.id);
            if (item) openEditItemModal(item);
        });
    });
    
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            if (confirm('के तपाईं यो सामान मेटाउन निश्चित हुनुहुन्छ?')) {
                const success = deleteInventoryItem(btn.dataset.id);
                if (success) {
                    loadInventoryItems();
                } else {
                    alert('सामान मेटाउन समस्या भयो।');
                }
            }
        });
    });
}

// Load inventory items
function loadInventoryItems() {
    const items = getInventoryItems();
    updateInventoryTable(items);
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    // Populate categories dropdowns
    populateCategories();
    
    // Load inventory items
    loadInventoryItems();
    
    // Add item button
    if (addItemBtn) {
        addItemBtn.addEventListener('click', openAddItemModal);
    }
    
    // Stock adjustment button
    if (stockAdjustmentBtn) {
        stockAdjustmentBtn.addEventListener('click', openStockAdjustmentModal);
    }
    
    // Save buttons
    if (saveItemBtn) {
        saveItemBtn.addEventListener('click', saveItem);
    }
    
    if (saveAdjustmentBtn) {
        saveAdjustmentBtn.addEventListener('click', saveStockAdjustment);
    }
    
    // Cancel buttons
    if (cancelItemBtn) {
        cancelItemBtn.addEventListener('click', closeItemModal);
    }
    
    if (cancelAdjustmentBtn) {
        cancelAdjustmentBtn.addEventListener('click', closeStockAdjustmentModal);
    }
    
    // Close modal buttons
    if (closeItemModal) {
        closeItemModal.addEventListener('click', closeItemModal);
    }
    
    if (closeStockAdjustmentModal) {
        closeStockAdjustmentModal.addEventListener('click', closeStockAdjustmentModal);
    }
    
    if (closeItemDetailsModal) {
        closeItemDetailsModal.addEventListener('click', closeItemDetailsModal);
    }
    
    if (closeItemDetailsBtn) {
        closeItemDetailsBtn.addEventListener('click', closeItemDetailsModal);
    }
    
    // Filter button
    if (applyFilterBtn) {
        applyFilterBtn.addEventListener('click', filterInventoryItems);
    }
    
    // Search input
    if (searchItem) {
        searchItem.addEventListener('input', () => {
            if (searchItem.value.trim() === '') {
                loadInventoryItems();
            }
        });
    }
    
    // Window click to close modals
    window.addEventListener('click', (e) => {
        if (e.target === itemModal) {
            closeItemModal();
        }
        if (e.target === stockAdjustmentModal) {
            closeStockAdjustmentModal();
        }
        if (e.target === itemDetailsModal) {
            closeItemDetailsModal();
        }
    });
}); 