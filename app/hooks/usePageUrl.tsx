import { useEffect, useState } from "react";

/**
 * Custom hook that returns the current page URL.
 *
 * @returns {string} The current page URL.
 *
 * @example
 * const pageUrl = usePageUrl();
 * console.log(pageUrl); // Outputs the current page URL
 */
export default function usePageUrl(): string {
  const [pageUrl, setPageUrl] = useState("");
  useEffect(() => {
    setPageUrl(location.href);
  }, []);

  return pageUrl;
}
