const state = {
  trip: JSON.parse(localStorage.getItem("solomate-trip") || "null"),
  checked: JSON.parse(localStorage.getItem("solomate-checked") || "{}"),
  favorites: JSON.parse(localStorage.getItem("solomate-favorites") || "[]"),
  journals: JSON.parse(localStorage.getItem("solomate-journals") || "[]"),
  contacts: JSON.parse(localStorage.getItem("solomate-contacts") || "[]"),
  persona: JSON.parse(localStorage.getItem("solomate-persona") || "null"),
  packingContext: JSON.parse(localStorage.getItem("solomate-packing-context") || "null"),
  calendar: JSON.parse(localStorage.getItem("solomate-calendar") || "{}"),
  selectedCalendarDay: new Date().getDate(),
  comfortMode: JSON.parse(localStorage.getItem("solomate-comfort-mode") || "false"),
  currentEmergencyText: "",
};

if (state.persona && !Array.isArray(state.persona.actions)) {
  state.persona = null;
  localStorage.removeItem("solomate-persona");
}

const basePacking = [
  "护照、身份证、签证资料",
  "银行卡和少量现金",
  "充电器和充电宝",
  "常用药和创可贴",
  "洗漱小样",
  "好走的鞋和备用袜",
  "离线地图和住宿截图",
  "紧急联系人截图",
];

const typePacking = {
  city: ["本地交通应用或交通卡", "薄外套", "折叠购物袋"],
  sea: ["泳衣", "防水手机袋", "晒后修护", "拖鞋"],
  outdoor: ["速干衣物", "防滑鞋", "小手电", "能量棒"],
  abroad: ["转换插头", "离线翻译包", "电话卡", "护照复印件"],
};

const locationOptions = [
  "中国大陆", "北京", "上海", "广州", "深圳", "成都", "重庆", "杭州", "南京", "西安", "长沙", "武汉", "郑州", "厦门", "青岛", "大理", "丽江", "三亚",
  "香港", "澳门", "台湾", "台北", "台中", "高雄",
  "日本", "东京", "大阪", "京都", "北海道", "冲绳",
  "韩国", "首尔", "釜山", "济州",
  "泰国", "曼谷", "清迈", "普吉",
  "新加坡", "马来西亚", "吉隆坡", "槟城",
  "越南", "河内", "胡志明", "岘港",
  "法国", "巴黎", "尼斯",
  "英国", "伦敦", "爱丁堡",
  "意大利", "罗马", "米兰", "佛罗伦萨",
  "西班牙", "巴塞罗那", "马德里",
  "美国", "纽约", "洛杉矶", "旧金山", "夏威夷",
  "加拿大", "温哥华", "多伦多",
  "澳大利亚", "悉尼", "墨尔本",
  "新西兰", "奥克兰",
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
  summer: ["透气衣物", "高倍防晒", "晒后修护", "帽子或墨镜"],
  autumn: ["针织衫或薄外套", "润唇膏", "好走的鞋"],
  winter: ["保暖内搭", "围巾手套", "保湿霜", "厚袜子"],
};

const weatherPacking = {
  hot: ["清凉湿巾", "电解质", "备用上衣"],
  cold: ["轻便羽绒或保暖层", "暖宝宝", "保温杯"],
  rainy: ["防水鞋套或速干鞋", "电子设备防水袋", "小毛巾"],
  dry: ["保湿霜和润唇膏", "补水面膜", "水瓶"],
};

const reasonPacking = {
  city: ["小斜挎包", "收藏好的咖啡店和展馆", "一套好拍的衣服"],
  photo: ["迷你三脚架", "蓝牙遥控器", "手机挂绳", "相册里的姿势参考"],
  shopping: ["折叠购物袋", "行李秤", "退税小袋", "好穿脱的鞋"],
  nature: ["防滑鞋", "轻便防风外套", "小急救包", "路上补给"],
  work: ["电脑充电器", "万能转换头", "降噪耳机", "备用网络"],
};

const dayPacking = {
  short: ["小包分装", "一套备用衣服", "轻便随身包"],
  medium: ["脏衣袋", "备用上衣", "分装护肤品", "常用药补充"],
  long: ["洗衣袋", "便携洗衣液", "备用鞋", "多套内搭", "行李收纳袋"],
};

