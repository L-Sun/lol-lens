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
