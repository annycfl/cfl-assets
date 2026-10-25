"use strict";

// All illustrations are original SVG artwork. No remote assets or credentials are used.
const ISLANDS = [
  {
    id: "home",
    name: "我們的家",
    en: "WHERE OUR STORY BEGINS",
    type: "life",
    code: "HOME",
    x: 775,
    y: 475,
    scale: 1.22,
    tagline: "不管走了多遠，最喜歡的地方，還是有你的地方。",
    art: "home",
  },
  {
    id: "taiwan",
    name: "台灣島",
    en: "TAIWAN",
    type: "travel",
    code: "TW",
    x: 1030,
    y: 437,
    scale: 0.95,
    tagline: "把熟悉的風景，走成兩個人的小旅行。",
    art: "taiwan",
  },
  {
    id: "philippines",
    name: "菲律賓島",
    en: "PHILIPPINES",
    type: "travel",
    code: "PH",
    x: 1240,
    y: 590,
    scale: 1,
    tagline: "海風、陽光，還有身邊剛剛好的你。",
    art: "philippines",
  },
  {
    id: "japan",
    name: "日本島",
    en: "JAPAN",
    type: "travel",
    code: "JP",
    x: 1170,
    y: 237,
    scale: 1.03,
    tagline: "櫻花落下的速度，剛好夠我們許一個願。",
    art: "japan",
  },
  {
    id: "hongkong",
    name: "香港島",
    en: "HONG KONG",
    type: "travel",
    code: "HK",
    x: 1025,
    y: 737,
    scale: 0.95,
    tagline: "在熱鬧的城市裡，找到屬於我們的步調。",
    art: "hongkong",
  },
  {
    id: "belgium",
    name: "比利時島",
    en: "BELGIUM",
    type: "travel",
    code: "BE",
    x: 465,
    y: 285,
    scale: 0.93,
    tagline: "把巧克力的甜，和沿途的你，一起記住。",
    art: "belgium",
  },
  {
    id: "netherlands",
    name: "荷蘭島",
    en: "THE NETHERLANDS",
    type: "travel",
    code: "NL",
    x: 670,
    y: 155,
    scale: 0.95,
    tagline: "風車慢慢轉，我們慢慢走。",
    art: "netherlands",
  },
  {
    id: "france",
    name: "法國島",
    en: "FRANCE",
    type: "travel",
    code: "FR",
    x: 325,
    y: 650,
    scale: 1,
    tagline: "浪漫不一定在巴黎，也在和你並肩的每一步。",
    art: "france",
  },
  {
    id: "marriage",
    name: "婚姻島",
    en: "FOREVER STARTS HERE",
    type: "life",
    code: "LOVE",
    x: 770,
    y: 746,
    scale: 1.02,
    tagline: "從「我願意」開始，把往後都寫成我們。",
    art: "marriage",
  },
  {
    id: "cats",
    name: "哞花島",
    en: "MOO MOO & HUA HUA",
    type: "life",
    code: "CATS",
    x: 518,
    y: 485,
    scale: 1,
    tagline: "哞哞、花花，和被貓咪佔領的幸福日常。",
    art: "cats",
  },
  {
    id: "baby",
    name: "泡泡星球",
    en: "A LITTLE LOVE, ARRIVING 2027",
    type: "life",
    code: "2027",
    x: 920,
    y: 140,
    scale: 0.98,
    tagline: "親愛的泡泡，我們正在為你準備一整個世界。",
    art: "baby",
  },
];

const $ = (selector) => document.querySelector(selector);
const byId = (id) => ISLANDS.find((island) => island.id === id);
const NS = "http://www.w3.org/2000/svg";
const esc = (text) =>
  String(text).replace(
    /[&<>"']/g,
    (char) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        char
      ],
  );
const palette = {
  line: "#64795b",
  green: "#8fa77c",
  pale: "#d4dfb7",
  cream: "#fff4d8",
  roof: "#bc8270",
};
const tree = (x, y, s = 1, pink = false) =>
  `<g transform="translate(${x} ${y}) scale(${s})"><path d="M0 8V-26m0 14-12-11m12 5 10-13" fill="none" stroke="#8d8c66" stroke-width="3"/><path d="M-23-30c-12-16 1-30 13-25 6-18 31-14 32 2 21-1 25 23 11 29-7 14-25 13-31 7-10 8-29 1-25-13Z" fill="${pink ? "#e5b8aa" : "#a9bd91"}" stroke="${pink ? "#c89c8c" : "#8fa77d"}" stroke-width="1.1"/><path d="m-15-33 4-2m13-13 5 1m10 14 5 1" stroke="${pink ? "#f5d8c7" : "#cbd6ad"}" stroke-width="3" stroke-linecap="round"/></g>`;
const bush = (x, y, s = 1) =>
  `<g transform="translate(${x} ${y}) scale(${s})"><path d="M-16 0c-10-9-1-20 7-15 3-14 22-13 23-1 14-3 20 13 8 17Z" fill="#b0bf8b" stroke="#91a474" stroke-width="1"/><path d="M-5-3 0-7m6 3 3-5" stroke="#d2dbae" stroke-width="2"/></g>`;
const flower = (x, y, color = "#d5a18c") =>
  `<g transform="translate(${x} ${y})"><path d="M0 0v9m0-2-4-3" stroke="#82996c" fill="none"/><path d="M0-2c-9-10-13 5-4 5-4 8 9 10 8 2 9 2 9-10 2-8 1-8-10-9-6 1" fill="${color}"/><circle r="2" fill="#f5e2b0"/></g>`;
