<template>
  <div class="min-h-screen bg-slate-900 text-white selection:bg-yellow-500 selection:text-black">
    <AppNavigation />

    <!-- Hero Section -->
    <section class="relative pt-32 pb-20 overflow-hidden">
        <!-- Background -->
        <div class="absolute inset-0 bg-slate-900">
            <div class="absolute inset-0 bg-gradient-to-br from-yellow-900/20 via-slate-900 to-slate-900"></div>
             <div class="absolute top-0 right-0 w-1/2 h-1/2 bg-gradient-to-bl from-orange-500/10 to-transparent blur-3xl rounded-full"></div>
             <!-- Grid Pattern -->
             <div class="absolute inset-0 opacity-10" style="background-image: radial-gradient(#fbbf24 1px, transparent 1px); background-size: 30px 30px;"></div>
        </div>

        <div class="container mx-auto px-6 relative z-10">
            <div class="grid lg:grid-cols-2 gap-16 items-center">
                 <!-- Text -->
                 <div>
                    <div class="inline-flex items-center px-4 py-2 bg-yellow-500/10 border border-yellow-500/20 rounded-full text-yellow-400 text-sm font-semibold mb-6">
                      <Icon name="heroicons:document-check" class="w-4 h-4 mr-2" />
                      Finance & Compliance
                    </div>
                    <h1 class="text-5xl md:text-7xl font-black mb-8 leading-tight">
                      Seamless <br>
                      <span class="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">Accounting Integration</span>
                    </h1>
                     <p class="text-xl text-gray-300 mb-10 leading-relaxed">
                      Connect your logistics directly to Zoho Books. Automate sales orders, invoices, and stay 100% compliant with government E-Way Bill mandates.
                    </p>
                    <div class="flex flex-col sm:flex-row gap-4">
                        <button class="bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-400 hover:to-orange-500 text-black px-8 py-4 rounded-xl font-bold text-lg transition-all shadow-lg shadow-orange-500/25 flex items-center justify-center">
                        Connect Zoho
                        <Icon name="heroicons:link" class="ml-2 w-5 h-5" />
                        </button>
                    </div>
                 </div>

                 <!-- Visualization -->
                 <div class="relative">
                    <!-- Flow Diagram -->
                     <div class="relative bg-slate-800/80 backdrop-blur-xl rounded-2xl p-8 border border-white/10 shadow-2xl">
                        <!-- Step 1: Order -->
                        <div class="flex items-center gap-4 mb-8 relative z-10">
                            <div class="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                                <Icon name="heroicons:shopping-cart" class="w-6 h-6 text-white" />
                            </div>
                            <div class="flex-1 bg-slate-700/50 p-3 rounded-lg border border-slate-600">
                                <div class="font-bold text-sm">New Order #1024</div>
                                <div class="text-xs text-gray-400">Received on Store</div>
                            </div>
                        </div>

                        <!-- Connector Line -->
                         <div class="absolute left-14 top-16 w-0.5 h-12 bg-gradient-to-b from-blue-500 to-yellow-500"></div>

                        <!-- Step 2: Zoho Sync -->
                        <div class="flex items-center gap-4 mb-8 relative z-10">
                             <div class="w-12 h-12 bg-yellow-500 rounded-xl flex items-center justify-center shadow-lg shadow-yellow-500/20">
                                <Icon name="heroicons:arrows-right-left" class="w-6 h-6 text-black" />
                            </div>
                             <div class="flex-1 bg-yellow-900/20 p-3 rounded-lg border border-yellow-500/30">
                                <div class="font-bold text-sm text-yellow-400">Synced to Zoho Books</div>
                                <div class="text-xs text-yellow-500/70">Sales Order & Invoice Created</div>
                            </div>
                        </div>

                        <!-- Connector Line -->
                        <div class="absolute left-14 top-40 w-0.5 h-12 bg-gradient-to-b from-yellow-500 to-green-500"></div>

                        <!-- Step 3: Compliance -->
                        <div class="flex items-center gap-4 relative z-10">
                             <div class="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/20">
                                <Icon name="heroicons:shield-check" class="w-6 h-6 text-white" />
                            </div>
                             <div class="flex-1 bg-green-900/20 p-3 rounded-lg border border-green-500/30">
                                <div class="font-bold text-sm text-green-400">E-Way Bill Generated</div>
                                <div class="text-xs text-green-500/70">Govt Portal Verified</div>
                            </div>
                        </div>
                     </div>
                 </div>
            </div>
        </div>
    </section>

    <!-- Detailed Features -->
    <section class="py-20 bg-slate-800/50">
        <div class="container mx-auto px-6">
            <div class="grid md:grid-cols-2 gap-12">
                <!-- Zoho Books Integration -->
                <div>
                     <h3 class="text-3xl font-bold mb-8 flex items-center">
                        <span class="bg-yellow-500 w-2 h-8 mr-4 rounded-full"></span>
                        Zoho Books Integration
                     </h3>
                     <div class="space-y-6">
                         <div class="bg-slate-800 p-6 rounded-2xl border border-slate-700 hover:border-yellow-500/50 transition-colors">
                             <h4 class="text-xl font-bold text-white mb-2">Auto-Sync Architecture</h4>
                             <p class="text-gray-400">Orders flow directly into Zoho as Sales Orders or Invoices instantly based on your configuration.</p>
                         </div>
                         <div class="bg-slate-800 p-6 rounded-2xl border border-slate-700 hover:border-yellow-500/50 transition-colors">
                             <h4 class="text-xl font-bold text-white mb-2">Customer Ledger Sync</h4>
                             <p class="text-gray-400">Creates new customers or updates existing ledgers automatically, keeping your accounts pristine.</p>
                         </div>
                         <div class="bg-slate-800 p-6 rounded-2xl border border-slate-700 hover:border-yellow-500/50 transition-colors">
                             <h4 class="text-xl font-bold text-white mb-2">Secure OAuth 2.0</h4>
                             <p class="text-gray-400">Bank-grade security using token-based authentication. Your credentials are never exposed.</p>
                         </div>
                     </div>
                </div>

                <!-- E-Way Bill System -->
                <div>
                     <h3 class="text-3xl font-bold mb-8 flex items-center">
                        <span class="bg-orange-500 w-2 h-8 mr-4 rounded-full"></span>
                        E-Way Bill System
                     </h3>
                     <div class="space-y-6">
                         <div class="bg-slate-800 p-6 rounded-2xl border border-slate-700 hover:border-orange-500/50 transition-colors">
                             <h4 class="text-xl font-bold text-white mb-2">On-Demand Generation</h4>
                             <p class="text-gray-400">Generate government-compliant E-Way bills via API with a single click or automated trigger.</p>
                         </div>
                         <div class="bg-slate-800 p-6 rounded-2xl border border-slate-700 hover:border-orange-500/50 transition-colors">
                             <h4 class="text-xl font-bold text-white mb-2">Decoupled Architecture</h4>
                             <p class="text-gray-400">Runs independently of order creation. Failed E-way bill generation won't block your order processing.</p>
                         </div>
                         <div class="bg-slate-800 p-6 rounded-2xl border border-slate-700 hover:border-orange-500/50 transition-colors">
                             <h4 class="text-xl font-bold text-white mb-2">Full Audit Logs</h4>
                             <p class="text-gray-400">Comprehensive history of every generation attempt, failure, and retry for easy troubleshooting.</p>
                         </div>
                     </div>
                </div>
            </div>
        </div>
    </section>
  </div>
</template>

<script setup>
</script>
