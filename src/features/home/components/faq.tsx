import { ChevronDown } from "lucide-react";

import { Section } from "@/components/shared/section";
import { WhatsAppButton } from "@/components/shared/whatsapp-button";
import { faqs } from "@/features/home/data";

/*
 * Heading and a way to ask on the left (sticky on desktop), questions on the right. Native
 * <details>: works without JavaScript and is keyboard accessible by default.
 */
export function Faq() {
  return (
    <Section>
      <div className="grid gap-8 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-16">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <h2 className="display text-display">Questions before your first order</h2>
          <p className="mt-3 max-w-sm text-body-lg text-muted-foreground">
            Can&apos;t find your answer? We reply on WhatsApp.
          </p>
          <WhatsAppButton
            variant="soft"
            size="md"
            className="mt-6 rounded-full"
            message="Hi Street Mart, I have a question about laundry pickup."
          >
            Ask on WhatsApp
          </WhatsAppButton>
        </div>

        <div className="divide-y divide-border border-y border-border">
          {faqs.map((f) => (
            <details key={f.question} className="group">
              <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-4 py-4 text-body-lg font-semibold [&::-webkit-details-marker]:hidden">
                {f.question}
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-secondary transition-colors group-open:bg-primary group-open:text-primary-foreground">
                  <ChevronDown
                    aria-hidden
                    className="size-4 transition-transform duration-200 group-open:rotate-180"
                  />
                </span>
              </summary>
              <p className="max-w-xl pb-5 text-body text-muted-foreground">{f.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </Section>
  );
}