const guides = [
  {
    id: "guide-newbie",
    tag: "Start easy",
    title: "第一次 solo trip，先别把难度拉满",
    intro: "一个人旅行最怕的不是不够勇敢，而是一开始就把自己塞进太复杂的行程。先让第一天稳下来，后面才会有心情好好玩。",
    points: [
      "第一晚住在交通方便、评价稳定的区域。不要为了省一点点钱，把自己放到很偏、晚上不好回的地方。",
      "尽量白天抵达。抵达当天只安排吃饭、入住、附近散步，别一落地就赶三个景点。",
      "每天留一个“我可以反悔”的空档。累了就回酒店，状态好再加行程。",
    ],
    script: "可以照抄：这趟我不追求玩满，我先把自己照顾好。",
  },
  {
    id: "guide-safe",
    tag: "Safety",
    title: "安全感不是紧张，是先想好怎么走",
    intro: "solo trip 的安全策略要简单到你紧张时也能执行：知道去哪、找谁、怎么离开。",
    points: [
      "把住宿地址、第一天行程、紧急联系人截图放进相册置顶。网络不好时也能打开。",
      "晚上出门前先查回程，不要等到很累才开始研究交通。",
      "只要感觉不舒服，先离开现场。你不需要解释，也不需要证明自己是不是想太多。",
    ],
    script: "求助短信：我现在有点不安心，正在去人多/有工作人员的地方。请你先保持电话畅通。",
  },
  {
    id: "guide-confidence",
    tag: "Confidence",
    title: "一个人吃饭、拍照、逛街，都不用解释",
    intro: "很多尴尬来自“我以为别人都在看我”。现实是大家都在忙自己的事。给自己一个小动作，会比硬撑自信更有效。",
    points: [
      "一个人吃饭时，选你真的想吃的店。点完菜就整理照片、看地图、写两句日记。",
      "需要拍照时，先在手机里打开参考图，再请别人帮忙，会比临场解释轻松很多。",
      "如果突然觉得孤独，去便利店买饮料、散步 10 分钟，或者给朋友发一张眼前的照片。",
    ],
    script: "心里默念：我不是落单，我是在自己安排我的时间。",
  },
  {
    id: "guide-photo",
    tag: "Photo",
    title: "一个人拍照，不要靠运气",
    intro: "拍照这件事可以很低压力：先准备工具、动作和一句清楚的话术。越具体，别人越容易帮你拍好。",
    points: [
      "请路人帮拍时说清楚：竖拍/横拍、要半身还是全身、背景要留多少。",
      "三脚架适合人少的地方；人多的地方用手机挂绳和蓝牙遥控器更稳。",
      "姿势别太复杂：走路回头、整理头发、看向远处、拿咖啡，连拍 5 张通常会有一张自然的。",
    ],
    script: "拍照话术：可以麻烦你帮我拍一张全身照吗？我想把背景也拍进去，竖着拿，连拍几张就好，谢谢。",
  },
];

const inspirationGroups = [
  {
    title: "城市街拍姿势",
    desc: "适合街道、车站、咖啡店、博物馆外景。",
    query: "独自旅行 城市街拍 姿势",
    links: [
      ["小红书", "https://www.xiaohongshu.com/search_result?keyword="],
      ["抖音", "https://www.douyin.com/search/"],
      ["TikTok", "https://www.tiktok.com/search?q="],
      ["Pinterest", "https://www.pinterest.com/search/pins/?q="],
    ],
  },
  {
    title: "海边和度假感照片",
    desc: "适合海边、泳池、落日、酒店阳台。",
    query: "solo travel beach photo poses",
    links: [
      ["Pinterest", "https://www.pinterest.com/search/pins/?q="],
      ["TikTok", "https://www.tiktok.com/search?q="],
      ["小红书", "https://www.xiaohongshu.com/search_result?keyword="],
      ["抖音", "https://www.douyin.com/search/"],
    ],
  },
  {
    title: "一个人拍照设备教程",
    desc: "找三脚架、遥控器、延时拍摄和构图教程。",
    query: "solo travel tripod photo tutorial",
    links: [
      ["TikTok", "https://www.tiktok.com/search?q="],
      ["Pinterest", "https://www.pinterest.com/search/pins/?q="],
      ["小红书", "https://www.xiaohongshu.com/search_result?keyword="],
      ["抖音", "https://www.douyin.com/search/"],
    ],
  },
];

