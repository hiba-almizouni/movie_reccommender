import React,{createContext,useContext,useState,useEffect} from 'react';
const ThemeContext=createContext(null);
export const ThemeProvider=({children})=>{
  const [isDark,setIsDark]=useState(()=>(localStorage.getItem('shoufli_theme')||'dark')==='dark');
  useEffect(()=>{
    const root=document.documentElement;
    isDark?root.classList.remove('light-mode'):root.classList.add('light-mode');
    localStorage.setItem('shoufli_theme',isDark?'dark':'light');
  },[isDark]);
  const toggleTheme=()=>setIsDark(v=>!v);
  return <ThemeContext.Provider value={{isDark,theme:isDark?'dark':'light',toggleTheme}}>{children}</ThemeContext.Provider>;
};
export const useTheme=()=>{const ctx=useContext(ThemeContext);if(!ctx)throw new Error('useTheme outside ThemeProvider');return ctx;};
