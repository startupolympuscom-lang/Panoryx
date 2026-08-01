export function AuthCard({
  eyebrow,
  title,
  description,
  children,
  footer,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-navy-100 bg-white p-7 shadow-card sm:p-9">
      {eyebrow ? (
        <p className="mb-2 text-xs font-bold uppercase tracking-[0.14em] text-panoryx-blue">
          {eyebrow}
        </p>
      ) : null}
      <h1 className="text-2xl font-bold tracking-tight text-navy">{title}</h1>
      {description ? <p className="mt-2 text-sm leading-relaxed text-navy-500">{description}</p> : null}
      <div className="mt-7">{children}</div>
      {footer ? <div className="mt-7 border-t border-navy-100 pt-5 text-center text-sm">{footer}</div> : null}
    </div>
  );
}
