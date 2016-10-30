import { Routes, RouterModule }         from '@angular/router';
import { FinanceComponent }             from './finance.component';
import { FinanceSettingComponent }      from './finance.setting.component';
import { FinanceCurrencyComponent }     from './finance.currency.component';
import { FinanceDocTypeComponent }      from './finance.doctype.component';
import { FinanceAccountCategoryComponent } from './finance.acntctgy.component';
import { AccountComponent }             from './account.component';
import { AccountListComponent }         from './account.list.component';
import { AccountDetailComponent }       from './account.detail.component';
import { TranTypeComponent }            from './trantype.component';
import { TranTypeListComponent }        from './trantype.list.component';
import { TranTypeDetailComponent }      from './trantype.detail.component';
import { ControllingCenterComponent }   from './controllingcenter.component';
import { ControllingCenterListComponent }   from './controllingcenter.list.component';
import { ControllingCenterDetailComponent } from './controllingcenter.detail.component';
import { OrderComponent }               from './order.component';
import { OrderListComponent }           from './order.list.component';
import { OrderDetailComponent }         from './order.detail.component';

export const financeRoutes: Routes = [
    {
        path: 'finance',
        component: FinanceComponent,
        children: [
            {
                path: 'setting',
                component: FinanceSettingComponent
            },
            {
                path: 'currency',
                component: FinanceCurrencyComponent
            },
            {
                path: 'doctype',
                component: FinanceDocTypeComponent
            },
            {
                path: 'accountctgy',
                component: FinanceAccountCategoryComponent
            },
            {
                path: 'controllingcenter',
                component: ControllingCenterComponent,
                children: [
                    { path: '', redirectTo: 'list', pathMatch: 'full' },
                    {
                        path: 'list',
                        component: ControllingCenterListComponent,
                    },
                    {
                        path: 'create',
                        component: ControllingCenterDetailComponent
                    },
                    {
                        path: 'change/:id',
                        component: ControllingCenterDetailComponent
                    },
                    {
                        path: 'display/:id',
                        component: ControllingCenterDetailComponent
                    }
                ]
            },
            {
                path: 'order',
                component: OrderComponent,
                children: [
                    { path: '', redirectTo: 'list', pathMatch: 'full' },
                    {
                        path: 'list',
                        component: OrderListComponent,
                    },
                    {
                        path: 'create',
                        component: OrderDetailComponent
                    },
                    {
                        path: 'change/:id',
                        component: OrderDetailComponent
                    },
                    {
                        path: 'display/:id',
                        component: OrderDetailComponent
                    }
                ]
            },
            {
                path: 'trantype',
                component: TranTypeComponent,
                children: [
                    { path: '', redirectTo: 'list', pathMatch: 'full' },
                    {
                        path: 'list',
                        component: TranTypeListComponent,
                    },
                    {
                        path: 'display/:id',
                        component: TranTypeDetailComponent
                    }
                ]
            },
            {
                path: 'account',
                component: AccountComponent,
                children: [
                    { path: '', redirectTo: 'list', pathMatch: 'full' },
                    {
                        path: 'list',
                        component: AccountListComponent,
                    },
                    {
                        path: 'create',
                        component: AccountDetailComponent
                    },
                    {
                        path: 'display/:id',
                        component: AccountDetailComponent
                    },
                    {
                        path: 'change/:id',
                        component: AccountDetailComponent
                    }
                ]
            }
        ]
    }
];

export const financeProviders = [
    //AuthGuard,
    //AuthService
];

export const financeRouting = RouterModule.forChild(financeRoutes);
