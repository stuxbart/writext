import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { TypedUseSelectorHook } from "react-redux";
import type { RootState, AppDispatch } from "./store";
import { useSearchParams } from "react-router-dom";
import _ from "lodash";

export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export function useSearchQuery() {
  const [searchParams, setSearchParams] = useSearchParams();

  const setSearchQuery = useCallback(
    _.debounce(
      (query: string) => {
        setSearchParams({ q: query });
      },
      250,
      { trailing: true }
    ),
    [searchParams, setSearchParams]
  );

  return [searchParams.get("q") || "", setSearchQuery];
}
