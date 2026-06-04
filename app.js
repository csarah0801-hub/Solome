const state = {
  trip: JSON.parse(localStorage.getItem("solomate-trip") || "null"),
  checked: JSON.parse(localStorage.getItem("solomate-checked") || "{}"),
  guideFilter: "全部",
};

const basePacking = [
  "身份证/护照/签证资料",
  "银行卡与少量现金",
  "手机充电器和充电宝",
  "常用药与创可贴",
  "洗漱用品小样",
  "舒适鞋和备用袜子",
  "防晒/雨具",
  "蓝牙遥控器或迷你三脚架",
  "备用手机支架",
  "紧急联系人信息截图",
];

const typePacking = {
  city: ["交通卡或本地 App", "轻便外套", "可折叠购物袋"],
  sea: ["泳衣", "防水手机袋", "晒后修护", "拖鞋"],
  outdoor: ["速干衣物", "防滑鞋", "头灯或小手电", "能量棒"],
  abroad: ["转换插头", "翻译 App 离线包", "eSIM/电话卡", "护照复印件"],
};

const guides = [
  {
    tag: "新手",
    title: "第一次 solo trip，先降低难度",
    points: ["选择交通方便、评价稳定的目的地", "白天抵达，第一晚住在核心区域", "第一天行程只安排 1-2 个重点"],
  },
  {
    tag: "安全",
    title: "把安全感提前准备好",
    points: ["把住宿地址和行程发给可信任的人", "晚上回住处前确认路线和交通", "感觉不舒服时，优先离开现场"],
  },
  {
    tag: "自信",
    title: "一个人吃饭不用解释",
    points: ["选你真正想吃的店", "带一本书或整理照片", "你不是尴尬，你是在自由安排自己的时间"],
  },
  {
    tag: "拍照",
    title: "请别人拍照前先给出明确指令",
    points: ["说清楚横拍/竖拍", "指出背景要保留什么", "请对方连拍 3 张，成功率会高很多"],
  },
  {
    tag: "行李",
    title: "solo trip 行李要优先轻便",
    points: ["每件物品都问：我一个人搬得动吗", "贵重物品分开放", "预留一个空袋装脏衣服和临时物品"],
  },
  {
    tag: "情绪",
    title: "孤独感出现时，先做一件具体小事",
    points: ["去便利店买一杯喜欢的饮料", "给朋友发一张眼前的照片", "把明天第一个目的地查好"],
  },
];

const photos = [
  {
    tag: "构图",
    title: "街道照片",
    points: ["手机放低一点，拍到脚下路面", "人站在画面三分之一处", "等人流少一点再按遥控器"],
  },
  {
    tag: "姿势",
    title: "自然不尴尬的动作",
    points: ["看向远处，不一定看镜头", "整理头发、拿咖啡、回头走路", "连续拍比单张摆拍更自然"],
  },
  {
    tag: "工具",
    title: "一个人拍照工具",
    points: ["迷你三脚架", "蓝牙遥控器", "防盗手机绳", "轻便补光灯"],
  },
];

const safety = [
  {
    tag: "我感觉不安全",
    title: "立刻去人多、明亮、有工作人员的地方",
    points: ["不要停留争辩", "打开导航去最近的店铺/车站/酒店前台", "给朋友发送实时位置和一句简短说明"],
  },
  {
    tag: "迷路了",
    title: "先停下来，不要边慌边走",
    points: ["确认手机电量", "找店员或工作人员问路", "优先打车回住宿，不硬撑省钱"],
  },
  {
    tag: "手机快没电",
    title: "先保存关键地址",
    points: ["截图住宿地址和地图", "关闭耗电应用", "去咖啡店/便利店/车站找充电点"],
  },
  {
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

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

function save() {
  localStorage.setItem("solomate-trip", JSON.stringify(state.trip));
  localStorage.setItem("solomate-checked", JSON.stringify(state.checked));
}

function showToast(text) {
  const toast = $("#toast");
  toast.textContent = text;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 1400);
}

function renderTrip() {
  if (!state.trip) return;
  $("#tripTitle").textContent = `${state.trip.destination || "我的目的地"} · ${state.trip.daysLabel}`;
  $("#todayHeadline").textContent = `去 ${state.trip.destination || "目的地"} 前，先把准备变简单`;
  $("#todayText").textContent = state.trip.worries.length
    ? `你现在最在意：${state.trip.worries.join("、")}。今天先完成下面 4 件事。`
    : "今天先完成下面 4 件事，让出发前更踏实。";
  $("#destination").value = state.trip.destination;
  $("#days").value = state.trip.days;
  $("#tripType").value = state.trip.type;
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

function renderPacking() {
  const type = state.trip?.type || "city";
  const items = [...basePacking, ...typePacking[type]];
  $("#packingList").innerHTML = items
    .map((item, index) => {
      const id = `pack-${type}-${index}`;
      return `
        <label class="check-item ${state.checked[id] ? "done" : ""}">
          <input type="checkbox" data-check="${id}" ${state.checked[id] ? "checked" : ""} />
          <span>${item}</span>
        </label>
      `;
    })
    .join("");
  updatePackingCount();
}

function updatePackingCount() {
  const items = $$("#packingList input");
  const done = items.filter((input) => input.checked).length;
  $("#packingCount").textContent = `${done}/${items.length}`;
}

function renderGuides() {
  const tags = ["全部", ...new Set(guides.map((card) => card.tag))];
  $("#guideFilters").innerHTML = tags
    .map((tag) => `<button class="${tag === state.guideFilter ? "active" : ""}" data-filter="${tag}">${tag}</button>`)
    .join("");
  const visible = state.guideFilter === "全部" ? guides : guides.filter((card) => card.tag === state.guideFilter);
  $("#guideCards").innerHTML = visible.map(cardMarkup).join("");
}

function cardMarkup(card) {
  return `
    <article class="advice-card">
      <span class="tag">${card.tag}</span>
      <strong>${card.title}</strong>
      <ul>${card.points.map((point) => `<li>${point}</li>`).join("")}</ul>
    </article>
  `;
}

function renderStaticCards() {
  $("#photoCards").innerHTML = photos.map(cardMarkup).join("");
  $("#safeCards").innerHTML = safety.map(cardMarkup).join("");
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
    save();
    renderTrip();
    renderPacking();
    showToast("已生成");
  });

  $("#resetBtn").addEventListener("click", () => {
    localStorage.clear();
    location.reload();
  });

  $(".tabs").addEventListener("click", (event) => {
    const tab = event.target.closest(".tab");
    if (!tab) return;
    $$(".tab, .tab-page").forEach((node) => node.classList.remove("active"));
    tab.classList.add("active");
    $(`#${tab.dataset.tab}`).classList.add("active");
  });

  document.body.addEventListener("change", (event) => {
    const input = event.target;
    if (!input.matches("[data-check]")) return;
    state.checked[input.dataset.check] = input.checked;
    input.closest(".check-item")?.classList.toggle("done", input.checked);
    save();
    updatePackingCount();
  });

  $("#guideFilters").addEventListener("click", (event) => {
    const button = event.target.closest("[data-filter]");
    if (!button) return;
    state.guideFilter = button.dataset.filter;
    renderGuides();
  });

  $("#copyPhoto").addEventListener("click", async () => {
    const text = $("#photoScript").textContent;
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
    showToast("话术已复制");
  });
}

renderTrip();
renderTasks();
renderPacking();
renderGuides();
renderStaticCards();
bindEvents();
