import { Card, CardContent, CardHeader } from "./ui/card"

export const PostSkeleton = () => (
  <Card className="border-border shadow-sm bg-card mb-4 overflow-hidden animate-pulse">
    <CardHeader className="p-4 pb-2">
      <div className="flex items-start justify-between">
        <div className="flex gap-3">
          <div className="w-10 h-10 rounded-full bg-muted" />
          <div className="space-y-2">
            <div className="h-4 w-32 bg-muted rounded" />
            <div className="h-3 w-24 bg-muted rounded" />
          </div>
        </div>
      </div>
    </CardHeader>
    <CardContent className="p-4 pt-2">
      <div className="space-y-2">
        <div className="h-4 w-full bg-muted rounded" />
        <div className="h-4 w-3/4 bg-muted rounded" />
      </div>
      <div className="mt-4 pt-3 border-t border-border flex gap-4">
        <div className="h-8 w-20 bg-muted rounded" />
        <div className="h-8 w-20 bg-muted rounded" />
      </div>
    </CardContent>
  </Card>
)

export const ProfileCardSkeleton = () => (
  <Card className="overflow-hidden border-border shadow-sm bg-card animate-pulse">
    <div className="h-20 bg-muted" />
    <CardContent className="relative pt-0 pb-6 px-6">
      <div className="flex flex-col items-center -mt-10 mb-4">
        <div className="w-20 h-20 rounded-full bg-muted border-4 border-card" />
        <div className="text-center mt-3 space-y-2">
          <div className="h-5 w-32 bg-muted rounded mx-auto" />
          <div className="h-4 w-24 bg-muted rounded mx-auto" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2 py-4 border-t border-border">
        <div className="h-12 bg-muted rounded" />
        <div className="h-12 bg-muted rounded" />
      </div>
    </CardContent>
  </Card>
)

export const SuggestionSkeleton = () => (
  <div className="flex items-center justify-between animate-pulse">
    <div className="flex items-center gap-3">
      <div className="w-9 h-9 rounded-full bg-muted" />
      <div className="space-y-2">
        <div className="h-4 w-24 bg-muted rounded" />
        <div className="h-3 w-20 bg-muted rounded" />
      </div>
    </div>
    <div className="w-8 h-8 rounded-full bg-muted" />
  </div>
)
