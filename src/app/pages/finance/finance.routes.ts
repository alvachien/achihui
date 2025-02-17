import { Routes } from '@angular/router';

export const FINANCE_ROUTES: Routes = [
  {
    path: 'currency',
    loadComponent: () => import('./currency').then((m) => m.CurrencyComponent),
  },
  {
    path: 'account',
    loadChildren: () => import('./account/account.routes').then(m => m.ACCOUNT_ROUTES)
  },
  {
    path: 'controlcenter',
    loadChildren: () => import('./control-center/control-center.routes').then(m => m.CONTROL_CENTER_ROUTES)
  },
  {
    path: 'order',
    loadChildren: () => import('./order/order.routes').then(m => m.ORDER_ROUTES)
  },
  {
    path: 'config',
    loadComponent: () => import('./config/').then((m) => m.ConfigComponent),
  },
  {
    path: 'insight',
    loadComponent: () => import('./document/document-item-insight/').then((m) => m.DocumentItemInsightComponent),
  },
  {
    path: 'search',
    loadComponent: () => import('./document/document-item-search/').then((m) => m.DocumentItemSearchComponent),
  },
  {
    path: 'plan',
    loadChildren: () => import('./plan/plan.routes').then(m => m.PLAN_ROUTES)
  },
  {
    path: 'document',
    loadChildren: () => import('./document/document.routes').then(m => m.DOCUMENT_ROUTES)
  },
  {
    path: 'report',
    loadChildren: () => import('./report/report.routes').then(m => m.REPORT_ROUTES)
  },
  {
    path: 'account-reconcile',
    children: [
      {
        path: 'bymonth',
        loadComponent: () => import('./account-reconcile/reconcile-by-month/').then((m) => m.ReconcileByMonthComponent),
      },
      {
        path: 'bymonth/:id',
        loadComponent: () => import('./account-reconcile/reconcile-by-month/').then((m) => m.ReconcileByMonthComponent),
      }
    ]
  }

];
