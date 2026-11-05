"use client";

import { useRouter } from "next/navigation";
import { useId, useState, type FormEvent, type ReactNode } from "react";

import { ChoiceChips } from "@/components/shared/choice-chips";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { productMessages } from "@/features/admin/messages";
import type { ProductCategory, ProductCondition } from "@/lib/db/schema";

import { categoryLabels, conditionLabels, optionsOf } from "../labels";
import { errorText, saveProduct, type Photo, type ProductDraft } from "../lib/api-client";
import { productsHref } from "../lib/links";
import type { Product } from "../lib/products";
import { PhotoPicker } from "./photo-picker";

type Failure = { field?: string | undefined; message: string };

/** "S, M,, m " becomes ["S", "M", "m"]. */
export function parseSizes(text: string): string[] {
  const sizes = text
    .split(",")
    .map((size) => size.trim())
    .filter(Boolean);
  return [...new Set(sizes)];
}

function Field({
  label,
  htmlFor,
  hint,
  error,
  children,
}: {
  label: string;
  htmlFor?: string;
  hint?: string;
  error?: string | undefined;
  children: ReactNode;
}) {
  return (
    <div>
      {htmlFor ? (
        <label htmlFor={htmlFor} className="text-body-sm font-semibold">
          {label}
        </label>
      ) : (
        <p className="text-body-sm font-semibold">{label}</p>
      )}
      <div className="mt-1.5">{children}</div>
      {hint && <p className="mt-1 text-caption text-muted-foreground">{hint}</p>}
      {error && (
        <p role="alert" className="mt-1 text-body-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}

type Props = { product?: Product; photos?: Photo[] };

/** Add or edit a product. The API validates; this shows its answer on the field it names. */
export function ProductForm({ product, photos: initialPhotos = [] }: Props) {
  const router = useRouter();
  const id = useId();
  const [name, setName] = useState(product?.name ?? "");
  const [category, setCategory] = useState<ProductCategory | null>(product?.category ?? null);
  const [condition, setCondition] = useState<ProductCondition | null>(product?.condition ?? null);
  const [price, setPrice] = useState(product ? String(product.price) : "");
  const [stock, setStock] = useState(product ? String(product.stock) : "");
  const [sizes, setSizes] = useState(product?.sizes.join(", ") ?? "");
  const [note, setNote] = useState(product?.note ?? "");
  const [photos, setPhotos] = useState(initialPhotos);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [failure, setFailure] = useState<Failure | null>(null);

  const errorFor = (field: string) => (failure?.field === field ? failure.message : undefined);
  const known = ["name", "category", "condition", "price", "stock", "sizes", "note", "images"];
  const general = failure && !known.includes(failure.field ?? "") ? failure.message : null;

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!category)
      return setFailure({ field: "category", message: productMessages.chooseCategory });
    if (!condition) {
      return setFailure({ field: "condition", message: productMessages.chooseCondition });
    }
    const draft: ProductDraft = {
      name,
      category,
      condition,
      price: Number(price),
      stock: Number(stock),
      sizes: parseSizes(sizes),
      images: photos.map((photo) => photo.key),
      note: note.trim() || null,
    };
    setSaving(true);
    setFailure(null);
    const result = await saveProduct(product?.id, draft);
    if (result.ok) {
      router.push(productsHref({}));
      router.refresh();
      return;
    }
    setSaving(false);
    // "images.0" is the photos field.
    setFailure({ field: result.error.field?.split(".")[0], message: errorText(result.error) });
  }

  return (
    <form onSubmit={submit} className="mt-6 space-y-6 rounded-3xl bg-card p-6 shadow-card">
      <Field label={productMessages.name} htmlFor={`${id}-name`} error={errorFor("name")}>
        <Input
          id={`${id}-name`}
          value={name}
          required
          maxLength={200}
          aria-invalid={errorFor("name") !== undefined}
          onChange={(event) => setName(event.target.value)}
        />
      </Field>

      <Field label={productMessages.condition} error={errorFor("condition")}>
        <ChoiceChips
          label={productMessages.condition}
          options={optionsOf(conditionLabels)}
          value={condition}
          onChange={setCondition}
          aria-invalid={errorFor("condition") !== undefined}
        />
      </Field>

      <Field label={productMessages.category} error={errorFor("category")}>
        <ChoiceChips
          label={productMessages.category}
          options={optionsOf(categoryLabels)}
          value={category}
          onChange={setCategory}
          aria-invalid={errorFor("category") !== undefined}
        />
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label={productMessages.price} htmlFor={`${id}-price`} error={errorFor("price")}>
          <Input
            id={`${id}-price`}
            type="number"
            inputMode="numeric"
            min={0}
            step={1}
            value={price}
            required
            aria-invalid={errorFor("price") !== undefined}
            onChange={(event) => setPrice(event.target.value)}
          />
        </Field>
        <Field label={productMessages.stock} htmlFor={`${id}-stock`} error={errorFor("stock")}>
          <Input
            id={`${id}-stock`}
            type="number"
            inputMode="numeric"
            min={0}
            step={1}
            value={stock}
            required
            aria-invalid={errorFor("stock") !== undefined}
            onChange={(event) => setStock(event.target.value)}
          />
        </Field>
      </div>

      <Field
        label={productMessages.sizes}
        htmlFor={`${id}-sizes`}
        hint={productMessages.sizesHint}
        error={errorFor("sizes")}
      >
        <Input
          id={`${id}-sizes`}
          value={sizes}
          aria-invalid={errorFor("sizes") !== undefined}
          onChange={(event) => setSizes(event.target.value)}
        />
      </Field>

      <PhotoPicker
        photos={photos}
        onChange={setPhotos}
        onBusyChange={setUploading}
        error={errorFor("images")}
      />

      <Field
        label={productMessages.note}
        htmlFor={`${id}-note`}
        hint={productMessages.noteHint}
        error={errorFor("note")}
      >
        <Textarea
          id={`${id}-note`}
          value={note}
          maxLength={1000}
          rows={3}
          aria-invalid={errorFor("note") !== undefined}
          onChange={(event) => setNote(event.target.value)}
        />
      </Field>

      {general && (
        <p role="alert" className="text-body-sm text-destructive">
          {general}
        </p>
      )}

      <Button type="submit" variant="clay" size="lg" block disabled={saving || uploading}>
        {saving ? productMessages.saving : productMessages.save}
      </Button>
    </form>
  );
}
