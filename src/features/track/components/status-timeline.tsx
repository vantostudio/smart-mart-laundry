import { Check } from "lucide-react";

import { Card } from "@/components/shared/card";
import { DetailList } from "@/components/shared/detail-list";
import { Badge } from "@/components/ui/badge";
import { trackStages, type TicketStatus } from "@/features/track/data";
import { cn } from "@/lib/utils";

export function StatusTimeline({ ticket }: { ticket: TicketStatus }) {
  const delivered = ticket.stage >= trackStages.length - 1;

  return (
    <Card variant="ticket" radius="xl" padding="lg" className="mt-8 animate-fade-up">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Badge variant="code">{ticket.ticket}</Badge>
          <h2 className="mt-3 display text-title">{ticket.status}</h2>
        </div>
        <div className="text-right">
          <Badge variant={delivered ? "success" : "warning"}>
            {delivered ? "Delivered" : "In progress"}
          </Badge>
          <p className="mt-2 font-display text-title font-bold text-primary figures">
            {ticket.total}
          </p>
        </div>
      </div>

      <ol className="mt-8">
        {trackStages.map((stage, i) => {
          const done = i <= ticket.stage;
          const current = i === ticket.stage;
          return (
            <li key={stage} className="flex gap-4" aria-current={current ? "step" : undefined}>
              <div className="flex flex-col items-center">
                <span
                  className={cn(
                    "flex size-8 items-center justify-center rounded-full text-caption font-bold",
                    current && "bg-gradient-sunset text-clay-foreground shadow-glow-clay",
                    done && !current && "bg-gradient-primary text-primary-foreground",
                    !done && "border border-border bg-secondary text-muted-foreground",
                  )}
                >
                  {done && !current ? <Check className="size-4" /> : i + 1}
                </span>
                {i < trackStages.length - 1 && (
                  <span
                    className={cn(
                      "my-1 w-0.5 flex-1 rounded-full",
                      done ? "bg-primary" : "bg-border",
                    )}
                    aria-hidden
                  />
                )}
              </div>
              <div className="pb-6">
                <p className={cn("text-body-sm font-semibold", current && "text-clay")}>{stage}</p>
                {current && (
                  <p className="mt-0.5 text-caption text-muted-foreground">{ticket.statusNote}</p>
                )}
              </div>
            </li>
          );
        })}
      </ol>

      <DetailList
        columns={2}
        className="border-t border-dashed border-border pt-4"
        items={[
          ["Service", ticket.service],
          ["Items", ticket.items],
          ["Pickup", ticket.pickup],
          ["Return by", ticket.returnBy],
        ]}
      />
    </Card>
  );
}
