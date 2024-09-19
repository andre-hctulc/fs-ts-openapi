import fs from "fs";
import path from "path";

/**
 * Deep merge two objects. o2 overwrites o1.
 */
export function deepMerge(o1: unknown, o2: unknown) {
    if (typeof o1 !== "object" || typeof o2 !== "object") {
        return o2;
    }

    if (Array.isArray(o1) && Array.isArray(o2)) {
        return o2;
    }

    const result: any = { ...o1 };

    for (const key in o2) {
        if (o2.hasOwnProperty(key)) {
            if ((o1 as any).hasOwnProperty(key)) {
                result[key] = deepMerge((o1 as any)[key], (o2 as any)[key]);
            } else {
                result[key] = (o2 as any)[key];
            }
        }
    }

    return result;
}

export function className(idSource: string) {
    return idSource
        .replace(/[^a-zA-Z0-9]/g, "") // Remove special chars
        .replace(/^[a-z]/, (match) => match.toUpperCase());
}

export function writeFileRecursive(filePath: string, content: string) {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, content, "utf8");
}

export function formatJson(json: any, space = 4) {
    return JSON.stringify(json, null, space);
}

export function hasKeys(obj: any) {
    if (!obj) return false;
    return Object.keys(obj).length > 0;
}

export function cutExtension(p: string) {
    const last = p.lastIndexOf(".");
    return last === -1 ? p : p.substring(0, last);
}

export async function runChildProcess(command: string, args: string[]) {
    return new Promise<void>((resolve, reject) => {
        const child = require("child_process").spawn(command, args, {
            stdio: "inherit",
            shell: true,
        });

        child.on("exit", (code: number) => {
            if (code !== 0) {
                reject(new Error(`Command failed with code ${code}`));
                return;
            }
            resolve();
        });
    });
}
