import { addDays, endOfDay, isWithinInterval, startOfDay } from "date-fns";
import { atom } from "jotai";
import { averageTicketsCreated } from "@/data/average-tickets-created";
const defaultStartDate = new Date(2023, 11, 18);
export const dateRangeAtom = atom({
    from: defaultStartDate,
    to: addDays(defaultStartDate, 6),
});
export const ticketChartDataAtom = atom((get) => {
    const dateRange = get(dateRangeAtom);
    if (!(dateRange === null || dateRange === void 0 ? void 0 : dateRange.from) || !(dateRange === null || dateRange === void 0 ? void 0 : dateRange.to))
        return [];
    const startDate = startOfDay(dateRange.from);
    const endDate = endOfDay(dateRange.to);
    return averageTicketsCreated
        .filter((item) => {
        const [year, month, day] = item.date.split("-").map(Number);
        const date = new Date(year, month - 1, day);
        return isWithinInterval(date, { start: startDate, end: endDate });
    })
        .flatMap((item) => {
        const res = [
            {
                date: item.date,
                type: "resolved",
                count: item.resolved,
            },
            {
                date: item.date,
                type: "created",
                count: item.created,
            },
        ];
        return res;
    });
});
