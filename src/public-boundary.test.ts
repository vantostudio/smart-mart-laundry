import { readdirSync, readFileSync } from "node:fs";
import { posix, sep } from "node:path";

import ts from "typescript";
import { describe, expect, it } from "vite-plus/test";

/*
 * Public pages, features and components must never reach server code (AGENTS.md, "Public pages stay
 * static"). Walks the value imports from every public file and lists each path to a forbidden module.
 */

const publicRoots = [
  "src/app/(site)/",
  "src/components/",
  ...["home", "laundry", "shop", "about", "cart", "booking", "seo"].map(
    (f) => `src/features/${f}/`,
  ),
];

const forbidden = new Set([
  "src/lib/db/index.ts",
  "src/lib/db/test-db.ts",
  "src/config/env.ts",
  "src/features/admin/lib/auth.ts",
]);

/** The cached readers a route in `src/app/(site)` may import directly. */
const cachedReaders = new Set([
  "src/features/settings/lib/live-settings.ts",
  "src/features/laundry/lib/live-items.ts",
  "src/features/products/lib/cached-products.ts",
]);

const assetExtension = /\.(css|png|svg|jpg|webp|woff2|json)$/;

type Import = { specifier: string; typeOnly: boolean };

function allTypeOnly(elements: readonly { isTypeOnly: boolean }[]): boolean {
  return elements.length > 0 && elements.every((e) => e.isTypeOnly);
}

function importsOf(path: string, source: string): Import[] {
  const kind = path.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS;
  const file = ts.createSourceFile(path, source, ts.ScriptTarget.Latest, false, kind);
  const found: Import[] = [];

  function visit(node: ts.Node) {
    if (ts.isImportDeclaration(node) && ts.isStringLiteral(node.moduleSpecifier)) {
      const clause = node.importClause;
      const bindings = clause?.namedBindings;
      const typeOnly =
        clause !== undefined &&
        (clause.phaseModifier === ts.SyntaxKind.TypeKeyword ||
          (!clause.name &&
            bindings !== undefined &&
            ts.isNamedImports(bindings) &&
            allTypeOnly(bindings.elements)));
      found.push({ specifier: node.moduleSpecifier.text, typeOnly });
    } else if (
      ts.isExportDeclaration(node) &&
      node.moduleSpecifier &&
      ts.isStringLiteral(node.moduleSpecifier)
    ) {
      const clause = node.exportClause;
      const typeOnly =
        node.isTypeOnly ||
        (clause !== undefined && ts.isNamedExports(clause) && allTypeOnly(clause.elements));
      found.push({ specifier: node.moduleSpecifier.text, typeOnly });
    } else if (
      ts.isCallExpression(node) &&
      node.expression.kind === ts.SyntaxKind.ImportKeyword &&
      node.arguments[0] &&
      ts.isStringLiteralLike(node.arguments[0])
    ) {
      found.push({ specifier: node.arguments[0].text, typeOnly: false });
    }
    ts.forEachChild(node, visit);
  }

  visit(file);
  return found;
}

function resolveLocal(files: Map<string, string>, from: string, specifier: string) {
  const base = specifier.startsWith("@/")
    ? `src/${specifier.slice(2)}`
    : posix.normalize(posix.join(posix.dirname(from), specifier));
  return [base, `${base}.ts`, `${base}.tsx`, `${base}/index.ts`, `${base}/index.tsx`].find((p) =>
    files.has(p),
  );
}

