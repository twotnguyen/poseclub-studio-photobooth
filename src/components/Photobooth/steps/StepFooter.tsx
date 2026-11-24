import React from 'react';

interface StepFooterProps {
  back: React.ReactNode;
  next: React.ReactNode;
  center?: React.ReactNode;
}

/** Shared bottom action row so every photobooth step pins its controls to the same spot. */
export const StepFooter: React.FC<StepFooterProps> = ({ back, next, center }) => (
  <div className="relative shrink-0 w-full max-w-2xl md:max-w-5xl mx-auto px-2 sm:px-6 grid grid-cols-[auto_1fr_auto] md:block items-center gap-2 h-14 sm:h-16 [@media(max-height:500px)]:h-11">
    <div className="justify-self-start md:absolute md:top-1/2 md:right-1/2 md:mr-12 lg:mr-[182px] md:-translate-y-1/2">{back}</div>
    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none">{center}</div>
    <div className="justify-self-end md:absolute md:top-1/2 md:left-1/2 md:ml-12 lg:ml-[182px] md:-translate-y-1/2 flex items-center gap-2 sm:gap-3">{next}</div>
  </div>
);

export const StepBrand: React.FC = () => (
  <div className="hidden sm:flex flex-col items-center">
    <span className="text-[8px] sm:text-[9px] font-mono tracking-[0.3em] text-black/50 uppercase">POSECLUB</span>
    <span className="font-script text-base sm:text-2xl text-black -mt-1">studio</span>
    <div className="w-10 sm:w-14 h-[1px] bg-black/20 mt-0.5" />
  </div>
);
