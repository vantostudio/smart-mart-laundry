"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { ChoiceChips } from "@/components/shared/choice-chips";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/features/admin/components/form-field";
import { ProblemText } from "@/features/admin/components/problem-text";
import { problemFrom, type Problem, type Result } from "@/features/admin/lib/api-call";
import type { StaffMember } from "@/features/admin/lib/staff";
import { errorMessages, roleLabels, settingsMessages as m } from "@/features/admin/messages";
import { optionsOf } from "@/features/products/labels";
import type { AdminRole } from "@/lib/db/schema";

import { addStaffMember, changeStaffRole, removeStaffMember } from "../lib/settings-client";
import { SettingsPanel, useSave } from "./settings-form";

/** A button that asks first, and stays open on failure so the message can be read. */
function ConfirmedAction({
  label,
  ariaLabel,
  heading,
  body,
  destructive,
  run,
}: {
  label: string;
  ariaLabel?: string;
  heading: string;
  body: string;
  destructive?: boolean;
  run: () => Promise<Result<unknown>>;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [working, setWorking] = useState(false);
  const [failure, setFailure] = useState<Problem | null>(null);

  async function confirm() {
    setWorking(true);
    setFailure(null);
    const result = await run();
    setWorking(false);
    if (result.ok) {
      setOpen(false);
      router.refresh();
    } else {
      setFailure(problemFrom(result.error));
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button
          variant="ghost"
          aria-label={ariaLabel}
          className={destructive ? "px-3 text-destructive" : "px-3"}
        >
          {label}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogTitle>{heading}</AlertDialogTitle>
        <AlertDialogDescription>{body}</AlertDialogDescription>
        {failure && <ProblemText problem={failure} className="mt-3" />}
        <div className="mt-6 flex flex-wrap justify-end gap-2">
          <AlertDialogCancel asChild>
            <Button variant="secondary" disabled={working}>
              {m.cancel}
            </Button>
          </AlertDialogCancel>
          <Button
            variant={destructive ? "destructive" : "primary"}
            disabled={working}
            onClick={confirm}
          >
            {working ? m.working : destructive ? m.remove : m.confirm}
          </Button>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function StaffRow({ person, you }: { person: StaffMember; you: boolean }) {
  const shownName = person.name ?? m.noName;
  const spokenName = person.name ?? m.thisPerson;
  const nextRole: AdminRole = person.role === "owner" ? "admin" : "owner";

  return (
    <li className="flex flex-wrap items-center gap-x-3 gap-y-1 py-3">
      <div className="mr-auto min-w-0">
        <p className="text-body-sm font-semibold wrap-anywhere">{shownName}</p>
        <p className="text-caption text-muted-foreground">{roleLabels[person.role]}</p>
      </div>
      {you ? (
        <Badge variant="secondary">{m.you}</Badge>
      ) : (
        <div className="flex flex-wrap items-center gap-1">
          <ConfirmedAction
            label={nextRole === "owner" ? m.makeOwner : m.makeAdmin}
            heading={m.roleHeading(spokenName, roleLabels[nextRole].toLowerCase())}
            body={nextRole === "owner" ? m.makeOwnerBody : m.makeAdminBody}
            run={() => changeStaffRole(person.id, nextRole)}
          />
          <ConfirmedAction
            label={m.remove}
            ariaLabel={m.removeLabel(spokenName)}
            heading={m.removeHeading(spokenName)}
            body={m.removeBody}
            destructive
            run={() => removeStaffMember(person.id)}
          />
        </div>
      )}
    </li>
  );
}

const ADD_FIELDS = ["email", "name"];

function AddStaff() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<AdminRole>("admin");
  const [addedName, setAddedName] = useState<string | null>(null);
  const { saving, failure, submit } = useSave(() => addStaffMember({ email, name, role }));

  async function onSubmit(event: Parameters<typeof submit>[0]) {
    setAddedName(null);
    const result = await submit(event);
    if (result.ok) {
      setAddedName(result.data.name);
      setEmail("");
      setName("");
      setRole("admin");
    }
  }

  const emailProblem = failure?.field === "email" ? failure.message : undefined;
  const emailError =
    emailProblem && failure?.message !== errorMessages.ALREADY_EXISTS
      ? errorMessages.VALIDATION
      : emailProblem;
  const nameError = failure?.field === "name" ? failure.message : undefined;

  return (
    <form onSubmit={onSubmit} noValidate className="mt-5 grid gap-4 border-t border-border pt-5">
      <h3 className="text-body font-semibold">{m.addHeading}</h3>
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          name="email"
          label={m.addEmail}
          htmlFor="staff-email"
          hint={m.addEmailHint}
          error={emailError}
        >
          <Input
            id="staff-email"
            type="email"
            autoComplete="off"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            aria-invalid={emailError ? true : undefined}
            aria-describedby="staff-email-help"
          />
        </FormField>
        <FormField name="name" label={m.addName} htmlFor="staff-name" error={nameError}>
          <Input
            id="staff-name"
            autoComplete="off"
            maxLength={80}
            value={name}
            onChange={(e) => setName(e.target.value)}
            aria-invalid={nameError ? true : undefined}
            aria-describedby="staff-name-help"
          />
        </FormField>
      </div>
      <FormField name="role" label={m.addRole}>
        <ChoiceChips
          label={m.addRole}
          columns={2}
          options={optionsOf(roleLabels)}
          value={role}
          onChange={setRole}
          className="sm:max-w-xs"
        />
      </FormField>
      {failure && !ADD_FIELDS.includes(failure.field ?? "") && <ProblemText problem={failure} />}
      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" disabled={saving}>
          {saving ? m.adding : m.add}
        </Button>
        <p aria-live="polite" className="text-body-sm font-semibold text-success">
          {addedName && m.added(addedName)}
        </p>
      </div>
    </form>
  );
}

/** Who can sign in. Names and roles only: emails are typed once and never shown again. */
export function StaffSection({ staff, adminId }: { staff: StaffMember[]; adminId: string }) {
  return (
    <SettingsPanel heading={m.staffHeading} body={m.staffBody}>
      <ul className="divide-y divide-border">
        {staff.map((person) => (
          <StaffRow key={person.id} person={person} you={person.id === adminId} />
        ))}
      </ul>
      <AddStaff />
    </SettingsPanel>
  );
}
