import { toast } from "@/components/ui/toast"

interface ToastProps {
  title?: string;
  description?: string;
}

export function showToast(props: ToastProps) {
  toast.add({
    title: props.title,
    description: props.description,
  })
}