"use client";

import { TrainingPlan, Week, Run, Day } from "@/lib/planGenerator";
import { useState, useEffect } from "react";
import React from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

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

interface DraggableWorkoutProps {
  run: Run;
  runIndex: number;
  weekIndex: number;
  day: Day;
  canRemove: boolean;
  onUpdateRun: (
    weekIndex: number,
    day: Day,
    runIndex: number,
    newDistance: number
  ) => void;
  onUpdateNickname: (
    weekIndex: number,
    day: Day,
    runIndex: number,
    nickname: string
  ) => void;
  onRemoveRun: (weekIndex: number, day: Day, runIndex: number) => void;
}

const DraggableWorkout = ({
  run,
  runIndex,
  weekIndex,
  day,
  canRemove,
  onUpdateRun,
  onUpdateNickname,
  onRemoveRun,
}: DraggableWorkoutProps) => {
  const [isEditingNickname, setIsEditingNickname] = React.useState(false);
  const [nicknameValue, setNicknameValue] = React.useState(run.nickname || "");

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: run.id || `${weekIndex}-${day}-${runIndex}`,
    data: {
      type: "workout",
      run,
      weekIndex,
      day,
      runIndex,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const colorClass = runTypeColors[run.type] || "bg-gray-100";

  const handleNicknameSave = () => {
    onUpdateNickname(weekIndex, day, runIndex, nicknameValue);
    setIsEditingNickname(false);
  };

  const handleNicknameCancel = () => {
    setNicknameValue(run.nickname || "");
    setIsEditingNickname(false);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className={`w-full p-2 rounded text-center ${colorClass} min-h-[60px] flex flex-col justify-center border border-gray-300 relative ${
        isDragging ? "z-50" : ""
      }`}
    >
      {/* Drag Handle */}
      <div
        {...listeners}
        className="absolute top-1 left-1 cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600"
        style={{ fontSize: "12px" }}
      >
        ⋮⋮
      </div>

      {canRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemoveRun(weekIndex, day, runIndex);
          }}
          className="absolute top-0 right-0 text-red-500 hover:text-red-700 text-xs leading-none"
          style={{ fontSize: "10px", padding: "2px" }}
        >
          ✕
        </button>
      )}
      <div className="text-xs font-medium text-gray-700 mb-1">
        <div>{run.type}</div>
        {isEditingNickname ? (
          <div className="mt-1" onClick={(e) => e.stopPropagation()}>
            <input
              type="text"
              value={nicknameValue}
              onChange={(e) => setNicknameValue(e.target.value)}
              className="w-full text-xs text-center border border-gray-300 rounded px-1 py-0.5"
              placeholder="Nickname"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleNicknameSave();
                } else if (e.key === "Escape") {
                  handleNicknameCancel();
                }
              }}
            />
            <div className="flex gap-1 mt-1">
              <button
                onClick={handleNicknameSave}
                className="text-xs bg-green-500 text-white px-1 py-0.5 rounded hover:bg-green-600"
              >
                ✓
              </button>
              <button
                onClick={handleNicknameCancel}
                className="text-xs bg-gray-500 text-white px-1 py-0.5 rounded hover:bg-gray-600"
              >
                ✕
              </button>
            </div>
          </div>
        ) : (
          <div
            className="text-xs text-gray-600 cursor-pointer hover:text-blue-600"
            onClick={(e) => {
              e.stopPropagation();
              setIsEditingNickname(true);
            }}
          >
            {run.nickname ? `(${run.nickname})` : "(click to add nickname)"}
          </div>
        )}
      </div>
      <input
        type="number"
        value={run.distance && run.distance > 0 ? run.distance : ""}
        onChange={(e) => {
          const newDistance = Number(e.target.value);
          onUpdateRun(
            weekIndex,
            day,
            runIndex,
            isNaN(newDistance) || e.target.value === "" ? 0 : newDistance
          );
        }}
        onClick={(e) => e.stopPropagation()}
        className="w-full bg-transparent text-center font-bold text-sm text-black p-0 border-none focus:ring-0"
        style={{ outline: "none" }}
        min="0"
        step="1"
        placeholder=""
      />
      <span className="text-xs text-gray-600">km</span>
    </div>
  );
};

