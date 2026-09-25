# H.I.H. UI — 全面 Signal 化可行性分析

> 生成日期：2026-08-03
> 范围：`achihui/`（Angular 21）。本文档评估把整个 UI 项目迁移到 Angular Signals 的可行性，逐组件给出迁移分层、动作与工作量。

## 一、总体结论

**可行，但不是一次性 PR，而是一个分阶段工程（估计 10–16 人天）。** 关键判断：

1. **Signal 化不需要等 Angular 22**。`input()/output()/model()/viewChild()/signal()/computed()/effect()/toSignal()/takeUntilDestroyed()` 在 v17–v19 已全部 stable，**当前 v21 就能开始**。与"升 Angular 22"是两个独立问题。
2. **真正的硬障碍是 Reactive Forms**。全项目状态主载体是 `UntypedFormGroup/UntypedFormControl`（如 `account-detail` 有 4 个 FormGroup），而 Angular 21 的 FormGroup **不是 signal 响应式**的。大量 `get isSaveEnabled()` 这类 getter 读的是 `formGroup.get('x').value`——它们**无法干净地变成 `computed()`**，除非用 `toSignal(form.valueChanges)` 桥接或等官方 signal-forms。
3. **"全面 signal"是分层的**：signal inputs/queries/本地状态/RxJS 互转 = **现在就能做到 100%**；"表单值也是 signal" = **受限于框架，只能桥接**。建议把目标定义为前者，后者用 `toSignal` 临时桥接。
4. **NG-ZORRO 不是障碍**。ng-zorro 组件内部用 `@Input`，但模板里 `[value]="mySignal()"` 完全合法——你的组件 signal 化不影响 ng-zorro 用法。

## 二、现状画像

| 维度 | 现状 | 数量 | 对 signal 化的影响 |
|---|---|---|---|
| Signal 用量 | **0** | 0 处 | 零基线，需从零引入 |
| `@Input/@Output/@ViewChild/@ContentChild` | 装饰器 | 76 处 / 29 文件 | 机械可转 `input()/output()/viewChild()` |
| `ControlValueAccessor` (CVA) | `NG_VALUE_ACCESSOR`+`forwardRef` | **6** 文件 | 需手写 signal↔CVA 桥接（最复杂） |
| `NgZone.run(...)` | 手动触发变更检测 | **4** 文件 | zoneless 前必须清除 |
| `ReplaySubject+_destroyed$+takeUntil` | RxJS 清理模板 | **492** 处 / 85 文件 | 可被 `takeUntilDestroyed()`/`toSignal()` 取代（最大面积） |
| `UntypedFormGroup` Reactive Forms | 表单状态 | 覆盖所有 detail/create | **核心障碍**：值非 signal |
| 服务层 `BehaviorSubject` | `curHomeSelected`/`authSubject` | 跨 85 消费者 | 转 signal **爆炸半径最大** |
| DI 风格 | 已全面 `inject()` | 100% | ✅ 无需迁移，已是现代写法 |

> 唯一的好消息：DI 已经是 `inject()`，standalone 组件 + `@angular/build` esbuild 也已就位。signal 化只剩"响应式状态"这一层要动。

## 三、逐组件分层清单

### Tier A — 纯展示组件（低风险，~0.5 天）

无 `@Input`、无表单、无 CVA。迁移=把普通字段变 `signal()`、getter 变 `computed()`，可选。

| 组件 | 现状 | 迁移动作 |
|---|---|---|
| `about` | `inject(UIStatusService)`，读 `versionResult` | `versionResult` -> `signal`/`computed` |
| `lack-authority` | 纯模板 | 无需动 |
| `not-found` | 纯模板 | 无需动 |
| `message-dialog` | 简单 | 可选 |
| `fatal-error` | 纯模板 | 无需动 |
| `signin-callback` | 路由落地页 | 无需动 |
| `version` / `welcome` / `credits` | 轻逻辑 | 可选 |

### Tier B — 列表/报表组件（机械式，~1.5 天，模板化批量处理）

**共享模式**（以 `account-list` 为代表）：`_destroyed$: ReplaySubject` + `takeUntil` + `ngOnInit` fetch + `isLoadingResults` + `dataSet` + `modalService.error`。

**统一迁移模板**：

```ts
// before
private _destroyed$ = new ReplaySubject(1);
isLoadingResults = false;
dataSet: Account[] = [];
ngOnInit() { this.odataService.fetchAll().pipe(takeUntil(this._destroyed$)).subscribe(d => this.dataSet = d); }
get isChildMode() { return this.homeService.CurrentMemberInChosedHome?.IsChild ?? false; }

// after
private destroyedRef = inject(DestroyRef);
isLoadingResults = signal(false);
dataSet = signal<Account[]>([]);
isChildMode = computed(() => this.currentMember()?.IsChild ?? false);
constructor() {
  this.isLoadingResults.set(true);
  this.odataService.fetchAll().pipe(takeUntilDestroyed(this.destroyedRef), finalize(() => this.isLoadingResults.set(false)))
    .subscribe(d => this.dataSet.set(d));
}
```

模板里 `dataSet` -> `dataSet()`，`isLoadingResults` -> `isLoadingResults()`。

**适用组件清单**（约 30 个，全部走同一模板）：

| 分类 | 组件 |
|---|---|
| Finance 报表 | `account-report`, `account-month-on-month-report`, `control-center-report`, `control-center-month-on-month-report`, `order-report`, `tran-type-report`, `tran-type-month-on-month-report`, `cash-report`, `cash-month-on-month-report`, `statement-of-income-expense`, `statement-of-income-expense-month-on-month` |
| Finance 列表 | `account-list`, `control-center-list`, `control-center-hierarchy`, `document-list`, `order-list`, `plan-list`, `currency` |
| Finance 配置列表 | `account-category-list`, `asset-category-list`, `tran-type-list`, `tran-type-hierarchy`, `doc-type-list` |
| Library 列表 | `book-list`, `person-list`, `organization-list`, `location-list`, `book-category-list`, `organization-type-list`, `person-role-list`, `borrow-record-list`, `borrow-record/borrow-record-list` |
| Home | `home-def-list` |
| 其它 | `language` |

> ✅ **参考实现**：`account-list` 已完成 signal 化（见本仓库该组件），作为 Tier B 模板。

### Tier C — 详情/创建/编辑组件（高工作量，~6 天，表单摩擦所在）

**共享模式**（以 `account-detail` 为代表，12 处装饰器/RxJS、3 个 `@ViewChild`、4 个 FormGroup）：多 `UntypedFormGroup` + `@ViewChild` 取子 CVA + `forkJoin` 加载 + getter 读 `form.value`。

**这里 signal 化分两半：**

- ✅ **能干净转**：`@ViewChild('extraADP')` -> `viewChild('extraADP')`；`routerID/uiMode/currentMode/arCategories` 等普通字段 -> `signal()`；`forkJoin` 数据流 -> `toSignal()`；`takeUntil(_destroyed$)` -> `takeUntilDestroyed()`。
- ⚠️ **不能干净转**（表单相关）：`get isSaveEnabled()` 读 `this.headerFormGroup.valid`、`get currentCategory()` 读 `form.get('ctgyControl').value`。这些 getter 要变 `computed()`，必须先让表单值变 signal：

```ts
// 桥接方案（当前可用）
private headerValid = toSignal(
  this.headerFormGroup.statusChanges.pipe(map(() => this.headerFormGroup.valid)),
  { initialValue: this.headerFormGroup.valid },
);
isSaveEnabled = computed(() => this.isFieldChangable() && this.headerValid() && ...);
```

这是可行的，但**每个 getter 都要这么接一次**，工作量大且易错——这是 Tier C 比 Tier B 贵 4 倍的根因。

**组件清单**（按表单复杂度排序）：

| 组件 | RxJS/装饰器 | `@ViewChild` | 备注 |
|---|---|---|---|
| `account-detail` | 12 | 3（取 3 个子 CVA） | 最重，4 FormGroup |
| `document-detail` | 10 | - | 多子表单 |
| `account-hierarchy` | 9 | - | 树形 |
| `control-center-detail` | 9 | - | |
| `document-recurred-mass-create` | 8 | - | 批量 |
| `home-def-detail` | 8 | - | |
| `person-detail` / `organization-detail` | 8 | - | |
| `document-loan-repay-create` | 8 | - | |
| `document-normal-mass-create` / `document-asset-value-change-create` | 7 | - | |
| `order-detail` / `plan-detail` / `book-detail` / `location-detail` | 7 | - | |
| `document-normal-mass-create-item` | 6 | - | 6 个 `@Input`，纯输入 |
| `document-normal-create`/`transfer-create`/`loan-create`/`asset-buy-create`/`asset-sold-create`/`downpayment-create` | 6 | loan-create 有 1 | 一族创建表单，结构同构 |
| `document-item-view`/`item-search`/`item-insight` | 3–7 | - | |
| `reconcile-by-month` / `account-settle-dialog` | 4–6 | - | |
| `user-detail` (×2) | 4–6 | - | |
| **选择对话框族**（`person-selection-dlg`/`organization-selection-dlg`/`location-selection-dlg`/`book-category-selection-dlg`/`borrow-record-create-dlg`×2） | 2–4 `@Input`/`@Output` | - | 适合直接上 `input()/output()/model()`，**最干净的 C 类** |

### Tier D — CVA 组件（最难，~2.5 天，需手写桥接）

Angular **没有官方 signal-CVA**，`ControlValueAccessor` 仍是命令式接口。这 6 个组件要保留 CVA 实现外壳，内部用 signal：

| 组件 | 复杂点 | 迁移要点 |
|---|---|---|
| `markdown-editor` | CVA + `@ViewChild('previewElement')` + `@HostListener` + Monaco `onDidChangeModelContent` + `changeDetect.detectChanges()` + `@Input() editorID` | `editorID`->`input()`；`previewElement`->`viewChild()`；`content/readOnly`->`signal()`；`writeValue` 内 `content.set(val)`；Monaco 回调里 `content.set()` 替代 `detectChanges()`。`@HostListener('change'/'blur')`->`host:{'(change)':...}`。Monaco disposable 清理保留 |
| `document-items` | CVA + `NG_VALIDATORS` + 10 个 `@Input` getter/setter + `@HostListener` | 10 个 `@Input`->`input()`；`listItems`->`signal()`；`validate()` 的 `controlError` getter->`computed()`。现有 setter 有副作用（`currentUIMode` setter 调 `setDisabledState`），转 `input()` 后副作用要用 `effect()` 监听 |
| `document-header` | CVA + 7 `@Input` | 同上模式 |
| `account-extra-asset` / `extra-downpayment` / `extra-loan` | CVA + `@ViewChild`(被父组件查) | 内部 `signal` 化；这 3 个被 `account-detail` 通过 `@ViewChild` 取，**父子要一起迁**否则 `viewChild()` 读不到 |

**CVA 桥接通用骨架**：

```ts
export class DocumentItemsComponent implements ControlValueAccessor, Validator {
  readonly arUIAccounts = input<UIAccountForSelection[]>([]);
  readonly listItems = signal<DocumentItem[]>([]);
  private _onChange?: (v: any) => void;
  writeValue(v: DocumentItem[]) { v && this.listItems.set(v); }
  registerOnChange(fn: any) { this._onChange = fn; }
  onCreateDocItem() { /* ... */ this.listItems.update(...); this._onChange?.(this.listItems()); }
  readonly controlError = computed(() => { /* 读 listItems() */ });
}
```

### Tier E — NgZone 对话框（~0.5 天，最简单）

4 个组件里 `this._zone.run(() => form.setValue(...))` 是历史写法。signal 化 + 保留 zone 时**直接删掉 `_zone.run` 包裹**即可。

| 组件 | 现状 | 动作 |
|---|---|---|
| `account-change-name-dialog` | `NgZone.run` 包 3 个 `setValue` | 删 `_zone.run`，`accountid/name/comment` 的 3 个 `@Input`->`input()` |
| `document-change-date-dialog` | 同 | 删 `_zone.run`，`@Input`->`input()` |
| `document-change-desp-dialog` | 同 | 删 `_zone.run`，`@Input`->`input()` |

### Tier F — 根组件 + 共享服务（爆炸半径最大，~2 天 + 风险）

| 单元 | 现状 | 迁移 |
|---|---|---|
| `app.component` | 订阅 `authContent`/`curHomeSelected`，用 `NgZone.run` 更新 `isLoggedIn` 等 | 订阅->`toSignal()`；`isLoggedIn`->`signal`/`computed`；删 `NgZone` |
| `HomeDefOdataService` | `curHomeSelected`/`curHomeMember` 是 `BehaviorSubject`，被 ~20 组件 `.subscribe()` | **两条路**：(a) 保留 BehaviorSubject，组件侧 `toSignal()` 桥接（低风险、推荐先做）；(b) 服务内部改 `signal()`（彻底，但所有消费者要改） |
| `AuthService.authSubject` | BehaviorSubject，被全项目订阅 | 同上，建议先 (a) |
| `UIStatusService.versionResult` | 普通属性 | -> `signal()` |

> **关键建议**：Tier F 走"服务保 BehaviorSubject、消费端 `toSignal`"的渐进路线，可把爆炸半径从 85 文件降到 0，是整个迁移能分阶段推进的前提。`account-list` 模板已示范此模式（`toSignal(homeService.curHomeMember)`）。

## 四、已停用功能（Blog / Event）的处理

Blog/Event 已于 2026-08-02 临时关闭（UI 菜单/路由移除、API 端点 404，但代码保留）。这 ~19 个组件（`blog/*`、`event/*`）**signal 化应放到最后**，甚至跳过——它们当前不可达，投入产出比最低。若日后重新启用再统一处理。

## 五、推荐的分阶段路径

| 阶段 | 范围 | 目标 | 风险 |
|---|---|---|---|
| **0. 基线** | 跑通 `npm test` + `npm run lint` | 建立绿色基线 | - |
| **1. 服务桥接** | Tier F 走路线 (a)：`toSignal` 消费现有 BehaviorSubject | 不改服务，组件可开始用 signal 读共享状态 | 极低 |
| **2. 简单组件** | Tier A + Tier E | 验证 signal 模板、删 NgZone | 低 |
| **3. 列表/报表** | Tier B 批量 | 固化"列表 signal 模板"，30 个组件按模板走 | 低（机械） |
| **4. 选择对话框** | Tier C 中的 dlg 族 | `input()/output()/model()` 落地，验证 `[(ngModel)]` 与 `model()` 互通 | 低 |
| **5. CVA 组件** | Tier D（6 个，父子同迁） | signal↔CVA 桥接定型 | 中高 |
| **6. 详情/创建表单** | Tier C 主体 | `toSignal(form.valueChanges)` 桥接 getter | 中（表单回归测试重） |
| **7. 服务内部 signal 化** | Tier F 走路线 (b)（可选） | 彻底去 BehaviorSubject | 高（85 消费者） |
| **8. Zoneless（可选）** | `provideZoneChangeDetection` -> `provideZonelessChangeDetection` | 去 zone.js | 中（需回归 Monaco/HostListener） |

## 六、风险与前置条件

1. **表单回归测试是最大成本**。Tier C 的 `isSaveEnabled`/`canEnterInitialAmount` 等决定"保存按钮是否可点"，桥接出错会直接导致功能不可用。`account-detail`/`document-detail`/`document-*create` 必须手工走查 Create/Update/Display 三态。
2. **CVA 父子耦合**：`account-detail` 用 `@ViewChild` 取 `account-extra-{asset,downpayment,loan}`，这 4 个必须**同一 PR 迁移**，否则 `viewChild()` 拿不到。
3. **Vitest 现有 spec** 断言的是装饰器 API（`componentInstance.arUIAccounts = ...`）。signal input 是**只读**的，测试要改用 `fixture.componentRef.setInput()`。这部分测试改造要算进工作量。
4. **Monaco 编辑器**的 `changeDetect.detectChanges()`（`markdown-editor`）依赖 zone；若第 8 阶段上 zoneless，需验证 Monaco 回调能正确触发 signal CD。
5. **Angular 22 / ng-zorro 22 与本任务解耦**：signal 化在 v21 即可全做；升 22 是独立决策。唯一交集——若决定升 22，建议**先 signal 化稳定再升版本**，避免两变量同时动。

