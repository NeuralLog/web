/**
 * Custom Document component
 */

import React from 'react';
import Document, { Html, Head, Main, NextScript, DocumentContext } from 'next/document';

/**
 * Custom Document component
 */
class MyDocument extends Document {
  /**
   * Get initial props
   * 
   * @param ctx Document context
   * @returns Initial props
   */
  static async getInitialProps(ctx: DocumentContext) {
    const initialProps = await Document.getInitialProps(ctx);
    return { ...initialProps };
  }

  /**
   * Render
   * 
   * @returns Component JSX
   */
  render() {
    return (
      <Html lang="en">
        <Head>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link
            href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
            rel="stylesheet"
          />
        </Head>
        <body className="bg-gray-100 text-gray-900">
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
