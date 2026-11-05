// Все тексты сайта. Текст в [квадратных скобках] — плейсхолдер:
// на сайте он подсвечивается янтарной рамкой, чтобы его нельзя было пропустить.
// Не вписывайте сюда факты и цифры без источника.

import type { PartStatus } from "./parts";

export const site = {
  title: "CaspianGuard AI — S7 Robotics",
  description:
    "Проект команды S7 Robotics для FIRST LEGO League, сезон BIOGLOW: кораблик, который собирает мусор с поверхности Каспия.",
  lang: "ru",
};

export const nav = {
  brand: "CaspianGuard AI",
  skip: "Перейти к содержанию",
  links: [
    { href: "#problem", label: "Проблема" },
    { href: "#solution", label: "Решение" },
    { href: "#explore", label: "Разбор" },
    { href: "#process", label: "Процесс" },
    { href: "#values", label: "Ценности" },
    { href: "#team", label: "Команда" },
  ],
};

export const hero = {
  kicker: "FIRST LEGO League · сезон BIOGLOW",
  titleParts: ["Caspian", "Guard", "AI"],
  phrase: "Кораблик, который забирает мусор с поверхности Каспия, пока тот не добрался до его обитателей.",
  team: "S7 Robotics",
  scrollHint: "Листайте вниз",
};

export const marquee = [
  "CaspianGuard AI",
  "S7 Robotics",
  "FIRST LEGO League",
  "BIOGLOW",
  "Каспийское море",
  "Чистая вода",
  "Биоразнообразие",
];

export const problem = {
  number: "01/",
  eyebrow: "Проблема",
  title: "Каспий загрязняется",
  lead: "[Как мусор на поверхности вредит обитателям Каспия: кому именно и каким образом]",
  facts: [
    { value: "[Цифра]", text: "[Факт 1 о загрязнении Каспия]", source: "[Источник 1: организация, год, ссылка]" },
    { value: "[Цифра]", text: "[Факт 2 о влиянии мусора на обитателей]", source: "[Источник 2: организация, год, ссылка]" },
    { value: "[Цифра]", text: "[Факт 3]", source: "[Источник 3: организация, год, ссылка]" },
  ],
};

export const solution = {
  number: "02/",
  eyebrow: "Решение",
  title: "Поднять мусор с воды на борт",
  lead: "CaspianGuard AI идёт по поверхности, конвейер на носу поднимает плавающий мусор и сбрасывает его в корзину.",
  steps: [
    { id: "conveyor", label: "Конвейер", text: "Поднимает мусор с воды от носа к корзине" },
    { id: "basket", label: "Корзина", text: "Копит собранное до разгрузки на берегу" },
    { id: "thrusters", label: "Двигатели", text: "Два винта в кожухах двигают кораблик" },
  ],
  note: "[Как кораблик находит мусор: вручную, по камере или по маршруту]",
};

export const explore = {
  number: "03/",
  eyebrow: "Разбери кораблик",
  title: "Разбери кораблик",
  hint: "Листайте, и кораблик разлетится на модули. Нажмите на деталь на модели или в списке.",
  hintTouch: "Листайте, и кораблик разлетится на модули. Выберите деталь в списке внизу.",
  inspectHint: "Перетащите, чтобы повернуть деталь. Колесо мыши приближает.",
  inspectHintTouch: "Проведите пальцем по детали, чтобы повернуть её.",
  disclaimer: "3D-модель показывает концепт. Скрытые механизмы на ней условны.",
  listLabel: "Детали кораблика",
  labels: {
    material: "Материал",
    purpose: "Функция",
    whyChosen: "Почему так",
  },
  controls: {
    prev: "←",
    prevLabel: "Предыдущая деталь",
    next: "→",
    nextLabel: "Следующая деталь",
    all: "Ко всем деталям",
    assemble: "Собрать корабль",
    escHint: "Esc — назад",
  },
  announce: (title: string, status: string) => `Выбрана деталь: ${title}. Статус: ${status}.`,
  announceAll: "Показаны все детали.",
};

