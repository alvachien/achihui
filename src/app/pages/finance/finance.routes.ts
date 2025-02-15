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
        loadComponent: () => import('./control-center/control-center-hierarchy').then((m) => m.ControlCenterHierarchyComponent),
        children: [
          {
            path: 'hierarchy',
            loadComponent: () => import('./control-center/control-center-hierarchy').then((m) => m.ControlCenterHierarchyComponent),    
          },
          {
            path: 'list',
            loadComponent: () => import('./control-center/control-center-list/').then((m) => m.ControlCenterListComponent),    
          },
          {
            path: 'create',
            loadComponent: () => import('./control-center/control-center-detail').then((m) => m.ControlCenterDetailComponent),
          },
          {
            path: 'display/:id',
            loadComponent: () => import('./control-center/control-center-detail').then((m) => m.ControlCenterDetailComponent),
          },
          {
            path: 'edit/:id',
            loadComponent: () => import('./control-center/control-center-detail').then((m) => m.ControlCenterDetailComponent),
          },
        ]
      },
      {
        path: 'order',
        loadComponent: () => import('./order/order-list').then((m) => m.OrderListComponent),
        children: [
          {
            path: 'list', 
            loadComponent: () => import('./order/order-list').then((m) => m.OrderListComponent),
          },
          {
            path: 'create', 
            loadComponent: () => import('./order/order-detail').then((m) => m.OrderDetailComponent),
          },
          {
            path: 'display/:id',
            loadComponent: () => import('./order/order-detail').then((m) => m.OrderDetailComponent),
          },
          {
            path: 'edit/:id',
            loadComponent: () => import('./order/order-detail').then((m) => m.OrderDetailComponent),
          },          
        ]
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
        loadComponent: () => import('./plan/plan-list/').then((m) => m.PlanListComponent),
        children: [
          {
            path: 'list',
            loadComponent: () => import('./plan/plan-list/').then((m) => m.PlanListComponent),
          },
          {
            path: 'create',
            loadComponent: () => import('./plan/plan-detail/').then((m) => m.PlanDetailComponent),
          },
          {
            path: 'display/:id',
            loadComponent: () => import('./plan/plan-detail/').then((m) => m.PlanDetailComponent),
          },
          {
            path: 'edit/:id',
            loadComponent: () => import('./plan/plan-detail/').then((m) => m.PlanDetailComponent),
          },          
        ]
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
