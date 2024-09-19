import fs from "fs";
import yaml from "js-yaml";
import { OpenAPISchema } from "./openapi-schema";

export abstract class SchemaInput {
    static readFromFile(filePath: string): OpenAPISchema {
        const isYaml = filePath.endsWith(".yaml") || filePath.endsWith(".yml");
        const fileContent = fs.readFileSync(filePath, "utf8");
        let schema: OpenAPISchema;

        try {
            schema = isYaml ? yaml.load(fileContent) : JSON.parse(fileContent);
        } catch (e) {
            throw new Error("Failed to read schema file:\n" + (e as Error).message);
        }

        if (typeof schema !== "object") {
            throw new Error("Schema is not an object");
        }

        return schema;
    }
}
