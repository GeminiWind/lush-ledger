export type AppLanguage = "en-US" | "vi-VN" | "fr-FR" | "ja-JP";

type Dictionary = {
  navDashboard: string;
  navAtelier: string;
  navLedger: string;
  navSavings: string;
  navWallets: string;
  navSettings: string;
  actionNewEntry: string;
  headerBrandSub: string;
  headerUserRole: string;
  actionLogout: string;
  settingsTag: string;
  settingsTitleLine1: string;
  settingsTitleLine2: string;
  settingsIntro: string;
  settingsThemeTitle: string;
  settingsVisualIdentity: string;
  settingsLightMode: string;
  settingsDarkMode: string;
  settingsSystemDefault: string;
  settingsProfileTitle: string;
  settingsFullName: string;
  settingsEmail: string;
  settingsCurrencyHub: string;
  settingsCurrency: string;
  settingsLanguageTitle: string;
  settingsCurrentDisplay: string;
  settingsPrivacyTitle: string;
  settingsPrivacyBody: string;
  settingsFooterHint: string;
  actionReset: string;
  actionSaveSettings: string;
  settingsSaved: string;
  errorNameRequired: string;
  errorCurrencyRequired: string;
  errorLanguageRequired: string;
  errorThemeRequired: string;
  newEntryBreadcrumb: string;
  newEntryTitle: string;
  newEntryHeroTag: string;
  newEntryHeroHeading: string;
  newEntryHeroBody: string;
  newEntryTipTitle: string;
  newEntryTipBody: string;
  txErrorAmountRequired: string;
  txErrorDescriptionRequired: string;
  txErrorDateRequired: string;
  txErrorWalletRequired: string;
  txErrorRecurringDayRange: string;
  txErrorRecurringEndDate: string;
  txTypeExpense: string;
  txTypeIncome: string;
  txRecurring: string;
  txFrequency: string;
  txFrequencyMonthly: string;
  txFrequencyYearly: string;
  txDayOfMonth: string;
  txDayOfMonthHelp: string;
  txEndDate: string;
  txNoEndDate: string;
  txEndDateHelp: string;
  txDescription: string;
  txDescriptionPlaceholder: string;
  txCategory: string;
  txNoCategory: string;
  txWallet: string;
  txDate: string;
  txNotes: string;
  txOptional: string;
  txNotesPlaceholder: string;
  txAdd: string;
  txAdding: string;
  dashBudgetAlert: string;
  dashExceededBy: string;
  dashReallocate: string;
  dashDismissAlert: string;
  dashTotalNetWorth: string;
  dashVsLastMonth: string;
  dashAssets: string;
  dashLiabilities: string;
  dashMonthlySpending: string;
  dashMonthlyLimit: string;
  dashUsed: string;
  dashSavingsGoal: string;
  dashCreateOne: string;
  dashComplete: string;
  dashPrevSavingsGoal: string;
  dashNextSavingsGoal: string;
  dashRecentEntries: string;
  dashFilters: string;
  dashExportCsv: string;
  dashNoRecentEntries: string;
  dashUncategorized: string;
  dashStatusReceived: string;
  dashStatusCompleted: string;
  topCategoriesTitle: string;
  topCategoriesShowList: string;
  topCategoriesShowChart: string;
  topCategoriesNoSpending: string;
  topCategoriesTotal: string;
  activeBudgetsTitle: string;
  activeBudgetsFilterLabel: string;
  activeBudgetsFilterAll: string;
  activeBudgetsFilterHealthy: string;
  activeBudgetsFilterOverspent: string;
  activeBudgetsPrev: string;
  activeBudgetsNext: string;
  activeBudgetsNoLimits: string;
  activeBudgetsNoFiltered: string;
  activeBudgetsEndsIn: string;
  activeBudgetsDays: string;
  activeBudgetsOverspent: string;
  activeBudgetsHealthy: string;
  activeBudgetsSpent: string;
  activeBudgetsBudget: string;
  activeBudgetsExcessThisMonth: string;
  activeBudgetsRemainingLimit: string;
  ledgerToday: string;
  ledgerYesterday: string;
  ledgerTabActivity: string;
  ledgerTabReports: string;
  ledgerTabBudgets: string;
  ledgerTitle: string;
  ledgerSubtitle: string;
  ledgerMtdSpending: string;
  ledgerSearchEntries: string;
  ledgerSearchPlaceholder: string;
  ledgerFilterCategory: string;
  ledgerFilterAmount: string;
  ledgerFilterWallet: string;
  ledgerTypeIncome: string;
  ledgerTypeExpense: string;
  ledgerApply: string;
  ledgerNoEntriesMatch: string;
  ledgerUncategorized: string;
  ledgerShowingTransactions: string;
  accountsPortfolio: string;
  accountsYourAtelier: string;
  accountsWallets: string;
  accountsArchiveOld: string;
  accountsNewWallet: string;
  accountsNoWallet: string;
  accountsCreateFirstWallet: string;
  accountsSetDefault: string;
  walletDefaultBadge: string;
  walletEdit: string;
  walletEditAria: string;
  walletSetCurrentBalance: string;
  walletSave: string;
  walletSaving: string;
  walletInvalidBalance: string;
  walletUpdateFailed: string;
  walletNameRequired: string;
  walletCreateFailed: string;
  walletCloseDialog: string;
  walletDialogTag: string;
  walletDialogTitle: string;
  walletDialogBody: string;
  walletDialogEditTitle: string;
  walletDialogEditBody: string;
  walletDialogNameLabel: string;
  walletDialogNamePlaceholder: string;
  walletDialogBalanceLabel: string;
  walletDialogBalancePlaceholder: string;
  walletDialogBalanceHint: string;
  walletDialogDefaultTitle: string;
  walletDialogDefaultBody: string;
  walletDialogCreateAction: string;
  walletDialogCreating: string;
  walletDialogUpdateAction: string;
  walletDialogUpdating: string;
  walletDialogDeleteAction: string;
  walletDialogDeleting: string;
  walletDeleteFailed: string;
  walletDeleteBlockedDefault: string;
  walletCurrencyPrefix: string;
  savingsPortfolio: string;
  savingsTitle: string;
  savingsTotal: string;
  savingsPrimaryFocus: string;
  savingsTargeted: string;
  savingsPrimaryDesc: string;
  savingsSaved: string;
  savingsTarget: string;
  savingsRemaining: string;
  savingsNoPlan: string;
  savingsCreatePlanHint: string;
  savingsOtherAmbitions: string;
  savingsMonthlyContributionTarget: string;
  savingsEnvisionGoal: string;
  savingsAddToAtelier: string;
};

