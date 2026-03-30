export type AppLanguage = "en-US" | "vi-VN" | "fr-FR" | "ja-JP";

type FlatDictionary = {
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
  txEditTitle: string;
  txEditCloseAria: string;
  txEditAmountLabel: string;
  txEditCancel: string;
  txEditSave: string;
  txEditSaving: string;
  txCreateFailed: string;
  txCreateSuccess: string;
  txUpdateFailed: string;
  txUpdateSuccess: string;
  settingsSaveFailed: string;
  walletCreateSuccess: string;
  walletUpdateSuccess: string;
  walletDeleteSuccess: string;
  ledgerDeleteFailed: string;
  ledgerDeleteSuccess: string;
  ledgerDeleteAria: string;
  ledgerDeleteTitle: string;
  ledgerDeleteBody: string;
  ledgerDeleteDeleting: string;
  ledgerDeleteAction: string;
  ledgerDeleteKeep: string;
  ledgerDeletePermanent: string;
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
  savingsPlanNameRequired: string;
  savingsPlanTargetRequired: string;
  savingsPlanMonthlyRequired: string;
  savingsPlanDateRequired: string;
  savingsPlanDateInvalid: string;
  savingsPlanDateMin: string;
  savingsPlanCreateFailed: string;
  savingsPlanCreateSuccess: string;
  savingsPlanNotAvailable: string;
  savingsPlanCreateAction: string;
  savingsPlanAddNewTitle: string;
  savingsPlanSubtitle: string;
  savingsPlanCloseAria: string;
  savingsPlanBlueprintTitle: string;
  savingsPlanNameLabel: string;
  savingsPlanNamePlaceholder: string;
  savingsPlanTargetLabel: string;
  savingsPlanTargetPlaceholder: string;
  savingsPlanMonthlyLabel: string;
  savingsPlanMonthlyPlaceholder: string;
  savingsPlanArrivalDateLabel: string;
  savingsPlanArrivalHint: string;
  savingsPlanDiscard: string;
  savingsPlanCreating: string;
  savingsPlanProjectionPreview: string;
  savingsPlanEstimatedMonths: string;
  savingsPlanToReachTarget: string;
  savingsPlanArrival: string;
  savingsPlanMonthly: string;
  savingsPlanTip: string;
  atelierCapInvalidValue: string;
  atelierCapUpdateFailed: string;
  atelierCapUpdateSuccess: string;
  atelierTotalMonthlyCap: string;
  atelierEditTotalMonthlyCapAria: string;
  atelierActionEdit: string;
  atelierActionSaving: string;
  atelierActionSave: string;
  atelierActionCancel: string;
  atelierAllocated: string;
  atelierRemaining: string;
  atelierThisMonthIncome: string;
  atelierFiscalMasterplan: string;
  atelierBudgetAllocation: string;
  atelierPeriod: string;
  atelierMonthlySavingsPlan: string;
  atelierAutomaticVaultAllocation: string;
  atelierOn: string;
  atelierSavingsTarget: string;
  atelierNoSavingsPlansYet: string;
  atelierGoalCoverage: string;
  atelierCovered: string;
  atelierSavedThisMonth: string;
  atelierAddCategoriesHint: string;
  atelierMonthlyLimit: string;
  atelierDragItemAria: string;
  atelierDragToReorderTitle: string;
  atelierUsed: string;
  atelierSpent: string;
  atelierOverspent: string;
  atelierWarning: string;
  atelierHealthy: string;
  atelierCategoryAtelier: string;
  atelierDragCardsHint: string;
  atelierCurrencyHintVnd: string;
  atelierCurrencyHintTemplate: string;
  atelierCategoryNameRequired: string;
  atelierMonthlyLimitNonNegative: string;
  atelierCreateCategoryFailed: string;
  atelierCreateCategorySuccess: string;
  atelierAddNewCategory: string;
  atelierCreateNewCategory: string;
  atelierCategorySegment: string;
  atelierCategoryNameLabel: string;
  atelierCategoryNamePlaceholder: string;
  atelierMonthlySpendingLimit: string;
  atelierOverExpenseWarning: string;
  atelierEnabled: string;
  atelierDisabled: string;
  atelierWarnAt: string;
  atelierIconography: string;
  atelierSearchIconsPlaceholder: string;
  atelierNoIconsMatch: string;
  atelierSelectIconAriaTemplate: string;
  atelierAddingCategory: string;
  atelierAddCategory: string;
  atelierEditCategoryTitleTemplate: string;
  atelierEditCategorySubtitle: string;
  atelierEditCategoryFailed: string;
  atelierEditCategorySuccess: string;
  atelierEditIconAria: string;
  atelierSaveChanges: string;
  atelierDiscard: string;
  atelierChooseIcon: string;
  atelierCloseIconPickerAria: string;
  atelierKeepLimitNextMonth: string;
  atelierKeepLimitNextMonthHint: string;
  atelierWarningHint: string;
  atelierDeleteAriaTemplate: string;
  atelierDeleteFailed: string;
  atelierDeleteSuccess: string;
  atelierDeleteTitleTemplate: string;
  atelierDeleteBodyLine1: string;
  atelierDeleteBodyLine2: string;
  atelierAccumulatedValue: string;
  atelierDeleteCategoryAction: string;
  atelierDeleteCategoryDeleting: string;
  atelierKeepCategory: string;
  atelierSecurityProtocol: string;
  reportsTransactionFallback: string;
  reportsTotalExpense: string;
  reportsLiveThisMonth: string;
  reportsBudgetAdherence: string;
  reportsOverTarget: string;
  reportsOnTrackPerformance: string;
  reportsTopSavings: string;
  reportsPotentialOptimization: string;
  reportsPerformanceAnalytics: string;
  reportsFlowHorizons: string;
  reportsMonthly: string;
  reportsMonthlyExpenseVsBudget: string;
  reportsActual: string;
  reportsBudget: string;
  reportsYearlyHorizon: string;
  reportsAnnualBudget: string;
  reportsActualSpentYtd: string;
  reportsHealthyBehaviorHint: string;
  reportsExportPdf: string;
  calendarWeekdayMon: string;
  calendarWeekdayTue: string;
  calendarWeekdayWed: string;
  calendarWeekdayThu: string;
  calendarWeekdayFri: string;
  calendarWeekdaySat: string;
  calendarWeekdaySun: string;
  calendarMonthJanuary: string;
  calendarMonthFebruary: string;
  calendarMonthMarch: string;
  calendarMonthApril: string;
  calendarMonthMay: string;
  calendarMonthJune: string;
  calendarMonthJuly: string;
  calendarMonthAugust: string;
  calendarMonthSeptember: string;
  calendarMonthOctober: string;
  calendarMonthNovember: string;
  calendarMonthDecember: string;
  calendarDailyExpenseTitle: string;
  calendarDailyDetailsTitle: string;
  calendarTotalSpent: string;
  calendarCloseView: string;
  onboardingSidebar: string;
  onboardingDashboard: string;
  onboardingAtelier: string;
  onboardingLedger: string;
  onboardingSavings: string;
  onboardingWallets: string;
  onboardingNewEntry: string;
  onboardingSettings: string;
  onboardingMainContent: string;
};

