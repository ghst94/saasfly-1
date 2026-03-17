"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import * as Icons from "@saasfly/ui/icons";

interface StepData {
  title: string;
  bullets: string[];
  icon: React.ReactNode;
  link: string;
}

function useInView(threshold = 0.3) {
  const ref = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setIsInView(true);
        }
      },
      { threshold }
    );
    const el = ref.current;
    if (el) observer.observe(el);
    return () => {
      if (el) observer.unobserve(el);
    };
  }, [threshold]);

  return { ref, isInView };
}

function StepItem({
  step,
  index,
  isLast,
}: {
  step: StepData;
  index: number;
  isLast: boolean;
}) {
  const { ref, isInView } = useInView(0.2);

  return (
    <div ref={ref} className="relative flex gap-6 md:gap-10">
      {/* Timeline column */}
      <div className="flex flex-col items-center">
        <div
          className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-700 ${
            isInView
              ? "border-green-500 bg-green-500/20 shadow-[0_0_20px_rgba(34,197,94,0.3)]"
              : "border-neutral-700 bg-neutral-900"
          }`}
        >
          <div
            className={`h-3 w-3 rounded-full transition-all duration-700 ${
              isInView ? "bg-green-500" : "bg-neutral-600"
            }`}
          />
        </div>
        {!isLast && (
          <div className="relative w-[2px] flex-1 bg-neutral-800">
            <div
              className="absolute left-0 top-0 w-full bg-gradient-to-b from-green-500 to-green-500/20 transition-all duration-1000 ease-out"
              style={{ height: isInView ? "100%" : "0%" }}
            />
          </div>
        )}
      </div>

      {/* Content column */}
      <div
        className={`pb-16 md:pb-20 transition-all duration-700 ${
          isInView
            ? "translate-y-0 opacity-100"
            : "translate-y-8 opacity-0"
        }`}
      >
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-800/80 border border-neutral-700/50">
            {step.icon}
          </div>
          <h3 className="text-xl font-semibold text-white md:text-2xl">
            {step.title}
          </h3>
        </div>

        <ul className="mb-5 space-y-3 pl-1">
          {step.bullets.map((bullet, i) => (
            <li key={i} className="flex items-start gap-3">
              <Icons.Check className="mt-0.5 h-5 w-5 shrink-0 text-green-500" />
              <span className="text-neutral-400 text-sm md:text-base leading-relaxed">
                {bullet}
              </span>
            </li>
          ))}
        </ul>

        <Link
          href={step.link}
          className="inline-flex items-center gap-2 text-sm font-medium text-green-500 transition-colors hover:text-green-400"
        >
          Learn more
          <Icons.ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}

export function SolutionStepper({
  dict,
}: {
  dict: Record<string, string> | undefined;
}) {
  const steps: StepData[] = [
    {
      title: dict?.step_1_title ?? "Streamline Operations",
      bullets: [
        dict?.step_1_bullet_1 ?? "Advanced route optimization",
        dict?.step_1_bullet_2 ?? "AI-based automated dispatch and ETAs",
        dict?.step_1_bullet_3 ??
          "Real-time fleet tracking and powerful analytics",
      ],
      icon: <Icons.Rocket className="h-5 w-5 text-green-500" />,
      link: "https://sefari.io/#features",
    },
    {
      title: dict?.step_2_title ?? "Delight Customers",
      bullets: [
        dict?.step_2_bullet_1 ?? "Automatic SMS notifications",
        dict?.step_2_bullet_2 ?? "Accurate ETAs & real-time driver tracking",
        dict?.step_2_bullet_3 ??
          "Proof-of-delivery and feedback collection",
      ],
      icon: <Icons.Heart className="h-5 w-5 text-green-500" />,
      link: "https://sefari.io/#features",
    },
    {
      title: dict?.step_3_title ?? "Integrate Everything",
      bullets: [
        dict?.step_3_bullet_1 ?? "Developer-friendly REST API",
        dict?.step_3_bullet_2 ?? "Webhooks and real-time sockets",
        dict?.step_3_bullet_3 ??
          "Connect OMS, WMS, and ecommerce platforms",
      ],
      icon: <Icons.Blocks className="h-5 w-5 text-green-500" />,
      link: "https://sefari.io/#features",
    },
    {
      title: dict?.step_4_title ?? "Enterprise Grade",
      bullets: [
        dict?.step_4_bullet_1 ?? "SOC2 compliant infrastructure",
        dict?.step_4_bullet_2 ?? "99.9% uptime SLA",
        dict?.step_4_bullet_3 ??
          "Global scale with regional data centers",
      ],
      icon: <Icons.ShieldCheck className="h-5 w-5 text-green-500" />,
      link: "https://sefari.io/#features",
    },
  ];

  return (
    <section className="w-full py-20 md:py-32">
      <div className="container">
        {/* Section header */}
        <div className="mx-auto mb-16 max-w-3xl text-center md:mb-20">
          <h2 className="mb-6 text-3xl font-bold tracking-tight text-white md:text-5xl">
            {dict?.heading ?? "A complete operations platform"}
          </h2>
          <p className="text-base text-neutral-400 md:text-lg leading-relaxed">
            {dict?.sub_heading ??
              "SEFARI's end-to-end route optimization, dispatch, communication, and analytics platform handles logistics complexity so you can focus on your business."}
          </p>
          <Link
            href="https://sefari.io/#features"
            className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-green-500 transition-colors hover:text-green-400"
          >
            {dict?.cta_text ?? "Explore all features"}
            <Icons.ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Stepper */}
        <div className="mx-auto max-w-2xl">
          {steps.map((step, i) => (
            <StepItem
              key={i}
              step={step}
              index={i}
              isLast={i === steps.length - 1}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
