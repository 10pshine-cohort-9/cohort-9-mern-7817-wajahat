const AuthForm = ({
  title,
  fields,
  onSubmit,
  error,
  success,
  submitText,
  onCancel,
  footer,
}) => {
  return (
    <div>
      <p className="mb-5 text-center text-[11px] font-medium uppercase tracking-wide text-[(--color-text)">
        {title}
      </p>

      <form
        onSubmit={onSubmit}
        className="space-y-3"
      >
        {fields}

        <div className="min-h-6 px-1 text-center text-[13px] leading-5">
          {error ? (
            <span className="text-(--color-primary)">
              {error}
            </span>
          ) : success ? (
            <span className="text-(--color-accent)">
              {success}
            </span>
          ) : null}
        </div>

        <div className="flex gap-2 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="secondary-button"
          >
            Cancel
          </button>

          <button
            type="submit"
            className="primary-button"
          >
            {submitText}
          </button>
        </div>
      </form>

      <p className="mt-6 text-center text-[11px] text-(--color-text-secondary)]">
        {footer}
      </p>
    </div>
  );
};

export default AuthForm;