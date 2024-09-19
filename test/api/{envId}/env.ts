export interface Schema {
    delete: {
        responses: {
            200: {
                content: {
                    "application/json": {
                        body: string[];
                    };
                };
            };
        };
    };
    put: {
        request: {
            content: {
                "application/json": {
                    body: {
                        name?: string;
                        description?: string;
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
                        body?: boolean;
                    };
                };
            };
        };
    };
}

export function X() {}
