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

export async function openVideoRecorder(): Promise<File | null> {
  console.log(" Abertura para captura de vídeo...");
  
  const platform = Capacitor.getPlatform();
  console.log(" Plataforma atual:", platform);
  
  if (platform !== 'ios' && platform !== 'android' && platform !== 'web') {
    toast.error('Plataforma não suportada');
    return null;
  }

  const permissionStatus = platform === 'ios' || platform === 'android' ? await checkCameraPermission() : true;
  
  if (platform === 'ios' || platform === 'android') {
    if (!permissionStatus) {
      toast.error('Permissão de câmera negada.');
      return null;
    }
  }

  if (platform === 'ios' || platform === 'android') {
    return captureVideoForMobile();
  }

  if (platform === 'web') {
    return captureVideoForWeb();
  }

  return null;
}

async function checkCameraPermission(): Promise<boolean> {
  try {
    console.log(" Solicitação de permissão de câmera...");
    const permissionStatus = await new Promise<any>((resolve, reject) => {
      cordova.plugins.permissions.requestPermission(cordova.plugins.permissions.CAMERA, (status: { hasPermission: any; }) => {
        console.log(" Permissão de câmera status:", status);
        resolve(status.hasPermission);
      }, (err: any) => reject(err));
    });

    return permissionStatus;
  } catch (error) {
    console.error(' Erro ao verificar permissão de câmera:', error);
    return false;
  }
}

async function captureVideoForMobile(): Promise<File | null> {
  try {
    console.log(" Iniciando captura de vídeo...");
    const options: CaptureVideoOptions = {
      limit: 1, 
      duration: 15, 
      quality: 1,
    };

    const videoResult = await MediaCapture.captureVideo(options);
    console.log(" Resultado da captura de vídeo (RAW):", JSON.stringify(videoResult, null, 2));
    
    if (Array.isArray(videoResult) && videoResult.length > 0) {
      const video = videoResult[0] as ExtendedMediaFile;
      console.log(" Vídeo capturado detalhes:", JSON.stringify(video, null, 2));

      // Log all properties of the video object using type-safe method
      const videoProperties = Object.keys(video) as (keyof ExtendedMediaFile)[];
      videoProperties.forEach(key => {
        console.log(`Video property ${key}:`, video[key]);
      });

      // Try multiple ways to get the file path
      const filePath = 
        video.fullPath || 
        video.path || 
        video.localURL || 
        video.nativeURL;

      console.log(" Caminho do arquivo tentado:", filePath);

      if (!filePath) {
        toast.error('Erro: caminho do vídeo não encontrado.');
        return null;
      }

      // Try to create file using different methods
      let file: File | null = null;
      
      try {
        // Method 1: Direct file creation
        file = await createFileFromPath(filePath);
      } catch (directError) {
        console.error(' Erro ao criar arquivo direto:', directError);
        
        try {
          // Method 2: Fetch and create file
          file = await fetchAndCreateFile(filePath);
        } catch (fetchError) {
          console.error(' Erro ao buscar arquivo:', fetchError);
        }
      }

      if (!file) {
        toast.error('Erro: não foi possível processar o vídeo.');
        return null;
      }

      console.log(" Arquivo de vídeo criado:", file);
      displayVideo(file);

      return file;
    } else {
      toast.error('Nenhum vídeo capturado.');
      return null;
    }
  } catch (error) {
    console.error(' Erro ao capturar vídeo:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    toast.error(`Erro ao capturar vídeo: ${errorMessage}`);
    return null;
  }
}

// New function to create file directly from path
async function createFileFromPath(path: string): Promise<File | null> {
  try {
    // Use Cordova File plugin if available
    const extendedWindow = window as ExtendedWindow;
    
    if (extendedWindow.resolveLocalFileSystemURL) {
      return new Promise((resolve, reject) => {
        extendedWindow.resolveLocalFileSystemURL!(path, 
          (fileEntry: any) => {
            // Use fileEntry to get file
            fileEntry.file((file: File) => {
              console.log(" Arquivo criado via Cordova:", file);
              resolve(file);
            }, (error: any) => {
              console.error(' Erro ao obter arquivo:', error);
              reject(null);
            });
          }, 
          (error: any) => {
            console.error(' Erro ao resolver URL do arquivo:', error);
            reject(null);
          }
        );
      });
    }
    
    throw new Error('Cordova file system not available');
  } catch (error) {
    console.error(' Erro ao criar arquivo via Cordova:', error);
    return null;
  }
}

// Existing fetchAndCreateFile function remains the same
async function fetchAndCreateFile(url: string): Promise<File | null> {
  try {
    console.log(" Tentando buscar arquivo de:", url);
    const response = await fetch(url);
    
    if (!response) {
      console.error(' Resposta de fetch vazia');
      return null;
    }

    const blob = await response.blob();
    const file = new File([blob], 'captured-video.mp4', { type: 'video/mp4' });
    
    console.log(" Arquivo criado com sucesso via fetch");
    return file;
  } catch (error) {
    console.error(' Erro ao carregar o vídeo:', error);
    toast.error('Erro ao carregar o vídeo.');
    return null;
  }
}

async function captureVideoForWeb(): Promise<File | null> {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    const mediaRecorder = new MediaRecorder(stream);
    const chunks: Blob[] = [];

    mediaRecorder.ondataavailable = (event) => {
      chunks.push(event.data);
    };

    mediaRecorder.start();

    const videoElement = document.createElement('video');
    videoElement.srcObject = stream;
    videoElement.play();
    document.body.appendChild(videoElement);

    const stopRecording = new Promise<File | null>((resolve) => {
      setTimeout(() => {
        mediaRecorder.stop();
        resolve(null);
      }, 15000); 
    });

    await stopRecording;

    const videoBlob = new Blob(chunks, { type: 'video/mp4' });
    const videoFile = new File([videoBlob], 'captured-video.mp4', { type: 'video/mp4' });
    console.log(" Vídeo capturado com sucesso:", videoFile);

    stream.getTracks().forEach((track) => track.stop());

    displayVideo(videoFile);

    return videoFile;
  } catch (error) {
    console.error(' Erro ao capturar vídeo na web:', error);
    toast.error('Erro ao capturar vídeo.');
    return null;
  }
}

function displayVideo(file: File): void {
  try {
    const videoElement = document.createElement('video');
    videoElement.src = URL.createObjectURL(file);
    videoElement.controls = true;
    videoElement.style.width = '100%';
    videoElement.style.height = 'auto';

    const mediaContainer = document.getElementById('media-container');
    if (mediaContainer) {
      // Clear previous content
      mediaContainer.innerHTML = '';
      mediaContainer.appendChild(videoElement);
    } else {
      console.warn('Contêiner de mídia não encontrado');
    }
  } catch (error) {
    console.error(' Erro ao exibir vídeo:', error);
    toast.error('Erro ao exibir vídeo.');
  }
}
