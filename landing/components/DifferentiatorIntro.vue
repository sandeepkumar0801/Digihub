<template>
  <section class="py-24 bg-black relative overflow-hidden border-b border-white/5">
    <!-- Background Elements -->
    <div class="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-slate-900/40 via-black to-black"></div>
    
    <div class="container mx-auto px-6 relative z-10">
      <div class="text-center mb-16">
        <h2 class="text-3xl md:text-5xl font-black text-white mb-6">
          The <span class="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">Invisible</span> Layer
        </h2>
        <p class="text-xl text-gray-400 max-w-3xl mx-auto">
          We aren’t another aggregator trying to control your business. We are the invisible AI layer that makes your existing setup 10x more profitable.
        </p>
      </div>

      <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
        <!-- Feature 1 -->
        <div class="group p-6 bg-slate-900/30 border border-white/5 rounded-2xl hover:bg-slate-800/50 hover:border-blue-500/30 transition-all duration-300">
          <div class="w-12 h-12 bg-blue-900/20 rounded-xl flex items-center justify-center mb-4 text-blue-400 group-hover:scale-110 transition-transform">
            <Icon name="heroicons:squares-2x2" class="w-6 h-6" />
          </div>
          <h3 class="text-lg font-bold text-white mb-2">No "Rip and Replace"</h3>
          <p class="text-sm text-gray-400 leading-relaxed">
            We don't ask you to change your courier, your store, or your bank. We sit quietly on top of your existing stack.
          </p>
        </div>

        <!-- Feature 2 -->
        <div class="group p-6 bg-slate-900/30 border border-white/5 rounded-2xl hover:bg-slate-800/50 hover:border-indigo-500/30 transition-all duration-300">
          <div class="w-12 h-12 bg-indigo-900/20 rounded-xl flex items-center justify-center mb-4 text-indigo-400 group-hover:scale-110 transition-transform">
            <Icon name="heroicons:light-bulb" class="w-6 h-6" />
          </div>
          <h3 class="text-lg font-bold text-white mb-2">Intelligence Day One</h3>
          <p class="text-sm text-gray-400 leading-relaxed">
            Pre-trained on millions of transactions. You don't have to wait for "data collection"—the protection starts now.
          </p>
        </div>

        <!-- Feature 3 -->
        <div class="group p-6 bg-slate-900/30 border border-white/5 rounded-2xl hover:bg-slate-800/50 hover:border-purple-500/30 transition-all duration-300">
          <div class="w-12 h-12 bg-purple-900/20 rounded-xl flex items-center justify-center mb-4 text-purple-400 group-hover:scale-110 transition-transform">
            <Icon name="heroicons:shield-check" class="w-6 h-6" />
          </div>
          <h3 class="text-lg font-bold text-white mb-2">Automated Accountability</h3>
          <p class="text-sm text-gray-400 leading-relaxed">
            While others just "flag" issues, we solve them. Partial payment triggers and automated address healing.
          </p>
        </div>

        <!-- Feature 4 -->
        <div class="group p-6 bg-slate-900/30 border border-white/5 rounded-2xl hover:bg-slate-800/50 hover:border-cyan-500/30 transition-all duration-300">
          <div class="w-12 h-12 bg-cyan-900/20 rounded-xl flex items-center justify-center mb-4 text-cyan-400 group-hover:scale-110 transition-transform">
            <Icon name="heroicons:sparkles" class="w-6 h-6" />
          </div>
          <h3 class="text-lg font-bold text-white mb-2">Invisible AI</h3>
          <p class="text-sm text-gray-400 leading-relaxed">
            We act while others only report. The unseen force that drives efficiency without platform friction.
          </p>
        </div>
      </div>
    </div>
  </section>
</template>
