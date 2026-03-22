import { enUS } from 'date-fns/locale/en-US';

let resolvedLocale = enUS;

export function getDateFnsLocale() {
    return resolvedLocale;
}

export async function initDateFnsLocale() {
    const lang = document.documentElement.lang || 'en';
    const map = {
        sk: () => import('date-fns/locale/sk'),
        cs: () => import('date-fns/locale/cs'),
        en: () => import('date-fns/locale/en-US'),
        de: () => import('date-fns/locale/de'),
        fr: () => import('date-fns/locale/fr'),
        es: () => import('date-fns/locale/es'),
        pl: () => import('date-fns/locale/pl'),
        hu: () => import('date-fns/locale/hu'),
    };
    const loader = map[lang] || map['en'];
    const mod = await loader();
    resolvedLocale = mod.default || mod[Object.keys(mod)[0]];
}
