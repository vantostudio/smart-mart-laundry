import type { ReactNode } from "react";

import type { LaundryCategory } from "@/features/laundry/data";

/*
 * Flat illustrations of every laundry item, drawn on one 120×96 canvas in the brand palette
 * (fill-* utilities, so they follow the tokens). Baskets fill up S → XL, duvets stack thicker,
 * mats and carpets show their texture, shoes come as a pair. Decorative: the card names the item.
 */

const VIEW = "0 0 120 96";

/** `lift` moves low, flat items (mats, rugs, duvets) up so every item sits centred in its tile. */
function Art({ children, lift = 0 }: { children: ReactNode; lift?: number }) {
  return (
    <svg viewBox={VIEW} aria-hidden className="h-auto w-full">
      <g transform={`translate(0 ${-lift})`}>
        <ellipse cx="60" cy="89" rx="40" ry="4" className="fill-foreground/10" />
        {children}
      </g>
    </svg>
  );
}

// ------------------------------------------------------------------------------------- Baskets

/** Woven basket; `level` 1–4 is how high the clothes are piled (S, M, L, XL). */
function Basket({ level }: { level: 1 | 2 | 3 | 4 }) {
  return (
    <Art lift={4}>
      {/* Clothes, back to front, so the rim covers their lower edge */}
      <ellipse cx="46" cy="44" rx="18" ry="8" className="fill-primary" />
      <ellipse cx="73" cy="43" rx="17" ry="8" className="fill-leaf" />
      {level >= 2 && (
        <>
          <ellipse
            cx="59"
            cy="38"
            rx="20"
            ry="8"
            className="fill-card stroke-border"
            strokeWidth="1.5"
          />
          <path d="M53 32 l6 5 6-5" fill="none" className="stroke-border" strokeWidth="1.5" />
        </>
      )}
      {level >= 3 && (
        <>
          <ellipse cx="44" cy="31" rx="13" ry="7" className="fill-clay-soft" />
          <ellipse cx="73" cy="30" rx="14" ry="7" className="fill-success-soft" />
        </>
      )}
      {level >= 4 && (
        <>
          <ellipse cx="58" cy="23" rx="15" ry="7" className="fill-primary" />
          <ellipse cx="66" cy="16" rx="9" ry="5" className="fill-accent" />
        </>
      )}

      <path d="M22 50 H98 L90 82 Q89 87 84 87 H36 Q31 87 30 82 Z" className="fill-clay" />
      <path
        d="M27 61 H93 M29 71 H91 M31 80 H89 M43 52 L45 86 M60 52 V87 M77 52 L75 86"
        className="stroke-card/25"
        strokeWidth="2.5"
        fill="none"
      />
      <rect x="18" y="45" width="84" height="9" rx="4.5" className="fill-clay" />
      <rect x="23" y="47" width="74" height="2.5" rx="1.25" className="fill-card/35" />
      <rect x="27" y="58" width="10" height="4" rx="2" className="fill-foreground/25" />
      <rect x="83" y="58" width="10" height="4" rx="2" className="fill-foreground/25" />

      {/* XL: a sleeve hangs over the rim */}
      {level >= 4 && (
        <path d="M90 46 C99 47 103 56 100 67 L93 66 C95 58 93 52 86 50 Z" className="fill-leaf" />
      )}
    </Art>
  );
}

// -------------------------------------------------------------------------------------- Duvets

/** Folded duvets with quilt stitching; more layers for bigger sizes. */
function DuvetStack({ layers, width }: { layers: number; width: number }) {
  const x = 60 - width / 2;
  return (
    <Art lift={18 - layers * 3}>
      {Array.from({ length: layers }, (_, i) => {
        const y = 72 - i * 14;
        const soft = i % 2 === 1;
        return (
          <g key={i}>
            <rect
              x={x}
              y={y}
              width={width}
              height="14"
              rx="7"
              className={soft ? "fill-success-soft stroke-leaf/40" : "fill-card stroke-border"}
              strokeWidth="1.5"
            />
            <path
              d={`M${x + 10} ${y + 7} H${x + width - 10}`}
              className="stroke-leaf/60"
              strokeWidth="1.8"
              strokeDasharray="5 4"
              strokeLinecap="round"
            />
          </g>
        );
      })}
      {/* Folded corner on top */}
      <path
        d={`M${x + width - 22} ${72 - (layers - 1) * 14} l14 0 l0 9 z`}
        className="fill-leaf/30"
      />
    </Art>
  );
}

