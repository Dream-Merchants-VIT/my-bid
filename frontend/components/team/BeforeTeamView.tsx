'use client';

import Image from 'next/image';

export default function BeforeTeamView({
  onCreateClick,
  onJoinClick,
}: {
  onCreateClick: () => void;
  onJoinClick: () => void;
}) {
  return (
    <div className="relative text-center">
      <h1 className="text-yellow-300 text-3xl minecraft-font bg-[url('/assets/images/team/header-bg.png')] bg-cover bg-center p-10 inline-block rounded shadow-md mb-6">
        WELCOME TO THE BUILDERS HUB!!
      </h1>

      <div className="flex justify-center space-x-12">
        <div className="cursor-pointer" onClick={onCreateClick}>
          <img
            src="/assets/images/team/create-button.png"
            alt="Create Team"
            width={150}
            height={150}
          />
        </div>

        <div className="cursor-pointer" onClick={onJoinClick}>
          <img
            src="/assets/images/team/join-button.png"
            alt="Join Team"
            width={150}
            height={150}
          />
        </div>
      </div>
    </div>
  );
}
