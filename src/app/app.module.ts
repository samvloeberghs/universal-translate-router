import { BrowserModule, BrowserTransferStateModule, TransferState } from '@angular/platform-browser';
import { NgModule, PLATFORM_ID } from '@angular/core';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { HTTP_INTERCEPTORS, HttpClient, HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HttpInterceptorBrowserService } from './services/http-interceptor-browser.service';
import { UniversalTranslateHttpLoader } from './classes/universal-translate-http-loader.class';


// AoT requires an exported function for factories
export function UniversalTranslateHttpLoaderFactory(
  http: HttpClient,
  transferState: TransferState,
  platformId: object) {
  return new UniversalTranslateHttpLoader(http, transferState, platformId);
}

@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    BrowserModule.withServerTransition({appId: 'test'}),
    BrowserTransferStateModule,
    HttpClientModule,
    TranslateModule.forRoot({
      defaultLanguage: 'nl',
      loader: {
        provide: TranslateLoader,
        useFactory: UniversalTranslateHttpLoaderFactory,
        deps: [HttpClient, TransferState, PLATFORM_ID],
      },
    }),
    AppRoutingModule,
  ],
  providers: [{
    provide: HTTP_INTERCEPTORS,
    useClass: HttpInterceptorBrowserService,
    multi: true,
  }],
  bootstrap: [AppComponent],
})
export class AppModule {
}
