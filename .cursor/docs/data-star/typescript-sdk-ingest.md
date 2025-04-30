================================================
FILE: sdk/typescript/README.md
================================================
# TypeScript SDK for Datastar

Implements the [SDK spec](../README.md) and exposes an abstract
ServerSentEventGenerator class that can be used to implement runtime specific
classes. NodeJS and web standard runtimes are currently implemented.

Currently it only exposes an http1 server, if you want http2 I recommend you use
a reverse proxy until http2 support is added.

Deno is used for building the npm package: `deno run -A build.ts VERSION`

Usage is straightforward:

```javascript
// this example is for node
const reader = await ServerSentEventGenerator.readSignals(req);

if (!reader.success) {
    console.error('Error while reading signals', reader.error);
    res.end('Error while reading signals`);
    return;
}

if (!('foo' in reader.signals)) {
    console.error('The foo signal is not present');
    res.end('The foo signal is not present');
    return;
}

ServerSentEventGenerator.stream(req, res, (stream) => {
     stream.mergeSignals({ foo: reader.signals.foo });
     stream.mergeFragments(`<div id="toMerge">Hello <span data-text="$foo">${reader.signals.foo}</span></div>`);
});
```

The stream static method can receive an extra `options` object that can contain
onError and onAbort callbacks as well as the keepalive option. The keepalive
option will stop the stream from being closed once the onStart callback is
finished. That means the user is responsible for ending the stream with
`this.close()`.

## Examples

Follow the links for more complete (and executable) examples

- [NodeJS](./examples/node.js)
- [Deno](./examples/deno.ts)

## Frameworks / Alternate runtimes

If you can't simply use the node / web versions, then you can extend the
abstract class in `./src/abstractServerSentEventGenerator.ts`. You will need to
provide implementations of the `constructor`, `readSignals`, `stream` and `send`
methods.

## Testing

A shell based testing suite is provided; see the [readme](../test/README.md) for
more information.

### Testing node

Start by building and running the node server

```shell
$ deno run -A build.ts xxx
$ node ./npm/esm/node/node.js
```

Then run the test suite

```shell
$ cd ../test
$ ./test-all.sh http://127.0.0.1:3000
Running tests with argument: http://127.0.0.1:3000
Processing GET cases...
Processing POST cases...
```

### Testing deno

Start by running the deno server

```shell
$ deno --allow-net  ./src/web/deno.ts
```

Then run the test suite

```shell
$ cd ../test
$ ./test-all.sh http://localhost:8000/
Running tests with argument: http://localhost:8000/
Processing GET cases...
Processing POST cases...
```



================================================
FILE: sdk/typescript/build.ts
================================================
// ex. scripts/build_npm.ts
import { build, emptyDir } from "@deno/dnt";

await emptyDir("./npm");

await build({
  entryPoints: ["./src/node/node.ts", "./src/web/serverSentEventGenerator.ts"],
  outDir: "./npm",
  shims: {
    // see JS docs for overview and more options
    deno: true,
  },
  package: {
    // package.json properties
    name: "datastar-sdk",
    version: Deno.args[0],
    description: "Cross-runtime Javascript SDK for Datastar",
    license: "MIT",
    repository: {
      type: "git",
      url: "git+https://github.com/starfederation/datastar.git",
    },
    bugs: {
      url: "https://github.com/starfederation/datastar/issues",
    },
  },
  postBuild() {
    // steps to run after building and before running the tests
    //Deno.copyFileSync("LICENSE", "npm/LICENSE");
    Deno.copyFileSync("README.md", "npm/README.md");
  },
  rootTestDir: "./src",
});



================================================
FILE: sdk/typescript/deno.json
================================================
{
  "imports": {
    "@deno/dnt": "jsr:@deno/dnt@^0.41.3"
  }
}



================================================
FILE: sdk/typescript/deno.lock
================================================
{
  "version": "4",
  "specifiers": {
    "jsr:@david/code-block-writer@^13.0.2": "13.0.3",
    "jsr:@deno/cache-dir@~0.10.3": "0.10.3",
    "jsr:@deno/dnt@~0.41.3": "0.41.3",
    "jsr:@deno/graph@~0.73.1": "0.73.1",
    "jsr:@std/assert@0.223": "0.223.0",
    "jsr:@std/assert@0.226": "0.226.0",
    "jsr:@std/bytes@0.223": "0.223.0",
    "jsr:@std/fmt@0.223": "0.223.0",
    "jsr:@std/fmt@1": "1.0.4",
    "jsr:@std/fs@0.223": "0.223.0",
    "jsr:@std/fs@1": "1.0.9",
    "jsr:@std/fs@~0.229.3": "0.229.3",
    "jsr:@std/io@0.223": "0.223.0",
    "jsr:@std/path@0.223": "0.223.0",
    "jsr:@std/path@1": "1.0.8",
    "jsr:@std/path@1.0.0-rc.1": "1.0.0-rc.1",
    "jsr:@std/path@^1.0.8": "1.0.8",
    "jsr:@std/path@~0.225.2": "0.225.2",
    "jsr:@ts-morph/bootstrap@0.24": "0.24.0",
    "jsr:@ts-morph/common@0.24": "0.24.0",
    "npm:@types/node@^22.10.2": "22.10.5",
    "npm:deepmerge-ts@^7.1.4": "7.1.4",
    "npm:type-fest@^4.32.0": "4.32.0",
    "npm:typescript@~5.6.2": "5.6.3"
  },
  "jsr": {
    "@david/code-block-writer@13.0.3": {
      "integrity": "f98c77d320f5957899a61bfb7a9bead7c6d83ad1515daee92dbacc861e13bb7f"
    },
    "@deno/cache-dir@0.10.3": {
      "integrity": "eb022f84ecc49c91d9d98131c6e6b118ff63a29e343624d058646b9d50404776",
      "dependencies": [
        "jsr:@deno/graph",
        "jsr:@std/fmt@0.223",
        "jsr:@std/fs@0.223",
        "jsr:@std/io",
        "jsr:@std/path@0.223"
      ]
    },
    "@deno/dnt@0.41.3": {
      "integrity": "b2ef2c8a5111eef86cb5bfcae103d6a2938e8e649e2461634a7befb7fc59d6d2",
      "dependencies": [
        "jsr:@david/code-block-writer",
        "jsr:@deno/cache-dir",
        "jsr:@std/fmt@1",
        "jsr:@std/fs@1",
        "jsr:@std/path@1",
        "jsr:@ts-morph/bootstrap"
      ]
    },
    "@deno/graph@0.73.1": {
      "integrity": "cd69639d2709d479037d5ce191a422eabe8d71bb68b0098344f6b07411c84d41"
    },
    "@std/assert@0.223.0": {
      "integrity": "eb8d6d879d76e1cc431205bd346ed4d88dc051c6366365b1af47034b0670be24"
    },
    "@std/assert@0.226.0": {
      "integrity": "0dfb5f7c7723c18cec118e080fec76ce15b4c31154b15ad2bd74822603ef75b3"
    },
    "@std/bytes@0.223.0": {
      "integrity": "84b75052cd8680942c397c2631318772b295019098f40aac5c36cead4cba51a8"
    },
    "@std/fmt@0.223.0": {
      "integrity": "6deb37794127dfc7d7bded2586b9fc6f5d50e62a8134846608baf71ffc1a5208"
    },
    "@std/fmt@1.0.4": {
      "integrity": "e14fe5bedee26f80877e6705a97a79c7eed599e81bb1669127ef9e8bc1e29a74"
    },
    "@std/fs@0.223.0": {
      "integrity": "3b4b0550b2c524cbaaa5a9170c90e96cbb7354e837ad1bdaf15fc9df1ae9c31c"
    },
    "@std/fs@0.229.3": {
      "integrity": "783bca21f24da92e04c3893c9e79653227ab016c48e96b3078377ebd5222e6eb",
      "dependencies": [
        "jsr:@std/path@1.0.0-rc.1"
      ]
    },
    "@std/fs@1.0.9": {
      "integrity": "3eef7e3ed3d317b29432c7dcb3b20122820dbc574263f721cb0248ad91bad890",
      "dependencies": [
        "jsr:@std/path@^1.0.8"
      ]
    },
    "@std/io@0.223.0": {
      "integrity": "2d8c3c2ab3a515619b90da2c6ff5ea7b75a94383259ef4d02116b228393f84f1",
      "dependencies": [
        "jsr:@std/assert@0.223",
        "jsr:@std/bytes"
      ]
    },
    "@std/path@0.223.0": {
      "integrity": "593963402d7e6597f5a6e620931661053572c982fc014000459edc1f93cc3989",
      "dependencies": [
        "jsr:@std/assert@0.223"
      ]
    },
    "@std/path@0.225.2": {
      "integrity": "0f2db41d36b50ef048dcb0399aac720a5348638dd3cb5bf80685bf2a745aa506",
      "dependencies": [
        "jsr:@std/assert@0.226"
      ]
    },
    "@std/path@1.0.0-rc.1": {
      "integrity": "b8c00ae2f19106a6bb7cbf1ab9be52aa70de1605daeb2dbdc4f87a7cbaf10ff6"
    },
    "@std/path@1.0.8": {
      "integrity": "548fa456bb6a04d3c1a1e7477986b6cffbce95102d0bb447c67c4ee70e0364be"
    },
    "@ts-morph/bootstrap@0.24.0": {
      "integrity": "a826a2ef7fa8a7c3f1042df2c034d20744d94da2ee32bf29275bcd4dffd3c060",
      "dependencies": [
        "jsr:@ts-morph/common"
      ]
    },
    "@ts-morph/common@0.24.0": {
      "integrity": "12b625b8e562446ba658cdbe9ad77774b4bd96b992ae8bd34c60dbf24d06c1f3",
      "dependencies": [
        "jsr:@std/fs@~0.229.3",
        "jsr:@std/path@~0.225.2"
      ]
    }
  },
  "npm": {
    "@types/node@22.10.5": {
      "integrity": "sha512-F8Q+SeGimwOo86fiovQh8qiXfFEh2/ocYv7tU5pJ3EXMSSxk1Joj5wefpFK2fHTf/N6HKGSxIDBT9f3gCxXPkQ==",
      "dependencies": [
        "undici-types"
      ]
    },
    "deepmerge-ts@7.1.4": {
      "integrity": "sha512-fxqo6nHGQ9zOVgI4KXqtWXJR/yCLtC7aXIVq+6jc8tHPFUxlFmuUcm2kC4vztQ+LJxQ3gER/XAWearGYQ8niGA=="
    },
    "type-fest@4.32.0": {
      "integrity": "sha512-rfgpoi08xagF3JSdtJlCwMq9DGNDE0IMh3Mkpc1wUypg9vPi786AiqeBBKcqvIkq42azsBM85N490fyZjeUftw=="
    },
    "typescript@5.6.3": {
      "integrity": "sha512-hjcS1mhfuyi4WW8IWtjP7brDrG2cuDZukyrYrSauoXGNgx0S7zceP07adYkJycEr56BOUTNPzbInooiN3fn1qw=="
    },
    "undici-types@6.20.0": {
      "integrity": "sha512-Ny6QZ2Nju20vw1SRHe3d9jVu6gJ+4e3+MMpqu7pqE5HT6WsTSlce++GQmK5UXS8mzV8DSYHrQH+Xrf2jVcuKNg=="
    }
  },
  "remote": {
    "https://deno.land/std@0.140.0/async/abortable.ts": "87aa7230be8360c24ad437212311c9e8d4328854baec27b4c7abb26e85515c06",
    "https://deno.land/std@0.140.0/async/deadline.ts": "48ac998d7564969f3e6ec6b6f9bf0217ebd00239b1b2292feba61272d5dd58d0",
    "https://deno.land/std@0.140.0/async/debounce.ts": "564273ef242bcfcda19a439132f940db8694173abffc159ea34f07d18fc42620",
    "https://deno.land/std@0.140.0/async/deferred.ts": "bc18e28108252c9f67dfca2bbc4587c3cbf3aeb6e155f8c864ca8ecff992b98a",
    "https://deno.land/std@0.140.0/async/delay.ts": "cbbdf1c87d1aed8edc7bae13592fb3e27e3106e0748f089c263390d4f49e5f6c",
    "https://deno.land/std@0.140.0/async/mod.ts": "6e42e275b44367361a81842dd1a789c55ab206d7c8a877d7163ab5c460625be6",
    "https://deno.land/std@0.140.0/async/mux_async_iterator.ts": "f4d1d259b0c694d381770ddaaa4b799a94843eba80c17f4a2ec2949168e52d1e",
    "https://deno.land/std@0.140.0/async/pool.ts": "97b0dd27c69544e374df857a40902e74e39532f226005543eabacb551e277082",
    "https://deno.land/std@0.140.0/async/tee.ts": "1341feb1f5b1a96f8628d0f8fc07d8c43d3813423f18a63bf1b4785568d21b1f",
    "https://deno.land/std@0.140.0/http/server.ts": "3da75405704bebcf212a55966a68a489f7e094ba52b5d38f181fe0ef8461a55d"
  },
  "workspace": {
    "dependencies": [
      "jsr:@deno/dnt@~0.41.3"
    ],
    "packageJson": {
      "dependencies": [
        "npm:@types/node@^22.10.2",
        "npm:deepmerge-ts@^7.1.4",
        "npm:type-fest@^4.32.0",
        "npm:typescript@~5.6.2"
      ]
    }
  }
}



================================================
FILE: sdk/typescript/package.json
================================================
{
  "name": "@starfederation/datastar-sdk",
  "version": "0.0.1",
  "description": "TypeScript SDK for Datastar",
  "scripts": {
    "check": "deno lint && deno check src/node/node.ts && deno check src/web/deno.ts",
    "serve-deno": "deno run -A src/web/deno.ts",
    "serve-node": "deno run -A build.ts && node npm/esm/node/node.js"
  },
  "type": "module",
  "repository": {
    "type": "git",
    "url": "git+https://github.com/starfederation/datastar.git"
  },
  "author": "Patrick Marchand",
  "license": "MIT",
  "bugs": {
    "url": "https://github.com/starfederation/datastar/issues"
  },
  "homepage": "https://github.com/starfederation/datastar#readme",
  "dependencies": {
    "deepmerge-ts": "^7.1.4"
  },
  "devDependencies": {
    "typescript": "~5.6.2",
    "@types/node": "^22.10.2",
    "type-fest": "^4.32.0"
  }
}



================================================
FILE: sdk/typescript/pnpm-lock.yaml
================================================
lockfileVersion: "9.0"

settings:
  autoInstallPeers: true
  excludeLinksFromLockfile: false

importers:
  .:
    dependencies:
      "@types/node":
        specifier: ^22.10.2
        version: 22.10.2
      deepmerge-ts:
        specifier: ^7.1.4
        version: 7.1.4
      type-fest:
        specifier: ^4.32.0
        version: 4.32.0
    devDependencies:
      typescript:
        specifier: ~5.6.2
        version: 5.6.3

packages:
  "@types/node@22.10.2":
    resolution: {
      integrity: sha512-Xxr6BBRCAOQixvonOye19wnzyDiUtTeqldOOmj3CkeblonbccA12PFwlufvRdrpjXxqnmUaeiU5EOA+7s5diUQ==,
    }

  deepmerge-ts@7.1.4:
    resolution: {
      integrity: sha512-fxqo6nHGQ9zOVgI4KXqtWXJR/yCLtC7aXIVq+6jc8tHPFUxlFmuUcm2kC4vztQ+LJxQ3gER/XAWearGYQ8niGA==,
    }
    engines: { node: ">=16.0.0" }

  type-fest@4.32.0:
    resolution: {
      integrity: sha512-rfgpoi08xagF3JSdtJlCwMq9DGNDE0IMh3Mkpc1wUypg9vPi786AiqeBBKcqvIkq42azsBM85N490fyZjeUftw==,
    }
    engines: { node: ">=16" }

  typescript@5.6.3:
    resolution: {
      integrity: sha512-hjcS1mhfuyi4WW8IWtjP7brDrG2cuDZukyrYrSauoXGNgx0S7zceP07adYkJycEr56BOUTNPzbInooiN3fn1qw==,
    }
    engines: { node: ">=14.17" }
    hasBin: true

  undici-types@6.20.0:
    resolution: {
      integrity: sha512-Ny6QZ2Nju20vw1SRHe3d9jVu6gJ+4e3+MMpqu7pqE5HT6WsTSlce++GQmK5UXS8mzV8DSYHrQH+Xrf2jVcuKNg==,
    }

snapshots:
  "@types/node@22.10.2":
    dependencies:
      undici-types: 6.20.0

  deepmerge-ts@7.1.4: {}

  type-fest@4.32.0: {}

  typescript@5.6.3: {}

  undici-types@6.20.0: {}



================================================
FILE: sdk/typescript/tsconfig.json
================================================
{
  "compilerOptions": {
    "esModuleInterop": true,
    "skipLibCheck": true,
    "target": "es2022",
    "resolveJsonModule": true,
    "moduleDetection": "force",
    "isolatedModules": true,
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,

    "module": "commonjs",
    "outDir": "dist",
    "sourceMap": true,

    "declaration": true,
    "lib": ["es2022"]
  },
  "include": ["src/**/*.ts"],
  "exclude": ["src/web/deno.ts"]
}



================================================
FILE: sdk/typescript/.gitignore
================================================
# Logs
logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*
lerna-debug.log*

node_modules
dist
dist-ssr
*.local

# Editor directories and files
.vscode/*
!.vscode/extensions.json
.idea
.DS_Store
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?
npm


================================================
FILE: sdk/typescript/examples/deno.ts
================================================
import { serve } from "https://deno.land/std@0.140.0/http/server.ts";
import { ServerSentEventGenerator } from "../src/web/serverSentEventGenerator.ts";

serve(async (req: Request) => {
  const url = new URL(req.url);

  if (url.pathname === "/") {
    return new Response(
      `<html><head><script type="module" src="https://cdn.jsdelivr.net/gh/starfederation/datastar@v1.0.0-beta.1/bundles/datastar.js"></script></head><body><div id="toMerge" data-signals-foo="'World'" data-on-load="@get('/merge')">Hello</div></body></html>`,
      {
        headers: { "Content-Type": "text/html" },
      },
    );
  } else if (url.pathname.includes("/merge")) {
    const reader = await ServerSentEventGenerator.readSignals(req);

    if (!reader.success) {
      console.error("Error while reading signals", reader.error);

      return new Response(`Error while reading signals`, {
        headers: { "Content-Type": "text/html" },
      });
    }

    if (!("foo" in reader.signals)) {
      console.error("The foo signal is not present");

      return new Response("The foo signal is not present", {
        headers: { "Content-Type": "text/html" },
      });
    }

    return ServerSentEventGenerator.stream((stream) => {
      stream.mergeFragments(
        `<div id="toMerge">Hello ${reader.signals.foo}</div>`,
      );
    });
  }

  return new Response(`Path not found: ${req.url}`, {
    headers: { "Content-Type": "text/html" },
  });
});



================================================
FILE: sdk/typescript/examples/node.js
================================================
import { createServer } from "node:http";
// for this to work the esm build needs to be generated, see ../README.md
import { ServerSentEventGenerator } from "../npm/esm/node/serverSentEventGenerator.js";

const hostname = "127.0.0.1";
const port = 3000;

const server = createServer(async (req, res) => {
  if (req.url === "/") {
    const headers = new Headers({ "Content-Type": "text/html" });
    res.setHeaders(headers);
    res.end(
      `<html><head><script type="module" src="https://cdn.jsdelivr.net/gh/starfederation/datastar@v1.0.0-beta.1/bundles/datastar.js"></script></head><body><div id="toMerge" data-signals-foo="'World'" data-on-load="@get('/merge')">Hello</div></body></html>`,
    );
  } else if (req.url?.includes("/merge")) {
    const reader = await ServerSentEventGenerator.readSignals(req);

    if (!reader.success) {
      console.error("Error while reading signals", reader.error);
      res.end(`Error while reading signals`);
      return;
    }

    if (!("foo" in reader.signals)) {
      console.error("The foo signal is not present");

      res.end("The foo signal is not present");
      return;
    }

    ServerSentEventGenerator.stream(req, res, (stream) => {
      stream.mergeFragments(
        `<div id="toMerge">Hello ${reader.signals.foo}</div>`,
      );
    });
  } else {
    res.end("Path not found");
  }
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});



================================================
FILE: sdk/typescript/src/abstractServerSentEventGenerator.ts
================================================
import {
  DatastarEventOptions,
  DefaultMapping,
  EventType,
  ExecuteScriptOptions,
  FragmentOptions,
  MergeFragmentsOptions,
  MergeSignalsOptions,
} from "./types.ts";

import {
  DefaultExecuteScriptAttributes,
  DefaultSseRetryDurationMs,
} from "./consts.ts";

import type { Jsonifiable } from "npm:type-fest";

/**
 * Abstract ServerSentEventGenerator class, responsible for initializing and handling
 * server-sent events (SSE) as well as reading signals sent by the client.
 *
 * The concrete implementation must override the send and constructor methods as well
 * as implement readSignals and stream static methods.
 */
export abstract class ServerSentEventGenerator {
  protected constructor() {}

  /**
   * Sends a server-sent event (SSE) to the client.
   *
   * Runtimes should override this method by calling the parent function
   *  with `super.send(event, dataLines, options)`. That will return all the
   * datalines as an array of strings that should be streamed to the client.
   *
   * @param eventType - The type of the event.
   * @param dataLines - Lines of data to send.
   * @param [sendOptions] - Additional options for sending events.
   */
  protected send(
    event: EventType,
    dataLines: string[],
    options: DatastarEventOptions,
  ): string[] {
    const { eventId, retryDuration } = options || {};

    const typeLine = [`event: ${event}\n`];
    const idLine = eventId ? [`id: ${eventId}\n`] : [];
    const retryLine = !retryDuration || retryDuration === 1000 ? [] : [
      `retry: ${retryDuration ?? DefaultSseRetryDurationMs}\n`,
    ];

    return typeLine.concat(
      idLine,
      retryLine,
      dataLines.map((data) => {
        return `data: ${data}\n`;
      }),
      ["\n\n"],
    );
  }

  private eachNewlineIsADataLine(prefix: string, data: string) {
    return data.split("\n").map((line) => {
      return `${prefix} ${line}`;
    });
  }

  private eachOptionIsADataLine(
    options: Record<string, Jsonifiable>,
  ): string[] {
    return Object.keys(options).filter((key) => {
      return !this.hasDefaultValue(key, options[key as keyof typeof options]);
    }).flatMap((key) => {
      return this.eachNewlineIsADataLine(
        key,
        options[key as keyof typeof options]!.toString(),
      );
    });
  }

  private hasDefaultValue(key: string, val: unknown): boolean {
    if (key in DefaultMapping) {
      return val === DefaultMapping[key as keyof typeof DefaultMapping];
    }

    return false;
  }

  /**
   * Sends a merge fragments event.
   *
   * @param fragments - HTML fragments that will be merged.
   * @param [options] - Additional options for merging.
   */
  public mergeFragments(
    data: string,
    options?: MergeFragmentsOptions,
  ): ReturnType<typeof this.send> {
    const { eventId, retryDuration, ...renderOptions } = options ||
      {} as Partial<MergeFragmentsOptions>;

    const dataLines = this.eachOptionIsADataLine(renderOptions)
      .concat(this.eachNewlineIsADataLine("fragments", data));

    return this.send("datastar-merge-fragments", dataLines, {
      eventId,
      retryDuration,
    });
  }

  /**
   * Sends a remove fragments event.
   *
   * @param selector - CSS selector of fragments to remove.
   * @param [options] - Additional options for removing.
   */
  public removeFragments(selector: string, options?: FragmentOptions) {
    const { eventId, retryDuration, ...eventOptions } = options ||
      {} as Partial<FragmentOptions>;
    const dataLines = this.eachOptionIsADataLine(eventOptions)
      .concat(this.eachNewlineIsADataLine("selector", selector));

    return this.send("datastar-remove-fragments", dataLines, {
      eventId,
      retryDuration,
    });
  }

  /**
   * Sends a merge signals event.
   *
   * @param data - Data object or json string that will be merged into the client's signals.
   * @param [options] - Additional options for merging.
   */
  public mergeSignals(
    data: Record<string, Jsonifiable> | string,
    options?: MergeSignalsOptions,
  ): ReturnType<typeof this.send> {
    const { eventId, retryDuration, ...eventOptions } = options ||
      {} as Partial<MergeSignalsOptions>;

    const signals = typeof data === "string" ? data : JSON.stringify(data);
    const dataLines = this.eachOptionIsADataLine(eventOptions)
      .concat(this.eachNewlineIsADataLine("signals", signals));

    return this.send("datastar-merge-signals", dataLines, {
      eventId,
      retryDuration,
    });
  }

  /**
   * Sends a remove signals event.
   *
   * @param paths - An array of paths or a string containing space separated paths.
   * @param [options] - Additional options for removing signals.
   */
  public removeSignals(
    paths: string[] | string,
    options?: DatastarEventOptions,
  ): ReturnType<typeof this.send> {
    const eventOptions = options || {} as DatastarEventOptions;
    const pathsArray = typeof paths === "string"
      ? paths.split(" ")
      : paths.flatMap((path) => path.split(" "));

    const dataLines = pathsArray.map((path) => `paths ${path}`);

    return this.send("datastar-remove-signals", dataLines, eventOptions);
  }

  /**
   * Executes a script on the client-side.
   *
   * @param script - Script code to execute.
   * @param [options] - Additional options for execution.
   */
  public executeScript(
    script: string,
    options?: ExecuteScriptOptions,
  ): ReturnType<typeof this.send> {
    const {
      eventId,
      retryDuration,
      attributes,
      ...eventOptions
    } = options || {} as Partial<ExecuteScriptOptions>;
    const attributesArray = attributes instanceof Array
      ? attributes
      : this.eachOptionIsADataLine(attributes ?? {});

    const attributesDataLines = attributesArray.filter((line) => {
      const parts = line.split(" ");
      const defaultParts = DefaultExecuteScriptAttributes.split(" ");
      if (parts[0] === defaultParts[0] && parts[1]) {
        return parts[1] !== defaultParts[1];
      }
      return true;
    }).map((line) => `attributes ${line}`);

    const dataLines = attributesDataLines.concat(
      this.eachOptionIsADataLine(eventOptions),
      this.eachNewlineIsADataLine("script", script),
    );

    return this.send("datastar-execute-script", dataLines, {
      eventId,
      retryDuration,
    });
  }
}



================================================
FILE: sdk/typescript/src/consts.ts
================================================
// This is auto-generated by Datastar. DO NOT EDIT.

export const DATASTAR = "datastar" as const;
export const DATASTAR_REQUEST = "Datastar-Request";
export const VERSION = "1.0.0-beta.11";

// #region Defaults

// #region Default durations

// The default duration for retrying SSE on connection reset. This is part of the underlying retry mechanism of SSE.
export const DefaultSseRetryDurationMs = 1000;

// #endregion


// #region Default strings

// The default attributes for <script/> element use when executing scripts. It is a set of key-value pairs delimited by a newline \\n character.
export const DefaultExecuteScriptAttributes = "type module";

// #endregion


// #region Default booleans

// Should fragments be merged using the ViewTransition API?
export const DefaultFragmentsUseViewTransitions = false;

// Should a given set of signals merge if they are missing?
export const DefaultMergeSignalsOnlyIfMissing = false;

// Should script element remove itself after execution?
export const DefaultExecuteScriptAutoRemove = true;

// #endregion

// #region Datalines

export const DatastarDatalineSelector = "selector"
export const DatastarDatalineMergeMode = "mergeMode"
export const DatastarDatalineFragments = "fragments"
export const DatastarDatalineUseViewTransition = "useViewTransition"
export const DatastarDatalineSignals = "signals"
export const DatastarDatalineOnlyIfMissing = "onlyIfMissing"
export const DatastarDatalinePaths = "paths"
export const DatastarDatalineScript = "script"
export const DatastarDatalineAttributes = "attributes"
export const DatastarDatalineAutoRemove = "autoRemove"
// #endregion


// #region Enums

// The mode in which a fragment is merged into the DOM.
export const FragmentMergeModes = [
// Morphs the fragment into the existing element using idiomorph.
    "morph",
// Replaces the inner HTML of the existing element.
    "inner",
// Replaces the outer HTML of the existing element.
    "outer",
// Prepends the fragment to the existing element.
    "prepend",
// Appends the fragment to the existing element.
    "append",
// Inserts the fragment before the existing element.
    "before",
// Inserts the fragment after the existing element.
    "after",
// Upserts the attributes of the existing element.
    "upsertAttributes",
] as const;

// Default value for FragmentMergeMode
export const DefaultFragmentMergeMode = "morph";

// The type protocol on top of SSE which allows for core pushed based communication between the server and the client.
export const EventTypes = [
// An event for merging HTML fragments into the DOM.
    "datastar-merge-fragments",
// An event for merging signals.
    "datastar-merge-signals",
// An event for removing HTML fragments from the DOM.
    "datastar-remove-fragments",
// An event for removing signals.
    "datastar-remove-signals",
// An event for executing <script/> elements in the browser.
    "datastar-execute-script",
] as const;
// #endregion

// #endregion


================================================
FILE: sdk/typescript/src/types.ts
================================================
import {
  DatastarDatalineAttributes,
  DatastarDatalineAutoRemove,
  DatastarDatalineFragments,
  DatastarDatalineMergeMode,
  DatastarDatalineOnlyIfMissing,
  DatastarDatalinePaths,
  DatastarDatalineScript,
  DatastarDatalineSelector,
  DatastarDatalineSignals,
  DatastarDatalineUseViewTransition,
  DefaultExecuteScriptAttributes,
  DefaultExecuteScriptAutoRemove,
  DefaultFragmentMergeMode,
  DefaultFragmentsUseViewTransitions,
  DefaultMergeSignalsOnlyIfMissing,
  EventTypes,
  FragmentMergeModes,
} from "./consts.ts";
import type { Jsonifiable } from "npm:type-fest";

export type FragmentMergeMode = typeof FragmentMergeModes[number];
export type EventType = typeof EventTypes[number];

export interface DatastarEventOptions {
  eventId?: string;
  retryDuration?: number;
}

export interface FragmentOptions extends DatastarEventOptions {
  [DatastarDatalineUseViewTransition]?: boolean;
}

export interface MergeFragmentsOptions extends FragmentOptions {
  [DatastarDatalineMergeMode]?: FragmentMergeMode;
  [DatastarDatalineSelector]?: string;
}

export interface MergeFragmentsEvent {
  event: "datastar-merge-fragments";
  options: MergeFragmentsOptions;
  [DatastarDatalineFragments]: string;
}

export interface RemoveFragmentsEvent {
  event: "datastar-remove-fragments";
  options: FragmentOptions;
  [DatastarDatalineSelector]: string;
}

export interface MergeSignalsOptions extends DatastarEventOptions {
  [DatastarDatalineOnlyIfMissing]?: boolean;
}

export interface MergeSignalsEvent {
  event: "datastar-merge-signals";
  options: MergeSignalsOptions;
  [DatastarDatalineSignals]: Record<string, Jsonifiable>;
}

export interface RemoveSignalsEvent {
  event: "datastar-remove-signals";
  options: DatastarEventOptions;
  [DatastarDatalinePaths]: string[];
}
type ScriptAttributes = {
  type?: "module" | "importmap" | "speculationrules" | "text/javascript";
  refererpolicy:
    | "no-referrer"
    | "no-referrer-when-downgrade"
    | "origin"
    | "origin-when-cross-origin"
    | "same-origin"
    | "strict-origin"
    | "strict-origin-when-cross-origin"
    | "unsafe-url";
  nonce?: string;
  nomodule?: boolean;
  integrity?: string;
  fetchpriority?: "high" | "low" | "auto";
  crossorigin?: "anonymous" | "use-credentials";
  blocking?: boolean;
  attributionsrc?: boolean | string;
  src?: string;
} & {
  src: string;
  defer: true;
} & {
  src: string;
  async: true;
};

export interface ExecuteScriptOptions extends DatastarEventOptions {
  [DatastarDatalineAutoRemove]?: boolean;
  [DatastarDatalineAttributes]?: ScriptAttributes | string[];
}

export interface ExecuteScriptEvent {
  event: "datastar-execute-script";
  options: ExecuteScriptOptions;
  [DatastarDatalineScript]: string;
}

export const sseHeaders = {
  "Cache-Control": "no-cache",
  "Connection": "keep-alive",
  "Content-Type": "text/event-stream",
} as const;

export type MultilineDatalinePrefix =
  | typeof DatastarDatalineScript
  | typeof DatastarDatalineFragments
  | typeof DatastarDatalineSignals;

export type DatastarEventOptionsUnion =
  | MergeFragmentsOptions
  | FragmentOptions
  | MergeSignalsOptions
  | DatastarEventOptions
  | ExecuteScriptOptions;

export type DatastarEvent =
  | MergeFragmentsEvent
  | RemoveFragmentsEvent
  | MergeSignalsEvent
  | RemoveSignalsEvent
  | ExecuteScriptEvent;

export const DefaultMapping = {
  [DatastarDatalineMergeMode]: DefaultFragmentMergeMode,
  [DatastarDatalineUseViewTransition]: DefaultFragmentsUseViewTransitions,
  [DatastarDatalineOnlyIfMissing]: DefaultMergeSignalsOnlyIfMissing,
  [DatastarDatalineAttributes]: {
    [DefaultExecuteScriptAttributes.split(" ")[0]]:
      DefaultExecuteScriptAttributes.split(" ")[1],
  },
  [DatastarDatalineAutoRemove]: DefaultExecuteScriptAutoRemove,
} as const;



================================================
FILE: sdk/typescript/src/node/node.ts
================================================
import { VERSION } from "../consts.ts";
import { createServer } from "node:http";
import { ServerSentEventGenerator } from "./serverSentEventGenerator.ts";
import type { Jsonifiable } from "npm:type-fest";

const hostname = "127.0.0.1";
const port = 3000;

// This server is used for testing the node sdk
const server = createServer(async (req, res) => {
  if (req.url === "/") {
    const headers = new Headers({ "Content-Type": "text/html" });
    res.setHeaders(headers);
    res.end(
      `<html><head><script type="module" src="https://cdn.jsdelivr.net/gh/starfederation/datastar@v${VERSION}/bundles/datastar.js"></script></head><body><div id="toMerge" data-signals-foo="'World'" data-on-load="@get('/merge')">Hello</div></body></html>`,
    );
  } else if (req.url?.includes("/test")) {
    const reader = await ServerSentEventGenerator.readSignals(req);
    if (reader.success) {
      const events = reader.signals.events;
      if (isEventArray(events)) {
        ServerSentEventGenerator.stream(req, res, (stream) => {
          testEvents(stream, events);
        });
      }
    } else {
      res.end(reader.error);
    }
  } else if (req.url?.includes("/await")) {
    ServerSentEventGenerator.stream(req, res, async (stream) => {
      stream.mergeFragments('<div id="toMerge">Merged</div>');
      await delay(5000);
      stream.mergeFragments('<div id="toMerge">After 10 seconds</div>');
    });
  } else {
    res.end("Path not found");
  }
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});

function delay(milliseconds: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });
}

function isEventArray(
  events: unknown,
): events is (Record<string, Jsonifiable> & { type: string })[] {
  return events instanceof Array && events.every((event) => {
    return typeof event === "object" && event !== null &&
      typeof event.type === "string";
  });
}

function testEvents(
  stream: ServerSentEventGenerator,
  events: Record<string, Jsonifiable>[],
) {
  events.forEach((event) => {
    const { type, ...e } = event;
    switch (type) {
      case "mergeFragments":
        if (e !== null && typeof e === "object" && "fragments" in e) {
          const { fragments, ...options } = e;
          stream.mergeFragments(fragments as string, options || undefined);
        }
        break;
      case "removeFragments":
        if (e !== null && typeof e === "object" && "selector" in e) {
          const { selector, ...options } = e;
          stream.removeFragments(selector as string, options || undefined);
        }
        break;
      case "mergeSignals":
        if (e !== null && typeof e === "object" && "signals" in e) {
          const { signals, ...options } = e;
          stream.mergeSignals(
            signals as Record<string, Jsonifiable>,
            options || undefined,
          );
        }
        break;
      case "removeSignals":
        if (e !== null && typeof e === "object" && "paths" in e) {
          const { paths, ...options } = e;
          stream.removeSignals(paths as string[], options || undefined);
        }
        break;
      case "executeScript":
        if (e !== null && typeof e === "object" && "script" in e) {
          const { script, ...options } = e;
          stream.executeScript(script as string, options || undefined);
        }
        break;
    }
  });
}



================================================
FILE: sdk/typescript/src/node/serverSentEventGenerator.ts
================================================
import { DatastarEventOptions, EventType, sseHeaders } from "../types.ts";

import { ServerSentEventGenerator as AbstractSSEGenerator } from "../abstractServerSentEventGenerator.ts";

import { IncomingMessage, ServerResponse } from "node:http";
import process from "node:process";
import type { Jsonifiable } from "npm:type-fest";

function isRecord(obj: unknown): obj is Record<string, Jsonifiable> {
  return typeof obj === "object" && obj !== null;
}

/**
 * ServerSentEventGenerator class, responsible for initializing and handling
 * server-sent events (SSE) as well as reading signals sent by the client.
 * Cannot be instantiated directly, you must use the stream static method.
 */
export class ServerSentEventGenerator extends AbstractSSEGenerator {
  protected req: IncomingMessage;
  protected res: ServerResponse;

  protected constructor(req: IncomingMessage, res: ServerResponse) {
    super();
    this.req = req;
    this.res = res;

    this.res.writeHead(200, sseHeaders);
  }

  /**
   * Initializes the server-sent event generator and executes the onStart callback.
   *
   * @param req - The NodeJS request object.
   * @param res - The NodeJS response object.
   * @param onStart - A function that will be passed the initialized ServerSentEventGenerator class as it's first parameter.
   * @param options? - An object that can contain onError and onCancel callbacks as well as a keepalive boolean.
   * The onAbort callback will be called whenever the request is aborted
   *
   * The onError callback will be called whenever an error is met. If provided, the onAbort callback will also be executed.
   * If an onError callback is not provided, then the stream will be ended and the error will be thrown up.
   *
   * The stream is always closed after the onStart callback ends.
   * If onStart is non blocking, but you still need the stream to stay open after it is called,
   * then the keepalive option will maintain it open until the request is aborted by the client.
   */
  static async stream(
    req: IncomingMessage,
    res: ServerResponse,
    onStart: (stream: ServerSentEventGenerator) => Promise<void> | void,
    options?: Partial<{
      onError: (error: unknown) => Promise<void> | void;
      onAbort: () => Promise<void> | void;
      keepalive: boolean;
    }>,
  ): Promise<void> {
    const generator = new ServerSentEventGenerator(req, res);

    req.on("close", async () => {
      const onAbort = options?.onAbort ? options.onAbort() : null;
      if (onAbort instanceof Promise) await onAbort;

      res.end();
    });

    try {
      const stream = onStart(generator);
      if (stream instanceof Promise) await stream;
      if (!options?.keepalive) {
        res.end();
      }
    } catch (error: unknown) {
      const onAbort = options?.onAbort ? options.onAbort() : null;
      if (onAbort instanceof Promise) await onAbort;

      if (options?.onError) {
        const onError = options.onError(error);
        if (onError instanceof Promise) await onError;
        res.end();
      } else {
        res.end();
        throw error;
      }
    }
  }

  protected override send(
    event: EventType,
    dataLines: string[],
    options: DatastarEventOptions,
  ): string[] {
    const eventLines = super.send(event, dataLines, options);

    eventLines.forEach((line) => {
      this.res.write(line);
    });

    return eventLines;
  }

  /**
   * Reads client sent signals based on HTTP methods
   *
   * @params request - The NodeJS Request object.
   *
   * @returns An object containing a success boolean and either the client's signals or an error message.
   */
  static async readSignals(request: IncomingMessage): Promise<
    | { success: true; signals: Record<string, Jsonifiable> }
    | { success: false; error: string }
  > {
    if (request.method === "GET") {
      const url = new URL(
        `http://${process.env.HOST ?? "localhost"}${request.url}`,
      );
      const params = url.searchParams;

      try {
        if (params.has("datastar")) {
          const signals = JSON.parse(params.get("datastar")!);
          if (isRecord(signals)) {
            return { success: true, signals };
          } else throw new Error("Datastar param is not a record");
        } else throw new Error("No datastar object in request");
      } catch (e: unknown) {
        if (isRecord(e) && "message" in e && typeof e.message === "string") {
          return { success: false, error: e.message };
        } else {return {
            success: false,
            error: "unknown error when parsing request",
          };}
      }
    }
    const body = await new Promise((resolve, _) => {
      let chunks = "";
      request.on("data", (chunk) => {
        chunks += chunk;
      });
      request.on("end", () => {
        resolve(chunks);
      });
    });
    let parsedBody = {};
    try {
      if (typeof body !== "string") throw Error("body was not a string");
      parsedBody = JSON.parse(body);
    } catch (e: unknown) {
      if (isRecord(e) && "message" in e && typeof e.message === "string") {
        return { success: false, error: e.message };
      } else {return {
          success: false,
          error: "unknown error when parsing request",
        };}
    }

    return { success: true, signals: parsedBody };
  }
}