const enUS: Dictionary = {
  navDashboard: "Dashboard",
  navAtelier: "Atelier",
  navLedger: "Ledger",
  navSavings: "Savings",
  navWallets: "Wallets",
  navSettings: "Settings",
  actionNewEntry: "New Entry",
  headerBrandSub: "Fiscal Atelier",
  headerUserRole: "Curator",
  actionLogout: "Logout",
  settingsTag: "Configuration",
  settingsTitleLine1: "Your Atelier",
  settingsTitleLine2: "Preferences",
  settingsIntro: "Customize your digital financial space to match your workflow and regional preferences.",
  settingsThemeTitle: "Theme Selection",
  settingsVisualIdentity: "Visual Identity",
  settingsLightMode: "Light Mode",
  settingsDarkMode: "Dark Mode",
  settingsSystemDefault: "System Default",
  settingsProfileTitle: "Profile",
  settingsFullName: "Full Name",
  settingsEmail: "Email",
  settingsCurrencyHub: "Currency Hub",
  settingsCurrency: "Currency",
  settingsLanguageTitle: "Language",
  settingsCurrentDisplay: "Current Display",
  settingsPrivacyTitle: "Data Atelier Privacy",
  settingsPrivacyBody: "Your finance data is encrypted in transit and stored only for your account scope.",
  settingsFooterHint: "Use save to apply changes to your profile and preferences.",
  actionReset: "Reset",
  actionSaveSettings: "Save Settings",
  settingsSaved: "Settings saved successfully.",
  errorNameRequired: "Name must be at least 2 characters.",
  errorCurrencyRequired: "Currency is required.",
  errorLanguageRequired: "Language is required.",
  errorThemeRequired: "Theme is required.",
  newEntryBreadcrumb: "Journal",
  newEntryTitle: "New Transaction",
  newEntryHeroTag: "Entry Mode",
  newEntryHeroHeading: "Documenting Growth.",
  newEntryHeroBody: "Every transaction is a stitch in the fabric of your financial atelier. Be precise, be intentional.",
  newEntryTipTitle: "Atelier Tip",
  newEntryTipBody: "Attach clear descriptions to improve report insights and make your spending patterns easier to review.",
  txErrorAmountRequired: "Amount is required.",
  txErrorDescriptionRequired: "Description is required.",
  txErrorDateRequired: "Date is required.",
  txErrorWalletRequired: "Wallet is required.",
  txErrorRecurringDayRange: "Recurring day must be between 1 and 31.",
  txErrorRecurringEndDate: "End date must be on or after date.",
  txTypeExpense: "Expense",
  txTypeIncome: "Income",
  txRecurring: "Recurring",
  txFrequency: "Frequency",
  txFrequencyMonthly: "Monthly",
  txFrequencyYearly: "Yearly",
  txDayOfMonth: "Day of month",
  txDayOfMonthHelp: "Example: set to 5 for every 5th day.",
  txEndDate: "End date",
  txNoEndDate: "No end date",
  txEndDateHelp: "Optional. Stop recurring after this date.",
  txDescription: "Description",
  txDescriptionPlaceholder: "e.g. Coffee at The Roasting Atelier",
  txCategory: "Category",
  txNoCategory: "No category",
  txWallet: "Wallet",
  txDate: "Date",
  txNotes: "Notes",
  txOptional: "Optional",
  txNotesPlaceholder: "Add additional details about this fiscal event...",
  txAdd: "Add Transaction",
  txAdding: "Adding Transaction...",
  dashBudgetAlert: "Budget Alert",
  dashExceededBy: "You have exceeded your monthly limit by",
  dashReallocate: "Reallocate Funds",
  dashDismissAlert: "Dismiss alert",
  dashTotalNetWorth: "Total Net Worth",
  dashVsLastMonth: "vs last month spending",
  dashAssets: "Assets",
  dashLiabilities: "Liabilities",
  dashMonthlySpending: "Monthly Spending",
  dashMonthlyLimit: "Monthly Limit",
  dashUsed: "Used",
  dashSavingsGoal: "Savings Goal",
  dashCreateOne: "Create one",
  dashComplete: "Complete",
  dashPrevSavingsGoal: "Previous savings goal",
  dashNextSavingsGoal: "Next savings goal",
  dashRecentEntries: "Recent Entries",
  dashFilters: "Filters",
  dashExportCsv: "Export CSV",
  dashNoRecentEntries: "No recent entries yet.",
  dashUncategorized: "Uncategorized",
  dashStatusReceived: "RECEIVED",
  dashStatusCompleted: "COMPLETED",
  topCategoriesTitle: "Top Categories",
  topCategoriesShowList: "Show List",
  topCategoriesShowChart: "Show Chart",
  topCategoriesNoSpending: "No category spending yet.",
  topCategoriesTotal: "Total",
  activeBudgetsTitle: "Active Budgets",
  activeBudgetsFilterLabel: "Filter budgets by status",
  activeBudgetsFilterAll: "All",
  activeBudgetsFilterHealthy: "Healthy",
  activeBudgetsFilterOverspent: "Overspent",
  activeBudgetsPrev: "Previous budgets",
  activeBudgetsNext: "Next budgets",
  activeBudgetsNoLimits: "No active budget limits set.",
  activeBudgetsNoFiltered: "No budgets found.",
  activeBudgetsEndsIn: "Ends in",
  activeBudgetsDays: "days",
  activeBudgetsOverspent: "Overspent",
  activeBudgetsHealthy: "Healthy",
  activeBudgetsSpent: "Spent",
  activeBudgetsBudget: "Budget",
  activeBudgetsExcessThisMonth: "Excess this month",
  activeBudgetsRemainingLimit: "remaining of limit",
  ledgerToday: "Today",
  ledgerYesterday: "Yesterday",
  ledgerTabActivity: "Activity",
  ledgerTabReports: "Reports",
  ledgerTabBudgets: "Budgets",
  ledgerTitle: "The Ledger",
  ledgerSubtitle: "A curated overview of your fiscal flow. Keep every transaction visible and aligned with your monthly goals.",
  ledgerMtdSpending: "MTD Spending",
  ledgerSearchEntries: "Search entries",
  ledgerSearchPlaceholder: "Search entries...",
  ledgerFilterCategory: "Category",
  ledgerFilterAmount: "Amount",
  ledgerFilterWallet: "Wallet",
  ledgerTypeIncome: "Income",
  ledgerTypeExpense: "Expense",
  ledgerApply: "Apply",
  ledgerNoEntriesMatch: "No entries match your filters.",
  ledgerUncategorized: "Uncategorized",
  ledgerShowingTransactions: "Showing transaction(s)",
  accountsPortfolio: "Financial Portfolio",
  accountsYourAtelier: "Your Atelier",
  accountsWallets: "Wallets",
  accountsArchiveOld: "Archive Old",
  accountsNewWallet: "New Wallet",
  accountsNoWallet: "No wallet yet",
  accountsCreateFirstWallet: "Create your first wallet below to start tracking balances.",
  accountsSetDefault: "Set as Default",
  walletDefaultBadge: "Default Wallet",
  walletEdit: "Edit",
  walletEditAria: "Edit wallet balance",
  walletSetCurrentBalance: "Set Current Balance",
  walletSave: "Save",
  walletSaving: "Saving",
  walletInvalidBalance: "Please enter a valid balance.",
  walletUpdateFailed: "Unable to update wallet balance.",
  walletNameRequired: "Wallet name is required.",
  walletCreateFailed: "Failed to create wallet.",
  walletCloseDialog: "Close create wallet dialog",
  walletDialogTag: "New Asset Allocation",
  walletDialogTitle: "Wallet Details",
  walletDialogBody: "Define your financial silo. Use wallets to separate freelance income, personal savings, or project-specific funds.",
  walletDialogEditTitle: "Edit Wallet",
  walletDialogEditBody: "Update your wallet details and default preference.",
  walletDialogNameLabel: "Wallet Name",
  walletDialogNamePlaceholder: "e.g., Freelance Fund",
  walletDialogBalanceLabel: "Starting Earning",
  walletDialogBalancePlaceholder: "10000000",
  walletDialogBalanceHint: "Values are formatted in Vietnamese Dong (VND).",
  walletDialogDefaultTitle: "Set as Default Wallet",
  walletDialogDefaultBody: "All new transactions will default to this wallet",
  walletDialogCreateAction: "Create Wallet",
  walletDialogCreating: "Creating Wallet...",
  walletDialogUpdateAction: "Update Wallet",
  walletDialogUpdating: "Updating Wallet...",
  walletDialogDeleteAction: "Delete Wallet",
  walletDialogDeleting: "Deleting Wallet...",
  walletDeleteFailed: "Unable to delete wallet.",
  walletDeleteBlockedDefault: "Default wallet cannot be deleted.",
  walletCurrencyPrefix: "₫",
  savingsPortfolio: "Fiscal Atelier - Savings Portfolio",
  savingsTitle: "Financial Ambition",
  savingsTotal: "Total Savings",
  savingsPrimaryFocus: "Primary Focus",
  savingsTargeted: "Targeted",
  savingsPrimaryDesc: "A dedicated savings objective tracked from linked transactions and monthly contributions.",
  savingsSaved: "Saved",
  savingsTarget: "Target",
  savingsRemaining: "Remaining",
  savingsNoPlan: "No savings plan yet",
  savingsCreatePlanHint: "Create a savings plan from your ledger workflow to track progress here.",
  savingsOtherAmbitions: "Other Ambitions",
  savingsMonthlyContributionTarget: "Monthly contribution target",
  savingsEnvisionGoal: "Envision New Goal",
  savingsAddToAtelier: "Add to your fiscal atelier",
};

