"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { useLocale } from "@/providers/locale-provider";

interface PaginationProps {
  page: number;
  pageSize: number;
  total: number;
  basePath: string;
  searchParams: Record<string, string | undefined>;
}

const linkClass =
  "inline-flex h-8 items-center rounded-md border border-border px-3 text-sm font-medium transition-colors hover:bg-secondary";
const disabledClass = "pointer-events-none opacity-50";

export function Pagination({ page, pageSize, total, basePath, searchParams }: PaginationProps) {
  const { t } = useLocale();
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  function hrefFor(targetPage: number) {
    const params = new URLSearchParams(
      Object.entries(searchParams).filter(([, v]) => v) as [string, string][]
    );
    params.set("page", String(targetPage));
    return `${basePath}?${params.toString()}`;
  }

  const start = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(total, page * pageSize);
  const hasPrevious = page > 1;
  const hasNext = page < totalPages;

  return (
    <div className="flex items-center justify-between text-sm">
      <p className="text-muted-foreground">
        {start}–{end} {t("of")} {total}
      </p>
      <div className="flex gap-1">
        <Link
          href={hrefFor(page - 1)}
          aria-disabled={!hasPrevious}
          tabIndex={hasPrevious ? undefined : -1}
          className={cn(linkClass, !hasPrevious && disabledClass)}
        >
          {t("Previous")}
        </Link>
        <Link
          href={hrefFor(page + 1)}
          aria-disabled={!hasNext}
          tabIndex={hasNext ? undefined : -1}
          className={cn(linkClass, !hasNext && disabledClass)}
        >
          {t("Next")}
        </Link>
      </div>
    </div>
  );
}
