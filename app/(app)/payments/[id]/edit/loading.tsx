import { FormSkeleton } from '@/components/ui/Skeleton'

export default function Loading() {
  return <FormSkeleton label="Loading the payment" fields={6} />
}
