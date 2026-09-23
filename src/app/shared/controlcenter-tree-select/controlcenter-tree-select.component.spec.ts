import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { OverlayContainer } from '@angular/cdk/overlay';
import { By } from '@angular/platform-browser';
import { NzTreeSelectComponent } from 'ng-zorro-antd/tree-select';
import { NzTreeNode } from 'ng-zorro-antd/tree';

import { ControlCenter } from '@model/index';
import { FakeDataHelper } from '../../../testing';
import { ControlCenterTreeSelectComponent } from './controlcenter-tree-select.component';
import { vi } from 'vitest';

describe('ControlCenterTreeSelectComponent', () => {
  let component: ControlCenterTreeSelectComponent;
  let fixture: ComponentFixture<ControlCenterTreeSelectComponent>;
  let fakeData: FakeDataHelper;

  beforeAll(() => {
    fakeData = new FakeDataHelper();
    fakeData.buildChosedHome();
    fakeData.buildFinControlCenter();
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ControlCenterTreeSelectComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ControlCenterTreeSelectComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('controlCenters', fakeData.finControlCenters);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('builds hierarchical nodes from the flat dictionary', () => {
    // Fake dictionary: 1 (Control Center 1) carries 5 -> 6 nested below it,
    // and 2 is a second top-level center.
    const roots = component.tree();
    expect(roots.map((n) => n.key)).toEqual(['1', '2']);

    const root = roots[0];
    expect(root.title).toEqual('Control Center 1');
    expect(root.isLeaf).toBe(false);

    const child = (root.children ?? [])[0];
    expect(child.key).toEqual('5');
    expect(child.title).toEqual('Control Center 1.1');
    // ng-zorro derives the expander from isLeaf, not from the children length.
    expect(child.isLeaf).toBe(false);

    const grandChild = (child.children ?? [])[0];
    expect(grandChild.key).toEqual('6');
    expect(grandChild.isLeaf).toBe(true);

    // The leaf-only root carries no expander.
    expect(roots[1].key).toEqual('2');
    expect(roots[1].isLeaf).toBe(true);
  });

  it('hoists orphans to top level so every center stays selectable', () => {
    const orphan: ControlCenter = new ControlCenter();
    orphan.Id = 777;
    orphan.Name = 'Orphan';
    orphan.ParentId = 999999; // parent absent from the dictionary
    fixture.componentRef.setInput('controlCenters', [orphan]);

    const roots = component.tree();
    expect(roots.map((n) => n.key)).toEqual(['777']);
    expect(roots[0].isLeaf).toBe(true);
  });

  it('onPick emits the numeric id, and clear emits undefined', () => {
    let last: ControlCenter['Id'] | 'UNSET' = 'UNSET';
    component.registerOnChange((v: ControlCenter['Id']) => (last = v));

    component.onPick('5');
    expect(last).toEqual(5);
    expect(component.nodeValue()).toEqual('5');

    // The tree-select clear button emits null: the control must go back to
    // undefined so required validation trips again.
    component.onPick(null);
    expect(last).toBeUndefined();
    expect(component.nodeValue()).toBeNull();
  });

  it('writeValue accepts numbers, numeric strings, and treats junk as empty', () => {
    component.writeValue(5);
    expect(component.nodeValue()).toEqual('5');
    component.writeValue('2');
    expect(component.nodeValue()).toEqual('2');
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
    component.writeValue(1); // a node of the fake control-center dictionary
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
    const root = new NzTreeNode({ key: '1', title: 'Control Center 1' });
    const child = new NzTreeNode({ key: '5', title: 'Control Center 1.1' }, root);
    const grandChild = new NzTreeNode({ key: '6', title: 'Control Center 1.1.1' }, child);
    expect(component.displayWith(grandChild)).toEqual('Control Center 1.Control Center 1.1.Control Center 1.1.1');
    expect(component.displayWith(root)).toEqual('Control Center 1');
    expect(component.displayWith(undefined)).toBeUndefined();
  });

  it('rebuilds the tree when the dictionary input changes', () => {
    expect(component.tree().length).toBeGreaterThan(1);
    fixture.componentRef.setInput('controlCenters', []);
    expect(component.tree()).toEqual([]);
  });
});

describe('ControlCenterTreeSelectComponent (integration)', () => {
  @Component({
    selector: 'hih-test-host',
    imports: [ControlCenterTreeSelectComponent, FormsModule],
    template: `
      <hih-controlcenter-tree-select
        id="idControlCenter"
        [controlCenters]="centers"
        [(ngModel)]="val"
        (ngModelChange)="fired.push($event)"
      ></hih-controlcenter-tree-select>
    `,
  })
  class TestHostComponent {
    centers: ControlCenter[] = [];
    val: number | undefined = undefined;
    fired: Array<number | undefined> = [];
  }

  let host: TestHostComponent;
  let fixture: ComponentFixture<TestHostComponent>;
  let overlayContainerElement: HTMLElement;
  let fakeData: FakeDataHelper;

  beforeAll(() => {
    fakeData = new FakeDataHelper();
    fakeData.buildChosedHome();
    fakeData.buildFinControlCenter();
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
    host.centers = fakeData.finControlCenters;
    fixture.detectChanges();
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('renders the inner nz-tree-select', () => {
    expect(fixture.debugElement.query(By.directive(NzTreeSelectComponent))).toBeTruthy();
  });

  it('shows the nodes in the overlay and writes the picked id back through ngModel', async () => {
    const ts = fixture.debugElement
      .query(By.directive(ControlCenterTreeSelectComponent))
      .query(By.directive(NzTreeSelectComponent));
    // The tree-select host carries no click listener (unlike nz-select):
    // open the dropdown through its API, as the document-items spec does.
    (ts.componentInstance as NzTreeSelectComponent).openDropdown();
    fixture.detectChanges();
    await new Promise<void>((r) => setTimeout(r, 0));
    fixture.detectChanges();

    // Fake dictionary's first root is ID 1 (Control Center 1), plain-titled -
    // a control center has no income/outgoing direction, so no styling class.
    const firstNode = overlayContainerElement.querySelector(
      'nz-tree-node-title.ant-select-tree-node-content-wrapper',
    ) as HTMLElement;
    expect(firstNode).toBeTruthy();
    expect(firstNode.textContent?.trim()).toEqual('Control Center 1');
    expect(firstNode.querySelector('.hih-trantype-node')).toBeNull();

    firstNode.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    fixture.detectChanges();
    await new Promise<void>((r) => setTimeout(r, 0));
    fixture.detectChanges();

    expect(host.val).toEqual(1);
    expect(host.fired).toEqual([1]);
  });

  it('propagates an externally set model value into the inner tree-select', async () => {
    host.val = 5; // Control Center 1.1, child of Control Center 1

    // The host -> NgModel -> wrapper CVA -> inner [ngModel] chain spans two
    // views, and NgModel._updateValue defers control.setValue() by a promise
    // microtask - so settle CD + microtasks a few rounds before asserting.
    for (let round = 0; round < 3; round++) {
      fixture.detectChanges();
      await new Promise<void>((r) => setTimeout(r, 0));
    }

    const wrapper = fixture.debugElement.query(By.directive(ControlCenterTreeSelectComponent));
    const wrapperComp = wrapper.componentInstance as ControlCenterTreeSelectComponent;
    expect(wrapperComp.nodeValue()).toEqual('5');

    const tsComp = wrapper.query(By.directive(NzTreeSelectComponent))!.componentInstance as NzTreeSelectComponent;
    expect(tsComp.value).toEqual(['5']);
    expect(tsComp.selectedNodes.map((n) => n.title)).toContain('Control Center 1.1');
  });
});
