import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Layout } from "./components/layout";

// Create a query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

// App component wrapped with QueryClientProvider
function AppWrapper() {
  return (
    <QueryClientProvider client={queryClient}>
      <Layout />
    </QueryClientProvider>
  );
}

export default AppWrapper;
