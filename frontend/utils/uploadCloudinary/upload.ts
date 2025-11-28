// D:\Save code\WDP\CvOne\frontend\utils\uploadCloudinary\upload.ts

export async function uploadFileToCloudinary(file: File): Promise<string> {
  // Kiểm tra file có tồn tại
  if (!file) {
    throw new Error("Không có file được chọn");
  }

  // Kiểm tra định dạng file (chỉ cho phép PDF)
  if (file.type !== "application/pdf") {
    throw new Error("Chỉ hỗ trợ file PDF");
  }

  // Kiểm tra kích thước file (tối đa 10MB để consistent với CV upload)
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    throw new Error("File PDF quá lớn, tối đa 10MB");
  }

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  if (!cloudName || !uploadPreset) {
    throw new Error("Thiếu cấu hình Cloudinary (cloudName hoặc uploadPreset)");
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", uploadPreset);
  formData.append("folder", "documents-pdf");

  try {
    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/raw/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error?.message || `Lỗi HTTP: ${res.status}`);
    }

    const data = await res.json();
    if (!data.secure_url) {
      throw new Error(data.error?.message || "Upload file PDF thất bại");
    }

    return data.secure_url;
  } catch (error) {
    console.error("Lỗi khi upload file PDF lên Cloudinary:", error);
    throw error instanceof Error
      ? error
      : new Error("Lỗi không xác định khi upload file");
  }
}
