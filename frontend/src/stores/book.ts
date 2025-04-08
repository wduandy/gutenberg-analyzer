import { create } from "zustand";

export interface Edge {
  description: string;
  source: string;
  target: string;
  type: string;
  weight: number;
}

export interface Node {
  id: string;
  weight: number;
}

export interface BookData {
  nodes: Node[];
  edges: Edge[];
}

interface BookState {
  bookId: string;
  errorMessage?: string;
  isLoading: boolean;
  isError: boolean;
  data: BookData | null;

  // Actions
  setBookId: (id: string) => void;
  fetchBook: () => Promise<void>;
  reset: () => void;
}

export const useBookStore = create<BookState>((set, get) => ({
  bookId: "",
  errorMessage: undefined,
  isLoading: false,
  isError: false,
  data: null,

  // Actions
  setBookId: (id) => set({ bookId: id }),

  fetchBook: async () => {
    set({ isLoading: true, isError: false });
    const { bookId } = get();
    try {
      const url =
        process.env.NODE_ENV === "production"
          ? "/analyze"
          : "http://localhost:5059/analyze";

      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ book_id: bookId, part_index: 4 }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to fetch graph data");
      }

      const { result } = await response.json();

      const characters = new Set<string>(
        result.edges.flatMap((edge: Edge) => [edge.source, edge.target])
      );

      const nodes = Array.from(characters).map((character) => {
        return result.nodes.find((node: Node) => node.id === character) || { id: character, weight: 1 }
      });

      set({ data: { edges: result.edges, nodes }, isLoading: false });
    } catch (error) {
      console.log("Error fetching book data:", { error });
      set({
        isLoading: false,
        isError: true,
        errorMessage:
          error instanceof Error ? error.message : "Unknown error occurred",
      });
    }
  },

  reset: () =>
    set({ bookId: "", data: null, isLoading: false, isError: false }),
}));
