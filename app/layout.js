import './globals.css';
import { getSettings } from '../lib/server-helpers';

export async function generateMetadata() {
  const settings = getSettings();
  return {
    title: settings.website_title,
    description: settings.seo_description,
    openGraph: {
      title: settings.website_title,
      description: settings.seo_description,
      siteName: settings.company_name
    },
    icons: settings.favicon ? [{ rel: 'icon', url: settings.favicon }] : undefined
  };
}

export default function RootLayout({ children }) {
  const settings = getSettings();
  return (
    <html lang="en">
      <body>
        {children}
        {settings.google_analytics_id ? (
          <>
            <script
              async
              src={`https://www.googletagmanager.com/gtag/js?id=${settings.google_analytics_id}`}
            />
            <script
              dangerouslySetInnerHTML={{
                __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js', new Date());gtag('config', '${settings.google_analytics_id}');`
              }}
            />
          </>
        ) : null}
      </body>
    </html>
  );
}
