export default function Loading() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-3 border-border border-t-primary rounded-full animate-spin" />
        <p className="text-sm text-text-muted">Loading...</p>
      </div>
    </div>
  );
}
