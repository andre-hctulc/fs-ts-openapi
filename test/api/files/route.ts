export interface Schema {
    get: {
        request: {
            headers: {
                "Content-Type": string;
            };
            search: {
                version: string;
            };
        };
        responses: {
            200: {
                content: {
                    "application/json": {
                        body: {
                            appName: string;
                            appVersion: string;
                        };
                    };
                };
            };
        };
    };
}

export function X() {}