## 七、参考实现

`account-list`（Tier B 代表）已完成 signal 化，作为列表/报表组件的迁移模板。要点：

- `isLoadingResults`/`dataSet`/`arCategories`/`listCategoryFilter` -> `signal()`
- `isChildMode` getter -> `computed()`，通过 `toSignal(homeService.curHomeMember)` 桥接服务 BehaviorSubject（Tier F 路线 a）
- `_destroyed$: ReplaySubject` + `takeUntil` -> `DestroyRef` + `takeUntilDestroyed()`
- 模板绑定加 `()`：`isLoadingResults()`、`dataSet()`、`isChildMode()`

其余 Tier B 组件可照此模板批量推进。

`account-change-name-dialog` / `document-change-date-dialog` / `document-change-desp-dialog`（Tier E，3 个）已完成 signal 化，作为 `input()` + 删 `NgZone.run` 的模板。要点：

- `@Input() accountid` 等 -> `input<number>()`（只读 signal）
- `isSubmitting = false` -> `signal(false)`；`isSubmittedDisabled` 保留 getter，内部读 `this.isSubmitting()`
- 删除 `inject(NgZone)` 与 `_zone.run(...)` 包裹（zone.js 仍在，setValue 无需手动包 zone）
- spec 改造：`component.x = v` -> `fixture.componentRef.setInput('x', v)`；`isSubmitting` 读写用 `.set()` / `()`

> 注意：这 3 个对话框在生产中经 `NzModalService.create({ nzData })` 打开，而 `nzData` 不会绑定到 `@Input`/`input()`（项目也未使用 `NZ_MODAL_DATA`），故其 input 实际仅在单测中被赋值。这是**既有的数据流缺陷**，与 signal 化无关，迁移保持原行为未修。

## 八、迁移进度跟踪

| 批次 | 组件 | 状态 | 验证 |
|---|---|---|---|
| Tier B 模板 | `account-list` | ✅ | 7/7 测试 |
| Tier E（3 个对话框） | `account-change-name-dialog` / `document-change-date-dialog` / `document-change-desp-dialog` | ✅ | 21/21 测试 |
| Tier B 批次 1（4 个配置列表） | `account-category-list` / `asset-category-list` / `tran-type-list` / `doc-type-list` | ✅ | 24/24 测试 |
| Tier B 批次 2（5 个 Finance 列表） | `control-center-list` / `currency` / `document-list` / `order-list` / `plan-list` | ✅ | 39/39 测试 |
| Tier B 批次 3（4 个非 MOM 报表） | `account-report` / `control-center-report` / `order-report` / `tran-type-report` | ✅ | build exit 0 + lint exit 0 |
| Tier B 批次 4（5 个 MOM 报表） | `account-month-on-month-report` / `control-center-month-on-month-report` / `tran-type-month-on-month-report` / `cash-month-on-month-report` / `statement-of-income-expense-month-on-month` | ✅ | build exit 0 + lint exit 0 |
| Tier B 批次 5a（4 个 Library 列表） | `book-list` / `book-category-list` / `organization-type-list` / `person-role-list` | ✅ | 4/4 测试 + lint exit 0 |
| Tier B 批次 5b（5 个 Library 列表） | `location-list` / `organization-list` / `person-list` / `borrow-record-list`（`library/borrow-record-list/`）/ `borrow-record-list`（`library/borrow-record/borrow-record-list/`） | ✅ | 5/5 文件 / 7 测试通过 + lint exit 0 |
| Tier B 批次 6（5 个 Tier B 收尾） | `home-def-list` / `language` / `account-hierarchy` / `control-center-hierarchy` / `tran-type-hierarchy` | ✅ | 5/5 文件 / 22 测试通过 + lint exit 0 |
| Phase 4 / Tier C 选择对话框（5 个 live） | `person-selection-dlg` / `organization-selection-dlg` / `location-selection-dlg` / `book-category-selection-dlg` / `borrow-record-create-dlg` | ✅ | 5/5 文件 / 11 测试通过 + lint exit 0（`book-category-selection-dlg` 已于 2026-09-20 删除，见文末备注） |
| Phase 2 / Tier A（7 个琐碎组件） | `signin-callback`（Subscription->takeUntilDestroyed）/ `message-dialog`（@Input->input()）；`not-found`/`version`/`credits`/`fatal-error`/`welcome` 纯模板或静态常量，无需 signal 化 | ✅ | ng test 1/1 + build exit 0 + lint exit 0 |
| Tier C 主体批次 1（4 个视图/报表组件） | `document-item-view` / `document-item-search` / `document-item-insight` / `reconcile-by-month` | ✅ | build exit 0 + 11 测试通过（1 预存 skip）+ lint exit 0 |
| Tier C 主体批次 2（2 个 Library 详情表单） | `book-detail` / `location-detail` | ✅ | build exit 0 + 7 测试通过 + lint exit 0 |
| Tier C 主体批次 3（2 个 Library 详情表单） | `person-detail` / `organization-detail` | ✅ | build exit 0 + 8 测试通过 + lint exit 0 |
| Tier C 主体批次 4（4 个 Finance 详情表单） | `order-detail` / `plan-detail` / `control-center-detail` / `home-def-detail` | ✅ | build exit 0 + 49 测试通过 + lint exit 0 |
| Tier C 主体批次 5（6 个 Finance 创建表单向导） | `document-normal-create` / `document-transfer-create` / `document-loan-create` / `document-asset-buy-create` / `document-asset-sold-create` / `document-downpayment-create` | ✅ | build exit 0 + 100 测试通过（40+60，含 25 skip）+ lint exit 0 |
| Tier C 主体批次 6（4 个 Finance 批量创建向导） | `document-normal-mass-create` / `document-asset-value-change-create` / `document-recurred-mass-create` / `document-loan-repay-create` | ✅ | build exit 0 + 64 测试通过（含 5 skip）+ lint exit 0 |
| Tier D 批次 1（2 个 CVA + 2 no-op） | `account-extra-loan` / `account-extra-downpayment`（signal 化）；`account-extra-asset` / `document-normal-mass-create-item`（no-op） | ✅ | build exit 0 + 48 测试通过（6 文件，含 21 skip）+ lint exit 0 |
| Tier D 批次 2（1 个 CVA + 1 no-op） | `markdown-editor`（signal 化 `content`）；`document-header`（no-op） | ✅ | build exit 0 + 3 测试通过（含 1 skip）+ lint exit 0 |
| Tier D 批次 3（1 个 CVA，最复杂） | `document-items`（signal 化 `listItems`） | ✅ | build exit 0 + 54 测试通过（4 文件消费者回归，含 21 skip）+ lint exit 0 |
| Tier D 批次 4（1 个重型父组件） | `account-detail`（4 FormGroup + 3 `@ViewChild` 取 account-extra-* 子 CVA） | ✅ | build exit 0 + 29 测试通过（4 文件含 3 子 CVA 回归，含 6 skip）+ lint exit 0 |
| Tier D 批次 5（1 个重型父组件，最后一个 Tier D） | `document-detail`（1 FormGroup 取 document-header/document-items 子 CVA；嵌套 route + 2 forkJoin + onSetData/onSave/onChangeToEditMode subscribe） | ✅ | build exit 0 + 54 测试通过（5 文件含 document-items 消费者回归，含 19 skip）+ lint exit 0 |
| Tier F 批次 1（根组件，路线 a） | `app.component`（订阅 `authContent`/`curHomeSelected` + `NgZone.run` -> `toSignal`+`computed`；删 `NgZone`/`OnDestroy`） | ✅ | build exit 0 + 5 测试通过 + lint exit 0 |
| Tier F 批次 2（HomeDefOdataService 路线 b，服务内部 signal 化） | `home-def-odata.service`（`curHomeSelected`/`curHomeMember` BehaviorSubject -> signal）+ 3 缓存服务（event/finance/library `subscribe`->`effect`）+ 9 组件（`toSignal`->`computed`）+ 9 spec（`BehaviorSubject`->`signal`） | ✅ | build exit 0 + 258 测试通过（14 文件）+ lint exit 0 |
| Tier F 批次 3（AuthService 路线 b，服务内部 signal 化，项目级消费端） | `auth.service`（`authSubject` BehaviorSubject -> signal `{equal:()=>false}`；删 `authContent` Observable）+ 5 反应式消费端（app.component 直接读 / signin-callback + user-detail×2 `toObservable` field / blog-odata `subscribe`->`effect`）+ ~13 源文件 `.getValue()/.value`->`()`（~150 处）+ 113 spec（`new BehaviorSubject`->`signal`，Node 脚本批量）+ 4 特殊 spec 手改（`.next`->`.set`/`asObservable` 删除/`WritableSignal` cast） | ✅ | build exit 0 + 全量 1091 通过 / 6 预存报表失败 / 54 skip + lint exit 0 |
| Tier F 批次 4（UIStatusService.versionResult + about.component，最后一个 defer 项） | `uistatus.service`（`_versionInfo` plain -> signal；`versionResult` getter/setter `.set`/`()`，签名不变）+ `about.component`（ctor 一次性拷贝 -> `computed(() => uiStatus.versionResult)`；模板 `resultVersion!.X`->`resultVersion()!.X` ×2） | ✅ | build exit 0 + 3 文件 9 测试通过 + 全量 1091/6 预存/54 skip + lint exit 0 |
| 报表 spec 修复（signals 迁移漏改 spec，**非预存**） | 5 个报表 spec（tran-type / account / control-center / order / account-month-on-month-report）共 16 处 `component.<sigField>.length` -> `component.<sigField>().length`（`reportIncome`/`reportExpense`/`dataSet`/`arReportByAccount`/`arUIAccounts`） | ✅ | 全量 1097 通过 / 0 失败 / 54 skip + lint exit 0 |
| Phase 8（zoneless 切换） | `app.config.ts` `provideZoneChangeDetection` -> `provideZonelessChangeDetection` + 18 个活跃路由组件 markForCheck/detectChanges 修复（async 回调里写 plain 模板字段无 CD 触发） | ✅ | build exit 0 + 全量 1097/0/54 + lint exit 0 |

> 🎉 **Tier B 完成**：批次 6 后，全部 33 个 Tier B（列表/报表）组件已 signal 化。剩余迁移工作在 Tier A/C/D/F。

**批次 1 备注**：
- 采用并行子代理（每个组件一个）+ 中心化 `ng test` / `eslint` 验证，效率高、质量可复核。
- `account-category-list`、`tran-type-list` 模板里有 `[(ngModel)]="data.AssetFlag"` / `"data.Expense"`（nz-switch，`nzDisabled`，绑定到**行对象属性**而非组件 signal 字段）——这**不阻塞**组件自身状态（`isLoadingResults`/`dataSet`）的 signal 化：照常迁移，行级 `[(ngModel)]` 保持不动。
- `asset-category-list`、`doc-type-list` 无上述绑定，由子代理直接完成。

**批次 2 备注**：
- 5 个 Finance 列表：`control-center-list`、`currency`、`order-list`、`plan-list` 由并行子代理完成；`document-list`（最复杂：7 个引用数组 + 服务端分页/排序 + forkJoin + 2 个 `nzData` 模态框）由编排者亲自完成。
- **安全阀（精修后）**：组件字段若被 `[(ngModel)]` / `[(nzVisible)]` / `[(nzExpand)]` 等双向绑定，则**保持 plain 不 signal 化**，其余字段照常迁移：
  - `order-list` 的 `validOrderOnly`（`[(ngModel)]`）、`plan-list` 的 `isProgressDlgVisible`（`[(nzVisible)]`）保持 plain。
  - `document-list` 的 `shortcutDocID`（`[(ngModel)]`）、`selectedRange`（`[(ngModel)]`，nz-range-picker）、`mapOfExpandData`（`[(nzExpand)]`）保持 plain。
- **单向 `[ngModel]` 读取可 signal 化**：`plan-list` 进度对话框里 8+ 处 `[ngModel]="currentPlan?.X"` 改为 `currentPlan()?.X`；`currentPlanActualBalance`、`currentDifferenceWithTarget`（getter→computed）亦同。
- `progressModalTitle` 因模板里 `[nzTitle]="progressModalTitle"` 实际绑定到同名 `#progressModalTitle` 模板引用变量（字段被遮蔽/死字段），保持 plain。
- **类型坑（重要，后续批次通用）**：spec 桩里 `new BehaviorSubject(fakeData.chosedHome.Members[0] ?? null)` 会被推断为 `BehaviorSubject<HomeMember>`（因 `Members[0]` 非空、`?? null` 不引入 null 类型），与服务端 `BehaviorSubject<HomeMember | null>` 不兼容，导致编译报 TS2322。修复：显式 `new BehaviorSubject<HomeMember | null>(...)` 并 `import { HomeMember }`（与批次 1 `account-list` spec 一致）。本批次 4 个涉及 `curHomeMember` 桩的 spec 均已修正。
- `document-list` 的 6 个 `getXxxName` 方法改为读取 signal 数组（`this.arCurrencies()` 等），在模板中被调用时即成为 signal 消费者，天然响应式。
- 验证：`ng test`（5 文件 / 39 测试通过）+ `eslint`（10 个 .ts/.spec 全部 exit 0）。

**批次 3 备注**：
- 4 个非 MOM 报表：`account-report`（627 行，4 图表，编排者亲自完成作模板）+ `control-center-report` / `order-report` / `tran-type-report`（3 个并行子代理）。
- **报表无 spec**：`cash-report`、`statement-of-income-expense` 是空壳（10 行，无逻辑），`report.component.ts` 是路由父组件--三者跳过。其余报表均无 `.spec.ts`，故验证改用 `ng build`（AOT 模板类型检查）而非 `ng test`。
- **图表 option 字段保持 plain**：`account-report` 的 4 个 `chartXxxOption: EChartsOption | null` 在 build 方法里命令式 `this.chartXxxOption = {...}` 构造，保持 plain + `=` 赋值，模板 `[options]="chartXxxOption!"` 不动；仅其读取的引用数组（`arAccounts`/`arAccountCategories`/`arReportByAccount`）signal 化。避免了对 echarts option 大对象的 `.set({...})` 重构风险。
- **`buildReportList`/`onRebuildData` 模式**：原先 `this.dataSet = []; ... this.dataSet.push(...)` 改为本地数组累积 + 末尾 `this.dataSet.set(ds)`（`tran-type-report` 同理用 `ri`/`re` 局部数组）。
- 安全阀继续生效：`order-report` 的 `validOrderOnly`、`tran-type-report` 的 `selectedScope`/`groupLevel`（均 `[(ngModel)]`）保持 plain。
- `tran-type-report` 的标量汇总 `totalIncome`/`totalExpense` 保持 plain（非数组，模板插值读取，zone CD 下正常更新）。
- 4 个报表均无 `isChildMode`，故未引入 `toSignal`/`computed`。
- 验证：`ng build`（exit 0，全 app AOT 编译通过）+ `eslint`（4 个 .ts 全部 exit 0）。

