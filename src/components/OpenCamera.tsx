import { Camera, CameraPermissionState, CameraResultType, CameraSource, ImageOptions } from "@capacitor/camera";
import { Capacitor } from "@capacitor/core";
import { MediaCapture, MediaFile, CaptureVideoOptions, CaptureError } from "@awesome-cordova-plugins/media-capture";
import { toast } from "react-toastify";

export async function openCamera(captureType: 'tap' | 'hold' = 'tap'): Promise<File | null> {
  console.log(`CLICK: Attempting to open camera with capture type: ${captureType}`);

  const platform = Capacitor.getPlatform();
  console.log("Current Platform:", platform);

  if (!Capacitor.isNativePlatform() && platform !== 'web') {
    toast.error('Plataforma não suportada');
    return null;
  }

  // 📹 Captura de vídeo
  if (captureType === 'hold') {
    try {
      // Configuração da captura de vídeo
      const options: CaptureVideoOptions = {
        limit: 1, // Apenas um vídeo
        duration: 15, // Máximo 15 segundos
        quality: 1, // Qualidade máxima
      };

      // Inicia a gravação do vídeo
      const videoResult = await MediaCapture.captureVideo(options);
      
      // Type guard to check if result is MediaFile[]
      const isMediaFileArray = (result: MediaFile[] | CaptureError): result is MediaFile[] => {
        return Array.isArray(result);
      };

      if (isMediaFileArray(videoResult) && videoResult.length > 0) {
        const video = videoResult[0];
        const response = await fetch(video.fullPath);
        const blob = await response.blob();
        const file = new File([blob], `captured-video.mp4`, { type: 'video/mp4' });
        return file;
      } else {
        toast.error('Nenhum vídeo capturado');
        return null;
      }
    } catch (error) {
      toast.error('Erro ao capturar vídeo');
      console.error('Video capture error:', error);
      return null;
    }
  }

  // 📸 Captura de imagem
  try {
    let permissionResult: CameraPermissionState = (await Camera.checkPermissions()).camera;
    console.log("Initial Camera Permissions:", permissionResult);

    if (permissionResult !== 'granted') {
      const requestResult = await Camera.requestPermissions();
      console.log("Permission Request Result:", requestResult);
      permissionResult = requestResult.camera;

      if (permissionResult !== 'granted') {
        toast.error('Permissão de câmera negada');
        return null;
      }
    }

    const imageOptions: ImageOptions = {
      quality: 90,
      allowEditing: false,
      resultType: CameraResultType.Uri,
      source: CameraSource.Camera,
      correctOrientation: true,
      saveToGallery: false,
    };

    const image = await Camera.getPhoto(imageOptions);
    console.log("Foto capturada:", image);

    if (image.webPath) {
      const response = await fetch(image.webPath);
      const blob = await response.blob();
      const mimeType = image.format === 'png' ? 'image/png' : 'image/jpeg';
      const file = new File([blob], `captured-photo.${image.format}`, { type: mimeType });
      return file;
    }
  } catch (error) {
    console.error("Camera Error:", error);
    toast.error('Erro ao acessar a câmera');
    return null;
  }

  return null;
}