const enUS: FlatDictionary = {
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
  txEditTitle: "Edit Transaction",
  txEditCloseAria: "Close edit transaction dialog",
  txEditAmountLabel: "Amount (VND)",
  txEditCancel: "Cancel",
  txEditSave: "Save Changes",
  txEditSaving: "Saving...",
  txCreateFailed: "Could not add transaction.",
  txCreateSuccess: "Transaction added successfully",
  txUpdateFailed: "Could not update transaction.",
  txUpdateSuccess: "Transaction updated successfully",
  settingsSaveFailed: "Could not save settings.",
  walletCreateSuccess: "Wallet created successfully",
  walletUpdateSuccess: "Wallet updated successfully",
  walletDeleteSuccess: "Wallet deleted successfully",
  ledgerDeleteFailed: "Unable to delete transaction.",
  ledgerDeleteSuccess: "Transaction deleted successfully",
  ledgerDeleteAria: "Delete transaction",
  ledgerDeleteTitle: "Delete Transaction?",
  ledgerDeleteBody: "Are you sure you want to remove this entry from your ledger? This action is permanent and will adjust your monthly spending totals.",
  ledgerDeleteDeleting: "Deleting...",
  ledgerDeleteAction: "Delete Entry",
  ledgerDeleteKeep: "Keep Entry",
  ledgerDeletePermanent: "Permanent ledger modification",
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
  savingsPlanNameRequired: "Plan name is required.",
  savingsPlanTargetRequired: "Savings target must be greater than zero.",
  savingsPlanMonthlyRequired: "Monthly contribution must be greater than zero.",
  savingsPlanDateRequired: "Target date is required.",
  savingsPlanDateInvalid: "Target date is invalid.",
  savingsPlanDateMin: "Target date must be this month or later.",
  savingsPlanCreateFailed: "Unable to create savings plan.",
  savingsPlanCreateSuccess: "Savings plan created successfully",
  savingsPlanNotAvailable: "Not available",
  savingsPlanCreateAction: "Create Savings Plan",
  savingsPlanAddNewTitle: "Add New Savings Plan",
  savingsPlanSubtitle: "Design a focused savings vessel for your next milestone.",
  savingsPlanCloseAria: "Close",
  savingsPlanBlueprintTitle: "The Blueprint",
  savingsPlanNameLabel: "Plan Name",
  savingsPlanNamePlaceholder: "e.g., Kyoto Sanctuary Fund",
  savingsPlanTargetLabel: "Savings Target",
  savingsPlanTargetPlaceholder: "500000000",
  savingsPlanMonthlyLabel: "Monthly Contribution",
  savingsPlanMonthlyPlaceholder: "15000000",
  savingsPlanArrivalDateLabel: "Arrival Date",
  savingsPlanArrivalHint: "Auto-calculated from savings target and monthly contribution.",
  savingsPlanDiscard: "Discard",
  savingsPlanCreating: "Creating...",
  savingsPlanProjectionPreview: "Projection Preview",
  savingsPlanEstimatedMonths: "Estimated Months",
  savingsPlanToReachTarget: "To reach your target",
  savingsPlanArrival: "Arrival",
  savingsPlanMonthly: "Monthly",
  savingsPlanTip: "Tip: increase monthly contribution to shorten your timeline.",
  atelierCapInvalidValue: "Please enter a valid cap value.",
  atelierCapUpdateFailed: "Unable to update total monthly cap.",
  atelierCapUpdateSuccess: "Monthly cap updated successfully",
  atelierTotalMonthlyCap: "Total Monthly Cap",
  atelierEditTotalMonthlyCapAria: "Edit total monthly cap",
  atelierActionEdit: "Edit",
  atelierActionSaving: "Saving",
  atelierActionSave: "Save",
  atelierActionCancel: "Cancel",
  atelierAllocated: "Allocated",
  atelierRemaining: "Remaining",
  atelierThisMonthIncome: "This Month Income",
  atelierFiscalMasterplan: "Fiscal Masterplan",
  atelierBudgetAllocation: "Budget Allocation",
  atelierPeriod: "Period",
  atelierMonthlySavingsPlan: "Monthly Savings Plan",
  atelierAutomaticVaultAllocation: "Automatic Vault Allocation",
  atelierOn: "ON",
  atelierSavingsTarget: "Savings Target",
  atelierNoSavingsPlansYet: "No savings plans yet.",
  atelierGoalCoverage: "Goal Coverage",
  atelierCovered: "Covered",
  atelierSavedThisMonth: "Saved this month:",
  atelierAddCategoriesHint: "Add categories with monthly limits to start your atelier view.",
  atelierMonthlyLimit: "Monthly Limit",
  atelierDragItemAria: "Drag {name}",
  atelierDragToReorderTitle: "Drag to reorder",
  atelierUsed: "Used",
  atelierSpent: "Spent:",
  atelierOverspent: "Overspent",
  atelierWarning: "Warning",
  atelierHealthy: "Healthy",
  atelierCategoryAtelier: "Category Atelier",
  atelierDragCardsHint: "Drag cards by the handle to save your custom order.",
  atelierCurrencyHintVnd: "Formatted in Vietnamese Dong (VND)",
  atelierCurrencyHintTemplate: "Formatted in {currency}",
  atelierCategoryNameRequired: "Category name is required.",
  atelierMonthlyLimitNonNegative: "Monthly limit must be zero or greater.",
  atelierCreateCategoryFailed: "Failed to create category.",
  atelierCreateCategorySuccess: "Category created successfully",
  atelierAddNewCategory: "Add New Category",
  atelierCreateNewCategory: "Create New Category",
  atelierCategorySegment: "Define a new boutique spending segment",
  atelierCategoryNameLabel: "Category Name",
  atelierCategoryNamePlaceholder: "e.g., Luxury Travel",
  atelierMonthlySpendingLimit: "Monthly Spending Limit",
  atelierOverExpenseWarning: "Over-expense Warning",
  atelierEnabled: "Enabled",
  atelierDisabled: "Disabled",
  atelierWarnAt: "Warn At",
  atelierIconography: "Iconography",
  atelierSearchIconsPlaceholder: "Search icons (flight, home, savings...)",
  atelierNoIconsMatch: "No icons match your search.",
  atelierSelectIconAriaTemplate: "Select {icon} icon",
  atelierAddingCategory: "Adding Category...",
  atelierAddCategory: "Add Category",
  atelierEditCategoryTitleTemplate: "Edit Category: {name}",
  atelierEditCategorySubtitle: "Adjust your spending parameters for the current fiscal cycle.",
  atelierEditCategoryFailed: "Failed to update category.",
  atelierEditCategorySuccess: "Category updated successfully",
  atelierEditIconAria: "Edit icon",
  atelierSaveChanges: "Save Changes",
  atelierDiscard: "Discard",
  atelierChooseIcon: "Choose icon",
  atelierCloseIconPickerAria: "Close icon picker",
  atelierKeepLimitNextMonth: "Keep current limit for next month",
  atelierKeepLimitNextMonthHint: "If not enabled, the limit will be reset to unlimited for the next month.",
  atelierWarningHint: "Get notified before you exceed your limit.",
  atelierDeleteAriaTemplate: "Delete {name}",
  atelierDeleteFailed: "Failed to delete category.",
  atelierDeleteSuccess: "Category deleted",
  atelierDeleteTitleTemplate: "Delete Category: {name}?",
  atelierDeleteBodyLine1: "This action will unassign transactions from this category.",
  atelierDeleteBodyLine2:
    "You will need to re-categorize them to keep your fiscal record consistent. Unassigned data may not be fully reflected in category reports.",
  atelierAccumulatedValue: "Accumulated Value",
  atelierDeleteCategoryAction: "Delete Category",
  atelierDeleteCategoryDeleting: "Deleting...",
  atelierKeepCategory: "Keep Category",
  atelierSecurityProtocol: "Fiscal Atelier Security Protocol",
  reportsTransactionFallback: "Transaction",
  reportsTotalExpense: "Total Expense",
  reportsLiveThisMonth: "Live this month",
  reportsBudgetAdherence: "Budget Adherence",
  reportsOverTarget: "Over target",
  reportsOnTrackPerformance: "On track performance",
  reportsTopSavings: "Top Savings",
  reportsPotentialOptimization: "Potential optimization this month",
  reportsPerformanceAnalytics: "Performance Analytics",
  reportsFlowHorizons: "Visualizing your fiscal flow across time horizons.",
  reportsMonthly: "Monthly",
  reportsMonthlyExpenseVsBudget: "Monthly Expense vs Budget",
  reportsActual: "Actual",
  reportsBudget: "Budget",
  reportsYearlyHorizon: "Yearly Horizon",
  reportsAnnualBudget: "Annual Budget",
  reportsActualSpentYtd: "Actual Spent (YTD)",
  reportsHealthyBehaviorHint: "You are tracking with healthy spending behavior compared to your current budget envelope.",
  reportsExportPdf: "Export PDF Report",
  calendarWeekdayMon: "Mon",
  calendarWeekdayTue: "Tue",
  calendarWeekdayWed: "Wed",
  calendarWeekdayThu: "Thu",
  calendarWeekdayFri: "Fri",
  calendarWeekdaySat: "Sat",
  calendarWeekdaySun: "Sun",
  calendarMonthJanuary: "January",
  calendarMonthFebruary: "February",
  calendarMonthMarch: "March",
  calendarMonthApril: "April",
  calendarMonthMay: "May",
  calendarMonthJune: "June",
  calendarMonthJuly: "July",
  calendarMonthAugust: "August",
  calendarMonthSeptember: "September",
  calendarMonthOctober: "October",
  calendarMonthNovember: "November",
  calendarMonthDecember: "December",
  calendarDailyExpenseTitle: "Daily Expense Calendar",
  calendarDailyDetailsTitle: "Daily Details",
  calendarTotalSpent: "Total Spent",
  calendarCloseView: "Close View",
  onboardingSidebar: "Welcome to Lush Ledger. This sidebar is your control center for dashboard, budgets, ledger, savings, wallets, and settings.",
  onboardingDashboard: "Start here: Dashboard gives a fast health check of net worth, spending, and active budgets.",
  onboardingAtelier: "Atelier is your monthly budget studio. Set category limits, see healthy/warning/overspent signals, and rebalance faster.",
  onboardingLedger: "Ledger is your transaction timeline. Search, filter, and audit every income/expense entry in one place.",
  onboardingSavings: "Savings tracks plan targets and monthly contributions, so you can forecast progress toward each financial goal.",
  onboardingWallets: "Wallets organize money sources. Keep separate balances (cash, checking, savings) and set a default wallet for new entries.",
  onboardingNewEntry: "Use New Entry to log income or expense. Keeping entries current makes all analytics accurate.",
  onboardingSettings: "In Settings, choose language, currency, and theme for your workspace.",
  onboardingMainContent: "This is your main workspace. Explore cards and reports to track your money flow and goals.",
};

