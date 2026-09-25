import { FormSkeleton } from '@/components/ui/Skeleton'

export default function Loading() {
  return <FormSkeleton label="Loading the new tenant form" fields={7} />
}
