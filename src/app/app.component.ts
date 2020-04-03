import { Component } from '@angular/core';
import { RouterOutlet, Router, NavigationStart, NavigationEnd, NavigationCancel, NavigationError } from '@angular/router';
import {
  trigger,
  animate,
  transition,
  style,
  query, group, animateChild
} from '@angular/animations';
import { OverviewComponent } from './overview/overview.component';
import { Observable } from 'rxjs';
import { IsLoadingService } from '@service-work/is-loading'
import { filter } from 'rxjs/internal/operators/filter';

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

  isLoading: Observable<boolean>;

  constructor(
    private isLoadingService: IsLoadingService,
    private router: Router,
  ) {}

  ngOnInit() {
    this.isLoading = this.isLoadingService.isLoading$();

    this.router.events
      .pipe(
        filter(
          event =>
            event instanceof NavigationStart ||
            event instanceof NavigationEnd ||
            event instanceof NavigationCancel ||
            event instanceof NavigationError,
        ),
      )
      .subscribe(event => {
        // If it's the start of navigation, `add()` a loading indicator
        if (event instanceof NavigationStart && event.url !== '/overview' && event.url !== '/') {
          this.isLoadingService.add();
          console.log("loading now!")
          return;
        }
      });
  }

  public getRouterOutletState(outlet: RouterOutlet) {
    return outlet && outlet.activatedRouteData && outlet.activatedRouteData['animation'];
  }
}
