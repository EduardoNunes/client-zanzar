import { MediaCapture, MediaFile, CaptureVideoOptions } from "@awesome-cordova-plugins/media-capture";
import { toast } from "react-toastify";
import { Filesystem, ReadFileOptions } from '@capacitor/filesystem';

// Definir tipo personalizado para CaptureError
interface CaptureError {
  code: number;
  message: string;
}

function handleCaptureError(error: CaptureError): null {
  console.error(`Capture Error (Code ${error.code}): ${error.message}`);
  toast.error(`Erro na captura: ${error.message}`);
  return null;
}

// Function to convert MediaFile to File
async function mediaFileToFile(mediaFile: MediaFile): Promise<File | null> {
  try {
    if (!mediaFile.fullPath) {
      console.error('Caminho do arquivo não encontrado');
      return null;
    }

    // Read file contents using Capacitor Filesystem
    const fileResult = await Filesystem.readFile({
      path: mediaFile.fullPath
    } as ReadFileOptions);

    // Ensure fileResult.data is a string
    const base64Data = typeof fileResult.data === 'string' 
      ? fileResult.data 
      : JSON.stringify(fileResult.data);

    // Convert base64 to blob
    const blob = base64ToBlob(base64Data, mediaFile.type || 'video/mp4');
    
    return new File([blob], mediaFile.name || 'captured-video.mp4', { 
      type: mediaFile.type || 'video/mp4' 
    });
  } catch (error) {
    console.error('Erro ao converter MediaFile para File:', error);
    return null;
  }
}

// Helper function to convert base64 to Blob with explicit string type
function base64ToBlob(base64: string, type: string = 'application/octet-stream'): Blob {
  // Remove data URL prefix if present
  const base64Clean = base64.replace(/^data:image\/\w+;base64,/, '')
                             .replace(/^data:video\/\w+;base64,/, '')
                             .replace(/^data:application\/\w+;base64,/, '');

  const byteCharacters = atob(base64Clean);
  const byteNumbers = new Array(byteCharacters.length);
  
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  
  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type: type });
}

export async function openCameraVideo(): Promise<File | null> {
  console.log("CLICK: Attempting to open camera for video");

  try {
    const options: CaptureVideoOptions = {
      limit: 1, // Número de vídeos a capturar
      duration: 60 // Duração máxima em segundos
    };

    const mediaFiles = await MediaCapture.captureVideo(options);

    // Verifica se o retorno é um erro
    if (Array.isArray(mediaFiles)) {
      if (mediaFiles.length > 0) {
        const video = mediaFiles[0];
        console.log("Vídeo capturado:", video);
        
        // Convert MediaFile to File
        const fileResult = await mediaFileToFile(video);
        
        if (!fileResult) {
          toast.error('Erro ao processar vídeo capturado');
          return null;
        }
        
        return fileResult;
      }
      toast.info('Nenhum vídeo capturado');
      return null;
    } else {
      // Se mediaFiles não for um array, isso significa que houve um erro
      const error = mediaFiles as unknown as CaptureError;
      return handleCaptureError(error);
    }
  } catch (error) {
    console.error("Erro ao capturar vídeo:", error);
    
    // Check if error matches CaptureError interface
    if (error && typeof error === 'object' && 'code' in error && 'message' in error) {
      return handleCaptureError(error as CaptureError);
    }
    
    // Generic error handling
    toast.error('Erro desconhecido ao capturar vídeo');
    return null;
  }
}
