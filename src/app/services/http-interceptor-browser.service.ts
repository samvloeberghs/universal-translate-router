import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse } from '@angular/common/http';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { makeStateKey, StateKey, TransferState } from '@angular/platform-browser';
import { Observable, of } from 'rxjs';

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

    console.log('http browser interceptor', request.urlWithParams);

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
