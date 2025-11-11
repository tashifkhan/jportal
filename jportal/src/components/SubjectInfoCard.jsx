function SubjectInfoCard({ subject }) {
  return (
    <div className="grid grid-cols-[1fr_auto] gap-4 px-3 py-3 hover:bg-accent/30 transition-colors">
      {/* Subject Info */}
      <div className="min-w-0">
        <h3 className="font-semibold text-sm leading-tight mb-1">
          {subject.name}
        </h3>
        <div className="flex items-center gap-2 mb-2">
          <p className="text-xs text-muted-foreground font-mono">
            {subject.code}
          </p>
          {subject.isAudit && (
            <span className="text-xs font-medium px-2 py-0.5 bg-muted text-muted-foreground rounded">
              Audit
            </span>
          )}
        </div>
        <div className="space-y-0.5">
          {subject.components.map((component, idx) => (
            <div key={idx} className="text-xs flex items-baseline gap-2">
              <span className="font-medium text-muted-foreground min-w-[60px]">
                {component.type === 'L' && 'Lecture'}
                {component.type === 'T' && 'Tutorial'}
                {component.type === 'P' && 'Practical'}
              </span>
              <span className="text-foreground truncate">{component.teacher}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Credits */}
      <div className="text-right font-bold text-2xl tabular-nums min-w-[60px] flex items-start justify-end pt-0.5">
        {subject.credits.toFixed(1)}
      </div>
    </div>
  );
}

export default SubjectInfoCard;