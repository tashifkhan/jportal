import React, { useState, useEffect } from "react";
import Loader from "./Loader";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./ui/tabs";

export default function Profile({ w, profileData, setProfileData }) {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("personal");

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

  // Placeholder image if not available
  const profileImg =
    info.profileimgurl ||
    "https://ui-avatars.com/api/?name=" +
      encodeURIComponent(info.studentname || "User") +
      "&background=0D8ABC&color=fff&size=128";

  return (
    <div className="min-h-screen bg-[var(--bg-color)] text-[var(--text-color)] font-sans flex flex-col items-center justify-center px-2 pb-5 pt-8">
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full flex flex-col lg:flex-row lg:items-start lg:justify-center lg:gap-8"
      >
        {/* Sidebar Tabs OUTSIDE the card on desktop */}
        <div className="hidden lg:block self-start flex-shrink-0 py-4">
          <TabsList className="bg-[var(--card-bg)] rounded-2xl shadow-lg p-0 w-56 flex flex-col gap-2">
            <TabsTrigger
              value="personal"
              className="w-full text-lg font-semibold data-[state=active]:bg-[var(--primary-color)] data-[state=active]:text-[var(--accent-color)] text-[var(--label-color)] transition-colors rounded-xl px-6 py-3 text-left"
            >
              Personal
            </TabsTrigger>
            <TabsTrigger
              value="academic"
              className="w-full text-lg font-semibold data-[state=active]:bg-[var(--primary-color)] data-[state=active]:text-[var(--accent-color)] text-[var(--label-color)] transition-colors rounded-xl px-6 py-3 text-left"
            >
              Academic
            </TabsTrigger>
            <TabsTrigger
              value="contact"
              className="w-full text-lg font-semibold data-[state=active]:bg-[var(--primary-color)] data-[state=active]:text-[var(--accent-color)] text-[var(--label-color)] transition-colors rounded-xl px-6 py-3 text-left"
            >
              Contact
            </TabsTrigger>
            <TabsTrigger
              value="education"
              className="w-full text-lg font-semibold data-[state=active]:bg-[var(--primary-color)] data-[state=active]:text-[var(--accent-color)] text-[var(--label-color)] transition-colors rounded-xl px-6 py-3 text-left"
            >
              Education
            </TabsTrigger>
          </TabsList>
        </div>
        {/* Main Card */}
        <div className="w-full max-w-4xl mx-auto bg-[var(--card-bg)] rounded-2xl shadow-lg flex flex-col items-center px-0 py-0">
          {/* Profile Image & Header */}
          <div className="flex flex-col items-center w-full pt-8 pb-4">
            <img
              src={profileImg}
              alt="Profile"
              className="w-28 h-28 rounded-full object-cover border-4 border-[var(--accent-color)] shadow-md mb-4"
              style={{ background: "var(--primary-color)" }}
            />
            <div className="text-2xl font-bold text-[var(--text-color)] text-center mb-1">
              {info.studentname || "N/A"}
            </div>
            <div className="text-base font-medium text-[var(--label-color)] text-center mb-1">
              {info.registrationno || "N/A"} | {info.programcode || ""}
              {info.branch ? ` - ${info.branch}` : ""}
            </div>
          </div>
          {/* TabsList for mobile only */}
          <div className="w-full lg:hidden">
            <TabsList className="w-full flex flex-row justify-between bg-[var(--primary-color)] rounded-t-2xl overflow-hidden h-12">
              <TabsTrigger
                value="personal"
                className="flex-1 text-lg font-semibold data-[state=active]:bg-[var(--card-bg)] data-[state=active]:text-[var(--accent-color)] text-[var(--label-color)] transition-colors"
              >
                Personal
              </TabsTrigger>
              <TabsTrigger
                value="academic"
                className="flex-1 text-lg font-semibold data-[state=active]:bg-[var(--card-bg)] data-[state=active]:text-[var(--accent-color)] text-[var(--label-color)] transition-colors"
              >
                Academic
              </TabsTrigger>
              <TabsTrigger
                value="contact"
                className="flex-1 text-lg font-semibold data-[state=active]:bg-[var(--card-bg)] data-[state=active]:text-[var(--accent-color)] text-[var(--label-color)] transition-colors"
              >
                Contact
              </TabsTrigger>
              <TabsTrigger
                value="education"
                className="flex-1 text-lg font-semibold data-[state=active]:bg-[var(--card-bg)] data-[state=active]:text-[var(--accent-color)] text-[var(--label-color)] transition-colors"
              >
                Education
              </TabsTrigger>
            </TabsList>
          </div>
          {/* Content Area */}
          <div className="w-full">
            <TabsContent value="personal" className="px-8 py-6">
              <div className="w-full max-w-2xl mx-auto bg-[var(--card-bg)] rounded-2xl shadow-sm px-6 py-5 flex flex-col gap-1 mb-6">
                <SectionTitle>Personal Information</SectionTitle>
                <InfoRow label="Date of Birth" value={info.dateofbirth} />
                <InfoRow label="Gender" value={info.gender} />
                <InfoRow label="Blood Group" value={info.bloodgroup} />
                <InfoRow label="Nationality" value={info.nationality} />
                <InfoRow label="Category" value={info.category} />
              </div>
            </TabsContent>
            <TabsContent value="academic" className="px-8 py-6">
              <div className="w-full max-w-2xl mx-auto bg-[var(--card-bg)] rounded-2xl shadow-sm px-6 py-5 flex flex-col gap-1 mb-6">
                <SectionTitle>Academic Information</SectionTitle>
                <InfoRow label="Program" value={info.programcode} />
                <InfoRow label="Branch" value={info.branch} />
                <InfoRow label="Section" value={info.sectioncode} />
                <InfoRow label="Batch" value={info.batch} />
                <InfoRow label="Semester" value={info.semester} />
                <InfoRow label="Institute" value={info.institutecode} />
                <InfoRow label="Academic Year" value={info.academicyear} />
                <InfoRow label="Admission Year" value={info.admissionyear} />
              </div>
            </TabsContent>
            <TabsContent value="contact" className="px-8 py-6">
              <div className="w-full max-w-2xl mx-auto bg-[var(--card-bg)] rounded-2xl shadow-sm px-6 py-5 flex flex-col gap-1 mb-6">
                <SectionTitle>Contact Information</SectionTitle>
                <InfoRow
                  label="Student Email (College)"
                  value={info.studentemailid}
                />
                <InfoRow
                  label="Student Email (Personal)"
                  value={info.studentpersonalemailid}
                />
                <InfoRow label="Mobile" value={info.studentcellno} />
                <InfoRow
                  label="Telephone"
                  value={info.studenttelephoneno || "N/A"}
                />
                <SectionTitle className="mt-6">Family Information</SectionTitle>
                <InfoRow label="Father's Name" value={info.fathersname} />
                <InfoRow label="Mother's Name" value={info.mothername} />
                <InfoRow label="Parent's Email" value={info.parentemailid} />
                <InfoRow label="Parent's Mobile" value={info.parentcellno} />
                <InfoRow
                  label="Parent's Telephone"
                  value={info.parenttelephoneno || "N/A"}
                />
                <SectionTitle className="mt-6">Current Address</SectionTitle>
                <InfoRow
                  label="Address"
                  value={[info.caddress1, info.caddress3]
                    .filter(Boolean)
                    .join(", ")}
                />
                <InfoRow label="City" value={info.ccityname} />
                <InfoRow label="District" value={info.cdistrict} />
                <InfoRow label="State" value={info.cstatename} />
                <InfoRow label="Postal Code" value={info.cpostalcode} />
                <SectionTitle className="mt-6">Permanent Address</SectionTitle>
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
            </TabsContent>
            <TabsContent value="education" className="px-8 py-6">
              <div className="w-full max-w-2xl mx-auto bg-[var(--card-bg)] rounded-2xl shadow-sm px-6 py-5 flex flex-col gap-1 mb-6">
                <SectionTitle>Educational Qualifications</SectionTitle>
                {qualifications.length === 0 ? (
                  <div className="text-[var(--label-color)] text-center py-4">
                    No qualifications found.
                  </div>
                ) : (
                  qualifications.map((qual, index) => (
                    <div
                      key={index}
                      className="divide-y divide-[var(--border-color)] mb-4"
                    >
                      <InfoRow
                        label="Qualification"
                        value={qual.qualificationcode}
                      />
                      <InfoRow label="Board" value={qual.boardname} />
                      <InfoRow
                        label="Year of Passing"
                        value={qual.yearofpassing}
                      />
                      <InfoRow
                        label="Marks Obtained"
                        value={`${qual.obtainedmarks}/${qual.fullmarks}`}
                      />
                      <InfoRow
                        label="Percentage"
                        value={`${qual.percentagemarks}%`}
                      />
                      <InfoRow label="Division" value={qual.division} />
                      {qual.grade && (
                        <InfoRow label="Grade" value={qual.grade} />
                      )}
                    </div>
                  ))
                )}
              </div>
            </TabsContent>
          </div>
        </div>
      </Tabs>
      {/* Footer remains full width below the card */}
      <div className="w-full max-w-4xl mx-auto bg-[var(--card-bg)] rounded-2xl shadow-sm px-6 py-4 text-center mb-4 overflow-auto max-sm:text-sm text-lg mt-6">
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

// Helper for section titles
function SectionTitle({ children, className = "" }) {
  return (
    <h2
      className={`text-xl font-semibold mb-4 text-[var(--accent-color)] ${className}`}
    >
      {children}
    </h2>
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
