"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ShieldCheck, ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { AnalysisResult } from "@/components/dashboard/AnalysisResult";
import { Skeleton } from "@/components/ui/Skeleton";
import { Button } from "@/components/ui/Button";
import { api } from "@/lib/api";
import type { ThreatAnalysis } from "@/types/api";

export default function ThreatDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [data, setData] = useState<ThreatAnalysis | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!params?.id) return;
    api
      .getAnalysis(Number(params.id))
      .then(setData)
      .finally(() => setLoading(false));
  }, [params?.id]);

  return (
    <div className="space-y-5">
      <PageHeader
        icon={ShieldCheck}
        title={`Analysis #${params?.id}`}
        subtitle="Full AI threat report"
        action={
          <Button variant="ghost" onClick={() => router.back()} icon={<ArrowLeft className="w-4 h-4" />}>
            Back
          </Button>
        }
      />
      {loading ? (
        <div className="grid lg:grid-cols-3 gap-4">
          <Skeleton className="h-[420px]" />
          <Skeleton className="h-[420px] lg:col-span-2" />
        </div>
      ) : data ? (
        <AnalysisResult data={data} />
      ) : (
        <div className="text-sm text-slate-400">Analysis not found.</div>
      )}
    </div>
  );
}
