"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, useCallback, useRef, useEffect } from "react";
import { Eye, Pencil, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import PRODI_COLORS, { DEFAULT_PRODI_COLOR } from "@/constants/prodiColors.constant";
import { useIsMobile } from "@/hooks/use-mobile";
import DeleteClassroomDialog from "./DeleteClassroomDialog";
import EditClassroomDialog from "./EditClassroomDialog";
import MobileAgendaView from "./MobileAgendaView";

const ROOMS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16];
const TIME_SLOTS = [
  { label: "08:00-10:00" },
  { label: "10:00-12:00" },
  { label: "13:00-15:00" },
  { label: "15:00-17:00" },
  { label: "17:00-19:00" },
  { label: "19:00-21:00" },
];
const DAYS = [
  { key: 1, name: "Senin" },
  { key: 2, name: "Selasa" },
  { key: 3, name: "Rabu" },
  { key: 4, name: "Kamis" },
  { key: 5, name: "Jumat" },
];
const TOTAL_SLOTS = 6;
const ROW_HEIGHT = 84;

export interface CalendarEvent {
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
    tahunAjaran?: string;
  };
}

interface PropTypes {
  events: CalendarEvent[];
  role: string;
  showHeader?: boolean;
}

function parseHour(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h + m / 60;
}

function getSlotRange(slotIdx: number): { start: number; end: number } {
  if (slotIdx < 2) {
    return { start: 8 + slotIdx * 2, end: 10 + slotIdx * 2 };
  }
  return { start: 13 + (slotIdx - 2) * 2, end: 15 + (slotIdx - 2) * 2 };
}

function doesOverlap(eventStart: string, eventEnd: string, slotIdx: number): boolean {
  const slot = getSlotRange(slotIdx);
  const start = parseHour(eventStart);
  const end = parseHour(eventEnd);
  return start < slot.end && end > slot.start;
}

function EventItem({
  event,
  role,
  onOpenChange,
  onEdit,
  onDelete,
}: {
  event: CalendarEvent;
  role: string;
  onOpenChange?: (open: boolean) => void;
  onEdit?: (event: CalendarEvent) => void;
  onDelete?: (event: CalendarEvent) => void;
}) {
  const router = useRouter();
  const prodiColor =
    PRODI_COLORS[event.extendedProps.prodi] ?? DEFAULT_PRODI_COLOR;

  const isProdi = role === "prodi";

  if (isProdi) {
    return (
      <Popover onOpenChange={onOpenChange}>
        <PopoverTrigger asChild>
          <div
            className={cn(
              "flex h-full w-full cursor-pointer flex-col justify-center gap-1 overflow-hidden px-2 py-1 transition-colors",
              prodiColor.bg,
              prodiColor.hover,
            )}
          >
            <div className={cn("text-xs md:text-base font-semibold leading-tight overflow-hidden text-ellipsis whitespace-nowrap", prodiColor.text)}>
              {event.title}
            </div>
            <div className={cn("text-xs md:text-base leading-tight opacity-80 overflow-hidden text-ellipsis whitespace-nowrap", prodiColor.text)}>
              {event.extendedProps.prodi}
            </div>
            <div className={cn("text-xs md:text-base leading-tight overflow-hidden text-ellipsis whitespace-nowrap", prodiColor.text)}>
              {event.startTime}-{event.endTime}
            </div>
          </div>
        </PopoverTrigger>
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
      className={cn(
        "flex h-full w-full cursor-pointer flex-col justify-center gap-1 overflow-hidden px-2 py-1 transition-colors",
        prodiColor.bg,
        prodiColor.hover,
      )}
      onClick={() => {
        if (event.extendedProps.classroomId) {
          router.push(`/${role}/kelas/${event.extendedProps.classroomId}`);
        }
      }}
    >
      <div className={cn("text-xs md:text-base font-semibold leading-tight overflow-hidden text-ellipsis whitespace-nowrap", prodiColor.text)}>
        {event.title}
      </div>
      <div className={cn("text-xs md:text-base leading-tight opacity-80 overflow-hidden text-ellipsis whitespace-nowrap", prodiColor.text)}>
        {event.extendedProps.prodi}
      </div>
      <div className={cn("text-xs md:text-base leading-tight overflow-hidden text-ellipsis whitespace-nowrap", prodiColor.text)}>
        {event.startTime}-{event.endTime}
      </div>
    </div>
  );
}

function useDragScroll(ref: React.RefObject<HTMLDivElement | null>) {
  const isDragging = useRef(false);
  const startX = useRef(0);
  const startY = useRef(0);
  const scrollLeft = useRef(0);
  const scrollTop = useRef(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const onMouseDown = (e: MouseEvent) => {
      if (e.button !== 0) return;
      isDragging.current = true;
      startX.current = e.pageX - el.offsetLeft;
      startY.current = e.pageY - el.offsetTop;
      scrollLeft.current = el.scrollLeft;
      scrollTop.current = el.scrollTop;
    };

    const onMouseUp = () => {
      if (!isDragging.current) return;
      isDragging.current = false;
      el.style.removeProperty("cursor");
      el.style.removeProperty("user-select");
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging.current) return;
      e.preventDefault();
      el.style.cursor = "grabbing";
      el.style.userSelect = "none";
      const x = e.pageX - el.offsetLeft;
      const y = e.pageY - el.offsetTop;
      el.scrollLeft = scrollLeft.current - (x - startX.current);
      el.scrollTop = scrollTop.current - (y - startY.current);
    };

    el.addEventListener("mousedown", onMouseDown);
    el.addEventListener("mouseup", onMouseUp);
    el.addEventListener("mouseleave", onMouseUp);
    el.addEventListener("mousemove", onMouseMove);

    return () => {
      el.removeEventListener("mousedown", onMouseDown);
      el.removeEventListener("mouseup", onMouseUp);
      el.removeEventListener("mouseleave", onMouseUp);
      el.removeEventListener("mousemove", onMouseMove);
    };
  }, [ref]);
}

