import { CheckCircle2, ChevronDown, CircleParking, MapPin, TriangleAlert } from "lucide-react";
import { onValue, ref } from "firebase/database";
import { useEffect, useState } from "react";
import { Button } from "./components/ui/button";
import { cn } from "./lib/utils";
import { database, firebaseConfigurationError } from "./lib/firebase";
import Metric from "./components/Metric";
import ParkingMap from "./components/ParkingMap";
import RecentActivity from "./components/RecentActivity";
import ActivityView from "./components/ActivityView";
import SystemView from "./components/SystemView";
import sites from "./data/sites";
import activityEvents from "./data/activityEvents";
import tabs from "./data/tabs";

type TabId = (typeof tabs)[number]["id"];

type ParkingData = {
    cars: number | null;
    totalSlots: number | null;
    connection: "connecting" | "connected" | "error";
    message: string | null;
    lastUpdated: string | null;
};

function isValidCount(value: unknown): value is number {
    return typeof value === "number" && Number.isSafeInteger(value);
}

export default function App() {
    const [activeTab, setActiveTab] = useState<TabId>("dashboard");
    const [siteIndex, setSiteIndex] = useState(0);
    const [parkingData, setParkingData] = useState<ParkingData>({
        cars: null,
        totalSlots: null,
        connection: "connecting",
        message: null,
        lastUpdated: null,
    });
    const site = sites[siteIndex];

    useEffect(() => {
        if (!database) {
            setParkingData((current) => ({
                ...current,
                connection: "error",
                message: firebaseConfigurationError ?? "Firebase is not configured.",
            }));
            return;
        }

        const unsubscribe = onValue(
            ref(database, "smartParking"),
            (snapshot) => {
                if (!snapshot.exists()) {
                    setParkingData({
                        cars: 0,
                        totalSlots: 10,
                        connection: "error",
                        message: "No data found at /smartParking. Showing defaults: 0 cars and 10 total slots.",
                        lastUpdated: null,
                    });
                    return;
                }

                const value: unknown = snapshot.val();
                const data = value !== null && typeof value === "object" ? value as Record<string, unknown> : null;
                const cars = data?.cars ?? 0;
                const totalSlots = data?.totalSlots ?? 10;

                if (!isValidCount(cars) || cars < 0) {
                    setParkingData((current) => ({
                        ...current,
                        connection: "error",
                        message: "Invalid Firebase value for cars. Expected a non-negative whole number.",
                    }));
                    return;
                }

                if (!isValidCount(totalSlots) || totalSlots <= 0) {
                    setParkingData((current) => ({
                        ...current,
                        connection: "error",
                        message: "Invalid Firebase value for totalSlots. Expected a positive whole number.",
                    }));
                    return;
                }

                if (cars > totalSlots) {
                    setParkingData((current) => ({
                        ...current,
                        connection: "error",
                        message: "Invalid parking data: cars cannot exceed totalSlots.",
                    }));
                    return;
                }

                const missingFields = [
                    data?.cars == null ? "cars" : null,
                    data?.totalSlots == null ? "totalSlots" : null,
                ].filter((field): field is string => field !== null);

                setParkingData({
                    cars,
                    totalSlots,
                    connection: "connected",
                    message: missingFields.length > 0
                        ? `Missing ${missingFields.join(" and ")} in Firebase; using defaults (${cars} cars, ${totalSlots} total slots).`
                        : null,
                    lastUpdated: new Date().toLocaleTimeString("en-GB", { hour12: false }),
                });
            },
            (error) => {
                console.error("Firebase Realtime Database listener failed:", error);
                setParkingData((current) => ({
                    ...current,
                    connection: "error",
                    message: error.code === "PERMISSION_DENIED"
                        ? "Firebase read permission denied. Check the database rules for /smartParking."
                        : `Firebase connection failed: ${error.message}`,
                }));
            }
        );

        return unsubscribe;
    }, []);

    if (!site) return null;

    const occupied = parkingData.cars;
    const totalSlots = parkingData.totalSlots;
    const available = occupied !== null && totalSlots !== null ? totalSlots - occupied : null;
    const occupancy = occupied !== null && totalSlots !== null ? Math.round((occupied / totalSlots) * 100) : 0;
    const parkingIsFull = occupied !== null && totalSlots !== null && occupied >= totalSlots;
    const connectionLabel = parkingData.connection === "connected"
        ? "Firebase connected"
        : parkingData.connection === "connecting"
            ? "Connecting to Firebase"
            : "Firebase unavailable";

    return (
        <div className="min-h-screen bg-background text-foreground">
            <header className="border-b border-border bg-surface">
                <div className="mx-auto flex min-h-16 max-w-screen-2xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
                    <div className="flex min-w-0 items-center gap-3">
                        <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground">
                            <CircleParking className="size-5" aria-hidden="true" />
                        </span>
                        <div className="min-w-0">
                            <p className="truncate text-base font-bold leading-5">Parkwise</p>
                            <p className="truncate text-xs text-muted-foreground">Operations control</p>
                        </div>
                    </div>
                    <div className="hidden items-center gap-2 text-sm text-muted-foreground sm:flex" role="status">
                        <span className="relative flex size-2">
                            {parkingData.connection === "connected" && (
                                <span className="absolute inline-flex size-full animate-ping rounded-full bg-success opacity-40 motion-reduce:animate-none" />
                            )}
                            <span className={cn(
                                "relative inline-flex size-2 rounded-full",
                                parkingData.connection === "connected" ? "bg-success" : "bg-warning"
                            )} />
                        </span>
                        {connectionLabel}
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="hidden text-right lg:block">
                            <p className="text-xs font-medium">Last updated</p>
                            <p className="font-mono text-xs text-muted-foreground">
                                {parkingData.lastUpdated ? `Today, ${parkingData.lastUpdated}` : "Waiting for data"}
                            </p>
                        </div>
                    </div>
                </div>
            </header>

            <main className="mx-auto max-w-screen px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
                <section className="mb-6 flex flex-col gap-5 border-b border-border pb-6 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <p className="mb-1 text-xs font-bold uppercase tracking-widest text-muted-foreground">Live overview</p>
                        <h1 className="text-2xl font-bold sm:text-3xl">Parking operations</h1>
                    </div>
                    <label className="relative block w-full sm:w-72">
                        <span className="sr-only">Select parking site</span>
                        <MapPin
                            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                            aria-hidden="true"
                        />
                        <select
                            value={siteIndex}
                            onChange={(event) => setSiteIndex(Number(event.target.value))}
                            className="h-11 w-full appearance-none rounded-md border border-border bg-surface pl-9 pr-10 text-sm font-semibold outline-none focus:ring-2 focus:ring-ring"
                        >
                            {sites.map((item, index) => (
                                <option value={index} key={item.name}>
                                    {item.name}
                                </option>
                            ))}
                        </select>
                        <ChevronDown
                            className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                            aria-hidden="true"
                        />
                    </label>
                </section>

                <nav className="mb-6 flex w-full gap-1 border-b border-border" aria-label="Dashboard sections">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        const selected = activeTab === tab.id;
                        return (
                            <Button
                                key={tab.id}
                                variant="ghost"
                                onClick={() => setActiveTab(tab.id)}
                                className={cn(
                                    "relative h-11 rounded-b-none px-3 sm:px-4",
                                    selected && "text-foreground after:absolute after:inset-x-2 after:bottom-0 after:h-0.5 after:bg-primary"
                                )}
                                aria-current={selected ? "page" : undefined}
                            >
                                <Icon className="size-4" aria-hidden="true" />
                                {tab.label}
                            </Button>
                        );
                    })}
                </nav>

                {activeTab === "dashboard" && (
                    <div className="space-y-6">
                        <section className="grid overflow-hidden rounded-lg border border-border bg-surface lg:grid-cols-[1.15fr_0.85fr]">
                            <div className="border-b border-border p-6 sm:p-8 lg:border-b-0 lg:border-r lg:p-10">
                                <div className="mb-8 flex items-start justify-between gap-4">
                                    <div>
                                        <p className="text-sm font-semibold text-muted-foreground">Current occupancy</p>
                                        <div className="mt-2 flex items-baseline gap-3">
                                            <strong className="text-6xl font-bold leading-none tabular-nums sm:text-7xl">{occupied ?? "--"}</strong>
                                            <span className="text-2xl font-medium text-muted-foreground sm:text-3xl">/ {totalSlots ?? "--"}</span>
                                        </div>
                                        <p className="mt-3 text-lg font-semibold">Cars parked</p>
                                    </div>
                                    <span className={cn(
                                        "inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold",
                                        parkingIsFull ? "bg-occupied-soft text-occupied" : "bg-success-soft text-success-strong"
                                    )}>
                                        {parkingIsFull
                                            ? <TriangleAlert className="size-4" aria-hidden="true" />
                                            : <CheckCircle2 className="size-4" aria-hidden="true" />}
                                        {occupied === null ? "Waiting for data" : parkingIsFull ? "FULL" : "AVAILABLE"}
                                    </span>
                                </div>
                                <div className="mb-3 flex items-center justify-between text-sm font-semibold">
                                    <span>{occupied === null ? "--" : `${occupancy}%`} occupancy</span>
                                    <span className="text-success-strong">{available ?? "--"} available</span>
                                </div>
                                <div
                                    className="h-2.5 overflow-hidden rounded-full bg-muted"
                                    aria-label={`${occupancy}% occupied`}
                                    role="progressbar"
                                    aria-valuenow={occupancy}
                                    aria-valuemin={0}
                                    aria-valuemax={100}
                                >
                                    <div
                                        className="h-full rounded-full bg-primary transition-[width] duration-500 motion-reduce:transition-none"
                                        style={{ width: `${occupancy}%` }}
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 divide-x divide-border sm:grid-cols-3 lg:grid-cols-1 lg:divide-x-0 lg:divide-y">
                                <Metric label="Available slots" value={String(available ?? "--")} detail="Ready for entry" tone="success" />
                                <Metric label="Total slots" value={String(totalSlots ?? "--")} detail="Parking capacity" />
                                <Metric
                                    label="Peak today"
                                    value="82%"
                                    detail="08:45–09:15"
                                    className="col-span-2 border-t border-border sm:col-span-1 sm:border-t-0 lg:border-t"
                                />
                            </div>
                            {parkingData.message && (
                                <p
                                    className={cn(
                                        "col-span-full border-t border-border px-6 py-3 text-sm sm:px-8 lg:px-10",
                                        parkingData.connection === "error" ? "text-destructive" : "text-muted-foreground"
                                    )}
                                    role={parkingData.connection === "error" ? "alert" : "status"}
                                >
                                    {parkingData.message}
                                </p>
                            )}
                        </section>

                        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.6fr)_minmax(320px,0.8fr)]">
                            <ParkingMap site={site} />
                            <RecentActivity events={activityEvents.slice(0, 4)} />
                        </div>
                    </div>
                )}

                {activeTab === "activity" && <ActivityView events={activityEvents} />}
                {activeTab === "system" && <SystemView site={site} />}
            </main>
        </div>
    );
}
