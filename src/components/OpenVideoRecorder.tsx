import { CaptureVideoOptions, MediaCapture } from "@awesome-cordova-plugins/media-capture";
import { Capacitor } from "@capacitor/core";
import { toast } from "react-toastify";
declare var cordova: any;
declare var window: any;

// Extend window interface to include Cordova-specific methods
interface ExtendedWindow extends Window {
  resolveLocalFileSystemURL?: (
    url: string,
    successCallback: (fileEntry: any) => void,
    errorCallback: (error: any) => void
  ) => void;
}

// Define an extended interface for MediaFile with known properties
interface ExtendedMediaFile {
  fullPath?: string;
  path?: string;
  localURL?: string;
  nativeURL?: string;
  name?: string;
  type?: string;
  lastModified?: number;
  size?: number;
}

// Centralized error handling function
function handleVideoRecorderError(errorMessage: string, error?: any): null {
  console.error(errorMessage, error);
  toast.error(errorMessage);
  return null;
}

export async function openVideoRecorder(): Promise<File | null> {
  try {
    const platform = Capacitor.getPlatform();

    // Validate platform support
    if (!['ios', 'android'].includes(platform)) {
      return handleVideoRecorderError('Plataforma não suportada');
    }

    // Check camera permission
    const permissionStatus = await checkCameraPermission();

    if (!permissionStatus) {
      return handleVideoRecorderError('Permissão de câmera negada');
    }

    return await captureVideoForMobile();
  } catch (error) {
    return handleVideoRecorderError('Erro ao capturar vídeo', error);
  }
}

async function checkCameraPermission(): Promise<boolean> {
  try {
    return await new Promise<boolean>((resolve, reject) => {
      if (!cordova.plugins || !cordova.plugins.permissions) {
        return reject(new Error("Plugin de permissões não encontrado"));
      }

      cordova.plugins.permissions.requestPermission(
        cordova.plugins.permissions.CAMERA,
        (status: { hasPermission: any }) => resolve(status.hasPermission),
        (err: any) => reject(err)
      );
    });
  } catch (error) {
    console.error(" Erro ao verificar permissão de câmera:", error);
    return false;
  }
}

async function captureVideoForMobile(): Promise<File | null> {
  try {
    const options: CaptureVideoOptions = {
      limit: 1,
      duration: 15,
      quality: 1,
    };

    const videoResult = await MediaCapture.captureVideo(options);

    if (!Array.isArray(videoResult) || videoResult.length === 0) {
      return handleVideoRecorderError('Nenhum vídeo capturado');
    }

    const video = videoResult[0] as ExtendedMediaFile;

    const filePath = 
      video.fullPath || 
      video.path || 
      video.localURL || 
      video.nativeURL;

    if (!filePath) {
      return handleVideoRecorderError('Caminho do vídeo não encontrado');
    }

    // Try multiple file creation methods
    const file = await createFileFromPath(filePath) || 
                 await fetchAndCreateFile(filePath);

    if (!file) {
      return handleVideoRecorderError('Não foi possível processar o vídeo');
    }

    displayVideo(file);
    return file;
  } catch (error) {
    return handleVideoRecorderError('Erro ao capturar vídeo na mobile', error);
  }
}

async function createFileFromPath(path: string): Promise<File | null> {
  try {
    const extendedWindow = window as ExtendedWindow;
    
    if (extendedWindow.resolveLocalFileSystemURL) {
      return new Promise((resolve) => {
        extendedWindow.resolveLocalFileSystemURL!(path, 
          (fileEntry: any) => {
            fileEntry.file((file: File) => {
              resolve(file);
            }, (error: any) => {
              console.error(' Erro ao obter arquivo:', error);
              resolve(null);
            });
          }, 
          (error: any) => {
            console.error(' Erro ao resolver URL do arquivo:', error);
            resolve(null);
          }
        );
      });
    }
    
    return null;
  } catch (error) {
    console.error(' Erro ao criar arquivo via Cordova:', error);
    return null;
  }
}

async function fetchAndCreateFile(url: string): Promise<File | null> {
  try {
    const response = await fetch(url);

    if (!response) {
      console.error(' Resposta de fetch vazia');
      return null;
    }

    const blob = await response.blob();
    return new File([blob], 'captured-video.mp4', { type: 'video/mp4' });
  } catch (error) {
    console.error(' Erro ao carregar o vídeo:', error);
    return null;
  }
}

function displayVideo(file: File): void {
  try {
    // Verify file object
    if (!(file instanceof File)) {
      console.error(" Objeto não é um arquivo válido");
      return;
    }

    // Create video element
    const videoElement = document.createElement('video');
    
    // Create object URL
    let objectUrl = '';
    try {
      objectUrl = URL.createObjectURL(file);
      videoElement.src = objectUrl;
    } catch (urlError) {
      console.error(" Erro ao criar URL do objeto:", urlError);
      return;
    }

    // Set video attributes
    videoElement.controls = true;
    videoElement.style.maxWidth = '100%';
    videoElement.style.maxHeight = '500px';

    // Append to body or a specific container
    document.body.appendChild(videoElement);

    // Clean up resources
    videoElement.addEventListener('loadedmetadata', () => {
      videoElement.play();
    });

    videoElement.addEventListener('error', (e) => {
      console.error(" Erro ao carregar vídeo:", e);
    });

  } catch (error) {
    console.error(" Erro fatal ao exibir vídeo:", error);
    toast.error(`Erro ao exibir vídeo: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
  }
}
