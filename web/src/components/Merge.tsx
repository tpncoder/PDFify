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

export function Merge() {
  const [files, setFiles] = useState<File[]>([])

  const handleSubmit = async () => {
    if(files.length < 2) {
      toast.add({
        title: "Error!",
        description: "More than two PDFs need to be uploaded",
      })
      return
    }

    toast.add({
      title: "Processing PDF...",
      description: "Uploading and merging your files, please wait.",
    })

    try {
      const formData: FormData = new FormData();

      files.forEach((file: File) => {
        formData.append("files", file)
      });

      const response = await fetch(`${API_BASE_URL}/merge`, {
        method: "POST",
        body: formData,
      })
      if (!response.ok) {
        throw new Error("Failed to merge PDFs");
      }

      const pdfBlob = await response.blob();
      const downloadUrl = URL.createObjectURL(pdfBlob);

      // automatically download the file
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = "merged.pdf";
      link.click();
      link.remove();
      URL.revokeObjectURL(downloadUrl);

      toast.add({
        title: "Success!",
        description: "Your PDFs have been merged and downloaded.",
      })
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <Card className="w-[450px]">
      <CardHeader>
        <CardTitle className="text-xl font-bold">Merge PDF files</CardTitle>
      </CardHeader>
      <CardContent>
        <Upload multiple={true} onFilesChange={setFiles} onSubmit={handleSubmit}/>
      </CardContent>
    </Card>
  )
}