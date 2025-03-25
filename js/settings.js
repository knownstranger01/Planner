document.addEventListener('DOMContentLoaded', function() {
    // DOM elements
    const saveSettingsBtn = document.getElementById('saveSettingsBtn');
    const dateFormatSelect = document.getElementById('dateFormat');
    const languageSelect = document.getElementById('language');
    const taxRateInput = document.getElementById('taxRate');
    const currencySymbolInput = document.getElementById('currencySymbol');
    const currencySelector = document.getElementById('currencySelector');
    const darkModeSwitch = document.getElementById('darkModeSwitch');
    const notificationsSwitch = document.getElementById('notificationsSwitch');
    const companyNameInput = document.getElementById('companyName');
    const companyTypeSelect = document.getElementById('companyType');
    const companyPANInput = document.getElementById('companyPAN');
    const fiscalYearInput = document.getElementById('fiscalYear');
    const companyPhoneInput = document.getElementById('companyPhone');
    const companyEmailInput = document.getElementById('companyEmail');
    const companyAddressInput = document.getElementById('companyAddress');
    const companyLogoInput = document.getElementById('companyLogo');
    const logoPreview = document.getElementById('logoPreview');
    const enableTwoFactorSwitch = document.getElementById('enableTwoFactor');
    const taxSettingsForm = document.getElementById('taxSettingsForm');
    const enableAuditTrailSwitch = document.getElementById('enableAuditTrail');
    const exportDataBtn = document.getElementById('exportDataBtn');
    const importDataBtn = document.getElementById('importDataBtn');
    const importDataInput = document.getElementById('importDataInput');
    const addTaxRuleBtn = document.getElementById('addTaxRuleBtn');
    const taxRulesContainer = document.getElementById('taxRulesContainer');
    const bankAccountsContainer = document.getElementById('bankAccountsContainer');
    const addBankAccountBtn = document.getElementById('addBankAccountBtn');
    const changePasswordBtn = document.getElementById('changePasswordBtn');
    const deleteAccountBtn = document.getElementById('deleteAccountBtn');
    
    // Load current company settings
    const currentCompany = getCurrentCompany();
    if (currentCompany) {
        loadCompanySettings(currentCompany);
    }
    
    // Save settings
    saveSettingsBtn.addEventListener('click', saveAllSettings);
    
    // Logo upload preview
    if (companyLogoInput) {
        companyLogoInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(event) {
                    logoPreview.innerHTML = `<img src="${event.target.result}" class="img-thumbnail" style="max-height: 100px">`;
                    currentCompany.logoData = event.target.result;
                };
                reader.readAsDataURL(file);
            }
        });
    }
    
    // Export company data
    if (exportDataBtn) {
        exportDataBtn.addEventListener('click', function() {
            const dataStr = exportCompanyData();
            const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
            
            const exportFileDefaultName = `${currentCompany.name}_backup_${new Date().toISOString().slice(0,10)}.json`;
            
            const linkElement = document.createElement('a');
            linkElement.setAttribute('href', dataUri);
            linkElement.setAttribute('download', exportFileDefaultName);
            linkElement.click();
        });
    }
    
    // Import company data
    if (importDataBtn && importDataInput) {
        importDataBtn.addEventListener('click', function() {
            importDataInput.click();
        });
        
        importDataInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(event) {
                    try {
                        if (importCompanyData(event.target.result)) {
                            showAlert('डाटा सफलतापूर्वक आयात गरियो। पृष्ठ पुन: लोड हुँदैछ...', 'success');
                            setTimeout(() => {
                                window.location.reload();
                            }, 2000);
                        } else {
                            showAlert('डाटा आयात गर्न सकिएन।', 'danger');
                        }
                    } catch (error) {
                        showAlert('अवैध डाटा फाइल। कृपया सही बैकअप फाइल चयन गर्नुहोस्।', 'danger');
                        console.error(error);
                    }
                };
                reader.readAsText(file);
            }
        });
    }
    
    // Add Tax Rule
    if (addTaxRuleBtn && taxRulesContainer) {
        addTaxRuleBtn.addEventListener('click', addNewTaxRule);
        
        // Load existing tax rules
        if (currentCompany.taxRules && currentCompany.taxRules.length > 0) {
            currentCompany.taxRules.forEach(rule => {
                addTaxRuleToUI(rule);
            });
        }
    }
    
    // Add Bank Account
    if (addBankAccountBtn && bankAccountsContainer) {
        addBankAccountBtn.addEventListener('click', addNewBankAccount);
        
        // Load existing bank accounts
        if (currentCompany.bankAccounts && currentCompany.bankAccounts.length > 0) {
            currentCompany.bankAccounts.forEach(account => {
                addBankAccountToUI(account);
            });
        }
    }
    
    // Initialize currency selector
    initCurrencySelector();
    
    // Initialize user permissions UI
    initUserPermissions();
    
    // पासवर्ड परिवर्तन बटन
    if (changePasswordBtn) {
        changePasswordBtn.addEventListener('click', changePassword);
    }
    
    // खाता मेट्ने बटन
    if (deleteAccountBtn) {
        deleteAccountBtn.addEventListener('click', deleteAccount);
    }
});

