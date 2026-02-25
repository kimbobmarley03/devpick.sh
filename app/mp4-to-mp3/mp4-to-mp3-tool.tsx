"use client";

import { useState, useRef } from "react";
import { ToolLayout } from "@/components/tool-layout";
import { Upload, Music, Download, X } from "lucide-react";

type Status = "idle" | "loading" | "recording" | "done" | "error";

export function Mp4ToMp3Tool() {
  const [status, setStatus] = useState<Status>("idle");
  const [fileName, setFileName] = useState("");
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [progress, setProgress] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  const reset = () => {
    setStatus("idle");
    setFileName("");
    setErrorMsg("");
    setProgress(0);
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioUrl(null);
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current = null;
    }
  };

  const handleFile = async (file: File) => {
    if (!file) return;
    reset();
    setFileName(file.name);
    setStatus("loading");
    setProgress(10);

    const objUrl = URL.createObjectURL(file);
    const video = videoRef.current!;
    video.src = objUrl;
    video.muted = false;
    video.volume = 1;

    video.onloadedmetadata = () => {
      setProgress(30);
      extractAudio(video, file.name, objUrl);
    };

    video.onerror = () => {
      setStatus("error");
      setErrorMsg("Failed to load the video file. Make sure it's a valid MP4.");
      URL.revokeObjectURL(objUrl);
    };
  };

  const extractAudio = (video: HTMLVideoElement, originalName: string, objUrl: string) => {
    try {
      const videoAny = video as unknown as Record<string, () => MediaStream>;
      const stream = videoAny.captureStream ? videoAny.captureStream() : videoAny.mozCaptureStream?.();
      if (!stream) {
        setStatus("error");
        setErrorMsg("Your browser doesn't support audio extraction. Try Chrome or Edge.");
        return;
      }

      const audioTracks = stream.getAudioTracks();
      if (audioTracks.length === 0) {
        setStatus("error");
        setErrorMsg("No audio track found in this video file.");
        URL.revokeObjectURL(objUrl);
        return;
      }

      const audioStream = new MediaStream(audioTracks);
      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : MediaRecorder.isTypeSupported("audio/webm")
        ? "audio/webm"
        : "audio/ogg";

      const recorder = new MediaRecorder(audioStream, { mimeType });
      mediaRecorderRef.current = recorder;
      const chunks: BlobPart[] = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: mimeType });
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        setStatus("done");
        setProgress(100);
        URL.revokeObjectURL(objUrl);
      };

      recorder.onerror = () => {
        setStatus("error");
        setErrorMsg("Audio recording failed. Please try a different file.");
      };

      setStatus("recording");
      setProgress(50);
      recorder.start(100);
      video.currentTime = 0;
      video.play();

      video.onended = () => {
        recorder.stop();
        audioStream.getTracks().forEach((t) => t.stop());
      };

      video.ontimeupdate = () => {
        if (video.duration > 0) {
          const pct = 50 + (video.currentTime / video.duration) * 45;
          setProgress(Math.min(95, Math.round(pct)));
        }
      };
    } catch (e) {
      setStatus("error");
      setErrorMsg(`Extraction failed: ${e instanceof Error ? e.message : "Unknown error"}`);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("video/")) handleFile(file);
  };

  const downloadAudio = () => {
    if (!audioUrl) return;
    const baseName = fileName.replace(/\.[^.]+$/, "");
    const ext = audioUrl.includes("ogg") ? "ogg" : "webm";
    const a = document.createElement("a");
    a.href = audioUrl;
    a.download = `${baseName}.${ext}`;
    a.click();
  };

  return (
    <ToolLayout
      title="MP4 to Audio Converter"
      description="Extract audio from MP4 and video files — free, client-side, no upload needed"
    >
      {/* Hidden video element for capture */}
      <video ref={videoRef} style={{ display: "none" }} preload="auto" playsInline />

      {/* Drop zone */}
      {status === "idle" && (
        <div
          className="border-2 border-dashed border-border-strong rounded-xl p-12 text-center cursor-pointer hover:border-accent hover:bg-[var(--dp-bg-subtle)] transition-colors"
          onClick={() => fileInputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
        >
          <Upload size={36} className="mx-auto mb-3 text-text-dimmed" />
          <p className="text-text-secondary font-medium mb-1">Drop an MP4 or video file here</p>
          <p className="text-xs text-text-muted">or click to browse · MP4, WebM, MOV, AVI, MKV</p>
          <input
            ref={fileInputRef}
            type="file"
            accept="video/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleFile(f);
            }}
          />
        </div>
      )}

      {/* Processing state */}
      {(status === "loading" || status === "recording") && (
        <div className="bg-card-bg border border-card-border rounded-xl p-8 text-center">
          <Music size={32} className="mx-auto mb-3 text-accent animate-pulse" />
          <p className="text-text-secondary font-medium mb-1">
            {status === "loading" ? "Loading video..." : "Extracting audio..."}
          </p>
          <p className="text-xs text-text-muted mb-4">{fileName}</p>
          <div className="w-full bg-border rounded-full h-2 mb-2">
            <div
              className="h-2 rounded-full bg-accent transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-text-dimmed">{progress}%</p>
          <p className="text-xs text-text-muted mt-3">
            {status === "recording" && "Playing video to capture audio stream — please wait..."}
          </p>
        </div>
      )}

      {/* Done state */}
      {status === "done" && audioUrl && (
        <div className="bg-card-bg border border-card-border rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <Music size={20} className="text-success" />
            <span className="font-medium text-text-primary">Audio extracted successfully!</span>
            <button onClick={reset} className="ml-auto action-btn">
              <X size={13} />
              New file
            </button>
          </div>
          <p className="text-xs text-text-muted mb-4">{fileName}</p>
          <audio controls className="w-full mb-4" src={audioUrl} />
          <button onClick={downloadAudio} className="action-btn primary w-full">
            <Download size={14} />
            Download Audio (WebM)
          </button>
          <p className="text-xs text-text-muted mt-3 text-center">
            Output is WebM audio (Opus codec) — widely supported in modern browsers and media players.
          </p>
        </div>
      )}

      {/* Error state */}
      {status === "error" && (
        <div className="bg-card-bg border border-error/30 rounded-xl p-8 text-center">
          <div className="text-2xl mb-3">⚠</div>
          <p className="text-error font-medium mb-2">{errorMsg}</p>
          <button onClick={reset} className="action-btn primary mt-4">
            Try Again
          </button>
        </div>
      )}

      {/* Info */}
      <div className="mt-6 p-4 bg-[var(--dp-bg-subtle)] rounded-xl text-xs text-text-dimmed space-y-1">
        <p><strong className="text-text-secondary">How it works:</strong> Your video file stays in your browser — nothing is uploaded to a server.</p>
        <p>The tool plays the video and captures the audio stream using the browser&apos;s MediaRecorder API.</p>
        <p><strong className="text-text-secondary">Note:</strong> Chrome and Edge work best. Some browsers may not support audio extraction from all video formats.</p>
      </div>

      {/* Related Tools */}
      <div className="mt-8 pt-6 border-t border-border-subtle">
        <h2 className="text-sm font-semibold text-text-secondary mb-3">Related Tools</h2>
        <div className="flex flex-wrap gap-2">
          {[
            { name: "WebP to PNG", href: "/webp-to-png" },
            { name: "Image → Base64", href: "/image-base64" },
            { name: "Favicon Generator", href: "/favicon-generator" },
            { name: "Color Picker from Image", href: "/color-from-image" },
          ].map((t) => (
            <a key={t.href} href={t.href} className="text-xs text-accent hover:underline px-2 py-1 rounded bg-[var(--dp-bg-subtle)]">
              {t.name}
            </a>
          ))}
        </div>
      </div>
    </ToolLayout>
  );
}
