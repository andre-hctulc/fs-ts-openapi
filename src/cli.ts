#!/usr/bin/env node

import path from "path";
import { Parser } from "./parser";
import yaml from "js-yaml";
import { writeFileRecursive, formatJson, runChildProcess } from "./utils";
import { Command } from "commander";

const program = new Command();

program.name("fs-api").description("FS API CLI").version("0.8.0");

program
    .command("generate")
    .description("Generate an open api schema")
    .option("-p, --path <path>", "Path to the api directory")
    .option("-o, --out <path>", "Output path")
    .option(
        "--shadow <template>",
        "Shadow directories. These directories will not have an effect on the paths and can therefore be used for logical grouping. Disabled by default. Provide [dir] for example"
    )
    .option("--export-name <name>", "name of the interface to export. Default is Schema")
    .option(
        "--path-vars <template>",
        "Path variable pattern. Tells the parser how to identify path variables. Default is {var}"
    )
    .option("--skip-file-name", "Skip the file name in the path. The filename is included by default")
    .option(
        "-s, --scan <glob_patterns...>",
        "List of glob patterns for files to include in the api. Default is all .ts files"
    )
    .option("--base-config <path>", "Path to a base config")
    .option("--format <json|yaml>", "Output format", "json")
    .option("--orval", "Chain orval. Must be used with an orval config file")
    .option("--orval-config <path>", "Path to the orval config")
    .option("--disable-index-mapping", "Disable mapping index.ts to the base path")
    .action(async (options: any) => {
        const _in = path.resolve(options.path || ".");
        const isYaml = options.format === "yaml" || options.format === "yml";
        const out = options.out ? path.resolve(options.out) : path.resolve(isYaml ? "api.yaml" : "api.json");
        const parser = new Parser({
            scan: options.scan && options.scan.length > 0 ? options.scan : undefined,
            baseConfig: path.resolve(options.baseConfig || "."),
            shadowParenthesis: options.shadow,
            pathVarsParenthesis: options.pathVars,
            exportName: options.exportName,
            skipFileName: !!options.skipFileName,
            mapIndexToRoot: !options.disableIndexMapping,
        });
        const schema = parser.parse(_in);

        if (isYaml) {
            writeFileRecursive(out, yaml.dump(schema, {}));
        } else {
            writeFileRecursive(out, formatJson(schema));
        }

        if (options.orval || options.orvalConfig) {
            console.log("🐠 Running orval...");

            await runChildProcess("npx", [
                "orval",
                "generate",
                "--config",
                options.orvalConfig || "orval.config.js",
            ]);
        }

        console.log(`🍀 Generated ${out} from ${_in}`);
    });

// program
//     .command("watch")
//     .description("Split a string into substrings and display as an array")
//     .argument("<string>", "string to split")
//     .option("--first", "display just the first substring")
//     .option("-s, --separator <char>", "separator character", ",")
//     .action((str, options) => {
//         const limit = options.first ? 1 : undefined;
//         console.log(str.split(options.separator, limit));
//     });

program.parse();
