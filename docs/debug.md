# Debug

## VS Code

Here is an example of how to test with the cli.

_launch.json_

```json
{
    "version": "0.2.0",
    "configurations": [
        {
            "name": "generate",
            "type": "node",
            "request": "launch",
            "program": "${workspaceFolder}/src/cli.ts",
            "args": [
                "generate",
                "-p",
                "test/api",
                "-o",
                "test/api.json",
                "--base-config",
                "test/base.api.json",
                "--shadow",
                "[dir]"
            ],
            "runtimeExecutable": "tsx",
            "console": "integratedTerminal",
            "internalConsoleOptions": "neverOpen",
            "skipFiles": ["<node_internals>/**", "${workspaceFolder}/node_modules/**"]
        },
        {
            "name": "generate <skip-file-name>",
            "type": "node",
            "request": "launch",
            "program": "${workspaceFolder}/src/cli.ts",
            "args": [
                "generate",
                "--skip-file-name",
                "-p",
                "test/api",
                "-o",
                "test/api.skip-file-name.json",
                "--base-config",
                "test/base.api.json",
                "--shadow",
                "[dir]"
            ],
            "runtimeExecutable": "tsx",
            "console": "integratedTerminal",
            "internalConsoleOptions": "neverOpen",
            "skipFiles": ["<node_internals>/**", "${workspaceFolder}/node_modules/**"]
        },
        {
            "name": "generate <orval>",
            "type": "node",
            "request": "launch",
            "program": "${workspaceFolder}/src/cli.ts",
            "args": [
                "generate",
                "-p",
                "test/api",
                "-o",
                "test/api.orval.json",
                "--base-config",
                "test/base.api.json",
                "--orval",
                "--orval-config",
                "test/orval.config.js",
                "--shadow",
                "[dir]"
            ],
            "runtimeExecutable": "tsx",
            "console": "integratedTerminal",
            "internalConsoleOptions": "neverOpen",
            "skipFiles": ["<node_internals>/**", "${workspaceFolder}/node_modules/**"]
        }
    ]
}

```
