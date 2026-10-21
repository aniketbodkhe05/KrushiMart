import { useCallback, useEffect, useRef, useState } from 'react'
import { getErrorMessage } from '../services/api-client'

/**
 * Small data-loading hook used by feature pages.
 * `loader` is captured for the dependency-controlled request; pass all request
 * inputs in `deps` to trigger a reload.
 *
 * @param {() => Promise<any>} loader
 * @param {Array<any>} deps
 * @returns {{data: any, loading: boolean, error: string|null, reload: () => void}}
 */
export function useApi(loader, deps = []) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [reloadKey, setReloadKey] = useState(0)
  const loaderRef = useRef(loader)
  loaderRef.current = loader

  const reload = useCallback(() => setReloadKey((key) => key + 1), [])

  useEffect(() => {
    let active = true
    setLoading(true)
    setError(null)
    Promise.resolve()
      .then(() => loaderRef.current())
      .then((result) => {
        if (active) setData(result)
      })
      .catch((err) => {
        if (active) setError(getErrorMessage(err))
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, reloadKey])

  return { data, loading, error, reload }
}
