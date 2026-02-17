import type { IntroStepContent } from "@/types/on-board";

interface IntroSlideContentProps {
  step: IntroStepContent;
  imageLoading: "eager" | "lazy";
  imagePriority?: "high" | "low";
}

export default function IntroSlideContent({
  step,
  imageLoading,
  imagePriority,
}: IntroSlideContentProps) {
  return (
    <article className="flex w-full shrink-0 flex-col items-center gap-3">
      <div className="flex w-full px-2 flex-col items-center gap-8">
        <img
          src={step.imageSrc}
          alt={step.title}
          className="size-[240px] object-contain"
          draggable={false}
          decoding="async"
          loading={imageLoading}
          fetchPriority={imagePriority}
        />
        <h2 className="text-center text-title-2 font-bold text-gray-900">{step.title}</h2>
      </div>
      <div className="w-[290px] text-center">
        <p className="text-label-1 font-medium whitespace-pre-line text-gray-700">
          {step.description}
        </p>
      </div>
    </article>
  );
}
