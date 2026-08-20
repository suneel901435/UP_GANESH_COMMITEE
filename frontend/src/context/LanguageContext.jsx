import React, { createContext, useContext, useState, useCallback } from 'react'
import { translations } from '../i18n/translations'

const LanguageContext = createContext(null)

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => localStorage.getItem('language') || 'en')

  const changeLanguage = useCallback((lang) => {
    setLanguage(lang)
    localStorage.setItem('language', lang)
  }, [])

  const toggleLanguage = useCallback(() => {
    changeLanguage(language === 'en' ? 'te' : 'en')
  }, [language, changeLanguage])

  // Falls back to the English string, then to the raw key, so untranslated
  // parts of the app degrade gracefully instead of showing blank text while
  // translation coverage is extended page by page.
  const t = useCallback((key) => {
    return translations[language]?.[key] ?? translations.en[key] ?? key
  }, [language])

  return (
    <LanguageContext.Provider value={{ language, setLanguage: changeLanguage, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  return useContext(LanguageContext)
}
