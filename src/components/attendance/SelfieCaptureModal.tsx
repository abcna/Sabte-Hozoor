"use client";

import { useEffect, useRef, useState } from "react";
import { Camera, RefreshCw, X } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";

type Props = {
  open: boolean;
  onClose: () => void;
  onCapture: (photoDataUrl: string) => void;
};

export function SelfieCaptureModal({ open, onClose, onCapture }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [error, setError] = useState("");
  const [preview, setPreview] = useState<string | null>(null);
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    if (!open) {
      stopCamera();
      setPreview(null);
      setError("");
      return;
    }
    startCamera();
    return () => stopCamera();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  async function startCamera() {
    setStarting(true);
    setError("");
    setPreview(null);
    try {
      stopCamera();
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
          facingMode: { ideal: "user" },
          width: { ideal: 720 },
          height: { ideal: 720 },
        },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    } catch {
      setError("دسترسی به دوربین لازم است. لطفاً اجازه دهید.");
    } finally {
      setStarting(false);
    }
  }

  function stopCamera() {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
  }

  function takePhoto() {
    const video = videoRef.current;
    if (!video || !video.videoWidth) {
      setError("دوربین هنوز آماده نیست.");
      return;
    }

    const maxSide = 640;
    const scale = Math.min(1, maxSide / Math.max(video.videoWidth, video.videoHeight));
    const w = Math.round(video.videoWidth * scale);
    const h = Math.round(video.videoHeight * scale);

    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Mirror selfie so it matches preview
    ctx.translate(w, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0, w, h);

    const dataUrl = canvas.toDataURL("image/jpeg", 0.72);
    setPreview(dataUrl);
    stopCamera();
  }

  function confirm() {
    if (!preview) return;
    onCapture(preview);
    onClose();
  }

  async function retake() {
    setPreview(null);
    await startCamera();
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-4 sm:items-center">
      <GlassCard strong className="w-full max-w-md overflow-hidden p-4 animate-fade-in">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-semibold">عکس سلفی برای ثبت ورود</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 hover:bg-white/10"
            aria-label="بستن"
          >
            <X size={18} />
          </button>
        </div>

        <p className="mb-3 text-sm text-[var(--text-secondary)]">
          چهره‌تان باید واضح در کادر باشد. عکس از گالری قابل انتخاب نیست.
        </p>

        <div className="relative aspect-square overflow-hidden rounded-2xl bg-black">
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt="پیش‌نمایش سلفی" className="h-full w-full object-cover" />
          ) : (
            <video
              ref={videoRef}
              playsInline
              muted
              className="h-full w-full scale-x-[-1] object-cover"
            />
          )}
          {starting && !preview && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 text-sm">
              در حال باز کردن دوربین…
            </div>
          )}
        </div>

        {error && (
          <p className="mt-3 rounded-xl border border-[var(--danger)]/30 bg-[var(--danger)]/10 px-3 py-2 text-sm text-[var(--danger)]">
            {error}
          </p>
        )}

        <div className="mt-4 flex flex-wrap gap-2">
          {!preview ? (
            <>
              <Button className="flex-1" onClick={takePhoto} disabled={starting || !!error}>
                <Camera size={16} /> گرفتن عکس
              </Button>
              {error && (
                <Button variant="secondary" onClick={startCamera}>
                  <RefreshCw size={16} /> تلاش دوباره
                </Button>
              )}
              <Button variant="ghost" onClick={onClose}>
                انصراف
              </Button>
            </>
          ) : (
            <>
              <Button className="flex-1" onClick={confirm}>
                تأیید و ادامه ثبت ورود
              </Button>
              <Button variant="secondary" onClick={retake}>
                <RefreshCw size={16} /> گرفتن دوباره
              </Button>
            </>
          )}
        </div>
      </GlassCard>
    </div>
  );
}
