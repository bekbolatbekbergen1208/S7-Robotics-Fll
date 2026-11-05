// Данные групп деталей для секции «Разбери кораблик».
// nodes — оригинальные имена узлов из GLB (с пробелами); при загрузке они сравниваются
// через THREE.PropertyBinding.sanitizeNodeName.
// explodeOffset, cameraPosition, cameraTarget — в метрах, в координатах модели
// (нос +X, Y вверх, низ на y=0). Камеры рассчитаны для разобранного состояния.
// Тексты в квадратных скобках — плейсхолдеры: заполните их реальными данными команды.

export type Vec3 = [number, number, number];

/** prototype — «Есть в прототипе», concept — «Концепт», next — «Следующий этап». */
export type PartStatus = "prototype" | "concept" | "next";

export type PartId =
  | "hull"
  | "deck"
  | "solar"
  | "basket"
  | "conveyor"
  | "drive"
  | "electronics"
  | "camera"
  | "navigation"
  | "rescue"
  | "thrusters"
  | "water"
  | "battery";

export interface PartGroup {
  id: PartId;
  title: string;
  status: PartStatus;
  material: string;
  purpose: string;
  whyChosen: string;
  nodes: string[];
  explodeOffset: Vec3;
  cameraPosition: Vec3;
  cameraTarget: Vec3;
}

const split = (list: string) => list.split(",").map((s) => s.trim());

