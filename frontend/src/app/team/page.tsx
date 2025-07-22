// app/team/page.tsx
'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Image from 'next/image';
import '@fontsource/press-start-2p'; // 8-bit style font similar to Minecraft



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
    <>
      {/* Background */}
      <div
        className="w-screen h-screen relative bg-cover bg-no-repeat"
        style={{ backgroundImage: "url('/assets/images/BCK.png')" }}
      >
        {/* Center Board */}
        <div className="absolute top-10 left-1/2 transform -translate-x-1/2">
          <Image src="/assets/images/board.png" alt="Board" width={500} height={100} />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <h1 className="text-white text-2xl font-mono text-center">
              WELCOME TO THE BUILDERS HUB!!
            </h1>
          </div>
        </div>
  
        {/* Buttons */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex gap-12">

          
            <button
              onClick={() => router.push('/bid')}
              className="bg-purple-600 text-white px-4 py-2 rounded"
            >
              Go to Bidding
            </button>

              <br>
              </br>
            <button
              onClick={() => router.push('/cart')}
              className="bg-purple-600 text-white px-4 py-2 rounded"
            >
              View cart
            </button>
         
         <br>
         </br>
          <button
            onClick={() => setShowCreateModal(true)}
            className="hover:scale-105 transition-transform"
          >
            <Image
              src="/assets/images/create-team.png"
              alt="Create Team"
              width={150}
              height={60}
            />
          </button>
          <button
            onClick={() => setShowJoinModal(true)}
            className="hover:scale-105 transition-transform"
          >
            <Image
              src="/assets/images/join-team.png"
              alt="Join Team"
              width={150}
              height={60}
            />
          </button>
        </div>
  
        {/* Decorative Mushrooms */}
        <Image
          src="/assets/images/mushroom.png"
          alt="mushroom"
          width={20}
          height={20}
          className="absolute bottom-10 left-10"
        />
        <Image
          src="/assets/images/mushroom.png"
          alt="mushroom"
          width={20}
          height={20}
          className="absolute bottom-10 right-10"
        />
        <Image
          src="/assets/images/mushroom.png"
          alt="mushroom"
          width={20}
          height={20}
          className="absolute top-10 right-10"
        />
        <Image
          src="/assets/images/mushroom.png"
          alt="mushroom"
          width={20}
          height={20}
          className="absolute top-10 left-10"
        />
      </div>
  
      {/* Modals */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-4 rounded shadow-xl space-y-4">
            <h3 className="text-lg font-semibold">Enter Team Name</h3>
            <input
              type="text"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              className="border px-2 py-1 w-full"
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-500"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                className="bg-blue-600 text-white px-3 py-1 rounded"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
  
      {showJoinModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-4 rounded shadow-xl space-y-4">
            <h3 className="text-lg font-semibold">Enter Team Code</h3>
            <input
              type="text"
              value={teamCode}
              onChange={(e) => setTeamCode(e.target.value)}
              className="border px-2 py-1 w-full"
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowJoinModal(false)}
                className="text-gray-500"
              >
                Cancel
              </button>
              <button
                onClick={handleJoin}
                className="bg-green-600 text-white px-3 py-1 rounded"
              >
                Join
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
  

  
  
  
}
