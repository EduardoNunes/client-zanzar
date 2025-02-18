import { Camera, CameraResultType, CameraSource, CameraPermissionState, ImageOptions } from "@capacitor/camera";
import { Capacitor } from '@capacitor/core';
import { toast } from "react-toastify";

export async function openCamera(): Promise<File | null> {
  try {
    // Check platform
    const platform = Capacitor.getPlatform();
    
    // Check camera plugin availability
    const isCameraAvailable = Capacitor.isPluginAvailable('Camera');
    if (!isCameraAvailable) {
      toast.error('Plugin da câmera não disponível');
      return null;
    }

    // Check and request permissions
    let permissionResult: CameraPermissionState = (await Camera.checkPermissions()).camera;
    if (permissionResult !== 'granted') {
      const requestResult = await Camera.requestPermissions();
      permissionResult = requestResult.camera;

      if (permissionResult !== 'granted') {
        toast.error('Permissão de câmera negada');
        return null;
      }
    }

    // Prepare camera options
    const cameraOptions: ImageOptions = {
      quality: 90,
      allowEditing: false,
      resultType: CameraResultType.Uri,
      source: CameraSource.Camera,
      correctOrientation: true,
      saveToGallery: false
    };

    // Capture photo
    const image = await Camera.getPhoto(cameraOptions);

    if (image.webPath) {
      // Convert to File
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
    console.error("Camera Capture Error:", error);
    
    if (error instanceof Error) {
      if (error.message.includes('User cancelled')) {
        toast.info('Captura cancelada');
      } else if (error.message.includes('not supported')) {
        toast.error('Câmera não suportada nesta plataforma');
      } else {
        toast.error(`Erro ao acessar a câmera: ${error.message}`);
      }
    }
    
    return null;
  }
}
