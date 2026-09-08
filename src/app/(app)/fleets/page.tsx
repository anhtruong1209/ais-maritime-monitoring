import Link from "next/link";
import { Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { T } from "@/components/shared/T";
import { getFleets } from "@/lib/data/fleets";

export default async function FleetsPage() {
  const fleets = await getFleets();

  return (
    <div className="space-y-4 p-4">
      <h1 className="text-lg font-semibold"><T>Fleets</T></h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {fleets.map((fleet) => (
          <Link key={fleet.id} href={`/fleets/${fleet.id}`}>
            <Card className="h-full transition-colors hover:border-primary/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base font-semibold">
                  <Users className="size-4 text-primary" />
                  {fleet.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {fleet.description && (
                  <p className="text-sm text-muted-foreground">{fleet.description}</p>
                )}
                <p className="text-2xl font-semibold tabular-nums">
                  {fleet.vesselCount}
                  <span className="ml-1.5 text-sm font-normal text-muted-foreground">
                    <T>vessels</T>
                  </span>
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