const grass = `<g stroke="#9db07d" stroke-width="1.5" fill="none" stroke-linecap="round"><path d="m-68 16 2-5 3 5m110 8 3-5 2 5m-17-37 2-4 2 4m-61 38 2-4 2 3m61-10 3-3 3 3"/></g>`;
const house = `<g stroke="#8d8565" stroke-width="1.5" stroke-linejoin="round"><path d="M-46-25 7-45 46-23 46 21 4 42-46 16Z" fill="#e5d4aa"/><path d="M-46-25 4-5 4 42-46 16Z" fill="#fcf1d4"/><path d="M4-5 46-23 46 21 4 42Z" fill="#e5d9b5"/><path d="m-57-27 31-43 45 13 39 30-54 23Z" fill="#bf8978"/><path d="m-26-70 30 66 54-23-39-30Z" fill="#c9947e"/><path d="M-53-29-24-65 4-6" fill="none" stroke="#f0c5a4"/><path d="m-13-46 45 16m-37-30 45 23m-40 10 43-14" stroke="#b17e69" opacity=".65"/><path d="M-39-24v19l15 6v-19Z" fill="#b0c5bd"/><path d="m-32-21 0 19m-7-13 15 6" stroke="#f9f0d5"/><path d="M-13 4 0 9V40l-13-6Z" fill="#8ca08a"/><circle cx="-3" cy="25" r="1" fill="#e7d5aa"/><path d="M16 4V-5L33-13V-4Z" fill="#a5bdb1"/><path d="m24-9 0 10" stroke="#f9f0d5"/><path d="m-25-63 0-18 10 3v19" fill="#e5c4a1"/><path d="M-22-86c-11-13 9-12 2-25" stroke="#fbfaf0" stroke-width="4" fill="none" stroke-linecap="round"/></g>`;
function artwork(kind) {
  const wrap = (s) =>
    `<g stroke-linecap="round" stroke-linejoin="round">${s}</g>`;
  switch (kind) {
    case "home":
      return wrap(
        `${tree(-68, -18, 0.83)}${tree(57, -34, 0.91)}<path d="m-3 40 15 16 31 3" fill="none" stroke="#eee3bd" stroke-width="10"/>${house}${bush(-56, 22, 0.7)}${bush(51, 24, 0.6)}<g transform="translate(54 20)"><path d="M-3 5V-8l11-3V2" fill="#fcf0d5" stroke="#8a966f"/><path d="m-5-8 10-8 7 4-4 8Z" fill="#c18f77"/></g>${flower(-45, 33)}${flower(33, 37)}<path d="M-9-101c-16-16-25 8 0 18 25-10 16-34 0-18Z" fill="#d59a8a" stroke="#b98070" stroke-width="1"/><g transform="translate(-24 30)"><circle cy="-10" r="4" fill="#d7b992"/><path d="M-5 7V-4Q0-9 5-4V7" fill="#7e9d94"/><path d="m-3 7-1 6m7-6 1 6" stroke="#8a8466"/></g><g transform="translate(-10 35)"><circle cy="-10" r="4" fill="#d7b992"/><path d="M-5 7-4-3Q0-8 4-3L6 7Z" fill="#d8a18c"/><path d="m-2 7 0 5m5-5 0 5" stroke="#8a8466"/></g>`,
      );
    case "taiwan":
      return wrap(
        `<path d="M-83 4-46-72-4-6 25-52 70 11Z" fill="#a4b58f" stroke="#819c77"/><path d="m-68 4 26-41 22 48m18-18 26-45 35 58" fill="#bac7a1" stroke="#8da37e"/><g stroke="#6c8e7d" stroke-width="1.2"><path d="M13 28V-51l8-4 7 4v79Z" fill="#9ebca3"/><path d="M11-41h19l-3 12H14Zm0 16h19l-3 12H14Zm0 16h19L27 3H14Zm0 16h19l-3 12H14Z" fill="#c3d2af"/><path d="M20-55V-71"/><path d="M16-58h9v7h-9Z" fill="#d5ddbb"/></g>${tree(-54, 13, 0.54)}<path d="M-42 28q29-20 40-10T50 25" stroke="#e5d9ae" stroke-width="5" fill="none"/>${bush(59, 17, 0.65)}${flower(-20, 29)}`,
      );
    case "japan":
      return wrap(
        `<circle cx="37" cy="-67" r="22" fill="#e4bd9a" opacity=".6"/><path d="M-76 4-19-88 48 4Z" fill="#b0beb0" stroke="#91a596"/><path d="m-44-48 25-40 28 39-20-9-10 8-11-9Z" fill="#fff9e8" stroke="#f4efda"/><path d="m-76 4 26-41 11 18 20-20L48 4" fill="#b9c6b0" opacity=".5"/>${tree(60, -2, 0.88, true)}${tree(-62, 23, 0.57, true)}<g transform="translate(-4 16)" stroke="#a96855" stroke-width="4" fill="none"><path d="M-22 18v-43m40 43v-43m-49-3q28 8 59-1m-53 12h48m-36-9v9m24-9v9"/><path d="M-30-32q30 6 60-2" stroke="#b57a5f"/></g>${flower(40, 32, "#dfb6a6")}<path d="m70-44 4 2m-7 8 3 2m-12 5 3 2" stroke="#deb3a0" stroke-width="3"/>`,
      );
    case "philippines":
      return wrap(
        `<path d="M-68 21Q-18-20 70 7l-12 30-115 4Z" fill="#f0e3b8"/><path d="M-65 29Q-8 12 73 26" stroke="#fff4da" fill="none" stroke-width="5"/><g stroke="#a28c62" stroke-width="4" fill="none"><path d="M-40 16Q-34-23-45-66M49 20Q38-8 45-43"/></g><g fill="#9cb387" stroke="#7f9c72" stroke-width="1.2"><path d="M-45-66q-40-20-48 10 27-17 48-10-26-7-27-34 22 12 27 34-2-31 24-38-4 28-24 38 31-26 47-1-29-9-47 1Z"/><path d="M45-43q-28-23-40-1 24-10 40 1-17-22-8-36 13 15 8 36 18-27 35-16-16 14-35 16 28-8 34 12-20-13-34-12Z"/></g><g transform="translate(3 8)"><path d="m-22 8 14 15 30-1 12-14Z" fill="#d1aa7c" stroke="#9e8a60"/><path d="M3 8V-48l-26 47H1Z" fill="#fff8df" stroke="#b7ae8c"/><path d="M8-43 28-3H8" fill="#d7a48c" stroke="#b48a72"/></g><path d="m-56 35 15 2m49-3 10 2m34 3 15-2" stroke="#adcac0" stroke-width="3"/>`,
      );
    case "hongkong":
      return wrap(
        `<g stroke="#849478" stroke-width="1.2"><path d="M-69 19V-30h15v49" fill="#c4cead"/><path d="M-48 18V-59h21v77" fill="#a9bca3"/><path d="m-51-59 14-28 13 28Z" fill="#c8d3b8"/><path d="M-17 17V-40H5v57" fill="#c7caaa"/><path d="M16 16V-73l15-9 15 9v89Z" fill="#a1b6a5"/><path d="M26-81v-16m11 16v-14" fill="none"/><path d="M52 18V-34h16v52" fill="#d1ceb0"/></g><g stroke="#e7e9cf" stroke-width="2"><path d="M-42-48v8m9-8v8m-9 8v8m9-8v8m-43-2v7m6-7v7M24-62v9m13-9v9m-13 10v9m13-9v9m-47 0v7m8-7v7m53-8v8"/></g><g transform="translate(5 34)"><path d="m-31 2 13 11 40-2L33 1Z" fill="#a7886c" stroke="#8f775f"/><path d="M-4 1v-40q-22 3-22 29Z" fill="#c08e73" stroke="#a57a62"/><path d="M2-35V0l26-8Q30-27 2-35Z" fill="#d8a382" stroke="#b78a6d"/><path d="m-22-20 16 2M7-23l16 6" stroke="#f2c7a0"/></g>${bush(-70, 24, 0.6)}`,
      );
    case "belgium":
      return wrap(
        `<g stroke="#99876b" stroke-width="1.3"><path d="M-67 25v-61l18-15 18 15v61" fill="#cda68c"/><path d="M-72-35h46l-9-8h-28Z" fill="#e4c8a5"/><path d="M-22 28V-50L-4-71l20 21v78" fill="#e5d1a8"/><path d="M-27-50h48l-10-7h-29Zm6-9h35l-9-8H-13Z" fill="#ddc09b"/><path d="M26 24V-35l20-18 21 18v59" fill="#d7b19a"/><path d="M24-35h47l-9-7H33Z" fill="#e5c5a5"/></g><g fill="#91a99a" stroke="#f5e6c7" stroke-width="2"><path d="M-57-28h8v12h-8Zm14 0h8v12h-8ZM-13-42h8v14h-8ZM2-42h8v14H2ZM35-26h9v12h-9Zm15 0h9v12h-9ZM-57-7h8V5h-8Zm14 0h8V5h-8ZM-13-16h8V-2h-8ZM2-16h8V-2H2ZM35-4h9V8h-9Zm15 0h9V8h-9Z"/></g><path d="M-7 27V11q5-8 10 0v16" fill="#a89472"/>${bush(-76, 26, 0.6)}${flower(77, 19)}`,
      );
    case "netherlands":
      return wrap(
        `<g transform="translate(-12 -5)" stroke="#8f896a" stroke-width="1.5"><path d="M-26 31-20-50h35l18 81Z" fill="#e4d6b1"/><path d="m-28-49 25-22 25 22Z" fill="#a28673"/><path d="M-7 31V10h13v21" fill="#9bad91"/><path d="M-13-20h16v16h-16Z" fill="#abc1ad"/><g transform="translate(-4 -39) rotate(28)"><path d="M-4-61H5V61H-4Z" fill="#f7f0d6"/><path d="M-61-4H61V5H-61Z" fill="#f7f0d6"/><path d="M-1-62V62m-62-63H62" stroke="#978f6e"/><path d="M-4-55H5m-9 10H5m-9 10H5m-9 10H5m-9 10H5M-55-4V5m10-9V5m10-9V5m10-9V5m10-9V5M-4 15H5m-9 10H5m-9 10H5m-9 10H5m-9 10H5M15-4V5m10-9V5m10-9V5m10-9V5m10-9V5"/><circle r="4" fill="#a4896c"/></g></g><g stroke="#8fa276" stroke-width="1.6"><path d="M35 37V14m12 25V17m12 25V18m-115 5V9m12 16V12"/></g><g fill="#d9a18e"><path d="m30 11 4 4 1-7 2 7 5-4q2 12-7 11-9-1-5-11Zm13 2 4 4 1-7 2 7 5-4q2 12-7 11-9-1-5-11Zm12 2 4 4 1-7 2 7 5-4q2 12-7 11-9-1-5-11Z"/></g>${flower(-57, 8, "#cf9c83")}${flower(-44, 12, "#e6bf84")}`,
      );
    case "france":
      return wrap(
        `<g stroke="#879077" stroke-width="2" fill="#c1c5a3"><path d="M-34 38Q-6-6-6-92H2Q2-6 30 38H16Q1 8-3 8-10 8-20 38Z"/><path d="M-15-40H10m-31 27h39m-45 28h51M-7-91v-15" fill="none"/><path d="M-6-67 3-52-10-38 9-23-16-12 17 5-25 22m29-89-12 15 15 14-20 15 26 11-36 17 43 17" fill="none" stroke-width="1"/><path d="M-12-43H7v5H-12Zm-10 28h38v5h-38Z" fill="#ddd8b4"/></g>${tree(-65, 13, 0.7)}${tree(58, 4, 0.7)}<g transform="translate(47 30)"><path d="M-17-3 15-3 13 14H-15Z" fill="#d8b996" stroke="#9e9476"/><path d="M-18-4v-12H17V-4" fill="#f3e4bf" stroke="#9e9476"/><path d="M-16-15h7v11h-7ZM0-15h7v11H0Z" fill="#bf8e79"/></g>${flower(-46, 31)}<path d="m-57-75 5-3 5 3m40-53 5-3 5 3" stroke="#9eac8c" stroke-width="1.5" fill="none"/>`,
      );
    case "marriage":
      return wrap(
        `<path d="M-46 26V-27a46 46 0 0 1 92 0V26" stroke="#b79c70" stroke-width="5" fill="none"/><path d="M-40-19q7 25 0 46m80-46q-7 25 0 46" stroke="#fff7de" stroke-width="8" fill="none"/>${tree(-67, 12, 0.65, true)}${tree(67, 12, 0.65, true)}<path d="M-21 39-10-10h20l12 49" fill="#fff5dd" opacity=".8"/><g stroke="#b99e66" fill="none" stroke-width="3"><circle cx="-9" cy="2" r="15"/><circle cx="12" cy="2" r="15"/></g><path d="m-14-14 5-7 6 7" fill="#f7e9b9" stroke="#b99e66"/>${flower(-35, -49)}${flower(-21, -61, "#e8cf9c")}${flower(36, -50)}${flower(22, -61, "#f3d8c3")}<path d="M-2-78c-13-13-23 6 0 16 23-10 13-29 0-16Z" fill="#d69d8d"/><g fill="#eadab6"><circle cx="-29" cy="27" r="2"/><circle cx="31" cy="19" r="2"/><circle cx="-4" cy="33" r="2"/></g>`,
      );
    case "cats":
      return wrap(
        `${tree(-69, -3, 0.72)}${bush(66, 19, 0.8)}<path d="M-54 37Q-71 11-58 2" stroke="#8b9580" stroke-width="8" fill="none"/><path d="M-25 35q-33 10-31-16l8-32 35 3 8 31q2 19-20 14" fill="#f5ebd2" stroke="#8b9580" stroke-width="1.5"/><path d="m-49-23-6-27 20 12 20-8 4 26q7 26-18 29-27 0-20-32" fill="#f7efdc" stroke="#8b9580" stroke-width="1.5"/><path d="m-49-23-6-27 20 12-3 15Z" fill="#899381"/><path d="m-15-46 4 26q5 13-5 18l-13-16 2-15Z" fill="#899381"/><g fill="#647563"><ellipse cx="-40" cy="-17" rx="2" ry="3"/><ellipse cx="-21" cy="-17" rx="2" ry="3"/></g><path d="m-32-10 4 0-2 3Z" fill="#ccaa98"/><path d="m-52-8-12-2m13 6-12 1m43-5 12-3m-11 7 12 1" stroke="#8d9b85"/><path d="M39 35q34 8 24-12" stroke="#c4a184" stroke-width="8" fill="none"/><path d="M28 35Q2 37 8 12l7-25 30 3 11 26q4 21-28 19" fill="#ead1af" stroke="#9f977a" stroke-width="1.5"/><path d="m11-24 0-26 18 12 19-10 5 27q7 24-20 28-30 0-22-31" fill="#fcf1d9" stroke="#9f977a" stroke-width="1.5"/><path d="m11-24 0-26 18 12-2 15Z" fill="#d0a181"/><path d="m48-48 5 27q3 12-9 14L33-23l3-17Z" fill="#929180"/><path d="m5 12 12-10 7 18-8 14" fill="#c7a17e"/><path d="m20-17 4 1m16-2 4-1" stroke="#77836c" stroke-width="2"/><path d="m30-10 4 0-2 3Z" fill="#cd9d87"/><path d="m13-7-12-3m12 7L1-2m46-5 12-4m-11 8 11 1" stroke="#a7a385"/><path d="M-2-65c-11-13-21 7 0 14 21-7 11-27 0-14Z" fill="#d8a08d"/>${flower(-63, 33)}${flower(70, 27, "#e7c595")}`,
      );
    case "baby":
      return wrap(
        `<ellipse cx="0" cy="-17" rx="79" ry="24" fill="none" stroke="#c6b5cf" stroke-width="6" transform="rotate(-22)" opacity=".7"/><circle cx="0" cy="-25" r="56" fill="#e1d7d9" stroke="#b8b2be" stroke-width="1.3"/><path d="M-41-61c-17 23-6 63 26 75-43-6-61-48-26-75" fill="#c6bed0"/><circle cx="27" cy="-49" r="9" fill="#ede6e4"/><circle cx="-15" cy="-18" r="6" fill="#d0c5d3"/><g transform="translate(6 -20)"><path d="M-20 20V-3h43v23Z" fill="#fcf0d9" stroke="#ad9f89" stroke-width="1.5"/><path d="M-20 6h43m-36-9V6m10-9V6m10-9V6M-17 20v7m36-7v7" stroke="#ad9f89" stroke-width="1.5"/><path d="M-20-4Q0-20 23-4" fill="#f6e6cd" stroke="#ad9f89"/><circle cx="3" cy="-9" r="7" fill="#e6c4a5"/><path d="M-3-9q2 2 4 0m3 0q2 2 4 0" stroke="#ab8e77" fill="none" stroke-width=".8"/></g><path d="M27-79q15 5 20-8-17 5-16-14-13 10-4 22" fill="#f4df9e" stroke="#c6b079"/><g fill="#e2c37e"><path d="m-67-62 3-8 3 8 8 3-8 3-3 8-3-8-8-3Z"/><path d="m59-30 2-6 2 6 6 2-6 2-2 6-2-6-6-2Z"/><path d="m-36-95 2-5 2 5 5 2-5 2-2 5-2-5-5-2Z"/></g><circle cx="65" cy="-78" r="3" fill="#d1b8bc"/><circle cx="-53" cy="-26" r="2" fill="#f4e2b5"/>`,
      );
    default:
      return "";
  }
}

