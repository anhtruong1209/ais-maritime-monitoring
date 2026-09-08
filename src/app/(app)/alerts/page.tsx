import { Badge } from "@/components/ui/badge";
import { AnomalyFilters } from "@/components/alerts/AnomalyFilters";
import { AnomalyTable } from "@/components/alerts/AnomalyTable";
import { Pagination } from "@/components/shared/Pagination";
import { T } from "@/components/shared/T";
import { getAnomalies } from "@/lib/data/anomalies";
import { anomalyListQuerySchema } from "@/lib/validation/anomaly";
import { DEFAULT_PAGE_SIZE } from "@/lib/constants";

interface PageProps {
  searchParams: Promise<Record<string, string | undefined>>;
}

export default async function AlertsPage({ searchParams }: PageProps) {
  const rawParams = await searchParams;
  const query = anomalyListQuerySchema.parse({
    ...rawParams,
    pageSize: rawParams.pageSize ?? String(DEFAULT_PAGE_SIZE),
  });

  const { data, total } = await getAnomalies(query);

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h1 className="text-lg font-semibold">
            <T>Alerts / Anomalies</T>
          </h1>
          <Badge variant="outline" className="border-amber-500/40 text-amber-400">
            <T>DEMO DATA</T>
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          {total} <T>total</T>
        </p>
      </div>

      <AnomalyFilters />
      <AnomalyTable anomalies={data} />
      <Pagination
        page={query.page}
        pageSize={query.pageSize}
        total={total}
        basePath="/alerts"
        searchParams={rawParams}
      />
    </div>
  );
}
