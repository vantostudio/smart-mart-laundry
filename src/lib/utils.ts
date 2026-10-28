import { createCn } from "cn/config";

/**
 * Class merging that understands our design-system utilities (src/app/globals.css).
 * Without these groups `cn("text-title text-primary")` would treat `text-title` as a colour
 * and drop it. Add a token here whenever you add a utility that shares a Tailwind prefix.
 */
export const cn = createCn({
  extend: {
    classGroups: {
      "font-size": [
        {
          text: [
            "display-xl",
            "display-lg",
            "display",
            "title",
            "subtitle",
            "body-lg",
            "body",
            "body-sm",
            "caption",
            "overline",
          ],
        },
      ],
      shadow: [{ shadow: ["card", "lift", "ticket", "glow-primary", "glow-clay"] }],
      "inset-shadow": [{ "inset-shadow": ["highlight"] }],
      "bg-image": [
        {
          bg: [
            "gradient-primary",
            "gradient-clay",
            "gradient-sunset",
            "gradient-forest",
            "gradient-cream",
            "gradient-scrim",
            "mesh",
            "glow",
            "weave",
          ],
        },
      ],
      "max-w": [{ "max-w": ["page", "reading", "narrow"] }],
    },
  },
});
