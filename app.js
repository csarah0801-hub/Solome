function loadStored(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw == null ? fallback : JSON.parse(raw);
  } catch {
    return fallback;
  }
}

const state = {
  trip: loadStored("solomate-trip", null),
  checked: loadStored("solomate-checked", {}),
  favorites: loadStored("solomate-favorites", []),
  journals: loadStored("solomate-journals", []),
  contacts: loadStored("solomate-contacts", []),
  persona: loadStored("solomate-persona", null),
  packingContext: loadStored("solomate-packing-context", null),
  destinationState: loadStored("solomate-destination-state", null),
  planGenerated: loadStored("solomate-plan-generated", false),
  travelTuning: loadStored("solomate-travel-tuning", null) || {
    rhythm: "balanced",
    walk: "normal",
    safety: "steady",
    photo: "casual",
    alone: "enjoy",
  },
  calendar: loadStored("solomate-calendar", {}),
  selectedCalendarDay: new Date().getDate(),
  selectedMood: "🙂",
  comfortMode: loadStored("solomate-comfort-mode", false),
  currentEmergencyText: "",
  lastPoseText: "",
  recentPhotoThemes: [],
};

if (state.persona && !Array.isArray(state.persona.actions)) {
  state.persona = null;
  localStorage.removeItem("solomate-persona");
}

const basePacking = [
  "证件和银行卡",
  "手机、充电器、充电宝",
  "住宿订单 / 交通订单",
  "酒店地址截图",
  "常用药品",
  "紧急联系人",
];

const typePacking = {
  city: ["本地交通应用或交通卡", "薄外套", "折叠购物袋"],
  sea: ["泳衣", "防水手机袋", "晒后修护", "拖鞋"],
  outdoor: ["速干衣物", "防滑鞋", "小手电", "能量棒"],
  abroad: ["转换插头", "离线翻译包", "电话卡", "护照复印件"],
};

const destinations = [
  { region: "中国大陆", country: "中国", cities: ["北京", "上海", "广州", "深圳", "成都", "重庆", "杭州", "南京", "西安", "长沙", "武汉", "郑州", "厦门", "泉州", "桂林", "青岛", "大理", "丽江", "三亚", "苏州", "无锡", "天津", "哈尔滨", "沈阳", "大连", "昆明", "贵阳", "南宁", "福州", "宁波", "合肥", "济南", "洛阳", "开封", "张家界", "黄山", "拉萨", "西宁", "乌鲁木齐"] },
  { region: "港澳台", country: "中国", cities: ["香港", "澳门", "台北", "台中", "台南", "高雄", "花莲", "垦丁", "九份", "淡水", "嘉义", "宜兰"] },
  { region: "日本", country: "日本", cities: ["东京", "大阪", "京都", "奈良", "神户", "福冈", "札幌", "冲绳", "名古屋", "横滨", "广岛", "仙台", "金泽", "镰仓", "箱根", "长野", "轻井泽", "熊本", "鹿儿岛", "别府", "由布院"] },
  { region: "韩国", country: "韩国", cities: ["首尔", "釜山", "济州", "大邱", "仁川", "庆州", "全州"] },
  { region: "东南亚", country: "泰国", cities: ["曼谷", "清迈", "普吉岛", "清莱", "芭提雅", "苏梅岛", "华欣", "甲米"] },
  { region: "东南亚", country: "新加坡", cities: ["新加坡"] },
  { region: "东南亚", country: "马来西亚", cities: ["吉隆坡", "槟城", "马六甲", "兰卡威"] },
  { region: "东南亚", country: "越南", cities: ["胡志明市", "河内", "岘港", "会安", "芽庄"] },
  { region: "东南亚", country: "印度尼西亚", cities: ["巴厘岛", "雅加达", "日惹"] },
  { region: "东南亚", country: "菲律宾", cities: ["马尼拉", "宿务", "长滩岛"] },
  { region: "东南亚", country: "柬埔寨", cities: ["金边", "暹粒"] },
  { region: "东南亚", country: "老挝", cities: ["万象", "琅勃拉邦"] },
  { region: "欧洲", country: "英国", cities: ["伦敦", "爱丁堡"] },
  { region: "欧洲", country: "爱尔兰", cities: ["都柏林"] },
  { region: "欧洲", country: "法国", cities: ["巴黎"] },
  { region: "欧洲", country: "意大利", cities: ["罗马", "米兰", "威尼斯", "佛罗伦萨"] },
  { region: "欧洲", country: "西班牙", cities: ["巴塞罗那", "马德里"] },
  { region: "欧洲", country: "葡萄牙", cities: ["里斯本", "波尔图"] },
  { region: "欧洲", country: "荷兰", cities: ["阿姆斯特丹"] },
  { region: "欧洲", country: "比利时", cities: ["布鲁塞尔"] },
  { region: "欧洲", country: "德国", cities: ["柏林", "慕尼黑", "法兰克福"] },
  { region: "欧洲", country: "奥地利", cities: ["维也纳"] },
  { region: "欧洲", country: "捷克", cities: ["布拉格"] },
  { region: "欧洲", country: "匈牙利", cities: ["布达佩斯"] },
  { region: "欧洲", country: "瑞士", cities: ["苏黎世", "日内瓦"] },
  { region: "欧洲", country: "丹麦", cities: ["哥本哈根"] },
  { region: "欧洲", country: "瑞典", cities: ["斯德哥尔摩"] },
  { region: "欧洲", country: "挪威", cities: ["奥斯陆"] },
  { region: "欧洲", country: "芬兰", cities: ["赫尔辛基"] },
  { region: "欧洲", country: "希腊", cities: ["雅典"] },
  { region: "欧洲", country: "土耳其", cities: ["伊斯坦布尔"] },
  { region: "北美", country: "美国", cities: ["纽约", "洛杉矶", "旧金山", "西雅图", "芝加哥", "波士顿", "华盛顿", "费城", "迈阿密", "奥兰多", "拉斯维加斯", "圣地亚哥", "波特兰", "丹佛", "休斯顿", "达拉斯", "奥斯汀"] },
  { region: "北美", country: "加拿大", cities: ["多伦多", "温哥华", "蒙特利尔", "渥太华", "魁北克城", "卡尔加里"] },
  { region: "北美", country: "墨西哥", cities: ["墨西哥城", "坎昆"] },
  { region: "澳洲 / 新西兰", country: "澳大利亚", cities: ["悉尼", "墨尔本", "布里斯班", "黄金海岸", "珀斯", "阿德莱德", "霍巴特"] },
  { region: "澳洲 / 新西兰", country: "新西兰", cities: ["奥克兰", "皇后镇", "惠灵顿", "基督城"] },
  { region: "中东", country: "阿联酋", cities: ["迪拜", "阿布扎比"] },
  { region: "中东", country: "卡塔尔", cities: ["多哈"] },
  { region: "中东", country: "沙特阿拉伯", cities: ["利雅得"] },
  { region: "中东", country: "以色列", cities: ["特拉维夫", "耶路撒冷"] },
  { region: "中东", country: "约旦", cities: ["安曼"] },
  { region: "中东", country: "埃及", cities: ["开罗"] },
  { region: "南美", country: "阿根廷", cities: ["布宜诺斯艾利斯"] },
  { region: "南美", country: "巴西", cities: ["里约热内卢", "圣保罗"] },
  { region: "南美", country: "秘鲁", cities: ["利马", "库斯科"] },
  { region: "南美", country: "智利", cities: ["圣地亚哥"] },
  { region: "南美", country: "哥伦比亚", cities: ["波哥大", "麦德林"] },
  { region: "南美", country: "厄瓜多尔", cities: ["基多"] },
  { region: "南美", country: "乌拉圭", cities: ["蒙得维的亚"] },
  { region: "非洲", country: "埃及", cities: ["开罗"] },
  { region: "非洲", country: "南非", cities: ["开普敦", "约翰内斯堡"] },
  { region: "非洲", country: "肯尼亚", cities: ["内罗毕"] },
  { region: "非洲", country: "摩洛哥", cities: ["马拉喀什", "卡萨布兰卡"] },
  { region: "非洲", country: "突尼斯", cities: ["突尼斯"] },
  { region: "非洲", country: "埃塞俄比亚", cities: ["亚的斯亚贝巴"] },
];

const countryEnglishNames = {
  中国: "China",
  中国香港: "China",
  中国澳门: "China",
  中国台湾: "Taiwan",
  台湾: "Taiwan",
  日本: "Japan",
  韩国: "South Korea",
  泰国: "Thailand",
  新加坡: "Singapore",
  马来西亚: "Malaysia",
  越南: "Vietnam",
  印度尼西亚: "Indonesia",
  菲律宾: "Philippines",
  柬埔寨: "Cambodia",
  老挝: "Laos",
  英国: "United Kingdom",
  爱尔兰: "Ireland",
  法国: "France",
  意大利: "Italy",
  西班牙: "Spain",
  葡萄牙: "Portugal",
  荷兰: "Netherlands",
  比利时: "Belgium",
  德国: "Germany",
  奥地利: "Austria",
  捷克: "Czech Republic",
  匈牙利: "Hungary",
  瑞士: "Switzerland",
  丹麦: "Denmark",
  瑞典: "Sweden",
  挪威: "Norway",
  芬兰: "Finland",
  希腊: "Greece",
  土耳其: "Turkey",
  美国: "United States",
  加拿大: "Canada",
  墨西哥: "Mexico",
  澳大利亚: "Australia",
  新西兰: "New Zealand",
  阿联酋: "United Arab Emirates",
  卡塔尔: "Qatar",
  沙特阿拉伯: "Saudi Arabia",
  以色列: "Israel",
  约旦: "Jordan",
  埃及: "Egypt",
  阿根廷: "Argentina",
  巴西: "Brazil",
  秘鲁: "Peru",
  智利: "Chile",
  哥伦比亚: "Colombia",
  厄瓜多尔: "Ecuador",
  乌拉圭: "Uruguay",
  南非: "South Africa",
  肯尼亚: "Kenya",
  摩洛哥: "Morocco",
  突尼斯: "Tunisia",
  埃塞俄比亚: "Ethiopia",
};

const cityEnglishNames = {
  北京: "Beijing", 上海: "Shanghai", 广州: "Guangzhou", 深圳: "Shenzhen", 成都: "Chengdu", 重庆: "Chongqing", 杭州: "Hangzhou", 南京: "Nanjing", 西安: "Xi'an", 长沙: "Changsha", 武汉: "Wuhan", 郑州: "Zhengzhou", 厦门: "Xiamen", 泉州: "Quanzhou", 桂林: "Guilin", 青岛: "Qingdao", 大理: "Dali", 丽江: "Lijiang", 三亚: "Sanya", 苏州: "Suzhou", 无锡: "Wuxi", 天津: "Tianjin", 哈尔滨: "Harbin", 沈阳: "Shenyang", 大连: "Dalian", 昆明: "Kunming", 贵阳: "Guiyang", 南宁: "Nanning", 福州: "Fuzhou", 宁波: "Ningbo", 合肥: "Hefei", 济南: "Jinan", 洛阳: "Luoyang", 开封: "Kaifeng", 张家界: "Zhangjiajie", 黄山: "Huangshan", 拉萨: "Lhasa", 西宁: "Xining", 乌鲁木齐: "Urumqi",
  香港: "Hong Kong", 澳门: "Macau", 台北: "Taipei", 台中: "Taichung", 台南: "Tainan", 高雄: "Kaohsiung", 花莲: "Hualien", 垦丁: "Kenting", 九份: "Jiufen", 淡水: "Tamsui", 嘉义: "Chiayi", 宜兰: "Yilan",
  东京: "Tokyo", 大阪: "Osaka", 京都: "Kyoto", 奈良: "Nara", 神户: "Kobe", 福冈: "Fukuoka", 札幌: "Sapporo", 冲绳: "Okinawa", 名古屋: "Nagoya", 横滨: "Yokohama", 广岛: "Hiroshima", 仙台: "Sendai", 金泽: "Kanazawa", 镰仓: "Kamakura", 箱根: "Hakone", 长野: "Nagano", 轻井泽: "Karuizawa", 熊本: "Kumamoto", 鹿儿岛: "Kagoshima", 别府: "Beppu", 由布院: "Yufuin",
  首尔: "Seoul", 釜山: "Busan", 济州: "Jeju", 大邱: "Daegu", 仁川: "Incheon", 庆州: "Gyeongju", 全州: "Jeonju",
  曼谷: "Bangkok", 清迈: "Chiang Mai", 普吉岛: "Phuket", 清莱: "Chiang Rai", 芭提雅: "Pattaya", 苏梅岛: "Koh Samui", 华欣: "Hua Hin", 甲米: "Krabi", 新加坡: "Singapore", 吉隆坡: "Kuala Lumpur", 槟城: "Penang", 马六甲: "Malacca", 兰卡威: "Langkawi", 胡志明市: "Ho Chi Minh City", 河内: "Hanoi", 岘港: "Da Nang", 会安: "Hoi An", 芽庄: "Nha Trang", 巴厘岛: "Bali", 雅加达: "Jakarta", 日惹: "Yogyakarta", 马尼拉: "Manila", 宿务: "Cebu", 长滩岛: "Boracay", 金边: "Phnom Penh", 暹粒: "Siem Reap", 万象: "Vientiane", 琅勃拉邦: "Luang Prabang",
  伦敦: "London", 巴黎: "Paris", 罗马: "Rome", 米兰: "Milan", 威尼斯: "Venice", 佛罗伦萨: "Florence", 巴塞罗那: "Barcelona", 马德里: "Madrid", 里斯本: "Lisbon", 波尔图: "Porto", 阿姆斯特丹: "Amsterdam", 布鲁塞尔: "Brussels", 柏林: "Berlin", 慕尼黑: "Munich", 法兰克福: "Frankfurt", 维也纳: "Vienna", 布拉格: "Prague", 布达佩斯: "Budapest", 苏黎世: "Zurich", 日内瓦: "Geneva", 哥本哈根: "Copenhagen", 斯德哥尔摩: "Stockholm", 奥斯陆: "Oslo", 赫尔辛基: "Helsinki", 雅典: "Athens", 伊斯坦布尔: "Istanbul", 爱丁堡: "Edinburgh", 都柏林: "Dublin",
  纽约: "New York", 洛杉矶: "Los Angeles", 旧金山: "San Francisco", 西雅图: "Seattle", 芝加哥: "Chicago", 波士顿: "Boston", 华盛顿: "Washington", 费城: "Philadelphia", 迈阿密: "Miami", 奥兰多: "Orlando", 拉斯维加斯: "Las Vegas", 圣地亚哥: "San Diego", 波特兰: "Portland", 丹佛: "Denver", 休斯顿: "Houston", 达拉斯: "Dallas", 奥斯汀: "Austin", 多伦多: "Toronto", 温哥华: "Vancouver", 蒙特利尔: "Montreal", 渥太华: "Ottawa", 魁北克城: "Quebec City", 卡尔加里: "Calgary", 墨西哥城: "Mexico City", 坎昆: "Cancun",
  悉尼: "Sydney", 墨尔本: "Melbourne", 布里斯班: "Brisbane", 黄金海岸: "Gold Coast", 珀斯: "Perth", 阿德莱德: "Adelaide", 霍巴特: "Hobart", 奥克兰: "Auckland", 皇后镇: "Queenstown", 惠灵顿: "Wellington", 基督城: "Christchurch",
  迪拜: "Dubai", 阿布扎比: "Abu Dhabi", 多哈: "Doha", 利雅得: "Riyadh", 特拉维夫: "Tel Aviv", 耶路撒冷: "Jerusalem", 安曼: "Amman", 开罗: "Cairo",
  布宜诺斯艾利斯: "Buenos Aires", 里约热内卢: "Rio de Janeiro", 圣保罗: "Sao Paulo", 利马: "Lima", 库斯科: "Cusco", 圣地亚哥: "Santiago", 波哥大: "Bogota", 麦德林: "Medellin", 基多: "Quito", 蒙得维的亚: "Montevideo",
  开普敦: "Cape Town", 约翰内斯堡: "Johannesburg", 内罗毕: "Nairobi", 马拉喀什: "Marrakech", 卡萨布兰卡: "Casablanca", 突尼斯: "Tunis", 亚的斯亚贝巴: "Addis Ababa",
};

const cityAliases = {
  北京: "beijing", 上海: "shanghai", 广州: "guangzhou", 深圳: "shenzhen", 成都: "chengdu", 杭州: "hangzhou", 南京: "nanjing", 西安: "xian xi'an", 长沙: "changsha", 重庆: "chongqing", 郑州: "zhengzhou", 厦门: "xiamen", 大理: "dali", 丽江: "lijiang", 三亚: "sanya", 青岛: "qingdao", 苏州: "suzhou", 武汉: "wuhan", 昆明: "kunming", 桂林: "guilin", 洛阳: "luoyang", 开封: "kaifeng", 哈尔滨: "haerbin harbin", 大连: "dalian", 沈阳: "shenyang", 天津: "tianjin", 福州: "fuzhou", 宁波: "ningbo", 合肥: "hefei", 济南: "jinan", 拉萨: "lasa lhasa", 西宁: "xining", 乌鲁木齐: "wulumuqi urumqi",
  香港: "hong kong xianggang", 澳门: "macau macao aomen", 台北: "taipei taibei", 台中: "taichung taizhong", 高雄: "kaohsiung gaoxiong", 花莲: "hualien", 垦丁: "kenting", 九份: "jiufen", 淡水: "tamsui danshui", 嘉义: "chiayi jiayi", 宜兰: "yilan",
  东京: "tokyo dongjing", 大阪: "osaka daban", 京都: "kyoto jingdu", 首尔: "seoul shouer", 釜山: "busan fushan", 曼谷: "bangkok mangu", 清迈: "chiang mai qingmai", 新加坡: "singapore xinjiapo", 吉隆坡: "kuala lumpur jilongpo", 巴厘岛: "bali balidao",
  伦敦: "london lundun", 巴黎: "paris bali", 罗马: "rome luoma", 米兰: "milan milan", 巴塞罗那: "barcelona basailuona", 纽约: "new york niuyue", 洛杉矶: "los angeles luoshanji", 旧金山: "san francisco jiujinshan", 西雅图: "seattle xiyatu", 温哥华: "vancouver wengehua", 多伦多: "toronto duolunduo", 悉尼: "sydney xini", 墨尔本: "melbourne moerben", 布里斯班: "brisbane bulisiban", 奥克兰: "auckland aokelan", 迪拜: "dubai dibai", 伊斯坦布尔: "istanbul yisitanbuer",
};

