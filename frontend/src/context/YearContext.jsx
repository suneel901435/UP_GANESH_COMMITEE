import React, { createContext, useContext, useEffect, useState } from 'react'
import api from '../api/axios'

const YearContext = createContext(null)

export function YearProvider({ children }) {
  const [years, setYears] = useState([])
  const [selectedYear, setSelectedYear] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/public/years')
      .then((res) => {
        setYears(res.data)
        if (res.data.length > 0) {
          const active = res.data.find((y) => y.active) || res.data[0]
          setSelectedYear(active.year)
        }
      })
      .finally(() => setLoading(false))
  }, [])

  return (
    <YearContext.Provider value={{ years, selectedYear, setSelectedYear, loading }}>
      {children}
    </YearContext.Provider>
  )
}

export function useYear() {
  return useContext(YearContext)
}
