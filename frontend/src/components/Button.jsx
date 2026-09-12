import { Link } from "react-router-dom";

function Button({
  children,
  to,
  variant = "primary",
  className = "",
  type = "button",
}) {
  const base =
    "inline-flex items-center justify-center px-5 py-3 text-sm font-medium rounded-xl transition-all duration-200 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300";

  const variants = {
    primary:
      "bg-neutral-900 text-white hover:bg-neutral-800",

    secondary:
      "border border-neutral-700 bg-neutral-900 text-white hover:bg-neutral-800",
  };

  const classes = `${base} ${variants[variant]} ${className}`;

  if (to) {
    return (
      <Link to={to} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} className={classes}>
      {children}
    </button>
  );
}

export default Button;