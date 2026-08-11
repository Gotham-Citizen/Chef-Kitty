const INGREDIENTS = {
  en: [
    // Meats & Poultry
    "chicken breast", "chicken thigh", "chicken drumstick", "chicken wings", "whole chicken",
    "ground chicken", "turkey breast", "ground turkey", "duck", "whole duck",
    "beef steak", "ground beef", "beef brisket", "beef chuck", "beef sirloin",
    "beef tenderloin", "beef ribs", "beef liver", "pork chop", "pork tenderloin",
    "pork shoulder", "pork belly", "ground pork", "bacon", "ham",
    "pork ribs", "sausage", "bratwurst", "chorizo", "pepperoni",
    "lamb chop", "lamb shoulder", "ground lamb", "lamb leg", "veal",
    "rabbit", "venison", "prosciutto", "salami", "pancetta",
    // Seafood
    "salmon", "tuna", "cod", "tilapia", "halibut",
    "mackerel", "sardines", "trout", "sea bass", "red snapper",
    "shrimp", "prawns", "scallops", "mussels", "clams",
    "oysters", "lobster", "crab", "crab meat", "squid",
    "octopus", "anchovies", "canned tuna", "canned salmon", "fish fillet",
    // Vegetables
    "tomato", "onion", "garlic", "ginger", "potato",
    "sweet potato", "carrot", "celery", "bell pepper", "broccoli",
    "cauliflower", "cabbage", "spinach", "kale", "lettuce",
    "arugula", "romaine lettuce", "iceberg lettuce", "green beans", "peas",
    "corn", "mushroom", "zucchini", "eggplant", "cucumber",
    "asparagus", "artichoke", "beetroot", "radish", "turnip",
    "parsnip", "butternut squash", "acorn squash", "pumpkin", "okra",
    "leek", "scallion", "shallot", "fennel", "brussels sprouts",
    "bok choy", "napa cabbage", "watercress", "swiss chard", "collard greens",
    "bean sprouts", "bamboo shoots", "water chestnuts", "snow peas", "bell pepper red",
    "bell pepper green", "bell pepper yellow", "jalapeno", "habanero", "serrano pepper",
    // Fruits
    "apple", "banana", "orange", "lemon", "lime",
    "grapefruit", "strawberry", "blueberry", "raspberry", "blackberry",
    "cranberry", "grape", "watermelon", "cantaloupe", "honeydew",
    "pineapple", "mango", "papaya", "avocado", "coconut",
    "peach", "nectarine", "plum", "apricot", "cherry",
    "pear", "fig", "date", "raisin", "prune",
    "kiwi", "dragon fruit", "passion fruit", "pomegranate", "lychee",
    "rhubarb", "plantain", "persimmon", "star fruit",
    // Grains & Pasta
    "rice", "white rice", "brown rice", "jasmine rice", "basmati rice",
    "sushi rice", "arborio rice", "wild rice", "quinoa", "couscous",
    "bulgur", "farro", "barley", "oats", "rolled oats",
    "steel cut oats", "cornmeal", "polenta", "spaghetti", "penne",
    "fettuccine", "linguine", "rigatoni", "elbow macaroni", "angel hair pasta",
    "lasagna noodles", "rice noodles", "soba noodles", "udon noodles", "ramen noodles",
    "egg noodles", "orzo", "bread", "whole wheat bread", "sourdough bread",
    "pita bread", "naan", "tortilla", "flour tortilla", "corn tortilla",
    "panko breadcrumbs", "breadcrumbs", "flour", "all purpose flour", "bread flour",
    "cake flour", "whole wheat flour", "almond flour", "coconut flour", "cornstarch",
    // Dairy & Eggs
    "butter", "unsalted butter", "milk", 
    "buttermilk", "heavy cream", "whipping cream", "sour cream", "cream cheese",
    "yogurt", "greek yogurt", "eggs", "egg whites", "egg yolks",
    "cheddar cheese", "mozzarella cheese", "parmesan cheese", "swiss cheese", "provolone cheese",
    "gouda", "brie", "blue cheese", "feta cheese", "goat cheese",
    "ricotta cheese", "cottage cheese", "mascarpone", "gruyere", "asiago",
    // Herbs & Spices
    "salt", "black pepper", "white pepper", "sea salt", "kosher salt",
    "garlic powder", "onion powder", "paprika", "smoked paprika", "cayenne pepper",
    "chili powder", "cumin", "coriander", "turmeric", "curry powder",
    "cinnamon", "nutmeg", "cloves", "allspice", "cardamom",
    "ginger powder", "mustard powder", "bay leaves", "oregano", "thyme",
    "rosemary", "sage", "basil", "dill", "parsley",
    "cilantro", "mint", "chives", "tarragon", "marjoram",
    "fennel seeds", "sesame seeds", "poppy seeds", "caraway seeds", "celery seeds",
    "red pepper flakes", "italian seasoning", "pumpkin pie spice", "garam masala", "five spice",
    "herbes de provence", "zaatar", "sumac", "saffron", "vanilla extract",
    "vanilla bean", "almond extract", "peppercorns", "msg",
    // Oils & Vinegars
    "olive oil", "extra virgin olive oil", "vegetable oil", "canola oil", "coconut oil",
    "sesame oil", "avocado oil", "peanut oil", "grapeseed oil", "sunflower oil",
    "balsamic vinegar", "white vinegar", "apple cider vinegar", "red wine vinegar", "rice vinegar",
    "white wine vinegar", "sherry vinegar", "chili oil", "truffle oil",
    // Sauces & Condiments
    "soy sauce", "light soy sauce", "dark soy sauce", "fish sauce", "oyster sauce",
    "hoisin sauce", "sriracha", "hot sauce", "tabasco", "chili garlic sauce",
    "ketchup", "mustard", "dijon mustard", "whole grain mustard", "honey mustard",
    "mayonnaise", "barbecue sauce", "worcestershire sauce", "teriyaki sauce", "miso paste",
    "tahini", "hummus", "pasta sauce", "marinara sauce", "alfredo sauce",
    "pesto", "tomato paste", "tomato sauce", "coconut milk", "coconut cream",
    "maple syrup", "honey", "molasses", "corn syrup", "chocolate sauce",
    "peanut butter", "almond butter", "jam", "marmalade", "pickles",
    "olives", "capers", "kimchi", "sauerkraut", "mango chutney",
    // Nuts & Seeds
    "almonds", "walnuts", "cashews", "pecans", "peanuts",
    "pine nuts", "macadamia nuts", "hazelnuts", "pistachios",
    "chia seeds", "flax seeds", "hemp seeds", "sunflower seeds", "pumpkin seeds",
    // Legumes
    "black beans", "kidney beans", "pinto beans", "chickpeas", "lentils",
    "red lentils", "green lentils", "split peas", "black eyed peas", "cannellini beans",
    "navy beans", "great northern beans", "edamame", "tofu", "firm tofu",
    "silken tofu", "tempeh", "mung beans", "adzuki beans", "refried beans",
    // Baking
    "sugar", "white sugar", "brown sugar", "powdered sugar", "confectioners sugar",
    "baking powder", "baking soda", "yeast", "active dry yeast", "instant yeast",
    "cocoa powder", "chocolate chips", "dark chocolate", "milk chocolate", "white chocolate",
    "unsweetened chocolate", "semisweet chocolate",
    "gelatin", "cream of tartar",
    "shortening", "lard", "applesauce",
    // Canned & Jarred
    "canned tomatoes", "crushed tomatoes", "diced tomatoes",
    "canned corn", "canned peas", "canned green beans", "canned mushrooms", "canned olives",
    "canned coconut milk", "canned pineapple", "canned peaches", "canned beans",
    "chicken broth", "beef broth", "vegetable broth", "bone broth",
    // Frozen
    "frozen peas", "frozen corn", "frozen broccoli", "frozen spinach", "frozen berries",
    "frozen mixed vegetables", "frozen french fries", "frozen pizza dough",
    // Other
    "seitan", "nori", "seaweed",
    "rice paper", "spring roll wrappers", "wonton wrappers", "gyoza wrappers",
    "chicken stock", "beef stock", "vegetable stock",
    "wine red", "wine white", "cooking wine", "mirin", "sake",
    "beer", "nutritional yeast", "protein powder", "matcha powder",
  ],
  zh: [
    // 肉类 & 家禽
    "鸡胸肉", "鸡腿肉", "鸡小腿", "鸡翅", "整鸡",
    "鸡肉末", "火鸡胸肉", "火鸡肉末", "鸭肉", "整鸭",
    "牛排", "牛肉末", "牛胸肉", "牛肩肉", "牛里脊肉",
    "牛里脊", "牛排骨", "牛肝", "猪排", "猪里脊肉",
    "猪肩肉", "五花肉", "猪肉末", "培根", "火腿",
    "猪排骨", "香肠", "德式香肠", "西班牙辣香肠", "意大利辣香肠",
    "羊排", "羊肩肉", "羊肉末", "羊腿", "小牛肉",
    "兔肉", "鹿肉", "意大利熏火腿", "萨拉米", "意大利培根",
    // 海鲜
    "三文鱼", "金枪鱼", "鳕鱼", "罗非鱼", "大比目鱼",
    "鲭鱼", "沙丁鱼", "鳟鱼", "海鲈鱼", "红鲷鱼",
    "虾", "大虾", "扇贝", "青口", "蛤蜊",
    "生蚝", "龙虾", "螃蟹", "蟹肉", "鱿鱼",
    "章鱼", "凤尾鱼", "金枪鱼罐头", "三文鱼罐头", "鱼片",
    // 蔬菜
    "番茄", "洋葱", "大蒜", "姜", "土豆",
    "红薯", "胡萝卜", "芹菜", "甜椒", "西兰花",
    "花椰菜", "卷心菜", "菠菜", "羽衣甘蓝", "生菜",
    "芝麻菜", "长叶生菜", "冰菜", "四季豆", "豌豆",
    "玉米", "蘑菇", "西葫芦", "茄子", "黄瓜",
    "芦笋", "洋蓟", "甜菜根", "萝卜", "芜菁",
    "欧洲防风根", "南瓜", "橡子南瓜", "秋葵",
    "韭葱", "青葱", "红葱头", "茴香", "抱子甘蓝",
    "小白菜", "大白菜", "西洋菜", "瑞士甜菜",
    "豆芽", "竹笋", "荸荠", "荷兰豆", "红甜椒",
    "青甜椒", "黄甜椒", "墨西哥辣椒", "哈瓦那辣椒", "塞拉诺辣椒",
    // 水果
    "苹果", "香蕉", "橙子", "柠檬", "青柠",
    "西柚", "草莓", "蓝莓", "覆盆子", "黑莓",
    "蔓越莓", "葡萄", "西瓜", "哈密瓜", "蜜瓜",
    "菠萝", "芒果", "木瓜", "牛油果", "椰子",
    "桃子", "油桃", "李子", "杏子", "樱桃",
    "梨", "无花果", "椰枣", "葡萄干", "西梅干",
    "猕猴桃", "火龙果", "百香果", "石榴", "荔枝",
    "大黄", "大蕉", "柿子", "杨桃",
    // 谷物 & 意面
    "大米", "白米", "糙米", "香米", "印度香米",
    "寿司米", "意大利米", "野生米", "藜麦", "库斯库斯",
    "碎小麦", "法罗麦", "大麦", "燕麦", "燕麦片",
    "钢切燕麦", "玉米面", "玉米糊", "意大利面", "通心粉",
    "宽面", "扁面", "波纹通心粉", "弯管通心粉", "天使细面",
    "千层面皮", "米粉", "荞麦面", "乌冬面", "拉面",
    "鸡蛋面", "粒粒面", "面包", "全麦面包", "酸面包",
    "皮塔饼", "印度烤饼", "玉米饼", "面粉玉米饼", "玉米薄饼",
    "日式面包糠", "面包糠", "面粉", "中筋面粉", "高筋面粉",
    "低筋面粉", "全麦面粉", "杏仁粉", "椰子面粉", "玉米淀粉",
    // 乳制品 & 鸡蛋
    "黄油", "无盐黄油", "牛奶", 
    "酪乳", "鲜奶油", "打发奶油", "酸奶油", "奶油奶酪",
    "酸奶", "希腊酸奶", "鸡蛋", "蛋白", "蛋黄",
    "切达奶酪", "马苏里拉奶酪", "帕玛森奶酪", "瑞士奶酪", "波罗伏洛奶酪",
    "高达奶酪", "布里奶酪", "蓝纹奶酪", "菲达奶酪", "山羊奶酪",
    "里科塔奶酪", "白软干酪", "马斯卡彭奶酪", "格鲁耶尔奶酪", "阿西亚戈奶酪",
    // 香草 & 香料
    "盐", "黑胡椒", "白胡椒", "海盐", "犹太盐",
    "大蒜粉", "洋葱粉", "红椒粉", "烟熏红椒粉", "卡宴辣椒粉",
    "辣椒粉", "孜然", "香菜籽", "姜黄", "咖喱粉",
    "肉桂", "肉豆蔻", "丁香", "多香果", "小豆蔻",
    "姜粉", "芥末粉", "香叶", "牛至", "百里香",
    "迷迭香", "鼠尾草", "罗勒", "莳萝", "欧芹",
    "香菜", "薄荷", "细香葱", "龙蒿", "马郁兰",
    "茴香籽", "芝麻", "罂粟籽", "葛缕子籽", "芹菜籽",
    "辣椒碎", "意大利综合香料", "南瓜派香料", "印度综合香料", "五香粉",
    "普罗旺斯香草", "中东综合香料", "盐肤木", "藏红花", "香草精",
    "香草豆荚", "杏仁精", "胡椒粒", "味精",
    // 油 & 醋
    "橄榄油", "特级初榨橄榄油", "植物油", "菜籽油", "椰子油",
    "芝麻油", "牛油果油", "花生油", "葡萄籽油", "葵花籽油",
    "意大利香醋", "白醋", "苹果醋", "红酒醋", "米醋",
    "白酒醋", "雪利醋", "辣椒油", "松露油",
    // 酱料 & 调味品
    "酱油", "生抽", "老抽", "鱼露", "蚝油",
    "海鲜酱", "是拉差酱", "辣酱", "塔巴斯科辣酱", "辣椒蒜酱",
    "番茄酱", "芥末", "第戎芥末", "全籽芥末", "蜂蜜芥末",
    "蛋黄酱", "烧烤酱", "伍斯特酱", "照烧酱", "味噌",
    "芝麻酱", "鹰嘴豆泥", "意面酱", "番茄意面酱", "白酱",
    "青酱", "番茄膏", "椰奶", "椰浆",
    "枫糖浆", "蜂蜜", "糖蜜", "玉米糖浆", "巧克力酱",
    "花生酱", "杏仁酱", "果酱", "橘子酱", "腌黄瓜",
    "橄榄", "酸豆", "泡菜", "德国酸菜", "芒果酸辣酱",
    // 坚果 & 种子
    "杏仁", "核桃", "腰果", "山核桃", "花生",
    "松子", "夏威夷果", "榛子", "开心果",
    "奇亚籽", "亚麻籽", "火麻籽", "葵花籽", "南瓜籽",
    // 豆类
    "黑豆", "红腰豆", "花腰豆", "鹰嘴豆", "扁豆",
    "红扁豆", "绿扁豆", "黑眼豆", "白腰豆",
    "小白豆", "大北豆", "毛豆", "豆腐", "老豆腐",
    "嫩豆腐", "天贝", "绿豆", "红豆", "炸豆泥",
    // 烘焙食材
    "糖", "白糖", "红糖", "糖粉", "糖霜",
    "泡打粉", "小苏打", "酵母", "活性干酵母", "速发酵母",
    "可可粉", "巧克力豆", "黑巧克力", "牛奶巧克力", "白巧克力",
    "无糖巧克力", "半甜巧克力",
    "明胶", "塔塔粉",
    "起酥油", "猪油", "苹果泥",
    // 罐头食品
    "番茄罐头", "番茄碎罐头", "番茄丁罐头", "番茄酱罐头", "番茄膏罐头",
    "玉米罐头", "豌豆罐头", "青豆罐头", "蘑菇罐头", "橄榄罐头",
    "椰奶罐头", "菠萝罐头", "桃子罐头", "豆子罐头",
    "鸡汤", "牛肉汤", "蔬菜汤", "骨头汤",
    // 冷冻食品
    "冷冻豌豆", "冷冻玉米", "冷冻西兰花", "冷冻菠菜", "冷冻浆果",
    "冷冻混合蔬菜", "冷冻薯条", "冷冻披萨面团",
    // 其他
    "面筋", "海苔", "海带",
    "米纸", "春卷皮", "馄饨皮", "饺子皮",
    "鸡高汤", "牛高汤", "蔬菜高汤", "骨头高汤",
    "红酒", "白酒", "料酒", "味醂", "清酒",
    "啤酒", "营养酵母", "蛋白粉", "抹茶粉",
  ],
  es: [
    // Carnes y Aves
    "pechuga de pollo", "muslo de pollo", "pierna de pollo", "alas de pollo", "pollo entero",
    "pollo molido", "pechuga de pavo", "pavo molido", "pato", "pato entero",
    "bistec de res", "carne de res molida", "pechuga de res", "paleta de res", "lomo de res",
    "filete de res", "costillas de res", "hígado de res", "chuleta de cerdo", "lomo de cerdo",
    "paleta de cerdo", "panceta de cerdo", "cerdo molido", "tocino", "jamón",
    "costillas de cerdo", "salchicha", "salchicha alemana", "chorizo", "pepperoni",
    "chuleta de cordero", "paleta de cordero", "cordero molido", "pierna de cordero", "ternera",
    "conejo", "venado", "prosciutto", "salami", "panceta",
    // Mariscos
    "salmón", "atún", "bacalao", "tilapia", "halibut",
    "caballa", "sardinas", "trucha", "lubina", "pargo rojo",
    "camarones", "gambas", "vieiras", "mejillones", "almejas",
    "ostras", "langosta", "cangrejo", "carne de cangrejo", "calamar",
    "pulpo", "anchoas", "atún en lata", "salmón en lata", "filete de pescado",
    // Verduras
    "tomate", "cebolla", "ajo", "jengibre", "papa",
    "batata", "zanahoria", "apio", "pimiento morrón", "brócoli",
    "coliflor", "repollo", "espinaca", "col rizada", "lechuga",
    "rúcula", "lechuga romana", "lechuga iceberg", "ejotes", "guisantes",
    "maíz", "champiñón", "calabacín", "berenjena", "pepino",
    "espárragos", "alcachofa", "remolacha", "rábano", "nabo",
    "chirivía", "calabaza moscada", "calabaza bellota", "calabaza", "okra",
    "puerro", "cebollín", "chalote", "hinojo", "coles de bruselas",
    "bok choy", "col china", "berro", "acelga suiza", "berza",
    "brotes de soja", "brotes de bambú", "castañas de agua", "guisantes de nieve", "pimiento rojo",
    "pimiento verde", "pimiento amarillo", "jalapeño", "habanero", "chile serrano",
    // Frutas
    "manzana", "plátano", "naranja", "limón", "lima",
    "toronja", "fresa", "arándano azul", "frambuesa", "mora",
    "arándano rojo", "uva", "sandía", "melón cantalupo", "melón verde",
    "piña", "mango", "papaya", "aguacate", "coco",
    "durazno", "nectarina", "ciruela", "albaricoque", "cereza",
    "pera", "higo", "dátil", "pasa", "ciruela pasa",
    "kiwi", "pitahaya", "fruta de la pasión", "granada", "lichi",
    "ruibarbo", "plátano macho", "caqui", "carambola",
    // Granos y Pastas
    "arroz", "arroz blanco", "arroz integral", "arroz jazmín", "arroz basmati",
    "arroz para sushi", "arroz arborio", "arroz salvaje", "quinoa", "cuscús",
    "bulgur", "farro", "cebada", "avena", "avena en hojuelas",
    "avena cortada", "harina de maíz", "polenta", "espagueti", "penne",
    "fettuccine", "linguine", "rigatoni", "codos", "fideos de cabello de ángel",
    "lazos de lasaña", "fideos de arroz", "fideos de soba", "fideos udon", "fideos ramen",
    "fideos de huevo", "orzo", "pan", "pan integral", "pan de masa madre",
    "pan pita", "naan", "tortilla", "tortilla de harina", "tortilla de maíz",
    "pan rallado panko", "pan rallado", "harina", "harina todo uso", "harina de pan",
    "harina de repostería", "harina integral", "harina de almendra", "harina de coco", "maicena",
    // Lácteos y Huevos
    "mantequilla", "mantequilla sin sal", "leche",
    "suero de leche", "crema espesa", "crema batida", "crema agria", "queso crema",
    "yogur", "yogur griego", "huevos", "claras de huevo", "yemas de huevo",
    "queso cheddar", "queso mozzarella", "queso parmesano", "queso suizo", "queso provolone",
    "gouda", "brie", "queso azul", "queso feta", "queso de cabra",
    "queso ricotta", "queso cottage", "mascarpone", "gruyere", "asiago",
    // Hierbas y Especias
    "sal", "pimienta negra", "pimienta blanca", "sal marina", "sal kosher",
    "ajo en polvo", "cebolla en polvo", "pimentón", "pimentón ahumado", "pimienta de cayena",
    "chile en polvo", "comino", "cilantro en grano", "cúrcuma", "curry en polvo",
    "canela", "nuez moscada", "clavos de olor", "pimienta de jamaica", "cardamomo",
    "jengibre en polvo", "mostaza en polvo", "hojas de laurel", "orégano", "tomillo",
    "romero", "salvia", "albahaca", "eneldo", "perejil",
    "cilantro", "menta", "cebollino", "estragón", "mejorana",
    "semillas de hinojo", "semillas de sésamo", "semillas de amapola", "semillas de alcaravea", "semillas de apio",
    "hojuelas de chile rojo", "condimento italiano", "especias para pastel de calabaza", "garam masala", "cinco especias",
    "hierbas de provenza", "zaatar", "sumac", "azafrán", "extracto de vainilla",
    "vainas de vainilla", "extracto de almendra", "granos de pimienta", "glutamato monosódico",
    // Aceites y Vinagres
    "aceite de oliva", "aceite de oliva virgen extra", "aceite vegetal", "aceite de canola", "aceite de coco",
    "aceite de sésamo", "aceite de aguacate", "aceite de maní", "aceite de uva", "aceite de girasol",
    "vinagre balsámico", "vinagre blanco", "vinagre de manzana", "vinagre de vino tinto", "vinagre de arroz",
    "vinagre de vino blanco", "vinagre de jerez", "aceite de chile", "aceite de trufa",
    // Salsas y Condimentos
    "salsa de soja", "salsa de soja clara", "salsa de soja oscura", "salsa de pescado", "salsa de ostras",
    "salsa hoisin", "sriracha", "salsa picante", "tabasco", "salsa de ajo y chile",
    "kétchup", "mostaza", "mostaza de dijon", "mostaza de grano entero", "mostaza con miel",
    "mayonesa", "salsa barbacoa", "salsa worcestershire", "salsa teriyaki", "pasta de miso",
    "tahini", "hummus", "salsa para pasta", "salsa marinara", "salsa alfredo",
    "pesto", "pasta de tomate", "salsa de tomate", "leche de coco", "crema de coco",
    "jarabe de arce", "miel", "melaza", "jarabe de maíz", "salsa de chocolate",
    "mantequilla de maní", "mantequilla de almendra", "mermelada", "mermelada de naranja", "encurtidos",
    "aceitunas", "alcaparras", "kimchi", "chucrut", "chutney de mango",
    // Nueces y Semillas
    "almendras", "nueces", "anacardos", "pecanas", "cacahuates",
    "piñones", "nueces de macadamia", "avellanas", "pistachos",
    "semillas de chía", "semillas de lino", "semillas de cáñamo", "semillas de girasol", "semillas de calabaza",
    // Legumbres
    "frijoles negros", "frijoles rojos", "frijoles pintos", "garbanzos", "lentejas",
    "lentejas rojas", "lentejas verdes", "guisantes secos", "frijol de ojo negro", "frijoles cannellini",
    "frijoles blancos", "frijoles great northern", "edamame", "tofu", "tofu firme",
    "tofu sedoso", "tempeh", "frijoles mungo", "frijoles adzuki", "frijoles refritos",
    // Repostería
    "azúcar", "azúcar blanco", "azúcar morena", "azúcar glas", "azúcar glasé",
    "polvo para hornear", "bicarbonato de sodio", "levadura", "levadura seca activa", "levadura instantánea",
    "cacao en polvo", "chispas de chocolate", "chocolate oscuro", "chocolate con leche", "chocolate blanco",
    "chocolate sin azúcar", "chocolate semiamargo",
    "gelatina", "crema de tártaro",
    "manteca vegetal", "manteca de cerdo", "puré de manzana",
    // Enlatados y Tarros
    "tomates en lata", "tomates triturados", "tomates en cubos",
    "maíz en lata", "guisantes en lata", "ejotes en lata", "champiñones en lata", "aceitunas en lata",
    "leche de coco en lata", "piña en lata", "duraznos en lata", "frijoles en lata",
    "caldo de pollo", "caldo de res", "caldo de verduras", "caldo de huesos",
    // Congelados
    "guisantes congelados", "maíz congelado", "brócoli congelado", "espinaca congelada", "bayas congeladas",
    "verduras mixtas congeladas", "papas fritas congeladas", "masa de pizza congelada",
    // Otros
    "seitán", "nori", "algas marinas",
    "papel de arroz", "envolturas de rollo de primavera", "envolturas de wonton", "envolturas de gyoza",
    "vino tinto", "vino blanco", "vino de cocina", "mirin", "sake",
    "cerveza", "levadura nutricional", "proteína en polvo", "polvo de matcha",
  ],
}

export const LANGS = Object.freeze(["en", "zh", "es"])

for (const lang of LANGS) Object.freeze(INGREDIENTS[lang])
Object.freeze(INGREDIENTS)

const ITEMS_BY_LANG = {}
const SEARCH_INDEX = {}
for (const lang of LANGS) {
  ITEMS_BY_LANG[lang] = INGREDIENTS[lang]
  SEARCH_INDEX[lang] = INGREDIENTS[lang].map((s) => s.trim().toLowerCase())
}

export function getItems(lang) {
  const key = LANGS.includes(lang) ? lang : "en"
  return ITEMS_BY_LANG[key]
}

export function getSearchItems(lang) {
  const key = LANGS.includes(lang) ? lang : "en"
  return SEARCH_INDEX[key]
}

export function normalize(arr) {
  return [...new Set(arr.map((s) => String(s).trim().toLowerCase()))]
}

export function assertNoDuplicates(lang) {
  const langs = lang ? [lang] : LANGS
  for (const l of langs) {
    const seen = new Set()
    for (const item of INGREDIENTS[l]) {
      if (seen.has(item)) throw new Error(`Duplicate ingredient in ${l}: ${item}`)
      seen.add(item)
    }
  }
}

export default INGREDIENTS