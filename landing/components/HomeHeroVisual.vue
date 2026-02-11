<template>
  <div class="visual-container w-full h-full min-h-[500px] flex items-center justify-center relative perspective-1000">
    <!-- Ambient Glow (Deep Purple/Blue cyberpunk vibe) -->
    <div class="absolute inset-0 bg-radial-gradient from-indigo-500/20 via-purple-900/10 to-transparent opacity-60 blur-3xl pointer-events-none"></div>

    <!-- Main 3D Composition -->
    <div class="composition-3d relative w-[300px] h-[300px] md:w-[400px] md:h-[400px] flex items-center justify-center preserve-3d animate-float-slow">
        
        <!-- The Glass Sphere -->
        <div class="absolute inset-0 rounded-full bg-gradient-to-br from-white/10 to-transparent border border-white/20 shadow-[0_0_60px_rgba(139,92,246,0.3)] backdrop-blur-sm z-10 overflow-hidden glass-sphere">
            <!-- Inner Sphere Glow -->
            <div class="absolute inset-0 bg-radial-gradient from-amber-500/30 to-transparent opacity-50 mix-blend-overlay"></div>
            <!-- Reflection -->
            <div class="absolute top-4 left-4 w-1/2 h-1/2 bg-gradient-to-br from-white/40 to-transparent rounded-full blur-xl opacity-80"></div>
            
            <!-- Central Element: Glowing AI Core -->
            <div class="absolute inset-0 flex items-center justify-center">
                 <Icon name="heroicons:cpu-chip" class="w-32 h-32 text-cyan-400 drop-shadow-[0_0_20px_rgba(34,211,238,0.8)] animate-pulse-slow" />
            </div>
        </div>

        <!-- Rising Arrow (Wrapping/Behind) -->
        <div class="absolute inset-[-50px] z-0 preserve-3d">
            <!-- Simulated 3D Arrow Path using SVG/CSS -->
            <svg class="w-full h-full absolute animate-spin-slow-reverse opacity-80" viewBox="0 0 400 400">
                <defs>
                    <linearGradient id="grad1" x1="0%" y1="100%" x2="100%" y2="0%">
                        <stop offset="0%" style="stop-color:#22c55e;stop-opacity:0.2" />
                        <stop offset="100%" style="stop-color:#4ade80;stop-opacity:1" />
                    </linearGradient>
                </defs>
                <path d="M 50 350 Q 200 350 350 50" fill="none" stroke="url(#grad1)" stroke-width="12" stroke-linecap="round" class="drop-shadow-[0_0_10px_rgba(74,222,128,0.5)]" />
                <polygon points="350,50 310,60 340,90" fill="#4ade80" class="drop-shadow-[0_0_10px_rgba(74,222,128,0.8)]" />
            </svg>
        </div>

        <!-- Lightning Bolts (Emitting) -->
        <div class="absolute -left-12 top-1/2 w-24 h-24 z-20 animate-pulse-fast">
             <Icon name="heroicons:bolt-solid" class="w-full h-full text-cyan-400 drop-shadow-[0_0_20px_rgba(34,211,238,0.8)] transform -rotate-12" />
        </div>
        <div class="absolute -right-12 bottom-1/4 w-16 h-16 z-20 animate-pulse-fast animation-delay-500">
             <Icon name="heroicons:bolt-solid" class="w-full h-full text-cyan-400 drop-shadow-[0_0_20px_rgba(34,211,238,0.8)] transform rotate-45" />
        </div>

    </div>

    <!-- Floating Cards (Value Props - Enlarged) -->
    
    <!-- Card 1: Instant Settlement -->
    <div class="absolute top-10 right-0 md:-right-8 animate-float z-30 pointer-events-none">
       <div class="glass-card border-amber-500/30 skew-y-3 p-6 rounded-2xl">
           <div class="text-xs text-amber-200/70 mb-2 uppercase tracking-wider font-bold">Cash Flow</div>
           <div class="flex items-center gap-4">
               <div class="w-14 h-14 rounded-full bg-amber-500/20 flex items-center justify-center border border-amber-500/50 box-shadow-amber">
                  <Icon name="heroicons:bolt" class="w-8 h-8 text-amber-400" />
               </div>
               <div>
                  <div class="text-3xl font-black text-white leading-none">T+0</div>
                  <div class="text-sm text-gray-300 font-medium">Settlement</div>
               </div>
           </div>
       </div>
    </div>

    <!-- Card 2: Growth -->
    <div class="absolute bottom-20 left-0 md:-left-8 animate-float animation-delay-2000 z-30 pointer-events-none">
       <div class="glass-card border-green-500/30 -skew-y-3 p-6 rounded-2xl">
           <div class="text-xs text-green-200/70 mb-2 uppercase tracking-wider font-bold">Growth</div>
           <div class="flex items-center gap-4">
               <div class="w-14 h-14 rounded-full bg-green-500/20 flex items-center justify-center border border-green-500/50 box-shadow-green">
                  <Icon name="heroicons:arrow-trending-up" class="w-8 h-8 text-green-400" />
               </div>
               <div>
                  <div class="text-3xl font-black text-white leading-none">+50%</div>
                  <div class="text-sm text-gray-300 font-medium">Scaling Rate</div>
               </div>
           </div>
       </div>
    </div>

    <!-- Card 3: Reduced Cost -->
    <div class="absolute top-20 left-0 md:-left-10 animate-float animation-delay-1000 z-30 pointer-events-none center-mobile">
       <div class="glass-card border-blue-500/30 skew-y-2 p-6 rounded-2xl">
           <div class="text-xs text-blue-200/70 mb-2 uppercase tracking-wider font-bold">Cost</div>
           <div class="flex items-center gap-4">
               <div class="w-14 h-14 rounded-full bg-blue-500/20 flex items-center justify-center border border-blue-500/50 box-shadow-blue">
                  <Icon name="heroicons:banknotes" class="w-8 h-8 text-blue-400" />
               </div>
               <div>
                  <div class="text-3xl font-black text-white leading-none">-20%</div>
                  <div class="text-sm text-gray-300 font-medium">Logistics</div>
               </div>
           </div>
       </div>
    </div>

    <!-- Card 4: Increase Revenue -->
    <div class="absolute bottom-32 right-0 md:-right-10 animate-float animation-delay-3000 z-30 pointer-events-none center-mobile">
       <div class="glass-card border-purple-500/30 -skew-y-2 p-6 rounded-2xl">
           <div class="text-xs text-purple-200/70 mb-2 uppercase tracking-wider font-bold">Revenue</div>
           <div class="flex items-center gap-4">
               <div class="w-14 h-14 rounded-full bg-purple-500/20 flex items-center justify-center border border-purple-500/50 box-shadow-purple">
                  <Icon name="heroicons:chart-bar" class="w-8 h-8 text-purple-400" />
               </div>
               <div>
                  <div class="text-3xl font-black text-white leading-none">High</div>
                  <div class="text-sm text-gray-300 font-medium">Recovery</div>
               </div>
           </div>
       </div>
    </div>

  </div>