interface RunCellProps {
  week: Week;
  day: Day;
  weekIndex: number;
  onUpdateRun: (
    weekIndex: number,
    day: Day,
    runIndex: number,
    newDistance: number
  ) => void;
  onUpdateNickname: (
    weekIndex: number,
    day: Day,
    runIndex: number,
    nickname: string
  ) => void;
  onAddRun: (
    weekIndex: number,
    day: Day,
    workoutType?: Run["type"],
    nickname?: string
  ) => void;
  onRemoveRun: (weekIndex: number, day: Day, runIndex: number) => void;
}

const RunCell = ({
  week,
  day,
  weekIndex,
  onUpdateRun,
  onUpdateNickname,
  onAddRun,
  onRemoveRun,
}: RunCellProps) => {
  const runs = week.days[day];
  const [showWorkoutSelector, setShowWorkoutSelector] = React.useState(false);
  const [newWorkoutType, setNewWorkoutType] =
    React.useState<Run["type"]>("Easy");
  const [newWorkoutNickname, setNewWorkoutNickname] = React.useState("");

  const workoutTypes: Run["type"][] = [
    "Easy",
    "Long",
    "Tempo",
    "Interval",
    "Strength",
    "Race",
  ];

  // Always call useDroppable, regardless of runs
  const emptyDroppable = useDroppable({
    id: `${weekIndex}-${day}-empty`,
    data: {
      type: "empty-day",
      weekIndex,
      day,
    },
  });
  const dayDroppable = useDroppable({
    id: `${weekIndex}-${day}-day`,
    data: {
      type: "day",
      weekIndex,
      day,
    },
  });

  const handleAddWorkout = () => {
    onAddRun(weekIndex, day, newWorkoutType, newWorkoutNickname || undefined);
    setShowWorkoutSelector(false);
    setNewWorkoutType("Easy");
    setNewWorkoutNickname("");
  };

  // Rest day - no runs scheduled
  if (!runs || runs.length === 0) {
    const { isOver, setNodeRef } = emptyDroppable;
    return (
      <div
        ref={setNodeRef}
        className={`w-full p-2 rounded text-center ${
          isOver ? "bg-blue-100 border-2 border-blue-300" : "bg-gray-100"
        } min-h-[70px] flex flex-col items-center justify-center relative`}
      >
        <span className="text-sm text-gray-500 mb-2">
          {isOver ? "Drop workout here" : "Rest"}
        </span>
        {!showWorkoutSelector ? (
          <button
            onClick={() => setShowWorkoutSelector(true)}
            className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
          >
            + Add Workout
          </button>
        ) : (
          <div className="absolute z-10 bg-white border border-gray-300 rounded shadow-lg p-3 min-w-[160px]">
            <div className="text-xs font-medium mb-2">Add Workout:</div>
            <select
              value={newWorkoutType}
              onChange={(e) => setNewWorkoutType(e.target.value as Run["type"])}
              className="w-full mb-2 text-xs border border-gray-300 rounded px-2 py-1"
            >
              {workoutTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Nickname (optional)"
              value={newWorkoutNickname}
              onChange={(e) => setNewWorkoutNickname(e.target.value)}
              className="w-full mb-2 text-xs border border-gray-300 rounded px-2 py-1"
            />
            <div className="flex gap-1">
              <button
                onClick={handleAddWorkout}
                className="flex-1 text-xs bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600"
              >
                Add
              </button>
              <button
                onClick={() => setShowWorkoutSelector(false)}
                className="flex-1 text-xs bg-gray-500 text-white px-2 py-1 rounded hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  const runIds = runs.map(
    (run) => run.id || `${weekIndex}-${day}-${runs.indexOf(run)}`
  );

  const { isOver, setNodeRef: setDroppableRef } = dayDroppable;

  return (
    <SortableContext items={runIds} strategy={verticalListSortingStrategy}>
      <div
        ref={setDroppableRef}
        className={`w-full p-2 space-y-2 relative min-h-[70px] ${
          isOver ? "bg-blue-50 border-2 border-blue-300 border-dashed" : ""
        }`}
      >
        {runs.map((run, runIndex) => (
          <DraggableWorkout
            key={run.id || `${weekIndex}-${day}-${runIndex}`}
            run={run}
            runIndex={runIndex}
            weekIndex={weekIndex}
            day={day}
            canRemove={true}
            onUpdateRun={onUpdateRun}
            onUpdateNickname={onUpdateNickname}
            onRemoveRun={onRemoveRun}
          />
        ))}
        {!showWorkoutSelector ? (
          <button
            onClick={() => setShowWorkoutSelector(true)}
            className="w-full text-xs bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600"
          >
            + Add Workout
          </button>
        ) : (
          <div className="absolute z-10 bg-white border border-gray-300 rounded shadow-lg p-3 min-w-[160px] top-full left-0">
            <div className="text-xs font-medium mb-2">Add Workout:</div>
            <select
              value={newWorkoutType}
              onChange={(e) => setNewWorkoutType(e.target.value as Run["type"])}
              className="w-full mb-2 text-xs border border-gray-300 rounded px-2 py-1"
            >
              {workoutTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Nickname (optional)"
              value={newWorkoutNickname}
              onChange={(e) => setNewWorkoutNickname(e.target.value)}
              className="w-full mb-2 text-xs border border-gray-300 rounded px-2 py-1"
            />
            <div className="flex gap-1">
              <button
                onClick={handleAddWorkout}
                className="flex-1 text-xs bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600"
              >
                Add
              </button>
              <button
                onClick={() => setShowWorkoutSelector(false)}
                className="flex-1 text-xs bg-gray-500 text-white px-2 py-1 rounded hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </SortableContext>
  );
};

export default function TrainingTable({
  plan,
  onUpdatePlan,
}: TrainingTableProps) {
  const [weeks, setWeeks] = useState<Week[]>(plan.weeks);
  const [activeRun, setActiveRun] = useState<Run | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    setWeeks(plan.weeks);
  }, [plan]);

  const handleUpdateRun = (
    weekIndex: number,
    day: Day,
    runIndex: number,
    newDistance: number
  ) => {
    const updatedWeeks = weeks.map((week, index) => {
      if (index === weekIndex) {
        const updatedWeek = { ...week };
        const runs = [...updatedWeek.days[day]];

        if (runs[runIndex]) {
          // Update the specific run distance
          runs[runIndex] = { ...runs[runIndex], distance: newDistance };
          updatedWeek.days[day] = runs;

          // Recalculate weekly total
          updatedWeek.weeklyTotal = Math.round(
            Object.values(updatedWeek.days).reduce(
              (total, dayRuns) =>
                total +
                dayRuns.reduce(
                  (dayTotal, run) => dayTotal + (run.distance || 0),
                  0
                ),
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

  const handleUpdateNickname = (
    weekIndex: number,
    day: Day,
    runIndex: number,
    nickname: string
  ) => {
    const updatedWeeks = weeks.map((week, index) => {
      if (index === weekIndex) {
        const updatedWeek = { ...week };
        const runs = [...updatedWeek.days[day]];

        if (runs[runIndex]) {
          // Update the specific run nickname
          runs[runIndex] = {
            ...runs[runIndex],
            nickname: nickname || undefined,
          };
          updatedWeek.days[day] = runs;
        }

        return updatedWeek;
      }
      return week;
    });

    setWeeks(updatedWeeks);
    onUpdatePlan({ ...plan, weeks: updatedWeeks });
  };

  const handleAddRun = (
    weekIndex: number,
    day: Day,
    workoutType: Run["type"] = "Easy",
    nickname?: string
  ) => {
    const updatedWeeks = weeks.map((week, index) => {
      if (index === weekIndex) {
        const updatedWeek = { ...week };
        const runs = [...updatedWeek.days[day]];

        // Add a new run with the specified type and nickname
        const defaultDistance = workoutType === "Strength" ? 0 : 5;
        runs.push({
          id: `${weekIndex}-${day}-${workoutType}-${Math.random()
            .toString(36)
            .substr(2, 9)}`,
          type: workoutType,
          distance: defaultDistance,
          nickname: nickname,
        });
        updatedWeek.days[day] = runs;

        // Recalculate weekly total
        updatedWeek.weeklyTotal = Math.round(
          Object.values(updatedWeek.days).reduce(
            (total, dayRuns) =>
              total +
              dayRuns.reduce(
                (dayTotal, run) => dayTotal + (run.distance || 0),
                0
              ),
            0
          )
        );

        return updatedWeek;
      }
      return week;
    });

    setWeeks(updatedWeeks);
    onUpdatePlan({ ...plan, weeks: updatedWeeks });
  };

  const handleRemoveRun = (weekIndex: number, day: Day, runIndex: number) => {
    const updatedWeeks = weeks.map((week, index) => {
      if (index === weekIndex) {
        const updatedWeek = { ...week };
        const runs = [...updatedWeek.days[day]];

        // Remove the specific run
        runs.splice(runIndex, 1);
        updatedWeek.days[day] = runs;

        // Recalculate weekly total
        updatedWeek.weeklyTotal = Math.round(
          Object.values(updatedWeek.days).reduce(
            (total, dayRuns) =>
              total +
              dayRuns.reduce(
                (dayTotal, run) => dayTotal + (run.distance || 0),
                0
              ),
            0
          )
        );

        return updatedWeek;
      }
      return week;
    });

    setWeeks(updatedWeeks);
    onUpdatePlan({ ...plan, weeks: updatedWeeks });
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const activeData = active.data.current;
    if (activeData?.type === "workout") {
      setActiveRun(activeData.run);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveRun(null);

    if (!over) return;

    const activeData = active.data.current;
    const overData = over.data.current;

    if (!activeData || activeData.type !== "workout") return;

    const activeWeekIndex = activeData.weekIndex as number;
    const activeDay = activeData.day as Day;
    const activeRunIndex = activeData.runIndex as number;

    // Handle dropping on another workout (reordering within a day)
    if (overData?.type === "workout") {
      const overWeekIndex = overData.weekIndex as number;
      const overDay = overData.day as Day;
      const overRunIndex = overData.runIndex as number;

      if (
        activeWeekIndex === overWeekIndex &&
        activeDay === overDay &&
        activeRunIndex !== overRunIndex
      ) {
        // Reorder within the same day
        const updatedWeeks = weeks.map((week, weekIndex) => {
          if (weekIndex === activeWeekIndex) {
            const updatedWeek = { ...week };
            const runs = [...updatedWeek.days[activeDay]];
            const [movedRun] = runs.splice(activeRunIndex, 1);
            runs.splice(overRunIndex, 0, movedRun);
            updatedWeek.days[activeDay] = runs;
            return updatedWeek;
          }
          return week;
        });

        setWeeks(updatedWeeks);
        onUpdatePlan({ ...plan, weeks: updatedWeeks });
      } else if (activeWeekIndex !== overWeekIndex || activeDay !== overDay) {
        // Move between days or weeks
        moveWorkout(
          activeWeekIndex,
          activeDay,
          activeRunIndex,
          overWeekIndex,
          overDay,
          overRunIndex
        );
      }
    }
    // Handle dropping on an empty day
    else if (overData?.type === "empty-day") {
      const overWeekIndex = overData.weekIndex as number;
      const overDay = overData.day as Day;

      if (activeWeekIndex !== overWeekIndex || activeDay !== overDay) {
        // Move to empty day (append at the end)
        moveWorkout(
          activeWeekIndex,
          activeDay,
          activeRunIndex,
          overWeekIndex,
          overDay,
          0
        );
      }
    }
    // Handle dropping on a day container (with existing workouts)
    else if (overData?.type === "day") {
      const overWeekIndex = overData.weekIndex as number;
      const overDay = overData.day as Day;

      if (activeWeekIndex !== overWeekIndex || activeDay !== overDay) {
        // Move to the end of the day
        const targetDay = weeks[overWeekIndex]?.days[overDay];
        const targetIndex = targetDay ? targetDay.length : 0;
        moveWorkout(
          activeWeekIndex,
          activeDay,
          activeRunIndex,
          overWeekIndex,
          overDay,
          targetIndex
        );
      }
    }
  };

  const moveWorkout = (
    fromWeekIndex: number,
    fromDay: Day,
    fromRunIndex: number,
    toWeekIndex: number,
    toDay: Day,
    toRunIndex: number
  ) => {
    const updatedWeeks = weeks.map((week, weekIndex) => {
      const updatedWeek = { ...week };

      // Remove from source
      if (weekIndex === fromWeekIndex) {
        const fromRuns = [...updatedWeek.days[fromDay]];
        const [movedRun] = fromRuns.splice(fromRunIndex, 1);
        updatedWeek.days[fromDay] = fromRuns;

        // Recalculate weekly total for source week
        updatedWeek.weeklyTotal = Math.round(
          Object.values(updatedWeek.days).reduce(
            (total, dayRuns) =>
              total +
              dayRuns.reduce(
                (dayTotal, run) => dayTotal + (run.distance || 0),
                0
              ),
            0
          )
        );

        // If moving within the same week, add to destination
        if (fromWeekIndex === toWeekIndex) {
          const toRuns = [...updatedWeek.days[toDay]];
          toRuns.splice(toRunIndex, 0, movedRun);
          updatedWeek.days[toDay] = toRuns;

          // Recalculate weekly total again
          updatedWeek.weeklyTotal = Math.round(
            Object.values(updatedWeek.days).reduce(
              (total, dayRuns) =>
                total +
                dayRuns.reduce(
                  (dayTotal, run) => dayTotal + (run.distance || 0),
                  0
                ),
              0
            )
          );
        }

        return updatedWeek;
      }

      // Add to destination (if different week)
      if (weekIndex === toWeekIndex && fromWeekIndex !== toWeekIndex) {
        const sourceWeek = weeks[fromWeekIndex];
        const movedRun = sourceWeek.days[fromDay][fromRunIndex];
        const toRuns = [...updatedWeek.days[toDay]];
        toRuns.splice(toRunIndex, 0, movedRun);
        updatedWeek.days[toDay] = toRuns;

        // Recalculate weekly total for destination week
        updatedWeek.weeklyTotal = Math.round(
          Object.values(updatedWeek.days).reduce(
            (total, dayRuns) =>
              total +
              dayRuns.reduce(
                (dayTotal, run) => dayTotal + (run.distance || 0),
                0
              ),
            0
          )
        );

        return updatedWeek;
      }

      return updatedWeek;
    });

    setWeeks(updatedWeeks);
    onUpdatePlan({ ...plan, weeks: updatedWeeks });
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
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
                <span className="text-sm font-medium text-gray-800">
                  {type}
                </span>
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
                    <div className="flex flex-col items-center justify-center h-[70px]">
                      <div className="text-lg">Week {week.week}</div>
                      <div className="text-xs text-gray-600 mt-1">
                        {new Date(week.startDate).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </div>
                    </div>
                  </td>
                  {days.map((day) => (
                    <td key={day} className="p-2">
                      <RunCell
                        week={week}
                        day={day}
                        weekIndex={weekIndex}
                        onUpdateRun={handleUpdateRun}
                        onUpdateNickname={handleUpdateNickname}
                        onAddRun={handleAddRun}
                        onRemoveRun={handleRemoveRun}
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

        <DragOverlay>
          {activeRun ? (
            <div
              className={`w-full p-2 rounded text-center ${
                runTypeColors[activeRun.type] || "bg-gray-100"
              } min-h-[60px] flex flex-col justify-center border border-gray-300 opacity-90 shadow-lg`}
            >
              <span className="text-xs font-medium text-gray-700 mb-1">
                {activeRun.type}
                {activeRun.nickname && (
                  <span className="block text-xs text-gray-600">
                    ({activeRun.nickname})
                  </span>
                )}
              </span>
              <span className="text-sm font-bold text-black text-center">
                {activeRun.distance || 0}km
              </span>
            </div>
          ) : null}
        </DragOverlay>
      </div>
    </DndContext>
  );
}
