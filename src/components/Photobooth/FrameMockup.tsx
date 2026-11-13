import React from 'react';

interface FrameMockupProps {
  styleId: number;
}

export const FrameMockup: React.FC<FrameMockupProps> = ({ styleId }) => {
  const photoBg = '#FDEEC8'; // Soft pastel butter yellow from Canva
  const borderCol = '1px solid #111111';

  switch (styleId) {
    case 1:
      // STYLE 1: Two overlapping single-photo polaroids
      return (
        <div className="relative w-[150px] h-[116px] flex items-center justify-center">
          {/* Card behind (top-left) */}
          <div
            className="absolute bg-white shadow-xs flex flex-col items-center justify-between"
            style={{
              width: '68px',
              height: '86px',
              left: '18px',
              top: '4px',
              border: borderCol,
              padding: '6px 6px 8px 6px',
            }}
          >
            <div
              className="w-full aspect-square"
              style={{ backgroundColor: photoBg, border: borderCol }}
            />
            <span className="font-script text-[11px] text-black leading-none mt-1">studio</span>
          </div>

          {/* Card in front (bottom-right) */}
          <div
            className="absolute bg-white shadow-md flex flex-col items-center justify-between z-10"
            style={{
              width: '68px',
              height: '86px',
              left: '58px',
              top: '24px',
              border: borderCol,
              padding: '6px 6px 8px 6px',
            }}
          >
            <div
              className="w-full aspect-square"
              style={{ backgroundColor: photoBg, border: borderCol }}
            />
            <span className="font-script text-[11px] text-black leading-none mt-1">studio</span>
          </div>
        </div>
      );

    case 2:
      // STYLE 2: Two overlapping 2-photo vertical strips (1x2)
      return (
        <div className="relative w-[150px] h-[116px] flex items-center justify-center">
          {/* Strip behind */}
          <div
            className="absolute bg-white shadow-xs flex flex-col items-center justify-between"
            style={{
              width: '54px',
              height: '98px',
              left: '22px',
              top: '2px',
              border: borderCol,
              padding: '5px 5px 6px 5px',
            }}
          >
            <div className="w-full flex flex-col gap-1.5">
              <div className="w-full h-[36px]" style={{ backgroundColor: photoBg, border: borderCol }} />
              <div className="w-full h-[36px]" style={{ backgroundColor: photoBg, border: borderCol }} />
            </div>
            <span className="font-script text-[10px] text-black leading-none mt-1">studio</span>
          </div>

          {/* Strip in front */}
          <div
            className="absolute bg-white shadow-md flex flex-col items-center justify-between z-10"
            style={{
              width: '54px',
              height: '98px',
              left: '68px',
              top: '18px',
              border: borderCol,
              padding: '5px 5px 6px 5px',
            }}
          >
            <div className="w-full flex flex-col gap-1.5">
              <div className="w-full h-[36px]" style={{ backgroundColor: photoBg, border: borderCol }} />
              <div className="w-full h-[36px]" style={{ backgroundColor: photoBg, border: borderCol }} />
            </div>
            <span className="font-script text-[10px] text-black leading-none mt-1">studio</span>
          </div>
        </div>
      );

    case 3:
      // STYLE 3: Two 4-photo (2x2) cards side-by-side tilted
      return (
        <div className="relative w-[160px] h-[116px] flex items-center justify-center">
          {/* Left card (-3deg) */}
          <div
            className="absolute bg-white shadow-xs flex flex-col justify-between -rotate-3"
            style={{
              width: '70px',
              height: '94px',
              left: '10px',
              top: '10px',
              border: borderCol,
              padding: '5px',
            }}
          >
            <div className="grid grid-cols-2 gap-1">
              <div className="h-[32px]" style={{ backgroundColor: photoBg, border: borderCol }} />
              <div className="h-[32px]" style={{ backgroundColor: photoBg, border: borderCol }} />
            </div>
            <div className="text-center py-0.5">
              <span className="font-script text-[9px] text-black leading-none block">studio</span>
            </div>
            <div className="grid grid-cols-2 gap-1">
              <div className="h-[32px]" style={{ backgroundColor: photoBg, border: borderCol }} />
              <div className="h-[32px]" style={{ backgroundColor: photoBg, border: borderCol }} />
            </div>
          </div>

          {/* Right card (+3deg) */}
          <div
            className="absolute bg-white shadow-md flex flex-col justify-between rotate-3 z-10"
            style={{
              width: '70px',
              height: '94px',
              left: '78px',
              top: '12px',
              border: borderCol,
              padding: '5px',
            }}
          >
            <div className="grid grid-cols-2 gap-1">
              <div className="h-[32px]" style={{ backgroundColor: photoBg, border: borderCol }} />
              <div className="h-[32px]" style={{ backgroundColor: photoBg, border: borderCol }} />
            </div>
            <div className="text-center py-0.5">
              <span className="font-script text-[9px] text-black leading-none block">studio</span>
            </div>
            <div className="grid grid-cols-2 gap-1">
              <div className="h-[32px]" style={{ backgroundColor: photoBg, border: borderCol }} />
              <div className="h-[32px]" style={{ backgroundColor: photoBg, border: borderCol }} />
            </div>
          </div>
        </div>
      );

    case 4:
      // STYLE 4: Two overlapping 6-photo landscape cards (3x2)
      return (
        <div className="relative w-[160px] h-[116px] flex items-center justify-center">
          {/* Card behind */}
          <div
            className="absolute bg-white shadow-xs flex flex-col justify-between"
            style={{
              width: '102px',
              height: '68px',
              left: '8px',
              top: '8px',
              border: borderCol,
              padding: '4px',
            }}
          >
            <div className="grid grid-cols-3 gap-1">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-[21px]" style={{ backgroundColor: photoBg, border: borderCol }} />
              ))}
            </div>
            <div className="text-center py-0.5 -my-1">
              <span className="font-script text-[8px] text-black leading-none">studio</span>
            </div>
            <div className="grid grid-cols-3 gap-1">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-[21px]" style={{ backgroundColor: photoBg, border: borderCol }} />
              ))}
            </div>
          </div>

          {/* Card in front */}
          <div
            className="absolute bg-white shadow-md flex flex-col justify-between z-10"
            style={{
              width: '102px',
              height: '68px',
              left: '50px',
              top: '38px',
              border: borderCol,
              padding: '4px',
            }}
          >
            <div className="grid grid-cols-3 gap-1">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-[21px]" style={{ backgroundColor: photoBg, border: borderCol }} />
              ))}
            </div>
            <div className="text-center py-0.5 -my-1">
              <span className="font-script text-[8px] text-black leading-none">studio</span>
            </div>
            <div className="grid grid-cols-3 gap-1">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-[21px]" style={{ backgroundColor: photoBg, border: borderCol }} />
              ))}
            </div>
          </div>
        </div>
      );

    case 5:
      // STYLE 5: Two overlapping 6-photo vertical cards (2x3)
      return (
        <div className="relative w-[150px] h-[116px] flex items-center justify-center">
          {/* Card behind */}
          <div
            className="absolute bg-white shadow-xs flex flex-col justify-between"
            style={{
              width: '62px',
              height: '102px',
              left: '20px',
              top: '2px',
              border: borderCol,
              padding: '4px 4px 6px 4px',
            }}
          >
            <div className="grid grid-cols-2 gap-1">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-[23px]" style={{ backgroundColor: photoBg, border: borderCol }} />
              ))}
            </div>
            <div className="text-center mt-1">
              <span className="font-script text-[9px] text-black leading-none">studio</span>
            </div>
          </div>

          {/* Card in front */}
          <div
            className="absolute bg-white shadow-md flex flex-col justify-between z-10"
            style={{
              width: '62px',
              height: '102px',
              left: '66px',
              top: '18px',
              border: borderCol,
              padding: '4px 4px 6px 4px',
            }}
          >
            <div className="grid grid-cols-2 gap-1">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-[23px]" style={{ backgroundColor: photoBg, border: borderCol }} />
              ))}
            </div>
            <div className="text-center mt-1">
              <span className="font-script text-[9px] text-black leading-none">studio</span>
            </div>
          </div>
        </div>
      );

    case 6:
      // STYLE 6: Two overlapping 9-photo cards (3x3)
      return (
        <div className="relative w-[150px] h-[116px] flex items-center justify-center">
          {/* Card behind */}
          <div
            className="absolute bg-white shadow-xs flex flex-col justify-between"
            style={{
              width: '74px',
              height: '98px',
              left: '16px',
              top: '4px',
              border: borderCol,
              padding: '5px 5px 8px 5px',
            }}
          >
            <div className="grid grid-cols-3 gap-0.5">
              {[...Array(9)].map((_, i) => (
                <div key={i} className="h-[21px]" style={{ backgroundColor: photoBg, border: borderCol }} />
              ))}
            </div>
            <div className="text-center mt-1">
              <span className="font-script text-[9px] text-black leading-none">studio</span>
            </div>
          </div>

          {/* Card in front */}
          <div
            className="absolute bg-white shadow-md flex flex-col justify-between z-10"
            style={{
              width: '74px',
              height: '98px',
              left: '60px',
              top: '22px',
              border: borderCol,
              padding: '5px 5px 8px 5px',
            }}
          >
            <div className="grid grid-cols-3 gap-0.5">
              {[...Array(9)].map((_, i) => (
                <div key={i} className="h-[21px]" style={{ backgroundColor: photoBg, border: borderCol }} />
              ))}
            </div>
            <div className="text-center mt-1">
              <span className="font-script text-[9px] text-black leading-none">studio</span>
            </div>
          </div>
        </div>
      );

    default:
      return null;
  }
};
