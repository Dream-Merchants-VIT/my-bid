'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import BeforeTeamView from "../../../components/team/BeforeTeamView"
import AfterTeamView from "../../../components/team/AfterTeamView"

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

  useEffect(() => {
    fetchTeam();
  }, []);

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
      style={{ backgroundImage: "url('/assets/images/background.png')" }}
    >
      <div className="p-8 border-8 border-[transparent] bg-[url('/assets/border.png')] bg-repeat rounded-xl shadow-xl">
        {teamInfo ? (
          <AfterTeamView
            teamInfo={teamInfo}
            onLeave={handleLeave}
            router={router}
          />
        ) : (
          <BeforeTeamView
            onCreateClick={() => setShowCreateModal(true)}
            onJoinClick={() => setShowJoinModal(true)}
          />
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
              className="border px-2 py-1 w-full text-black"
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
              className="border px-2 py-1 w-full text-black"
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
