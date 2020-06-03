import { HttpClient } from '@angular/common/http';
import { makeStateKey, StateKey, TransferState } from '@angular/platform-browser';
import { Observable, of } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { tap } from 'rxjs/operators';

export class UniversalTranslateHttpLoader {
  constructor(
    private readonly http: HttpClient,
    private readonly transferState: TransferState,
    private readonly platformId: object,
    // deze moeten we er op een andere manier inkrijgen
    private readonly baseUrl = 'http://localhost:4200',
    private readonly prefix = '/assets/i18n/',
    private readonly suffix = '.json') {
  }

  /**
   * Gets the translations from the server
   */
  getTranslation(lang: string): Observable<object> {
    const url = this.baseUrl + this.prefix + lang + this.suffix;
    // Make a key from the request url
    const key = this.getStateKey(lang);

    if (isPlatformBrowser(this.platformId)) {
      const storedResponse = this.transferState.get<object>(key, null);
      return storedResponse
        ? of(storedResponse)
        : new TranslateHttpLoader(this.http, this.prefix, this.suffix).getTranslation(lang);
    } else {
      return this.http.get<object>(url).pipe(
        tap(event => {
          this.transferState.set<object>(key, event);
        }),
      );
    }
  }

  private getStateKey(lang: string): StateKey<object> {
    return makeStateKey<object>(`transfer-translate-${lang}`);
  }
}