const shoppingGroups = [
  {
    title: "手机三脚架 + 蓝牙遥控器",
    desc: "一个人拍全身照最基础的组合。",
    keyword: "手机三脚架 蓝牙遥控器",
    stores: [
      ["淘宝", "https://s.taobao.com/search?q="],
      ["Shopee 台湾", "https://shopee.tw/search?keyword="],
      ["Shopee 新加坡", "https://shopee.sg/search?keyword="],
      ["Amazon", "https://www.amazon.com/s?k=phone+tripod+bluetooth+remote"],
    ],
  },
  {
    title: "防盗手机绳 / 手机挂绳",
    desc: "在人多的城市、夜市、车站更安心。",
    keyword: "防盗手机绳 手机挂绳",
    stores: [
      ["淘宝", "https://s.taobao.com/search?q="],
      ["Shopee 台湾", "https://shopee.tw/search?keyword="],
      ["Shopee 新加坡", "https://shopee.sg/search?keyword="],
      ["Amazon", "https://www.amazon.com/s?k=phone+lanyard+anti+theft"],
    ],
  },
  {
    title: "便携补光灯",
    desc: "适合夜景、酒店房间、咖啡店自拍。",
    keyword: "便携补光灯 手机",
    stores: [
      ["淘宝", "https://s.taobao.com/search?q="],
      ["Shopee 台湾", "https://shopee.tw/search?keyword="],
      ["Shopee 新加坡", "https://shopee.sg/search?keyword="],
      ["Amazon", "https://www.amazon.com/s?k=portable+phone+video+light"],
    ],
  },
];

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
    points: ["确认手机电量", "找店员或工作人员问路", "优先打车回住宿，不硬撑省钱"],
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
  ["准备拍照工具", "三脚架、遥控器和手机电量都提前检查。"],
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
  ["街道", "假装整理头发，身体微微侧向镜头", "手机放低一点，人站在画面三分之一处", "城市街拍姿势"],
  ["咖啡店", "低头看杯子或翻书，不看镜头", "桌面留一点前景，人物靠窗", "咖啡店自拍姿势"],
  ["海边", "背对镜头往海边走，回头一秒", "打开连拍，保留海平线", "海边旅行拍照姿势"],
  ["车站", "拉着行李箱向前走，镜头在斜后方", "让站牌或轨道做背景线条", "旅行车站拍照"],
  ["酒店房间", "坐在床边整理包或看窗外", "用窗光，不开顶灯", "酒店旅行自拍"],
  ["博物馆", "站在展品旁边看说明，手里拿门票", "人物留在画面边缘，墙面留白多一点", "博物馆拍照姿势"],
  ["书店", "从书架旁探出半个身位，低头翻书", "用书架线条做背景，画面更干净", "书店拍照姿势"],
  ["斑马线", "自然往前走，不用看镜头", "让路口线条带出方向感，开连拍", "城市斑马线拍照"],
  ["夜市", "手里拿小吃，侧身看摊位灯牌", "避开正脸大闪光，用招牌光做氛围", "夜市拍照姿势"],
  ["雨天", "撑伞回头，另一只手轻扶伞柄", "找有反光的路面，人物放中间", "雨天旅行拍照"],
  ["落日", "背对镜头坐下或慢慢走", "压低曝光，保留天空颜色", "落日旅行拍照"],
  ["餐厅", "托腮看窗外，桌上留一杯饮料", "手机放桌角，画面带一点餐盘前景", "一个人吃饭拍照"],
  ["商店橱窗", "站在橱窗前整理包带或看展示", "用玻璃反射做双重画面", "橱窗街拍姿势"],
  ["电梯镜", "手机挡一半脸，另一只手拿房卡或咖啡", "镜子边框要拍完整，背景收干净", "电梯镜自拍"],
  ["火车窗边", "侧脸看窗外，手轻放在窗边", "窗外景色留一半，人物不要太满", "火车旅行拍照"],
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

function resolveLocationValue(input = "") {
  const text = input.trim().toLowerCase();
  if (!text) return "";
  const direct = locationOptions.find((item) => item.toLowerCase() === text);
  if (direct) return direct;
  return locationOptions.find((item) => text.includes(item.toLowerCase()) || item.toLowerCase().includes(text)) || input.trim();
}

