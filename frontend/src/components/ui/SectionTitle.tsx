type SectionTitleProps = {
  title: string;
  subtitle?: string;
};

function SectionTitle({ subtitle, title }: SectionTitleProps) {
  return (
    <div className="space-y-1">
      <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-text-soft">
        {title}
      </h2>
      {subtitle ? <p className="text-sm text-text-soft">{subtitle}</p> : null}
    </div>
  );
}

export default SectionTitle;
