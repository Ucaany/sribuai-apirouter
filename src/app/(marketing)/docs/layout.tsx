import { DocsSidebar } from "@/components/docs/DocsSidebar"

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto flex w-full max-w-6xl gap-10 px-4 py-10">
      <DocsSidebar />
      <main className="min-w-0 flex-1">
        <article className="prose prose-neutral dark:prose-invert max-w-none">
          {children}
        </article>
      </main>
    </div>
  )
}
