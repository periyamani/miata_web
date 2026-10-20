// Form building blocks for the sign-in pages, in the original website's login page design.
import { useId } from 'react';

/** The login-page section; `single` centres one column (no dashed divider). */
export function AuthArea({ notice, single = false, children }) {
  return (
    <section className="login-page">
      <div className="container">
        {notice}
        <div className={`login-page__area${single ? ' login-page__area--single' : ''}`}>
          {single ? children : <div className="row">{children}</div>}
        </div>
      </div>
    </section>
  );
}

/** Highlighted one-line message above the form area. */
export function AuthNotice({ children }) {
  return (
    <div className="login-page__info" role="status">
      <p>{children}</p>
    </div>
  );
}

export function AuthField({ error, hint, label, ...props }) {
  const id = useId();
  const describedBy = [error && `${id}-error`, hint && `${id}-hint`].filter(Boolean).join(' ') || undefined;
  return (
    <div className="login-page__form-input-box">
      <input
        id={id}
        aria-label={label ?? props.placeholder}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        {...props}
      />
      {hint && !error && (
        <span className="login-page__field-hint" id={`${id}-hint`}>
          {hint}
        </span>
      )}
      {error && (
        <span className="login-page__field-error" id={`${id}-error`}>
          {error}
        </span>
      )}
    </div>
  );
}

/** The theme's round checkbox (the label's empty span is the drawn box). */
export function AuthCheckbox({ checked, onChange, error, children, aside }) {
  const id = useId();
  return (
    <div className="login-page__checked-box">
      <input type="checkbox" id={id} checked={checked} onChange={onChange} />{' '}
      <label htmlFor={id}>
        <span></span>
        {children}
      </label>
      {aside}
      {error && <span className="login-page__field-error login-page__field-error--block">{error}</span>}
    </div>
  );
}

export function AuthSubmit({ busy, children }) {
  return (
    <div className="login-page__form-btn-box">
      <button type="submit" className="eduact-btn eduact-btn-second" disabled={busy} aria-busy={busy || undefined}>
        <span className="eduact-btn__curve"></span>
        {busy ? 'Please wait…' : children}
      </button>
    </div>
  );
}