// Load company settings
function loadCompanySettings(company) {
    // General settings
    if (dateFormatSelect) dateFormatSelect.value = company.dateFormat || 'YYYY-MM-DD';
    if (languageSelect) languageSelect.value = company.language || 'ne';
    if (taxRateInput) taxRateInput.value = company.taxRate || 13;
    if (currencySymbolInput) currencySymbolInput.value = company.currencySymbol || 'रू';
    if (currencySelector) currencySelector.value = company.currency || 'NPR';
    if (darkModeSwitch) darkModeSwitch.checked = company.darkMode || false;
    if (notificationsSwitch) notificationsSwitch.checked = company.notifications || true;
    
    // Company profile
    if (companyNameInput) companyNameInput.value = company.name || '';
    if (companyTypeSelect) companyTypeSelect.value = company.type || 'retail';
    if (companyPANInput) companyPANInput.value = company.panNumber || '';
    if (fiscalYearInput) fiscalYearInput.value = company.fiscalYearStart || '';
    if (companyPhoneInput) companyPhoneInput.value = company.phone || '';
    if (companyEmailInput) companyEmailInput.value = company.email || '';
    if (companyAddressInput) companyAddressInput.value = company.address || '';
    
    // Logo
    if (logoPreview && company.logoData) {
        logoPreview.innerHTML = `<img src="${company.logoData}" class="img-thumbnail" style="max-height: 100px">`;
    }
    
    // Security settings
    if (enableTwoFactorSwitch) enableTwoFactorSwitch.checked = company.twoFactorEnabled || false;
    if (enableAuditTrailSwitch) enableAuditTrailSwitch.checked = company.auditTrailEnabled || true;
}

// Save all settings
function saveAllSettings() {
    const company = getCurrentCompany();
    if (!company) {
        showAlert('कम्पनी लोड गर्न सकिएन। कृपया पुन: लगइन गर्नुहोस्।', 'danger');
        return;
    }
    
    // Save general settings
    if (dateFormatSelect) company.dateFormat = dateFormatSelect.value;
    if (languageSelect) company.language = languageSelect.value;
    if (taxRateInput) company.taxRate = parseFloat(taxRateInput.value);
    if (currencySymbolInput) company.currencySymbol = currencySymbolInput.value;
    if (currencySelector) company.currency = currencySelector.value;
    if (darkModeSwitch) company.darkMode = darkModeSwitch.checked;
    if (notificationsSwitch) company.notifications = notificationsSwitch.checked;
    
    // Save company profile
    if (companyNameInput) company.name = companyNameInput.value;
    if (companyTypeSelect) company.type = companyTypeSelect.value;
    if (companyPANInput) company.panNumber = companyPANInput.value;
    if (fiscalYearInput) company.fiscalYearStart = fiscalYearInput.value;
    if (companyPhoneInput) company.phone = companyPhoneInput.value;
    if (companyEmailInput) company.email = companyEmailInput.value;
    if (companyAddressInput) company.address = companyAddressInput.value;
    
    // Save security settings
    if (enableTwoFactorSwitch) company.twoFactorEnabled = enableTwoFactorSwitch.checked;
    if (enableAuditTrailSwitch) company.auditTrailEnabled = enableAuditTrailSwitch.checked;
    
    // Save tax rules
    if (taxRulesContainer) {
        const taxRules = collectTaxRulesFromUI();
        company.taxRules = taxRules;
    }
    
    // Save bank accounts
    if (bankAccountsContainer) {
        const bankAccounts = collectBankAccountsFromUI();
        company.bankAccounts = bankAccounts;
    }
    
    // Save to local storage
    if (saveCompany(company)) {
        showAlert('सेटिङ्सहरू सफलतापूर्वक सेभ गरियो।', 'success');
    } else {
        showAlert('सेटिङ्सहरू सेभ गर्न सकिएन।', 'danger');
    }
}

