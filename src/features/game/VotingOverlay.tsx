"use client";

import { useGameStore } from "@/store/useGameStore";
import { socket } from "@/socket/socket";

export const VotingOverlay = () => {
  const { movieOptions, votes, timer, roomCode, players, me, guessingTeam } = useGameStore();

  const handleVote = (movie: string) => {
    socket.emit("vote_movie", { roomCode, movie });
  };

  const isVotingTeam = me?.team !== guessingTeam;

  if (!isVotingTeam) {
    return (
      <div className="absolute inset-0 z-50 bg-indigo-900/90 backdrop-blur-xl flex flex-col items-center justify-center p-8 text-white text-center">
        <div className="w-24 h-24 border-8 border-indigo-500 border-t-white rounded-full animate-spin mb-8"></div>
        <h2 className="text-4xl font-black mb-4">The other team is choosing a movie...</h2>
        <p className="text-indigo-300 font-bold text-xl">Get ready to guess! {timer}s left</p>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 z-50 bg-indigo-600/95 backdrop-blur-lg flex flex-col items-center justify-center p-8 text-white">
      <div className="bg-white/10 p-4 rounded-full mb-4 px-8">
         <span className="text-4xl font-black">{timer}s</span>
      </div>
      <h2 className="text-4xl font-black mb-2">Vote for the Movie!</h2>
      <p className="text-indigo-200 mb-12 font-bold uppercase tracking-widest italic">Pick something hard for them to draw!</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-4xl">
        {movieOptions.map((movie) => {
          const voterIds = votes[movie] || [];
          const voterNames = voterIds.map(id => players.find(p => p.id === id)?.name || "Anon");

          return (
            <button
              key={movie}
              onClick={() => handleVote(movie)}
              className="group relative p-8 bg-white text-indigo-900 rounded-3xl font-black text-2xl hover:bg-indigo-50 transition-all shadow-2xl active:scale-95 flex flex-col items-center gap-2 overflow-hidden"
            >
              <span className="z-10">{movie}</span>
              
              <div className="flex flex-wrap gap-1 justify-center min-h-[20px] z-10">
                {voterNames.map((name, i) => (
                  <span key={i} className="text-[10px] bg-indigo-600 text-white px-2 py-0.5 rounded-full uppercase">
                    {name}
                  </span>
                ))}
              </div>

              <div 
                className="absolute left-0 bottom-0 h-2 bg-indigo-500 transition-all duration-500" 
                style={{ width: `${(voterIds.length / Math.max(1, players.length)) * 100}%` }}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
};