**批次 4 备注**：
- 5 个 MOM 报表：`account-month-on-month-report`（编排者亲自完成作模板）+ `control-center-month-on-month-report` / `tran-type-month-on-month-report` / `cash-month-on-month-report` / `statement-of-income-expense-month-on-month`（4 个并行子代理）。
- **MOM 模式更轻**：仅 signal 化「模板读取的引用数组」（如 `arUIAccounts`、`availableControlCenters`、`availableTranTypes`）+ `isLoadingResults`（仅 `cash-mom`/`statement-mom` 有）+ `DestroyRef`。
- **`chartOption` 保持 plain**（与批次 3 一致）：所有 MOM 报表的 `chartOption` 在 refresh/build 方法里命令式构造，模板 `[options]="chartOption!"` 不动。
- **内部专用 API 数据保持 plain**：`reportData`/`arTranType`/`arControlCenters` 等仅被 `buildChart()` 内部消费、不在模板读取的数组，保持 plain（rule 2 只 signal 化模板读取的数组）。3 个子代理一致作出此判断。
- **级联选择器选项的 push 构建重构**：`control-center-mom` 的 `availableControlCenters`、`tran-type-mom` 的 `availableTranTypes` 原先用 `this.x.push(...)` 增量构建，signal 化后改为本地数组累积 + 末尾 `.set()`。
- 5 个 MOM 均无 `isChildMode`，不引入 `toSignal`/`computed`。
- 验证：`ng build`（exit 0）+ `eslint`（5 个 .ts 全部 exit 0）。

**批次 5a 备注**：
- 4 个 Library 列表：`book-list`（分页，编排者亲自完成作 Library 分页模板）+ `book-category-list` / `organization-type-list` / `person-role-list`（3 个 config 列表，并行子代理）。
- `book-list` 用 `LibraryStorageService`（非 `FinanceOdataService`），无 `isChildMode`/`HomeDefOdataService`。signal 化 `isLoadingResults`/`listData`/`totalCount`/`pageIndex`/`pageSize`；`pageIndex`/`pageSize` 在原代码中从不更新（`onQueryParamsChange` 只转发不回写），signal 化后行为不变。
- 3 个 config 列表结构同 Finance config 列表（批次 1）：仅 `isLoadingResults`+`dataSet`，无 `isChildMode`、无 `[(ngModel)]`，spec 仅 `should create` 无需改动。
- `onDelete` splice 模式改 `update(filter)`。
- 验证：`ng test`（4 文件 / 4 测试通过）+ `eslint`（4 个 .ts 全部 exit 0）。

**批次 5b 备注**：
- 5 个 Library 列表：3 个 config 列表（`location-list` / `organization-list` / `person-list`）+ 2 个分页列表（两个 `borrow-record-list`，路径不同、逻辑近乎相同）。本批由编排者亲自完成（已持全部源码上下文，直接编辑比派子代理更快、更可控）。
- **config 列表**（3 个）结构与批次 5a config 列表同构：仅 `isLoadingResults`+`dataSet`，`_destroyed$`/`OnDestroy` → `DestroyRef`+`takeUntilDestroyed`，`onDelete` 的 `splice`+`[...x]` → `update(filter)`。但与 `book-category-list` 不同：这 3 个**有 `onDelete`**，故需 splice→`update` 改造（5a 模板未涉及）。均无 `isChildMode`。
- **分页列表**（2 个 `borrow-record-list`）与 `book-list` 同构：`isLoadingResults`/`dataSet`/`pageSize`/`pageIndex`/`totalCount` signal 化，`loadDataFromServer`+`onQueryParamsChange`。同样保留 `pageIndex`/`pageSize` 从不回写的既有 quirk（行为不变）。`getBorrowFromName` 读 `storageService.Organizations`（服务属性，非组件字段），不动。
- **去重既有冗余**：`loadDataFromServer` 原有重复两行 `this.isLoadingResults = true;`，signal 化时去重为单行 `this.isLoadingResults.set(true);`（无行为变化）。
- **两个 `borrow-record-list` 差异**：`library/borrow-record/borrow-record-list/` 版保留 `standalone: true` + `NgFor` 导入 + `*ngFor`（旧控制流，不在 signals 迁移范围，保持原样），并合并了两处 `ng-zorro-antd/table` 重复导入；`library/borrow-record-list/` 版用 `@for`。两者 selector 同名 `hih-borrow-record-list`（既有，未动）。
- 5 个组件均无 `isChildMode`/`HomeDefOdataService` → 无 spec 类型坑风险，spec 无需改动。
- 验证：`ng test`（5 文件 / 7 测试通过，exit 0）+ `eslint`（5 个 .ts 全部 exit 0）。输出中的 NG8113/NG8116 警告来自**其他**未迁移组件（`organization-selection-dlg`、`user-detail`），与本批无关。

**批次 6 备注（Tier B 收尾）**：
- 5 个组件：2 个简单（`language`、`tran-type-hierarchy`，无 `isChildMode`）+ 3 个含 `isChildMode` 的复杂组件（`home-def-list`、`account-hierarchy`、`control-center-hierarchy`）。全部由编排者亲自完成（toSignal 桥接 + spec 协调需精确控制）。
- **`isChildMode`/`IsCurrentHomeChosed` 首次走完整 toSignal 桥接**：`HomeDefOdataService.ChosedHome`/`CurrentMemberInChosedHome` 是 `curHomeSelected`/`curHomeMember` BehaviorSubject 的同步 get/set 包装。故 `readonly currentMember = toSignal(this.homeService.curHomeMember, { initialValue: this.homeService.CurrentMemberInChosedHome })` + `readonly isChildMode = computed(() => this.currentMember()?.IsChild ?? false)`（与 `account-list` 模板一致）。`home-def-list` 额外桥接 `curHomeSelected` -> `currentHome` -> `IsCurrentHomeChosed`/`IsChildMode` 两个 computed。**toSignal 字段必须声明在 `homeService = inject(...)` 之后**（字段初始化顺序）。
- **spec 桩须补 `curHomeMember`/`curHomeSelected` BehaviorSubject**：原 stub 只设了 `ChosedHome`/`CurrentMemberInChosedHome` 普通属性，未暴露 BehaviorSubject，toSignal 会失败。修复：3 个 spec 各加 `curHomeMember: new BehaviorSubject<HomeMember | null>(fakeData.chosedHome.Members[0] ?? null)`（`home-def-list` 额外加 `curHomeSelected`），并用**显式泛型 `<HomeMember | null>`**（复用批次 2 类型坑：`Members[0] ?? null` 推断为 `HomeMember` 而非 `HomeMember | null`）+ `import { HomeMember }`。
- **spec 字段访问改 `()`**：signal 化字段在 spec 里被读取处全改调用--`dataSource().length`、`dataSource()[0]`、`IsCurrentHomeChosed()`、`ccTreeNodes().length`、`ttTreeNodes().length`。
- **安全阀继续生效**（account-hierarchy 最复杂，559 行）：`[(ngModel)]` 双向字段（`listSelectedAccountStatus`/`selectedScope`/`selectedAccountForSettle.*`）、`[(nzVisible)]`（`isAccountSettleDlgVisible`）、命令式标量（`isAccountView`/`currentAccountBalance`/`baseCurrency`/`col`）、静态构造数组（`arrayStatus`/`arrayScopes`）、内部数组（`availableAccounts`/`availableCategories`/`arControlCenters`[control-center]）均保持 plain。仅 signal 化 `isLoadingResults`/树节点数组/模板读取数组（`accountTreeNodes`/`ccTreeNodes`/`ttTreeNodes`/`filterDocItem`/`arControlCenters`[account]）+ `isChildMode` computed。
- `home-def-list` 的 `onChooseHome` 改写 `homeService.ChosedHome`/`CurrentMemberInChosedHome`（服务 setter -> BehaviorSubject.next -> toSignal 更新 -> computed 重算）后立即 `router.navigate` 离开，反应性正确。
- 验证：`ng test`（5 文件 / 22 测试通过，exit 0）+ `eslint`（5 个 .ts 全部 exit 0）。

**Phase 4 备注（Tier C 选择对话框族，full 转换）**：
- 5 个 **live** 对话框（均经 `NzModalService.create({nzContent})` 打开，无嵌入式 `<selector>` 用法）。编排者亲自完成。**先做存活排查**：11 个 `*-selection-dlg`/`borrow-record-create-dlg` 文件里有 6 个是 legacy/死代码（嵌套重复路径 `library/person/person-selection-dlg/`、`library/organization/organization-selection-dlg/`、`library/location/location-selection-dlg/`、`library/borrow-record/borrow-record-create-dlg/`，以及未被任何 `nzContent` 引用的 `organization-type-selection-dlg`/`person-role-selection-dlg`）--**跳过**，只迁 5 个 live。
- **`model()` 首次落地**：`@Input() setOfCheckedId = new Set<number>()` 原先被**就地 mutate**（`add`/`delete`，不重新赋值）。`input()`（只读）无法 mutate；`model()` 可写但需**不可变更新**：`this.setOfCheckedId.update(s => { const ns = new Set(s); ns.add(id)/ns.delete(id); return ns; })`。模板 `setOfCheckedId.has(id)` -> `setOfCheckedId().has(id)`。
- **`checked`/`indeterminate` -> `computed()`**：原为 plain 字段 + `refreshCheckedStatus()` 命令式刷新；现 `checked = computed(() => page.every(prn => setOfCheckedId().has(prn.ID)))`，`indeterminate = computed(() => page.some(...) && !checked())`。模板 `[nzChecked]`/`[nzIndeterminate]` 是单向绑定，可读 computed。`refreshCheckedStatus()` 方法删除（computed 自动派生）。`onCurrentPageDataChange`/`onItemChecked`/`onAllChecked` 不再调它。
- **次要行为差异（已接受）**：原 `checked` 初值 `false`；computed 在空页时 `every([])===true` -> `checked()=true`。仅影响空表初始态（数据未加载），spec 用非空 `mockPersons` 不受影响。
- **`roleFilter`/`singleSelection` @Input -> `input()`**（只读）。
- **org 的 `isSubmittedAllowed` getter -> `computed()`**（读 `setOfCheckedId().size` + `singleSelection()`）。
- **borrow-record-create-dlg（表单类，不同于其余 4 个）**：`selectedBook` @Input -> `input<Book|null>(null)`；`selectedOrg` -> `signal<Organization|null>(null)`；`selectedBookName`/`selectOrgName` getter -> `computed()`。**`isSubmittedAllowed` 读 `detailFormGroup.valid`**：`detailFormGroup` 改字段初始化（原在构造函数），随后 `formValid = toSignal(detailFormGroup.statusChanges.pipe(map(() => detailFormGroup.valid)), {initialValue: detailFormGroup.valid})`，`isSubmittedAllowed = computed(() => formValid() && selectedBook() !== null && selectedOrg() !== null)`。`onSelectOrganization` 里 `selectedOrg = org` -> `selectedOrg.set(org)`，保留 `changeDetect.detectChanges()`（保险）。`handleOk` 读 `selectedBook()?.ID ?? 0`。
- **DestroyRef 顺手修泄漏**：4 个 selection-dlg 原先 `fetchAllX().subscribe({...})` 无 `takeUntil`（泄漏），加 `takeUntilDestroyed(destroyedRef)`。
- **spec 改造**：仅 `person-selection-dlg` spec 有字段访问测试（7 个），把 `component.setOfCheckedId = X` -> `.set(X)`、`.has`/`.size`/`checked` 读取加 `()`。org/location/book-category/borrow-record-create 4 个 spec 仅 `should create`，零改动。注意 `model()` 在 spec 里既可 `.set()` 也可 `componentRef.setInput()`。
- 验证：`ng test`（5 文件 / 11 测试通过，exit 0）+ `eslint`（5 个 .ts `--fix` 后全部 exit 0）。ng test 输出里的 NG8116 警告指向**死代码** `library/organization/organization-selection-dlg/`（已跳过），非 live 组件。

**Phase 2 备注（Tier A 琐碎组件）**：
- 7 个 Tier A 组件里仅 2 个有可 signal 化的真实逻辑：
  - `signin-callback`：手动 `Subscription` + `ngOnDestroy` -> `DestroyRef` + `takeUntilDestroyed`（无 spec，`ng build` AOT 验证）。
  - `message-dialog`：2 个 `@Input` -> `input()`（与 Tier E 一致；`nzData` 不绑 input 的既有缺陷不变）。HTML `title`/`infoMessages` 加 `()`。spec 仅 `should create`（`detectChanges` 注释掉、模板不渲染），零改动。
- 5 个**无需 signal 化**（纯模板或静态常量，signal/computed 无收益）：
  - `not-found` / `version`：空类，纯模板。
  - `credits`：`creditApp` 静态常量数组（从不重新赋值）。
  - `welcome`：~20 个图片 getter 是 `environment.AppHost`（静态常量）的纯函数，无 signal 输入 -> computed 无收益。
  - `fatal-error`：`errorContext` 构造函数一次性从 `uiStatus.latestError`（plain 属性）赋值，无 signal 输入 -> 须待 Tier F（`UIStatusService` signal 化）才有意义，暂跳过。
- 验证：`ng test`（message-dialog 1/1 通过）+ `ng build`（全 app AOT exit 0，覆盖无 spec 的 signin-callback）+ `eslint`（2 个 .ts exit 0）。

**Tier C 主体批次 1 备注（4 个视图/报表组件）**：
- 4 个 **live** 组件：`document-item-view`（被 ~12 个报表经 `nzContent`/drawer 引用）、`document-item-search`（路由 `/search`）、`document-item-insight`（路由 `/insight`）、`reconcile-by-month`（路由 `/account-reconcile/bymonth`）。
- **存活排查（第三次）**：`finance/document-item-{view,search,insight}/`（直接在 finance 下，非 `document/` 下）是 legacy 死代码（路由用 `./document/document-item-*`，所有 nzContent 引用走 `../../document/document-item-view`，仅各自 spec 引用自身），跳过。`account-settle-dialog`（两个副本）都是空 stub 类（`account-hierarchy` 用内联 settle 对话框 `isAccountSettleDlgVisible`/`selectedAccountForSettle`，不引用此组件），跳过（同 Tier A 空组件）。
- **`document-item-view`——副作用 input 的安全阀决策（重要）**：`@Input() set filterDocItem` 是带副作用的 setter（赋值即 reset page + fetch）。原计划转 `input()`+`effect()`+`untracked()`（`untracked` 防 `pageIndex`/`pageSize` 读成为 effect 依赖导致分页回退 page 1），但 `ng build` 暴露**消费者类型破坏**：~12 个报表经 `nzContentParams: { filterDocItem }` 传值，ng-zorro 推断的 `nzContentParams` 类型**不会 unwrap signal input**——`InputSignal<GeneralFilterItem[]>` 不可被 plain 数组赋值（TS2322）。其中 5 个**推断** `D` 泛型的报表（order-report/report/tran-type-report/tran-type-mom/...）报错；`account-report` 因**显式**写 `<DocumentItemViewComponent, { filterDocItem: GeneralFilterItem[] }, string>` 而幸免。**回退为 plain `@Input() set`（安全阀）**：副作用 input 属"不能干净转"类别，回退后 12 个消费者**零改动**。仅 signal 化内部展示状态（`isLoadingDocItems`/`listDocItem`/`arAccounts`/`arTranType`/`arControlCenters`/`arOrders`/`pageIndex`/`pageSize`/`totalDocumentItemCount`/`incomeAmount`/`outgoAmount`/`incomeCurrency`/`outgoCurrency`）+ `DestroyRef`+`takeUntilDestroyed`，fetch 的 `push`+`+=` 改本地累积 + `.set()`。
  - **通用教训（后续 Tier C 表单适用）**：`input()` 用于被 `nzContentParams`/`componentInstance.x =` 消费的 input 时，会破坏消费者的类型推断。安全阀：副作用 setter input 或被 `nzContentParams` 传值的 input 保持 plain `@Input`；只 signal 化内部状态。
