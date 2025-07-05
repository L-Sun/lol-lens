import * as i18n from "i18next";
import { initReactI18next } from "react-i18next";

export const translations = {
  "com.lol.status.running": {
    zh: "LOL 正在运行",
    en: "LOL is running",
  },
  "com.lol.status.not-running": {
    zh: "LOL 未运行",
    en: "LOL is not running",
  },
  "nav.me": {
    zh: "个人页面",
    en: "Me",
  },
  "nav.debug": {
    zh: "调试页面",
    en: "Debug",
  },
  "page.debug.title": {
    zh: "调试页面",
    en: "Debug",
  },
  "page.user.loading": {
    zh: "加载中...",
    en: "Loading...",
  },
  "page.user.error": {
    zh: "加载用户数据时出错",
    en: "Error loading user data",
  },
  "page.user.lol-not-started": {
    zh: "LOL未启动",
    en: "LOL not started",
  },
  "page.user.user-not-found": {
    zh: "用户未找到",
    en: "User not found",
  },
  "nav.current-match": {
    zh: "当前对局",
    en: "Current Match",
  },
  "page.current-match.title": {
    zh: "当前对局",
    en: "Current Match",
  },
  "page.current-match.subtitle": {
    zh: "实时对局信息",
    en: "Real-time match information",
  },
  "page.current-match.waiting": {
    zh: "等待对局开始",
    en: "Waiting for match to start",
  },
  "page.current-match.connecting": {
    zh: "正在连接到英雄联盟客户端...",
    en: "Connecting to League of Legends client...",
  },
  "page.current-match.refresh": {
    zh: "刷新",
    en: "Refresh",
  },
  "page.current-match.settings": {
    zh: "设置",
    en: "Settings",
  },
  "page.current-match.match-details": {
    zh: "对局详情",
    en: "Match Details",
  },
  "page.current-match.blue-team": {
    zh: "蓝队",
    en: "Blue Team",
  },
  "page.current-match.red-team": {
    zh: "红队",
    en: "Red Team",
  },
  "page.current-match.blue-players": {
    zh: "蓝队玩家",
    en: "Blue Players",
  },
  "page.current-match.red-players": {
    zh: "红队玩家",
    en: "Red Players",
  },
  "page.current-match.match-mode": {
    zh: "对局模式",
    en: "Match Mode",
  },
  "page.current-match.players-count": {
    zh: "人",
    en: "players",
  },
  "page.current-match.match-stats": {
    zh: "对局统计",
    en: "Match Statistics",
  },
  "page.current-match.game-duration": {
    zh: "游戏时长",
    en: "Game Duration",
  },
  "page.current-match.map": {
    zh: "地图",
    en: "Map",
  },
  "page.current-match.game-mode": {
    zh: "游戏模式",
    en: "Game Mode",
  },
  "page.current-match.status": {
    zh: "状态",
    en: "Status",
  },
  "page.current-match.status-ready": {
    zh: "准备中",
    en: "Ready",
  },
  "page.current-match.unknown": {
    zh: "未知",
    en: "Unknown",
  },
  "page.current-match.champion-id": {
    zh: "英雄 ID",
    en: "Champion ID",
  },
  "page.current-match.summoner-spell-id": {
    zh: "召唤师技能 ID",
    en: "Summoner Spell ID",
  },
  "page.current-match.rune-id": {
    zh: "符文 ID",
    en: "Rune ID",
  },
  "page.current-match.primary-rune": {
    zh: "主符文",
    en: "Primary Rune",
  },
  "page.current-match.positions": {
    zh: "位置",
    en: "Position",
  },
  "page.current-match.position-top": {
    zh: "上单",
    en: "Top",
  },
  "page.current-match.position-jungle": {
    zh: "打野",
    en: "Jungle",
  },
  "page.current-match.position-mid": {
    zh: "中单",
    en: "Mid",
  },
  "page.current-match.position-adc": {
    zh: "ADC",
    en: "ADC",
  },
  "page.current-match.position-support": {
    zh: "辅助",
    en: "Support",
  },
  "page.current-match.level": {
    zh: "等级",
    en: "Level",
  },
  "page.current-match.loading": {
    zh: "加载中...",
    en: "Loading...",
  },
} as const;

export type TranslationKey = keyof typeof translations;

export type TranslationValue = {
  [K in keyof typeof translations]: () => string;
};

const resources = (() => {
  const result: {
    [language: string]: {
      translation: {
        [key: string]: string;
      };
    };
  } = {};

  for (const [key, data] of Object.entries(translations)) {
    for (const [language, translation] of Object.entries(data)) {
      if (!result[language]) {
        result[language] = {
          translation: {},
        };
      }
      result[language].translation[key] = translation;
    }
  }
  return result;
})();

await i18n
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    resources,
    lng: "zh-cn", // language to use, more information here: https://www.i18next.com/overview/configuration-options#languages-namespaces-resources
    // you can use the i18n.changeLanguage function to change the language manually: https://www.i18next.com/overview/api#changelanguage
    // if you're using a language detector, do not define the lng option

    interpolation: {
      escapeValue: false, // react already safes from xss
    },
  });
export default i18n;
