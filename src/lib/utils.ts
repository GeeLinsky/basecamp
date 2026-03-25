import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export const linkClassName = "underline cursor-pointer text-primary hover:text-primary/80"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
