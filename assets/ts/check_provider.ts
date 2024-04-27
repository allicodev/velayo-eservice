import jason from "../json/constant.json";

export const checkProvider = (phone: string): string => {
  if (phone == "") return "No Provider";
  if (/[a-zA-Z]/.test(phone)) return "Invalid Number";

  const netProvider = jason.provider;
  const toCheckNum = phone.slice(0, 3);

  if (netProvider.CHERRY.split(" ").includes(toCheckNum)) return "CHERRY";
  if (netProvider.GOMO.split(" ").includes(toCheckNum)) return "GOMO";
  if (netProvider["GLOBE/TM"].split(" ").includes(toCheckNum))
    return "GLOBE/TM";
  if (netProvider["SMART/TNT"].split(" ").includes(toCheckNum))
    return "SMART/TNT";
  if (netProvider["SUN CELLULAR"].split(" ").includes(toCheckNum))
    return "SUN CELLULAR";
  if (netProvider.DITO.split(" ").includes(toCheckNum)) return "DITO";
  return "No Provider";
};