const viVN: FlatDictionary = {
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
  txEditTitle: "Chỉnh sửa giao dịch",
  txEditCloseAria: "Đóng hộp thoại chỉnh sửa giao dịch",
  txEditAmountLabel: "Số tiền (VND)",
  txEditCancel: "Hủy",
  txEditSave: "Lưu thay đổi",
  txEditSaving: "Đang lưu...",
  txCreateFailed: "Không thể thêm giao dịch.",
  txCreateSuccess: "Đã thêm giao dịch thành công",
  txUpdateFailed: "Không thể cập nhật giao dịch.",
  txUpdateSuccess: "Đã cập nhật giao dịch thành công",
  settingsSaveFailed: "Không thể lưu cài đặt.",
  walletCreateSuccess: "Đã tạo ví thành công",
  walletUpdateSuccess: "Đã cập nhật ví thành công",
  walletDeleteSuccess: "Đã xóa ví thành công",
  ledgerDeleteFailed: "Không thể xóa giao dịch.",
  ledgerDeleteSuccess: "Đã xóa giao dịch thành công",
  ledgerDeleteAria: "Xóa giao dịch",
  ledgerDeleteTitle: "Xóa giao dịch?",
  ledgerDeleteBody: "Bạn có chắc chắn muốn xóa giao dịch này khỏi sổ cái? Hành động này là vĩnh viễn và sẽ cập nhật tổng chi tiêu theo tháng.",
  ledgerDeleteDeleting: "Đang xóa...",
  ledgerDeleteAction: "Xóa giao dịch",
  ledgerDeleteKeep: "Giữ lại",
  ledgerDeletePermanent: "Thay đổi sổ cái vĩnh viễn",
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
  savingsPlanNameRequired: "Tên kế hoạch là bắt buộc.",
  savingsPlanTargetRequired: "Mục tiêu tiết kiệm phải lớn hơn 0.",
  savingsPlanMonthlyRequired: "Mức đóng góp hằng tháng phải lớn hơn 0.",
  savingsPlanDateRequired: "Ngày mục tiêu là bắt buộc.",
  savingsPlanDateInvalid: "Ngày mục tiêu không hợp lệ.",
  savingsPlanDateMin: "Ngày mục tiêu phải từ tháng này trở đi.",
  savingsPlanCreateFailed: "Không thể tạo kế hoạch tiết kiệm.",
  savingsPlanCreateSuccess: "Tạo kế hoạch tiết kiệm thành công",
  savingsPlanNotAvailable: "Chưa có",
  savingsPlanCreateAction: "Tạo kế hoạch tiết kiệm",
  savingsPlanAddNewTitle: "Thêm kế hoạch tiết kiệm",
  savingsPlanSubtitle: "Thiết kế một kế hoạch tiết kiệm tập trung cho cột mốc tiếp theo.",
  savingsPlanCloseAria: "Đóng",
  savingsPlanBlueprintTitle: "Bản thiết kế",
  savingsPlanNameLabel: "Tên kế hoạch",
  savingsPlanNamePlaceholder: "Ví dụ: Quỹ nhà mơ ước",
  savingsPlanTargetLabel: "Mục tiêu tiết kiệm",
  savingsPlanTargetPlaceholder: "500000000",
  savingsPlanMonthlyLabel: "Đóng góp hằng tháng",
  savingsPlanMonthlyPlaceholder: "15000000",
  savingsPlanArrivalDateLabel: "Ngày về đích",
  savingsPlanArrivalHint: "Tự động tính từ mục tiêu tiết kiệm và mức đóng góp hằng tháng.",
  savingsPlanDiscard: "Hủy",
  savingsPlanCreating: "Đang tạo...",
  savingsPlanProjectionPreview: "Dự báo tiến độ",
  savingsPlanEstimatedMonths: "Số tháng dự kiến",
  savingsPlanToReachTarget: "Để đạt mục tiêu của bạn",
  savingsPlanArrival: "Về đích",
  savingsPlanMonthly: "Theo tháng",
  savingsPlanTip: "Gợi ý: tăng đóng góp hằng tháng để rút ngắn thời gian đạt mục tiêu.",
  atelierCapInvalidValue: "Vui lòng nhập hạn mức hợp lệ.",
  atelierCapUpdateFailed: "Không thể cập nhật tổng hạn mức tháng.",
  atelierCapUpdateSuccess: "Cập nhật hạn mức tháng thành công",
  atelierTotalMonthlyCap: "Tổng hạn mức tháng",
  atelierEditTotalMonthlyCapAria: "Chỉnh sửa tổng hạn mức tháng",
  atelierActionEdit: "Sửa",
  atelierActionSaving: "Đang lưu",
  atelierActionSave: "Lưu",
  atelierActionCancel: "Hủy",
  atelierAllocated: "Đã phân bổ",
  atelierRemaining: "Còn lại",
  atelierThisMonthIncome: "Thu nhập tháng này",
  atelierFiscalMasterplan: "Kế hoạch tài chính",
  atelierBudgetAllocation: "Phân bổ ngân sách",
  atelierPeriod: "Kỳ",
  atelierMonthlySavingsPlan: "Kế hoạch tiết kiệm tháng",
  atelierAutomaticVaultAllocation: "Phân bổ quỹ tự động",
  atelierOn: "BẬT",
  atelierSavingsTarget: "Mục tiêu tiết kiệm",
  atelierNoSavingsPlansYet: "Chưa có kế hoạch tiết kiệm.",
  atelierGoalCoverage: "Mức độ hoàn thành",
  atelierCovered: "đạt",
  atelierSavedThisMonth: "Đã tiết kiệm tháng này:",
  atelierAddCategoriesHint: "Thêm danh mục có hạn mức tháng để bắt đầu không gian Atelier.",
  atelierMonthlyLimit: "Hạn mức tháng",
  atelierDragItemAria: "Kéo {name}",
  atelierDragToReorderTitle: "Kéo để sắp xếp",
  atelierUsed: "đã dùng",
  atelierSpent: "Đã chi:",
  atelierOverspent: "Vượt mức",
  atelierWarning: "Cảnh báo",
  atelierHealthy: "Ổn định",
  atelierCategoryAtelier: "Atelier danh mục",
  atelierDragCardsHint: "Kéo các thẻ bằng tay cầm để lưu thứ tự tùy chỉnh.",
  atelierCurrencyHintVnd: "Định dạng theo Việt Nam Đồng (VND)",
  atelierCurrencyHintTemplate: "Định dạng theo {currency}",
  atelierCategoryNameRequired: "Tên danh mục là bắt buộc.",
  atelierMonthlyLimitNonNegative: "Hạn mức tháng phải lớn hơn hoặc bằng 0.",
  atelierCreateCategoryFailed: "Không thể tạo danh mục.",
  atelierCreateCategorySuccess: "Tạo danh mục thành công",
  atelierAddNewCategory: "Thêm danh mục mới",
  atelierCreateNewCategory: "Tạo danh mục mới",
  atelierCategorySegment: "Tạo một nhóm chi tiêu mới",
  atelierCategoryNameLabel: "Tên danh mục",
  atelierCategoryNamePlaceholder: "ví dụ: Du lịch cao cấp",
  atelierMonthlySpendingLimit: "Hạn mức chi tiêu tháng",
  atelierOverExpenseWarning: "Cảnh báo vượt chi",
  atelierEnabled: "Bật",
  atelierDisabled: "Tắt",
  atelierWarnAt: "Cảnh báo tại",
  atelierIconography: "Biểu tượng",
  atelierSearchIconsPlaceholder: "Tìm biểu tượng (flight, home, savings...)",
  atelierNoIconsMatch: "Không có biểu tượng phù hợp.",
  atelierSelectIconAriaTemplate: "Chọn biểu tượng {icon}",
  atelierAddingCategory: "Đang thêm danh mục...",
  atelierAddCategory: "Thêm danh mục",
  atelierEditCategoryTitleTemplate: "Sửa danh mục: {name}",
  atelierEditCategorySubtitle: "Điều chỉnh giới hạn chi tiêu cho chu kỳ hiện tại.",
  atelierEditCategoryFailed: "Không thể cập nhật danh mục.",
  atelierEditCategorySuccess: "Cập nhật danh mục thành công",
  atelierEditIconAria: "Sửa biểu tượng",
  atelierSaveChanges: "Lưu thay đổi",
  atelierDiscard: "Bỏ qua",
  atelierChooseIcon: "Chọn biểu tượng",
  atelierCloseIconPickerAria: "Đóng trình chọn biểu tượng",
  atelierKeepLimitNextMonth: "Giữ hạn mức hiện tại cho tháng sau",
  atelierKeepLimitNextMonthHint: "Nếu tắt, hạn mức tháng sau sẽ được đặt về không giới hạn.",
  atelierWarningHint: "Nhận cảnh báo trước khi vượt hạn mức.",
  atelierDeleteAriaTemplate: "Xóa {name}",
  atelierDeleteFailed: "Không thể xóa danh mục.",
  atelierDeleteSuccess: "Đã xóa danh mục",
  atelierDeleteTitleTemplate: "Xóa danh mục: {name}?",
  atelierDeleteBodyLine1: "Hành động này sẽ bỏ gán các giao dịch khỏi danh mục này.",
  atelierDeleteBodyLine2:
    "Bạn cần phân loại lại để giữ dữ liệu tài chính nhất quán. Dữ liệu chưa phân loại có thể không được phản ánh đầy đủ trong báo cáo danh mục.",
  atelierAccumulatedValue: "Giá trị tích lũy",
  atelierDeleteCategoryAction: "Xóa danh mục",
  atelierDeleteCategoryDeleting: "Đang xóa...",
  atelierKeepCategory: "Giữ lại danh mục",
  atelierSecurityProtocol: "Giao thức bảo mật Fiscal Atelier",
  reportsTransactionFallback: "Giao dịch",
  reportsTotalExpense: "Tổng chi tiêu",
  reportsLiveThisMonth: "Trong tháng này",
  reportsBudgetAdherence: "Tuân thủ ngân sách",
  reportsOverTarget: "Vượt mục tiêu",
  reportsOnTrackPerformance: "Đang đúng kế hoạch",
  reportsTopSavings: "Tiết kiệm tối đa",
  reportsPotentialOptimization: "Khoản tối ưu tiềm năng trong tháng",
  reportsPerformanceAnalytics: "Phân tích hiệu suất",
  reportsFlowHorizons: "Trực quan hóa dòng tiền theo từng mốc thời gian.",
  reportsMonthly: "Theo tháng",
  reportsMonthlyExpenseVsBudget: "Chi tiêu tháng so với ngân sách",
  reportsActual: "Thực tế",
  reportsBudget: "Ngân sách",
  reportsYearlyHorizon: "Tầm nhìn năm",
  reportsAnnualBudget: "Ngân sách năm",
  reportsActualSpentYtd: "Đã chi (lũy kế năm)",
  reportsHealthyBehaviorHint: "Bạn đang theo dõi tốt và duy trì mức chi tiêu ổn định so với ngân sách hiện tại.",
  reportsExportPdf: "Xuất báo cáo PDF",
  calendarWeekdayMon: "T2",
  calendarWeekdayTue: "T3",
  calendarWeekdayWed: "T4",
  calendarWeekdayThu: "T5",
  calendarWeekdayFri: "T6",
  calendarWeekdaySat: "T7",
  calendarWeekdaySun: "CN",
  calendarMonthJanuary: "Tháng 1",
  calendarMonthFebruary: "Tháng 2",
  calendarMonthMarch: "Tháng 3",
  calendarMonthApril: "Tháng 4",
  calendarMonthMay: "Tháng 5",
  calendarMonthJune: "Tháng 6",
  calendarMonthJuly: "Tháng 7",
  calendarMonthAugust: "Tháng 8",
  calendarMonthSeptember: "Tháng 9",
  calendarMonthOctober: "Tháng 10",
  calendarMonthNovember: "Tháng 11",
  calendarMonthDecember: "Tháng 12",
  calendarDailyExpenseTitle: "Lịch chi tiêu theo ngày",
  calendarDailyDetailsTitle: "Chi tiết trong ngày",
  calendarTotalSpent: "Tổng đã chi",
  calendarCloseView: "Đóng",
  onboardingSidebar: "Chào mừng bạn đến với Lush Ledger. Thanh bên này là trung tâm điều hướng cho tổng quan, ngân sách, giao dịch, tiết kiệm, ví và cài đặt.",
  onboardingDashboard: "Bắt đầu từ đây: Tổng quan cho bạn bức tranh nhanh về tài sản ròng, chi tiêu và ngân sách đang theo dõi.",
  onboardingAtelier: "Atelier là nơi quản lý ngân sách theo tháng. Bạn đặt hạn mức danh mục, theo dõi trạng thái ổn định/cảnh báo/vượt mức và cân đối nhanh hơn.",
  onboardingLedger: "Ledger là dòng thời gian giao dịch của bạn. Tìm kiếm, lọc và đối chiếu mọi khoản thu/chi tại một nơi.",
  onboardingSavings: "Savings giúp theo dõi mục tiêu tiết kiệm và đóng góp hằng tháng, để dự báo tiến độ cho từng mục tiêu tài chính.",
  onboardingWallets: "Wallets giúp tách các nguồn tiền. Bạn quản lý số dư riêng (tiền mặt, tài khoản thanh toán, tiết kiệm) và đặt ví mặc định cho giao dịch mới.",
  onboardingNewEntry: "Dùng Thêm giao dịch để ghi thu nhập hoặc chi tiêu. Ghi nhật ký đầy đủ sẽ giúp báo cáo chính xác.",
  onboardingSettings: "Tại Cài đặt, bạn có thể chọn ngôn ngữ, tiền tệ và giao diện cho không gian làm việc.",
  onboardingMainContent: "Đây là khu vực làm việc chính. Khám phá các thẻ và báo cáo để theo dõi dòng tiền và mục tiêu.",
};

