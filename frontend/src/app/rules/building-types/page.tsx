import Image from 'next/image';

const buildingData = [
  { property: 'Home', bricks: 100, cement: 50, steel: 10, wood: 20, glass: 10, medical: '-', materials: 'Pipes, Wires, Furniture', points: 40 },
  { property: 'Apartment', bricks: 300, cement: 150, steel: 30, wood: 50, glass: 40, medical: '-', materials: 'Pipes, Wires, Furniture', points: 70 },
  { property: 'Hospital', bricks: 300, cement: 200, steel: 50, wood: 40, glass: 50, medical: 30, materials: 'Pipes, Wires', points: 100 },
  { property: 'Mall', bricks: 200, cement: 150, steel: 30, wood: 60, glass: 50, medical: '-', materials: 'Marble/Granite, Tiles', points: 80 },
  { property: 'Industry', bricks: 400, cement: 250, steel: 100, wood: 30, glass: 20, medical: '-', materials: 'Pipes, Wires', points: 120 },
  { property: 'University', bricks: 350, cement: 200, steel: 70, wood: 60, glass: 50, medical: '-', materials: 'Marble/Granite, Furniture', points: 90 },
  { property: 'Offices', bricks: 150, cement: 100, steel: 50, wood: 40, glass: 50, medical: '-', materials: 'Tiles, Furniture', points: 80 },
  { property: 'Vineyard', bricks: 100, cement: 50, steel: 10, wood: 30, glass: '-', medical: '-', materials: 'Pipes, Wires', points: 60 },
  { property: 'Parks', bricks: 50, cement: 20, steel: '-', wood: 40, glass: '-', medical: '-', materials: 'Furniture', points: 30 },
];

export default function BuildingTypes() {
  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center"
      style={{ backgroundImage: "url('/assets/images/background.png')" }}
    >
      {/* Wooden Frame Container */}
      <div
        className="relative w-[70%] max-w-5xl min-h-[80vh] p-4 flex flex-col items-center justify-start rounded-lg shadow-xl"
        style={{
          backgroundImage: "url('/assets/images/main-background.png')",
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
        }}
      >
        <div className="text-center mb-6 w-full max-w-screen-lg px-4">
          <Image src="/building-type.png" alt="Heading" width={600} height={100} className="w-full h-auto object-contain" />
        </div>

        <div className="w-full overflow-x-auto max-w-screen-lg p-4 sm:p-6" style={{ backgroundImage: 'url(/rectangle-background.png)', backgroundSize: 'cover', borderImage: 'url(/building-border.png) 30 stretch' }}>
          <table className="min-w-[900px] text-xs sm:text-sm md:text-sm lg:text-base text-left text-yellow-100 font-mono">
            <thead>
              <tr className="uppercase text-yellow-300">
                <th className="pr-1">Property</th>
                <th className="pr-1">Bricks</th>
                <th className="pr-1">Cement</th>
                <th className="pr-1">Steel</th>
                <th className="pr-1">Wood</th>
                <th className="pr-1">Glass</th>
                <th className="pr-1">Medical <br></br>Supplies</th>
                <th className="pr-1">Specialised <br></br>Materials</th>
                <th>Total <br></br>Points</th>
              </tr>
            </thead>
            <tbody>
              {buildingData.map((item, index) => (
                <tr key={index} className="text-yellow-100">
                  <td className="pr-1 py-1">{item.property}</td>
                  <td className="pr-1 py-1">{item.bricks}</td>
                  <td className="pr-1 py-1">{item.cement}</td>
                  <td className="pr-1 py-1">{item.steel}</td>
                  <td className="pr-1 py-1">{item.wood}</td>
                  <td className="pr-1 py-1">{item.glass}</td>
                  <td className="pr-1 py-1">{item.medical}</td>
                  <td className="pr-1 py-1">{item.materials}</td>
                  <td className="font-bold text-yellow-300">{item.points}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-6">
          <button className="flex items-center bg-yellow-900 text-yellow-100 px-4 py-2 rounded hover:bg-yellow-800 transition-all duration-200">
            <Image src="/rule.png" alt="Back" width={20} height={20} className="mr-2" />
            BACK TO RULES
          </button>
        </div>
      </div>
    </div>
  );
}