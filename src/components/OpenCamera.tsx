import { Camera, CameraResultType, CameraSource, CameraPermissionState, ImageOptions } from "@capacitor/camera";
import { Capacitor } from '@capacitor/core';
import { toast } from "react-toastify";

export async function openCamera(captureType: 'tap' | 'hold' = 'tap'): Promise<File | null> {
  console.log(`CLICK: Attempting to open camera with capture type: ${captureType}`);
  
  // Detailed platform and plugin logging
  const platform = Capacitor.getPlatform();
  console.log("Current Platform:", platform);

  // Check if Capacitor is available
  if (!Capacitor.isNativePlatform() && platform !== 'web') {
    toast.error('Plataforma não suportada');
    return null;
  }

  // Check camera plugin availability
  const isCameraAvailable = Capacitor.isPluginAvailable('Camera');
  console.log("Camera Plugin Available:", isCameraAvailable);

  if (!isCameraAvailable) {
    toast.error('Plugin da câmera não disponível');
    return null;
  }

  try {
    // Web platform handling
    if (platform === 'web') {
      console.log("Using web file input");
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = captureType === 'tap' 
        ? 'image/jpeg,image/png' 
        : 'video/mp4';
      input.capture = 'environment';
      input.click();
      
      return new Promise((resolve) => {
        input.onchange = (event: Event) => {
          const file = (event.target as HTMLInputElement).files?.[0];
          resolve(file || null);
        };
      });
    }

    // Mobile platform handling
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

    // Prepare camera options
    const baseOptions: ImageOptions = {
      quality: 90,
      allowEditing: false,
      resultType: CameraResultType.Uri,
      source: CameraSource.Camera,
      correctOrientation: true,
      saveToGallery: false
    };

    // Determine capture type
    if (captureType === 'hold') {
      try {
        // For video, we'll use a generic camera capture
        // Note: This might not work perfectly for video on all platforms
        toast.info('Gravando vídeo (máximo 15 segundos)');
        
        const videoImage = await Camera.getPhoto({
          ...baseOptions,
          source: CameraSource.Camera
        });

        console.log("Vídeo capturado:", videoImage);
        
        if (videoImage.webPath) {
          const response = await fetch(videoImage.webPath);
          const blob = await response.blob();
          
          const file = new File([blob], `captured-video.mp4`, { 
            type: 'video/mp4'
          });

          return file;
        }
      } catch (videoError) {
        toast.error('Erro ao capturar vídeo');
        console.error('Video capture error:', videoError);
        return null;
      }
    }

    // Photo capture (tap)
    const image = await Camera.getPhoto(baseOptions);

    console.log("Mídia capturada:", image);
    
    if (image.webPath) {
      // Convert webPath to File
      const response = await fetch(image.webPath);
      const blob = await response.blob();
      
      // Determine mime type based on format
      const mimeType = image.format === 'png' ? 'image/png' : 
                       image.format === 'gif' ? 'image/gif' : 
                       'image/jpeg';

      const file = new File([blob], `captured-photo.${image.format}`, { 
        type: mimeType
      });

      return file;
    }

    return null;
  } catch (error) {
    console.error("Detailed Camera Error:", error);
    
    if (error instanceof Error) {
      if (error.message.includes('User cancelled')) {
        toast.info('Captura cancelada');
      } else if (error.message.includes('not supported')) {
        toast.error('Câmera não suportada nesta plataforma');
      } else {
        toast.error(`Erro ao acessar a câmera: ${error.message}`);
      }
      console.error('Full error details:', error);
    }
    
    return null;
  }
}