export const normalizeLanguage = (value?: string | null): AppLanguage => {
  if (value === "vi-VN") return "vi-VN";
  if (value === "fr-FR") return "fr-FR";
  if (value === "ja-JP") return "ja-JP";
  return "en-US";
};

export const getDictionary = (language?: string | null): FlatDictionary => {
  const normalized = normalizeLanguage(language);
  if (normalized === "vi-VN") {
    return viVN;
  }
  return enUS;
};

const dictionarySections = {
  common: [
    "navDashboard",
    "navAtelier",
    "navLedger",
    "navSavings",
    "navWallets",
    "navSettings",
    "actionNewEntry",
    "headerBrandSub",
    "headerUserRole",
    "actionLogout",
    "actionReset",
    "actionSaveSettings",
  ],
  settings: [
    "settingsTag",
    "settingsTitleLine1",
    "settingsTitleLine2",
    "settingsIntro",
    "settingsThemeTitle",
    "settingsVisualIdentity",
    "settingsLightMode",
    "settingsDarkMode",
    "settingsSystemDefault",
    "settingsProfileTitle",
    "settingsFullName",
    "settingsEmail",
    "settingsCurrencyHub",
    "settingsCurrency",
    "settingsLanguageTitle",
    "settingsCurrentDisplay",
    "settingsPrivacyTitle",
    "settingsPrivacyBody",
    "settingsFooterHint",
    "settingsSaved",
    "settingsSaveFailed",
    "errorNameRequired",
    "errorCurrencyRequired",
    "errorLanguageRequired",
    "errorThemeRequired",
  ],
  newEntry: [
    "newEntryBreadcrumb",
    "newEntryTitle",
    "newEntryHeroTag",
    "newEntryHeroHeading",
    "newEntryHeroBody",
    "newEntryTipTitle",
    "newEntryTipBody",
    "txCreateFailed",
    "txCreateSuccess",
  ],
  transaction: [
    "txErrorAmountRequired",
    "txErrorDescriptionRequired",
    "txErrorDateRequired",
    "txErrorWalletRequired",
    "txErrorRecurringDayRange",
    "txErrorRecurringEndDate",
    "txTypeExpense",
    "txTypeIncome",
    "txRecurring",
    "txFrequency",
    "txFrequencyMonthly",
    "txFrequencyYearly",
    "txDayOfMonth",
    "txDayOfMonthHelp",
    "txEndDate",
    "txNoEndDate",
    "txEndDateHelp",
    "txDescription",
    "txDescriptionPlaceholder",
    "txCategory",
    "txNoCategory",
    "txWallet",
    "txDate",
    "txNotes",
    "txOptional",
    "txNotesPlaceholder",
    "txAdd",
    "txAdding",
    "txEditTitle",
    "txEditCloseAria",
    "txEditAmountLabel",
    "txEditCancel",
    "txEditSave",
    "txEditSaving",
    "txUpdateFailed",
    "txUpdateSuccess",
  ],
  dashboard: [
    "dashBudgetAlert",
    "dashExceededBy",
    "dashReallocate",
    "dashDismissAlert",
    "dashTotalNetWorth",
    "dashVsLastMonth",
    "dashAssets",
    "dashLiabilities",
    "dashMonthlySpending",
    "dashMonthlyLimit",
    "dashUsed",
    "dashSavingsGoal",
    "dashCreateOne",
    "dashComplete",
    "dashPrevSavingsGoal",
    "dashNextSavingsGoal",
    "dashRecentEntries",
    "dashFilters",
    "dashExportCsv",
    "dashNoRecentEntries",
    "dashUncategorized",
    "dashStatusReceived",
    "dashStatusCompleted",
  ],
  atelier: [
    "topCategoriesTitle",
    "topCategoriesShowList",
    "topCategoriesShowChart",
    "topCategoriesNoSpending",
    "topCategoriesTotal",
    "activeBudgetsTitle",
    "activeBudgetsFilterLabel",
    "activeBudgetsFilterAll",
    "activeBudgetsFilterHealthy",
    "activeBudgetsFilterOverspent",
    "activeBudgetsPrev",
    "activeBudgetsNext",
    "activeBudgetsNoLimits",
    "activeBudgetsNoFiltered",
    "activeBudgetsEndsIn",
    "activeBudgetsDays",
    "activeBudgetsOverspent",
    "activeBudgetsHealthy",
    "activeBudgetsSpent",
    "activeBudgetsBudget",
    "activeBudgetsExcessThisMonth",
    "activeBudgetsRemainingLimit",
  ],
  ledger: [
    "ledgerToday",
    "ledgerYesterday",
    "ledgerTabActivity",
    "ledgerTabReports",
    "ledgerTabBudgets",
    "ledgerTitle",
    "ledgerSubtitle",
    "ledgerMtdSpending",
    "ledgerSearchEntries",
    "ledgerSearchPlaceholder",
    "ledgerFilterCategory",
    "ledgerFilterAmount",
    "ledgerFilterWallet",
    "ledgerTypeIncome",
    "ledgerTypeExpense",
    "ledgerApply",
    "ledgerNoEntriesMatch",
    "ledgerUncategorized",
    "ledgerShowingTransactions",
    "ledgerDeleteFailed",
    "ledgerDeleteSuccess",
    "ledgerDeleteAria",
    "ledgerDeleteTitle",
    "ledgerDeleteBody",
    "ledgerDeleteDeleting",
    "ledgerDeleteAction",
    "ledgerDeleteKeep",
    "ledgerDeletePermanent",
  ],
  accounts: [
    "accountsPortfolio",
    "accountsYourAtelier",
    "accountsWallets",
    "accountsArchiveOld",
    "accountsNewWallet",
    "accountsNoWallet",
    "accountsCreateFirstWallet",
    "accountsSetDefault",
  ],
  wallet: [
    "walletDefaultBadge",
    "walletEdit",
    "walletEditAria",
    "walletSetCurrentBalance",
    "walletSave",
    "walletSaving",
    "walletInvalidBalance",
    "walletUpdateFailed",
    "walletNameRequired",
    "walletCreateFailed",
    "walletCloseDialog",
    "walletDialogTag",
    "walletDialogTitle",
    "walletDialogBody",
    "walletDialogEditTitle",
    "walletDialogEditBody",
    "walletDialogNameLabel",
    "walletDialogNamePlaceholder",
    "walletDialogBalanceLabel",
    "walletDialogBalancePlaceholder",
    "walletDialogBalanceHint",
    "walletDialogDefaultTitle",
    "walletDialogDefaultBody",
    "walletDialogCreateAction",
    "walletDialogCreating",
    "walletDialogUpdateAction",
    "walletDialogUpdating",
    "walletDialogDeleteAction",
    "walletDialogDeleting",
    "walletDeleteFailed",
    "walletDeleteBlockedDefault",
    "walletCurrencyPrefix",
    "walletCreateSuccess",
    "walletUpdateSuccess",
    "walletDeleteSuccess",
  ],
  savings: [
    "savingsPortfolio",
    "savingsTitle",
    "savingsTotal",
    "savingsPrimaryFocus",
    "savingsTargeted",
    "savingsPrimaryDesc",
    "savingsSaved",
    "savingsTarget",
    "savingsRemaining",
    "savingsNoPlan",
    "savingsCreatePlanHint",
    "savingsOtherAmbitions",
    "savingsMonthlyContributionTarget",
    "savingsEnvisionGoal",
    "savingsAddToAtelier",
  ],
  onboarding: [
    "onboardingSidebar",
    "onboardingDashboard",
    "onboardingAtelier",
    "onboardingLedger",
    "onboardingSavings",
    "onboardingWallets",
    "onboardingNewEntry",
    "onboardingSettings",
    "onboardingMainContent",
  ],
} as const satisfies Record<string, readonly (keyof FlatDictionary)[]>;