export const statusLabels: Record<PartStatus, string> = {
  prototype: "Есть в прототипе",
  concept: "Концепт",
  next: "Следующий этап",
};

export const process = {
  number: "04/",
  eyebrow: "Как мы это сделали",
  title: "От идеи к прототипу",
  lead: "[Коротко: как команда шла от идеи к прототипу]",
  stages: [
    { title: "[Этап 1: исследование]", text: "[Что сделали]", test: "[Как проверяли]", change: "[Что изменили после теста]" },
    { title: "[Этап 2: первый прототип]", text: "[Что сделали]", test: "[Как проверяли]", change: "[Что изменили после теста]" },
    { title: "[Этап 3: испытания на воде]", text: "[Что сделали]", test: "[Как проверяли]", change: "[Что изменили после теста]" },
    { title: "[Этап 4: доработка]", text: "[Что сделали]", test: "[Как проверяли]", change: "[Что изменили после теста]" },
  ],
  labels: { test: "Тест", change: "Что изменили" },
};

export const future = {
  number: "05/",
  eyebrow: "Будущее",
  title: "Следующий шаг: энергия солнца",
  lead: "На модели уже есть место под солнечные панели на корме.",
  badge: "Следующий этап",
  plans: ["[План 1]", "[План 2]", "[План 3]"],
};

export const values = {
  number: "06/",
  eyebrow: "Core Values",
  title: "Шесть ценностей FIRST",
  lead: "Каждая ценность — реальная история из нашего сезона.",
  items: [
    { name: "Discovery", ru: "Открытие", story: "[История команды про Discovery]" },
    { name: "Innovation", ru: "Инновации", story: "[История команды про Innovation]" },
    { name: "Impact", ru: "Влияние", story: "[История команды про Impact]" },
    { name: "Inclusion", ru: "Вовлечённость", story: "[История команды про Inclusion]" },
    { name: "Teamwork", ru: "Командная работа", story: "[История команды про Teamwork]" },
    { name: "Fun", ru: "Удовольствие", story: "[История команды про Fun]" },
  ],
};

export const team = {
  number: "07/",
  eyebrow: "Команда",
  title: "S7 Robotics",
  lead: "[Пара слов о команде: город, школа или клуб]",
  members: [
    { name: "[Имя Фамилия]", role: "[Роль]" },
    { name: "[Имя Фамилия]", role: "[Роль]" },
    { name: "[Имя Фамилия]", role: "[Роль]" },
    { name: "[Имя Фамилия]", role: "[Роль]" },
    { name: "[Имя Фамилия]", role: "[Роль]" },
    { name: "[Имя Фамилия] — тренер", role: "[Роль]" },
  ],
};

export const finale = {
  kicker: "CaspianGuard AI",
  title: "S7 Robotics",
  line: "Чистая вода начинается с одного собранного куска пластика.",
  contactsTitle: "Связаться с командой",
  contacts: [
    { label: "Почта", value: "[email команды]", href: "" },
    { label: "Instagram", value: "[@аккаунт]", href: "" },
    { label: "Telegram", value: "[@аккаунт]", href: "" },
  ],
  footer: "Проект для FIRST LEGO League, сезон BIOGLOW. FIRST® и LEGO® — товарные знаки их владельцев.",
  modelNote: "3D-модель показывает концепт, скрытые механизмы условны.",
  backToTop: "Наверх",
};

export const loader = {
  title: "Спускаем кораблик на воду",
  failed: "Не удалось загрузить 3D-модель. Весь текст сайта доступен ниже.",
};

export const fallback = {
  imageAlt: "Концепт кораблика CaspianGuard AI: белый корпус с бирюзовой полосой, конвейер на носу, корзина для мусора, мачта с камерой.",
  noWebgl: "Ваш браузер не поддерживает WebGL, поэтому вместо 3D показано изображение.",
};

/** Подписи у 3D-точек в секции «Будущее». */
export const annotations = {
  solar: "Солнечные панели · Следующий этап",
};
