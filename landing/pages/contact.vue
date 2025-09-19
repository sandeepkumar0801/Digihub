<template>
  <div>
    <!-- Navigation -->
    <AppNavigation />
    
    <!-- Hero Section -->
    <section class="pt-24 pb-16 bg-gradient-to-br from-blue-50 to-purple-50">
      <div class="container mx-auto px-6">
        <div class="max-w-4xl mx-auto text-center">
          <h1 class="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Get in <span class="gradient-text">Touch</span>
          </h1>
          <p class="text-xl text-gray-600 leading-relaxed">
            Ready to transform your e-commerce operations? We're here to help you 
            get started with DigiHub and answer any questions you might have.
          </p>
        </div>
      </div>
    </section>

    <!-- Contact Form & Info -->
    <section class="py-20">
      <div class="container mx-auto px-6">
        <div class="grid lg:grid-cols-2 gap-16">
          <!-- Contact Form -->
          <div class="bg-white rounded-2xl shadow-xl p-8 lg:p-12">
            <h2 class="text-3xl font-bold text-gray-900 mb-8">Send us a Message</h2>
            <form @submit.prevent="submitForm" class="space-y-6">
              <div class="grid md:grid-cols-2 gap-6">
                <div>
                  <label for="firstName" class="block text-sm font-medium text-gray-700 mb-2">
                    First Name *
                  </label>
                  <input
                    id="firstName"
                    v-model="form.firstName"
                    type="text"
                    required
                    class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="John"
                  >
                </div>
                <div>
                  <label for="lastName" class="block text-sm font-medium text-gray-700 mb-2">
                    Last Name *
                  </label>
                  <input
                    id="lastName"
                    v-model="form.lastName"
                    type="text"
                    required
                    class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="Doe"
                  >
                </div>
              </div>
              
              <div>
                <label for="email" class="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <input
                  id="email"
                  v-model="form.email"
                  type="email"
                  required
                  class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder="john@example.com"
                >
              </div>
              
              <div>
                <label for="company" class="block text-sm font-medium text-gray-700 mb-2">
                  Company Name
                </label>
                <input
                  id="company"
                  v-model="form.company"
                  type="text"
                  class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder="Your Company"
                >
              </div>
              
              <div>
                <label for="phone" class="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  id="phone"
                  v-model="form.phone"
                  type="tel"
                  class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder="+1 (555) 123-4567"
                >
              </div>
              
              <div>
                <label for="subject" class="block text-sm font-medium text-gray-700 mb-2">
                  Subject *
                </label>
                <select
                  id="subject"
                  v-model="form.subject"
                  required
                  class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                >
                  <option value="">Select a subject</option>
                  <option value="general">General Inquiry</option>
                  <option value="demo">Request Demo</option>
                  <option value="pricing">Pricing Information</option>
                  <option value="support">Technical Support</option>
                  <option value="partnership">Partnership Opportunities</option>
                  <option value="other">Other</option>
                </select>
              </div>
              
              <div>
                <label for="message" class="block text-sm font-medium text-gray-700 mb-2">
                  Message *
                </label>
                <textarea
                  id="message"
                  v-model="form.message"
                  rows="5"
                  required
                  class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none"
                  placeholder="Tell us about your e-commerce operations and how we can help..."
                ></textarea>
              </div>
              
              <div class="flex items-center">
                <input
                  id="newsletter"
                  v-model="form.newsletter"
                  type="checkbox"
                  class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                >
                <label for="newsletter" class="ml-2 text-sm text-gray-600">
                  I'd like to receive updates about DigiHub features and news
                </label>
              </div>
              
              <button
                type="submit"
                :disabled="isSubmitting"
                class="w-full btn-primary flex items-center justify-center"
                :class="{ 'opacity-75 cursor-not-allowed': isSubmitting }"
              >
                <Icon v-if="!isSubmitting" name="heroicons:paper-airplane" class="w-5 h-5 mr-2" />
                <Icon v-else name="heroicons:arrow-path" class="w-5 h-5 mr-2 animate-spin" />
                {{ isSubmitting ? 'Sending...' : 'Send Message' }}
              </button>
            </form>
          </div>
          
          <!-- Contact Information -->
          <div class="space-y-8">
            <div>
              <h2 class="text-3xl font-bold text-gray-900 mb-8">Contact Information</h2>
              <p class="text-lg text-gray-600 mb-8 leading-relaxed">
                We're here to help you succeed. Reach out to us through any of the 
                following channels, and we'll get back to you as soon as possible.
              </p>
            </div>
            
            <!-- Contact Cards -->
            <div class="space-y-6">
              <div class="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                <div class="flex items-start space-x-4">
                  <div class="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Icon name="heroicons:envelope" class="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 class="font-semibold text-gray-900 mb-1">Email Us</h3>
                    <p class="text-gray-600 mb-2">Get in touch via email</p>
                    <a href="mailto:hello@digihub.com" class="text-blue-600 hover:text-blue-700 font-medium">
                      hello@digihub.com
                    </a>
                  </div>
                </div>
              </div>
              
              <div class="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                <div class="flex items-start space-x-4">
                  <div class="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Icon name="heroicons:phone" class="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h3 class="font-semibold text-gray-900 mb-1">Call Us</h3>
                    <p class="text-gray-600 mb-2">Speak with our team</p>
                    <a href="tel:+1-555-123-4567" class="text-green-600 hover:text-green-700 font-medium">
                      +1 (555) 123-4567
                    </a>
                  </div>
                </div>
              </div>
              
              <div class="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                <div class="flex items-start space-x-4">
                  <div class="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Icon name="heroicons:map-pin" class="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 class="font-semibold text-gray-900 mb-1">Visit Us</h3>
                    <p class="text-gray-600 mb-2">Our headquarters</p>
                    <p class="text-purple-600 font-medium">
                      123 Tech Street<br>
                      San Francisco, CA 94105<br>
                      United States
                    </p>
                  </div>
                </div>
              </div>
              
              <div class="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                <div class="flex items-start space-x-4">
                  <div class="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Icon name="heroicons:chat-bubble-left-right" class="w-6 h-6 text-orange-600" />
                  </div>
                  <div>
                    <h3 class="font-semibold text-gray-900 mb-1">Live Chat</h3>
                    <p class="text-gray-600 mb-2">Chat with our support team</p>
                    <button class="text-orange-600 hover:text-orange-700 font-medium">
                      Start Live Chat
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Business Hours -->
            <div class="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6">
              <h3 class="font-semibold text-gray-900 mb-4">Business Hours</h3>
              <div class="space-y-2 text-sm">
                <div class="flex justify-between">
                  <span class="text-gray-600">Monday - Friday</span>
                  <span class="font-medium">9:00 AM - 6:00 PM PST</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">Saturday</span>
                  <span class="font-medium">10:00 AM - 4:00 PM PST</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">Sunday</span>
                  <span class="font-medium">Closed</span>
                </div>
              </div>
              <p class="text-xs text-gray-500 mt-4">
                * Emergency support available 24/7 for enterprise clients
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- FAQ Section -->
    <section class="py-20 bg-gray-50">
      <div class="container mx-auto px-6">
        <div class="max-w-4xl mx-auto">
          <div class="text-center mb-16">
            <h2 class="text-4xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
            <p class="text-xl text-gray-600">
              Quick answers to common questions about DigiHub
            </p>
          </div>
          
          <div class="space-y-6">
            <div class="bg-white rounded-2xl p-6 shadow-lg">
              <h3 class="text-lg font-semibold text-gray-900 mb-2">
                How quickly can I get started with DigiHub?
              </h3>
              <p class="text-gray-600">
                Most businesses can be up and running within 24-48 hours. Our onboarding team 
                will guide you through the setup process and ensure all your channels are 
                properly connected and synchronized.
              </p>
            </div>
            
            <div class="bg-white rounded-2xl p-6 shadow-lg">
              <h3 class="text-lg font-semibold text-gray-900 mb-2">
                What e-commerce platforms do you support?
              </h3>
              <p class="text-gray-600">
                We support 8+ major platforms including Shopify, WooCommerce, Amazon SP-API, 
                eBay, Mirakl, PrestaShop, and Magento. We're constantly adding new integrations 
                based on customer demand.
              </p>
            </div>
            
            <div class="bg-white rounded-2xl p-6 shadow-lg">
              <h3 class="text-lg font-semibold text-gray-900 mb-2">
                Is there a free trial available?
              </h3>
              <p class="text-gray-600">
                Yes! We offer a 14-day free trial with full access to all features. 
                No credit card required to get started. Our team will also provide 
                personalized onboarding support during your trial.
              </p>
            </div>
            
            <div class="bg-white rounded-2xl p-6 shadow-lg">
              <h3 class="text-lg font-semibold text-gray-900 mb-2">
                What kind of support do you provide?
              </h3>
              <p class="text-gray-600">
                We offer 24/7 email support, live chat during business hours, comprehensive 
                documentation, video tutorials, and dedicated account managers for enterprise 
                clients. Emergency support is available for critical issues.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <AppFooter />
  </div>
