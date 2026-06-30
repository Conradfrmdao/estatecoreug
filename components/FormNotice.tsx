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

  const styles = tone === 'success'
    ? 'border-green-200 bg-green-50 text-green-800'
    : 'border-rose-200 bg-rose-50 text-rose-700'

  return (
    <div className={`rounded-lg border px-3 py-2 text-sm font-medium ${styles}`}>
      {message}
    </div>
  )
}