const memories = new Map();
let db;
let storageError = false;
const storageReady = new Promise((resolve) => {
  try {
    const request = indexedDB.open("our-little-archipelago", 1);
    request.onupgradeneeded = () =>
      request.result.createObjectStore("memories", { keyPath: "id" });
    request.onerror = () => {
      storageError = true;
      resolve();
    };
    request.onblocked = () => {
      storageError = true;
      resolve();
    };
    request.onsuccess = () => {
      db = request.result;
      db.onversionchange = () => db.close();
      const read = db.transaction("memories").objectStore("memories").getAll();
      read.onsuccess = () => {
        read.result.forEach((item) => memories.set(item.id, item));
        resolve();
      };
      read.onerror = () => {
        storageError = true;
        resolve();
      };
    };
  } catch {
    storageError = true;
    resolve();
  }
});
function persist(records) {
  return new Promise((resolve, reject) => {
    if (!db || storageError)
      return reject(
        new Error("無法使用瀏覽器儲存空間，請確認非限制儲存的瀏覽模式後再試。"),
      );
    const tx = db.transaction("memories", "readwrite");
    const store = tx.objectStore("memories");
    records.forEach((record) => store.put(record));
    tx.oncomplete = () => {
      records.forEach((record) => memories.set(record.id, record));
      resolve();
    };
    tx.onerror = () =>
      reject(
        new Error("儲存空間不足或無法寫入，請先匯出備份並檢查瀏覽器儲存空間。"),
      );
    tx.onabort = () =>
      reject(new Error("回憶未能儲存，請檢查瀏覽器儲存空間後重試。"));
  });
}
function currentName(island) {
  return memories.get(island.id)?.name || island.name;
}

