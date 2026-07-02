const nodemailer = require('nodemailer');

let _transporter = null;

const getTransporter = async () => {
  if (_transporter) return _transporter;
  if (process.env.EMAIL_HOST) {
    _transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST, port: parseInt(process.env.EMAIL_PORT) || 587,
      secure: process.env.EMAIL_SECURE === 'true',
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    });
  } else {
    // Auto-create free Ethereal test account — no setup needed
    const test = await nodemailer.createTestAccount();
    _transporter = nodemailer.createTransport({
      host:'smtp.ethereal.email', port:587, secure:false,
      auth: { user:test.user, pass:test.pass },
    });
    console.log(`\n📧  Ethereal test account: ${test.user} / ${test.pass}\n`);
  }
  return _transporter;
};

const RED = '#e50914'; const DARK = '#0a0a0f'; const CARD = '#16161f';

const tmpl = (body, lang='en') => `<!DOCTYPE html><html lang="${lang}" dir="${lang==='tn'?'rtl':'ltr'}">
<head><meta charset="UTF-8"/><style>
body{margin:0;padding:0;background:${DARK};font-family:Arial,sans-serif;}
.w{max-width:520px;margin:40px auto;padding:0 16px;}
.c{background:${CARD};border-radius:12px;padding:36px;border:1px solid rgba(255,255,255,0.07);}
.logo{font-size:20px;font-weight:700;color:#fff;text-align:center;margin-bottom:24px;}
.logo span{color:${RED};}
h1{color:#fff;font-size:20px;text-align:center;margin:0 0 10px;}
p{color:rgba(255,255,255,.6);font-size:14px;line-height:1.7;margin:0 0 16px;text-align:center;}
.box{background:#0a0a0f;border:2px dashed rgba(229,9,20,.3);border-radius:10px;padding:20px;text-align:center;margin:20px 0;}
.code{font-size:36px;font-weight:700;color:#fff;letter-spacing:10px;font-family:monospace;}
.btn{display:block;width:fit-content;margin:20px auto;background:${RED};color:#fff;text-decoration:none;border-radius:8px;padding:13px 28px;font-size:14px;font-weight:600;}
hr{border:none;border-top:1px solid rgba(255,255,255,.07);margin:20px 0;}
.foot{text-align:center;margin-top:20px;color:rgba(255,255,255,.2);font-size:12px;}
</style></head><body><div class="w"><div class="c">
<div class="logo">🎬 Shoufli <span>Movie</span></div>
${body}
</div><div class="foot">© ${new Date().getFullYear()} Shoufli Movie</div></div></body></html>`;

const COPY = {
  verify:{
    en:{sub:'Verify your Shoufli Movie email',h:'Verify your email',b:'Enter this 6-digit code to activate your account:',exp:'Expires in 15 minutes.',ign:"Didn't sign up? Ignore this email."},
    fr:{sub:'Vérifiez votre email Shoufli Movie',h:'Vérifiez votre email',b:'Entrez ce code à 6 chiffres pour activer votre compte :',exp:'Expire dans 15 minutes.',ign:"Pas inscrit ? Ignorez cet email."},
    tn:{sub:'تأكيد بريدك في Shoufli Movie',h:'تأكيد البريد',b:'دخل هذا الكود من 6 أرقام لتفعيل حسابك:',exp:'ينتهي في 15 دقيقة.',ign:'ما سجلتش؟ تجاهل هذا البريد.'},
  },
  reset:{
    en:{sub:'Reset your Shoufli Movie password',h:'Reset your password',b:'Click the button to set a new password. Link expires in 1 hour.',btn:'Reset Password',ign:"Didn't request this? Ignore this email."},
    fr:{sub:'Réinitialisez votre mot de passe',h:'Réinitialisez votre mot de passe',b:'Cliquez pour choisir un nouveau mot de passe. Expire dans 1 heure.',btn:'Réinitialiser',ign:"Pas demandé ? Ignorez cet email."},
    tn:{sub:'إعادة تعيين كلمة سرك',h:'إعادة تعيين كلمة السر',b:'اضغط الزر لاختيار كلمة سر جديدة. ينتهي في ساعة.',btn:'إعادة التعيين',ign:'ما طلبتش؟ تجاهل البريد.'},
  },
};

const sendVerificationEmail = async (to, code, lang='en') => {
  const c = COPY.verify[lang]||COPY.verify.en;
  const html = tmpl(`<h1>${c.h}</h1><p>${c.b}</p><div class="box"><span class="code">${code}</span></div><hr/><p style="font-size:11px;color:rgba(255,255,255,.3)">${c.exp}</p><p style="font-size:11px;color:rgba(255,255,255,.2)">${c.ign}</p>`, lang);
  const t = await getTransporter();
  const info = await t.sendMail({ from:`"Shoufli Movie 🎬" <${process.env.EMAIL_FROM||'noreply@shoufli.movie'}>`, to, subject:c.sub, html });
  const url = nodemailer.getTestMessageUrl(info);
  if (url) console.log(`\n📧  Email preview → ${url}\n`);
  return info;
};

const sendPasswordResetEmail = async (to, token, lang='en') => {
  const c = COPY.reset[lang]||COPY.reset.en;
  const url = `${process.env.CLIENT_URL||'http://localhost:3000'}/reset-password/${token}`;
  const html = tmpl(`<h1>${c.h}</h1><p>${c.b}</p><a href="${url}" class="btn">${c.btn}</a><hr/><p style="font-size:11px;color:rgba(255,255,255,.3)">${url}</p><p style="font-size:11px;color:rgba(255,255,255,.2)">${c.ign}</p>`, lang);
  const t = await getTransporter();
  const info = await t.sendMail({ from:`"Shoufli Movie 🎬" <${process.env.EMAIL_FROM||'noreply@shoufli.movie'}>`, to, subject:c.sub, html });
  const previewUrl = nodemailer.getTestMessageUrl(info);
  if (previewUrl) console.log(`\n📧  Reset email preview → ${previewUrl}\n`);
  return info;
};

module.exports = { sendVerificationEmail, sendPasswordResetEmail };