function Star({ cx, cy, r }: { cx: number; cy: number; r: number }) {
  const points = Array.from({ length: 10 }, (_, i) => {
    const a = (Math.PI / 5) * i - Math.PI / 2;
    const rr = i % 2 === 0 ? r : r * 0.45;
    return `${(cx + rr * Math.cos(a)).toFixed(1)},${(cy + rr * Math.sin(a)).toFixed(1)}`;
  }).join(" ");
  return <polygon points={points} className="fill-clay" />;
}

function CotDuvet() {
  return (
    <Art lift={14}>
      <rect x="28" y="52" width="64" height="32" rx="10" className="fill-clay-soft" />
      <rect x="28" y="52" width="64" height="10" rx="5" className="fill-card/70" />
      <Star cx={44} cy={72} r={5} />
      <Star cx={62} cy={68} r={4} />
      <Star cx={78} cy={75} r={5} />
      <circle cx="53" cy="78" r="1.6" className="fill-clay" />
      <circle cx="70" cy="79" r="1.6" className="fill-clay" />
    </Art>
  );
}

// ---------------------------------------------------------------------------------------- Mats

function DoorMat() {
  return (
    <Art lift={18}>
      <path d="M24 56 H96 L104 84 H16 Z" className="fill-primary" />
      <path d="M31 61 H89 L95 79 H25 Z" className="fill-leaf/35" />
      <path
        d="M36 61 L33 79 M46 61 L44 79 M56 61 L55 79 M66 61 V79 M76 61 L77 79 M86 61 L88 79"
        className="stroke-primary"
        strokeWidth="2.5"
      />
    </Art>
  );
}

/** Round shaggy mat: a scalloped ellipse (generated, so the bumps are even). */
const shag = (() => {
  const n = 30;
  const pts = Array.from({ length: n }, (_, i) => {
    const a = (2 * Math.PI * i) / n;
    const r = i % 2 === 0 ? 1 : 1.09;
    return `${(60 + 42 * r * Math.cos(a)).toFixed(1)},${(70 + 17 * r * Math.sin(a)).toFixed(1)}`;
  });
  return `M${pts.join(" L")} Z`;
})();

function FluffyMat() {
  return (
    <Art lift={20}>
      <path
        d={shag}
        className="fill-clay-soft stroke-clay-soft"
        strokeWidth="4"
        strokeLinejoin="round"
      />
      <ellipse cx="60" cy="70" rx="29" ry="11" className="fill-accent" />
      <path
        d="M44 68 q2 -4 4 0 M58 64 q2 -4 4 0 M70 70 q2 -4 4 0 M52 74 q2 -4 4 0"
        fill="none"
        className="stroke-clay/40"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </Art>
  );
}

function FloorMat() {
  return (
    <Art lift={18}>
      <path d="M14 52 H106 L114 84 H6 Z" className="fill-clay" />
      <path d="M22 57 H98 L104 79 H16 Z" className="fill-primary" />
      <path d="M30 61 H90 L94 75 H26 Z" className="fill-clay-soft" />
      <path d="M60 62 L70 68 L60 74 L50 68 Z" className="fill-clay" />
    </Art>
  );
}

// ------------------------------------------------------------------------------------- Carpets

function RolledCarpet() {
  return (
    <Art lift={16}>
      <rect x="14" y="54" width="80" height="26" rx="13" className="fill-clay" />
      <path d="M34 54 V80 M50 54 V80 M66 54 V80" className="stroke-primary/70" strokeWidth="5" />
      <ellipse cx="94" cy="67" rx="9" ry="13" className="fill-accent" />
      <path
        d="M94 67 m-1 0 a2.5 3.5 0 1 1 3 3.5 a5 7 0 1 1 -6.5 -8.5"
        fill="none"
        className="stroke-clay"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </Art>
  );
}

