"use client";

import React, { useState, useEffect } from "react";
import { pdf } from "@react-pdf/renderer";
import { PDFViewer } from "@react-pdf/renderer";
import { PdfDocument } from "./PdfDocument";
import { TrainingPlan } from "@/lib/planGenerator";

interface PdfConfiguratorProps {
  onBack: () => void;
  plan: TrainingPlan;
}

interface PdfConfig {
  orientation: "portrait" | "landscape";
  title: string;
  headerColor: string;
}

export default function PdfConfigurator({
  onBack,
  plan,
}: PdfConfiguratorProps) {
  const [config, setConfig] = useState<PdfConfig>({
    orientation: "portrait",
    title: "Your Training Plan",
    headerColor: "#f3f4f6",
  });

  const [showPreview, setShowPreview] = useState(true);

  const handleDownload = async () => {
    try {
      const blob = await pdf(
        <PdfDocument plan={plan} config={config} />
      ).toBlob();
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

      <div className="grid grid-cols-3 gap-6">
        {/* Configuration Panel - 1/3 width */}
        <div className="space-y-6">
          {/* PDF Styling Options */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-gray-800 mb-4">PDF Options</h3>

            {/* Orientation */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-800 mb-2">
                Orientation
              </label>
              <div className="flex gap-4">
                <label className="flex items-center text-gray-800">
                  <input
                    type="radio"
                    name="orientation"
                    value="portrait"
                    checked={config.orientation === "portrait"}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        orientation: e.target.value as "portrait" | "landscape",
                      })
                    }
                    className="mr-2"
                  />
                  📄 Portrait
                </label>
                <label className="flex items-center text-gray-800">
                  <input
                    type="radio"
                    name="orientation"
                    value="landscape"
                    checked={config.orientation === "landscape"}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        orientation: e.target.value as "portrait" | "landscape",
                      })
                    }
                    className="mr-2"
                  />
                  📄 Landscape
                </label>
              </div>
            </div>

            {/* Custom Title */}
            <div className="mb-4 text-gray-800">
              <label className="block text-sm font-medium text-gray-800 mb-2">
                Document Title
              </label>
              <input
                type="text"
                value={config.title}
                onChange={(e) =>
                  setConfig({ ...config, title: e.target.value })
                }
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Your Training Plan"
              />
            </div>

            {/* Header Color */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-800 mb-2">
                Table Header Color
              </label>
              <div className="flex items-center gap-3 text-gray-800">
                <input
                  type="color"
                  value={config.headerColor}
                  onChange={(e) =>
                    setConfig({ ...config, headerColor: e.target.value })
                  }
                  className="w-12 h-10 border border-gray-300 rounded-md cursor-pointer"
                />
                <input
                  type="text"
                  value={config.headerColor}
                  onChange={(e) =>
                    setConfig({ ...config, headerColor: e.target.value })
                  }
                  className="flex-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="#f3f4f6"
                />
                <button
                  onClick={() =>
                    setConfig({ ...config, headerColor: "#f3f4f6" })
                  }
                  className="px-3 py-2 text-sm bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                >
                  Reset
                </button>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-gray-800 mb-2">Plan Summary</h3>
            <p className="text-sm text-gray-600">
              📅 {plan.weeks.length} weeks of training
            </p>
            <p className="text-sm text-gray-600">
              🏃‍♂️ Total weekly distance varies by week
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-4">
            <button
              onClick={onBack}
              className="w-full bg-gray-600 text-white py-2 px-6 rounded-lg hover:bg-gray-700 font-semibold"
            >
              Back to Table
            </button>
            <button
              onClick={handleDownload}
              className="w-full bg-green-600 text-white py-2 px-6 rounded-lg hover:bg-green-700 font-semibold"
            >
              📥 Download PDF
            </button>
          </div>
        </div>

        {/* Live Preview - 2/3 width */}
        <div className="col-span-2">
          <div className="border border-gray-300 rounded-lg overflow-hidden bg-gray-100 h-full">
            <div className="px-4 py-2 bg-gray-50 border-b">
              <h3 className="font-semibold text-gray-800">Live Preview</h3>
            </div>
            <div className="h-96 w-full h-full">
              <PDFViewer
                width="100%"
                height="100%"
                style={{ border: "none" }}
                showToolbar={false}
              >
                <PdfDocument plan={plan} config={config} />
              </PDFViewer>
            </div>
            <div className="p-2 bg-gray-50 border-t text-xs text-gray-600 text-center">
              Preview updates automatically as you change settings
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