const destinationTabs = [
  { key: "mainland_china", label: "中国大陆" },
  { key: "hk_macau_taiwan", label: "港澳台" },
  { key: "international", label: "国际" },
];

const popularDestinationNames = {
  mainland_china: ["北京", "上海", "广州", "深圳", "成都", "杭州", "南京", "西安", "长沙", "重庆", "郑州", "厦门", "大理", "丽江", "三亚", "青岛", "苏州", "武汉"],
  hk_macau_taiwan: ["香港", "澳门", "台北", "台中", "高雄", "花莲", "垦丁", "九份", "淡水"],
  international: ["东京", "大阪", "京都", "首尔", "釜山", "曼谷", "清迈", "新加坡", "吉隆坡", "巴厘岛", "伦敦", "巴黎", "罗马", "纽约", "洛杉矶", "旧金山", "温哥华", "悉尼", "墨尔本", "布里斯班"],
};

function regionTypeFromRegion(region = "") {
  if (region === "中国大陆") return "mainland_china";
  if (region === "港澳台") return "hk_macau_taiwan";
  return "international";
}

function regionDisplayForDestination(item = {}) {
  if (item.regionType === "mainland_china") return "中国大陆";
  if (item.city === "香港") return "中国香港";
  if (item.city === "澳门") return "中国澳门";
  if (item.regionType === "hk_macau_taiwan") return "中国台湾";
  return item.country || "";
}

function normalizeDestinationData() {
  const countries = new Map();
  destinations.forEach((group) => {
    const countryEn = countryEnglishNames[group.country] || group.country;
    if (!countries.has(group.country)) {
      countries.set(group.country, {
        country: group.country,
        countryEn,
        region: group.region,
        sortKey: countryEn,
        keywords: `${group.country} ${countryEn} ${group.region}`.toLowerCase(),
        customInput: false,
        cities: [],
      });
    }
    const country = countries.get(group.country);
    country.region = country.region || group.region;
    country.keywords = `${country.keywords} ${group.region}`.toLowerCase();
    group.cities.forEach((city) => {
      if (country.cities.some((item) => item.city === city)) return;
      const cityEn = cityEnglishNames[city] || city;
      const regionType = regionTypeFromRegion(group.region);
      const aliases = [cityEn, cityAliases[city] || "", city].filter(Boolean);
      country.cities.push({
        city,
        cityEn,
        country: group.country,
        countryEn,
        region: group.region,
        regionType,
        sortKey: cityEn,
        aliases,
        customInput: false,
        keywords: `${city} ${aliases.join(" ")} ${group.country} ${countryEn} ${group.region}`.toLowerCase(),
      });
    });
  });
  return [...countries.values()]
    .map((country) => ({ ...country, cities: country.cities.sort((a, b) => a.sortKey.localeCompare(b.sortKey, "en")) }))
    .sort((a, b) => a.sortKey.localeCompare(b.sortKey, "en"));
}

const countryItems = normalizeDestinationData();
const destinationItems = countryItems
  .flatMap((country) => country.cities.map((city) => ({ ...city, country: country.country, countryEn: country.countryEn })))
  .sort((a, b) => a.sortKey.localeCompare(b.sortKey, "en"));
const destinationOptions = uniqueItems(destinationItems.map((item) => item.city));
let activeDestinationTab = state.destinationState?.regionType || "mainland_china";

const neutralProfile = {
  key: "neutral",
  label: "轻量",
  title: "先把下一步弄清楚",
  today: "先确认目的地、天数和第一天抵达路线。",
  notNow: "不用现在就把所有细节一次排完。",
  risk: "最容易乱的是第一天抵达和最后一天离开，先把这两段看清楚。",
  action: "把住宿地址、交通订单和今天最重要的一件事放到前面。",
  steps: ["先确认第一天怎么到住处", "每天只保留一个主要重点", "清单先看证件、手机、住宿和交通"],
  avoid: ["不要一开始就排满所有景点", "不要为了临时灵感把路线弄得太绕"],
  checklistFocus: [],
  dailyOut: ["先看今天最重要的一件事", "只带今天真的会用的东西"],
  plan: {
    focus: "先让路线顺起来，不用一次安排太满。",
    activities: "住宿周边、轻量散步、吃饭补给。",
    avoid: "距离太远、换乘太多、临时硬塞的地点。",
    night: "睡前确认明天第一站和回住处路线。",
  },
  photo: "随手记录就好，不用为了照片打乱路线。",
  guide: "先把下一步看清楚，慌张感会少很多。",
};

const cityRuleGroups = [
  {
    id: "zhengzhou",
    names: ["郑州"],
    label: "郑州",
    plan: {
      focus: "先把市区交通和住宿周边摸清楚，第一天别跑太远。",
      activities: "博物馆、市区轻量散步、地铁沿线补给。",
      avoid: "把远距离景点排到太晚，或者晚上临时换很绕的路线。",
      night: "晚上优先走主路和公共交通路线，回酒店前先看地铁/打车方案。",
    },
    packing: ["地铁路线截图", "博物馆预约信息", "夏季防晒补水", "酒店周边路线确认"],
    tips: ["郑州更适合把博物馆和市区安排在白天。", "晚上不要把远距离地点排太晚，回酒店路线提前看。", "夏天出门把防晒和补水放前面。"],
  },
  {
    id: "dali",
    names: ["大理"],
    label: "大理",
    plan: {
      focus: "古城和洱海不要塞在同一天太满，先看交通和日晒。",
      activities: "古城慢走、洱海轻量拍照、咖啡店休息。",
      avoid: "把环洱海和古城行程排得太满，或者临时卡很晚返程。",
      night: "提前确认打车和返程时间，日晒后早点休息。",
    },
    packing: ["防晒", "帽子", "舒适鞋", "外套", "干燥保湿", "交通路线提前确认"],
    tips: ["大理日晒和风都要考虑，帽子、防晒和外套都比想象中实用。", "洱海周边交通时间不一定稳定，别把返程卡太晚。", "古城适合慢慢走，不用一天塞满。"],
  },
  {
    id: "japanCity",
    names: ["东京", "大阪", "京都"],
    label: "日本城市",
    plan: {
      focus: "第一天先适应地铁换乘和步行量，不要安排太多复杂地点。",
      activities: "地铁沿线街区、便利店补给、一个主要区域慢逛。",
      avoid: "第一天连续换乘很多次，或者晚上临时跨很远的区。",
      night: "把酒店地址和末班交通截图保存好。",
    },
    packing: ["交通卡 / 乘车 App", "移动电源", "舒适鞋", "离线地图", "住宿地址截图"],
    tips: ["东京/大阪/京都步行量很容易超预期，鞋和移动电源很重要。", "第一天不要安排太多换乘复杂的地点。", "晚上回酒店路线最好提前截图。"],
  },
  {
    id: "hongkong",
    names: ["香港"],
    label: "香港",
    plan: {
      focus: "先确认住处附近港铁站、上下坡和过街路线，不要一开始跨太多区。",
      activities: "港铁沿线、室内商场连接、短距离街区慢走。",
      avoid: "湿热天气长时间户外爬坡，或者晚上临时换到很远的区。",
      night: "晚上回住处优先看港铁主线和明亮路线。",
    },
    packing: ["八达通 / 支付方式", "过关或交通截图", "轻便鞋", "雨具", "补水", "室内休息点收藏"],
    tips: ["香港步行量和上下坡会比想象中明显，鞋和补水先确认。", "湿热或下雨时，室内商场连接和港铁路线会更稳。", "晚上回住处先看港铁主线，不要临时钻小路。"],
  },
  {
    id: "brisbane",
    names: ["布里斯班"],
    label: "布里斯班",
    plan: {
      focus: "先确认住处到河边、市中心和公共交通的距离，户外别排得太晒。",
      activities: "河边慢走、市中心轻量散步、室内休息点穿插。",
      avoid: "白天暴晒时连续户外步行，或者把跨区域路线排得太散。",
      night: "晚间回住处路线先看公共交通和主路，别临时绕远。",
    },
    packing: ["河边或户外路线先看遮阴", "公共交通和回住处路线截图", "午后室内休息点收藏", "舒适鞋和轻薄外套放顺手"],
    tips: ["布里斯班适合把河边和市中心分开慢慢走，别一天跨太多区域。", "户外日晒会影响体力，中午最好有室内缓冲。", "晚间回住处路线提前看清，公共交通和步行距离都要留意。"],
  },
  {
    id: "bangkok",
    names: ["曼谷"],
    label: "曼谷",
    plan: {
      focus: "先确认住处附近的轻轨、地铁或官方打车方式，白天别硬扛高温。",
      activities: "交通方便区域、商场避暑、短距离街区探索。",
      avoid: "中午长时间户外暴走，或者把堵车时段的跨区路线排太满。",
      night: "晚间回住处优先官方打车或清楚的交通主线。",
    },
    packing: ["轻轨 / 地铁和官方打车 App 先登录", "商场或室内休息点收藏", "回住处路线截图", "堵车时段别把转场卡太紧"],
    tips: ["曼谷白天热、路上也容易堵，路线顺比多去几个点更重要。", "商场和轻轨沿线可以当作中途缓冲。", "晚上回住处别临时找不熟的路，官方打车或交通主线更稳。"],
  },
  {
    id: "hotTransit",
    names: ["新加坡", "台北"],
    label: "热带/高密度城市",
    plan: {
      focus: "高温、下雨和步行量都要留余地，中午安排室内休息。",
      activities: "公共交通沿线、室内休息点、短距离街区。",
      avoid: "高温天气连续排户外行程，或者雨天临时走太远。",
      night: "晚上回住处优先用公共交通主线或官方打车。",
    },
    packing: ["防晒", "补水", "雨具", "轻薄衣物", "充电宝", "交通 App"],
    tips: ["高温城市不要把户外行程排太满。", "雨具、补水和交通 App 会比多带衣服更有用。", "中午安排室内休息点，整天会稳很多。"],
  },
];

const countryPacking = {
  china: {
    names: ["中国", "中国大陆", "北京", "上海", "广州", "深圳", "成都", "重庆", "杭州", "南京", "西安", "长沙", "武汉", "郑州", "厦门", "青岛", "大理", "丽江", "三亚"],
    label: "国内",
    items: ["身份证", "本地打车和地图应用", "少量现金", "景区预约截图"],
  },
  japan: {
    names: ["日本", "japan", "东京", "大阪", "京都", "北海道", "冲绳"],
    label: "日本",
    items: ["交通卡或西瓜卡", "零钱包", "小手帕", "退税购物带护照"],
  },
  korea: {
    names: ["韩国", "korea", "首尔", "釜山", "济州"],
    label: "韩国",
    items: ["交通卡", "地图应用离线收藏", "随身补妆包", "免税提货证件"],
  },
  thailand: {
    names: ["泰国", "thailand", "曼谷", "清迈", "普吉"],
    label: "泰国",
    items: ["驱蚊用品", "进寺庙可用的薄围巾", "电解质", "防水凉鞋"],
  },
  france: {
    names: ["法国", "france", "巴黎", "尼斯"],
    label: "法国",
    items: ["贴身斜挎包", "博物馆预约截图", "小雨伞", "欧标转换插头"],
  },
  uk: {
    names: ["英国", "uk", "london", "伦敦", "爱丁堡"],
    label: "英国",
    items: ["英标转换插头", "雨衣或雨伞", "可刷交通的银行卡", "保暖薄层"],
  },
  taiwan: {
    names: ["台湾", "taiwan", "台北", "台中", "高雄"],
    label: "台湾",
    items: ["悠游卡", "轻便雨衣", "夜市零钱", "折叠袋"],
  },
  macauhk: {
    names: ["香港", "澳门", "hong kong", "macau", "hk"],
    label: "港澳",
    items: ["八达通或澳门通", "小充电宝", "好走的鞋", "室内空调外套"],
  },
  australia: {
    names: ["澳洲", "澳大利亚", "australia", "悉尼", "墨尔本"],
    label: "澳大利亚",
    items: ["高倍防晒", "墨镜", "澳标转换插头", "水瓶"],
  },
  singapore: {
    names: ["新加坡", "singapore"],
    label: "新加坡",
    items: ["薄外套", "防晒", "可刷交通的银行卡", "雨伞"],
  },
  malaysia: {
    names: ["马来西亚", "吉隆坡", "槟城", "malaysia", "kuala lumpur", "penang"],
    label: "马来西亚",
    items: ["防晒", "驱蚊用品", "薄外套", "转换插头"],
  },
  vietnam: {
    names: ["越南", "河内", "胡志明", "岘港", "vietnam"],
    label: "越南",
    items: ["防晒", "驱蚊用品", "防水袋", "少量现金"],
  },
  italy: {
    names: ["意大利", "罗马", "米兰", "佛罗伦萨", "italy", "rome", "milan"],
    label: "意大利",
    items: ["贴身斜挎包", "欧标转换插头", "教堂参观用薄外套", "预约截图"],
  },
  spain: {
    names: ["西班牙", "巴塞罗那", "马德里", "spain", "barcelona", "madrid"],
    label: "西班牙",
    items: ["防晒", "贴身斜挎包", "欧标转换插头", "水瓶"],
  },
  usa: {
    names: ["美国", "纽约", "洛杉矶", "旧金山", "夏威夷", "usa", "new york", "los angeles", "san francisco", "hawaii"],
    label: "美国",
    items: ["美标转换插头", "信用卡", "小费零钱", "护照复印件"],
  },
  canada: {
    names: ["加拿大", "温哥华", "多伦多", "canada", "vancouver", "toronto"],
    label: "加拿大",
    items: ["保暖薄层", "美标转换插头", "信用卡", "雨伞"],
  },
  newzealand: {
    names: ["新西兰", "奥克兰", "new zealand", "auckland"],
    label: "新西兰",
    items: ["防风外套", "澳标转换插头", "防晒", "好走的鞋"],
  },
};

const seasonalPacking = {
  spring: ["薄外套或叠穿", "过敏药", "小伞"],
  summer: ["中午室内休息点", "换洗衣物分层放", "白天户外路线别排太满"],
  autumn: ["针织衫或薄外套", "润唇膏", "好走的鞋"],
  winter: ["保暖内搭", "围巾手套", "保湿霜", "厚袜子"],
};

const weatherPacking = {
  hot: ["中午室内休息点先收藏", "白天户外路线别排太满", "临时会用的东西放随身包外层"],
  cold: ["保暖外套", "围巾 / 帽子", "护手霜", "室内外温差提醒"],
  rainy: ["折叠伞", "防滑鞋", "防水袋或密封袋", "多一双袜子"],
  dry: ["保湿用品", "润唇膏", "护手霜", "多喝水提醒"],
  humid: ["透气换洗衣物", "防潮收纳袋", "纸巾 / 湿巾", "衣物晾干提醒"],
  windy: ["防风外套", "帽子固定夹", "润唇膏", "拍照支架固定提醒"],
};

const reasonPacking = {
  city: ["舒适好走的鞋", "交通卡 / 乘车 App", "离线地图或路线截图", "晚上回住处路线确认"],
  photo: ["拍照点先看能不能安全放手机", "小支架或遥控器固定放一处", "不要为了照片绕去偏僻路线"],
  food: ["餐厅地址收藏", "预约信息截图", "纸巾 / 湿巾", "常用胃药或消化类药品", "晚上回住处路线确认"],
  nature: ["防滑鞋", "外套", "饮用水", "离线地图", "返程交通确认"],
  work: ["电脑 / 平板", "充电器和转换插头", "耳机", "网络环境确认", "住宿桌面和插座位置确认"],
};

const dayPacking = {
  short: ["小包分装", "一套备用衣服", "轻便随身包"],
  medium: ["脏衣袋", "备用上衣", "分装护肤品", "常用药补充"],
  long: ["洗衣袋", "便携洗衣液", "备用鞋", "多套内搭", "行李收纳袋"],
};

const guides = [
  {
    id: "guide-unsafe",
    tag: "现在怎么办",
    title: "我感觉不太安全",
    intro: "先做什么：去明亮、人多、有工作人员的地方，先让自己停下来。",
    points: ["不要做什么：不要停留解释，也不要为了省钱走陌生小路。", "可以马上采取的行动：打开地图找最近的店铺、车站、酒店前台，把位置发给联系人。", "安心提醒：先离开让你不舒服的地方，比把事情搞清楚更重要。"],
  },
  {
    id: "guide-lost",
    tag: "现在怎么办",
    title: "我迷路了",
    intro: "先做什么：先停在明亮、人多、可以站住的位置，不要边走边慌着找路。",
    points: ["不要做什么：不要为了抄近路走进陌生小巷。", "可以马上采取的行动：打开地图定位，搜索最近的地铁站、便利店或酒店；必要时打车回住处。", "安心提醒：迷路不代表出事，先让自己停下来，再处理下一步。"],
  },
  {
    id: "guide-battery",
    tag: "现在怎么办",
    title: "手机快没电",
    intro: "先做什么：先截图住宿地址、回去路线和紧急联系人。",
    points: ["不要做什么：不要继续刷视频、拍很多素材或开太多导航。", "可以马上采取的行动：开省电模式，去咖啡店、便利店、车站或酒店前台找充电点。", "安心提醒：手机没电前先保住关键信息，你就还有退路。"],
  },
  {
    id: "guide-home",
    tag: "现在怎么办",
    title: "我想赶紧回住处",
    intro: "先做什么：确认住宿地址、入口位置和最稳的交通方式。",
    points: ["不要做什么：不要临时走偏僻小路，也不要硬撑着继续逛。", "可以马上采取的行动：选择主路、公共交通主线或官方打车，上车后把路线截图发给联系人。", "安心提醒：想回去就回去，旅行不是考试。"],
  },
  {
    id: "guide-itinerary",
    tag: "现在怎么办",
    title: "行程有点乱",
    intro: "先做什么：先停下来，把今天必须完成的事情和可以放弃的事情分开。",
    points: ["不要做什么：不要为了完成原计划硬赶路。", "可以马上采取的行动：保留一个最重要的地点，其余改成顺路或取消。", "安心提醒：旅行不是完成任务，顺一点比塞满更重要。"],
  },
];

