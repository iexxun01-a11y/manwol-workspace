"use client";

import { useState, useRef } from "react";
import { Paperclip, Upload, X, Download, FileText, Image, Film, Archive } from "lucide-react";
import { cn } from "@/lib/utils";

type FileRecord = {
  id: string;
  filename: string;
  mimeType: string;
  size: number;
  createdAt: string;
};

type Props = {
  taskId: string;
  initialFiles: FileRecord[];
};

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}

function FileIcon({ mimeType }: { mimeType: string }) {
  if (mimeType.startsWith("image/")) return <Image size={14} className="text-blue-500" />;
  if (mimeType.startsWith("video/")) return <Film size={14} className="text-purple-500" />;
  if (mimeType.includes("zip") || mimeType.includes("tar") || mimeType.includes("rar"))
    return <Archive size={14} className="text-yellow-500" />;
  return <FileText size={14} className="text-gray-500" />;
}

export default function FileAttachments({ taskId, initialFiles }: Props) {
  const [files, setFiles] = useState<FileRecord[]>(initialFiles);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [r2Missing, setR2Missing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function uploadFile(file: File) {
    // 1. presigned URL 요청
    const presignRes = await fetch("/api/files/presign", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        filename: file.name,
        mimeType: file.type || "application/octet-stream",
        taskId,
      }),
    });
    if (!presignRes.ok) {
      const msg = await presignRes.text();
      if (msg.includes("R2 환경변수") || msg.includes("not configured")) {
        setR2Missing(true);
      } else {
        alert("업로드 준비 실패: " + msg);
      }
      return;
    }

    const json = await presignRes.json().catch(() => null);
    if (!json?.presigned?.url) {
      setR2Missing(true);
      return;
    }
    const { storageKey, presigned } = json;

    // 2. R2에 직접 업로드 (presigned POST)
    const formData = new FormData();
    Object.entries(presigned.fields as Record<string, string>).forEach(([k, v]) =>
      formData.append(k, v)
    );
    formData.append("file", file);

    let uploadRes: Response;
    try {
      uploadRes = await fetch(presigned.url, { method: "POST", body: formData });
    } catch {
      setR2Missing(true);
      return;
    }
    if (!uploadRes.ok) {
      alert("파일 업로드 실패");
      return;
    }

    // 3. DB에 메타 등록
    const regRes = await fetch("/api/files", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        storageKey,
        filename: file.name,
        mimeType: file.type || "application/octet-stream",
        size: file.size,
        taskId,
      }),
    });
    if (!regRes.ok) return;

    const newFile: FileRecord = await regRes.json();
    setFiles((prev) => [...prev, newFile]);
  }

  async function handleFiles(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;
    setUploading(true);
    try {
      for (const file of Array.from(fileList)) {
        await uploadFile(file);
      }
    } finally {
      setUploading(false);
    }
  }

  async function handleDownload(file: FileRecord) {
    const res = await fetch(`/api/files/${file.id}`);
    if (!res.ok) { alert("다운로드 URL 발급 실패"); return; }
    const { url, filename } = await res.json();
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.target = "_blank";
    a.click();
  }

  async function handleDelete(fileId: string) {
    if (!confirm("파일을 삭제하시겠습니까?")) return;
    const res = await fetch(`/api/files/${fileId}`, { method: "DELETE" });
    if (res.ok) setFiles((prev) => prev.filter((f) => f.id !== fileId));
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <Paperclip size={13} className="text-gray-400" />
        <p className="text-xs font-medium text-gray-400">첨부파일 · {files.length}</p>
      </div>

      {/* 파일 목록 */}
      {files.length > 0 && (
        <div className="space-y-1.5 mb-3">
          {files.map((f) => (
            <div
              key={f.id}
              className="flex items-center gap-2.5 p-2 rounded-lg border border-gray-200 hover:bg-gray-50 group"
            >
              <FileIcon mimeType={f.mimeType} />
              <span className="flex-1 text-xs text-gray-700 truncate">{f.filename}</span>
              <span className="text-xs text-gray-400 shrink-0">{formatBytes(f.size)}</span>
              <button
                onClick={() => handleDownload(f)}
                className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-gray-700 transition-opacity"
                title="다운로드"
              >
                <Download size={13} />
              </button>
              <button
                onClick={() => handleDelete(f.id)}
                className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-opacity"
                title="삭제"
              >
                <X size={13} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* R2 미설정 안내 */}
      {r2Missing && (
        <div className="flex items-center gap-2 p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-700 mb-2">
          파일 저장소(R2) 설정이 필요합니다. .env의 R2_* 항목을 입력해주세요.
        </div>
      )}

      {/* 업로드 영역 */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          handleFiles(e.dataTransfer.files);
        }}
        onClick={() => inputRef.current?.click()}
        className={cn(
          "flex items-center justify-center gap-2 p-3 rounded-lg border-2 border-dashed cursor-pointer transition-colors",
          dragOver
            ? "border-gray-400 bg-gray-100"
            : "border-gray-200 hover:border-gray-300 hover:bg-gray-50",
          uploading && "opacity-50 pointer-events-none"
        )}
      >
        <Upload size={13} className="text-gray-400" />
        <span className="text-xs text-gray-400">
          {uploading ? "업로드 중..." : "파일 드래그 또는 클릭하여 업로드 (최대 20MB)"}
        </span>
        <input
          ref={inputRef}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>
    </div>
  );
}
