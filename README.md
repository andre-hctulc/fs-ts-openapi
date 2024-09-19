# fsts-api

File based TypeScript api -> OpenAPI schema

## Features

-   Document your api with TypeScript Interfaces
-   generate Open API Schemas from fs based apis.
    E.g. [Next.js](https://nextui.org) route handlers or [Nuxt](https://nuxt.com) api handlers.
-   chain [orval](https://orval.dev), to auto generate you api client
-   Base config

## Usage

`1.` Write your api

```
/api
├── index.ts
├── [protected]
│ ├── profile.ts
│ ├── env
│ │   │   ├── index.ts
│ │   │   ├── deleteAll.ts
│ │   │   └── {envId}
│ │   │   │   ├── index.ts
│ ├── settings
│ │   │   ├── index.ts
│ │   │   ├── reset.ts
├── auth
│ ├── login.ts
│ ├── signup.ts
└── docs.ts
```

`2.` generate

```bash
# shadow dirs are disabled by default!
npx fsts-api generate --shadow [dir]
```

This will document the following routes in _api.json_.

-   /
-   /profile
-   /env
-   /env/deleteall
-   /env/{envId}
-   /settings
-   /settings/reset
-   /auth/login
-   /auth/signup

`3.` Now you can configure your routes further:

_settings.ts_

```ts
export interface Schema {
    get: {
        request: {
            headers: {
                Authorization: string;
            };
            search: {
                name: string;
            };
        };
        responses: {
            200: {
                content: {
                    "application/json": {
                        body: {
                            value: string;
                            lastChangedAt: number;
                        };
                    };
                };
            };
            401: { content: {} };
        };
    };
    put: {
        request: {
            headers: {
                Authorization: string;
            };
            content: {
                "application/json": {
                    body: {
                        name: string;
                        value: string;
                    };
                };
            };
        };
        responses: {
            200: {
                content: {
                    "application/json": {
                        body: boolean;
                    };
                };
            };
            401: { content: {} };
            500: { content: {} };
        };
    };
}

export function handler(request ...) {
    // Handler logic
}
```

Now

```bash
npx fsts-api generate
```

will add more documentation about the routes in the OpenAPI schema.

## CLI options

| Column 1              | Default    | Description                                         |
| --------------------- | ---------- | --------------------------------------------------- |
| path                  | .          | Api directory                                       |
| out                   | ./api.json | Output file for the OpenAPI schema                  |
| shadow                |            | Use directories that do not affect the api's routes |
| exportName            | Schema     | The export name of the schema interface             |
| path-var              | {var}      | Path variable template                              |
| skip-file-name        | false      | Exclude the filename from the route path            |
| scan                  | \*\*/\*.ts | What files to include as routes                     |
| base-config           |            | Path to a base OpenAPI schema                       |
| format                | json       | Output json or yaml                                 |
| orval                 |            | chain orval. Must be defined by a config file       |
| orval-config          |            | Path to to the orval config                         |
| disable-index-mapping | false      | Map index.ts routes to the base                     |
