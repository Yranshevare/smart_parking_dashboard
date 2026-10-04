import { CircleParking, TriangleAlert } from "lucide-react";
import SectionHeading from "./SectionHeading";
import { cn } from "../lib/utils";
import type { Site } from "../types";


export default function ParkingMap({ site }: { site: Site }) {
    return (
        <section className="min-w-0">
            <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
                <SectionHeading title="Parking bays" detail={site.zone} />
                <div className="flex gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                        <span className="size-2 rounded-sm bg-success" />
                        Available
                    </span>
                    <span className="flex items-center gap-1.5">
                        <span className="size-2 rounded-sm bg-occupied" />
                        Occupied
                    </span>
                </div>
            </div>
            <div className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-5">
                {site.bays.map((bay) => (
                    <div key={bay.id} className={cn("relative min-h-36 bg-surface p-4", !bay.occupied && "bg-success-soft/40")}>
                        <div className="flex items-start justify-between">
                            <span className="font-mono text-sm font-bold">{bay.id}</span>
                            <span className={cn("size-2.5 rounded-full", bay.occupied ? "bg-occupied" : "bg-success")} />
                        </div>
                        <div className="flex h-16 items-center justify-center">
                            {bay.occupied ? (
                                <div className="relative h-11 w-20 rounded-[5px] border-2 border-occupied/70 bg-occupied-soft">
                                    <span className="absolute inset-x-3 top-1.5 h-2 rounded-sm bg-occupied/25" />
                                    <span className="absolute -left-1 top-2 h-5 w-1 rounded-sm bg-occupied" />
                                    <span className="absolute -right-1 top-2 h-5 w-1 rounded-sm bg-occupied" />
                                </div>
                            ) : (
                                <CircleParking className="size-9 text-success/55" strokeWidth={1.5} aria-hidden="true" />
                            )}
                        </div>
                        <div className="flex items-end justify-between gap-2">
                            <span className={cn("text-xs font-bold", bay.occupied ? "text-foreground" : "text-success-strong")}>
                                {bay.occupied ? "Occupied" : "Available"}
                            </span>
                            {bay.warning && <TriangleAlert className="size-4 text-warning" aria-label="Sensor reading needs review" />}
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
