export interface OpenAPISchema {
    openapi: string;
    info: InfoObject;
    servers?: ServerObject[];
    paths: Record<string, PathItemObject>;
    components?: ComponentsObject;
    security?: SecurityRequirementObject[];
    tags?: TagObject[];
    externalDocs?: ExternalDocumentationObject;
}

export interface InfoObject {
    title: string;
    description?: string;
    termsOfService?: string;
    contact?: ContactObject;
    license?: LicenseObject;
    version: string;
}

export interface ContactObject {
    name?: string;
    url?: string;
    email?: string;
}

export interface LicenseObject {
    name: string;
    url?: string;
}

export interface ServerObject {
    url: string;
    description?: string;
    variables?: Record<string, ServerVariableObject>;
}

export interface ServerVariableObject {
    enum?: string[];
    default: string;
    description?: string;
}

export interface PathItemObject {
    $ref?: string;
    summary?: string;
    description?: string;
    get?: OperationObject;
    put?: OperationObject;
    post?: OperationObject;
    delete?: OperationObject;
    options?: OperationObject;
    head?: OperationObject;
    patch?: OperationObject;
    trace?: OperationObject;
    parameters?: ParameterObject[];
}

export interface OperationObject {
    tags?: string[];
    summary?: string;
    description?: string;
    operationId?: string;
    parameters?: ParameterObject[];
    requestBody?: RequestBodyObject;
    responses: Record<string, ResponseObject>;
    deprecated?: boolean;
    security?: SecurityRequirementObject[];
}

export interface ParameterObject {
    name: string;
    in: "query" | "header" | "path" | "cookie";
    description?: string;
    required?: boolean;
    deprecated?: boolean;
    allowEmptyValue?: boolean;
    schema?: SchemaObject;
}

export interface RequestBodyObject {
    description?: string;
    content: Record<string, MediaTypeObject>;
    required?: boolean;
}

export interface MediaTypeObject {
    schema?: SchemaObject;
    example?: any;
    examples?: Record<string, ExampleObject>;
}

export interface ExampleObject {
    summary?: string;
    description?: string;
    value?: any;
    externalValue?: string;
}

export interface ResponseObject {
    description: string;
    headers?: Record<string, HeaderObject>;
    content?: Record<string, MediaTypeObject>;
    links?: Record<string, LinkObject>;
}

export interface HeaderObject {
    description?: string;
    required?: boolean;
    deprecated?: boolean;
    allowEmptyValue?: boolean;
    schema?: SchemaObject;
}

export interface LinkObject {
    operationRef?: string;
    operationId?: string;
    parameters?: Record<string, any>;
    requestBody?: any;
    description?: string;
}

export interface ComponentsObject {
    schemas?: Record<string, SchemaObject>;
    responses?: Record<string, ResponseObject>;
    parameters?: Record<string, ParameterObject>;
    examples?: Record<string, ExampleObject>;
    requestBodies?: Record<string, RequestBodyObject>;
    headers?: Record<string, HeaderObject>;
    securitySchemes?: Record<string, SecuritySchemeObject>;
    links?: Record<string, LinkObject>;
}

export interface SchemaObject {
    type?: string;
    properties?: Record<string, SchemaObject>;
    items?: SchemaObject;
    required?: string[];
    enum?: string[];
    description?: string;
}

export interface SecurityRequirementObject {
    [name: string]: string[];
}

export interface SecuritySchemeObject {
    type: "apiKey" | "http" | "oauth2" | "openIdConnect";
    description?: string;
    name?: string;
    in?: "query" | "header" | "cookie";
    scheme?: string;
    bearerFormat?: string;
    flows?: OAuthFlowsObject;
    openIdConnectUrl?: string;
}

export interface OAuthFlowsObject {
    implicit?: OAuthFlowObject;
    password?: OAuthFlowObject;
    clientCredentials?: OAuthFlowObject;
    authorizationCode?: OAuthFlowObject;
}

export interface OAuthFlowObject {
    authorizationUrl?: string;
    tokenUrl?: string;
    refreshUrl?: string;
    scopes: Record<string, string>;
}

export interface TagObject {
    name: string;
    description?: string;
    externalDocs?: ExternalDocumentationObject;
}

export interface ExternalDocumentationObject {
    description?: string;
    url: string;
}
