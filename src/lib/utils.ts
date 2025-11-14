import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function calculateAgeInWeeks(birthday: string): number {
  const birthDate = new Date(birthday);
  const today = new Date();
  const diffInMs = today.getTime() - birthDate.getTime();
  const diffInWeeks = diffInMs / (1000 * 60 * 60 * 24 * 7);
  return Math.floor(diffInWeeks);
}
