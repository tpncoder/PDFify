import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Upload } from "@/components/Upload"
import { useState } from "react"
import { toast } from "@/components/ui/toast"
import { Plus, Trash2 } from "lucide-react"

import { API_BASE_URL } from "@/lib/api"

type SplitMode = "pages" | "ranges"

type PageRange = {
  id: string
  start: string
  end: string
}

function makeEmptyRange(): PageRange {
  return { id: crypto.randomUUID(), start: "", end: "" }
}

export function Split() {
  const [file, setFile] = useState<File | null>(null)
  const [splitMode, setSplitMode] = useState<SplitMode>("pages")
  const [ranges, setRanges] = useState<PageRange[]>([makeEmptyRange()])

  const handleAddRange = () => {
    setRanges((prev) => [...prev, makeEmptyRange()])
  }

  const handleRemoveRange = (id: string) => {
    setRanges((prev) => (prev.length > 1 ? prev.filter((r) => r.id !== id) : prev))
  }

  const handleRangeChange = (id: string, field: "start" | "end", value: string) => {
    setRanges((prev) =>
      prev.map((r) => (r.id === id ? { ...r, [field]: value } : r))
    )
  }

  const handleSubmit = async () => {
    if (!file) return;

    if (splitMode === "ranges") {
      const validRanges = ranges.filter((r) => r.start.trim() && r.end.trim())
      if (validRanges.length === 0) {
        toast.add({
          title: "Add at least one range",
          description: "Enter a start and end page for each range you want to split out.",
        })
        return
      }
    }

    toast.add({
      title: "Processing PDF...",
      description: "Uploading and splitting your file, please wait.",
    })

    try {
      const formData: FormData = new FormData();

      formData.append("file", file)
      formData.append("mode", splitMode)

      if (splitMode === "ranges") {
        const validRanges = ranges
          .filter((r) => r.start.trim() && r.end.trim())
          .map((r) => ({ start: r.start.trim(), end: r.end.trim() }))
        formData.append("ranges", JSON.stringify(validRanges))
      }

      const response = await fetch(`${API_BASE_URL}/split`, {
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
      link.download = "split.zip";
      link.click();
      link.remove();
      URL.revokeObjectURL(downloadUrl);


      toast.add({
        title: "Success!",
        description: "Your PDF has been split and downloaded.",
      })
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <Card className="w-[450px]">
      <CardHeader>
        <CardTitle className="text-xl font-bold">Split PDF files</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <Upload
          multiple={false}
          onSubmit={handleSubmit}
          onFilesChange={(files) => setFile(files[0] ?? null)}
        />

        {file && (
          <div className="space-y-4 pt-1">
            <div className="space-y-3">
              <Label className="text-sm font-medium">Split options</Label>
              <RadioGroup
                value={splitMode}
                onValueChange={(value) => setSplitMode(value as SplitMode)}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="pages" id="split-pages" />
                  <Label htmlFor="split-pages" className="font-normal cursor-pointer">
                    Split into individual pages
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="ranges" id="split-ranges" />
                  <Label htmlFor="split-ranges" className="font-normal cursor-pointer">
                    Split into ranges
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {splitMode === "ranges" && (
              <div className="space-y-3 rounded-md border p-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Page ranges</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddRange}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add range
                  </Button>
                </div>

                <div className="space-y-2">
                  {ranges.map((range, index) => (
                    <div key={range.id} className="flex items-center gap-2">
                      <Input
                        type="number"
                        min={1}
                        placeholder="Start"
                        value={range.start}
                        onChange={(e) =>
                          handleRangeChange(range.id, "start", e.target.value)
                        }
                        className="w-20"
                      />
                      <span className="text-muted-foreground text-sm">to</span>
                      <Input
                        type="number"
                        min={1}
                        placeholder="End"
                        value={range.end}
                        onChange={(e) =>
                          handleRangeChange(range.id, "end", e.target.value)
                        }
                        className="w-20"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveRange(range.id)}
                        disabled={ranges.length === 1}
                        aria-label={`Remove range ${index + 1}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}