export const PARTS: PartGroup[] = [
  {
    id: "hull",
    title: "Корпус",
    status: "concept",
    material: "Предлагаемый узел; конкретные компоненты и материалы выбираются при создании прототипа.",
    purpose: "Держит кораблик на воде и несёт все модули.",
    whyChosen: "Концепция: компоновка показана на модели. Конструкция и характеристики требуют проверки на прототипе.",
    nodes: split(
      "Starboard hull shell, Port hull shell, Bow and transom caps, Rubber side fenders, Teal hull stripe, Hull graphics, Hull panel joints, Hull fasteners",
    ),
    explodeOffset: [0, -0.35, 0],
    cameraPosition: [2.14, 1.89, 2.68],
    cameraTarget: [-0.03, -0.09, 0],
  },
  {
    id: "deck",
    title: "Палуба и рама",
    status: "concept",
    material: "Предлагаемый узел; конкретные компоненты и материалы выбираются при создании прототипа.",
    purpose: "Поперечные балки и палуба связывают модули в одну конструкцию.",
    whyChosen: "Концепция: компоновка показана на модели. Конструкция и характеристики требуют проверки на прототипе.",
    nodes: split(
      "Side deck, Flush deck hatches, Hatch grip recess, Deck hinges, Fore service panel, LED recess, Cyan navigation strips, Cleat mounting pads, Mooring cleats, Cleat screws, Navigation lamp housings, Navigation lamp lenses, Main transverse beams, Beam brackets, Beam bracket bolts, Rear main deck, Rear deck edge rails, Aft anti slip tread, Hull identifier",
    ),
    explodeOffset: [0, 0.1, 0],
    cameraPosition: [1.66, 2.71, 2.15],
    cameraTarget: [-0.13, 0.49, 0],
  },
  {
    id: "solar",
    title: "Солнечные панели",
    status: "next",
    material: "Предлагаемый узел; конкретные компоненты и материалы выбираются при создании прототипа.",
    purpose: "Концепция: компоновка показана на модели. Конструкция и характеристики требуют проверки на прототипе.",
    whyChosen: "Концепция: компоновка показана на модели. Конструкция и характеристики требуют проверки на прототипе.",
    nodes: split("Solar module frame, Solar cells, Photovoltaic busbars"),
    explodeOffset: [0.1, 0.75, 0],
    cameraPosition: [0.35, 2.58, 1.09],
    cameraTarget: [-0.54, 1.2, 0],
  },
  {
    id: "basket",
    title: "Корзина для мусора",
    status: "concept",
    material: "Предлагаемый узел; конкретные компоненты и материалы выбираются при создании прототипа.",
    purpose: "Принимает мусор с конвейера и хранит его до разгрузки.",
    whyChosen: "Концепция: компоновка показана на модели. Конструкция и характеристики требуют проверки на прототипе.",
    nodes: split(
      "Cargo basket floor, Cargo basket rim, Basket perforation ribs, Basket grid rails, Basket end grid, Basket lifting handles, Cargo basket label, Basket quick release, Basket latch pins",
    ),
    explodeOffset: [0, 0.55, 0],
    cameraPosition: [0.69, 1.76, 0.88],
    cameraTarget: [-0.03, 0.91, 0],
  },
  {
    id: "conveyor",
    title: "Конвейер-сборщик",
    status: "concept",
    material: "Предлагаемый узел; конкретные компоненты и материалы выбираются при создании прототипа.",
    purpose: "Поднимает мусор с поверхности воды от носа к корзине.",
    whyChosen: "Концепция: компоновка показана на модели. Конструкция и характеристики требуют проверки на прототипе.",
    nodes: split(
      "Conveyor underlying belt, Conveyor main rails, Conveyor rail cap, Rail fixings, Individual conveyor chain links, Chain pivot pins, Conveyor rollers, Roller bearing caps, Bearing hub, Bearing cap bolts, Longitudinal belt wires, Transverse belt wires, Belt collecting cleats, Belt cleat screws, Conveyor warning",
    ),
    explodeOffset: [0.8, 0.1, 0],
    cameraPosition: [2.56, 1.07, 1.17],
    cameraTarget: [1.56, 0.4, 0],
  },
  {
    id: "drive",
    title: "Привод конвейера",
    status: "concept",
    material: "Предлагаемый узел; конкретные компоненты и материалы выбираются при создании прототипа.",
    purpose: "Мотор с редуктором вращает ленту конвейера.",
    whyChosen: "Концепция: компоновка показана на модели. Конструкция и характеристики требуют проверки на прототипе.",
    nodes: split(
      "Conveyor motor pedestal, Motor pedestal bolts, Gearbox output shaft, Conveyor drive motor, Motor cooling fins, Belt drive gearbox, Gearbox cover bolts, Conveyor power cable",
    ),
    explodeOffset: [0.3, 0.5, 0.6],
    cameraPosition: [1.02, 1.62, 2.18],
    cameraTarget: [0.29, 0.98, 0.89],
  },
  {
    id: "electronics",
    title: "Блок электроники",
    status: "concept",
    material: "Предлагаемый узел; конкретные компоненты и материалы выбираются при создании прототипа.",
    purpose: "Концепция: компоновка показана на модели. Конструкция и характеристики требуют проверки на прототипе.",
    whyChosen: "Концепция: компоновка показана на модели. Конструкция и характеристики требуют проверки на прототипе.",
    nodes: split(
      "Central electronics enclosure, Electronics top hatch, Electronics ventilation slots, Enclosure cable glands",
    ),
    explodeOffset: [-0.2, 0.7, 0],
    cameraPosition: [-0.25, 1.63, 0.63],
    cameraTarget: [-0.77, 1.15, 0],
  },
  {
    id: "camera",
    title: "Камера и лидар",
    status: "concept",
    material: "Предлагаемый узел; конкретные компоненты и материалы выбираются при создании прототипа.",
    purpose: "Концепция: компоновка показана на модели. Конструкция и характеристики требуют проверки на прототипе.",
    whyChosen: "Концепция: компоновка показана на модели. Конструкция и характеристики требуют проверки на прототипе.",
    nodes: split(
      "Camera mast foot, Mast base bolts, Camera pan drive, Mast sensor face, Mast lidar window, Camera mast column, Mast collars, Blue mast status ring, Stereo camera enclosure, Camera rear cap, Optical lens bezels, Optical lens glass, Optical lens iris, Optical lens aperture, Camera fasteners, Camera signal cable",
    ),
    explodeOffset: [0, 0.85, -0.5],
    cameraPosition: [0.36, 1.73, 0.08],
    cameraTarget: [-0.34, 1.49, -0.5],
  },
  {
    id: "navigation",
    title: "Связь и навигация",
    status: "concept",
    material: "Предлагаемый узел; конкретные компоненты и материалы выбираются при создании прототипа.",
    purpose: "Антенны, GPS-купол и маяк на кормовой арке. Концепция: компоновка показана на модели. Конструкция и характеристики требуют проверки на прототипе.",
    whyChosen: "Концепция: компоновка показана на модели. Конструкция и характеристики требуют проверки на прототипе.",
    nodes: split(
      "Antenna mounting bases, Whip antenna, Antenna tips, Rear sensor arch, Arch mounting feet, Arch foot bolts, Arch upper bar, Arch cyan insert, Beacon base, Amber rotating beacon, Beacon lower collar, GPS dome",
    ),
    explodeOffset: [-0.6, 0.8, -0.3],
    cameraPosition: [-1.1, 1.84, 0.75],
    cameraTarget: [-1.52, 1.41, -0.3],
  },
  {
    // Не разделять: трос физически соединяет лебёдку и спасательный круг.
    id: "rescue",
    title: "Спасательный модуль",
    status: "concept",
    material: "Предлагаемый узел; конкретные компоненты и материалы выбираются при создании прототипа.",
    purpose:
      "Концепт: круг выпускается на тросе, барабан лебёдки сматывает трос обратно. На модели круг показан в сложенном положении.",
    whyChosen: "Концепция: компоновка показана на модели. Конструкция и характеристики требуют проверки на прототипе.",
    nodes: split(
      "Lifebuoy ring, Lifebuoy safety rope, Lifebuoy mounting brackets, Rope retainers, Rescue winch mounting tray, Rescue winch mounting gasket, Rescue winch deck bolts, Winch bearing pedestals, Winch pedestal bearings, Winch bearing hubs, Winch support fixings, Rescue drum barrel, Rescue drum axle, Rescue spool side flanges, Rescue spool edge rims, Spool flange vent recesses, Wound rescue line, Rescue winch gear case, Rescue winch motor, Rescue motor cooling fins, Rescue gear cover fasteners, Rescue winch wiring, Rescue module identification, Rescue line guide feet, Fairlead deck bolts, Fairlead cheeks, Fairlead roller, Fairlead retention hoop, Outboard fairlead standoffs, Connected rescue retrieval line, Rescue rope rounded bends, Lifebuoy tether attachment, Tether clip locking sleeve, Lifebuoy release strap, Lifebuoy release catch, Lifebuoy red release tab, Stowed ring status plate",
    ),
    explodeOffset: [-0.7, 0.45, 0.7],
    cameraPosition: [-1.2, 1.45, 2.05],
    cameraTarget: [-1.58, 0.97, 0.94],
  },
  {
    id: "thrusters",
    title: "Двигатели и винты",
    status: "concept",
    material: "Предлагаемый узел; конкретные компоненты и материалы выбираются при создании прототипа.",
    purpose: "Два подводных мотора с винтами в защитных кожухах двигают кораблик.",
    whyChosen: "Концепция: компоновка показана на модели. Конструкция и характеристики требуют проверки на прототипе.",
    nodes: split(
      "Underwater motor pods, Motor pod caps, Propeller safety shrouds, Propeller hubs, Propeller blades, Thruster guard stays, Thruster mount, Motor mount flanges, Underside motor fixing bolts",
    ),
    explodeOffset: [-0.7, -0.5, 0],
    cameraPosition: [-1.05, -0.16, 1.3],
    cameraTarget: [-1.72, -0.43, 0],
  },
  {
    id: "water",
    title: "Датчики воды (pH, EC, T)",
    status: "concept",
    material: "Концепция: компоновка показана на модели. Конструкция и характеристики требуют проверки на прототипе.",
    purpose: "Датчики кислотности (pH), электропроводности (EC) и температуры (T) воды.",
    whyChosen: "Концепция: компоновка показана на модели. Конструкция и характеристики требуют проверки на прототипе.",
    nodes: split(
      "Water sampling rack, Water sensor body, Water sensor tip, Sensor sealing ring, Probe protection cage, Sensor plaque, Probe signal harness",
    ),
    explodeOffset: [0, -0.75, 0],
    cameraPosition: [0.03, -0.38, 0.76],
    cameraTarget: [-0.49, -0.5, -0.03],
  },
  {
    id: "battery",
    title: "Аккумуляторный отсек",
    status: "concept",
    material: "Предлагаемый узел; конкретные компоненты и материалы выбираются при создании прототипа.",
    purpose: "Герметичный отсек под палубой для аккумулятора.",
    whyChosen: "Концепция: компоновка показана на модели. Конструкция и характеристики требуют проверки на прототипе.",
    nodes: split(
      "Under deck sealed battery bay, Battery bay support brackets, Battery bay fixings, Battery bay cooling ribs, Battery cable conduit",
    ),
    // Сдвинут дальше по Z: с [-0.5, -0.45, 0.6] отсек пересекался с опущенным корпусом.
    explodeOffset: [-0.6, -0.5, 1.0],
    cameraPosition: [-0.99, 0.18, 1.82],
    cameraTarget: [-1.38, -0.16, 0.98],
  },
];

/** Мусор на модели: не участвует в разборе, используется в анимации сбора. */
export const TRASH = {
  /** Бутылки на конвейере: едут вверх и исчезают над корзиной. Пары Концепция: компоновка показана на модели. Конструкция и характеристики требуют проверки на прототипе.. */
  conveyor: [
    ["Blue recovered bottle", "Blue recovered bottle label"],
    ["Yellow recovered bottle", "Yellow recovered bottle label"],
    ["White recovered bottle", "White recovered bottle label"],
  ],
  /** Мусор в корзине: скрыт, появляется после сбора. */
  basket: [
    ["Bottle inside cargo hold", "Bottle inside cargo hold label"],
    ["Second cargo bottle", "Second cargo bottle label"],
    ["Crushed can in basket"],
  ],
} as const;

/** Группы в секции разбора. Solar показывается только в секции «Будущее». */
export const EXPLORE_PARTS = PARTS.filter((p) => p.id !== "solar");

export const getPart = (id: PartId) => PARTS.find((p) => p.id === id)!;
