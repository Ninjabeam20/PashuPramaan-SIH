"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { fetchTestingWorkspace, submitTestResult } from "@/lib/api/dummy/lab-testing";
import { WorkspaceFormView, WorkspaceReviewView, WorkspaceNextView } from "@/components/lab/TestingWorkspaceViews";

type WorkspaceView = "form" | "review" | "next";

export default function TestingWorkspacePage() {
  const params = useParams();
  const sampleId = params.sampleId as string;
  const [view, setView] = useState<WorkspaceView>("form");
  const [payload, setPayload] = useState<any>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["lab-workspace", sampleId],
    queryFn: () => fetchTestingWorkspace(sampleId),
  });

  if (isLoading || !data) {
    return (
      <div className="p-4 md:p-8 space-y-6 animate-pulse max-w-3xl mx-auto h-[100dvh]">
        <div className="h-10 w-24 bg-gray-200 rounded"></div>
        <div className="h-24 bg-gray-200 rounded-xl w-full"></div>
        <div className="h-[400px] bg-gray-200 rounded-2xl w-full"></div>
      </div>
    );
  }

  if (isError) {
    return <div className="p-4 text-red-500">Failed to load testing workspace.</div>;
  }

  if (view === "form") {
    return (
      <WorkspaceFormView 
        data={data} 
        onNext={(p) => {
          setPayload(p);
          setView("review");
        }} 
        onBack={() => {
          window.history.back();
        }}
      />
    );
  }

  const queryClient = useQueryClient();
  
  const submitMutation = useMutation({
    mutationFn: (testPayload: any) => submitTestResult(sampleId, testPayload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lab-workspace", sampleId] });
      queryClient.invalidateQueries({ queryKey: ["lab-queue"] });
      setView("next");
    }
  });

  if (view === "review") {
    return (
      <WorkspaceReviewView 
        payload={payload}
        onBack={() => setView("form")}
        onConfirm={() => {
          submitMutation.mutate({
            test_id: "mrl-assay",
            result_value: Number(payload.mrlValue),
            unit: "ppm",
            operator: "LAB-TECH-01",
            verdict: payload.mrlOk ? "WITHIN_LIMIT" : "EXCEEDED"
          });
        }}
      />
    );
  }

  if (view === "next") {
    return <WorkspaceNextView data={data} />;
  }

  return null;
}