const photoThemePool = {
  街景: ["走到转角时刚好看到的小店", "傍晚路灯亮起来的那一刻", "巷子尽头那块光", "路边最有生活感的小角落", "今天让你想停下来的地方", "一条你刚刚走过的小路", "你刚刚路过但忍不住回头的一幕", "一条看起来很像电影场景的小路", "阳光打在墙上的时候", "远远看到的招牌和行人", "雨停后路面反光的那一刻", "城市天空线里最安静的一角"],
  交通: ["刚坐下时放在身边的包", "车窗边那一点光", "出站前回头看到的人群", "行李箱停在脚边的瞬间", "车站里刚好亮起来的屏幕", "等车时靠在墙边的自己", "车窗外一闪而过的城市", "站台灯光和远处驶来的车", "走向车站的那段路", "电梯上升时看到的城市", "地图导航和窗外街景同框", "出站口那一瞬间的光"],
  吃饭: ["刚端上来还没动的那一刻", "窗边座位和面前那杯东西", "一个人吃饭但气氛很好的一刻", "店里最好看的那个角落", "咖啡杯旁边的城市倒影", "菜单、窗光和手边的小日常", "外带袋子放在街边长椅上", "热气刚冒出来的那几秒", "一个人坐下后终于松口气的桌面", "店门口让你犹豫了一下的光"],
  室内: ["回到房间后随手放下的包", "床边那盏让人安心的灯", "窗帘拉开后的第一眼", "出门前镜子里的自己", "行李箱打开后最真实的一角", "晚上回房间后的桌面", "窗边的光落进房间", "房间里最像“今天在这里生活过”的地方", "酒店窗外的夜景一角", "椅子上搭着外套和包的画面", "退房前房间恢复安静的样子", "走廊尽头安静的灯"],
  状态: ["假装只是刚好路过", "回头看一眼", "坐下来发呆的瞬间", "整理头发的时候", "低头看手机，但背景很好看", "背影和街景一起", "一只手扶着栏杆", "站在路边等灯的时候", "走进画面的那一瞬间", "靠在墙边休息一下", "从镜子里看到今天的自己", "刚坐下来的那个动作"],
  情绪: ["今天这个城市最温柔的一面", "让你突然安静下来的那一刻", "一个“还好我来了”的画面", "今天最想留住的颜色", "一个不需要露脸也很像自己的瞬间", "今天最像在旅行的一刻", "你一个人也觉得舒服的地方", "有风、有光、有人路过的瞬间", "今天最有故事感的画面", "让你觉得不用赶路的一幕", "只有今天才会遇到的普通瞬间", "看起来很自由的一幕"],
  友好机位: ["光线好的窗边座位", "楼梯转角那面干净的墙", "能坐下来慢慢拍的长椅", "镜子里刚好能看到街景的位置", "栏杆边但不危险的位置", "咖啡店门口的自然光", "街边招牌下面的阴影", "书店一角的安静光线", "博物馆外墙前的留白", "公园小路上有树影的地方", "桥边能看到远处城市的位置", "酒店大堂角落的柔和灯光"],
};

const safety = [
  {
    id: "safe-unsafe",
    tag: "我感觉不安全",
    title: "立刻去人多、明亮、有工作人员的地方",
    points: ["不要停留争辩", "打开导航去最近的店铺/车站/酒店前台", "给朋友发送实时位置和一句简短说明"],
  },
  {
    id: "safe-lost",
    tag: "迷路了",
    title: "先停下来，不要边慌边走",
    points: ["先停在明亮、人多的地方", "找店员或工作人员问路", "优先打车回住宿，不硬撑省钱"],
  },
  {
    id: "safe-battery",
    tag: "手机快没电",
    title: "先保存关键地址",
    points: ["截图住宿地址和地图", "关闭耗电应用", "去咖啡店/便利店/车站找充电点"],
  },
  {
    id: "safe-id",
    tag: "证件丢失",
    title: "先确认最后一次使用地点",
    points: ["联系住宿和交通站点失物招领", "拍照留存相关信息", "国外旅行联系使领馆"],
  },
];

const tasks = [
  ["确认第一晚住宿", "优先选交通方便、评价稳定的位置。"],
  ["保存离线信息", "把住宿地址、证件、紧急联系人截图。"],
  ["安排抵达当天", "第一天少排景点，给自己留缓冲。"],
  ["准备拍照小物", "要带的小支架或遥控器固定放一处，别临出门翻包。"],
];

const planSteps = [
  ["D-7", "确定目的地和第一晚住宿", "先把住宿、到达交通和第一晚动线确认好。"],
  ["D-6", "整理证件和付款方式", "证件拍照备份，银行卡、现金和手机支付分开准备。"],
  ["D-5", "生成行李清单", "按目的地类型减少不必要物品，保证自己搬得动。"],
  ["D-4", "准备安全预案", "保存紧急联系人、住宿地址、当地报警电话和回程路线。"],
  ["D-3", "练习拍照方案", "保存 3 张参考图，检查三脚架和蓝牙遥控器。"],
  ["D-2", "降低出发当天压力", "提前值机、查天气、下载离线地图，把第一天行程排松一点。"],
  ["D-1", "给自己一个出发仪式", "确认充电和证件，早点睡。你不是要完美，只要开始。"],
];

const allCards = () => [...guides, ...safety];
const searchUrl = (base, query) => base.includes("?") ? `${base}${encodeURIComponent(query)}` : `${base}${encodeURIComponent(query)}`;
const personaMap = {
  first: {
    calm: ["慢慢来型", "别急着打卡，先让自己舒服下来。", ["白天到达", "第一天只排 1 个点", "找一家想吃的店", "睡前写 3 句话"], ["慢节奏", "新手友好"]],
    photo: ["先拍一张型", "不用拍大片，先拍到一张你喜欢的。", ["保存 3 张参考图", "带蓝牙遥控器", "练一个回头走路", "每天只拍 10 分钟"], ["好上手", "不尴尬"]],
    explore: ["小范围逛型", "别把城市逛散，先选一个街区慢慢走。", ["选 1 个核心街区", "收藏咖啡店", "留半天自由时间", "晚上早点回住处"], ["轻探索", "路线简单"]],
    brave: ["一点点勇敢型", "这趟不需要很猛，完成几个小挑战就很好。", ["一个人吃一顿饭", "主动问一次路", "请人拍一张照", "不舒服就直接离开"], ["练胆量", "别硬撑"]],
  },
  some: {
    calm: ["松弛充电型", "你知道自己可以，所以这次少赶一点。", ["每天最多 2 个重点", "安排一个空白下午", "找舒服的早餐店", "晚上做拉伸"], ["放松", "低密度"]],
    photo: ["边玩边拍型", "提前想好主题，拍起来会轻松很多。", ["定 3 个拍摄场景", "准备一套亮眼衣服", "每天整理 9 张图", "收藏姿势参考"], ["照片主题", "可分享"]],
    explore: ["随便走走型", "你可以留一点随机，让城市自己冒出来。", ["只定大方向", "逛市场或书店", "坐一次本地交通", "记录一家喜欢的小店"], ["有弹性", "本地感"]],
    brave: ["边界清楚型", "你可以更主动地要自己想要的体验。", ["拒绝不舒服的邀约", "想拍就开口", "累了就改行程", "保留回住处路线"], ["更自在", "会选择"]],
  },
  many: {
    calm: ["独处高手型", "你已经有节奏了，这次把质量放前面。", ["订一晚好睡的住处", "每天留独处时间", "少刷攻略", "写一篇旅行小结"], ["稳定", "自洽"]],
    photo: ["旅行影像型", "你可以做一组有开头和结尾的照片。", ["拍开场画面", "拍路上细节", "拍一张人物照", "整理成 1 条帖子"], ["影像感", "高级记录"]],
    explore: ["深度漫游型", "你适合避开大热路线，去看更真实的日常。", ["选非热门街区", "逛本地市场", "坐下来观察 20 分钟", "收藏下次再来的点"], ["深度", "自由"]],
    brave: ["自由主理型", "你不是证明自己，你是在过自己的生活。", ["自己决定节奏", "不为了打卡委屈自己", "做一个临时决定", "给下一趟旅行留灵感"], ["自主", "松弛"]],
  },
};

const poseDeck = [
  ["街道", "街边背影", "不用露脸，站在街边看向前面就好。", "背影"],
  ["窗边", "坐在窗边看出去", "不用看镜头，就像真的在发呆。", "安静"],
  ["咖啡店", "手边的小日常", "拿着杯子或地图，拍一点手和窗外就够了。", "局部"],
  ["路边", "整理头发的瞬间", "假装刚好被拍到，连拍几张选最自然的。", "自然"],
  ["车站", "走路时的背影", "假装只是刚好经过，让镜头在后面跟一下。", "出发感"],
  ["街角", "低头看手机", "站在安全的位置，像在确认下一站。", "低头"],
  ["公园", "坐着看远处", "不用摆动作，坐下来让自己放松一点。", "安静"],
  ["路面", "走过这里的感觉", "拍一点脚边和路面，也能记住今天走过哪。", "不露脸"],
  ["镜子", "镜子里的半身", "手机挡一点脸也没关系，像出门前顺手记录。", "镜面"],
  ["桌边", "窗边桌面", "不想露脸时，拍手边、窗光和面前的小东西。", "不露脸"],
];

const emergencyScenarios = {
  unsafe: {
    title: "先离开现场，去明亮且有工作人员的地方",
    steps: ["不要停留解释或争辩。", "打开地图去最近的店铺、车站、酒店前台。", "马上把实时位置发给紧急联系人。"],
    message: "我现在感觉不太安全，我正在去人多/有工作人员的地方。请你先保持电话畅通，我会把位置发给你。",
  },
  lost: {
    title: "先停下来确认位置，不要边慌边走",
    steps: ["检查电量和网络。", "进入最近的店铺或交通站点问工作人员。", "如果还是不确定，优先打车回住宿。"],
    message: "我现在有点迷路，正在找工作人员确认路线。如果 10 分钟内我没回复，请给我打电话。",
  },
  battery: {
    title: "先保留关键电量",
    steps: ["截图住宿地址和路线。", "关闭耗电应用，打开省电模式。", "去咖啡店、便利店、车站或酒店前台找充电点。"],
    message: "我手机快没电了。我现在先去找充电点，如果暂时联系不上，我会回到住宿/安全地点后回复。",
  },
  home: {
    title: "优先选择最稳的回程方式",
    steps: ["确认住宿地址和入口。", "选择官方打车、公共交通主线或酒店协助叫车。", "上车/出发后把路线截图发给联系人。"],
    message: "我现在准备回住处，这是我的回程路线。我到达后会给你发消息。",
  },
};

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

function save() {
  localStorage.setItem("solomate-trip", JSON.stringify(state.trip));
  localStorage.setItem("solomate-checked", JSON.stringify(state.checked));
  localStorage.setItem("solomate-favorites", JSON.stringify(state.favorites));
  localStorage.setItem("solomate-journals", JSON.stringify(state.journals));
  localStorage.setItem("solomate-contacts", JSON.stringify(state.contacts));
  localStorage.setItem("solomate-persona", JSON.stringify(state.persona));
  localStorage.setItem("solomate-packing-context", JSON.stringify(state.packingContext));
  localStorage.setItem("solomate-destination-state", JSON.stringify(state.destinationState));
  localStorage.setItem("solomate-plan-generated", JSON.stringify(state.planGenerated));
  localStorage.setItem("solomate-travel-tuning", JSON.stringify(state.travelTuning));
  localStorage.setItem("solomate-calendar", JSON.stringify(state.calendar));
  localStorage.setItem("solomate-comfort-mode", JSON.stringify(state.comfortMode));
}

function showToast(text) {
  const toast = $("#toast");
  toast.textContent = text;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 1400);
}

async function copyText(text, toastText) {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand("copy");
    textarea.remove();
  }
  showToast(toastText);
}

function tripTypeLabel(type) {
  return {
    city: "城市旅行",
    sea: "海边旅行",
    outdoor: "户外旅行",
    abroad: "国外旅行",
  }[type] || "旅行";
}

function getCurrentMonth() {
  return new Date().getMonth() + 1;
}

function seasonFromMonth(month) {
  const value = Number(month);
  if ([3, 4, 5].includes(value)) return "spring";
  if ([6, 7, 8].includes(value)) return "summer";
  if ([9, 10, 11].includes(value)) return "autumn";
  return "winter";
}

function seasonLabel(season) {
  return {
    spring: "春季",
    summer: "夏季",
    autumn: "秋季",
    winter: "冬季",
  }[season];
}

function detectCountry(input = "") {
  const text = input.toLowerCase();
  return Object.values(countryPacking).find((country) => country.names.some((name) => text.includes(name.toLowerCase())));
}

function getDestinationValue() {
  return state.destinationState?.city || state.trip?.destination || $("#cityInput")?.value.trim() || "";
}

function findDestinationItem(input = "") {
  const text = input.trim().toLowerCase();
  if (!text) return null;
  return (
    destinationItems.find((item) => item.city.toLowerCase() === text) ||
    destinationItems.find((item) => item.keywords.includes(text) || text.includes(item.city.toLowerCase())) ||
    null
  );
}

function findCountryItem(input = "") {
  const text = input.trim().toLowerCase();
  if (!text) return null;
  return (
    countryItems.find((item) => item.country.toLowerCase() === text || item.countryEn.toLowerCase() === text) ||
    countryItems.find((item) => item.keywords.includes(text) || text.includes(item.country.toLowerCase())) ||
    null
  );
}

function createCustomDestination(countryInput = "", cityInput = "") {
  const city = cityInput.trim();
  const countryValue = countryInput.trim();
  if (!city) return null;
  const countryMatch = findCountryItem(countryValue) || findDestinationItem(city);
  const cityMatch = (countryMatch?.cities || destinationItems).find((item) => item.city.toLowerCase() === city.toLowerCase() || item.cityEn.toLowerCase() === city.toLowerCase()) || findDestinationItem(city);
  if (cityMatch) {
    return {
      city: cityMatch.city,
      cityEn: cityMatch.cityEn,
      country: cityMatch.country,
      countryEn: cityMatch.countryEn,
      region: cityMatch.region,
      regionType: cityMatch.regionType || regionTypeFromRegion(cityMatch.region),
      sortKey: cityMatch.sortKey,
      aliases: cityMatch.aliases || [],
      customInput: false,
    };
  }
  return {
    city,
    cityEn: city,
    country: countryMatch?.country || countryValue || "自定义",
    countryEn: countryMatch?.countryEn || countryValue || "Custom",
    region: countryMatch?.region || "自定义目的地",
    regionType: "custom",
    sortKey: city,
    aliases: [city],
    customInput: true,
  };
}

function getDestinationState() {
  if (state.destinationState?.city) return state.destinationState;
  const tripDestination = state.trip?.destination || $("#cityInput")?.value.trim() || "";
  const tripCountry = state.trip?.destinationState?.country || $("#countryInput")?.value.trim() || "";
  const next = createCustomDestination(tripCountry, tripDestination);
  if (next) {
    state.destinationState = next;
    if (state.trip) state.trip.destinationState = next;
  }
  return next || { city: "", cityEn: "", country: "", countryEn: "", region: "", regionType: "custom", customInput: true };
}

function updateDestinationDisplay() {
  const button = $("#destinationDisplay");
  const text = $("#destinationDisplayText");
  if (!button || !text) return;
  const destination = state.destinationState?.city ? state.destinationState : null;
  if (!destination) {
    text.textContent = "比如：东京 / 布里斯班 / 大理";
    button.classList.add("is-placeholder");
    return;
  }
  text.textContent = `${destination.city} · ${regionDisplayForDestination(destination) || destination.country || "目的地"}`;
  button.classList.remove("is-placeholder");
}

function setDestinationState(destination, options = {}) {
  if (!destination?.city) return;
  state.destinationState = destination;
  activeDestinationTab = destination.regionType && destination.regionType !== "custom" ? destination.regionType : activeDestinationTab;
  if ($("#countryInput")) $("#countryInput").value = destination.country || "";
  if ($("#cityInput")) $("#cityInput").value = destination.city || "";
  updateDestinationDisplay();
  if (state.trip) {
    state.trip.destination = destination.city;
    state.trip.destinationState = destination;
  }
  state.planGenerated = false;
  syncPackingLocationFromTrip(true);
  save();
  if (options.render === false) return;
  renderTrip();
  renderPlan();
  renderPacking();
  renderAllCards();
  if (state.trip) renderPlanSummary(state.trip);
  if ($("#cityInsightTips")?.classList.contains("show")) renderCityInsightTips();
  if ($("#extraPackTips")?.classList.contains("show")) renderExtraPackingTips();
}

function persistCurrentTripSettings(options = {}) {
  const destination = createCustomDestination($("#countryInput")?.value || "", $("#cityInput")?.value || "") || state.destinationState;
  const daysSelect = $("#days");
  const typeSelect = $("#tripType");
  const worries = $$("#tripForm input[type='checkbox']:checked").map((box) => normalizeConcern(box.value));
  const days = daysSelect?.value || state.trip?.days || "2";
  const daysLabel = daysSelect?.selectedOptions?.[0]?.textContent || state.trip?.daysLabel || "1-2 天";
  const type = typeSelect?.value || state.trip?.type || "city";
  if (destination?.city) {
    state.destinationState = destination;
  }
  state.trip = {
    ...(state.trip || {}),
    destination: destination?.city || state.trip?.destination || "",
    destinationState: destination || state.trip?.destinationState || null,
    days,
    daysLabel,
    type,
    worries,
  };
  state.packingContext = {
    ...(state.packingContext || {}),
    country: destination?.city || state.trip.destination || "",
    month: Number($("#tripMonth")?.value || state.packingContext?.month || getCurrentMonth()),
    weather: $("#tripWeather")?.value || state.packingContext?.weather || "auto",
    reason: type,
  };
  if (!options.keepPlan) state.planGenerated = false;
  save();
}

function detectCityRule(input = getDestinationValue()) {
  const text = String(input || "").toLowerCase();
  return cityRuleGroups.find((rule) => rule.names.some((name) => text.includes(name.toLowerCase())));
}

function resolveLocationValue(input = "") {
  const text = input.trim().toLowerCase();
  if (!text) return "";
  const direct = findDestinationItem(input);
  if (direct) return direct.city;
  return destinationOptions.find((item) => text.includes(item.toLowerCase()) || item.toLowerCase().includes(text)) || input.trim();
}

function ensureLocationOption(value) {
  const select = $("#packCountry");
  if (!select || !value) return;
  if (![...select.options].some((option) => option.value === value)) {
    select.add(new Option(value, value));
  }
}

