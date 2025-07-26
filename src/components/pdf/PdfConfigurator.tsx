"use client";

import React from "react";
import { pdf } from "@react-pdf/renderer";
import { PdfDocument } from "./PdfDocument";
import { TrainingPlan } from "@/lib/planGenerator";

interface PdfConfiguratorProps {
  onBack: () => void;
  plan: TrainingPlan;
}

export default function PdfConfigurator({
  onBack,
  plan,
}: PdfConfiguratorProps) {
  const handleDownload = async () => {
    try {
      const blob = await pdf(<PdfDocument plan={plan} />).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `training-plan-${
        new Date().toISOString().split("T")[0]
      }.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Error generating PDF. Please try again.");
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Configure PDF</h2>
      <p className="text-gray-600 mb-6">
        Customize the look and feel of your PDF export.
      </p>

      <div className="space-y-4 mb-6">
        <div className="p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold text-gray-700 mb-2">Plan Summary</h3>
          <p className="text-sm text-gray-600">
            📅 {plan.weeks.length} weeks of training
          </p>
          <p className="text-sm text-gray-600">
            🏃‍♂️ Total weekly distance varies by week
          </p>
        </div>
      </div>

      <div className="flex justify-start gap-4 mt-8">
        <button
          onClick={onBack}
          className="inline-block bg-gray-600 text-white py-2 px-6 rounded-lg hover:bg-gray-700 font-semibold"
        >
          Back to Table
        </button>
        <button
          onClick={handleDownload}
          className="inline-block bg-green-600 text-white py-2 px-6 rounded-lg hover:bg-green-700 font-semibold"
        >
          📥 Download PDF
        </button>
      </div>
    </div>
  );
}