// Initialize currency selector
function initCurrencySelector() {
    const currencies = [
        { code: 'NPR', name: 'नेपाली रुपैयाँ (रू)', symbol: 'रू' },
        { code: 'USD', name: 'US Dollar ($)', symbol: '$' },
        { code: 'EUR', name: 'Euro (€)', symbol: '€' },
        { code: 'INR', name: 'Indian Rupee (₹)', symbol: '₹' },
        { code: 'GBP', name: 'British Pound (£)', symbol: '£' },
        { code: 'JPY', name: 'Japanese Yen (¥)', symbol: '¥' },
        { code: 'CNY', name: 'Chinese Yuan (¥)', symbol: '¥' },
        { code: 'AUD', name: 'Australian Dollar (A$)', symbol: 'A$' }
    ];
    
    if (currencySelector) {
        // Clear existing options
        currencySelector.innerHTML = '';
        
        // Add currency options
        currencies.forEach(currency => {
            const option = document.createElement('option');
            option.value = currency.code;
            option.textContent = currency.name;
            option.dataset.symbol = currency.symbol;
            currencySelector.appendChild(option);
        });
        
        // Set current value
        const company = getCurrentCompany();
        if (company && company.currency) {
            currencySelector.value = company.currency;
        }
        
        // Add change event to update currency symbol
        currencySelector.addEventListener('change', function() {
            const selectedOption = this.options[this.selectedIndex];
            if (currencySymbolInput && selectedOption.dataset.symbol) {
                currencySymbolInput.value = selectedOption.dataset.symbol;
            }
        });
    }
}

// Add a new tax rule to UI
function addNewTaxRule() {
    const ruleId = 'tax-rule-' + Date.now();
    const rule = { id: ruleId, name: '', rate: 0, applicableFor: 'all' };
    addTaxRuleToUI(rule);
}

