"use client";

import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Run } from "@/lib/planGenerator";
import { useEffect } from "react";

const trainingDaySchema = z.object({
  day: z.string(),
  workouts: z
    .array(
      z.object({
        runType: z.string(),
        nickname: z.string().optional(),
      })
    )
    .min(1, "At least one workout required"),
});

const formSchema = z
  .object({
    todayDate: z.string().min(1, "Today's Date is required"),
    raceDate: z.string().min(1, "Race Date is required"),
    raceDistance: z.string().min(1, "Race Distance is required"),
    customRaceDistance: z
      .number()
      .positive("Distance must be positive")
      .optional(),
    trainingDays: z
      .array(trainingDaySchema)
      .min(1, "Select at least one training day"),
  })
  .refine(
    (data) => {
      if (data.raceDate && data.todayDate) {
        return new Date(data.raceDate) > new Date(data.todayDate);
      }
      return true;
    },
    {
      message: "Race date must be after today's date",
      path: ["raceDate"],
    }
  )
  .refine(
    (data) => {
      if (data.raceDistance === "custom") {
        return data.customRaceDistance && data.customRaceDistance > 0;
      }
      return true;
    },
    {
      message: "Custom distance is required and must be greater than 0",
      path: ["customRaceDistance"],
    }
  );

export type FormValues = z.infer<typeof formSchema>;

interface InputFormProps {
  onSubmit: (data: FormValues) => void;
  initialValues: FormValues | null;
}

