import dayjs from "dayjs";
import weekOfYear from "dayjs/plugin/weekOfYear";
import isoWeek from "dayjs/plugin/isoWeek";
import { FormValues } from "@/components/InputForm";

dayjs.extend(weekOfYear);
dayjs.extend(isoWeek);

export interface Run {
  type: "Rest" | "Easy" | "Long" | "Interval" | "Tempo" | "Race" | "Strength";
  distance?: number; // in km
  time?: number; // in minutes
  notes?: string;
}

export type Day = "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun";

export interface Week {
  week: number;
  startDate: string;
  days: Record<Day, Run | null>;
  weeklyTotal: number;
}

export interface TrainingPlan {
  weeks: Week[];
}

const getRunDistance = (
  runType: Run["type"],
  weekNumber: number,
  totalWeeks: number,
  maxDistance: number
) => {
  // For very short plans (less than 3 weeks), use simplified approach
  if (totalWeeks < 3) {
    switch (runType) {
      case "Long":
        return Math.round(maxDistance * 0.6);
      case "Easy":
        return Math.round(maxDistance * 0.3);
      case "Tempo":
        return Math.round(maxDistance * 0.4);
      case "Interval":
        return Math.round(maxDistance * 0.2);
      case "Strength":
        return 0;
      default:
        return 0;
    }
  }

  // Taper for the last two weeks before the race
  if (weekNumber > totalWeeks - 2) {
    switch (runType) {
      case "Long":
        return Math.round(maxDistance * 0.35);
      case "Easy":
        return Math.round(maxDistance * 0.15);
      case "Tempo":
        return Math.round(maxDistance * 0.2);
      case "Interval":
        return Math.round(maxDistance * 0.1);
      default:
        return 0;
    }
  }

  const progress = weekNumber / (totalWeeks - 2); // Calculate progress against non-taper weeks

  switch (runType) {
    case "Long":
      // Build up from 20% to 90% of max distance for the peak long run
      return Math.round(maxDistance * (0.2 + 0.7 * progress));
    case "Easy":
      return Math.round(maxDistance * 0.25); // Static distance
    case "Tempo":
      return Math.round(maxDistance * 0.4); // Static distance
    case "Interval":
      return Math.round(maxDistance * 0.2); // Static distance
    case "Strength":
      return 0; // No distance for strength
    default:
      return 0;
  }
};

export const generatePlan = (inputs: FormValues): TrainingPlan => {
  const {
    raceDate,
    todayDate,
    raceDistance,
    customRaceDistance,
    trainingDays,
  } = inputs;

  const start = dayjs(todayDate);
  const end = dayjs(raceDate);
  const totalWeeks = end.diff(start, "week");

  // Handle edge cases
  if (totalWeeks <= 0) {
    return { weeks: [] };
  }

  if (totalWeeks > 52) {
    // Limit to 52 weeks maximum
    console.warn("Training plan limited to 52 weeks maximum");
  }

  if (trainingDays.length === 0) {
    return { weeks: [] };
  }

  let maxRaceDistance = 0;
  switch (raceDistance) {
    case "5k":
      maxRaceDistance = 5;
      break;
    case "10k":
      maxRaceDistance = 10;
      break;
    case "half":
      maxRaceDistance = 21.1;
      break;
    case "full":
      maxRaceDistance = 42.2;
      break;
    case "custom":
      maxRaceDistance = customRaceDistance || 10;
      break;
    default:
      maxRaceDistance = 10; // Fallback
  }

  const weeks: Week[] = [];
  const limitedWeeks = Math.min(totalWeeks, 52); // Limit to 52 weeks

  for (let i = 0; i < limitedWeeks; i++) {
    const weekStartDate = start.add(i, "week").startOf("isoWeek");
    const weekNumber = i + 1;

    const days: Record<Day, Run | null> = {
      Mon: null,
      Tue: null,
      Wed: null,
      Thu: null,
      Fri: null,
      Sat: null,
      Sun: null,
    };

    let weeklyTotal = 0;

    trainingDays.forEach(({ day, runType }) => {
      const dayName = day as Day;
      const distance = getRunDistance(
        runType as Run["type"],
        weekNumber,
        limitedWeeks,
        maxRaceDistance
      );
      // Always create a run object if it's a designated training day
      days[dayName] = {
        type: runType as Run["type"],
        distance: Math.max(0, distance),
      };
      weeklyTotal += Math.max(0, distance);
    });

    weeks.push({
      week: weekNumber,
      startDate: weekStartDate.format("YYYY-MM-DD"),
      days,
      weeklyTotal: Math.round(weeklyTotal),
    });
  }

  // Set race day in the last week, ensuring it doesn't get overwritten
  if (weeks.length > 0) {
    const lastWeek = weeks[weeks.length - 1];
    const raceDay = dayjs(raceDate).format("ddd") as Day;

    // Subtract old run distance if race day replaces a scheduled run
    if (lastWeek.days[raceDay]) {
      lastWeek.weeklyTotal -= lastWeek.days[raceDay]?.distance || 0;
    }

    lastWeek.days[raceDay] = { type: "Race", distance: maxRaceDistance };
    lastWeek.weeklyTotal += maxRaceDistance;
    lastWeek.weeklyTotal = Math.round(lastWeek.weeklyTotal);
  }

  return { weeks };
};
