import { cn } from "../lib/utils";

export default function Metric({
    label,
    value,
    detail,
    tone,
    className,
}: {
    label: string;
    value: string;
    detail: string;
    tone?: "success";
    className?: string;
}) {
    return (
        <div className={cn("flex min-h-28 flex-col justify-center px-5 py-4 lg:min-h-0", className)}>
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{label}</p>
            <p className={cn("mt-1 text-2xl font-bold tabular-nums", tone === "success" && "text-success-strong")}>{value}</p>
            <p className="mt-1 text-xs text-muted-foreground">{detail}</p>
        </div>
    );
}
