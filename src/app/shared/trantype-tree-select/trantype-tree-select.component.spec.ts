import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { OverlayContainer } from '@angular/cdk/overlay';
import { By } from '@angular/platform-browser';
import { NzTreeSelectComponent } from 'ng-zorro-antd/tree-select';
import { NzTreeNode } from 'ng-zorro-antd/tree';
import { vi } from 'vitest';

import { TranType } from '@model/index';
import { FakeDataHelper } from '../../../testing';
import { TranTypeTreeSelectComponent } from './trantype-tree-select.component';

describe('TranTypeTreeSelectComponent', () => {
  let component: TranTypeTreeSelectComponent;
  let fixture: ComponentFixture<TranTypeTreeSelectComponent>;
  let fakeData: FakeDataHelper;

  beforeAll(() => {
    fakeData = new FakeDataHelper();
    fakeData.buildFinConfigData();
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TranTypeTreeSelectComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TranTypeTreeSelectComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('tranTypes', fakeData.finTranTypes);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('builds hierarchical nodes from the flat dictionary', () => {
    // Fake dictionary: 主业收入 (2) carries 工资/奖金/津贴 (3/4/35) below it.
    const salaryRoot = component.tree().nodes.find((n) => n.key === '2');
    expect(salaryRoot).toBeTruthy();
    expect(salaryRoot!.title).toEqual('主业收入');
    expect(salaryRoot!.isLeaf).toBe(false);
    expect((salaryRoot!.children ?? []).map((c) => c.key)).toEqual(['3', '4', '35']);

    const salary = (salaryRoot!.children ?? [])[0];
    expect(salary.title).toEqual('工资');
    // ng-zorro derives the expander from isLeaf, not from the children length.
    expect(salary.isLeaf).toBe(true);
  });

  it('hoists orphans to top level so every type stays selectable', () => {
    const orphan: TranType = new TranType();
    orphan.Id = 777;
    orphan.Name = 'Orphan';
    orphan.ParId = 999999; // parent absent from the dictionary
    fixture.componentRef.setInput('tranTypes', [orphan]);

    const roots = component.tree().nodes;
    expect(roots.map((n) => n.key)).toEqual(['777']);
    expect(roots[0].isLeaf).toBe(true);
  });

  it('exposes the income/outgoing direction per node for styling', () => {
    expect(component.isExpense('2')).toBe(false); // 主业收入
    expect(component.isExpense('3')).toBe(false); // 工资 (child of income root)
    expect(component.isExpense('9')).toBe(true); // 生活类开支 (outgoing)
    expect(component.isExpense('14')).toBe(true); // 小区物业费 (nested outgoing)
    // An unknown key must never read as outgoing by accident.
    expect(component.isExpense('999999')).toBe(false);
  });

  it('onPick emits the numeric id, and clear emits undefined', () => {
    let last: TranType['Id'] | 'UNSET' = 'UNSET';
    component.registerOnChange((v: TranType['Id']) => (last = v));

    component.onPick('2');
    expect(last).toEqual(2);
    expect(component.nodeValue()).toEqual('2');

    // The tree-select clear button emits null: the control must go back to
    // undefined so required validation trips again.
    component.onPick(null);
    expect(last).toBeUndefined();
    expect(component.nodeValue()).toBeNull();
  });

  it('writeValue accepts numbers, numeric strings, and treats junk as empty', () => {
    component.writeValue(2);
    expect(component.nodeValue()).toEqual('2');
    component.writeValue('5');
    expect(component.nodeValue()).toEqual('5');
    component.writeValue(null);
    expect(component.nodeValue()).toBeNull();
    component.writeValue(undefined);
    expect(component.nodeValue()).toBeNull();
    component.writeValue('nonsense');
    expect(component.nodeValue()).toBeNull();
  });

  // The wrapper exposes the OUTER CVA, so the inner tree-select's own touched (it
  // reports one via its FocusMonitor / closeDropdown) reaches the NgModel this
  // template binds, not the host. Focus leaving the host is therefore the only
  // signal that can mark the field touched, exactly what the `nz-select` this
  // wrapper replaced did on blur. Without it a required, visible-empty field stays
  // untouched-but-invalid and its nzErrorTip never renders.
  it('reports touched when focus leaves the host', () => {
    fixture.detectChanges();
    const touched = vi.fn();
    component.registerOnTouched(touched);

    (fixture.nativeElement as HTMLElement).dispatchEvent(new FocusEvent('focusout', { bubbles: true }));

    expect(touched).toHaveBeenCalled();
  });

  // nz-tree-select defaults nzAllowClear to TRUE, the nz-select this wrapper replaced
  // defaulted it to false - so without the input every converted field silently grew
  // a clear (x) button the previous UI never offered. Default false restores parity;
  // a site that wants the button (and the undefined its clear emits) opts in.
  it('hides the clear button by default and shows it when opted in', async () => {
    component.writeValue(2); // 主业收入, a node of the fake dictionary
    fixture.detectChanges();
    await new Promise<void>((r) => setTimeout(r, 0));
    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;
    expect(host.querySelector('.ant-select-clear')).toBeNull();

    fixture.componentRef.setInput('allowClear', true);
    fixture.detectChanges();
    expect(host.querySelector('.ant-select-clear')).toBeTruthy();
  });

  it('disabled comes from either the input or the form disable state', () => {
    expect(component.isDisabled()).toBe(false);
    component.setDisabledState(true);
    expect(component.isDisabled()).toBe(true);
    component.setDisabledState(false);
    expect(component.isDisabled()).toBe(false);
    fixture.componentRef.setInput('disabled', true);
    expect(component.isDisabled()).toBe(true);
  });

  it('displayWith rebuilds the dotted full path for the trigger', () => {
    const par = new NzTreeNode({ key: '2', title: '主业收入' });
    const child = new NzTreeNode({ key: '3', title: '工资' }, par);
    expect(component.displayWith(child)).toEqual('主业收入.工资');
    expect(component.displayWith(par)).toEqual('主业收入');
    expect(component.displayWith(undefined)).toBeUndefined();
  });

  it('rebuilds the tree when the dictionary input changes', () => {
    expect(component.tree().nodes.length).toBeGreaterThan(1);
    fixture.componentRef.setInput('tranTypes', []);
    expect(component.tree().nodes).toEqual([]);
    expect(component.isExpense('2')).toBe(false);
  });
});

describe('TranTypeTreeSelectComponent (integration)', () => {
  @Component({
    selector: 'hih-test-host',
    imports: [TranTypeTreeSelectComponent, FormsModule],
    template: `
      <hih-trantype-tree-select
        id="idTranType"
        [tranTypes]="types"
        [(ngModel)]="val"
        (ngModelChange)="fired.push($event)"
      ></hih-trantype-tree-select>
    `,
  })
  class TestHostComponent {
    types: TranType[] = [];
    val: number | undefined = undefined;
    fired: Array<number | undefined> = [];
  }

  let host: TestHostComponent;
  let fixture: ComponentFixture<TestHostComponent>;
  let overlayContainerElement: HTMLElement;
  let fakeData: FakeDataHelper;

  beforeAll(() => {
    fakeData = new FakeDataHelper();
    fakeData.buildFinConfigData();
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent, FormsModule],
      providers: [],
    }).compileComponents();

    const oc = TestBed.inject(OverlayContainer);
    overlayContainerElement = oc.getContainerElement();

    fixture = TestBed.createComponent(TestHostComponent);
    host = fixture.componentInstance;
    host.types = fakeData.finTranTypes;
    fixture.detectChanges();
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('renders the inner nz-tree-select', () => {
    expect(fixture.debugElement.query(By.directive(NzTreeSelectComponent))).toBeTruthy();
  });

  it('shows styled nodes in the overlay and writes the picked id back through ngModel', async () => {
    const ts = fixture.debugElement
      .query(By.directive(TranTypeTreeSelectComponent))
      .query(By.directive(NzTreeSelectComponent));
    // The tree-select host carries no click listener (unlike nz-select):
    // open the dropdown through its API, as the document-items spec does.
    (ts.componentInstance as NzTreeSelectComponent).openDropdown();
    fixture.detectChanges();
    await new Promise<void>((r) => setTimeout(r, 0));
    fixture.detectChanges();

    // Fake dictionary's first root is ID 1 (初始资金, income): rendered green.
    const firstNode = overlayContainerElement.querySelector(
      'nz-tree-node-title.ant-select-tree-node-content-wrapper',
    ) as HTMLElement;
    expect(firstNode).toBeTruthy();
    const label = firstNode.querySelector('.hih-trantype-node') as HTMLElement;
    expect(label).toBeTruthy();
    expect(label.classList.contains('hih-trantype-node-income')).toBe(true);

    firstNode.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    fixture.detectChanges();
    await new Promise<void>((r) => setTimeout(r, 0));
    fixture.detectChanges();

    expect(host.val).toEqual(1);
    expect(host.fired).toEqual([1]);
  });

  it('propagates an externally set model value into the inner tree-select', async () => {
    host.val = 3; // 工资, child of 主业收入

    // The host -> NgModel -> wrapper CVA -> inner [ngModel] chain spans two
    // views, and NgModel._updateValue defers control.setValue() by a promise
    // microtask - so settle CD + microtasks a few rounds before asserting.
    for (let round = 0; round < 3; round++) {
      fixture.detectChanges();
      await new Promise<void>((r) => setTimeout(r, 0));
    }

    const wrapper = fixture.debugElement.query(By.directive(TranTypeTreeSelectComponent));
    const wrapperComp = wrapper.componentInstance as TranTypeTreeSelectComponent;
    expect(wrapperComp.nodeValue()).toEqual('3');

    const tsComp = wrapper.query(By.directive(NzTreeSelectComponent))!.componentInstance as NzTreeSelectComponent;
    expect(tsComp.value).toEqual(['3']);
    expect(tsComp.selectedNodes.map((n) => n.title)).toContain('工资');
  });
});
