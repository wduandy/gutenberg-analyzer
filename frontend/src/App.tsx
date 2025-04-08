import { Book, Search, Users } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent } from "@/components/ui/tabs";

import { Button } from "@/components/ui/button";
import CharacterGraph from "./components/graph-data";
import { Input } from "@/components/ui/input";
import { useBookStore } from "./stores/book";
import { useState } from "react";

export default function Home() {
  const [isAnalyzed, setIsAnalyzed] = useState(false);
  const { bookId, setBookId, fetchBook, isLoading } = useBookStore();

  const handleAnalyze = () => {
    if (!bookId) return;
    setIsAnalyzed(true);
    fetchBook();
  };

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-slate-50 to-slate-100">
      <header className="sticky top-0 z-10 border-b bg-white/80 backdrop-blur-sm">
        <div className="flex h-16 items-center justify-around py-4">
          <div className="flex items-center gap-2">
            <Book className="h-6 w-6 text-emerald-600" />
            <h1 className="text-xl font-bold">Gutenberg Analyzer</h1>
          </div>
          <nav className="flex items-center gap-4">
            <a
              href="#"
              className="text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              About
            </a>
            <a
              href="#"
              className="text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              Documentation
            </a>
          </nav>
        </div>
      </header>

      <main className="flex-1 py-6">
        <div className="mx-auto max-w-5xl space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">
                Character Relationship Analysis
              </CardTitle>
              <CardDescription>
                Enter a Project Gutenberg book ID to analyze character
                relationships and interactions.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4 sm:flex-row">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Enter Gutenberg book ID (e.g. 1232 for 'The Prince')"
                    className="pl-9"
                    value={bookId}
                    onChange={(e) => setBookId(e.target.value)}
                  />
                </div>
                <Button
                  onClick={handleAnalyze}
                  disabled={!bookId || isLoading}
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  {isLoading ? "Analyzing..." : "Analyze Book"}
                </Button>
              </div>

              <div className="mt-4 text-sm text-muted-foreground">
                <p>
                  Example IDs: 1342 (Pride and Prejudice), 1400 (Great
                  Expectations), 1232 (The Prince), 84 (Frankenstein)
                </p>
              </div>
            </CardContent>
          </Card>

          {isAnalyzed && (
            <Card className="overflow-hidden">
              <CardHeader className="bg-slate-50 gap-0">
                <div className="flex items-center justify-between p-4">
                  <div>
                    <CardTitle>Analysis Results</CardTitle>
                    <CardDescription>
                      Character relationships and interactions from your
                      selected book
                    </CardDescription>
                  </div>
                  <Users className="h-5 w-5 text-emerald-600" />
                </div>
              </CardHeader>
              <Tabs defaultValue="graph" className="w-full">
                <TabsContent value="graph" className="p-0">
                  <CardContent className="p-0">
                    <div className="w-full rounded-md bg-white p-4">
                      <CharacterGraph />
                    </div>
                  </CardContent>
                </TabsContent>
                <TabsContent value="data">
                  <CardContent>
                    <div className="rounded-md border p-4">
                      <p className="text-sm text-muted-foreground">
                        Character data and statistics would be displayed here.
                      </p>
                    </div>
                  </CardContent>
                </TabsContent>
              </Tabs>
            </Card>
          )}

          {!isAnalyzed && (
            <div className="flex h-60 items-center justify-center rounded-lg border border-dashed bg-white p-8 text-center">
              <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
                <Users className="h-10 w-10 text-muted-foreground/50" />
                <h3 className="mt-4 text-lg font-semibold text-muted-foreground">
                  No analysis yet
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Enter a Project Gutenberg book ID and click "Analyze Book" to
                  visualize character relationships.
                </p>
              </div>
            </div>
          )}
        </div>
      </main>

      <footer className="border-t bg-white">
        <div className="flex h-16 items-center justify-around py-4">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Gutenberg Analyzer
          </p>
          <p className="text-sm text-muted-foreground">
            Powered by Project Gutenberg and AI
          </p>
        </div>
      </footer>
    </div>
  );
}
