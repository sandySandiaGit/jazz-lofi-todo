import { faBriefcase, faHouse } from "@fortawesome/free-solid-svg-icons";

export const CATEGORY_ICONS: Record<string, any> = {
  briefcase: faBriefcase,
  house: faHouse,
};

export const CATEGORY_COLORS: Record<string, { activeBg: string; text: string; lightBg: string; border: string }> = {

  blue: {
    activeBg: "bg-blue-500",
    text: "text-blue-500 hover:text-blue-600",
    lightBg: "text-blue-600",
    border: "border-blue-300 focus:border-blue-500 focus:text-blue-500"
  },
  indigo: {
    activeBg: "bg-indigo-600",
    text: "text-indigo-600 hover:text-indigo-700",
    lightBg: "text-indigo-600",
    border: "border-indigo-300 focus:border-indigo-600 focus:text-indigo-600"
  },
  pink: {
    activeBg: "bg-pink-500",
    text: "text-pink-500 hover:text-pink-600",
    lightBg: "text-pink-500",
    border: "border-pink-300 focus:border-pink-500 focus:text-pink-500"
  },
  marine: {
    activeBg: "bg-blue-900",
    text: "text-blue-900 hover:text-blue-900",
    lightBg: "text-blue-900",
    border: "border-blue-300 focus:border-blue-900 focus:text-blue-900"
  },
  orange: {
    activeBg: "bg-orange-500",
    text: "text-orange-500 hover:text-orange-600",
    lightBg: "text-orange-600",
    border: "border-orange-300 focus:border-orange-500 focus:text-orange-500"
  }
};