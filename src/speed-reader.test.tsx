import { act, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import "@/test/rtl-cleanup";
import { SpeedReader } from "./speed-reader";

function getDisplayedWord() {
  const live = screen.getByText((_, element) => {
    return element?.getAttribute("aria-live") === "polite";
  });
  return live.textContent ?? "";
}

async function setReaderText(value: string) {
  const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
  const textarea = screen.getByPlaceholderText(/paste or type the text/i);
  await user.clear(textarea);
  if (value) {
    await user.type(textarea, value);
  }
  return user;
}

describe("SpeedReader", () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders default text and shows the first word with a pivot letter", () => {
    render(<SpeedReader />);

    const textarea = screen.getByPlaceholderText(
      /paste or type the text/i,
    ) as HTMLTextAreaElement;
    expect(textarea.value).toContain("Paste any text here");
    expect(getDisplayedWord()).toBe("Paste");
    expect(screen.getByText("s")).toHaveClass("text-red-500");
    expect(screen.getByText(/position: word 1 of/i)).toBeVisible();
  });

  it("shows empty state and disables controls when text is cleared", async () => {
    render(<SpeedReader />);
    await setReaderText("");

    expect(
      screen.getByText(/enter some text above to start reading/i),
    ).toBeVisible();
    expect(screen.getByRole("button", { name: /play/i })).toBeDisabled();
    expect(screen.getByRole("button", { name: /restart/i })).toBeDisabled();
    expect(screen.getByLabelText(/position/i)).toBeDisabled();
    expect(screen.getByText(/position: word 0 of 0/i)).toBeVisible();
  });

  it("resets position and pauses when text changes", async () => {
    render(<SpeedReader />);
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

    await user.click(screen.getByRole("button", { name: /play/i }));
    expect(screen.getByRole("button", { name: /pause/i })).toBeVisible();

    await setReaderText("One Two Three");

    expect(screen.getByRole("button", { name: /play/i })).toBeVisible();
    expect(getDisplayedWord()).toBe("One");
    expect(screen.getByText(/position: word 1 of 3/i)).toBeVisible();
  });

  it("advances words while playing and pauses at the end", async () => {
    render(<SpeedReader />);
    const user = await setReaderText("Alpha Beta Gamma");

    await user.click(screen.getByRole("button", { name: /play/i }));
    expect(getDisplayedWord()).toBe("Alpha");

    // Default WPM is 300 → 200ms per word
    await act(async () => {
      vi.advanceTimersByTime(200);
    });
    expect(getDisplayedWord()).toBe("Beta");

    await act(async () => {
      vi.advanceTimersByTime(200);
    });
    expect(getDisplayedWord()).toBe("Gamma");
    expect(screen.getByText(/position: word 3 of 3/i)).toBeVisible();

    await act(async () => {
      vi.advanceTimersByTime(200);
    });
    expect(getDisplayedWord()).toBe("Gamma");
    expect(screen.getByRole("button", { name: /play/i })).toBeVisible();
  });

  it("restarts from the beginning when play is pressed at the end", async () => {
    render(<SpeedReader />);
    const user = await setReaderText("First Last");

    await user.click(screen.getByRole("button", { name: /play/i }));
    await act(async () => {
      vi.advanceTimersByTime(200);
    });
    expect(getDisplayedWord()).toBe("Last");

    // Auto-pause happens on the next tick once already at the last word
    await act(async () => {
      vi.advanceTimersByTime(200);
    });
    expect(screen.getByRole("button", { name: /play/i })).toBeVisible();

    await user.click(screen.getByRole("button", { name: /play/i }));
    expect(getDisplayedWord()).toBe("First");
    expect(screen.getByRole("button", { name: /pause/i })).toBeVisible();
  });

  it("restarts from the first word when Restart is clicked", async () => {
    render(<SpeedReader />);
    const user = await setReaderText("Hello World");

    await user.click(screen.getByRole("button", { name: /play/i }));
    await act(async () => {
      vi.advanceTimersByTime(200);
    });
    expect(getDisplayedWord()).toBe("World");

    await user.click(screen.getByRole("button", { name: /restart/i }));

    expect(getDisplayedWord()).toBe("Hello");
    expect(screen.getByRole("button", { name: /play/i })).toBeVisible();
    expect(screen.getByText(/position: word 1 of 2/i)).toBeVisible();
  });

  it("updates the displayed word when the position slider moves", async () => {
    render(<SpeedReader />);
    await setReaderText("Red Green Blue");

    fireEvent.change(screen.getByLabelText(/position/i), {
      target: { value: "2" },
    });

    expect(getDisplayedWord()).toBe("Blue");
    expect(screen.getByText(/position: word 3 of 3/i)).toBeVisible();
  });

  it("updates font size and speed labels from sliders", () => {
    render(<SpeedReader />);

    fireEvent.change(screen.getByLabelText(/text size/i), {
      target: { value: "72" },
    });
    expect(screen.getByText(/text size: 72px/i)).toBeVisible();

    fireEvent.change(screen.getByLabelText(/speed/i), {
      target: { value: "400" },
    });
    expect(screen.getByText(/speed: 400 words\/min/i)).toBeVisible();
  });

  it("pauses when Pause is clicked during playback", async () => {
    render(<SpeedReader />);
    const user = await setReaderText("One Two Three Four");

    await user.click(screen.getByRole("button", { name: /play/i }));
    await act(async () => {
      vi.advanceTimersByTime(200);
    });
    expect(getDisplayedWord()).toBe("Two");

    await user.click(screen.getByRole("button", { name: /pause/i }));
    await act(async () => {
      vi.advanceTimersByTime(400);
    });

    expect(getDisplayedWord()).toBe("Two");
    expect(screen.getByRole("button", { name: /play/i })).toBeVisible();
  });
});