function ensureLocationOption(value) {
  const select = $("#packCountry");
  if (!select || !value) return;
  if (![...select.options].some((option) => option.value === value)) {
    select.add(new Option(value, value));
  }
}

function syncPackingLocationFromTrip(force = false) {
  if (!state.trip?.destination || !$("#packCountry")) return;
  if (!force && state.packingContext?.country) return;
  const value = resolveLocationValue(state.trip.destination);
  ensureLocationOption(value);
  $("#packCountry").value = value;
  state.packingContext = { ...(state.packingContext || {}), country: value };
}

function getPackingContext() {
  const destination = state.trip?.destination || $("#destination")?.value.trim() || "";
  const saved = state.packingContext || {};
  const countryInput = $("#packCountry")?.value.trim() || saved.country || destination || "";
  const month = Number($("#packMonth")?.value || saved.month || getCurrentMonth());
  const weather = $("#packWeather")?.value || saved.weather || "auto";
  const reason = $("#packReason")?.value || saved.reason || state.trip?.type || "city";
  const days = Number(state.trip?.days || $("#days")?.value || 2);
  const season = seasonFromMonth(month);
  const weatherKey = weather === "auto" ? seasonWeatherGuess(season) : weather;
  const country = detectCountry(`${countryInput} ${destination}`);
  return { countryInput, month, weather, weatherKey, reason, season, country, days };
}

function seasonWeatherGuess(season) {
  return {
    spring: "rainy",
    summer: "hot",
    autumn: "dry",
    winter: "cold",
  }[season];
}

function uniqueItems(items) {
  return [...new Map(items.map((item) => [item.toLowerCase(), item])).values()];
}

function buildPackingGroups() {
  const context = getPackingContext();
  const tripType = state.trip?.type || "city";
  const weatherLabel = {
    auto: "按季节估算",
    hot: "很热",
    cold: "偏冷",
    rainy: "多雨",
    dry: "干燥",
  }[context.weather] || "天气";
  const countryItems = context.country?.items || ["查好当地插头", "收藏当地交通和地图", "当地紧急电话截图"];
  const dayKey = context.days <= 2 ? "short" : context.days <= 5 ? "medium" : "long";
  const groups = [
    { title: "基础必带", note: "不管去哪，这些先放进行李箱。", items: basePacking },
    { title: `${state.trip?.daysLabel || "旅行天数"}补充`, note: "天数不同，备用量也不一样。", items: dayPacking[dayKey] },
    { title: "玩法补充", note: "跟这趟旅行的类型有关。", items: typePacking[tripType] || [] },
    {
      title: `${context.countryInput || context.country?.label || "目的地"}提醒`,
      note: "根据你填的国家或地区加上的特殊项。",
      items: countryItems,
    },
    {
      title: `${seasonLabel(context.season)}·${weatherLabel}`,
      note: `${context.month} 月出发，先按季节和天气准备。`,
      items: uniqueItems([...(seasonalPacking[context.season] || []), ...(weatherPacking[context.weatherKey] || [])]),
    },
    { title: "这次重点", note: "按你这趟主要想做的事补充。", items: reasonPacking[context.reason] || [] },
  ];
  return groups.filter((group) => group.items.length);
}

function recommendedFocus(trip) {
  const worries = trip.worries.length ? trip.worries : ["安全", "行李", "拍照"];
  return worries.map((item) => {
    if (item === "安全") return "先保存住宿地址、紧急联系人和回程路线。";
    if (item === "行李") return "按天数轻装打包，贵重物品分开放。";
    if (item === "拍照") return "提前准备三脚架、遥控器和 3 张参考图。";
    if (item === "孤独") return "给每天安排一个小小的固定仪式，比如咖啡、散步或日记。";
    return `为「${item}」准备一个备用方案。`;
  });
}

