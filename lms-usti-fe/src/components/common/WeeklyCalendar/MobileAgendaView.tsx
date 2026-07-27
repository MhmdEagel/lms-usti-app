"use client";

import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { Eye, Pencil, Trash2 } from "lucide-react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import PRODI_COLORS, { DEFAULT_PRODI_COLOR } from "@/constants/prodiColors.constant";
import type { CalendarEvent } from "./WeeklyCalendar";

const DAYS = [
  { key: 1, name: "Senin" },
  { key: 2, name: "Selasa" },
  { key: 3, name: "Rabu" },
  { key: 4, name: "Kamis" },
  { key: 5, name: "Jumat" },
];

interface PropTypes {
  events: CalendarEvent[];
  role: string;
  onEdit?: (event: CalendarEvent) => void;
  onDelete?: (event: CalendarEvent) => void;
}

function parseHour(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h + m / 60;
}

export default function MobileAgendaView({ events, role, onEdit, onDelete }: PropTypes) {
  const isProdi = role === "prodi";

  const eventsByDay = useMemo(() => {
    const grouped: Record<number, CalendarEvent[]> = {};
    for (const ev of events) {
      const day = ev.daysOfWeek[0];
      if (day < 1 || day > 5) continue;
      if (!grouped[day]) grouped[day] = [];
      grouped[day].push(ev);
    }
    for (const day of Object.keys(grouped)) {
      grouped[Number(day)].sort((a, b) => parseHour(a.startTime) - parseHour(b.startTime));
    }
    return grouped;
  }, [events]);

  return (
    <div className="flex flex-col gap-6 px-1 py-2">
      {DAYS.map((day) => {
        const dayEvents = eventsByDay[day.key] ?? [];
        return (
          <div key={day.key}>
            <h3 className="text-sm font-bold text-foreground mb-2">{day.name}</h3>
            <div className="border-t border-border mb-2" />
            {dayEvents.length === 0 ? (
              <div className="text-sm text-muted-foreground italic">Tidak ada kelas</div>
            ) : (
              <div className="flex flex-col gap-2">
                {dayEvents.map((ev) => {
                  const color = PRODI_COLORS[ev.extendedProps.prodi] ?? DEFAULT_PRODI_COLOR;
                  return (
                    <AgendaItem
                      key={`${ev.extendedProps.classroomId}-${ev.startTime}`}
                      event={ev}
                      role={role}
                      isProdi={isProdi}
                      color={color}
                      onEdit={onEdit}
                      onDelete={onDelete}
                    />
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function AgendaItem({
  event,
  role,
  isProdi,
  color,
  onEdit,
  onDelete,
}: {
  event: CalendarEvent;
  role: string;
  isProdi: boolean;
  color: typeof DEFAULT_PRODI_COLOR;
  onEdit?: (event: CalendarEvent) => void;
  onDelete?: (event: CalendarEvent) => void;
}) {
  const router = useRouter();

  const content = (
    <div
      className={`flex flex-col gap-0.5 rounded-lg border ${color.border} ${color.bg} p-3 cursor-pointer transition-colors ${color.hover}`}
    >
      <div className="text-xs text-muted-foreground font-medium">
        {event.startTime} - {event.endTime}
      </div>
      <div className={`text-sm font-semibold ${color.text}`}>{event.title}</div>
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span>R.{event.extendedProps.roomNumber}</span>
        <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${color.bg} ${color.text}`}>
          {event.extendedProps.prodi}
        </span>
      </div>
    </div>
  );

  if (isProdi) {
    return (
      <Popover>
        <PopoverTrigger asChild>{content}</PopoverTrigger>
        <PopoverContent side="right" align="start" className="w-44 p-1.5">
          <div className="flex flex-col gap-0.5">
            <button
              type="button"
              onClick={() => {
                if (event.extendedProps.classroomId) {
                  router.push(`/${role}/kelas/${event.extendedProps.classroomId}`);
                }
              }}
              className="flex items-center gap-2 px-2 py-1.5 text-sm rounded-sm hover:bg-accent transition-colors"
            >
              <Eye className="size-4" />
              Lihat Kelas
            </button>
            <button
              type="button"
              onClick={() => onEdit?.(event)}
              className="flex items-center gap-2 px-2 py-1.5 text-sm rounded-sm hover:bg-accent transition-colors"
            >
              <Pencil className="size-4" />
              Edit Kelas
            </button>
            <button
              type="button"
              onClick={() => onDelete?.(event)}
              className="flex items-center gap-2 px-2 py-1.5 text-sm rounded-sm hover:bg-accent transition-colors text-red-600"
            >
              <Trash2 className="size-4" />
              Hapus Kelas
            </button>
          </div>
        </PopoverContent>
      </Popover>
    );
  }

  return (
    <div
      onClick={() => {
        if (event.extendedProps.classroomId) {
          router.push(`/${role}/kelas/${event.extendedProps.classroomId}`);
        }
      }}
    >
      {content}
    </div>
  );
}
