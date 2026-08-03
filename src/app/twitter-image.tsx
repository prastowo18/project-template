import { createApplicationSocialImage, SOCIAL_IMAGE_SIZE } from "@/config";

export const alt = "Next.js Standard Template";

export const size = SOCIAL_IMAGE_SIZE;

export const contentType = "image/png";

export default function TwitterImage() {
  return createApplicationSocialImage();
}
