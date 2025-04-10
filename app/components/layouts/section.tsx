import { ReactNode } from "react";
import { cn } from "~/lib/utils/cn";

interface SectionProps {
    children: ReactNode;
    className?: string;
    id?: string;
}

export function Section({ children, className, id }: SectionProps) {
    return (
        <section id={id} className={cn("py-8 md:py-12", className)}>
            <div className="container">
                {children}
            </div>
        </section>
    );
}