================================================
FILE: sdk/typescript/src/web/deno.ts
================================================
import { VERSION } from "../consts.ts";
import { serve } from "https://deno.land/std@0.140.0/http/server.ts";
import { ServerSentEventGenerator } from "./serverSentEventGenerator.ts";
import type { Jsonifiable } from "npm:type-fest";

// This server is used for testing the web standard based sdk
serve(async (req: Request) => {
  const url = new URL(req.url);

  if (url.pathname === "/") {
    return new Response(
      `<html><head><script type="module" src="https://cdn.jsdelivr.net/gh/starfederation/datastar@v${VERSION}/bundles/datastar.js"></script></head><body><div id="toMerge" data-signals-foo="'World'" data-on-load="@get('/merge')">Hello</div></body></html>`,
      {
        headers: { "Content-Type": "text/html" },
      },
    );
  } else if (url.pathname.includes("/test")) {
    const reader = await ServerSentEventGenerator.readSignals(req);
    if (reader.success === true) {
      const events = reader.signals.events;
      if (isEventArray(events)) {
        return ServerSentEventGenerator.stream((stream) => {
          testEvents(stream, events);
        });
      }
    }
  } else if (url.pathname.includes("await")) {
    return ServerSentEventGenerator.stream(async (stream) => {
      stream.mergeFragments('<div id="toMerge">Merged</div>');
      await delay(5000);
      stream.mergeFragments('<div id="toMerge">After 5 seconds</div>');
    });
  }

  return new Response(`Path not found: ${req.url}`, {
    headers: { "Content-Type": "text/html" },
  });
});

