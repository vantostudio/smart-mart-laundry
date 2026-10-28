import { defineConfig } from "vite-plus";

// Next.js owns dev/build (`next dev`, `next build`). Vite+ owns everything else:
// tests (Vitest), lint (Oxlint), format (Oxfmt), staged-file checks and tasks.
export default defineConfig({
  // JSX is compiled by Oxc (automatic runtime) — no React plugin needed for tests.
  oxc: { jsx: { runtime: "automatic" } },
  resolve: {
    tsconfigPaths: true,
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
    css: false,
  },
  lint: {
    plugins: ["typescript", "react", "nextjs", "jsx-a11y", "import", "vitest", "oxc"],
    // shadcn/ui components and vendored agent skills (.claude) aren't ours — lint our code only.
    ignorePatterns: [
      ".next/**",
      "out/**",
      "coverage/**",
      "next-env.d.ts",
      ".claude/**",
      "src/components/ui/**",
    ],
    options: {
      typeAware: true,
      typeCheck: true,
    },
    rules: {
      "react/react-in-jsx-scope": "off",
      "react/rules-of-hooks": "error",
      "react/exhaustive-deps": "warn",
    },
  },
  fmt: {
    printWidth: 100,
    semi: true,
    singleQuote: false,
    trailingComma: "all",
    sortPackageJson: true,
    sortTailwindcss: {
      stylesheet: "./src/app/globals.css",
      functions: ["cn", "cva"],
    },
    ignorePatterns: [".next/**", "out/**", ".claude/**", "pnpm-lock.yaml", "src/components/ui/**"],
  },
  staged: {
    "*": "vp check --fix",
  },
});
