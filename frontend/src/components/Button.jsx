import { Link } from "react-router-dom";

function Button({
  children,
  to,
  variant = "primary",
  className = "",
  type = "button",
  disabled = false,
}) {
  const base =
    "rpg-button group inline-flex items-center justify-center rounded-xl px-5 py-3 text-sm font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 disabled:cursor-not-allowed disabled:opacity-50";

  const variants = {
    primary:
      "bg-neutral-900 text-white shadow-sm hover:bg-neutral-800 hover:shadow-lg hover:shadow-black/20",

    secondary:
      "border border-neutral-700 bg-neutral-900 text-white hover:border-neutral-600 hover:bg-neutral-800 hover:shadow-lg hover:shadow-black/20",
  };

  const classes = `${base} ${variants[variant]} ${className}`;

  if (to) {
    return (
      <Link
        to={to}
        className={classes}
        aria-disabled={disabled}
        tabIndex={disabled ? -1 : undefined}
      >
        <span className="relative z-10">
          {children}
        </span>
      </Link>
    );
  }

  return (
    <button
      type={type}
      disabled={disabled}
      className={classes}
    >
      <span className="relative z-10">
        {children}
      </span>
    </button>
  );
}

export default Button;