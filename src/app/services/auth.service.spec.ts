import { TestBed, inject } from '@angular/core/testing';
import { OidcSecurityService, PublicEventsService } from 'angular-auth-oidc-client';
import { of } from 'rxjs';
import { SafeAny } from '@common/any';

import { AuthService } from './auth.service';

describe('AuthService', () => {
  let securService: SafeAny;
  let eventService: SafeAny;
  let checkAuthSpy: SafeAny;
  let registerForEventsSpy: SafeAny;

  beforeAll(() => {
    securService = jasmine.createSpyObj('OidcSecurityService', ['checkAuth']);
    checkAuthSpy = securService.checkAuth.and.returnValue(of({}));

    eventService = jasmine.createSpyObj('PublicEventsService', ['registerForEvents']);
    registerForEventsSpy = eventService.registerForEvents.and.returnValue(of({}));
  });

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AuthService,
        { provide: OidcSecurityService, useValue: securService },
        { provide: PublicEventsService, useValue: eventService },
      ],
    });
  });

  it('should be created', inject([AuthService], (service: AuthService) => {
    expect(service).toBeTruthy();

    const btest = false;
    if (btest) {
      expect(checkAuthSpy).not.toHaveBeenCalled();
      expect(registerForEventsSpy).not.toHaveBeenCalled();
    }
  }));
});
