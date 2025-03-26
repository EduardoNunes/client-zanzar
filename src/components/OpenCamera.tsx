import {
  Camera,
  CameraResultType,
  CameraSource,
  CameraPermissionState,
  ImageOptions,
} from "@capacitor/camera";
import { Capacitor } from "@capacitor/core";
import { toast } from "react-toastify";

export async function openCamera(): Promise<File | null> {
  console.log("CLICK: Attempting to open camera for photo");

  const platform = Capacitor.getPlatform();
  console.log("Current Platform:", platform);

  if (!Capacitor.isNativePlatform() && platform !== "web") {
    toast.error("Plataforma não suportada");
    return null;
  }

  const isCameraAvailable = Capacitor.isPluginAvailable("Camera");
  console.log("Camera Plugin Available:", isCameraAvailable);

  if (!isCameraAvailable) {
    toast.error("Plugin da câmera não disponível");
    return null;
  }

  try {
    if (platform === "web") {
      console.log("Using web file input");
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "image/jpeg,image/png";
      input.capture = "environment";
      input.click();

      return new Promise((resolve) => {
        input.onchange = (event: Event) => {
          const file = (event.target as HTMLInputElement).files?.[0];
          resolve(file || null);
        };
      });
    }

    let permissionResult: CameraPermissionState = (
      await Camera.checkPermissions()
    ).camera;
    console.log("Initial Camera Permissions:", permissionResult);

    if (permissionResult !== "granted") {
      const requestResult = await Camera.requestPermissions();
      console.log("Permission Request Result:", requestResult);
      permissionResult = requestResult.camera;

      if (permissionResult !== "granted") {
        toast.error("Permissão de câmera negada");
        return null;
      }
    }

    const options: ImageOptions = {
      quality: 90,
      allowEditing: false,
      resultType: CameraResultType.Uri,
      source: CameraSource.Camera,
      correctOrientation: true,
      saveToGallery: false,
    };

    const image = await Camera.getPhoto(options);
    console.log("Foto capturada:", image);

    if (image.webPath) {
      const response = await fetch(image.webPath);
      const blob = await response.blob();

      const mimeType = image.format === "png" ? "image/png" : "image/jpeg";
      const file = new File([blob], `captured-photo.${image.format}`, {
        type: mimeType,
      });

      return file;
    }

    return null;
  } catch (error) {
    console.error("Camera Error:", error);

    if (error instanceof Error) {
      if (error.message.includes("User cancelled")) {
        toast.info("Captura cancelada");
      } else {
        toast.error(`Erro ao acessar a câmera: ${error.message}`);
      }
    }

    return null;
  }
}
