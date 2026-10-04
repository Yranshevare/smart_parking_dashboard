import type { ActivityEvent } from "../types";
import ActivityRow from "./ActivityRow";
import SectionHeading from "./SectionHeading";


export default function RecentActivity({ events }: { events: ActivityEvent[] }) {
    return (
        <section className="min-w-0">
            <div className="mb-4 flex items-end justify-between gap-3">
                <SectionHeading title="Recent activity" detail="Latest vehicle movements" />
                <span className="font-mono text-xs text-muted-foreground">LIVE</span>
            </div>
            <div className="overflow-hidden rounded-lg border border-border bg-surface">
                {events.map((event) => (
                    <ActivityRow event={event} key={event.id} />
                ))}
            </div>
        </section>
    );
}
