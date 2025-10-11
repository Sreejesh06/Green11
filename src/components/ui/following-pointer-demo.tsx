import { FollowerPointerCard } from "@/components/ui/following-pointer";

const blogContent = {
  slug: "amazing-tailwindcss-grid-layouts",
  author: "Manu Arora",
  date: "28th March, 2023",
  title: "Amazing Tailwindcss Grid Layout Examples",
  description:
    "Grids are cool, but Tailwindcss grids are cooler. In this article, we will learn how to create amazing grid layouts with Tailwind CSS and React.",
  image:
    "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1600&q=80",
  authorAvatar: "https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=200&q=80",
};

export function FollowingPointerDemo() {
  return (
    <div className="mx-auto w-80">
      <FollowerPointerCard
        title={<TitleComponent title={blogContent.author} avatar={blogContent.authorAvatar} />}
      >
        <div className="group relative h-full overflow-hidden rounded-2xl border border-zinc-100 bg-white transition duration-200 hover:shadow-xl">
          <div className="relative aspect-[16/10] overflow-hidden rounded-tl-2xl rounded-tr-2xl bg-gray-100">
            <img
              src={blogContent.image}
              alt="thumbnail"
              className="h-full w-full object-cover transition duration-200 group-hover:scale-95 group-hover:rounded-2xl"
              loading="lazy"
            />
          </div>
          <div className="p-4">
            <h2 className="my-4 text-lg font-bold text-zinc-700">{blogContent.title}</h2>
            <h3 className="my-4 text-sm font-normal text-zinc-500">{blogContent.description}</h3>
            <div className="mt-10 flex items-center justify-between">
              <span className="text-sm text-gray-500">{blogContent.date}</span>
              <div className="relative z-10 block rounded-xl bg-black px-6 py-2 text-xs font-bold text-white">
                Read More
              </div>
            </div>
          </div>
        </div>
      </FollowerPointerCard>
    </div>
  );
}

const TitleComponent = ({ title, avatar }: { title: string; avatar: string }) => (
  <div className="flex items-center space-x-2">
    <img
      src={avatar}
      height={20}
      width={20}
      alt="author avatar"
      className="h-5 w-5 rounded-full border-2 border-white object-cover"
      loading="lazy"
    />
    <p className="text-sm font-medium text-zinc-700">{title}</p>
  </div>
);
