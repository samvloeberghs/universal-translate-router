import { BrowserModule, BrowserTransferStateModule, ɵgetDOM } from '@angular/platform-browser';
import { APP_INITIALIZER, NgModule, PLATFORM_ID } from '@angular/core';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { PrebootModule } from 'preboot';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HttpInterceptorBrowserService } from './services/http-interceptor-browser.service';
import { HomeComponent } from './home/home.component';
import { AboutComponent } from './about/about.component';
import { isPlatformBrowser } from '@angular/common';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    AboutComponent,
  ],
  imports: [
    BrowserModule.withServerTransition({appId: 'test'}),
    PrebootModule.withConfig({appRoot: 'app-root'}),
    BrowserTransferStateModule,
    HttpClientModule,
    AppRoutingModule,
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: HttpInterceptorBrowserService,
      multi: true,
    }, {
      provide: APP_INITIALIZER,
      useFactory: (platformId: object) => () => {
        if (isPlatformBrowser(platformId)) {
          const dom = ɵgetDOM();
          const styles = Array.prototype.slice.apply(
            dom.getDefaultDocument().querySelectorAll('style[ng-transition]'),
          );
          styles.forEach(el => {
            // Remove ng-transition attribute to prevent Angular appInitializerFactory
            // to remove server styles before preboot complete
            el.removeAttribute('ng-transition');
          });
          dom.getDefaultDocument().addEventListener('PrebootComplete', () => {
            // After preboot complete, remove the server scripts
            styles.forEach(el => dom.remove(el));
          });
        }
      },
      deps: [PLATFORM_ID],
      multi: true,
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {
}
