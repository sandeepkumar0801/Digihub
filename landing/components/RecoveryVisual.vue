<template>
  <div class="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-sm mx-auto font-sans relative overflow-hidden">
      <!-- Header -->
      <div class="flex items-center gap-3 border-b border-slate-800 pb-4 mb-4">
          <div class="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white">
              <Icon name="logos:whatsapp-icon" class="w-6 h-6" />
          </div>
          <div>
              <div class="text-sm font-bold text-white">Delivery Assistant</div>
              <div class="text-xs text-green-500 flex items-center">
                  <span class="w-1.5 h-1.5 bg-green-500 rounded-full mr-1 animate-pulse"></span>
                  Online
              </div>
          </div>
      </div>

      <!-- Chat Area -->
      <div class="space-y-4 text-sm">
          <!-- Bot Message -->
          <div class="flex flex-col gap-1 items-start animate-fade-in-up">
              <div class="bg-slate-800 text-gray-200 p-3 rounded-2xl rounded-tl-none max-w-[85%]">
                  Hi User! Your order #1234 is out for delivery today. Are you available?
              </div>
              <span class="text-[10px] text-gray-600 ml-1">10:00 AM</span>
          </div>

          <!-- User Response -->
           <div class="flex flex-col gap-1 items-end animate-fade-in-up" style="animation-delay: 1s; animation-fill-mode: backwards;">
              <div class="bg-green-600 text-white p-3 rounded-2xl rounded-tr-none max-w-[85%]">
                  No, I'm at work. Can you deliver tomorrow?
              </div>
              <span class="text-[10px] text-gray-600 mr-1">10:05 AM</span>
          </div>

           <!-- Bot Confirmation -->
          <div class="flex flex-col gap-1 items-start animate-fade-in-up" style="animation-delay: 2s; animation-fill-mode: backwards;">
              <div class="bg-slate-800 text-gray-200 p-3 rounded-2xl rounded-tl-none max-w-[85%]">
                  Sure! Rescheduled for tomorrow. Tracking updated. ✅
              </div>
              <span class="text-[10px] text-gray-600 ml-1">10:06 AM</span>
          </div>
      </div>

      <!-- Input Simulation -->
      <div class="mt-6 pt-4 border-t border-slate-800 flex gap-2 opacity-50">
           <div class="h-8 bg-slate-800 rounded-full flex-1"></div>
           <div class="h-8 w-8 bg-slate-800 rounded-full"></div>
      </div>
  </div>
</template>