</template>

<style scoped>
.perspective-1000 {
  perspective: 1000px;
}

.preserve-3d {
  transform-style: preserve-3d;
}

.glass-sphere {
    border-radius: 50%;
    background: radial-gradient(circle at 30% 30%, rgba(255,255,255,0.1), rgba(255,255,255,0.05) 50%, rgba(0,0,0,0.4) 100%);
    box-shadow: 
        inset -10px -10px 20px rgba(0,0,0,0.5),
        inset 10px 10px 20px rgba(255,255,255,0.2),
        0 0 30px rgba(139, 92, 246, 0.2);
}

.glass-card {
  @apply bg-slate-900/80 backdrop-blur-xl border shadow-2xl transition-all duration-300;
  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.4);
}

.box-shadow-amber { box-shadow: 0 0 15px rgba(245, 158, 11, 0.4); }
.box-shadow-green { box-shadow: 0 0 15px rgba(34, 197, 94, 0.4); }
.box-shadow-blue { box-shadow: 0 0 15px rgba(59, 130, 246, 0.4); }
.box-shadow-purple { box-shadow: 0 0 15px rgba(168, 85, 247, 0.4); }

.center-mobile {
    @media (max-width: 768px) {
        display: none; 
    }
}

.animate-float {
    animation: float 6s ease-in-out infinite;
}

.animate-float-slow {
    animation: float 10s ease-in-out infinite;
}

.animate-pulse-slow {
    animation: pulse 4s ease-in-out infinite;
}

.animate-pulse-fast {
    animation: pulse-fast 0.5s ease-in-out infinite alternate;
}

.animate-spin-slow-reverse {
    animation: spin 20s linear infinite reverse;
}

.animation-delay-500 { animation-delay: 0.5s; }
.animation-delay-2000 { animation-delay: 2s; }

@keyframes float {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-20px); }
}

@keyframes pulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.8; transform: scale(1.05); }
}

@keyframes pulse-fast {
    0% { opacity: 0.6; transform: scale(0.95) rotate(-12deg); }
    100% { opacity: 1; transform: scale(1.05) rotate(-12deg); }
}

@keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
}
</style>
