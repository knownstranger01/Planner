// Company management functionality

// DOM Elements
const companyListSection = document.getElementById('companyListSection');
const createCompanySection = document.getElementById('createCompanySection');
const companyList = document.getElementById('companyList');
const createNewCompanyBtn = document.getElementById('createNewCompanyBtn');
const createCompanyForm = document.getElementById('createCompanyForm');
const cancelCreateCompany = document.getElementById('cancelCreateCompany');
const companyAlert = document.getElementById('companyAlert');
const logoutLink = document.getElementById('logoutLink');

// Show alert message
function showAlert(message, type = 'danger') {
    companyAlert.textContent = message;
    companyAlert.classList.remove('hidden', 'alert-success', 'alert-danger');
    companyAlert.classList.add(`alert-${type}`);
    
    // Auto hide after 5 seconds
    setTimeout(() => {
        companyAlert.classList.add('hidden');
    }, 5000);
}

// Toggle between company list and create company form
function toggleCreateCompanyForm(show) {
    if (show) {
        companyListSection.classList.add('hidden');
        createCompanySection.classList.remove('hidden');
    } else {
        companyListSection.classList.remove('hidden');
        createCompanySection.classList.add('hidden');
    }
}

// Create a new company
function createCompany(companyData) {
    // Get current user
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) {
        window.location.href = '../index.html';
        return;
    }
    
    // Generate a unique ID for the company
    companyData.id = Date.now().toString();
    companyData.createdBy = currentUser.username;
    companyData.createdAt = new Date().toISOString();
    
    // Initialize company data structures
    companyData.customers = [];
    companyData.vendors = [];
    companyData.transactions = [];
    companyData.invoices = [];
    companyData.inventory = [];
    
    // Save to localStorage
    const companies = JSON.parse(localStorage.getItem('companies')) || [];
    companies.push(companyData);
    localStorage.setItem('companies', JSON.stringify(companies));
    
    // Also save in user-specific companies for multi-company management
    const userCompanies = JSON.parse(localStorage.getItem(`companies_${currentUser.username}`)) || [];
    userCompanies.push(companyData.id);
    localStorage.setItem(`companies_${currentUser.username}`, JSON.stringify(userCompanies));
    
    return companyData;
}

// Display company card
function createCompanyCard(company) {
    const card = document.createElement('div');
    card.className = 'card company-card';
    card.innerHTML = `
        <div class="card-body">
            <h3>${company.companyName}</h3>
            <p><strong>उद्योग:</strong> ${getIndustryName(company.industryType)}</p>
            <p><strong>मुद्रा:</strong> ${company.currency}</p>
            <p><strong>सिर्जना मिति:</strong> ${new Date(company.createdAt).toLocaleDateString()}</p>
        </div>
    `;
    
    // Add click event to select company
    card.addEventListener('click', () => selectCompany(company));
    
    return card;
}

// Get industry name based on value
function getIndustryName(industryValue) {
    const industries = {
        'retail': 'खुद्रा व्यापार',
        'wholesale': 'थोक व्यापार',
        'manufacturing': 'उत्पादन',
        'service': 'सेवा',
        'construction': 'निर्माण',
        'technology': 'प्रविधि',
        'other': 'अन्य'
    };
    
    return industries[industryValue] || industryValue;
}

// Load user companies
function loadUserCompanies() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) {
        window.location.href = '../index.html';
        return;
    }
    
    const userCompanyIds = JSON.parse(localStorage.getItem(`companies_${currentUser.username}`)) || [];
    const allCompanies = JSON.parse(localStorage.getItem('companies')) || [];
    
    // Filter companies that belong to this user
    const userCompanies = allCompanies.filter(company => 
        userCompanyIds.includes(company.id) || company.createdBy === currentUser.username
    );
    
    // Clear the company list
    companyList.innerHTML = '';
    
    if (userCompanies.length === 0) {
        const noCompanies = document.createElement('div');
        noCompanies.className = 'text-center mt-4';
        noCompanies.innerHTML = '<p>तपाईंसँग अहिलेसम्म कुनै कम्पनी छैन। नयाँ कम्पनी सिर्जना गर्नुहोस्।</p>';
        companyList.appendChild(noCompanies);
    } else {
        userCompanies.forEach(company => {
            companyList.appendChild(createCompanyCard(company));
        });
    }
}

// Select a company to work with
function selectCompany(company) {
    // Store the selected company ID in localStorage
    localStorage.setItem('currentCompany', JSON.stringify(company));
    
    // Redirect to dashboard
    window.location.href = 'dashboard.html';
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    // Check authentication
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) {
        window.location.href = '../index.html';
        return;
    }
    
    // Load user companies
    loadUserCompanies();
    
    // Show create company form
    if (createNewCompanyBtn) {
        createNewCompanyBtn.addEventListener('click', () => {
            toggleCreateCompanyForm(true);
        });
    }
    
    // Cancel button for create company form
    if (cancelCreateCompany) {
        cancelCreateCompany.addEventListener('click', (e) => {
            e.preventDefault();
            toggleCreateCompanyForm(false);
        });
    }
    
    // Create company form submission
    if (createCompanyForm) {
        createCompanyForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const companyData = {
                companyName: document.getElementById('companyName').value.trim(),
                industryType: document.getElementById('industryType').value,
                currency: document.getElementById('currency').value,
                accountingStartDate: document.getElementById('accountingStartDate').value,
                fiscalYearEnd: document.getElementById('fiscalYearEnd').value,
                companyAddress: document.getElementById('companyAddress').value.trim(),
                companyPhone: document.getElementById('companyPhone').value.trim(),
                companyEmail: document.getElementById('companyEmail').value.trim(),
                taxNumber: document.getElementById('taxNumber').value.trim()
            };
            
            // Validate company name
            if (!companyData.companyName) {
                showAlert('कम्पनी नाम आवश्यक छ।');
                return;
            }
            
            // Create the company
            const newCompany = createCompany(companyData);
            
            // Show success message
            showAlert('कम्पनी सफलतापूर्वक सिर्जना गरियो!', 'success');
            
            // Redirect to dashboard after a delay
            setTimeout(() => {
                selectCompany(newCompany);
            }, 1500);
        });
    }
    
    // Logout functionality
    if (logoutLink) {
        logoutLink.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('currentUser');
            localStorage.removeItem('currentCompany');
            window.location.href = '../index.html';
        });
    }
}); 