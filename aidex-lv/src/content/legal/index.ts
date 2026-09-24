/**
 * LEGAL PAGE DRAFTS — GREEN ENERGY SIA / AIDEX.lv
 * ---------------------------------------------------------------------------
 * Drafted from the actual functionality of this website (lead form, calculator
 * running in the browser, consent-gated analytics/marketing, no accounts, no
 * online payments). DRAFT: must be reviewed by a qualified lawyer before launch.
 * Company facts are injected from src/config/company.ts; missing facts render
 * as visible "[to be confirmed]" markers.
 */
import { company, group, groupRelationship, integrations, isPlaceholder, officeAddress, type Field } from '../../config/company';
import { calculatorAssumptions } from '../../data/calculator';
import type { Locale } from '../../i18n/routes';
import { SHOW_DEV_MARKERS } from '../../config/site';

export type LegalKey = 'privacy' | 'cookies' | 'terms' | 'legal';
export interface LegalDoc { title: string; intro: string; sections: { h: string; html: string }[] }

const tbc: Record<Locale, string> = { lv: 'tiks precizēts', ru: 'будет уточнено', en: 'to be confirmed' };
const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
const f = (v: Field, lang: Locale) =>
  isPlaceholder(v) ? (SHOW_DEV_MARKERS ? `<span class="ph" title="${esc(v.note)}">[${tbc[lang]}]</span>` : '') : esc(v);
/** First known value, e.g. privacy e-mail falling back to the general e-mail. */
const first = (lang: Locale, ...vs: Field[]) => f(vs.find((v) => !isPlaceholder(v)) ?? vs[0], lang);
/** Joins known values with commas (skips values still missing). */
const join = (lang: Locale, ...vs: Field[]) => vs.map((v) => f(v, lang)).filter(Boolean).join(', ');
/** Internal review note, shown only with dev markers on. */
const note = (s: string) => (SHOW_DEV_MARKERS ? ` <span class="ph">[${s}]</span>` : '');

type Ctx = { lang: Locale; links: { privacy: string; cookies: string; settings: string } };

function controller(c: Ctx) {
  const { lang } = c;
  const rows = {
    lv: ['Nosaukums', 'Reģistrācijas numurs', 'PVN maksātāja numurs', 'Juridiskā adrese', 'Biroja adrese', 'E-pasts', 'Datu aizsardzības jautājumi', 'Tālrunis', 'Tīmekļvietne'],
    ru: ['Наименование', 'Регистрационный номер', 'Номер плательщика НДС', 'Юридический адрес', 'Адрес офиса', 'Эл. почта', 'Вопросы защиты данных', 'Телефон', 'Сайт'],
    en: ['Name', 'Registration number', 'VAT number', 'Registered address', 'Office address', 'Email', 'Data-protection contact', 'Phone', 'Website'],
  }[lang];
  const office = officeAddress();
  const vals = [esc(company.legalName), f(company.registrationNumber, lang), f(company.vatNumber, lang), f(company.registeredAddress, lang), office ? esc(office) : '', f(company.email, lang), f(company.privacyEmail, lang), f(company.phone, lang), esc(company.domain)];
  return `<table><tbody>${rows.map((r, i) => (vals[i] ? `<tr><th scope="row">${r}</th><td>${vals[i]}</td></tr>` : '')).join('')}</tbody></table>`;
}