</template>

<script setup>
// Form state
const form = reactive({
  firstName: '',
  lastName: '',
  email: '',
  company: '',
  phone: '',
  subject: '',
  message: '',
  newsletter: false
})

const isSubmitting = ref(false)

// Form submission
const submitForm = async () => {
  isSubmitting.value = true
  
  // Simulate form submission
  await new Promise(resolve => setTimeout(resolve, 2000))
  
  // Reset form
  Object.keys(form).forEach(key => {
    if (typeof form[key] === 'boolean') {
      form[key] = false
    } else {
      form[key] = ''
    }
  })
  
  isSubmitting.value = false
  
  // Show success message (you can implement a toast notification here)
  alert('Thank you for your message! We\'ll get back to you soon.')
}

// SEO Meta
useHead({
  title: 'Contact DigiHub - Get in Touch with Our E-commerce Experts',
  meta: [
    {
      name: 'description',
      content: 'Contact DigiHub for questions about our e-commerce channel connector and logistics management platform. Get personalized support and schedule a demo today.'
    },
    {
      property: 'og:title',
      content: 'Contact DigiHub - Get in Touch with Our E-commerce Experts'
    },
    {
      property: 'og:description',
      content: 'Ready to transform your e-commerce operations? Contact our team for personalized support, demos, and answers to all your questions about DigiHub.'
    }
  ]
})
</script>
