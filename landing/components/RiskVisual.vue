<template>
  <div class="relative w-full h-64 flex items-end justify-center gap-4 sm:gap-8 px-4">
      <!-- Item 1: Network History -->
      <div class="flex flex-col items-center gap-2 group w-full max-w-[100px]">
          <div class="relative w-full h-32 bg-slate-800 rounded-t-xl overflow-hidden">
              <div class="absolute bottom-0 w-full bg-blue-500 transition-all duration-1000 ease-out group-hover:bg-blue-400" :style="{ height: '85%' }"></div>
              <!-- Pulse -->
              <div class="absolute bottom-0 w-full h-full bg-blue-500/20 animate-pulse"></div>
          </div>
          <div class="text-center">
              <div class="text-xs text-gray-500 font-mono mb-1">NETWORK</div>
              <div class="text-sm font-bold text-white">85/100</div>
          </div>
      </div>

       <!-- Item 2: Address Quality -->
      <div class="flex flex-col items-center gap-2 group w-full max-w-[100px]">
          <div class="relative w-full h-40 bg-slate-800 rounded-t-xl overflow-hidden">
              <div class="absolute bottom-0 w-full bg-purple-500 transition-all duration-1000 ease-out delay-100 group-hover:bg-purple-400" :style="{ height: '42%' }"></div>
               <!-- Pulse -->
              <div class="absolute bottom-0 w-full h-full bg-purple-500/20 animate-pulse" style="animation-delay: 0.2s"></div>
          </div>
          <div class="text-center">
              <div class="text-xs text-gray-400 font-mono mb-1">ADDRESS</div>
              <div class="text-sm font-bold text-white">42/100</div>
          </div>
      </div>

       <!-- Item 3: User Intent -->
      <div class="flex flex-col items-center gap-2 group w-full max-w-[100px]">
          <div class="relative w-full h-48 bg-slate-800 rounded-t-xl overflow-hidden">
               <!-- Gradient Indicator for Risk -->
              <div class="absolute inset-x-0 top-0 h-px bg-red-500/50 z-10"></div>
              
              <div class="absolute bottom-0 w-full bg-red-500 transition-all duration-1000 ease-out delay-200 group-hover:bg-red-400" :style="{ height: '92%' }"></div>
               <!-- Pulse -->
              <div class="absolute bottom-0 w-full h-full bg-red-500/20 animate-pulse" style="animation-delay: 0.4s"></div>
          </div>
          <div class="text-center">
              <div class="text-xs text-gray-400 font-mono mb-1">INTENT</div>
              <div class="text-sm font-bold text-red-500">CRITICAL</div>
          </div>
      </div>
  </div>
</template>