function cookieTable(lang: Locale) {
  const h = {
    lv: ['Nosaukums', 'Kategorija', 'Nolūks', 'Glabāšanas ilgums', 'Nodrošinātājs'],
    ru: ['Название', 'Категория', 'Назначение', 'Срок хранения', 'Поставщик'],
    en: ['Name', 'Category', 'Purpose', 'Duration', 'Provider'],
  }[lang];
  const cat = { lv: ['Nepieciešamā', 'Analītika', 'Mārketings'], ru: ['Необходимый', 'Аналитика', 'Маркетинг'], en: ['Necessary', 'Analytics', 'Marketing'] }[lang];
  const inactive = { lv: ' (pašlaik nav aktivizēts)', ru: ' (в данный момент не активирован)', en: ' (not currently active)' }[lang];
  const rows = [
    ['aidex_consent', cat[0], { lv: 'Saglabā jūsu sīkdatņu izvēli (sīkdatne un pārlūka localStorage)', ru: 'Сохраняет ваш выбор по cookie (cookie и localStorage браузера)', en: 'Stores your cookie choice (cookie and browser localStorage)' }[lang], { lv: '6 mēneši', ru: '6 месяцев', en: '6 months' }[lang], 'AIDEX.lv'],
    ['_ga, _ga_*', cat[1], { lv: 'Google Analytics: apmeklējumu statistika', ru: 'Google Analytics: статистика посещений', en: 'Google Analytics: visit statistics' }[lang] + (integrations.googleAnalyticsId ? '' : inactive), { lv: 'līdz 2 gadiem', ru: 'до 2 лет', en: 'up to 2 years' }[lang], 'Google Ireland Ltd.'],
    ['_fbp, _fbc', cat[2], { lv: 'Meta Pixel: reklāmas efektivitātes mērīšana', ru: 'Meta Pixel: измерение эффективности рекламы', en: 'Meta Pixel: advertising measurement' }[lang] + (integrations.metaPixelId ? '' : inactive), { lv: 'līdz 3 mēnešiem', ru: 'до 3 месяцев', en: 'up to 3 months' }[lang], 'Meta Platforms Ireland Ltd.'],
  ];
  return `<table><thead><tr>${h.map((x) => `<th scope="col">${x}</th>`).join('')}</tr></thead><tbody>${rows.map((r) => `<tr>${r.map((x) => `<td>${x}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
}

const ops = () => esc(company.legalName);

export function legalDoc(key: LegalKey, c: Ctx): LegalDoc {
  const { lang, links } = c;
  const L = ops();
  const priv = `<a href="${links.privacy}">`;
  const cook = `<a href="${links.cookies}">`;
  const settings = `<a href="${links.settings}" data-cookie-settings>`;

  const docs: Record<Locale, Record<LegalKey, LegalDoc>> = {
    // ======================================================================= LV
    lv: {
      privacy: {
        title: 'Privātuma politika',
        intro: `Šī politika skaidro, kā ${L} (turpmāk — “mēs”) apstrādā personas datus, kad jūs izmantojat vietni AIDEX.lv, pieprasāt aprēķinu vai sazināties ar mums. Mēs apstrādājam datus saskaņā ar Vispārīgo datu aizsardzības regulu (VDAR/GDPR) un Latvijas normatīvajiem aktiem.`,
        sections: [
          { h: '1. Pārzinis', html: `<p>Personas datu pārzinis ir vietnes AIDEX.lv pārvaldītājs:</p>${controller(c)}` },
          { h: '2. Kādus datus mēs apstrādājam', html: `<ul><li><strong>Pieteikuma dati:</strong> objekta adrese vai apdzīvotā vieta, vidējais elektroenerģijas patēriņš vai rēķins, interešu joma (saules paneļi, akumulators, elektroauto uzlāde, konsultācija), vārds, tālruņa numurs, e-pasta adrese, kā arī — ja norādīts — izvēlētais komplekts, lapa, no kuras nosūtīts pieteikums, un kampaņas parametri (UTM).</li><li><strong>Saziņas dati:</strong> sarakste un sarunu saturs, ja sazināties ar mums.</li><li><strong>Līguma dati:</strong> ja noslēdzam līgumu — objekta tehniskā informācija, rēķinu un maksājumu informācija.</li><li><strong>Tehniskie dati:</strong> IP adrese, pārlūka veids un servera žurnālieraksti, kas nepieciešami vietnes darbībai un drošībai.</li><li><strong>Sīkdatnes:</strong> skatīt ${cook}Sīkdatņu politiku</a>.</li></ul><p>Izmaksu kalkulators darbojas jūsu pārlūkā; tajā ievadītie skaitļi netiek nosūtīti mums, ja vien jūs pats neiesniedzat pieteikumu.</p>` },
          { h: '3. Nolūki un tiesiskais pamats', html: `<table><thead><tr><th>Nolūks</th><th>Tiesiskais pamats</th></tr></thead><tbody><tr><td>Aprēķina un piedāvājuma sagatavošana pēc jūsu pieprasījuma, saziņa par to</td><td>Pasākumi pirms līguma noslēgšanas pēc datu subjekta pieprasījuma (VDAR 6. panta 1. punkta b) apakšpunkts)</td></tr><tr><td>Līguma izpilde: apsekošana, projektēšana, uzstādīšana, garantija un serviss</td><td>Līguma izpilde (6. panta 1. punkta b) apakšpunkts)</td></tr><tr><td>Grāmatvedība, nodokļi, atbalsta programmu dokumentācija</td><td>Juridisks pienākums (6. panta 1. punkta c) apakšpunkts)</td></tr><tr><td>Vietnes drošība, ļaunprātīgas izmantošanas novēršana, prasījumu aizstāvība</td><td>Leģitīmās intereses (6. panta 1. punkta f) apakšpunkts)</td></tr><tr><td>Analītika un mārketings, izmantojot sīkdatnes</td><td>Piekrišana (6. panta 1. punkta a) apakšpunkts)</td></tr></tbody></table><p>Mēs neizmantojam pieteikuma datus mārketinga ziņojumu sūtīšanai, ja vien neesat devis atsevišķu, brīvprātīgu piekrišanu.</p>` },
          { h: '4. Datu saņēmēji', html: `<p>Dati var tikt nodoti tikai tādā apjomā, kāds nepieciešams norādītajiem nolūkiem:</p><ul><li>IT, mitināšanas, e-pasta un klientu attiecību pārvaldības (CRM) pakalpojumu sniedzējiem, kas darbojas kā apstrādātāji uz līguma pamata;</li><li>uzstādīšanas un projektēšanas apakšuzņēmējiem, ja tas nepieciešams jūsu projekta īstenošanai;</li><li>sadales sistēmas operatoram un atbalsta programmas administrētājam, ja pieprasāt palīdzību pieslēguma vai atbalsta saņemšanā;</li><li>${esc(group.name)} uzņēmumiem — tikai tad, ja tas nepieciešams jūsu pieprasījuma izpildei un tam ir tiesisks pamats;${note('precizēt grupas uzņēmumus un to lomu')};</li><li>valsts iestādēm, ja to prasa normatīvie akti.</li></ul>` },
          { h: '5. Nodošana ārpus EEZ', html: `<p>Ja kāds pakalpojumu sniedzējs apstrādā datus ārpus Eiropas Ekonomikas zonas, mēs nodrošinām atbilstošas garantijas, piemēram, Eiropas Komisijas lēmumu par aizsardzības līmeņa pietiekamību vai standarta līguma klauzulas.</p>` },
          { h: '6. Glabāšanas termiņi', html: `<ul><li>Pieteikumi, kas nav noveduši pie līguma: līdz 12 mēnešiem${note('apstiprināt')} pēc pēdējās saziņas.</li><li>Līguma un grāmatvedības dokumenti: tik ilgi, cik to nosaka Latvijas normatīvie akti, un garantijas perioda laikā.</li><li>Piekrišanas ieraksti: kamēr piekrišana ir spēkā un pēc tam tik ilgi, cik nepieciešams tās pierādīšanai.</li></ul>` },
          { h: '7. Jūsu tiesības', html: `<p>Jums ir tiesības piekļūt saviem datiem, labot tos, dzēst tos, ierobežot apstrādi, iebilst pret apstrādi, kas balstīta uz leģitīmām interesēm, un saņemt datus pārnesamā formātā. Ja apstrāde balstīta uz piekrišanu, jūs varat to jebkurā laikā atsaukt — sīkdatnēm to var izdarīt ${settings}sīkdatņu iestatījumos</a>. Pieprasījumus sūtiet uz ${first(lang, company.privacyEmail, company.email)}.</p><p>Jums ir tiesības iesniegt sūdzību Datu valsts inspekcijai (<a href="https://www.dvi.gov.lv" rel="noopener" target="_blank">www.dvi.gov.lv</a>).</p>` },
          { h: '8. Automatizēti lēmumi', html: `<p>Mēs nepieņemam lēmumus, kas balstīti tikai uz automatizētu apstrādi un rada jums juridiskas vai līdzīgi būtiskas sekas. Kalkulatora rezultāti ir tikai indikatīvi.</p>` },
          { h: '9. Drošība', html: `<p>Mēs izmantojam piemērotus tehniskus un organizatoriskus pasākumus, tostarp šifrētu savienojumu (HTTPS) un piekļuves ierobežošanu, lai aizsargātu datus.</p>` },
          { h: '10. Izmaiņas', html: `<p>Mēs varam atjaunināt šo politiku. Aktuālā versija vienmēr ir pieejama šajā lapā, norādot pēdējo izmaiņu datumu.</p>` },
        ],
      },
      cookies: {
        title: 'Sīkdatņu politika',
        intro: `Šī politika skaidro, kā ${L} vietnē AIDEX.lv izmanto sīkdatnes un līdzīgas tehnoloģijas un kā jūs varat pārvaldīt savu izvēli.`,
        sections: [
          { h: '1. Kas ir sīkdatnes', html: `<p>Sīkdatnes ir nelielas teksta datnes, ko vietne saglabā jūsu ierīcē. Līdzīgi darbojas pārlūka localStorage. Tās palīdz vietnei darboties un — ar jūsu piekrišanu — ļauj mums saprast vietnes lietošanu un mērīt reklāmas efektivitāti.</p>` },
          { h: '2. Kategorijas', html: `<ul><li><strong>Nepieciešamās</strong> — vienmēr aktīvas; nodrošina vietnes darbību un jūsu izvēles saglabāšanu.</li><li><strong>Analītika</strong> — tikai ar jūsu piekrišanu.</li><li><strong>Mārketings</strong> — tikai ar jūsu piekrišanu.</li></ul><p>Līdz jūs izdarāt izvēli, analītikas un mārketinga skripti netiek ielādēti. Mēs izmantojam Google piekrišanas režīmu (Consent Mode), kurā noklusējumā visas nebūtiskās glabāšanas atļaujas ir atteiktas.</p>` },
          { h: '3. Izmantotās sīkdatnes', html: cookieTable(lang) },
          { h: '4. Izvēles pārvaldība un atsaukšana', html: `<p>Savu izvēli varat mainīt vai atsaukt jebkurā laikā, atverot ${settings}sīkdatņu iestatījumus</a> (saite pieejama arī katras lapas kājenē). Atsaucot piekrišanu, mēs dzēšam attiecīgās kategorijas sīkdatnes, kuras varam dzēst, un pārlādējam lapu. Sīkdatnes varat dzēst arī pārlūka iestatījumos.</p><p>Jūsu izvēle tiek saglabāta 6 mēnešus; pēc tam, kā arī mainot sīkdatņu kategorijas, mēs jautāsim vēlreiz.</p>` },
          { h: '5. Vairāk informācijas', html: `<p>Par personas datu apstrādi lasiet ${priv}Privātuma politikā</a>.</p>` },
        ],
      },
      terms: {
        title: 'Lietošanas noteikumi',
        intro: `Šie noteikumi attiecas uz vietnes AIDEX.lv lietošanu. Vietni pārvalda ${L}.`,
        sections: [
          { h: '1. Informācijas raksturs', html: `<p>Vietnē sniegtā informācija, tostarp komplektu cenas, kalkulatora rezultāti un informācija par valsts atbalstu, ir indikatīva un nav uzskatāma par saistošu piedāvājumu. Precīza cena un nosacījumi tiek noteikti individuālā piedāvājumā pēc objekta izvērtēšanas un rakstiskā līgumā.</p><p>Kalkulators izmanto vidējus pieņēmumus (piemēram, ražošanu ~${calculatorAssumptions.specificYield} kWh uz kW gadā un elektrības cenu ${calculatorAssumptions.electricityPrice} €/kWh); faktiskie rezultāti var atšķirties.</p>` },
          { h: '2. Valsts atbalsts', html: `<p>Atbalsta programmu nosacījumus nosaka to administrētāji. Mēs palīdzam ar dokumentiem, bet negarantējam atbalsta piešķiršanu vai tā apmēru.</p>` },
          { h: '3. Pieteikumi', html: `<p>Iesniedzot pieteikumu, jūs apņematies sniegt patiesu informāciju. Pieteikums neuzliek jums saistības.</p>` },
          { h: '4. Intelektuālais īpašums', html: `<p>Vietnes saturs, dizains un preču zīmes pieder ${L} vai tiek izmantotas ar tiesību īpašnieka atļauju. Bez atļaujas saturu nedrīkst kopēt komerciālos nolūkos.</p>` },
          { h: '5. Ārējās saites', html: `<p>Vietnē ir saites uz citām vietnēm, piemēram, <a href="${group.url}" rel="noopener" target="_blank">${esc(group.name)}</a>. Par to saturu un privātuma praksi atbild attiecīgo vietņu pārvaldītāji.</p>` },
          { h: '6. Atbildība', html: `<p>Mēs cenšamies uzturēt precīzu un aktuālu informāciju, taču neatbildam par zaudējumiem, kas radušies, paļaujoties uz indikatīvu informāciju bez individuāla piedāvājuma. Šis noteikums neierobežo patērētāju tiesības, kuras nevar ierobežot saskaņā ar likumu.</p>` },
          { h: '7. Piemērojamie tiesību akti un strīdi', html: `<p>Noteikumiem piemēro Latvijas Republikas tiesību aktus. Patērētāji strīdu gadījumā var vērsties arī Patērētāju tiesību aizsardzības centrā (<a href="https://www.ptac.gov.lv" rel="noopener" target="_blank">www.ptac.gov.lv</a>).</p>` },
          { h: '8. Kontakti', html: `<p>${[L, join(lang, company.registeredAddress, company.email)].filter(Boolean).join(', ')}.</p>` },
        ],
      },
      legal: {
        title: 'Juridiskā informācija',
        intro: `AIDEX.lv pārvalda ${L}.`,
        sections: [
          { h: 'Vietnes pārvaldītājs', html: controller(c) },
          { h: `Saistība ar ${esc(group.name)}`, html: `${f(groupRelationship.legal[lang], lang) ? `<p>${f(groupRelationship.legal[lang], lang)}</p>` : ''}<p><a href="${group.url}" rel="noopener" target="_blank">${esc(group.url)}</a></p>` },
          { h: 'Dokumenti', html: `<ul><li>${priv}Privātuma politika</a></li><li>${cook}Sīkdatņu politika</a></li><li>${settings}Sīkdatņu iestatījumi</a></li></ul>` },
          { h: 'Attēli', html: `<p>Izstrādes versijā izmantotie attēli ir oriģinālas datorgrafikas vizualizācijas un tiks aizstāti ar AIDEX projektu fotogrāfijām.</p>` },
        ],
      },
    },

    // ======================================================================= RU
    ru: {
      privacy: {
        title: 'Политика конфиденциальности',
        intro: `Настоящая политика объясняет, как ${L} (далее — «мы») обрабатывает персональные данные, когда вы пользуетесь сайтом AIDEX.lv, запрашиваете расчёт или связываетесь с нами. Мы обрабатываем данные в соответствии с Общим регламентом по защите данных (GDPR) и законодательством Латвии.`,
        sections: [
          { h: '1. Контролёр данных', html: `<p>Контролёром персональных данных является оператор сайта AIDEX.lv:</p>${controller(c)}` },
          { h: '2. Какие данные мы обрабатываем', html: `<ul><li><strong>Данные заявки:</strong> адрес объекта или населённый пункт, среднее потребление электроэнергии или сумма счёта, область интереса (солнечные панели, аккумулятор, зарядка электромобиля, консультация), имя, номер телефона, адрес эл. почты, а также — если указано — выбранный комплект, страница, с которой отправлена заявка, и параметры кампании (UTM).</li><li><strong>Данные переписки:</strong> содержание переписки и разговоров, если вы связываетесь с нами.</li><li><strong>Договорные данные:</strong> при заключении договора — техническая информация об объекте, данные счетов и платежей.</li><li><strong>Технические данные:</strong> IP-адрес, тип браузера и серверные журналы, необходимые для работы и безопасности сайта.</li><li><strong>Файлы cookie:</strong> см. ${cook}Политику использования cookie</a>.</li></ul><p>Калькулятор стоимости работает в вашем браузере; введённые в него данные не передаются нам, если вы сами не отправите заявку.</p>` },
          { h: '3. Цели и правовые основания', html: `<table><thead><tr><th>Цель</th><th>Правовое основание</th></tr></thead><tbody><tr><td>Подготовка расчёта и предложения по вашему запросу, связь по нему</td><td>Действия до заключения договора по запросу субъекта данных (ст. 6(1)(b) GDPR)</td></tr><tr><td>Исполнение договора: осмотр, проектирование, установка, гарантия и сервис</td><td>Исполнение договора (ст. 6(1)(b))</td></tr><tr><td>Бухгалтерский учёт, налоги, документация программ поддержки</td><td>Юридическая обязанность (ст. 6(1)(c))</td></tr><tr><td>Безопасность сайта, предотвращение злоупотреблений, защита требований</td><td>Законные интересы (ст. 6(1)(f))</td></tr><tr><td>Аналитика и маркетинг с использованием cookie</td><td>Согласие (ст. 6(1)(a))</td></tr></tbody></table><p>Мы не используем данные заявки для маркетинговых рассылок без вашего отдельного добровольного согласия.</p>` },
          { h: '4. Получатели данных', html: `<p>Данные передаются только в объёме, необходимом для указанных целей:</p><ul><li>поставщикам ИТ-услуг, хостинга, эл. почты и CRM, действующим как обработчики на основании договора;</li><li>субподрядчикам по установке и проектированию, если это необходимо для реализации вашего проекта;</li><li>оператору распределительной сети и администратору программы поддержки, если вы просите помощи с подключением или получением поддержки;</li><li>компаниям ${esc(group.name)} — только если это необходимо для выполнения вашего запроса и есть правовое основание;${note('уточнить компании группы и их роль')};</li><li>государственным учреждениям, если этого требует законодательство.</li></ul>` },
          { h: '5. Передача за пределы ЕЭЗ', html: `<p>Если поставщик услуг обрабатывает данные за пределами Европейской экономической зоны, мы обеспечиваем надлежащие гарантии, например решение Европейской комиссии об адекватности или стандартные договорные условия.</p>` },
          { h: '6. Сроки хранения', html: `<ul><li>Заявки, не приведшие к договору: до 12 месяцев${note('подтвердить')} после последнего контакта.</li><li>Договорные и бухгалтерские документы: в течение срока, установленного законодательством Латвии, и в течение гарантийного периода.</li><li>Записи о согласии: пока согласие действует и затем столько, сколько необходимо для его подтверждения.</li></ul>` },
          { h: '7. Ваши права', html: `<p>Вы вправе получить доступ к своим данным, исправить их, удалить, ограничить обработку, возразить против обработки на основании законных интересов и получить данные в переносимом формате. Если обработка основана на согласии, вы можете отозвать его в любое время — для cookie это можно сделать в ${settings}настройках cookie</a>. Запросы направляйте по адресу ${first(lang, company.privacyEmail, company.email)}.</p><p>Вы вправе подать жалобу в Государственную инспекцию данных Латвии (<a href="https://www.dvi.gov.lv" rel="noopener" target="_blank">www.dvi.gov.lv</a>).</p>` },
          { h: '8. Автоматизированные решения', html: `<p>Мы не принимаем решений, основанных исключительно на автоматизированной обработке и влекущих для вас юридические или аналогично значимые последствия. Результаты калькулятора носят лишь ориентировочный характер.</p>` },
          { h: '9. Безопасность', html: `<p>Мы применяем надлежащие технические и организационные меры, включая зашифрованное соединение (HTTPS) и ограничение доступа.</p>` },
          { h: '10. Изменения', html: `<p>Мы можем обновлять эту политику. Актуальная версия всегда доступна на этой странице с указанием даты последнего изменения.</p>` },
        ],
      },
      cookies: {
        title: 'Политика использования файлов cookie',
        intro: `Настоящая политика объясняет, как ${L} использует файлы cookie и аналогичные технологии на сайте AIDEX.lv и как вы можете управлять своим выбором.`,
        sections: [
          { h: '1. Что такое cookie', html: `<p>Cookie — это небольшие текстовые файлы, которые сайт сохраняет на вашем устройстве. Аналогично работает localStorage браузера. Они обеспечивают работу сайта и — с вашего согласия — помогают нам понимать использование сайта и измерять эффективность рекламы.</p>` },
          { h: '2. Категории', html: `<ul><li><strong>Необходимые</strong> — всегда активны; обеспечивают работу сайта и сохранение вашего выбора.</li><li><strong>Аналитика</strong> — только с вашего согласия.</li><li><strong>Маркетинг</strong> — только с вашего согласия.</li></ul><p>Пока вы не сделали выбор, скрипты аналитики и маркетинга не загружаются. Мы используем режим согласия Google (Consent Mode), в котором по умолчанию все необязательные разрешения на хранение отклонены.</p>` },
          { h: '3. Используемые cookie', html: cookieTable(lang) },
          { h: '4. Управление выбором и отзыв согласия', html: `<p>Вы можете изменить или отозвать свой выбор в любое время в ${settings}настройках cookie</a> (ссылка есть и внизу каждой страницы). При отзыве согласия мы удаляем доступные нам cookie соответствующей категории и перезагружаем страницу. Cookie также можно удалить в настройках браузера.</p><p>Ваш выбор хранится 6 месяцев; после этого, а также при изменении категорий cookie, мы спросим снова.</p>` },
          { h: '5. Дополнительная информация', html: `<p>Об обработке персональных данных читайте в ${priv}Политике конфиденциальности</a>.</p>` },
        ],
      },
      terms: {
        title: 'Условия использования',
        intro: `Настоящие условия применяются к использованию сайта AIDEX.lv. Оператор сайта — ${L}.`,
        sections: [
          { h: '1. Характер информации', html: `<p>Информация на сайте, включая цены комплектов, результаты калькулятора и сведения о государственной поддержке, носит ориентировочный характер и не является обязывающим предложением. Точная цена и условия определяются в индивидуальном предложении после оценки объекта и в письменном договоре.</p><p>Калькулятор использует средние допущения (например, выработку ~${calculatorAssumptions.specificYield} кВт·ч на кВт в год и цену электроэнергии ${calculatorAssumptions.electricityPrice} €/кВт·ч); фактические результаты могут отличаться.</p>` },
          { h: '2. Государственная поддержка', html: `<p>Условия программ поддержки устанавливают их администраторы. Мы помогаем с документами, но не гарантируем предоставление поддержки или её размер.</p>` },
          { h: '3. Заявки', html: `<p>Отправляя заявку, вы обязуетесь предоставить достоверную информацию. Заявка не налагает на вас обязательств.</p>` },
          { h: '4. Интеллектуальная собственность', html: `<p>Содержание сайта, дизайн и товарные знаки принадлежат ${L} или используются с разрешения правообладателя. Копирование материалов в коммерческих целях без разрешения запрещено.</p>` },
          { h: '5. Внешние ссылки', html: `<p>Сайт содержит ссылки на другие сайты, например <a href="${group.url}" rel="noopener" target="_blank">${esc(group.name)}</a>. За их содержание и практику конфиденциальности отвечают их операторы.</p>` },
          { h: '6. Ответственность', html: `<p>Мы стремимся поддерживать точную и актуальную информацию, но не несём ответственности за убытки, возникшие в результате использования ориентировочной информации без индивидуального предложения. Это положение не ограничивает права потребителей, которые не могут быть ограничены по закону.</p>` },
          { h: '7. Применимое право и споры', html: `<p>К условиям применяется законодательство Латвийской Республики. Потребители в случае спора могут также обратиться в Центр защиты прав потребителей (<a href="https://www.ptac.gov.lv" rel="noopener" target="_blank">www.ptac.gov.lv</a>).</p>` },
          { h: '8. Контакты', html: `<p>${[L, join(lang, company.registeredAddress, company.email)].filter(Boolean).join(', ')}.</p>` },
        ],
      },
      legal: {
        title: 'Юридическая информация',
        intro: `Сайтом AIDEX.lv управляет ${L}.`,
        sections: [
          { h: 'Оператор сайта', html: controller(c) },
          { h: `Связь с ${esc(group.name)}`, html: `${f(groupRelationship.legal[lang], lang) ? `<p>${f(groupRelationship.legal[lang], lang)}</p>` : ''}<p><a href="${group.url}" rel="noopener" target="_blank">${esc(group.url)}</a></p>` },
          { h: 'Документы', html: `<ul><li>${priv}Политика конфиденциальности</a></li><li>${cook}Политика использования cookie</a></li><li>${settings}Настройки cookie</a></li></ul>` },
          { h: 'Изображения', html: `<p>Изображения в версии для разработки — оригинальные компьютерные визуализации; они будут заменены фотографиями проектов AIDEX.</p>` },
        ],
      },
    },

    // ======================================================================= EN
    en: {
      privacy: {
        title: 'Privacy Policy',
        intro: `This policy explains how ${L} (“we”, “us”) processes personal data when you use AIDEX.lv, request an estimate or contact us. We process data in accordance with the General Data Protection Regulation (GDPR) and Latvian law.`,
        sections: [
          { h: '1. Data controller', html: `<p>The controller of your personal data is the operator of AIDEX.lv:</p>${controller(c)}` },
          { h: '2. What data we process', html: `<ul><li><strong>Request data:</strong> property address or town, average electricity consumption or bill, your interests (solar panels, battery, EV charging, consultation), name, phone number, email address and — where provided — the selected package, the page the request was sent from and campaign parameters (UTM).</li><li><strong>Correspondence:</strong> the content of messages and calls if you contact us.</li><li><strong>Contract data:</strong> if we enter into a contract — technical information about the property, invoices and payments.</li><li><strong>Technical data:</strong> IP address, browser type and server logs needed to operate and secure the website.</li><li><strong>Cookies:</strong> see our ${cook}Cookie Policy</a>.</li></ul><p>The cost calculator runs in your browser; the figures you enter are not sent to us unless you submit a request.</p>` },
          { h: '3. Purposes and legal bases', html: `<table><thead><tr><th>Purpose</th><th>Legal basis</th></tr></thead><tbody><tr><td>Preparing an estimate and offer at your request, and communicating about it</td><td>Steps taken at your request before entering into a contract (Art. 6(1)(b) GDPR)</td></tr><tr><td>Performing the contract: site survey, design, installation, warranty and service</td><td>Performance of a contract (Art. 6(1)(b))</td></tr><tr><td>Accounting, tax and support-programme documentation</td><td>Legal obligation (Art. 6(1)(c))</td></tr><tr><td>Website security, abuse prevention, defence of legal claims</td><td>Legitimate interests (Art. 6(1)(f))</td></tr><tr><td>Analytics and marketing using cookies</td><td>Consent (Art. 6(1)(a))</td></tr></tbody></table><p>We do not use request data to send marketing messages unless you have given separate, voluntary consent.</p>` },
          { h: '4. Recipients', html: `<p>Data is shared only to the extent needed for these purposes:</p><ul><li>IT, hosting, email and CRM service providers acting as processors under contract;</li><li>installation and design subcontractors where needed to deliver your project;</li><li>the distribution system operator and the support-programme administrator if you ask for help with grid connection or support;</li><li>${esc(group.name)} companies — only where necessary to fulfil your request and where a legal basis exists;${note('specify group companies and their role')};</li><li>public authorities where required by law.</li></ul>` },
          { h: '5. Transfers outside the EEA', html: `<p>If a service provider processes data outside the European Economic Area, we put appropriate safeguards in place, such as a European Commission adequacy decision or Standard Contractual Clauses.</p>` },
          { h: '6. Retention', html: `<ul><li>Requests that do not lead to a contract: up to 12 months${note('confirm')} after the last contact.</li><li>Contract and accounting records: for the period required by Latvian law and throughout the warranty period.</li><li>Consent records: while the consent is valid and afterwards for as long as needed to demonstrate it.</li></ul>` },
          { h: '7. Your rights', html: `<p>You have the right to access, rectify and erase your data, to restrict processing, to object to processing based on legitimate interests and to data portability. Where processing is based on consent, you may withdraw it at any time — for cookies, via the ${settings}cookie settings</a>. Send requests to ${first(lang, company.privacyEmail, company.email)}.</p><p>You have the right to lodge a complaint with the Data State Inspectorate of Latvia (<a href="https://www.dvi.gov.lv" rel="noopener" target="_blank">www.dvi.gov.lv</a>).</p>` },
          { h: '8. Automated decisions', html: `<p>We do not make decisions based solely on automated processing that produce legal or similarly significant effects for you. Calculator results are indicative only.</p>` },
          { h: '9. Security', html: `<p>We use appropriate technical and organisational measures, including encrypted connections (HTTPS) and access restrictions, to protect your data.</p>` },
          { h: '10. Changes', html: `<p>We may update this policy. The current version is always available on this page with the date of the last change.</p>` },
        ],
      },
      cookies: {
        title: 'Cookie Policy',
        intro: `This policy explains how ${L} uses cookies and similar technologies on AIDEX.lv and how you can manage your choices.`,
        sections: [
          { h: '1. What cookies are', html: `<p>Cookies are small text files a website stores on your device. Browser localStorage works in a similar way. They make the website work and — with your consent — help us understand how the site is used and measure advertising.</p>` },
          { h: '2. Categories', html: `<ul><li><strong>Necessary</strong> — always active; keep the site working and remember your choice.</li><li><strong>Analytics</strong> — only with your consent.</li><li><strong>Marketing</strong> — only with your consent.</li></ul><p>Until you make a choice, no analytics or marketing scripts are loaded. We use Google Consent Mode with all non-essential storage denied by default.</p>` },
          { h: '3. Cookies we use', html: cookieTable(lang) },
          { h: '4. Managing and withdrawing consent', html: `<p>You can change or withdraw your choice at any time in the ${settings}cookie settings</a> (also linked in the footer of every page). When you withdraw consent, we delete the cookies of that category that we are able to delete and reload the page. You can also delete cookies in your browser settings.</p><p>Your choice is stored for 6 months; after that, or if our cookie categories change, we will ask again.</p>` },
          { h: '5. More information', html: `<p>Read about how we process personal data in our ${priv}Privacy Policy</a>.</p>` },
        ],
      },
      terms: {
        title: 'Terms and Conditions',
        intro: `These terms govern the use of the AIDEX.lv website, which is operated by ${L}.`,
        sections: [
          { h: '1. Nature of the information', html: `<p>Information on this website, including package prices, calculator results and information about government support, is indicative and does not constitute a binding offer. The exact price and conditions are set in an individual offer after assessing the property and in a written contract.</p><p>The calculator uses average assumptions (for example ~${calculatorAssumptions.specificYield} kWh produced per kW per year and an electricity price of €${calculatorAssumptions.electricityPrice}/kWh); actual results may differ.</p>` },
          { h: '2. Government support', html: `<p>Support-programme conditions are set by their administrators. We help with the paperwork but cannot guarantee that support will be granted or its amount.</p>` },
          { h: '3. Requests', html: `<p>By submitting a request you agree to provide accurate information. A request does not create any obligation for you.</p>` },
          { h: '4. Intellectual property', html: `<p>The website content, design and trademarks belong to ${L} or are used with the owner’s permission. They may not be copied for commercial purposes without permission.</p>` },
          { h: '5. External links', html: `<p>The website links to other sites, such as <a href="${group.url}" rel="noopener" target="_blank">${esc(group.name)}</a>. Their operators are responsible for their content and privacy practices.</p>` },
          { h: '6. Liability', html: `<p>We aim to keep information accurate and up to date but are not liable for losses arising from reliance on indicative information without an individual offer. This does not limit any consumer rights that cannot be limited by law.</p>` },
          { h: '7. Governing law and disputes', html: `<p>These terms are governed by the laws of the Republic of Latvia. Consumers may also contact the Consumer Rights Protection Centre of Latvia (<a href="https://www.ptac.gov.lv" rel="noopener" target="_blank">www.ptac.gov.lv</a>).</p>` },
          { h: '8. Contact', html: `<p>${[L, join(lang, company.registeredAddress, company.email)].filter(Boolean).join(', ')}.</p>` },
        ],
      },
      legal: {
        title: 'Legal information',
        intro: `AIDEX.lv is operated by ${L}.`,
        sections: [
          { h: 'Website operator', html: controller(c) },
          { h: `Relationship with ${esc(group.name)}`, html: `${f(groupRelationship.legal[lang], lang) ? `<p>${f(groupRelationship.legal[lang], lang)}</p>` : ''}<p><a href="${group.url}" rel="noopener" target="_blank">${esc(group.url)}</a></p>` },
          { h: 'Documents', html: `<ul><li>${priv}Privacy Policy</a></li><li>${cook}Cookie Policy</a></li><li>${settings}Cookie settings</a></li></ul>` },
          { h: 'Imagery', html: `<p>Images in this development version are original computer-generated visualisations and will be replaced with AIDEX project photography.</p>` },
        ],
      },
    },
  };
  return docs[lang][key];
}
