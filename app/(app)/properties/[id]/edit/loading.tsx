import { FormSkeleton } from '@/components/ui/Skeleton'

export default function Loading() {
  return <FormSkeleton label="Loading the property" fields={4} />
}