const runTypes: Run["type"][] = [
  "Easy",
  "Long",
  "Interval",
  "Tempo",
  "Strength",
];
const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function InputForm({ onSubmit, initialValues }: InputFormProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialValues || {
      todayDate: new Date().toISOString().split("T")[0],
      trainingDays: [],
    },
  });

  // Reset form when initialValues change (e.g., when coming back from table)
  useEffect(() => {
    if (initialValues) {
      form.reset(initialValues);
    }
  }, [initialValues, form]);

  const watchedRaceDistance = useWatch({
    control: form.control,
    name: "raceDistance",
  });

  const watchedTrainingDays = useWatch({
    control: form.control,
    name: "trainingDays",
    defaultValue: [],
  });

  const handleDayChange = (checked: boolean, day: string) => {
    const currentDays = form.getValues("trainingDays");
    if (checked) {
      form.setValue("trainingDays", [
        ...currentDays,
        { day, workouts: [{ runType: "Easy" }] },
      ]);
    } else {
      form.setValue(
        "trainingDays",
        currentDays.filter((d) => d.day !== day)
      );
    }
    // Trigger validation to show/hide error messages
    form.trigger("trainingDays");
  };

  const handleAddWorkout = (day: string) => {
    const currentDays = form.getValues("trainingDays");
    const dayIndex = currentDays.findIndex((d) => d.day === day);
    if (dayIndex !== -1) {
      const updatedDays = [...currentDays];
      updatedDays[dayIndex] = {
        ...updatedDays[dayIndex],
        workouts: [...updatedDays[dayIndex].workouts, { runType: "Easy" }],
      };
      form.setValue("trainingDays", updatedDays);
    }
  };

  const handleRemoveWorkout = (day: string, workoutIndex: number) => {
    const currentDays = form.getValues("trainingDays");
    const dayIndex = currentDays.findIndex((d) => d.day === day);
    if (dayIndex !== -1) {
      const updatedDays = [...currentDays];
      updatedDays[dayIndex] = {
        ...updatedDays[dayIndex],
        workouts: updatedDays[dayIndex].workouts.filter(
          (_, index) => index !== workoutIndex
        ),
      };
      form.setValue("trainingDays", updatedDays);
    }
  };

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="space-y-6 bg-white p-6 rounded-xl shadow-lg border border-gray-200"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Today's Date */}
        <div>
          <label
            htmlFor="todayDate"
            className="block text-sm font-semibold text-gray-800 mb-1"
          >
            📅 Today&apos;s Date
          </label>
          <input
            type="date"
            id="todayDate"
            {...form.register("todayDate")}
            className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm text-black"
          />
          {form.formState.errors.todayDate && (
            <p className="mt-2 text-sm text-red-600">
              {form.formState.errors.todayDate.message}
            </p>
          )}
        </div>

        {/* Race Date */}
        <div>
          <label
            htmlFor="raceDate"
            className="block text-sm font-semibold text-gray-800 mb-1"
          >
            🏁 Race Date
          </label>
          <input
            type="date"
            id="raceDate"
            {...form.register("raceDate")}
            className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm text-black"
          />
          {form.formState.errors.raceDate && (
            <p className="mt-2 text-sm text-red-600">
              {form.formState.errors.raceDate.message}
            </p>
          )}
        </div>
      </div>

      {/* Race Distance */}
      <div>
        <label
          htmlFor="raceDistance"
          className="block text-sm font-semibold text-gray-800 mb-1"
        >
          📐 Race Distance
        </label>
        <div className="flex gap-4">
          <select
            id="raceDistance"
            {...form.register("raceDistance")}
            className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm text-black"
          >
            <option value="">Select a distance</option>
            <option value="5k">5K</option>
            <option value="10k">10K</option>
            <option value="half">Half Marathon</option>
            <option value="full">Full Marathon</option>
            <option value="custom">Custom</option>
          </select>
          {watchedRaceDistance === "custom" && (
            <input
              type="number"
              placeholder="KM"
              {...form.register("customRaceDistance", { valueAsNumber: true })}
              className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm text-black"
            />
          )}
        </div>
        {form.formState.errors.raceDistance && (
          <p className="mt-2 text-sm text-red-600">
            {form.formState.errors.raceDistance.message}
          </p>
        )}
        {form.formState.errors.customRaceDistance && (
          <p className="mt-2 text-sm text-red-600">
            {form.formState.errors.customRaceDistance.message}
          </p>
        )}
      </div>

      {/* Preferred Training Days */}
      <div>
        <label className="block text-sm font-semibold text-gray-800 mb-2">
          ✅ Preferred Training Days
        </label>
        <div className="flex flex-col space-y-4">
          {daysOfWeek.map((day) => {
            const selectedDay = watchedTrainingDays.find((d) => d.day === day);
            const isChecked = !!selectedDay;
            return (
              <div
                key={day}
                className="flex flex-col space-y-2 p-3 border border-gray-200 rounded-lg"
              >
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id={day}
                    checked={isChecked}
                    onChange={(e) => handleDayChange(e.target.checked, day)}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label
                    htmlFor={day}
                    className="ml-3 block text-sm font-medium text-gray-800 w-12"
                  >
                    {day}
                  </label>
                </div>
                {isChecked && selectedDay && (
                  <div className="ml-7 space-y-2">
                    {selectedDay.workouts.map((workout, workoutIndex) => (
                      <div
                        key={workoutIndex}
                        className="flex flex-col space-y-2 p-2 border border-gray-100 rounded"
                      >
                        <div className="flex items-center space-x-2">
                          <select
                            {...form.register(
                              `trainingDays.${watchedTrainingDays.findIndex(
                                (d) => d.day === day
                              )}.workouts.${workoutIndex}.runType`
                            )}
                            className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm text-black"
                          >
                            {runTypes.map((type) => (
                              <option key={type} value={type}>
                                {type}
                              </option>
                            ))}
                          </select>
                          {selectedDay.workouts.length > 1 && (
                            <button
                              type="button"
                              onClick={() =>
                                handleRemoveWorkout(day, workoutIndex)
                              }
                              className="text-red-500 hover:text-red-700 text-sm px-2"
                            >
                              ✕
                            </button>
                          )}
                        </div>
                        <input
                          type="text"
                          placeholder="Nickname (e.g., Upper Body, Lower Body, Hills)"
                          {...form.register(
                            `trainingDays.${watchedTrainingDays.findIndex(
                              (d) => d.day === day
                            )}.workouts.${workoutIndex}.nickname`
                          )}
                          className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm text-black text-xs"
                        />
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => handleAddWorkout(day)}
                      className="text-blue-500 hover:text-blue-700 text-sm font-medium"
                    >
                      + Add Another Workout
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        {form.formState.errors.trainingDays && (
          <p className="mt-2 text-sm text-red-600">
            {form.formState.errors.trainingDays.message}
          </p>
        )}
      </div>

      <button
        type="submit"
        className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        Generate Plan
      </button>
    </form>
  );
}
