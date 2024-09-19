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
    post: {
        request: {
            content: {
                "application/json": {
                    body: {
                        name: string;
                        email: string;
                        age?: number;
                    };
                };
            };
        };
        responses: {
            200: {
                headers: {
                    "Content-Length": string;
                };
                content: {
                    "application/json": {
                        body?: {
                            message: string;
                            system?: boolean;
                        };
                    };
                };
            };
        };
    };
}

export function X() {}
