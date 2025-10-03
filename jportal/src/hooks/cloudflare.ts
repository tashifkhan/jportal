import { useQuery } from "@tanstack/react-query";

import {
  fetchWebAnalyticsAggregate,
  fetchWebAnalyticsBrowser,
  fetchWebAnalyticsOS,
  fetchWebAnalyticsSparkline,
} from "@/lib/api";

export function useFetchWebAnalyticsAggregate(from: Date, to: Date) {
  const query = useQuery({
    queryKey: ["webAnalytics", "aggregate", from, to],
    queryFn: () => fetchWebAnalyticsAggregate(from, to),
  });

  return query;
}

export function useFetchWebAnalyticsBrowser(from: Date, to: Date) {
  const query = useQuery({
    queryKey: ["webAnalytics", "browser", from, to],
    queryFn: () => fetchWebAnalyticsBrowser(from, to),
  });

  return query;
}

export function useFetchWebAnalyticsOS(from: Date, to: Date) {
  const query = useQuery({
    queryKey: ["webAnalytics", "os", from, to],
    queryFn: () => fetchWebAnalyticsOS(from, to),
  });

  return query;
}

export function useFetchWebAnalyticsSparkline(from: Date, to: Date) {
  const query = useQuery({
    queryKey: ["webAnalytics", "sparkline", from, to],
    queryFn: () => fetchWebAnalyticsSparkline(from, to),
  });

  return query;
}
