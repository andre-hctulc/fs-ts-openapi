import { SchemaInput } from "./input";
import { OpenAPISchema, OperationObject, SchemaObject } from "./openapi-schema";
import { globSync } from "glob";
import path from "path";
import fs from "fs";
import {
    CompilerOptions,
    Definition,
    generateSchema,
    getProgramFromFiles,
    PartialArgs,
} from "typescript-json-schema";
import { className, cutExtension, deepMerge, hasKeys } from "./utils";

const DEFAULT_EXPORT_NAME = "Schema";

const tjsCompilerOptions: CompilerOptions = {
    strictNullChecks: true,
};

/**
 * A template of what the interface should look like.
 */
interface InterfaceTemplate {
    [method: string]: {
        request: {
            headers: {
                "Content-Type": string;
            };
            content: {
                [contentType: string]: {
                    body?: {};
                };
            };
            search: {
                userId: string;
            };
        };
        responses: {
            [status: number]: {
                headers: {
                    "Content-Length": string;
                };
                content: {
                    [contentType: string]: {
                        body?: {};
                    };
                };
            };
        };
    };
}

export interface ParserConfig {
    /**
     * The export name of the interface.
     *
     * Defaults to _Schema_.
     */
    exportName?: string;
    /**
     * Defaults to _{var}_
     */
    pathVarsParenthesis?: string;
    /**
     * Detect shadow directories?
     *
     * Shadow directories have no influence on the endpoint path.
     *
     * By default no shadow directories are detected.
     *
     * Provide _[var]_ for example
     */
    shadowParenthesis?: string;
    /**
     * Glob patterns to scan for files to parse.
     * Defaults to _.ts_ files.
     */
    scan?: string[];
    /**
     * Base schema or path to base schema file
     */
    baseConfig?: string | Partial<OpenAPISchema>;
    /**
     * Leave the file name out of the paths
     */
    skipFileName?: boolean;
    /**
     * Map _index.ts_ to the base path. Defaults to _true_.
     */
    mapIndexToRoot?: boolean;
}

export class Parser {
    private _config: ParserConfig;

    constructor(config: ParserConfig) {
        this._config = config;
    }

    private getBaseSchema(): Partial<OpenAPISchema> {
        if (typeof this._config.baseConfig === "string")
            return SchemaInput.readFromFile(this._config.baseConfig);
        else return this._config.baseConfig || {};
    }

    parse(dir: string): OpenAPISchema {
        if (!fs.existsSync(dir) || !fs.statSync(dir).isDirectory()) {
            throw new Error("Invalid api directory (not a directory)");
        }

        const baseSchema = this.getBaseSchema();

        const schema: OpenAPISchema = {
            openapi: "3.0.3",
            info: {
                title: path.basename(dir),
                version: "0.0.1",
                description: "Auto generated by fs-api",
            },
            paths: {},
            components: {},
        };

        this.parseDir(dir, schema);

        // baseSchema overwrites schema
        return deepMerge(schema, baseSchema);
    }

    private parseDir(dir: string, schema: OpenAPISchema) {
        const files = globSync(this._config.scan || [dir + "/**/*.ts"]);
        files.forEach((file) => {
            try {
                this.parseFile(dir, file, schema);
            } catch (e) {
                console.error(`Error parsing file ${file}:\n${(e as Error).message}`);
            }
        });
    }

    private parseFile(dir: string, file: string, schema: OpenAPISchema) {
        const p = this.normalizePath(path.relative(dir, file));
        const interfaceSchema = this.parseInterface(file);

        if (!schema.paths[p]) schema.paths[p] = {};
        const pathObj = schema.paths[p];

        for (let method in interfaceSchema.properties) {
            method = method.toLowerCase();

            // as "get", so we get type checking
            pathObj[method as "get"] = this.parseOperation(
                method,
                p,
                schema,
                (interfaceSchema.properties[method] as SchemaObject) || {}
            );
        }
    }

