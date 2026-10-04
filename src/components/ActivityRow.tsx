import { ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { cn } from "../lib/utils";
import type { ActivityEvent } from "../types";


export default function ActivityRow({ event }: { event: ActivityEvent }) {
    const isEntry = event.type === "entry";
    const Icon = isEntry ? ArrowDownLeft : ArrowUpRight;
    return (
        <div className="flex items-center gap-3 border-b border-border px-4 py-4 last:border-b-0">
            <span
                className={cn(
                    "flex size-9 shrink-0 items-center justify-center rounded-md",
                    isEntry ? "bg-neutral-soft text-foreground" : "bg-success-soft text-success-strong"
                )}
            >
                <Icon className="size-4" aria-hidden="true" />
            </span>
            <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                    <p className="text-sm font-bold">Vehicle {isEntry ? "entered" : "exited"}</p>
                    <span className="text-xs text-muted-foreground">Bay {event.bay}</span>
                </div>
                <p className="mt-0.5 truncate font-mono text-xs text-muted-foreground">{event.plate}</p>
            </div>
            <time className="shrink-0 font-mono text-xs text-muted-foreground">{event.time}</time>
        </div>
    );
}
