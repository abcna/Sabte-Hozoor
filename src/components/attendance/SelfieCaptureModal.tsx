"use client";

import { useEffect, useRef, useState } from "react";
import { Camera, ImagePlus, RefreshCw, X } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";

type Props = {
  open: boolean;
  onClose: () => void;
  onCapture: (photoDataUrl: string) => void;
};

const CONSTRAINTS: MediaStreamConstraints[] = [
  {
    audio: false,
    video: { facingMode: "user", width: { ideal: 480 }, height: { ideal: 480 } },
  },
  { audio: false, video: { facingMode: "user" } },
  { audio: false, video: true },
];

function canUseLiveCamera() {
  return typeof navigator !== "undefined" && !!navigator.mediaDevices?.getUserMedia;
}

async function compressFileToJpegDataUrl(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const maxSide = 640;
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
  const w = Math.max(1, Math.round(bitmap.width * scale));
  const h = Math.max(1, Math.round(bitmap.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas");
  ctx.drawImage(bitmap, 0, 0, w, h);
  bitmap.close?.();
  return canvas.toDataURL("image/jpeg", 0.7);
}

/** Older iOS fallback when createImageBitmap is missing. */
function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("read"));
    reader.readAsDataURL(file);
  });
}

export function SelfieCaptureModal({ open, onClose, onCapture }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [error, setError] = useState("");
  const [preview, setPreview] = useState<string | null>(null);
  const [starting, setStarting] = useState(false);
  const [useFallback, setUseFallback] = useState(false);

  useEffect(() => {
    if (!open) {
      stopCamera();
      setPreview(null);
      setError("");
      setUseFallback(false);
      return;
    }

    if (!canUseLiveCamera()) {
      setUseFallback(true);
      setError(
        "دوربین زنده روی این گوشی پشتیبانی نمی‌شود. از دکمه «باز کردن دوربین گوشی» استفاده کنید.",
      );
      return;
    }

    void startCamera();
    return () => stopCamera();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  async function startCamera() {
    setStarting(true);
    setError("");
    setPreview(null);
    setUseFallback(false);

    if (!canUseLiveCamera()) {
      setUseFallback(true);
      setError("دوربین زنده در دسترس نیست. از دکمه پایین استفاده کنید.");
      setStarting(false);
      return;
    }

    stopCamera();
    let lastErr: unknown;

    for (const constraints of CONSTRAINTS) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        streamRef.current = stream;
        const video = videoRef.current;
        if (video) {
          video.setAttribute("playsinline", "true");
          video.setAttribute("webkit-playsinline", "true");
          video.muted = true;
          video.srcObject = stream;
          try {
            await video.play();
          } catch {
            // Autoplay quirks on older iOS — frame may still be available.
          }
        }
        setStarting(false);
        return;
      } catch (err) {
        lastErr = err;
        stopCamera();
      }
    }

    console.warn("getUserMedia failed", lastErr);
    setUseFallback(true);
    setError(
      "باز کردن دوربین زنده روی این گوشی ممکن نشد. از دکمه «باز کردن دوربین گوشی» استفاده کنید.",
    );
    setStarting(false);
  }

  function stopCamera() {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
  }

  function takePhoto() {
    const video = videoRef.current;
    if (!video || !video.videoWidth) {
      setError("دوربین هنوز آماده نیست. چند لحظه صبر کنید یا از دوربین گوشی استفاده کنید.");
      setUseFallback(true);
      return;
    }

    try {
      const maxSide = 480;
      const scale = Math.min(
        1,
        maxSide / Math.max(video.videoWidth, video.videoHeight),
      );
      const w = Math.max(1, Math.round(video.videoWidth * scale));
      const h = Math.max(1, Math.round(video.videoHeight * scale));

      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        setError("ثبت عکس روی این گوشی پشتیبانی نمی‌شود.");
        setUseFallback(true);
        return;
      }

      ctx.translate(w, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(video, 0, 0, w, h);

      const dataUrl = canvas.toDataURL("image/jpeg", 0.7);
      if (!dataUrl || dataUrl.length < 100) {
        setError("عکس ساخته نشد. از دوربین گوشی استفاده کنید.");
        setUseFallback(true);
        return;
      }
      setPreview(dataUrl);
      stopCamera();
    } catch (err) {
      console.warn("takePhoto failed", err);
      setError("خطا در گرفتن عکس. از دوربین گوشی استفاده کنید.");
      setUseFallback(true);
    }
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

  async function onFilePicked(file: File | null) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("فقط فایل تصویر مجاز است.");
      return;
    }
    setError("");
    setStarting(true);
    try {
      let dataUrl: string;
      try {
        dataUrl = await compressFileToJpegDataUrl(file);
      } catch {
        dataUrl = await fileToDataUrl(file);
      }
      setPreview(dataUrl);
      stopCamera();
    } catch {
      setError("خواندن عکس ناموفق بود. دوباره تلاش کنید.");
    } finally {
      setStarting(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
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
          چهره‌تان باید واضح در کادر باشد. عکس از گالری قابل انتخاب نیست؛ فقط
          دوربین.
        </p>

        <div className="relative aspect-square overflow-hidden rounded-2xl bg-black">
          {preview ? (
            <img
              src={preview}
              alt="پیش‌نمایش سلفی"
              className="h-full w-full object-cover"
            />
          ) : useFallback ? (
            <div className="flex h-full flex-col items-center justify-center gap-2 px-6 text-center text-sm text-white/80">
              <ImagePlus size={28} />
              <span>دوربین زنده روی این گوشی فعال نشد.</span>
              <span className="text-white/55">
                دکمه «باز کردن دوربین گوشی» را بزنید.
              </span>
            </div>
          ) : (
            <video
              ref={videoRef}
              playsInline
              muted
              autoPlay
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

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="user"
          className="hidden"
          onChange={(e) => void onFilePicked(e.target.files?.[0] ?? null)}
        />

        <div className="mt-4 flex flex-wrap gap-2">
          {!preview ? (
            <>
              {!useFallback && (
                <Button
                  type="button"
                  className="flex-1"
                  onClick={takePhoto}
                  disabled={starting}
                >
                  <Camera size={16} /> گرفتن عکس
                </Button>
              )}
              <Button
                type="button"
                variant={useFallback ? "primary" : "secondary"}
                className="flex-1"
                onClick={() => fileInputRef.current?.click()}
                disabled={starting}
              >
                <ImagePlus size={16} /> باز کردن دوربین گوشی
              </Button>
              {!useFallback && error && (
                <Button type="button" variant="secondary" onClick={() => void startCamera()}>
                  <RefreshCw size={16} /> تلاش دوباره
                </Button>
              )}
              <Button type="button" variant="ghost" onClick={onClose}>
                انصراف
              </Button>
            </>
          ) : (
            <>
              <Button type="button" className="flex-1" onClick={confirm}>
                تأیید و ادامه ثبت ورود
              </Button>
              <Button type="button" variant="secondary" onClick={() => void retake()}>
                <RefreshCw size={16} /> گرفتن دوباره
              </Button>
            </>
          )}
        </div>
      </GlassCard>
    </div>
  );
}
