import { TestBed, inject } from '@angular/core/testing';
import { OidcSecurityService, PublicEventsService } from 'angular-auth-oidc-client';
import { of } from 'rxjs';

import { AuthService } from './auth.service';

describe('AuthService', () => {
  let securService: any;
  let eventService: any;
  let checkAuthSpy: any;
  let registerForEventsSpy: any;

  beforeAll(() => {
    securService = jasmine.createSpyObj('OidcSecurityService', [
      'checkAuth',
    ]);
    checkAuthSpy = securService.checkAuth.and.returnValue(of({}));
 
    eventService = jasmine.createSpyObj('PublicEventsService', [
      'registerForEvents',
    ]);  
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
  }));
});
