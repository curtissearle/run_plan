"use client";

import { TrainingPlan, Week, Run, Day } from "@/lib/planGenerator";
import { useState, useEffect } from "react";

interface TrainingTableProps {
  plan: TrainingPlan;
  onUpdatePlan: (plan: TrainingPlan) => void;
}

const runTypeColors: Record<Run["type"], string> = {
  Easy: "bg-blue-200",
  Long: "bg-green-200",
  Tempo: "bg-yellow-200",
  Interval: "bg-purple-200",
  Strength: "bg-orange-200",
  Race: "bg-red-300",
  Rest: "bg-gray-200",
};

const days: Day[] = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

interface RunCellProps {
  week: Week;
  day: Day;
  weekIndex: number;
  onUpdateRun: (weekIndex: number, day: Day, newDistance: number) => void;
}

const RunCell = ({ week, day, weekIndex, onUpdateRun }: RunCellProps) => {
  const run = week.days[day];

  // Rest day - no run scheduled
  if (!run) {
    return (
      <div className="w-full p-2 rounded text-center bg-gray-100 h-[70px] flex items-center justify-center">
        <span className="text-sm text-gray-500">Rest</span>
      </div>
    );
  }

  const colorClass = runTypeColors[run.type] || "bg-gray-100";

  return (
    <div
      className={`w-full p-2 rounded text-center ${colorClass} h-[70px] flex flex-col justify-center border border-gray-300`}
    >
      <span className="text-xs font-medium text-gray-700 mb-1">{run.type}</span>
      <input
        type="number"
        value={run.distance && run.distance > 0 ? run.distance : ""}
        onChange={(e) => {
          const newDistance = Number(e.target.value);
          onUpdateRun(
            weekIndex,
            day,
            isNaN(newDistance) || e.target.value === "" ? 0 : newDistance
          );
        }}
        className="w-full bg-transparent text-center font-bold text-lg text-black p-0 border-none focus:ring-0"
        style={{ outline: "none" }}
        min="0"
        step="1"
        placeholder=""
      />
      <span className="text-xs text-gray-600">km</span>
    </div>
  );
};

export default function TrainingTable({
  plan,
  onUpdatePlan,
}: TrainingTableProps) {
  const [weeks, setWeeks] = useState<Week[]>(plan.weeks);

  useEffect(() => {
    setWeeks(plan.weeks);
  }, [plan]);

  const handleUpdateRun = (
    weekIndex: number,
    day: Day,
    newDistance: number
  ) => {
    const updatedWeeks = weeks.map((week, index) => {
      if (index === weekIndex) {
        const updatedWeek = { ...week };
        const run = updatedWeek.days[day];

        if (run) {
          // Update the run distance
          updatedWeek.days[day] = { ...run, distance: newDistance };

          // Recalculate weekly total
          updatedWeek.weeklyTotal = Math.round(
            Object.values(updatedWeek.days).reduce(
              (total, dayRun) => total + (dayRun?.distance || 0),
              0
            )
          );
        }

        return updatedWeek;
      }
      return week;
    });

    setWeeks(updatedWeeks);
    onUpdatePlan({ ...plan, weeks: updatedWeeks });
  };

  return (
    <div className="mt-8 overflow-x-auto">
      {/* Color Legend */}
      <div className="flex flex-wrap gap-4 mb-6">
        <h3 className="text-lg font-semibold text-gray-800 w-full mb-2">
          Run Type Legend:
        </h3>
        {Object.entries(runTypeColors)
          .filter(([type]) => type !== "Rest")
          .map(([type, colorClass]) => (
            <div key={type} className="flex items-center gap-2">
              <div
                className={`w-5 h-5 rounded ${colorClass} border border-gray-300`}
              ></div>
              <span className="text-sm font-medium text-gray-800">{type}</span>
            </div>
          ))}
      </div>

      {/* Training Table */}
      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-800 text-white">
            <tr>
              <th className="p-4 text-center font-bold">Week</th>
              {days.map((day) => (
                <th key={day} className="p-4 text-center font-bold">
                  {day}
                </th>
              ))}
              <th className="p-4 text-center font-bold">Total (KM)</th>
            </tr>
          </thead>
          <tbody className="text-gray-700">
            {weeks.map((week, weekIndex) => (
              <tr
                key={week.week}
                className="border-b border-gray-200 hover:bg-gray-50"
              >
                <td className="p-4 text-center font-bold text-gray-800">
                  <div className="flex items-center justify-center h-[70px]">
                    {week.week}
                  </div>
                </td>
                {days.map((day) => (
                  <td key={day} className="p-2">
                    <RunCell
                      week={week}
                      day={day}
                      weekIndex={weekIndex}
                      onUpdateRun={handleUpdateRun}
                    />
                  </td>
                ))}
                <td className="p-4 text-center font-bold text-lg text-gray-800">
                  <div className="flex items-center justify-center h-[70px]">
                    {week.weeklyTotal}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
