import React, { createContext, useContext, useState, useEffect } from 'react';

export const LANGUAGES = [
  { code:'en', label:'English',  flag:'🇬🇧', dir:'ltr' },
  { code:'fr', label:'Français', flag:'🇫🇷', dir:'ltr' },
  { code:'tn', label:'تونسي',    flag:'🇹🇳', dir:'rtl' },
];

const T = {
  en: {
    home:'Home', browse:'Browse', search:'Search', myList:'My List', shoufliAI:'🎬 Shoufli AI',
    signIn:'Sign In', joinFree:'Join Free', signOut:'Sign Out',
    settings:'Settings', profiles:'Profiles', watchHistory:'Watch History', parental:'Parental Controls',
    loginTitle:'Sign in to your account', emailLabel:'Email Address', passwordLabel:'Password',
    loginBtn:'Sign In', loggingIn:'Signing In…', noAccount:"Don't have an account?", createOne:'Create one free',
    emailPh:'you@example.com', passwordPh:'••••••••', forgotPassword:'Forgot password?',
    registerTitle:'Join Shoufli Movie', registerSub:'Free personalised movie recommendations',
    step1:'1/3 — Account', step2:'2/3 — Profile', step3:'3/3 — Parental',
    usernameLabel:'Username', usernamePh:'moviefan123', confirmPwLabel:'Confirm Password', confirmPwPh:'Repeat password',
    ageLabel:'Your Age', agePh:'e.g. 25', ageSub:'Used for content filtering',
    genresLabel:'Favourite Genres (pick any)',
    isParentLabel:'I am a parent / guardian', isParentSub:'Enable child profiles and parental controls',
    pinLabel:'Parental PIN (optional)', pinPh:'4-digit PIN', pinSub:'Locks parental settings',
    createAccount:'🎬 Create Account', creating:'Creating…', nextBtn:'Next →', backBtn:'← Back',
    alreadyAccount:'Already have an account?',
    verifyTitle:'Verify your email', verifySub:"We sent a 6-digit code to",
    verifyCodeLabel:'Verification Code', verifyCodePh:'Enter 6-digit code', verifyBtn:'Verify Email',
    verifying:'Verifying…', resendCode:'Resend code', resendIn:'Resend in', checkSpam:"Didn't get it? Check spam.",
    forgotTitle:'Reset your password', forgotSub:"Enter your email and we'll send a reset link.",
    sendResetBtn:'Send Reset Link', sending:'Sending…', resetSent:'✅ Reset link sent! Check your inbox.',
    backToLogin:'← Back to Sign In', resetPasswordTitle:'Choose a new password',
    newPwLabel:'New Password', newPwPh:'Min. 6 characters', confirmNewLabel:'Confirm New Password',
    resetBtn:'Reset Password', resetting:'Resetting…',
  },
  fr: {
    home:'Accueil', browse:'Explorer', search:'Rechercher', myList:'Ma Liste', shoufliAI:'🎬 Shoufli AI',
    signIn:'Connexion', joinFree:'Rejoindre', signOut:'Déconnexion',
    settings:'Paramètres', profiles:'Profils', watchHistory:'Historique', parental:'Contrôle Parental',
    loginTitle:'Connectez-vous', emailLabel:'Email', passwordLabel:'Mot de Passe',
    loginBtn:'Se Connecter', loggingIn:'Connexion…', noAccount:'Pas de compte ?', createOne:'Créer un compte',
    emailPh:'vous@exemple.com', passwordPh:'••••••••', forgotPassword:'Mot de passe oublié ?',
    registerTitle:'Rejoindre Shoufli Movie', registerSub:'Recommandations personnalisées gratuites',
    step1:'1/3 — Compte', step2:'2/3 — Profil', step3:'3/3 — Parental',
    usernameLabel:"Nom d'utilisateur", usernamePh:'cinephile123', confirmPwLabel:'Confirmer', confirmPwPh:'Répéter',
    ageLabel:'Votre Âge', agePh:'ex. 25', ageSub:'Utilisé pour le filtrage',
    genresLabel:'Genres Favoris',
    isParentLabel:'Je suis parent/tuteur', isParentSub:'Activer les profils enfants',
    pinLabel:'Code PIN parental (optionnel)', pinPh:'4 chiffres', pinSub:'Verrouille les paramètres',
    createAccount:'🎬 Créer un Compte', creating:'Création…', nextBtn:'Suivant →', backBtn:'← Retour',
    alreadyAccount:'Déjà un compte ?',
    verifyTitle:'Vérifiez votre email', verifySub:'Nous avons envoyé un code à',
    verifyCodeLabel:'Code de Vérification', verifyCodePh:'Code à 6 chiffres', verifyBtn:"Vérifier l'Email",
    verifying:'Vérification…', resendCode:'Renvoyer', resendIn:'Renvoyer dans', checkSpam:'Vérifiez vos spams.',
    forgotTitle:'Réinitialisez votre mot de passe', forgotSub:'Entrez votre email pour recevoir un lien.',
    sendResetBtn:'Envoyer le Lien', sending:'Envoi…', resetSent:'✅ Lien envoyé !',
    backToLogin:'← Retour à la Connexion', resetPasswordTitle:'Nouveau mot de passe',
    newPwLabel:'Nouveau Mot de Passe', newPwPh:'Min. 6 caractères', confirmNewLabel:'Confirmer',
    resetBtn:'Réinitialiser', resetting:'Réinitialisation…',
  },
  tn: {
    home:'الصفحة الرئيسية', browse:'تصفح', search:'بحث', myList:'قائمتي', shoufliAI:'🎬 Shoufli AI',
    signIn:'تسجيل الدخول', joinFree:'إنشاء حساب', signOut:'خروج',
    settings:'الإعدادات', profiles:'الملفات', watchHistory:'سجل المشاهدة', parental:'الرقابة الأبوية',
    loginTitle:'ادخل لحسابك', emailLabel:'البريد الإلكتروني', passwordLabel:'كلمة السر',
    loginBtn:'ادخل', loggingIn:'جاري الدخول…', noAccount:'ماعندكش حساب؟', createOne:'عمل حساب جديد',
    emailPh:'بريدك@مثال.com', passwordPh:'••••••••', forgotPassword:'نسيت كلمة السر؟',
    registerTitle:'انضم لـ Shoufli Movie', registerSub:'توصيات أفلام مجانية ومخصصة',
    step1:'١/٣ — الحساب', step2:'٢/٣ — الملف', step3:'٣/٣ — الأهل',
    usernameLabel:'اسم المستخدم', usernamePh:'cinephile123', confirmPwLabel:'تأكيد كلمة السر', confirmPwPh:'كرر كلمة السر',
    ageLabel:'عمرك', agePh:'مثلاً 25', ageSub:'يُستخدم لتصفية المحتوى',
    genresLabel:'أنواع الأفلام المفضلة',
    isParentLabel:'أنا والد / ولية أمر', isParentSub:'تفعيل ملفات الأطفال والرقابة',
    pinLabel:'رمز الرقابة (اختياري)', pinPh:'4 أرقام', pinSub:'يقفل إعدادات الأهل',
    createAccount:'🎬 إنشاء الحساب', creating:'جاري الإنشاء…', nextBtn:'التالي →', backBtn:'→ رجع',
    alreadyAccount:'عندك حساب؟',
    verifyTitle:'تأكيد بريدك', verifySub:'بعثنالك كود من 6 أرقام على',
    verifyCodeLabel:'كود التحقق', verifyCodePh:'6 أرقام', verifyBtn:'تأكيد البريد',
    verifying:'جاري التحقق…', resendCode:'إعادة إرسال', resendIn:'إعادة بعد', checkSpam:'شوف مجلد Spam.',
    forgotTitle:'إعادة تعيين كلمة السر', forgotSub:'دخل بريدك ونبعثولك رابط.',
    sendResetBtn:'إرسال الرابط', sending:'جاري الإرسال…', resetSent:'✅ تم الإرسال! شوف بريدك.',
    backToLogin:'→ رجع لتسجيل الدخول', resetPasswordTitle:'اختر كلمة سر جديدة',
    newPwLabel:'كلمة السر الجديدة', newPwPh:'6 أحرف على الأقل', confirmNewLabel:'تأكيد كلمة السر',
    resetBtn:'إعادة التعيين', resetting:'جاري التعيين…',
  },
};

