"use client";

import { useRouter } from "next/navigation";
import { useMemo } from "react";

const DAYS = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat"];
const HOURS = Array.from({ length: 14 }, (_, i) => `${String(i + 8).padStart(2, "0")}:00`);
const ROWS = 28;

interface CalendarEvent {
  title: string;
  daysOfWeek: number[];
  startTime: string;
  endTime: string;
  extendedProps: {
    classroomId: string;
    roomNumber: number;
    className: string;
    term: number;
    prodi: string;
  };
}

interface PropTypes {
  events: CalendarEvent[];
  role: string;
}

function parseHour(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h + m / 60;
}

function toGridRow(time: string): number {
  return Math.round((parseHour(time) - 8) * 2) + 1;
}

export default function WeeklyCalendar({ events, role }: PropTypes) {
  const router = useRouter();
  const ROW_HEIGHT = 48;

  const eventsByDay = useMemo(() => {
    const map: Record<number, CalendarEvent[]> = { 1: [], 2: [], 3: [], 4: [], 5: [] };
    for (const ev of events) {
      for (const day of ev.daysOfWeek) {
        if (day >= 1 && day <= 5) {
          map[day].push(ev);
        }
      }
    }
    return map;
  }, [events]);

  return (
    <div className="border border-border rounded-xl bg-card">
      <div className="overflow-y-auto" style={{ maxHeight: "70vh" }}>
        <div
          className="grid"
          style={{
            gridTemplateColumns: "60px repeat(5, 1fr)",
            gridTemplateRows: `auto repeat(${ROWS}, ${ROW_HEIGHT}px)`,
          }}
        >
          <div className="bg-secondary" style={{ gridColumn: 1, gridRow: 1 }} />
          {DAYS.map((day) => (
            <div
              key={day}
              className="bg-secondary p-3 text-center font-semibold text-base text-foreground capitalize border-l border-border"
              style={{ gridColumn: DAYS.indexOf(day) + 2, gridRow: 1 }}
            >
              {day}
            </div>
          ))}

          {HOURS.map((hour, i) => (
            <div
              key={hour}
              className="text-base text-muted-foreground text-right pr-3 border-b border-border/30"
              style={{
                gridColumn: 1,
                gridRow: `${i * 2 + 2} / ${i * 2 + 4}`,
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "flex-end",
                paddingTop: "2px",
              }}
            >
              {hour}
            </div>
          ))}

          {[1, 2, 3, 4, 5].map((day) => {
            const col = day + 1;
            return (
              <div
                key={day}
                className="relative border-l border-border/50"
                style={{
                  gridColumn: col,
                  gridRow: `2 / ${ROWS + 2}`,
                  display: "grid",
                  gridTemplateRows: `repeat(${ROWS}, ${ROW_HEIGHT}px)`,
                }}
              >
                {Array.from({ length: ROWS - 1 }, (_, i) => (
                  <div
                    key={i}
                    className="border-t border-border/30"
                    style={{ gridRow: i + 1, gridColumn: 1 }}
                  />
                ))}

                {eventsByDay[day].map((ev, idx) => {
                  const rowStart = toGridRow(ev.startTime);
                  const rowEnd = toGridRow(ev.endTime);
                  return (
                    <div
                      key={`${ev.extendedProps.classroomId}-${idx}`}
                      className="group relative rounded-lg border border-primary/20 border-l-[3px] border-l-primary bg-primary/10 cursor-pointer flex flex-col px-3 py-2 hover:bg-primary/20 transition-colors"
                      style={{
                        gridRow: `${rowStart} / ${rowEnd}`,
                        zIndex: 10,
                        minHeight: 0,
                      }}
                      onClick={() => {
                        if (ev.extendedProps.classroomId) {
                          router.push(`/${role}/kelas/${ev.extendedProps.classroomId}`);
                        }
                      }}
                    >
                      <div className="font-semibold text-base text-foreground leading-tight truncate">
                        {ev.title}
                      </div>
                      <div className="text-xs text-muted-foreground/70 leading-tight mt-auto truncate">
                        {ev.startTime} - {ev.endTime}
                      </div>


                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
