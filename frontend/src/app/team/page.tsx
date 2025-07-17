// app/team/page.tsx
'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

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
    <div className="p-6 space-y-6">
      {teamInfo ? (
        <div className="space-y-4">
          <div className="space-y-2">
            <h2 className="text-xl font-bold">Team: {teamInfo.name}</h2>
            <p className="text-sm">Team Code: {teamInfo.code}</p>
            <p className="font-medium">Members:</p>
            <ul className="list-disc list-inside">
              {teamInfo.members.map((m: any) => (
                <li key={m.id}>{m.name}</li>
              ))}
            </ul>
          </div>

          
            <button
              onClick={() => router.push('/bid')}
              className="bg-purple-600 text-white px-4 py-2 rounded"
            >
              Go to Bidding
            </button>
         
         <br>
         </br>
          <button
            onClick={handleLeave}
            className="bg-red-500 text-white px-4 py-1 rounded"
          >
            Exit Team
          </button>
        </div>
      ) : (
        <div className="space-x-4">
          <button onClick={() => setShowCreateModal(true)} className="bg-blue-500 text-white px-4 py-2 rounded">Create Team</button>
          <button onClick={() => setShowJoinModal(true)} className="bg-green-500 text-white px-4 py-2 rounded">Join Team</button>
        </div>
      )}

      {/* Modals remain unchanged */}
      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-4 rounded shadow-xl space-y-4">
            <h3 className="text-lg font-semibold">Enter Team Name</h3>
            <input type="text" value={teamName} onChange={e => setTeamName(e.target.value)} className="border px-2 py-1 w-full" />
            <div className="flex justify-end space-x-2">
              <button onClick={() => setShowCreateModal(false)} className="text-gray-500">Cancel</button>
              <button onClick={handleCreate} className="bg-blue-600 text-white px-3 py-1 rounded">Confirm</button>
            </div>
          </div>
        </div>
      )}

      {/* Join Modal */}
      {showJoinModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-4 rounded shadow-xl space-y-4">
            <h3 className="text-lg font-semibold">Enter Team Code</h3>
            <input type="text" value={teamCode} onChange={e => setTeamCode(e.target.value)} className="border px-2 py-1 w-full" />
            <div className="flex justify-end space-x-2">
              <button onClick={() => setShowJoinModal(false)} className="text-gray-500">Cancel</button>
              <button onClick={handleJoin} className="bg-green-600 text-white px-3 py-1 rounded">Join</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

}