    private idName(method: string, source: string, ...groups: string[]): string {
        if (this._config.skipFileName) source = path.dirname(source);
        else source = cutExtension(source);

        return (
            // start with http method
            className(method) +
            // path
            source
                .replace(/^\//, "")
                .split("/")
                .map((word) => className(word))
                .join("") +
            // groups
            groups.map((g) => className(g)).join("")
        );
    }

    private mapContentType(contentType: string): string {
        if (contentType === "application/json") return "JSON";
        if (contentType === "application/xml") return "XML";
        if (contentType === "text/plain") return "Text";
        if (contentType === "application/octet-stream") return "OctetStream";
        if (contentType === "application/x-www-form-urlencoded") return "FormUrlEncoded";
        if (contentType === "multipart/form-data") return "FormData";
        else return contentType;
    }

    private createComponentSchema(
        schema: OpenAPISchema,
        name: string,
        definition: SchemaObject
    ): SchemaObject {
        if (!schema.components) schema.components = {};
        if (!schema.components.schemas) schema.components.schemas = {};

        schema.components.schemas[name] = definition;

        return {
            $ref: `#/components/schemas/${name}`,
        } as any;
    }

    /**
     * Transforms the schema interface of a file to a JSON schema.
     * @returns The JSON schema.
     */
    private parseInterface(file: string): Definition {
        try {
            const settings: PartialArgs = {
                required: true,
            };

            const program = getProgramFromFiles([file], tjsCompilerOptions);
            const schema = generateSchema(program, this._config.exportName || DEFAULT_EXPORT_NAME, settings);

            if (!schema) throw new Error("Failed to generate schema: Empty schema");

            return schema;
        } catch (e) {
            throw new Error(`Error parsing interface ${file}:\n${(e as Error).message}`);
        }
    }

    private getParenthesisTemplate(
        userTemplate: string | null | undefined,
        defaultTemplate: string
    ): [string, string] {
        if (!userTemplate) return this.getParenthesisTemplate(defaultTemplate, "{var}");

        const template = userTemplate;
        const err = () => {
            throw new Error("Failed to parse template: " + template);
        };

        if (template.length < 2) err();

        const pStart = template[0];
        const pEnd = template[template.length - 1];

        return [pStart, pEnd];
    }

    private normalizePath(file: string) {
        file = file.toLocaleLowerCase();
        if (this._config.skipFileName) file = path.dirname(file);
        else file = cutExtension(file);

        const pathVarsParentheses = this.getParenthesisTemplate(this._config.pathVarsParenthesis, "{var}");

        // map custom path variables to openapi path variables
        const normVarsRegex = new RegExp(`\\${pathVarsParentheses[0]}(.*?)\\${pathVarsParentheses[1]}`, "g");
        file = file.replace(normVarsRegex, "{$1}");

        // remove shadow directories
        const shadowParentheses = this._config.shadowParenthesis
            ? this.getParenthesisTemplate(this._config.shadowParenthesis, "")
            : null;

        // remove shadow directories
        if (shadowParentheses) {
            const shadowRegex = new RegExp(`\\${shadowParentheses[0]}(.*?)\\${shadowParentheses[1]}`, "g");
            file = file.replace(shadowRegex, "");
        }

        // leading slash
        file = path.join("/", file);
        // normalize
        file = path.normalize(file);

        if (this._config.mapIndexToRoot !== false && file.endsWith("/index.ts")) file = path.dirname(file);

        return file;
    }

    private parseOperation(
        method: string,
        p: string,
        schema: OpenAPISchema,
        operationInterface: SchemaObject
    ): OperationObject {
        const operation: OperationObject = {
            // define all to enforce order
            parameters: [],
            requestBody: undefined,
            responses: {},
        };

        const requestInterface = operationInterface?.properties?.request;
        const resInterface = operationInterface?.properties?.responses;

        // search

        const searchInterface = requestInterface?.properties?.search;

        for (const searchName in searchInterface?.properties) {
            operation.parameters!.push({
                name: searchName,
                in: "query",
                required: searchInterface.properties[searchName].required?.includes(searchName),
                schema: {
                    type: "string",
                },
            });
        }

        // request headers

        const requestHeaders = requestInterface?.properties?.headers;

        for (const headerName in requestHeaders?.properties) {
            operation.parameters!.push({
                name: headerName,
                in: "header",
                required: requestHeaders.properties[headerName].required?.includes(headerName),
                schema: {
                    type: "string",
                },
            });
        }

        // request body

        const requestContents = requestInterface?.properties?.content;

        for (const contentType in requestContents?.properties) {
            const contentInterface = requestContents.properties[contentType];
            const bodyInterface = contentInterface.properties?.body;

            operation.requestBody = {
                content: {
                    [contentType]: {
                        schema: bodyInterface
                            ? this.createComponentSchema(
                                  schema,
                                  this.idName(method, p, this.mapContentType(contentType), "ReqBody"),
                                  bodyInterface
                              )
                            : undefined,
                    },
                },
            };
        }

        // response

        for (const resStatus in resInterface?.properties) {
            if (!operation.responses[resStatus])
                operation.responses[resStatus] = { description: "", headers: {}, content: {} };

            const resOperation = operation.responses[resStatus];

            // response headers

            const resStatusInterface = resInterface.properties[resStatus];
            const headersInterface = resStatusInterface.properties?.headers || {};

            for (const resHeaderName in headersInterface.properties) {
                resOperation.headers![resHeaderName] = {
                    schema: {
                        type: "string",
                    },
                    required: headersInterface.required?.includes(resHeaderName),
                };
            }

            // response content

            const contentsInterface = resStatusInterface.properties?.content;

            for (const contentType in contentsInterface?.properties) {
                const contentInterface = contentsInterface.properties[contentType];
                const bodyInterface = contentInterface?.properties?.body;

                resOperation.content![contentType] = {};

                if (bodyInterface) {
                    resOperation.content![contentType] = {
                        schema: this.createComponentSchema(
                            schema,
                            this.idName(method, p, this.mapContentType(contentType), "ResBody"),
                            bodyInterface
                        ),
                    };
                }
            }

            if (!hasKeys(resOperation.headers)) delete resOperation.headers;
            if (!hasKeys(resOperation.content)) delete resOperation.content;
        }

        if (!operation.parameters?.length) delete operation.parameters;

        return operation;
    }
}
