// translate.js
const translations = {
    en: {
      Login: 'Login',
      Email: 'Email',
      Password: 'Password',
      'SIGN IN': 'SIGN IN',
      'Create an account': 'Create an account',
      'Forgot your password?': 'Forgot your password?'
    },
    // Add translations for other languages if needed
  };
  
  export const translate = (key, lang = 'en') => {
    if (translations[lang] && translations[lang][key]) {
      return translations[lang][key];
    }
    return key; // Return the key itself if translation is not found
  };
  