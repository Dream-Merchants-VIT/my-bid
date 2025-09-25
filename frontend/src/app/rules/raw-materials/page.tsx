'use client';

import { useEffect } from 'react';

export default function RawMaterialsPage() {

  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);

    return () => {
      document.head.removeChild(link);
    };
  }, []);

  return (
    <div className="w-full min-h-screen bg-[url('/assets/images/background.png')] bg-no-repeat bg-top bg-cover flex flex-col items-center pt-10 relative font-minecraft overflow-x-hidden mx-auto">

      {/* Ropes */}
      <img src="/assets/images/rope.png" alt="left rope" className="absolute top-0 left-[22%] w-4 h-48 object-cover z-10" />
      <img src="/assets/images/rope.png" alt="right rope" className="absolute top-0 right-[22%] w-4 h-48 object-cover z-10" />

      {/* Top Signboard */}
      <div className="relative mt-6">
        <img src="/assets/images/upper-board.png" alt="Wooden Signboard" className="w-[500px] h-auto z-20" />
        <img src="/assets/images/text-3.png" alt="Title" className="absolute top-1/2 left-1/2 w-[300px] -translate-x-1/2 -translate-y-1/2" />
      </div>

      {/* Main Box */}
      <div className="w-[90%] max-w-[1211px] mt-12 bg-[#e7c590] bg-opacity-90 border-4 border-yellow-700 rounded-xl shadow-xl px-6 py-8 space-y-10">

        {/* CORE Section */}
        <div>
          <div className="flex justify-center mb-4">
            <img src="/assets/images/core.png" alt="CORE" className="w-[200px] h-auto" />
          </div>
          <div className="w-full bg-[#f2e3b3] rounded-xl grid grid-cols-2 gap-4 p-6">
            {[
              "CEMENT — Essential for structural integrity.",
              "STEEL — Used in high-rise buildings & hospitals.",
              "BRICKS — Basic unit of wall construction.",
              "SAND — Fine aggregate for concrete mix.",
              "GRAVEL — Increases concrete strength.",
              "WATER — Needed for mixing and curing.",
            ].map((text, index) => (
              <div key={index} className="bg-[#fff7c2] h-[108px] w-full rounded-xl flex items-center justify-center text-center px-4 font-minecraft text-sm">
                {text}
              </div>
            ))}
          </div>
        </div>

        {/* SPECIALIZED Section */}
        <div>
          <div className="flex justify-center mb-4">
            <img src="/assets/images/text-2.png" alt="SPECIALIZED" className="w-[250px] h-auto" />
          </div>
          <div className="w-full bg-[#f2e3b3] rounded-xl grid grid-cols-2 gap-4 p-6">
            {[
              "Paint — Enhances property appeal (optional for bonus points).",
              "Pipes — Mandatory for plumbing systems in all buildings.",
              "Wires — Essential for electrification.",
              "Solar Panels — Optional for eco-friendly buildings (bonus points).",
            ].map((text, index) => (
              <div key={index} className="bg-[#fff7c2] h-[108px] w-full rounded-xl flex items-center justify-center text-center px-4 font-minecraft text-sm">
                {text}
              </div>
            ))}
          </div>
        </div>

        {/* DECORATIVE Section */}
        <div>
          <div className="flex justify-center mb-4">
            <img src="/assets/images/decorative.png" alt="DECORATIVE" className="w-[250px] h-auto" />
          </div>
          <div className="w-full bg-[#f2e3b3] rounded-xl p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#fff7c2] h-[108px] rounded-xl flex items-center justify-center text-center px-4 font-minecraft text-sm">
                Marble/Granite — Luxury enhancement for malls, universities, or offices.
              </div>
              <div className="bg-[#fff7c2] h-[108px] rounded-xl flex items-center justify-center text-center px-4 font-minecraft text-sm">
                Tiles — Used for flooring and walls in modern constructions.
              </div>
            </div>
            <div className="flex justify-center">
              <div className="bg-[#fff7c2] h-[108px] w-1/2 max-w-[calc(50%-8px)] rounded-xl flex items-center justify-center text-center px-4 font-minecraft text-sm">
                Furniture — Adds livability and utility to homes, offices, and apartments.
              </div>
            </div>
          </div>
        </div>

        {/* BONUS Section */}
        <div>
          <div className="flex justify-center mb-4">
            <img src="/assets/images/bonus.png" alt="BONUS" className="w-[200px] h-auto" />
          </div>
          <div className="w-full bg-[#f2e3b3] rounded-xl grid grid-cols-2 gap-4 p-6">
            <div className="bg-[#fff7c2] h-[108px] w-full rounded-xl flex items-center justify-center text-center px-4 font-minecraft text-sm">
              Blueprints — Allow construction of advanced properties with additional points.
            </div>
            <div className="bg-[#fff7c2] h-[108px] w-full rounded-xl flex items-center justify-center text-center px-4 font-minecraft text-sm">
              Labour Tokens — Represent skilled workers for large projects, offering extra points.
            </div>
          </div>
        </div>

        {/* Back Button */}
        <div className="mt-6 flex justify-center">
          <button className="p-0 border-none bg-transparent">
            <img src="/assets/images/rules.png" alt="Back to Rules" className="w-48 h-auto" />
          </button>
        </div>

      </div>
    </div>
  );
}
