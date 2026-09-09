import Image from "next/image";
import Link from "next/link";
import type { RelatedStory } from "../../lib/types";

interface Props {
  story: RelatedStory;
}

export function RelatedStoryCard({ story }: Props) {
  return (
    <Link href={`/news/${story.id}`} className="group block overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:border-slate-300">
      <div className="flex gap-4 p-4 sm:p-5">
        <div className="relative h-20 w-20 overflow-hidden rounded-2xl bg-slate-100">
          <Image src={story.imageUrl} alt={story.title} fill className="object-cover" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{story.category} · {story.location}</p>
          <h3 className="mt-2 line-clamp-2 text-sm font-semibold text-slate-900">{story.title}</h3>
          <p className="mt-3 text-xs text-slate-500">{story.publishedDate} · {story.readTime}</p>
        </div>
      </div>
    </Link>
  );
}
