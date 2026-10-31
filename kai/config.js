/* Fill in after creating the Supabase project. These two values are designed to be public; the secret keys stay on the server.
   While they are empty, the app runs exactly as before: no account, and AI only with a key the person pastes in. */
window.KAI_CONFIG = {
  supabaseUrl: '',
  supabaseKey: '', // the publishable key
  providers: [], // add 'apple' and 'google' once they are set up in Supabase
  plans: false, // show the plans screen; leave off until payments are real, since App Review rejects placeholder prices
  ownKeys: false, // iPhone app with the server connected: also offer "paste your own Claude or ChatGPT key" (off: App Review may read it as buying features outside in-app purchase)
};
