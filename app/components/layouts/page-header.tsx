import { ReactNode } from "react";

interface PageHeaderProps {
    title: string;
    description?: string;
    children?: ReactNode;
}

export function PageHeader({ title, description, children }: PageHeaderProps) {
    return (
        <div className="border-b bg-muted/40">
            <div className="container py-8 md:py-12">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
                        {description && (
                            <p className="mt-2 text-muted-foreground">{description}</p>
                        )}
                    </div>
                    {children && <div>{children}</div>}
                </div>
            </div>
        </div>
    );
}