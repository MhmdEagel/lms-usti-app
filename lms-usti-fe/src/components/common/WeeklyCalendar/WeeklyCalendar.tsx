"use client";

import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import PRODI_COLORS, { DEFAULT_PRODI_COLOR } from "@/constants/prodiColors.constant";

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
  const ROW_HEIGHT = 36;

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

  const legendProdis = useMemo(() => {
    const set = new Set<string>();
    for (const ev of events) {
      if (ev.extendedProps.prodi) set.add(ev.extendedProps.prodi);
    }
    return Array.from(set).sort();
  }, [events]);

  return (
    <Card className="mx-auto w-full px-4">
      <CardHeader>
        <CardTitle className="text-base md:text-xl">Jadwal Perkuliahan</CardTitle>
        {legendProdis.length > 1 && (
          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
            {legendProdis.map((prodi) => {
              const color = PRODI_COLORS[prodi] ?? DEFAULT_PRODI_COLOR;
              return (
                <div key={prodi} className="flex items-center gap-1.5">
                  <span
                    className={cn(
                      "inline-block size-3 rounded-sm border",
                      color.bg,
                      color.border,
                    )}
                  />
                  <span className="text-xs text-muted-foreground">{prodi}</span>
                </div>
              );
            })}
          </div>
        )}
      </CardHeader>
      <CardContent className="p-2 md:p-6 overflow-x-scroll overflow-y-scroll max-w-4xl max-h-[600px] mx-auto">
          <div
            className="grid"
            style={{
              minWidth: "640px",
              gridTemplateColumns: "50px repeat(5, 1fr)",
              gridTemplateRows: `auto repeat(${ROWS}, ${ROW_HEIGHT}px)`,
            }}
          >
            <div className="bg-secondary" style={{ gridColumn: 1, gridRow: 1 }} />
            {DAYS.map((day) => (
              <div
                key={day}
                className="bg-secondary p-2 md:p-3 text-center font-semibold text-xs md:text-base text-foreground capitalize border-l border-border truncate"
                style={{ gridColumn: DAYS.indexOf(day) + 2, gridRow: 1 }}
              >
                {day}
              </div>
            ))}

            {HOURS.map((hour, i) => (
              <div
                key={hour}
                className="text-xs md:text-sm text-muted-foreground text-right pr-1 md:pr-3 border-b border-border/30"
                style={{
                  gridColumn: 1,
                  gridRow: `${i * 2 + 2} / ${i * 2 + 4}`,
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "flex-end",
                  paddingTop: "1px",
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
                    const prodiColor =
                      PRODI_COLORS[ev.extendedProps.prodi] ?? DEFAULT_PRODI_COLOR;
                    return (
                      <div
                        key={`${ev.extendedProps.classroomId}-${idx}`}
                        className={cn(
                          "group relative rounded-md border-l-[3px] cursor-pointer flex flex-col px-2 py-1 md:px-3 md:py-2 transition-colors max-w-[180px]",
                          prodiColor.bg,
                          prodiColor.borderLeft,
                          prodiColor.border,
                          prodiColor.hover,
                        )}
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
                        <div className={cn("font-semibold text-xs md:text-sm leading-tight truncate", prodiColor.text)}>
                          {ev.title}
                        </div>
                        {ev.extendedProps.roomNumber ? (
                          <div className={cn("text-[10px] md:text-xs leading-tight truncate", prodiColor.text)}>
                            R. {ev.extendedProps.roomNumber}
                          </div>
                        ) : null}
                        <div className={cn("text-[10px] md:text-xs leading-tight mt-auto truncate hidden md:block", prodiColor.text)}>
                          {ev.startTime} - {ev.endTime}
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
      </CardContent>
    </Card>
  );
}
