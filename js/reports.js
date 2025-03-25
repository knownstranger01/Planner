// Reports Management

// DOM Elements
const reportType = document.getElementById('reportType');
const reportPeriod = document.getElementById('reportPeriod');
const customDateRange = document.getElementById('customDateRange');
const startDate = document.getElementById('startDate');
const endDate = document.getElementById('endDate');
const generateReportBtn = document.getElementById('generateReportBtn');

// Report Display Elements
const reportContainer = document.getElementById('reportContainer');
const reportTitle = document.getElementById('reportTitle');
const reportDateRange = document.getElementById('reportDateRange');
const reportSummary = document.getElementById('reportSummary');
const reportTable = document.getElementById('reportTable');
const reportChart1 = document.getElementById('reportChart1');
const reportChart2 = document.getElementById('reportChart2');

// Export and Print Buttons
const printReportBtn = document.getElementById('printReportBtn');
const exportPdfBtn = document.getElementById('exportPdfBtn');
const exportExcelBtn = document.getElementById('exportExcelBtn');

// Chart instances
let chart1Instance = null;
let chart2Instance = null;

// Report titles
const reportTitles = {
    'profit-loss': 'नाफा-नोक्सान विवरण',
    'balance-sheet': 'ब्यालेन्स सिट',
    'sales': 'बिक्री प्रतिवेदन',
    'purchases': 'खरिद प्रतिवेदन',
    'inventory': 'इन्भेन्टरी प्रतिवेदन',
    'tax': 'कर प्रतिवेदन',
    'customer': 'ग्राहक बाँकी प्रतिवेदन',
    'vendor': 'विक्रेता बाँकी प्रतिवेदन'
};

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

// Get date range based on period selection
function getDateRange(period) {
    const now = new Date();
    let startDateValue, endDateValue;
    
    switch (period) {
        case 'this-month':
            startDateValue = new Date(now.getFullYear(), now.getMonth(), 1);
            endDateValue = new Date(now.getFullYear(), now.getMonth() + 1, 0);
            break;
            
        case 'last-month':
            startDateValue = new Date(now.getFullYear(), now.getMonth() - 1, 1);
            endDateValue = new Date(now.getFullYear(), now.getMonth(), 0);
            break;
            
        case 'this-quarter':
            const currentQuarter = Math.floor(now.getMonth() / 3);
            startDateValue = new Date(now.getFullYear(), currentQuarter * 3, 1);
            endDateValue = new Date(now.getFullYear(), (currentQuarter + 1) * 3, 0);
            break;
            
        case 'last-quarter':
            const lastQuarter = Math.floor(now.getMonth() / 3) - 1;
            const lastQuarterYear = lastQuarter < 0 ? now.getFullYear() - 1 : now.getFullYear();
            const normalizedLastQuarter = lastQuarter < 0 ? 3 : lastQuarter;
            startDateValue = new Date(lastQuarterYear, normalizedLastQuarter * 3, 1);
            endDateValue = new Date(lastQuarterYear, (normalizedLastQuarter + 1) * 3, 0);
            break;
            
        case 'this-year':
            startDateValue = new Date(now.getFullYear(), 0, 1);
            endDateValue = new Date(now.getFullYear(), 11, 31);
            break;
            
        case 'last-year':
            startDateValue = new Date(now.getFullYear() - 1, 0, 1);
            endDateValue = new Date(now.getFullYear() - 1, 11, 31);
            break;
            
        case 'custom':
            startDateValue = startDate.value ? new Date(startDate.value) : null;
            endDateValue = endDate.value ? new Date(endDate.value) : null;
            break;
            
        default:
            startDateValue = new Date(now.getFullYear(), now.getMonth(), 1);
            endDateValue = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    }
    
    return {
        startDate: startDateValue,
        endDate: endDateValue
    };
}

// Format date range for display
function formatDateRangeText(startDate, endDate) {
    if (!startDate || !endDate) return '';
    return `${formatDate(startDate)} देखि ${formatDate(endDate)} सम्म`;
}

// Show/hide custom date range inputs
function toggleCustomDateRange() {
    if (reportPeriod.value === 'custom') {
        customDateRange.classList.remove('hidden');
    } else {
        customDateRange.classList.add('hidden');
    }
}

// Clear previous report data
function clearReportData() {
    reportSummary.innerHTML = '';
    reportTable.innerHTML = '';
    
    // Clear charts
    if (chart1Instance) {
        chart1Instance.destroy();
        chart1Instance = null;
    }
    
    if (chart2Instance) {
        chart2Instance.destroy();
        chart2Instance = null;
    }
}

// Generate report based on selected type and date range
function generateReport() {
    const selectedReportType = reportType.value;
    const selectedPeriod = reportPeriod.value;
    
    // Get date range
    const dateRange = getDateRange(selectedPeriod);
    
    // Validate date range
    if (selectedPeriod === 'custom' && (!startDate.value || !endDate.value)) {
        alert('कृपया शुरु र अन्त्य मिति दुवै प्रविष्ट गर्नुहोस्।');
        return;
    }
    
    // Clear previous report data
    clearReportData();
    
    // Update report title and date range
    reportTitle.textContent = reportTitles[selectedReportType];
    reportDateRange.textContent = `मिति अवधि: ${formatDateRangeText(dateRange.startDate, dateRange.endDate)}`;
    
    // Show report container
    reportContainer.classList.remove('hidden');
    
    // Generate the specific report
    switch (selectedReportType) {
        case 'profit-loss':
            generateProfitLossReport(dateRange);
            break;
        case 'balance-sheet':
            generateBalanceSheetReport(dateRange);
            break;
        case 'sales':
            generateSalesReport(dateRange.startDate, dateRange.endDate);
            break;
        case 'purchases':
            generatePurchasesReport(dateRange);
            break;
        case 'inventory':
            generateInventoryReport(dateRange.startDate, dateRange.endDate);
            break;
        case 'tax':
            generateTaxReport(dateRange);
            break;
        case 'customer':
            generateCustomerReport(dateRange);
            break;
        case 'vendor':
            generateVendorReport(dateRange);
            break;
        default:
            alert('अमान्य रिपोर्ट प्रकार छनौट गरिएको छ।');
    }
}

// Print the current report
function printReport() {
    window.print();
}