function syncPackingLocationFromTrip(force = false) {
  const destination = getDestinationState();
  if (!destination?.city && !state.trip?.destination) return;
  if (!$("#packCountry")) {
    state.packingContext = { ...(state.packingContext || {}), country: resolveLocationValue(destination.city || state.trip?.destination || "") };
    return;
  }
  if (!force && state.packingContext?.country) return;
  const value = resolveLocationValue(destination.city || state.trip?.destination || "");
  ensureLocationOption(value);
  $("#packCountry").value = value;
  state.packingContext = { ...(state.packingContext || {}), country: value };
}

function getPackingContext() {
  const destination = getDestinationValue();
  const saved = state.packingContext || {};
  const countryInput = saved.country || destination || "";
  const month = Number($("#tripMonth")?.value || saved.month || getCurrentMonth());
  const weather = $("#tripWeather")?.value || saved.weather || "auto";
  const rawReason = saved.reason || state.trip?.type || "city";
  const reason = normalizePackReason(rawReason);
  const days = Number(state.trip?.days || $("#days")?.value || 2);
  const season = seasonFromMonth(month);
  const weatherKey = weather === "auto" ? seasonWeatherGuess(season) : weather;
  const country = detectCountry(`${countryInput} ${destination}`);
  const cityRule = detectCityRule(destination || countryInput);
  return { countryInput, month, weather, weatherKey, reason, season, country, days, cityRule };
}

function normalizePackReason(reason) {
  if (reason === "shopping") return "food";
  return reasonPacking[reason] ? reason : "city";
}

function seasonWeatherGuess(season) {
  return {
    spring: "rainy",
    summer: "hot",
    autumn: "dry",
    winter: "cold",
  }[season];
}

function weatherLabel(key) {
  return {
    hot: "很热",
    cold: "偏冷",
    rainy: "多雨",
    dry: "干燥",
    humid: "潮湿",
    windy: "多风",
    auto: "不确定",
  }[key] || "不确定";
}

function uniqueItems(items) {
  return [...new Map(items.filter(Boolean).map((item) => [String(item).toLowerCase(), item])).values()];
}

