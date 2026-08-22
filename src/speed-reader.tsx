import { Pause, Play, RotateCcw } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import "./index.css";

const DEFAULT_TEXT =
  "Paste any text here and press play. Each word is shown one at a time, anchored on its middle letter, so your eyes stay fixed on a single point while you read.";

const MIN_WPM = 60;
const MAX_WPM = 900;
const MIN_FONT_SIZE = 24;
const MAX_FONT_SIZE = 112;

function splitWord(word: string) {
  const pivotIndex = Math.floor((word.length - 1) / 2);
  return {
    before: word.slice(0, pivotIndex),
    pivot: word[pivotIndex] ?? "",
    after: word.slice(pivotIndex + 1),
  };
}

export function SpeedReader() {
  const [text, setText] = useState(DEFAULT_TEXT);
  const [wordIndex, setWordIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [wpm, setWpm] = useState(300);
  const [fontSize, setFontSize] = useState(56);

  const words = useMemo(() => {
    const trimmed = text.trim();
    return trimmed ? trimmed.split(/\s+/) : [];
  }, [text]);

  const safeIndex = Math.min(wordIndex, Math.max(0, words.length - 1));
  const currentWord = words[safeIndex] ?? "";
  const { before, pivot, after } = splitWord(currentWord);
  const isAtEnd = safeIndex >= words.length - 1;

  useEffect(() => {
    if (!isPlaying || words.length === 0) return;

    const interval = setInterval(() => {
      setWordIndex((index) => {
        if (index >= words.length - 1) {
          setIsPlaying(false);
          return index;
        }
        return index + 1;
      });
    }, 60_000 / wpm);

    return () => clearInterval(interval);
  }, [isPlaying, wpm, words.length]);

  const handleTextChange = (value: string) => {
    setText(value);
    setWordIndex(0);
    setIsPlaying(false);
  };

  const handlePlayToggle = () => {
    if (words.length === 0) return;
    if (!isPlaying && isAtEnd) setWordIndex(0);
    setIsPlaying((playing) => !playing);
  };

  return (
    <div className="flex h-full min-h-0 flex-col gap-4 rounded-xl border border-zinc-800 bg-zinc-950 p-4 text-zinc-200 shadow-lg">
      <Textarea
        value={text}
        onChange={(event) => handleTextChange(event.target.value)}
        placeholder="Paste or type the text you want to speed-read…"
        className="max-h-40 min-h-24 resize-none border-zinc-800 bg-zinc-900 text-zinc-200 placeholder:text-zinc-500 focus-visible:ring-zinc-600"
      />

      <div className="relative flex flex-1 items-center justify-center overflow-hidden rounded-lg border border-zinc-800 bg-zinc-900/60">
        <div
          className="pointer-events-none absolute inset-x-0 top-1/2 flex -translate-y-1/2 flex-col items-center justify-between"
          style={{ height: fontSize * 2.2 }}
        >
          <div className="flex w-2/3 max-w-xl flex-col items-center">
            <div className="h-px w-full bg-zinc-700/60" />
            <div className="h-2 w-px bg-red-500" />
          </div>
          <div className="flex w-2/3 max-w-xl flex-col items-center">
            <div className="h-2 w-px bg-red-500" />
            <div className="h-px w-full bg-zinc-700/60" />
          </div>
        </div>

        {currentWord ? (
          <div
            className="grid w-full grid-cols-[1fr_auto_1fr] whitespace-pre font-mono font-semibold"
            style={{ fontSize }}
            aria-live="polite"
          >
            <span className="text-right text-zinc-100">{before}</span>
            <span className="text-red-500">{pivot}</span>
            <span className="text-left text-zinc-100">{after}</span>
          </div>
        ) : (
          <p className="text-sm text-zinc-500">
            Enter some text above to start reading
          </p>
        )}
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-end gap-6">
          <div className="flex items-center gap-2">
            <Button
              onClick={handlePlayToggle}
              disabled={words.length === 0}
              size="icon"
              className="bg-red-600 text-white hover:bg-red-500"
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? <Pause /> : <Play />}
            </Button>
            <Button
              onClick={() => {
                setWordIndex(0);
                setIsPlaying(false);
              }}
              disabled={words.length === 0}
              size="icon"
              variant="ghost"
              className="text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
              aria-label="Restart"
            >
              <RotateCcw />
            </Button>
          </div>

          <div className="flex min-w-40 flex-1 flex-col gap-1.5">
            <Label htmlFor="reader-font-size" className="text-xs text-zinc-400">
              Text size: {fontSize}px
            </Label>
            <input
              id="reader-font-size"
              type="range"
              min={MIN_FONT_SIZE}
              max={MAX_FONT_SIZE}
              step={4}
              value={fontSize}
              onChange={(event) => setFontSize(Number(event.target.value))}
              className="h-1.5 cursor-pointer accent-red-500"
            />
          </div>

          <div className="flex min-w-40 flex-1 flex-col gap-1.5">
            <Label htmlFor="reader-speed" className="text-xs text-zinc-400">
              Speed: {wpm} words/min
            </Label>
            <input
              id="reader-speed"
              type="range"
              min={MIN_WPM}
              max={MAX_WPM}
              step={20}
              value={wpm}
              onChange={(event) => setWpm(Number(event.target.value))}
              className="h-1.5 cursor-pointer accent-red-500"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="reader-position" className="text-xs text-zinc-400">
            Position: word {words.length === 0 ? 0 : safeIndex + 1} of{" "}
            {words.length}
          </Label>
          <input
            id="reader-position"
            type="range"
            min={0}
            max={Math.max(0, words.length - 1)}
            value={safeIndex}
            onChange={(event) => setWordIndex(Number(event.target.value))}
            disabled={words.length === 0}
            className="h-1.5 cursor-pointer accent-red-500 disabled:cursor-not-allowed"
          />
        </div>
      </div>
    </div>
  );
}
