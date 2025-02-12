import { ActionButton } from "../@types";

const getIconColor = (variant: ActionButton["variant"]) => {
  switch (variant) {
    case "primary":
      return "#003459";
    case "secondary":
      return "gray";
    case "danger":
      return "#FB2E31";
    default:
      return "#003459";
  }
};

const getIconStyle = (variant: ActionButton["variant"]) => {
  switch (variant) {
    case "primary":
      return { backgroundColor: "#E6F8FF" };
    case "secondary":
      return { backgroundColor: "#F2F2F2" };
    case "danger":
      return { backgroundColor: "#FFE0E0" };
    default:
      return { backgroundColor: "#E6F8FF" };
  }
};

export { getIconColor, getIconStyle };
