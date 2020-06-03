import { LocalizeParser } from '@gilsdav/ngx-translate-router';
import { TranslateService } from '@ngx-translate/core';
import { isPlatformBrowser, isPlatformServer, Location } from '@angular/common';
import { LocalizeRouterSettings } from '@gilsdav/ngx-translate-router/lib/localize-router.config';
import { HttpClient } from '@angular/common/http';
import { Routes } from '@angular/router';
import { makeStateKey, TransferState } from '@angular/platform-browser';
import { ILocalizeRouterParserConfig } from '@gilsdav/ngx-translate-router-http-loader';

export class UniversalLocalizeRouterHttpLoader extends LocalizeParser {

  private readonly localTranslate: TranslateService;
  private readonly localLocation: Location;
  private readonly localSettings: LocalizeRouterSettings;

  private readonly stateKey = makeStateKey<ILocalizeRouterParserConfig>(`transfer-localize-router`);

  constructor(
    translate: TranslateService,
    location: Location,
    settings: LocalizeRouterSettings,
    private readonly http: HttpClient,
    private readonly transferState: TransferState,
    private readonly platformId: object,
    // THIS URL NEEDS TO BE INJECTED ANOTHER WAY
    // We use the full URL because the server has no notion / idea of
    // the relativeness that the browser has
    private readonly baseUrl = 'http://localhost:4200',
    private readonly path = '/assets/locales.json',
  ) {
    super(translate, location, settings);
    this.localTranslate = translate;
    this.localLocation = location;
    this.localSettings = settings;
  }

  load(routes: Routes): Promise<any> {
    return new Promise((resolve) => {
      const url = this.baseUrl + this.path;
      // THIS DOESN'T WORK: JUST RELYING ON THE INTERCEPTOR
      // return this.http.get<object>(url);

      if (isPlatformBrowser(this.platformId)) {
        const storedResponse = this.transferState.get<ILocalizeRouterParserConfig>(this.stateKey, null);
        if (storedResponse) {
          this.setData(storedResponse);
          this.init(routes).then(resolve);
          return;
        }
      }
      this.http.get<object>(url).subscribe((data: ILocalizeRouterParserConfig) => {
        if (isPlatformServer(this.platformId)) {
          this.transferState.set<object>(this.stateKey, data);
        }
        this.setData(data);
        this.init(routes).then(resolve);
      });
    });

  }

  private setData(data: ILocalizeRouterParserConfig) {
    this.locales = data.locales;
    this.prefix = data.prefix || '';
    this.escapePrefix = data.escapePrefix || '';
  }

}
