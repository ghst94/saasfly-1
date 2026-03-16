import Link from "next/link";
import Image from "next/image";
import { getDictionary } from "~/lib/get-dictionary";

import { Comments } from "~/components/comments";
import { FeaturesGrid } from "~/components/features-grid";
import { RightsideMarketing } from "~/components/rightside-marketing";

import { AnimatedTooltip } from "@saasfly/ui/animated-tooltip";
import { BackgroundLines } from "@saasfly/ui/background-lines";
import { Button } from "@saasfly/ui/button";
import { ColourfulText } from "@saasfly/ui/colorful-text";
import * as Icons from "@saasfly/ui/icons";

import type { Locale } from "~/config/i18n-config";
import {VideoScroll} from "~/components/video-scroll";

const people = [
  {
    id: 1,
    name: "Sarah",
    designation: "Business Owner",
    image: "https://avatars.githubusercontent.com/u/16015833",
    link: "https://console.sefari.io",
  },
  {
    id: 2,
    name: "James",
    designation: "Operations Manager",
    image: "https://avatars.githubusercontent.com/u/20166026",
    link: "https://console.sefari.io",
  },
  {
    id: 3,
    name: "Priya",
    designation: "Store Director",
    image: "https://avatars.githubusercontent.com/u/59442788",
  },
];

export default async function IndexPage({
  params: { lang },
}: {
  params: {
    lang: Locale;
  };
}) {
  const dict = await getDictionary(lang);

  return (
    <>
      <section className="container">
        <div className="grid grid-cols-1 gap-10 xl:grid-cols-2">
          <div className="flex flex-col items-start h-full">
            <BackgroundLines className="h-full">
              <div className="flex flex-col pt-4 md:pt-36 lg:pt-36 xl:pt-36">
                <div className="mt-20">
                  <div
                    className="mb-6 max-w-4xl text-left text-4xl font-semibold dark:text-zinc-100 md:text-5xl xl:text-5xl md:leading-[4rem] xl:leading-[4rem]">
                    {dict.marketing.title || "Operations simplified. Customers delighted. With "}
                    <ColourfulText text="SEFARI"/>
                  </div>
                </div>

                <div className="mt-4">
                  <span className="text-neutral-500 dark:text-neutral-400 sm:text-lg">
                    {dict.marketing.sub_title || "The modular operating system for modern commerce. Plan, dispatch, track, and scale — all from one console."}
                  </span>
                </div>

                <div
                  className="mb-4 mt-6 flex w-full flex-col justify-center space-y-4 sm:flex-row sm:justify-start sm:space-x-8 sm:space-y-0 z-10">
                  <Link href="https://console.sefari.io" target="_blank">
                    <Button
                      className="bg-green-700 hover:bg-green-600 text-white rounded-full text-lg px-6 h-12 font-medium">
                      {dict.marketing.get_started}
                      <Icons.ArrowRight className="h-5 w-5"/>
                    </Button>
                  </Link>

                  <Link href="/#features">
                    <Button variant="outline" className="rounded-full text-lg px-6 h-12 font-medium">
                      {dict.marketing.view_on_github}
                      <Icons.ArrowRight className="h-5 w-5"/>
                    </Button>
                  </Link>
                </div>

                <div className="flex xl:flex-row flex-col items-center justify-start mt-4 w-full">
                  <div className="flex">
                    <AnimatedTooltip items={people}/>
                  </div>
                  <div className="flex flex-col items-center justify-start ml-8">
                    <div className="w-[340px]">
                      <span className="font-semibold">5,000+ </span>
                      <span className="text-neutral-500 dark:text-neutral-400">{dict.marketing.contributors.contributors_desc}</span>
                    </div>
                    <div className="w-[340px]">
                      <span
                        className="text-neutral-500 dark:text-neutral-400">{dict.marketing.contributors.developers_first}</span>
                      <ColourfulText text="250M+"/>
                      <span
                        className="text-neutral-500 dark:text-neutral-400">{dict.marketing.contributors.developers_second}</span>
                    </div>
                  </div>
                </div>
              </div>
            </BackgroundLines>
          </div>

          <div className="hidden h-full w-full xl:block bg-background">
            <div className="flex flex-col pt-44">
              <RightsideMarketing dict={dict.marketing.right_side}/>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="container mt-8 md:mt-[-180px] xl:mt-[-180px]">
        <FeaturesGrid dict={dict.marketing.features_grid}/>
      </section>

      <section className="container pt-24">
        <div className="flex flex-col justify-center items-center pt-10">
          <div className="text-lg text-neutral-500 dark:text-neutral-400">{dict.marketing.sponsor.title}</div>
          <div className="mt-8">
            <Link href="https://console.sefari.io" target="_blank">
              <Button className="bg-green-700 hover:bg-green-600 text-white rounded-full text-lg px-8 h-12 font-medium">
                {dict.marketing.sponsor.donate}
                <Icons.ArrowRight className="h-5 w-5 ml-2"/>
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="container pt-8">
        <VideoScroll dict={dict.marketing.video}/>
      </section>

      <section className="w-full px-8 pt-10 sm:px-0 sm:pt-24 md:px-0 md:pt-24 xl:px-0 xl:pt-24">
        <div className="flex h-full w-full flex-col items-center pb-[100px] pt-10">
          <div>
            <h1 className="mb-6 text-center text-3xl font-bold dark:text-zinc-100 md:text-5xl">
              {dict.marketing.people_comment.title}
            </h1>
          </div>
          <div className="mb-6 text-lg text-neutral-500 dark:text-neutral-400">
            {dict.marketing.people_comment.desc}
          </div>

          <div className="w-full overflow-x-hidden">
            <Comments/>
          </div>
        </div>
      </section>
    </>
  );
}
