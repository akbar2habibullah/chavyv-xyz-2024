export function dateNow() {
  let options: Intl.DateTimeFormatOptions = {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    weekday: "long",
  };
  let dateFormatter = new Intl.DateTimeFormat([], options);

  return dateFormatter.format(new Date());
}