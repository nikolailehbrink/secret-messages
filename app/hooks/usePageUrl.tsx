import { useEffect, useState } from "react";

export default function usePageUrl() {
  const [pageUrl, setPageUrl] = useState("");
  useEffect(() => {
    setPageUrl(location.href);
  }, []);

  return pageUrl;
}
