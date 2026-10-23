// =========================================
// Almanca Flashcard - script.js (Buton Çakışması Giderilmiş Sürüm)
// =========================================

const STORAGE_KEY = 'almanca_flashcard_v1';

let kelimeListesi = yukluVeriyiGetir();
let aktifKelimeler = [];
let aktifIndex = 0;
let aktifKategori = null;
let mevcutVoices = [];

// HTML ELEMANLARI
const landingScreen = document.getElementById('landing-screen');
const mainMenu = document.getElementById('main-menu');
const flashcardScreen = document.getElementById('flashcard-screen');
const cardContainer = document.querySelector('.flashcard-container');
const cardInner = document.querySelector('.flashcard');

const cardGerman = document.getElementById('card-german');
const cardTurkish = document.getElementById('card-turkish');
const cardPlural = document.getElementById('card-plural');
const cardArtikel = document.getElementById('card-artikel');
const cardExample = document.getElementById('card-example');
const cardExampleTr = document.getElementById('card-example-tr');

const templateIsim = document.getElementById('template-isim');
const templateFiil = document.getElementById('template-fiil');
const exampleContainer = document.getElementById('example-container');

const fiilTurkish = document.getElementById('fiil-turkish');
const fiilCekimleri = document.getElementById('fiil-cekimleri');
const fiilGecmis = document.getElementById('fiil-gecmis');

const toplamKelimeEl = document.getElementById('toplam-kelime');
const btnSifirla = document.getElementById('btn-sifirla');
const biliyorumSayacEl = document.getElementById('biliyorum-sayac');
const customAlertEl = document.getElementById('custom-alert');
const btnProfilGit = document.getElementById('btn-profil-git');
const profilScreen = document.getElementById('profil-screen');
const btnProfilGeri = document.getElementById('btn-profil-geri');
const profileHeader = document.getElementById('profile-header');
const profilOgrenilenSayiEl = document.getElementById('profil-ogrenilen-sayi');
const profilKelimeListesiEl = document.getElementById('profil-kelime-listesi');

init();

function init() {
    sesMotorunuHazirla();
    butonlariBagla();
    menuIstatistikleriniGuncelle();
}