function delay(milliseconds: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });
}

function isEventArray(
  events: unknown,
): events is (Record<string, Jsonifiable> & { type: string })[] {
  return events instanceof Array && events.every((event) => {
    return typeof event === "object" && event !== null &&
      typeof event.type === "string";
  });
}

function testEvents(
  stream: ServerSentEventGenerator,
  events: Record<string, Jsonifiable>[],
) {
  events.forEach((event) => {
    const { type, ...e } = event;
    switch (type) {
      case "mergeFragments":
        if (e !== null && typeof e === "object" && "fragments" in e) {
          const { fragments, ...options } = e;
          stream.mergeFragments(fragments as string, options || undefined);
        }
        break;
      case "removeFragments":
        if (e !== null && typeof e === "object" && "selector" in e) {
          const { selector, ...options } = e;
          stream.removeFragments(selector as string, options || undefined);
        }
        break;
      case "mergeSignals":
        if (e !== null && typeof e === "object" && "signals" in e) {
          const { signals, ...options } = e;
          stream.mergeSignals(
            signals as Record<string, Jsonifiable>,
            options || undefined,
          );
        }
        break;
      case "removeSignals":
        if (e !== null && typeof e === "object" && "paths" in e) {
          const { paths, ...options } = e;
          stream.removeSignals(paths as string[], options || undefined);
        }
        break;
      case "executeScript":
        if (e !== null && typeof e === "object" && "script" in e) {
          const { script, ...options } = e;
          stream.executeScript(script as string, options || undefined);
        }
        break;
    }
  });
}



