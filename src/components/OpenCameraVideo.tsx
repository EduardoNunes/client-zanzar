import { MediaCapture, CaptureVideoOptions, MediaFile } from '@awesome-cordova-plugins/media-capture';
import { Capacitor } from '@capacitor/core';
import { toast } from "react-toastify";

// Definir tipo personalizado para CaptureError
interface CaptureError {
  code: number;
  message: string;
}

export async function openCameraVideo(): Promise<File | null> {
  console.log("CLICK: Attempting to open camera for video");

  const platform = Capacitor.getPlatform();
  console.log("Current Platform:", platform);

  if (!Capacitor.isNativePlatform() && platform !== 'web') {
    toast.error('Plataforma não suportada');
    return null;
  }

  const isMediaCaptureAvailable = Capacitor.isPluginAvailable('MediaCapture');
  console.log("MediaCapture Plugin Available:", isMediaCaptureAvailable);

  if (!isMediaCaptureAvailable) {
    toast.error('Plugin de gravação não disponível');
    return null;
  }

  try {
    if (platform === 'web') {
      console.log("Using web file input for video");
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'video/mp4,video/webm,video/ogg';
      input.capture = 'environment';
      input.click();

      return new Promise((resolve) => {
        input.onchange = (event: Event) => {
          const file = (event.target as HTMLInputElement).files?.[0];
          resolve(file || null);
        };
      });
    }

    const options: CaptureVideoOptions = {
      limit: 1, // Apenas um vídeo
      duration: 30, // Tempo máximo (em segundos)
      quality: 1, // Qualidade máxima (0 = baixa, 1 = alta)
    };

    // Captura o vídeo
    const result = await MediaCapture.captureVideo(options);
    console.log("Vídeo capturado:", result);

    // Verifica se o resultado é um erro e trata corretamente
    if ((result as unknown as CaptureError).code) {
      const captureError = result as unknown as CaptureError;
      
      // Trate o erro corretamente
      if (captureError.code === 3) {
        toast.info('Gravação cancelada');
      } else if (captureError.message) {
        toast.error(`Erro ao gravar vídeo: ${captureError.message}`);
      } else {
        toast.error('Erro desconhecido ao tentar capturar vídeo.');
      }
      return null;
    }

    // Verifica se result é um array de MediaFile
    if (Array.isArray(result)) {
      if (result.length > 0) {
        const videoPath = result[0].fullPath;
        const response = await fetch(videoPath);
        const blob = await response.blob();

        const file = new File([blob], `captured-video.mp4`, { type: "video/mp4" });
        return file;
      }
    }

    return null;
  } catch (error: unknown) {
    console.error("Video Capture Error:", error);

    if (typeof error === 'object' && error !== null && 'code' in error) {
      const captureError = error as CaptureError;
      
      // Trate o erro corretamente
      if (captureError.code && captureError.message) {
        if (captureError.code === 3) {
          toast.info('Gravação cancelada');
        } else {
          toast.error(`Erro ao gravar vídeo: ${captureError.message}`);
        }
      } else {
        toast.error('Erro desconhecido ao tentar capturar vídeo.');
      }
    } else {
      toast.error('Ocorreu um erro inesperado.');
    }

    return null;
  }
};