function ground(island) {
  const purple = island.id === "baby";
  const top = purple
    ? "#d5d5c7"
    : island.id === "philippines"
      ? "#d9dbb0"
      : "#c1cfa0";
  return `<ellipse class="island-shadow" cx="0" cy="41" rx="109" ry="29"/><ellipse class="island-water" cx="0" cy="31" rx="119" ry="42"/><path class="island-water" d="M-131 24q-16 26 38 43m180-48q42 16 15 40"/><g class="island-ground"><path d="M-95-2C-118 11-96 36-72 43-57 65-15 57 9 61 38 65 55 46 81 42 108 34 111 8 83-3 67-21 21-25 1-22-28-28-70-20-95-2Z" fill="${purple ? "#acb4a3" : "#a5b88a"}" stroke="#96aa80" stroke-width="1.3"/><path d="M-95-9C-118 4-96 28-72 35-57 57-15 49 9 53 38 57 55 38 81 34 108 26 111 0 83-11 67-29 21-33 1-30-28-36-70-28-95-9Z" fill="${top}" stroke="#a1b48a" stroke-width="1.3"/><path d="M-91 4C-70-16-28-12-12-18 21-20 51-13 78 1" fill="none" stroke="#dae2ba" stroke-width="3" opacity=".6"/>${grass}</g>`;
}
function islandSVG(island, label = true) {
  const name = currentName(island);
  const labelWidth = Math.max(98, name.length * 20 + 24);
  return `<g class="land-art">${ground(island)}${artwork(island.art)}</g>${label ? `<g transform="translate(0 85)"><rect x="${-labelWidth / 2}" y="-15" width="${labelWidth}" height="31" rx="5" class="island-label-bg ${island.id === "home" ? "home-label" : ""}"/><text class="island-name ${island.id === "home" ? "home-name" : ""}" text-anchor="middle" y="7">${esc(name)}</text><text class="island-english" text-anchor="middle" y="35">${island.en}</text>${island.id === "baby" ? '<text class="island-caption" text-anchor="middle" y="54">2027 · 期待登陸</text>' : ""}${island.id === "cats" ? '<text class="island-caption" text-anchor="middle" y="54">哞哞 ＆ 花花的專屬領地</text>' : ""}</g>` : ""}<ellipse class="focus-ring" cy="1" rx="119" ry="96"/>`;
}
function renderMap() {
  const map = $("#island-map");
  map.innerHTML = `<defs><filter id="hover-shadow" x="-50%" y="-50%" width="200%" height="200%"><feDropShadow dx="0" dy="5" stdDeviation="6" flood-color="#739164" flood-opacity=".22"/></filter></defs>
  <g class="decor" aria-hidden="true"><path class="route" d="M725 466Q608 343 489 302M518 516Q419 552 336 647M482 265Q548 153 661 167M800 428Q815 246 919 170M836 479Q933 342 1015 445M1063 403Q1060 315 1160 260M1096 468Q1220 448 1232 573M1240 627Q1165 747 1051 758M967 748Q869 841 792 765M766 552Q716 641 771 724"/>
  <g transform="translate(690 645) rotate(-22)"><path d="m-16 0 16 11L17 0Z" fill="#fff9e8" stroke="#a9b6a0"/><path d="M0-25V0H16Z" fill="#e8d4a9" stroke="#b6af8b"/><path d="M-3-22-16-2H-3Z" fill="#fff9e8" stroke="#b6af8b"/></g>
  <g transform="translate(1314 390)"><path d="M-23 3q0-22 30-13 10-8 13-19 10 17-5 32 6 16-16 19-16 4-22-10Z" fill="#b7c9b9" stroke="#9cb5a2"/><path d="M-21 4q11 9 25 8" fill="none" stroke="#e4ebd8"/><circle cx="-12" cy="0" r="1.5" fill="#7e9982"/><path d="m-11-22-2-7m8 6 2-7" stroke="#a5bca8" stroke-width="2" fill="none"/></g>
  <g transform="translate(233 482)" stroke="#9eb29e" fill="none" stroke-width="1.3"><path d="m-18 0 5-4 5 4m8-11 5-4 5 4m12 8 4-3 4 3"/></g>
  <g transform="translate(1015 590)"><path d="m0-8 3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1Z" fill="#d3bf91" opacity=".6"/></g>
  <g fill="#fbfcf2" stroke="#dce6d6" stroke-width="1"><path d="M550 68q-16 2-18-7-2-12 10-14 2-19 18-14 16-7 22 9 14-4 18 9 8 17-18 17Z"/><path d="M1308 117q-14-1-14-11 0-9 10-10 5-17 19-10 13-5 18 8 20 2 13 17-3 8-20 6Z"/></g>
  <text x="189" y="588" fill="#a7b8a4" font-size="9" letter-spacing="4" font-family="Georgia" transform="rotate(-12 189 588)">a little more us.</text>
  <text x="535" y="755" fill="#a6b29a" font-size="20" font-family="Georgia" transform="rotate(-12 535 755)">♡</text></g>`;
  ISLANDS.forEach((island) => {
    const group = document.createElementNS(NS, "g");
    group.setAttribute("class", "island");
    group.dataset.id = island.id;
    group.setAttribute(
      "transform",
      `translate(${island.x} ${island.y}) scale(${island.scale})`,
    );
    group.setAttribute("tabindex", "0");
    group.setAttribute("role", "button");
    group.setAttribute("aria-label", `探索${currentName(island)}`);
    group.innerHTML = islandSVG(island);
    group.addEventListener("click", () => {
      if (!dragMoved) openIsland(island.id);
    });
    group.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openIsland(island.id);
      }
    });
    map.append(group);
  });
  setFilter(activeFilter);
  document.dispatchEvent(new Event("memory-data-change"));
}