// Add tax rule to UI
function addTaxRuleToUI(rule) {
    const ruleDiv = document.createElement('div');
    ruleDiv.className = 'card mb-3 tax-rule';
    ruleDiv.dataset.id = rule.id;
    
    ruleDiv.innerHTML = `
        <div class="card-body">
            <div class="d-flex justify-content-between align-items-center mb-2">
                <h6 class="card-title mb-0">कर नियम</h6>
                <button type="button" class="btn btn-sm btn-danger remove-tax-rule">
                    <i class="fas fa-trash"></i> हटाउनुहोस्
                </button>
            </div>
            <div class="row">
                <div class="col-md-4">
                    <div class="form-group mb-2">
                        <label class="form-label">कर नाम</label>
                        <input type="text" class="form-control tax-name" value="${rule.name || ''}">
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="form-group mb-2">
                        <label class="form-label">कर दर (%)</label>
                        <input type="number" class="form-control tax-rate" min="0" max="100" step="0.01" value="${rule.rate || 0}">
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="form-group mb-2">
                        <label class="form-label">लागू हुने</label>
                        <select class="form-select tax-applicable">
                            <option value="all" ${rule.applicableFor === 'all' ? 'selected' : ''}>सबै वस्तु तथा सेवाहरू</option>
                            <option value="products" ${rule.applicableFor === 'products' ? 'selected' : ''}>वस्तुहरू मात्र</option>
                            <option value="services" ${rule.applicableFor === 'services' ? 'selected' : ''}>सेवाहरू मात्र</option>
                        </select>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Add delete button functionality
    const deleteBtn = ruleDiv.querySelector('.remove-tax-rule');
    deleteBtn.addEventListener('click', function() {
        ruleDiv.remove();
    });
    
    // Add to container
    taxRulesContainer.appendChild(ruleDiv);
}

// Collect tax rules from UI
function collectTaxRulesFromUI() {
    const rules = [];
    const ruleDivs = document.querySelectorAll('.tax-rule');
    
    ruleDivs.forEach(div => {
        const rule = {
            id: div.dataset.id,
            name: div.querySelector('.tax-name').value,
            rate: parseFloat(div.querySelector('.tax-rate').value) || 0,
            applicableFor: div.querySelector('.tax-applicable').value
        };
        rules.push(rule);
    });
    
    return rules;
}

// Add a new bank account to UI
function addNewBankAccount() {
    const accountId = 'bank-account-' + Date.now();
    const account = { id: accountId, name: '', accountNumber: '', balance: 0 };
    addBankAccountToUI(account);
}

// Add bank account to UI
function addBankAccountToUI(account) {
    const accountDiv = document.createElement('div');
    accountDiv.className = 'card mb-3 bank-account';
    accountDiv.dataset.id = account.id;
    
    accountDiv.innerHTML = `
        <div class="card-body">
            <div class="d-flex justify-content-between align-items-center mb-2">
                <h6 class="card-title mb-0">बैंक खाता</h6>
                <button type="button" class="btn btn-sm btn-danger remove-bank-account">
                    <i class="fas fa-trash"></i> हटाउनुहोस्
                </button>
            </div>
            <div class="row">
                <div class="col-md-4">
                    <div class="form-group mb-2">
                        <label class="form-label">बैंक/खाता नाम</label>
                        <input type="text" class="form-control bank-name" value="${account.name || ''}">
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="form-group mb-2">
                        <label class="form-label">खाता नम्बर</label>
                        <input type="text" class="form-control account-number" value="${account.accountNumber || ''}">
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="form-group mb-2">
                        <label class="form-label">प्रारम्भिक ब्यालेन्स</label>
                        <input type="number" class="form-control account-balance" step="0.01" value="${account.balance || 0}">
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Add delete button functionality
    const deleteBtn = accountDiv.querySelector('.remove-bank-account');
    deleteBtn.addEventListener('click', function() {
        accountDiv.remove();
    });
    
    // Add to container
    bankAccountsContainer.appendChild(accountDiv);
}

// Collect bank accounts from UI
function collectBankAccountsFromUI() {
    const accounts = [];
    const accountDivs = document.querySelectorAll('.bank-account');
    
    accountDivs.forEach(div => {
        const account = {
            id: div.dataset.id,
            name: div.querySelector('.bank-name').value,
            accountNumber: div.querySelector('.account-number').value,
            balance: parseFloat(div.querySelector('.account-balance').value) || 0
        };
        accounts.push(account);
    });
    
    return accounts;
}

// Initialize user permissions UI
function initUserPermissions() {
    const userRolesContainer = document.getElementById('userRolesContainer');
    if (!userRolesContainer) return;
    
    const company = getCurrentCompany();
    if (!company) return;
    
    // Get users with access to this company
    const users = getAllUsersWithAccess(company.id);
    userRolesContainer.innerHTML = '';
    
    users.forEach(user => {
        const userDiv = document.createElement('div');
        userDiv.className = 'card mb-3';
        userDiv.innerHTML = `
            <div class="card-body">
                <div class="d-flex justify-content-between align-items-center mb-3">
                    <h6 class="card-title mb-0">${user.username}</h6>
                    <div>
                        <button type="button" class="btn btn-sm btn-danger remove-user" data-username="${user.username}">
                            <i class="fas fa-user-minus"></i> पहुँच हटाउनुहोस्
                        </button>
                    </div>
                </div>
                <div class="mb-3">
                    <label class="form-label">पहुँच स्तर</label>
                    <select class="form-select user-role" data-username="${user.username}">
                        <option value="admin" ${user.role === 'admin' ? 'selected' : ''}>एडमिन (सबै अनुमतिहरू)</option>
                        <option value="manager" ${user.role === 'manager' ? 'selected' : ''}>म्यानेजर (हटाउने अनुमति बाहेक)</option>
                        <option value="accountant" ${user.role === 'accountant' ? 'selected' : ''}>लेखापाल (सेटिङ परिवर्तन बाहेक)</option>
                        <option value="viewer" ${user.role === 'viewer' ? 'selected' : ''}>दर्शक (हेर्न मात्र मिल्ने)</option>
                    </select>
                </div>
                <div class="mb-3">
                    <div class="form-check form-switch">
                        <input class="form-check-input user-2fa" type="checkbox" data-username="${user.username}" ${user.require2FA ? 'checked' : ''}>
                        <label class="form-check-label">दुई-कारक प्रमाणीकरण आवश्यक</label>
                    </div>
                </div>
            </div>
        `;
        
        userRolesContainer.appendChild(userDiv);
    });
    
    // Add event listeners for role changes
    document.querySelectorAll('.user-role').forEach(select => {
        select.addEventListener('change', function() {
            const username = this.dataset.username;
            const role = this.value;
            updateUserRole(company.id, username, role);
        });
    });
    
    // Add event listeners for 2FA toggle
    document.querySelectorAll('.user-2fa').forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            const username = this.dataset.username;
            const require2FA = this.checked;
            updateUser2FARequirement(company.id, username, require2FA);
        });
    });
    
    // Add event listeners for user removal
    document.querySelectorAll('.remove-user').forEach(button => {
        button.addEventListener('click', function() {
            const username = this.dataset.username;
            if (confirm(`के तपाईं निश्चित हुनुहुन्छ कि ${username} लाई हटाउन चाहनुहुन्छ?`)) {
                removeUserAccess(company.id, username);
                this.closest('.card').remove();
            }
        });
    });
}

