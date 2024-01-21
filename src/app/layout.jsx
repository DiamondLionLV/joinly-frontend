import React from 'react';
import Image from 'next/image';
import Script from 'next/script';

import joinly from '../assets/joinly.png';
import {SDKUsageDemo} from '../components/SDKUsageDemo';
import {MiroSDKInit} from '../components/SDKInit';

export default function RootLayout({children}) {
  return (
    <html>
      <body>
        <Script
          src="https://miro.com/app/static/sdk/v2/miro.js"
          strategy="beforeInteractive"
        />
        <MiroSDKInit />
        <div id="root">
          <div className="grid">
            <div className="cs1 ce12">
              <SDKUsageDemo />
            </div>
            <div className="cs1 ce12">{children}</div>
            <div className="cs1 ce12">
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