const concernProfiles = {
  安全: {
    key: "safe",
    label: "安全优先",
    title: "先把退路放进口袋",
    intro: "这趟的重点不是一直紧张，而是提前知道：我住哪、找谁、怎么离开。",
    steps: ["把住宿地址和回程路线截图置顶。", "保存 1 个紧急联系人，抵达后报平安。", "晚上出门前先查好回程，不临时硬找路。"],
    pack: ["紧急联系人截图", "离线地图", "少量现金", "充电宝"],
    ritual: "每天出门前发一条位置给信任的人，回来后发一句“到啦”。",
  },
  行李: {
    key: "pack",
    label: "轻装出发",
    title: "少带一点，路上轻一点",
    intro: "行李焦虑通常不是东西太少，而是没有分层。先保留必需品，再按天气和玩法补。",
    steps: ["先收证件、钱、药、充电这 4 类。", "衣服按天数准备，能复穿就别多塞。", "把第一天会用的东西放在最外层。"],
    pack: ["收纳袋", "脏衣袋", "备用袜", "折叠袋"],
    ritual: "出发前拍一张行李摊开图，回程就知道有没有漏拿。",
  },
  拍照: {
    key: "photo",
    label: "照片友好",
    title: "先拍到喜欢的一张",
    intro: "一个人拍照不用靠临场发挥。准备工具、场景和动作，画面会自然很多。",
    steps: ["先收藏 3 张姿势参考，别现场空想。", "带三脚架或遥控器，人少时自己拍。", "每天只安排一个拍照场景，不把自己拍累。"],
    pack: ["迷你三脚架", "蓝牙遥控器", "手机挂绳", "补光小灯"],
    ritual: "每天挑一张“今天我来过”的照片，存进日历。",
  },
  孤独: {
    key: "calm",
    label: "不怕独处",
    title: "一个人，也要有小仪式",
    intro: "孤独感不是失败，它只是提醒你需要一点连接和节奏。给每天安排一个很小的固定动作。",
    steps: ["每天安排一顿真正想吃的饭。", "给朋友发一张眼前的照片，不用长聊。", "晚上写 3 句话：今天去了哪、喜欢什么、明天想慢一点还是多逛一点。"],
    pack: ["耳机", "小本子", "喜欢的香味小样", "舒适睡衣"],
    ritual: "把心情写进日历，回头看会发现自己其实走了很远。",
  },
};

function summaryProfile(trip) {
  const worries = trip.worries.length ? trip.worries : ["安全", "行李"];
  const primary = concernProfiles[worries[0]] || concernProfiles["安全"];
  const profiles = worries.map((item) => concernProfiles[item]).filter(Boolean);
  return { worries, primary, profiles };
}

