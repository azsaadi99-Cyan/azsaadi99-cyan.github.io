const button = document.getElementById('language');
function setLanguage(lang) {
  document.documentElement.lang = lang;
  document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  document.querySelectorAll('[data-en][data-ar]').forEach(el => { el.innerHTML = el.dataset[lang]; });
  document.querySelectorAll('[data-alt-en][data-alt-ar]').forEach(el => { el.alt = el.dataset[lang === 'ar' ? 'altAr' : 'altEn']; });
  button.textContent = lang === 'ar' ? 'English' : 'العربية';
  button.lang = lang === 'ar' ? 'en' : 'ar';
  button.setAttribute('aria-label', lang === 'ar' ? 'Switch to English' : 'التبديل إلى العربية');
  document.title = lang === 'ar'
    ? (document.body.dataset.titleAr || 'أحمد الزهراني | الشبكات وPMO وتحليل البيانات')
    : (document.body.dataset.titleEn || 'Ahmed Alzahrani | Networks, PMO & Data');
  try { localStorage.setItem('ahmed-site-language', lang); } catch {}
}
let saved; try { saved = localStorage.getItem('ahmed-site-language'); } catch {}
setLanguage(saved === 'ar' ? 'ar' : 'en');
button.addEventListener('click', () => setLanguage(document.documentElement.lang === 'en' ? 'ar' : 'en'));

