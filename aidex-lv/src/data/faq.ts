/**
 * FAQ — homeowner questions before buying solar.
 * Answers are deliberately general and avoid company-specific promises.
 * Numbers that depend on AIDEX offers are pulled from data files at render time.
 */
import type { Localized } from './packages';

export interface FaqItem { id: string; q: Localized; a: Localized; topic: 'cost' | 'tech' | 'process' | 'support' }

export const faq: FaqItem[] = [
  {
    id: 'cost', topic: 'cost',
    q: {
      lv: 'Cik maksā saules paneļu sistēma privātmājai?',
      ru: 'Сколько стоит солнечная система для частного дома?',
      en: 'How much does a home solar system cost?',
    },
    a: {
      lv: 'Cenu nosaka sistēmas jauda, akumulatora izvēle, jumta tips un pieslēguma apstākļi. Mūsu komplektu sadaļā redzamas indikatīvas cenas gan pirms, gan pēc iespējamā valsts atbalsta. Precīzu summu iegūsiet bezmaksas aprēķinā pēc objekta izvērtēšanas.',
      ru: 'Цена зависит от мощности системы, выбора аккумулятора, типа крыши и условий подключения. В разделе комплектов указаны ориентировочные цены до и после возможной государственной поддержки. Точную сумму вы получите в бесплатном расчёте после оценки объекта.',
      en: 'Price depends on system size, whether you add a battery, the roof type and grid connection conditions. Our packages show indicative prices before and after potential government support. You get an exact figure in a free estimate once we have assessed your property.',
    },
  },
  {
    id: 'size', topic: 'tech',
    q: {
      lv: 'Kādas jaudas sistēma man ir nepieciešama?',
      ru: 'Какая мощность системы мне нужна?',
      en: 'What system size do I need?',
    },
    a: {
      lv: 'Vienkāršs orientieris: gada patēriņš kWh, dalīts ar aptuveni 950, dod nepieciešamo jaudu kW. Piemēram, 7 000 kWh gadā atbilst aptuveni 7–8 kW sistēmai. Kalkulators aprēķinās to jūsu vietā, bet inženieris ņems vērā arī jumta orientāciju, noēnojumu un pieslēguma jaudu.',
      ru: 'Простой ориентир: годовое потребление в кВт·ч, делённое примерно на 950, даёт нужную мощность в кВт. Например, 7 000 кВт·ч в год — это система примерно на 7–8 кВт. Калькулятор посчитает это за вас, а инженер учтёт ориентацию крыши, затенение и мощность подключения.',
      en: 'A simple rule of thumb: annual consumption in kWh divided by roughly 950 gives the system size in kW. For example, 7,000 kWh a year suggests a 7–8 kW system. The calculator does this for you, and an engineer then accounts for roof orientation, shading and your grid connection.',
    },
  },
  {
    id: 'worth', topic: 'tech',
    q: {
      lv: 'Vai saules paneļi Latvijā atmaksājas?',
      ru: 'Окупаются ли солнечные панели в Латвии?',
      en: 'Is solar worthwhile in Latvia?',
    },
    a: {
      lv: 'Latvijā saules paneļi gadā saražo aptuveni 900–1 000 kWh uz katru uzstādīto kW — līdzīgi kā Vācijas ziemeļos. Atmaksāšanās laiks ir atkarīgs no elektrības cenas, cik lielu daļu enerģijas izmantojat paši un vai saņemat atbalstu. Kalkulators parādīs indikatīvu atmaksāšanās laiku jūsu situācijai.',
      ru: 'В Латвии панели вырабатывают около 900–1 000 кВт·ч в год на каждый установленный кВт — сопоставимо с севером Германии. Срок окупаемости зависит от цены электроэнергии, доли собственного потребления и наличия поддержки. Калькулятор покажет ориентировочную окупаемость для вашей ситуации.',
      en: 'In Latvia, solar produces roughly 900–1,000 kWh per installed kW each year — comparable to northern Germany. Payback depends on electricity prices, how much of the energy you use yourself and whether you receive support. The calculator shows an indicative payback for your situation.',
    },
  },
  {
    id: 'production', topic: 'tech',
    q: {
      lv: 'Cik daudz elektroenerģijas saražos mana sistēma?',
      ru: 'Сколько электроэнергии выработает моя система?',
      en: 'How much electricity will my system produce?',
    },
    a: {
      lv: 'Aptuveni 90 % gada ražošanas notiek no marta līdz oktobrim, ar maksimumu maijā–jūlijā. 8 kW sistēma ar labu dienvidu orientāciju gadā parasti saražo ap 7 000–8 000 kWh. Precīzu prognozi sagatavojam katram objektam.',
      ru: 'Около 90 % годовой выработки приходится на март–октябрь, пик — май–июль. Система на 8 кВт с хорошей южной ориентацией обычно даёт около 7 000–8 000 кВт·ч в год. Точный прогноз мы готовим для каждого объекта.',
      en: 'About 90% of annual production happens between March and October, peaking in May–July. An 8 kW system with good southern orientation typically produces around 7,000–8,000 kWh a year. We prepare a precise forecast for each property.',
    },
  },
  {
    id: 'winter', topic: 'tech',
    q: {
      lv: 'Vai saules paneļi strādā ziemā?',
      ru: 'Работают ли солнечные панели зимой?',
      en: 'Do solar panels work in winter?',
    },
    a: {
      lv: 'Jā, bet ražošana ir būtiski mazāka īsās dienas un zemās saules dēļ. Aukstums paneļiem netraucē — tie pat strādā efektīvāk. Sniegs uz slīpa, gluda paneļa parasti noslīd pats. Ziemā māja turpina saņemt elektrību no tīkla kā ierasts.',
      ru: 'Да, но выработка заметно ниже из-за короткого дня и низкого солнца. Холод панелям не мешает — они даже работают эффективнее. Снег с наклонной гладкой поверхности обычно сходит сам. Зимой дом, как обычно, получает электроэнергию из сети.',
      en: 'Yes, though output is much lower because of short days and a low sun. Cold does not harm panels — they are actually more efficient. Snow usually slides off a tilted, smooth module. In winter your home simply draws more from the grid, as usual.',
    },
  },
  {
    id: 'battery', topic: 'tech',
    q: {
      lv: 'Vai man ir nepieciešams akumulators?',
      ru: 'Нужен ли мне аккумулятор?',
      en: 'Do I need a battery?',
    },
    a: {
      lv: 'Nav obligāti, bet tas ievērojami palielina to enerģijas daļu, ko izmantojat paši — dienas pārpalikums tiek uzkrāts vakaram un naktij. Akumulators noder arī tad, ja vēlaties rezerves barošanu. Akumulatoram var būt pieejams atsevišķs valsts atbalsts.',
      ru: 'Не обязательно, но он значительно увеличивает долю энергии, которую вы используете сами: дневной излишек сохраняется на вечер и ночь. Аккумулятор полезен и для резервного питания. На аккумулятор может быть доступна отдельная государственная поддержка.',
      en: 'Not necessarily, but it significantly increases the share of solar energy you use yourself — the daytime surplus is stored for the evening and night. It is also useful for backup power. Separate government support may be available for batteries.',
    },
  },
  {
    id: 'time', topic: 'process',
    q: {
      lv: 'Cik ilgi notiek uzstādīšana?',
      ru: 'Сколько длится установка?',
      en: 'How long does installation take?',
    },
    a: {
      lv: 'Montāža uz vietas privātmājai parasti aizņem 1–3 darba dienas. Kopējo termiņu vairāk nosaka projektēšana, aprīkojuma piegāde un pieslēguma saskaņošana ar sadales tīklu — to precizējam piedāvājumā.',
      ru: 'Монтаж на объекте для частного дома обычно занимает 1–3 рабочих дня. Общий срок больше зависит от проектирования, поставки оборудования и согласования подключения с сетевым оператором — мы уточним его в предложении.',
      en: 'On-site installation for a house usually takes 1–3 working days. The overall timeline depends more on design, equipment delivery and grid-connection approval — we confirm it in your offer.',
    },
  },
  {
    id: 'excess', topic: 'tech',
    q: {
      lv: 'Kas notiek ar saražotās elektrības pārpalikumu?',
      ru: 'Что происходит с излишками выработанной электроэнергии?',
      en: 'What happens to excess electricity?',
    },
    a: {
      lv: 'Vispirms enerģiju izmanto māja, tad tā uzlādē akumulatoru (ja tāds ir), un atlikums tiek nodots tīklā. Par nodoto enerģiju norēķinās atbilstoši jūsu elektroenerģijas tirgotāja līgumam un spēkā esošajai norēķinu sistēmai.',
      ru: 'Сначала энергию потребляет дом, затем она заряжает аккумулятор (если он есть), а остаток отдаётся в сеть. Расчёт за отданную энергию производится по договору с вашим поставщиком электроэнергии и действующей системе расчётов.',
      en: 'Your home uses the energy first, then it charges the battery (if installed), and any remainder is exported to the grid. Exported energy is settled under your electricity supplier contract and the billing scheme in force.',
    },
  },
  {
    id: 'support', topic: 'support',
    q: {
      lv: 'Vai ir pieejams valsts atbalsts?',
      ru: 'Доступна ли государственная поддержка?',
      en: 'Is government support available?',
    },
    a: {
      lv: 'Mājsaimniecībām ir pieejamas atbalsta programmas saules paneļiem un akumulatoriem. Nosacījumi un summas mainās, tāpēc pirms piedāvājuma pārbaudām aktuālo informāciju un palīdzam ar dokumentiem.',
      ru: 'Для домохозяйств доступны программы поддержки на солнечные панели и аккумуляторы. Условия и суммы меняются, поэтому перед предложением мы проверяем актуальную информацию и помогаем с документами.',
      en: 'Households can access support programmes for solar panels and batteries. Conditions and amounts change, so we check the current rules before preparing your offer and help with the paperwork.',
    },
  },
  {
    id: 'warranty', topic: 'support',
    q: {
      lv: 'Kādas garantijas ir spēkā?',
      ru: 'Какие гарантии действуют?',
      en: 'What warranties apply?',
    },
    a: {
      lv: 'Paneļiem, invertoriem un akumulatoriem ir ražotāju garantijas, bet montāžas darbiem — uzstādītāja garantija. Konkrētie termiņi atšķiras pēc aprīkojuma un tiek norādīti katrā piedāvājumā un līgumā.',
      ru: 'На панели, инверторы и аккумуляторы действуют гарантии производителей, а на монтажные работы — гарантия установщика. Конкретные сроки зависят от оборудования и указываются в каждом предложении и договоре.',
      en: 'Panels, inverters and batteries carry manufacturer warranties, and installation work carries the installer’s warranty. Exact periods depend on the equipment and are stated in every offer and contract.',
    },
  },
  {
    id: 'expand', topic: 'tech',
    q: {
      lv: 'Vai sistēmu vēlāk var paplašināt?',
      ru: 'Можно ли позже расширить систему?',
      en: 'Can the system be expanded later?',
    },
    a: {
      lv: 'Jā, ja to paredz jau projektējot. Hibrīda invertors ļauj vēlāk pievienot akumulatoru, un moduļu akumulatorus var papildināt. Paneļu skaita palielināšana ir atkarīga no invertora jaudas un pieslēguma — to izvērtējam jau pirmajā aprēķinā.',
      ru: 'Да, если заложить это на этапе проектирования. Гибридный инвертор позволяет позже добавить аккумулятор, а модульные аккумуляторы можно наращивать. Добавление панелей зависит от мощности инвертора и подключения — мы оцениваем это уже в первом расчёте.',
      en: 'Yes, if it is planned from the start. A hybrid inverter lets you add a battery later, and modular batteries can be extended. Adding panels depends on inverter capacity and the grid connection — we assess this in the first estimate.',
    },
  },
];
