import { Capacitor } from '@capacitor/core';
import { Camera, CameraResultType, CameraSource, ImageOptions } from '@capacitor/camera';
import { toast } from 'react-toastify';

export async function openCameraVideo(): Promise<File | null> {
  console.log("CLICK: Attempting to open camera for video");

  const platform = Capacitor.getPlatform();
  console.log("Current Platform:", platform);

  if (!Capacitor.isNativePlatform() && platform !== 'web') {
    toast.error('Plataforma não suportada');
    return null;
  }

  const isCameraAvailable = Capacitor.isPluginAvailable('Camera');
  console.log("Camera Plugin Available:", isCameraAvailable);

  if (!isCameraAvailable) {
    toast.error('Plugin da câmera não disponível');
    return null;
  }

  try {
    // If on web platform, use file input for video
    if (platform === 'web') {
      console.log("Using web file input for video");
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'video/mp4';
      input.capture = 'environment';
      input.click();
      
      return new Promise((resolve) => {
        input.onchange = (event: Event) => {
          const file = (event.target as HTMLInputElement).files?.[0];
          resolve(file || null);
        };
      });
    }

    // Check camera permissions
    let permissionResult = (await Camera.checkPermissions()).camera;
    console.log("Initial Camera Permissions:", permissionResult);

    // Request permissions if not granted
    if (permissionResult !== 'granted') {
      permissionResult = (await Camera.requestPermissions()).camera;
      if (permissionResult !== 'granted') {
        toast.error('Permissão de câmera negada');
        return null;
      }
    }

    // Configure video capture
    const options: ImageOptions = {
      quality: 90,
      allowEditing: false,
      source: CameraSource.Camera,
      resultType: CameraResultType.Uri,
      correctOrientation: true,
      saveToGallery: true
    };

    const video = await Camera.getPhoto(options);
    console.log("Vídeo capturado:", video);
    
    // Fetch the video file
    if (video.webPath) {
      const response = await fetch(video.webPath);
      const blob = await response.blob();
      
      const file = new File([blob], `captured-video.mp4`, { 
        type: 'video/mp4' 
      });

      console.log('Video file created:', file.name, file.type, file.size);

      // Optional: Check file size (60 seconds of video is typically around 10-20 MB)
      if (file.size > 50 * 1024 * 1024) { // 50 MB limit
        toast.error('Vídeo muito longo. Limite de 60 segundos.');
        return null;
      }

      return file;
    }

    toast.error('Erro ao capturar vídeo');
    return null;
  } catch (error) {
    console.error("Camera Error:", error);
    
    if (error instanceof Error) {
      if (error.message.includes('User cancelled')) {
        toast.info('Captura de vídeo cancelada');
      } else {
        toast.error(`Erro na captura: ${error.message}`);
      }
    }
    
    return null;
  }
}