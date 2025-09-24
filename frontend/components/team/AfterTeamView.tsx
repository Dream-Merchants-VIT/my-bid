'use client';

export default function AfterTeamView({
  teamInfo,
  onLeave,
  router,
}: {
  teamInfo: any;
  onLeave: () => void;
  router: any;
}) {
  return (
    <div className="flex flex-col items-center space-y-6 text-center bg-[#5e3c1c] p-6 rounded-xl border-4 border-[#3b2a1a] shadow-lg">
      {/* Wooden Hanging Sign */}
      <div className="bg-[#3b2a1a] text-white px-6 py-4 rounded shadow-inner border-4 border-[#a58d6f] relative">
        <div className="absolute -top-8 left-1/2 -translate-x-1/2 flex gap-8">
          <div className="w-2 h-8 bg-yellow-700 rounded-full"></div>
          <div className="w-2 h-8 bg-yellow-700 rounded-full"></div>
        </div>
        <h2 className="text-2xl font-bold font-mono">
          TEAM {teamInfo.name?.toUpperCase()}
        </h2>
        <p className="text-yellow-300 font-semibold mt-1">
          Code: {teamInfo.code}
        </p>
        <ul className="mt-2 space-y-1">
          {teamInfo.members.map((m: any) => (
            <li key={m.id} className="bg-[#a58d6f] text-black px-4 py-1 rounded font-semibold">
              {m.name}
            </li>
          ))}
        </ul>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col space-y-3">
        {teamInfo.ownerId === teamInfo.participantId && (
          <button
            onClick={() => router.push('/bid')}
            className="bg-[#463d36] hover:bg-[#62574e] text-white px-6 py-2 rounded shadow transition-all"
          >
            GO TO BIDDING
          </button>
        )}
        <button
          onClick={() => router.push('/cart')}
          className="bg-[#463d36] hover:bg-[#62574e] text-white px-6 py-2 rounded shadow transition-all"
        >
          VIEW CART
        </button>
        <button
          onClick={onLeave}
          className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded shadow transition-all"
        >
          EXIT TEAM
        </button>
      </div>
    </div>
  );
}
