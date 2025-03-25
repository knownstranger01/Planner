/**
 * app.js - मुख्य एप्लिकेशन कार्यात्मकता
 * साझा फंक्सनहरू र यूआई इभेन्टहरू यहाँ व्यवस्थित गरिएको छ
 */

document.addEventListener('DOMContentLoaded', function() {
    // कम्पनी डाटा लोड गर्ने
    if (typeof loadCompanyData === 'function') {
        loadCompanyData();
    }
    
    // मोबाइल साइडबार टगल
    setupMobileToggle();
    
    // थिम प्रिफरेन्स
    checkDarkMode();
    
    // अन्य UI इनिशियलाइजेशन
    setupTooltips();
    setupDropdowns();
    
    // कम्पनी नाम सेटअप
    setupCompanyName();
    
    // मोडल क्लोज बटन स्टाइल
    setupModalCloseButtons();
    
    // चार्ट लेजेन्ड सेटअप (यदि चार्ट छ भने)
    setupChartLegends();
    
    // कार्ड हभर इफेक्ट
    setupCardHoverEffects();
});

/**
 * मोबाइल भ्युको लागि साइडबार टगल सेटअप गर्ने
 */
function setupMobileToggle() {
    const mobileToggle = document.getElementById('mobileToggle');
    const sidebar = document.querySelector('.sidebar');
    const mainContent = document.querySelector('.main-content');
    
    if (mobileToggle && sidebar && mainContent) {
        mobileToggle.addEventListener('click', function() {
            // मोबाइल भ्युमा हो कि होइन चेक गर्ने
            const isMobile = window.innerWidth <= 768;
            
            if (isMobile) {
                // टगल आइकन परिवर्तन
                const icon = this.querySelector('i');
                if (sidebar.classList.contains('active')) {
                    icon.classList.remove('fa-times');
                    icon.classList.add('fa-bars');
                } else {
                    icon.classList.remove('fa-bars');
                    icon.classList.add('fa-times');
                }
                
                // साइडबार टगल
                sidebar.classList.toggle('active');
                
                // मुख्य सामग्री समायोजन
                if (sidebar.classList.contains('active')) {
                    mainContent.style.marginLeft = '250px';
                } else {
                    mainContent.style.marginLeft = '0';
                }
            }
        });
        
        // विन्डो साइज परिवर्तन हुँदा साइडबार रिसेट
        window.addEventListener('resize', function() {
            const isMobile = window.innerWidth <= 768;
            const icon = mobileToggle.querySelector('i');
            
            if (!isMobile) {
                // डेस्कटप भ्यु
                sidebar.style.width = '250px';
                mainContent.style.marginLeft = '250px';
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            } else {
                // साइडबार लुकाउने
                if (!sidebar.classList.contains('active')) {
                    sidebar.style.width = '0';
                    mainContent.style.marginLeft = '0';
                }
            }
        });
        
        // पहिलो लोडमा स्क्रिन साइज चेक
        if (window.innerWidth <= 768) {
            sidebar.style.width = '0';
            mainContent.style.marginLeft = '0';
            sidebar.classList.remove('active');
        }
    }
}

/**
 * डार्क मोड सेटिङ्स चेक गर्ने
 */
function checkDarkMode() {
    // लोकल स्टोरेजबाट डार्क मोड सेटिङ्स प्राप्त गर्ने
    const darkMode = localStorage.getItem('darkMode') === 'true';
    const darkModeToggle = document.getElementById('darkModeSwitch');
    
    // यदि डार्क मोड सेट छ भने लागू गर्ने
    if (darkMode) {
        document.body.classList.add('dark-mode');
        
        // यदि टगल उपलब्ध छ भने, अपडेट गर्ने
        if (darkModeToggle) {
            darkModeToggle.checked = true;
        }
    }
    
    // यदि डार्क मोड स्विच छ भने, इभेन्ट लिस्नर थप्ने
    if (darkModeToggle) {
        darkModeToggle.addEventListener('change', function() {
            if (this.checked) {
                document.body.classList.add('dark-mode');
                localStorage.setItem('darkMode', 'true');
            } else {
                document.body.classList.remove('dark-mode');
                localStorage.setItem('darkMode', 'false');
            }
        });
    }
}

/**
 * टुलटिप्स सेटअप
 */
function setupTooltips() {
    // Bootstrap 5 टुलटिप्स इनिशियलाइज गर्ने
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
}

/**
 * ड्रपडाउन्स सेटअप
 */