// Get all users with access to a company
function getAllUsersWithAccess(companyId) {
    const company = getCurrentCompany();
    if (!company) return [];
    
    // In a real app, this would be a server call
    // For now, we'll mock some data
    return [
        { username: 'admin', role: 'admin', require2FA: true },
        { username: 'manager', role: 'manager', require2FA: false },
        { username: 'accountant', role: 'accountant', require2FA: false }
    ];
}

// Update user role
function updateUserRole(companyId, username, role) {
    // In a real app, this would be a server call
    console.log(`Updating ${username} role to ${role} for company ${companyId}`);
    showAlert(`प्रयोगकर्ता "${username}" को भूमिका परिवर्तन गरियो।`, 'success');
    
    // Log in audit trail
    addAuditLog('user_role_changed', {
        username: username,
        newRole: role,
        changedBy: getCurrentUser().username
    });
}

// Update user 2FA requirement
function updateUser2FARequirement(companyId, username, require2FA) {
    // In a real app, this would be a server call
    console.log(`Setting 2FA requirement to ${require2FA} for ${username} in company ${companyId}`);
    showAlert(`प्रयोगकर्ता "${username}" को दुई-कारक प्रमाणीकरण आवश्यकता परिवर्तन गरियो।`, 'success');
    
    // Log in audit trail
    addAuditLog('user_2fa_requirement_changed', {
        username: username,
        require2FA: require2FA,
        changedBy: getCurrentUser().username
    });
}

// Remove user access to company
function removeUserAccess(companyId, username) {
    // In a real app, this would be a server call
    console.log(`Removing ${username} access to company ${companyId}`);
    showAlert(`प्रयोगकर्ता "${username}" को पहुँच हटाइयो।`, 'success');
    
    // Log in audit trail
    addAuditLog('user_access_removed', {
        username: username,
        changedBy: getCurrentUser().username
    });
}

// Add audit log
function addAuditLog(action, details) {
    const company = getCurrentCompany();
    if (!company) return;
    
    // Initialize audit trail if it doesn't exist
    company.auditTrail = company.auditTrail || [];
    
    // Add new log entry
    company.auditTrail.push({
        timestamp: new Date().toISOString(),
        action: action,
        user: getCurrentUser().username,
        details: details
    });
    
    // Save company
    saveCompany(company);
}

// Helper function to show alerts
function showAlert(message, type = 'info') {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    
    // Add to page
    const mainContent = document.querySelector('main');
    if (mainContent) {
        mainContent.insertBefore(alertDiv, mainContent.firstChild);
    }
    
    // Auto dismiss after 3 seconds
    setTimeout(() => {
        alertDiv.classList.remove('show');
        setTimeout(() => alertDiv.remove(), 300);
    }, 3000);
}

