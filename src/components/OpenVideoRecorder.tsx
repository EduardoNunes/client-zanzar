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
  try {
    toast.info(" Abertura para captura de vídeo...");
    
    const platform = Capacitor.getPlatform();
    toast.info(` Plataforma atual: ${platform}`);
    
    if (platform !== 'ios' && platform !== 'android' && platform !== 'web') {
      toast.error('Plataforma não suportada');
      return null;
    }

    // Detailed platform and plugin availability check
    toast.info(" Verificando disponibilidade de plugins...");
    toast.info(` Window.cordova: ${!!window.cordova}`);
    toast.info(` MediaCapture: ${!!MediaCapture}`);
    toast.info(` MediaCapture.captureVideo: ${!!MediaCapture.captureVideo}`);

    const permissionStatus = platform === 'ios' || platform === 'android' ? await checkCameraPermission() : true;
    
    if (platform === 'ios' || platform === 'android') {
      if (!permissionStatus) {
        toast.error('Permissão de câmera negada.');
        return null;
      }
    }

    if (platform === 'ios' || platform === 'android') {
      return await captureVideoForMobile();
    }

    if (platform === 'web') {
      return await captureVideoForWeb();
    }

    return null;
  } catch (globalError) {
    console.error(" Erro global na captura de vídeo:", globalError);
    toast.error(`Erro inesperado: ${globalError instanceof Error ? globalError.message : 'Erro desconhecido'}`);
    return null;
  }
}

async function checkCameraPermission(): Promise<boolean> {
  try {
    toast.info(" Solicitação de permissão de câmera...");
    const permissionStatus = await new Promise<any>((resolve, reject) => {
      if (!cordova.plugins || !cordova.plugins.permissions) {
        console.error(" Plugin de permissões não encontrado");
        reject(new Error("Plugin de permissões não encontrado"));
        return;
      }

      cordova.plugins.permissions.requestPermission(
        cordova.plugins.permissions.CAMERA, 
        (status: { hasPermission: any; }) => {
          toast.info(` Permissão de câmera status: ${JSON.stringify(status)}`);
          resolve(status.hasPermission);
        }, 
        (err: any) => {
          console.error(" Erro ao solicitar permissão:", err);
          reject(err);
        }
      );
    });

    return permissionStatus;
  } catch (error) {
    console.error(" Erro ao verificar permissão de câmera:", error);
    toast.error(`Erro de permissão: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    return false;
  }
}

async function captureVideoForMobile(): Promise<File | null> {
  try {
    toast.info(" Iniciando captura de vídeo...");
    const options: CaptureVideoOptions = {
      limit: 1, 
      duration: 15, 
      quality: 1,
    };

    toast.info(" Preparando para chamar MediaCapture.captureVideo...");
    const videoResult = await MediaCapture.captureVideo(options);
    toast.info(` Resultado da captura de vídeo (RAW): ${JSON.stringify(videoResult, null, 2)}`);
    
    if (!Array.isArray(videoResult) || videoResult.length === 0) {
      console.error(" Nenhum vídeo capturado ou resultado inválido");
      toast.error('Nenhum vídeo capturado.');
      return null;
    }

    const video = videoResult[0] as ExtendedMediaFile;
    toast.info(` Vídeo capturado detalhes: ${JSON.stringify(video, null, 2)}`);

    // Detailed logging of video properties
    const videoProperties = Object.keys(video) as (keyof ExtendedMediaFile)[];
    videoProperties.forEach(key => {
      toast.info(`Video property ${key}: ${video[key]}`);
    });

    // Try multiple ways to get the file path
    const filePath = 
      video.fullPath || 
      video.path || 
      video.localURL || 
      video.nativeURL;

    toast.info(` Caminho do arquivo tentado: ${filePath || 'Nenhum caminho encontrado'}`);

    if (!filePath) {
      console.error(" Caminho do vídeo não encontrado");
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
      console.error(" Não foi possível processar o vídeo");
      toast.error('Erro: não foi possível processar o vídeo.');
      return null;
    }

    toast.info(` Arquivo de vídeo criado: Nome: ${file.name}, Tamanho: ${file.size} bytes, Tipo: ${file.type}`);
     
    // Verify file properties
    toast.info(` Detalhes do arquivo:
 - Nome: ${file.name}
 - Tipo: ${file.type}
 - Tamanho: ${file.size} bytes`);

    displayVideo(file);

    return file;
  } catch (error) {
    console.error(" Erro detalhado ao capturar vídeo:", error);
    
    // Log additional error details
    if (error instanceof Error) {
      console.error(" - Nome do erro:", error.name);
      console.error(" - Mensagem do erro:", error.message);
      console.error(" - Stack trace:", error.stack);
    }

    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    toast.error(`Erro ao capturar vídeo: ${errorMessage}`);
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
    toast.info(` Vídeo capturado com sucesso: Nome: ${videoFile.name}, Tamanho: ${videoFile.size} bytes, Tipo: ${videoFile.type}`);

    stream.getTracks().forEach((track) => track.stop());

    displayVideo(videoFile);

    return videoFile;
  } catch (error) {
    console.error(' Erro ao capturar vídeo na web:', error);
    toast.error('Erro ao capturar vídeo.');
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
              toast.info(` Arquivo criado via Cordova: Nome: ${file.name}, Tamanho: ${file.size} bytes, Tipo: ${file.type}`);
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
    toast.info(` Tentando buscar arquivo de: ${url}`);
    const response = await fetch(url);
    
    if (!response) {
      console.error(' Resposta de fetch vazia');
      return null;
    }

    const blob = await response.blob();
    const file = new File([blob], 'captured-video.mp4', { type: 'video/mp4' });
    
    toast.info(" Arquivo criado com sucesso via fetch");
    return file;
  } catch (error) {
    console.error(' Erro ao carregar o vídeo:', error);
    toast.error('Erro ao carregar o vídeo.');
    return null;
  }
}

function displayVideo(file: File): void {
  try {
    toast.info(" Iniciando exibição de vídeo...");
    
    // Verify file object
    if (!(file instanceof File)) {
      console.error(" Objeto não é um arquivo válido");
      toast.error('Erro: objeto de vídeo inválido');
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
      toast.error('Erro ao processar vídeo');
      return;
    }

    // Configure video element
    videoElement.controls = true;
    videoElement.style.width = '100%';
    videoElement.style.height = 'auto';

    // Find or create media container
    let mediaContainer = document.getElementById('media-container');
    if (!mediaContainer) {
      console.warn(' Contêiner de mídia não encontrado, criando novo');
      mediaContainer = document.createElement('div');
      mediaContainer.id = 'media-container';
      mediaContainer.style.maxWidth = '100%';
      mediaContainer.style.margin = '0 auto';
      document.body.appendChild(mediaContainer);
    }

    // Clear previous content and add video
    mediaContainer.innerHTML = '';
    mediaContainer.appendChild(videoElement);

    // Add error and load event listeners for debugging
    videoElement.addEventListener('error', (event) => {
      console.error(" Erro no elemento de vídeo:", event);
      toast.error('Erro ao carregar vídeo');
    });

    videoElement.addEventListener('loadedmetadata', () => {
      toast.info(" Metadados do vídeo carregados");
    });

    toast.info(" Vídeo exibido com sucesso");
  } catch (error) {
    console.error(" Erro fatal ao exibir vídeo:", error);
    toast.error(`Erro ao exibir vídeo: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
  }
}