function renderPlanSummary(trip) {
  const packingGroups = buildPackingGroups();
  const essentials = uniqueItems(packingGroups.flatMap((group) => group.items).slice(0, 12));
  const { worries, primary, profiles } = summaryProfile(trip);
  const steps = uniqueItems(profiles.flatMap((profile) => profile.steps)).slice(0, 6);
  const focusPack = uniqueItems([...essentials.slice(0, 6), ...profiles.flatMap((profile) => profile.pack)]).slice(0, 12);
  const rituals = profiles.map((profile) => profile.ritual).slice(0, 3);
  const summaryCard = $(".summary-card");
  summaryCard.className = `summary-card summary-${primary.key}`;
  $("#summaryTitle").textContent = `${trip.destination} · ${primary.label}计划`;
  $("#summaryContent").innerHTML = `
    <section class="summary-focus-card">
      <span>${primary.label}</span>
      <strong>${primary.title}</strong>
      <p>${primary.intro}</p>
      <div class="summary-tags">${worries.map((item) => `<em>${item}</em>`).join("")}</div>
    </section>
    <section class="summary-block">
      <strong>这趟怎么安排</strong>
      <p>${trip.destination}，${trip.daysLabel}，${tripTypeLabel(trip.type)}。你这次最在意的是：${worries.join("、")}，所以计划会先照顾这些点。</p>
    </section>
    <section class="summary-block summary-priority">
      <strong>先做这些</strong>
      <ul>${steps.map((item) => `<li>${item}</li>`).join("")}</ul>
    </section>
    <section class="summary-block">
      <strong>优先放进行李</strong>
      <ul>${focusPack.map((item) => `<li>${item}</li>`).join("")}</ul>
    </section>
    <section class="summary-block">
      <strong>路上的小仪式</strong>
      <ul>${rituals.map((item) => `<li>${item}</li>`).join("")}</ul>
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
  if (!state.trip) return;
  $("#tripTitle").textContent = `${state.trip.destination || "我的目的地"} · ${state.trip.daysLabel}`;
  $("#todayHeadline").textContent = `先准备 ${state.trip.destination || "下一站"}`;
  $("#todayText").textContent = state.trip.worries.length
    ? `你最在意：${state.trip.worries.join("、")}。今天先做下面几件小事。`
    : "今天先做下面几件小事，够用了。";
  $("#destination").value = state.trip.destination;
  $("#days").value = state.trip.days;
  $("#tripType").value = state.trip.type;
  syncPackingLocationFromTrip();
  $$("#tripForm input[type='checkbox']").forEach((box) => {
    box.checked = state.trip.worries.includes(box.value);
  });
}

function renderTasks() {
  $("#taskGrid").innerHTML = tasks
    .map(
      ([title, desc], index) => `
        <label class="task-card">
          <input type="checkbox" data-check="task-${index}" ${state.checked[`task-${index}`] ? "checked" : ""} />
          <span><strong>${title}</strong><span>${desc}</span></span>
        </label>
      `
    )
    .join("");
}

function renderPersona() {
  const card = $("#personaCard");
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
    $("#shareTitle").textContent = "生成玩法后，这里会出现你的分享卡。";
    $("#shareText").textContent = "可以复制成小红书/朋友圈文案。";
    return;
  }
  const destination = state.trip?.destination || $("#destination")?.value.trim() || "下一站";
  $("#shareTitle").textContent = `我是 ${state.persona.name}`;
  $("#shareText").textContent = `我的 solo trip 去 ${destination}。我是${state.persona.name}：${state.persona.desc}`;
}

function drawPose() {
  const pose = poseDeck[Math.floor(Math.random() * poseDeck.length)];
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
  const planDone = planSteps.filter((_, index) => state.checked[`plan-${index}`]).length;
  const packIds = buildPackingGroups().flatMap((group, groupIndex) => group.items.map((_, itemIndex) => packingItemId(groupIndex, itemIndex)));
  const packTotal = packIds.length;
  const packDone = packIds.filter((id) => state.checked[id]).length;
  $("#homePlanStat").textContent = `${planDone}/${planSteps.length}`;
  $("#homePackStat").textContent = `${packDone}/${packTotal}`;
  $("#homeContactStat").textContent = String(state.contacts.length);
}

function packingItemId(groupIndex, itemIndex) {
  const context = getPackingContext();
  const country = (context.country?.label || context.countryInput || "general").toLowerCase().replace(/\s+/g, "-");
  return `pack-${country}-${context.month}-${context.weatherKey}-${context.reason}-${groupIndex}-${itemIndex}`;
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
  $("#packCountry").value = context.countryInput;
  $("#packMonth").value = String(context.month);
  $("#packWeather").value = context.weather;
  $("#packReason").value = context.reason;
  const locationLabel = context.countryInput || context.country?.label || "这趟旅行";
  $("#packingHeadline").textContent = `${locationLabel} · ${context.month} 月清单`;
  const groups = buildPackingGroups();
  $("#packingList").innerHTML = groups
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
}

function renderPlan() {
  $("#planList").innerHTML = planSteps
    .map(([day, title, desc], index) => {
      const id = `plan-${index}`;
      return `
        <label class="plan-card ${state.checked[id] ? "done" : ""}">
          <span class="plan-day">${day}</span>
          <span><strong>${title}</strong><span>${desc}</span></span>
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
  if (target) target.innerHTML = guides.map(cardMarkup).join("");
}

function cardMarkup(card) {
  const isFavorite = state.favorites.includes(card.id);
  return `
    <article class="advice-card" data-card-id="${card.id}">
      <div class="advice-top">
        <div>
          <span class="tag">${card.tag}</span>
          <strong>${card.title}</strong>
        </div>
        <button class="favorite-btn ${isFavorite ? "active" : ""}" data-favorite="${card.id}" title="收藏" aria-label="收藏 ${card.title}">${isFavorite ? "★" : "☆"}</button>
      </div>
      ${card.intro ? `<p class="guide-intro">${card.intro}</p>` : ""}
      <ul>${card.points.map((point) => `<li>${point}</li>`).join("")}</ul>
      ${card.script ? `<div class="guide-script"><span>可以照抄</span><strong>${card.script}</strong></div>` : ""}
    </article>
  `;
}