type DictionarySections = typeof dictionarySections;

export type Dictionary = {
  [K in keyof DictionarySections]: Pick<FlatDictionary, DictionarySections[K][number]>;
};

const pickSection = <K extends readonly (keyof FlatDictionary)[]>(flat: FlatDictionary, keys: K): Pick<FlatDictionary, K[number]> => {
  const result = {} as Pick<FlatDictionary, K[number]>;
  for (const key of keys) {
    (result as Record<keyof FlatDictionary, string>)[key] = flat[key];
  }
  return result;
};

export const getDictionaryBySection = (language?: string | null): Dictionary => {
  const flat = getDictionary(language);
  return {
    common: pickSection(flat, dictionarySections.common),
    settings: pickSection(flat, dictionarySections.settings),
    newEntry: pickSection(flat, dictionarySections.newEntry),
    transaction: pickSection(flat, dictionarySections.transaction),
    dashboard: pickSection(flat, dictionarySections.dashboard),
    atelier: pickSection(flat, dictionarySections.atelier),
    ledger: pickSection(flat, dictionarySections.ledger),
    accounts: pickSection(flat, dictionarySections.accounts),
    wallet: pickSection(flat, dictionarySections.wallet),
    savings: pickSection(flat, dictionarySections.savings),
    onboarding: pickSection(flat, dictionarySections.onboarding),
  };
};

export const tr = (language: string | null | undefined, enText: string, viText: string) => {
  return normalizeLanguage(language) === "vi-VN" ? viText : enText;
};