function setupDropdowns() {
    // Bootstrap 5 ड्रपडाउन्स इनिशियलाइज गर्ने
    const dropdownTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="dropdown"]'));
    dropdownTriggerList.map(function (dropdownTriggerEl) {
        return new bootstrap.Dropdown(dropdownTriggerEl);
    });
}

/**
 * स्क्रोल-टु-टप फंक्शन
 */
function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

/**
 * नोटिफिकेशन प्रदर्शन गर्ने सहायक फंक्शन
 * @param {string} message नोटिफिकेशन सन्देश
 * @param {string} type नोटिफिकेशन प्रकार (success, danger, warning, info)
 * @param {number} duration नोटिफिकेशन देखाइरहने अवधि (मिलिसेकेन्डमा)
 */
function showNotification(message, type = 'info', duration = 3000) {
    // यदि नोटिफिकेशन कन्टेनर छैन भने बनाउने
    let container = document.getElementById('notification-container');
    
    if (!container) {
        container = document.createElement('div');
        container.id = 'notification-container';
        container.style.position = 'fixed';
        container.style.top = '20px';
        container.style.right = '20px';
        container.style.zIndex = '9999';
        document.body.appendChild(container);
    }
    
    // नोटिफिकेशन एलिमेन्ट बनाउने
    const notification = document.createElement('div');
    notification.className = `alert alert-${type} alert-dismissible fade show`;
    notification.style.minWidth = '300px';
    notification.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
    notification.style.marginBottom = '10px';
    notification.style.opacity = '0';
    notification.style.transition = 'opacity 0.3s ease-in-out';
    
    // सन्देश र क्लोज बटन सेट गर्ने
    notification.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    
    // नोटिफिकेशन थप्ने
    container.appendChild(notification);
    
    // फेड इन एनिमेशन
    setTimeout(() => {
        notification.style.opacity = '1';
    }, 10);
    
    // अटोमेटिक हटाउने टाइमर
    setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, duration);
    
    // क्लोज बटन क्लिक गर्दा नोटिफिकेशन हटाउने
    const closeButton = notification.querySelector('.btn-close');
    if (closeButton) {
        closeButton.addEventListener('click', function() {
            notification.style.opacity = '0';
            setTimeout(() => {
                notification.remove();
            }, 300);
        });
    }
}

/**
 * चार्ट लेजेन्डहरू सेटअप गर्ने
 */
function setupChartLegends() {
    // यदि चार्ट कन्टेनर छ भने
    const chartContainer = document.querySelector('.main-chart-container');
    if (chartContainer) {
        // लेजेन्ड कन्टेनर थप्ने
        const legendContainer = document.createElement('div');
        legendContainer.className = 'chart-legend';
        
        // आय-खर्च लेजेन्ड
        const incomeItem = createLegendItem('आम्दानी', 'income-color');
        const expenseItem = createLegendItem('खर्च', 'expense-color');
        
        legendContainer.appendChild(incomeItem);
        legendContainer.appendChild(expenseItem);
        
        // यदि आम्दानी-खर्च हेडिङ छ भने त्यसपछि थप्ने, नत्र सिधै कन्टेनरमा थप्ने
        const heading = chartContainer.querySelector('.income-expense-heading');
        if (heading) {
            heading.after(legendContainer);
        } else {
            chartContainer.appendChild(legendContainer);
        }
    }
}

/**
 * लेजेन्ड आइटम तयार गर्ने
 * @param {string} label लेजेन्ड लेबल
 * @param {string} colorClass कलर क्लास
 * @returns {HTMLElement} लेजेन्ड आइटम एलिमेन्ट
 */
function createLegendItem(label, colorClass) {
    const item = document.createElement('div');
    item.className = 'legend-item';
    
    const colorDiv = document.createElement('div');
    colorDiv.className = 'legend-color ' + colorClass;
    
    const labelDiv = document.createElement('div');
    labelDiv.className = 'legend-label';
    labelDiv.textContent = label;
    
    item.appendChild(colorDiv);
    item.appendChild(labelDiv);
    
    return item;
}

/**
 * कार्ड हभर इफेक्ट सेटअप
 */
function setupCardHoverEffects() {
    const cards = document.querySelectorAll('.card');
    cards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-4px)';
            this.style.boxShadow = '0 8px 16px rgba(0, 0, 0, 0.15)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
            this.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.1)';
        });
    });
}

/**
 * कम्पनी नाम सबै पृष्ठहरूमा सेटअप गर्ने
 */
