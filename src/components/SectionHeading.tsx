export default function SectionHeading({ title, detail }: { title: string; detail: string }) {
    return (
        <div>
            <h2 className="text-base font-bold">{title}</h2>
            <p className="mt-0.5 text-sm text-muted-foreground">{detail}</p>
        </div>
    );
}