let activeFilter = "all";
function setFilter(filter) {
  activeFilter = filter;
  document.querySelectorAll("[data-filter]").forEach((button) => {
    const selected = button.dataset.filter === filter;
    button.classList.toggle("selected", selected);
    button.setAttribute("aria-pressed", String(selected));
  });
  document
    .querySelectorAll(".island")
    .forEach((group) =>
      group.classList.toggle(
        "dimmed",
        filter !== "all" && byId(group.dataset.id).type !== filter,
      ),
    );
  document.dispatchEvent(
    new CustomEvent("memory-filter-change", { detail: filter }),
  );
}
document
  .querySelectorAll("[data-filter]")
  .forEach((button) =>
    button.addEventListener("click", () => setFilter(button.dataset.filter)),
  );

// Viewport coordinates are independent of SVG coordinates, so dragging works at every zoom.
let zoom = 1,
  pan = { x: 0, y: 0 },
  baseScale = 1,
  drag = null,
  dragMoved = false;
const pointers = new Map();
let pinch = null;
function transformMap() {
  const w = $("#map-viewport").clientWidth,
    h = $("#map-viewport").clientHeight;
  const mobile = w < 700;
  baseScale = mobile
    ? Math.max(0.54, Math.min(0.68, w / 650))
    : Math.min(w / 1440, h / 900) * 0.98;
  const offset = mobile ? { x: -55 * baseScale, y: 180 } : { x: 0, y: 15 };
  $("#map-world").style.transform =
    `translate(calc(-50% + ${pan.x + offset.x}px),calc(-50% + ${pan.y + offset.y}px)) scale(${baseScale * zoom})`;
}
function changeZoom(delta) {
  zoom = Math.max(0.65, Math.min(2.5, zoom + delta));
  transformMap();
}
function resetMap() {
  zoom = 1;
  pan = { x: 0, y: 0 };
  setFilter("all");
  transformMap();
  document.dispatchEvent(new Event("memory-map-reset"));
}
$("#zoom-in").addEventListener("click", () => changeZoom(0.2));
$("#zoom-out").addEventListener("click", () => changeZoom(-0.2));
$("#reset-map").addEventListener("click", resetMap);
$("#map-nav").addEventListener("click", resetMap);
const viewport = $("#map-viewport");
viewport.addEventListener("pointerdown", (event) => {
  if (window.memory3DActive) return;
  if (event.button !== 0) return;
  pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
  if (pointers.size === 2) {
    const [a, b] = [...pointers.values()];
    pinch = { distance: Math.hypot(a.x - b.x, a.y - b.y), zoom };
    drag = null;
    dragMoved = true;
  } else {
    drag = {
      id: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      pan: { ...pan },
    };
    dragMoved = false;
  }
});
window.addEventListener("pointermove", (event) => {
  if (!pointers.has(event.pointerId)) return;
  pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
  if (pinch && pointers.size === 2) {
    const [a, b] = [...pointers.values()];
    zoom = Math.max(
      0.65,
      Math.min(
        2.5,
        (pinch.zoom * Math.hypot(a.x - b.x, a.y - b.y)) /
          Math.max(pinch.distance, 1),
      ),
    );
    transformMap();
    return;
  }
  if (!drag || event.pointerId !== drag.id) return;
  const dx = event.clientX - drag.x,
    dy = event.clientY - drag.y;
  if (Math.abs(dx) + Math.abs(dy) > 6) {
    dragMoved = true;
    viewport.classList.add("dragging");
  }
  if (dragMoved) {
    pan = { x: drag.pan.x + dx, y: drag.pan.y + dy };
    transformMap();
  }
});
function endPointer(event) {
  pointers.delete(event.pointerId);
  drag = null;
  pinch = null;
  viewport.classList.remove("dragging");
}
window.addEventListener("pointerup", endPointer);
window.addEventListener("pointercancel", endPointer);
window.addEventListener("blur", () => {
  drag = null;
  pinch = null;
  pointers.clear();
  viewport.classList.remove("dragging");
});
viewport.addEventListener(
  "wheel",
  (event) => {
    if (window.memory3DActive) return;
    if (event.ctrlKey || event.metaKey) {
      event.preventDefault();
      changeZoom(event.deltaY > 0 ? -0.1 : 0.1);
    }
  },
  { passive: false },
);
window.addEventListener("resize", transformMap);

