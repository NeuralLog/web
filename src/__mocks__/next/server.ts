export class NextRequest {
  headers: Headers;
  nextUrl: { pathname: string };

  constructor(input: RequestInfo, init?: RequestInit) {
    this.headers = new Headers(init?.headers);
    this.nextUrl = { pathname: '/' };
  }
}

export class NextResponse {
  static json(body: any, init?: ResponseInit) {
    const response = new NextResponse(JSON.stringify(body), {
      ...init,
      headers: {
        ...init?.headers,
        'content-type': 'application/json',
      },
    });
    
    return response;
  }

  status: number;
  private body: string;
  private responseInit: ResponseInit;

  constructor(body?: BodyInit | null, init?: ResponseInit) {
    this.body = body as string || '';
    this.status = init?.status || 200;
    this.responseInit = init || {};
  }

  async json() {
    return JSON.parse(this.body);
  }
}

export function rewrite(destination: string) {
  return new NextResponse(null, {
    headers: {
      'x-middleware-rewrite': destination,
    },
  });
}

export function redirect(destination: string) {
  return new NextResponse(null, {
    status: 307,
    headers: {
      Location: destination,
    },
  });
}

export function next() {
  return new NextResponse(null, {
    headers: {
      'x-middleware-next': '1',
    },
  });
}
