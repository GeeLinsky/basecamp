import { toast } from "sonner"

export function validateImageFile(file: File): boolean {
  if (!file.type.startsWith("image/")) {
    toast.error("Please upload an image file")
    return false
  }

  if (file.size > 2 * 1024 * 1024) {
    toast.error("Image must be less than 2MB")
    return false
  }

  return true
}
