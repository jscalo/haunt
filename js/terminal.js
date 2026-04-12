// CRT terminal: scrollback, typewriter output, inline editable prompt,
// command history, paste sanitation, and readToken/readLine promises.

export class Terminal {
    constructor({ outputEl, promptLineEl, inputEl, screenEl, speed = 120 }) {
        this.outputEl = outputEl;
        this.promptLineEl = promptLineEl;
        this.inputEl = inputEl;
        this.screenEl = screenEl;
        this.speed = speed;

        this.queue = [];
        this.draining = false;
        this.currentLine = null;

        this.history = [];
        this.histIdx = -1;
        this.savedDraft = "";

        this.pendingResolver = null;
        this.pendingMode = null;
        this.promptVisible = false;

        this._bindInput();
    }

    _bindInput() {
        document.addEventListener("keydown", (e) => {
            if (!this.promptVisible) {
                if (this.draining && e.key !== "Shift" && e.key !== "Control" && e.key !== "Alt" && e.key !== "Meta") {
                    this.fastForward();
                }
                return;
            }
            if (document.activeElement !== this.inputEl) {
                this.inputEl.focus();
                this._placeCaretAtEnd();
            }
            if (e.key === "Enter") {
                e.preventDefault();
                this._submit();
            } else if (e.key === "ArrowUp") {
                e.preventDefault();
                this._historyPrev();
            } else if (e.key === "ArrowDown") {
                e.preventDefault();
                this._historyNext();
            } else if (e.key === "Tab") {
                e.preventDefault();
            } else if (e.key === "Escape") {
                this.fastForward();
            } else if (e.key === "l" && (e.ctrlKey || e.metaKey)) {
                e.preventDefault();
                this.clearScrollback();
            }
        });

        this.inputEl.addEventListener("paste", (e) => {
            e.preventDefault();
            const text = (e.clipboardData || window.clipboardData).getData("text") || "";
            const cleaned = text
                .replace(/\r/g, "")
                .split("\n")[0]
                .replace(/[^\x20-\x7e]/g, "")
                .replace(/\s+/g, " ")
                .slice(0, 80);
            document.execCommand("insertText", false, cleaned);
        });

        document.addEventListener("click", () => {
            if (this.promptVisible) {
                this.inputEl.focus();
                this._placeCaretAtEnd();
            }
        });
    }

    _placeCaretAtEnd() {
        const range = document.createRange();
        range.selectNodeContents(this.inputEl);
        range.collapse(false);
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
    }

    _historyPrev() {
        if (this.history.length === 0) return;
        if (this.histIdx === -1) {
            this.savedDraft = this.inputEl.textContent;
            this.histIdx = this.history.length - 1;
        } else if (this.histIdx > 0) {
            this.histIdx--;
        }
        this.inputEl.textContent = this.history[this.histIdx];
        this._placeCaretAtEnd();
    }

    _historyNext() {
        if (this.histIdx === -1) return;
        if (this.histIdx < this.history.length - 1) {
            this.histIdx++;
            this.inputEl.textContent = this.history[this.histIdx];
        } else {
            this.histIdx = -1;
            this.inputEl.textContent = this.savedDraft;
        }
        this._placeCaretAtEnd();
    }

    _submit() {
        const raw = this.inputEl.textContent || "";
        const cmd = raw.trim();
        this._freezePrompt(raw);
        this.inputEl.textContent = "";
        if (cmd && (this.history.length === 0 || this.history[this.history.length - 1] !== cmd)) {
            this.history.push(cmd);
            if (this.history.length > 100) this.history.shift();
        }
        this.histIdx = -1;
        this.savedDraft = "";
        this.hidePrompt();
        const resolver = this.pendingResolver;
        this.pendingResolver = null;
        this.pendingMode = null;
        if (resolver) resolver(cmd);
    }

    _freezePrompt(rawText) {
        const frozen = document.createElement("div");
        frozen.className = "line";
        frozen.textContent = "* " + rawText;
        this.outputEl.appendChild(frozen);
        this._scrollToBottom();
    }

    showPrompt() {
        // Move the prompt to be the last child of .output so it flows inline
        // at the end of the scrollback. Re-append each time in case new lines
        // have been added.
        this.outputEl.appendChild(this.promptLineEl);
        this.promptLineEl.hidden = false;
        this.promptVisible = true;
        this.inputEl.focus();
        this._placeCaretAtEnd();
        this._scrollToBottom();
    }

    hidePrompt() {
        this.promptLineEl.hidden = true;
        this.promptVisible = false;
    }

    async readLine() {
        await this._flushQueue();
        this.pendingMode = "line";
        this.showPrompt();
        return new Promise((resolve) => { this.pendingResolver = resolve; });
    }

    async readToken() {
        // (accept) in OPS5 reads a single whitespace-delimited token.
        // In practice the user still types a line and we take the first word.
        const line = await this.readLine();
        const tok = line.split(/\s+/)[0] || "";
        return tok;
    }

    println(...parts) {
        const text = parts.map(p => p == null ? "" : String(p)).join("");
        this.queue.push({ type: "line", text, _pos: 0 });
        this._startDrain();
    }

    print(text) {
        this.queue.push({ type: "chunk", text: String(text), _pos: 0 });
        this._startDrain();
    }

    blank() {
        this.queue.push({ type: "line", text: "", _pos: 0 });
        this._startDrain();
    }

    clearScrollback() {
        this.outputEl.innerHTML = "";
    }

    fastForward() {
        this.fastMode = true;
    }

    _startDrain() {
        if (!this.draining) {
            this.draining = true;
            requestAnimationFrame(() => this._drain(performance.now()));
        }
    }

    _drain(lastT) {
        if (this.queue.length === 0) {
            this.draining = false;
            this.fastMode = false;
            if (this._flushResolver) {
                const r = this._flushResolver;
                this._flushResolver = null;
                r();
            }
            return;
        }

        const cps = this.fastMode ? 50000 : this.speed;
        const now = performance.now();
        const dt = now - lastT;
        let budget = Math.max(1, Math.floor((cps * dt) / 1000));

        while (budget > 0 && this.queue.length > 0) {
            const item = this.queue[0];

            if (!this.currentLine) {
                this.currentLine = document.createElement("div");
                this.currentLine.className = "line";
                this.outputEl.appendChild(this.currentLine);
            }
            const remaining = item.text.length - item._pos;
            const take = Math.min(remaining, budget);
            if (take > 0) {
                this.currentLine.textContent += item.text.slice(item._pos, item._pos + take);
                item._pos += take;
                budget -= take;
            }
            if (item._pos >= item.text.length) {
                if (item.type === "line") this.currentLine = null;
                this.queue.shift();
            } else if (take === 0) {
                break;
            }
        }

        this._scrollToBottom();
        requestAnimationFrame((t) => this._drain(t));
    }

    _flushQueue() {
        if (this.queue.length === 0 && !this.draining) return Promise.resolve();
        return new Promise((resolve) => {
            this._flushResolver = resolve;
        });
    }

    _scrollToBottom() {
        this.outputEl.scrollTop = this.outputEl.scrollHeight;
    }

    setSpeed(cps) {
        this.speed = cps;
    }
}
