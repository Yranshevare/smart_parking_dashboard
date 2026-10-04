import { Activity, Gauge, Settings2 } from "lucide-react";

const tabs = [
    { id: "dashboard", label: "Dashboard", icon: Gauge },
    { id: "activity", label: "Activity", icon: Activity },
    { id: "system", label: "System", icon: Settings2 },
] as const;

export default tabs;