function butonlariBagla() {
    document.body.addEventListener('touchstart', mobilSesKilidiniAc, { once: true });
    document.body.addEventListener('click', mobilSesKilidiniAc, { once: true });

    document.getElementById('btn-goto-kelimeler').addEventListener('click', kelimelerMenuyeGit);
    document.getElementById('btn-goto-okuma').addEventListener('click', () => {
        bildirimGoster('Okuma kısmı yakında eklenecektir!');
    });

    document.getElementById('btn-ana-sayfaya-don').addEventListener('click', anaSayfayaDon);

    document.getElementById('btn-isimler').addEventListener('click', () => oyunuBaslat('isim'));
    document.getElementById('btn-fiiller').addEventListener('click', () => oyunuBaslat('fiil'));
    document.getElementById('btn-karisik').addEventListener('click', () => oyunuBaslat('karisik'));

    document.getElementById('btn-geri').addEventListener('click', kelimelerMenuyeGit);

    // SES BUTONLARI - Tıklama olayının karta sıçramasını engelliyoruz (stopPropagation)
    const btnSeslendirButonlari = document.querySelectorAll('.btn-seslendir');
    btnSeslendirButonlari.forEach((buton) => {
        buton.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            kelimeyiOku();
        });
        buton.addEventListener('touchend', (e) => {
            e.preventDefault();
            e.stopPropagation();
            kelimeyiOku();
        });
    });

    const btnOrnekOkuButonu = document.querySelector('.btn-ornek-oku');
    if (btnOrnekOkuButonu) {
        btnOrnekOkuButonu.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            ornekCumleyiOku();
        });
        btnOrnekOkuButonu.addEventListener('touchend', (e) => {
            e.preventDefault();
            e.stopPropagation();
            ornekCumleyiOku();
        });
    }

    if (btnSifirla) {
        btnSifirla.addEventListener('click', () => {
            const onay = confirm('Kart ilerlemesi sıfırlansın mı? Öğrenilen kelimeler korunacak.');
            if (!onay) return;
            uygulamaIlerlemesiniSifirla();
        });
    }

    if (btnProfilGit) {
        btnProfilGit.addEventListener('click', () => {
            if (profileHeader) profileHeader.style.display = 'none';
            landingScreen.style.display = 'none';
            mainMenu.style.display = 'none';
            flashcardScreen.style.display = 'none';
            profilScreen.style.display = 'block';
            profilIstatistikleriniGuncelle();
        });
    }

    if (btnProfilGeri) {
        btnProfilGeri.addEventListener('click', () => {
            if (profileHeader) profileHeader.style.display = 'flex';
            profilScreen.style.display = 'none';
            landingScreen.style.display = 'flex';
        });
    }

    // KART ÇEVİRME - Sadece ana konteynıra tıklandığında dönecek
    if (cardContainer) {
        cardContainer.addEventListener('click', (e) => {
            // Eğer tıklanan eleman bir buton veya ses alanı değilse kartı çevir
            if (!e.target.closest('button')) {
                cardInner.classList.toggle('flipped');
            }
        });
    }

    const btnBiliyorum = document.querySelector('.btn-biliyorum');
    const btnBilmiyorum = document.querySelector('.btn-bilmiyorum');

    if (btnBiliyorum) {
        btnBiliyorum.addEventListener('click', (e) => {
            e.stopPropagation();
            kelimeyiCevapla('biliyorum');
        });
    }

    if (btnBilmiyorum) {
        btnBilmiyorum.addEventListener('click', (e) => {
            e.stopPropagation();
            kelimeyiCevapla('bilmiyorum');
        });
    }
}

function kelimelerMenuyeGit() {
    landingScreen.style.display = 'none';
    flashcardScreen.style.display = 'none';
    profilScreen.style.display = 'none';
    mainMenu.style.display = 'flex';
    if (profileHeader) profileHeader.style.display = 'flex';
    menuIstatistikleriniGuncelle();
}

function anaSayfayaDon() {
    mainMenu.style.display = 'none';
    flashcardScreen.style.display = 'none';
    profilScreen.style.display = 'none';
    landingScreen.style.display = 'flex';
}

function oyunuBaslat(secilenKategori) {
    aktifKategori = secilenKategori;
    yeniTurHazirla();
}

function yeniTurHazirla() {
    let kategoriKelimeleri = kategoriyeGoreListeGetir(aktifKategori);

    if (kategoriKelimeleri.length === 0) {
        bildirimGoster('Bu kategoride henüz kelime yok!');
        kelimelerMenuyeGit();
        return;
    }

    let bilinmeyenler = kategoriKelimeleri.filter(k => k.durum !== 'biliyorum');
    let bilinenler = kategoriKelimeleri.filter(k => k.durum === 'biliyorum');

    if (bilinmeyenler.length === 0 && bilinenler.length > 0) {
        kategoriKelimeleri.forEach(kelime => { kelime.durum = 'bilmiyorum'; });
        verileriKaydet();
        menuIstatistikleriniGuncelle();
        bildirimGoster('Tüm kelimeler bitti, liste sıfırlandı.');

        kategoriKelimeleri = kategoriyeGoreListeGetir(aktifKategori);
        bilinmeyenler = kategoriKelimeleri.filter(k => k.durum !== 'biliyorum');
        bilinenler = kategoriKelimeleri.filter(k => k.durum === 'biliyorum');
    }

    karistir(bilinmeyenler);
    karistir(bilinenler);

    const secilenBilinmeyenler = bilinmeyenler.slice(0, 10);
    const secilenBilinenler = bilinenler.slice(0, 5);

    aktifKelimeler = [...secilenBilinmeyenler, ...secilenBilinenler];
    karistir(aktifKelimeler);

    aktifIndex = 0;
    mainMenu.style.display = 'none';
    flashcardScreen.style.display = 'flex';

    kartiGoster();
}

