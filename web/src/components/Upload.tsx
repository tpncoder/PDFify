import { Card } from "@/components/ui/card";
import { FilePlusCorner, Trash2 } from "lucide-react";
import { useCallback, useState } from "react";
import { useDropzone, type FileRejection } from "react-dropzone";
import { Button } from "@/components/ui/button";

interface UploadProps {
  onFilesChange: (files: File[]) => void;
  onSubmit: () => void;
  multiple?: boolean;
}

export function Upload({ onFilesChange, onSubmit, multiple = true }: UploadProps) {
  const [files, setFiles] = useState<File[]>([])

  // custom ondrop logic to supp
  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: FileRejection[]) => {
    const fileList = (multiple) ? [...files, ...acceptedFiles] : acceptedFiles.slice(0, 1);
    setFiles(fileList)
    onFilesChange(fileList) // callback

    if (rejectedFiles.length > 0) {
      console.warn("Rejected:", rejectedFiles.map((r) => r.file.name));
    }
  }, [files, multiple, onFilesChange])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple,
    accept: {
      'application/pdf': ['.pdf'],
    },
  });


  const filesRender = files.map(file => (
    <Card key={file.name} className="flex flex-row p-2 items-center min-w-full min-h-full mt-2">
      <FilePlusCorner color="#4e5567" size={15} className="ml-2" />
      {file.name} - {(file.size/1048576).toPrecision(2)} MB
      <span 
        className="ml-auto mr-2 cursor-pointer" 
        onClick={() => {
          setFiles(files.filter((f) => f.name != file.name))
          onFilesChange(files.filter((f) => f.name != file.name))
      }}>
        <Trash2 color="#ff0000" />
      </span>
    </Card>
  ));

  return (
    <section id="container">
      <div
        {...getRootProps()}
        className={`flex flex-col h-48 w-full items-center justify-center text-center border-2 border-dashed rounded-md cursor-pointer transition-colors ${
          isDragActive
            ? "border-blue-600 bg-blue-100/70 text-blue-900"
            : "border-blue-800 bg-gray-100 text-gray-700 hover:bg-gray-200/60" 
        }`}
      >
          <input {...getInputProps()} />
          <FilePlusCorner color={`${isDragActive ? "#193cb8" : "#4e5567"}`} size={48} className="mb-2" />
          <h1 className="text-base font-normal min-w-full">
            {isDragActive ? "Drop here" : "Drag & drop PDF files here" }
          </h1>
        </div>
      {
        (files.length > 0)
          ? <>
            <h1 className="mt-2 font-medium">Uploaded Files</h1>
            <ul>{filesRender}</ul>
            <div className="flex flex-row w-full justify-center">
              <Button className="bg-blue-800 mt-2 hover:bg-blue-500" onClick={onSubmit}>Upload</Button>
            </div>
          </>
          : <span />
      }
    </section>
  )
}