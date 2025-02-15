import { Routes } from '@angular/router';

export const DOCUMENT_ROUTES: Routes = [
    {
        path: '',
        loadComponent: () => import('./document-list').then((m) => m.DocumentListComponent)
    },
    {
        path: 'list',
        loadComponent: () => import('./document-list').then((m) => m.DocumentListComponent)
    },
    {
        path: 'createnormal',
        loadComponent: () => import('./document-normal-create').then((m) => m.DocumentNormalCreateComponent)
    },
    {
        path: 'createtransfer',
        loadComponent: () => import('./document-transfer-create').then((m) => m.DocumentTransferCreateComponent)
    },
    {
        path: 'masscreatenormal',
        loadComponent: () => import('./document-normal-mass-create').then((m) => m.DocumentNormalMassCreateComponent)
    },
    {
        path: 'masscreaterecurred',
        loadComponent: () => import('./document-recurred-mass-create').then((m) => m.DocumentRecurredMassCreateComponent)
    },
    {
        path: 'createadp',
        loadComponent: () => import('./document-downpayment-create').then((m) => m.DocumentDownpaymentCreateComponent)
    },
    {
        path: 'createadr',
        loadComponent: () => import('./document-downpayment-create').then((m) => m.DocumentDownpaymentCreateComponent)
    },
    {
        path: 'createassetbuy',
        loadComponent: () => import('./document-asset-buy-create').then((m) => m.DocumentAssetBuyCreateComponent)
    },
    {
        path: 'createassetsold',
        loadComponent: () => import('./document-asset-sold-create').then((m) => m.DocumentAssetSoldCreateComponent)
    },
    {
        path: 'createbrwfrm',
        loadComponent: () => import('./document-loan-create').then((m) => m.DocumentLoanCreateComponent)
    },
    {
        path: 'createlendto',
        loadComponent: () => import('./document-loan-create').then((m) => m.DocumentLoanCreateComponent)
    },
    {
        path: 'createassetvalchg',
        loadComponent: () => import('./document-asset-value-change-create').then((m) => m.DocumentAssetValueChangeCreateComponent)
    },
    {
        path: 'createloanrepay',
        loadComponent: () => import('./document-loan-repay-create').then((m) => m.DocumentLoanRepayCreateComponent)
    },
    {
        path: 'createloanrepay/:docid',
        loadComponent: () => import('./document-loan-repay-create').then((m) => m.DocumentLoanRepayCreateComponent)
    },
    {
        path: 'edit/:id',
        loadComponent: () => import('./document-detail').then((m) => m.DocumentDetailComponent)
    },
    {
        path: 'display/:id',
        loadComponent: () => import('./document-detail').then((m) => m.DocumentDetailComponent)
    }
];
