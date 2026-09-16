const TEHRAN = "Asia/Tehran";

function toDate(value: Date | string | number) {
  return value instanceof Date ? value : new Date(value);
}

/** مثال: 25 شهریور 1405 */
export function formatJalaliDate(value: Date | string | number = new Date()) {
  return new Intl.DateTimeFormat("fa-IR-u-ca-persian-nu-latn", {
    timeZone: TEHRAN,
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(toDate(value));
}

/** مثال: چهارشنبه 25 شهریور 1405 */
export function formatJalaliDayLabel(value: Date | string | number = new Date()) {
  return new Intl.DateTimeFormat("fa-IR-u-ca-persian-nu-latn", {
    timeZone: TEHRAN,
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(toDate(value));
}

/** مثال: 25 شهریور 1405، 15:30 */
export function formatJalaliDateTime(value: Date | string | number) {
  return new Intl.DateTimeFormat("fa-IR-u-ca-persian-nu-latn", {
    timeZone: TEHRAN,
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(toDate(value));
}
