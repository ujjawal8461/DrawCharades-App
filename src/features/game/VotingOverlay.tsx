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
      <div className="absolute inset-0 z-50 bg-slate-50/95 flex flex-col items-center justify-center p-8 text-slate-800 text-center animate-in fade-in duration-500">
        <div className="w-24 h-24 relative mb-8 flex items-center justify-center">
           <div className="w-20 h-20 border-8 border-slate-200 border-t-amber-400 rounded-full animate-spin"></div>
           <Sparkles className="absolute w-8 h-8 text-amber-500 animate-pulse" />
        </div>
        <h2 className="text-3xl md:text-5xl font-black mb-4 tracking-tighter text-slate-800">The other team is choosing...</h2>
        <div className="bg-amber-50 border-2 border-amber-500 px-6 py-2 rounded-full shadow-[2px_2px_0px_0px_#854d0e]">
           <p className="text-amber-800 font-bold uppercase tracking-widest text-sm flex items-center gap-2">
              <Timer className="w-4 h-4 text-amber-600" /> Get ready! {timer}s left
           </p>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 z-50 bg-slate-100/95 flex flex-col items-center justify-center p-6 md:p-12 text-slate-800 animate-in zoom-in-95 duration-300 overflow-y-auto">
      <div className="max-w-4xl w-full">
        <div className="flex flex-col items-center mb-12">
          <div className="sketch-panel px-6 py-3 rounded-2xl mb-6 flex items-center gap-3 bg-white border-3 border-slate-800 shadow-[4px_4px_0px_0px_#1e293b]">
             <Timer className="w-6 h-6 text-amber-500" />
             <span className="text-3xl font-black tabular-nums text-slate-800">{timer}s</span>
          </div>
          <h2 className="text-4xl md:text-6xl font-black mb-4 tracking-tighter text-center text-slate-800">Pick a Movie</h2>
          <p className="text-slate-500 font-bold text-center uppercase tracking-[0.2em] text-xs handwritten">Choose the hardest one for Team {guessingTeam}!</p>
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
                className={`group relative p-6 md:p-10 rounded-3xl font-black text-xl md:text-2xl transition-all duration-200 active:scale-[0.98] flex flex-col items-center gap-4 overflow-hidden border-3 ${
                  hasVoted 
                    ? 'bg-sky-100 border-sky-600 text-sky-950 shadow-[4px_4px_0px_0px_#0369a1]' 
                    : 'bg-white border-slate-850 text-slate-800 hover:border-slate-800 hover:bg-slate-50 shadow-[4px_4px_0px_0px_#1e293b]'
                }`}
              >
                <span className="z-10">
                  {movie}
                </span>
                
                <div className="flex flex-wrap gap-1 justify-center min-h-[24px] z-10">
                  {voterNames.map((name, i) => (
                    <div 
                      key={i} 
                      className={`text-[9px] px-2 py-0.5 rounded-full border uppercase tracking-tighter flex items-center gap-1 font-bold ${
                        hasVoted 
                          ? 'bg-sky-200 border-sky-400 text-sky-900' 
                          : 'bg-slate-100 border-slate-300 text-slate-600'
                      }`}
                    >
                       <div className={`w-1.5 h-1.5 rounded-full ${hasVoted ? 'bg-sky-600' : 'bg-slate-400'}`} />
                       {name}
                    </div>
                  ))}
                </div>

                {hasVoted && (
                  <CheckCircle2 className="absolute top-4 right-4 w-6 h-6 text-sky-600" />
                )}

                <div 
                  className="absolute left-0 bottom-0 h-1 bg-sky-500/20 transition-all duration-500" 
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