/** Every path from a public file to server code, one message each. Empty when the boundary holds. */
function findViolations(files: Map<string, string>): string[] {
  const parsed = new Map<string, Import[]>();
  const valueImports = (path: string) => {
    let imports = parsed.get(path);
    if (!imports) {
      imports = importsOf(path, files.get(path) ?? "").filter((i) => !i.typeOnly);
      parsed.set(path, imports);
    }
    return imports;
  };
  const isServerOnly = (path: string) =>
    valueImports(path).some((i) => i.specifier === "server-only");

  const entries = [...files.keys()]
    .filter((p) => publicRoots.some((root) => p.startsWith(root)))
    .filter((p) => p !== "src/features/laundry/lib/live-items.ts")
    .sort();
  const parent = new Map<string, string | null>(entries.map((p) => [p, null]));
  const chain = (path: string): string => {
    const from = parent.get(path);
    return from ? `${chain(from)} -> ${path}` : path;
  };
  const violation = (path: string, what: string) =>
    `${chain(path)} imports ${what}: public code must not import server code; see AGENTS.md`;

  const violations: string[] = [];
  const queue = [...entries];
  for (let path = queue.shift(); path !== undefined; path = queue.shift()) {
    if (isServerOnly(path)) {
      violations.push(violation(path, `"server-only"`));
      continue;
    }
    for (const { specifier } of valueImports(path)) {
      if (!specifier.startsWith("@/") && !specifier.startsWith(".")) continue;
      if (assetExtension.test(specifier)) continue;
      const target = resolveLocal(files, path, specifier);
      if (!target) {
        violations.push(`${chain(path)} imports "${specifier}", which resolves to no file in src`);
      } else if (forbidden.has(target)) {
        violations.push(violation(path, `"${specifier}" (${target})`));
      } else if (cachedReaders.has(target) && path.startsWith("src/app/(site)/")) {
        continue;
      } else if (isServerOnly(target)) {
        violations.push(violation(path, `"${specifier}" (${target}, server-only)`));
      } else if (!parent.has(target)) {
        parent.set(target, path);
        queue.push(target);
      }
    }
  }
  return violations;
}

function readSourceTree(): Map<string, string> {
  const files = new Map<string, string>();
  for (const entry of readdirSync("src", { recursive: true, encoding: "utf8" })) {
    const path = `src/${entry.split(sep).join("/")}`;
    if (/\.tsx?$/.test(path) && !/\.test\.tsx?$/.test(path)) {
      files.set(path, readFileSync(path, "utf8"));
    }
  }
  return files;
}

const rule = "public code must not import server code; see AGENTS.md";

describe("public/server import boundary", () => {
  it("holds for every public file in src", () => {
    expect(findViolations(readSourceTree())).toEqual([]);
  });

  it("reports a public file that imports the database", () => {
    const files = new Map([
      ["src/features/shop/data.ts", 'import { getDb } from "@/lib/db";\nexport const db = getDb;'],
      ["src/lib/db/index.ts", 'import "server-only";\nexport const getDb = () => null;'],
    ]);
    expect(findViolations(files)).toEqual([
      `src/features/shop/data.ts imports "@/lib/db" (src/lib/db/index.ts): ${rule}`,
    ]);
  });

  it("follows a helper to a server-only module and shows the chain", () => {
    const files = new Map([
      ["src/components/shared/price-tag.tsx", 'import { price } from "@/lib/pricing";'],
      ["src/lib/pricing.ts", 'import { secret } from "./secret";\nexport const price = secret;'],
      ["src/lib/secret.ts", 'import "server-only";\nexport const secret = 1;'],
    ]);
    expect(findViolations(files)).toEqual([
      `src/components/shared/price-tag.tsx -> src/lib/pricing.ts imports "./secret" (src/lib/secret.ts, server-only): ${rule}`,
    ]);
  });

  it("ignores type-only imports", () => {
    const files = new Map([
      [
        "src/features/cart/totals.ts",
        'import type { Db } from "@/lib/db";\nimport { type X } from "@/config/env";',
      ],
      ["src/lib/db/index.ts", 'import "server-only";'],
      ["src/config/env.ts", 'import "server-only";'],
    ]);
    expect(findViolations(files)).toEqual([]);
  });

  it("lets only (site) routes import the cached readers", () => {
    const reader = "@/features/settings/lib/live-settings";
    const files = new Map([
      ["src/app/(site)/x/page.tsx", `import { getLiveShopSettings } from "${reader}";`],
      ["src/features/shop/components/y.tsx", `import { getLiveShopSettings } from "${reader}";`],
      [
        "src/features/settings/lib/live-settings.ts",
        'import "server-only";\nimport { getDb } from "@/lib/db";',
      ],
      ["src/lib/db/index.ts", 'import "server-only";'],
    ]);
    expect(findViolations(files)).toEqual([
      `src/features/shop/components/y.tsx imports "${reader}" (src/features/settings/lib/live-settings.ts, server-only): ${rule}`,
    ]);
  });
});
