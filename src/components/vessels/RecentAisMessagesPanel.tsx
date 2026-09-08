"use client";

import { useState } from "react";
import { RecentAisMessagesTable } from "./RecentAisMessagesTable";
import { SimplePagination } from "@/components/shared/SimplePagination";
import { Skeleton } from "@/components/ui/skeleton";
import { useVesselMessages } from "@/hooks/use-vessel-messages";

const PAGE_SIZE = 10;

export function RecentAisMessagesPanel({ mmsi }: { mmsi: string }) {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useVesselMessages(mmsi, page, PAGE_SIZE);

  if (isLoading && !data) {
    return <Skeleton className="h-64 w-full" />;
  }

  return (
    <div className="space-y-2">
      <RecentAisMessagesTable positions={data?.data ?? []} />
      <SimplePagination
        page={page}
        pageSize={PAGE_SIZE}
        total={data?.total ?? 0}
        onPageChange={setPage}
      />
    </div>
  );
}
