import { TestBed, inject } from '@angular/core/testing';
import { of } from 'rxjs';

import { CanDeactivateGuardService, CanComponentDeactivate } from './can-deactivate-guard.service';

describe('CanDeactivateGuardService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CanDeactivateGuardService],
    });
  });

  it('should be created', inject([CanDeactivateGuardService], (service: CanDeactivateGuardService) => {
    expect(service).toBeTruthy();
  }));

  it('should return true when component has no canDeactivate method', inject(
    [CanDeactivateGuardService],
    (service: CanDeactivateGuardService) => {
      const component = {} as CanComponentDeactivate;
      expect(service.canDeactivate(component)).toBeTrue();
    }
  ));

  it('should call canDeactivate when component has the method', inject(
    [CanDeactivateGuardService],
    (service: CanDeactivateGuardService) => {
      const component = {
        canDeactivate: jasmine.createSpy('canDeactivate').and.returnValue(of(true)),
      } as CanComponentDeactivate;
      service.canDeactivate(component);
      expect(component.canDeactivate).toHaveBeenCalled();
    }
  ));
});
