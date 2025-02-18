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
  
    // Verifica permissão para Android/iOS
    if (platform === 'ios' || platform === 'android') {
      try {
        console.log("🔒 Solicitação de permissão de câmera...");
        const permissionStatus = await new Promise<any>((resolve, reject) => {
          cordova.plugins.permissions.requestPermission(cordova.plugins.permissions.CAMERA, (status: { hasPermission: any; }) => {
            console.log("📝 Permissão de câmera status:", status);
            if (status.hasPermission) {
              resolve(true);
            } else {
              reject('Permissão de câmera negada.');
            }
          }, (err: any) => reject(err));
        });
  
        if (!permissionStatus) {
          toast.error('Permissão de câmera negada.');
          return null;
        }
  
        console.log("🎬 Iniciando captura de vídeo...");
        const options: CaptureVideoOptions = {
          limit: 1, // Apenas um vídeo
          duration: 15, // Duração máxima: 15 segundos
          quality: 1, // Qualidade máxima
        };
  
        const videoResult = await MediaCapture.captureVideo(options);
        console.log("🎥 Resultado da captura de vídeo:", videoResult);
        if (Array.isArray(videoResult) && videoResult.length > 0) {
          const video = videoResult[0];
  
          if (!video.fullPath) {
            toast.error('Erro: caminho do vídeo inválido.');
            return null;
          }
  
          const response = await fetch(video.fullPath).catch(() => {
            toast.error('Erro ao carregar o vídeo.');
            return null;
          });
  
          if (!response) return null;
  
          const blob = await response.blob();
          const file = new File([blob], `captured-video.mp4`, { type: 'video/mp4' });
          console.log("✅ Vídeo capturado com sucesso:", file);
  
          // Adiciona o vídeo ao quadro de mídia
          const videoElement = document.createElement('video');
          videoElement.src = URL.createObjectURL(file); // Utiliza o Blob gerado
          videoElement.controls = true; // Permite controle de play/pause
          videoElement.style.width = '100%'; // Ajusta a largura do vídeo
          videoElement.style.height = 'auto'; // Ajusta a altura proporcionalmente
  
          // Exibe o vídeo no quadro de mídia (supondo que haja um elemento com id 'media-container')
          const mediaContainer = document.getElementById('media-container');
          if (mediaContainer) {
            mediaContainer.appendChild(videoElement);
          }
  
          return file;
        } else {
          toast.error('Nenhum vídeo capturado.');
          return null;
        }
      } catch (error) {
        console.error('❌ Erro ao capturar vídeo:', error);
        toast.error(`Erro ao capturar vídeo: ${error}`);
        return null;
      }
    }
  
    // Captura de vídeo para o ambiente web
    if (platform === 'web') {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
  
        const mediaRecorder = new MediaRecorder(stream);
        const chunks: Blob[] = [];
  
        mediaRecorder.ondataavailable = (event) => {
          chunks.push(event.data);
        };
  
        mediaRecorder.start();
  
        // Exibe o vídeo para visualização do usuário (opcional)
        const videoElement = document.createElement('video');
        videoElement.srcObject = stream;
        videoElement.play();
        document.body.appendChild(videoElement);
  
        // Promessa que para a gravação após 15 segundos
        const stopRecording = new Promise<File | null>((resolve) => {
          setTimeout(() => {
            mediaRecorder.stop();
            resolve(null); // Apenas para indicar que a gravação foi parada
          }, 15000); // Grava por 15 segundos
        });
  
        await stopRecording;
  
        // Criar arquivo de vídeo a partir dos chunks gravados
        const videoBlob = new Blob(chunks, { type: 'video/mp4' });
        const videoFile = new File([videoBlob], 'captured-video.mp4', { type: 'video/mp4' });
        console.log("✅ Vídeo capturado com sucesso:", videoFile);
  
        // Parar o stream
        stream.getTracks().forEach((track) => track.stop());
  
        // Adiciona o vídeo ao quadro de mídia
        const videoDisplayElement = document.createElement('video');
        videoDisplayElement.src = URL.createObjectURL(videoFile); // Usa Blob diretamente
        videoDisplayElement.controls = true; // Permite controle de play/pause
        videoDisplayElement.style.width = '100%'; // Ajusta a largura do vídeo
        videoDisplayElement.style.height = 'auto'; // Ajusta a altura proporcionalmente
  
        // Exibe o vídeo no quadro de mídia (supondo que haja um elemento com id 'media-container')
        const mediaContainer = document.getElementById('media-container');
        if (mediaContainer) {
          mediaContainer.appendChild(videoDisplayElement);
        }
  
        return videoFile;
      } catch (error) {
        console.error('❌ Erro ao capturar vídeo na web:', error);
        toast.error('Erro ao capturar vídeo.');
        return null;
      }
    }
  
    return null;
  }
  
