import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const db = new Database(join(__dirname, '..', 'oscar.db'));

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    name_ru TEXT,
    image TEXT,
    sort_order INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS menu_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    category_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    name_ru TEXT,
    description TEXT,
    description_ru TEXT,
    price REAL NOT NULL,
    weight TEXT,
    image TEXT,
    available INTEGER DEFAULT 1,
    sort_order INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS feedback (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    message TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    is_read INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS admin (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS bookings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    date TEXT NOT NULL,
    guests INTEGER,
    event_type TEXT,
    hall TEXT,
    message TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    status TEXT DEFAULT 'new'
  );
`);

// Migrate: add event_type column if missing
try {
  db.prepare("SELECT event_type FROM bookings LIMIT 1").get();
} catch {
  db.exec("ALTER TABLE bookings ADD COLUMN event_type TEXT");
}

// Create default admin if none exists
const adminExists = db.prepare('SELECT COUNT(*) as count FROM admin').get();
if (adminExists.count === 0) {
  const hash = bcrypt.hashSync('oscar2024', 10);
  db.prepare('INSERT INTO admin (username, password) VALUES (?, ?)').run('admin', hash);
}

// Seed Oscar menu if empty
const catCount = db.prepare('SELECT COUNT(*) as count FROM categories').get();
if (catCount.count === 0) {
  const insertCat = db.prepare('INSERT INTO categories (name, name_ru, sort_order) VALUES (?, ?, ?)');
  const insertItem = db.prepare('INSERT INTO menu_items (category_id, name, name_ru, description, description_ru, price, weight, image, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)');

  const cats = [
    { name: 'Gustări Reci', name_ru: 'Холодные закуски', items: [
      { name: 'Set de brânzeturi italiene', name_ru: 'Итальянское сырное ассорти', desc: 'Selecție de brânzeturi italiene cu miere și nuci', desc_ru: 'Ассорти итальянских сыров с мёдом и орехами', price: 264, weight: '250/100g', img: 'DSCF2848.webp' },
      { name: 'Set de mezeluri italiene', name_ru: 'Итальянское мясное ассорти', desc: 'Prosciutto, salami, carne uscată', desc_ru: 'Прошутто, салями, вяленое мясо', price: 198, weight: '200/50g', img: 'DSCF2836.webp' },
      { name: 'Bufolino', name_ru: 'Буфолино', desc: 'Mozzarella di bufala cu roșii și busuioc', desc_ru: 'Моцарелла буфала с томатами и базиликом', price: 118, weight: '200g', img: null },
      { name: 'Hummus cu pita', name_ru: 'Хумус с питой', desc: 'Hummus de casă cu pâine pita', desc_ru: 'Домашний хумус с хлебом пита', price: 45, weight: '300g', img: null },
      { name: 'Platou de hering', name_ru: 'Селёдочная тарелка', desc: 'Hering marinat cu unt și ceapă', desc_ru: 'Маринованная сельдь с маслом и луком', price: 118, weight: '100/50g', img: 'DSCF2839.webp' },
      { name: 'Bruschete asortate', name_ru: 'Брускетты ассорти', desc: 'Bruschete de 3 tipuri', desc_ru: 'Брускетты 3 видов', price: 128, weight: '200g', img: 'DSCF3074.webp' },
    ]},
    { name: 'Gustări Calde', name_ru: 'Горячие закуски', items: [
      { name: 'Vinete', name_ru: 'Баклажаны', desc: 'Vinete coapte cu legume', desc_ru: 'Запечённые баклажаны с овощами', price: 78, weight: '300g', img: null },
      { name: 'Brânză Brie în panir', name_ru: 'Бри в панировке', desc: 'Brie crocant cu sos de fructe', desc_ru: 'Хрустящий бри с фруктовым соусом', price: 158, weight: '120/30g', img: null },
      { name: 'Ardei cu feta și bacon', name_ru: 'Перец с фетой и беконом', desc: 'Ardei umpluți cu brânză feta și bacon', desc_ru: 'Перцы, фаршированные фетой и беконом', price: 98, weight: '250g', img: 'DSCF3813.webp' },
      { name: 'Bile de cașcaval', name_ru: 'Сырные шарики', desc: 'Bile de brânză prăjite cu sos', desc_ru: 'Жареные сырные шарики с соусом', price: 78, weight: '150/50g', img: 'DSCF3014.webp' },
      { name: 'Fructe de mare în smântână', name_ru: 'Морепродукты в сливках', desc: 'Mix de fructe de mare în sos cremos', desc_ru: 'Микс из морепродуктов в сливочном соусе', price: 150, weight: '250g', img: null },
      { name: 'Broccoli Art-Lunch', name_ru: 'Брокколи Арт-Ланч', desc: 'Broccoli în tempura cu sos', desc_ru: 'Брокколи в темпуре с соусом', price: 120, weight: '250g', img: null },
    ]},
    { name: 'Salate', name_ru: 'Салаты', items: [
      { name: 'Cocktail din creveți', name_ru: 'Коктейль из креветок', desc: 'Creveți cu avocado și sos cocktail', desc_ru: 'Креветки с авокадо и коктейльным соусом', price: 138, weight: '200g', img: null },
      { name: 'Salată cu curcan', name_ru: 'Салат с индейкой', desc: 'Curcan la grătar cu legume proaspete', desc_ru: 'Индейка гриль со свежими овощами', price: 98, weight: '250g', img: null },
      { name: 'Salată de legume', name_ru: 'Овощной салат', desc: 'Legume proaspete de sezon', desc_ru: 'Свежие сезонные овощи', price: 68, weight: '280g', img: null },
      { name: 'Salată cu ton', name_ru: 'Салат с тунцом', desc: 'Ton, ouă, legume proaspete', desc_ru: 'Тунец, яйца, свежие овощи', price: 118, weight: '250g', img: null },
    ]},
    { name: 'Supe', name_ru: 'Супы', items: [
      { name: 'Borș roșu', name_ru: 'Красный борщ', desc: 'Borș tradițional cu smântână', desc_ru: 'Традиционный борщ со сметаной', price: 70, weight: '300g', img: null },
      { name: 'Bulion', name_ru: 'Бульон', desc: 'Bulion de casă cu tăiței', desc_ru: 'Домашний бульон с лапшой', price: 75, weight: '300g', img: null },
      { name: 'Harcho', name_ru: 'Харчо', desc: 'Supă picantă georgiană cu vită', desc_ru: 'Острый грузинский суп с говядиной', price: 88, weight: '250g', img: null },
      { name: 'Okroshka', name_ru: 'Окрошка', desc: 'Supă rece tradițională', desc_ru: 'Традиционный холодный суп', price: 60, weight: '300g', img: null },
    ]},
    { name: 'Paste', name_ru: 'Паста', items: [
      { name: 'Carbonara', name_ru: 'Карбонара', desc: 'Paste cu guanciale și parmezan', desc_ru: 'Паста с гуанчиале и пармезаном', price: 105, weight: '350g', img: null },
      { name: 'Quattro Formaggi', name_ru: 'Четыре сыра', desc: 'Paste cu 4 tipuri de brânză', desc_ru: 'Паста с 4 видами сыра', price: 118, weight: '350g', img: null },
      { name: 'Fettuccine cu pui', name_ru: 'Феттучини с курицей', desc: 'Fettuccine cu pui și ciuperci', desc_ru: 'Феттучини с курицей и грибами', price: 98, weight: '380g', img: 'DSCF3801.webp' },
      { name: 'Ravioli cu pui și spanac', name_ru: 'Равиоли с курицей и шпинатом', desc: 'Ravioli de casă cu sos cremos', desc_ru: 'Домашние равиоли со сливочным соусом', price: 135, weight: '200g', img: 'DSCF2990.webp' },
    ]},
    { name: 'Carne de Pui', name_ru: 'Курица', items: [
      { name: 'Pui la grătar', name_ru: 'Курица гриль', desc: 'Piept de pui la grătar cu garnitură', desc_ru: 'Куриная грудка гриль с гарниром', price: 175, weight: '350/250g', img: null },
      { name: 'Pui cu spanac', name_ru: 'Курица со шпинатом', desc: 'Piept de pui cu sos de spanac și brânză', desc_ru: 'Куриная грудка в соусе из шпината и сыра', price: 180, weight: '300g', img: 'DSCF3056.webp' },
      { name: 'Zebra', name_ru: 'Зебра', desc: 'Piept de pui în două culori', desc_ru: 'Куриная грудка в двух цветах', price: 75, weight: '250g', img: null },
      { name: 'Aripioare în sos asiatic', name_ru: 'Крылышки в азиатском соусе', desc: 'Aripioare crocante cu sos dulce-picant', desc_ru: 'Хрустящие крылышки в сладко-остром соусе', price: 188, weight: '250/200g', img: null },
    ]},
    { name: 'Carne de Porc', name_ru: 'Свинина', items: [
      { name: 'Coaste de porc', name_ru: 'Свиные рёбрышки', desc: 'Coaste marinate la cuptor', desc_ru: 'Маринованные рёбрышки из печи', price: 165, weight: '250/50g', img: null },
      { name: 'Ciolan de porc', name_ru: 'Свиная рулька', desc: 'Ciolan cu cartofi la cuptor', desc_ru: 'Рулька с запечённым картофелем', price: 258, weight: '300/50g', img: 'DSCF3039.webp' },
      { name: 'Steak Sweet Chilli', name_ru: 'Стейк Свит Чили', desc: 'Steak de porc cu sos dulce-picant', desc_ru: 'Стейк из свинины со сладко-острым соусом', price: 158, weight: '300g', img: null },
      { name: 'Medalioane', name_ru: 'Медальоны', desc: 'Medalioane de porc în bacon cu sos de ciuperci', desc_ru: 'Свиные медальоны в беконе с грибным соусом', price: 180, weight: '250/50g', img: 'DSCF2828.webp' },
      { name: 'Coaste BBQ', name_ru: 'Рёбрышки BBQ', desc: 'Coaste glazurate BBQ', desc_ru: 'Глазированные рёбрышки BBQ', price: 238, weight: '450/50g', img: null },
    ]},
    { name: 'Carne de Vită', name_ru: 'Говядина', items: [
      { name: 'Filet Mignon', name_ru: 'Филе Миньон', desc: 'Filet mignon clasic cu sos', desc_ru: 'Классическое филе миньон с соусом', price: 218, weight: '250/50g', img: null },
      { name: 'Steak Clasic', name_ru: 'Классический стейк', desc: 'Steak de vită la grătar', desc_ru: 'Стейк из говядины на гриле', price: 235, weight: '250/50g', img: 'DSCF2832.webp' },
      { name: 'Ribeye', name_ru: 'Рибай', desc: 'Steak Ribeye premium', desc_ru: 'Премиум стейк Рибай', price: 600, weight: '320g', img: null },
      { name: 'Striploin', name_ru: 'Стриплойн', desc: 'Steak Striploin maturat', desc_ru: 'Выдержанный стейк Стриплойн', price: 450, weight: '250g', img: null },
      { name: 'Chateaubriand', name_ru: 'Шатобриан', desc: 'Steak dublu de vită', desc_ru: 'Двойной стейк из говядины', price: 225, weight: '280g', img: null },
      { name: 'Limbă la grătar', name_ru: 'Язык на гриле', desc: 'Limbă de vită cu sos cremos', desc_ru: 'Говяжий язык со сливочным соусом', price: 208, weight: '250/50g', img: 'DSCF3049.webp' },
      { name: 'Lula-Kebab', name_ru: 'Люля-кебаб', desc: 'Kebab de vită la grătar', desc_ru: 'Говяжий кебаб на гриле', price: 98, weight: '250g', img: null },
    ]},
    { name: 'Pește', name_ru: 'Рыба', items: [
      { name: 'Scrumbie Misheli', name_ru: 'Скумбрия Мишели', desc: 'Scrumbie cu legume în sos', desc_ru: 'Скумбрия с овощами в соусе', price: 150, weight: '250g', img: 'DSCF2888.webp' },
      { name: 'Dorada cu legume', name_ru: 'Дорадо с овощами', desc: 'Dorada întreagă la cuptor', desc_ru: 'Целая дорадо из печи', price: 248, weight: '300g', img: 'DSCF3007.webp' },
      { name: 'Steak de somon', name_ru: 'Стейк из лосося', desc: 'Somon la grătar cu lămâie', desc_ru: 'Лосось на гриле с лимоном', price: 235, weight: '225g', img: null },
      { name: 'Somon cu sos de creveți', name_ru: 'Лосось в соусе из креветок', desc: 'Somon în sos cremos de creveți', desc_ru: 'Лосось в сливочном соусе из креветок', price: 275, weight: '250g', img: null },
      { name: 'Păstrăv cu legume', name_ru: 'Форель с овощами', desc: 'Păstrăv la cuptor cu legume', desc_ru: 'Форель запечённая с овощами', price: 210, weight: '450g', img: null },
    ]},
    { name: 'Sushi', name_ru: 'Суши', items: [
      { name: 'Philadelphia Clasic', name_ru: 'Филадельфия Классик', desc: 'Somon, cream cheese, castraveți', desc_ru: 'Лосось, крем-чиз, огурец', price: 135, weight: '280g', img: 'DSCF3062.webp' },
      { name: 'Philadelphia cu avocado', name_ru: 'Филадельфия с авокадо', desc: 'Somon, cream cheese, avocado', desc_ru: 'Лосось, крем-чиз, авокадо', price: 145, weight: '280g', img: null },
      { name: 'California', name_ru: 'Калифорния', desc: 'Crab, avocado, castraveți', desc_ru: 'Краб, авокадо, огурец', price: 135, weight: '280g', img: null },
      { name: 'Soft Roll', name_ru: 'Софт Ролл', desc: 'Roll moale cu diverse umpluturi', desc_ru: 'Мягкий ролл с разными начинками', price: 160, weight: '280g', img: 'DSCF3060.webp' },
    ]},
    { name: 'Garnituri', name_ru: 'Гарниры', items: [
      { name: 'Cartofi prăjiți', name_ru: 'Картофель фри', desc: 'Cartofi crocanti', desc_ru: 'Хрустящий картофель', price: 35, weight: '200g', img: null },
      { name: 'Orez', name_ru: 'Рис', desc: 'Orez parfumat', desc_ru: 'Ароматный рис', price: 35, weight: '200g', img: null },
      { name: 'Legume la grătar', name_ru: 'Овощи гриль', desc: 'Mix de legume de sezon la grătar', desc_ru: 'Микс из сезонных овощей на гриле', price: 55, weight: '250g', img: null },
    ]},
    { name: 'Deserturi', name_ru: 'Десерты', items: [
      { name: 'Tres Leches', name_ru: 'Три молока', desc: 'Prăjitură clasică cu 3 tipuri de lapte', desc_ru: 'Классический торт с 3 видами молока', price: 50, weight: '150g', img: 'DSCF2873.webp' },
      { name: 'Flan de ciocolată', name_ru: 'Шоколадный флан', desc: 'Flan cu ciocolată neagră', desc_ru: 'Флан из тёмного шоколада', price: 75, weight: '140g', img: null },
      { name: 'Căciula lui Guguță', name_ru: 'Шапка Гугуцэ', desc: 'Desert tradițional cu vișine și ciocolată', desc_ru: 'Традиционный десерт с вишней и шоколадом', price: 88, weight: '150g', img: 'DSCF2901.webp' },
      { name: 'Tartă cu mere', name_ru: 'Яблочный тарт', desc: 'Tartă cu mere și scorțișoară', desc_ru: 'Тарт с яблоками и корицей', price: 78, weight: '150g', img: null },
      { name: 'Brownie Cheesecake', name_ru: 'Брауни Чизкейк', desc: 'Cheesecake cu brownie de ciocolată', desc_ru: 'Чизкейк с шоколадным брауни', price: 75, weight: '200g', img: null },
      { name: 'Crème Brûlée', name_ru: 'Крем Брюле', desc: 'Crème brûlée clasică', desc_ru: 'Классический крем-брюле', price: 49, weight: '150g', img: 'DSCF2953.webp' },
      { name: 'Baba Neagră', name_ru: 'Чёрная Баба', desc: 'Desert tradițional cu sos de ciocolată', desc_ru: 'Традиционный десерт с шоколадным соусом', price: 58, weight: '200g', img: null },
      { name: 'Napoleon', name_ru: 'Наполеон', desc: 'Foi fragede cu cremă de vanilie', desc_ru: 'Хрустящие слои с ванильным кремом', price: 55, weight: '150g', img: 'DSCF2933.webp' },
    ]},
    { name: 'Platouri', name_ru: 'Плато', items: [
      { name: 'Platou Bavaria', name_ru: 'Плато Бавария', desc: 'Cârnați, ciolan, coaste, mici, cartofi', desc_ru: 'Колбаски, рулька, рёбрышки, мичи, картофель', price: 435, weight: '1100g', img: 'DSCF2856.webp' },
      { name: 'Platou Bucovina', name_ru: 'Плато Буковина', desc: 'Sarmale, mămăligă, brânză, smântână', desc_ru: 'Сарамале, мамалыга, брынза, сметана', price: 390, weight: '1200g', img: 'DSCF3089.webp' },
    ]},
  ];

  cats.forEach((cat, ci) => {
    const result = insertCat.run(cat.name, cat.name_ru, ci);
    const catId = result.lastInsertRowid;
    cat.items.forEach((item, ii) => {
      insertItem.run(catId, item.name, item.name_ru, item.desc, item.desc_ru, item.price, item.weight, item.img, ii);
    });
  });
}

export default db;
