"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { ChoiceChips } from "@/components/shared/choice-chips";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormField } from "@/features/admin/components/form-field";
import { laundryMessages as m, settingsMessages } from "@/features/admin/messages";
import { PhotoPicker } from "@/features/products/components/photo-picker";
import type { Photo } from "@/features/products/lib/api-client";
import { amount, SaveRow, useSave } from "@/features/settings/components/settings-form";

import { laundryCategories, type LaundryCategory } from "../data";
import { createLaundryItem, updateLaundryItem } from "../lib/items-client";

const FIELDS = ["category", "name", "desc", "price", "mark", "image"];

type Item = {
  id: string;
  name: string;
  desc: string;
  price: number;
  mark: string | null;
  photo: Photo;
};

/** Adds an item, or edits `item`. Its group is chosen when it's added. */
export function ItemForm({ item, category }: { item?: Item; category?: LaundryCategory }) {
  const router = useRouter();
  const [group, setGroup] = useState<LaundryCategory | null>(category ?? null);
  const [name, setName] = useState(item?.name ?? "");
  const [desc, setDesc] = useState(item?.desc ?? "");
  const [price, setPrice] = useState(item ? String(item.price) : "");
  const [mark, setMark] = useState(item?.mark ?? "");
  const [photos, setPhotos] = useState<Photo[]>(item ? [item.photo] : []);
  const [uploading, setUploading] = useState(false);

  const { saving, failure, submit, form } = useSave(() => {
    const fields = {
      name,
      desc,
      price: amount(price),
      mark: mark.trim() || null,
      image: photos[0]?.key ?? "",
    };
    return item
      ? updateLaundryItem(item.id, fields)
      : createLaundryItem({ ...fields, category: group as LaundryCategory });
  });
  const errorFor = (field: string) => (failure?.field === field ? failure.message : undefined);
  const invalid = (field: string) => (errorFor(field) ? true : undefined);

  async function onSubmit(event: Parameters<typeof submit>[0]) {
    const result = await submit(event);
    if (result.ok) router.push("/admin/laundry");
  }

  return (
    <form ref={form} onSubmit={onSubmit} noValidate className="mt-6 grid max-w-2xl gap-5">
      {!item && (
        <FormField name="category" label={m.group} error={errorFor("category")}>
          <ChoiceChips
            label={m.group}
            columns={2}
            options={laundryCategories.map((c) => ({ value: c.id, label: c.label }))}
            value={group}
            onChange={setGroup}
          />
        </FormField>
      )}
      <FormField name="name" label={m.name} htmlFor="item-name" error={errorFor("name")}>
        <Input
          id="item-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          aria-invalid={invalid("name")}
          aria-describedby="item-name-help"
        />
      </FormField>
      <FormField name="desc" label={m.description} htmlFor="item-desc" error={errorFor("desc")}>
        <Textarea
          id="item-desc"
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          aria-invalid={invalid("desc")}
          aria-describedby="item-desc-help"
        />
      </FormField>
      <div className="grid gap-5 sm:grid-cols-2">
        <FormField name="price" label={m.price} htmlFor="item-price" error={errorFor("price")}>
          <Input
            id="item-price"
            inputMode="numeric"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            aria-invalid={invalid("price")}
            aria-describedby="item-price-help"
          />
        </FormField>
        <FormField
          name="mark"
          label={m.mark}
          htmlFor="item-mark"
          hint={m.markHint}
          error={errorFor("mark")}
        >
          <Input
            id="item-mark"
            value={mark}
            onChange={(e) => setMark(e.target.value)}
            aria-invalid={invalid("mark")}
            aria-describedby="item-mark-help"
          />
        </FormField>
      </div>
      <PhotoPicker
        photos={photos}
        onChange={setPhotos}
        onBusyChange={setUploading}
        problem={errorFor("image") ? { message: errorFor("image")! } : undefined}
        max={1}
        field="image"
        copy={{ legend: m.photo, hint: m.photoHint, add: m.addPhoto }}
      />
      <SaveRow
        saving={saving || uploading}
        saved={false}
        savedText={settingsMessages.savedForShop}
        general={failure && !FIELDS.includes(failure.field ?? "") ? failure : null}
      />
    </form>
  );
}