const LangContext = createContext(null);

const detectLang = () => {
  const saved = localStorage.getItem('shoufli_lang');
  if (saved) return saved;
  const raw = (navigator.language || navigator.languages?.[0] || 'en').toLowerCase();
  if (raw.startsWith('ar')) return 'tn';
  if (raw.startsWith('fr')) return 'fr';
  return 'en';
};

export const LangProvider = ({ children }) => {
  const [lang, setLang] = useState(detectLang);
  const currentLang = LANGUAGES.find(l => l.code === lang) || LANGUAGES[0];

  useEffect(() => {
    localStorage.setItem('shoufli_lang', lang);
    document.documentElement.dir  = currentLang.dir;
    document.documentElement.lang = lang;
  }, [lang, currentLang.dir]);

  // IP-based detection fallback (free, runs once)
  useEffect(() => {
    if (localStorage.getItem('shoufli_lang')) return;
    const raw = (navigator.language||'').toLowerCase();
    if (raw.startsWith('ar')||raw.startsWith('fr')) return; // already handled
    fetch('https://ipapi.co/json/').then(r=>r.json()).then(d=>{
      const c=(d.country_code||'').toUpperCase();
      if (c==='TN') setLang('tn');
      else if (['FR','BE','CH','DZ','MA','SN'].includes(c)) setLang('fr');
    }).catch(()=>{});
  // eslint-disable-next-line
  }, []);

  const t = key => T[lang]?.[key] || T.en[key] || key;
  const isRTL = currentLang.dir === 'rtl';

  return (
    <LangContext.Provider value={{ lang, setLang, t, currentLang, isRTL }}>
      {children}
    </LangContext.Provider>
  );
};

export const useLang = () => {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error('useLang must be inside LangProvider');
  return ctx;
};
