import { Camera, CameraPermissionState, CameraResultType, CameraSource, ImageOptions } from "@capacitor/camera";
import { Capacitor } from "@capacitor/core";
import { toast } from "react-toastify";

export async function openCamera(): Promise<File | null> {
  console.log("📸 Abertura da câmera para captura de imagem...");

  const platform = Capacitor.getPlatform();
  console.log("🛠️ Plataforma atual:", platform);

  if (platform !== 'ios' && platform !== 'android' && platform !== 'web') {
    toast.error('Plataforma não suportada');
    return null;
  }

  // 📸 Captura de imagem
  try {
    let permissionResult: CameraPermissionState = (await Camera.checkPermissions()).camera;
    console.log("🔍 Permissão inicial da câmera:", permissionResult);

    if (permissionResult !== 'granted') {
      const requestResult = await Camera.requestPermissions();
      console.log("🔑 Permissão solicitada:", requestResult);
      permissionResult = requestResult.camera;

      if (permissionResult !== 'granted') {
        toast.error('Permissão de câmera negada.');
        return null;
      }
    }

    console.log("📷 Tirando foto...");
    const imageOptions: ImageOptions = {
      quality: 90,
      allowEditing: false,
      resultType: CameraResultType.Uri,
      source: CameraSource.Camera,
      correctOrientation: true,
      saveToGallery: false,
    };

    const image = await Camera.getPhoto(imageOptions);
    console.log("✅ Foto capturada:", image);

    if (image.webPath) {
      const response = await fetch(image.webPath).catch(() => {
        toast.error('Erro ao carregar a imagem.');
        return null;
      });

      if (!response) return null;

      const blob = await response.blob();
      const mimeType = image.format === 'png' ? 'image/png' : 'image/jpeg';
      const file = new File([blob], `captured-photo.${image.format}`, { type: mimeType });
      console.log("📸 Foto convertida em arquivo:", file);
      return file;
    }
  } catch (error) {
    console.error("❌ Erro na câmera:", error);
    toast.error('Erro ao acessar a câmera.');
    return null;
  }

  return null;
}