function setupCompanyName() {
    // लोकल स्टोरेजबाट कम्पनी जानकारी प्राप्त गर्ने
    const currentCompany = localStorage.getItem('currentCompany');
    
    if (currentCompany) {
        try {
            const companyData = JSON.parse(currentCompany);
            const companyName = companyData.name || 'कम्पनी नाम';
            const companyAddress = companyData.address || '';
            
            // साइडबारमा कम्पनी नाम सेट गर्ने
            const sidebarCompanyName = document.getElementById('sidebarCompanyName');
            if (sidebarCompanyName) {
                sidebarCompanyName.textContent = companyName;
            }
            
            // टपबारमा कम्पनी नाम सेट गर्ने
            const currentCompanyName = document.getElementById('currentCompanyName');
            if (currentCompanyName) {
                currentCompanyName.textContent = companyName;
            }
            
            // कार्ड हेडरहरूमा कम्पनी नाम थप्ने
            addCompanyNameToCards(companyName);
            
            // मोडलहरूमा कम्पनी नाम थप्ने
            addCompanyNameToModals(companyName);
            
            // कम्पनी नाम डकुमेन्ट शीर्षकमा पनि सेट गर्ने
            document.title = document.title.includes('-') 
                ? companyName + ' - ' + document.title.split('-')[1].trim() 
                : companyName + ' - व्यवसाय रेकर्ड किपिंग सिस्टम';
                
        } catch (error) {
            console.error('कम्पनी डाटा पार्स गर्दा त्रुटि:', error);
        }
    }
}

/**
 * कार्ड हेडरहरूमा कम्पनी नाम थप्ने
 * @param {string} companyName कम्पनी नाम
 */
function addCompanyNameToCards(companyName) {
    const cardHeaders = document.querySelectorAll('.card-header');
    
    cardHeaders.forEach(header => {
        // यदि हेडरमा पहिले नै कम्पनी नाम छैन भने मात्र थप्ने
        if (!header.querySelector('.card-header-company')) {
            // मोबाइल दृश्यमा फ्लेक्स-कलम ले धेरै स्पेस ओगट्न सक्छ, चेक गर्ने
            if (header.classList.contains('d-flex') || header.querySelector('.d-flex')) {
                // द-फ्लेक्स वाला हेडर
                const companySpan = document.createElement('small');
                companySpan.className = 'card-header-company ms-1';
                companySpan.textContent = companyName;
                
                // सही ठाउँमा एपेन्ड गर्ने
                const firstChild = header.querySelector('div:first-child');
                if (firstChild) {
                    firstChild.appendChild(companySpan);
                } else {
                    header.appendChild(companySpan);
                }
            } else {
                // सामान्य हेडर
                const headerContent = header.innerHTML;
                
                // हेडरलाई परिवर्तन गर्ने
                const headerDiv = document.createElement('div');
                headerDiv.className = 'card-header-with-company';
                
                const titleDiv = document.createElement('div');
                titleDiv.innerHTML = headerContent;
                
                const companyDiv = document.createElement('div');
                companyDiv.className = 'card-header-company';
                companyDiv.textContent = companyName;
                
                // हेडर खाली गरेर नयाँ संरचना थप्ने
                header.innerHTML = '';
                headerDiv.appendChild(titleDiv);
                headerDiv.appendChild(companyDiv);
                header.appendChild(headerDiv);
            }
        }
    });
}

/**
 * मोडल हेडरहरूमा कम्पनी नाम थप्ने
 * @param {string} companyName कम्पनी नाम
 */
function addCompanyNameToModals(companyName) {
    const modalHeaders = document.querySelectorAll('.modal-header');
    
    modalHeaders.forEach(header => {
        // यदि हेडरमा पहिले नै कम्पनी नाम छैन भने मात्र थप्ने
        if (!header.querySelector('.modal-company-name')) {
            const companySpan = document.createElement('small');
            companySpan.className = 'modal-company-name text-muted d-block mt-1';
            companySpan.textContent = companyName;
            
            const title = header.querySelector('.modal-title');
            if (title) {
                title.appendChild(companySpan);
            }
        }
    });
}

/**
 * मोडल क्लोज बटनहरूमा सेतो स्टाइल थप्ने
 */
function setupModalCloseButtons() {
    const closeButtons = document.querySelectorAll('.modal .btn-close');
    closeButtons.forEach(button => {
        if (!button.classList.contains('btn-close-white')) {
            button.classList.add('btn-close-white');
        }
    });
}

// Export to global namespace for use in other scripts
window.showNotification = showNotification;
window.scrollToTop = scrollToTop;
window.setupChartLegends = setupChartLegends; 