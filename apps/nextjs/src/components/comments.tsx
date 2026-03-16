import { cn } from "@saasfly/ui";
import Marquee from "@saasfly/ui/marquee";

const reviews = [
  {
    name: "Marcus T.",
    username: "@marcust_la",
    body: "Our drivers used to call in constantly with route questions. Since we switched to SEFARI, dispatch basically runs itself. Game changer.",
    img: "https://avatar.vercel.sh/marcus",
  },
  {
    name: "Danielle R.",
    username: "@danielle_r",
    body: "Customers stopped calling to ask where their order is. The live tracking link does all the work. Our review scores went up overnight.",
    img: "https://avatar.vercel.sh/danielle",
  },
  {
    name: "Tyler W.",
    username: "@tylerwatts",
    body: "We went from managing deliveries on spreadsheets to running 200+ orders a day without breaking a sweat. SEFARI is the real deal.",
    img: "https://avatar.vercel.sh/tyler",
  },
  {
    name: "Jasmine C.",
    username: "@jasminecooks",
    body: "The proof of delivery photos have saved us so many disputes. Everything is timestamped and geotagged — no more 'I never got it' claims.",
    img: "https://avatar.vercel.sh/jasmine",
  },
  {
    name: "Kevin M.",
    username: "@kevinm_sd",
    body: "Switching to SEFARI cut our fuel costs by almost 30%. The route optimization actually works — not just marketing fluff.",
    img: "https://avatar.vercel.sh/kevin",
  },
  {
    name: "Sofia L.",
    username: "@sofialeon",
    body: "I manage three locations and used to need three different tools. SEFARI handles everything in one dashboard. Couldn't go back.",
    img: "https://avatar.vercel.sh/sofia",
  },
  {
    name: "Andre B.",
    username: "@andreb_norcal",
    body: "The auto-dispatch is scary good. Orders get picked up faster and my team barely has to touch the system during peak hours.",
    img: "https://avatar.vercel.sh/andre",
  },
  {
    name: "Melissa P.",
    username: "@melissap",
    body: "Setup was way easier than I expected. We were live in the same afternoon. Support was there the whole time.",
    img: "https://avatar.vercel.sh/melissa",
  },
];

const firstRow = reviews.slice(0, Math.ceil(reviews.length / 2));
const secondRow = reviews.slice(Math.ceil(reviews.length / 2));

const ReviewCard = ({
  img,
  name,
  username,
  body,
}: {
  img: string;
  name: string;
  username: string;
  body: string;
}) => {
  return (
    <figure
      className={cn(
        "relative w-72 cursor-pointer overflow-hidden rounded-xl border p-4",
        // light styles
        "border-gray-950/[.1] bg-gray-950/[.01] hover:bg-gray-950/[.05]",
        // dark styles
        "dark:border-gray-50/[.1] dark:bg-gray-50/[.10] dark:hover:bg-gray-50/[.15]",
      )}
    >
      <div className="flex flex-row items-center gap-2">
        <img className="rounded-full" width="32" height="32" alt="" src={img} />
        <div className="flex flex-col">
          <figcaption className="text-sm font-medium dark:text-white">
            {name}
          </figcaption>
          <p className="text-xs font-medium dark:text-white/40">{username}</p>
        </div>
      </div>
      <blockquote className="mt-2 text-sm">{body}</blockquote>
    </figure>
  );
};

const Comments = () => {
  return (
    <div className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden rounded-lg bg-background py-4 sm:py-20 md:py-20 xl:py-20">
      <Marquee pauseOnHover className="[--duration:25s]">
        {firstRow.map((review) => (
          <ReviewCard key={review.username} {...review} />
        ))}
      </Marquee>
      <Marquee reverse pauseOnHover className="[--duration:25s]">
        {secondRow.map((review) => (
          <ReviewCard key={review.username} {...review} />
        ))}
      </Marquee>
      <div className="pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-white dark:from-background"></div>
      <div className="pointer-events-none absolute inset-y-0 right-0 w-1/3 bg-gradient-to-l from-white dark:from-background"></div>
    </div>
  );
};

export { Comments };
