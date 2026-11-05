"use client";

import { useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState, type FormEvent } from "react";

import { ChoiceChips } from "@/components/shared/choice-chips";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormField } from "@/features/admin/components/form-field";
import { ProblemText } from "@/features/admin/components/problem-text";
import { problemFrom, type Problem } from "@/features/admin/lib/api-call";
import { productMessages } from "@/features/admin/messages";
import type { ProductCategory, ProductCondition } from "@/lib/db/schema";

import { categoryLabels, conditionLabels, optionsOf } from "../labels";
import { saveProduct, type Photo, type ProductDraft } from "../lib/api-client";
import { productsHref } from "../lib/links";
import type { Product } from "../lib/products";
import { keepSizes } from "../sizes";
import { PhotoPicker } from "./photo-picker";
import { SizePicker } from "./size-picker";

const FIELDS = ["name", "condition", "category", "price", "stock", "sizes", "images", "note"];

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
  const [sizes, setSizes] = useState(product?.sizes ?? []);
  const [note, setNote] = useState(product?.note ?? "");
  const [photos, setPhotos] = useState(initialPhotos);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [failure, setFailure] = useState<Problem | null>(null);
  const form = useRef<HTMLFormElement>(null);

  const errorFor = (field: string) => (failure?.field === field ? failure.message : undefined);
  const general = failure && !FIELDS.includes(failure.field ?? "") ? failure : null;

  // Save is at the bottom of a long form, so take people to whatever needs fixing.
  useEffect(() => {
    if (!failure?.field || !FIELDS.includes(failure.field)) return;
    const field = form.current?.querySelector(`[data-field="${failure.field}"]`);
    field?.querySelector<HTMLElement>("input:not([hidden]), textarea, button")?.focus();
    field?.scrollIntoView?.({ block: "center" });
  }, [failure]);

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
      sizes,
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
    setFailure(problemFrom(result.error));
  }

  function chooseCategory(next: ProductCategory) {
    setCategory(next);
    setSizes((current) => keepSizes(current, next));
  }

  return (
    <form
      ref={form}
      onSubmit={submit}
      className="mt-6 space-y-6 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,24rem)] lg:items-start lg:gap-6 lg:space-y-0"
    >
      <div className="space-y-6 rounded-3xl bg-card p-4 shadow-card sm:p-6">
        <FormField
          name="name"
          label={productMessages.name}
          htmlFor={`${id}-name`}
          error={errorFor("name")}
        >
          <Input
            id={`${id}-name`}
            value={name}
            required
            maxLength={200}
            aria-invalid={errorFor("name") !== undefined}
            aria-describedby={`${id}-name-help`}
            onChange={(event) => setName(event.target.value)}
          />
        </FormField>

        <FormField name="condition" label={productMessages.condition} error={errorFor("condition")}>
          <ChoiceChips
            label={productMessages.condition}
            options={optionsOf(conditionLabels)}
            value={condition}
            onChange={setCondition}
            aria-invalid={errorFor("condition") !== undefined}
          />
        </FormField>

        <FormField name="category" label={productMessages.category} error={errorFor("category")}>
          <ChoiceChips
            label={productMessages.category}
            options={optionsOf(categoryLabels)}
            value={category}
            onChange={chooseCategory}
            className="sm:grid-cols-4"
            aria-invalid={errorFor("category") !== undefined}
          />
        </FormField>

        <FormField
          name="sizes"
          label={productMessages.sizes}
          hint={category ? productMessages.sizesHint : undefined}
          error={errorFor("sizes")}
        >
          <SizePicker category={category} sizes={sizes} onChange={setSizes} />
        </FormField>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            name="price"
            label={productMessages.price}
            htmlFor={`${id}-price`}
            error={errorFor("price")}
          >
            <Input
              id={`${id}-price`}
              type="number"
              inputMode="numeric"
              min={0}
              step={1}
              value={price}
              required
              aria-invalid={errorFor("price") !== undefined}
              aria-describedby={`${id}-price-help`}
              onChange={(event) => setPrice(event.target.value)}
            />
          </FormField>
          <FormField
            name="stock"
            label={productMessages.stock}
            htmlFor={`${id}-stock`}
            error={errorFor("stock")}
          >
            <Input
              id={`${id}-stock`}
              type="number"
              inputMode="numeric"
              min={0}
              step={1}
              value={stock}
              required
              aria-invalid={errorFor("stock") !== undefined}
              aria-describedby={`${id}-stock-help`}
              onChange={(event) => setStock(event.target.value)}
            />
          </FormField>
        </div>
      </div>

      <div className="space-y-6">
        <div className="space-y-6 rounded-3xl bg-card p-4 shadow-card sm:p-6">
          <PhotoPicker
            photos={photos}
            onChange={setPhotos}
            onBusyChange={setUploading}
            problem={failure?.field === "images" ? failure : undefined}
          />

          <FormField
            name="note"
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
              aria-describedby={`${id}-note-help`}
              onChange={(event) => setNote(event.target.value)}
            />
          </FormField>
        </div>

        {general && <ProblemText problem={general} />}

        <div className="sticky bottom-3 z-10 lg:static">
          <Button
            type="submit"
            variant="clay"
            size="lg"
            block
            disabled={saving || uploading}
            className="shadow-lift lg:shadow-none"
          >
            {saving ? productMessages.saving : productMessages.save}
          </Button>
        </div>
      </div>
    </form>
  );
}
