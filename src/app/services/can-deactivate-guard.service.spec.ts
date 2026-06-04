import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { of } from 'rxjs';

import { CanDeactivateGuardService, CanComponentDeactivate } from './can-deactivate-guard.service';

describe('CanDeactivateGuardService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CanDeactivateGuardService],
    });
  });

  it('should be created', () => {
    const service = TestBed.inject(CanDeactivateGuardService);
    expect(service).toBeTruthy();
  });

  it('should return true when component has no canDeactivate method', () => {
    const service = TestBed.inject(CanDeactivateGuardService);
    const component = {} as CanComponentDeactivate;
    expect(service.canDeactivate(component)).toBe(true);
  });

  it('should call canDeactivate when component has the method', () => {
    const service = TestBed.inject(CanDeactivateGuardService);
    const component = {
      canDeactivate: vi.fn().mockReturnValue(of(true)),
    } as CanComponentDeactivate;
    service.canDeactivate(component);
    expect(component.canDeactivate).toHaveBeenCalled();
  });
});
