"use client"

import * as React from "react"
import dayjs from "dayjs"
import utc from "dayjs/plugin/utc"
import timezone from "dayjs/plugin/timezone"
import { Calendar } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

dayjs.extend(utc)
dayjs.extend(timezone)

interface DatePickerTimeProps {
  value?: string
  onChange?: (value: string) => void
}

export function DatePickerTime({ value, onChange }: DatePickerTimeProps) {
  const [open, setOpen] = React.useState(false)

  const parsedDate = value ? dayjs(value).toDate() : undefined
  const initialDate = parsedDate
  const initialTime = value ? dayjs(parsedDate).format("HH:mm") : "23:59"

  const [date, setDate] = React.useState<Date | undefined>(initialDate)
  const [time, setTime] = React.useState<string>(initialTime)

  React.useEffect(() => {
    if (value) {
      const parsed = dayjs(value).toDate()
      setDate(parsed)
      setTime(dayjs(parsed).format("HH:mm"))
    }
  }, [value])

  React.useEffect(() => {
    if (date && time && onChange) {
      const [hours, minutes] = time.split(":")
      const newDate = new Date(date)
      newDate.setHours(parseInt(hours), parseInt(minutes), 0, 0)
      const indonesiaDate = dayjs(newDate).tz("Asia/Jakarta")
      onChange(indonesiaDate.toISOString())
    }
  }, [date, time, onChange])

  const handleDateSelect = (selectedDate: Date | undefined) => {
    setDate(selectedDate)
    setOpen(false)
  }

  return (
    <FieldGroup className="flex-row items-end gap-2">
      <Field>
        <FieldLabel>Tanggal</FieldLabel>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-40 justify-between font-normal"
            >
              {date ? dayjs(date).format("DD MMM YYYY") : "Pilih tanggal"}
              <Calendar className="w-4 h-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto overflow-hidden p-0" align="start">
            <CalendarComponent
              mode="single"
              selected={date}
              captionLayout="dropdown"
              defaultMonth={date}
              onSelect={handleDateSelect}
              disabled={{ before: new Date() }}
            />
          </PopoverContent>
        </Popover>
      </Field>
      <Field className="w-28">
        <FieldLabel>Jam</FieldLabel>
        <input
          type="time"
          step="60"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none [&::-webkit-calendar-picker-indicator]:hidden"
        />
      </Field>
    </FieldGroup>
  )
}