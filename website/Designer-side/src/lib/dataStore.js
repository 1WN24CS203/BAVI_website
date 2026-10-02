// ================================================================
// BAVI Data Store Utility (Simplified & Debug-Friendly)
// Provides unified Supabase query execution with resilient LocalStorage fallback.
// ================================================================

import { supabase, isSupabaseConfigured } from './supabase';

/**
 * Read data safely from localStorage
 */
export function getLocalItem(key, fallback = []) {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return parsed !== null && parsed !== undefined ? parsed : fallback;
  } catch (err) {
    console.warn(`[dataStore] Failed reading "${key}" from localStorage:`, err);
    return fallback;
  }
}

/**
 * Write data safely to localStorage
 */
export function setLocalItem(key, data) {
  if (typeof window === 'undefined') return false;
  try {
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch (err) {
    console.warn(`[dataStore] Failed saving "${key}" to localStorage:`, err);
    return false;
  }
}

/**
 * Unified fetch: attempts Supabase query first; falls back to localStorage if offline / unconfigured
 * @param {string} table - Supabase table name
 * @param {string} localKey - localStorage key
 * @param {Array} fallback - default data
 * @param {Function} [queryModifier] - optional query builder callback (e.g. (q) => q.order('created_at'))
 */
export async function fetchCollection(table, localKey, fallback = [], queryModifier = null) {
  if (isSupabaseConfigured()) {
    try {
      let query = supabase.from(table).select('*');
      if (typeof queryModifier === 'function') {
        query = queryModifier(query);
      }
      const { data, error } = await query;
      if (!error && Array.isArray(data) && data.length > 0) {
        return data;
      }
    } catch (err) {
      console.warn(`[dataStore] Supabase fetch error on "${table}":`, err);
    }
  }

  // Fallback to local storage
  const local = getLocalItem(localKey, fallback);
  return Array.isArray(local) && local.length > 0 ? local : fallback;
}

/**
 * Unified persist: writes to localStorage immediately and pushes to Supabase in parallel
 */
export async function saveRecord(table, localKey, record, idField = 'id') {
  // 1. Update localStorage collection
  const existing = getLocalItem(localKey, []);
  const updated = [record, ...existing.filter(item => item[idField] !== record[idField])];
  setLocalItem(localKey, updated);

  // 2. Push to Supabase if configured and not a temp mock ID
  if (isSupabaseConfigured() && record[idField] && !String(record[idField]).includes('temp-')) {
    try {
      await supabase.from(table).upsert([record], { onConflict: idField });
    } catch (err) {
      console.warn(`[dataStore] Supabase upsert error on "${table}":`, err);
    }
  }

  return updated;
}