const viVN: Dictionary = {
  navDashboard: "Tổng quan",
  navAtelier: "Ngân sách",
  navLedger: "Giao dịch",
  navSavings: "Tiết kiệm",
  navWallets: "Ví tiền",
  navSettings: "Cài đặt",
  actionNewEntry: "Thêm giao dịch",
  headerBrandSub: "Xưởng tài chính",
  headerUserRole: "Thành viên",
  actionLogout: "Đăng xuất",
  settingsTag: "Cấu hình",
  settingsTitleLine1: "Thiết lập",
  settingsTitleLine2: "Cá nhân",
  settingsIntro: "Tùy chỉnh ứng dụng tài chính theo cách quản lý và ngôn ngữ của bạn.",
  settingsThemeTitle: "Giao diện",
  settingsVisualIdentity: "Hiển thị",
  settingsLightMode: "Chế độ sáng",
  settingsDarkMode: "Chế độ tối",
  settingsSystemDefault: "Theo hệ thống",
  settingsProfileTitle: "Hồ sơ",
  settingsFullName: "Họ tên",
  settingsEmail: "Email",
  settingsCurrencyHub: "Tiền tệ",
  settingsCurrency: "Loại tiền",
  settingsLanguageTitle: "Ngôn ngữ",
  settingsCurrentDisplay: "Ngôn ngữ hiển thị",
  settingsPrivacyTitle: "Bảo mật dữ liệu",
  settingsPrivacyBody: "Dữ liệu tài chính của bạn được mã hóa khi truyền tải và chỉ lưu trong phạm vi tài khoản của bạn.",
  settingsFooterHint: "Nhấn lưu để áp dụng thay đổi cho hồ sơ và tùy chọn của bạn.",
  actionReset: "Đặt lại",
  actionSaveSettings: "Lưu cài đặt",
  settingsSaved: "Đã lưu cài đặt thành công.",
  errorNameRequired: "Họ tên phải có ít nhất 2 ký tự.",
  errorCurrencyRequired: "Vui lòng chọn đơn vị tiền.",
  errorLanguageRequired: "Vui lòng chọn ngôn ngữ.",
  errorThemeRequired: "Vui lòng chọn giao diện.",
  newEntryBreadcrumb: "Nhật ký",
  newEntryTitle: "Giao dịch mới",
  newEntryHeroTag: "Chế độ nhập",
  newEntryHeroHeading: "Ghi lại tăng trưởng.",
  newEntryHeroBody: "Mỗi giao dịch là một mảnh ghép trong bức tranh tài chính của bạn. Hãy ghi chép rõ ràng và có chủ đích.",
  newEntryTipTitle: "Mẹo sử dụng",
  newEntryTipBody: "Viết mô tả rõ ràng để báo cáo chính xác hơn và dễ theo dõi thói quen chi tiêu.",
  txErrorAmountRequired: "Vui lòng nhập số tiền.",
  txErrorDescriptionRequired: "Vui lòng nhập mô tả.",
  txErrorDateRequired: "Vui lòng chọn ngày.",
  txErrorWalletRequired: "Vui lòng chọn ví.",
  txErrorRecurringDayRange: "Ngày lặp lại phải trong khoảng 1 đến 31.",
  txErrorRecurringEndDate: "Ngày kết thúc phải lớn hơn hoặc bằng ngày giao dịch.",
  txTypeExpense: "Chi tiêu",
  txTypeIncome: "Thu nhập",
  txRecurring: "Lặp lại",
  txFrequency: "Tần suất",
  txFrequencyMonthly: "Hàng tháng",
  txFrequencyYearly: "Hàng năm",
  txDayOfMonth: "Ngày trong tháng",
  txDayOfMonthHelp: "Ví dụ: đặt 5 để lặp vào ngày 5 hằng tháng.",
  txEndDate: "Ngày kết thúc",
  txNoEndDate: "Không giới hạn",
  txEndDateHelp: "Tùy chọn. Dừng lặp sau ngày này.",
  txDescription: "Mô tả",
  txDescriptionPlaceholder: "Ví dụ: Cà phê buổi sáng",
  txCategory: "Danh mục",
  txNoCategory: "Không có danh mục",
  txWallet: "Ví",
  txDate: "Ngày",
  txNotes: "Ghi chú",
  txOptional: "Tùy chọn",
  txNotesPlaceholder: "Thêm thông tin chi tiết cho giao dịch...",
  txAdd: "Thêm giao dịch",
  txAdding: "Đang thêm giao dịch...",
  dashBudgetAlert: "Cảnh báo ngân sách",
  dashExceededBy: "Bạn đã vượt ngân sách tháng",
  dashReallocate: "Phân bổ lại",
  dashDismissAlert: "Đóng cảnh báo",
  dashTotalNetWorth: "Tổng tài sản ròng",
  dashVsLastMonth: "so với chi tiêu tháng trước",
  dashAssets: "Tài sản",
  dashLiabilities: "Nợ phải trả",
  dashMonthlySpending: "Chi tiêu tháng",
  dashMonthlyLimit: "Hạn mức tháng",
  dashUsed: "Đã dùng",
  dashSavingsGoal: "Mục tiêu tiết kiệm",
  dashCreateOne: "Tạo mới",
  dashComplete: "Hoàn thành",
  dashPrevSavingsGoal: "Mục tiêu trước",
  dashNextSavingsGoal: "Mục tiêu tiếp",
  dashRecentEntries: "Giao dịch gần đây",
  dashFilters: "Bộ lọc",
  dashExportCsv: "Xuất CSV",
  dashNoRecentEntries: "Chưa có giao dịch gần đây.",
  dashUncategorized: "Chưa phân loại",
  dashStatusReceived: "ĐÃ NHẬN",
  dashStatusCompleted: "HOÀN TẤT",
  topCategoriesTitle: "Danh mục chi tiêu",
  topCategoriesShowList: "Xem danh sách",
  topCategoriesShowChart: "Xem biểu đồ",
  topCategoriesNoSpending: "Chưa có dữ liệu chi theo danh mục.",
  topCategoriesTotal: "Tổng",
  activeBudgetsTitle: "Ngân sách đang theo dõi",
  activeBudgetsFilterLabel: "Lọc trạng thái ngân sách",
  activeBudgetsFilterAll: "Tất cả",
  activeBudgetsFilterHealthy: "Ổn định",
  activeBudgetsFilterOverspent: "Vượt mức",
  activeBudgetsPrev: "Trang trước",
  activeBudgetsNext: "Trang sau",
  activeBudgetsNoLimits: "Chưa thiết lập hạn mức ngân sách.",
  activeBudgetsNoFiltered: "Không có ngân sách phù hợp.",
  activeBudgetsEndsIn: "Kết thúc sau",
  activeBudgetsDays: "ngày",
  activeBudgetsOverspent: "Vượt mức",
  activeBudgetsHealthy: "Ổn định",
  activeBudgetsSpent: "Đã chi",
  activeBudgetsBudget: "Ngân sách",
  activeBudgetsExcessThisMonth: "Vượt trong tháng",
  activeBudgetsRemainingLimit: "còn lại trong hạn mức",
  ledgerToday: "Hôm nay",
  ledgerYesterday: "Hôm qua",
  ledgerTabActivity: "Hoạt động",
  ledgerTabReports: "Báo cáo",
  ledgerTabBudgets: "Ngân sách",
  ledgerTitle: "Sổ giao dịch",
  ledgerSubtitle: "Tổng quan dòng tiền của bạn. Theo dõi từng giao dịch và bám sát mục tiêu tài chính hằng tháng.",
  ledgerMtdSpending: "Chi tiêu tháng",
  ledgerSearchEntries: "Tìm giao dịch",
  ledgerSearchPlaceholder: "Tìm giao dịch...",
  ledgerFilterCategory: "Danh mục",
  ledgerFilterAmount: "Số tiền",
  ledgerFilterWallet: "Ví",
  ledgerTypeIncome: "Thu nhập",
  ledgerTypeExpense: "Chi tiêu",
  ledgerApply: "Áp dụng",
  ledgerNoEntriesMatch: "Không có giao dịch phù hợp bộ lọc.",
  ledgerUncategorized: "Chưa phân loại",
  ledgerShowingTransactions: "Đang hiển thị giao dịch",
  accountsPortfolio: "Danh mục tài chính",
  accountsYourAtelier: "Không gian",
  accountsWallets: "Ví tiền",
  accountsArchiveOld: "Lưu trữ cũ",
  accountsNewWallet: "Ví mới",
  accountsNoWallet: "Chưa có ví",
  accountsCreateFirstWallet: "Tạo ví đầu tiên để bắt đầu theo dõi số dư.",
  accountsSetDefault: "Đặt mặc định",
  walletDefaultBadge: "Ví mặc định",
  walletEdit: "Sửa",
  walletEditAria: "Chỉnh sửa số dư ví",
  walletSetCurrentBalance: "Đặt số dư hiện tại",
  walletSave: "Lưu",
  walletSaving: "Đang lưu",
  walletInvalidBalance: "Vui lòng nhập số dư hợp lệ.",
  walletUpdateFailed: "Không thể cập nhật số dư ví.",
  walletNameRequired: "Vui lòng nhập tên ví.",
  walletCreateFailed: "Không thể tạo ví.",
  walletCloseDialog: "Đóng hộp thoại tạo ví",
  walletDialogTag: "Phân bổ tài sản mới",
  walletDialogTitle: "Thông tin ví",
  walletDialogBody: "Tạo ngăn tài chính riêng cho từng mục đích: thu nhập freelance, tiết kiệm cá nhân hoặc quỹ dự án.",
  walletDialogEditTitle: "Chỉnh sửa ví",
  walletDialogEditBody: "Cập nhật thông tin ví và tùy chọn mặc định.",
  walletDialogNameLabel: "Tên ví",
  walletDialogNamePlaceholder: "Ví dụ: Quỹ Freelance",
  walletDialogBalanceLabel: "Số dư khởi tạo",
  walletDialogBalancePlaceholder: "10000000",
  walletDialogBalanceHint: "Giá trị được định dạng theo Việt Nam Đồng (VND).",
  walletDialogDefaultTitle: "Đặt làm ví mặc định",
  walletDialogDefaultBody: "Các giao dịch mới sẽ tự động dùng ví này",
  walletDialogCreateAction: "Tạo ví",
  walletDialogCreating: "Đang tạo ví...",
  walletDialogUpdateAction: "Cập nhật ví",
  walletDialogUpdating: "Đang cập nhật ví...",
  walletDialogDeleteAction: "Xóa ví",
  walletDialogDeleting: "Đang xóa ví...",
  walletDeleteFailed: "Không thể xóa ví.",
  walletDeleteBlockedDefault: "Không thể xóa ví mặc định.",
  walletCurrencyPrefix: "₫",
  savingsPortfolio: "Không gian tiết kiệm tài chính",
  savingsTitle: "Mục tiêu tài chính",
  savingsTotal: "Tổng tiền tiết kiệm",
  savingsPrimaryFocus: "Mục tiêu chính",
  savingsTargeted: "Mốc",
  savingsPrimaryDesc: "Mục tiêu tiết kiệm chính được theo dõi từ giao dịch liên kết và mức đóng góp hằng tháng.",
  savingsSaved: "Đã tích lũy",
  savingsTarget: "Mục tiêu",
  savingsRemaining: "Còn lại",
  savingsNoPlan: "Chưa có kế hoạch tiết kiệm",
  savingsCreatePlanHint: "Tạo kế hoạch tiết kiệm từ luồng giao dịch để theo dõi tiến độ tại đây.",
  savingsOtherAmbitions: "Mục tiêu khác",
  savingsMonthlyContributionTarget: "Mức đóng góp hằng tháng",
  savingsEnvisionGoal: "Thêm mục tiêu mới",
  savingsAddToAtelier: "Bổ sung vào không gian tài chính",
};

export const normalizeLanguage = (value?: string | null): AppLanguage => {
  if (value === "vi-VN") return "vi-VN";
  if (value === "fr-FR") return "fr-FR";
  if (value === "ja-JP") return "ja-JP";
  return "en-US";
};

export const getDictionary = (language?: string | null): Dictionary => {
  const normalized = normalizeLanguage(language);
  if (normalized === "vi-VN") {
    return viVN;
  }
  return enUS;
};

export const tr = (language: string | null | undefined, enText: string, viText: string) => {
  return normalizeLanguage(language) === "vi-VN" ? viText : enText;
};
