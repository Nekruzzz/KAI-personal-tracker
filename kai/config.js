/* Fill in after creating the Supabase project. These two values are designed to be public; the secret keys stay on the server.
   While they are empty there is no account and no AI: everything else works on the phone. */
window.KAI_CONFIG = {
  supabaseUrl: '',
  supabaseKey: '', // the publishable key
  providers: ['google'], // sign-in buttons on the web; each one must be turned on in Supabase first (add 'apple' the same way)
  plans: false, // show the plans screen; leave off until payments are real, since App Review rejects placeholder prices
  ownKeys: false, // KAI provides the AI, so nobody is asked to paste a Claude or ChatGPT key. true brings that option back, e.g. to test before the server is connected
};