const memoryDialog = $("#memory-dialog");
let selectedId = "home",
  photoURL = null;
function releasePhoto() {
  if (photoURL) {
    URL.revokeObjectURL(photoURL);
    photoURL = null;
  }
}
function renderMemory() {
  const island = byId(selectedId),
    memory = memories.get(selectedId);
  $("#memory-title").textContent = currentName(island);
  $("#memory-kicker").textContent = island.en;
  $("#memory-tagline").textContent = island.tagline;
  $("#memory-art").innerHTML =
    `<svg viewBox="-200 -130 400 200" aria-hidden="true"><g transform="translate(0 6) scale(1.13)">${islandSVG(island, false)}</g></svg>`;
  $("#memory-art").style.backgroundColor =
    island.id === "baby" ? "#ede6ed" : "#e9efdf";
  $("#memory-story").textContent = memory?.story || "";
  $("#memory-date").textContent = memory?.date
    ? `♡ ${memory.date.replaceAll("-", " . ")}`
    : "";
  releasePhoto();
  if (memory?.photo) {
    photoURL = URL.createObjectURL(memory.photo);
    $("#memory-photo").src = photoURL;
    $("#memory-photo").hidden = false;
  } else {
    $("#memory-photo").removeAttribute("src");
    $("#memory-photo").hidden = true;
  }
  $("#empty-memory").hidden = !!(memory?.story || memory?.photo);
  $("#memory-form").hidden = true;
  $("#edit-memory").hidden = false;
  $("#edit-memory").textContent = memory
    ? "✎ 編輯這座島的回憶"
    : "＋ 收藏這座島的回憶";
}
async function openIsland(id, edit = false) {
  await storageReady;
  if (!byId(id)) return;
  selectedId = id;
  renderMemory();
  if (!memoryDialog.open) memoryDialog.showModal();
  memoryDialog.scrollTop = 0;
  if (edit) startEdit();
}
function startEdit() {
  const memory = memories.get(selectedId),
    form = $("#memory-form");
  form.reset();
  form.elements.name.value = currentName(byId(selectedId));
  form.elements.date.value = memory?.date || "";
  form.elements.story.value = memory?.story || "";
  $("#form-error").textContent = "";
  $("#remove-photo-label").hidden = !memory?.photo;
  form.hidden = false;
  $("#edit-memory").hidden = true;
  $("#empty-memory").hidden = true;
  form.elements.story.focus();
}
$("#write-memory").addEventListener("click", () => openIsland("home", true));
$("#edit-memory").addEventListener("click", startEdit);
$("#cancel-edit").addEventListener("click", renderMemory);

