import CLASS_DAYS from "@/constants/ClassDays.constant";
import { clsx, type ClassValue } from "clsx";
import dayjs from "dayjs";
import {v4 as uuidv4} from "uuid"
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function slugify(str: string) {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9 -]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export function getDayName(day: number) {
  const dayObj = CLASS_DAYS.find((item) => item.value === day.toString());
  return dayObj?.name;
}

export function getTimeString(time: Date) {
  const result = dayjs(time).format("HH:mm");
  return result;
}

export function isValidUrl(str: string): boolean {
  const urlPattern = new RegExp(
    "^(https?:\\/\\/)?" + // validate protocol
      "((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|" + // validate domain name
      "((\\d{1,3}\\.){3}\\d{1,3}))" + // validate OR ip (v4) address
      "(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*" + // validate port and path
      "(\\?[;&a-z\\d%_.~+=-]*)?" + // validate query string
      "(\\#[-a-z\\d_]*)?$",
    "i"
  ); // validate fragment locator
  return !!urlPattern.test(str);
}

export function getFileExtension(filename: string): string {
  return filename.split(".").pop() || filename;
}

export function getFileName(filename: string): string {
  return filename.split(".")[0];
}


export const parseTime = (time: string) => {
  const [h, m] = time.split(":").map(Number);
  return dayjs().hour(h).minute(m).second(0).millisecond(0).toDate();
};

export const generateUuid = () => {
  const id = uuidv4()
  return id
}