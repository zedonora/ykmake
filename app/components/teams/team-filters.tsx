import * as React from "react";
import { Check } from "lucide-react";

import { cn } from "~/lib/utils";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Badge } from "~/components/ui/badge";
import ClientOnly from "~/components/ui/client-only";

const categories = [
    { value: "all", label: "전체" },
    { value: "development", label: "개발" },
    { value: "design", label: "디자인" },
    { value: "planning", label: "기획" },
    { value: "marketing", label: "마케팅" },
];

const statuses = [
    { value: "all", label: "전체" },
    { value: "recruiting", label: "모집 중" },
    { value: "in-progress", label: "진행 중" },
    { value: "completed", label: "완료" },
];

export function TeamFilters() {
    const [selectedCategories, setSelectedCategories] = React.useState<string[]>([]);
    const [selectedStatus, setSelectedStatus] = React.useState("all");
    const [searchQuery, setSearchQuery] = React.useState("");

    const toggleCategory = (value: string) => {
        setSelectedCategories((prev) =>
            prev.includes(value)
                ? prev.filter((cat) => cat !== value)
                : [...prev, value]
        );
    };

    return (
        <ClientOnly>
            <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                    {categories.map((category) => (
                        <Button
                            key={category.value}
                            variant={selectedCategories.includes(category.value) ? "default" : "outline"}
                            onClick={() => toggleCategory(category.value)}
                            className="h-8"
                        >
                            {category.label}
                            {selectedCategories.includes(category.value) && (
                                <Check className="ml-2 h-4 w-4" />
                            )}
                        </Button>
                    ))}
                </div>

                <div className="flex flex-wrap gap-2">
                    {statuses.map((status) => (
                        <Button
                            key={status.value}
                            variant={selectedStatus === status.value ? "default" : "outline"}
                            onClick={() => setSelectedStatus(status.value)}
                            className="h-8"
                        >
                            {status.label}
                        </Button>
                    ))}
                </div>

                <div className="flex gap-2">
                    <Input
                        placeholder="팀 이름 또는 설명 검색"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="max-w-sm"
                    />
                </div>

                {(selectedCategories.length > 0 || selectedStatus !== "all" || searchQuery) && (
                    <div className="flex flex-wrap gap-2">
                        {selectedCategories.map((cat) => (
                            <Badge
                                key={cat}
                                variant="secondary"
                                className="cursor-pointer"
                                onClick={() => toggleCategory(cat)}
                            >
                                {categories.find((c) => c.value === cat)?.label} ✕
                            </Badge>
                        ))}
                        {selectedStatus !== "all" && (
                            <Badge
                                variant="secondary"
                                className="cursor-pointer"
                                onClick={() => setSelectedStatus("all")}
                            >
                                {statuses.find((s) => s.value === selectedStatus)?.label} ✕
                            </Badge>
                        )}
                        {searchQuery && (
                            <Badge
                                variant="secondary"
                                className="cursor-pointer"
                                onClick={() => setSearchQuery("")}
                            >
                                검색: {searchQuery} ✕
                            </Badge>
                        )}
                    </div>
                )}
            </div>
        </ClientOnly>
    );
}