- **`document-item-search`**：`isChildMode` getter -> `toSignal(curHomeMember)`+`computed`（spec 桩补 `curHomeMember` BehaviorSubject + `<HomeMember | null>` 显式泛型，复用批次 6 类型坑）；`filters`/`realFilters` -> signal（`onAddFilter`/`onRemoveFilter` 不可变 `update`，`onSearch` 的 `forEach` 改 `filters().forEach`）；行级 `[(ngModel)]="filter.fieldName"` 保持（对象属性就地 mutate，不阻断数组 signal 化）。静态 ctor 数组（`allFields`/`allOperators`/`listOfColumns`）+ 死字段（table 已移至 document-item-view，`arAccounts`/`listDocItem`/`pageIndex` 等仅 sortFn 闭包引用）保持 plain。无 subscribe -> 删 `_destroyed$`/`OnDestroy`，无 DestroyRef。
- **`document-item-insight`——nz-transfer 安全阀**：`listGroupFields` 经 `[nzDataSource]` 绑到 nz-transfer，nz-transfer **就地 mutate item 的 `direction`** -> signal 数组无法捕获就地 mutate -> `isTranDateVisible`/`isAccountVisible`/`isTranTypeVisible` getter **保持 plain getter**（非 computed），`insideDateRangeString`（读 plain `insightOption`）保持。signal 化 `isLoadingData`/`listData`/`listDisplayData`/`arAccounts`/`arTranType`/`totalDataCount`/`incomeAmount`/`outgoAmount`；`baseCurrency`/`insightOption`/死字段 `incomeCurrency`/`outgoCurrency`（模板用 `baseCurrency` 非 xxxCurrency）保持 plain。链式分页 `listData.push(...)` -> `listData.update(arr => [...arr, ...])`，`listData.length`/`totalDataCount` 读改 `()`；`buildDisplayList` 全部本地累积 + 末尾 `.set()`。`DestroyRef`+`takeUntilDestroyed`。spec 无字段访问、无 toSignal -> 零改动。
- **`reconcile-by-month`——steps 向导**：signal 化 `currentStep`/`processing`/`arUIAccounts`/`listExpectResult`/`compareResult`；`pre`/`next` 用 `.update(s => s ± 1)`；`listExpectResult` 的 `handleFastInputModalSubmit`/`onAddExpectResultRow`/`onDeleteRow` 不可变 `update`（`onDeleteRow` 简化为 `filter(item => item !== row)`，等价于原 find-by-reference + splice + spread）；`fetchAccountBalanceInfo` 的 `compareResult` 本地累积 + `.set()`。安全阀：`selectedAccountId`/`fastInputResult`/`isFastInputDlgVisible`（`[(ngModel)]`/`[(nzVisible)]`）、`baseCurrency`、`prvSentInfo`（内部）、`arAccounts`（内部且 spec 断言 `arAccounts.length`）保持 plain。`DestroyRef`+`takeUntilDestroyed`（ngOnInit forkJoin + ngAfterViewInit `activateRoute.url` + 顺手给 `fetchAccountBalanceInfo` 原本无 takeUntil 的 subscribe 补上，修泄漏）。spec 零改动。
- **关键 bug 修复**：首次 `ng build` 报 `revdata is of type unknown`（document-item-view forkJoin）。根因：误写 `import { finalize, takeUntilDestroyed } from 'rxjs/operators'`——`takeUntilDestroyed` 应从 `@angular/core/rxjs-interop` 导入。错误导入致 `takeUntilDestroyed` 解析为 any、整个 `.pipe()` 类型退化为 `Observable<unknown>`。改为分开导入（`finalize` from `rxjs/operators`，`takeUntilDestroyed` from `@angular/core/rxjs-interop`，同 document-list 模板）后 forkJoin 元组类型恢复。另修 document-item-search 两处遗漏：删 `OnDestroy` 导入后 `implements OnInit, OnDestroy` 残留（TS2304）、`onSearch` 的 `this.filters.forEach` 漏改 `filters().forEach`（TS2339）。
- 验证：`ng build`（exit 0）+ `ng test`（4 文件 / 11 通过 / 1 预存 skip）+ `eslint --fix`（reconcile-by-month 13 个 prettier 缩进错自动修复后，4 .ts 全 exit 0）。

**Tier C 主体批次 2 备注（2 个 Library 详情表单，首个 detail-form 批次）**：
- 2 个 Library 详情表单：`location-detail`（最简，无列表数组、无 onAssign 对话框）+ `book-detail`（5 个列表数组 + 4 个 onAssign 选择对话框）。二者均经路由 `/library/{book,location}/{create|edit|display}/:id` 进入，有 spec。
- **详情表单迁移模式定型**：`detailFormGroup`（`UntypedFormGroup`）**保持 plain**--FormGroup 不是 signal 响应式（本文档第三节核心障碍），表单控件仍走 `formControlName`/`[formGroup]`。signal 化 `uiMode`/`routerID`/`currentMode`/`isLoadingResults`（ngOnInit 的 `activateRoute.url` 回调里 `.set()`，`switch(this.uiMode())`）；`DestroyRef`+`takeUntilDestroyed` 取代 `_destroyed$`。
- **`isEditable` 用 getter 而非 computed（关键决策）**：`isEditable` 读 `uiMode`（**非** `form.valid`）。保留为 plain `get isEditable() { return isUIEditable(this.uiMode()); }`--getter 在 zone 模式下每次 CD 重算、读当前 signal 值，反应性正确。**好处**：模板 `[disabled]="!isEditable"` 无需改 `()`（6 处 book-detail）、spec `component.isEditable` 无需改（2 处 book-detail）。对比批次 6 的 `isChildMode` -> `computed`（那处模板/spec 已须改）。两者皆可；首个 detail-form 批次选 getter 以最小化爆炸半径。若日后上 zoneless，getter 需复核（getter 不被 signal 追踪，zoneless 下可能不触发 CD）。
- **无 form-bridge**：`isEditable` 读 `uiMode` 不读 `form.valid`，故**不需要** `toSignal(form.valueChanges)` 桥接。form-bridge 仅 Finance 详情表单的 `isFieldChangable` getter（读 `detailFormGroup.valid`，如 order/plan/control-center/home-def-detail）需要--下批处理。
- **book-detail 5 个列表数组**（`listAuthors`/`listTranslators`/`listPresses`/`listCategories`/`listLocations`）-> signal：`onAssign*` 对话框 `nzOnOk` 回调原先 `this.listXxx = []; ... push`，改为本地 `const na: T[] = []` 累积 + 末尾 `this.listXxx.set(na)`；`onAssign*` 开头构造初始勾选集的 `this.listXxx.forEach` -> `().forEach`；`readBook` next 里 `= e.X` -> `.set(e.X)`；`onSave` 里 `.slice()` -> `().slice()`。
- **静态 ctor 数组保持 plain**：`location-detail` 的 `arLocationStrings`（`UIDisplayStringUtil.getLocationTypeEnumDisplayStrings()`，ctor 一次性赋值，模板 `@for` 读但不变）保持 plain（同批次 1 静态数组规则）。
- **spec 零改动**：两 spec 仅访问 `component.isEditable`（getter，不变）、`component.detailFormGroup`（plain，不变）；无 `curHomeMember`/toSignal（只读 `homeService.ChosedHome?.ID`）。故 spec 完全不动即通过。
- 验证：`ng build`（exit 0）+ `ng test`（2 文件 / 7 通过）+ `eslint --fix`（location-detail 的 Write 引入 128 个 prettier 缩进错 + 1 个未用 `computed` 导入[因 isEditable 用 getter] 自动修复后，2 .ts 全 exit 0）。
- **剩余 detail/create 表单**：~~`document-detail`/`account-detail`（CVA 父子耦合，最重，须与 Tier D CVA 组件一起迁）~~--**两者均已完成**（account-detail 于 Tier D 批次 4、document-detail 于 Tier D 批次 5；CVA 父子经 @ViewChild/form-control 解耦，无须同迁，见批次 1/5 备注）。Finance 详情表单 `order-detail`/`plan-detail`/`control-center-detail`/`home-def-detail` 已于批次 4 完成（form-bridge 经分析非必需，见批次 4 备注）；6 个创建表单向导已于批次 5 完成；4 个批量创建向导已于批次 6 完成。**Tier C/D 主体全部收尾**。Tier F 路线 (a)（消费端 `toSignal`）随各批次增量完成，`app.component` 根组件于 Tier F 批次 1 完成。Tier F 路线 (b) `HomeDefOdataService`（`curHomeSelected`/`curHomeMember` -> signal + 3 缓存服务 effect + 9 组件 computed）于批次 2 完成。**仅剩**：Tier F 路线 (b) `AuthService`（`authSubject` BehaviorSubject -> signal，项目级消费端）+ `UIStatusService.versionResult` signal 化（defer 至 about.component 迁移）+ 可选 Phase 8（zoneless）。

**Tier C 主体批次 3 备注（2 个 Library 详情表单，复用 detail-form 模式）**：
- 2 个 Library 详情表单：`person-detail` + `organization-detail`，结构与批次 2 的 `book-detail`/`location-detail` 同构（路由 `/library/{person,organization}/{create|edit|display}/:id`，有 spec）。完整复用批次 2 定型的 detail-form 模式，**零模式新增**。
- signal 化 `uiMode`/`routerID`/`currentMode`/`isLoadingResults` + `DestroyRef`+`takeUntilDestroyed`（取代 `_destroyed$` ReplaySubject，删 `OnDestroy`）；`isEditable` 保持 getter 读 `this.uiMode()`；`detailFormGroup` 保持 plain。
- **列表数组 + 引用数据均 signal 化**：`listRoles`/`listTypes`（每行可增删的子表）+ `allRoles`/`allTypes`（异步拉取的引用数据，类比批次 1 的 `arTranType`/`arAccounts`）。`onAssign*` -> `update(arr => [...arr, new X()])`；`onRemove*` 原先 findIndex+splice+spread 三步 -> 简化为 `update(arr => arr.filter(p => p.ID !== id))`（等价）；fetch next 里 `= e.X` -> `.set(e.X)`；`onSave` 的 `.slice()` -> `().slice()`；`onTypeModeChanged` 的 `allTypes.findIndex` -> `allTypes().findIndex`。
- **spec 零改动**：两 spec 仅访问 `component.isEditable`（getter 不变）+ `component.detailFormGroup`（plain 不变）；不断言 `allRoles`/`allTypes`/`listRoles`/`listTypes`；无 `curHomeMember`/toSignal（只读 `homeService.ChosedHome?.ID`）。person-detail spec 覆盖 create/display/edit 三模式 + 错误对话框（7 测试），organization-detail spec 仅 `should create`（1 测试，桩缺 `fetchAllOrganizationTypes` spy / 无 ActivatedRoute stub，但本批迁移不改该调用路径，行为不变）。
- HTML：`{{ currentMode | transloco }}` -> `{{ currentMode() | transloco }}`、`[nzData]="listRoles"` -> `listRoles()`、`@for (coll of allRoles; ...)` -> `allRoles()`（organization 同理 listTypes/allTypes）。`isEditable` 保持 getter（`[disabled]="!isEditable"` 无 `()`）。
- 验证：`ng build`（exit 0）+ `ng test`（2 文件 / 8 通过）+ `eslint --fix`（Write 引入的 prettier 缩进自动修复后，2 .ts 全 exit 0）。

**Tier C 主体批次 4 备注（4 个 Finance 详情表单，form-bridge 经分析非必需）**：
- 4 个 Finance/Home 详情表单：`order-detail`（含 `listRules` 结算规则子表 + 提交结果态）、`plan-detail`（5 个引用数组 + 提交结果态）、`control-center-detail`（最简，无子表/无提交态）、`home-def-detail`（`listMembers` 成员子表 + 多 getter）。均经路由 `/{finance/{order,plan,controlcenter},homedef}/{create|edit|display}/:id` 进入，有 spec（共 49 测试）。
- **form-bridge 决策反转（关键）**：原计划 Finance 详情表单须 `toSignal(form.valueChanges)` 桥接读 `form.valid` 的 getter。但核查代码发现：(1) `isFieldChangable`/`isCreateMode` 读 `uiMode`（**非** `form.valid`，同 Library）；(2) 仅 `saveButtonEnabled`(order/plan)/`isSaveAllowed`(home-def) 读 `detailFormGroup.valid`。app 用 `provideZoneChangeDetection({ eventCoalescing: true })`（**zone 模式**，非 zoneless），plain getter 读 `uiMode()` + `form.valid`（plain 同步）+ `listRules()` 每次 CD 重算，反应性正确。故 **form-bridge 非必需**，全部 getter 保持 plain（同 Library 模式），模板 `[disabled]="!saveButtonEnabled"` 无 `()`、spec `component.saveButtonEnabled` 无 `()`。form-bridge 仅 zoneless 迁移（Phase 8）时才必需--届时 `saveButtonEnabled` 类读 `form.valid` 的 getter 须改 `computed` + `toSignal(form.statusChanges)`。
- **提交结果态保持 plain（新安全阀）**：`isOrderSubmitting`/`isOrderSubmitted`/`orderIdCreated`/`orderSavedFailed`(order)、`isObjectSubmitting`/`isObjectSubmitted`/`objectIdCreated`/`objectSavedFailed`(plan)、`ruleChanged`(order 内部标志) 保持 plain。理由：瞬态提交生命周期标志（subscribe/finalize 里赋值，翻转一次），非派生响应态；signal 化收益小但 spec 重度耦合（order spec ~25 处、plan spec ~12 处直接访问），churn 大。模板 `@if (isOrderSubmitted)`/`[nzSpinning]="isOrderSubmitting"` zone 模式下 plain 可用。
- **signal 化**：`uiMode`/`routerID`/`currentMode`/`isLoadingResults` + 异步引用数组（`arControlCenters`/`arCurrencies`/`arTranType`/`arAccountCategories`/`arUIAccounts`/`existedCC`/`arMembers`）+ 可变列表（`listRules`/`listMembers`）。`DestroyRef`+`takeUntilDestroyed` 取代 `_destroyed$`。静态 ctor 数组保持 plain：`arFinPlanTypes`(plan)、`listMemRel`(home-def)。
- **可变列表不可变更新**：order `onCreateRule`/`onDeleteRule`、home-def `onCreateMember`/`onDeleteMember` 用 `.slice()`+`push`/`splice`+`.set()`（保留原 findIndex+splice 逻辑，仅 `this.listX = arr` -> `.set(arr)`）。home-def Create 默认成员：原 `this.listMembers = []; ...push(nm)` -> `this.listMembers.set([nm])`。
- **home-def 修泄漏**：`activateRoute.url` 原无 takeUntil，补 `takeUntilDestroyed(this.destroyedRef)`。
- **spec 改动最小**：仅 order-detail spec 的 `component.listRules` -> `component.listRules()`（replace_all，覆盖 `.length`/`[idx]` 就地 mutate 元素两种用法；signal 数组就地 mutate 元素属性 + getter 重算在 zone 模式下正确）。plan/control-center/home-def spec **零改动**（仅访问 getter + `detailFormGroup`，不直接访问 list/引用数组/提交态）。
- HTML：`currentMode`/`isLoadingResults`/引用数组 `@for`/`[nzData]` -> `()`；getter（`isFieldChangable`/`isCreateMode`/`saveButtonEnabled`/`isSaveAllowed`/`isDeleteItemAllowed`）+ 提交态 + 静态 ctor 数组保持无 `()`。
- 验证：`ng build`（exit 0）+ `ng test`（4 文件 / 49 通过）+ `eslint --fix`（Write 引入的 prettier 缩进自动修复后，4 .ts + order spec 全 exit 0）。

