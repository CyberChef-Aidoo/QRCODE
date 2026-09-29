function Svg({ children }) {
  return (
    <svg className="icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      {children}
    </svg>
  );
}

export function PlayIcon() {
  return (
    <Svg>
      <path fill="currentColor" d="M8 5.1v13.8L19.2 12 8 5.1z" />
    </Svg>
  );
}

export function ChatIcon() {
  return (
    <Svg>
      <path
        fill="currentColor"
        d="M5 4h14a2 2 0 0 1 2 2v8.5a2 2 0 0 1-2 2H9.2L5 20.2V6a2 2 0 0 1 2-2z"
      />
    </Svg>
  );
}

export function CheckIcon() {
  return (
    <Svg>
      <path
        fill="currentColor"
        d="M9.2 16.6 4.8 12.2l1.4-1.4 3 3 8.6-8.6 1.4 1.4-10 10z"
      />
    </Svg>
  );
}

export function CrossIcon() {
  return (
    <Svg>
      <path
        fill="currentColor"
        d="m6.4 5 5.6 5.6L17.6 5 19 6.4 13.4 12 19 17.6 17.6 19 12 13.4 6.4 19 5 17.6 10.6 12 5 6.4 6.4 5z"
      />
    </Svg>
  );
}

export function SelectedIcon() {
  return (
    <Svg>
      <circle cx="12" cy="12" r="7" fill="none" stroke="currentColor" strokeWidth="2" />
      <circle cx="12" cy="12" r="3.5" fill="currentColor" />
    </Svg>
  );
}
