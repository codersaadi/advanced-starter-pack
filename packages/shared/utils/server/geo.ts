import { geolocation } from '@vercel/functions';
import { getCountry } from 'countries-and-timezones';

const getLocalTime = (timeZone: string) => {
  return new Date().toLocaleString('en-US', {
    hour: 'numeric',
    hour12: false,
    timeZone,
  });
};

const isValidTimeZone = (timeZone: string) => {
  try {
    getLocalTime(timeZone);
    return true;
  } catch (e) {
    if (e instanceof RangeError) {
      return false;
    }
    throw e;
  }
};

export const parseDefaultThemeFromCountry = (request: Request) => {
  const geo = geolocation(request);

  const countryCode =
    geo?.country ||
    request.headers.get('x-vercel-ip-country') || // Vercel
    request.headers.get('cf-ipcountry') || // Cloudflare
    request.headers.get('x-zeabur-ip-country') || // Zeabur
    request.headers.get('x-country-code'); // Netlify

  if (!countryCode) return 'light';

  const country = getCountry(countryCode);

  if (!country?.timezones?.length) return 'light';

  const timeZone = country.timezones.find((tz) => isValidTimeZone(tz));
  if (!timeZone) return 'light';

  const localTime = getLocalTime(timeZone);

  const localHour = Number.parseInt(localTime);
  // console.log(
  //   `[theme] Country: ${countryCode}, Timezone: ${country.timezones[0]}, LocalHour: ${localHour}`,
  // );

  return localHour >= 6 && localHour < 18 ? 'light' : 'dark';
};