**Tier C 主体批次 5 备注（6 个 Finance 创建表单向导，多步 steps）**：
- 6 个创建表单：`document-normal-create`（4 步：header/items/confirm/result，含 `arDocItem` 重复检测）、`document-transfer-create`（5 步：header/from/to/confirm/result，3 FormGroup + `_duplicateAccountValidator`）、`document-loan-create`（4 步，`@ViewChild(AccountExtraLoanComponent)` CVA 子组件 + 嵌套 `activateRoute.url` + `ChangeDetectorRef` + `_legacyDateValidator`/`_accountValidator`）、`document-asset-buy-create`（4 步，`AccountExtraAssetComponent` + `_docDate` + 3 validator）、`document-asset-sold-create`（4 步，`detailObject` 提交载荷 + 2 validator + pipe `uiAccountCtgyFilterEx`）、`document-downpayment-create`（4 步，`AccountExtraDownpaymentComponent` + `_isADP` 路由标志 + 嵌套 `activateRoute.url`，HTML 用 `*ngIf` 非 `@if`）。均有 spec（共 100 测试 / 25 skip）。
- **signal 化**：`currentStep`（向导步数，`pre`/`next` 用 `.update(s => s ± 1)`，`onSave`/`onSubmit` 的 `finalize` 里 `.set(3)`/`.set(4)`）+ 异步引用数组（`arUIAccounts`/`arCurrencies`/`arDocTypes`/`arTranType[s]`/`arControlCenters`/`arUIOrder[s]`/`arAccounts`/`arOrders` 等，命名各组件不一：normal/transfer 用复数 `arUIAccounts`/`arUIOrders`/`arTranType`，loan/asset 用单数 `arUIAccount`/`arUIOrder`/`arTranTypes`，downpayment 用 `arTranType` 单数）。`DestroyRef`+`takeUntilDestroyed` 取代 `_destroyed$`。
- **安全阀保持 plain**：(1) `confirmInfo: SafeAny`（`_updateConfirmInfo` 里**就地 mutate 属性** `this.confirmInfo.X = ...`，signal 对象无法捕获属性 mutate）保持 plain；(2) 提交态 `isDocPosting`/`docIdCreated`/`docPostingFailed`（同批次 4 安全阀，spec 重度耦合）保持 plain；(3) `doccur`/`doccur2`/`baseCurrency`/`curDocType`/`curMode`/`curTitle`/`detailObject`/`_docDate`/`_isADP`/`uiAccountStatusFilter`/`uiAccountCtgyFilter[Ex]`/`uiOrderFilter`（常量/ctor 一次/路由设置/过滤对象）保持 plain；(4) `headerForm`/`firstFormGroup`/`fromFormGroup`/`toFormGroup`/`itemFormGroup`/`extraFormGroup`/`accountExtraInfoFormGroup`（FormGroup）保持 plain；(5) normal 的 `arDocItem`（内部，仅 `_updateConfirmInfo` 用）保持 plain。
- **getter 保持 plain**：`nextButtonEnabled`（读 `currentStep()` + `form.valid`，同批次 4 form-bridge 非必需逻辑）、`curDocDate`/`tranAmount`/`tranType`/`controlCenterID`/`orderID`/`IsLegacyAsset`/`isLegacyLoan`（读 form 或 `_docDate`）。
- **validator 读 ref 数组**：asset-buy 的 `amountEqualsValidator` 读 `this.arTranTypes()`、asset-sold 的 `_itemAmountValidator` 读 `this.arTranTypes()`、`_updateConfirmInfo` 读 `this.arAccounts()`（asset-sold）-- 均改 `()`。
- **嵌套 route subscribe 修泄漏**：loan/downpayment 的 `activateRoute.url` 原无 takeUntil（嵌套在 forkJoin next 里），补 `takeUntilDestroyed(this.destroyedRef)`。
- **spec 改动最小**：6 spec 仅 `component.currentStep` -> `component.currentStep()`（replace_all，0 写入安全）；transfer spec 额外 `component.arUIAccounts`/`component.arUIOrders` -> `()`（spec 直接断言 `.length`）。其余 4 spec 零改动（不直接访问 ref 数组/提交态/confirmInfo）。
- **HTML 用 sed 批量替换**：`[nzCurrent]="currentStep"`、`[hidden]="currentStep !== N"`、`@if (currentStep ...)`/`*ngIf="currentStep ..."`、`[arXxx]="arXxx"`、`@for (x of arXxx; ...)`、`of arXxx | pipe` -> `()`。**单复数子串陷阱**：`[arUIAccounts]="arUIAccount"`（属性名复数 `arUIAccounts` vs 字段单数 `arUIAccount`）须用全模式 `[arUIAccounts]="arUIAccount"` 替换，不能 replace_all `arUIAccount`（会破坏属性名 `arUIAccounts`）。asset-sold 的 `@for (acnt of arUIAccount | uiAccountCtgyFilterEx: ...)` 是 pipe 情况，用 `of arUIAccount |` 模式。downpayment 的 `[allTranTypes]="arTranType"`（属性名 `allTranTypes` vs 字段 `arTranType`）同样用全模式。
- 验证：`ng build`（exit 0）+ `ng test`（6 文件 / 100 通过 / 25 skip）+ `eslint --fix`（Write 引入的 prettier 缩进自动修复后，6 .ts + 6 spec 全 exit 0）。

**Tier C 主体批次 6 备注（4 个 Finance 批量创建向导，复用批次 5 wizard 模式）**：
- 4 个批量创建向导：`document-normal-mass-create`（3 步：items/confirm/result，FormArray 动态行 + `confirmInfo` 按日期分组 + `docIdCreated`/`docIdFailed` 批量结果）、`document-asset-value-change-create`（3 步：header/review/result，`firstFormGroup` + `existingDocItems` 余额推算 + `detailObject` 提交载荷 + `_amountValidator`）、`document-recurred-mass-create`（6 步：search/existing/defaultValues/items/confirm/result，3 FormGroup + `arFrequencies` 静态 + `listExistingDocItems` 按日期区间分组）、`document-loan-repay-create`（4 步：search/items/confirm/result，`searchFormGroup`+`headerFormGroup` + `listOfLoanTmpDoc`/`selectedLoanTmpDoc`/`listOrgItems`/`listItems` 交互业务态 + `legacyLoan` 分支 + 嵌套 `activateRoute.url`）。均有 spec（共 64 测试 / 5 skip）。
- **signal 化**：`currentStep`（`pre`/`next` 用 `.update(s => s ± 1)`，`_doPosting`/`onSubmit`/`doPosting` 的 `finalize` 里 `.set(N)`）+ 异步引用数组（normal/recurred 用复数 `arUIAccounts`/`arUIOrders`/`arTranType`；asset/loan 用单数 `arUIAccount`/`arUIOrder`，asset 用 `arTranTypes`/loan 用 `arTranTypes` 复数）。`DestroyRef`+`takeUntilDestroyed` 取代 `_destroyed$`，删 `OnDestroy`。**完全复用批次 5 wizard 模式，零模式新增**。
- **安全阀扩展（交互业务态保持 plain，新决策）**：批次 5 的安全阀（confirmInfo 就地 mutate / 提交态 / 常量 / FormGroup）继续适用。本批新增一类保持 plain 的理由：**交互式业务态数组**。loan-repay 的 `listOfLoanTmpDoc`/`selectedLoanTmpDoc`/`listOrgItems`/`listItems`/`amountTotal`/`amountSelectedItem`/`interestAmountSelectedItem`/`legacyLoan`（用户搜索/选行/增删行命令式 mutate，且与 `nextButtonEnabled`/`normalLoanCase`/`isValidItem` 验证 getter 重度耦合，spec 直接断言 `.length`/`[0]` ~20 处）保持 plain。同理 normal/recurred 的 `arItems`/`confirmInfo`/`docIdCreated`/`docIdFailed`、asset 的 `existingDocItems`/`detailObject`/`confirmInfo` 保持 plain。zone 模式下 plain getter 读 plain 字段每次 CD 重算，反应性正确；signal 化须改 `push`/`splice` -> 不可变 + 改所有验证 getter `()` + 改 spec，churn 大收益小。
- **静态 ctor 数组保持 plain**：recurred 的 `arFrequencies`（`UIDisplayStringUtil.getRepeatFrequencyDisplayStrings()`，同批次 2/3 静态规则）保持 plain，spec `component.arFrequencies[0].value` 不动。
- **loan-repay 修泄漏**：外层 `activedRoute.url.subscribe`（无 takeUntil，嵌套 forkJoin）补 `.pipe(takeUntilDestroyed(this.destroyedRef))`（同批次 5 loan-create/downpayment-create + 批次 4 home-def-detail 的 route 泄漏修法）。内层 forkJoin 的 `takeUntil(this._destroyed$!)` -> `takeUntilDestroyed(this.destroyedRef)`。
- **getter 保持 plain**：`nextButtonEnabled`（读 `currentStep()` + `form.valid`/`existingDocItems.length`/`isValidItem`，同批次 4/5 form-bridge 非必需）、`isValidItem`/`normalLoanCase`（loan-repay，读 `currentStep()` + plain 交互态）、`NewEstimatedAmount`（asset，读 `firstFormGroup`）、`getConfirmDocumentTitle`/`getAccountName`/`getControlCenterName`/`getOrderName`/`getTranTypeName`（读 `()` 引用数组）。
- **spec 改动最小**：4 spec 仅 `component.currentStep` -> `component.currentStep()`（replace_all，0 写入安全；normal 4 处 / asset 15 处 / recurred 17 处 / loan 11 处）。**零 ref 数组改动**：4 spec 均不直接断言 ref 数组（recurred 的 `arFrequencies` 保持 plain 故不动；loan 的 `listOfLoanTmpDoc`/`selectedLoanTmpDoc` 保持 plain 故不动）。asset spec 的 `existingDocItems`/`docIdCreated`/`isDocPosting`/`docPostingFailed`/`curDocType`/`firstFormGroup` 全保持 plain 故零改动。
- **HTML 用 perl 批量替换**（前批用 sed，本批改 perl 以用负向先行 `currentStep(?!\()` 一次覆盖所有 currentStep 上下文）：`[nzCurrent]`/`[hidden]`/`@if`/`*ngIf`/`[nzCurrent]` 的 currentStep 全 -> `()`。ref 数组用**前缀捕获** `s/(of |=")arXxx\b/$1arXxx()/g` 精确区分 `of arXxx`（@for 值）/`="arXxx"`（input 绑定值）与 `[arXxx]`（属性名，不动）-- 规避批次 5 的单复数子串陷阱。recurred 的 `arFrequencies` 不在替换列表故保持 plain。asset 的 `of arUIAccount | uiAccountCtgyFilterEx: uiAccountCtgyFilterEx` 中 `uiAccountCtgyFilterEx`（plain 过滤对象）不被误改。
- 验证：`ng build`（exit 0）+ `ng test`（4 文件 / 64 通过 / 5 skip）+ `eslint`（4 .ts + 4 spec 全 exit 0，无 prettier 缩进问题因用 Edit 非 Write）。

**Tier D 批次 1 备注（2 个 CVA signal 化 + 2 no-op，CVA-bridge 模式定型）**：
- 2 个 CVA signal 化：`account-extra-loan`（`listTmpDocs: TemplateDocLoan[]` + `calcLoanTmpDocs` subscribe）、`account-extra-downpayment`（`listTmpDocs: TemplateDocADP[]` + `calcADPTmpDocs` subscribe）。两者结构同构：CVA 值子数组 `listTmpDocs` 在 `writeValue`（父表单写入）+ `onGenerateTmpDocs`（异步计算结果）里赋值，在 `value` getter + 模板 `[nzData]` 里读。
- **CVA-bridge 模式（保守版，定型）**：signal 化 CVA 值数组 `listTmpDocs`（`writeValue` -> `.set()`，`onGenerateTmpDocs` -> `.set()`，`value` getter -> `().slice()`，模板 `[nzData]` -> `()`）；`_destroyed$` -> `DestroyRef`+`takeUntilDestroyed`（calc*TmpDocs subscribe）；删 `OnDestroy`。**保持 plain**：`loanInfoForm`/`adpInfoFormGroup`（FormGroup，同 detail-form 模式）、`@Input`（`tranAmount`/`controlCenterID`/`orderID`/`arUIAccount`/`allTranTypes`/`tranType` -- **不转 `input()`**，规避 signal-input 只读致 spec `componentInstance.X =` 破坏，见风险 #3）、`@HostListener('change'/'blur')`（CVA onChange/onTouched 触发，保留）、`validate()`/`_onChange`/`_onTouched`/`_isChangable`（CVA 命令式接口，保留）、`arRepaymentMethods`/`arFrequencies`（静态 ctor）、`isLoadingTmpDocs`/`isLegalLoan`/`currentMode`（标志/字符串）。
- **关键解耦决策**：文档原说 `account-detail`+`account-extra-*` 须同迁（因 `@ViewChild` -> `viewChild()` signal query）。但**保留 `@ViewChild` 装饰器**（不转 `viewChild()`，同前所有批次）即可让 CVA 子组件**独立迁移**--父组件 `@ViewChild` 仍取到组件实例，子组件内部 signal 化不影响父的查询/方法调用（`.value` getter 读 `listTmpDocs()` 仍工作）。故本批仅迁 2 个 CVA 子组件，不碰 `account-detail` 父。`viewChild()` 转换属"锦上添花"，延后（且会引入父子耦合，违背分批独立原则）。
- **2 个 no-op（确认并记录）**：(1) `account-extra-asset`：无 `_destroyed$`、无 subscribe、无值子数组（`value` 仅读 FormGroup 字段 + `_refBuyDocID`/`_refSoldDocID`），`@Input arAssetCategories` 有 setter 副作用（slice+log）。无可 signal 化的异步/数组态；转 `input()` 须配 `effect()` 处理 setter 副作用 + 破坏 spec，收益为零。**no-op，不改**。(2) `document-normal-mass-create-item`：纯呈现器（5 个 `@Input`，空 ctor，无 async/无 FormGroup/无 `_destroyed$`）。同上，no-op。
- **writeValue 里 signal 写安全**：`writeValue` 在 Angular forms CD 期间被调，`listTmpDocs.set(val.loanTmpDocs.slice())` 是 signal 写。signal 通知是调度式（非同步抛 NG0100），且 `writeValue` 不在同一表达式里读该 signal，无 `ExpressionChangedAfterChecked` 风险。此即文档 CVA-bridge 骨架 `writeValue(v) { this.listItems.set(v); }` 的落地。
- **spec 改动最小**：loan spec 3 处 `testcomponent.extraComponent?.listTmpDocs.length` -> `.listTmpDocs().length`（断言初始空数组 `.length === 0`）。downpayment spec **零改动**（不直接访问 `listTmpDocs`，仅访问 `canCalcTmpDocs`/`isFieldChangable` 等 plain getter + 调 `onGenerateTmpDocs()`）。asset/mass-create-item spec 零改动（组件未改）。**回归验证**：额外跑 `document-loan-create`/`document-downpayment-create` 两个已迁创建表单 spec（它们 `@Component.imports` 渲染这 2 个 CVA），确认 CVA 内部 signal 化不破坏创建表单的 form-control 交互--全通过。
- **getter 读 signal 安全**：`value` getter（读 `listTmpDocs().slice()`）被 `canGenerateTmpDocs`/`canCalcTmpDocs` getter + `_onChange(this.value)` + 模板调用。zone 模式下 getter 每次 CD 重算、读当前 signal 值，反应性正确；plain getter 读 signal 不建立 computed 依赖（getter 非 reactive context），无需 `untracked`。
- 验证：`ng build`（exit 0）+ `ng test`（6 文件 / 48 通过 / 21 skip，含 2 个创建表单回归）+ `eslint`（2 .ts + loan spec 全 exit 0）。

