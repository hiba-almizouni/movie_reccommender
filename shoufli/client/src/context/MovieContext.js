import React,{createContext,useContext,useState,useCallback} from 'react';
import {favoritesAPI} from '../services/api';
import {useAuth} from './AuthContext';
const MovieContext=createContext(null);
export const MovieProvider=({children})=>{
  const {user}=useAuth();
  const [favoriteIds,setFavoriteIds]=useState(new Set());
  const [loaded,setLoaded]=useState(false);
  const loadFavorites=useCallback(async()=>{
    if(!user||loaded)return;
    try{const {data}=await favoritesAPI.getAll();setFavoriteIds(new Set((data.favorites||[]).map(f=>f.movieId)));setLoaded(true);}catch(e){}
  },[user,loaded]);
  const isFavorite=useCallback(id=>favoriteIds.has(Number(id)),[favoriteIds]);
  const addFav=useCallback(id=>setFavoriteIds(p=>new Set([...p,Number(id)])),[]);
  const removeFav=useCallback(id=>setFavoriteIds(p=>{const n=new Set(p);n.delete(Number(id));return n;}),[]);
  return <MovieContext.Provider value={{isFavorite,addFav,removeFav,loadFavorites}}>{children}</MovieContext.Provider>;
};
export const useMovieContext=()=>useContext(MovieContext);
