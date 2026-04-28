import { MapPin, Phone, Clock, QrCode, Utensils, Award, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

import logoUrl from '../assets/Umutdoner_Logo.png';
import videoUrl from '../assets/umutdoner_video.mp4';
import bg1 from '../assets/arkaplan1.jpeg';

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white font-sans overflow-x-hidden">
      {/* Navbar */}
      <nav className="bg-black/90 shadow-sm sticky top-0 z-50 border-b border-gold-600/20 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 py-2 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <img src={logoUrl} alt="Umut Döner" className="h-20 md:h-24 object-contain" />
          </div>
          <div className="hidden md:flex gap-6 font-medium text-gold-400">
            <a href="#hakkimizda" className="hover:text-umutred-500 transition-colors">Hakkımızda</a>
            <a href="#iletisim" className="hover:text-umutred-500 transition-colors">İletişim</a>
            <Link to="/menu" className="hover:text-umutred-500 transition-colors">Menü</Link>
          </div>
          <Link to="/menu" className="bg-umutred-600 text-white px-5 py-2.5 rounded-lg font-medium flex items-center gap-2 hover:bg-umutred-500 transition-colors shadow-lg shadow-umutred-600/30">
            <QrCode size={18} />
            QR Menü
          </Link>
        </div>
      </nav>

      {/* Hero Section with Fixed Background */}
      <section className="relative min-h-[85vh] flex items-center overflow-hidden">
        {/* Background Image - Fixed & Night Themed */}
        <div className="absolute inset-0 z-0">
          <img
            src={bg1}
            alt=""
            className="absolute inset-0 w-full h-full object-cover opacity-60 brightness-75 contrast-125"
          />
          {/* Overlay to ensure text readability */}
          <div className="absolute inset-0 z-[1] bg-black/40"></div>
          {/* Bottom fade out to separate from next section */}
          <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black to-transparent z-[2]"></div>
        </div>

        <div className="max-w-6xl mx-auto px-4 py-12 md:py-24 w-full flex flex-col md:flex-row items-center gap-12 relative z-10">
          <div className="flex-1 space-y-6">
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-white leading-tight drop-shadow-2xl">
              Geleneksel Lezzetin <br />
              <span className="text-gold-500">Altın Standardı</span>
            </h1>
            <p className="text-xl text-neutral-100 max-w-lg font-medium leading-relaxed drop-shadow-lg">
               Yılların tecrübesiyle, özenle seçilen etleri ustalıkla işliyor; geleneksel döner lezzetini en doğal haliyle sunuyoruz. Her lokmada kalite ve güveni hissedin.
            </p>
            <div className="flex gap-4 pt-6">
              <Link to="/menu" className="bg-gold-500 text-black px-8 py-3.5 rounded-xl font-bold hover:bg-gold-400 transition-all shadow-xl shadow-gold-500/20 hover:shadow-gold-500/40 text-lg">
                Menüyü İncele
              </Link>
            </div>
          </div>
          <div className="flex-1 w-full bg-neutral-900/40 backdrop-blur-md rounded-2xl aspect-[4/3] flex items-center justify-center border border-white/20 overflow-hidden relative group shadow-2xl">
             <video
               src={videoUrl}
               autoPlay
               muted
               playsInline
               className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
             />
          </div>
        </div>
      </section>

      {/* Hakkımızda Section */}
      <section className="py-24 bg-black border-t border-gold-600/10" id="hakkimizda">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Hakkımızda</h2>
            <div className="h-1.5 w-24 bg-gold-500 mx-auto rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="bg-neutral-900/30 p-8 rounded-3xl border border-gold-600/10 hover:border-gold-500/30 transition-colors text-center group">
              <div className="bg-gold-500/10 w-16 h-16 flex items-center justify-center rounded-2xl mx-auto mb-6 group-hover:scale-110 transition-transform">
                <Utensils className="text-gold-500" size={32} />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Geleneksel Ustalık</h3>
              <p className="text-neutral-400 leading-relaxed text-sm">
                Dönerimizi yıllardır değişmeyen özel reçetemizle, odun ateşinde ağır ağır pişiriyoruz. Lezzetimizin sırrı, etin seçiminden terbiyesine kadar her aşamadaki titizliğimizdir.
              </p>
            </div>

            <div className="bg-neutral-900/30 p-8 rounded-3xl border border-gold-600/10 hover:border-gold-500/30 transition-colors text-center group">
              <div className="bg-gold-500/10 w-16 h-16 flex items-center justify-center rounded-2xl mx-auto mb-6 group-hover:scale-110 transition-transform">
                <Award className="text-gold-500" size={32} />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Kalite Standardı</h3>
              <p className="text-neutral-400 leading-relaxed text-sm">
                En taze malzemeleri, en hijyenik koşullarda işliyoruz. Sofranıza gelen her tabak, bizim kalite sözümüzü taşımaktadır.
              </p>
            </div>

            <div className="bg-neutral-900/30 p-8 rounded-3xl border border-gold-600/10 hover:border-gold-500/30 transition-colors text-center group">
              <div className="bg-gold-500/10 w-16 h-16 flex items-center justify-center rounded-2xl mx-auto mb-6 group-hover:scale-110 transition-transform">
                <ShieldCheck className="text-gold-500" size={32} />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Güvenilir Lezzet</h3>
              <p className="text-neutral-400 leading-relaxed text-sm">
                Müşteri memnuniyetini ve gıda güvenliğini her şeyin önünde tutuyoruz. Ailenizle birlikte güvenle tüketebileceğiniz sağlıklı lezzetler sunuyoruz.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Info */}
      <section className="bg-black border-t border-b border-gold-600/20 py-16" id="iletisim">
        <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-gold-600/20">
          <div className="flex flex-col items-center gap-4 p-6 hover:bg-neutral-900/50 transition-colors rounded-xl md:rounded-none">
            <div className="bg-umutred-600/20 p-4 rounded-full">
               <Clock className="text-gold-500" size={32} />
            </div>
            <h3 className="font-bold text-2xl text-white">Çalışma Saatleri</h3>
            <p className="text-neutral-400 text-lg">Her Gün<br/>10:00 - 22:00</p>
          </div>
          <a href="https://www.google.com/maps/dir/?api=1&destination=40.976907,29.123013" target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-4 p-6 hover:bg-neutral-900/50 transition-colors rounded-xl md:rounded-none group cursor-pointer">
            <div className="bg-umutred-600/20 p-4 rounded-full group-hover:scale-110 transition-transform">
              <MapPin className="text-gold-500" size={32} />
            </div>
            <h3 className="font-bold text-2xl text-white group-hover:text-gold-400 transition-colors">Konum</h3>
            <p className="text-neutral-400 text-base text-sm">Profesör Dr. Necmettin Erbakan caddesi<br/>Engin sokak no 3/A<br/>Ataşehir / İstanbul</p>
            <div className="mt-2 bg-neutral-800 text-gold-400 px-4 py-2 rounded-lg font-medium group-hover:bg-gold-500 group-hover:text-black transition-all text-xs border border-gold-600/30">
              Yol Tarifi Al
            </div>
          </a>
          <div className="flex flex-col items-center gap-4 p-6 hover:bg-neutral-900/50 transition-colors rounded-xl md:rounded-none">
            <div className="bg-umutred-600/20 p-4 rounded-full">
              <Phone className="text-gold-500" size={32} />
            </div>
            <h3 className="font-bold text-2xl text-white">İletişim</h3>
            <p className="text-neutral-400 text-lg">0216 575 8407<br/>Sipariş Hattı</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black py-8 border-t border-gold-600/20 text-center text-neutral-500">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <img src={logoUrl} alt="Umut Döner" className="h-12 opacity-50 grayscale hover:grayscale-0 transition-all" />
          <div className="flex flex-col items-center md:items-end gap-1">
            <p>© {new Date().getFullYear()} Umut Döner. Tüm hakları saklıdır.</p>
            <a href="https://myksoft.vercel.app" target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-neutral-400 hover:text-gold-500 transition-colors">
              Powered by MYKSoft.
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
