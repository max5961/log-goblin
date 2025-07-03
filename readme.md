*Capture stdout/stderr similar to how you would in the shell with $() syntax*

---

```typescript
import { capture } from "capture-stdout";

const result = capture(() => {
    console.log("foobar");
})

// ****Value of result is foobar****

console.log("This is written to stdout.")
console.log("Only the stdout/stderr within the callback is captured")
```