**Tier D 批次 2 备注（markdown-editor CVA-string-value signal 化 + document-header no-op）**：
- 1 个 CVA signal 化：`markdown-editor`（reusable Monaco 编辑器，CVA + `NG_VALIDATORS`）。CVA 值是字符串 `content`（非数组，扩展批次 1 的数组模式到 string 值）：`@Input() editorID`（保留 plain）、`@ViewChild('previewElement', {static:true})`（保留装饰器）、`content`（signal 化）、`readOnly`/`uploadAPI`/`katexOptions`（保留 plain）、`editor: editor.ICodeEditor | null`（Monaco 实例，plain）、`value` getter/setter（JS 属性，保留，内部改用 `content` signal）。
- **`content` signal 化要点**：(1) `value` getter 里 `this.content = this.editor.getValue()` -> `this.content.set(...)`，`return this.content || ''` -> `this.content()`；(2) `value` setter 里 `this.content = value` -> `.set(value)`，`this.editor.setValue(this.content)` -> `this.editor.setValue(this.content())`；(3) `onEditorInit` 里 `if (this.content)` -> `if (this.content())`、`setValue(this.content)` -> `setValue(this.content())`；(4) Monaco `onDidChangeModelContent` 回调里 `this.content = this.editor.getValue()` -> `this.content.set(...)`。HTML `[data]="content"` -> `[data]="content()"`。
- **`detectChanges()` 保留（关键安全决策）**：Monaco 回调在 Angular zone **外**运行（Monaco 非 zone-aware）。原代码 `this.content = ...; this.changeDetect.detectChanges();` 用 `detectChanges()` 强制 CD 更新预览。signal 化后 `this.content.set(...)` 会让模板 `[data]="content()"` 标脏，但 zone 外的 signal 通知是否触发 CD 在 zone 模式下未经验证（文档风险 #4：Monaco+zoneless 须验证）。故**保留 `detectChanges()` 作为双保险**（`content.set()` + `detectChanges()` 并存，无害--`detectChanges` 同步读 `content()` 取新值）。移除 `detectChanges()` 延后到 Phase 8 zoneless 时经回归验证再做。
- **`value` getter 带 side-effect（signal 写）安全**：`value` getter 里 `this.content.set(this.editor.getValue())` 是 getter 内 signal 写。`value` getter 仅被 `onChange`（`@HostListener('change')` DOM 事件，非 CD 期间）+ Monaco 回调（zone 外，后跟 `detectChanges`）调用，**不被模板绑定**（模板绑 `content` 非 `value`）。故 getter 内 signal 写不会在 CD 期间触发 NG0100/循环。
- **`ngOnDestroy` 保留**：markdown-editor 的 `ngOnDestroy` 是 Monaco `listenerDisposables` 清理（`onDidChangeModelContent`/`onDidScrollChange` 的 dispose），**非** `_destroyed$` ReplaySubject。无 `_destroyed$`、无 RxJS subscribe（`beforeUpload` 返回 Observable 但不订阅）。故保留 `OnDestroy` + `ngOnDestroy`，不引入 `DestroyRef`。
- **`document-header` no-op（风险 #3 实证）**：FormGroup-only CVA（无 async/无值数组，`value` 读 `headerForm` 字段）。7 个 `@Input` 带 setter 副作用（`currentUIMode` setter 调 `setDisabledState`、`docType`/`baseCurrency` setter 调 `headerForm.setValue`）。其 spec **重度直接赋值** `component.docType = ...`/`component.arCurrencies = ...`/`component.arDocTypes = ...`/`component.currentUIMode = ...`/`component.baseCurrency = ...`（538 行 spec，~15 处）。转 `input()` 会：(a) 破坏所有 `componentInstance.X =` 赋值（signal input 只读，须改 `fixture.componentRef.setInput()`，~15 处）；(b) setter 副作用须迁到 `effect()`（`currentUIMode`->`setDisabledState`、`docType`/`baseCurrency`->form.setValue）。churn 大、风险高、收益低（zone 模式下 plain @Input 可用）。**no-op，不改**，记录风险 #3 实证。@Input->input() 转换延后（独立风险子项，可与 zoneless Phase 8 一起评估）。
- **spec 零改动**：markdown-editor spec 仅访问 `testingComponent.editorComponent.value`（getter/setter，保留）+ `formGrp.get('infoControl')?.value`（form control），不直接访问 `content`/`readOnly`。故 signal 化 `content` 无需改 spec。document-header spec 零改动（组件未改）。
- 验证：`ng build`（exit 0）+ `ng test`（1 文件 / 3 通过 / 1 skip）+ `eslint`（markdown-editor .ts exit 0）。markdown-editor 消费者仅 `blog/post-detail`（Blog 已停用，不可达）+ `reusable-components.module`（re-export），故无活跃消费者回归风险。

**Tier D 批次 3 备注（document-items CVA-list-value signal 化，最复杂 CVA）**：
- 1 个 CVA signal 化：`document-items`（Finance 文档明细子表 CVA + `NG_VALIDATORS`）。**纯列表 CVA**：无 FormGroup、无 `_destroyed$`、无 async、无 `OnDestroy`。CVA 值是数组 `listItems: DocumentItem[]`（同批次 1 的 `listTmpDocs` 模式，但更复杂：行内 `[(ngModel)]` 就地 mutate 元素）。10 个 `@Input` getter/setter（`arUIAccounts`/`arCurrencies`/`arControlCenters`/`arTranType`/`arUIOrders` 引用数据 + `currentUIMode`[setter 副作用调 `setDisabledState`] + `tranCurr`/`tranCurr2`/`docType`/`docDate`）。
- **`listItems` signal 化**：`writeValue`->`.set(val)`；`onCreateDocItem`/`onCopyCurrentItem`->`.update(arr => [...arr, di])`（原已不可变 `[...this.listItems, di]`）；`onDeleteDocItem`->`.set(exitems)`（原 `slice()+splice()+赋值`）；`value`/`documentItems` getter->`this.listItems()`；`validate()` 的 `.length`/`.findIndex`(×6)->`this.listItems().length`/`.findIndex`。`getFinanceNextItemID(this.listItems)`->`()`. HTML `[nzData]="listItems"`->`listItems()`。
- **保持 plain**：10 个 `@Input`（**不转 `input()`**，规避 spec `component.X =` 直接赋值破坏 + `currentUIMode` setter 副作用须 `effect()` 的风险）；`controlError` getter（调 `validate()`->读 `listItems()`，zone 模式 getter 每次 CD 重算，**不转 `computed`**--同批次 1 `account-extra-loan.controlError` 决策；`validate` 读 `listItems()` 是 signal，但 `computed` 在此无额外收益且 spec 直接访问 `controlError` getter）；`@HostListener`/`_onChange`/`_isChangable`；引用数据 `@Input` 的模板 `@for`（`arUIAccounts` 等，plain）。无 `DestroyRef`（无 async）。
- **就地 mutate 元素 + signal 共存（关键）**：模板 `@for (data of basicTable.data; ...)` 行内 `[(ngModel)]="data.AccountId"` 等**就地 mutate** DocumentItem 元素属性。signal `listItems` 仅在结构变更（`.set()`/`.update()` 增删行）时通知；元素属性 mutate 由 `[(ngModel)]` 直接处理 + `onChange()`（`@HostListener('change')`/`(ngModelChange)`）传播 `_onChange(this.documentItems)`。signal 化不改变此行为（数组引用稳定时 signal 不触发，ngModel 更新特定 DOM 控件）。`@for` 读 `basicTable.data`（nz-table 的 `[nzData]` 投影），非直接读 signal。
- **spec 改动（机械，3 模式）**：document-items spec **预存全 `it.skip`**（12 个 `it.skip`，0 个 `it(`）--预存状态，非本批引入。本批仍机械更新跳过测试体内的 `component.listItems` 用法以保编译正确：(1) 写 `component.listItems = [ditem]`->`component.listItems.set([ditem])`（8 处）；(2) 读 `component.listItems[0]`->`component.listItems()[0]`（15 处）；(3) 读 `component.listItems.length`->`component.listItems().length`（2 处）。`@Input` 直接赋值（`component.arControlCenters = ...`等）**不动**（保持 plain）。用 perl 3 步顺序替换（先写、再 `[`、再 `.length`，规避互相破坏）。
- **回归验证（关键，因 spec 全 skip）**：document-items 无活跃自测，故靠**消费者 spec** 端到端验证 CVA：`document-normal-create`/`document-asset-buy-create`/`document-asset-sold-create`（3 个已迁创建表单，`@Component.imports` 渲染 document-items CVA）+ `document-detail`（未迁父，也用该 CVA）。4 文件全通过（54 测试通过 / 9 skip）。证明 signal 化 `listItems` 不破坏 CVA 的 `writeValue`/`_onChange`/`validate` + `@Input` 交互。
- 验证：`ng build`（exit 0）+ `ng test`（4 文件消费者回归 / 54 通过 / 21 skip 含 document-items 12 skip）+ `eslint`（.ts + spec 全 exit 0）。

**Tier D 批次 4 备注（account-detail 重型父组件，首例 @ViewChild 父子 signal 协作）**：
- 1 个重型父组件：`account-detail`（Finance 账户详情，5 FormGroup：`headerFormGroup`/`amountFormGroup`/`extraADPFormGroup`/`extraAssetFormGroup`/`extraLoanFormGroup`；3 `@ViewChild` 取已迁的 `account-extra-{downpayment,loan,asset}` 子 CVA；嵌套 `activateRoute.url` + 2 forkJoin + 多个 create/update subscribe）。经路由 `/finance/account/{create|edit|display}/:id` 进入，有 spec（7 测试）。复用批次 4 detail-form 模式。
- **signal 化**：`uiMode`/`routerID`/`currentMode`/`isLoadingResults` + 异步引用数组（`arAccountCategories`/`arAssetCategories`/`arTranTypes` + 私有 `_arControlCenters`/`_arUIOrders` 经 getter 暴露）。`DestroyRef`+`takeUntilDestroyed` 取代 `_destroyed$`（外层 route subscribe + Update/Display forkJoin + ADP/Loan 子 forkJoin + Create forkJoin + createAccount/createDocument/changeAccountByPatch subscribe，共 8 处 `takeUntil(this._destroyed$!)` -> `takeUntilDestroyed`）。删 `OnDestroy`。
- **getter 读 signal（关键模式）**：`_arControlCenters`/`_arUIOrders` 是**私有 signal + 公有 getter**（`get arControlCenters() { return this._arControlCenters(); }`）。模板 `@for (tt of arControlCenters; ...)` 调 getter（**不加 `()`**），getter 内读 signal--模板表达式是 reactive context，getter 调用期间读 signal 会注册依赖，signal 变则视图重算。此模式同 `isFieldChangable`/`isCreateMode`/`isCategoryDisabled`/`canEnterInitialAmount`/`isSaveEnabled`（皆 getter 读 `uiMode()` + plain form）。**form-bridge 非必需**（zone 模式，`isSaveEnabled` 读 `headerFormGroup.valid`/`amountFormGroup.valid`，同批次 4）。
- **保持 plain**：5 FormGroup；`arStatusDisplayStrings`/`arMembers`（静态 ctor）；`isInitAmountRequired`（`[(ngModel)]` 两路 + `@if` 标志）；`tranAmount`/`controlCenterID`/`orderID`/`arUIAccount`/`tranType`（声明未在 .ts 赋值，传子组件/可能 dead）；3 `@ViewChild`（**保留装饰器**，不转 `viewChild()`）；读 form 的 getter（`currentCategory`/`isAssetAccount`/`isADPAccount`/`isLoanAccount`）。
- **@ViewChild 父子 signal 协作（验证关键）**：`account-detail` 用 `@ViewChild('extraADP', {static:false}) compExtraADP?: AccountExtraDownpaymentComponent` 等取已 signal 化的子 CVA（批次 1）。**保留 `@ViewChild` 装饰器**--父仍取组件实例，子内部 `listTmpDocs` signal 化不影响父查询/方法调用（子 `.value` getter 读 `listTmpDocs()` 仍工作）。**父子独立迁、无须同迁**（文档原说"须同迁"仅针对 `viewChild()` signal query 转换，本批保留装饰器故解耦，同批次 1/2/3 决策）。`compExtraADP`/`compExtraLoan`/`compExtraAsset` 在 .ts 中声明但未在方法里调用（可能 legacy/预留），保留不动。
- **spec 零改动**：account-detail spec 仅访问 `component.isFieldChangable`/`component.isCreateMode`（plain getter，读 `uiMode()` 内部，spec 不改）。不直接访问 `uiMode`/`routerID`/`currentMode`/`isLoadingResults`/引用数组/`@ViewChild`。**回归验证**：额外跑 3 个 account-extra CVA spec（子组件，`account-detail` `@Component.imports` 渲染它们），确认父 signal 化 + 子 CVA 协作无破坏--全通过。
- **perl 清理 stale eslint 注释**：`takeUntil(this._destroyed$!)` 上方的 `// eslint-disable-next-line @typescript-eslint/no-non-null-assertion`（ suppress `!`）在替换为 `takeUntilDestroyed` 后变 stale，用 `perl -ne 'print unless /^\s*\/\/ eslint-disable-next-line \@typescript-eslint\/no-non-null-assertion/'` 删除（CRLF 故用前缀匹配，非 `$` 锚定）。
- 验证：`ng build`（exit 0）+ `ng test`（4 文件 / 29 通过 / 6 skip，含 3 子 CVA 回归）+ `eslint --fix`（Edit 引入 156 个 prettier 缩进错自动修复后 exit 0）+ 修复后重跑 spec 7 通过。

**Tier D 批次 5 备注（document-detail 重型父组件，最后一个 Tier D，form-control 子 CVA 协作）**：
- 1 个重型父组件：`document-detail`（Finance 文档详情/创建/编辑，1 个 `docFormGroup`：`idControl`/`headerControl`/`itemsControl`，后两者分别用 `formControlName` 绑已迁的 `document-header`/`document-items` 子 CVA；无 `@ViewChild`--子 CVA 经 form control 而非 query 取；嵌套 `activateRoute.url` + 8 流 forkJoin + 条件嵌套 readAccount forkJoin + `onSetData`/`onSave`/`onChangeToEditMode` 共 6 处 subscribe）。经路由 `/finance/document/{create|edit|display}/:id` 进入，有 spec（2 测试）。复用批次 4 detail-form 模式 + 批次 1 form-control CVA 协作。
- **signal 化**：`uiMode`/`routerID`/`currentMode`/`isLoadingResults` + 7 个异步引用数组（`arCurrencies`/`arDocTypes`/`arTranType`/`arAccountCategories`/`arUIAccounts`/`arControlCenters`/`arUIOrders`）。`DestroyRef`+`takeUntilDestroyed(this.destroyedRef)` 取代 6 处 `takeUntil(this._destroyed$!)`，删 `OnDestroy`。**全部引用数组作值绑定 `[arXxx]="arXxx()"`（非 `@for`），故全用 public signal、无须 getter**（对比批次 4 account-detail 的 `_arControlCenters`/`_arUIOrders` 因 `@for` 用而走私有 signal+getter）。
- **timer 清理用 `destroyedRef.onDestroy`（新，批次 4 无）**：document-detail 有 `_modalCloseTimer`/`_modeSwitchTimer`（`onSetData`/`onChangeToEditMode`/`onSave` 里 `setTimeout`）。删 `ngOnDestroy` 后，在 constructor 注册 `this.destroyedRef.onDestroy(() => { clearTimeout(...); clearTimeout(...); })` 替代。批次 4 account-detail 无 timer 故直接删 `OnDestroy`；本批是"有 timer 的重型父"处理范式。
- **`currentDocument` 保持 plain（关键决策）**：`Document` 领域对象，forkJoin next 里**整对象重赋值**（`this.currentDocument = rsts[7]`），无就地属性 mutate；模板 `[docType]="currentDocument.DocType"`/`[docDate]="currentDocument.TranDate"` + `onSetData`/`onSave` 读 `.Id`/`.HID`/`.Items`/`.DocType`。zone 模式下整对象重赋值（in-zone subscribe）触发 CD，模板绑定重算；且 `.DocType`/`.TranDate` 喂给子 CVA 的 plain `@Input`，无须 signal。signal 化须改 ~10 处读为 `()` 且无收益（非细粒度 mutate），故保持 plain。同 `baseCurrency`（ctor 一次赋值）。
- **form-control 子 CVA 协作（对比批次 4 的 @ViewChild）**：`document-detail` 不用 `@ViewChild`，而是经 `docFormGroup` 的 `headerControl`/`itemsControl`（`formControlName`）绑 `document-header`/`document-items` 子 CVA。`onSetData` 的 `docFormGroup.get('headerControl')?.setValue(this.currentDocument)` 触发子 CVA `writeValue`（子内部 `listItems.set()`/Document header 处理）。父 signal 化的引用数组经 `[arXxx]="arXxx()"` 喂给子 CVA 的 plain `@Input`。**父子独立迁、无须同迁**（同批次 4 解耦结论，且本批连 `@ViewChild` 都没有，解耦更彻底）。
- **`isFieldChangable` getter 保持 plain**：读 `uiMode()`（同批次 4），模板 `[disabled]="isFieldChangable"`/`[disabled]="!isFieldChangable || !docFormGroup.valid"` 不改 `()`，spec 不改。**form-bridge 非必需**（zone 模式）。
- **`listNIDs.push(acntid!)` 的 eslint-disable 注释保留**：该 `!` 是真实非空断言（非 `_destroyed$!` 的 stale 注释），故 `// eslint-disable-next-line @typescript-eslint/no-non-null-assertion` 保留；仅 6 处 `takeUntil(this._destroyed$!)` 上方的 stale 注释随 `takeUntilDestroyed` 替换删除（手写新文件时直接未写）。
- **spec 零改动**：document-detail spec 仅 `expect(component).toBeTruthy()` + 路由 stub detectChanges（edit 模式走完 forkJoin -> readDocument -> onSetData -> form setValue -> 子 CVA writeValue 全链路），不直接访问 signalized 字段。**回归验证**：跑 5 文件（document-detail + document-items + document-header + 2 个 document-items 消费者 document-normal-create/document-asset-buy-create），54 通过 / 19 skip（document-items 全 `it.skip` 预存），全绿。证明 form-control 父子 CVA signal 协作（父引用数组 signal -> 子 plain @Input + 子 writeValue signal）端到端无破坏。
- 验证：`ng build`（exit 0）+ `ng test`（5 文件 / 54 通过 / 19 skip）+ `eslint --fix`（Write 引入 113 个 prettier 缩进错自动修复后 exit 0）+ 修复后重跑 spec 2 通过。