function kartiGoster() {
    if (aktifKelimeler.length === 0 || aktifIndex >= aktifKelimeler.length) {
        bildirimGoster('Seans bitti!');
        setTimeout(() => { kelimelerMenuyeGit(); }, 700);
        return;
    }

    const guncelKelime = aktifKelimeler[aktifIndex];

    if (cardInner) {
        cardInner.classList.remove('flipped');
    }

    cardGerman.innerText = guncelKelime.almanca || '';

    if (cardPlural) {
        if (guncelKelime.cogul && guncelKelime.cogul.trim() !== '') {
            cardPlural.innerText = guncelKelime.cogul; 
            cardPlural.style.display = 'block';
        } else {
            cardPlural.innerText = '';
            cardPlural.style.display = 'none';
        }
    }

    if (guncelKelime.kategori === 'fiil') {
        fiilKartiniDoldur(guncelKelime);
    } else {
        isimKartiniDoldur(guncelKelime);
    }

    ornekCumleyiDoldur(guncelKelime);
}

function isimKartiniDoldur(kelime) {
    templateIsim.style.display = 'flex';
    templateFiil.style.display = 'none';

    cardTurkish.innerText = kelime.turkce || '';

    if (kelime.artikel && kelime.artikel.trim() !== '') {
        cardArtikel.style.display = 'block';
        cardArtikel.innerText = kelime.artikel;
    } else {
        cardArtikel.style.display = 'none';
        cardArtikel.innerText = '';
    }
}

function fiilKartiniDoldur(kelime) {
    templateIsim.style.display = 'none';
    templateFiil.style.display = 'flex';

    fiilTurkish.innerText = kelime.turkce || '';
    fiilGecmis.innerText = kelime.gecmis_zaman || '-';

    fiilCekimleri.innerHTML = `
        <p>${kelime.cek_ich || ''}</p>
        <p>${kelime.cek_du || ''}</p>
        <p>${kelime.cek_er || ''}</p>
        <p>${kelime.cek_wir || ''}</p>
        <p>${kelime.cek_ihr || ''}</p>
        <p>${kelime.cek_sie || ''}</p>
    `;
}

function ornekCumleyiDoldur(kelime) {
    const ornekVar = kelime.ornek_cumle && kelime.ornek_cumle.trim() !== '';
    const ornekTrVar = kelime.ornek_cumle_turkce && kelime.ornek_cumle_turkce.trim() !== '';

    if (ornekVar) {
        exampleContainer.style.display = 'block';
        cardExample.style.display = 'block';
        cardExample.innerText = kelime.ornek_cumle;

        if (ornekTrVar) {
            cardExampleTr.style.display = 'block';
            cardExampleTr.innerText = kelime.ornek_cumle_turkce;
        } else {
            cardExampleTr.style.display = 'none';
            cardExampleTr.innerText = '';
        }
    } else {
        exampleContainer.style.display = 'none';
        cardExample.innerText = '';
        cardExampleTr.innerText = '';
    }
}

function kelimeyiCevapla(yeniDurum) {
    if (!aktifKelimeler.length || aktifIndex >= aktifKelimeler.length) return;

    const guncelKelime = aktifKelimeler[aktifIndex];
    const listedekiKelime = kelimeListesi.find(k => k.id === guncelKelime.id);

    if (listedekiKelime) {
        listedekiKelime.durum = yeniDurum;
        listedekiKelime.ogrenildi = (yeniDurum === 'biliyorum');
    }

    verileriKaydet();
    menuIstatistikleriniGuncelle();

    aktifIndex++;

    if (cardInner) {
        cardInner.classList.remove('flipped');
    }

    setTimeout(() => {
        kartiGoster();
    }, 250);
}