function escapeHTML(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function pickItems(items, limit) {
  return uniqueItems(items).slice(0, limit);
}

function buildPackingGroups() {
  return generatePersonalizedChecklist();
}

function buildRulePackingGroups() {
  const context = getPackingContext();
  const profiles = getConcernProfiles();
  const cityInsight = generatePersonalizedTripPlan();
  const countryItems = context.country?.items || ["当地交通方式先收藏", "当地紧急电话截图"];
  const cityItems = uniqueItems([...(context.cityRule?.packing || []), ...cityInsight.packing]);
  const weatherItems = weatherPacking[context.weatherKey] || weatherPacking.hot;
  const reasonItems = reasonPacking[context.reason] || reasonPacking.city;
  const concernItems = profiles.flatMap((profile) => profile.checklistFocus);
  const routeConcern = profiles.some((profile) => profile.key === "route");
  const safetyConcern = profiles.some((profile) => profile.key === "safe");
  const packingConcern = profiles.some((profile) => profile.key === "pack");
  const photoConcern = profiles.some((profile) => profile.key === "photo");
  const lonelyConcern = profiles.some((profile) => profile.key === "calm");
  const groups = [
    {
      title: "出发前一天",
      note: "先收最关键的，不要临时乱买。",
      items: pickItems([
        basePacking[0],
        basePacking[1],
        basePacking[2],
        basePacking[3],
        basePacking[4],
        basePacking[5],
        context.reason === "food" && "常用胃药或消化类药品",
        "明天要穿的衣服提前放出来",
        packingConcern && "洗护用品只留下今晚和明早要用的",
        context.reason === "work" && "充电器和转换插头",
        context.reason === "nature" && "外套",
        ...cityItems.slice(0, 2),
        routeConcern && "每天只设一个主要目标",
        ...weatherItems.slice(0, 2),
      ], 7),
    },
    {
      title: "出门前",
      note: "出门前只看会影响今天的东西。",
      items: pickItems([
        "手机、房卡、证件、钱包确认在身上",
        "看一眼天气，雨伞或外套按需带",
        weatherItems[0],
        safetyConcern && "晚上回住处路线确认",
        routeConcern && "先看今天最重要的一个点",
        photoConcern && "小支架或遥控器别和零碎物品混在一起",
        lonelyConcern && "准备耳机或一本书",
        ...cityItems.slice(2, 4),
        ...reasonItems.slice(0, 4),
      ], 7),
    },
    {
      title: "机场 / 高铁前",
      note: "这一段最怕翻包、赶路和手机没电。",
      items: pickItems([
        "证件和车票截图放到相册前面",
        packingConcern && "电池类物品集中放",
        "手机、充电器、充电宝确认在随身包",
        ...cityItems.slice(4, 6),
        "先确认到住宿的路线，不要落地后才查",
        ...cityItems.slice(0, 2),
        routeConcern && "提前确认景点之间交通时间",
        ...countryItems.slice(0, 2),
        ...weatherItems.slice(2, 4),
      ], 7),
    },
    {
      title: "入住后",
      note: "先让自己知道下一步怎么走。",
      items: pickItems([
        "确认门锁、前台电话和退房时间",
        safetyConcern && "酒店附近主路 / 地铁站 / 便利店位置确认",
        "保存酒店地址、附近主路和便利店位置",
        "贵重物品固定放一个位置",
        routeConcern && "第一天先熟悉住宿附近",
        lonelyConcern && "收藏几个适合一个人待着的地方",
        context.reason === "food" && "晚上回住处路线确认",
        context.reason === "work" && "网络环境确认",
        context.reason === "work" && "住宿桌面和插座位置确认",
      ], 7),
    },
    {
      title: "退房前",
      note: "别等最后 5 分钟才开始翻箱子。",
      items: pickItems([
        "检查床边、枕头下、插座、浴室",
        "充电器全部拔下来",
        "洗护用品收回洗漱包",
        "证件、钱包、手机确认在身上",
        "房卡、押金、发票信息确认",
        packingConcern && "退房前检查床边、浴室、插座",
        routeConcern && "最后一天不要安排太满",
        "不要把距离太远的点硬塞在同一天",
      ], 7),
    },
  ];
  const antiWaste = context.days <= 2 ? "短途旅行不需要为了这趟重新买一套装备" : "没有明确用途的旅行小物，先别急着下单";
  groups[0].items = pickItems([...groups[0].items, antiWaste, ...concernItems.slice(0, 2)], 7);
  const limits = [6, 5, 5, 4, 5];
  if (["hot", "rainy", "cold"].includes(context.weatherKey)) limits[0] += 1;
  if (context.weatherKey === "rainy") limits[2] += 1;
  if (context.reason === "photo") limits[1] += 2;
  if (context.reason === "food") limits[1] += 2;
  if (context.reason === "nature") limits[2] += 2;
  if (context.reason === "work") {
    limits[1] += 2;
    limits[3] += 2;
  }
  if (safetyConcern) {
    limits[1] += 1;
    limits[3] += 1;
  }
  if (context.cityRule) {
    limits[0] += 1;
    limits[2] += 1;
  }
  if (packingConcern) {
    limits[0] += 1;
    limits[4] += 1;
  }
  if (routeConcern) {
    limits[1] += 1;
    limits[3] += 1;
    limits[4] += 1;
  }
  if (lonelyConcern) limits[3] += 1;
  groups.forEach((group, index) => {
    group.items = group.items.slice(0, Math.min(7, limits[index]));
  });
  return groups.filter((group) => group.items.length);
}

const concernProfiles = {
  safety: {
    key: "safe",
    label: "安全",
    title: "先知道下一步怎么走",
    today: "先确认住宿位置和抵达路线。",
    notNow: "不用现在就把所有景点排满。",
    risk: "晚上抵达的话，先走主路和公共交通路线。",
    action: "保存酒店地址、附近主路、地铁站或便利店位置。",
    steps: ["确认酒店到车站/机场路线", "晚上不要把远距离景点排太晚", "提前保存紧急联系人和酒店地址", "查看酒店附近便利店、地铁站、主路位置"],
    avoid: ["不要为了省一点路费走陌生偏僻小路", "不要把第一晚排得太满"],
    checklistFocus: ["酒店地址截图", "紧急联系人截图", "离线地图", "少量现金"],
    dailyOut: ["把回酒店路线先收藏好", "告诉一个可信任的人今天大概去哪"],
    plan: {
      focus: "先熟悉住宿附近，不要一落地就跑太远。",
      activities: "酒店周边、轻量散步、吃饭补给。",
      avoid: "远郊景点、需要转很多次车的地方。",
      night: "提前确认回酒店路线，不要临时找偏僻小路。",
    },
    photo: "优先选白天、人流稳定、好放手机的位置。",
    guide: "安全感来自提前知道下一步怎么走，不是把自己吓得很紧。",
  },
  packing: {
    key: "pack",
    label: "行李",
    title: "少带一点，路上轻一点",
    today: "先确认天气、住宿类型和交通方式。",
    notNow: "不要为了短途旅行临时买太多装备。",
    risk: "电池类物品分散放，过安检时最容易翻包。",
    action: "把证件、钱、药、充电这四类先收好。",
    steps: ["不要为了短途旅行临时买太多装备", "先确定天气、住宿类型、交通方式", "电池类物品集中放，方便过安检", "退房前一天先收不用的洗护和衣服"],
    avoid: ["没有明确用途的旅行小物，先别急着下单", "新鞋、新包、新护肤品不要第一次带去旅行试用"],
    checklistFocus: ["充电器和充电宝", "常用药和创可贴", "脏衣袋", "好走的鞋和备用袜"],
    dailyOut: ["当天不用的东西留在房间", "买东西前先想一下行李还有没有空间"],
    plan: {
      focus: "先把行李分层，不要边走边翻。",
      activities: "轻量散步、补给、熟悉住宿周边。",
      avoid: "需要背很多东西的行程、临时大采购。",
      night: "睡前把第二天要带的东西放到门口。",
    },
    photo: "不建议为了某个城市临时买一套只穿一次的衣服。",
    guide: "旅行轻松不是靠买更多东西，而是少带不必要的东西。",
  },
  itinerary: {
    key: "route",
    label: "行程",
    title: "每天只留一个重点",
    today: "先把今天必须去的地方和可以放弃的地方分开。",
    notNow: "不用把所有想去的点都塞进同一天。",
    risk: "路线太绕、第一天太远、最后一天太满，都会让人更慌。",
    action: "每天只设一个主要目标，再把顺路的点放后面。",
    steps: ["每天只保留一个主要重点", "第一天先熟悉住宿附近", "最后一天不要安排太满", "提前确认景点之间交通时间"],
    avoid: ["不要把距离太远的点硬塞在同一天", "不要为了完成原计划硬赶路"],
    checklistFocus: ["每天只设一个主要目标", "第一天先熟悉住宿附近", "最后一天不要安排太满", "提前确认景点之间交通时间"],
    dailyOut: ["先看今天最重要的一个点", "把顺路点放后面，不顺路就删掉"],
    plan: {
      focus: "只保留一个主要重点，先让路线顺起来。",
      activities: "一个主目的地、一个顺路补给点、一段轻量散步。",
      avoid: "跨很远的区、反复换乘、为了打卡硬塞景点。",
      night: "睡前把明天第一站和回住处路线确认好。",
    },
    photo: "行程不顺的时候，拍路上的细节就好，不用硬赶拍照点。",
    guide: "行程不是越满越安心，顺一点、清楚一点更重要。",
  },
  photo: {
    key: "photo",
    label: "拍照",
    title: "先拍到喜欢的一张",
    today: "先选一个白天、人流稳定、好放手机的地点。",
    notNow: "不需要为了拍照排满网红点。",
    risk: "为了拍照跑太偏，通常不值得。",
    action: "准备 3 个低尴尬动作：背影、手部、窗边。",
    steps: ["不需要为了拍照排满网红点", "优先选择白天、安全、人流稳定的地点", "一个人拍照先用背影、桌面、街景细节", "不建议专门购买一次性道具或新衣服"],
    avoid: ["不要为了网红感买很多拍照道具", "不要为了照片把晚上路线排得太偏"],
    checklistFocus: ["相册里的 3 张参考图", "小支架或遥控器固定放一处", "拍照点不要排到偏僻路线"],
    dailyOut: ["先看今天哪里光线好", "只安排一个主要拍照场景"],
    plan: {
      focus: "给拍照留一点白天时间，但不要为了照片跑太远。",
      activities: "街道、咖啡店、博物馆外侧、窗边位置。",
      avoid: "偏僻机位、夜里临时找拍照点。",
      night: "晚上只拍明亮主路或店内细节，不硬凹大片。",
    },
    photo: "不一定要露脸，背影、手部、脚步、桌面和街景也很好看。",
    guide: "一个人拍照先别追求大片，先拍到自然、不尴尬、愿意留下的一张。",
  },
  loneliness: {
    key: "calm",
    label: "孤独",
    title: "一个人，也要有小仪式",
    today: "先安排一个低压力场景：咖啡店、博物馆或散步路线。",
    notNow: "不用逼自己一直兴奋，也不用把行程排得太空。",
    risk: "行程太空会容易胡思乱想，太满又会累到崩掉。",
    action: "给自己一个小任务：拍 3 张路上的细节。",
    steps: ["不要把行程排太空，也不要排太满", "安排咖啡店、博物馆、散步路线这类低压力场景", "给自己小任务：写旅行记录、拍 3 张细节、找一家舒服的店坐下来"],
    avoid: ["不要因为一个人就随便将就吃饭", "不要把所有时间都留给刷手机"],
    checklistFocus: ["耳机", "小本子", "喜欢的香味小样", "舒适睡衣"],
    dailyOut: ["给今天安排一个可以坐下来的地方", "拍 3 张细节照，不用发给任何人"],
    plan: {
      focus: "给自己一点节奏，不要空到发慌。",
      activities: "咖啡店、书店、博物馆、短距离散步。",
      avoid: "全天无安排，或者连续赶很多景点。",
      night: "回住处后写 3 句话，明天就不用从零开始想。",
    },
    photo: "不一定要拍自己，路上的细节也能证明你来过。",
    guide: "一个人旅行不是落单，是把时间还给自己。",
  },
};

const concernAliases = {
  安全: "safety",
  行李: "packing",
  行程: "itinerary",
  拍照: "photo",
  孤独: "loneliness",
};

const tuningConfig = [
  { key: "rhythm", title: "旅行节奏", options: [["relaxed", "轻松"], ["balanced", "适中"], ["compact", "紧凑"]] },
  { key: "walk", title: "步行接受度", options: [["low", "少走路"], ["normal", "正常走"], ["high", "可以多走"]] },
  { key: "safety", title: "安全感优先", options: [["normal", "普通"], ["steady", "更稳一点"], ["high", "非常重视"]] },
  { key: "photo", title: "拍照需求", options: [["none", "不重要"], ["casual", "随手记录"], ["lots", "想多拍一点"]] },
  { key: "alone", title: "独处状态", options: [["enjoy", "享受独处"], ["sometimes", "偶尔会孤独"], ["lowPressure", "想安排低压力活动"]] },
];

function normalizeConcern(value) {
  return concernAliases[value] || value;
}

function concernKeys(trip = state.trip) {
  const keys = (trip?.worries || []).map(normalizeConcern).filter((key) => concernProfiles[key]);
  return [...new Set(keys)];
}

function getConcernProfiles(trip = state.trip) {
  return concernKeys(trip).map((key) => concernProfiles[key]);
}

function activeProfiles(trip = state.trip) {
  const profiles = getConcernProfiles(trip);
  return profiles.length ? profiles : [neutralProfile];
}

function summaryProfile(trip) {
  const selectedProfiles = getConcernProfiles(trip);
  const profiles = selectedProfiles.length ? selectedProfiles : [neutralProfile];
  const primary = profiles[0] || neutralProfile;
  const worries = selectedProfiles.map((profile) => profile.label);
  return { worries, primary, profiles };
}

function renderPlanSummary(trip) {
  const { worries, primary, profiles } = summaryProfile(trip);
  const worryText = worries.length ? worries.slice(0, 2).join("和") : "下一步";
  const tagText = worries.length ? worries.join(" / ") : "轻量提醒";
  const insight = generatePersonalizedTripPlan();
  const today = insight.today.doFirst;
  const notNow = insight.today.dontRush;
  const risks = uniqueItems(profiles.map((profile) => profile.risk)).slice(0, 4);
  const days = buildPlanDays(trip).slice(0, 3);
  const summaryCard = $(".summary-card");
  summaryCard.className = `summary-card summary-${primary.key}`;
  $("#summaryTitle").textContent = `${trip.destination} · 先看${worryText}`;
  $("#summaryContent").innerHTML = `
    <section class="summary-focus-card">
      <span>${tagText}</span>
      <strong>别慌，先把最容易出错的地方定下来。</strong>
      <p>${primary.title}。这趟旅行不用安排太满，先处理会让你慌的几件事。</p>
      <div class="summary-tags">${(worries.length ? worries : ["不强行选择担忧"]).map((item) => `<em>${item}</em>`).join("")}</div>
    </section>
    <section class="summary-block">
      <strong>今天先做什么</strong>
      <ul>${today.map((item) => `<li>${item}</li>`).join("")}</ul>
    </section>
    <section class="summary-block">
      <strong>这趟旅行不用做什么</strong>
      <ul>${notNow.map((item) => `<li>${item}</li>`).join("")}</ul>
    </section>
    <section class="summary-block">
      <strong>最容易出错的提醒</strong>
      <ul>${risks.map((item) => `<li>${item}</li>`).join("")}</ul>
    </section>
    <section class="summary-block">
      <strong>轻量计划</strong>
      <ul>${days.map((day) => `<li>${day.day}：${day.suggested[0]}</li>`).join("")}</ul>
    </section>
  `;
}

function openPlanSummary() {
  $("#planSummaryModal").classList.add("open");
  $("#planSummaryModal").setAttribute("aria-hidden", "false");
}

function closePlanSummary() {
  $("#planSummaryModal").classList.remove("open");
  $("#planSummaryModal").setAttribute("aria-hidden", "true");
}

function renderTrip() {
  const trip = state.trip;
  if (!trip) {
    renderTasks();
    renderMine();
    return;
  }
  const profiles = getConcernProfiles(trip);
  const concernText = profiles.length ? ` · 先处理${profiles.map((profile) => profile.label).slice(0, 2).join("和")}` : " · 先把下一步看清楚";
  const destination = getDestinationState();
  $("#tripTitle").textContent = `${destination.city || trip.destination || "我的目的地"}${concernText}`;
  $("#todayHeadline").textContent = "今天先不用想太多";
  $("#todayText").textContent = "别急着把所有事情一次想完。先处理下面三块，就会清楚很多。";
  if ($("#countryInput")) $("#countryInput").value = destination.country || "";
  if ($("#cityInput")) $("#cityInput").value = destination.city || trip.destination || "";
  $("#days").value = trip.days;
  $("#tripType").value = trip.type;
  if ($("#tripMonth")) $("#tripMonth").value = String(state.packingContext?.month || getCurrentMonth());
  if ($("#tripWeather")) $("#tripWeather").value = state.packingContext?.weather || "auto";
  syncPackingLocationFromTrip();
  $$("#tripForm input[type='checkbox']").forEach((box) => {
    box.checked = concernKeys(trip).includes(box.value);
  });
  renderTasks();
  renderMine();
}

function renderTasks() {
  const profiles = activeProfiles();
  const cityInsight = generatePersonalizedTripPlan();
  const firstActions = uniqueItems([...cityInsight.today.doFirst, ...profiles.map((profile) => profile.today)]).slice(0, 3);
  const notNow = uniqueItems([...cityInsight.today.dontRush, ...profiles.map((profile) => profile.notNow)]).slice(0, 3);
  const checks = uniqueItems([...cityInsight.today.checkNow, ...profiles.map((profile) => profile.action)]).slice(0, 5);
  const cards = [
    ["今天先做什么", firstActions],
    ["今天不用急什么", notNow],
    ["现在检查一下", checks],
  ];
  $("#taskGrid").innerHTML = cards
    .map(
      ([title, items]) => `
        <article class="task-card focus-task-card">
          <strong>${title}</strong>
          <ul>${items.map((item) => `<li>${item}</li>`).join("")}</ul>
        </article>
      `
    )
    .join("");
}

function renderPersona() {
  const card = $("#personaCard");
  if (!card) return;
  if (!state.persona) {
    card.classList.remove("show");
    card.innerHTML = "";
    renderShareCard();
    return;
  }
  card.classList.add("show");
  const actions = state.persona.actions || ["确认第一天路线", "保存住宿截图", "准备一套好走的衣服", "给自己留点空白时间"];
  card.innerHTML = `
    <strong>${state.persona.name}</strong>
    <span>${state.persona.desc}</span>
    <ul class="persona-list">${actions.map((item) => `<li>${item}</li>`).join("")}</ul>
    <div class="persona-tags">${state.persona.tags.map((tag) => `<span>${tag}</span>`).join("")}</div>
  `;
  renderShareCard();
}

function renderShareCard() {
  if (!$("#shareTitle") || !$("#shareText")) return;
  if (!state.persona) {
    $("#shareTitle").textContent = "生成后，这里会出现你的出发提醒。";
    $("#shareText").textContent = "可以留作自己的出发前提醒。";
    return;
  }
  const destination = state.trip?.destination || $("#cityInput")?.value.trim() || "下一站";
  $("#shareTitle").textContent = `我是 ${state.persona.name}`;
  $("#shareText").textContent = `我的 solo trip 去 ${destination}。我是${state.persona.name}：${state.persona.desc}`;
}

function drawPose() {
  const pose = poseDeck[Math.floor(Math.random() * poseDeck.length)];
  state.lastPoseText = `${pose[0]}：${pose[1]}。${pose[2]}`;
  $("#poseCard").classList.add("show");
  $("#poseCard").innerHTML = `
    <strong>${pose[0]}：${pose[1]}</strong>
    <span>${pose[2]}</span>
    <div class="pose-tags">
      <span>${pose[0]}</span>
      <span>连拍 5 张</span>
      <span>${pose[3]}</span>
    </div>
  `;
}

function drawPhotoTheme() {
  const target = $("#photoThemeCard");
  if (!target) return;
  const themes = Object.entries(photoThemePool).flatMap(([category, items]) => items.map((title) => ({ category, title })));
  const recent = new Set(state.recentPhotoThemes.slice(-5));
  const candidates = themes.filter((theme) => !recent.has(`${theme.category}:${theme.title}`));
  const pool = candidates.length ? candidates : themes;
  const theme = pool[Math.floor(Math.random() * pool.length)];
  const key = `${theme.category}:${theme.title}`;
  state.recentPhotoThemes = [...state.recentPhotoThemes.filter((item) => item !== key), key].slice(-5);
  target.classList.add("show");
  target.innerHTML = `
    <span>${theme.category}</span>
    <strong>${theme.title}</strong>
  `;
}

function buildPlanDays(trip = state.trip) {
  const cityInsight = generatePersonalizedTripPlan();
  return cityInsight.plan;
}

function renderEmergencyScenario(key) {
  const scenario = emergencyScenarios[key];
  state.currentEmergencyText = scenario.message;
  $$(".emergency-actions button").forEach((button) => button.classList.toggle("active", button.dataset.emergency === key));
  $("#emergencyResult").classList.add("show");
  $("#emergencyResult").innerHTML = `
    <strong>${scenario.title}</strong>
    <ul>${scenario.steps.map((step) => `<li>${step}</li>`).join("")}</ul>
    <button class="secondary-btn copy-help" type="button" data-copy-help>复制求助信息</button>
  `;
}

function setActiveTab(tabId) {
  $$(".tab, .tab-page").forEach((node) => node.classList.remove("active"));
  $(`.tab[data-tab="${tabId}"]`)?.classList.add("active");
  $(`#${tabId}`)?.classList.add("active");
  updateTabIndicator();
}

function updateTabIndicator() {
  const tabs = $(".tabs");
  const active = $(".tab.active");
  if (!tabs || !active) return;
  const tabsBox = tabs.getBoundingClientRect();
  const activeBox = active.getBoundingClientRect();
  tabs.style.setProperty("--tab-indicator-x", `${activeBox.left - tabsBox.left}px`);
  tabs.style.setProperty("--tab-indicator-width", `${activeBox.width}px`);
}

function applyComfortMode() {
  document.body.classList.toggle("comfort-mode", state.comfortMode);
  $("#comfortModeToggle")?.classList.toggle("active", state.comfortMode);
  $("#comfortModeToggle").textContent = state.comfortMode ? "安心模式开" : "安心模式";
}

function updateHomeStats() {
  if (!$("#homePlanStat")) return;
  const planDays = buildPlanDays();
  const planDone = planDays.filter((_, index) => state.checked[`plan-${index}`]).length;
  const packIds = buildPackingGroups().flatMap((group, groupIndex) => group.items.map((_, itemIndex) => packingItemId(groupIndex, itemIndex)));
  const packTotal = packIds.length;
  const packDone = packIds.filter((id) => state.checked[id]).length;
  $("#homePlanStat").textContent = `${planDone}/${planDays.length}`;
  $("#homePackStat").textContent = `${packDone}/${packTotal}`;
  $("#homeContactStat").textContent = getConcernProfiles().some((profile) => profile.key === "safe") ? "先看" : "1条";
}

function packingItemId(groupIndex, itemIndex) {
  const context = getPackingContext();
  const country = (context.country?.label || context.countryInput || "general").toLowerCase().replace(/\s+/g, "-");
  return `pack-${country}-${context.month}-${context.weatherKey}-${context.reason}-${groupIndex}-${itemIndex}`;
}

function buildExtraPackingTips() {
  const context = getPackingContext();
  const profiles = getConcernProfiles();
  const cityInsight = generatePersonalizedTripPlan();
  const tips = [
    ...cityInsight.packing,
    ...(context.cityRule?.tips || []),
    context.country?.label ? `${context.country.label} 相关的交通、预约或支付截图，最好单独放一个相册。` : "先把目的地交通、住宿和紧急电话截图放到相册前面。",
    context.weatherKey === "rainy" && "如果当天多雨，鞋和袜子比衣服更容易影响心情，最好多看一眼。",
    context.weatherKey === "hot" && "天气热的时候，中午能躲进去的室内点最好先收藏一个。",
    context.weatherKey === "cold" && "偏冷天气别只看白天温度，晚上回住处那段更容易失温。",
    context.reason === "food" && "美食探索尽量提前收藏回住处路线，吃完太晚就别临时绕远。",
    context.reason === "photo" && "拍照用的小支架如果要带，别和临时买的小物混在一起。",
    context.reason === "work" && "远程办公先确认插座和网络，别等要开会才找充电口。",
    profiles.some((profile) => profile.key === "route") && "如果路线看起来很绕，直接删掉一个点，不要靠赶路解决。",
    profiles.some((profile) => profile.key === "safe") && "晚上行程如果离住宿太远，优先改到白天或换成近一点的地方。",
    profiles.some((profile) => profile.key === "calm") && "一个人旅行可以给自己留一个能坐下来的地方，不用一直走。",
  ];
  return uniqueItems(tips).slice(0, 5);
}

function generateCityInsight() {
  const context = getPackingContext();
  const profiles = getConcernProfiles();
  const destinationState = getDestinationState();
  const destination = destinationState.city || getDestinationValue() || "这座城市";
  const tuning = state.travelTuning || {};
  const hasConcern = (key) => profiles.some((profile) => profile.key === key);
  const cityRule = context.cityRule;
  const monthText = `${context.month}月`;
  const currentWeather = context.weatherKey;
  const weatherTips = {
    hot: {
      today: `${monthText}天气热，白天不要把户外步行排太满。`,
      suggested: ["白天优先安排室内或半室内地点。", "中间留出补水和休息时间。"],
      avoid: ["不建议中午连续暴走。", "不建议为了赶行程长时间晒着走。"],
      packing: ["中午能躲进室内的地方先收藏。"],
      guide: "天气热的时候，路线顺和能休息比多打卡更重要。",
    },
    cold: {
      today: `${monthText}偏冷，先确认晚上回住处那段会不会太绕。`,
      suggested: ["安排室内外穿插的节奏。", "包里留一件容易穿脱的外套。"],
      avoid: ["不建议晚上在外面绕太久。", "不建议把风大的地点排太晚。"],
      packing: ["晚上回住处那段需要多一层衣服，别只看白天温度。"],
      guide: "偏冷天气别只看白天温度，晚上回去那段更容易难受。",
    },
    rainy: {
      today: `${monthText}如果下雨，先准备一个室内备选。`,
      suggested: ["优先安排地铁沿线或室内点。", "出门前看一眼返程路线。"],
      avoid: ["不建议排太多户外步行。", "不建议穿容易打滑的新鞋。"],
      packing: ["雨天备选路线和室内点先截图。"],
      guide: "多雨时别硬赶户外，能舒服到达比完成原计划更重要。",
    },
    dry: {
      today: `${monthText}偏干，补水、防晒和保湿先放进随身包。`,
      suggested: ["早上或傍晚安排更舒服的户外时间。", "每天留一点慢慢走的空白。"],
      avoid: ["不建议把拍照和步行都排得太满。", "不建议穿磨脚但好看的鞋。"],
      packing: ["容易干到不舒服的小物放进随身包，不要塞进行李深处。"],
      guide: "干燥天气里，舒服和稳定比硬凹造型更重要。",
    },
    humid: {
      today: `${monthText}潮湿，换洗衣物和防潮收纳先想好。`,
      suggested: ["安排能回住处整理的轻量路线。", "衣服选择透气、好活动的。"],
      avoid: ["不建议带太厚重难干的衣服。", "不建议一天排太多需要换装的拍照点。"],
      packing: ["潮湿天气把换洗衣物和湿物分开放。"],
      guide: "潮湿天气别带太多厚重东西，路上会更累。",
    },
    windy: {
      today: `${monthText}多风，拍照和户外停留时间别排太死。`,
      suggested: ["先选一个稳定、好撤退的主要区域。", "拍照工具要放稳再离手。"],
      avoid: ["不建议把临水、山边或空旷处排太久。", "不建议把手机放在危险边缘拍照。"],
      packing: ["多风天不要把行程卡在空旷处太久。"],
      guide: "多风时拍照别冒险，手机和人都要先站稳。",
    },
  };
  const weather = weatherTips[currentWeather] || weatherTips.hot;
  const cityThemes = {
    zhengzhou: {
      today: ["先确认酒店到地铁站和主路的位置，晚上回去会更稳。", "博物馆类或城市文化行程适合放白天。", "夏季白天别把户外步行排太满。"],
      days: [
        ["住宿周边", "先熟悉住宿附近，确认吃饭、交通和回酒店路线。", "不建议第一天跑太远或换乘太复杂。"],
        ["室内文化", "白天安排一个室内或半室内地点，中间留补水时间。", "不建议把多个分散景点硬塞在同一天。"],
        ["市区慢走", "围绕地铁沿线安排一段轻量城市散步。", "不建议为了赶行程连续步行太久。"],
        ["顺路收尾", "最后一天只安排住宿附近或顺路补给。", "不建议最后一天去远距离地点。"],
      ],
      packing: ["地铁路线截图", "博物馆预约信息", "酒店周边路线确认", "白天室内休息点收藏"],
      guide: ["远距离行程尽量放白天，晚上回住处优先走主路和公共交通。"],
    },
    dali: {
      today: ["先确认古城、住宿和主要活动区域的距离，不要把路线排得太散。", "拍照尽量放在早上或傍晚，光线更舒服。", "先选一个主要区域慢慢走，不用一天跑太多地方。"],
      days: [
        ["古城附近", "古城和附近散步可以放在同一天，节奏轻一点。", "不建议刚到就安排远距离环线。"],
        ["洱海节奏", "需要转场或打车的行程提前确认返程。", "不建议把古城和远距离环洱海硬塞在同一天。"],
        ["拍照留白", "早晚留出拍照和随走随停的时间。", "不建议下午太阳强的时候安排太久户外拍照。"],
        ["轻量离开", "退房日先处理交通和行李，再安排附近慢走。", "不建议最后一天把返程时间卡太紧。"],
      ],
      packing: ["早晚拍照区域先分开", "返程打车点提前截图", "早晚温差那件外套放顺手", "交通路线提前确认"],
      guide: ["不要把洱海周边和古城塞得太满，打车和返程时间要留余地。"],
    },
    japanCity: {
      today: ["先确认酒店最近的车站和换乘路线。", "第一天不要安排太多跨区域移动，先熟悉交通节奏。", "冬天或偏冷时，包里留一件容易穿脱的外套。"],
      days: [
        ["车站周边", "先围绕酒店附近或同一区域安排，熟悉车站和便利店。", "不建议刚抵达就安排复杂换乘。"],
        ["同区慢走", "每天尽量围绕一个区域安排，减少来回换乘。", "不建议东跑西跑，把时间耗在交通上。"],
        ["室内停留", "穿插咖啡店、书店、展览或商场休息点。", "不建议偏冷天气晚上在外面绕太久。"],
        ["顺路收尾", "最后一天安排车站附近或顺路点，先确认返程交通。", "不建议退房后拖着行李跨太远区域。"],
      ],
      packing: ["交通卡 / 乘车 App", "离线地图", "酒店地址日文或英文截图", "复杂换乘路线先截图"],
      guide: ["第一天不要安排太多换乘复杂的地点，酒店最近车站先收藏。"],
    },
    hongkong: {
      today: ["先确认住处附近港铁站、上下坡和回住处主路。", "湿热或下雨时，把室内商场连接当成休息点。", "过关、八达通/支付方式和回程交通截图先放好。"],
      days: [
        ["港铁沿线", "先围绕住处附近和同一条港铁线安排。", "不建议第一天跨太多区。"],
        ["室内连接", "把商场连接、咖啡店或室内休息点放进中段。", "不建议湿热天气长时间爬坡或户外暴走。"],
        ["白天记录", "拍照尽量放白天、人流稳定且好撤退的位置。", "不建议为了机位走偏僻楼梯或陌生小路。"],
        ["轻量返程", "最后一天只安排港铁方便、离住处近的区域。", "不建议退房后拖着行李走上下坡很多的路线。"],
      ],
      packing: ["八达通 / 支付方式", "过关或交通截图", "室内休息点收藏", "回住处港铁主线截图"],
      guide: ["香港步行量、上下坡和湿热感会比较明显，晚上回住处先看港铁主线。"],
    },
    brisbane: {
      today: ["先确认住处到河边、市中心和最近车站的距离。", "户外日晒会消耗体力，中午最好留一个室内缓冲点。", "晚间回住处路线提前看清，别临时绕远。"],
      days: [
        ["住处周边", "先熟悉住处附近、吃饭点和公共交通入口。", "不建议刚到就跨太多区域。"],
        ["河边慢走", "把河边散步和市中心轻量安排放在同一天。", "不建议太阳最强的时候连续户外走太久。"],
        ["室内缓冲", "中午穿插商场、展馆或咖啡店休息。", "不建议为了多去一个点把路线排得太散。"],
        ["轻量收尾", "最后一天先看退房、交通和行李，再安排附近慢走。", "不建议离开当天去公共交通不顺的地方。"],
      ],
      packing: ["公共交通和回住处路线截图", "河边或户外路线先看遮阴", "午后室内休息点收藏", "舒适鞋和轻薄外套放顺手"],
      guide: ["布里斯班户外舒服但日晒明显，河边、市中心和住处距离先确认会更稳。"],
    },
    bangkok: {
      today: ["先确认住处附近的轻轨、地铁或官方打车方式。", "天气热的时候，中午别硬排户外暴走。", "把商场或室内休息点当作中途缓冲。"],
      days: [
        ["交通主线", "第一天围绕住处附近和交通方便区域安排。", "不建议刚到就排堵车风险高的跨区路线。"],
        ["室内避暑", "白天热的时候穿插商场、咖啡店或室内停留。", "不建议中午连续户外走太久。"],
        ["短距离探索", "选一个交通顺的街区慢慢走，累了就撤。", "不建议为了临时加点把路线拉得很散。"],
        ["轻松返程", "最后一天先确认去机场或车站的时间，再安排顺路补给。", "不建议临走前跨区购物或卡着堵车时间移动。"],
      ],
      packing: ["轻轨 / 地铁和官方打车 App 先登录", "商场或室内休息点收藏", "回住处路线截图", "堵车时段别把转场卡太紧"],
      guide: ["曼谷高温和堵车都要留余地，交通主线和室内缓冲比多打卡更重要。"],
    },
    hotTransit: {
      today: ["先看今天高温或下雨时能躲进哪里的室内点。", "户外行程不要连续排太久，中午留一段休息。", "公共交通和官方打车 App 先准备好。"],
      days: [
        ["交通主线", "先围绕公共交通方便的区域安排。", "不建议高温时连续暴走。"],
        ["室内缓冲", "中午安排室内点，下午再轻量散步。", "不建议雨天临时走太远。"],
        ["短距离探索", "选一个短距离街区慢慢走，随时能休息。", "不建议一天塞太多户外点。"],
        ["轻松收尾", "最后一天先看返程交通和行李，再安排顺路补给。", "不建议临走前临时跨区。"],
      ],
      packing: ["室内休息点收藏", "雨天备选路线", "交通 App 和支付方式确认", "官方打车 App 先登录"],
      guide: ["高温和阵雨城市，室内休息点和交通主线比多打卡更重要。"],
    },
    default: {
      today: [`先确认${destination}住处到最近交通点的路线。`, weather.today, context.days >= 5 ? "先把每天一个主要区域定下来，不要一开始就塞满。" : "先看抵达当天和离开当天，其他可以慢慢补。"],
      days: [
        ["住处附近", "先熟悉住宿附近，确认吃饭、交通和回住处路线。", "不建议刚抵达就跨太多区域。"],
        ["主要区域", "围绕一个主要区域安排，中间留出休息和补给。", "不建议把多个分散地点硬塞在同一天。"],
        ["低压力停留", "安排一个可以坐下来的地方，给自己一点缓冲。", "不建议为了完成原计划硬赶路。"],
        ["轻量收尾", "最后一天先处理退房、交通和证件。", "不建议最后一天跑远郊或临时大采购。"],
      ],
      packing: [],
      guide: [`${destination} 第一天先熟悉住宿附近，最后一天不要排太满。`],
    },
  };
  const cityKey = cityRule?.id || "default";
  const theme = cityThemes[cityKey] || cityThemes.default;
  const dayTone = (index, total, first, middle, last) => {
    if (index === 0) return first;
    if (index === total - 1) return last;
    return Array.isArray(middle) ? middle[(index - 1) % middle.length] : middle;
  };
  const pickThemeDay = (index, total, days) => {
    if (!days?.length) return null;
    if (index === 0) return days[0];
    if (index === total - 1) return days[days.length - 1];
    const middleDays = days.slice(1, -1);
    return middleDays.length ? middleDays[(index - 1) % middleDays.length] : days[Math.min(index, days.length - 1)];
  };
  const base = {
    today: [...theme.today, weather.today],
    packing: [...(theme.packing || []), ...weather.packing],
    guide: [...(theme.guide || []), weather.guide],
  };
  const dayCount = Number(state.trip?.days || context.days || 2) <= 2 ? 2 : Number(state.trip?.days || context.days || 2) <= 5 ? 4 : 5;
  const plan = Array.from({ length: dayCount }, (_, index) => {
    const day = index === dayCount - 1 ? "Last Day" : `Day ${index + 1}`;
    const themeDay = pickThemeDay(index, dayCount, theme.days);
    const suggested = [
      themeDay?.[1],
      index === 0 ? "先把住宿周边、吃饭和回住处路线看清楚。" : null,
      index > 0 && index < dayCount - 1 ? weather.suggested[index % weather.suggested.length] : null,
      index === dayCount - 1 ? "先处理退房、交通和证件，剩下只安排顺路点。" : null,
    ];
    const avoid = [
      themeDay?.[2],
      index === 0 ? "不建议把换乘复杂的行程排在第一天。" : null,
      index > 0 && index < dayCount - 1 ? weather.avoid[index % weather.avoid.length] : null,
      index === dayCount - 1 ? "不建议最后一天跑远或临时大采购。" : null,
    ];
    return { day, title: themeDay?.[0], suggested: uniqueItems(suggested).slice(0, 3), avoid: uniqueItems(avoid).slice(0, 3) };
  });

  if (hasConcern("safe")) {
    base.today.unshift(`${destination} 晚上回住处路线先截图，优先走主路和公共交通。`);
    base.guide.unshift("不要为了省一点时间走陌生偏僻小路，绕一点但清楚更好。");
  }
  if (hasConcern("route")) {
    base.today.unshift("先把今天必须去的地方和可以放弃的地方分开。");
    plan.forEach((day, index) => day.suggested.unshift(dayTone(index, plan.length, "抵达当天只先确认住处附近和一件主要事。", ["这一天只留一个主要区域，顺路点放后面。", "先处理最想去的一个点，其他看体力再加。", "把路线绕的点放弃一个，别靠赶路解决。"], "最后一天先看退房和返程，别再硬塞远点。")));
  }
  if (hasConcern("photo")) {
    base.packing.unshift("拍照支架或遥控器如果要带，先和常用小物放一起。");
    plan.forEach((day) => day.suggested.push("白天留一点自然拍照时间。"));
  }
  if (hasConcern("pack")) {
    base.packing.unshift("电池类物品集中放，退房前重点检查插座、浴室和床边。");
  }
  if (hasConcern("calm")) {
    base.today.push("给自己留一个能坐下来的地方，咖啡店、博物馆或书店都可以。");
  }
  if (tuning.rhythm === "relaxed") {
    plan.forEach((day, index) => day.suggested.unshift(dayTone(index, plan.length, "第一天轻一点，先把住处周边弄熟。", ["中间这天留出一段空白，给临时调整。", "这天别排满，留一点坐下来休息的时间。", "只安排一个主线，剩下顺路再说。"], "离开前只做顺路的小安排。")));
    base.today.unshift("今天先别追求排满，只保留最重要的一步。");
  }
  if (tuning.rhythm === "compact") {
    plan.forEach((day, index) => day.suggested.push(dayTone(index, plan.length, "如果到得早，只加住处附近的小点。", "状态好可以加一个同区顺路点。", "收尾日只加交通方便的小点。")));
    plan.forEach((day, index) => day.avoid.push(dayTone(index, plan.length, "不建议第一天为了紧凑跨太多区。", "不建议为了多去一个点压缩吃饭和休息。", "不建议把返程时间压得太死。")));
  }
  if (tuning.walk === "low") {
    plan.forEach((day, index) => day.suggested.unshift(dayTone(index, plan.length, "先选离住处近、交通方便的地方。", ["尽量按同一区域走，少来回折返。", "先看最近的交通出口，别靠临时找路。", "把需要走很多路的安排拆开。"], "退房后优先安排少走路的顺路点。")));
    plan.forEach((day, index) => day.avoid.unshift(dayTone(index, plan.length, "不建议刚到就连续步行太久。", ["不建议把上下坡或远距离步行连在一起。", "不建议为了多逛一点反复绕路。", "不建议在最热的时候安排长距离步行。"], "不建议拖着行李走太多路。")));
    base.packing.unshift("少走路路线和最近交通出口先收藏。");
  }
  if (tuning.walk === "high") {
    plan.forEach((day) => day.suggested.push("可以加一段街区慢走，但别和天气硬扛。"));
  }
  if (tuning.safety === "high") {
    plan.forEach((day, index) => day.suggested.unshift(dayTone(index, plan.length, "抵达后先确认主路、车站和回住处路线。", "主要活动尽量放白天，交通路线提前看。", "离开当天优先交通清楚、能随时撤回的安排。")));
    plan.forEach((day, index) => day.avoid.unshift(dayTone(index, plan.length, "不建议第一晚临时去太远的地方。", "不建议晚上临时跨区或走不熟的小路。", "不建议临走前去路线不清楚的地方。")));
    base.today.unshift("先把回住处路线和可信任联系人放到最前面。");
  } else if (tuning.safety === "steady") {
    plan.forEach((day, index) => day.avoid.push(dayTone(index, plan.length, "不建议第一天把换乘复杂的安排放太晚。", ["不建议把距离远、换乘复杂的安排放太晚。", "不建议临时走不熟的小路去赶下一个点。", "不建议晚上才决定跨区移动。"], "不建议最后一天临时加远距离路线。")));
  }
  if (tuning.photo === "lots") {
    plan.forEach((day) => day.suggested.push("早上或傍晚留一点低尴尬拍照时间。"));
    plan.forEach((day) => day.avoid.push("不建议为了照片去偏僻或不好撤退的位置。"));
    base.packing.unshift("要拍照用的小支架别散放，和随身包小物放一起。");
  } else if (tuning.photo === "none") {
    plan.forEach((day) => day.suggested.push("拍照不用单独排点，顺路记录就好。"));
  }
  if (tuning.alone === "lowPressure") {
    plan.forEach((day, index) => day.suggested.push(dayTone(index, plan.length, "到住处附近找一个能坐下来的地方。", ["放一个咖啡店、书店或展览这种低压力停留点。", "给自己留一个不用说话也能待着的地方。", "中间安排一段可以慢慢坐下来的时间。"], "离开前留一段安静收尾时间。")));
    base.today.push("今天给自己一个能坐下来的地方，不用一直走。");
  } else if (tuning.alone === "sometimes") {
    plan.forEach((day, index) => day.suggested.push(dayTone(index, plan.length, "第一天给自己一个缓冲点。", ["留一个舒服停留点，累了就坐下来。", "给这天安排一个轻松的小任务，比如记录一件小事。", "别让一整天空到发慌，放一个低压力停留点。"], "最后一天别把自己弄得太赶。")));
  }

  return {
    today: {
      doFirst: uniqueItems(base.today).slice(0, 3),
      dontRush: uniqueItems([profiles[0]?.notNow, "不用现在把所有景点排满。", "不需要为了这趟旅行临时买一堆东西。"]).slice(0, 3),
      checkNow: uniqueItems([
        "酒店地址有没有保存到截图里",
        "回住处的路线能不能快速找到",
        "订单、路线、入住信息能不能离线打开",
        "证件、钱包、手机是不是放在固定位置",
        "充电器有没有还插在墙上",
        "耳机有没有落在床头或包的小夹层",
        "今天最重要的那件事是不是已经先定下来",
        "如果晚上会晚回，回程路线有没有提前看过",
        "明天一早要用的东西有没有先单独放出来",
        context.weatherKey === "rainy" && "如果今天下雨，备用路线有没有先截图",
        hasConcern("route") && "今天必须去和可以放弃的点有没有分开",
        hasConcern("pack") && "退房前要看的床头、浴室、门后和插座有没有记住",
        ...base.packing,
      ]).slice(0, 5),
    },
    plan: plan.map((day) => ({ ...day, suggested: uniqueItems(day.suggested).slice(0, 3), avoid: uniqueItems(day.avoid).slice(0, 3) })),
    packing: uniqueItems(base.packing).slice(0, 5),
    guide: uniqueItems(base.guide).slice(0, 2),
  };
}

function aiContext() {
  const destination = getDestinationState();
  const context = getPackingContext();
  return {
    city: destination.city || getDestinationValue() || "",
    country: destination.country || context.country?.label || "",
    region: destination.region || "",
    days: Number(state.trip?.days || context.days || 2),
    type: state.trip?.type || $("#tripType")?.value || "city",
    month: context.month,
    weather: context.weatherKey,
    concerns: concernKeys(),
    purpose: context.reason,
    tuning: state.travelTuning,
  };
}

function generatePersonalizedTripPlan() {
  // Mock AI service: replace this body with an API call later; the return shape is already JSON-ready.
  return generateCityInsight(aiContext());
}

function tuningBasisItems() {
  const tuning = state.travelTuning || {};
  const labels = {
    rhythm: { relaxed: "轻松节奏", compact: "紧凑节奏" },
    walk: { low: "少走路", high: "可以多走" },
    safety: { steady: "安全感更稳一点", high: "安全感非常重视" },
    photo: { none: "不特意拍照", lots: "想多拍一点" },
    alone: { sometimes: "偶尔会孤独", lowPressure: "低压力活动" },
  };
  return Object.entries(labels)
    .map(([key, map]) => map[tuning[key]])
    .filter(Boolean);
}

function generationBasisText(mode = "plan") {
  const destination = getDestinationState();
  const context = getPackingContext();
  const profiles = getConcernProfiles();
  const city = destination.city || getDestinationValue() || context.countryInput;
  const daysLabel = state.trip?.daysLabel || $("#days")?.selectedOptions?.[0]?.textContent || "";
  const concernText = profiles.map((profile) => profile.label).join(" / ");
  const basis = uniqueItems([
    city,
    daysLabel,
    `${context.month}月`,
    weatherLabel(context.weatherKey),
    concernText,
    ...tuningBasisItems(),
  ]).filter((item) => item && !["undefined", "null"].includes(String(item)));
  const action = mode === "packing" ? "补充这次清单" : "生成这次安排";
  return `已根据：${basis.length ? basis.join(" · ") : "这趟旅行"}，${action}。`;
}

function generatePersonalizedChecklist() {
  const context = getPackingContext();
  const profiles = getConcernProfiles();
  const insight = generatePersonalizedTripPlan();
  const tuning = state.travelTuning || {};
  const hasConcern = (key) => profiles.some((profile) => profile.key === key);
  const weatherItems = {
    hot: ["中午能坐下来的室内点先收藏一个", "白天步行路线别排成连续暴走", "今天补给点别只靠临时碰运气"],
    cold: ["晚上回住处那段多准备一层", "室内外温差大，外套别压到行李最底下", "风大的地点别排到太晚"],
    rainy: ["雨天备选路线先截图", "鞋袜湿了的处理办法先想好", "交通可能变慢，别把时间卡太死"],
    dry: ["润唇膏和常用保湿小物放随身包", "长时间户外尽量避开最晒那段", "住宿里能不能晾东西先看一眼"],
    humid: ["换洗衣物和湿物分开放", "不要带太厚重难干的衣服", "回住处后先把湿东西摊开"],
    windy: ["空旷地点别排太久", "拍照支架不要放在危险边缘", "容易被风吹乱的小物先收好"],
  }[context.weatherKey] || ["今天临时会用到的东西单独放一层"];
  const reasonItems = {
    city: ["今天要走的区域先按顺路排好", "回住处路线别只存在一个 App 里", "临时绕远的点先放到备选"],
    photo: ["小支架或遥控器和随身小物放一起", "想拍的位置先看有没有安全撤退路线", "不要为了照片把路线排到偏僻处"],
    food: ["餐厅预约和地址截图放一起", "吃完太晚的话，回住处路线先看好", "常用胃药别压进行李箱深处"],
    nature: ["返程交通先确认，不要只看去程", "离线地图能不能打开先试一下", "路线变长时要能直接取消一个点"],
    work: ["会议时间和当地时间再确认一次", "插座位置和网络别等开会前才看", "电脑充电器不要和洗漱包混放"],
  }[context.reason] || [];
  const countryItems = context.country?.items || ["当地交通方式截图", "住宿地址截图"];
  const cityItems = insight.packing;
  const groups = [
    {
      title: "出发前一天",
      note: "先收关键的，不要临时乱买。",
      items: [
        "酒店地址、入住信息和交通订单截图保存",
        "返程车次 / 航班时间再确认一次",
        "充电器、转换头、移动电源集中放一起",
        "明天第一套要穿的衣服先单独放出来",
        "容易临时要拿的证件放到固定位置",
        "如果要早起，今晚别把洗漱包拆得太散",
        "需要单独过安检的电子产品提前集中",
        ...cityItems.slice(0, 2),
        ...weatherItems.slice(0, 1),
        hasConcern("route") && "明天只先保留一个最重要的目的地",
        tuning.safety === "high" && "紧急联系人和住处地址截图置顶",
      ],
    },
    {
      title: "出门前",
      note: "只看今天会影响心情的东西。",
      items: [
        "房卡 / 门卡有没有带",
        "耳机有没有落在床头或充电口附近",
        "充电线有没有还插在墙上",
        "现金 / 交通卡 / 银行卡有没有在原位",
        "离线地图 / 重要截图能不能打开",
        "今天会不会下雨，临时要带的东西有没有补进去",
        "今天最重要的一件事有没有放到最前面",
        ...reasonItems.slice(0, 2),
        ...weatherItems.slice(1, 2),
        hasConcern("safe") && "晚上回住处路线提前截图",
        tuning.walk === "low" && "今天路线尽量选少走路版本",
      ],
    },
    {
      title: "路上 / 机场 / 高铁前",
      note: "别等到落地才查路线。",
      items: [
        "到住处的路线别只等落地后再查",
        "订单、入住信息和证件照片放在同一个相册",
        "需要过关或换乘的截图先放到相册前面",
        "移动电源如果要拿出来过安检，别压在包底",
        "抵达后第一件事先去住处，不临时绕远",
        ...countryItems.slice(0, 1),
        ...cityItems.slice(2, 4),
        context.weatherKey === "rainy" && "雨天给交通多留一点缓冲",
        hasConcern("route") && "点与点之间交通时间再看一遍",
        tuning.safety !== "normal" && "把回住处路线发给可信任的人",
        tuning.walk === "low" && "优先收藏交通方便的出口",
      ],
    },
    {
      title: "入住后",
      note: "先知道下一步怎么走。",
      items: [
        "先看清回酒店的路线",
        "房门、窗户、插座位置先熟悉一下",
        "充电设备尽量放固定位置",
        "第二天一早要带走的东西不要散放",
        "洗完的衣物 / 毛巾不要忘在浴室",
        "临时买的小东西不要塞得到处都是",
        ...insight.guide.slice(0, 2),
        hasConcern("safe") && "确认最近地铁站 / 便利店 / 明亮主路",
        context.reason === "work" && "确认桌面、插座和网络",
        tuning.alone !== "enjoy" && "收藏一个适合一个人坐下来的地方",
      ],
    },
    {
      title: "退房前",
      note: "别等最后 5 分钟才翻箱子。",
      items: [
        "重点检查床头、插座、浴室、桌面和门后",
        "充电器 / 耳机 / 手表充电线有没有遗漏",
        "洗漱用品有没有留在洗手台",
        "衣服有没有挂在门后或衣柜里",
        "冰箱 / 抽屉 / 枕头边有没有小物件",
        "房卡、证件、钱包、手机先确认再出门",
        "临时拆开的零碎物品有没有重新收回去",
        hasConcern("route") && "最后一天不要把远点硬塞进去",
        "别为了伴手礼把行李临时塞爆",
        tuning.rhythm === "compact" && "紧凑行程最后一天先留足返程时间",
      ],
    },
  ];
  return groups.map((group) => ({ ...group, items: pickItems(group.items, 7) }));
}

async function getCityAiTips() {
  const insight = generatePersonalizedTripPlan();
  return uniqueItems([...insight.today.doFirst, ...insight.guide, ...insight.packing]).slice(0, 5);
}

async function renderCityInsightTips() {
  const target = $("#cityInsightTips");
  if (!target) return;
  const tips = await getCityAiTips();
  const titles = ["先确认这几件事", "这座城市先注意", "今天别急着做", "适合先安排", "需要留意"];
  target.innerHTML = tips
    .map(
      (tip, index) => `
        <article class="resource-card extra-tip-card">
          <strong>${titles[index] || "需要留意"}</strong>
          <span>${tip}</span>
        </article>
      `
    )
    .join("");
  target.classList.add("show");
}

function renderExtraPackingTips() {
  const target = $("#extraPackTips");
  if (!target) return;
  const tips = buildExtraPackingTips();
  target.innerHTML = tips
    .map(
      (tip) => `
        <article class="resource-card extra-tip-card">
          <strong>再看一眼</strong>
          <span>${tip}</span>
        </article>
      `
    )
    .join("");
  target.classList.add("show");
}

function renderPacking() {
  const context = getPackingContext();
  ensureLocationOption(context.countryInput);
  state.packingContext = {
    country: context.countryInput,
    month: context.month,
    weather: context.weather,
    reason: context.reason,
  };
  if ($("#packCountry")) $("#packCountry").value = context.countryInput;
  if ($("#packMonth")) $("#packMonth").value = String(context.month);
  if ($("#packWeather")) $("#packWeather").value = context.weather;
  if ($("#packReason")) $("#packReason").value = context.reason;
  const locationLabel = context.countryInput || context.country?.label || "这趟旅行";
  $("#packingHeadline").textContent = `${locationLabel} · ${context.month} 月清单`;
  const groups = buildPackingGroups();
  $("#packingList").innerHTML = `<div class="generation-basis">${generationBasisText("packing")}</div>` + groups
    .map((group, groupIndex) => {
      const items = group.items
        .map((item, itemIndex) => {
          const id = packingItemId(groupIndex, itemIndex);
          return `
            <label class="check-item ${state.checked[id] ? "done" : ""}">
              <input type="checkbox" data-check="${id}" ${state.checked[id] ? "checked" : ""} />
              <span>${item}</span>
            </label>
          `;
        })
        .join("");
      return `
        <article class="packing-group">
          <div>
            <strong>${group.title}</strong>
            <span>${group.note}</span>
          </div>
          <div class="packing-items">${items}</div>
        </article>
      `;
    })
    .join("");
  save();
  updatePackingCount();
  updateHomeStats();
  if ($("#extraPackTips")?.classList.contains("show")) renderExtraPackingTips();
}

function renderTravelTuning() {
  const target = $("#travelTuning");
  if (!target) return;
  target.innerHTML = tuningConfig
    .map(
      (group) => `
        <fieldset class="tuning-group" data-tuning-group="${group.key}">
          <legend>${group.title}</legend>
          <div class="chips compact-chips">
            ${group.options
              .map(
                ([value, label]) => `
                  <label>
                    <input type="radio" name="tuning-${group.key}" value="${value}" ${state.travelTuning[group.key] === value ? "checked" : ""} />
                    ${label}
                  </label>
                `
              )
              .join("")}
          </div>
        </fieldset>
      `
    )
    .join("");
}

function generatePlanNow(toastText = "已生成专属计划") {
  const buttons = [$("#generatePlanBtn"), $("#regeneratePlanBtn")].filter(Boolean);
  const previousLabels = buttons.map((button) => button.textContent);
  buttons.forEach((button) => {
    button.disabled = true;
    button.textContent = "正在帮你把这趟捋顺...";
  });
  $("#planList").innerHTML = `<div class="empty-state plan-empty-state">正在帮你把这趟捋顺...</div>`;
  setTimeout(() => {
    persistCurrentTripSettings({ keepPlan: true });
    const destination = commitDestinationInput({ render: false });
    if (destination) {
      if (!state.trip) {
        state.trip = {
          destination: destination.city,
          destinationState: destination,
          days: $("#days")?.value || "2",
          daysLabel: $("#days")?.selectedOptions?.[0]?.textContent || "1-2 天",
          type: $("#tripType")?.value || "city",
          worries: $$("#tripForm input[type='checkbox']:checked").map((box) => normalizeConcern(box.value)),
        };
      } else {
        state.trip.destination = destination.city;
        state.trip.destinationState = destination;
      }
      state.destinationState = destination;
    }
    state.planGenerated = true;
    save();
    renderPlan();
    renderPacking();
    renderTasks();
    renderGuides();
    renderCityInsightTips();
    renderMine();
    buttons.forEach((button, index) => {
      button.disabled = false;
      button.textContent = previousLabels[index];
    });
    showToast(toastText);
  }, 220);
}

function renderPlan() {
  if (!state.planGenerated) {
    $("#planList").innerHTML = `
      <div class="empty-state plan-empty-state">
        先点上面的按钮。生成后这里会出现每天的建议安排和不建议安排。
      </div>
    `;
    $("#planCount").textContent = "待生成";
    return;
  }
  $("#planList").innerHTML = `<div class="generation-basis">${generationBasisText("plan")}</div>` + buildPlanDays()
    .map((day, index) => {
      const id = `plan-${index}`;
      return `
        <label class="plan-card ${state.checked[id] ? "done" : ""}">
          <span class="plan-day">${day.day}</span>
          <span>
            <strong>建议安排</strong>
            ${day.suggested.map((item) => `<span>${item}</span>`).join("")}
            <strong>不建议安排</strong>
            ${day.avoid.map((item) => `<span>${item}</span>`).join("")}
          </span>
          <input type="checkbox" data-check="${id}" ${state.checked[id] ? "checked" : ""} />
        </label>
      `;
    })
    .join("");
  updatePlanCount();
  updateHomeStats();
}

function updatePlanCount() {
  const items = $$("#planList input");
  const done = items.filter((input) => input.checked).length;
  $("#planCount").textContent = `${done}/${items.length}`;
  updateHomeStats();
}

function updatePackingCount() {
  const items = $$("#packingList input");
  const done = items.filter((input) => input.checked).length;
  $("#packingCount").textContent = `${done}/${items.length}`;
  updateHomeStats();
}

function renderGuides() {
  const target = $("#safeGuideCards");
  if (!target) return;
  const destination = getDestinationValue();
  const cityInsight = generatePersonalizedTripPlan();
  const cityCard = destination
    ? [
        {
          id: `guide-city-${destination}`,
          tag: "城市提醒",
          title: `${destination}先注意什么`,
          intro: "不用查一堆攻略，先看这几件会影响安心感的事。",
          points: cityInsight.guide,
        },
      ]
    : [];
  target.innerHTML = [...cityCard, ...guides].map(cardMarkup).join("");
}

function cardMarkup(card) {
  return `
    <article class="advice-card" data-card-id="${card.id}">
      <div class="advice-top">
        <div>
          <span class="tag">${card.tag}</span>
          <strong>${card.title}</strong>
        </div>
      </div>
      ${card.intro ? `<p class="guide-intro">${card.intro}</p>` : ""}
      <ul>${card.points.map((point) => `<li>${point}</li>`).join("")}</ul>
      ${card.script ? `<div class="guide-script"><span>可以照抄</span><strong>${card.script}</strong></div>` : ""}
    </article>
  `;
}

function renderStaticCards() {
  if ($("#safeCards")) $("#safeCards").innerHTML = safety.map(cardMarkup).join("");
  renderExternalResources();
}

function resourceMarkup(group) {
  return `
    <article class="resource-card">
      <strong>${group.title}</strong>
      <span>${group.desc}</span>
    </article>
  `;
}

function renderExternalResources() {
  if ($("#shoppingCards")) $("#shoppingCards").innerHTML = "";
}

function renderFavorites() {
  if (!$("#favoriteTitle") || !$("#favoriteCards")) return;
  const cards = allCards().filter((card) => state.favorites.includes(card.id));
  $("#favoriteTitle").textContent = cards.length ? `${cards.length} 条收藏` : "还没有收藏";
  $("#favoriteCards").innerHTML = cards.length
    ? cards.map(cardMarkup).join("")
    : `<div class="empty-state">在指南或拍照页面点星标，常用建议会出现在这里。</div>`;
}

function renderJournals() {
  renderCalendar();
}

function renderMine() {
  const target = $("#mineCards");
  if (!target) return;
  const profiles = getConcernProfiles();
  const worries = profiles.map((profile) => profile.label).join("、");
  const checklist = uniqueItems(buildPackingGroups().flatMap((group) => group.items).slice(0, 6));
  const planDays = buildPlanDays();
  const planDone = planDays.filter((_, index) => state.checked[`plan-${index}`]).length;
  const cards = [
    ["我的旅行偏好", state.trip ? `${tripTypeLabel(state.trip.type)}，${state.trip.daysLabel}，先把节奏放轻。` : "还没生成旅行。先填目的地和最担心的事。"],
    ["我常担心的事情", worries || "还没选择，先按轻量提醒来。"],
    ["我的常用清单", checklist.join(" / ")],
    ["我的已完成计划", `${planDone}/${planDays.length} 个轻量计划已完成`],
  ];
  target.innerHTML = cards
    .map(
      ([title, desc]) => `
        <article class="advice-card">
          <div class="advice-top">
            <div>
              <span class="tag">Mine</span>
              <strong>${title}</strong>
            </div>
          </div>
          <p class="guide-intro">${desc}</p>
        </article>
      `
    )
    .join("");
}

function calendarKey(day = state.selectedCalendarDay) {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function renderCalendar() {
  const grid = $("#calendarGrid");
  const detail = $("#calendarDetail");
  if (!grid || !detail) return;
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();
  state.selectedCalendarDay = Math.min(state.selectedCalendarDay, daysInMonth);
  $("#calendarTitle").textContent = `${month + 1} 月记录`;
  const blanks = Array.from({ length: firstDay }, () => `<span class="calendar-blank"></span>`).join("");
  const days = Array.from({ length: daysInMonth }, (_, index) => {
    const day = index + 1;
    const entry = state.calendar[calendarKey(day)];
    return `
      <button class="calendar-day ${day === state.selectedCalendarDay ? "active" : ""} ${entry?.photo ? "has-photo" : ""} ${entry?.mood ? "has-mood" : ""}" type="button" data-calendar-day="${day}">
        <span>${day}</span>
      </button>
    `;
  }).join("");
  grid.innerHTML = blanks + days;
  renderCalendarDetail();
}

function renderCalendarDetail() {
  const detail = $("#calendarDetail");
  if (!detail) return;
  const key = calendarKey();
  const entry = state.calendar[key] || {};
  const status = entry.photo && entry.mood
      ? "这一天有照片，也有心情。"
    : entry.photo
      ? "这一天已经有照片了，也可以补一句心情。"
      : entry.mood
        ? "这一天已经有心情了，也可以补一张照片。"
        : "可以加一张照片，再写一句心情。";
  detail.innerHTML = `
    <div>
      <strong>${state.selectedCalendarDay} 日记录</strong>
      <span>${status}</span>
    </div>
    ${entry.mood ? `<div class="calendar-mood"><span>心情</span><strong>${entry.mood}</strong></div>` : `<div class="calendar-mood empty"><span>心情</span><strong>还没写</strong></div>`}
    ${
      entry.photo
        ? `<div class="calendar-photo-wrap">
            <img class="calendar-photo-preview" src="${entry.photo}" alt="${state.selectedCalendarDay} 日照片记录" />
            <button class="delete-calendar-photo" type="button" aria-label="删除这张照片" data-delete-calendar-photo>×</button>
          </div>`
        : `<div class="calendar-empty-photo">今天还没有照片</div>`
    }
    <button id="pickCalendarPhoto" class="secondary-btn" type="button">${entry.photo ? "换一张照片" : "添加照片"}</button>
    <input id="calendarPhotoInput" type="file" accept="image/*" hidden />
  `;
}

function renderContacts() {
  if (!$("#contactList")) return;
  $("#contactList").innerHTML = state.contacts.length
    ? state.contacts
        .map(
          (contact, index) => `
            <article class="contact-card">
              <div>
                <strong>${contact.name}</strong>
                <span>${contact.phone}</span>
              </div>
              <a class="call-link" href="tel:${contact.phone.replace(/[^\d+]/g, "")}">拨打</a>
              <button class="delete-contact" data-delete-contact="${index}" title="删除联系人">×</button>
            </article>
          `
        )
        .join("")
    : `<div class="empty-state">添加一个可信任的人。手机上点击“拨打”会打开电话界面。</div>`;
  updateHomeStats();
}

function destinationMatches(query = "") {
  const keyword = query.trim().toLowerCase();
  if (!keyword) return countryItems.slice(0, 36);
  return countryItems
    .filter((item) => item.keywords.includes(keyword))
    .sort((a, b) => a.sortKey.localeCompare(b.sortKey, "en"))
    .slice(0, 50);
}

function cityMatches(country, query = "") {
  const keyword = query.trim().toLowerCase();
  const source = country?.cities || destinationItems;
  if (!keyword) return source.slice(0, 50);
  return source
    .filter((item) => item.keywords.includes(keyword))
    .sort((a, b) => a.sortKey.localeCompare(b.sortKey, "en"))
    .slice(0, 50);
}

function destinationSearchMatches(query = "") {
  const keyword = query.trim().toLowerCase();
  const source = keyword ? destinationItems : destinationItems.filter((item) => item.regionType === activeDestinationTab);
  return source
    .filter((item) => !keyword || item.keywords.includes(keyword))
    .sort((a, b) => a.sortKey.localeCompare(b.sortKey, "en"))
    .slice(0, keyword ? 50 : 160);
}

function popularDestinationsForTab(tab = activeDestinationTab) {
  const names = popularDestinationNames[tab] || popularDestinationNames.mainland_china;
  return names.map((name) => findDestinationItem(name)).filter(Boolean);
}

function destinationLetter(item) {
  return (item.sortKey || item.cityEn || item.city || "#").charAt(0).toUpperCase();
}

function renderDestinationPanel() {
  const search = $("#destinationSearch")?.value || "";
  const popular = $("#popularDestinations");
  const list = $("#destinationCityList");
  const alphabet = $("#destinationAlphabet");
  if (!popular || !list || !alphabet) return;
  $$(".destination-tabs [data-destination-tab]").forEach((button) => {
    button.classList.toggle("active", button.dataset.destinationTab === activeDestinationTab);
  });
  const popularItems = popularDestinationsForTab();
  popular.innerHTML = popularItems
    .map((item) => `<button type="button" data-destination-city="${escapeHTML(item.city)}">${escapeHTML(item.city)}</button>`)
    .join("");
  const items = destinationSearchMatches(search);
  const customValue = search.trim();
  let currentLetter = "";
  const rows = items
    .map((item) => {
      const letter = destinationLetter(item);
      const heading = letter !== currentLetter ? `<div class="destination-letter" id="destination-letter-${letter}">${letter}</div>` : "";
      currentLetter = letter;
      return `
        ${heading}
        <button type="button" class="destination-city-row" data-destination-city="${escapeHTML(item.city)}">
          <strong>${escapeHTML(item.city)}</strong>
          <span>${escapeHTML(item.cityEn)} · ${escapeHTML(regionDisplayForDestination(item))}</span>
        </button>
      `;
    })
    .join("");
  const customExists = customValue && items.some((item) => item.city === customValue || item.cityEn.toLowerCase() === customValue.toLowerCase());
  list.innerHTML = `
    ${rows || `<div class="destination-empty">没有找到匹配的城市。</div>`}
    ${
      customValue && !customExists
        ? `<button type="button" class="destination-custom-row" data-destination-custom="${escapeHTML(customValue)}"><strong>没有找到？使用“${escapeHTML(customValue)}”作为目的地</strong><span>之后也可以继续修改</span></button>`
        : ""
    }
  `;
  const letters = [...new Set(items.map(destinationLetter))];
  alphabet.innerHTML = letters.map((letter) => `<button type="button" data-jump-letter="${letter}">${letter}</button>`).join("");
}

function openDestinationPanel() {
  const panel = $("#destinationPanel");
  const button = $("#destinationDisplay");
  if (!panel || !button) return;
  closeCountryDropdown();
  closeCityDropdown();
  panel.hidden = false;
  button.setAttribute("aria-expanded", "true");
  if ($("#destinationSearch")) $("#destinationSearch").value = "";
  activeDestinationTab = state.destinationState?.regionType && state.destinationState.regionType !== "custom" ? state.destinationState.regionType : activeDestinationTab;
  renderDestinationPanel();
  setTimeout(() => $("#destinationSearch")?.focus(), 0);
}

function closeDestinationPanel() {
  const panel = $("#destinationPanel");
  const button = $("#destinationDisplay");
  if (!panel || !button) return;
  panel.hidden = true;
  button.setAttribute("aria-expanded", "false");
}

function selectDestinationCity(cityName) {
  const item = findDestinationItem(cityName);
  const destination = item
    ? createCustomDestination(item.country, item.city)
    : { city: cityName, cityEn: "", country: "", countryEn: "", region: "自定义目的地", regionType: "custom", sortKey: cityName, aliases: [cityName], customInput: true };
  setDestinationState(destination);
  persistCurrentTripSettings();
  renderTrip();
  renderTasks();
  renderPlan();
  renderPacking();
  renderAllCards();
  closeDestinationPanel();
}

function renderCountryDropdown(query = "") {
  const dropdown = $("#countryDropdown");
  if (!dropdown) return;
  const items = destinationMatches(query);
  const customValue = query.trim();
  const customExists = customValue && findCountryItem(customValue);
  const listHTML = items
    .map(
      (item) => `
        <button type="button" class="destination-result" data-country-name="${escapeHTML(item.country)}" onmousedown="selectCountryButton(event, this)" onpointerdown="selectCountryButton(event, this)" onclick="selectCountryButton(event, this)">
          <span>${escapeHTML(item.country)}</span>
          <em>${escapeHTML(item.countryEn)}</em>
        </button>
      `
    )
    .join("");
  dropdown.innerHTML = `
    <div class="destination-results">${listHTML || `<div class="destination-empty">没有找到也没关系，可以直接保存“${escapeHTML(customValue || "这个国家")}”。</div>`}</div>
    ${
      customValue && !customExists
        ? `<button class="destination-custom" type="button" data-country-custom="${escapeHTML(customValue)}" onmousedown="selectCountryButton(event, this)" onpointerdown="selectCountryButton(event, this)" onclick="selectCountryButton(event, this)">使用“${escapeHTML(customValue)}”</button>`
        : ""
    }
  `;
}

function renderCityDropdown(query = "") {
  const dropdown = $("#cityDropdown");
  if (!dropdown) return;
  const country = findCountryItem($("#countryInput")?.value || state.destinationState?.country || "");
  const items = cityMatches(country, query);
  const customValue = query.trim();
  const customExists = customValue && items.some((item) => item.city === customValue || item.cityEn.toLowerCase() === customValue.toLowerCase());
  const listHTML = items
    .map(
      (item) => `
        <button type="button" class="destination-result" data-city-name="${escapeHTML(item.city)}" data-country-name="${escapeHTML(item.country)}" onmousedown="selectCityButton(event, this)" onpointerdown="selectCityButton(event, this)" onclick="selectCityButton(event, this)">
          <span>${escapeHTML(item.city)}</span>
          <em>${escapeHTML(item.country)}</em>
        </button>
      `
    )
    .join("");
  dropdown.innerHTML = `
    <div class="destination-results">${listHTML || `<div class="destination-empty">没有找到也没关系，可以直接保存“${escapeHTML(customValue || "这个城市")}”。</div>`}</div>
    ${
      customValue && !customExists
        ? `<button class="destination-custom" type="button" data-city-custom="${escapeHTML(customValue)}" onmousedown="selectCityButton(event, this)" onpointerdown="selectCityButton(event, this)" onclick="selectCityButton(event, this)">使用“${escapeHTML(customValue)}”</button>`
        : ""
    }
  `;
}

window.selectCountryButton = function selectCountryButton(event, button) {
  event.preventDefault();
  event.stopPropagation();
  const value = button.dataset.countryName || button.dataset.countryCustom;
  const country = findCountryItem(value) || { country: value, countryEn: value, region: "自定义目的地", cities: [], customInput: true };
  $("#countryInput").value = country.country;
  $("#cityInput").value = "";
  closeCountryDropdown();
  setTimeout(openCityDropdown, 0);
};

window.selectCityButton = function selectCityButton(event, button) {
  event.preventDefault();
  event.stopPropagation();
  const city = button.dataset.cityName || button.dataset.cityCustom;
  const country = button.dataset.countryName || $("#countryInput")?.value || "";
  const destination = createCustomDestination(country, city);
  if (destination) setDestinationState(destination);
  closeCityDropdown();
};

function openCountryDropdown() {
  const dropdown = $("#countryDropdown");
  const input = $("#countryInput");
  if (!dropdown || !input) return;
  const current = state.destinationState?.country || "";
  renderCountryDropdown(input.value.trim() === current ? "" : input.value);
  dropdown.hidden = false;
  input.setAttribute("aria-expanded", "true");
}

function closeCountryDropdown() {
  const dropdown = $("#countryDropdown");
  const input = $("#countryInput");
  if (!dropdown || !input) return;
  dropdown.hidden = true;
  input.setAttribute("aria-expanded", "false");
}

function openCityDropdown() {
  const dropdown = $("#cityDropdown");
  const input = $("#cityInput");
  if (!dropdown || !input) return;
  renderCityDropdown(input.value.trim());
  dropdown.hidden = false;
  input.setAttribute("aria-expanded", "true");
}

function closeCityDropdown() {
  const dropdown = $("#cityDropdown");
  const input = $("#cityInput");
  if (!dropdown || !input) return;
  dropdown.hidden = true;
  input.setAttribute("aria-expanded", "false");
}

function closeDestinationDropdown() {
  closeCountryDropdown();
  closeCityDropdown();
  closeDestinationPanel();
}

function commitDestinationInput(options = {}) {
  const destination = createCustomDestination($("#countryInput")?.value || "", $("#cityInput")?.value || "");
  if (!destination) return null;
  setDestinationState(destination, options);
  return destination;
}

function initDestinationOptions() {
  const countryInput = $("#countryInput");
  const cityInput = $("#cityInput");
  if (!countryInput || !cityInput) return;
  if (state.trip?.destinationState && !state.destinationState) state.destinationState = state.trip.destinationState;
  if (state.destinationState?.country) countryInput.value = state.destinationState.country;
  if (state.destinationState?.city) cityInput.value = state.destinationState.city;
  renderCountryDropdown(countryInput.value);
  renderCityDropdown(cityInput.value);
  updateDestinationDisplay();
}

function initPackingControls() {
  const monthSelect = $("#tripMonth");
  if (!monthSelect) return;
  monthSelect.innerHTML = Array.from({ length: 12 }, (_, index) => {
    const month = index + 1;
    return `<option value="${month}">${month} 月</option>`;
  }).join("");
  const saved = state.packingContext || {};
  $("#tripMonth").value = String(saved.month || getCurrentMonth());
  $("#tripWeather").value = saved.weather || "auto";
}

function renderAllCards() {
  renderGuides();
  renderStaticCards();
  renderFavorites();
}

function bindEvents() {
  $("#tripForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const days = $("#days").value;
    const daysLabel = $("#days").selectedOptions[0].textContent;
    const worries = $$("#tripForm input[type='checkbox']:checked").map((box) => box.value);
    const destination = commitDestinationInput({ render: false }) || createCustomDestination("自定义", "下一站");
    state.trip = {
      destination: destination.city,
      destinationState: destination,
      days,
      daysLabel,
      type: $("#tripType").value,
      worries: worries.map(normalizeConcern),
    };
    state.destinationState = destination;
    state.packingContext = {
      ...(state.packingContext || {}),
      country: destination.city,
      month: Number($("#tripMonth")?.value || getCurrentMonth()),
      weather: $("#tripWeather")?.value || "auto",
      reason: $("#tripType").value,
    };
    syncPackingLocationFromTrip(true);
    state.planGenerated = false;
    save();
    renderTrip();
    renderPacking();
    renderPlan();
    updateHomeStats();
    renderPlanSummary(state.trip);
    openPlanSummary();
    showToast("已帮你捋好");
  });

  $("#resetBtn").addEventListener("click", () => {
    localStorage.clear();
    location.reload();
  });

  $("#comfortModeToggle").addEventListener("click", () => {
    state.comfortMode = !state.comfortMode;
    save();
    applyComfortMode();
    if (state.comfortMode) {
      setActiveTab("safe");
      showToast("安心模式已开启");
    } else {
      showToast("安心模式已关闭");
    }
  });

  $(".tabs").addEventListener("click", (event) => {
    const tab = event.target.closest(".tab");
    if (!tab) return;
    setActiveTab(tab.dataset.tab);
  });

  document.body.addEventListener("click", (event) => {
    const jump = event.target.closest("[data-jump]");
    if (!jump) return;
    setActiveTab(jump.dataset.jump);
  });

  document.body.addEventListener("click", (event) => {
    if (event.target.closest("[data-close-summary]")) {
      closePlanSummary();
    }
    const summaryJump = event.target.closest("[data-summary-jump]");
    if (!summaryJump) return;
    closePlanSummary();
    setActiveTab(summaryJump.dataset.summaryJump);
  });

  document.body.addEventListener("change", (event) => {
    const input = event.target;
    if (!input.matches("[data-check]")) return;
    state.checked[input.dataset.check] = input.checked;
    input.closest(".check-item")?.classList.toggle("done", input.checked);
    input.closest(".plan-card")?.classList.toggle("done", input.checked);
    save();
    updatePackingCount();
    updatePlanCount();
    updateHomeStats();
    renderMine();
  });

  $("#tripForm").addEventListener("change", (event) => {
    if (!event.target.matches("input[type='checkbox']") || !state.trip) return;
    state.trip.worries = $$("#tripForm input[type='checkbox']:checked").map((box) => normalizeConcern(box.value));
    state.planGenerated = false;
    save();
    renderTrip();
    renderPlan();
    renderPacking();
  });

  $("#countryDropdown")?.addEventListener("pointerdown", (event) => {
    event.stopPropagation();
    const countryButton = event.target.closest("[data-country-name], [data-country-custom]");
    if (countryButton) {
      event.preventDefault();
      window.selectCountryButton(event, countryButton);
    }
  });

  $("#cityDropdown")?.addEventListener("pointerdown", (event) => {
    event.stopPropagation();
    const cityButton = event.target.closest("[data-city-name], [data-city-custom]");
    if (cityButton) {
      event.preventDefault();
      window.selectCityButton(event, cityButton);
    }
  });

  $("#destinationDisplay")?.addEventListener("click", openDestinationPanel);
  $("#closeDestinationPanel")?.addEventListener("click", closeDestinationPanel);
  $("#destinationSearch")?.addEventListener("input", renderDestinationPanel);
  $("#destinationSearch")?.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      const value = $("#destinationSearch")?.value.trim();
      if (value) selectDestinationCity(value);
    }
    if (event.key === "Escape") closeDestinationPanel();
  });
  $(".destination-tabs")?.addEventListener("click", (event) => {
    const button = event.target.closest("[data-destination-tab]");
    if (!button) return;
    activeDestinationTab = button.dataset.destinationTab;
    if ($("#destinationSearch")) $("#destinationSearch").value = "";
    renderDestinationPanel();
  });
  $("#destinationPanel")?.addEventListener("click", (event) => {
    if (event.target.id === "destinationPanel") closeDestinationPanel();
    const cityButton = event.target.closest("[data-destination-city]");
    if (cityButton) {
      selectDestinationCity(cityButton.dataset.destinationCity);
      return;
    }
    const customButton = event.target.closest("[data-destination-custom]");
    if (customButton) {
      selectDestinationCity(customButton.dataset.destinationCustom);
      return;
    }
    const letterButton = event.target.closest("[data-jump-letter]");
    if (letterButton) {
      const target = $(`#destination-letter-${letterButton.dataset.jumpLetter}`);
      target?.scrollIntoView({ block: "start", behavior: "smooth" });
    }
  });

  document.body.addEventListener("click", (event) => {
    const countryButton = event.target.closest("[data-country-name], [data-country-custom]");
    if (countryButton) {
      window.selectCountryButton(event, countryButton);
      return;
    }
    const cityButton = event.target.closest("[data-city-name], [data-city-custom]");
    if (cityButton) {
      window.selectCityButton(event, cityButton);
      return;
    }
    if (event.target.closest("#destinationPanel")) return;
    if (!event.target.closest("#destinationPicker")) closeDestinationDropdown();
  });

  document.body.addEventListener("click", (event) => {
    const button = event.target.closest("[data-favorite]");
    if (!button) return;
    const id = button.dataset.favorite;
    state.favorites = state.favorites.includes(id) ? state.favorites.filter((item) => item !== id) : [...state.favorites, id];
    save();
    renderAllCards();
    showToast(state.favorites.includes(id) ? "已收藏" : "已取消收藏");
  });

  document.body.addEventListener("click", (event) => {
    const button = event.target.closest("[data-delete-contact]");
    if (!button) return;
    state.contacts.splice(Number(button.dataset.deleteContact), 1);
    save();
    renderContacts();
    showToast("联系人已删除");
  });

  $("#quizBtn")?.addEventListener("click", () => {
    const experience = $("#quizExperience").value;
    const goal = $("#quizGoal").value;
    const [name, desc, actions, tags] = personaMap[experience][goal];
    state.persona = { name, desc, actions, tags };
    save();
    renderPersona();
    showToast("玩法已生成");
  });

  $("#drawPose").addEventListener("click", drawPose);
  $("#drawPhotoTheme")?.addEventListener("click", drawPhotoTheme);

  $("#extraPackCheck")?.addEventListener("click", () => {
    const button = $("#extraPackCheck");
    const previousLabel = button.textContent;
    button.disabled = true;
    button.textContent = "正在根据这趟旅行整理中...";
    setTimeout(() => {
      renderExtraPackingTips();
      button.disabled = false;
      button.textContent = previousLabel;
      showToast("已按这趟旅行补充");
    }, 180);
  });

  $("#cityInsightCheck")?.addEventListener("click", async () => {
    await renderCityInsightTips();
    showToast("已补充城市提醒");
  });

  $("#generatePlanBtn")?.addEventListener("click", () => generatePlanNow("已按这趟旅行排好"));
  $("#regeneratePlanBtn")?.addEventListener("click", () => generatePlanNow("已按你的状态重新排好"));

  $("#travelTuning")?.addEventListener("change", (event) => {
    const input = event.target;
    if (!input.matches("input[type='radio']")) return;
    const group = input.closest("[data-tuning-group]")?.dataset.tuningGroup;
    if (!group) return;
    state.travelTuning = { ...state.travelTuning, [group]: input.value };
    save();
    if (state.planGenerated) {
      renderPlan();
      renderPacking();
      renderTasks();
      renderGuides();
      if ($("#cityInsightTips")?.classList.contains("show")) renderCityInsightTips();
      if ($("#extraPackTips")?.classList.contains("show")) renderExtraPackingTips();
    }
  });

  $(".emergency-actions")?.addEventListener("click", (event) => {
    const button = event.target.closest("[data-emergency]");
    if (!button) return;
    renderEmergencyScenario(button.dataset.emergency);
  });

  document.body.addEventListener("click", async (event) => {
    if (event.target.closest("[data-copy-help]")) {
      await copyText(state.currentEmergencyText, "求助信息已复制");
    }
  });

  ["packCountry", "packMonth", "packWeather", "packReason"].forEach((id) => {
    $(`#${id}`)?.addEventListener("input", renderPacking);
    $(`#${id}`)?.addEventListener("change", renderPacking);
  });

  ["days", "tripType", "tripMonth", "tripWeather"].forEach((id) => {
    $(`#${id}`)?.addEventListener("change", () => {
      persistCurrentTripSettings();
      syncPackingLocationFromTrip(true);
      renderTrip();
      renderPlan();
      renderPacking();
      renderAllCards();
      if ($("#cityInsightTips")?.classList.contains("show")) renderCityInsightTips();
      if ($("#extraPackTips")?.classList.contains("show")) renderExtraPackingTips();
    });
  });

  $$("#tripForm input[type='checkbox']").forEach((box) => {
    box.addEventListener("change", () => {
      persistCurrentTripSettings();
      renderTrip();
      renderTasks();
      renderPlan();
      renderPacking();
      renderAllCards();
    });
  });

  $("#countryInput")?.addEventListener("focus", openCountryDropdown);
  $("#countryInput")?.addEventListener("click", openCountryDropdown);
  $("#countryInput")?.addEventListener("input", () => {
    openCountryDropdown();
  });
  $("#countryInput")?.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      const country = findCountryItem($("#countryInput")?.value || "") || { country: $("#countryInput")?.value.trim(), countryEn: $("#countryInput")?.value.trim(), region: "自定义目的地" };
      $("#countryInput").value = country.country || "";
      $("#cityInput").value = "";
      closeCountryDropdown();
      openCityDropdown();
    }
    if (event.key === "Escape") closeCountryDropdown();
  });

  $("#cityInput")?.addEventListener("focus", openCityDropdown);
  $("#cityInput")?.addEventListener("click", openCityDropdown);
  $("#cityInput")?.addEventListener("input", () => {
    openCityDropdown();
  });
  $("#cityInput")?.addEventListener("change", () => {
    const destination = commitDestinationInput({ render: false });
    if (!destination) return;
    persistCurrentTripSettings();
    state.trip.destination = destination.city;
    state.trip.destinationState = destination;
    state.destinationState = destination;
    syncPackingLocationFromTrip(true);
    save();
    renderTrip();
    renderPlan();
    renderPacking();
    renderAllCards();
    if ($("#cityInsightTips")?.classList.contains("show")) renderCityInsightTips();
    if ($("#extraPackTips")?.classList.contains("show")) renderExtraPackingTips();
  });
  $("#cityInput")?.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      commitDestinationInput();
      persistCurrentTripSettings();
      closeCityDropdown();
    }
    if (event.key === "Escape") closeCityDropdown();
  });

  $("#copyShare")?.addEventListener("click", async () => {
    await copyText($("#shareText").textContent, "分享文案已复制");
  });

  $("#saveJournal")?.addEventListener("click", () => {
    const input = $("#journalInput");
    const text = input.value.trim();
    if (!text) {
      showToast("先写一点内容");
      return;
    }
    const date = new Intl.DateTimeFormat("zh-CN", { month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" }).format(
      new Date()
    );
    const moodText = `${state.selectedMood} ${text}`;
    state.journals = [{ date, text: moodText }, ...state.journals].slice(0, 12);
    state.calendar[calendarKey()] = { ...(state.calendar[calendarKey()] || {}), mood: moodText, moodDate: date };
    input.value = "";
    save();
    renderJournals();
    showToast("已记下，今天的状态也被你带走了。");
  });

  document.body.addEventListener("click", (event) => {
    const button = event.target.closest("[data-mood]");
    if (!button) return;
    state.selectedMood = button.dataset.mood;
    $$("#moodOptions [data-mood]").forEach((item) => item.classList.toggle("active", item === button));
  });

  document.body.addEventListener("click", (event) => {
    const dayButton = event.target.closest("[data-calendar-day]");
    if (!dayButton) return;
    state.selectedCalendarDay = Number(dayButton.dataset.calendarDay);
    renderCalendar();
  });

  document.body.addEventListener("click", (event) => {
    if (!event.target.closest("#pickCalendarPhoto")) return;
    $("#calendarPhotoInput")?.click();
  });

  document.body.addEventListener("click", (event) => {
    if (!event.target.closest("[data-delete-calendar-photo]")) return;
    const key = calendarKey();
    const entry = state.calendar[key];
    if (!entry?.photo) return;
    delete entry.photo;
    if (!entry.mood && !entry.moodDate) {
      delete state.calendar[key];
    }
    const input = $("#calendarPhotoInput");
    if (input) input.value = "";
    save();
    renderCalendar();
    showToast("照片已删除");
  });

  document.body.addEventListener("change", (event) => {
    if (!event.target.matches("#calendarPhotoInput")) return;
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      state.calendar[calendarKey()] = { ...(state.calendar[calendarKey()] || {}), photo: reader.result };
      save();
      renderCalendar();
      showToast("照片已记录");
    };
    reader.readAsDataURL(file);
  });

  $("#contactForm")?.addEventListener("submit", (event) => {
    event.preventDefault();
    const name = $("#contactName").value.trim();
    const phone = $("#contactPhone").value.trim();
    if (!name || !phone) {
      showToast("请填写姓名和电话");
      return;
    }
    state.contacts = [{ name, phone }, ...state.contacts].slice(0, 5);
    $("#contactName").value = "";
    $("#contactPhone").value = "";
    save();
    renderContacts();
    showToast("联系人已保存");
  });
}

initDestinationOptions();
initPackingControls();
renderTrip();
renderTasks();
renderTravelTuning();
renderPlan();
renderPacking();
renderAllCards();
renderJournals();
renderContacts();
renderPersona();
renderMine();
drawPose();
drawPhotoTheme();
applyComfortMode();
updateHomeStats();
updateTabIndicator();
window.addEventListener("resize", updateTabIndicator);
bindEvents();
