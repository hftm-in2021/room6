import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { filter, Observable, ReplaySubject, tap } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { LoginResponse, OidcSecurityService } from 'angular-auth-oidc-client';
import { LoadingStateService } from '../loading-state.service';
import { hasRole } from '../auth/jwt';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent {
  private breakpointObserver = inject(BreakpointObserver);
  showCreateButton$: Observable<boolean>;
  loginResponse$ = new ReplaySubject<LoginResponse | null>();
  initials$: Observable<string>;

  isHandset$: Observable<boolean> = this.breakpointObserver
    .observe(Breakpoints.Handset)
    .pipe(
      map((result) => result.matches),
      shareReplay()
    );

  //login$ = new EventEmitter();
  //logoff$ = new EventEmitter();
  @Input() set loginResponse(value: LoginResponse | null) {
    this.loginResponse$.next(value);
  }

  isLoading$: Observable<boolean>;
  loginResponseOidc$: Observable<LoginResponse>;

  constructor(
    private loadingService: LoadingStateService,
    private oidcSecurityService: OidcSecurityService
  ) {
    this.initials$ = this.loginResponse$.pipe(
      map((response) =>
        response?.userData?.preferred_username
          .split(/[._-]/)
          .map((token: string) => token.charAt(0))
          .join('')
      )
    );
    this.isLoading$ = this.loadingService.state$;

    this.loginResponseOidc$ = oidcSecurityService.checkAuth().pipe(
      filter((loginRespose) => !!loginRespose),
      tap((x) => console.log(x))
    );
    this.showCreateButton$ = this.loginResponse$.pipe(
      map((response) => hasRole('user', response?.accessToken))
    );
  }

  login() {
    console.log('test');
    this.oidcSecurityService.authorize();
  }
  logout() {
    this.oidcSecurityService.logoff().subscribe((x) => console.log(x));
  }
}
