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

export function Extract() {
  const [file, setFile] = useState<File | null>(null)

  const handleSubmit = async () => {
    if (!file) return;

    toast.add({
      title: "Processing PDF...",
      description: "Uploading and extracting text from your file, please wait.",
    })

    try {
      const formData: FormData = new FormData();

      formData.append("file", file)

      const response = await fetch(`${API_BASE_URL}/extract`, {
        method: "POST",
        body: formData,
      })
      if (!response.ok) {
        throw new Error("Failed to extract text");
      }

      const textBlob = await response.blob();
      const downloadUrl = URL.createObjectURL(textBlob);

      // automatically download the file
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = "text.txt";
      link.click();
      link.remove();
      URL.revokeObjectURL(downloadUrl);

      toast.add({
        title: "Success!",
        description: "Text has been extracted from your PDF.",
      })
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <Card className="w-[450px]">
      <CardHeader>
        <CardTitle className="text-xl font-bold">Extract PDF text</CardTitle>
      </CardHeader>
      <CardContent>
        <Upload multiple={false} onSubmit={handleSubmit} onFilesChange={(files) => setFile(files[0] ?? null)} />
      </CardContent>
    </Card>
  )
}