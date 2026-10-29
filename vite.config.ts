import { defineConfig } from "vite-plus";

// Next.js owns dev/build (`next dev`, `next build`). Vite+ owns everything else:
// tests (Vitest), lint (Oxlint), format (Oxfmt) and staged-file checks.
// Both Oxlint and Oxfmt skip .gitignore'd paths (.next, node_modules, …) on their own.
export default defineConfig({
  resolve: {
    tsconfigPaths: true,
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.test.{ts,tsx}"],
  },
  lint: {
    plugins: ["typescript", "react", "nextjs", "jsx-a11y", "import", "vitest", "oxc"],
    // shadcn/ui components and vendored agent skills (.claude) aren't ours — lint our code only.
    ignorePatterns: [".claude/**", "src/components/ui/**"],
    options: {
      typeAware: true,
      typeCheck: true,
    },
    rules: {
      "react/rules-of-hooks": "error",
    },
  },
  fmt: {
    sortTailwindcss: {
      stylesheet: "./src/app/globals.css",
      functions: ["cn", "cva"],
    },
    ignorePatterns: [".claude/**", "src/components/ui/**"],
  },
  staged: {
    "*": "vp check --fix",
  },
});
