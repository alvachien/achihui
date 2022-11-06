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
    const authServiceStub: Partial<OidcSecurityService> = {};
    const eventServiceStub: Partial<PublicEventsService> = {};

    TestBed.configureTestingModule({
      providers: [
        AuthService,
        { provide: OidcSecurityService, useValue: authServiceStub },
        { provide: PublicEventsService, useValue: eventServiceStub },
      ],
    });
  });

  it('should be created', inject([AuthService], (service: AuthService) => {
    expect(service).toBeTruthy();
  }));
});