export default function WeeklyCalendar({ events: initialEvents, role, showHeader }: PropTypes) {
  const router = useRouter();
  const [events, setEvents] = useState(initialEvents);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    setEvents(initialEvents);
  }, [initialEvents]);

  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  useDragScroll(scrollRef);

  const cellMap = useMemo(() => {
    const map: Record<string, CalendarEvent | null> = {};
    for (let d = 1; d <= 5; d++) {
      for (let s = 0; s < TOTAL_SLOTS; s++) {
        for (let r = 1; r <= 16; r++) {
          map[`${d}-${s}-${r}`] = null;
        }
      }
    }
    for (const ev of events) {
      const day = ev.daysOfWeek[0];
      const room = ev.extendedProps.roomNumber;
      if (day < 1 || day > 5 || room < 1 || room > 16) continue;
      for (let s = 0; s < TOTAL_SLOTS; s++) {
        if (doesOverlap(ev.startTime, ev.endTime, s)) {
          map[`${day}-${s}-${room}`] = ev;
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

  const handleEdit = useCallback((event: CalendarEvent) => {
    setSelectedEvent(event);
    setPopoverOpen(false);
    setEditOpen(true);
  }, []);

  const handleDelete = useCallback((event: CalendarEvent) => {
    setSelectedEvent(event);
    setPopoverOpen(false);
    setDeleteOpen(true);
  }, []);

  const handleEditSuccess = useCallback(() => {
    setEditOpen(false);
    setSelectedEvent(null);
    router.refresh();
  }, [router]);

  const handleDeleteSuccess = useCallback(() => {
    if (selectedEvent) {
      setEvents((prev) =>
        prev.filter((ev) => ev.extendedProps.classroomId !== selectedEvent.extendedProps.classroomId),
      );
    }
    setDeleteOpen(false);
    setSelectedEvent(null);
    router.refresh();
  }, [selectedEvent, router]);


  return (
    <Card className="min-w-0">
      {showHeader && (
        <CardHeader>
          <CardTitle className={cn(isMobile ? "text-sm" : "text-base md:text-xl")}>Jadwal Perkuliahan</CardTitle>
        </CardHeader>
      )}
      {!isMobile && legendProdis.length > 0 && (
        <div className="flex flex-wrap gap-x-4 gap-y-1 px-6 pb-2">
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
          <div className="flex items-center gap-1.5">
            <span className="inline-block size-3 rounded-sm border border-dashed border-muted-foreground/40" />
            <span className="text-xs text-muted-foreground">R. X = Ruangan</span>
          </div>
        </div>
      )}
      {isMobile ? (
        <CardContent className="px-4 py-2">
          <MobileAgendaView
            events={events}
            role={role}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </CardContent>
      ) : (
        <CardContent ref={scrollRef} className="px-0 w-full max-w-full overflow-x-auto overflow-y-auto [&_[data-slot='table-container']]:overflow-x-visible" style={{ maxHeight: showHeader ? "calc(100vh - 130px)" : "calc(100vh - 90px)" }}>
          <Table className="border-collapse" style={{ minWidth: "1800px" }}>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead
                  className="bg-secondary sticky top-0 left-0 z-40 p-0"
                  style={{ width: "60px", minWidth: "60px" }}
                />
                <TableHead
                  className="bg-secondary sticky top-0 left-0 z-35 p-0"
                  style={{
                    width: "100px",
                    minWidth: "100px",
                    left: "60px",
                  }}
                />
                {ROOMS.map((room) => (
                  <TableHead
                    key={`header-room-${room}`}
                    className="bg-secondary sticky top-0 p-2 text-center font-semibold text-xs text-foreground z-10 h-auto"
                    style={{ width: "130px", minWidth: "130px" }}
                  >
                    R. {room}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {DAYS.map((day) => (
                TIME_SLOTS.map((slot, slotIdx) => {
                  const isFirstSlot = slotIdx === 0;
                  return (
                    <TableRow key={`row-${day.key}-${slotIdx}`} className="hover:bg-transparent border-0">
                      {isFirstSlot && (
                        <TableCell
                          className="bg-secondary sticky left-0 z-20 p-2 font-bold text-xs text-foreground/70 border border-border align-middle"
                          rowSpan={TOTAL_SLOTS}
                          style={{ width: "60px", minWidth: "60px", height: `${ROW_HEIGHT * TOTAL_SLOTS}px` }}
                        >
                          <span className="[writing-mode:vertical-rl] rotate-180 flex items-center justify-center h-full">{day.name}</span>
                        </TableCell>
                      )}
                      <TableCell
                        className="bg-background p-2 text-right text-xs text-muted-foreground border border-border align-middle"
                        style={{
                          width: "100px",
                          minWidth: "100px",
                          height: `${ROW_HEIGHT}px`,
                          position: "sticky",
                          left: "60px",
                          zIndex: 15,
                        }}
                      >
                        {slot.label}
                      </TableCell>
                      {ROOMS.map((room) => {
                        const cellKey = `${day.key}-${slotIdx}-${room}`;
                        const ev = cellMap[cellKey];

                        if (ev) {
                          return (
                            <TableCell
                              key={cellKey}
                              className="border border-border p-0 align-middle"
                              style={{ minWidth: "130px", height: `${ROW_HEIGHT}px` }}
                            >
                              <EventItem
                                event={ev}
                                role={role}
                                onOpenChange={setPopoverOpen}
                                onEdit={handleEdit}
                                onDelete={handleDelete}
                              />
                            </TableCell>
                          );
                        }

                        return (
                          <TableCell
                            key={cellKey}
                            className="bg-background border border-border align-middle"
                            style={{ minWidth: "130px", height: `${ROW_HEIGHT}px` }}
                          />
                        );
                      })}
                    </TableRow>
                  );
                })
              ))}
            </TableBody>
          </Table>
        </CardContent>
      )}

      {selectedEvent && (
        <>
          <EditClassroomDialog
            open={editOpen}
            onOpenChange={setEditOpen}
            event={selectedEvent}
            onUpdated={handleEditSuccess}
          />
          <DeleteClassroomDialog
            open={deleteOpen}
            onOpenChange={setDeleteOpen}
            classroomId={selectedEvent.extendedProps.classroomId}
            className={selectedEvent.title}
            onDelete={handleDeleteSuccess}
          />
        </>
      )}
    </Card>
  );
}
