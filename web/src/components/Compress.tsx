import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Upload } from "@/components/Upload"
import { useState } from "react"
import { toast } from "@/components/ui/toast"

import { API_BASE_URL } from "@/lib/api"

export function Compress() {
  const [file, setFile] = useState<File | null>(null)

  const handleSubmit = async () => {
    if (!file) return

    toast.add({
      title: "Processing PDF...",
      description: "Uploading and compressing your file, please wait.",
    })

    try {
      const formData: FormData = new FormData();

      formData.append("file", file)

      const response = await fetch(`${API_BASE_URL}/compress`, {
        method: "POST",
        body: formData,
      })
      if (!response.ok) {
        throw new Error("Failed to split PDF");
      }

      const zipBlob = await response.blob();
      const downloadUrl = URL.createObjectURL(zipBlob);

      // automatically download the file
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = "compressed.pdf";
      link.click();
      link.remove();
      URL.revokeObjectURL(downloadUrl);

      toast.add({
        title: "Success!",
        description: "Your PDF has been compressed and downloaded.",
      })
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <Card className="w-[450px]">
      <CardHeader>
        <CardTitle className="text-xl font-bold">Compress PDF files</CardTitle>
      </CardHeader>
      <CardContent>
        <Upload multiple={false} onSubmit={handleSubmit} onFilesChange={(files) => setFile(files[0] ?? null)} />
      </CardContent>
    </Card>
  )
}