function renderStaticCards() {
  $("#safeCards").innerHTML = safety.map(cardMarkup).join("");
  renderExternalResources();
}

function resourceMarkup(group, type) {
  const links = group.links || group.stores;
  const query = group.query || group.keyword;
  return `
    <article class="resource-card">
      <strong>${group.title}</strong>
      <span>${group.desc}</span>
      <div class="external-links">
        ${links
          .map(([label, base]) => {
            const href = base.startsWith("https://www.amazon.com/s?k=") ? base : searchUrl(base, query);
            return `<a href="${href}" target="_blank" rel="noopener noreferrer" data-external="${type}">${label}</a>`;
          })
          .join("")}
      </div>
    </article>
  `;
}

function renderExternalResources() {
  $("#inspirationCards").innerHTML = inspirationGroups.map((group) => resourceMarkup(group, "inspiration")).join("");
  $("#shoppingCards").innerHTML = shoppingGroups.map((group) => resourceMarkup(group, "shopping")).join("");
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
    ${entry.photo ? `<img class="calendar-photo-preview" src="${entry.photo}" alt="${state.selectedCalendarDay} 日照片记录" />` : `<div class="calendar-empty-photo">还没放照片</div>`}
    <button id="pickCalendarPhoto" class="secondary-btn" type="button">${entry.photo ? "换一张照片" : "添加照片"}</button>
    <input id="calendarPhotoInput" type="file" accept="image/*" hidden />
  `;
}

function renderContacts() {
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

function initPackingControls() {
  const monthSelect = $("#packMonth");
  if (!monthSelect) return;
  const countrySelect = $("#packCountry");
  countrySelect.innerHTML = locationOptions.map((item) => `<option value="${item}">${item}</option>`).join("");
  monthSelect.innerHTML = Array.from({ length: 12 }, (_, index) => {
    const month = index + 1;
    return `<option value="${month}">${month} 月</option>`;
  }).join("");
  const saved = state.packingContext || {};
  const locationValue = saved.country || resolveLocationValue(state.trip?.destination || "") || "中国大陆";
  ensureLocationOption(locationValue);
  $("#packCountry").value = locationValue;
  $("#packMonth").value = String(saved.month || getCurrentMonth());
  $("#packWeather").value = saved.weather || "auto";
  $("#packReason").value = saved.reason || state.trip?.type || "city";
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
    state.trip = {
      destination: $("#destination").value.trim() || "下一站",
      days,
      daysLabel,
      type: $("#tripType").value,
      worries,
    };
    syncPackingLocationFromTrip(true);
    save();
    renderTrip();
    renderPacking();
    renderPlan();
    updateHomeStats();
    renderPlanSummary(state.trip);
    openPlanSummary();
    showToast("计划已生成");
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

  $("#quizBtn").addEventListener("click", () => {
    const experience = $("#quizExperience").value;
    const goal = $("#quizGoal").value;
    const [name, desc, actions, tags] = personaMap[experience][goal];
    state.persona = { name, desc, actions, tags };
    save();
    renderPersona();
    showToast("玩法已生成");
  });

  $("#drawPose").addEventListener("click", drawPose);

  $(".emergency-actions").addEventListener("click", (event) => {
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

  $("#copyShare")?.addEventListener("click", async () => {
    await copyText($("#shareText").textContent, "分享文案已复制");
  });

  $("#saveJournal").addEventListener("click", () => {
    const input = $("#journalInput");
    const text = input.value.trim();
    if (!text) {
      showToast("先写一点内容");
      return;
    }
    const date = new Intl.DateTimeFormat("zh-CN", { month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" }).format(
      new Date()
    );
    state.journals = [{ date, text }, ...state.journals].slice(0, 12);
    state.calendar[calendarKey()] = { ...(state.calendar[calendarKey()] || {}), mood: text, moodDate: date };
    input.value = "";
    save();
    renderJournals();
    showToast("心情已保存");
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

  $("#contactForm").addEventListener("submit", (event) => {
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

initPackingControls();
renderTrip();
renderTasks();
renderPlan();
renderPacking();
renderAllCards();
renderJournals();
renderContacts();
renderPersona();
drawPose();
applyComfortMode();
updateHomeStats();
updateTabIndicator();
window.addEventListener("resize", updateTabIndicator);
bindEvents();