async function shrinkPhoto(file) {
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type))
    throw new Error("請選擇 JPG、PNG 或 WebP 圖片。");
  if (file.size > 20 * 1024 * 1024)
    throw new Error("照片請小於 20 MB，請先縮小照片後再上傳。");
  const image = await createImageBitmap(file).catch(() => {
    throw new Error("讀不到這張照片，請換一張有效的 JPG、PNG 或 WebP 圖片。");
  });
  const scale = Math.min(1, 1600 / Math.max(image.width, image.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(image.width * scale);
  canvas.height = Math.round(image.height * scale);
  const context = canvas.getContext("2d");
  context.fillStyle = "#fffdf7";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.drawImage(image, 0, 0, canvas.width, canvas.height);
  image.close();
  return new Promise((resolve, reject) =>
    canvas.toBlob(
      (blob) =>
        blob
          ? resolve(blob)
          : reject(new Error("照片處理失敗，請換一張照片。")),
      "image/jpeg",
      0.86,
    ),
  );
}
let saving = false;
$("#memory-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  if (saving) return;
  const form = event.currentTarget,
    button = form.querySelector("[type=submit]");
  const name = form.elements.name.value.trim();
  if (!name) {
    $("#form-error").textContent = "請為這座島取個名字。";
    return;
  }
  saving = true;
  button.disabled = true;
  button.textContent = "收藏中…";
  const id = selectedId;
  try {
    let photo = memories.get(id)?.photo || null;
    if (form.elements.removePhoto.checked) photo = null;
    if (form.elements.photo.files[0])
      photo = await shrinkPhoto(form.elements.photo.files[0]);
    await persist([
      {
        id,
        name,
        date: form.elements.date.value,
        story: form.elements.story.value.trim(),
        photo,
      },
    ]);
    renderMap();
    renderMemory();
    toast("這份回憶，已經好好收藏了 ♡");
  } catch (error) {
    $("#form-error").textContent = error.message;
  } finally {
    saving = false;
    button.disabled = false;
    button.textContent = "儲存回憶 ♡";
  }
});
memoryDialog.addEventListener("cancel", (event) => {
  if (saving) event.preventDefault();
});
memoryDialog.addEventListener("close", releasePhoto);
document.querySelectorAll("[data-close]").forEach((button) =>
  button.addEventListener("click", () => {
    if (button.closest("dialog") === memoryDialog && saving) return;
    button.closest("dialog").close();
  }),
);
document.querySelectorAll("dialog").forEach((dialog) =>
  dialog.addEventListener("click", (event) => {
    if (event.target !== dialog || saving) return;
    const box = dialog.getBoundingClientRect();
    if (
      event.clientX < box.left ||
      event.clientX > box.right ||
      event.clientY < box.top ||
      event.clientY > box.bottom
    )
      dialog.close();
  }),
);

