import { CaptureVideoOptions, MediaCapture } from "@awesome-cordova-plugins/media-capture";
import { Capacitor } from "@capacitor/core";
import { toast } from "react-toastify";
declare var cordova: any;

export async function openVideoRecorder(): Promise<File | null> {
  console.log("🎥 Abertura para captura de vídeo...");
  
  const platform = Capacitor.getPlatform();
  console.log("🛠️ Plataforma atual:", platform);
  
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
    console.log("🔒 Solicitação de permissão de câmera...");
    const permissionStatus = await new Promise<any>((resolve, reject) => {
      cordova.plugins.permissions.requestPermission(cordova.plugins.permissions.CAMERA, (status: { hasPermission: any; }) => {
        console.log("📝 Permissão de câmera status:", status);
        resolve(status.hasPermission);
      }, (err: any) => reject(err));
    });

    return permissionStatus;
  } catch (error) {
    console.error('❌ Erro ao verificar permissão de câmera:', error);
    return false;
  }
}

async function captureVideoForMobile(): Promise<File | null> {
  try {
    console.log("🎬 Iniciando captura de vídeo...");
    const options: CaptureVideoOptions = {
      limit: 1, 
      duration: 15, 
      quality: 1,
    };

    const videoResult = await MediaCapture.captureVideo(options);
    console.log("🎥 Resultado da captura de vídeo:", videoResult);
    console.log("VIDEORESULT AQUI", videoResult);
    if (Array.isArray(videoResult) && videoResult.length > 0) {
      const video = videoResult[0];

      if (!video.fullPath) {
        toast.error('Erro: caminho do vídeo inválido.');
        return null;
      }

      const file = await fetchAndCreateFile(video.fullPath);
      if (!file) return null;
      console.log("FILE VIDEO AQUI", file);
      displayVideo(file);

      return file;
    } else {
      toast.error('Nenhum vídeo capturado.');
      return null;
    }
} catch (error) {
    console.error('❌ Erro ao capturar vídeo:', error);
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
    console.log("✅ Vídeo capturado com sucesso:", videoFile);

    stream.getTracks().forEach((track) => track.stop());

    displayVideo(videoFile);

    return videoFile;
  } catch (error) {
    console.error('❌ Erro ao capturar vídeo na web:', error);
    toast.error('Erro ao capturar vídeo.');
    return null;
  }
}

async function fetchAndCreateFile(url: string): Promise<File | null> {
  try {
    const response = await fetch(url);
    if (!response) return null;

    const blob = await response.blob();
    return new File([blob], 'captured-video.mp4', { type: 'video/mp4' });
  } catch (error) {
    console.error('❌ Erro ao carregar o vídeo:', error);
    toast.error('Erro ao carregar o vídeo.');
    return null;
  }
}

function displayVideo(file: File): void {
  const videoElement = document.createElement('video');
  videoElement.src = URL.createObjectURL(file);
  videoElement.controls = true;
  videoElement.style.width = '100%';
  videoElement.style.height = 'auto';

  const mediaContainer = document.getElementById('media-container');
  if (mediaContainer) {
    mediaContainer.appendChild(videoElement);
  }
}
