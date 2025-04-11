import React, { useEffect, useState } from 'react';

const GoogleTranslate = () => {
  const [showWidget, setShowWidget] = useState(false);

  useEffect(() => {
    const addGoogleTranslateScript = () => {
      const script = document.createElement('script');
      script.src = "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
      script.async = true;
      document.body.appendChild(script);

      window.googleTranslateElementInit = () => {
        new window.google.translate.TranslateElement(
          { pageLanguage: 'en' },
          'google_translate_element'
        );
      };
    };

    addGoogleTranslateScript();
  }, []);

  const toggleWidget = () => {
    setShowWidget(!showWidget);
  };

  return (
    <>
      {showWidget && (
        <div id="google_translate_element" style={{ marginTop: '10px' }}></div>
      )}
    </>
  );
};

export default GoogleTranslate;