import { Camera, CameraResultType, CameraSource } from "@capacitor/camera";
import { toast } from "react-toastify";

export async function openCamera(): Promise<File | null> {
  try {
    const image = await Camera.getPhoto({
      quality: 90,
      allowEditing: false,
      resultType: CameraResultType.Uri,
      source: CameraSource.Camera,
    });

    if (image.webPath) {
      const response = await fetch(image.webPath);
      const blob = await response.blob();
      const file = new File([blob], `captured-photo.${image.format}`, { type: blob.type });
      return file;
    }
  } catch (error) {
    toast.info("Captura cancelada ou erro na câmera.");
  }
  return null;
}