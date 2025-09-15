'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Image from 'next/image';

export default function TeamPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [teamName, setTeamName] = useState('');
  const [teamCode, setTeamCode] = useState('');
  const [teamInfo, setTeamInfo] = useState<any>(null);

  const fetchTeam = async () => {
    const res = await axios.get('/api/team');
    setTeamInfo(res.data);
  };

  const handleCreate = async () => {
    await axios.post('/api/team/create', { name: teamName });
    setShowCreateModal(false);
    fetchTeam();
  };

  const handleJoin = async () => {
    await axios.post('/api/team/join', { code: teamCode });
    setShowJoinModal(false);
    fetchTeam();
  };

  const handleLeave = async () => {
    await axios.post('/api/team/leave');
    setTeamInfo(null);
  };

  return (
    <div
  className="min-h-screen flex items-center justify-center relative bg-repeat"
  style={{
    backgroundImage: "url('/assets/images/team-bg.png')",
  }}
>
  <div className="p-8 border-8 border-[transparent] bg-[url('/assets/border.png')] bg-repeat rounded-xl shadow-xl">
    {teamInfo ? (
      <div className="flex flex-col items-center space-y-6 text-center bg-[#5e3c1c] p-6 rounded-xl border-4 border-[#3b2a1a] shadow-lg">
        {/* Wooden Hanging Sign */}
        <div className="bg-[#3b2a1a] text-white px-6 py-4 rounded shadow-inner border-4 border-[#a58d6f] relative">
          <div className="absolute -top-8 left-1/2 -translate-x-1/2 flex gap-8">
            <div className="w-2 h-8 bg-yellow-700 rounded-full"></div>
            <div className="w-2 h-8 bg-yellow-700 rounded-full"></div>
          </div>
          <h2 className="text-2xl font-bold font-mono">TEAM {teamInfo.name?.toUpperCase()}</h2>
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
          <button
            onClick={() => router.push('/bid')}
            className="bg-[#463d36] hover:bg-[#62574e] text-white px-6 py-2 rounded shadow transition-all"
          >
            GO TO BIDDING
          </button>
          <button
            onClick={() => router.push('/cart')}
            className="bg-[#463d36] hover:bg-[#62574e] text-white px-6 py-2 rounded shadow transition-all"
          >
            VIEW CART
          </button>
          <button
            onClick={handleLeave}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded shadow transition-all"
          >
            EXIT TEAM
          </button>
        </div>
      </div>
    ) : (
      <div className="relative text-center">
        <h1 className="text-yellow-300 text-3xl minecraft-font bg-[url('/assets/images/team/header-bg.png')] bg-cover bg-center p-10 inline-block rounded shadow-md mb-6">
  WELCOME TO THE BUILDERS HUB!!
</h1>


        <div className="flex justify-center space-x-12">
          <div className="cursor-pointer" onClick={() => setShowCreateModal(true)}>
            <Image
              src="/assets/images/create-button.png"
              alt="Create Team"
              width={100}
              height={100}
            />
          </div>

          <div className="cursor-pointer" onClick={() => setShowJoinModal(true)}>
            <Image
              src="/assets/images/join-button.png"
              alt="Join Team"
              width={100}
              height={100}
            />
          </div>
        </div>
      </div>
    )}
  </div>

  {/* Create Modal */}
  {showCreateModal && (
    <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-10">
      <div className="bg-white p-4 rounded shadow-xl space-y-4 z-20">
        <h3 className="text-lg font-semibold">Enter Team Name</h3>
        <input
          type="text"
          value={teamName}
          onChange={(e) => setTeamName(e.target.value)}
          className="border px-2 py-1 w-full"
        />
        <div className="flex justify-end space-x-2">
          <button onClick={() => setShowCreateModal(false)} className="text-gray-500">
            Cancel
          </button>
          <button onClick={handleCreate} className="bg-blue-600 text-white px-3 py-1 rounded">
            Confirm
          </button>
        </div>
      </div>
    </div>
  )}

  {/* Join Modal */}
  {showJoinModal && (
    <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-10">
      <div className="bg-white p-4 rounded shadow-xl space-y-4 z-20">
        <h3 className="text-lg font-semibold">Enter Team Code</h3>
        <input
          type="text"
          value={teamCode}
          onChange={(e) => setTeamCode(e.target.value)}
          className="border px-2 py-1 w-full"
        />
        <div className="flex justify-end space-x-2">
          <button onClick={() => setShowJoinModal(false)} className="text-gray-500">
            Cancel
          </button>
          <button onClick={handleJoin} className="bg-green-600 text-white px-3 py-1 rounded">
            Join
          </button>
        </div>
      </div>
    </div>
  )}
</div>

  );
}