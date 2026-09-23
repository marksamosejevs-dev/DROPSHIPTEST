/**
 * IMAGE REGISTRY
 * ---------------------------------------------------------------------------
 * All imagery used on the site is referenced from here, so photography can be
 * replaced in one place without touching layouts.
 *
 * TEMPORARY: every image currently in src/assets/img is an original
 * procedural 3D render produced for development (see /render). Replace with
 * real AIDEX project photography before public launch, then set
 * `temporary: false`.
 */
import type { ImageMetadata } from 'astro';
import hero from '../assets/img/hero.png';
import heroPortrait from '../assets/img/hero-portrait.png';
import homeDay from '../assets/img/home-day.png';
import homeNight from '../assets/img/home-night.png';
import roofDetail from '../assets/img/roof-detail.png';
import commercialRoof from '../assets/img/commercial-roof.png';
import solarField from '../assets/img/solar-field.png';
import batteryRoom from '../assets/img/battery-room.png';
import pkg6 from '../assets/img/pkg-6.png';
import pkg8 from '../assets/img/pkg-8.png';
import pkg10 from '../assets/img/pkg-10.png';
import pkgMax from '../assets/img/pkg-max.png';
import hotspot from '../assets/img/hotspot.png';
import isoDay from '../assets/img/iso-day.png';
import isoNight from '../assets/img/iso-night.png';
import type { Localized } from './packages';

export interface MediaItem { src: ImageMetadata; alt: Localized; temporary: boolean }

export const media = {
  hero: {
    src: hero, temporary: true,
    alt: {
      lv: 'Moderna skandināvu stila privātmāja ar melniem saules paneļiem uz jumta vakara saulē',
      ru: 'Современный частный дом в скандинавском стиле с чёрными солнечными панелями на крыше в вечернем свете',
      en: 'Modern Scandinavian-style house with all-black solar panels on the roof at golden hour',
    },
  },
  heroPortrait: {
    src: heroPortrait, temporary: true,
    alt: {
      lv: 'Privātmāja ar saules paneļiem uz jumta',
      ru: 'Частный дом с солнечными панелями на крыше',
      en: 'Private house with solar panels on the roof',
    },
  },
  homeDay: {
    src: homeDay, temporary: true,
    alt: {
      lv: 'Gaiša privātmāja ar integrētu saules paneļu jumtu dienas laikā',
      ru: 'Светлый частный дом с солнечными панелями на крыше днём',
      en: 'Light-clad family house with a solar roof in daylight',
    },
  },
  homeNight: {
    src: homeNight, temporary: true,
    alt: {
      lv: 'Privātmāja naktī — apgaismojumu nodrošina akumulatorā uzkrātā saules enerģija',
      ru: 'Дом ночью — освещение питается от накопленной в аккумуляторе солнечной энергии',
      en: 'House at night, powered by solar energy stored in the battery',
    },
  },
  roofDetail: {
    src: roofDetail, temporary: true,
    alt: {
      lv: 'Tuvplāns: melnu saules paneļu rinda uz metāla jumta',
      ru: 'Крупный план: ряд чёрных солнечных панелей на металлической крыше',
      en: 'Close-up of all-black solar modules on a standing-seam roof',
    },
  },
  commercialRoof: {
    src: commercialRoof, temporary: true,
    alt: {
      lv: 'Loģistikas centra jumts ar komerciālu saules elektrostaciju',
      ru: 'Крыша логистического центра с коммерческой солнечной электростанцией',
      en: 'Logistics centre roof with a commercial solar installation',
    },
  },
  solarField: {
    src: solarField, temporary: true,
    alt: {
      lv: 'Liela mēroga saules paneļu parks meža ielokā',
      ru: 'Крупная наземная солнечная электростанция у леса',
      en: 'Utility-scale ground-mounted solar park beside a forest',
    },
  },
  batteryRoom: {
    src: batteryRoom, temporary: true,
    alt: {
      lv: 'Mājas enerģijas uzkrāšanas sistēma: akumulatoru moduļi un hibrīda invertors tehniskajā telpā',
      ru: 'Домашняя система накопления энергии: модули аккумулятора и гибридный инвертор',
      en: 'Home energy storage: stacked battery modules and a hybrid inverter',
    },
  },
  pkg6: {
    src: pkg6, temporary: true,
    alt: { lv: 'Tumša koka māja ar melniem saules paneļiem uz jumta vakara saulē', ru: 'Тёмный деревянный дом с чёрными солнечными панелями на крыше в вечернем солнце', en: 'Dark timber house with black solar panels on the roof in evening sun' },
  },
  pkg8: {
    src: pkg8, temporary: true,
    alt: { lv: 'Moderna māja ar saules paneļu jumtu starp bērziem', ru: 'Современный дом с солнечной крышей среди берёз', en: 'Modern house with a solar roof among birch trees' },
  },
  pkg10: {
    src: pkg10, temporary: true,
    alt: { lv: 'Gaiša privātmāja ar saules paneļiem dienas gaismā', ru: 'Светлый частный дом с солнечными панелями днём', en: 'Light-clad family house with solar panels in daylight' },
  },
  pkgMax: {
    src: pkgMax, temporary: true,
    alt: { lv: 'Liela māja ar jumta saules paneļiem un zemes saules konstrukciju', ru: 'Большой дом с солнечными панелями на крыше и наземной конструкцией', en: 'Large house with rooftop solar and a ground-mounted array' },
  },
  hotspot: {
    src: hotspot, temporary: true,
    alt: { lv: 'Māja ar saules paneļiem, invertoru, akumulatoru un elektroauto lādētāju', ru: 'Дом с солнечными панелями, инвертором, аккумулятором и зарядкой для электромобиля', en: 'House with solar panels, inverter, battery and EV charger' },
  },
  isoDay: {
    src: isoDay, temporary: true,
    alt: { lv: 'Mājas saules sistēmas modelis dienā', ru: 'Модель солнечной системы дома днём', en: 'Model of a home solar system by day' },
  },
  isoNight: {
    src: isoNight, temporary: true,
    alt: { lv: 'Mājas saules sistēmas modelis naktī', ru: 'Модель солнечной системы дома ночью', en: 'Model of a home solar system at night' },
  },
} satisfies Record<string, MediaItem>;

export type MediaKey = keyof typeof media;