================================================
FILE: sdk/typescript/src/web/serverSentEventGenerator.ts
================================================
import { DatastarEventOptions, EventType, sseHeaders } from "../types.ts";
import { ServerSentEventGenerator as AbstractSSEGenerator } from "../abstractServerSentEventGenerator.ts";

import type { Jsonifiable } from "npm:type-fest";
import { deepmerge } from "npm:deepmerge-ts";

function isRecord(obj: unknown): obj is Record<string, Jsonifiable> {
  return typeof obj === "object" && obj !== null;
}

/**
 * ServerSentEventGenerator class, responsible for initializing and handling
 * server-sent events (SSE) as well as reading signals sent by the client.
 * Cannot be instantiated directly, you must use the stream static method.
 */
export class ServerSentEventGenerator extends AbstractSSEGenerator {
  protected controller: ReadableStreamDefaultController;

  protected constructor(controller: ReadableStreamDefaultController) {
    super();
    this.controller = controller;
  }

  /**
   * Initializes the server-sent event generator and executes the onStart callback.
   *
   * @param onStart - A function that will be passed the initialized ServerSentEventGenerator class as it's first parameter.
   * @param options? - An object that can contain options for the Response constructor onError and onCancel callbacks and a keepalive boolean.
   * The onAbort callback will be called whenever the request is aborted or the stream is cancelled
   *
   * The onError callback will be called whenever an error is met. If provided, the onAbort callback will also be executed.
   * If an onError callback is not provided, then the stream will be ended and the error will be thrown up.
   *
   * If responseInit is provided, then it will be passed to the Response constructor along with the default headers.
   *
   * The stream is always closed after the onStart callback ends.
   * If onStart is non blocking, but you still need the stream to stay open after it is called,
   * then the keepalive option will maintain it open until the request is aborted by the client.
   *
   * @returns an HTTP Response
   */
  static stream(
    onStart: (stream: ServerSentEventGenerator) => Promise<void> | void,
    options?: Partial<{
      onError: (error: unknown) => Promise<void> | void;
      onAbort: (reason: string) => Promise<void> | void;
      responseInit: ResponseInit;
      keepalive: boolean;
    }>,
  ): Response {
    const readableStream = new ReadableStream({
      async start(controller) {
        const generator = new ServerSentEventGenerator(controller);

        try {
          const stream = onStart(generator);
          if (stream instanceof Promise) await stream;
          if (!options?.keepalive) {
            controller.close();
          }
        } catch (error) {
          const errorMsg = error instanceof Error
            ? error.message
            : "onStart callback threw an error";
          const abortResult = options?.onAbort
            ? options.onAbort(errorMsg)
            : null;

          if (abortResult instanceof Promise) await abortResult;
          if (options && options.onError) {
            const onError = options.onError(error);
            if (onError instanceof Promise) await onError;
            controller.close();
          } else {
            controller.close();
            throw error;
          }
        }
      },
      async cancel(reason) {
        const abortResult = options && options.onAbort
          ? options.onAbort(reason)
          : null;
        if (abortResult instanceof Promise) await abortResult;
      },
    });

    return new Response(
      readableStream,
      deepmerge({
        headers: sseHeaders,
      }, options?.responseInit ?? {}),
    );
  }

