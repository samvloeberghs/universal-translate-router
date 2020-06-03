import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse } from '@angular/common/http';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { makeStateKey, StateKey, TransferState } from '@angular/platform-browser';
import { Observable, of } from 'rxjs';
import { isPlatformServer } from '@angular/common';

@Injectable()
export class HttpInterceptorBrowserService implements HttpInterceptor {
  constructor(
    private transferState: TransferState,
    @Inject(PLATFORM_ID) private platformId: any,
  ) {
    console.log('HttpInterceptorBrowserService constructed');
  }

  public intercept(
    request: HttpRequest<any>,
    next: HttpHandler,
  ): Observable<HttpEvent<any>> {

    // This interceptor is included in the app module, meaning it is also included in the
    // app server module => it executes on server AND browser.
    // Therefor we check the platform here and just continue the handle if this is executed on the server
    if (isPlatformServer(this.platformId)) {
      return next.handle(request);
    }

    // Only intercept GET requests
    if (request.method !== 'GET') {
      return next.handle(request);
    }

    // Make a key from the request url
    const key: StateKey<string> = makeStateKey<string>(
      `${request.urlWithParams}`,
    );

    const storedResponse = this.transferState.get<any>(key, null);

    if (storedResponse) {
      const response = new HttpResponse({
        body: storedResponse,
        status: 200,
      });

      this.transferState.remove(key);

      return of(response);
    }

    return next.handle(request);
  }
}
