import { Injector, NgModule, PLATFORM_ID } from '@angular/core';
import { Router, RouterModule, Routes } from '@angular/router';
import { TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { TransferState } from '@angular/platform-browser';
import { LocalizeParser, LocalizeRouterModule, LocalizeRouterService, LocalizeRouterSettings } from '@gilsdav/ngx-translate-router';
import { Location, LOCATION_INITIALIZED } from '@angular/common';

import { UniversalTranslateHttpLoader } from './classes/universal-translate-http-loader.class';
import { HomeComponent } from './home/home.component';
import { UniversalLocalizeRouterHttpLoader } from './classes/universal-localize-router-http-loader.class';
import { AboutComponent } from './about/about.component';
import { concat } from 'rxjs';
import { filter, first } from 'rxjs/operators';

const routes: Routes = [{
  path: '',
  component: HomeComponent,
}, {
  path: 'about',
  component: AboutComponent,
}, {
  path: 'blog',
  loadChildren: () => import('./blog/blog.module').then(m => m.BlogModule),
}];

export function initLanguage(injector: Injector): () => void {
  return (): Promise<any> =>
    new Promise((resolve) => {
      injector.get(LocalizeRouterService).init();
      resolve();
    });
}

// AoT requires an exported function for factories
export function universalTranslateHttpLoaderFactory(
  http: HttpClient,
  transferState: TransferState,
  platformId: object,
) {
  return new UniversalTranslateHttpLoader(http, transferState, platformId);
}

export function universalLocalizeRouterHttpLoaderFactory(
  translate: TranslateService,
  location: Location,
  settings: LocalizeRouterSettings,
  http: HttpClient,
  transferState: TransferState,
  platformId: object,
) {
  return new UniversalLocalizeRouterHttpLoader(translate, location, settings, http, transferState, platformId);
}

export function defaultLangFunction(languages: string[], cachedLang?: string, browserLang?: string): string {
  return languages[0];
}

@NgModule({
  imports: [
    TranslateModule.forRoot({
      defaultLanguage: 'nl',
      loader: {
        provide: TranslateLoader,
        useFactory: universalTranslateHttpLoaderFactory,
        deps: [HttpClient, TransferState, PLATFORM_ID],
      },
    }),
    RouterModule.forRoot(routes, {
      // initialNavigation: 'enabled',
    }),
    LocalizeRouterModule.forRoot(routes, {
      alwaysSetPrefix: false,
      defaultLangFunction,
      parser: {
        provide: LocalizeParser,
        useFactory: universalLocalizeRouterHttpLoaderFactory,
        deps: [TranslateService, Location, LocalizeRouterSettings, HttpClient, TransferState, PLATFORM_ID],
      },
    }),
  ],
  exports: [
    RouterModule,
    TranslateModule,
    LocalizeRouterModule,
  ],
  providers: [],
})
export class AppRoutingModule {
}
