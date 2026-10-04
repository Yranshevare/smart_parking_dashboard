import { Building2, CheckCircle2, Clock3, Radio, Signal } from "lucide-react";
import { cn } from "../lib/utils";
import SectionHeading from "./SectionHeading";
import type { Site } from "../types/site-type";


export default function SystemView({ site }: { site: Site }) {
    return (
        <section>
            <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
                <SectionHeading title="Sensor status" detail={`${site.name} · ${site.bays.length} sensors connected`} />
                <span className="inline-flex items-center gap-2 text-sm font-semibold text-success-strong">
                    <CheckCircle2 className="size-4" />
                    Network healthy
                </span>
            </div>
            <div className="overflow-x-auto rounded-lg border border-border bg-surface">
                <table className="w-full min-w-[680px] border-collapse text-left">
                    <thead className="border-b border-border bg-muted/60 text-xs uppercase tracking-widest text-muted-foreground">
                        <tr>
                            <th className="px-4 py-3">Sensor</th>
                            <th className="px-4 py-3">Bay state</th>
                            <th className="px-4 py-3">Distance</th>
                            <th className="px-4 py-3">Signal</th>
                            <th className="px-4 py-3">Last change</th>
                        </tr>
                    </thead>
                    <tbody>
                        {site.bays.map((bay) => (
                            <tr key={bay.id} className="border-b border-border last:border-b-0">
                                <td className="px-4 py-3 font-mono text-sm font-bold">S-{bay.id}</td>
                                <td className="px-4 py-3">
                                    <span
                                        className={cn(
                                            "inline-flex items-center gap-2 text-sm font-semibold",
                                            bay.occupied ? "text-foreground" : "text-success-strong"
                                        )}
                                    >
                                        <span className={cn("size-2 rounded-full", bay.occupied ? "bg-occupied" : "bg-success")} />
                                        {bay.occupied ? "Occupied" : "Available"}
                                    </span>
                                </td>
                                <td className="px-4 py-3 font-mono text-sm text-muted-foreground">{bay.distance} cm</td>
                                <td className="px-4 py-3">
                                    <span className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                                        <Signal className="size-4 text-success-strong" />
                                        Strong
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-sm text-muted-foreground">{bay.lastChange}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-xs text-muted-foreground">
                <span className="flex items-center gap-2">
                    <Radio className="size-3.5" />
                    Gateway online
                </span>
                <span className="flex items-center gap-2">
                    <Building2 className="size-3.5" />
                    Controller v2.4.1
                </span>
                <span className="flex items-center gap-2">
                    <Clock3 className="size-3.5" />
                    Polling every 5 sec
                </span>
            </div>
        </section>
    );
}