  protected override send(
    event: EventType,
    dataLines: string[],
    options: DatastarEventOptions,
  ): string[] {
    const eventLines = super.send(event, dataLines, options);

    eventLines.forEach((line) => {
      this.controller?.enqueue(new TextEncoder().encode(line));
    });

    return eventLines;
  }

  /**
   * Reads client sent signals based on HTTP methods
   *
   * @params request - The HTTP Request object.
   *
   * @returns An object containing a success boolean and either the client's signals or an error message.
   */
  static async readSignals(request: Request): Promise<
    | { success: true; signals: Record<string, Jsonifiable> }
    | { success: false; error: string }
  > {
    try {
      if (request.method === "GET") {
        const url = new URL(request.url);
        const params = url.searchParams;
        if (params.has("datastar")) {
          const signals = JSON.parse(params.get("datastar")!);

          if (isRecord(signals)) {
            return { success: true, signals };
          } else throw new Error("Datastar param is not a record");
        } else throw new Error("No datastar object in request");
      }

      const signals = await request.json();

      if (isRecord(signals)) {
        return { success: true, signals: signals };
      }

      throw new Error("Parsed JSON body is not of type record");
    } catch (e: unknown) {
      if (isRecord(e) && "message" in e && typeof e.message === "string") {
        return { success: false, error: e.message };
      }

      return { success: false, error: "unknown error when parsing request" };
    }
  }
}
