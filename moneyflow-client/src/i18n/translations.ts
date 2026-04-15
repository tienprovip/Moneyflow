export type Locale = "vi" | "en";

const translations = {
  // Sidebar
  "nav.overview": { vi: "Tổng quan", en: "Overview" },
  "nav.transactions": { vi: "Giao dịch", en: "Transactions" },
  "nav.stocks": { vi: "Cổ phiếu", en: "Stocks" },
  "nav.gold": { vi: "Vàng", en: "Gold" },
  "nav.savings": { vi: "Tiết kiệm", en: "Savings" },
  "nav.settings": { vi: "Cài đặt", en: "Settings" },
  "nav.more": { vi: "Thêm", en: "More" },
  "nav.darkMode": { vi: "Chế độ tối", en: "Dark Mode" },
  "nav.lightMode": { vi: "Chế độ sáng", en: "Light Mode" },
  "nav.darkShort": { vi: "Tối", en: "Dark" },
  "nav.lightShort": { vi: "Sáng", en: "Light" },

  // Dashboard - Greeting
  "greeting.morning": { vi: "Chào buổi sáng", en: "Good morning" },
  "greeting.afternoon": { vi: "Chào buổi chiều", en: "Good afternoon" },
  "greeting.evening": { vi: "Chào buổi tối", en: "Good evening" },
  "greeting.netWorth": { vi: "Tổng tài sản ròng", en: "Total net worth" },

  // Dashboard - Asset Cards
  "asset.cash": { vi: "Tiền mặt", en: "Cash" },
  "asset.stocks": { vi: "Danh mục cổ phiếu", en: "Stock Portfolio" },
  "asset.gold": { vi: "Giá trị vàng", en: "Gold Value" },

  // Dashboard - Net Worth Chart
  "chart.netWorthTitle": {
    vi: "Tài sản ròng theo thời gian",
    en: "Net worth over time",
  },
  "chart.last7Months": { vi: "7 tháng gần nhất", en: "Last 7 months" },
  "chart.netWorthLabel": { vi: "Tài sản ròng", en: "Net worth" },

  // Dashboard - Allocation Chart
  "allocation.title": { vi: "Phân bổ tài sản", en: "Asset Allocation" },
  "allocation.subtitle": { vi: "Cơ cấu danh mục", en: "Portfolio breakdown" },
  "allocation.cash": { vi: "Tiền mặt", en: "Cash" },
  "allocation.stocks": { vi: "Cổ phiếu", en: "Stocks" },
  "allocation.gold": { vi: "Vàng", en: "Gold" },

  // Dashboard - Stock Table
  "stock.title": { vi: "Danh mục cổ phiếu", en: "Stock Portfolio" },
  "stock.count": { vi: "5 mã cổ phiếu", en: "5 stocks" },
  "stock.viewAll": { vi: "Xem tất cả", en: "View all" },
  "stock.symbol": { vi: "Mã CP", en: "Symbol" },
  "stock.qty": { vi: "KL", en: "Qty" },
  "stock.avgPrice": { vi: "Giá TB", en: "Avg Price" },
  "stock.currentPrice": { vi: "Giá TT", en: "Current" },
  "stock.profitLoss": { vi: "Lãi/Lỗ", en: "P/L" },

  // Stocks Page
  "stocks.pageTitle": { vi: "Quản lý cổ phiếu", en: "Stock Management" },
  "stocks.pageSubtitle": {
    vi: "Theo dõi danh mục đầu tư chứng khoán của bạn",
    en: "Track your stock portfolio",
  },
  "stocks.addHolding": { vi: "Thêm cổ phiếu", en: "Add Stock" },
  "stocks.totalInvested": { vi: "Tổng đầu tư", en: "Total Invested" },
  "stocks.currentValue": { vi: "Giá trị hiện tại", en: "Current Value" },
  "stocks.profitLoss": { vi: "Lãi/Lỗ", en: "Profit/Loss" },
  "stocks.totalStocks": { vi: "Số mã CP", en: "Total Stocks" },
  "stocks.stockUnit": { vi: "mã", en: "stocks" },
  "stocks.chartTitle": {
    vi: "Giá trị danh mục theo thời gian",
    en: "Portfolio value over time",
  },
  "stocks.chartSubtitle": { vi: "7 tháng gần nhất", en: "Last 7 months" },
  "stocks.portfolioValue": { vi: "Giá trị danh mục", en: "Portfolio value" },
  "stocks.holdingsTitle": { vi: "Danh sách cổ phiếu", en: "Stock Holdings" },
  "stocks.holdingsSubtitle": {
    vi: "Chi tiết từng mã cổ phiếu trong danh mục",
    en: "Details of each stock in your portfolio",
  },
  "stocks.purchaseDate": { vi: "Ngày mua", en: "Purchase Date" },
  "stocks.avgPriceLabel": { vi: "Giá TB", en: "Avg Price" },
  "stocks.currentLabel": { vi: "Giá TT", en: "Current" },
  "stocks.totalLabel": { vi: "Giá trị", en: "Value" },
  "stocks.addTitle": { vi: "Thêm cổ phiếu", en: "Add Stock" },
  "stocks.editTitle": { vi: "Sửa cổ phiếu", en: "Edit Stock" },
  "stocks.addDesc": {
    vi: "Điền thông tin cổ phiếu mới.",
    en: "Enter new stock details.",
  },
  "stocks.editDesc": {
    vi: "Cập nhật thông tin cổ phiếu.",
    en: "Update stock details.",
  },
  "stocks.symbolLabel": { vi: "Mã CP", en: "Symbol" },
  "stocks.nameLabel": { vi: "Tên công ty", en: "Company Name" },
  "stocks.qtyLabel": { vi: "Khối lượng", en: "Quantity" },
  "stocks.added": { vi: "Đã thêm cổ phiếu", en: "Stock added" },
  "stocks.addedDesc": {
    vi: "đã được thêm thành công.",
    en: "has been added successfully.",
  },
  "stocks.updated": { vi: "Đã cập nhật", en: "Stock updated" },
  "stocks.updatedDesc": { vi: "đã được cập nhật.", en: "has been updated." },
  "stocks.deleted": { vi: "Đã xóa cổ phiếu", en: "Stock deleted" },
  "stocks.deletedDesc": {
    vi: "Cổ phiếu đã được xóa khỏi danh mục.",
    en: "Stock has been removed from portfolio.",
  },
  "stocks.errSymbol": { vi: "Vui lòng nhập mã CP", en: "Symbol is required" },
  "stocks.errName": {
    vi: "Vui lòng nhập tên công ty",
    en: "Company name is required",
  },
  "stocks.errQty": {
    vi: "Khối lượng phải lớn hơn 0",
    en: "Quantity must be greater than 0",
  },
  "stocks.errPrice": {
    vi: "Giá phải lớn hơn 0",
    en: "Price must be greater than 0",
  },

  // Dashboard - Gold Section
  "gold.title": { vi: "Giá vàng SJC", en: "SJC Gold Price" },
  "gold.dashUpdated": { vi: "Cập nhật hôm nay", en: "Updated today" },
  "gold.buy": { vi: "Mua vào", en: "Buy" },
  "gold.sell": { vi: "Bán ra", en: "Sell" },

  // Dashboard - Recent Transactions
  "recent.title": { vi: "Giao dịch gần đây", en: "Recent Transactions" },
  "recent.last7Days": { vi: "7 ngày qua", en: "Last 7 days" },
  "recent.viewAll": { vi: "Xem tất cả", en: "View all" },
  "recent.today": { vi: "Hôm nay", en: "Today" },
  "recent.yesterday": { vi: "Hôm qua", en: "Yesterday" },
  "recent.income": { vi: "Thu nhập", en: "Income" },
  "recent.shopping": { vi: "Mua sắm", en: "Shopping" },
  "recent.food": { vi: "Ăn uống", en: "Food" },
  "recent.bills": { vi: "Hóa đơn", en: "Bills" },
  "recent.transport": { vi: "Di chuyển", en: "Transport" },

  // Transactions Page
  "tx.title": { vi: "Giao dịch", en: "Transactions" },
  "tx.subtitle": {
    vi: "Theo dõi và quản lý thu nhập, chi tiêu của bạn",
    en: "Track and manage your income and expenses",
  },
  "tx.add": { vi: "Thêm giao dịch", en: "Add Transaction" },
  "tx.transferTitle": { vi: "Chuyển tiền", en: "Transfer" },
  "tx.transferFrom": { vi: "Chuyển từ ví", en: "Transfer from wallet" },
  "tx.transferTo": { vi: "sang ví", en: "to wallet" },

  // Summary Cards
  "summary.balance": { vi: "Tổng số dư", en: "Total Balance" },
  "summary.income": { vi: "Tổng thu nhập", en: "Total Income" },
  "summary.expense": { vi: "Tổng chi tiêu", en: "Total Expense" },

  // Filters
  "filter.search": {
    vi: "Tìm kiếm giao dịch...",
    en: "Search transactions...",
  },
  "filter.allCategories": { vi: "Tất cả danh mục", en: "All Categories" },
  "filter.category": { vi: "Danh mục", en: "Category" },
  "filter.allTypes": { vi: "Tất cả", en: "All Types" },
  "filter.income": { vi: "Thu nhập", en: "Income" },
  "filter.expense": { vi: "Chi tiêu", en: "Expense" },
  "filter.transfer": { vi: "Chuyển tiền", en: "Transfer" },
  "filter.type": { vi: "Loại", en: "Type" },
  "filter.dateRange": { vi: "Chọn ngày", en: "Date range" },
  "filter.sort": { vi: "Sắp xếp", en: "Sort" },
  "filter.newest": { vi: "Mới nhất", en: "Newest" },
  "filter.oldest": { vi: "Cũ nhất", en: "Oldest" },
  "filter.amountHigh": { vi: "Số tiền ↓", en: "Amount ↓" },
  "filter.amountLow": { vi: "Số tiền ↑", en: "Amount ↑" },

  // Table headers
  "table.transaction": { vi: "Giao dịch", en: "Transaction" },
  "table.category": { vi: "Danh mục", en: "Category" },
  "table.date": { vi: "Ngày", en: "Date" },
  "table.amount": { vi: "Số tiền", en: "Amount" },
  "table.status": { vi: "Trạng thái", en: "Status" },
  "table.actions": { vi: "Thao tác", en: "Actions" },
  "table.completed": { vi: "Hoàn thành", en: "Completed" },
  "table.pending": { vi: "Đang chờ", en: "Pending" },

  // Empty state
  "empty.title": { vi: "Chưa có giao dịch nào", en: "No transactions yet" },
  "empty.description": {
    vi: "Bắt đầu theo dõi tài chính bằng cách thêm giao dịch đầu tiên.",
    en: "Start tracking your finances by adding your first transaction.",
  },
  "empty.addFirst": {
    vi: "Thêm giao dịch đầu tiên",
    en: "Add your first transaction",
  },

  // Add/Edit Dialog
  "dialog.addTitle": { vi: "Thêm giao dịch", en: "Add Transaction" },
  "dialog.editTitle": { vi: "Sửa giao dịch", en: "Edit Transaction" },
  "dialog.addDesc": {
    vi: "Điền thông tin để thêm giao dịch mới.",
    en: "Fill in the details to add a new transaction.",
  },
  "dialog.editDesc": {
    vi: "Cập nhật thông tin giao dịch bên dưới.",
    en: "Update the transaction details below.",
  },
  "dialog.name": { vi: "Tên giao dịch", en: "Transaction Name" },
  "dialog.namePlaceholder": { vi: "VD: Tiền chợ", en: "e.g. Groceries" },
  "dialog.amount": { vi: "Số tiền (VND)", en: "Amount (VND)" },
  "dialog.type": { vi: "Loại", en: "Type" },
  "dialog.category": { vi: "Danh mục", en: "Category" },
  "dialog.categoryPlaceholder": { vi: "Chọn", en: "Select" },
  "dialog.date": { vi: "Ngày", en: "Date" },
  "dialog.datePlaceholder": { vi: "Chọn ngày", en: "Pick date" },
  "dialog.notes": { vi: "Ghi chú (không bắt buộc)", en: "Notes (optional)" },
  "dialog.notesPlaceholder": { vi: "Thêm ghi chú...", en: "Add a note..." },
  "dialog.cancel": { vi: "Hủy", en: "Cancel" },
  "dialog.save": { vi: "Lưu giao dịch", en: "Save Transaction" },
  "dialog.update": { vi: "Cập nhật", en: "Update" },
  "dialog.saving": { vi: "Đang lưu...", en: "Saving..." },

  // Validation
  "validation.nameRequired": {
    vi: "Vui lòng nhập tên",
    en: "Name is required",
  },
  "validation.amountPositive": {
    vi: "Số tiền phải lớn hơn 0",
    en: "Amount must be a positive number",
  },
  "validation.categoryRequired": {
    vi: "Vui lòng chọn danh mục",
    en: "Category is required",
  },
  "validation.ratePositive": {
    vi: "Lãi suất phải lớn hơn 0",
    en: "Interest rate must be greater than 0",
  },
  "validation.termPositive": {
    vi: "Kỳ hạn phải lớn hơn 0",
    en: "Term must be greater than 0",
  },
  "validation.symbolRequired": {
    vi: "Vui lòng nhập mã cổ phiếu",
    en: "Stock symbol is required",
  },
  "validation.pricePositive": {
    vi: "Giá phải lớn hơn 0",
    en: "Price must be greater than 0",
  },
  "validation.qtyPositive": {
    vi: "Số lượng phải lớn hơn 0",
    en: "Quantity must be greater than 0",
  },
  "validation.balanceRequired": {
    vi: "Vui lòng nhập số dư",
    en: "Balance is required",
  },
  "validation.balanceInvalid": {
    vi: "Vui lòng nhập số dư hợp lệ",
    en: "Please enter a valid balance",
  },
  "validation.noteTooLong": {
    vi: "Ghi chú không được vượt quá 255 ký tự",
    en: "Notes must not exceed 255 characters",
  },

  // Confirm dialog
  "confirm.deleteTitle": { vi: "Xác nhận xóa", en: "Confirm delete" },
  "confirm.deleteDesc": {
    vi: "Bạn có chắc chắn muốn xóa? Hành động này không thể hoàn tác.",
    en: "Are you sure you want to delete? This action cannot be undone.",
  },
  "confirm.delete": { vi: "Xóa", en: "Delete" },

  // Toast
  "toast.errorTitle": { vi: "Lỗi", en: "Error" },
  "toast.added": { vi: "Đã thêm giao dịch", en: "Transaction added" },
  "toast.updated": { vi: "Đã cập nhật giao dịch", en: "Transaction updated" },
  "toast.addedDesc": {
    vi: "đã được thêm thành công.",
    en: "has been added successfully.",
  },
  "toast.updatedDesc": {
    vi: "đã được cập nhật thành công.",
    en: "has been updated successfully.",
  },

  // Categories
  "cat.Lương": { vi: "Lương", en: "Salary" },
  "cat.Freelance": { vi: "Freelance", en: "Freelance" },
  "cat.Đầu tư": { vi: "Đầu tư", en: "Investment" },
  "cat.Ăn uống": { vi: "Ăn uống", en: "Food" },
  "cat.Giải trí": { vi: "Giải trí", en: "Entertainment" },
  "cat.Hóa đơn": { vi: "Hóa đơn", en: "Bills" },
  "cat.Sức khỏe": { vi: "Sức khỏe", en: "Health" },
  "cat.Di chuyển": { vi: "Di chuyển", en: "Transport" },
  "cat.Giáo dục": { vi: "Giáo dục", en: "Education" },
  "cat.Thu nhập khác": { vi: "Thu nhập khác", en: "Other income" },
  "cat.Chi phí khác": { vi: "Chi phí khác", en: "Other expense" },

  // Custom category
  "dialog.newCategory": { vi: "Tạo danh mục mới", en: "Create new category" },
  "dialog.newCategoryPlaceholder": {
    vi: "Nhập tên danh mục...",
    en: "Enter category name...",
  },
  "dialog.addCategory": { vi: "Thêm", en: "Add" },

  // Month abbreviations
  "month.8": { vi: "T8", en: "Aug" },
  "month.9": { vi: "T9", en: "Sep" },
  "month.10": { vi: "T10", en: "Oct" },
  "month.11": { vi: "T11", en: "Nov" },
  "month.12": { vi: "T12", en: "Dec" },
  "month.1": { vi: "T1", en: "Jan" },
  "month.2": { vi: "T2", en: "Feb" },

  // VND formatting
  "unit.billion": { vi: "tỷ", en: "B" },
  "unit.million": { vi: "tr", en: "M" },

  // Gold Page
  "gold.pageTitle": { vi: "Quản lý Vàng", en: "Gold Management" },
  "gold.pageSubtitle": {
    vi: "Theo dõi danh mục vàng và so sánh giá thị trường",
    en: "Track your gold holdings and compare market prices",
  },
  "gold.addHolding": { vi: "Thêm vàng", en: "Add Gold" },
  "gold.totalSpent": { vi: "Tổng tiền đã chi", en: "Total Spent" },
  "gold.currentValue": { vi: "Giá trị hiện tại", en: "Current Value" },
  "gold.profitLoss": { vi: "Lãi / Lỗ", en: "Profit / Loss" },
  "gold.totalQty": { vi: "Tổng số lượng", en: "Total Quantity" },
  "gold.unit": { vi: "lượng", en: "tael" },
  "gold.entries": { vi: "lần mua", en: "entries" },
  "gold.priceChart": {
    vi: "Biến động giá vàng SJC",
    en: "SJC Gold Price Trend",
  },
  "gold.last7Months": { vi: "7 tháng gần nhất", en: "Last 7 months" },
  "gold.priceLabel": { vi: "Giá vàng", en: "Gold Price" },
  "gold.marketPrices": { vi: "Giá thị trường", en: "Market Prices" },
  "gold.todayPrices": { vi: "Cập nhật hôm nay", en: "Updated today" },
  "gold.holdingsTitle": { vi: "Danh sách vàng sở hữu", en: "Gold Holdings" },
  "gold.holdingsSubtitle": {
    vi: "Chi tiết từng lần mua",
    en: "Details of each purchase",
  },
  "gold.typeCol": { vi: "Loại vàng", en: "Gold Type" },
  "gold.qtyCol": { vi: "Số lượng", en: "Quantity" },
  "gold.purchaseDate": { vi: "Ngày mua", en: "Purchase Date" },
  "gold.purchasePrice": { vi: "Giá mua", en: "Purchase Price" },
  "gold.totalInvested": { vi: "Tổng tiền", en: "Total Invested" },
  "gold.currentVal": { vi: "Giá trị hiện tại", en: "Current Value" },
  "gold.plCol": { vi: "Lãi/Lỗ", en: "P/L" },
  "gold.addTitle": { vi: "Thêm vàng", en: "Add Gold" },
  "gold.editTitle": { vi: "Sửa thông tin", en: "Edit Holding" },
  "gold.addDesc": {
    vi: "Nhập thông tin vàng bạn đã mua.",
    en: "Enter details of your gold purchase.",
  },
  "gold.editDesc": {
    vi: "Cập nhật thông tin vàng.",
    en: "Update your gold holding details.",
  },
  "gold.saveHolding": { vi: "Lưu", en: "Save" },
  "gold.qtyError": {
    vi: "Số lượng phải lớn hơn 0",
    en: "Quantity must be greater than 0",
  },
  "gold.priceError": {
    vi: "Giá phải lớn hơn 0",
    en: "Price must be greater than 0",
  },
  "gold.added": { vi: "Đã thêm vàng", en: "Gold added" },
  "gold.addedDesc": {
    vi: "Đã thêm vào danh mục thành công.",
    en: "Successfully added to your holdings.",
  },
  "gold.updated": { vi: "Đã cập nhật", en: "Updated" },
  "gold.updatedDesc": {
    vi: "Thông tin đã được cập nhật.",
    en: "Holding details have been updated.",
  },
  "gold.deleted": { vi: "Đã xóa", en: "Deleted" },
  "gold.deletedDesc": {
    vi: "Đã xóa khỏi danh mục.",
    en: "Removed from your holdings.",
  },

  // Top Spending
  "spending.title": {
    vi: "Chi tiêu theo danh mục",
    en: "Spending by Category",
  },
  "spending.subtitle": { vi: "Tháng này", en: "This month" },
  "spending.food": { vi: "Ăn uống", en: "Food" },
  "spending.bills": { vi: "Hóa đơn", en: "Bills" },
  "spending.shopping": { vi: "Mua sắm", en: "Shopping" },
  "spending.transport": { vi: "Di chuyển", en: "Transport" },
  "spending.entertainment": { vi: "Giải trí", en: "Entertainment" },
  "spending.health": { vi: "Sức khỏe", en: "Health" },

  // Summary month selector
  "summary.allTime": { vi: "Tất cả", en: "All time" },
  "summary.month": { vi: "Tháng", en: "Month" },

  // Language toggle
  "lang.label": { vi: "English", en: "Tiếng Việt" },
  "lang.short": { vi: "EN", en: "VI" },

  // Savings Page
  "savings.pageTitle": { vi: "Tiết kiệm", en: "Savings" },
  "savings.pageSubtitle": {
    vi: "Tạo tài khoản tiết kiệm và tính lãi suất",
    en: "Create savings accounts and calculate interest",
  },
  "savings.addWallet": { vi: "Tạo tài khoản", en: "New Account" },
  "savings.totalDeposit": { vi: "Tổng tiền gửi", en: "Total Deposit" },
  "savings.totalInterest": { vi: "Tổng lãi", en: "Total Interest" },
  "savings.totalReceived": { vi: "Tổng nhận được", en: "Total Received" },
  "savings.emptyTitle": {
    vi: "Chưa có tài khoản tiết kiệm",
    en: "No savings accounts",
  },
  "savings.emptyDesc": {
    vi: "Tạo tài khoản tiết kiệm đầu tiên để bắt đầu tính lãi.",
    en: "Create your first savings account to start calculating interest.",
  },
  "savings.addFirst": {
    vi: "Tạo tài khoản tiết kiệm đầu tiên",
    en: "Create your first savings account.",
  },
  "savings.monthUnit": { vi: "tháng", en: "months" },
  "savings.yearUnit": { vi: "năm", en: "year" },
  "savings.depositLabel": { vi: "Tiền gửi", en: "Deposit" },
  "savings.interestLabel": { vi: "Tiền lãi", en: "Interest" },
  "savings.receivedLabel": { vi: "Nhận được", en: "Received" },
  "savings.addTitle": {
    vi: "Tạo tài khoản tiết kiệm",
    en: "Create Savings Account",
  },
  "savings.editTitle": {
    vi: "Sửa tài khoản tiết kiệm",
    en: "Edit Savings Account",
  },
  "savings.addDesc": {
    vi: "Nhập thông tin tài khoản tiết kiệm mới.",
    en: "Enter details for your new savings account.",
  },
  "savings.editDesc": {
    vi: "Cập nhật thông tin tài khoản tiết kiệm.",
    en: "Update savings account details.",
  },
  "savings.nameLabel": { vi: "Tên tài khoản", en: "Account Name" },
  "savings.namePlaceholder": {
    vi: "VD: Tiết kiệm mua nhà",
    en: "e.g. House fund",
  },
  "savings.depositAmountLabel": {
    vi: "Số tiền gửi (VND)",
    en: "Deposit Amount (VND)",
  },
  "savings.rateLabel": { vi: "Lãi suất (%/năm)", en: "Interest Rate (%/year)" },
  "savings.termLabel": { vi: "Kỳ hạn (tháng)", en: "Term (months)" },
  "savings.preview": { vi: "Ngày tất toán", en: "Maturity Date" },
  "savings.noteLabel": { vi: "Ghi chú (ngân hàng)", en: "Note (bank)" },
  "savings.notePlaceholder": {
    vi: "VD: Vietcombank, TPBank...",
    en: "e.g. Vietcombank, TPBank...",
  },
  "savings.linkedWalletLabel": { vi: "Tài khoản liên kết", en: "Linked Wallet" },
  "savings.depositDateLabel": { vi: "Ngày gửi", en: "Deposit Date" },
  "savings.depositDatePlaceholder": { vi: "Chọn ngày gửi", en: "Select deposit date" },
  "savings.saveBtn": { vi: "Lưu", en: "Save" },
  "savings.added": { vi: "Đã tạo tài khoản", en: "Account created" },
  "savings.addedDesc": {
    vi: "Tài khoản tiết kiệm đã được tạo thành công.",
    en: "Savings account has been created.",
  },
  "savings.updated": { vi: "Đã cập nhật", en: "Updated" },
  "savings.updatedDesc": {
    vi: "Tài khoản tiết kiệm đã được cập nhật.",
    en: "Savings account has been updated.",
  },
  "savings.deleted": { vi: "Đã xóa", en: "Deleted" },
  "savings.deletedDesc": {
    vi: "Tài khoản tiết kiệm đã được xóa.",
    en: "Savings account has been deleted.",
  },
  "savings.activeListTitle": { vi: "Danh sách sổ tiết kiệm", en: "Active savings accounts" },
  "savings.settledListTitle": { vi: "Sổ đã tất toán", en: "Settled savings accounts" },
  "savings.linkedSourceBadge": { vi: "Có liên kết tài khoản nguồn", en: "Linked source wallet" },
  "savings.receiveDate": { vi: "Ngày nhận", en: "Receive date" },
  "savings.settleAction": { vi: "Tất toán sổ", en: "Settle saving" },
  "savings.editAction": { vi: "Sửa thông tin", en: "Edit saving" },
  "savings.deleteAction": { vi: "Xóa sổ", en: "Delete saving" },
  "savings.selectPlaceholder": { vi: "Chọn...", en: "Select..." },
  "savings.noLinkOption": { vi: "-- Không liên kết --", en: "-- No link --" },
  "savings.sourceLockedHint": {
    vi: "Không thể đổi nguồn sau khi tạo",
    en: "Source wallet cannot be changed after creation",
  },
  "savings.startDateRequired": { vi: "Vui lòng chọn ngày bắt đầu", en: "Please select start date" },
  "savings.insufficientSourceBalance": {
    vi: "Số dư tài khoản liên kết không đủ",
    en: "Insufficient balance in linked wallet",
  },
  "savings.saveFailedDesc": {
    vi: "Không thể lưu sổ tiết kiệm",
    en: "Failed to save saving account",
  },
  "savings.deleteFailedDesc": {
    vi: "Không thể xóa sổ tiết kiệm",
    en: "Failed to delete saving account",
  },
  "savings.settleDialogTitle": { vi: "Xác nhận tất toán", en: "Confirm settlement" },
  "savings.settleDialogDescLinked": {
    vi: "Sổ tiết kiệm sẽ được tất toán và tiền được cộng về tài khoản liên kết.",
    en: "This saving will be settled and funds will return to the linked wallet.",
  },
  "savings.settleDialogDescNoLink": {
    vi: "Sổ tiết kiệm chưa có tài khoản liên kết. Vui lòng chọn tài khoản nhận tiền.",
    en: "This saving has no linked wallet. Please choose a destination wallet.",
  },
  "savings.settleTargetLabel": { vi: "Tài khoản nhận tiền", en: "Destination wallet" },
  "savings.settleTargetPlaceholder": { vi: "Chọn tài khoản", en: "Select wallet" },
  "savings.settleTargetRequired": {
    vi: "Vui lòng chọn tài khoản nhận tiền",
    en: "Please select a destination wallet",
  },
  "savings.noSettlementWallet": {
    vi: "Không có ví khả dụng để nhận tiền tất toán.",
    en: "No wallet available for settlement funds.",
  },
  "savings.settleConfirmBtn": { vi: "Tất toán", en: "Settle" },
  "savings.settled": { vi: "Đã tất toán", en: "Settled" },
  "savings.settledDesc": {
    vi: "Sổ tiết kiệm đã được tất toán thành công.",
    en: "Saving account settled successfully.",
  },
  "savings.settleFailedDesc": {
    vi: "Không thể tất toán sổ tiết kiệm",
    en: "Failed to settle saving account",
  },

  // Profile Page
  "nav.profile": { vi: "Hồ sơ", en: "Profile" },
  "profile.pageTitle": { vi: "Thông tin cá nhân", en: "Personal Information" },
  "profile.pageSubtitle": {
    vi: "Quản lý thông tin tài khoản của bạn",
    en: "Manage your account information",
  },
  "profile.editBtn": { vi: "Chỉnh sửa", en: "Edit" },
  "profile.basicInfo": { vi: "Thông tin cơ bản", en: "Basic Information" },
  "profile.detailInfo": {
    vi: "Thông tin chi tiết",
    en: "Detailed Information",
  },
  "profile.security": { vi: "Bảo mật", en: "Security" },
  "profile.fullName": { vi: "Họ và tên", en: "Full Name" },
  "profile.email": { vi: "Email", en: "Email" },
  "profile.phone": { vi: "Số điện thoại", en: "Phone" },
  "profile.dob": { vi: "Ngày sinh", en: "Date of Birth" },
  "profile.gender": { vi: "Giới tính", en: "Gender" },
  "profile.address": { vi: "Địa chỉ", en: "Address" },
  "profile.male": { vi: "Nam", en: "Male" },
  "profile.female": { vi: "Nữ", en: "Female" },
  "profile.other": { vi: "Khác", en: "Other" },
  "profile.editTitle": { vi: "Chỉnh sửa thông tin", en: "Edit Profile" },
  "profile.editDesc": {
    vi: "Cập nhật thông tin cá nhân của bạn.",
    en: "Update your personal information.",
  },
  "profile.saveBtn": { vi: "Lưu thay đổi", en: "Save Changes" },
  "profile.saved": { vi: "Đã lưu", en: "Saved" },
  "profile.savedDesc": {
    vi: "Thông tin đã được cập nhật.",
    en: "Profile has been updated.",
  },
  "profile.changePassword": { vi: "Đổi mật khẩu", en: "Change Password" },
  "profile.changePasswordDesc": {
    vi: "Cập nhật mật khẩu đăng nhập",
    en: "Update your login password",
  },
  "profile.changePasswordDialogDesc": {
    vi: "Nhập mật khẩu hiện tại và mật khẩu mới.",
    en: "Enter your current and new password.",
  },
  "profile.currentPassword": {
    vi: "Mật khẩu hiện tại",
    en: "Current Password",
  },
  "profile.newPassword": { vi: "Mật khẩu mới", en: "New Password" },
  "profile.confirmPassword": {
    vi: "Xác nhận mật khẩu",
    en: "Confirm Password",
  },
  "profile.passwordMismatch": {
    vi: "Mật khẩu không khớp",
    en: "Passwords do not match",
  },
  "profile.changeBtn": { vi: "Đổi mật khẩu", en: "Change" },
  "profile.passwordChanged": { vi: "Đã đổi mật khẩu", en: "Password changed" },
  "profile.passwordChangedDesc": {
    vi: "Mật khẩu đã được cập nhật.",
    en: "Password has been updated.",
  },
  "profile.deleteAccount": { vi: "Xóa tài khoản", en: "Delete Account" },
  "profile.deleteAccountDesc": {
    vi: "Xóa vĩnh viễn tài khoản và dữ liệu",
    en: "Permanently delete account and data",
  },
  "profile.deleteBtn": { vi: "Xóa", en: "Delete" },
  "profile.deleteConfirm": {
    vi: "Hành động này không thể hoàn tác. Tất cả dữ liệu sẽ bị xóa vĩnh viễn.",
    en: "This action cannot be undone. All data will be permanently deleted.",
  },
  "profile.accountDeleted": { vi: "Đã xóa tài khoản", en: "Account deleted" },
  "profile.accountDeletedDesc": {
    vi: "Tài khoản đã được xóa.",
    en: "Account has been deleted.",
  },

  // Pagination
  "pagination.previous": { vi: "Trước", en: "Previous" },
  "pagination.next": { vi: "Sau", en: "Next" },

  // Wallets Page
  "nav.wallets": { vi: "Ví của tôi", en: "My Wallets" },
  "wallets.pageTitle": { vi: "Ví của tôi", en: "My Wallets" },
  "wallets.pageSubtitle": {
    vi: "Quản lý các ví và theo dõi số dư",
    en: "Manage your wallets and track balances",
  },
  "wallets.addWallet": { vi: "Thêm ví", en: "Add Wallet" },
  "wallets.totalBalance": { vi: "Tổng số dư", en: "Total Balance" },
  "wallets.walletCount": { vi: "ví", en: "wallets" },
  "wallets.emptyTitle": { vi: "Chưa có ví nào", en: "No wallets yet" },
  "wallets.addFirst": { vi: "Thêm ví đầu tiên", en: "Add first wallet" },
  "wallets.recentTx": { vi: "Giao dịch gần đây", en: "Recent Transactions" },
  "wallets.noTx": { vi: "Chưa có giao dịch", en: "No transactions" },
  "wallets.selectHint": {
    vi: "Chọn ví để xem chi tiết",
    en: "Select a wallet to view details",
  },
  "wallets.addTitle": { vi: "Thêm ví", en: "Add Wallet" },
  "wallets.editTitle": { vi: "Sửa ví", en: "Edit Wallet" },
  "wallets.addDesc": {
    vi: "Nhập thông tin ví mới.",
    en: "Enter new wallet details.",
  },
  "wallets.editDesc": {
    vi: "Cập nhật thông tin ví.",
    en: "Update wallet details.",
  },
  "wallets.nameLabel": { vi: "Tên ví", en: "Wallet Name" },
  "wallets.namePlaceholder": { vi: "VD: Vietcombank", en: "e.g. Vietcombank" },
  "wallets.balanceLabel": { vi: "Số dư (VND)", en: "Balance (VND)" },
  "wallets.typeLabel": { vi: "Loại ví", en: "Wallet Type" },
  "wallets.iconLabel": { vi: "Biểu tượng", en: "Icon" },
  "wallets.colorLabel": { vi: "Màu sắc", en: "Color" },
  "wallets.noteLabel": { vi: "Ghi chú", en: "Note" },
  "wallets.notePlaceholder": {
    vi: "VD: Tài khoản chính",
    en: "e.g. Primary account",
  },
  "wallets.added": { vi: "Đã thêm ví", en: "Wallet added" },
  "wallets.addedDesc": {
    vi: "Ví đã được thêm thành công.",
    en: "Wallet has been added.",
  },
  "wallets.updated": { vi: "Đã cập nhật", en: "Updated" },
  "wallets.updatedDesc": {
    vi: "Ví đã được cập nhật.",
    en: "Wallet has been updated.",
  },
  "wallets.deleted": { vi: "Đã xóa", en: "Deleted" },
  "wallets.deletedDesc": {
    vi: "Ví đã được xóa.",
    en: "Wallet has been deleted.",
  },

  "wallets.redirectTitle": {
    vi: "Cần tạo ví trước",
    en: "Create a wallet first",
  },
  "wallets.redirectDesc": {
    vi: "Bạn cần có ít nhất một ví trước khi xem giao dịch.",
    en: "You need at least one wallet before viewing transactions.",
  },

  "wallets.noWalletToastTitle": {
    vi: "Cần tạo ví trước",
    en: "Create a wallet first",
  },
  "wallets.noWalletToastDesc": {
    vi: "Bạn cần có ít nhất một ví trước khi xem giao dịch.",
    en: "You need at least one wallet before viewing transactions.",
  },

  // Wallet filter in transactions
  "filter.wallet": { vi: "Ví", en: "Wallet" },
  "filter.allWallets": { vi: "Tất cả ví", en: "All Wallets" },
  "table.wallet": { vi: "Ví", en: "Wallet" },
  "dialog.wallet": { vi: "Ví", en: "Wallet" },
  "dialog.walletPlaceholder": { vi: "Chọn ví", en: "Select wallet" },
} as const;

export type TranslationKey = keyof typeof translations;

export function getTranslation(key: TranslationKey, locale: Locale): string {
  return translations[key]?.[locale] ?? key;
}

export default translations;
