<template>
  <div class="min-h-screen bg-black text-white selection:bg-green-500 selection:text-white">
    <AppNavigation />

    <!-- Hero Section -->
    <section class="relative pt-32 pb-20 overflow-hidden">
       <!-- Background -->
        <div class="absolute inset-0 bg-black">
            <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-green-900/20 via-black to-black"></div>
             <!-- Cyber Grid -->
             <div class="absolute inset-0 opacity-20" style="background-image: linear-gradient(#10b981 1px, transparent 1px), linear-gradient(90deg, #10b981 1px, transparent 1px); background-size: 50px 50px; transform: perspective(100vh) rotateX(60deg) translateY(-100px) scale(2);"></div>
        </div>

        <div class="container mx-auto px-6 relative z-10">
            <div class="max-w-4xl mx-auto text-center">
                 <div class="inline-flex items-center px-4 py-2 bg-green-500/10 border border-green-500/30 rounded-full text-green-500 text-sm font-semibold mb-8 tracking-widest uppercase">
                  <Icon name="logos:whatsapp-icon" class="w-4 h-4 mr-2" />
                  Automated Recovery
                </div>
                
                <h1 class="text-5xl md:text-7xl font-black mb-8 leading-tight tracking-tight">
                  Turn Returns into<br>
                  <span class="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-600 animate-gradient">Revenue.</span>
                </h1>
                
                <p class="text-2xl text-gray-400 mb-12 leading-relaxed max-w-3xl mx-auto">
                    Automate your NDR (Non-Delivery Report) management. We interact with customers via WhatsApp & IVR to fix addresses, confirm availability, and ensure delivery.
                </p>
                
                <div class="flex flex-col sm:flex-row gap-6 justify-center">
                    <button class="bg-green-600 hover:bg-green-700 text-white px-10 py-5 rounded-xl font-bold text-xl transition-all shadow-[0_0_30px_rgba(16,185,129,0.5)] hover:shadow-[0_0_50px_rgba(16,185,129,0.7)] hover:scale-105 flex items-center">
                    Start Recovering Orders
                    <Icon name="heroicons:arrow-path" class="ml-3 w-6 h-6" />
                    </button>
                </div>
            </div>
        </div>
    </section>

    <!-- Comparison Section -->
    <section class="py-24 bg-black relative border-t border-slate-900">
        <div class="container mx-auto px-6">
            <div class="text-center mb-16">
                <h2 class="text-3xl md:text-5xl font-black text-white mb-6">Revenue Recovery</h2>
                <p class="text-gray-400 max-w-2xl mx-auto">
                    The last mile is where profits disappear. Close the gap between "Out for Delivery" and "Delivered."
                </p>
            </div>

            <div class="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                <!-- The Old Way -->
                <div class="bg-red-950/20 border border-red-900/30 p-8 rounded-3xl opacity-80">
                    <h3 class="text-xl font-bold text-red-500 mb-8 flex items-center">
                        <Icon name="heroicons:x-circle" class="w-6 h-6 mr-3" />
                        The Old Way
                    </h3>
                    <ul class="space-y-6">
                        <li class="flex items-start text-gray-400">
                            <span class="text-red-800 mr-4 font-mono">01</span>
                            <span>Find out about failed delivery 3 days too late.</span>
                        </li>
                        <li class="flex items-start text-gray-400">
                            <span class="text-red-800 mr-4 font-mono">02</span>
                            <span>Team spends hours on manual calls to "confirm" addresses.</span>
                        </li>
                        <li class="flex items-start text-gray-400">
                            <span class="text-red-800 mr-4 font-mono">03</span>
                            <span>Trust courier's word that "Customer was unavailable."</span>
                        </li>
                        <li class="flex items-start text-gray-400">
                            <span class="text-red-800 mr-4 font-mono">04</span>
                            <span>Product sits in a hub until shipped back (RTO).</span>
                        </li>
                    </ul>
                </div>

                <!-- The NDR Suite Way -->
                <div class="bg-green-950/20 border border-green-500/30 p-8 rounded-3xl relative overflow-hidden">
                    <div class="absolute top-0 right-0 bg-green-600 text-white text-xs font-bold px-3 py-1 rounded-bl-xl">AUTOMATED</div>
                    <h3 class="text-xl font-bold text-green-500 mb-8 flex items-center">
                        <Icon name="heroicons:check-circle" class="w-6 h-6 mr-3" />
                        The NDR Suite Way
                    </h3>
                    
                    <div class="mb-8">
                        <RecoveryVisual />
                    </div>

                    <ul class="space-y-6">
                        <li class="flex items-start text-white">
                            <div class="min-w-8">
                                <Icon name="heroicons:bolt" class="w-5 h-5 text-green-500" />
                            </div>
                            <div>
                                <strong class="block text-green-400">Instant Detection</strong>
                                <span class="text-sm text-gray-400">Engine reacts the millisecond a courier logs a failure.</span>
                            </div>
                        </li>
                         <li class="flex items-start text-white">
                            <div class="min-w-8">
                                <Icon name="heroicons:sparkles" class="w-5 h-5 text-green-500" />
                            </div>
                            <div>
                                <strong class="block text-green-400">Automated Healing</strong>
                                <span class="text-sm text-gray-400">AI fixes addresses and intent while you sleep.</span>
                            </div>
                        </li>
                         <li class="flex items-start text-white">
                            <div class="min-w-8">
                                <Icon name="heroicons:shield-check" class="w-5 h-5 text-green-500" />
                            </div>
                            <div>
                                <strong class="block text-green-400">Verification Loop</strong>
                                <span class="text-sm text-gray-400">We check with customer if attempt was actually made.</span>
                            </div>
                        </li>
                         <li class="flex items-start text-white">
                            <div class="min-w-8">
                                <Icon name="heroicons:arrow-path" class="w-5 h-5 text-green-500" />
                            </div>
                            <div>
                                <strong class="block text-green-400">Rapid Re-Attempt</strong>
                                <span class="text-sm text-gray-400">Push updated instructions to get item back on road.</span>
                            </div>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    </section>

    <!-- Feature Suite -->
    <section class="py-24 bg-slate-900/30 relative">
        <div class="container mx-auto px-6">
            <div class="text-center mb-16">
                 <div class="inline-flex items-center px-4 py-2 bg-slate-800 border border-slate-700 rounded-full text-slate-300 text-sm font-semibold mb-6">
                    <Icon name="heroicons:cube" class="w-4 h-4 mr-2" />
                    Feature Suite
                 </div>
                 <h2 class="text-3xl md:text-5xl font-bold text-white mb-6">Intelligent Last-Mile Recovery</h2>
                 <p class="text-gray-400 max-w-2xl mx-auto">Your automated recovery team, working 24/7 to fix delivery hurdles.</p>
            </div>

            <div class="grid md:grid-cols-2 gap-8">
                <!-- Card 1 -->
                <div class="bg-black border border-slate-800 p-8 rounded-3xl hover:border-green-500/50 transition-colors group">
                    <div class="w-14 h-14 bg-green-900/20 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-green-500/20 transition-colors">
                        <Icon name="heroicons:map" class="w-8 h-8 text-green-500" />
                    </div>
                    <h3 class="text-2xl font-bold text-white mb-4">Self-Healing Address</h3>
                    <p class="text-gray-400 leading-relaxed">
                        Identifies and fixes incomplete or incorrect addresses before they reach the courier. 
                        <span class="block mt-4 text-green-400 text-sm font-bold">Reduces "Address Undeliverable" by 30%.</span>
                    </p>
                </div>

                <!-- Card 2 -->
                <div class="bg-black border border-slate-800 p-8 rounded-3xl hover:border-green-500/50 transition-colors group">
                    <div class="w-14 h-14 bg-green-900/20 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-green-500/20 transition-colors">
                        <Icon name="logos:whatsapp-icon" class="w-8 h-8" />
                    </div>
                    <h3 class="text-2xl font-bold text-white mb-4">Active WhatsApp & IVR</h3>
                    <p class="text-gray-400 leading-relaxed">
                        Every COD order is pre-validated through automated workflows. We confirm buyer intent so your courier never makes a "blind" attempt.
                    </p>
                </div>

                <!-- Card 3 -->
                <div class="bg-black border border-slate-800 p-8 rounded-3xl hover:border-green-500/50 transition-colors group">
                    <div class="w-14 h-14 bg-green-900/20 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-green-500/20 transition-colors">
                        <Icon name="heroicons:cpu-chip" class="w-8 h-8 text-green-500" />
                    </div>
                    <h3 class="text-2xl font-bold text-white mb-4">Automated NDR Workflows</h3>
                    <p class="text-gray-400 leading-relaxed">
                        Multi-step engagement engine. Triggers instant sequences to reschedule deliveries or update contact details when a delivery fails.
                    </p>
                </div>

                <!-- Card 4 -->
                <div class="bg-black border border-slate-800 p-8 rounded-3xl hover:border-green-500/50 transition-colors group">
                    <div class="w-14 h-14 bg-green-900/20 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-green-500/20 transition-colors">
                        <Icon name="heroicons:user-group" class="w-8 h-8 text-green-500" />
                    </div>
                    <h3 class="text-2xl font-bold text-white mb-4">Two-Way Validation</h3>
                    <p class="text-gray-400 leading-relaxed">
                        We don't trust "Delivery Failed" tags. We verify with the customer if the courier actually reached the location.
                        <span class="block mt-4 text-white text-sm font-bold">100% Transparency.</span>
                    </p>
                </div>
            </div>
        </div>
    </section>

    <!-- Recovery Calculator -->
    <section class="py-24 bg-slate-900/30 border-t border-slate-800 relative overflow-hidden">
        <div class="absolute inset-0 bg-green-900/5 pointer-events-none"></div>
        <div class="container mx-auto px-6 relative z-10">
            <div class="text-center mb-12">
               <h2 class="text-3xl md:text-5xl font-black text-white mb-6">Estimate Your Recovery</h2>
               <p class="text-gray-400">Turn failed deliveries into profit.</p>
            </div>
            <div class="max-w-4xl mx-auto">
              <ConversionCalculator />
            </div>
        </div>
    </section>

    <!-- FAQ Section -->
    <section class="py-24 bg-black border-t border-slate-900">
        <div class="container mx-auto px-6 max-w-4xl">
            <h2 class="text-3xl md:text-5xl font-black text-white mb-12 text-center">Frequently Asked Questions</h2>
            <div class="space-y-6">
                <div class="bg-slate-900/50 border border-slate-800 rounded-2xl p-8 hover:border-green-500/30 transition-colors">
                    <h3 class="text-xl font-bold text-white mb-3 flex items-center">
                        <Icon name="logos:whatsapp-icon" class="w-6 h-6 mr-3" />
                         How do you contact customers?
                    </h3>
                    <p class="text-gray-400 leading-relaxed">We use an orchestrated mix of WhatsApp (Official API), SMS, and automated IVR calls. We prioritize WhatsApp as it has the highest response rate.</p>
                </div>
                <div class="bg-slate-900/50 border border-slate-800 rounded-2xl p-8 hover:border-green-500/30 transition-colors">
                    <h3 class="text-xl font-bold text-white mb-3 flex items-center">
                        <Icon name="heroicons:trophy" class="w-6 h-6 mr-3 text-green-500" />
                        What is the success rate?
                    </h3>
                    <p class="text-gray-400 leading-relaxed">On average, we recover 30-40% of orders that would have otherwise returned to origin (RTO). For some categories like fashion, it exceeds 50%.</p>
                </div>
                 <div class="bg-slate-900/50 border border-slate-800 rounded-2xl p-8 hover:border-green-500/30 transition-colors">
                    <h3 class="text-xl font-bold text-white mb-3 flex items-center">
                        <Icon name="heroicons:bolt" class="w-6 h-6 mr-3 text-green-500" />
                        Is WhatsApp automated?
                    </h3>
                    <p class="text-gray-400 leading-relaxed">Yes, 100% automated. Our bots handle address corrections, delivery rescheduling, and intent verification instantly 24/7.</p>
                </div>
            </div>
        </div>
    </section>

    <!-- Final CTA -->
    <section class="py-20 bg-green-600 text-white text-center">
        <div class="container mx-auto px-6">
            <h2 class="text-4xl font-black mb-8">Stop Losing Revenue at the Doorstep.</h2>
            <p class="text-xl mb-10 max-w-2xl mx-auto opacity-90">Turn your "Failed Deliveries" into "Delivered Success" with our automated recovery suite.</p>
            <div class="flex flex-col sm:flex-row gap-6 justify-center">
                <button class="bg-black text-white px-10 py-5 rounded-xl font-bold text-xl hover:scale-105 transition-transform shadow-2xl">
                    Recover My Orders
                </button>
            </div>
        </div>
    </section>
  </div>
</template>

<script setup>
</script>
