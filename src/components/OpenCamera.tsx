import { Camera, CameraResultType, CameraSource } from "@capacitor/camera";
import { toast } from "react-toastify";

export async function openCamera(): Promise<File | null> {
  console.log("CLICK");
  try {
    const image = await Camera.getPhoto({
      quality: 90,
      allowEditing: false,
      resultType: CameraResultType.Uri,
      source: CameraSource.Prompt, // Mostra opção de escolher entre Câmera e Galeria no PWA
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
    if (error instanceof Error) {
      if (error.message.includes('User cancelled')) {
        toast.info('Captura cancelada');
      } else {
        toast.error('Erro ao acessar a câmera');
      }
    }
    console.error("Erro ao acessar a câmera:", error);
    return null;
  }
}