**Tier F 批次 1 备注（app.component 根组件，路线 a：服务保 BehaviorSubject、消费端 toSignal）**：
- 1 个根组件：`app.component`（root selector `hih-root`）。原状：`ngOnInit` 里 `authContent.subscribe` + `NgZone.run` 更新 `isLoggedIn`/`titleLogin`；`curHomeSelected.subscribe` 更新 `selectedHomeName`；`checkDBVersion.subscribe` 写 `uiService.versionResult`；`_destroyed$`/`OnDestroy`。
- **signal 化（toSignal + computed，路线 a）**：`authContentSig = toSignal(this._authService.authContent, { initialValue: new UserAuthInfo() })` -> `isLoggedIn = computed(() => this.authContentSig().isAuthorized)`、`titleLogin = computed(() => this.authContentSig().getUserName())`；`curHomeSelectedSig = toSignal(this._homeService.curHomeSelected, { initialValue: this._homeService.ChosedHome })`（同 home-def-list 约定）-> `selectedHomeName = computed(() => this.curHomeSelectedSig()?.Name ?? null)`。删 `NgZone`/`OnDestroy`/`_destroyed$`；`checkDBVersion` 的 `takeUntil(this._destroyed$)` -> `takeUntilDestroyed(this.destroyedRef)`。
- **initialValue 用 `new UserAuthInfo()` 而非 `authSubject.value`（关键坑）**：`authContent` 是 `authSubject.asObservable()`（`BehaviorSubject<UserAuthInfo>`，默认 `new UserAuthInfo()` isAuthorized=false）。app.component spec 的 `authServiceStub` 是 `Partial<AuthService>` 只设 `authContent = new BehaviorSubject(authinfo)`，**不设 `authSubject`**。若 initialValue 用 `this._authService.authSubject.value`，spec 在 field-init 阶段 `authSubject` 为 undefined 会崩。故用 `new UserAuthInfo()`（与真实初始态一致，spec 安全）。`curHomeSelected` 的 `ChosedHome` getter 则安全（spec 用真实 `HomeDefOdataService` providedIn-root）。
- **删 `NgZone` 安全性（关键风险，已分析）**：原 `authContent` subscribe 用 `NgZone.run` 包裹，因 OIDC（`angular-auth-oidc-client`）回调在 Angular zone 外发射、plain 字段赋值不触发 CD。改 `toSignal` 后，`authSubject.next()`（即便 zone 外）-> toSignal 回调 `sig.set()` -> signal 写经 reactive graph 主动通知 `ChangeDetectionScheduler`（zone 模式下 `provideZoneChangeDetection` 内建 signal 调度）排 microtask 跑 `appRef.tick()`，**不依赖 zone 事件**。故 plain 字段需 NgZone.run、signal 不需要。前序批次 `toSignal(curHomeMember)` 已验证此模式。**手动验证项**：OIDC 登录/登出后 header UI（login 按钮/用户名/家名）是否实时更新（spec 用同步 BehaviorSubject stub 不覆盖 zone 外路径）。
- **字段初始化顺序（关键）**：`toSignal(this._authService.authContent, ...)` 在 field initializer 里读 `this._authService`，故 `authContentSig`/`curHomeSelectedSig` 字段必须声明在 `_authService = inject(...)`/`_homeService = inject(...)` **之后**（field initializer 自上而下执行）。`computed` 字段（`isLoggedIn` 等）懒求值，可在 source signal 之后即可。
- **`checkDBVersion` guard 保持 `this._authService.authSubject?.getValue()?.isAuthorized` 不改 signal 读**：spec stub 无 `authSubject`，optional chaining 使 guard 为 falsy 跳过块（原行为）；若改读 `authContentSig().isAuthorized`（spec 中为 true）会触发 checkDBVersion HTTP 调用，破坏 spec。此 guard 是一次性同步读，无须反应性。
- **保持 plain**：`isCollapsed`（`[(nzCollapsed)]` 两路 + `(click)="isCollapsed = !isCollapsed"` 命令式写，安全阀）、`currentYear`（ctor 常量）、`searchContent`/`userDisplayAs`（死字段，搜索框注释掉/从未赋值）。`uiService.versionResult = val` 保持 plain setter 调用（见下）。
- **`UIStatusService.versionResult` defer（不动）**：原 plain getter/setter（`_versionInfo: CheckVersionResult | null`），仅 3 处引用（app.component 写、about.component 构造函数一次性拷到 `resultVersion`、about.spec 写）。signal 化须改 about.component 读才有反应性收益，但 about 是 Tier A no-op（静态），故 defer 至 about 迁移时统一处理。app.component 的 `this.uiService.versionResult = val` 保持 plain。
- **HTML**：`@if (!isLoggedIn)`/`@if (isLoggedIn)`/`{{ titleLogin }}`/`@if (!selectedHomeName)`/`@if (selectedHomeName)`/`{{ selectedHomeName }}` -> 加 `()`（6 处）；`isCollapsed`/`currentYear` plain 不动。**perl 坑（重要）**：perl `s///` 替换串里 `@if` 被 Perl 当数组插值吞掉（4 处 `@if` 前缀消失致 NG5002 EOF/未闭合 `{`）。修复用 Edit 逐行恢复 `@if `。**教训**：perl 替换串含 `@` 须用 `\x40` 或单引号，不可裸 `@`。
- **spec 改 1 行**：`expect(component.isLoggedIn).toBeTruthy()` -> `expect(component.isLoggedIn()).toBeTruthy()`（computed signal 须调 `()`；否则 Signal 对象恒 truthy，假阳性）。
- 验证：`ng build`（exit 0）+ `ng test`（1 文件 / 5 通过）+ `eslint`（exit 0，Write 干净无 prettier 错）。

**Tier F 批次 2 备注（HomeDefOdataService 路线 b：服务内部 BehaviorSubject -> signal，~24 文件原子改造）**：
- **服务**：`home-def-odata.service.ts` 的 `curHomeSelected`/`curHomeMember` 由 `BehaviorSubject<...|null>` -> `signal<...|null>(null)`。`ChosedHome`/`CurrentMemberInChosedHome` getter/setter 内部 `.value`->`()`、`.next()`->`.set()`（签名不变，所有用 getter 的消费端零改动）。删 `BehaviorSubject` import，加 `signal`。
- **3 个缓存服务 `subscribe` -> `effect`（语义变更，关键）**：`event-storage`/`finance-odata`/`library-storage` 原先 `curHomeSelected?.subscribe(() => resetCaches())`（BehaviorSubject 同步发当前值，缓存失效）。改 `effect(() => { if (this._homeService.curHomeSelected?.() !== undefined) resetCaches(); })`。**guard `!== undefined`（关键修复）**：`effect` 创建时总跑一次（即便 mock 缺 curHomeSelected），无 guard 会在 spec 中误调 `resetCaches()` 清空缓存（finance-odata spec:1938 缓冲测试失败：期望 0 次 API 调用实际 1 次）。guard 区分"真实 signal（HomeDef|null，永非 undefined）-> 失效"与"mock 缺失（undefined）-> 跳过"，匹配原 `?.subscribe` 在 mock 缺失时的 no-op 语义。**sync->async 位移**：`subscribe` 同步触发 vs `effect` scheduled flush（home 切换后导航/CD 前已 flush，实际无 stale 窗口；手动验证项）。
- **9 组件 `toSignal(curHome...)` -> `computed(() => homeService.curHome...())`**：app.component（`curHomeSelectedSig`->直接读）、home-def-list（currentHome+currentMember）、control-center-list/hierarchy、document-item-search、account-list/hierarchy、document-list、plan-list、order-list。`toSignal` of a signal 无效，故改 `computed` 直接读 signal（signal 恒有值，无须 `initialValue`）。4 个有 stale 注释（"still exposes curHomeMember as a BehaviorSubject"）的组件更新注释为 "route (b)"。8 组件删 `toSignal` import（保留 `takeUntilDestroyed`；document-item-search 整行删 `import { toSignal }`，无 takeUntilDestroyed）。
- **9 spec `new BehaviorSubject` -> `signal`**：8 个 spec 的 `curHomeMember: new BehaviorSubject<...>(...)`（mock 对象字面量）-> `curHomeMember: signal<...>(...)`；home-def-list spec 的 `curHomeSelected`/`curHomeMember` 字段赋值式 -> `signal(...)`。各加 `import { signal } from '@angular/core'`，`BehaviorSubject` 保留（仍用于 `authServiceStub.authSubject`，AuthService 未动）。spec 的 `homeService` 是 `createSpyObj`/plain 对象，赋 signal 后组件 `curHomeMember()` 调用返回值正确。
- **3 服务 spec 无需改**：`finance-odata`/`library-storage` spec 的 homeService mock 无 `curHomeSelected`（`?.()` guard 跳过），`event-storage` spec 用 `createSpyObj`（curHomeSelected undefined，同跳过）。`home-def-odata.service.spec` 用真实服务实例 + `ChosedHome` setter（->`.set()`），无直接 curHomeSelected 访问。
- **field 初始化顺序**：`toSignal(this._authService.authContent)` 在 app.component 仍保留（AuthService 未动，route a）；仅 `curHomeSelectedSig` 改直接读。
- **验证**：`ng build`（exit 0）+ 14 文件 258 测试通过（9 组件 + 3 服务 + app.component + home-def-odata.service + home-chose-guard + account-detail + document-normal-create）+ `eslint`（exit 0）。
- **预存失败（非 route b 回归，记录）**：4 个未触及的报表 spec（tran-type/account/order/control-center-report）的 "should show data after OnInit" 测试失败（`reportData.length===0`）。报表组件未触及（仅读 `ChosedHome?.BaseCurrency`，不用 curHomeSelected），spec 全 stub HomeDefOdataService（plain 对象）+ FinanceOdataService（createSpyObj），真实服务从未注入 -> route b 改动与之无关。批次 3 报表验证仅 build+lint（未跑 spec），故此失败为预存（spec 自身 async 时序/setup 问题），独立于 signals 迁移。
- **剩余 Tier F**：可选 Phase 8（zoneless）。`UIStatusService.versionResult` 已于批次 4 完成；AuthService 路线 b 已于批次 3 完成。**所有服务内部 signal 化完成**。

**Tier F 批次 3 备注（AuthService 路线 b：服务内部 BehaviorSubject -> signal，项目级消费端，~130 文件原子改造）**：
- **服务核心 `auth.service.ts`**：`authSubject: BehaviorSubject<UserAuthInfo>` -> `authSubject = signal<UserAuthInfo>(new UserAuthInfo(), { equal: () => false })`。**`{ equal: () => false }` 是关键安全网**：`checkAuth()`/`doLogout()` 读当前 `UserAuthInfo`、原地 mutate（`setContent`/`cleanContent`）、再 `.set(同一引用)`。`BehaviorSubject.next` 恒通知，但 `signal.set(同引用)` 默认按引用相等**跳过**通知 -> 反应式消费端（computed/effect/toObservable）不会 fire。`equal:()=>false` 强制每次 `.set` 都通知，精确匹配 BehaviorSubject 语义，**mutate-in-place 代码原样保留**（仅 `.value`->`()`、`.next(x)`->`.set(x)`）。删 `BehaviorSubject`/`Observable` import，加 `signal`。
- **删 `authContent` Observable**：原 `authContent = authSubject.asObservable()`。route b 后 `authSubject` 本身即 signal，`authContent` 多余。3 个 `authContent` 消费端改造：(1) `app.component` 的 `authContentSig = toSignal(authContent, {initialValue})` -> 直接 `authContentSig = this._authService.authSubject`（已是 signal，无须 `toSignal`/`initialValue`；删 `toSignal` import 与 `UserAuthInfo` import）；(2)(3) `user-detail`×2 与 `signin-callback` 的 `authContent.subscribe(...)` -> `toObservable(authSubject)` field + subscribe。
- **`toObservable` 必须在注入上下文（field initializer）调用，不能在 `ngOnInit`**：`user-detail`×2 / `signin-callback` 原在 `ngOnInit` 里 `authContent.pipe(...).subscribe`。`toObservable` 内部用 `effect()`，需注入上下文；`ngOnInit` 无注入上下文 -> 抛 NG0203。故改 `private readonly authContent$ = toObservable(this.authService.authSubject);`（field initializer，注入上下文），`ngOnInit` 里 `this.authContent$.pipe(...).subscribe(...)`。RxJS pipeline（`filter`/`take(1)`/`timeout`/`takeUntilDestroyed`）原样保留。
- **`blog-odata.service` 的 `authSubject.subscribe` -> `effect`**（与批次 2 缓存服务同模式）：`effect(() => { const info = this.authService.authSubject(); if (!info.isAuthorized) { resetCaches(); } })`。authSubject 恒有值（非 undefined），无须批次 2 的 `!== undefined` guard。constructor 内调用 `effect`（注入上下文）。
- **~150 处同步 token 读 `.getValue()/.value` -> `()`**：blog-odata/event-storage/finance-storage/finance-odata/home-def-odata/library-storage/tags/markdown-editor/auth.interceptor/auth-guard/auth-check/home-def-detail/home-def-list/document-loan-create。perl 批量 `s/authSubject\.getValue\(\)/authSubject()/g`（含 1 处 perl 漏的 `document-loan-create:370`，后补 Edit）+ `home-def-list:73` 的 `.value`->`()`。这些是一次性同步读（HTTP 请求构造时取 token/userId），无须反应性。
- **app.component `checkDBVersion` guard 必须改 `.getValue()`->`()`**：原 guard `this._authService.authSubject?.getValue()?.isAuthorized`（批次 1 故意保留以在 spec stub 无 authSubject 时短路跳过 checkDBVersion）。**signal 无 `.getValue`**，`authSubject?.getValue()` 在真实 signal 上会抛 TypeError（`?.` 仅对 null/undefined 短路，不防属性缺失）。故改 `authSubject?.()?.isAuthorized`。副作用：spec 现须设 `authSubject = signal(authinfo)`（authorized）-> guard 真 -> 触发 checkDBVersion HTTP POST（pending 于 HttpTestingController，spec 无 `verify()`，不破坏测试，已验证 app.component.spec 通过）。
- **113 spec 批量（Node 脚本 `migrate-auth-specs.mjs`）**：`authServiceStub.authSubject = new BehaviorSubject(X)` -> `signal(X)`（仅替换含 `authSubject` 的行，不碰其他 BehaviorSubject stub）；若 `BehaviorSubject` 在代码中不再使用则从 import 移除（处理 `{BehaviorSubject}`/`{BehaviorSubject, of}`/`rxjs/internal/BehaviorSubject` 三种 import 形态，alone 则删整行）；若 `signal` 未从 `@angular/core` 导入则加（已有则跳过，9 个 route-b spec 不重复）。脚本扫描 109 个 auth-subject spec 全改 + 4 特殊 spec 手改 = 113 spec。**行尾问题**：Node `fs.writeFileSync` 插入的 `signal` import 行用 LF，项目用 CRLF -> `prettier/prettier: Insert ␍`。`eslint --fix`（分批 `xargs -n 12`，单批过大触发"命令行太长"）统一 CRLF，113 spec 全 lint-clean。
- **4 特殊 spec 手改**：(1) `app.component.spec`：`authContent = new BehaviorSubject(authinfo)` -> `authSubject = signal(authinfo)`；(2) `auth-guard.service.spec`：shared `const authSubject = signal(...)` + `.next`->`.set`（2 处）；(3) `auth.interceptor.spec`：`const authSubject = signal(...)` + `(authSubject as BehaviorSubject<...>).next` -> `(as WritableSignal<...>).set`（2 处，加 `WritableSignal` import）；(4) `user-detail.component.spec`：`signal(...)` + 删 `authContent = authSubject.asObservable()` 行 + `.next`->`.set`（`WritableSignal` cast）。全 113 spec 转换后**零 spec 仍 import `BehaviorSubject`**。
- **OIDC out-of-zone 回调安全**：`checkAuth()` 的 OIDC subscribe 回调（可能 out-of-zone）调 `authSubject.set()`。zone 模式下 signal 写通过 reactive graph 的 `ChangeDetectionScheduler` 调度 `appRef.tick()`（microtask），**独立于 zone.js 事件** -> CD 照常触发（与批次 1 删 NgZone 同理）。signal 写比 plain 赋值更可靠地触发 CD。
- **验证**：`ng build`（exit 0）+ 全量 `ng test`（155 文件：1091 通过 / 6 失败 / 54 skip；6 失败全为预存报表 spec，见下）+ `eslint`（源 + 特殊 spec + 113 转 spec 全 exit 0）。
- **预存失败（非 route b 回归，与批次 2 同）**：6 个报表 spec 失败（tran-type/account/order/control-center-report 的 "after OnInit" + account-month-on-month 的 "after OnInit"/"after period changed"，均 `reportData.length===0`）。报表组件仅读 `ChosedHome?.BaseCurrency`，spec 全 stub HomeDefOdataService + FinanceOdataService（createSpyObj），真实服务从未注入；authSubject 转 signal 对这些 spec 行为中性（stub 的 `signal(new UserAuthInfo())` 与原 `new BehaviorSubject(new UserAuthInfo())` 等价，无反应性订阅）。批次 2 记录 4 个，本次全量跑出 6 个（含 account-month-on-month，批次 2 未全量跑故未计入）--均预存，独立于 signals 迁移。

