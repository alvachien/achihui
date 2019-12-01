import { animate, AnimationTriggerMetadata, state, query, animateChild, group, style, transition, trigger } from '@angular/animations';

export const slideInAnimation: any =
  trigger('routeAnimations', [
    transition('* <=> DetailPage', [
      style({ position: 'relative' }),
      query(':enter, :leave', [
        style({
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
        }),
      ]),
      query(':enter', [
        style({ left: '-100%' }),
      ]),
      query(':leave', animateChild()),
      group([
        query(':leave', [
          animate('400ms ease-out', style({ left: '100%' })),
        ]),
        query(':enter', [
          animate('400ms ease-out', style({ left: '0%' })),
        ]),
      ]),
      query(':enter', animateChild()),
    ]),
    transition('* <=> ListPage', [
      style({ position: 'relative' }),
      query(':enter, :leave', [
        style({
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
        }),
      ]),
      query(':enter', [
        style({ left: '-100%' }),
      ]),
      query(':leave', animateChild()),
      group([
        query(':leave', [
          animate('300ms ease-out', style({ left: '100%' })),
        ]),
        query(':enter', [
          animate('400ms ease-out', style({ left: '0%' })),
        ]),
      ]),
      query(':enter', animateChild()),
    ]),
  ]);