function menuIstatistikleriniGuncelle() {
    const toplam = kelimeListesi.length;
    const biliyorumSayisi = kelimeListesi.filter(k => k.durum === 'biliyorum').length;

    if (toplamKelimeEl) toplamKelimeEl.innerText = `Toplam: ${toplam}`;
    if (biliyorumSayacEl) biliyorumSayacEl.innerText = `${biliyorumSayisi}/${toplam}`;
}

function verileriKaydet() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(kelimeListesi));
}

function yukluVeriyiGetir() {
    try {
        const kayitliVeri = localStorage.getItem(STORAGE_KEY);
        const anaListe = baslangicKelimeleri.filter(k => k && k.id).map(k => ({ ...k }));

        if (!kayitliVeri) return anaListe;

        const parsed = JSON.parse(kayitliVeri);
        if (!Array.isArray(parsed) || parsed.length === 0) return anaListe;

        let temizKayitliVeri = parsed.filter(k => k && k.id);

        anaListe.forEach(anaKelime => {
            const kayitliKelime = temizKayitliVeri.find(k => k.id === anaKelime.id);
            if (!kayitliKelime) {
                temizKayitliVeri.push(anaKelime);
            } else {
                kayitliKelime.almanca = anaKelime.almanca;
                kayitliKelime.artikel = anaKelime.artikel;
                kayitliKelime.turkce = anaKelime.turkce;
                kayitliKelime.kategori = anaKelime.kategori;
                kayitliKelime.ornek_cumle = anaKelime.ornek_cumle;
                kayitliKelime.ornek_cumle_turkce = anaKelime.ornek_cumle_turkce;
                kayitliKelime.cogul = anaKelime.cogul;

                if (anaKelime.kategori === 'fiil') {
                    kayitliKelime.cek_ich = anaKelime.cek_ich;
                    kayitliKelime.cek_du = anaKelime.cek_du;
                    kayitliKelime.cek_er = anaKelime.cek_er;
                    kayitliKelime.cek_wir = anaKelime.cek_wir;
                    kayitliKelime.cek_ihr = anaKelime.cek_ihr;
                    kayitliKelime.cek_sie = anaKelime.cek_sie;
                    kayitliKelime.gecmis_zaman = anaKelime.gecmis_zaman;
                }
            }
        });

        return temizKayitliVeri;
    } catch (error) {
        return baslangicKelimeleri.filter(k => k && k.id).map(k => ({ ...k }));
    }
}

function kategoriyeGoreListeGetir(kategori) {
    if (kategori === 'karisik') return [...kelimeListesi];
    return kelimeListesi.filter(k => k.kategori === kategori);
}

function karistir(dizi) {
    for (let i = dizi.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [dizi[i], dizi[j]] = [dizi[j], dizi[i]];
    }
    return dizi;
}

function bildirimGoster(mesaj) {
    if (!customAlertEl) return;
    customAlertEl.innerText = mesaj;
    customAlertEl.style.display = 'block';
    clearTimeout(customAlertEl._timeoutId);
    customAlertEl._timeoutId = setTimeout(() => {
        customAlertEl.style.display = 'none';
    }, 2200);
}

function profilIstatistikleriniGuncelle() {
    if (!profilOgrenilenSayiEl || !profilKelimeListesiEl) return;
    const ogrenilenKelimeler = kelimeListesi.filter(k => k.ogrenildi);
    profilOgrenilenSayiEl.innerText = `${ogrenilenKelimeler.length} Kelime Öğrenildi`;
    profilKelimeListesiEl.innerHTML = '';

    if (ogrenilenKelimeler.length === 0) {
        profilKelimeListesiEl.innerHTML = `<tr><td colspan="2">Henüz öğrenilen kelime yok.</td></tr>`;
        return;
    }

    ogrenilenKelimeler.forEach(kelime => {
        profilKelimeListesiEl.innerHTML += `
            <tr>
                <td>${kelime.almanca}</td>
                <td>${kelime.turkce}</td>
            </tr>
        `;
    });
}

