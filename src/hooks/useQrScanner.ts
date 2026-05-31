import { useState, useEffect, useRef, useCallback } from 'react';
import { BrowserQRCodeReader, IScannerControls } from '@zxing/browser';
import { Result } from '@zxing/library';
import { toast } from 'sonner';

export function useQrScanner(onResult: (result: string) => void) {
  const [isScanning, setIsScanning] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const controlsRef = useRef<IScannerControls | null>(null);

  // Initialize devices
  useEffect(() => {
    async function initDevices() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        stream.getTracks().forEach((track) => track.stop()); // request permission but close immediately
        
        setHasCameraPermission(true);
        const allDevices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = allDevices.filter((device) => device.kind === 'videoinput');
        
        setDevices(videoDevices);
        if (videoDevices.length > 0) {
          // Prefer environment/back camera if available
          const backCamera = videoDevices.find((d) => d.label.toLowerCase().includes('back'));
          setSelectedDeviceId(backCamera ? backCamera.deviceId : videoDevices[0].deviceId);
        }
      } catch (err) {
        console.error('Camera permission denied', err);
        setHasCameraPermission(false);
      }
    }
    initDevices();
  }, []);

  const stopScan = useCallback(() => {
    if (controlsRef.current) {
      controlsRef.current.stop();
      controlsRef.current = null;
    }
    setIsScanning(false);
  }, []);

  const startScan = useCallback(async () => {
    if (!videoRef.current || !selectedDeviceId) {
      toast.error('No camera available or selected');
      return;
    }

    try {
      const codeReader = new BrowserQRCodeReader();
      setIsScanning(true);
      
      const controls = await codeReader.decodeFromVideoDevice(
        selectedDeviceId,
        videoRef.current,
        (result: Result | undefined, error: Error | undefined) => {
          if (result) {
            onResult(result.getText());
            stopScan(); // Auto-stop on first successful scan
          }
          if (error && error.name !== 'NotFoundException') {
            // Log only real errors, not "QR not found in current frame"
            // console.error(error);
          }
        }
      );
      
      controlsRef.current = controls;
    } catch (err) {
      console.error('Failed to start scanner', err);
      toast.error('Failed to start camera scanner');
      setIsScanning(false);
    }
  }, [selectedDeviceId, onResult, stopScan]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopScan();
    };
  }, [stopScan]);

  return {
    videoRef,
    isScanning,
    startScan,
    stopScan,
    hasCameraPermission,
    devices,
    selectedDeviceId,
    setSelectedDeviceId
  };
}
