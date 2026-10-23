/** @vitest-environment jsdom */
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { SoundToggle } from "@/components/navigation/SoundToggle";

describe("SoundToggle", () => {
  it("starts muted and plays only after a click (PRD §24)", async () => {
    const user = userEvent.setup();
    render(<SoundToggle src="/brands/lumina/audio/ambient.mp3" volume={0.3} />);
    const button = screen.getByRole("button", { name: "Turn sound on" });
    expect(button).toHaveAttribute("aria-pressed", "false");
    expect(HTMLMediaElement.prototype.play).not.toHaveBeenCalled();

    await user.click(button);
    expect(HTMLMediaElement.prototype.play).toHaveBeenCalled();
    expect(await screen.findByRole("button", { name: "Turn sound off" })).toHaveAttribute("aria-pressed", "true");
  });

  it("mutes again on a second click", async () => {
    const user = userEvent.setup();
    render(<SoundToggle src="/brands/lumina/audio/ambient.mp3" volume={0.3} />);
    await user.click(screen.getByRole("button", { name: "Turn sound on" }));
    await user.click(await screen.findByRole("button", { name: "Turn sound off" }));
    expect(screen.getByRole("button", { name: "Turn sound on" })).toHaveAttribute("aria-pressed", "false");
  });
});
