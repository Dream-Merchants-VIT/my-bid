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
        backgroundImage: `url('/assets/images/team-bg.png')`,
      }}
    >
      {/* Border Frame */}
      <div className="p-8 border-8 border-[transparent] bg-[url('/assets/border.png')] bg-repeat rounded-xl shadow-xl">
        {teamInfo ? (
          <div className="space-y-4 bg-white bg-opacity-90 p-6 rounded-xl">
            <h2 className="text-xl font-bold">Team: {teamInfo.name}</h2>
            <p className="text-sm">Team Code: {teamInfo.code}</p>
            <p className="font-medium">Members:</p>
            <ul className="list-disc list-inside">
              {teamInfo.members.map((m: any) => (
                <li key={m.id}>{m.name}</li>
              ))}
            </ul>

            <button
              onClick={() => router.push('/bid')}
              className="bg-purple-600 text-white px-4 py-2 rounded"
            >
              Go to Bidding
            </button>
            <br />
            <button
              onClick={() => router.push('/cart')}
              className="bg-purple-600 text-white px-4 py-2 rounded"
            >
              View Cart
            </button>
            <br />
            <button
              onClick={handleLeave}
              className="bg-red-500 text-white px-4 py-1 rounded"
            >
              Exit Team
            </button>
          </div>
        ) : (
          <div className="relative text-center">
            <h1 className="text-yellow-300 text-3xl font-mono bg-black p-4 inline-block rounded shadow-md mb-6">
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

            {/* Decorative Elements */}
            {/* <Image src="/assets/mushroom.png" alt="mushroom" width={24} height={24} className="absolute bottom-6 left-6" />
            <Image src="/assets/mushroom.png" alt="mushroom" width={24} height={24} className="absolute bottom-6 right-6" />
            <Image src="/assets/flower.png" alt="flower" width={24} height={24} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" /> */}
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-10">
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-10">
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
