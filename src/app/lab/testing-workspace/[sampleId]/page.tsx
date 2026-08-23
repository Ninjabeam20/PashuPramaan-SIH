"use client";

import React, { useState, useEffect } from "react";
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

  const queryClient = useQueryClient();
  
  const submitMutation = useMutation({
    mutationFn: (testPayload: any) => submitTestResult(sampleId, testPayload),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["lab-workspace", sampleId] });
      queryClient.invalidateQueries({ queryKey: ["lab-queue"] });
      // Clear payload and go back to form to evaluate next test
      setPayload(null);
      setView("form");
    }
  });

  const router = require("next/navigation").useRouter();
  const { submitAssessment } = require("@/lib/api/dummy/lab-testing");
  const finalizeMutation = useMutation({
    mutationFn: () => submitAssessment(sampleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lab-queue"] });
      queryClient.invalidateQueries({ queryKey: ["lab-results"] });
      router.push("/lab/results");
    }
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

  const allDone = data.assessments.length > 0 && data.assessments.every((a: any) => a.state === "done");
  const currentView = allDone ? "next" : view;

  if (currentView === "form") {
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

  if (currentView === "review") {
    return (
      <WorkspaceReviewView 
        payload={payload}
        activeTest={data.assessments.find((a: any) => a.state === "active")}
        onBack={() => setView("form")}
        onConfirm={() => {
          submitMutation.mutate({
            test_id: payload.test_id,
            result_value: Number(payload.mrlValue),
            unit: payload.unit,
            operator: "LAB-TECH-01",
            verdict: "Within Limits"
          });
        }}
      />
    );
  }

  if (currentView === "next") {
    return <WorkspaceNextView data={data} onFinalize={() => finalizeMutation.mutate()} />;
  }

  return null;
}
