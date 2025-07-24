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
  "nav.current-match": {
    zh: "当前对局",
    en: "Current Match",
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
  "page.current-match.waiting": {
    zh: "等待对局开始",
    en: "Waiting for match to start",
  },
  "page.current-match.game-mode": {
    zh: "游戏模式",
    en: "Game Mode",
  },
  "page.current-match.level": {
    zh: "等级",
    en: "Level",
  },
  "page.current-match.loading": {
    zh: "加载中...",
    en: "Loading...",
  },
  "page.current-match.refresh": {
    zh: "刷新",
    en: "Refresh",
  },
  "page.current-match.title": {
    zh: "当前对局",
    en: "Current Match",
  },
  "page.current-match.blue": {
    zh: "蓝队",
    en: "Blue Team",
  },
  "page.current-match.red": {
    zh: "红队",
    en: "Red Team",
  },
  "game-mode.": {
    zh: "未知",
    en: "Unknown",
  },
  "game-mode.CLASSIC": {
    zh: "召唤师峡谷",
    en: "Summoner's Rift",
  },
  "game-mode.CHERRY": {
    zh: "斗魂竞技场",
    en: "Arena",
  },
  "game-mode.URF": {
    zh: "无限火力",
    en: "Ultimate Spellbook",
  },
  "game-mode.ARAM": {
    zh: "嚎哭深渊",
    en: "Howling Abyss",
  },
  "game-mode.TFT": {
    zh: "云顶之弈",
    en: "Teamfight Tactics",
  },
  "game-mode.NEXUSBLITZ": {
    zh: "枢纽战",
    en: "Nexus Blitz",
  },
  "game-mode.ONEFORALL": {
    zh: "克隆大作战",
    en: "Clones",
  },
  "match.win": {
    zh: "胜利",
    en: "Victory",
  },
  "match.lose": {
    zh: "失败",
    en: "Defeat",
  },
  "match.triple-kills": {
    zh: "三杀",
    en: "Triple Kill",
  },
  "match.quadra-kills": {
    zh: "四杀",
    en: "Quadra Kill",
  },
  "match.penta-kills": {
    zh: "五杀",
    en: "Penta Kill",
  },
  "match.legendary": {
    zh: "超神",
    en: "Legendary",
  },
  "match.top-kills": {
    zh: "k头狗",
    en: "Most Kills",
  },
  "match.top-deaths": {
    zh: "ATM",
    en: "Most Deaths",
  },
  "match.top-assists": {
    zh: "混子",
    en: "Most Assists",
  },
  "match.top-damage": {
    zh: "伤害爆表",
    en: "Most Damage Dealt",
  },
  "match.top-defense": {
    zh: "肉便器",
    en: "Most Damage Taken",
  },
  "match.top-heal": {
    zh: "奶奶奶！",
    en: "Most Healing Done",
  },
  "match.top-gold": {
    zh: "纯纯的吸血鬼",
    en: "Most Gold Earned",
  },
  "match.cherry-0": {},
  "match.cherry-1": {
    zh: "吃鸡！",
    en: "1st",
  },
  "match.cherry-2": {
    zh: "第二名",
    en: "2nd",
  },
  "match.cherry-3": {
    zh: "第三名",
    en: "3rd",
  },
  "match.cherry-4": {
    zh: "第四名",
    en: "4th",
  },
  "match.cherry-5": {
    zh: "第五名",
    en: "5th",
  },
  "match.cherry-6": {
    zh: "第六名",
    en: "6th",
  },
  "match.cherry-7": {
    zh: "第七名",
    en: "7th",
  },
  "match.cherry-8": {
    zh: "老八",
    en: "8th",
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
