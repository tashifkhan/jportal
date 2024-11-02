function SubjectInfoCard({ subject }) {
  return (
    <div className="flex justify-between items-center py-4 border-b border-gray-700">
      <div className="flex-1 mb-4 lg:mb-0 mr-4">
        <h2 className="text-lg lg:text-xl font-semibold mb-1">{subject.name}</h2>
        <p className="text-sm lg:text-base mb-2">
          {subject.code}
          {subject.isAudit && " • Audit"}
        </p>
        {subject.components.map((component, idx) => (
          <p key={idx} className="text-sm lg:text-base">
            {component.type === 'L' && 'Lecture'}
            {component.type === 'T' && 'Tutorial'}
            {component.type === 'P' && 'Practical'}
            : {component.teacher}
          </p>
        ))}
      </div>
      <div className="text-4xl font-bold">
        {subject.credits.toFixed(1)}
      </div>
    </div>
  );
}

export default SubjectInfoCard;