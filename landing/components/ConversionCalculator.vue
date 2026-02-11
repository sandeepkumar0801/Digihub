<template>
  <div class="bg-black/50 border border-green-500/30 rounded-3xl p-8 backdrop-blur-sm relative overflow-hidden group">
    <!-- Glow Effect -->
    <div class="absolute -top-24 -right-24 w-48 h-48 bg-green-500/20 rounded-full blur-3xl group-hover:bg-green-500/30 transition-colors duration-500"></div>

    <div class="relative z-10">
      <div class="flex items-center gap-3 mb-8">
        <div class="p-3 bg-green-900/20 rounded-xl border border-green-500/20 text-green-500">
           <Icon name="heroicons:banknotes" class="w-6 h-6" />
        </div>
        <h3 class="text-2xl font-bold text-white">Recovery Calculator</h3>
      </div>

      <!-- Inputs -->
      <div class="space-y-6 mb-8">
        <div>
          <div class="flex justify-between text-sm mb-2">
            <span class="text-gray-400">Monthly Failed Deliveries (NDR)</span>
            <span class="text-white font-mono">{{ failedDeliveries.toLocaleString() }}</span>
          </div>
          <input type="range" v-model.number="failedDeliveries" min="50" max="5000" step="50" class="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-green-500 hover:accent-green-400 transition-all">
        </div>

        <div>
           <div class="flex justify-between text-sm mb-2">
            <span class="text-gray-400">Average Order Value (₹)</span>
            <span class="text-white font-mono">₹{{ aov.toLocaleString() }}</span>
          </div>
          <input type="range" v-model.number="aov" min="500" max="20000" step="100" class="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-green-500 hover:accent-green-400 transition-all">
        </div>
      </div>

      <!-- Results -->
      <div class="pt-6 border-t border-green-900/30">
        <div class="flex items-end justify-between mb-2">
            <div>
                <p class="text-xs text-gray-500 uppercase tracking-widest mb-1">Recoverable Revenue</p>
                <p class="text-3xl md:text-4xl font-black text-green-400">₹{{ recoveredRevenueFormatted }}</p>
            </div>
            <div class="text-right">
                <span class="inline-block px-2 py-1 bg-green-500/20 text-green-400 text-xs font-bold rounded">+{{ recoveredOrders }} Orders</span>
            </div>
        </div>
        <p class="text-[10px] text-green-600/70 mt-1">per month added to your bottom line</p>
      </div>
      
       <p class="text-[10px] text-gray-600 mt-4 italic">*Estimates based on typical 35% automated recovery rate.</p>
    </div>
  </div>
</template>

<script setup>
const failedDeliveries = ref(200)
const aov = ref(1500)

// Logic:
// Recovery Rate ~ 35%
// Recovered Orders = Failed Deliveries * 0.35
// Recovered Revenue = Recovered Orders * AOV

const recoveredOrders = computed(() => {
  return Math.round(failedDeliveries.value * 0.35)
})

const recoveredRevenue = computed(() => {
  return recoveredOrders.value * aov.value
})

const recoveredRevenueFormatted = computed(() => {
   if (recoveredRevenue.value >= 10000000) {
        return (recoveredRevenue.value / 10000000).toFixed(2) + ' Cr';
    } else if (recoveredRevenue.value >= 100000) {
        return (recoveredRevenue.value / 100000).toFixed(2) + ' L';
    } else {
        return recoveredRevenue.value.toLocaleString('en-IN')
    }
})
</script>
