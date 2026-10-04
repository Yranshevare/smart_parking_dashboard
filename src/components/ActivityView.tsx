import ActivityRow from "./ActivityRow";
import SectionHeading from "./SectionHeading";
import type { ActivityEvent } from "../types";

export default function ActivityView({ events }: { events: ActivityEvent[] }) {
    return (
        <section className="max-w-4xl">
            <div className="mb-5 flex items-end justify-between">
                <SectionHeading title="Vehicle activity" detail="Entries and exits recorded today" />
                <span className="text-sm font-semibold text-muted-foreground">18 movements today</span>
            </div>
            <div className="overflow-hidden rounded-lg border border-border bg-surface">
                {events.map((event) => (
                    <ActivityRow event={event} key={event.id} />
                ))}
            </div>
        </section>
    );
}
