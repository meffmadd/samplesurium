import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {
  trigger,
  animate,
  transition,
  style,
  query, group, animateChild
} from '@angular/animations';
import { OverviewComponent } from './overview/overview.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  animations: [
    trigger('routeAnimations', [
 
      transition('Overview => Detail', [
        query(':enter, :leave', style({ position: 'fixed', width: '100%' })
          , { optional: true }),
        group([  // block executes in parallel
          query(':enter', [
            style({ transform: 'translateX(100%)' }),
            animate('0.3s ease-in-out', style({ transform: 'translateX(0%)' })),
            animateChild(),
          ], { optional: true }),
          query(':leave', [
            style({ transform: 'translateX(0%)' }),
            animate('0.3s ease-in-out', style({ transform: 'translateX(-100%)' }
            ))], { optional: true }),
        ]),
        query(':enter', animateChild())
      ]),
      transition('Detail => Overview', [
        query(':enter, :leave', style({ position: 'fixed', width: '100%' })
          , { optional: true }),
        group([  // block executes in parallel
          query(':enter', [
            style({ transform: 'translateX(-100%)' }),
            animate('0.2s ease-in-out', style({ transform: 'translateX(0%)' }))
          ], { optional: true }),
          query(':leave', [
            style({ transform: 'translateX(0%)' }),
            animate('0.2s ease-in-out', style({ transform: 'translateX(100%)' }
            ))], { optional: true }),
        ])
      ])

    ])
  ]
})
export class AppComponent {
  title = 'Sampleurium';

  public getRouterOutletState(outlet: RouterOutlet) {
    return outlet && outlet.activatedRouteData && outlet.activatedRouteData['animation'];
  }
}