/** Patterned rug in perspective with tassels; `large` is wider with two medallions. */
function Rug({ large = false }: { large?: boolean }) {
  const [l, r, bl, br] = large ? [12, 108, 4, 116] : [22, 98, 14, 106];
  const tassels = (y1: number, y2: number, from: number, to: number) =>
    Array.from({ length: Math.floor((to - from) / 6) + 1 }, (_, i) => {
      const x = from + i * 6;
      return `M${x} ${y1} L${x} ${y2}`;
    }).join(" ");
  return (
    <Art lift={18}>
      <path
        d={`${tassels(84, 89, bl + 2, br - 2)} ${tassels(54, 50, l + 2, r - 2)}`}
        className="stroke-foreground/30"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path d={`M${l} 54 H${r} L${br} 84 H${bl} Z`} className="fill-primary" />
      <path d={`M${l + 7} 58.5 H${r - 7} L${br - 9} 79.5 H${bl + 9} Z`} className="fill-clay" />
      {(large ? [44, 76] : [60]).map((cx) => (
        <g key={cx}>
          <path d={`M${cx} 61 L${cx + 13} 69 L${cx} 77 L${cx - 13} 69 Z`} className="fill-accent" />
          <path d={`M${cx} 65 L${cx + 6} 69 L${cx} 73 L${cx - 6} 69 Z`} className="fill-primary" />
        </g>
      ))}
    </Art>
  );
}

// --------------------------------------------------------------------------------------- Shoes

function Sneaker({ coloured, back = false }: { coloured: boolean; back?: boolean }) {
  return (
    // The back shoe of the pair sits up and to the left, faded.
    <g transform={back ? "translate(-6 -12)" : "translate(4 0)"} opacity={back ? 0.6 : 1}>
      <path
        d="M18 74 C18 62 24 52 36 50 L52 48 C58 47 62 50 64 56 L70 60 L94 64 C103 66 106 70 104 74 Z"
        className={coloured ? "fill-clay" : "fill-card stroke-border"}
        strokeWidth="1.5"
      />
      <path
        d="M84 63 C96 64 104 67 104 74 H84 Z"
        className={coloured ? "fill-clay-soft" : "fill-secondary"}
      />
      <path d="M40 72 L58 57 L65 60 L49 73 Z" className={coloured ? "fill-card" : "fill-leaf"} />
      <path
        d="M54 51 L63 55 M58 49 L67 54 M62 48 L70 53"
        className="stroke-foreground/45"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M14 74 H104 Q108 74 108 78 Q108 82 104 82 H18 Q14 82 14 78 Z"
        className="fill-card stroke-border"
        strokeWidth="1.5"
      />
    </g>
  );
}

function ShoePair({ coloured }: { coloured: boolean }) {
  return (
    <Art lift={8}>
      <Sneaker coloured={coloured} back />
      <Sneaker coloured={coloured} />
    </Art>
  );
}

// ----------------------------------------------------------------------------------------- Map

const art: Record<string, () => ReactNode> = {
  "basket-small": () => <Basket level={1} />,
  "basket-medium": () => <Basket level={2} />,
  "basket-large": () => <Basket level={3} />,
  "basket-xl": () => <Basket level={4} />,
  "duvet-6x6": () => <DuvetStack layers={3} width={80} />,
  "duvet-4x6": () => <DuvetStack layers={2} width={72} />,
  "duvet-3-2x6": () => <DuvetStack layers={2} width={60} />,
  "duvet-cot": () => <CotDuvet />,
  "mat-door": () => <DoorMat />,
  "mat-fluffy": () => <FluffyMat />,
  "mat-floor": () => <FloorMat />,
  "carpet-small": () => <RolledCarpet />,
  "carpet-medium": () => <Rug />,
  "carpet-large": () => <Rug large />,
  "shoes-white": () => <ShoePair coloured={false} />,
  "shoes-coloured": () => <ShoePair coloured />,
};

/** The illustration for one laundry item (falls back to a basket for unknown ids). */
export function ItemArt({ id, className }: { id: string; className?: string }) {
  return <div className={className}>{(art[id] ?? art["basket-medium"]!)()}</div>;
}

/** A representative item per category, for the category rail. */
export const categoryArt: Record<LaundryCategory, string> = {
  baskets: "basket-large",
  duvets: "duvet-6x6",
  mats: "mat-door",
  carpets: "carpet-medium",
  shoes: "shoes-coloured",
};

/** Soft background per category, so the grid reads by colour at a glance. */
export const categoryTint: Record<LaundryCategory, string> = {
  baskets: "bg-accent",
  duvets: "bg-success-soft",
  mats: "bg-secondary",
  carpets: "bg-clay-soft",
  shoes: "bg-muted",
};