// Export to PDF
function exportToPdf() {
    try {
        const reportElement = document.getElementById('reportContainer');
        
        // PDF एक्सपोर्ट गर्न html2pdf लाइब्रेरी प्रयोग गर्ने
        const opt = {
            margin: 10,
            filename: `${reportTitle.textContent.trim()}_${new Date().toLocaleDateString('ne-NP')}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2 },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };
        
        // अलर्ट देखाउने
        showAlert('PDF डाउनलोड हुँदैछ...', 'info');
        
        // PDF जनरेट गर्ने
        html2pdf().set(opt).from(reportElement).save().then(() => {
            showAlert('PDF सफलतापूर्वक डाउनलोड भयो', 'success');
        });
    } catch (error) {
        console.error('PDF निर्यात गर्दा त्रुटि:', error);
        showAlert('PDF निर्यात गर्न सकिएन। कृपया पुन: प्रयास गर्नुहोस्।', 'danger');
    }
}

// Export to Excel
function exportToExcel() {
    try {
        // रिपोर्ट डाटा तयार गर्ने
        const reportTableData = [];
        
        // तालिकाबाट शीर्षकहरू प्राप्त गर्ने
        const headerRow = [];
        const headers = reportTable.querySelectorAll('thead th');
        headers.forEach(header => headerRow.push(header.textContent.trim()));
        reportTableData.push(headerRow);
        
        // तालिकाबाट डाटा प्राप्त गर्ने
        const rows = reportTable.querySelectorAll('tbody tr:not(.grand-total)');
        rows.forEach(row => {
            const rowData = [];
            row.querySelectorAll('td').forEach(cell => {
                rowData.push(cell.textContent.trim());
            });
            reportTableData.push(rowData);
        });
        
        // जम्मा पङ्क्ति प्राप्त गर्ने
        const totalRow = reportTable.querySelector('tbody tr.grand-total, tfoot tr.fw-bold');
        if (totalRow) {
            const totalRowData = [];
            totalRow.querySelectorAll('td').forEach(cell => {
                totalRowData.push(cell.textContent.trim());
            });
            reportTableData.push(totalRowData);
        }
        
        // XLSX वर्कबुक तयार गर्ने
        const ws = XLSX.utils.aoa_to_sheet(reportTableData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, reportTitle.textContent.trim());
        
        // फाइल नाम तयार गर्ने
        const fileName = `${reportTitle.textContent.trim()}_${new Date().toLocaleDateString('ne-NP')}.xlsx`;
        
        // अलर्ट देखाउने
        showAlert('Excel डाउनलोड हुँदैछ...', 'info');
        
        // एक्सेल डाउनलोड गर्ने
        XLSX.writeFile(wb, fileName);
        showAlert('Excel सफलतापूर्वक डाउनलोड भयो', 'success');
    } catch (error) {
        console.error('Excel निर्यात गर्दा त्रुटि:', error);
        showAlert('Excel निर्यात गर्न सकिएन। कृपया पुन: प्रयास गर्नुहोस्।', 'danger');
    }
}

// Generate a bar chart
function generateBarChart(chartElement, labels, data, title, backgroundColor) {
    // Destroy previous chart if exists
    if (chartElement === reportChart1 && chart1Instance) {
        chart1Instance.destroy();
    } else if (chartElement === reportChart2 && chart2Instance) {
        chart2Instance.destroy();
    }
    
    const chartConfig = {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: title,
                data: data,
                backgroundColor: backgroundColor || [
                    'rgba(54, 162, 235, 0.6)',
                    'rgba(255, 99, 132, 0.6)',
                    'rgba(255, 206, 86, 0.6)',
                    'rgba(75, 192, 192, 0.6)',
                    'rgba(153, 102, 255, 0.6)',
                    'rgba(255, 159, 64, 0.6)'
                ]
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: title
                }
            }
        }
    };
    
    const newChart = new Chart(chartElement, chartConfig);
    
    if (chartElement === reportChart1) {
        chart1Instance = newChart;
    } else if (chartElement === reportChart2) {
        chart2Instance = newChart;
    }
    
    return newChart;
}

// Generate a pie chart
function generatePieChart(chartElement, labels, data, title) {
    // Destroy previous chart if exists
    if (chartElement === reportChart1 && chart1Instance) {
        chart1Instance.destroy();
    } else if (chartElement === reportChart2 && chart2Instance) {
        chart2Instance.destroy();
    }
    
    const chartConfig = {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: [
                    'rgba(54, 162, 235, 0.6)',
                    'rgba(255, 99, 132, 0.6)',
                    'rgba(255, 206, 86, 0.6)',
                    'rgba(75, 192, 192, 0.6)',
                    'rgba(153, 102, 255, 0.6)',
                    'rgba(255, 159, 64, 0.6)'
                ]
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: title
                }
            }
        }
    };
    
    const newChart = new Chart(chartElement, chartConfig);
    
    if (chartElement === reportChart1) {
        chart1Instance = newChart;
    } else if (chartElement === reportChart2) {
        chart2Instance = newChart;
    }
    
    return newChart;
}

// Generate profit and loss report
function generateProfitLossReport(dateRange) {
    const company = getCurrentCompany();
    const currency = company ? company.currency : 'NPR';
    
    // Get transactions in date range
    const transactions = getTransactions().filter(t => {
        const transactionDate = new Date(t.date);
        return transactionDate >= dateRange.startDate && transactionDate <= dateRange.endDate;
    });
    
    // Get invoices in date range
    const invoices = getInvoices().filter(inv => {
        const invoiceDate = new Date(inv.date);
        return invoiceDate >= dateRange.startDate && invoiceDate <= dateRange.endDate;
    });
    
    // Calculate totals
    let totalIncome = 0;
    let totalExpense = 0;
    let salesIncome = 0;
    let otherIncome = 0;
    let purchaseExpense = 0;
    let otherExpense = 0;
    
    // Process transactions
    transactions.forEach(transaction => {
        if (transaction.type === 'income') {
            totalIncome += transaction.amount;
            otherIncome += transaction.amount;
        } else if (transaction.type === 'expense') {
            totalExpense += transaction.amount;
            otherExpense += transaction.amount;
        }
    });
    
    // Process invoices
    invoices.forEach(invoice => {
        if (invoice.type === 'sale') {
            salesIncome += invoice.totalAmount;
            totalIncome += invoice.totalAmount;
        } else if (invoice.type === 'purchase') {
            purchaseExpense += invoice.totalAmount;
            totalExpense += invoice.totalAmount;
        }
    });
    
    // Calculate profit/loss
    const netProfit = totalIncome - totalExpense;
    
    // Create summary
    reportSummary.innerHTML = `
        <div class="report-summary">
            <div class="row">
                <div class="col-md-6">
                    <div class="summary-card income">
                        <h3>कुल आम्दानी</h3>
                        <p class="amount">${formatCurrency(totalIncome, currency)}</p>
                    </div>
                </div>
                <div class="col-md-6">
                    <div class="summary-card expense">
                        <h3>कुल खर्च</h3>
                        <p class="amount">${formatCurrency(totalExpense, currency)}</p>
                    </div>
                </div>
            </div>
            <div class="net-profit-loss">
                <h3>${netProfit >= 0 ? 'खुद नाफा' : 'खुद नोक्सान'}</h3>
                <p class="amount ${netProfit >= 0 ? 'profit' : 'loss'}">${formatCurrency(netProfit, currency)}</p>
            </div>
        </div>
    `;
    
    // Create income/expense breakdown chart
    generatePieChart(
        reportChart1,
        ['आम्दानी', 'खर्च'],
        [totalIncome, totalExpense],
        'आम्दानी / खर्च अनुपात'
    );
    
    // Create detailed breakdown chart
    generateBarChart(
        reportChart2,
        ['बिक्री', 'अन्य आम्दानी', 'खरिद', 'अन्य खर्च'],
        [salesIncome, otherIncome, purchaseExpense, otherExpense],
        'विस्तृत आम्दानी र खर्च'
    );
    
    // Create table
    reportTable.innerHTML = `
        <thead>
            <tr>
                <th>विवरण</th>
                <th>रकम</th>
            </tr>
        </thead>
        <tbody>
            <tr class="report-section-header">
                <td colspan="2">आम्दानी</td>
            </tr>
            <tr>
                <td>बिक्री आम्दानी</td>
                <td>${formatCurrency(salesIncome, currency)}</td>
            </tr>
            <tr>
                <td>अन्य आम्दानी</td>
                <td>${formatCurrency(otherIncome, currency)}</td>
            </tr>
            <tr class="subtotal">
                <td>जम्मा आम्दानी</td>
                <td>${formatCurrency(totalIncome, currency)}</td>
            </tr>
            
            <tr class="report-section-header">
                <td colspan="2">खर्च</td>
            </tr>
            <tr>
                <td>खरिद खर्च</td>
                <td>${formatCurrency(purchaseExpense, currency)}</td>
            </tr>
            <tr>
                <td>अन्य खर्च</td>
                <td>${formatCurrency(otherExpense, currency)}</td>
            </tr>
            <tr class="subtotal">
                <td>जम्मा खर्च</td>
                <td>${formatCurrency(totalExpense, currency)}</td>
            </tr>
            
            <tr class="grand-total ${netProfit >= 0 ? 'profit' : 'loss'}">
                <td>${netProfit >= 0 ? 'खुद नाफा' : 'खुद नोक्सान'}</td>
                <td>${formatCurrency(Math.abs(netProfit), currency)}</td>
            </tr>
        </tbody>
    `;
}

// Generate balance sheet report
function generateBalanceSheetReport(dateRange) {
    const company = getCurrentCompany();
    const currency = company ? company.currency : 'NPR';
    
    // Get all relevant data
    const customers = getCustomers();
    const vendors = getVendors();
    const inventory = getInventoryItems();
    
    // Calculate assets
    let totalAssets = 0;
    let accountsReceivable = 0;
    let inventoryValue = 0;
    let cashAndBank = 50000; // Placeholder - in a real system, this would come from transactions
    
    // Calculate accounts receivable from customers
    customers.forEach(customer => {
        accountsReceivable += customer.outstandingAmount || 0;
    });
    
    // Calculate inventory value
    inventory.forEach(item => {
        inventoryValue += item.quantity * item.purchasePrice;
    });
    
    totalAssets = cashAndBank + accountsReceivable + inventoryValue;
    
    // Calculate liabilities
    let totalLiabilities = 0;
    let accountsPayable = 0;
    let loansPayable = 20000; // Placeholder - in a real system, this would come from loan records
    
    // Calculate accounts payable to vendors
    vendors.forEach(vendor => {
        accountsPayable += vendor.outstandingAmount || 0;
    });
    
    totalLiabilities = accountsPayable + loansPayable;
    
    // Calculate equity
    const ownersEquity = totalAssets - totalLiabilities;
    
    // Create summary
    reportSummary.innerHTML = `
        <div class="report-summary">
            <div class="row">
                <div class="col-md-4">
                    <div class="summary-card assets">
                        <h3>कुल सम्पत्ति</h3>
                        <p class="amount">${formatCurrency(totalAssets, currency)}</p>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="summary-card liabilities">
                        <h3>कुल दायित्व</h3>
                        <p class="amount">${formatCurrency(totalLiabilities, currency)}</p>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="summary-card equity">
                        <h3>कुल पूँजी</h3>
                        <p class="amount">${formatCurrency(ownersEquity, currency)}</p>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Create assets/liabilities chart
    generatePieChart(
        reportChart1,
        ['सम्पत्ति', 'दायित्व', 'पूँजी'],
        [totalAssets, totalLiabilities, ownersEquity],
        'सम्पत्ति, दायित्व र पूँजी अनुपात'
    );
    
    // Create detailed breakdown chart
    generateBarChart(
        reportChart2,
        ['नगद र बैंक', 'प्राप्य खाता', 'मालसामान', 'तिर्नु पर्ने खाता', 'ऋण'],
        [cashAndBank, accountsReceivable, inventoryValue, accountsPayable, loansPayable],
        'विस्तृत सम्पत्ति र दायित्व'
    );
    
    // Create table
    reportTable.innerHTML = `
        <thead>
            <tr>
                <th>विवरण</th>
                <th>रकम</th>
            </tr>
        </thead>
        <tbody>
            <tr class="report-section-header">
                <td colspan="2">सम्पत्ति</td>
            </tr>
            <tr>
                <td>नगद र बैंक</td>
                <td>${formatCurrency(cashAndBank, currency)}</td>
            </tr>
            <tr>
                <td>प्राप्य खाता</td>
                <td>${formatCurrency(accountsReceivable, currency)}</td>
            </tr>
            <tr>
                <td>मालसामान</td>
                <td>${formatCurrency(inventoryValue, currency)}</td>
            </tr>
            <tr class="subtotal">
                <td>जम्मा सम्पत्ति</td>
                <td>${formatCurrency(totalAssets, currency)}</td>
            </tr>
            
            <tr class="report-section-header">
                <td colspan="2">दायित्व</td>
            </tr>
            <tr>
                <td>तिर्नु पर्ने खाता</td>
                <td>${formatCurrency(accountsPayable, currency)}</td>
            </tr>
            <tr>
                <td>ऋण</td>
                <td>${formatCurrency(loansPayable, currency)}</td>
            </tr>
            <tr class="subtotal">
                <td>जम्मा दायित्व</td>
                <td>${formatCurrency(totalLiabilities, currency)}</td>
            </tr>
            
            <tr class="report-section-header">
                <td colspan="2">पूँजी</td>
            </tr>
            <tr>
                <td>मालिकको पूँजी</td>
                <td>${formatCurrency(ownersEquity, currency)}</td>
            </tr>
            <tr class="subtotal">
                <td>जम्मा पूँजी</td>
                <td>${formatCurrency(ownersEquity, currency)}</td>
            </tr>
            
            <tr class="grand-total">
                <td>जम्मा दायित्व र पूँजी</td>
                <td>${formatCurrency(totalLiabilities + ownersEquity, currency)}</td>
            </tr>
        </tbody>
    `;
}

// Generate sales report
function generateSalesReport(startDate, endDate) {
    // रिपोर्ट शीर्षक र मिति सेट गर्ने
    reportTitle.textContent = reportTitles["sales"];
    reportDateRange.textContent = `${formatDate(startDate)} - ${formatDate(endDate)}`;
    
    const currentCompany = getCurrentCompany();
    const transactions = currentCompany.transactions || [];
    
    // बिक्री सम्बन्धी लेनदेनहरू फिल्टर गर्ने
    const salesTransactions = transactions.filter(t => 
        t.type === 'sale' && 
        new Date(t.date) >= startDate && 
        new Date(t.date) <= endDate
    );
    
    // यदि कुनै बिक्री छैन भने
    if (salesTransactions.length === 0) {
        reportSummary.innerHTML = '<div class="alert alert-info">यस अवधिमा कुनै बिक्री रेकर्ड छैन।</div>';
        reportTable.innerHTML = '';
        return;
    }
    
    // जम्मा बिक्री र औसत गणना गर्ने
    let totalSales = 0;
    salesTransactions.forEach(t => totalSales += parseFloat(t.amount));
    const averageSale = totalSales / salesTransactions.length;
    
    // ग्राहक अनुसार बिक्री गणना गर्ने
    const salesByCustomer = {};
    salesTransactions.forEach(t => {
        if (!salesByCustomer[t.entity]) {
            salesByCustomer[t.entity] = 0;
        }
        salesByCustomer[t.entity] += parseFloat(t.amount);
    });
    
    // मिति अनुसार बिक्री गणना गर्ने
    const salesByDate = {};
    salesTransactions.forEach(t => {
        const dateKey = t.date.split('T')[0];
        if (!salesByDate[dateKey]) {
            salesByDate[dateKey] = 0;
        }
        salesByDate[dateKey] += parseFloat(t.amount);
    });
    
    // सारांश डिस्प्ले गर्ने
    reportSummary.innerHTML = `
        <div class="row">
            <div class="col-md-4">
                <div class="card bg-success text-white">
                    <div class="card-body">
                        <h5 class="card-title">जम्मा बिक्री</h5>
                        <h3 class="card-text">${formatCurrency(totalSales)}</h3>
                    </div>
                </div>
            </div>
            <div class="col-md-4">
                <div class="card bg-info text-white">
                    <div class="card-body">
                        <h5 class="card-title">बिक्री संख्या</h5>
                        <h3 class="card-text">${salesTransactions.length}</h3>
                    </div>
                </div>
            </div>
            <div class="col-md-4">
                <div class="card bg-primary text-white">
                    <div class="card-body">
                        <h5 class="card-title">औसत बिक्री</h5>
                        <h3 class="card-text">${formatCurrency(averageSale)}</h3>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // तालिका निर्माण गर्ने
    reportTable.innerHTML = `
        <table class="table table-striped">
            <thead>
                <tr>
                    <th>मिति</th>
                    <th>ग्राहक</th>
                    <th>विवरण</th>
                    <th>रकम</th>
                </tr>
            </thead>
            <tbody>
                ${salesTransactions.map(t => `
                    <tr>
                        <td>${formatDate(t.date)}</td>
                        <td>${t.entity}</td>
                        <td>${t.description || '-'}</td>
                        <td class="text-end">${formatCurrency(t.amount)}</td>
                    </tr>
                `).join('')}
                <tr class="table-dark">
                    <td colspan="3" class="text-end fw-bold">जम्मा</td>
                    <td class="text-end fw-bold">${formatCurrency(totalSales)}</td>
                </tr>
            </tbody>
        </table>
    `;
    
    // ग्राफ डाटा तयार गर्ने
    const customerLabels = Object.keys(salesByCustomer);
    const customerData = customerLabels.map(c => salesByCustomer[c]);
    
    const dateLabels = Object.keys(salesByDate).sort();
    const dateData = dateLabels.map(d => salesByDate[d]);
    
    // पाई चार्ट - ग्राहक अनुसार बिक्री
    createPieChart('ग्राहक अनुसार बिक्री', customerLabels, customerData);
    
    // बार चार्ट - मिति अनुसार बिक्री
    createBarChart('मिति अनुसार बिक्री', dateLabels.map(d => formatDate(d)), dateData);
}

// Generate inventory report
function generateInventoryReport(startDate, endDate) {
    try {
        const currentUser = getCurrentUser();
        const currentCompany = getCurrentCompany();
        if (!currentUser || !currentCompany) return;

        // इन्भेन्टरी आइटमहरू प्राप्त गर्ने
        const inventoryItems = getAllInventoryItems();

        // यदि डाटा छैन भने
        if (inventoryItems.length === 0) {
            reportSummary.innerHTML = '<div class="alert alert-info">कुनै इन्भेन्टरी आइटम फेला परेन।</div>';
            return;
        }

        // शीर्षक र मिति सेट गर्ने
        reportTitle.textContent = reportTitles['inventory'];
        reportDateRange.textContent = `मिति: ${formatDate(new Date())}`;

        // इन्भेन्टरी सारांश तयार गर्ने
        const totalItems = inventoryItems.length;
        const totalValue = inventoryItems.reduce((sum, item) => sum + (item.quantity * item.costPrice), 0);
        const lowStockItems = inventoryItems.filter(item => item.quantity <= item.reorderLevel).length;
        
        reportSummary.innerHTML = `
            <div class="row">
                <div class="col-md-4">
                    <div class="card bg-primary text-white">
                        <div class="card-body text-center">
                            <h5 class="card-title">कुल आइटमहरू</h5>
                            <h3>${totalItems}</h3>
                        </div>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="card bg-success text-white">
                        <div class="card-body text-center">
                            <h5 class="card-title">कुल मूल्य</h5>
                            <h3>${formatCurrency(totalValue)}</h3>
                        </div>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="card bg-warning text-dark">
                        <div class="card-body text-center">
                            <h5 class="card-title">कम स्टक आइटमहरू</h5>
                            <h3>${lowStockItems}</h3>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // श्रेणी अनुसार इन्भेन्टरी वितरण
        const inventoryByCategory = {};
        inventoryItems.forEach(item => {
            const category = item.category || 'अवर्गीकृत';
            if (!inventoryByCategory[category]) {
                inventoryByCategory[category] = {
                    count: 0,
                    value: 0
                };
            }
            inventoryByCategory[category].count += 1;
            inventoryByCategory[category].value += (item.quantity * item.costPrice);
        });

        // पाई चार्ट तयार गर्ने - श्रेणी अनुसार मूल्य वितरण
        const categoryLabels = Object.keys(inventoryByCategory);
        const categoryValues = categoryLabels.map(cat => inventoryByCategory[cat].value);
        
        if (reportChart1) {
            const ctx = reportChart1.getContext('2d');
            chart1Instance = new Chart(ctx, {
                type: 'pie',
                data: {
                    labels: categoryLabels,
                    datasets: [{
                        label: 'श्रेणी अनुसार इन्भेन्टरी मूल्य',
                        data: categoryValues,
                        backgroundColor: [
                            'rgba(255, 99, 132, 0.6)',
                            'rgba(54, 162, 235, 0.6)',
                            'rgba(255, 206, 86, 0.6)',
                            'rgba(75, 192, 192, 0.6)',
                            'rgba(153, 102, 255, 0.6)',
                            'rgba(255, 159, 64, 0.6)'
                        ]
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        title: {
                            display: true,
                            text: 'श्रेणी अनुसार इन्भेन्टरी मूल्य'
                        }
                    }
                }
            });
        }

        // तालिका तयार गर्ने
        reportTable.innerHTML = `
            <table class="table table-striped">
                <thead>
                    <tr>
                        <th>कोड</th>
                        <th>आइटम नाम</th>
                        <th>श्रेणी</th>
                        <th>मात्रा</th>
                        <th>प्रति इकाइ लागत</th>
                        <th>बिक्री मूल्य</th>
                        <th>कुल मूल्य</th>
                        <th>स्थिति</th>
                    </tr>
                </thead>
                <tbody>
                    ${inventoryItems.map(item => `
                        <tr>
                            <td>${item.itemCode || '-'}</td>
                            <td>${item.name}</td>
                            <td>${item.category || 'अवर्गीकृत'}</td>
                            <td>${item.quantity}</td>
                            <td>${formatCurrency(item.costPrice)}</td>
                            <td>${formatCurrency(item.sellingPrice)}</td>
                            <td>${formatCurrency(item.quantity * item.costPrice)}</td>
                            <td>
                                ${item.quantity <= item.reorderLevel 
                                    ? '<span class="badge bg-danger">कम स्टक</span>' 
                                    : '<span class="badge bg-success">पर्याप्त</span>'}
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
                <tfoot>
                    <tr class="fw-bold">
                        <td colspan="6">जम्मा</td>
                        <td>${formatCurrency(totalValue)}</td>
                        <td></td>
                    </tr>
                </tfoot>
            </table>
        `;
    } catch (error) {
        console.error('इन्भेन्टरी रिपोर्ट जेनरेट गर्दा त्रुटि:', error);
        reportSummary.innerHTML = '<div class="alert alert-danger">रिपोर्ट जेनरेट गर्न सकिएन।</div>';
    }
}

// Generate customer report
function generateCustomerReport(dateRange) {
    const company = getCurrentCompany();
    const currency = company ? company.currency : 'NPR';
    
    // Get customers
    const customers = getCustomers();
    
    // Get sales invoices in date range
    const salesInvoices = getInvoices().filter(inv => {
        const invoiceDate = new Date(inv.date);
        return inv.type === 'sale' && 
               invoiceDate >= dateRange.startDate && 
               invoiceDate <= dateRange.endDate;
    });
    
    // Customer sales data
    const customerData = {};
    
    // Initialize customer data
    customers.forEach(customer => {
        customerData[customer.id] = {
            id: customer.id,
            name: customer.name,
            contactPerson: customer.contactPerson,
            phone: customer.phone,
            email: customer.email,
            totalSales: 0,
            totalPaid: 0,
            totalDue: customer.outstandingAmount || 0,
            invoiceCount: 0
        };
    });
    
    // Process sales invoices
    salesInvoices.forEach(invoice => {
        if (customerData[invoice.customerId]) {
            customerData[invoice.customerId].totalSales += invoice.totalAmount;
            customerData[invoice.customerId].totalPaid += invoice.paidAmount || 0;
            customerData[invoice.customerId].invoiceCount++;
        }
    });
    
    // Calculate totals
    let totalSales = 0;
    let totalPaid = 0;
    let totalDue = 0;
    let activeCustomers = 0;
    
    Object.values(customerData).forEach(customer => {
        totalSales += customer.totalSales;
        totalPaid += customer.totalPaid;
        totalDue += customer.totalDue;
        
        if (customer.invoiceCount > 0) {
            activeCustomers++;
        }
    });
    
    // Create summary
    reportSummary.innerHTML = `
        <div class="report-summary">
            <div class="row">
                <div class="col-md-3">
                    <div class="summary-card customers">
                        <h3>कुल ग्राहक</h3>
                        <p class="amount">${customers.length}</p>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="summary-card active">
                        <h3>सक्रिय ग्राहक</h3>
                        <p class="amount">${activeCustomers}</p>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="summary-card sales">
                        <h3>कुल बिक्री</h3>
                        <p class="amount">${formatCurrency(totalSales, currency)}</p>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="summary-card due">
                        <h3>कुल बाँकी</h3>
                        <p class="amount">${formatCurrency(totalDue, currency)}</p>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Top customers by sales
    const topCustomersBySales = Object.values(customerData)
        .sort((a, b) => b.totalSales - a.totalSales)
        .slice(0, 5);
    
    generateBarChart(
        reportChart1,
        topCustomersBySales.map(c => c.name),
        topCustomersBySales.map(c => c.totalSales),
        'शीर्ष ५ ग्राहक (बिक्री अनुसार)'
    );
    
    // Top customers by outstanding amount
    const topCustomersByDue = Object.values(customerData)
        .sort((a, b) => b.totalDue - a.totalDue)
        .slice(0, 5);
    
    generateBarChart(
        reportChart2,
        topCustomersByDue.map(c => c.name),
        topCustomersByDue.map(c => c.totalDue),
        'शीर्ष ५ ग्राहक (बाँकी रकम अनुसार)'
    );
    
    // Create table
    reportTable.innerHTML = `
        <thead>
            <tr>
                <th>ग्राहक</th>
                <th>सम्पर्क व्यक्ति</th>
                <th>फोन</th>
                <th>कुल बिक्री</th>
                <th>भुक्तानी प्राप्त</th>
                <th>बाँकी रकम</th>
                <th>इन्भ्वाइस संख्या</th>
            </tr>
        </thead>
        <tbody>
            ${customers.length === 0 ? 
                '<tr><td colspan="7" class="text-center">कुनै ग्राहकहरू छैनन्</td></tr>' : 
                Object.values(customerData).map(customer => {
                    return `
                        <tr>
                            <td>${customer.name}</td>
                            <td>${customer.contactPerson || '-'}</td>
                            <td>${customer.phone || '-'}</td>
                            <td>${formatCurrency(customer.totalSales, currency)}</td>
                            <td>${formatCurrency(customer.totalPaid, currency)}</td>
                            <td>${formatCurrency(customer.totalDue, currency)}</td>
                            <td>${customer.invoiceCount}</td>
                        </tr>
                    `;
                }).join('')
            }
            <tr class="grand-total">
                <td colspan="3">जम्मा</td>
                <td>${formatCurrency(totalSales, currency)}</td>
                <td>${formatCurrency(totalPaid, currency)}</td>
                <td>${formatCurrency(totalDue, currency)}</td>
                <td></td>
            </tr>
        </tbody>
    `;
}

// Generate vendor report
function generateVendorReport(dateRange) {
    const company = getCurrentCompany();
    const currency = company ? company.currency : 'NPR';
    
    // Get vendors
    const vendors = getVendors();
    
    // Get purchase invoices in date range
    const purchaseInvoices = getInvoices().filter(inv => {
        const invoiceDate = new Date(inv.date);
        return inv.type === 'purchase' && 
               invoiceDate >= dateRange.startDate && 
               invoiceDate <= dateRange.endDate;
    });
    
    // Vendor purchase data
    const vendorData = {};
    
    // Initialize vendor data
    vendors.forEach(vendor => {
        vendorData[vendor.id] = {
            id: vendor.id,
            name: vendor.name,
            contactPerson: vendor.contactPerson,
            phone: vendor.phone,
            email: vendor.email,
            totalPurchases: 0,
            totalPaid: 0,
            totalDue: vendor.outstandingAmount || 0,
            invoiceCount: 0
        };
    });
    
    // Process purchase invoices
    purchaseInvoices.forEach(invoice => {
        if (vendorData[invoice.vendorId]) {
            vendorData[invoice.vendorId].totalPurchases += invoice.totalAmount;
            vendorData[invoice.vendorId].totalPaid += invoice.paidAmount || 0;
            vendorData[invoice.vendorId].invoiceCount++;
        }
    });
    
    // Calculate totals
    let totalPurchases = 0;
    let totalPaid = 0;
    let totalDue = 0;
    let activeVendors = 0;
    
    Object.values(vendorData).forEach(vendor => {
        totalPurchases += vendor.totalPurchases;
        totalPaid += vendor.totalPaid;
        totalDue += vendor.totalDue;
        
        if (vendor.invoiceCount > 0) {
            activeVendors++;
        }
    });
    
    // Create summary
    reportSummary.innerHTML = `
        <div class="report-summary">
            <div class="row">
                <div class="col-md-3">
                    <div class="summary-card vendors">
                        <h3>कुल विक्रेता</h3>
                        <p class="amount">${vendors.length}</p>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="summary-card active">
                        <h3>सक्रिय विक्रेता</h3>
                        <p class="amount">${activeVendors}</p>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="summary-card purchases">
                        <h3>कुल खरिद</h3>
                        <p class="amount">${formatCurrency(totalPurchases, currency)}</p>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="summary-card due">
                        <h3>कुल बाँकी</h3>
                        <p class="amount">${formatCurrency(totalDue, currency)}</p>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Top vendors by purchases
    const topVendorsByPurchases = Object.values(vendorData)
        .sort((a, b) => b.totalPurchases - a.totalPurchases)
        .slice(0, 5);
    
    generateBarChart(
        reportChart1,
        topVendorsByPurchases.map(v => v.name),
        topVendorsByPurchases.map(v => v.totalPurchases),
        'शीर्ष ५ विक्रेता (खरिद अनुसार)'
    );
    
    // Top vendors by outstanding amount
    const topVendorsByDue = Object.values(vendorData)
        .sort((a, b) => b.totalDue - a.totalDue)
        .slice(0, 5);
    
    generateBarChart(
        reportChart2,
        topVendorsByDue.map(v => v.name),
        topVendorsByDue.map(v => v.totalDue),
        'शीर्ष ५ विक्रेता (बाँकी रकम अनुसार)'
    );
    
    // Create table
    reportTable.innerHTML = `
        <thead>
            <tr>
                <th>विक्रेता</th>
                <th>सम्पर्क व्यक्ति</th>
                <th>फोन</th>
                <th>कुल खरिद</th>
                <th>भुक्तानी गरेको</th>
                <th>बाँकी रकम</th>
                <th>इन्भ्वाइस संख्या</th>
            </tr>
        </thead>
        <tbody>
            ${vendors.length === 0 ? 
                '<tr><td colspan="7" class="text-center">कुनै विक्रेताहरू छैनन्</td></tr>' : 
                Object.values(vendorData).map(vendor => {
                    return `
                        <tr>
                            <td>${vendor.name}</td>
                            <td>${vendor.contactPerson || '-'}</td>
                            <td>${vendor.phone || '-'}</td>
                            <td>${formatCurrency(vendor.totalPurchases, currency)}</td>
                            <td>${formatCurrency(vendor.totalPaid, currency)}</td>
                            <td>${formatCurrency(vendor.totalDue, currency)}</td>
                            <td>${vendor.invoiceCount}</td>
                        </tr>
                    `;
                }).join('')
            }
            <tr class="grand-total">
                <td colspan="3">जम्मा</td>
                <td>${formatCurrency(totalPurchases, currency)}</td>
                <td>${formatCurrency(totalPaid, currency)}</td>
                <td>${formatCurrency(totalDue, currency)}</td>
                <td></td>
            </tr>
        </tbody>
    `;
}

// Generate tax report
function generateTaxReport(dateRange) {
    try {
        const currentUser = getCurrentUser();
        const currentCompany = getCurrentCompany();
        if (!currentUser || !currentCompany) return;

        // सेल्स इन्भोइस मार्फत कर डाटा प्राप्त गर्ने
        const salesInvoices = getAllInvoices().filter(invoice => 
            invoice.type === 'sales' && 
            invoice.date >= dateRange.startDate && 
            invoice.date <= dateRange.endDate);
            
        const purchaseInvoices = getAllInvoices().filter(invoice => 
            invoice.type === 'purchase' && 
            invoice.date >= dateRange.startDate && 
            invoice.date <= dateRange.endDate);

        // यदि डाटा छैन भने
        if (salesInvoices.length === 0 && purchaseInvoices.length === 0) {
            reportSummary.innerHTML = '<div class="alert alert-info">यस अवधिमा कुनै कर डाटा फेला परेन।</div>';
            return;
        }

        // शीर्षक र मिति सेट गर्ने
        reportTitle.textContent = reportTitles['tax'];
        reportDateRange.textContent = formatDateRangeText(dateRange.startDate, dateRange.endDate);

        // कर सारांश तयार गर्ने
        const totalCollectedTax = salesInvoices.reduce((sum, inv) => sum + (inv.taxAmount || 0), 0);
        const totalPaidTax = purchaseInvoices.reduce((sum, inv) => sum + (inv.taxAmount || 0), 0);
        const netTaxLiability = totalCollectedTax - totalPaidTax;
        
        reportSummary.innerHTML = `
            <div class="row">
                <div class="col-md-4">
                    <div class="card bg-primary text-white">
                        <div class="card-body text-center">
                            <h5 class="card-title">संकलित कर</h5>
                            <h3>${formatCurrency(totalCollectedTax)}</h3>
                        </div>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="card bg-danger text-white">
                        <div class="card-body text-center">
                            <h5 class="card-title">भुक्तानी गरिएको कर</h5>
                            <h3>${formatCurrency(totalPaidTax)}</h3>
                        </div>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="card ${netTaxLiability >= 0 ? 'bg-warning text-dark' : 'bg-success text-white'}">
                        <div class="card-body text-center">
                            <h5 class="card-title">खुद कर दायित्व</h5>
                            <h3>${formatCurrency(netTaxLiability)}</h3>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // बार चार्ट - मासिक कर विश्लेषण
        const monthlyData = getMonthlyTaxData(salesInvoices, purchaseInvoices, dateRange);
        
        if (reportChart1) {
            const ctx = reportChart1.getContext('2d');
            chart1Instance = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: monthlyData.labels,
                    datasets: [
                        {
                            label: 'संकलित कर',
                            data: monthlyData.collectedTax,
                            backgroundColor: 'rgba(54, 162, 235, 0.6)',
                            borderColor: 'rgba(54, 162, 235, 1)',
                            borderWidth: 1
                        },
                        {
                            label: 'भुक्तानी गरिएको कर',
                            data: monthlyData.paidTax,
                            backgroundColor: 'rgba(255, 99, 132, 0.6)',
                            borderColor: 'rgba(255, 99, 132, 1)',
                            borderWidth: 1
                        }
                    ]
                },
                options: {
                    responsive: true,
                    plugins: {
                        title: {
                            display: true,
                            text: 'मासिक कर विश्लेषण'
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });
        }

        // तालिका तयार गर्ने - जम्मा भएको कर
        reportTable.innerHTML = `
            <h4 class="mt-4 mb-3">कर विवरण</h4>
            <div class="row">
                <div class="col-md-6">
                    <h5>संकलित कर (बिक्रीबाट)</h5>
                    <table class="table table-striped">
                        <thead>
                            <tr>
                                <th>मिति</th>
                                <th>बिल नं.</th>
                                <th>ग्राहक</th>
                                <th>कर रकम</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${salesInvoices.map(invoice => `
                                <tr>
                                    <td>${formatDate(invoice.date)}</td>
                                    <td>${invoice.invoiceNumber}</td>
                                    <td>${invoice.customerName || '-'}</td>
                                    <td>${formatCurrency(invoice.taxAmount || 0)}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                        <tfoot>
                            <tr class="fw-bold">
                                <td colspan="3">जम्मा</td>
                                <td>${formatCurrency(totalCollectedTax)}</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
                <div class="col-md-6">
                    <h5>भुक्तानी गरिएको कर (खरिदबाट)</h5>
                    <table class="table table-striped">
                        <thead>
                            <tr>
                                <th>मिति</th>
                                <th>बिल नं.</th>
                                <th>विक्रेता</th>
                                <th>कर रकम</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${purchaseInvoices.map(invoice => `
                                <tr>
                                    <td>${formatDate(invoice.date)}</td>
                                    <td>${invoice.invoiceNumber}</td>
                                    <td>${invoice.vendorName || '-'}</td>
                                    <td>${formatCurrency(invoice.taxAmount || 0)}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                        <tfoot>
                            <tr class="fw-bold">
                                <td colspan="3">जम्मा</td>
                                <td>${formatCurrency(totalPaidTax)}</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>
        `;
    } catch (error) {
        console.error('कर रिपोर्ट जेनरेट गर्दा त्रुटि:', error);
        reportSummary.innerHTML = '<div class="alert alert-danger">रिपोर्ट जेनरेट गर्न सकिएन।</div>';
    }
}

// मासिक कर डाटा प्राप्त गर्ने
function getMonthlyTaxData(salesInvoices, purchaseInvoices, dateRange) {
    const monthLabels = [];
    const collectedTaxData = [];
    const paidTaxData = [];
    
    const startMonth = dateRange.startDate.getMonth();
    const startYear = dateRange.startDate.getFullYear();
    const endMonth = dateRange.endDate.getMonth();
    const endYear = dateRange.endDate.getFullYear();
    
    const monthNames = ['जनवरी', 'फेब्रुअरी', 'मार्च', 'अप्रिल', 'मे', 'जुन', 
                         'जुलाई', 'अगस्ट', 'सेप्टेम्बर', 'अक्टोबर', 'नोभेम्बर', 'डिसेम्बर'];
    
    let currentYear = startYear;
    let currentMonth = startMonth;
    
    while (currentYear < endYear || (currentYear === endYear && currentMonth <= endMonth)) {
        const monthLabel = `${monthNames[currentMonth]} ${currentYear}`;
        monthLabels.push(monthLabel);
        
        // यस महिनाको बिक्रीबाट संकलित कर
        const collectedTax = salesInvoices
            .filter(invoice => {
                const invDate = new Date(invoice.date);
                return invDate.getMonth() === currentMonth && invDate.getFullYear() === currentYear;
            })
            .reduce((sum, inv) => sum + (inv.taxAmount || 0), 0);
        
        // यस महिनाको खरिदबाट भुक्तानी गरिएको कर
        const paidTax = purchaseInvoices
            .filter(invoice => {
                const invDate = new Date(invoice.date);
                return invDate.getMonth() === currentMonth && invDate.getFullYear() === currentYear;
            })
            .reduce((sum, inv) => sum + (inv.taxAmount || 0), 0);
        
        collectedTaxData.push(collectedTax);
        paidTaxData.push(paidTax);
        
        // अर्को महिनामा जाने
        currentMonth++;
        if (currentMonth > 11) {
            currentMonth = 0;
            currentYear++;
        }
    }
    
    return {
        labels: monthLabels,
        collectedTax: collectedTaxData,
        paidTax: paidTaxData
    };
}

// अलर्ट देखाउने फंक्सन
function showAlert(message, type) {
    const alertContainer = document.getElementById('alertContainer') || createAlertContainer();
    const alert = document.createElement('div');
    alert.className = `alert alert-${type} alert-dismissible fade show`;
    alert.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    
    alertContainer.appendChild(alert);
    
    // 5 सेकेन्डपछि अलर्ट हटाउने
    setTimeout(() => {
        alert.classList.remove('show');
        setTimeout(() => alert.remove(), 150);
    }, 5000);
}

// अलर्ट कन्टेनर तयार गर्ने फंक्सन
function createAlertContainer() {
    const container = document.createElement('div');
    container.id = 'alertContainer';
    container.className = 'position-fixed top-0 end-0 p-3';
    container.style.zIndex = '5000';
    document.body.appendChild(container);
    return container;
}

// रिपोर्ट विकल्पहरू फिल्ड र बटनहरू रेस्पोन्सिभ गर्ने
function makeButtonsResponsive() {
    const reportControlsContainer = document.querySelector('.report-controls');
    const reportActionsContainer = document.querySelector('.report-actions');
    
    if (reportControlsContainer) {
        // मोबाइल स्क्रिनमा विकल्पहरूलाई ठाडो लेआउटमा कन्भर्ट गर्ने
        if (window.innerWidth < 768) {
            reportControlsContainer.classList.add('flex-column');
            
            // सबै विकल्प फिल्डहरूलाई पूर्ण चौडाइ दिने
            const formGroups = reportControlsContainer.querySelectorAll('.form-group');
            formGroups.forEach(group => {
                group.classList.add('w-100', 'mb-2');
            });
            
            // जेनरेट बटनलाई पूर्ण चौडाइ बनाउने
            if (generateReportBtn) {
                generateReportBtn.classList.add('w-100', 'mt-2');
            }
        } else {
            reportControlsContainer.classList.remove('flex-column');
            
            // सबै विकल्प फिल्डहरूको पूर्ण चौडाइ हटाउने
            const formGroups = reportControlsContainer.querySelectorAll('.form-group');
            formGroups.forEach(group => {
                group.classList.remove('w-100', 'mb-2');
            });
            
            // जेनरेट बटनको पूर्ण चौडाइ हटाउने
            if (generateReportBtn) {
                generateReportBtn.classList.remove('w-100', 'mt-2');
            }
        }
    }
    
    // रिपोर्ट एक्सपोर्ट/प्रिन्ट बटनहरू रेस्पोन्सिभ गर्ने
    if (reportActionsContainer) {
        if (window.innerWidth < 768) {
            reportActionsContainer.classList.add('flex-column', 'align-items-stretch');
            
            // सबै बटनहरूलाई पूर्ण चौडाइ बनाउने
            const actionButtons = reportActionsContainer.querySelectorAll('button');
            actionButtons.forEach(button => {
                button.classList.add('w-100', 'mb-2');
            });
        } else {
            reportActionsContainer.classList.remove('flex-column', 'align-items-stretch');
            
            // सबै बटनहरूको पूर्ण चौडाइ हटाउने
            const actionButtons = reportActionsContainer.querySelectorAll('button');
            actionButtons.forEach(button => {
                button.classList.remove('w-100', 'mb-2');
            });
        }
    }
}

// सारांश कार्डहरू रेस्पोन्सिभ गर्ने
function makeSummaryCardsResponsive() {
    const summaryRow = reportSummary.querySelector('.row');
    if (summaryRow) {
        const cardColumns = summaryRow.querySelectorAll('.col-md-3, .col-md-4, .col-md-6');
        
        // मोबाइल स्क्रिनमा कलमहरूलाई पूर्ण चौडाइ दिने
        if (window.innerWidth < 768) {
            cardColumns.forEach(column => {
                column.classList.add('mb-3');
            });
        } else {
            cardColumns.forEach(column => {
                column.classList.remove('mb-3');
            });
        }
    }
}

// तालिका रेस्पोन्सिभ गर्ने
function makeTableResponsive() {
    const tables = document.querySelectorAll('.table');
    
    tables.forEach(table => {
        // बुटस्ट्र्याप रेस्पोन्सिभ टेबल र्याप थप्ने
        if (!table.parentElement.classList.contains('table-responsive')) {
            const wrapper = document.createElement('div');
            wrapper.classList.add('table-responsive');
            table.parentNode.insertBefore(wrapper, table);
            wrapper.appendChild(table);
        }
    });
}

// विन्डो साइज परिवर्तन भएमा रेस्पोन्सिभता अपडेट गर्ने
function handleWindowResize() {
    makeButtonsResponsive();
    makeSummaryCardsResponsive();
    makeTableResponsive();
}

// रिपोर्ट जेनरेट गर्दा रेस्पोन्सिभता लागू गर्ने - मूल generateReport फङ्क्सन अपडेट गर्ने
const originalGenerateReport = generateReport;
generateReport = function() {
    originalGenerateReport();
    setTimeout(() => {
        makeSummaryCardsResponsive();
        makeTableResponsive();
    }, 100); // थोडै समय पछि रेस्पोन्सिभता लागू गर्ने, जब डोम अपडेट हुन्छ
};

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
    // रिपोर्ट प्रकार परिवर्तन भएमा
    if (reportType) {
        reportType.addEventListener('change', toggleCustomDateRange);
    }
    
    // अवधि परिवर्तन भएमा
    if (reportPeriod) {
        reportPeriod.addEventListener('change', toggleCustomDateRange);
    }
    
    // रिपोर्ट जेनरेट गर्ने बटन क्लिक भएमा
    if (generateReportBtn) {
        generateReportBtn.addEventListener('click', generateReport);
    }
    
    // प्रिन्ट बटन क्लिक भएमा
    if (printReportBtn) {
        printReportBtn.addEventListener('click', printReport);
    }
    
    // PDF एक्सपोर्ट बटन क्लिक भएमा
    if (exportPdfBtn) {
        exportPdfBtn.addEventListener('click', exportToPdf);
    }
    
    // Excel एक्सपोर्ट बटन क्लिक भएमा
    if (exportExcelBtn) {
        exportExcelBtn.addEventListener('click', exportToExcel);
    }
    
    // शुरूमा अवधि परिवर्तन गर्ने
    toggleCustomDateRange();
    
    // शुरूमै रेस्पोन्सिभता लागू गर्ने
    makeButtonsResponsive();
    makeSummaryCardsResponsive();
    makeTableResponsive();
    
    // विन्डो रिसाइज इभेन्ट लिस्नर थप्ने
    window.addEventListener('resize', handleWindowResize);
}); 