async function openDirectory(travelOnly = false) {
  await storageReady;
  $("#passport-title").textContent = travelOnly
    ? "我們的旅行護照"
    : "我們的十一座小島";
  $("#passport-dialog .eyebrow").textContent = travelOnly
    ? "OUR JOURNEY TOGETHER"
    : "EVERY ISLAND, A LITTLE PIECE OF US";
  $("#passport-dialog .dialog-subtitle").textContent = travelOnly
    ? "走過的地方，都是愛的形狀。"
    : "從家出發，每一份珍惜都有自己的座標。";
  $("#passport-dialog .passport-foot").textContent = travelOnly
    ? "7 座旅行島嶼，還有好多地方要和你一起去。"
    : "點選一座島嶼，打開或編輯我們的故事。";
  const grid = $("#passport-grid");
  grid.replaceChildren();
  ISLANDS.filter((island) => !travelOnly || island.type === "travel").forEach(
    (island) => {
      const button = document.createElement("button");
      button.className = "stamp";
      button.innerHTML = `<span class="stamp-code">${island.code}</span><strong>${esc(currentName(island))}</strong><small>${island.en}</small>`;
      button.addEventListener("click", () => {
        $("#passport-dialog").close();
        openIsland(island.id);
      });
      grid.append(button);
    },
  );
  $("#passport-dialog").showModal();
}
$("#passport-open").addEventListener("click", () => openDirectory(true));
$("#directory-open").addEventListener("click", () => openDirectory(false));
$("#backup-open").addEventListener("click", () => {
  $("#backup-status").textContent = "";
  $("#backup-dialog").showModal();
});
let toastTimer;
function toast(message) {
  clearTimeout(toastTimer);
  $("#toast").textContent = message;
  $("#toast").classList.add("visible");
  toastTimer = setTimeout(() => $("#toast").classList.remove("visible"), 3500);
}
function readDataURL(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("無法讀取照片。"));
    reader.readAsDataURL(blob);
  });
}
$("#export-memory").addEventListener("click", async (event) => {
  const button = event.currentTarget;
  button.disabled = true;
  try {
    await storageReady;
    if (storageError)
      throw new Error(
        "無法讀取瀏覽器儲存空間，請在原本收藏回憶的瀏覽器中重試。",
      );
    const records = await Promise.all(
      [...memories.values()].map(async (record) => ({
        ...record,
        photo: record.photo ? await readDataURL(record.photo) : null,
      })),
    );
    const blob = new Blob(
      [
        JSON.stringify(
          {
            format: "our-little-archipelago",
            version: 1,
            exportedAt: new Date().toISOString(),
            memories: records,
          },
          null,
          2,
        ),
      ],
      { type: "application/json" },
    );
    const url = URL.createObjectURL(blob),
      a = document.createElement("a");
    a.href = url;
    a.download = `我們的家-回憶備份-${new Date().toLocaleDateString("sv-SE")}.json`;
    document.body.append(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 30000);
    $("#backup-status").textContent =
      `已匯出 ${records.length} 座島嶼的回憶，請妥善保管下載的檔案。`;
  } catch (error) {
    $("#backup-status").textContent = error.message;
  } finally {
    button.disabled = false;
  }
});
function validDate(date) {
  if (date === "") return true;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return false;
  const parsed = new Date(`${date}T00:00:00Z`);
  return (
    !Number.isNaN(parsed.getTime()) &&
    parsed.toISOString().slice(0, 10) === date &&
    date >= "1900-01-01" &&
    date <= "2200-12-31"
  );
}
async function validateBackup(data) {
  if (
    data?.format !== "our-little-archipelago" ||
    data.version !== 1 ||
    !Array.isArray(data.memories) ||
    data.memories.length > ISLANDS.length
  )
    throw new Error("這不是有效的回憶群島備份檔案。");
  const ids = new Set(),
    records = [];
  for (const raw of data.memories) {
    if (
      !raw ||
      !byId(raw.id) ||
      ids.has(raw.id) ||
      typeof raw.name !== "string" ||
      !raw.name.trim() ||
      raw.name.length > 30 ||
      typeof raw.story !== "string" ||
      raw.story.length > 6000 ||
      typeof raw.date !== "string" ||
      !validDate(raw.date)
    )
      throw new Error("備份的島嶼資料格式不正確，尚未匯入任何回憶。");
    ids.add(raw.id);
    let photo = null;
    if (raw.photo !== null && raw.photo !== undefined) {
      if (
        typeof raw.photo !== "string" ||
        raw.photo.length > 6 * 1024 * 1024 ||
        !/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(raw.photo)
      )
        throw new Error("備份中的照片格式不正確。");
      const [header, encoded] = raw.photo.split(",");
      const bytes = Uint8Array.from(atob(encoded), (char) =>
        char.charCodeAt(0),
      );
      photo = new Blob([bytes], { type: header.slice(5, header.indexOf(";")) });
      // Decode and normalize imported images as well as newly uploaded images.
      photo = await shrinkPhoto(photo);
    }
    records.push({
      id: raw.id,
      name: raw.name.trim(),
      date: raw.date,
      story: raw.story,
      photo,
    });
  }
  return records;
}
$("#import-memory").addEventListener("change", async (event) => {
  const input = event.currentTarget,
    file = input.files[0];
  if (!file) return;
  const status = $("#backup-status");
  status.textContent = "正在檢查備份…";
  input.disabled = true;
  try {
    await storageReady;
    if (file.size > 60 * 1024 * 1024)
      throw new Error("備份檔案過大，請選擇 60 MB 以內的備份。");
    let data;
    try {
      data = JSON.parse(await file.text());
    } catch {
      throw new Error("無法讀取備份，請選擇有效的 JSON 檔案。");
    }
    const records = await validateBackup(data);
    if (!records.length) {
      status.textContent = "這份備份沒有回憶，現有資料保持原樣。";
      return;
    }
    await persist(records);
    renderMap();
    status.textContent = `已成功匯入 ${records.length} 座島嶼的回憶。`;
    toast("歡迎回家，回憶已經靠岸。");
  } catch (error) {
    status.textContent = error.message;
  } finally {
    input.value = "";
    input.disabled = false;
  }
});
$(".import-button").addEventListener("keydown", (event) => {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    $("#import-memory").click();
  }
});

renderMap();
transformMap();
storageReady.then(() => {
  renderMap();
  if (storageError) toast("瀏覽器暫時無法儲存回憶；地圖仍可探索。");
});
window.memoryIslands = {
  islands: ISLANDS,
  openIsland,
  getName: currentName,
  getFilter: () => activeFilter,
};
document.dispatchEvent(new Event("memory-islands-ready"));
