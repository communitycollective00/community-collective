"use client";

import { useRef, useState, useEffect } from "react";
import { getSupabaseClient } from "../../lib/supabase";

type MediaCaptureProps = {
  onMediaCaptured: (url: string, type: "photo" | "video") => void;
  mediaType: "photo" | "video";
  userId: string | null;
  disabled?: boolean;
};

export function MediaCapture({ onMediaCaptured, mediaType, userId, disabled = false }: MediaCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const [isRecording, setIsRecording] = useState(false);
  const [hasCamera, setHasCamera] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [status, setStatus] = useState("");

  // Request camera permissions on mount
  useEffect(() => {
    const checkCamera = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const hasVideoInput = devices.some((d) => d.kind === "videoinput");
        setHasCamera(hasVideoInput);
      } catch (err) {
        console.warn("Failed to enumerate devices:", err);
        setHasCamera(false);
      }
    };
    checkCamera();
  }, []);

  const startCamera = async () => {
    try {
      setStatus("Requesting camera access...");
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
        audio: mediaType === "video",
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraActive(true);
        setStatus("");
      }
    } catch (err: any) {
      setStatus(
        err?.name === "NotAllowedError"
          ? "Camera permission denied. Use file upload instead."
          : "Failed to access camera. Use file upload instead."
      );
      console.error("Camera error:", err);
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach((track) => track.stop());
      setCameraActive(false);
      setIsRecording(false);
    }
  };

  const capturePhoto = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;

    const video = videoRef.current;
    canvasRef.current.width = video.videoWidth;
    canvasRef.current.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);

    const blob = await new Promise<Blob>((resolve) => {
      canvasRef.current!.toBlob((blob) => resolve(blob!), "image/jpeg", 0.95);
    });

    await uploadMedia(blob, "image/jpeg", "photo");
  };

  const startRecording = async () => {
    if (!videoRef.current?.srcObject) return;

    chunksRef.current = [];
    const stream = videoRef.current.srcObject as MediaStream;
    const mediaRecorder = new MediaRecorder(stream, {
      mimeType: "video/webm",
    });

    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        chunksRef.current.push(e.data);
      }
    };

    mediaRecorder.onstop = async () => {
      const blob = new Blob(chunksRef.current, { type: "video/webm" });
      await uploadMedia(blob, "video/webm", "video");
    };

    mediaRecorderRef.current = mediaRecorder;
    mediaRecorder.start();
    setIsRecording(true);
    setStatus("Recording...");
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setStatus("Processing video...");
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isVideo = file.type.startsWith("video/");
    const isPhoto = file.type.startsWith("image/");

    if ((mediaType === "photo" && !isPhoto) || (mediaType === "video" && !isVideo)) {
      setStatus(`Please select a ${mediaType} file.`);
      return;
    }

    await uploadMedia(file, file.type, mediaType);
  };

  const uploadMedia = async (blob: Blob, mimeType: string, type: "photo" | "video") => {
    if (!userId) {
      setStatus("User not authenticated.");
      return;
    }

    setIsUploading(true);
    setStatus(`Uploading ${type}...`);

    try {
      const ext = mimeType.split("/")[1] || "bin";
      const fileName = `${Date.now()}.${ext}`;
      const path = `${userId}/${fileName}`;

      const { error: uploadError } = await getSupabaseClient().storage.from("media").upload(path, blob, {
        upsert: true,
      });

      if (uploadError) {
        setStatus(`Upload failed: ${uploadError.message}`);
        return;
      }

      const { data } = getSupabaseClient().storage.from("media").getPublicUrl(path);
      const mediaUrl = data.publicUrl;

      // Create preview
      const previewUrl = URL.createObjectURL(blob);
      setPreview(previewUrl);

      onMediaCaptured(mediaUrl, type);
      setStatus(`${type === "photo" ? "Photo" : "Video"} ready to publish!`);
      stopCamera();
    } catch (err) {
      console.error("Upload error:", err);
      setStatus("Upload failed. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const resetCapture = () => {
    setPreview(null);
    setStatus("");
    stopCamera();
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  if (preview) {
    return (
      <div style={{ margin: "1rem 0" }}>
        <p className="muted" style={{ fontSize: "0.9rem", marginBottom: "0.5rem" }}>
          {mediaType === "photo" ? "📸 Photo ready" : "🎬 Video ready"}
        </p>
        {mediaType === "photo" ? (
          <img
            src={preview}
            alt="Preview"
            style={{
              width: "100%",
              maxHeight: "300px",
              objectFit: "cover",
              borderRadius: "12px",
              marginBottom: "0.75rem",
              border: "1px solid var(--border)",
            }}
          />
        ) : (
          <video
            src={preview}
            controls
            style={{
              width: "100%",
              maxHeight: "300px",
              borderRadius: "12px",
              marginBottom: "0.75rem",
              border: "1px solid var(--border)",
            }}
          />
        )}
        <button
          onClick={resetCapture}
          type="button"
          style={{
            padding: "0.5rem 1rem",
            background: "var(--dim)",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontSize: "0.9rem",
          }}
        >
          Capture Again
        </button>
      </div>
    );
  }

  if (cameraActive) {
    return (
      <div style={{ margin: "1rem 0" }}>
        <video
          ref={videoRef}
          autoPlay
          playsInline
          style={{
            width: "100%",
            borderRadius: "12px",
            marginBottom: "0.75rem",
            backgroundColor: "#000",
            aspectRatio: "4/3",
            objectFit: "cover",
          }}
        />
        <canvas ref={canvasRef} style={{ display: "none" }} />

        <div
          style={{
            display: "flex",
            gap: "0.75rem",
            flexWrap: "wrap",
          }}
        >
          {mediaType === "photo" ? (
            <button
              onClick={capturePhoto}
              disabled={isUploading}
              type="button"
              style={{
                flex: 1,
                minWidth: "120px",
                padding: "0.75rem",
                background: "var(--gold)",
                color: "black",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: 600,
                opacity: isUploading ? 0.6 : 1,
              }}
            >
              {isUploading ? "Uploading..." : "📸 Capture"}
            </button>
          ) : (
            <>
              <button
                onClick={isRecording ? stopRecording : startRecording}
                disabled={isUploading}
                type="button"
                style={{
                  flex: 1,
                  minWidth: "120px",
                  padding: "0.75rem",
                  background: isRecording ? "#ff4444" : "var(--gold)",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontWeight: 600,
                  opacity: isUploading ? 0.6 : 1,
                }}
              >
                {isRecording ? "⏹ Stop Recording" : "🎬 Start Recording"}
              </button>
            </>
          )}

          <button
            onClick={stopCamera}
            type="button"
            style={{
              flex: 1,
              minWidth: "120px",
              padding: "0.75rem",
              background: "var(--dim)",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            Close
          </button>
        </div>

        {status && <p className="muted" style={{ marginTop: "0.5rem", fontSize: "0.85rem" }}>→ {status}</p>}
      </div>
    );
  }

  return (
    <div style={{ margin: "1rem 0" }}>
      <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
        {hasCamera && (
          <button
            onClick={startCamera}
            disabled={disabled || isUploading}
            type="button"
            style={{
              flex: 1,
              minWidth: "150px",
              padding: "0.75rem",
              background: "var(--gold)",
              color: "black",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: 600,
              opacity: disabled || isUploading ? 0.6 : 1,
            }}
          >
            {mediaType === "photo" ? "📷 Open Camera" : "🎥 Record Video"}
          </button>
        )}

        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || isUploading}
          type="button"
          style={{
            flex: 1,
            minWidth: "150px",
            padding: "0.75rem",
            background: "var(--dim)",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: 600,
            opacity: disabled || isUploading ? 0.6 : 1,
          }}
        >
          {mediaType === "photo" ? "📁 Choose Photo" : "📁 Choose Video"}
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept={mediaType === "photo" ? "image/*" : "video/*"}
          onChange={handleFileSelect}
          style={{ display: "none" }}
          disabled={disabled || isUploading}
        />
      </div>

      {status && <p className="muted" style={{ marginTop: "0.5rem", fontSize: "0.85rem", color: "#ff6b6b" }}>⚠ {status}</p>}
    </div>
  );
}
