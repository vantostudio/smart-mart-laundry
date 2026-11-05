"use client";

import { ImagePlus, X } from "lucide-react";
import Image from "next/image";
import { useId, useRef, useState, type ChangeEvent } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProblemText } from "@/features/admin/components/problem-text";
import { problemFrom, type Problem } from "@/features/admin/lib/api-call";
import { productMessages } from "@/features/admin/messages";

import { uploadPhoto, type Photo } from "../lib/api-client";
import { shrinkImage } from "../lib/shrink-image";
import { MAX_PHOTOS } from "../limits";

type Props = {
  photos: Photo[];
  onChange: (update: (photos: Photo[]) => Photo[]) => void;
  /** True while photos are uploading, so the form can't save without them. */
  onBusyChange: (busy: boolean) => void;
  problem?: Problem | undefined;
};

/** Shrinks and uploads photos one at a time, keeping what worked if a later one fails. */
export function PhotoPicker({ photos, onChange, onBusyChange, problem }: Props) {
  const input = useRef<HTMLInputElement>(null);
  const addButton = useRef<HTMLButtonElement>(null);
  const hintId = useId();
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const [failure, setFailure] = useState<Problem | null>(null);

  async function add(files: File[]) {
    const room = MAX_PHOTOS - photos.length;
    const chosen = files.slice(0, room);
    setFailure(files.length > room ? { message: productMessages.photoLimit(MAX_PHOTOS) } : null);
    onBusyChange(true);
    for (const [index, file] of chosen.entries()) {
      setProgress({ done: index + 1, total: chosen.length });
      let shrunk: Awaited<ReturnType<typeof shrinkImage>>;
      try {
        shrunk = await shrinkImage(file);
      } catch {
        setFailure({ message: productMessages.photoUnreadable });
        continue;
      }
      const result = await uploadPhoto(shrunk.photo, shrunk.thumbnail);
      if (result.ok) onChange((current) => [...current, result.data]);
      else setFailure(problemFrom(result.error));
    }
    setProgress(null);
    onBusyChange(false);
  }

  function onPick(event: ChangeEvent<HTMLInputElement>) {
    const files = [...(event.target.files ?? [])];
    event.target.value = ""; // So the same file can be picked again after removing it.
    if (files.length > 0) void add(files);
  }

  function remove(key: string) {
    onChange((current) => current.filter((item) => item.key !== key));
    addButton.current?.focus(); // The button that was focused is about to go.
  }

  const shown = failure ?? problem;
  return (
    <fieldset data-field="images">
      <legend className="text-body-sm font-semibold">{productMessages.photos}</legend>
      <p id={hintId} className="text-caption text-muted-foreground">
        {productMessages.photosHint}
      </p>
      {photos.length > 0 && (
        <ul className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-6 lg:grid-cols-3">
          {photos.map((photo, index) => (
            <li
              key={photo.key}
              className="relative aspect-square overflow-hidden rounded-2xl bg-secondary"
            >
              <Image
                src={photo.url}
                alt={productMessages.photoAlt(index + 1)}
                fill
                sizes="(min-width: 640px) 8rem, 33vw"
                unoptimized
                className="object-cover"
              />
              {index === 0 && (
                <Badge variant="primary" size="sm" className="absolute bottom-1.5 left-1.5">
                  {productMessages.cover}
                </Badge>
              )}
              {/* A 44px target around a small mark, so it doesn't hide a phone-sized tile. */}
              <button
                type="button"
                aria-label={productMessages.removePhoto(index + 1)}
                className="group/remove absolute top-0 right-0 flex size-11 items-center justify-center outline-none"
                onClick={() => remove(photo.key)}
              >
                <span className="flex size-7 items-center justify-center rounded-full bg-card text-foreground shadow-card group-focus-visible/remove:ring-4 group-focus-visible/remove:ring-ring/35">
                  <X aria-hidden className="size-4" />
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
      <input
        ref={input}
        type="file"
        accept="image/*"
        multiple
        hidden
        aria-describedby={hintId}
        aria-label={productMessages.addPhotos}
        onChange={onPick}
      />
      <Button
        ref={addButton}
        type="button"
        variant="outline"
        className="mt-3"
        disabled={progress !== null || photos.length >= MAX_PHOTOS}
        onClick={() => input.current?.click()}
      >
        <ImagePlus aria-hidden />
        {productMessages.addPhotos}
      </Button>
      <p aria-live="polite" className="mt-2 text-body-sm text-muted-foreground empty:hidden">
        {progress ? productMessages.addingPhotos(progress.done, progress.total) : ""}
      </p>
      {shown && <ProblemText problem={shown} className="mt-2" />}
    </fieldset>
  );
}
