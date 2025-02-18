import { CaptureVideoOptions, MediaCapture } from "@awesome-cordova-plugins/media-capture";
import { Capacitor } from "@capacitor/core";
import { toast } from "react-toastify";

export async function openVideoRecorder(): Promise<File | null> {
  console.log("🎥 Abertura para captura de vídeo...");

  const platform = Capacitor.getPlatform();
  console.log("🛠️ Plataforma atual:", platform);

  if (platform !== 'ios' && platform !== 'android' && platform !== 'web') {
    toast.error('Plataforma não suportada');
    return null;
  }

  // Captura de vídeo para plataformas móveis (iOS/Android)
  if (platform === 'ios' || platform === 'android') {
    try {
      const options: CaptureVideoOptions = {
        limit: 1, // Apenas um vídeo
        duration: 15, // Duração máxima: 15 segundos
        quality: 1, // Qualidade máxima
      };

      const videoResult = await MediaCapture.captureVideo(options);
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
        return file;
      } else {
        toast.error('Nenhum vídeo capturado.');
        return null;
      }
    } catch (error) {
      console.error('❌ Erro ao capturar vídeo:', error);
      toast.error('Erro ao capturar vídeo.');
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

      const videoElement = document.createElement('video');
      videoElement.srcObject = stream;
      videoElement.play();
      document.body.appendChild(videoElement);

      const stopRecording = new Promise<File | null>(() => {
        setTimeout(() => {
          mediaRecorder.stop();
        }, 15000); // Grava por 15 segundos
      });

      await stopRecording;

      const videoBlob = new Blob(chunks, { type: 'video/mp4' });
      const videoFile = new File([videoBlob], 'captured-video.mp4', { type: 'video/mp4' });
      console.log("✅ Vídeo capturado com sucesso:", videoFile);

      stream.getTracks().forEach((track) => track.stop());
      return videoFile;
    } catch (error) {
      console.error('❌ Erro ao capturar vídeo na web:', error);
      toast.error('Erro ao capturar vídeo.');
      return null;
    }
  }

  return null;
}
