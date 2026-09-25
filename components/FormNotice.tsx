import { CircleAlert, CircleCheck } from 'lucide-react'

export default function FormNotice({
  message,
  tone = 'error'
}: {
  message: string
  tone?: 'error' | 'success'
}) {
  if (!message) {
    return null
  }

  const success = tone === 'success'
  const Icon = success ? CircleCheck : CircleAlert

  return (
    <div
      role={success ? 'status' : 'alert'}
      className={`fade-in flex items-start gap-2.5 rounded-2xl px-4 py-3 text-[13.5px] font-semibold leading-5 ${
        success ? 'bg-paid-bg text-paid-fg' : 'bg-overdue-bg text-overdue-fg'
      }`}
    >
      <Icon aria-hidden="true" className="mt-px h-[18px] w-[18px] shrink-0" strokeWidth={2} />
      <span>{message}</span>
    </div>
  )
}
