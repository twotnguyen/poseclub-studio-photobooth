import React from 'react';

interface FrameMockupProps {
  styleId: number;
}

export const FrameMockup: React.FC<FrameMockupProps> = ({ styleId }) => {
  const photoBg = '#FDEEC8'; // Soft pastel butter yellow photo placeholder
  const frameBg = '#0C0C0C'; // Chic matte black frame background
  const frameBorder = '1px solid rgba(255, 255, 255, 0.15)'; // Clean separation border for black frames
  const slotBorder = '1px solid rgba(0, 0, 0, 0.25)';

  switch (styleId) {
    case 1:
      // STYLE 1: Two overlapping single-photo polaroids
      return (
        <div className="relative w-[150px] h-[116px] flex items-center justify-center">
          {/* Card behind (top-left) */}
          <div
            className="absolute shadow-md flex flex-col items-center justify-between"
            style={{
              width: '68px',
              height: '86px',
              left: '18px',
              top: '4px',
              backgroundColor: frameBg,
              border: frameBorder,
              padding: '6px 6px 8px 6px',
            }}
          >
            <div
              className="w-full aspect-square"
              style={{ backgroundColor: photoBg, border: slotBorder }}
            />
            <span className="font-script text-[11px] text-white leading-none mt-1">studio</span>
          </div>

          {/* Card in front (bottom-right) */}
          <div
            className="absolute shadow-xl flex flex-col items-center justify-between z-10"
            style={{
              width: '68px',
              height: '86px',
              left: '58px',
              top: '24px',
              backgroundColor: frameBg,
              border: frameBorder,
              padding: '6px 6px 8px 6px',
            }}
          >
            <div
              className="w-full aspect-square"
              style={{ backgroundColor: photoBg, border: slotBorder }}
            />
            <span className="font-script text-[11px] text-white leading-none mt-1">studio</span>
          </div>
        </div>
      );

    case 2:
      // STYLE 2: Two overlapping 2-photo vertical strips (1x2)
      return (
        <div className="relative w-[150px] h-[116px] flex items-center justify-center">
          {/* Strip behind */}
          <div
            className="absolute shadow-md flex flex-col items-center justify-between"
            style={{
              width: '54px',
              height: '98px',
              left: '22px',
              top: '2px',
              backgroundColor: frameBg,
              border: frameBorder,
              padding: '5px 5px 6px 5px',
            }}
          >
            <div className="w-full flex flex-col gap-1.5">
              <div className="w-full h-[36px]" style={{ backgroundColor: photoBg, border: slotBorder }} />
              <div className="w-full h-[36px]" style={{ backgroundColor: photoBg, border: slotBorder }} />
            </div>
            <span className="font-script text-[10px] text-white leading-none mt-1">studio</span>
          </div>

          {/* Strip in front */}
          <div
            className="absolute shadow-xl flex flex-col items-center justify-between z-10"
            style={{
              width: '54px',
              height: '98px',
              left: '68px',
              top: '18px',
              backgroundColor: frameBg,
              border: frameBorder,
              padding: '5px 5px 6px 5px',
            }}
          >
            <div className="w-full flex flex-col gap-1.5">
              <div className="w-full h-[36px]" style={{ backgroundColor: photoBg, border: slotBorder }} />
              <div className="w-full h-[36px]" style={{ backgroundColor: photoBg, border: slotBorder }} />
            </div>
            <span className="font-script text-[10px] text-white leading-none mt-1">studio</span>
          </div>
        </div>
      );

    case 3:
      // STYLE 3: Two 4-photo (2x2) cards side-by-side tilted
      return (
        <div className="relative w-[160px] h-[116px] flex items-center justify-center">
          {/* Left card (-3deg) */}
          <div
            className="absolute shadow-md flex flex-col justify-between -rotate-3"
            style={{
              width: '70px',
              height: '94px',
              left: '10px',
              top: '10px',
              backgroundColor: frameBg,
              border: frameBorder,
              padding: '5px',
            }}
          >
            <div className="grid grid-cols-2 gap-1">
              <div className="h-[32px]" style={{ backgroundColor: photoBg, border: slotBorder }} />
              <div className="h-[32px]" style={{ backgroundColor: photoBg, border: slotBorder }} />
            </div>
            <div className="text-center py-0.5">
              <span className="font-script text-[9px] text-white leading-none block">studio</span>
            </div>
            <div className="grid grid-cols-2 gap-1">
              <div className="h-[32px]" style={{ backgroundColor: photoBg, border: slotBorder }} />
              <div className="h-[32px]" style={{ backgroundColor: photoBg, border: slotBorder }} />
            </div>
          </div>

          {/* Right card (+3deg) */}
          <div
            className="absolute shadow-xl flex flex-col justify-between rotate-3 z-10"
            style={{
              width: '70px',
              height: '94px',
              left: '78px',
              top: '12px',
              backgroundColor: frameBg,
              border: frameBorder,
              padding: '5px',
            }}
          >
            <div className="grid grid-cols-2 gap-1">
              <div className="h-[32px]" style={{ backgroundColor: photoBg, border: slotBorder }} />
              <div className="h-[32px]" style={{ backgroundColor: photoBg, border: slotBorder }} />
            </div>
            <div className="text-center py-0.5">
              <span className="font-script text-[9px] text-white leading-none block">studio</span>
            </div>
            <div className="grid grid-cols-2 gap-1">
              <div className="h-[32px]" style={{ backgroundColor: photoBg, border: slotBorder }} />
              <div className="h-[32px]" style={{ backgroundColor: photoBg, border: slotBorder }} />
            </div>
          </div>
        </div>
      );

    case 4:
      // STYLE 4: Two overlapping 4-photo classic vertical strips (1x4)
      return (
        <div className="relative w-[150px] h-[116px] flex items-center justify-center">
          {/* Strip behind */}
          <div
            className="absolute shadow-md flex flex-col justify-between"
            style={{
              width: '46px',
              height: '104px',
              left: '26px',
              top: '2px',
              backgroundColor: frameBg,
              border: frameBorder,
              padding: '4px',
            }}
          >
            <div className="flex flex-col gap-1">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="w-full h-[18px]" style={{ backgroundColor: photoBg, border: slotBorder }} />
              ))}
            </div>
            <span className="font-script text-[7px] text-white text-center leading-none mt-1">studio</span>
          </div>

          {/* Strip in front */}
          <div
            className="absolute shadow-xl flex flex-col justify-between z-10"
            style={{
              width: '46px',
              height: '104px',
              left: '68px',
              top: '12px',
              backgroundColor: frameBg,
              border: frameBorder,
              padding: '4px',
            }}
          >
            <div className="flex flex-col gap-1">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="w-full h-[18px]" style={{ backgroundColor: photoBg, border: slotBorder }} />
              ))}
            </div>
            <span className="font-script text-[7px] text-white text-center leading-none mt-1">studio</span>
          </div>
        </div>
      );

    case 5:
      // STYLE 5: Two overlapping 6-photo vertical cards (2x3)
      return (
        <div className="relative w-[150px] h-[116px] flex items-center justify-center">
          {/* Card behind */}
          <div
            className="absolute shadow-md flex flex-col justify-between"
            style={{
              width: '62px',
              height: '102px',
              left: '20px',
              top: '2px',
              backgroundColor: frameBg,
              border: frameBorder,
              padding: '4px 4px 6px 4px',
            }}
          >
            <div className="grid grid-cols-2 gap-1">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-[23px]" style={{ backgroundColor: photoBg, border: slotBorder }} />
              ))}
            </div>
            <div className="text-center mt-1">
              <span className="font-script text-[9px] text-white leading-none">studio</span>
            </div>
          </div>

          {/* Card in front */}
          <div
            className="absolute shadow-xl flex flex-col justify-between z-10"
            style={{
              width: '62px',
              height: '102px',
              left: '66px',
              top: '18px',
              backgroundColor: frameBg,
              border: frameBorder,
              padding: '4px 4px 6px 4px',
            }}
          >
            <div className="grid grid-cols-2 gap-1">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-[23px]" style={{ backgroundColor: photoBg, border: slotBorder }} />
              ))}
            </div>
            <div className="text-center mt-1">
              <span className="font-script text-[9px] text-white leading-none">studio</span>
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
            className="absolute shadow-md flex flex-col justify-between"
            style={{
              width: '74px',
              height: '98px',
              left: '16px',
              top: '4px',
              backgroundColor: frameBg,
              border: frameBorder,
              padding: '5px 5px 8px 5px',
            }}
          >
            <div className="grid grid-cols-3 gap-0.5">
              {[...Array(9)].map((_, i) => (
                <div key={i} className="h-[21px]" style={{ backgroundColor: photoBg, border: slotBorder }} />
              ))}
            </div>
            <div className="text-center mt-1">
              <span className="font-script text-[9px] text-white leading-none">studio</span>
            </div>
          </div>

          {/* Card in front */}
          <div
            className="absolute shadow-xl flex flex-col justify-between z-10"
            style={{
              width: '74px',
              height: '98px',
              left: '60px',
              top: '22px',
              backgroundColor: frameBg,
              border: frameBorder,
              padding: '5px 5px 8px 5px',
            }}
          >
            <div className="grid grid-cols-3 gap-0.5">
              {[...Array(9)].map((_, i) => (
                <div key={i} className="h-[21px]" style={{ backgroundColor: photoBg, border: slotBorder }} />
              ))}
            </div>
            <div className="text-center mt-1">
              <span className="font-script text-[9px] text-white leading-none">studio</span>
            </div>
          </div>
        </div>
      );

    default:
      return null;
  }
};