function uygulamaIlerlemesiniSifirla() {
    kelimeListesi.forEach(kelime => { kelime.durum = 'bilmiyorum'; });
    verileriKaydet();
    menuIstatistikleriniGuncelle();
    profilIstatistikleriniGuncelle();
    landingScreen.style.display = 'flex';
    flashcardScreen.style.display = 'none';
    mainMenu.style.display = 'none';
    bildirimGoster('Kart ilerlemesi sıfırlandı.');
}

function mobilSesKilidiniAc() {
    if ('speechSynthesis' in window) {
        const silentUtterance = new SpeechSynthesisUtterance('');
        silentUtterance.volume = 0;
        window.speechSynthesis.speak(silentUtterance);
        sesMotorunuHazirla();
    }
}

function sesMotorunuHazirla() {
    if (!('speechSynthesis' in window)) return;
    mevcutVoices = window.speechSynthesis.getVoices();
    if (speechSynthesis.onvoiceschanged !== undefined) {
        speechSynthesis.onvoiceschanged = () => {
            mevcutVoices = window.speechSynthesis.getVoices();
        };
    }
}

function kelimeyiOku() {
    if (!aktifKelimeler.length || aktifIndex >= aktifKelimeler.length) return;
    if (!('speechSynthesis' in window)) return;

    const guncelKelime = aktifKelimeler[aktifIndex];
    const almancaKelime = guncelKelime?.almanca?.trim() || '';
    const artikel = guncelKelime?.artikel?.trim() || '';

    let okunacakMetin = almancaKelime;
    if (guncelKelime?.kategori === 'isim' && artikel) {
        okunacakMetin = `${artikel} ${almancaKelime}`;
    }

    const kelimeSesi = new SpeechSynthesisUtterance(okunacakMetin);
    kelimeSesi.lang = 'de-DE';
    kelimeSesi.rate = 0.7;

    mevcutVoices = window.speechSynthesis.getVoices();
    const almancaVoice = mevcutVoices.find(v => v.lang === 'de-DE') || mevcutVoices.find(v => v.lang?.startsWith('de'));
    if (almancaVoice) kelimeSesi.voice = almancaVoice;

    try {
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(kelimeSesi);
    } catch (e) {
        console.error(e);
    }
}

function ornekCumleyiOku() {
    if (!aktifKelimeler.length || aktifIndex >= aktifKelimeler.length) return;
    if (!('speechSynthesis' in window)) return;

    const guncelKelime = aktifKelimeler[aktifIndex];
    const ornekCumle = guncelKelime?.ornek_cumle?.trim();
    if (!ornekCumle) return;

    const cumleSesi = new SpeechSynthesisUtterance(ornekCumle);
    cumleSesi.lang = 'de-DE';
    cumleSesi.rate = 0.65;

    mevcutVoices = window.speechSynthesis.getVoices();
    const almancaVoice = mevcutVoices.find(v => v.lang === 'de-DE') || mevcutVoices.find(v => v.lang?.startsWith('de'));
    if (almancaVoice) cumleSesi.voice = almancaVoice;

    try {
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(cumleSesi);
    } catch (e) {
        console.error(e);
    }
}

// Not Kutucuğu İşlevleri
const btnNotAc = document.getElementById('btn-not-ac');
const btnNotKapat = document.getElementById('btn-not-kapat');
const notKutusu = document.getElementById('not-kutusu');
const notAlani = document.getElementById('not-alani');

// "Not Al" butonuna basınca kutuyu aç
btnNotAc.addEventListener('click', () => {
    notKutusu.style.display = 'block';
    btnNotAc.style.display = 'none'; // Açıkken butonu gizle (isteğe bağlı)
});

// "Kapat" butonuna basınca kutuyu kapat
btnNotKapat.addEventListener('click', () => {
    notKutusu.style.display = 'none';
    btnNotAc.style.display = 'block';
});
