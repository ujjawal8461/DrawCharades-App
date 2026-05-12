"use client";

import { useGameStore } from "@/store/useGameStore";
import { socket } from "@/socket/socket";
import { Sparkles, Timer, CheckCircle2 } from "lucide-react";

export const VotingOverlay = () => {
  const { movieOptions, votes, timer, roomCode, players, me, guessingTeam } = useGameStore();

  const handleVote = (movie: string) => {
    socket.emit("vote_movie", { roomCode, movie });
  };

  const isVotingTeam = me?.team !== guessingTeam;

  if (!isVotingTeam) {
    return (
      <div className="absolute inset-0 z-50 bg-slate-950/90 backdrop-blur-xl flex flex-col items-center justify-center p-8 text-white text-center animate-in fade-in duration-500">
        <div className="w-24 h-24 relative mb-8">
           <div className="absolute inset-0 border-8 border-white/5 rounded-full"></div>
           <div className="absolute inset-0 border-8 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
           <Sparkles className="absolute inset-0 m-auto w-8 h-8 text-indigo-400 animate-pulse" />
        </div>
        <h2 className="text-3xl md:text-5xl font-black mb-4 tracking-tighter">The other team is choosing...</h2>
        <div className="bg-indigo-600/20 border border-indigo-500/30 px-6 py-2 rounded-full">
           <p className="text-indigo-400 font-bold uppercase tracking-widest text-sm flex items-center gap-2">
              <Timer className="w-4 h-4" /> Get ready! {timer}s left
           </p>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 z-50 bg-slate-950/80 backdrop-blur-xl flex flex-col items-center justify-center p-6 md:p-12 text-white animate-in zoom-in-95 duration-300">
      <div className="max-w-4xl w-full">
        <div className="flex flex-col items-center mb-12">
          <div className="glass-panel px-6 py-3 rounded-2xl mb-6 flex items-center gap-3 border-indigo-500/30 shadow-xl shadow-indigo-500/10">
             <Timer className="w-6 h-6 text-indigo-400" />
             <span className="text-3xl font-black tabular-nums">{timer}s</span>
          </div>
          <h2 className="text-4xl md:text-6xl font-black mb-4 tracking-tighter text-center">Pick a Movie</h2>
          <p className="text-slate-400 font-medium text-center uppercase tracking-[0.2em] text-xs">Choose the hardest one for Team {guessingTeam}!</p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
          {movieOptions.map((movie) => {
            const voterIds = votes[movie] || [];
            const voterNames = voterIds.map(id => players.find(p => p.id === id)?.name || "Anon");
            const hasVoted = voterIds.includes(me?.id || "");

            return (
              <button
                key={movie}
                onClick={() => handleVote(movie)}
                className={`group relative p-6 md:p-10 rounded-3xl font-black text-xl md:text-2xl transition-all duration-300 active:scale-[0.98] flex flex-col items-center gap-4 overflow-hidden border-2 ${
                  hasVoted 
                    ? 'bg-indigo-600 border-indigo-400 shadow-2xl shadow-indigo-500/40' 
                    : 'bg-slate-900 border-white/5 hover:border-white/10 hover:bg-slate-800 shadow-xl'
                }`}
              >
                <span className={`z-10 transition-colors ${hasVoted ? 'text-white' : 'text-slate-100 group-hover:text-white'}`}>
                  {movie}
                </span>
                
                <div className="flex flex-wrap gap-1 justify-center min-h-[24px] z-10">
                  {voterNames.map((name, i) => (
                    <div 
                      key={i} 
                      className={`text-[9px] px-2 py-0.5 rounded-full uppercase tracking-tighter flex items-center gap-1 ${
                        hasVoted ? 'bg-white/20 text-white' : 'bg-indigo-500/20 text-indigo-300'
                      }`}
                    >
                       <div className={`w-1.5 h-1.5 rounded-full ${hasVoted ? 'bg-white' : 'bg-indigo-400'}`} />
                       {name}
                    </div>
                  ))}
                </div>

                {hasVoted && (
                  <CheckCircle2 className="absolute top-4 right-4 w-6 h-6 text-white/40" />
                )}

                <div 
                  className="absolute left-0 bottom-0 h-1 bg-white/20 transition-all duration-500" 
                  style={{ width: `${(voterIds.length / Math.max(1, players.filter(p => p.team !== guessingTeam).length)) * 100}%` }}
                />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