// पासवर्ड परिवर्तन गर्ने
function changePassword() {
    const currentPassword = document.getElementById('currentPassword');
    const newPassword = document.getElementById('newPassword');
    const confirmPassword = document.getElementById('confirmPassword');
    
    // सबै फिल्डहरू भरिएको छ भनेर जाँच
    if (!currentPassword.value || !newPassword.value || !confirmPassword.value) {
        showAlert('सबै पासवर्ड फिल्डहरू आवश्यक छन्', 'danger');
        return;
    }
    
    // नयाँ पासवर्ड मिल्छ भनेर जाँच
    if (newPassword.value !== confirmPassword.value) {
        showAlert('नयाँ पासवर्ड र पुष्टि पासवर्ड मेल खाँदैन', 'danger');
        return;
    }
    
    // हालको प्रयोगकर्ता लोड गर्ने
    const currentUser = getCurrentUser();
    if (!currentUser) {
        showAlert('प्रयोगकर्ता सेसन समाप्त भएको छ। कृपया पुन: लगइन गर्नुहोस्', 'danger');
        return;
    }
    
    // वर्तमान पासवर्ड ठीक छ भनेर जाँच
    if (currentPassword.value !== currentUser.password) {
        showAlert('वर्तमान पासवर्ड गलत छ', 'danger');
        return;
    }
    
    // प्रयोगकर्ताको पासवर्ड अपडेट गर्ने
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const userIndex = users.findIndex(user => user.username === currentUser.username);
    
    if (userIndex === -1) {
        showAlert('प्रयोगकर्ता फेला परेन', 'danger');
        return;
    }
    
    // पासवर्ड अपडेट
    users[userIndex].password = newPassword.value;
    localStorage.setItem('users', JSON.stringify(users));
    
    // वर्तमान सेसन अपडेट
    currentUser.password = newPassword.value;
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    
    // सफलता सन्देश
    showAlert('पासवर्ड सफलतापूर्वक परिवर्तन गरियो!', 'success');
    
    // फिल्डहरू खाली गर्ने
    currentPassword.value = '';
    newPassword.value = '';
    confirmPassword.value = '';
}

// खाता मेट्ने
function deleteAccount() {
    // पुष्टि प्रश्न सोध्ने
    if (!confirm('के तपाइँ साँच्चै आफ्नो खाता मेटाउन चाहनुहुन्छ? यो कार्य पूर्णरूपमा अपरिवर्तनीय छ र तपाइँको सबै डाटा मेटिनेछ।')) {
        return; // प्रयोगकर्ताले रद्द गर्यो
    }
    
    // पासवर्ड माग्ने
    const confirmPassword = prompt('यो कार्य पुष्टि गर्न तपाइँको पासवर्ड प्रविष्ट गर्नुहोस्:');
    if (!confirmPassword) {
        return; // प्रयोगकर्ताले रद्द गर्यो
    }
    
    // हालको प्रयोगकर्ता लोड गर्ने
    const currentUser = getCurrentUser();
    if (!currentUser) {
        showAlert('प्रयोगकर्ता सेसन समाप्त भएको छ। कृपया पुन: लगइन गर्नुहोस्', 'danger');
        return;
    }
    
    // पासवर्ड जाँच
    if (confirmPassword !== currentUser.password) {
        showAlert('पासवर्ड गलत छ', 'danger');
        return;
    }
    
    // प्रयोगकर्ता खाता मेट्ने
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const companies = JSON.parse(localStorage.getItem('companies')) || [];
    
    // प्रयोगकर्ताले स्वामित्वमा भएका कम्पनीहरू मेट्ने
    const updatedCompanies = companies.filter(company => company.ownerId !== currentUser.id);
    localStorage.setItem('companies', JSON.stringify(updatedCompanies));
    
    // प्रयोगकर्ता मेट्ने
    const updatedUsers = users.filter(user => user.id !== currentUser.id);
    localStorage.setItem('users', JSON.stringify(updatedUsers));
    
    // वर्तमान सेसन मेट्ने
    localStorage.removeItem('currentUser');
    localStorage.removeItem('currentCompany');
    
    // सफलता सन्देश र लगआउट
    alert('खाता सफलतापूर्वक मेटिएको छ। तपाईंलाई लगिन पृष्ठमा पुनर्निर्देशित गरिनेछ।');
    
    // लगिन पृष्ठमा पुनर्निर्देशित गर्ने
    window.location.href = '../index.html';
} 