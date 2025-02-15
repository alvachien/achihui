import { Routes } from '@angular/router';

export const REPORT_ROUTES: Routes = [
    {
        path: '',
        loadComponent: () => import('./').then((m) => m.ReportComponent),
    },
    {
        path: 'account',
        loadComponent: () => import('./account-report/').then((m) => m.AccountReportComponent),
    },
    {
        path: 'accountmom',
        loadComponent: () => import('./account-month-on-month-report/').then((m) => m.AccountMonthOnMonthReportComponent),
    },
    {
        path: 'controlcenter',
        loadComponent: () => import('./control-center-report/').then((m) => m.ControlCenterReportComponent),
    },
    {
        path: 'controlcentermom',
        loadComponent: () => import('./control-center-month-on-month-report/').then((m) => m.ControlCenterMonthOnMonthReportComponent),
    },
    {
        path: 'order',
        loadComponent: () => import('./order-report/').then((m) => m.OrderReportComponent),
    },
    {
        path: 'trantype',
        loadComponent: () => import('./tran-type-report/').then((m) => m.TranTypeReportComponent),
    },
    {
        path: 'trantypemom',
        loadComponent: () => import('./tran-type-month-on-month-report/').then((m) => m.TranTypeMonthOnMonthReportComponent),
    },
    {
        path: 'cash',
        loadComponent: () => import('./cash-report/').then((m) => m.CashReportComponent),
    },
    {
        path: 'cashmom',
        loadComponent: () => import('./cash-month-on-month-report/').then((m) => m.CashMonthOnMonthReportComponent),
    },
    {
        path: 'statementofincexp',
        loadComponent: () => import('./statement-of-income-expense/').then((m) => m.StatementOfIncomeExpenseComponent),
    },
    {
        path: 'statementofincexpmom',
        loadComponent: () => import('./statement-of-income-expense-month-on-month/').then((m) => m.StatementOfIncomeExpenseMonthOnMonthComponent),
    }
];
