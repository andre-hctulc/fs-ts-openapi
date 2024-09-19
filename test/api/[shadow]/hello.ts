export interface Schema {
    get: {
        responses: {
            200: {
                content: {
                    "application/json": {
                        body: string;
                    };
                };
            };
        };
    };
}

export function X() {}