**Tier F 批次 4 备注（UIStatusService.versionResult + about.component，最后一个 defer 项，3 文件小批次）**：
- **服务 `uistatus.service.ts`**：`_versionInfo: CheckVersionResult | null = null` -> `_versionInfo = signal<CheckVersionResult | null>(null)`；`versionResult` getter `return this._versionInfo()`、setter `this._versionInfo.set(rst)`。**getter/setter 签名不变** -> `app.component` 的 `this.uiService.versionResult = val`（setter 调用 -> `.set(val)`）与 `about.component.spec` 的 `uisrv.versionResult = {...}`（真实服务的 setter）零改动。**无须 `{equal:()=>false}`**：与 `authSubject` 不同，`versionResult` 每次 `.set` 新对象（checkDBVersion 返回新 `CheckVersionResult`），非 mutate-in-place + 同引用，默认引用相等即可触发通知。
- **`about.component`（Tier A no-op -> signal 化）**：原 `resultVersion: CheckVersionResult | null = null` + ctor 一次性拷贝 `this.resultVersion = this.uiStatus.versionResult`。改 `readonly resultVersion = computed(() => this.uiStatus.versionResult)`，删 ctor 拷贝。**字段顺序**：`uiStatus = inject(...)` 须在 `resultVersion = computed(...)` 之前（computed 回调懒求值，但保持 inject-先于-computed 惯例）。删未用 `CheckVersionResult` import，加 `computed`。**反应性提升**：原一次性拷贝在 ctor 后不更新；computed 现反应式跟踪 signal（若 about 在 checkDBVersion 完成前被访问，versionResult 后续设置时 computed 自动更新--实际 checkDBVersion 在 app 启动时跑，about 是后续导航，故原一次性拷贝也能工作，computed 是更稳健的等价）。
- **模板 `about.component.html`**：`{{ resultVersion!.APIVersion }}` / `{{ resultVersion!.StorageVersion }}` -> `{{ resultVersion()!.APIVersion }}` / `{{ resultVersion()!.StorageVersion }}`（2 处，computed 须 `()` 调用；保留 `!` 非空断言匹配原行为）。
- **消费端范围确认（小）**：`versionResult` 仅 3 处引用 -- `app.component`（write）、`about.component`（read+模板）、`about.spec`（write）。无其他组件读 `versionResult`。`fatalError`/`latestError` 不在本次范围：`fatalError` 被 guard 同步读（`checkAuthentication`，无须反应性）；`latestError` 被 `fatal-error.component` 一次性拷贝（终态错误页，无须反应性）。signal 化二者无收益，保持 plain。
- **spec 无改动**：`about.spec` 提供真实 `UIStatusService`（`providers: [UIStatusService]`），`uisrv.versionResult = {...}` 走 setter（->`.set`）；spec 只断言 `#curversion`（UI `version`，非 `resultVersion`），故 resultVersion signal 化不影响断言。`uistatus.service.spec` 测 `latestError`/`SelectedLoanTmp`/`CurrentLanguage`（非 `versionResult`），不受影响。`app.component.spec` 用真实 UIStatusService，checkDBVersion HTTP POST 不 flush 故 `versionResult` 不被写，无读。
- **验证**：`ng build`（exit 0，模板类型检查 `resultVersion()!.X` 通过）+ 3 文件 9 测试通过（about + uistatus + app.component）+ 全量 `ng test`（1091 通过 / 6 预存报表失败 / 54 skip，与批次 3 基线一致，零回归）+ `eslint` exit 0。

**报表 spec 修复备注（更正前期"预存"误判）**：
- **根因（非预存，实为 signals 迁移漏改 spec）**：Tier B 批次 3/4 signal 化了 4 个非 MOM 报表 + 5 个 MOM 报表的组件字段（`dataSet`/`reportIncome`/`reportExpense`/`arReportByAccount`/`arUIAccounts` 等改为 `signal<...[]>([])`），但**未同步更新对应 spec**。spec 仍用 `component.<field>.length` 访问——此时 `<field>` 是 signal 函数，`.length` 取的是**函数形参数（=0）**而非数组长度。故 "after OnInit" 类断言 `toBeGreaterThan(0)` 恒失败（0 ≯ 0），"before OnInit" 类断言 `toEqual(0)` 假通过（0 === 0）。这也解释了为何批次 2/3/4 一直看到"6 失败"而数量稳定。
- **更正**：批次 2/3/4 备注将此 6 个失败记为"预存报表 spec 失败（独立于 signals 迁移）"，系误判——当时只看到"报表组件仅读 `ChosedHome?.BaseCurrency`，与 route b 无关"，忽略了 Tier B 早已 signal 化这些组件字段、spec 漏改 `()` 的事实。佐证：`code-review-remediation-2026-08-02` 记录的迁移前基线本就是 1097/0/54，故这 6 个是迁移引入、非预存。
- **修复（仅改 spec，5 文件 16 处，组件零改动）**：`component.<sigField>.length` -> `component.<sigField>().length`。tran-type 3 处（`reportIncome`×2 + `reportExpense`×1）；account 4 处（`dataSet`×2 + `arReportByAccount`×2）；control-center 3 处（`dataSet`×3）；order 3 处（`dataSet`×3）；account-month-on-month 3 处（`arUIAccounts`×3）。
- **副作用（正向）**：修复后 "before OnInit" 的 `toEqual(0)` 由假通过变为真断言（实际校验初始空数组 length=0），测试质量提升。
- **验证**：5 个报表 spec 12 文件 67 通过 / 1 skip（原 6 失败全修复）+ 全量 `ng test` **1097 通过 / 0 失败 / 54 skip**（= 迁移前基线，零回归）+ `eslint`（5 spec）exit 0。
- **教训**：signal 化组件字段后，凡 spec 直接访问该字段（`.length`/`[i]`/`.find` 等）须同步加 `()`。后续 zoneless（Phase 8）前若再 signal 化 plain 字段，须 grep 其 spec 的裸访问。

**Phase 8 备注（zoneless 切换，2026-08-03）**：
- **配置切换**：`app.config.ts` 的 `provideZoneChangeDetection({ eventCoalescing: true })` -> `provideZonelessChangeDetection()`。源码无 NgZone 残留（迁移已清理）。zone.js 仍保留在 polyfills（过渡性 zoneless，无害；移除为可选未来清理，需先验证 NG-ZORRO/ECharts/Monaco 不依赖 zone 补丁）。
- **关键认知（源码验证）**：Angular 21 TestBed 默认注入 `provideZonelessChangeDetectionInternal()`（`@angular/core/fesm2022/testing.mjs:1024` 的 `compileTestModule` 无条件包含），故 **1097 个测试一直在 zoneless CD 下运行**。翻 appConfig 对测试零影响（测试不 import appConfig）。**测试全绿 ≠ 生产 zoneless 正确**：测试显式 `fixture.detectChanges()` 会掩盖"subscribe 里写 plain 字段"的生产问题。生产正确性靠源码审计 + 人工验证。
- **`markForCheck()` 在 zoneless 触发 CD（源码验证）**：`markForCheck()` -> `markViewDirty()` -> `lView[ENVIRONMENT].changeDetectionScheduler?.notify(source)`（`_debug_node-chunk.mjs:5952`）。zoneless 下 `changeDetectionScheduler` 是 `ChangeDetectionSchedulerImpl`，`notify()` 调度 `appRef.tick()`。故 markForCheck/detectChanges 是有效 zoneless CD 触发器。另：`FormGroup.disable()`/`enable()` 写 `statusReactive` signal（forms 源码验证），同 tick rescue plain 字段（含 finalize）--form 组件多被此 rescue，无需修。
- **审计（4 并行子代理，覆盖全 `src/app/pages/` + `app.component`）**：扫所有 component 的 async 回调（subscribe/setTimeout/Promise/rAF/第三方 Monaco/ECharts）里写模板绑定 plain 字段且无伴随 signal 写/markForCheck/detectChanges 的站点。结果：
  - **18 个活跃路由文件**（必修，已修）：`report.component.ts` / `finance.component.ts`（2 个完全 plain 仪表盘--迁移误判为"路由父组件"而跳过）+ 5 个 MOM 报表 `chartOption`（account/tran-type/control-center/statement/cash-month-on-month）+ `plan-detail`/`order-detail`（submit-state 标志）+ 5 个创建表单（transfer/normal-mass/recurred-mass/asset-value-change/loan-repay）+ `account-hierarchy`/`control-center-hierarchy`（rAF `col` + 余额）+ `reconcile-by-month` + `user-detail`（userName/userMail）。
  - **6 个 disabled Event/Blog 文件**（未路由，推迟）：flat 版 normal-event-list/recur-event-list/recur-event-detail + collection-list/post-detail/post-list。已记入 blog/event shutdown memory（重启用前需同 markForCheck 修复）。
  - **8+ 孤儿重复**（不可达，跳过）：document-item-view/insight 顶层、library 3 selection-dlg、event/blog nested 重复、user-detail nested。
- **修复策略（markForCheck，非 signal 化）**：保持 plain（尊重迁移的"safety valve"决策），注入 `ChangeDetectorRef`，在风险回调末尾加 `markForCheck()`（subscribe）/ `detectChanges()`（rAF，立即同步）。`[nzData]` 原地 push 的 2 处（recurred-mass `listExistingDocItems`、asset-value-change `existingDocItems`）补新引用 `[...arr]` 再 markForCheck（nz-table 按引用检查 @Input）。**零模板/spec 改动**（fields 保持 plain；测试早已 zoneless + 显式 detectChanges）。`report.component.ts` 试点验证（build+lint 通过）后 6 子代理并行铺开 17 文件。
- **验证**：全量 `ng build` exit 0 + 全量 `ng test` 1097/0/54（零回归）+ 全量 `ng lint` exit 0（auto-fix 了 `app.component.html` 4 个遗留 prettier 尾随空格，非 Phase 8 引入）。
- **人工验证项（测试无法覆盖，部署前/后需手测）**：Monaco 编辑器（markdown-editor，输入->预览更新--已有 detectChanges）；ECharts 图表（5 MOM 报表 + report 仪表盘 + account/control-center/order 报表，渲染 + 周期切换更新）；finance 仪表盘（keyfigure + 文档列表）；report 仪表盘（收支列表）；user-detail（userName/userMail）；创建表单（提交 spinner/成功/错误面板）；层级（account/control-center 窗口 resize `col` 更新 + 节点点击余额更新）。
- **教训**：zoneless 前，凡 async 回调写模板绑定 plain 字段必须有 CD 触发（signal 写 / markForCheck / detectChanges / event）。迁移的"safety valve plain 字段"在 zone 模式靠 zone auto-CD，zoneless 须显式补 markForCheck。

**后续变更备注（2026-09-20，`chroe/keepimprv-4` 工作树）**：
- **`book-category-selection-dlg` 删除**（Tier C 选择对话框批次中的 1 个）：`book-detail`/`book-associations` 改为内联 tree-select 行直接指派图书种类，选择对话框不再有调用方，故连同 `index.ts` 一并删除（Phase 4 表内的"5 个 live"为迁移当时的事实，此处仅作后续变更记录）。
- **`book-detail.categoryTree` 由 plain signal 改为 `computed`**：原为 `ngOnInit` 一次性 `set` 的 signal（语言快照），现从 `categories` signal 派生，并由 `langTick`（订阅 `translocoService.langChanges$`）驱动重建 —— 因为节点标题走的是命令式 `translate()`，不带隐式语言依赖。同 idiom 见 `book-list`/`document-list`/`reading-record-list`/`filter-bar`/`filter-dialog`。配套 `categoryById` computed 让 pick 始终能解析回同一个数组（见 `docs/ui-review-2026-09-20.md`）。
- **新增 2 个 CVA 包装组件**（Tier D 家族的补充，非迁移对象）：`shared/trantype-tree-select`、`shared/controlcenter-tree-select`，包装 `nz-tree-select` 并把值暴露为数字 ID。二者自建即 signal 化（`input()`/`signal()`/`computed()` + `host` 监听替代 `@HostListener`），未走 Tier D 的"保留 CVA 外壳 + 内部 signal"桥接改造。二者与 `book-detail` 的三份树装配已抽取到 `src/common/flat-tree.ts`（`buildFlatTree`/`dottedPathTitle`，不依赖 ng-zorro）。
- **验证**：全量 `ng test` 147 文件 / 1515 通过 + `ng lint` exit 0。
