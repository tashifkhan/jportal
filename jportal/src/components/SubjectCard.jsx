function SubjectCard({ subject }) {
  const totalPercentage = subject.LTpercantage || subject.Ppercentage || 0;

  return (
    <div className="subject-card">
      <h2>{subject.subjectcode}</h2>
      <div className="attendance">
        {subject.Lpercentage && <p>Lecture: {subject.Lpercentage}%</p>}
        {subject.Tpercentage && <p>Tutorial: {subject.Tpercentage}%</p>}
        {subject.Ppercentage && <p>Practical: {subject.Ppercentage}%</p>}

        <div
          className="circular-progress"
          style={{
            background: `conic-gradient(#3498db ${totalPercentage * 3.6}deg, #2c2f33 0deg)`
          }}
        >
          {totalPercentage}%
        </div>
      </div>
    </div>
  );
}

export default SubjectCard;