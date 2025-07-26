"use client";

import { useState, useEffect } from "react";
import InputForm, { FormValues } from "@/components/InputForm";
import TrainingTable from "@/components/TrainingTable";
import { generatePlan, TrainingPlan } from "@/lib/planGenerator";
import { useLocalStorage } from "@/lib/storage";
import PdfConfigurator from "@/components/pdf/PdfConfigurator";
import ErrorBoundary from "@/components/ErrorBoundary";

export default function Home() {
  const [formValues, setFormValues] = useLocalStorage<FormValues | null>(
    "training-form-values",
    null
  );
  const [plan, setPlan] = useLocalStorage<TrainingPlan | null>(
    "training-plan",
    null
  );
  const [step, setStep] = useState(1);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient && plan && plan.weeks.length > 0) {
      setStep(2);
    }
  }, [isClient, plan]);

  const handleFormSubmit = (data: FormValues) => {
    setFormValues(data);
    const newPlan = generatePlan(data);
    setPlan(newPlan);
    setStep(2);
  };

  const handleReset = () => {
    setPlan(null);
    setFormValues(null);
    setStep(1);
  };

  const handleUpdatePlan = (newPlan: TrainingPlan) => {
    setPlan(newPlan);
  };

  if (!isClient) {
    return null; // Or a loading spinner, to avoid hydration mismatch
  }

  return (
    <ErrorBoundary>
      <div className="bg-gray-50 min-h-screen">
        <div className="container mx-auto p-4 sm:p-8">
          <header className="text-center mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-800">
              🏃‍♂️ Running Plan Generator
            </h1>
            <p className="text-md sm:text-lg text-gray-600 mt-2">
              Generate and customize your personal race training plan.
            </p>
          </header>
          <main className="max-w-7xl mx-auto">
            {step === 1 && (
              <InputForm
                onSubmit={handleFormSubmit}
                initialValues={formValues}
              />
            )}
            {step === 2 && plan && (
              <>
                <TrainingTable plan={plan} onUpdatePlan={handleUpdatePlan} />
                <div className="flex justify-center items-center gap-4 mt-8">
                  <button
                    onClick={() => setStep(1)}
                    className="inline-block bg-gray-600 text-white py-2 px-6 rounded-lg hover:bg-gray-700 font-semibold"
                  >
                    Back to Form
                  </button>
                  <button
                    onClick={handleReset}
                    className="inline-block bg-red-600 text-white py-2 px-6 rounded-lg hover:bg-red-700 font-semibold"
                  >
                    Start Over
                  </button>
                  <button
                    onClick={() => setStep(3)}
                    className="inline-block bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700 font-semibold"
                  >
                    Configure & Preview PDF
                  </button>
                </div>
              </>
            )}
            {step === 3 && plan && (
              <PdfConfigurator onBack={() => setStep(2)} plan={plan} />
            )}
          </main>
        </div>
      </div>
    </ErrorBoundary>
  );
}
