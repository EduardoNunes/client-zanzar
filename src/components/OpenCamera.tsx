import { Camera, CameraResultType, CameraSource, CameraPermissionState } from "@capacitor/camera";
import { Capacitor } from '@capacitor/core';
import { toast } from "react-toastify";

export async function openCamera(): Promise<File | null> {
  console.log("CLICK: Attempting to open camera");
  
  // Check platform support
  const isAvailable = Capacitor.isPluginAvailable('Camera');
  console.log("Camera Plugin Available:", isAvailable);
  
  if (!isAvailable) {
    toast.error('Câmera não suportada nesta plataforma');
    return null;
  }

  try {
    // Check platform
    const platform = Capacitor.getPlatform();
    console.log("Current Platform:", platform);

    // Request and check permissions
    let permissionResult: CameraPermissionState;
    
    if (platform === 'web') {
      // For web, we'll use the browser's native file input
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.click();
      
      return new Promise((resolve) => {
        input.onchange = (event: Event) => {
          const file = (event.target as HTMLInputElement).files?.[0];
          resolve(file || null);
        };
      });
    }

    // For mobile platforms
    permissionResult = (await Camera.checkPermissions()).camera;
    console.log("Initial Camera Permissions:", permissionResult);

    if (permissionResult !== 'granted') {
      const requestResult = await Camera.requestPermissions();
      console.log("Permission Request Result:", requestResult);

      if (requestResult.camera !== 'granted') {
        toast.error('Permissão de câmera negada');
        return null;
      }
    }

    const image = await Camera.getPhoto({
      quality: 90,
      allowEditing: false,
      resultType: CameraResultType.Uri,
      source: CameraSource.Prompt,
      presentationStyle: 'fullscreen'
    });

    console.log("Imagem capturada:", image);
    
    if (image.webPath) {
      // Convert webPath to File
      const response = await fetch(image.webPath);
      const blob = await response.blob();
      const file = new File([blob], `captured-image.${image.format}`, { 
        type: `image/${image.format}` 
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
    }
    
    return null;
  }
}
