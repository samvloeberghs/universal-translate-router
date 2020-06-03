import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse } from '@angular/common/http';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { makeStateKey, StateKey, TransferState } from '@angular/platform-browser';
import { Observable } from 'rxjs';
import { filter, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class HttpInterceptorServerService implements HttpInterceptor {
  constructor(
    private transferState: TransferState,
    @Inject(PLATFORM_ID) private platformId: any,
  ) {
    console.log('HttpInterceptorServerService constructor');
  }

  public intercept(
    request: HttpRequest<any>,
    next: HttpHandler,
  ): Observable<HttpEvent<any>> {

    // Only intercept GET requests
    if (request.method !== 'GET') {
      return next.handle(request);
    }

    // Make a key from the request url
    const key: StateKey<string> = makeStateKey<string>(
      `${request.url}?${request.params}`,
    );

    return next.handle(request).pipe(
      filter(response => response !== undefined),
      tap(event => {
        this.transferState.set(key, (event as HttpResponse<any>).body);
      }),
    );
  }
}
