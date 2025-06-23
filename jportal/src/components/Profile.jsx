import React, { useState, useEffect } from "react";
import Loader from "./Loader";

export default function Profile({ w, profileData, setProfileData }) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfileData = async () => {
      // Return early if data is already cached
      if (profileData) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const data = await w.get_personal_info();
        setProfileData(data);
      } catch (error) {
        console.error("Failed to fetch profile data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [w, profileData, setProfileData]);

  if (loading) {
    return <Loader message="Loading profile..." />;
  }

  const info = profileData?.generalinformation || {};
  const qualifications = profileData?.qualification || [];

  return (
    <div className="min-h-screen bg-[var(--bg-color)] text-[var(--text-color)] font-sans px-2 pb-5 pt-8">
      {/* Personal Information */}
      <div className="w-full max-w-2xl mx-auto bg-[var(--card-bg)] rounded-2xl shadow-sm px-6 py-5 mb-4">
        <h2 className="text-xl font-semibold mb-4 text-[var(--accent-color)]">
          Personal Information
        </h2>
        <div className="divide-y divide-[var(--border-color)]">
          <InfoRow label="Name" value={info.studentname} />
          <InfoRow label="Registration No" value={info.registrationno} />
          <InfoRow label="Date of Birth" value={info.dateofbirth} />
          <InfoRow label="Gender" value={info.gender} />
          <InfoRow label="Blood Group" value={info.bloodgroup} />
          <InfoRow label="Nationality" value={info.nationality} />
          <InfoRow label="Category" value={info.category} />
        </div>
      </div>

      {/* Academic Information */}
      <div className="w-full max-w-2xl mx-auto bg-[var(--card-bg)] rounded-2xl shadow-sm px-6 py-5 mb-4">
        <h2 className="text-xl font-semibold mb-4 text-[var(--accent-color)]">
          Academic Information
        </h2>
        <div className="divide-y divide-[var(--border-color)]">
          <InfoRow label="Program" value={info.programcode} />
          <InfoRow label="Branch" value={info.branch} />
          <InfoRow label="Section" value={info.sectioncode} />
          <InfoRow label="Batch" value={info.batch} />
          <InfoRow label="Semester" value={info.semester} />
          <InfoRow label="Institute" value={info.institutecode} />
          <InfoRow label="Academic Year" value={info.academicyear} />
          <InfoRow label="Admission Year" value={info.admissionyear} />
        </div>
      </div>

      {/* Contact Information */}
      <div className="w-full max-w-2xl mx-auto bg-[var(--card-bg)] rounded-2xl shadow-sm px-6 py-5 mb-4">
        <h2 className="text-xl font-semibold mb-4 text-[var(--accent-color)]">
          Contact Information
        </h2>
        <div className="divide-y divide-[var(--border-color)]">
          <InfoRow
            label="Student Email (College)"
            value={info.studentemailid}
          />
          <InfoRow
            label="Student Email (Personal)"
            value={info.studentpersonalemailid}
          />
          <InfoRow label="Mobile" value={info.studentcellno} />
          <InfoRow label="Telephone" value={info.studenttelephoneno || "N/A"} />
        </div>
      </div>

      {/* Family Information */}
      <div className="w-full max-w-2xl mx-auto bg-[var(--card-bg)] rounded-2xl shadow-sm px-6 py-5 mb-4 overflow-auto">
        <h2 className="text-xl font-semibold mb-4 text-[var(--accent-color)]">
          Family Information
        </h2>
        <div className="divide-y divide-[var(--border-color)] gap-2">
          <InfoRow label="Father's Name" value={info.fathersname} />
          <InfoRow label="Mother's Name" value={info.mothername} />
          <InfoRow label="Parent's Email" value={info.parentemailid} />
          <InfoRow label="Parent's Mobile" value={info.parentcellno} />
          <InfoRow
            label="Parent's Telephone"
            value={info.parenttelephoneno || "N/A"}
          />
        </div>
      </div>

      {/* Address Information */}
      <div className="w-full max-w-2xl mx-auto bg-[var(--card-bg)] rounded-2xl shadow-sm px-6 py-5 mb-4">
        <h2 className="text-xl font-semibold mb-4 text-[var(--accent-color)]">
          Current Address
        </h2>
        <div className="divide-y divide-[var(--border-color)]">
          <InfoRow
            label="Address"
            value={[info.caddress1, info.caddress3].filter(Boolean).join(", ")}
          />
          <InfoRow label="City" value={info.ccityname} />
          <InfoRow label="District" value={info.cdistrict} />
          <InfoRow label="State" value={info.cstatename} />
          <InfoRow label="Postal Code" value={info.cpostalcode} />
        </div>
      </div>

      {/* Permanent Address */}
      <div className="w-full max-w-2xl mx-auto bg-[var(--card-bg)] rounded-2xl shadow-sm px-6 py-5 mb-4">
        <h2 className="text-xl font-semibold mb-4 text-[var(--accent-color)]">
          Permanent Address
        </h2>
        <div className="divide-y divide-[var(--border-color)]">
          <InfoRow
            label="Address"
            value={[info.paddress1, info.paddress2, info.paddress3]
              .filter(Boolean)
              .join(", ")}
          />
          <InfoRow label="City" value={info.pcityname} />
          <InfoRow label="District" value={info.pdistrict} />
          <InfoRow label="State" value={info.pstatename} />
          <InfoRow label="Postal Code" value={info.ppostalcode} />
        </div>
      </div>

      {/* Educational Qualifications */}
      <div className="w-full max-w-2xl mx-auto bg-[var(--card-bg)] rounded-2xl shadow-sm px-6 py-5 mb-4">
        <h2 className="text-xl font-semibold mb-4 text-[var(--accent-color)]">
          Educational Qualifications
        </h2>
        {qualifications.map((qual, index) => (
          <div
            key={index}
            className="divide-y divide-[var(--border-color)] mb-2"
          >
            <InfoRow label="Qualification" value={qual.qualificationcode} />
            <InfoRow label="Board" value={qual.boardname} />
            <InfoRow label="Year of Passing" value={qual.yearofpassing} />
            <InfoRow
              label="Marks Obtained"
              value={`${qual.obtainedmarks}/${qual.fullmarks}`}
            />
            <InfoRow label="Percentage" value={`${qual.percentagemarks}%`} />
            <InfoRow label="Division" value={qual.division} />
            {qual.grade && <InfoRow label="Grade" value={qual.grade} />}
          </div>
        ))}
      </div>
      <div className="w-full max-w-2xl mx-auto bg-[var(--card-bg)] rounded-2xl shadow-sm px-6 py-4 text-center mb-4 overflow-auto max-sm:text-sm text-lg">
        Made with Big 🍆 Energy by{" "}
        <a
          href="https://github.com/codeblech"
          className="text-[var(--accent-color)]"
        >
          Yash Malik
        </a>
      </div>
    </div>
  );
}

// Helper component for consistent info display
function InfoRow({ label, value }) {
  return (
    <div className="flex flex-row justify-between items-center py-2">
      <span className="text-[var(--label-color)] font-medium">{label}:</span>
      <span className="text-[var(--text-color)] font-semibold break-words text-right ml-2">
        {value || "N/A"}
      </span>
    </div>
  );
}
